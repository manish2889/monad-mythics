'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAccount, useBalance, useConnect, useDisconnect, useSwitchChain, useEnsName } from 'wagmi';
import { formatEther } from 'viem';
import { wagmiConfig } from '@/lib/wagmi-config';

// Real Web3 Provider using wagmi
interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  balance: string | null;
  connected: boolean;
  connecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  networkName: string;
  ensName: string | null;
  switchNetwork: (chainId: number) => Promise<void>;
  mintNFTOnBase: (
    metadata: any,
    recipient?: string
  ) => Promise<{
    tokenId: string;
    transactionHash: string;
  }>;
  mintNFTOnMonad: (
    metadata: any,
    recipient?: string
  ) => Promise<{
    tokenId: string;
    transactionHash: string;
  }>;
  transferNFT: (tokenId: string, to: string) => Promise<string>;
  getUserNFTs: () => Promise<any[]>;
  getMarketplaceNFTs: () => Promise<any[]>;
  sellNFT: (tokenId: string, price: string) => Promise<void>;
  buyNFT: (tokenId: string, price: string) => Promise<void>;
  cancelListing: (tokenId: string) => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Fallback (no-op) implementation used during static generation / SSR when the
// provider tree isn't mounted (e.g. export builds on platforms that prerender
// pages without executing RootLayout providers). This prevents build-time
// crashes like: "TypeError: Cannot read properties of null (reading 'useContext')".
// All methods either resolve immediately or throw a clear disabled message.
const fallbackWeb3Context: Web3ContextType = {
  account: null,
  chainId: null,
  balance: null,
  connected: false,
  connecting: false,
  networkName: 'Unknown',
  ensName: null,
  connectWallet: async () => {
    /* no-op during SSR */
  },
  disconnectWallet: () => {
    /* no-op */
  },
  switchNetwork: async () => {
    /* no-op */
  },
  mintNFTOnBase: async () => {
    throw new Error('Web3 functionality unavailable during prerender');
  },
  mintNFTOnMonad: async () => {
    throw new Error('Web3 functionality unavailable during prerender');
  },
  transferNFT: async () => {
    throw new Error('Web3 functionality unavailable during prerender');
  },
  getUserNFTs: async () => [],
  getMarketplaceNFTs: async () => [],
  sellNFT: async () => {
    throw new Error('Web3 functionality unavailable during prerender');
  },
  buyNFT: async () => {
    throw new Error('Web3 functionality unavailable during prerender');
  },
  cancelListing: async () => {
    throw new Error('Web3 functionality unavailable during prerender');
  },
};

// Export Web3Provider as an alias to Web3ProviderWrapper for backward compatibility
export const Web3Provider = Web3ProviderWrapper;

export function useWeb3() {
  const context = useContext(Web3Context);
  // Return a safe fallback instead of throwing to keep build / prerender alive.
  return context ?? fallbackWeb3Context;
}

