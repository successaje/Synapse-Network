# Deployed Contracts - Somnia Testnet

**Network:** Somnia Testnet (Chain ID: 50312)  
**Explorer:** https://shannon-explorer.somnia.network/  
**Deployer:** `0x60eF148485C2a5119fa52CA13c52E9fd98F28e87`  
**Deployment Date:** November 2024

## ✅ All Contracts Deployed

All 6 contracts have been successfully deployed and configured on Somnia Testnet.

## Contract Addresses

### 1. AgentRegistry
- **Address:** `0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54`
- **Explorer:** [View on Explorer](https://shannon-explorer.somnia.network/address/0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54)
- **Status:** ✅ Deployed
- **Verification:** ⏳ Pending (Manual verification required)
- **Constructor Args:** None
- **Description:** Manages agent registration, metadata, and reputation tracking

### 2. ServiceAgreement
- **Address:** `0xF673F508104876c72C8724728f81d50E01649b40`
- **Explorer:** [View on Explorer](https://shannon-explorer.somnia.network/address/0xF673F508104876c72C8724728f81d50E01649b40)
- **Status:** ✅ Deployed
- **Verification:** ⏳ Pending (Manual verification required)
- **Constructor Args:** `0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54`
- **Description:** Handles order creation (RFS), acceptance, delivery submission, and finalization

### 3. Verifier
- **Address:** `0x7CC324d15E5fF17c43188fB63b462B9a79dA68f6`
- **Explorer:** [View on Explorer](https://shannon-explorer.somnia.network/address/0x7CC324d15E5fF17c43188fB63b462B9a79dA68f6)
- **Status:** ✅ Deployed
- **Verification:** ⏳ Pending (Manual verification required)
- **Constructor Args:** `0xF673F508104876c72C8724728f81d50E01649b40`
- **Description:** Lightweight on-chain verification hooks for deliverable hashes

### 4. EscrowVault
- **Address:** `0x7dc16d44789283279b28C940359011F2649897dA`
- **Explorer:** [View on Explorer](https://shannon-explorer.somnia.network/address/0x7dc16d44789283279b28C940359011F2649897dA)
- **Deployment TX:** [View Transaction](https://shannon-explorer.somnia.network/tx/0xcd442c422802d56d7edc3ae40f78fff191bcf2634e581d7c5dd8bd012080fcfc)
- **Status:** ✅ Deployed
- **Verification:** ⏳ Pending (Manual verification required)
- **Constructor Args:** `0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54, 0xF673F508104876c72C8724728f81d50E01649b40, 0x7CC324d15E5fF17c43188fB63b462B9a79dA68f6`
- **Description:** Manages escrow deposits, releases, and refunds for orders

### 5. SynapseExchange
- **Address:** `0xE2Ea85Cc94E40cdc1Abc058373785ee6b3809183`
- **Explorer:** [View on Explorer](https://shannon-explorer.somnia.network/address/0xE2Ea85Cc94E40cdc1Abc058373785ee6b3809183)
- **Deployment TX:** [View Transaction](https://shannon-explorer.somnia.network/tx/0x351958661ce6436426607f9a82ef61862c55a38fc956167973cc79bb1e6f3fbb)
- **Status:** ✅ Deployed
- **Verification:** ⏳ Pending (Manual verification required)
- **Constructor Args:** `0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54`
- **Description:** Facilitates negotiation, task payment, and trust scoring between agents

### 6. IntentRouter
- **Address:** `0xc4d732199B7d21207a74CFE6CEd4d17dD330C7Ea`
- **Explorer:** [View on Explorer](https://shannon-explorer.somnia.network/address/0xc4d732199B7d21207a74CFE6CEd4d17dD330C7Ea)
- **Deployment TX:** [View Transaction](https://shannon-explorer.somnia.network/tx/0x80b5c70dbb9d62cd328609c7249d7135c2e71960dadbc3c86203d9fcac346c9f)
- **Status:** ✅ Deployed
- **Verification:** ⏳ Pending (Manual verification required)
- **Constructor Args:** `0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54`
- **Description:** Routes agent intents through decentralized matchmaking

## Cross-Reference Setup Transactions

All contracts have been properly linked:

- **EscrowVault → AgentRegistry:** [TX](https://shannon-explorer.somnia.network/tx/0x7e3759e6b43f254aa7ef7660c791869dd17d845e0da100e049b0be77acf243bb)
- **ServiceAgreement → AgentRegistry:** [TX](https://shannon-explorer.somnia.network/tx/0xc3bbf2a4a8f85c2687833e00e776b95956dd34aca5e2e148eb771c10b337e6bc)
- **EscrowVault → ServiceAgreement:** [TX](https://shannon-explorer.somnia.network/tx/0x7e1bdc8dfb7431ab4a96e80ec775ceeae06f96108ba57a2b6641223516a5f76c)

## Environment Variables

Add these to your `.env` file:

```env
# Contract Addresses - Somnia Testnet
NEXT_PUBLIC_AGENT_REGISTRY=0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54
NEXT_PUBLIC_SERVICE_AGREEMENT=0xF673F508104876c72C8724728f81d50E01649b40
NEXT_PUBLIC_ESCROW_VAULT=0x7dc16d44789283279b28C940359011F2649897dA
NEXT_PUBLIC_VERIFIER=0x7CC324d15E5fF17c43188fB63b462B9a79dA68f6
NEXT_PUBLIC_SYNAPSE_EXCHANGE=0xE2Ea85Cc94E40cdc1Abc058373785ee6b3809183
NEXT_PUBLIC_INTENT_ROUTER=0xc4d732199B7d21207a74CFE6CEd4d17dD330C7Ea
```

## Contract Verification

**Status:** ⏳ Contracts are not yet verified on the explorer.

**Important:** The Shannon Explorer does not currently support automated contract verification via the Hardhat verify plugin. The explorer's API endpoint is not accessible for programmatic verification.

### Manual Verification Required

Contracts must be verified manually through the Shannon Explorer UI. Follow these steps for each contract:

#### Steps for Manual Verification:

1. **Visit the contract address** on [Shannon Explorer](https://shannon-explorer.somnia.network)
2. **Click on the "Contract" tab**
3. **Click "Verify and Publish"** (or similar verification button)
4. **Upload the source code** from `contracts/contracts/ContractName.sol`
5. **Provide constructor arguments** (see table below)

#### Constructor Arguments for Each Contract:

| Contract | Constructor Arguments |
|----------|----------------------|
| **AgentRegistry** | None (empty) |
| **ServiceAgreement** | `["0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54"]` |
| **Verifier** | `["0xF673F508104876c72C8724728f81d50E01649b40"]` |
| **EscrowVault** | `["0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54", "0xF673F508104876c72C8724728f81d50E01649b40", "0x7CC324d15E5fF17c43188fB63b462B9a79dA68f6"]` |
| **SynapseExchange** | `["0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54"]` |
| **IntentRouter** | `["0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54"]` |

#### Compiler Settings:

When verifying, use these compiler settings:
- **Compiler Version:** `0.8.24`
- **Optimization:** Enabled
- **Runs:** `200`
- **EVM Version:** Default (or as specified in hardhat.config.js)

### Verification Links

Quick links to verify each contract:

- [AgentRegistry](https://shannon-explorer.somnia.network/address/0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54) - No constructor args
- [ServiceAgreement](https://shannon-explorer.somnia.network/address/0xF673F508104876c72C8724728f81d50E01649b40) - Constructor: `0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54`
- [Verifier](https://shannon-explorer.somnia.network/address/0x7CC324d15E5fF17c43188fB63b462B9a79dA68f6) - Constructor: `0xF673F508104876c72C8724728f81d50E01649b40`
- [EscrowVault](https://shannon-explorer.somnia.network/address/0x7dc16d44789283279b28C940359011F2649897dA) - Constructor: `0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54, 0xF673F508104876c72C8724728f81d50E01649b40, 0x7CC324d15E5fF17c43188fB63b462B9a79dA68f6`
- [SynapseExchange](https://shannon-explorer.somnia.network/address/0xE2Ea85Cc94E40cdc1Abc058373785ee6b3809183) - Constructor: `0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54`
- [IntentRouter](https://shannon-explorer.somnia.network/address/0xc4d732199B7d21207a74CFE6CEd4d17dD330C7Ea) - Constructor: `0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54`

### Automated Verification

The Hardhat verification plugin is now configured with the correct API endpoint. You can verify contracts automatically:

```bash
cd contracts
npm run verify
```

Or verify individual contracts manually:

```bash
# AgentRegistry (no constructor args)
npx hardhat verify --network somnia-testnet 0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54 --contract contracts/AgentRegistry.sol:AgentRegistry

# ServiceAgreement
npx hardhat verify --network somnia-testnet 0xF673F508104876c72C8724728f81d50E01649b40 "0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54" --contract contracts/ServiceAgreement.sol:ServiceAgreement

# Verifier
npx hardhat verify --network somnia-testnet 0x7CC324d15E5fF17c43188fB63b462B9a79dA68f6 "0xF673F508104876c72C8724728f81d50E01649b40" --contract contracts/Verifier.sol:Verifier

# EscrowVault
npx hardhat verify --network somnia-testnet 0x7dc16d44789283279b28C940359011F2649897dA "0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54" "0xF673F508104876c72C8724728f81d50E01649b40" "0x7CC324d15E5fF17c43188fB63b462B9a79dA68f6" --contract contracts/EscrowVault.sol:EscrowVault

# SynapseExchange
npx hardhat verify --network somnia-testnet 0xE2Ea85Cc94E40cdc1Abc058373785ee6b3809183 "0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54" --contract contracts/SynapseExchange.sol:SynapseExchange

# IntentRouter
npx hardhat verify --network somnia-testnet 0xc4d732199B7d21207a74CFE6CEd4d17dD330C7Ea "0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54" --contract contracts/IntentRouter.sol:IntentRouter
```

**Note:** The API endpoint is configured as `https://somnia.w3us.site/api` and the network name is `somnia-testnet`.

## Contract Dependencies

```
AgentRegistry (standalone)
    ↓
ServiceAgreement → AgentRegistry
    ↓
Verifier → ServiceAgreement
    ↓
EscrowVault → AgentRegistry, ServiceAgreement, Verifier
    ↓
SynapseExchange → AgentRegistry
    ↓
IntentRouter → AgentRegistry
```

## Network Configuration

- **Chain ID:** 50312
- **RPC URL:** https://dream-rpc.somnia.network
- **Explorer:** https://shannon-explorer.somnia.network
- **Native Token:** STT (Somnia Testnet)
- **Faucet:** https://faucet.testnet.somnia.network

