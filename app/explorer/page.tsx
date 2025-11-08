'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
// useAccount will be used conditionally after checking if provider is available
import { Search, Filter, Network, Zap } from 'lucide-react';
// Dynamic import for force graph to handle SSR
const ForceGraph2D = typeof window !== 'undefined' 
  ? require('react-force-graph-2d').default 
  : () => null;
import { SynapseSDK, getContractAddresses } from '@/lib/sdk';
import { useWallet } from '@/lib/hooks/useWallet';
import { useAccount } from 'wagmi';
import { mockAgents } from '@/lib/utils/mockData';

export default function ExplorerPage() {
  const { provider } = useWallet();
  const { isConnected } = useAccount();
  const [sdk, setSdk] = useState<SynapseSDK | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const graphRef = useRef<any>();

  useEffect(() => {
    // Always show mock data initially, then load real data if connected
    const loadMockData = () => {
      setAgents(mockAgents);
      const nodes = mockAgents.map((agent) => ({
        id: agent.address,
        name: agent.name,
        type: agent.type,
        reputation: agent.reputation,
        val: Math.max(agent.reputation / 10, 5),
      }));
      const links = [
        { source: nodes[0].id, target: nodes[1].id },
        { source: nodes[1].id, target: nodes[2].id },
        { source: nodes[2].id, target: nodes[3].id },
        { source: nodes[3].id, target: nodes[4].id },
        { source: nodes[0].id, target: nodes[2].id },
      ];
      setGraphData({ nodes, links });
    };

    if (isConnected && provider) {
      // Load real data if connected
      const addresses = getContractAddresses();
      const synapseSDK = new SynapseSDK(provider, addresses);
      setSdk(synapseSDK);
      loadAgents(synapseSDK);
    } else {
      // Show mock data when not connected
      setTimeout(() => {
        loadMockData();
      }, 500);
    }
  }, [provider, isConnected]);

  const loadAgents = async (sdkInstance: SynapseSDK) => {
    try {
      // Fetch all agents from contract
      const agentCount = await sdkInstance.getAgentCount();
      const agentList: any[] = [];
      const links: any[] = [];

      // Fetch all registered agents
      for (let i = 0; i < Number(agentCount); i++) {
        try {
          const agentAddress = await sdkInstance.getAgentByIndex(i);
          const isReg = await sdkInstance.isRegistered(agentAddress);
          
          if (isReg) {
            const [metadata, reputation] = await sdkInstance.getAgent(agentAddress);
            let agentData: any = {
              id: agentAddress,
              address: agentAddress,
              reputation: Number(reputation),
            };

            // Parse metadata if it's a string
            try {
              const parsed = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
              agentData = {
                ...agentData,
                name: parsed.name || `Agent ${i + 1}`,
                type: parsed.type || 'Unknown',
                description: parsed.description || '',
                capabilities: parsed.capabilities || [],
                endpoint: parsed.endpoint || '',
              };
            } catch {
              agentData.name = `Agent ${i + 1}`;
              agentData.type = 'Unknown';
            }

            agentList.push(agentData);
          }
        } catch (error) {
          console.error(`Error loading agent ${i}:`, error);
        }
      }

      setAgents(agentList);

      // Build graph nodes from real data
      const nodes = agentList.map((agent) => ({
        id: agent.address,
        name: agent.name,
        type: agent.type,
        reputation: agent.reputation,
        val: Math.max(agent.reputation / 10, 5), // Minimum size
      }));

      // Build connections from interactions (fetch from SynapseExchange)
      // For now, we'll create connections based on orders
      try {
        const orders = await sdkInstance.getAllOrders();
        orders.forEach((order) => {
          if (order.requester && order.provider && order.status !== 4) {
            // Only show active connections
            links.push({
              source: order.requester,
              target: order.provider,
            });
          }
        });
      } catch (error) {
        console.error('Error loading interactions:', error);
      }

      setGraphData({ nodes, links });
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const getNodeColor = (type: string) => {
    const colors: Record<string, string> = {
      DataAgent: '#3b82f6',
      ComputeAgent: '#8b5cf6',
      TradingAgent: '#f59e0b',
      OracleAgent: '#10b981',
      PredictionAgent: '#ef4444',
    };
    return colors[type] || '#6b7280';
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-orbitron font-bold mb-2 flex items-center gap-3">
          <Network className="w-10 h-10 text-primary-400" />
          Agent Explorer
        </h1>
        <p className="text-gray-400 font-rajdhani">
          Visualize and explore the network of AI agents
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search agents by name or type..."
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-primary-500 focus:outline-none font-rajdhani"
          />
        </div>
        <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors font-rajdhani font-semibold flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </button>
      </div>

      {/* Graph Visualization */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8" style={{ height: '600px' }}>
        {typeof window !== 'undefined' && ForceGraph2D ? (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeLabel={(node: any) => `${node.name}\nReputation: ${node.reputation}`}
            nodeColor={(node: any) => getNodeColor(node.type)}
            linkColor={() => 'rgba(59, 130, 246, 0.3)'}
            nodeRelSize={6}
            onNodeClick={(node: any) => {
              // Highlight clicked node and show details
              console.log('Clicked node:', node);
              // You can add node details modal here if needed
            }}
            cooldownTicks={100}
            onEngineStop={() => {
              if (graphRef.current && graphRef.current.zoomToFit) {
                try {
                  graphRef.current.zoomToFit(400);
                } catch (e) {
                  // zoomToFit might not be available, ignore
                }
              }
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 font-rajdhani">
            Loading graph visualization...
          </div>
        )}
      </div>

      {/* Agent List */}
      <div>
        <h2 className="text-2xl font-orbitron font-bold mb-4">All Agents ({filteredAgents.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-primary-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-orbitron font-bold mb-1">{agent.name || `Agent ${index + 1}`}</h3>
                  <p className="text-sm text-gray-400 font-mono">{agent.address ? `${agent.address.slice(0, 6)}...${agent.address.slice(-4)}` : agent.id || 'N/A'}</p>
                </div>
                <Zap className="w-6 h-6 text-primary-400" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 font-rajdhani">Type:</span>
                  <span className="font-rajdhani font-semibold">{agent.type || 'Unknown'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 font-rajdhani">Reputation:</span>
                  <span className="font-rajdhani font-semibold text-primary-400">{agent.reputation || 0}</span>
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
              </div>

              <button className="w-full mt-4 px-4 py-2 bg-primary-600/20 hover:bg-primary-600/30 rounded-lg font-rajdhani font-semibold text-sm transition-colors">
                View Details
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

