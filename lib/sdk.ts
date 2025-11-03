import { ethers } from 'ethers';

// Contract ABIs (simplified - in production, import from artifacts)
const AGENT_REGISTRY_ABI = [
  "function registerAgent(address agentAddr, string calldata metadata) external",
  "function getAgent(address agentAddr) external view returns (string memory metadata, uint256 reputation)",
  "function isRegistered(address agentAddr) external view returns (bool)",
  "event AgentRegistered(address indexed agentAddr, string metadata, uint256 timestamp)",
];

const SERVICE_AGREEMENT_ABI = [
  "function createOrder(uint256 price, bytes calldata spec, uint256 deadline) external returns (uint256 orderId)",
  "function acceptOrder(uint256 orderId) external",
  "function submitDelivery(uint256 orderId, bytes32 deliverableHash) external",
  "function finalizeOrder(uint256 orderId) external",
  "function cancelOrder(uint256 orderId) external",
  "function getOrder(uint256 orderId) external view returns (tuple(address requester, address provider, uint256 price, bytes32 deliverableHash, uint256 deadline, uint8 status, bytes spec, uint256 createdAt, uint256 acceptedAt, uint256 deliveredAt))",
  "function getOrderCount() external view returns (uint256)",
  "event OrderCreated(uint256 indexed orderId, address indexed requester, uint256 price, bytes32 specHash, uint256 deadline)",
  "event OrderAccepted(uint256 indexed orderId, address indexed provider)",
  "event DeliverySubmitted(uint256 indexed orderId, address indexed provider, bytes32 deliverableHash)",
  "event OrderFinalized(uint256 indexed orderId)",
];

const ESCROW_VAULT_ABI = [
  "function depositEscrow(uint256 orderId) payable external",
  "function releaseEscrow(uint256 orderId) external",
  "function refundEscrow(uint256 orderId) external",
  "function getEscrow(uint256 orderId) external view returns (tuple(uint256 orderId, address requester, address provider, uint256 amount, bool deposited, bool released, bool refunded, uint256 depositedAt))",
  "event EscrowDeposited(uint256 indexed orderId, address indexed requester, uint256 amount)",
  "event EscrowReleased(uint256 indexed orderId, address indexed provider, uint256 amount)",
];

export interface ContractAddresses {
  agentRegistry: string;
  serviceAgreement: string;
  escrowVault: string;
  verifier: string;
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

export class SynapseSDK {
  private provider: ethers.Provider;
  private signer: ethers.Signer | null = null;
  private addresses: ContractAddresses;

  public agentRegistry: ethers.Contract;
  public serviceAgreement: ethers.Contract;
  public escrowVault: ethers.Contract;

  constructor(
    provider: ethers.Provider | ethers.BrowserProvider,
    addresses: ContractAddresses,
    signer?: ethers.Signer
  ) {
    this.provider = provider as ethers.Provider;
    this.addresses = addresses;
    if (signer) {
      this.signer = signer;
    }

    this.agentRegistry = new ethers.Contract(
      addresses.agentRegistry,
      AGENT_REGISTRY_ABI,
      signer || provider
    );

    this.serviceAgreement = new ethers.Contract(
      addresses.serviceAgreement,
      SERVICE_AGREEMENT_ABI,
      signer || provider
    );

    this.escrowVault = new ethers.Contract(
      addresses.escrowVault,
      ESCROW_VAULT_ABI,
      signer || provider
    );
  }

  async connectSigner(signer: ethers.Signer) {
    this.signer = signer;
    this.agentRegistry = this.agentRegistry.connect(signer);
    this.serviceAgreement = this.serviceAgreement.connect(signer);
    this.escrowVault = this.escrowVault.connect(signer);
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
    const tx = await this.serviceAgreement.submitDelivery(orderId, deliverableHash);
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

// Helper to get contract addresses (update with your deployed addresses)
export const getContractAddresses = (network: 'somnia' | 'hardhat' = 'somnia'): ContractAddresses => {
  // Default addresses - update after deployment
  if (network === 'hardhat') {
    return {
      agentRegistry: process.env.NEXT_PUBLIC_AGENT_REGISTRY || '',
      serviceAgreement: process.env.NEXT_PUBLIC_SERVICE_AGREEMENT || '',
      escrowVault: process.env.NEXT_PUBLIC_ESCROW_VAULT || '',
      verifier: process.env.NEXT_PUBLIC_VERIFIER || '',
    };
  }
  
  return {
    agentRegistry: process.env.NEXT_PUBLIC_AGENT_REGISTRY || '',
    serviceAgreement: process.env.NEXT_PUBLIC_SERVICE_AGREEMENT || '',
    escrowVault: process.env.NEXT_PUBLIC_ESCROW_VAULT || '',
    verifier: process.env.NEXT_PUBLIC_VERIFIER || '',
  };
};

