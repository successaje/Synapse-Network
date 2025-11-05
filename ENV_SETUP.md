# Environment Variables Setup

This guide will help you set up the required environment variables for the Synapse Network frontend.

## Quick Setup

1. **Create `.env.local` file** in the root directory of the project:

```bash
touch .env.local
```

2. **Add the following content** to `.env.local`:

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

3. **Restart your Next.js dev server**:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Important Notes

- **File Location**: The `.env.local` file must be in the **root directory** (same level as `package.json`), not in the `app/` or `lib/` folders.

- **File Name**: Use `.env.local` (not `.env`). Next.js automatically loads `.env.local` files.

- **Restart Required**: After creating or modifying `.env.local`, you **must restart** your Next.js development server for changes to take effect.

- **Git**: `.env.local` is automatically ignored by git (it's in `.gitignore`), so your private keys won't be committed.

## Verification

After setting up `.env.local` and restarting the server, check the browser console. You should see:
- No errors about missing contract addresses
- The app should load without the "Contract address for AgentRegistry is not set" error

## Troubleshooting

### Error: "Contract address for AgentRegistry is not set"

1. **Check file location**: Make sure `.env.local` is in the root directory
2. **Check file name**: It should be `.env.local` (with the dot at the beginning)
3. **Check variable names**: They must start with `NEXT_PUBLIC_` prefix
4. **Restart server**: After creating/modifying `.env.local`, restart the dev server
5. **Check syntax**: Make sure there are no spaces around the `=` sign

### Environment variables not loading

1. Verify the file is named `.env.local` (not `.env`)
2. Make sure it's in the root directory
3. Restart the Next.js dev server completely
4. Check that variables start with `NEXT_PUBLIC_` (required for client-side access in Next.js)

### Still having issues?

Check the browser console for the exact error message. The SDK will now show which environment variables are missing and how to fix them.

## Alternative: Use Default Addresses

If you want to hardcode addresses for development, you can modify `lib/sdk.ts`:

```typescript
export const getContractAddresses = (): ContractAddresses => {
  return {
    agentRegistry: process.env.NEXT_PUBLIC_AGENT_REGISTRY || '0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54',
    serviceAgreement: process.env.NEXT_PUBLIC_SERVICE_AGREEMENT || '0xF673F508104876c72C8724728f81d50E01649b40',
    // ... etc
  };
};
```

**Note**: This is not recommended for production. Always use environment variables.


