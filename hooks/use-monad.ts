import { useState, useCallback } from 'react';
import { useWeb3 } from '@/components/providers/web3-provider';
import type { StoryMetadata, MintedNFT } from '@/lib/monad-service';

type UseMonadResult = {
  mintNFT: (metadata: StoryMetadata) => Promise<MintedNFT | null>;
  generateAndMint: (prompt: string, title?: string, genre?: string, options?: { apiKey?: string }) => Promise<MintedNFT | null>;
  fetchNFT: (tokenId: string) => Promise<MintedNFT | null>;
  isLoading: boolean;
  error: string | null;
};

export function useMonad(): UseMonadResult {
  const { account, connected, connectWallet, chainId, switchNetwork } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if we're on Monad Testnet (chain ID 10143)
  const isOnMonadNetwork = chainId === 10143;

  // Switch to Monad network
  const switchToMonadNetwork = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await switchNetwork(10143); // Monad Testnet chain ID
      return true;
    } catch (err: any) {
      setError(`Failed to switch network: ${err.message}`);
      console.error('Error switching to Monad network:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [switchNetwork]);

  /**
   * Mint a story as an NFT on Monad
   */
  const mintNFT = useCallback(async (metadata: StoryMetadata): Promise<MintedNFT | null> => {
    if (!connected || !account) {
      setError('Wallet not connected');
      return null;
    }

    if (!isOnMonadNetwork) {
      const switched = await switchToMonadNetwork();
      if (!switched) {
        setError('Must be on Monad network to mint NFTs');
        return null;
      }
    }

    try {
      setIsLoading(true);
      setError(null);

      const metadataWithAddress = {
        ...metadata,
        authorAddress: account
      };

      // Use the real minting service
      const { mintStoryNFT } = await import('@/lib/monad-service');
      const result = await mintStoryNFT(metadataWithAddress, account);
      
      console.log('NFT minted successfully:', result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to mint NFT');
      console.error('Error minting NFT:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [account, connected, isOnMonadNetwork, switchToMonadNetwork]);

  /**
   * Fetch an NFT by token ID
   */
  const fetchNFT = useCallback(async (tokenId: string): Promise<MintedNFT | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Use the real fetch service
      const { getStoryNFT } = await import('@/lib/monad-service');
      const result = await getStoryNFT(tokenId);
      
      console.log('NFT fetched successfully:', result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch NFT');
      console.error('Error fetching NFT:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Generate a story using AI and mint it as an NFT
   */
  const generateAndMint = useCallback(
    async (prompt: string, title?: string, genre?: string, options?: { apiKey?: string }): Promise<MintedNFT | null> => {
      if (!connected || !account) {
        setError('Wallet not connected');
        return null;
      }

      if (!isOnMonadNetwork) {
        const switched = await switchToMonadNetwork();
        if (!switched) {
          setError('Must be on Monad network to mint NFTs');
          return null;
        }
      }

      try {
        setIsLoading(true);
        setError(null);

        // Use the real generate and mint service
        const { generateAndMintAIStory } = await import('@/lib/monad-service');
        const result = await generateAndMintAIStory(
          prompt,
          account,
          title || 'AI Generated Story',
          genre || 'Fantasy',
          options?.apiKey
        );
        
        console.log('Story generated and minted successfully:', result);
        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to generate and mint story');
        console.error('Error in generate and mint:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [account, connected, isOnMonadNetwork, switchToMonadNetwork]
  );

  return {
    mintNFT,
    fetchNFT,
    generateAndMint,
    isLoading,
    error,
  };
}