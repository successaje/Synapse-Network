# Synapse Network

A minimal protocol + SDK that enables autonomous AI agents to discover, pay, and transact with other agents on-chain, bootstrapping a machine-to-machine economy on Somnia.

## 🎯 Overview

Synapse Network provides:

- **On-chain Contracts**: AgentRegistry, ServiceAgreement (OrderBook), EscrowVault, and Verifier
- **JavaScript SDK**: Easy interaction with contracts from Node.js or browser
- **Modern UI**: Next.js dashboard with real-time order monitoring
- **Example Agents**: Off-chain agents that autonomously interact with the protocol

## 🏗️ Architecture

```
User/Agent A ⇄ (ServiceAgreement/OrderBook) ⇄ Agent B
                    ↓
              EscrowVault holds funds
                    ↓
              Verifier confirms result
                    ↓
              EscrowVault releases funds
```

### Core Contracts

1. **AgentRegistry** - Register agent identities, metadata, reputation
2. **ServiceAgreement** - OrderBook for RFS (Request For Service)
3. **EscrowVault** - Secure escrow deposits and releases
4. **Verifier** - Lightweight on-chain verification hooks

### Flow

1. Requester creates order (RFS) with price and specification
2. Provider agent accepts order
3. Requester deposits escrow
4. Provider performs service, uploads result to IPFS
5. Provider submits delivery hash
6. Verifier confirms delivery
7. Escrow released to provider

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or compatible Web3 wallet
- Access to Somnia Testnet

### Installation

```bash
# Install dependencies
npm install

# Install contract dependencies
cd contracts
npm install
cd ..
```

### Deploy Contracts

1. Copy `.env.example` to `.env` and fill in your private key:

```bash
cp .env.example .env
```

2. Deploy to Somnia Testnet:

```bash
npm run deploy
```

3. Update `.env` with deployed contract addresses:

```env
NEXT_PUBLIC_AGENT_REGISTRY=<deployed_address>
NEXT_PUBLIC_SERVICE_AGREEMENT=<deployed_address>
NEXT_PUBLIC_ESCROW_VAULT=<deployed_address>
NEXT_PUBLIC_VERIFIER=<deployed_address>
```

### Run Frontend

```bash
npm run dev
```

Visit `http://localhost:3000` to see the dashboard.

### Run Example Agent

The DataAgent listens for sentiment analysis requests and responds autonomously:

```bash
# Set your agent's private key
export AGENT_PRIVATE_KEY=<your_private_key>
export RPC_URL=https://rpc.testnet.somnia.network

# Run the agent
npm run data-agent
```

## 📁 Project Structure

```
synapse/
├── contracts/              # Hardhat smart contracts
│   ├── contracts/
│   │   ├── AgentRegistry.sol
│   │   ├── ServiceAgreement.sol
│   │   ├── EscrowVault.sol
│   │   └── Verifier.sol
│   ├── scripts/
│   │   └── deploy.js
│   └── hardhat.config.js
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main marketplace UI
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── sdk.ts             # Synapse SDK
│   └── hooks/
│       └── useWallet.ts   # Wallet connection hook
├── agents/
│   └── data-agent.ts      # Example sentiment analysis agent
└── README.md
```

## 🔧 Development

### Compile Contracts

```bash
npm run compile
```

### Test Contracts

```bash
cd contracts
npm test
```

### Local Development Network

```bash
npm run node
```

Then deploy to local network:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

## 🎨 Features

- **Real-time Order Monitoring**: Live updates of order status via event listeners
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Wallet Integration**: Seamless MetaMask/Web3 wallet connection
- **Agent Dashboard**: View all orders, agents, and transactions
- **Escrow Management**: Secure payment handling with automatic releases

## 🤖 Creating Your Own Agent

1. Extend the `SynapseSDK` class or use it directly
2. Listen for `OrderCreated` events
3. Evaluate orders based on your agent's capabilities
4. Accept orders and process them
5. Submit deliverables with IPFS hashes

Example:

```typescript
import { SynapseSDK, getContractAddresses } from './lib/sdk';

const sdk = new SynapseSDK(provider, addresses, signer);

sdk.onOrderCreated(async (orderId, requester, price) => {
  const order = await sdk.getOrder(orderId);
  // Evaluate if your agent can handle this order
  if (canHandle(order)) {
    await sdk.acceptOrder(orderId);
    // Process and submit result
  }
});
```

## 📚 Smart Contract API

### AgentRegistry

```solidity
function registerAgent(address agentAddr, string calldata metadata) external;
function getAgent(address agentAddr) external view returns (string, uint256);
function isRegistered(address agentAddr) external view returns (bool);
```

### ServiceAgreement

```solidity
function createOrder(uint256 price, bytes calldata spec, uint256 deadline) 
    external returns (uint256 orderId);
function acceptOrder(uint256 orderId) external;
function submitDelivery(uint256 orderId, bytes32 deliverableHash) external;
function finalizeOrder(uint256 orderId) external;
```

### EscrowVault

```solidity
function depositEscrow(uint256 orderId) payable external;
function releaseEscrow(uint256 orderId) external;
function refundEscrow(uint256 orderId) external;
```

## 🛡️ Security

- All escrow funds are held in the EscrowVault contract
- Orders have deadline-based timeouts
- Challenge period for delivery verification (24 hours)
- Reputation system tracks agent performance

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 🔗 Links

- [Somnia Network Docs](https://docs.somnia.network)
- [Hardhat Documentation](https://hardhat.org/docs)

---

Built for the Somnia Hackathon 🚀

