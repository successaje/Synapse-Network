'use client';

import { ReactNode, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { injected } from 'wagmi/connectors';
import '@rainbow-me/rainbowkit/styles.css';

// Configure chains for Somnia Testnet and Mainnet
import { somniaTestnet, somniaMainnet } from './chains';
import { ThemeProvider } from '@/components/ThemeProvider';

// Configure connectors
// RainbowKit requires a WalletConnect project ID
// Get one free at: https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// Use a default project ID for development (you should replace this with your own)
// For production, set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in your .env file
// Note: A 403 error when fetching remote config is harmless - it just means the default
// project ID doesn't have remote config enabled. Wallet connections will still work.
const effectiveProjectId = projectId || '21fef48091f12692cad42fb3196c6b8e'; // Temporary dev ID

const { connectors } = getDefaultWallets({
  appName: 'Synapse Network',
  projectId: effectiveProjectId,
});

const config = createConfig({
  chains: [somniaTestnet, somniaMainnet],
  connectors,
  transports: {
    [somniaTestnet.id]: http(),
    [somniaMainnet.id]: http(),
  },
  ssr: true,
});

// Create QueryClient outside component to prevent recreation on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// Suppress Reown/Web3Modal 403 errors (harmless - default project ID doesn't have remote config)
// This is done via a useEffect to avoid interfering with SSR

export function Providers({ children }: { children: ReactNode }) {
  // Suppress harmless Reown config 403 errors (only in browser)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const originalError = console.error;
    const errorHandler = (...args: any[]) => {
      // Only suppress specific Reown config errors
      const firstArg = args[0];
      if (firstArg && typeof firstArg === 'object' && 'cause' in firstArg) {
        const cause = (firstArg as any).cause;
        if (cause?.status === 403 && cause?.url?.includes('api.web3modal.org')) {
          return; // Suppress this specific 403 error
        }
      }
      // Also check string messages
      const message = String(firstArg || '');
      if (message.includes('Reown Config') && message.includes('403')) {
        return; // Suppress Reown 403 errors
      }
      originalError.apply(console, args);
    };
    
    console.error = errorHandler;
    
    return () => {
      console.error = originalError;
    };
  }, []);

  // Always render all providers - wagmi handles SSR internally with ssr: true
  // The conditional rendering was causing WagmiProviderNotFoundError
  return (
    <ThemeProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            modalSize="compact"
            initialChain={somniaTestnet}
            locale="en-US"
          >
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}

