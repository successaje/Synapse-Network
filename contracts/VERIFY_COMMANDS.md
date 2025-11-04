# Contract Verification Commands

Use these commands to verify each contract individually on Somnia Testnet.

## Network Configuration
- **Network:** `somnia-testnet`
- **Chain ID:** `50312`
- **API Endpoint:** `https://somnia.w3us.site/api`

## Verification Commands

### 1. AgentRegistry
No constructor arguments required.

```bash
npx hardhat verify --network somnia-testnet \
  0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54 \
  --contract contracts/AgentRegistry.sol:AgentRegistry
```

### 2. ServiceAgreement
Constructor argument: AgentRegistry address.

```bash
npx hardhat verify --network somnia-testnet \
  0xF673F508104876c72C8724728f81d50E01649b40 \
  "0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54" \
  --contract contracts/ServiceAgreement.sol:ServiceAgreement
```

### 3. Verifier
Constructor argument: ServiceAgreement address.

```bash
npx hardhat verify --network somnia-testnet \
  0x7CC324d15E5fF17c43188fB63b462B9a79dA68f6 \
  "0xF673F508104876c72C8724728f81d50E01649b40" \
  --contract contracts/Verifier.sol:Verifier
```

### 4. EscrowVault
Constructor arguments: AgentRegistry, ServiceAgreement, Verifier addresses.

```bash
npx hardhat verify --network somnia-testnet \
  0x7dc16d44789283279b28C940359011F2649897dA \
  "0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54" \
  "0xF673F508104876c72C8724728f81d50E01649b40" \
  "0x7CC324d15E5fF17c43188fB63b462B9a79dA68f6" \
  --contract contracts/EscrowVault.sol:EscrowVault
```

### 5. SynapseExchange
Constructor argument: AgentRegistry address.

```bash
npx hardhat verify --network somnia-testnet \
  0xE2Ea85Cc94E40cdc1Abc058373785ee6b3809183 \
  "0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54" \
  --contract contracts/SynapseExchange.sol:SynapseExchange
```

### 6. IntentRouter
Constructor argument: AgentRegistry address.

```bash
npx hardhat verify --network somnia-testnet \
  0xc4d732199B7d21207a74CFE6CEd4d17dD330C7Ea \
  "0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54" \
  --contract contracts/IntentRouter.sol:IntentRouter
```

## Verify All Contracts (Automated)

Run the verification script to verify all contracts automatically:

```bash
cd contracts
npm run verify
```

## Verification Order

Contracts can be verified in any order since verification is independent. However, for reference, the deployment order was:

1. AgentRegistry (no dependencies)
2. ServiceAgreement (depends on AgentRegistry)
3. Verifier (depends on ServiceAgreement)
4. EscrowVault (depends on AgentRegistry, ServiceAgreement, Verifier)
5. SynapseExchange (depends on AgentRegistry)
6. IntentRouter (depends on AgentRegistry)

## Troubleshooting

If verification fails:
- Ensure you're in the `contracts` directory
- Check that the contract source files exist in `contracts/contracts/`
- Verify the network configuration in `hardhat.config.js`
- Make sure the API endpoint `https://somnia.w3us.site/api` is accessible
- Try verifying one contract at a time to isolate issues

## Contract Addresses Summary

| Contract | Address | Constructor Args |
|----------|---------|------------------|
| AgentRegistry | `0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54` | None |
| ServiceAgreement | `0xF673F508104876c72C8724728f81d50E01649b40` | `0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54` |
| Verifier | `0x7CC324d15E5fF17c43188fB63b462B9a79dA68f6` | `0xF673F508104876c72C8724728f81d50E01649b40` |
| EscrowVault | `0x7dc16d44789283279b28C940359011F2649897dA` | `0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54, 0xF673F508104876c72C8724728f81d50E01649b40, 0x7CC324d15E5fF17c43188fB63b462B9a79dA68f6` |
| SynapseExchange | `0xE2Ea85Cc94E40cdc1Abc058373785ee6b3809183` | `0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54` |
| IntentRouter | `0xc4d732199B7d21207a74CFE6CEd4d17dD330C7Ea` | `0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54` |

