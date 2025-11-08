'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { Search, Filter, Zap, TrendingUp, Clock, Plus, CheckCircle, XCircle, Package } from 'lucide-react';
import { SynapseSDK, getContractAddresses, OrderStatus } from '@/lib/sdk';
import { useWallet } from '@/lib/hooks/useWallet';
import { ethers } from 'ethers';
import { mockOrders } from '@/lib/utils/mockData';

export default function MarketPage() {
  const { address, isConnected } = useAccount();
  const { provider, signer } = useWallet();
  const [sdk, setSdk] = useState<SynapseSDK | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    price: '',
    spec: '',
    deadline: '',
  });

  useEffect(() => {
    // Always show mock data initially
    const loadMockData = () => {
      setOrders(mockOrders);
      setLoading(false);
    };

    if (isConnected && provider) {
      // Load real data if connected
      const addresses = getContractAddresses();
      const synapseSDK = new SynapseSDK(provider, addresses, signer || undefined);
      if (signer) {
        synapseSDK.connectSigner(signer);
      }
      setSdk(synapseSDK);
      loadOrders(synapseSDK);
    } else {
      // Show mock data when not connected
      setTimeout(() => {
        loadMockData();
      }, 500);
    }
  }, [provider, signer, isConnected]);

  const loadOrders = async (sdkInstance: SynapseSDK) => {
    try {
      const allOrders = await sdkInstance.getAllOrders();
      // Decode spec bytes to string
      const decodedOrders = allOrders.map((order: any) => ({
        ...order,
        spec: order.spec && typeof order.spec === 'string' 
          ? (order.spec.startsWith('0x') ? ethers.toUtf8String(order.spec) : order.spec)
          : (order.spec ? ethers.toUtf8String(order.spec) : 'No specification'),
      }));
      setOrders(decodedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!sdk || !signer || !address) {
      alert('Please connect your wallet');
      return;
    }

    if (!createForm.price || !createForm.spec || !createForm.deadline) {
      alert('Please fill in all fields');
      return;
    }

    setProcessing('creating');
    try {
      const price = sdk.parseEther(createForm.price);
      const deadline = Math.floor(new Date(createForm.deadline).getTime() / 1000);
      
      const orderId = await sdk.createOrder(price, createForm.spec, deadline);
      alert(`Order created successfully! Order ID: ${orderId}`);
      
      setShowCreateModal(false);
      setCreateForm({ price: '', spec: '', deadline: '' });
      await loadOrders(sdk);
    } catch (error: any) {
      console.error('Error creating order:', error);
      alert(`Error: ${error.message || 'Failed to create order'}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleAcceptOrder = async (orderId: bigint) => {
    if (!sdk || !signer) {
      alert('Please connect your wallet');
      return;
    }

    setProcessing(orderId.toString());
    try {
      await sdk.acceptOrder(orderId);
      alert('Order accepted successfully!');
      await loadOrders(sdk);
    } catch (error: any) {
      console.error('Error accepting order:', error);
      alert(`Error: ${error.message || 'Failed to accept order'}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleDepositEscrow = async (orderId: bigint, price: bigint) => {
    if (!sdk || !signer) {
      alert('Please connect your wallet');
      return;
    }

    setProcessing(`deposit-${orderId}`);
    try {
      await sdk.depositEscrow(orderId, price);
      alert('Escrow deposited successfully!');
      await loadOrders(sdk);
    } catch (error: any) {
      console.error('Error depositing escrow:', error);
      alert(`Error: ${error.message || 'Failed to deposit escrow'}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleFinalizeOrder = async (orderId: bigint) => {
    if (!sdk || !signer) {
      alert('Please connect your wallet');
      return;
    }

    setProcessing(`finalize-${orderId}`);
    try {
      await sdk.finalizeOrder(orderId);
      alert('Order finalized successfully!');
      await loadOrders(sdk);
    } catch (error: any) {
      console.error('Error finalizing order:', error);
      alert(`Error: ${error.message || 'Failed to finalize order'}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleCancelOrder = async (orderId: bigint) => {
    if (!sdk || !signer) {
      alert('Please connect your wallet');
      return;
    }

    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setProcessing(`cancel-${orderId}`);
    try {
      await sdk.cancelOrder(orderId);
      alert('Order cancelled successfully!');
      await loadOrders(sdk);
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      alert(`Error: ${error.message || 'Failed to cancel order'}`);
    } finally {
      setProcessing(null);
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-orbitron font-bold mb-2">Marketplace</h1>
          <p className="text-gray-400 font-rajdhani">
            Browse and hire available AI agents
          </p>
        </div>
        {isConnected && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-rajdhani font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create Order
          </motion.button>
        )}
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
          {filteredOrders.map((order: any, index: number) => {
            // Find the actual order ID from the orders array
            const orderIndex = orders.findIndex((o: any) => o === order);
            const orderId = BigInt(orderIndex >= 0 ? orderIndex : index);
            
            return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-primary-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-orbitron font-bold mb-1">Order #{orderIndex >= 0 ? orderIndex : index}</h3>
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
                    {sdk?.formatEther(order.price) || (typeof order.price === 'bigint' ? (Number(order.price) / 1e18).toFixed(4) : order.price)} STT
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
                  {order.spec || 'No specification'}
                </p>

                {isConnected && (
                  <div className="space-y-2">
                    {order.status === OrderStatus.Open && (
                      <>
                        {order.requester.toLowerCase() === address?.toLowerCase() ? (
                          <button
                            onClick={() => handleDepositEscrow(orderId, order.price)}
                            disabled={processing === `deposit-${orderId}`}
                            className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-rajdhani font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {processing === `deposit-${orderId}` ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Depositing...
                              </>
                            ) : (
                              <>
                                <Package className="w-4 h-4" />
                                Deposit Escrow
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAcceptOrder(orderId)}
                            disabled={processing === orderId.toString()}
                            className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-rajdhani font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {processing === orderId.toString() ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Accepting...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Accept Order
                              </>
                            )}
                          </button>
                        )}
                      </>
                    )}
                    
                    {order.status === OrderStatus.Delivered && order.requester.toLowerCase() === address?.toLowerCase() && (
                      <button
                        onClick={() => handleFinalizeOrder(orderId)}
                        disabled={processing === `finalize-${orderId}`}
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-rajdhani font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {processing === `finalize-${orderId}` ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Finalizing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Finalize Order
                          </>
                        )}
                      </button>
                    )}
                    
                    {(order.status === OrderStatus.Open || order.status === OrderStatus.Accepted) && 
                     (order.requester.toLowerCase() === address?.toLowerCase() || 
                      (order.status === OrderStatus.Accepted && order.provider.toLowerCase() === address?.toLowerCase())) && (
                      <button
                        onClick={() => handleCancelOrder(orderId)}
                        disabled={processing === `cancel-${orderId}`}
                        className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-rajdhani font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {processing === `cancel-${orderId}` ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            Cancel Order
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-orbitron font-bold">Create New Order</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-rajdhani font-medium mb-2">
                  Price (STT)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={createForm.price}
                  onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-white/10 focus:border-primary-500 focus:outline-none font-rajdhani"
                  placeholder="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-rajdhani font-medium mb-2">
                  Specification
                </label>
                <textarea
                  value={createForm.spec}
                  onChange={(e) => setCreateForm({ ...createForm, spec: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-white/10 focus:border-primary-500 focus:outline-none font-rajdhani min-h-[100px]"
                  placeholder="Describe what you need..."
                />
              </div>

              <div>
                <label className="block text-sm font-rajdhani font-medium mb-2">
                  Deadline
                </label>
                <input
                  type="datetime-local"
                  value={createForm.deadline}
                  onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-white/10 focus:border-primary-500 focus:outline-none font-rajdhani"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-rajdhani font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={processing === 'creating'}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-rajdhani font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing === 'creating' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Order'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

