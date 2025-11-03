/**
 * DataAgent - Example off-chain agent for sentiment analysis
 * 
 * This agent listens to ServiceAgreement events, evaluates orders,
 * performs sentiment analysis, and submits results on-chain.
 */

import { ethers } from 'ethers';
import { SynapseSDK, getContractAddresses, OrderStatus } from '../lib/sdk';
import axios from 'axios';
import { create } from 'ipfs-http-client';

// Simple sentiment analysis (in production, use a proper ML model)
function analyzeSentiment(text: string): { score: number; label: string } {
  const positiveWords = ['good', 'great', 'excellent', 'positive', 'bullish', 'up', 'rise', 'gain'];
  const negativeWords = ['bad', 'terrible', 'negative', 'bearish', 'down', 'fall', 'loss', 'crash'];
  
  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });
  
  const score = (positiveCount - negativeCount) / Math.max(positiveCount + negativeCount, 1);
  const label = score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral';
  
  return { score, label };
}

// IPFS client (using public gateway for demo)
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: process.env.IPFS_AUTH || '',
  },
});

export class DataAgent {
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  private sdk: SynapseSDK;
  private running: boolean = false;

  constructor(privateKey: string, rpcUrl: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    
    const addresses = getContractAddresses();
    this.sdk = new SynapseSDK(this.provider, addresses, this.wallet);
  }

  async start() {
    console.log(`DataAgent started with address: ${this.wallet.address}`);
    this.running = true;

    // Listen for new orders
    this.sdk.serviceAgreement.on('OrderCreated', async (orderId, requester, price, event) => {
      console.log(`New order detected: ${orderId}`);
      await this.evaluateOrder(Number(orderId));
    });

    // Also check existing orders periodically
    setInterval(async () => {
      await this.scanOrders();
    }, 10000); // Every 10 seconds

    // Initial scan
    await this.scanOrders();
  }

  async scanOrders() {
    try {
      const orders = await this.sdk.getAllOrders();
      const openOrders = orders.filter(
        (order, index) => order.status === OrderStatus.Open && 
        order.requester.toLowerCase() !== this.wallet.address.toLowerCase()
      );

      for (let i = 0; i < openOrders.length; i++) {
        await this.evaluateOrder(i);
      }
    } catch (error) {
      console.error('Error scanning orders:', error);
    }
  }

  async evaluateOrder(orderId: number) {
    try {
      const order = await this.sdk.getOrder(BigInt(orderId));
      
      // Skip if not open or already accepted
      if (order.status !== OrderStatus.Open) return;
      
      // Skip own orders
      if (order.requester.toLowerCase() === this.wallet.address.toLowerCase()) return;

      // Parse service specification
      const spec = ethers.toUtf8String(order.spec);
      console.log(`Evaluating order ${orderId}: ${spec}`);

      // Check if this is a sentiment analysis request
      if (spec.toLowerCase().includes('sentiment')) {
        await this.acceptAndProcessOrder(orderId, order, spec);
      }
    } catch (error) {
      console.error(`Error evaluating order ${orderId}:`, error);
    }
  }

  async acceptAndProcessOrder(orderId: number, order: any, spec: string) {
    try {
      console.log(`Accepting order ${orderId}...`);
      
      // Accept the order
      await this.sdk.acceptOrder(BigInt(orderId));
      console.log(`Order ${orderId} accepted`);

      // Wait for escrow deposit (in production, listen for event)
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Extract token symbol from spec (simple parsing)
      const tokenMatch = spec.match(/token\s+([A-Z]+)/i);
      const tokenSymbol = tokenMatch ? tokenMatch[1] : 'ETH';

      // Perform sentiment analysis (simulated - in production, use real data sources)
      const sentimentData = {
        token: tokenSymbol,
        timestamp: new Date().toISOString(),
        sentiment: analyzeSentiment(spec),
        analysis: {
          source: 'DataAgent',
          model: 'simple-lexicon-v1',
          confidence: 0.75,
        },
      };

      // Upload to IPFS
      const ipfsResult = await ipfs.add(JSON.stringify(sentimentData));
      const ipfsHash = ipfsResult.path;
      console.log(`Result uploaded to IPFS: ${ipfsHash}`);

      // Compute deliverable hash (use IPFS hash as deliverable)
      const deliverableHash = ethers.keccak256(ethers.toUtf8Bytes(ipfsHash));

      // Submit delivery
      await this.sdk.submitDelivery(BigInt(orderId), deliverableHash);
      console.log(`Delivery submitted for order ${orderId}`);

      // For demo purposes, we'll also log the IPFS hash
      console.log(`IPFS Hash: ${ipfsHash}`);
      console.log(`Deliverable Hash: ${deliverableHash}`);
      
    } catch (error: any) {
      console.error(`Error processing order ${orderId}:`, error.message);
    }
  }

  stop() {
    this.running = false;
    console.log('DataAgent stopped');
  }
}

// Main execution
if (typeof require !== 'undefined' && require.main === module) {
  const privateKey = process.env.AGENT_PRIVATE_KEY;
  const rpcUrl = process.env.RPC_URL || 'https://rpc.testnet.somnia.network';

  if (!privateKey) {
    console.error('Please set AGENT_PRIVATE_KEY environment variable');
    process.exit(1);
  }

  const agent = new DataAgent(privateKey, rpcUrl);
  agent.start().catch(console.error);

  // Graceful shutdown
  process.on('SIGINT', () => {
    agent.stop();
    process.exit(0);
  });
}

