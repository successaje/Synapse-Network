'use client';

import { ReactNode, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { injected } from 'wagmi/connectors';
import '@rainbow-me/rainbowkit/styles.css';

// Configure chains for Somnia Testnet
import { somnia } from './chains';
import { ThemeProvider } from '@/components/ThemeProvider';

// Configure connectors
// RainbowKit requires a WalletConnect project ID
// Get one free at: https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// Use a default project ID for development (you should replace this with your own)
// For production, set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in your .env file
const effectiveProjectId = projectId || '21fef48091f12692cad42fb3196c6b8e'; // Temporary dev ID

const { connectors } = getDefaultWallets({
  appName: 'Synapse Network',
  projectId: effectiveProjectId,
  chains: [somnia],
});

const config = createConfig({
  chains: [somnia],
  connectors,
  transports: {
    [somnia.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by only rendering wagmi providers after mount
  if (!mounted) {
    return (
      <ThemeProvider>
        {children}
      </ThemeProvider>
    );
  }

  // Always render all providers - wagmi handles SSR internally with ssr: true
  return (
    <ThemeProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            modalSize="compact"
            initialChain={somnia}
            locale="en-US"
          >
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}

