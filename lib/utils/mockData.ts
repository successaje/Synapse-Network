// Mock data for demonstration purposes when wallet is not connected or no real data exists

export const mockAgents = [
  {
    id: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    name: 'Sentiment Analysis Agent',
    type: 'DataAgent',
    description: 'Analyzes social media sentiment and market trends using advanced NLP models',
    capabilities: ['sentiment analysis', 'NLP', 'market trends', 'social media'],
    reputation: 92,
    endpoint: 'https://api.example.com/sentiment',
  },
  {
    id: '0x8ba1f109551bD432803012645Hac136c22C1778',
    address: '0x8ba1f109551bD432803012645Hac136c22C1778',
    name: 'Compute Power Provider',
    type: 'ComputeAgent',
    description: 'Provides distributed computing resources for ML model training',
    capabilities: ['GPU compute', 'model training', 'distributed computing'],
    reputation: 87,
    endpoint: 'https://compute.example.com',
  },
  {
    id: '0x1234567890abcdef1234567890abcdef12345678',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    name: 'DeFi Trading Bot',
    type: 'TradingAgent',
    description: 'Autonomous trading agent specializing in DeFi arbitrage opportunities',
    capabilities: ['trading', 'arbitrage', 'DeFi', 'portfolio management'],
    reputation: 95,
    endpoint: 'https://trading.example.com',
  },
  {
    id: '0xabcdef1234567890abcdef1234567890abcdef12',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    name: 'Price Oracle Network',
    type: 'OracleAgent',
    description: 'Reliable price feeds for cryptocurrencies and traditional assets',
    capabilities: ['price feeds', 'oracle', 'data aggregation'],
    reputation: 89,
    endpoint: 'https://oracle.example.com',
  },
  {
    id: '0x9876543210fedcba9876543210fedcba98765432',
    address: '0x9876543210fedcba9876543210fedcba98765432',
    name: 'Market Prediction Engine',
    type: 'PredictionAgent',
    description: 'ML-powered predictions for market movements and asset prices',
    capabilities: ['predictions', 'forecasting', 'ML models'],
    reputation: 84,
    endpoint: 'https://predict.example.com',
  },
];

export const mockOrders = [
  {
    orderId: BigInt(0),
    requester: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    provider: '0x0000000000000000000000000000000000000000',
    price: BigInt('100000000000000000'), // 0.1 STT
    spec: 'Analyze sentiment of 10,000 tweets about cryptocurrency for the past 24 hours',
    deadline: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
    status: 0, // Open
    createdAt: Math.floor(Date.now() / 1000) - 3600,
    acceptedAt: 0,
    deliveredAt: 0,
    deliverableHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  },
  {
    orderId: BigInt(1),
    requester: '0x8ba1f109551bD432803012645Hac136c22C1778',
    provider: '0x1234567890abcdef1234567890abcdef12345678',
    price: BigInt('500000000000000000'), // 0.5 STT
    spec: 'Train a neural network model on 100GB dataset using distributed GPU resources',
    deadline: Math.floor(Date.now() / 1000) + 172800, // 48 hours
    status: 1, // Accepted
    createdAt: Math.floor(Date.now() / 1000) - 7200,
    acceptedAt: Math.floor(Date.now() / 1000) - 3600,
    deliveredAt: 0,
    deliverableHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  },
  {
    orderId: BigInt(2),
    requester: '0xabcdef1234567890abcdef1234567890abcdef12',
    provider: '0x9876543210fedcba9876543210fedcba98765432',
    price: BigInt('250000000000000000'), // 0.25 STT
    spec: 'Generate price predictions for BTC, ETH, and SOL for next 7 days',
    deadline: Math.floor(Date.now() / 1000) + 604800, // 7 days
    status: 2, // Delivered
    createdAt: Math.floor(Date.now() / 1000) - 10800,
    acceptedAt: Math.floor(Date.now() / 1000) - 7200,
    deliveredAt: Math.floor(Date.now() / 1000) - 1800,
    deliverableHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
  },
  {
    orderId: BigInt(3),
    requester: '0x1234567890abcdef1234567890abcdef12345678',
    provider: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    price: BigInt('750000000000000000'), // 0.75 STT
    spec: 'Provide real-time price feeds for top 50 cryptocurrencies updated every minute',
    deadline: Math.floor(Date.now() / 1000) + 259200, // 3 days
    status: 3, // Finalized
    createdAt: Math.floor(Date.now() / 1000) - 86400,
    acceptedAt: Math.floor(Date.now() / 1000) - 82800,
    deliveredAt: Math.floor(Date.now() / 1000) - 79200,
    deliverableHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  },
];

export const mockActivity = [
  {
    id: 1,
    type: 'order_created',
    title: 'New order created',
    description: 'Order #0 created for sentiment analysis',
    timestamp: Date.now() - 3600000,
    agent: '0x742d...0bEb',
  },
  {
    id: 2,
    type: 'order_accepted',
    title: 'Order accepted',
    description: 'Order #1 accepted by DeFi Trading Bot',
    timestamp: Date.now() - 7200000,
    agent: '0x1234...5678',
  },
  {
    id: 3,
    type: 'order_delivered',
    title: 'Delivery submitted',
    description: 'Order #2 delivered by Market Prediction Engine',
    timestamp: Date.now() - 10800000,
    agent: '0x9876...5432',
  },
  {
    id: 4,
    type: 'order_finalized',
    title: 'Order finalized',
    description: 'Order #3 finalized and payment released',
    timestamp: Date.now() - 86400000,
    agent: '0x742d...0bEb',
  },
];

export const mockStats = {
  totalAgents: 1247,
  activeOrders: 156,
  totalVolume: 12450.75,
  avgReputation: 87.3,
  successfulInteractions: 8923,
};

export function getMockAgent(address: string) {
  return mockAgents.find(a => a.address.toLowerCase() === address.toLowerCase());
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}


