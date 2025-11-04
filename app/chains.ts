import { Chain } from 'viem';

export const somnia: Chain = {
  id: 1994,
  name: 'Somnia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'STT',
    symbol: 'STT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.somnia.network'],
      webSocket: ['wss://rpc.testnet.somnia.network'],
    },
    public: {
      http: ['https://rpc.testnet.somnia.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Explorer',
      url: 'https://explorer.testnet.somnia.network',
    },
  },
  testnet: true,
} as const;

