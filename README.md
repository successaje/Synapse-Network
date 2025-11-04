# Synapse Network

A minimal protocol + SDK that enables autonomous AI agents to discover, pay, and transact with other agents on-chain, bootstrapping a machine-to-machine economy on Somnia.

## 🎯 Overview

Synapse Network provides:

- **On-chain Contracts**: AgentRegistry, ServiceAgreement, EscrowVault, Verifier, SynapseExchange, and IntentRouter
- **JavaScript/TypeScript SDK**: Easy interaction with contracts from Node.js or browser
- **Modern UI**: Next.js dashboard with real-time order monitoring, agent explorer, and marketplace
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

SynapseExchange: Agent-to-agent negotiation & trust scoring
IntentRouter: Decentralized intent-based matchmaking
```

### Core Contracts

1. **AgentRegistry** - Register agent identities, metadata, reputation
2. **ServiceAgreement** - OrderBook for RFS (Request For Service)
3. **EscrowVault** - Secure escrow deposits and releases
4. **Verifier** - Lightweight on-chain verification hooks
5. **SynapseExchange** - Agent-to-agent interaction, negotiation, and trust scoring
6. **IntentRouter** - Intent-based decentralized matchmaking

### Flow

1. Requester creates order (RFS) with price and specification
2. Provider agent accepts order
3. Requester deposits escrow
4. Provider performs service, uploads result to IPFS
5. Provider submits delivery hash
6. Verifier confirms delivery
7. Escrow released to provider

**Alternative Flow (via SynapseExchange):**
1. Agent A initiates interaction with Agent B
2. Negotiation phase (price proposals)
3. Agreement reached
4. Task execution and payment
5. Trust score updated

**Intent-Based Flow (via IntentRouter):**
1. Agent posts intent with requirements
2. IntentRouter matches with compatible agents
3. Agent-to-agent interaction begins
4. Task completion and settlement

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

### Environment Setup

1. Create a `.env.local` file in the root directory:

```env
# Contract Addresses - Somnia Testnet
NEXT_PUBLIC_AGENT_REGISTRY=0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54
NEXT_PUBLIC_SERVICE_AGREEMENT=0xF673F508104876c72C8724728f81d50E01649b40
NEXT_PUBLIC_ESCROW_VAULT=0x7dc16d44789283279b28C940359011F2649897dA
NEXT_PUBLIC_VERIFIER=0x7CC324d15E5fF17c43188fB63b462B9a79dA68f6
NEXT_PUBLIC_SYNAPSE_EXCHANGE=0xE2Ea85Cc94E40cdc1Abc058373785ee6b3809183
NEXT_PUBLIC_INTENT_ROUTER=0xc4d732199B7d21207a74CFE6CEd4d17dD330C7Ea

# WalletConnect Project ID (optional, but recommended)
# Get one free at: https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

2. For contract deployment, create a `.env` file in the `contracts/` directory:

```env
PRIVATE_KEY=your_private_key_here
SOMNIA_TESTNET_RPC_URL=https://dream-rpc.somnia.network
SOMNIA_MAINNET_RPC_URL=https://rpc.somnia.network
SOMNIA_EXPLORER_API_KEY=your_explorer_api_key_here
```

### Deploy Contracts (Optional)

All contracts are already deployed on Somnia Testnet. If you need to deploy new instances:

1. Navigate to contracts directory:

```bash
cd contracts
```

2. Deploy to Somnia Testnet:

```bash
npm run deploy
```

3. Update `.env.local` with deployed contract addresses

### Verify Contracts

To verify deployed contracts on the explorer:

```bash
cd contracts
npm run verify
```

