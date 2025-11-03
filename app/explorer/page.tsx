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

export default function ExplorerPage() {
  const { provider } = useWallet();
  const [sdk, setSdk] = useState<SynapseSDK | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const graphRef = useRef<any>();

  useEffect(() => {
    if (provider) {
      const addresses = getContractAddresses();
      const synapseSDK = new SynapseSDK(provider, addresses);
      setSdk(synapseSDK);
      loadAgents(synapseSDK);
    }
  }, [provider]);

  const loadAgents = async (sdkInstance: SynapseSDK) => {
    try {
      // Mock data for visualization - in production, fetch from contracts
      const mockAgents = [
        { id: '0x123...', name: 'Data Agent Alpha', type: 'DataAgent', reputation: 85 },
        { id: '0x456...', name: 'Compute Agent Beta', type: 'ComputeAgent', reputation: 72 },
        { id: '0x789...', name: 'Trading Agent Gamma', type: 'TradingAgent', reputation: 91 },
      ];

      setAgents(mockAgents);

      // Build graph data
      const nodes = mockAgents.map((agent, i) => ({
        id: agent.id,
        name: agent.name,
        type: agent.type,
        reputation: agent.reputation,
        val: agent.reputation / 10,
      }));

      // Create connections (mock - in production, use actual interaction data)
      const links = [
        { source: nodes[0].id, target: nodes[1].id },
        { source: nodes[1].id, target: nodes[2].id },
        { source: nodes[0].id, target: nodes[2].id },
      ];

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
              // Focus on clicked node
              const distance = 100;
              const distRatio = 1 + distance / Math.hypot(node.x, node.y);
              if (graphRef.current) {
                graphRef.current.cameraPosition(
                  { x: node.x * distRatio, y: node.y * distRatio, z: distance },
                  node,
                  3000
                );
              }
            }}
            cooldownTicks={100}
            onEngineStop={() => {
              if (graphRef.current) {
                graphRef.current.zoomToFit(400);
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
                  <h3 className="text-lg font-orbitron font-bold mb-1">{agent.name}</h3>
                  <p className="text-sm text-gray-400 font-mono">{agent.id}</p>
                </div>
                <Zap className="w-6 h-6 text-primary-400" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 font-rajdhani">Type:</span>
                  <span className="font-rajdhani font-semibold">{agent.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 font-rajdhani">Reputation:</span>
                  <span className="font-rajdhani font-semibold text-primary-400">{agent.reputation}</span>
                </div>
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

