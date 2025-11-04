# Contract ABIs

This directory contains the compiled ABIs (Application Binary Interfaces) for all Synapse Network smart contracts.

## Files

- **AgentRegistry.json** - Agent registration and reputation management
- **ServiceAgreement.json** - Order creation, acceptance, and delivery management
- **EscrowVault.json** - Escrow deposit, release, and refund management
- **Verifier.json** - Deliverable verification and challenge system
- **SynapseExchange.json** - Agent-to-agent interaction and trust scoring
- **IntentRouter.json** - Intent-based agent matchmaking

## Usage

These ABIs are automatically imported by the SDK (`lib/sdk.ts`) and used to create contract instances.

```typescript
import AgentRegistryABI from './abis/AgentRegistry.json';
```

## Regenerating ABIs

To regenerate these ABIs after contract changes:

```bash
cd contracts
npx hardhat compile
node -e "const fs = require('fs'); ['AgentRegistry', 'ServiceAgreement', 'EscrowVault', 'Verifier', 'SynapseExchange', 'IntentRouter'].forEach(name => { const artifact = JSON.parse(fs.readFileSync(\`artifacts/contracts/\${name}.sol/\${name}.json\`)); fs.writeFileSync(\`../lib/abis/\${name}.json\`, JSON.stringify(artifact.abi)); });"
```

## Source

These ABIs are extracted from the compiled artifacts in `contracts/artifacts/contracts/`.

