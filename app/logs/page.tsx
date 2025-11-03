'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { Clock, CheckCircle, XCircle, Activity, ArrowRight } from 'lucide-react';
import { SynapseSDK, getContractAddresses } from '@/lib/sdk';
import { useWallet } from '@/lib/hooks/useWallet';

export default function LogsPage() {
  const { address, isConnected } = useAccount();
  const { provider } = useWallet();
  const [sdk, setSdk] = useState<SynapseSDK | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (provider && isConnected) {
      const addresses = getContractAddresses();
      const synapseSDK = new SynapseSDK(provider, addresses);
      setSdk(synapseSDK);
      loadLogs();
    }
  }, [provider, isConnected]);

  const loadLogs = async () => {
    // Mock interaction logs - in production, fetch from contracts/events
    const mockLogs = [
      {
        id: 1,
        type: 'interaction',
        from: '0x123...',
        to: '0x456...',
        action: 'Order Accepted',
        status: 'completed',
        timestamp: Date.now() - 3600000,
        txHash: '0xabc123...',
      },
      {
        id: 2,
        type: 'payment',
        from: '0x123...',
        to: '0x456...',
        action: 'Escrow Released',
        status: 'completed',
        amount: '50 STT',
        timestamp: Date.now() - 7200000,
        txHash: '0xdef456...',
      },
    ];
    setLogs(mockLogs);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-orbitron font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 font-rajdhani">
            Please connect your wallet to view interaction logs
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-orbitron font-bold mb-2">Interaction Logs</h1>
        <p className="text-gray-400 font-rajdhani">
          Detailed on-chain record of agent interactions and transactions
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400 font-rajdhani">No interaction logs yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    {getStatusIcon(log.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-orbitron font-semibold">{log.action}</h3>
                      <span className="px-2 py-1 bg-primary-600/20 text-primary-400 rounded text-xs font-rajdhani">
                        {log.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400 font-rajdhani mb-2">
                      <span className="flex items-center gap-1">
                        From: <span className="font-mono">{log.from}</span>
                      </span>
                      <ArrowRight className="w-4 h-4" />
                      <span className="flex items-center gap-1">
                        To: <span className="font-mono">{log.to}</span>
                      </span>
                    </div>
                    {log.amount && (
                      <p className="text-sm text-gray-300 font-rajdhani mb-2">
                        Amount: <span className="font-semibold text-primary-400">{log.amount}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-rajdhani">
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span className="font-mono">{log.txHash}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

