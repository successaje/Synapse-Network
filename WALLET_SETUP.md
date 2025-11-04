# Wallet Connection Setup

## Quick Fix for Wallet Connection Issues

### Option 1: Get a Free WalletConnect Project ID (Recommended)

1. Go to https://cloud.walletconnect.com
2. Sign up for a free account
3. Create a new project
4. Copy your Project ID
5. Add it to your `.env` file:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### Option 2: Use the Temporary Development ID

The app is currently configured with a temporary development WalletConnect project ID. This should work for basic testing, but you should get your own for production.

### Troubleshooting

**If the wallet doesn't connect:**

1. **Check your browser console** for any errors
2. **Make sure MetaMask (or another wallet) is installed** and unlocked
3. **Check if the wallet is on the correct network** - The app will prompt you to switch to Somnia Testnet (Chain ID: 50312)
4. **Add Somnia Testnet manually if needed:**
   - Network Name: Somnia Testnet
   - RPC URL: https://dream-rpc.somnia.network
   - Chain ID: 50312
   - Currency Symbol: STT
   - Block Explorer: https://somnia-testnet.socialscan.io

**If you see "Wrong network" error:**
- The app will automatically prompt you to switch to Somnia Testnet
- Click the network button in the wallet connection UI
- Or manually switch your wallet to Somnia Testnet

### Testing the Connection

1. Click "Connect Wallet" in the navbar
2. Select your wallet (MetaMask, etc.)
3. Approve the connection request
4. Approve the network switch if prompted
5. Your wallet address should appear in the navbar

### Supported Wallets

- MetaMask (injected wallet)
- WalletConnect-compatible wallets (with project ID)
- Coinbase Wallet (with project ID)
- Other injected Ethereum wallets

