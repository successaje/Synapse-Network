'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWalletClient, usePublicClient, useAccount } from 'wagmi';

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
  const { isConnected: wagmiConnected, address: wagmiAddress } = useAccount();

  // Update provider and signer from wagmi when available
  useEffect(() => {
    if (walletClient && publicClient && walletClient.account) {
      const setupEthers = async () => {
        setIsConnecting(true);
        try {
          const accountAddress = walletClient.account?.address;
          if (!accountAddress) {
            console.error('Wallet account address not available');
            setIsConnecting(false);
            return;
          }
          
          // Set address immediately from wagmi
          setAddress(accountAddress);
          setIsConnected(true); // Mark as connected
          
          // Try to set up ethers provider and signer
          try {
            const ethersProvider = publicClientToProvider(publicClient);
            const ethersSignerPromise = walletClientToSigner(walletClient);
            const ethersSigner = await ethersSignerPromise;
            
            // Verify we can get the address from the signer
            await ethersSigner.getAddress();
            
            setProvider(ethersProvider);
            setSigner(ethersSigner);
            setIsConnecting(false);
          } catch (error) {
            console.error('Error setting up ethers signer:', error);
            // Still mark as connected even if signer setup fails
            // Provider might still work for read operations
            try {
              const ethersProvider = publicClientToProvider(publicClient);
              setProvider(ethersProvider);
            } catch (providerError) {
              console.error('Error setting up provider:', providerError);
            }
            setIsConnecting(false);
          }
        } catch (error) {
          console.error('Error converting wagmi client to ethers:', error);
          setIsConnecting(false);
        }
      };
      
      setupEthers();
    } else if (wagmiConnected && wagmiAddress) {
      // Wagmi says connected but wallet client not ready yet
      // Set address and connected status immediately
      setAddress(wagmiAddress);
      setIsConnected(true);
      setIsConnecting(false);
      
      // Try to set up provider/signer if window.ethereum is available
      if (typeof window !== 'undefined' && window.ethereum) {
        const setupProvider = async () => {
          try {
            const browserProvider = new ethers.BrowserProvider(window.ethereum!);
            const browserSigner = await browserProvider.getSigner();
            setProvider(browserProvider);
            setSigner(browserSigner);
          } catch (error) {
            console.error('Error setting up provider from window.ethereum:', error);
          }
        };
        setupProvider();
      }
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
    } else {
      // Not connected
      setIsConnected(false);
      setIsConnecting(false);
    }
  }, [walletClient, publicClient, wagmiConnected, wagmiAddress]);

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

