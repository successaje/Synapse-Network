/**
 * Helper functions for chain management
 */

export async function switchToSomniaNetwork() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No wallet found');
  }

  const chainId = '0x7CA'; // 1994 in hex
  const chainIdDecimal = 1994;

  try {
    // Try to switch to the chain
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        // Add the chain
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId,
              chainName: 'Somnia Testnet',
              nativeCurrency: {
                name: 'STT',
                symbol: 'STT',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.testnet.somnia.network'],
              blockExplorerUrls: ['https://explorer.testnet.somnia.network'],
            },
          ],
        });
      } catch (addError) {
        throw new Error('Failed to add Somnia Testnet to wallet');
      }
    } else {
      throw switchError;
    }
  }
}

export function getChainId(): number {
  if (typeof window === 'undefined' || !window.ethereum) {
    return 0;
  }
  // This would need to be called after connection
  return 1994; // Default to Somnia
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (args: any) => void) => void;
      removeListener: (event: string, callback: (args: any) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

