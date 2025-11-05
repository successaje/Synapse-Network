'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWalletClient, usePublicClient } from 'wagmi';

// Helper to convert viem wallet client to ethers signer
// Since viem and ethers use different transport types, we use window.ethereum
// when wagmi is connected via injected connector
function walletClientToSigner(walletClient: any) {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Window ethereum not available');
  }
  const { account, chain } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new ethers.BrowserProvider(window.ethereum, network);
  return provider.getSigner(account.address);
}

// Helper to convert viem public client to ethers provider
function publicClientToProvider(publicClient: any) {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Window ethereum not available');
  }
  const { chain } = publicClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  return new ethers.BrowserProvider(window.ethereum, network);
}

export function useWallet() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Get wagmi hooks
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // Update provider and signer from wagmi when available
  useEffect(() => {
    if (walletClient && publicClient && walletClient.account) {
      const setupEthers = async () => {
        try {
          const ethersProvider = publicClientToProvider(publicClient);
          const ethersSignerPromise = walletClientToSigner(walletClient);
          const ethersSigner = await ethersSignerPromise;
          
          // Verify signer is ready
          const accountAddress = walletClient.account?.address;
          if (!accountAddress) {
            console.error('Wallet account address not available');
            return;
          }
          
          // Verify we can get the address from the signer
          await ethersSigner.getAddress();
          
          setProvider(ethersProvider);
          setSigner(ethersSigner);
          setAddress(accountAddress);
          setIsConnected(true);
          setIsConnecting(false);
        } catch (error) {
          console.error('Error converting wagmi client to ethers:', error);
          // Fall through to direct connection
        }
      };
      
      setupEthers();
    } else if (typeof window !== 'undefined' && window.ethereum) {
      // Fallback to direct MetaMask connection if wagmi is not connected
      const checkConnection = async () => {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connect();
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      };
      checkConnection();
    }
  }, [walletClient, publicClient]);

  const connect = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet');
      return;
    }

    setIsConnecting(true);
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      await browserProvider.send('eth_requestAccounts', []);
      const browserSigner = await browserProvider.getSigner();
      const walletAddress = await browserSigner.getAddress();

      setProvider(browserProvider);
      setSigner(browserSigner);
      setAddress(walletAddress);
      setIsConnected(true);

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          connect();
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setIsConnected(false);
  };

  return {
    provider,
    signer,
    address,
    isConnected,
    isConnecting,
    connect,
    disconnect,
  };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

