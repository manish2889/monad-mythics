import { useState, useCallback } from 'react';
import { useWeb3 } from '@/components/providers/web3-provider';
import type { StoryMetadata, MintedNFT } from '@/lib/monad-service';

/*
type MonadNetworkInfo = {
  name: string;
  chainId: number;
  rpcUrl: string;
  currency: string;
};

type UseMonadResult = {
  mintNFT: (metadata: StoryMetadata) => Promise<MintedNFT | null>;
  generateAndMint: (prompt: string, title?: string, genre?: string, options?: { apiKey?: string }) => Promise<MintedNFT | null>;
  fetchNFT: (tokenId: string) => Promise<MintedNFT | null>;
  isLoading: boolean;
  //networkInfo: MonadNetworkInfo | null;
  error: string | null;
  //switchToMonadNetwork: () => Promise<boolean>;
  //isOnMonadNetwork: boolean;
};

export function useMonad() {
  const { account } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  //const [networkInfo, setNetworkInfo] = useState<MonadNetworkInfo | null>(null);
  //const [isOnMonadNetwork, setIsOnMonadNetwork] = useState(false);

  // Fetch network info with error handling
  /*
  const fetchNetworkInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/monad/info');
      if (!response.ok) {
        throw new Error(`Failed to fetch network info: ${response.statusText}`);
}
      const data = await response.json();
      setNetworkInfo(data.network);
    } catch (err) {
      console.error('Error fetching Monad network info:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch network info');
      // Provide fallback network info to prevent app breakage
      setNetworkInfo({
        name: 'Monad Network (Fallback)',
        chainId: 0,
        rpcUrl: 'https://fallback.rpc.url',
        currency: 'MONAD'
      });
}
  }, []);

  // Fetch Monad network information only once on mount
  /*
  useEffect(() => {
    fetchNetworkInfo();
  }, [fetchNetworkInfo]);

  // Check if network changes
  /*
  useEffect(() => {
    if (networkInfo && chainId) {
      const hexChainId = '0x' + networkInfo.chainId.toString(16);
      setIsOnMonadNetwork(chainId === hexChainId);
}
  }, [chainId, networkInfo]);

  /**
   * Switch to Monad network

  /*
  const switchToMonadNetwork = useCallback(async (): Promise<boolean> => {
    if (!networkInfo) {
      setError('Network information not available');
      return false;
}
    try {
      setIsLoading(true);
      setError(null);

      await switchNetwork(networkInfo.chainId);
      setIsOnMonadNetwork(true);
      return true;
    } catch (err: any) {
      setError(`Failed to switch network: ${err.message}`);
      console.error('Error switching to Monad network:', err);
      return false;
    } finally {
      setIsLoading(false);
}
  }, [networkInfo, switchNetwork]);

  /**
   * Mint a story as an NFT on Monad

  const mintNFT = useCallback(async (metadata: StoryMetadata): Promise<MintedNFT | null> => {
    if (!account) {
      setError('Wallet not connected');
      return null;
}
    /*
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

      /*
      const response = await fetch('/api/monad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mint',
          metadata: metadataWithAddress,
          ownerAddress: account,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mint NFT');
}
      const data = await response.json();
      return data.nft;

      // Placeholder return for now since Monad is commented out
      return { 
        tokenId: `placeholder-${Math.random().toString(36).substring(2, 7)}`, 
        metadata: metadataWithAddress, 
        transactionHash: '0x...', 
        owner: account || '0x...', 
        tokenURI: 'ipfs://placeholder-uri' 
      };
    } catch (err: any) {
      setError(err.message || 'Failed to mint NFT');
      console.error('Error minting NFT:', err);
      return null;
    } finally {
      setIsLoading(false);
}
  }, [account]);

  /**
   * Fetch an NFT by token ID

  const fetchNFT = useCallback(async (tokenId: string): Promise<MintedNFT | null> => {
    try {
      setIsLoading(true);
      setError(null);

      /*
      const response = await fetch('/api/monad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'fetch',
          tokenId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch NFT');
}
      const data = await response.json();
      return data.nft;

      // Placeholder return for now since Monad is commented out
      return { 
        tokenId, 
        metadata: { 
          title: 'Placeholder NFT', 
          content: 'Content placeholder', 
          authorAddress: '0x...', 
          description: 'Placeholder description', 
          excerpt: 'Placeholder excerpt', 
          author: 'Placeholder Author', 
          coverImage: '/covers/default.jpg', 
          genre: 'Unknown', 
          createdAt: new Date().toISOString(), 
          tags: [] 
        }, 
        transactionHash: '0x...', 
        owner: '0x...', 
        tokenURI: 'ipfs://placeholder-uri' 
      };
    } catch (err: any) {
      setError(err.message || 'Failed to fetch NFT');
      console.error('Error fetching NFT:', err);
      return null;
    } finally {
      setIsLoading(false);
}
  }, []);

  /**
   * Generate a story using Groq and mint it as an NFT

  const generateAndMint = useCallback(
    async (prompt: string, title?: string, genre?: string, options?: { apiKey?: string }): Promise<MintedNFT | null> => {
      try {
        setIsLoading(true);
        setError(null);

        if (!account) {
          throw new Error('Wallet not connected');
}
        // Extract API key if provided
        const { apiKey } = options || {};

        /*
        const response = await fetch('/api/generate-and-mint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            ownerAddress: account,
            title,
            genre,
            apiKey
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate and mint story');
}
        const data = await response.json();
        return data.nft;

        // Placeholder return for now since Monad is commented out
        return { 
          tokenId: `generated-${Math.random().toString(36).substring(2, 7)}`, 
          metadata: { 
            title: title || 'Generated Story', 
            content: prompt, 
            authorAddress: account, 
            description: 'Generated story description', 
            excerpt: 'Generated story excerpt', 
            author: 'AI Generated', 
            coverImage: '/covers/default.jpg', 
            genre: genre || 'Fantasy', 
            createdAt: new Date().toISOString(), 
            tags: [] 
          }, 
          transactionHash: '0x...', 
          owner: account, 
          tokenURI: 'ipfs://generated-uri' 
        };
      } catch (err: any) {
        setError(err.message || 'Failed to generate and mint story');
        console.error('Error in generate and mint:', err);
        throw err;
      } finally {
        setIsLoading(false);
}
    },
    [account]
  );

  return {
    mintNFT,
    fetchNFT,
    generateAndMint,
    isLoading,
    //networkInfo,
    error,
    //switchToMonadNetwork,
    //isOnMonadNetwork,
  } as any;
}