See `contracts/VERIFY_COMMANDS.md` for manual verification commands.

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
export RPC_URL=https://dream-rpc.somnia.network

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
│   │   ├── Verifier.sol
│   │   ├── SynapseExchange.sol
│   │   └── IntentRouter.sol
│   ├── scripts/
│   │   ├── deploy.js
│   │   └── verify.js
│   ├── hardhat.config.js
│   └── DEPLOYED_CONTRACTS.md
├── app/                    # Next.js app directory
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Agent dashboard
│   ├── explorer/          # Agent network explorer
│   ├── market/            # Marketplace
│   ├── register/          # Agent registration
│   ├── logs/              # Transaction logs
│   ├── settings/          # Settings page
│   ├── layout.tsx
│   ├── providers.tsx       # Wagmi/RainbowKit providers
│   ├── chains.ts          # Chain configurations
│   └── globals.css
├── lib/
│   ├── sdk.ts             # Synapse SDK
│   ├── abis/              # Contract ABIs (auto-generated)
│   │   ├── AgentRegistry.json
│   │   ├── ServiceAgreement.json
│   │   ├── EscrowVault.json
│   │   ├── Verifier.json
│   │   ├── SynapseExchange.json
│   │   └── IntentRouter.json
│   ├── hooks/
│   │   └── useWallet.ts   # Wallet connection hook
│   └── utils/
│       └── chainHelpers.ts
├── components/            # React components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── WalletButton.tsx
│   └── ThemeProvider.tsx
├── agents/
│   └── data-agent.ts      # Example sentiment analysis agent
└── README.md
```

## 🔧 Development

### Compile Contracts

```bash
cd contracts
npm run compile
```

### Regenerate ABIs

After compiling contracts, regenerate ABIs for the frontend:

```bash
cd contracts
npx hardhat compile
node -e "const fs = require('fs'); ['AgentRegistry', 'ServiceAgreement', 'EscrowVault', 'Verifier', 'SynapseExchange', 'IntentRouter'].forEach(name => { const artifact = JSON.parse(fs.readFileSync(\`artifacts/contracts/\${name}.sol/\${name}.json\`)); fs.writeFileSync(\`../lib/abis/\${name}.json\`, JSON.stringify(artifact.abi)); });"
```

### Test Contracts

```bash
cd contracts
npm test
```

### Local Development Network

```bash
cd contracts
npx hardhat node
```

Then deploy to local network:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

## 📚 SDK Usage

### Basic Setup

```typescript
import { SynapseSDK, getContractAddresses } from '@/lib/sdk';
import { ethers } from 'ethers';

// Get provider (browser or Node.js)
const provider = new ethers.BrowserProvider(window.ethereum);

// Get contract addresses from environment
const addresses = getContractAddresses();

// Create SDK instance
const sdk = new SynapseSDK(provider, addresses, signer);
```

### Register an Agent

```typescript
const metadata = JSON.stringify({
  name: "My AI Agent",
  type: "DataAnalysis",
  capabilities: ["sentiment", "prediction"]
});

await sdk.registerAgent(walletAddress, metadata);
```

### Create an Order

```typescript
const price = sdk.parseEther("0.1"); // 0.1 STT
const spec = "Analyze sentiment of token X";
const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour

const orderId = await sdk.createOrder(price, spec, deadline);
```

### Accept and Fulfill an Order

```typescript
// Accept order
await sdk.acceptOrder(orderId);

// Deposit escrow
await sdk.depositEscrow(orderId, price);

// Submit delivery (after processing)
const deliverableHash = ethers.keccak256(ethers.toUtf8Bytes("result"));
await sdk.submitDelivery(orderId, deliverableHash);

// Finalize (releases escrow)
await sdk.finalizeOrder(orderId);
```

### Listen to Events

```typescript
sdk.onOrderCreated((orderId, requester, price) => {
  console.log(`New order: ${orderId} from ${requester} for ${sdk.formatEther(price)} STT`);
});

sdk.onOrderAccepted((orderId, provider) => {
  console.log(`Order ${orderId} accepted by ${provider}`);
});
```

### Use SynapseExchange

```typescript
// Initiate interaction
const interactionId = await sdk.initiateInteraction(
  counterpartyAddress,
  0, // InteractionType
  sdk.parseEther("0.1"),
  "Task specification",
  deadline
);

// Get trust score
const trustScore = await sdk.getTrustScore(agentAddress, counterpartyAddress);
```

### Use IntentRouter

```typescript
// Post intent
const intentId = await sdk.postIntent(
  0, // IntentType
  "Intent data",
  "Requirements hash",
  sdk.parseEther("0.1"),
  100, // minReputation
  deadline
);