// Internal Web3Provider that uses wagmi hooks
function InternalWeb3Provider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Ensure this only runs on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // wagmi hooks for real Web3 functionality
  const { address, isConnected, chainId: wagmiChainId } = useAccount();
  const { data: balance } = useBalance({ address });
  const { data: ensName } = useEnsName({ address });
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  // Auto-switch to Monad Testnet when connected to wrong network
  useEffect(() => {
    if (isConnected && wagmiChainId && wagmiChainId !== 10143) {
      console.log('Wrong network detected, switching to Monad Testnet...');
      try {
        switchChain({ chainId: 10143 });
      } catch (error: any) {
        console.error('Failed to switch to Monad Testnet:', error);
      }
    }
  }, [isConnected, wagmiChainId, switchChain]);

  // Network name mapping
  const getNetworkName = (chainId: number | undefined): string => {
    switch (chainId) {
      case 10143:
        return 'Monad Testnet';
      case 1:
        return 'Ethereum Mainnet';
      case 11155111:
        return 'Sepolia Testnet';
      case 137:
        return 'Polygon Mainnet';
      case 80001:
        return 'Polygon Mumbai';
      case 8453:
        return 'Base Mainnet';
      case 84532:
        return 'Base Sepolia';
      case 42161:
        return 'Arbitrum One';
      case 421614:
        return 'Arbitrum Sepolia';
      case 10:
        return 'Optimism';
      case 11155420:
        return 'Optimism Sepolia';
      default:
        return 'Unknown Network';
    }
  };

  const connectWallet = async () => {
    try {
      // If already connected, don't try to connect again
      if (isConnected && address) {
        console.log('Wallet already connected:', address);
        return;
      }

      // Prefer MetaMask (injected) over WalletConnect to avoid modal issues
      const injectedConnector = connectors.find(c => c.name.toLowerCase().includes('injected') || c.name.toLowerCase().includes('metamask'));
      const preferredConnector = injectedConnector || connectors[0];
      
      if (preferredConnector) {
        await connect({ connector: preferredConnector, chainId: 10143 }); // Force connection to Monad Testnet
      } else {
        throw new Error('No wallet connectors available');
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    disconnect();
  };

  const switchNetwork = async (targetChainId: number) => {
    try {
      await switchChain({ chainId: targetChainId });
    } catch (error) {
      console.error('Network switch failed:', error);
      throw error;
    }
  };

  // NFT and marketplace functions - these would need proper contract integration
  const mintNFTOnBase = async (metadata: any, recipient?: string) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }
    // TODO: Implement actual Base NFT minting logic
    console.log('Minting NFT on Base:', { metadata, recipient });
    throw new Error('NFT minting not yet implemented - requires contract integration');
  };

  const mintNFTOnMonad = async (metadata: any, recipient?: string) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // Import the contract utilities
      const { MonadStoryNFTWriter } = await import('@/lib/contracts/monadStoryNFT');
      
      // Extract story metadata
      const { storyHash, metadataURI, imageCount } = metadata;
      
      // Mint the story NFT
      const result = await MonadStoryNFTWriter.mintStory(
        storyHash,
        metadataURI,
        imageCount || 0
      );
      
      console.log('Story NFT minted successfully:', result);
      return result;
    } catch (error) {
      console.error('Error minting story NFT on Monad:', error);
      throw error;
    }
  };

  const transferNFT = async (tokenId: string, to: string) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // Import the contract utilities
      const { MonadStoryNFTWriter } = await import('@/lib/contracts/monadStoryNFT');
      
      // Transfer the NFT
      const txHash = await MonadStoryNFTWriter.transferFrom(
        address,
        to,
        parseInt(tokenId)
      );
      
      console.log('NFT transferred successfully:', txHash);
      return txHash;
    } catch (error) {
      console.error('Error transferring NFT:', error);
      throw error;
    }
  };

  const getUserNFTs = async () => {
    if (!isConnected || !address) {
      return [];
    }
    
    try {
      // Import the contract utilities
      const { MonadStoryNFTReader } = await import('@/lib/contracts/monadStoryNFT');
      
      // Get user's NFT balance
      const balance = await MonadStoryNFTReader.getBalanceOf(address);
      
      // For now, return basic info - you'd need to implement token enumeration
      // or use event logs to get actual token IDs owned by the user
      console.log(`User owns ${balance} Story NFTs`);
      
      // This is a placeholder - in a real implementation, you'd:
      // 1. Use event logs to find Transfer events to this address
      // 2. Or implement a token enumeration system
      // 3. Or use a subgraph/indexer service
      return [];
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      return [];
    }
  };

  const getMarketplaceNFTs = async () => {
    // TODO: Implement actual marketplace NFT fetching logic
    console.log('Fetching marketplace NFTs');
    return [];
  };

  const sellNFT = async (tokenId: string, price: string) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }
    // TODO: Implement actual NFT selling logic
    console.log('Selling NFT:', { tokenId, price });
    throw new Error('NFT selling not yet implemented - requires contract integration');
  };

  const buyNFT = async (tokenId: string, price: string) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }
    // TODO: Implement actual NFT buying logic
    console.log('Buying NFT:', { tokenId, price });
    throw new Error('NFT buying not yet implemented - requires contract integration');
  };

  const cancelListing = async (tokenId: string) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }
    // TODO: Implement actual listing cancellation logic
    console.log('Cancelling NFT listing:', { tokenId });
    throw new Error('Listing cancellation not yet implemented - requires contract integration');
  };

  // Return fallback context during SSR
  if (!mounted) {
    return (
      <Web3Context.Provider value={fallbackWeb3Context}>
        {children}
      </Web3Context.Provider>
    );
  }

  const contextValue: Web3ContextType = {
    account: address || null,
    chainId: wagmiChainId || null,
    balance: balance ? formatEther(balance.value) : null,
    connected: isConnected,
    connecting: isConnecting,
    connectWallet,
    disconnectWallet,
    networkName: getNetworkName(wagmiChainId),
    ensName: ensName || null,
    switchNetwork,
    mintNFTOnBase,
    mintNFTOnMonad,
    transferNFT,
    getUserNFTs,
    getMarketplaceNFTs,
    sellNFT,
    buyNFT,
    cancelListing,
  };

  return (
    <Web3Context.Provider value={contextValue}>{children}</Web3Context.Provider>
  );
}

// Main Web3Provider that wraps everything with wagmi
export function Web3ProviderWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    },
  }));

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR, return children with fallback context
  if (!mounted) {
    return (
      <Web3Context.Provider value={fallbackWeb3Context}>
        {children}
      </Web3Context.Provider>
    );
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <InternalWeb3Provider>{children}</InternalWeb3Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
