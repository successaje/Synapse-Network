require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Helper to get accounts array
function getAccounts() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.warn("⚠️  WARNING: No PRIVATE_KEY found in environment variables!");
    console.warn("   Set PRIVATE_KEY in your .env file to deploy contracts.");
    return [];
  }
  // Remove '0x' prefix if present
  const key = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  return [key];
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    'somnia-testnet': {
      url: process.env.SOMNIA_TESTNET_RPC_URL || "https://dream-rpc.somnia.network",
      accounts: getAccounts(),
      chainId: 50312
    },
    somniaTestnet: {
      url: process.env.SOMNIA_TESTNET_RPC_URL || "https://dream-rpc.somnia.network",
      accounts: getAccounts(),
      chainId: 50312
    },
    somniaMainnet: {
      url: process.env.SOMNIA_MAINNET_RPC_URL || "https://rpc.somnia.network",
      accounts: getAccounts(),
      chainId: 5031
    },
    // Legacy alias for backward compatibility
    somnia: {
      url: process.env.SOMNIA_RPC_URL || "https://dream-rpc.somnia.network",
      accounts: getAccounts(),
      chainId: 50312
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  etherscan: {
    apiKey: {
      'somnia-testnet': process.env.SOMNIA_EXPLORER_API_KEY || 'empty',
      somniaTestnet: process.env.SOMNIA_EXPLORER_API_KEY || 'empty', // Alias for backward compatibility
    },
    customChains: [
      {
        network: "somnia-testnet",
        chainId: 50312,
        urls: {
          apiURL: "https://somnia.w3us.site/api",
          browserURL: "https://somnia.w3us.site"
        }
      }
    ]
  }
};

