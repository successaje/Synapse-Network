/**
 * Helper functions for chain management
 */

type EthereumProvider = {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (args: any) => void) => void;
  removeListener: (event: string, callback: (args: any) => void) => void;
  isMetaMask?: boolean;
};

function getEthereum(): EthereumProvider {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No wallet found');
  }
  return window.ethereum as EthereumProvider;
}

export async function switchToSomniaTestnet() {
  const ethereum = getEthereum();

  const chainId = '0xC498'; // 50312 in hex
  const chainIdDecimal = 50312;

  try {
    // Try to switch to the chain
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        // Add the chain
        await ethereum.request({
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
              rpcUrls: ['https://dream-rpc.somnia.network'],
              blockExplorerUrls: ['https://shannon-explorer.somnia.network'],
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

export async function switchToSomniaMainnet() {
  const ethereum = getEthereum();

  const chainId = '0x13A7'; // 5031 in hex
  const chainIdDecimal = 5031;

  try {
    // Try to switch to the chain
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        // Add the chain
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId,
              chainName: 'Somnia Mainnet',
              nativeCurrency: {
                name: 'SOMI',
                symbol: 'SOMI',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.somnia.network'],
              blockExplorerUrls: ['https://explorer.somnia.network'],
            },
          ],
        });
      } catch (addError) {
        throw new Error('Failed to add Somnia Mainnet to wallet');
      }
    } else {
      throw switchError;
    }
  }
}

// Backward compatibility
export const switchToSomniaNetwork = switchToSomniaTestnet;

export function getChainId(): number {
  if (typeof window === 'undefined' || !window.ethereum) {
    return 0;
  }
  // This would need to be called after connection
  return 50312; // Default to Somnia Testnet
}

export function isSomniaChain(chainId: number): boolean {
  return chainId === 50312 || chainId === 5031; // Testnet or Mainnet
}
