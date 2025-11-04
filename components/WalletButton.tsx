'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { somnia } from '@/app/chains';

export function WalletButton() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Auto-switch to Somnia Testnet if connected to wrong chain
    if (isConnected && chainId !== somnia.id && switchChain) {
      const timer = setTimeout(() => {
        try {
          switchChain({ chainId: somnia.id });
        } catch (error) {
          console.error('Failed to switch chain:', error);
        }
      }, 500); // Small delay to avoid race conditions
      return () => clearTimeout(timer);
    }
  }, [isConnected, chainId, switchChain]);

  if (!mounted) {
    return (
      <div className="px-4 py-2 bg-gray-600 rounded-lg font-rajdhani font-semibold text-sm animate-pulse">
        Loading...
      </div>
    );
  }

  return (
    <ConnectButton
      showBalance={false}
      chainStatus="icon"
      accountStatus="address"
    />
  );
}

