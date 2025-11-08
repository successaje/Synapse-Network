'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { 
  Activity, 
  TrendingUp, 
  Zap, 
  PlusCircle, 
  Eye,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { SynapseSDK, getContractAddresses } from '@/lib/sdk';
import { useWallet } from '@/lib/hooks/useWallet';
import { mockAgents, mockActivity, mockStats, formatTimeAgo } from '@/lib/utils/mockData';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { provider, signer } = useWallet();
  const [sdk, setSdk] = useState<SynapseSDK | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeInteractions: 0,
    totalVolume: 0,
    reputation: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isConnected && provider) {
      // Load real data if connected
      const addresses = getContractAddresses();
      const synapseSDK = new SynapseSDK(provider, addresses, signer || undefined);
      if (signer) {
        synapseSDK.connectSigner(signer);
      }
      setSdk(synapseSDK);
      
      // Load agent data
      loadAgentData(synapseSDK);
    } else if (mounted) {
      // Show mock data when wallet not connected
      loadMockData();
    }
  }, [mounted, provider, signer, isConnected, address]);

  const loadMockData = () => {
    // Always show mock data for demo purposes
    // Show first mock agent as example
    const mockAgent = mockAgents[0];
    setAgents([mockAgent]);
    setStats({
      totalAgents: 1,
      activeInteractions: 2,
      totalVolume: 1.25,
      reputation: mockAgent.reputation,
    });
  };

  const loadAgentData = async (sdkInstance: SynapseSDK) => {
    if (!address) return;
    
    try {
      // Load user's agent info
      const isReg = await sdkInstance.isRegistered(address);
      if (isReg) {
        const [metadata, reputation] = await sdkInstance.getAgent(address);
        let agentData: any = {
          address: address,
          reputation: Number(reputation),
        };

        try {
          const parsed = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
          agentData = {
            ...agentData,
            name: parsed.name || 'My Agent',
            type: parsed.type || 'Unknown',
            description: parsed.description || '',
            capabilities: parsed.capabilities || [],
          };
        } catch {
          agentData.name = 'My Agent';
          agentData.type = 'Unknown';
        }

        setAgents([agentData]);
        setStats(prev => ({ ...prev, reputation: Number(reputation) }));
      }
      
      // Load all orders and calculate stats
      const orderCount = await sdkInstance.getOrderCount();
      const orders = await sdkInstance.getAllOrders();
      
      // Calculate total volume from finalized orders
      const totalVolume = orders
        .filter(o => o.status === 3) // Finalized
        .reduce((sum, o) => sum + Number(o.price), 0);
      
      const activeOrders = orders.filter(o => o.status < 3 && (o.requester.toLowerCase() === address.toLowerCase() || o.provider.toLowerCase() === address.toLowerCase()));
      
      setStats(prev => ({
        ...prev,
        totalAgents: isReg ? 1 : 0,
        activeInteractions: activeOrders.length,
        totalVolume: totalVolume / 1e18, // Convert from wei
      }));
    } catch (error) {
      console.error('Error loading agent data:', error);
    }
  };

  // Show mock data when not connected
  const showMockData = !isConnected || (isConnected && !provider);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-orbitron font-bold mb-2">Dashboard</h1>
          <p className="text-gray-400 font-rajdhani">
            {isConnected ? 'Monitor and manage your AI agents' : 'Connect wallet to manage your agents'}
          </p>
        </div>
        {isConnected && (
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-rajdhani font-semibold"
            >
              <PlusCircle className="w-5 h-5" />
              Register Agent
            </motion.button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'My Agents', value: 1, icon: Zap, color: 'text-primary-400' },
          { label: 'Active Tasks', value: 2, icon: Activity, color: 'text-green-400' },
          { label: 'Reputation', value: stats.reputation, icon: TrendingUp, color: 'text-purple-400' },
          { label: 'Total Volume', value: `${0.1} STT`, icon: Activity, color: 'text-yellow-400' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 font-rajdhani">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-orbitron font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* My Agents Section */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
        <h2 className="text-2xl font-orbitron font-bold mb-4">My Agents</h2>
        
        {agents.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 font-rajdhani mb-4">No agents registered yet</p>
            <Link href="/register">
              <button className="px-6 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-rajdhani font-semibold">
                Register Your First Agent
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agents.map((agent, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-orbitron font-semibold">{agent.name}</h3>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-sm text-gray-400 font-rajdhani mb-2">
                  {agent.address.slice(0, 6)}...{agent.address.slice(-4)}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">Rep: {agent.reputation || 0}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">{agent.type || 'Unknown'}</span>
                </div>
                {agent.capabilities && agent.capabilities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 3).map((cap: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-1 bg-primary-600/20 text-primary-400 rounded">
                        {cap}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h2 className="text-2xl font-orbitron font-bold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {(!isConnected && showMockData) ? (
            mockActivity.slice(0, 5).map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Activity className="w-5 h-5 text-primary-400" />
                <div className="flex-1">
                  <p className="font-rajdhani font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-400 font-rajdhani">{activity.description}</p>
                </div>
                <span className="text-xs text-gray-500 font-rajdhani">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </motion.div>
            ))
          ) : (
            <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
              <Activity className="w-5 h-5 text-primary-400" />
              <div className="flex-1">
                <p className="font-rajdhani font-medium">No recent activity</p>
                <p className="text-sm text-gray-400 font-rajdhani">Your agent interactions will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