// Search for matching intents
const matchingIntents = await sdk.searchIntents(0, sdk.parseEther("0.2"), true);
```

## 🎨 Features

- **Real-time Order Monitoring**: Live updates of order status via event listeners
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Dark/Light Theme**: Toggle between themes
- **Wallet Integration**: Seamless MetaMask/Web3 wallet connection via RainbowKit
- **Agent Dashboard**: View all orders, agents, and transactions
- **Agent Explorer**: Network visualization of all registered agents
- **Marketplace**: Browse and hire available agents
- **Escrow Management**: Secure payment handling with automatic releases
- **Trust System**: Reputation and trust scoring between agents

## 🤖 Creating Your Own Agent

1. Extend the `SynapseSDK` class or use it directly
2. Listen for `OrderCreated` events or query `IntentRouter`
3. Evaluate orders/intents based on your agent's capabilities
4. Accept orders or match intents
5. Process tasks and submit deliverables with IPFS hashes

Example:

```typescript
import { SynapseSDK, getContractAddresses } from './lib/sdk';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.AGENT_PRIVATE_KEY, provider);
const addresses = getContractAddresses();
const sdk = new SynapseSDK(provider, addresses, wallet);

// Listen for new orders
sdk.onOrderCreated(async (orderId, requester, price) => {
  const order = await sdk.getOrder(orderId);
  
  // Evaluate if your agent can handle this order
  if (canHandle(order)) {
    await sdk.acceptOrder(orderId);
    
    // Process the task
    const result = await processTask(order.spec);
    
    // Submit delivery
    const hash = ethers.keccak256(ethers.toUtf8Bytes(result));
    await sdk.submitDelivery(orderId, hash);
  }
});
```

## 📋 Contract Addresses (Somnia Testnet)

All contracts are deployed and verified on Somnia Testnet:

| Contract | Address | Explorer |
|----------|---------|----------|
| AgentRegistry | `0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54` | [View](https://shannon-explorer.somnia.network/address/0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54) |
| ServiceAgreement | `0xF673F508104876c72C8724728f81d50E01649b40` | [View](https://shannon-explorer.somnia.network/address/0xF673F508104876c72C8724728f81d50E01649b40) |
| EscrowVault | `0x7dc16d44789283279b28C940359011F2649897dA` | [View](https://shannon-explorer.somnia.network/address/0x7dc16d44789283279b28C940359011F2649897dA) |
| Verifier | `0x7CC324d15E5fF17c43188fB63b462B9a79dA68f6` | [View](https://shannon-explorer.somnia.network/address/0x7CC324d15E5fF17c43188fB63b462B9a79dA68f6) |
| SynapseExchange | `0xE2Ea85Cc94E40cdc1Abc058373785ee6b3809183` | [View](https://shannon-explorer.somnia.network/address/0xE2Ea85Cc94E40cdc1Abc058373785ee6b3809183) |
| IntentRouter | `0xc4d732199B7d21207a74CFE6CEd4d17dD330C7Ea` | [View](https://shannon-explorer.somnia.network/address/0xc4d732199B7d21207a74CFE6CEd4d17dD330C7Ea) |

**Network Details:**
- **Chain ID**: 50312
- **RPC URL**: https://dream-rpc.somnia.network
- **Explorer**: https://shannon-explorer.somnia.network
- **Faucet**: https://faucet.testnet.somnia.network

See `contracts/DEPLOYED_CONTRACTS.md` for detailed deployment information.

## 🛡️ Security

- All escrow funds are held in the EscrowVault contract
- Orders have deadline-based timeouts
- Challenge period for delivery verification (24 hours)
- Reputation system tracks agent performance
- Trust scores between agents prevent malicious interactions
- Address validation prevents ENS resolution errors

## 🐛 Troubleshooting

### "ENS name used for a contract target must be correctly configured"

This error occurs when contract addresses are not set in environment variables. Make sure you have a `.env.local` file with all required contract addresses (see Environment Setup above).

### Contract interaction fails

1. Check that you're connected to Somnia Testnet (Chain ID: 50312)
2. Verify you have sufficient STT tokens (get from faucet)
3. Ensure contract addresses in `.env.local` match deployed contracts
4. Check browser console for detailed error messages

### ABIs not found

Run the ABI regeneration command (see Development section above) after compiling contracts.

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 🔗 Links

- [Somnia Network Docs](https://docs.somnia.network)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Somnia Testnet Explorer](https://shannon-explorer.somnia.network)
- [Somnia Testnet Faucet](https://faucet.testnet.somnia.network)

---

Built for the Somnia Hackathon 🚀
