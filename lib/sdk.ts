import { ethers } from 'ethers';

// Import ABIs from compiled artifacts
import AgentRegistryABI from './abis/AgentRegistry.json';
import ServiceAgreementABI from './abis/ServiceAgreement.json';
import EscrowVaultABI from './abis/EscrowVault.json';
import VerifierABI from './abis/Verifier.json';
import SynapseExchangeABI from './abis/SynapseExchange.json';
import IntentRouterABI from './abis/IntentRouter.json';

export interface ContractAddresses {
  agentRegistry: string;
  serviceAgreement: string;
  escrowVault: string;
  verifier: string;
  synapseExchange: string;
  intentRouter: string;
}

export interface Order {
  requester: string;
  provider: string;
  price: bigint;
  deliverableHash: string;
  deadline: bigint;
  status: number;
  spec: string;
  createdAt: bigint;
  acceptedAt: bigint;
  deliveredAt: bigint;
}

export enum OrderStatus {
  Open = 0,
  Accepted = 1,
  Delivered = 2,
  Finalized = 3,
  Cancelled = 4,
  Disputed = 5,
}

// Validate that an address is not empty and is a valid address format
function validateAddress(address: string, name: string): string {
  if (!address || address.trim() === '') {
    throw new Error(`Contract address for ${name} is not set. Please set the NEXT_PUBLIC_${name.toUpperCase()} environment variable.`);
  }
  if (!ethers.isAddress(address)) {
    throw new Error(`Invalid contract address for ${name}: ${address}`);
  }
  return address;
}

export class SynapseSDK {
  private provider: ethers.Provider;
  private signer: ethers.Signer | null = null;
  private addresses: ContractAddresses;

  public agentRegistry: ethers.Contract;
  public serviceAgreement: ethers.Contract;
  public escrowVault: ethers.Contract;
  public verifier: ethers.Contract;
  public synapseExchange: ethers.Contract;
  public intentRouter: ethers.Contract;

  constructor(
    provider: ethers.Provider | ethers.BrowserProvider,
    addresses: ContractAddresses,
    signer?: ethers.Signer
  ) {
    this.provider = provider as ethers.Provider;
    
    // Validate all addresses before creating contracts
    this.addresses = {
      agentRegistry: validateAddress(addresses.agentRegistry, 'AgentRegistry'),
      serviceAgreement: validateAddress(addresses.serviceAgreement, 'ServiceAgreement'),
      escrowVault: validateAddress(addresses.escrowVault, 'EscrowVault'),
      verifier: validateAddress(addresses.verifier, 'Verifier'),
      synapseExchange: validateAddress(addresses.synapseExchange, 'SynapseExchange'),
      intentRouter: validateAddress(addresses.intentRouter, 'IntentRouter'),
    };

    if (signer) {
      this.signer = signer;
    }

    // Create contract instances with full ABIs
    this.agentRegistry = new ethers.Contract(
      this.addresses.agentRegistry,
      AgentRegistryABI as any,
      signer || provider
    );

    this.serviceAgreement = new ethers.Contract(
      this.addresses.serviceAgreement,
      ServiceAgreementABI as any,
      signer || provider
    );

    this.escrowVault = new ethers.Contract(
      this.addresses.escrowVault,
      EscrowVaultABI as any,
      signer || provider
    );

    this.verifier = new ethers.Contract(
      this.addresses.verifier,
      VerifierABI as any,
      signer || provider
    );

    this.synapseExchange = new ethers.Contract(
      this.addresses.synapseExchange,
      SynapseExchangeABI as any,
      signer || provider
    );

    this.intentRouter = new ethers.Contract(
      this.addresses.intentRouter,
      IntentRouterABI as any,
      signer || provider
    );
  }

  async connectSigner(signer: ethers.Signer) {
    this.signer = signer;
    this.agentRegistry = this.agentRegistry.connect(signer);
    this.serviceAgreement = this.serviceAgreement.connect(signer);
    this.escrowVault = this.escrowVault.connect(signer);
    this.verifier = this.verifier.connect(signer);
    this.synapseExchange = this.synapseExchange.connect(signer);
    this.intentRouter = this.intentRouter.connect(signer);
  }

