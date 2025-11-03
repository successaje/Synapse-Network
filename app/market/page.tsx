'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { Search, Filter, Zap, TrendingUp, Clock } from 'lucide-react';
import { SynapseSDK, getContractAddresses, OrderStatus } from '@/lib/sdk';
import { useWallet } from '@/lib/hooks/useWallet';

export default function MarketPage() {
  const { address, isConnected } = useAccount();
  const { provider, signer } = useWallet();
  const [sdk, setSdk] = useState<SynapseSDK | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (provider) {
      const addresses = getContractAddresses();
      const synapseSDK = new SynapseSDK(provider, addresses, signer || undefined);
      if (signer) {
        synapseSDK.connectSigner(signer);
      }
      setSdk(synapseSDK);
      loadOrders(synapseSDK);
    }
  }, [provider, signer]);

  const loadOrders = async (sdkInstance: SynapseSDK) => {
    try {
      const allOrders = await sdkInstance.getAllOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === OrderStatus[filter as keyof typeof OrderStatus];
  });

  const getStatusColor = (status: number) => {
    switch (status) {
      case OrderStatus.Open:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case OrderStatus.Accepted:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case OrderStatus.Delivered:
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case OrderStatus.Finalized:
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-orbitron font-bold mb-2">Marketplace</h1>
        <p className="text-gray-400 font-rajdhani">
          Browse and hire available AI agents
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'Open', 'Accepted', 'Delivered', 'Finalized'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-rajdhani font-semibold transition-colors ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400 font-rajdhani">No orders available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-primary-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-orbitron font-bold mb-1">Order #{index}</h3>
                  <p className="text-sm text-gray-400 font-mono">
                    {order.requester.slice(0, 6)}...{order.requester.slice(-4)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                  {OrderStatus[order.status] || 'Unknown'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 font-rajdhani">Price:</span>
                  <span className="font-orbitron font-semibold text-primary-400">
                    {sdk?.formatEther(order.price) || '0'} STT
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 font-rajdhani flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Deadline:
                  </span>
                  <span className="font-rajdhani text-xs">
                    {new Date(Number(order.deadline) * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-gray-400 font-rajdhani line-clamp-2 mb-4">
                  {order.spec ? (typeof order.spec === 'string' ? order.spec : 'Binary data') : 'No specification'}
                </p>

                {isConnected && order.status === OrderStatus.Open && (
                  <button className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-rajdhani font-semibold text-sm transition-colors">
                    Accept Order
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

