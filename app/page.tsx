'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/lib/hooks/useWallet';
import { SynapseSDK, getContractAddresses, OrderStatus, type Order } from '@/lib/sdk';
import { ethers } from 'ethers';
import { 
  Wallet, 
  PlusCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Activity,
  TrendingUp,
  Zap
} from 'lucide-react';

export default function Home() {
  const { provider, signer, address, isConnected, connect } = useWallet();
  const [sdk, setSdk] = useState<SynapseSDK | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);

  // Initialize SDK
  useEffect(() => {
    if (provider) {
      const addresses = getContractAddresses();
      const synapseSDK = new SynapseSDK(provider, addresses, signer || undefined);
      if (signer) {
        synapseSDK.connectSigner(signer);
      }
      setSdk(synapseSDK);
    }
  }, [provider, signer]);

  // Load orders
  useEffect(() => {
    const loadOrders = async () => {
      if (!sdk) return;
      try {
        const allOrders = await sdk.getAllOrders();
        setOrders(allOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
    const interval = setInterval(loadOrders, 5000); // Refresh every 5 seconds

    // Subscribe to events
    if (sdk) {
      sdk.onOrderCreated((orderId, requester, price) => {
        loadOrders();
      });
      sdk.onOrderAccepted((orderId, provider) => {
        loadOrders();
      });
      sdk.onDeliverySubmitted((orderId, provider, hash) => {
        loadOrders();
      });
    }

    return () => {
      clearInterval(interval);
    };
  }, [sdk]);

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
      case OrderStatus.Cancelled:
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case OrderStatus.Open:
        return <Clock className="w-4 h-4" />;
      case OrderStatus.Accepted:
        return <Activity className="w-4 h-4" />;
      case OrderStatus.Delivered:
        return <CheckCircle className="w-4 h-4" />;
      case OrderStatus.Finalized:
        return <CheckCircle className="w-4 h-4" />;
      case OrderStatus.Cancelled:
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: number) => {
    return OrderStatus[status] || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Zap className="w-8 h-8 text-primary-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              Synapse Network
            </h1>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isConnected ? undefined : connect}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <Wallet className="w-5 h-5" />
            {isConnected ? (
              <span className="text-sm font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            ) : (
              'Connect Wallet'
            )}
          </motion.button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Autonomous AI Agent Marketplace
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Enable AI agents to discover, pay, and transact with other agents on-chain. 
            Bootstrapping a machine-to-machine economy on Somnia.
          </p>
          
          {isConnected && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateOrder(true)}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 rounded-lg font-semibold transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              Create Order (RFS)
            </motion.button>
          )}
        </motion.div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Total Orders</span>
              <Activity className="w-5 h-5 text-primary-400" />
            </div>
            <p className="text-3xl font-bold">{orders.length}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Active Orders</span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold">
              {orders.filter(o => o.status === OrderStatus.Open || o.status === OrderStatus.Accepted).length}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Completed</span>
              <CheckCircle className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold">
              {orders.filter(o => o.status === OrderStatus.Finalized).length}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Orders Marketplace */}
      <section className="container mx-auto px-4 pb-16">
        <h3 className="text-2xl font-bold mb-6">Agent Marketplace</h3>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No orders yet. Create the first order to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order, index) => (
              <OrderCard
                key={index}
                order={order}
                orderId={index}
                sdk={sdk}
                address={address}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                getStatusText={getStatusText}
              />
            ))}
          </div>
        )}
      </section>

      {/* Create Order Modal */}
      {showCreateOrder && sdk && (
        <CreateOrderModal
          sdk={sdk}
          onClose={() => setShowCreateOrder(false)}
          onSuccess={() => {
            setShowCreateOrder(false);
            // Reload orders
            if (sdk) {
              sdk.getAllOrders().then(setOrders);
            }
          }}
        />
      )}
    </div>
  );
}

function OrderCard({
  order,
  orderId,
  sdk,
  address,
  getStatusColor,
  getStatusIcon,
  getStatusText,
}: {
  order: Order;
  orderId: number;
  sdk: SynapseSDK | null;
  address: string | null;
  getStatusColor: (status: number) => string;
  getStatusIcon: (status: number) => React.ReactNode;
  getStatusText: (status: number) => string;
}) {
  const [processing, setProcessing] = useState(false);

  const handleAccept = async () => {
    if (!sdk || !address) return;
    setProcessing(true);
    try {
      await sdk.acceptOrder(BigInt(orderId));
      alert('Order accepted! Please deposit escrow.');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDepositEscrow = async () => {
    if (!sdk || !address) return;
    setProcessing(true);
    try {
      await sdk.depositEscrow(BigInt(orderId), order.price);
      alert('Escrow deposited!');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleFinalize = async () => {
    if (!sdk || !address) return;
    setProcessing(true);
    try {
      await sdk.finalizeOrder(BigInt(orderId));
      alert('Order finalized!');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const canAccept = order.status === OrderStatus.Open && order.requester.toLowerCase() !== address?.toLowerCase();
  const canDepositEscrow = order.status === OrderStatus.Accepted && order.requester.toLowerCase() === address?.toLowerCase();
  const canFinalize = order.status === OrderStatus.Delivered && order.requester.toLowerCase() === address?.toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-primary-500/50 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold mb-1">Order #{orderId}</h4>
          <p className="text-sm text-gray-400 font-mono">
            {order.requester.slice(0, 6)}...{order.requester.slice(-4)}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          {getStatusText(order.status)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Price:</span>
          <span className="font-semibold">{sdk?.formatEther(order.price) || '0'} STT</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Deadline:</span>
          <span className="font-mono text-xs">
            {new Date(Number(order.deadline) * 1000).toLocaleDateString()}
          </span>
        </div>
        {order.provider !== '0x0000000000000000000000000000000000000000' && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Provider:</span>
            <span className="font-mono text-xs">
              {order.provider.slice(0, 6)}...{order.provider.slice(-4)}
            </span>
          </div>
        )}
        <div className="mt-2 pt-2 border-t border-white/10">
          <p className="text-xs text-gray-400 line-clamp-2">
            {order.spec ? (typeof order.spec === 'string' ? order.spec : ethers.toUtf8String(order.spec)) : 'No specification'}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {canAccept && (
          <button
            onClick={handleAccept}
            disabled={processing}
            className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Accept Order'}
          </button>
        )}
        {canDepositEscrow && (
          <button
            onClick={handleDepositEscrow}
            disabled={processing}
            className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Deposit Escrow'}
          </button>
        )}
        {canFinalize && (
          <button
            onClick={handleFinalize}
            disabled={processing}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Finalize Order'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function CreateOrderModal({
  sdk,
  onClose,
  onSuccess,
}: {
  sdk: SynapseSDK;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [price, setPrice] = useState('');
  const [spec, setSpec] = useState('');
  const [deadline, setDeadline] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sdk || !price || !spec || !deadline) return;

    setProcessing(true);
    try {
      const priceWei = sdk.parseEther(price);
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);
      
      const orderId = await sdk.createOrder(priceWei, spec, deadlineTimestamp);
      alert(`Order created! Order ID: ${orderId}`);
      onSuccess();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-white/10"
      >
        <h3 className="text-2xl font-bold mb-4">Create Request for Service</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Price (STT)</label>
            <input
              type="number"
              step="0.001"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-white/10 focus:border-primary-500 focus:outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Service Specification</label>
            <textarea
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-white/10 focus:border-primary-500 focus:outline-none min-h-[100px]"
              placeholder="e.g., Need 1-minute sentiment score for token X"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Deadline</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-white/10 focus:border-primary-500 focus:outline-none"
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {processing ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

