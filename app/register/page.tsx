'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Zap, Upload, Code } from 'lucide-react';
import { SynapseSDK, getContractAddresses } from '@/lib/sdk';
import { useWallet } from '@/lib/hooks/useWallet';

export default function RegisterPage() {
  const { address, isConnected } = useAccount();
  const { provider, signer } = useWallet();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    agentType: 'DataAgent',
    capabilities: '',
    endpoint: '',
    intentPolicies: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !signer || !provider) {
      alert('Please connect your wallet');
      return;
    }

    setLoading(true);
    try {
      const addresses = getContractAddresses();
      const sdk = new SynapseSDK(provider, addresses, signer);
      
      const metadata = JSON.stringify({
        name: formData.name,
        description: formData.description,
        type: formData.agentType,
        capabilities: formData.capabilities.split(',').map(c => c.trim()),
        endpoint: formData.endpoint,
        intentPolicies: formData.intentPolicies,
      });

      await sdk.registerAgent(address!, metadata);
      
      alert('Agent registered successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-orbitron font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 font-rajdhani">
            Please connect your wallet to register an agent
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-orbitron font-bold mb-2">Register Agent</h1>
          <p className="text-gray-400 font-rajdhani">
            Deploy and register your AI agent on the Synapse Network
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-orbitron font-bold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-primary-400" />
              Agent Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-rajdhani font-medium mb-2">
                  Agent Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-white/10 focus:border-primary-500 focus:outline-none font-rajdhani"
                  required
                  placeholder="e.g., Sentiment Analysis Agent"
                />
              </div>

              <div>
                <label className="block text-sm font-rajdhani font-medium mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-white/10 focus:border-primary-500 focus:outline-none font-rajdhani min-h-[100px]"
                  required
                  placeholder="Describe what your agent does..."
                />
              </div>

              <div>
                <label className="block text-sm font-rajdhani font-medium mb-2">
                  Agent Type *
                </label>
                <select
                  value={formData.agentType}
                  onChange={(e) => setFormData({ ...formData, agentType: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-white/10 focus:border-primary-500 focus:outline-none font-rajdhani"
                  required
                >
                  <option value="DataAgent">Data Agent</option>
                  <option value="ComputeAgent">Compute Agent</option>
                  <option value="TradingAgent">Trading Agent</option>
                  <option value="OracleAgent">Oracle Agent</option>
                  <option value="PredictionAgent">Prediction Agent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-rajdhani font-medium mb-2">
                  Capabilities (comma-separated) *
                </label>
                <input
                  type="text"
                  value={formData.capabilities}
                  onChange={(e) => setFormData({ ...formData, capabilities: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-white/10 focus:border-primary-500 focus:outline-none font-rajdhani"
                  required
                  placeholder="sentiment analysis, price prediction, data feed"
                />
              </div>

              <div>
                <label className="block text-sm font-rajdhani font-medium mb-2">
                  Agent Endpoint (optional)
                </label>
                <input
                  type="url"
                  value={formData.endpoint}
                  onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-white/10 focus:border-primary-500 focus:outline-none font-rajdhani"
                  placeholder="https://api.example.com/agent"
                />
              </div>

              <div>
                <label className="block text-sm font-rajdhani font-medium mb-2">
                  Intent Policies (optional)
                </label>
                <textarea
                  value={formData.intentPolicies}
                  onChange={(e) => setFormData({ ...formData, intentPolicies: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-white/10 focus:border-primary-500 focus:outline-none font-rajdhani min-h-[80px]"
                  placeholder='e.g., "Accept only verified agents", "Trade tokens when volatility < 10%"'
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-rajdhani font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-rajdhani font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Register Agent
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

