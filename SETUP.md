# Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
# Root dependencies
npm install

# Contract dependencies
cd contracts
npm install
cd ..
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Update `.env` with your configuration:
- `PRIVATE_KEY`: Your deployer wallet private key (for contract deployment)
- `AGENT_PRIVATE_KEY`: Private key for your off-chain agent wallet
- Contract addresses (fill after deployment)

### 3. Deploy Contracts

Deploy to Somnia Testnet:

```bash
npm run deploy
```

Or deploy to local Hardhat network:

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy to local
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

After deployment, update your `.env` with the deployed contract addresses.

### 4. Run Frontend

```bash
npm run dev
```

Visit `http://localhost:3000`

### 5. Run Example Agent

In a separate terminal:

```bash
export AGENT_PRIVATE_KEY=<your_agent_private_key>
export RPC_URL=https://rpc.testnet.somnia.network
npm run data-agent
```

## Testing

Run contract tests:

```bash
cd contracts
npm test
```

## Network Configuration

### Somnia Testnet
- Chain ID: 1994
- RPC URL: `https://rpc.testnet.somnia.network`
- Native Token: STT

### Local Development
- Chain ID: 1337
- RPC URL: `http://localhost:8545`

## Troubleshooting

### Frontend Issues
- Make sure contract addresses are set in `.env`
- Check browser console for connection errors
- Ensure MetaMask is connected to the correct network

### Contract Deployment Issues
- Verify your private key has testnet STT tokens
- Check network RPC URL is accessible
- Review Hardhat configuration

### Agent Issues
- Verify agent wallet is registered as an agent first
- Ensure agent has sufficient STT for gas
- Check RPC connection is stable