  // Agent Registry methods
  async registerAgent(agentAddr: string, metadata: string) {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.agentRegistry.registerAgent(agentAddr, metadata);
    return await tx.wait();
  }

  async getAgent(agentAddr: string) {
    return await this.agentRegistry.getAgent(agentAddr);
  }

  async isRegistered(agentAddr: string): Promise<boolean> {
    return await this.agentRegistry.isRegistered(agentAddr);
  }

  async getAgentCount(): Promise<bigint> {
    return await this.agentRegistry.getAgentCount();
  }

  async getAgentByIndex(index: number): Promise<string> {
    return await this.agentRegistry.agentList(index);
  }

  // Service Agreement methods
  async createOrder(
    price: bigint,
    spec: string,
    deadline: number
  ): Promise<bigint> {
    if (!this.signer) throw new Error('Signer not connected');
    const specBytes = ethers.toUtf8Bytes(spec);
    const tx = await this.serviceAgreement.createOrder(price, specBytes, deadline);
    const receipt = await tx.wait();
    // Extract orderId from event
    const event = receipt?.logs
      .map((log: any) => {
        try {
          return this.serviceAgreement.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((e: any) => e?.name === 'OrderCreated');
    return event?.args.orderId || BigInt(0);
  }

  async acceptOrder(orderId: bigint) {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.serviceAgreement.acceptOrder(orderId);
    return await tx.wait();
  }

  async submitDelivery(orderId: bigint, deliverableHash: string) {
    if (!this.signer) throw new Error('Signer not connected');
    const hashBytes32 = ethers.hexlify(ethers.zeroPadValue(deliverableHash, 32));
    const tx = await this.serviceAgreement.submitDelivery(orderId, hashBytes32);
    return await tx.wait();
  }

  async finalizeOrder(orderId: bigint) {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.serviceAgreement.finalizeOrder(orderId);
    return await tx.wait();
  }

  async cancelOrder(orderId: bigint) {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.serviceAgreement.cancelOrder(orderId);
    return await tx.wait();
  }

  async getOrder(orderId: bigint): Promise<Order> {
    return await this.serviceAgreement.getOrder(orderId);
  }

  async getOrderCount(): Promise<bigint> {
    return await this.serviceAgreement.getOrderCount();
  }

  async getAllOrders(): Promise<Order[]> {
    const count = await this.getOrderCount();
    const orders: Order[] = [];
    for (let i = 0; i < Number(count); i++) {
      try {
        const order = await this.getOrder(BigInt(i));
        orders.push(order);
      } catch (e) {
        // Order might not exist
      }
    }
    return orders;
  }

  // Escrow methods
  async depositEscrow(orderId: bigint, amount: bigint) {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.escrowVault.depositEscrow(orderId, { value: amount });
    return await tx.wait();
  }

  async getEscrow(orderId: bigint) {
    return await this.escrowVault.getEscrow(orderId);
  }

  async releaseEscrow(orderId: bigint) {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.escrowVault.releaseEscrow(orderId);
    return await tx.wait();
  }

  async refundEscrow(orderId: bigint) {
    if (!this.signer) throw new Error('Signer not connected');
    const tx = await this.escrowVault.refundEscrow(orderId);
    return await tx.wait();
  }

  // Verifier methods
  async verifyDelivery(orderId: bigint, deliverableHash: string): Promise<boolean> {
    const hashBytes32 = ethers.hexlify(ethers.zeroPadValue(deliverableHash, 32));
    return await this.verifier.verifyDelivery(orderId, hashBytes32);
  }

  async getVerification(orderId: bigint) {
    return await this.verifier.getVerification(orderId);
  }

  // SynapseExchange methods
  async initiateInteraction(
    counterparty: string,
    interactionType: number,
    proposedPrice: bigint,
    specification: string,
    deadline: number
  ): Promise<bigint> {
    if (!this.signer) throw new Error('Signer not connected');
    const specBytes = ethers.toUtf8Bytes(specification);
    const tx = await this.synapseExchange.initiateInteraction(
      counterparty,
      interactionType,
      proposedPrice,
      specBytes,
      deadline
    );
    const receipt = await tx.wait();
    // Extract interactionId from event
    const event = receipt?.logs
      .map((log: any) => {
        try {
          return this.synapseExchange.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((e: any) => e?.name === 'InteractionInitiated');
    return event?.args.interactionId || BigInt(0);
  }

  async getInteraction(interactionId: bigint) {
    return await this.synapseExchange.getInteraction(interactionId);
  }

  async getTrustScore(from: string, to: string): Promise<bigint> {
    return await this.synapseExchange.getTrustScore(from, to);
  }

  // IntentRouter methods
  async postIntent(
    intentType: number,
    intentData: string,
    requirements: string,
    maxPrice: bigint,
    minReputation: bigint,
    deadline: number
  ): Promise<bigint> {
    if (!this.signer) throw new Error('Signer not connected');
    const dataBytes = ethers.toUtf8Bytes(intentData);
    const requirementsBytes32 = ethers.hexlify(ethers.zeroPadValue(requirements, 32));
    const tx = await this.intentRouter.postIntent(
      intentType,
      dataBytes,
      requirementsBytes32,
      maxPrice,
      minReputation,
      deadline
    );
    const receipt = await tx.wait();
    // Extract intentId from event
    const event = receipt?.logs
      .map((log: any) => {
        try {
          return this.intentRouter.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((e: any) => e?.name === 'IntentPosted');
    return event?.args.intentId || BigInt(0);
  }

  async getIntent(intentId: bigint) {
    return await this.intentRouter.getIntent(intentId);
  }

  async searchIntents(intentType: number, maxPrice: bigint, activeOnly: boolean): Promise<bigint[]> {
    return await this.intentRouter.searchIntents(intentType, maxPrice, activeOnly);
  }

  // Event listeners
  onOrderCreated(callback: (orderId: bigint, requester: string, price: bigint) => void) {
    this.serviceAgreement.on('OrderCreated', (orderId, requester, price, event) => {
      callback(orderId, requester, price);
    });
  }

  onOrderAccepted(callback: (orderId: bigint, provider: string) => void) {
    this.serviceAgreement.on('OrderAccepted', (orderId, provider, event) => {
      callback(orderId, provider);
    });
  }

  onDeliverySubmitted(callback: (orderId: bigint, provider: string, hash: string) => void) {
    this.serviceAgreement.on('DeliverySubmitted', (orderId, provider, hash, event) => {
      callback(orderId, provider, hash);
    });
  }

  onEscrowDeposited(callback: (orderId: bigint, requester: string, amount: bigint) => void) {
    this.escrowVault.on('EscrowDeposited', (orderId, requester, amount, event) => {
      callback(orderId, requester, amount);
    });
  }

  // Utility functions
  formatEther(value: bigint): string {
    return ethers.formatEther(value);
  }

  parseEther(value: string): bigint {
    return ethers.parseEther(value);
  }

  keccak256(data: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(data));
  }
}

// Helper to get contract addresses from environment variables
export const getContractAddresses = (): ContractAddresses => {
  const addresses = {
    agentRegistry: process.env.NEXT_PUBLIC_AGENT_REGISTRY || '',
    serviceAgreement: process.env.NEXT_PUBLIC_SERVICE_AGREEMENT || '',
    escrowVault: process.env.NEXT_PUBLIC_ESCROW_VAULT || '',
    verifier: process.env.NEXT_PUBLIC_VERIFIER || '',
    synapseExchange: process.env.NEXT_PUBLIC_SYNAPSE_EXCHANGE || '',
    intentRouter: process.env.NEXT_PUBLIC_INTENT_ROUTER || '',
  };

  // Validate that all addresses are set
  const missing: string[] = [];
  Object.entries(addresses).forEach(([key, value]) => {
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.warn('⚠️  Missing contract addresses:', missing.join(', '));
    console.warn('   Please set the following environment variables:');
    missing.forEach(key => {
      const envVar = `NEXT_PUBLIC_${key.toUpperCase().replace(/([A-Z])/g, '_$1').slice(1)}`;
      console.warn(`   - ${envVar}`);
    });
  }

  return addresses;
};
