import { Chain } from 'viem';

export const somniaTestnet: Chain = {
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Somnia Testnet',
    symbol: 'STT',
  },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network'],
    },
    public: {
      http: ['https://dream-rpc.somnia.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Shannon Explorer',
      url: 'https://shannon-explorer.somnia.network',
    },
  },
  testnet: true,
} as const;

export const somniaMainnet: Chain = {
  id: 5031,
  name: 'Somnia Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'SOMI',
    symbol: 'SOMI',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.somnia.network'],
    },
    public: {
      http: ['https://rpc.somnia.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Explorer',
      url: 'https://explorer.somnia.network',
    },
  },
  testnet: false,
} as const;

// Default export for backward compatibility (testnet)
export const somnia = somniaTestnet;

