import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  MonadStoryNFTReader, 
  MonadStoryNFTWriter, 
  MonadStoryNFTAdmin,
  monadStoryNFTUtils,
  type StoryMetadata,
  type StoryDetails,
  type MintResult
} from '@/lib/contracts/monadStoryNFT';

export interface UseMonadStoryNFTReturn {
  // Contract state
  mintPrice: string | null;
  maxSupply: number | null;
  userBalance: number | null;
  isOwner: boolean;
  loading: boolean;
  error: string | null;

  // Read functions
  getStoryContent: (tokenId: number) => Promise<string>;
  getImageCount: (tokenId: number) => Promise<number>;
  getContentType: (tokenId: number) => Promise<number>;
  getStoryDetails: (tokenId: number) => Promise<StoryDetails>;
  getTokenURI: (tokenId: number) => Promise<string>;
  getOwnerOf: (tokenId: number) => Promise<string>;

  // Write functions
  mintStory: (metadata: StoryMetadata) => Promise<MintResult>;
  transferNFT: (tokenId: number, to: string) => Promise<string>;
  approveNFT: (tokenId: number, to: string) => Promise<string>;
  setApprovalForAll: (operator: string, approved: boolean) => Promise<string>;

  // Admin functions (owner only)
  setBaseURI: (baseURI: string) => Promise<string>;
  setMintPrice: (newPrice: string) => Promise<string>;
  withdrawFunds: () => Promise<string>;

  // Utility functions
  validateMetadata: (metadata: StoryMetadata) => { valid: boolean; errors: string[] };
  formatContentType: (contentType: number) => string;
  
  // Refresh functions
  refreshContractData: () => Promise<void>;
}

export function useMonadStoryNFT(): UseMonadStoryNFTReturn {
  const { address, isConnected } = useAccount();
  
  // State
  const [mintPrice, setMintPrice] = useState<string | null>(null);
  const [maxSupply, setMaxSupply] = useState<number | null>(null);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial contract data
  const loadContractData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load basic contract info
      const [price, supply] = await Promise.all([
        MonadStoryNFTReader.getMintPrice(),
        MonadStoryNFTReader.getMaxSupply(),
      ]);

      setMintPrice(price);
      setMaxSupply(supply);

      // Load user-specific data if connected
      if (isConnected && address) {
        const [balance, ownerStatus] = await Promise.all([
          MonadStoryNFTReader.getBalanceOf(address),
          monadStoryNFTUtils.isOwner(address),
        ]);

        setUserBalance(balance);
        setIsOwner(ownerStatus);
      } else {
        setUserBalance(null);
        setIsOwner(false);
      }
    } catch (err) {
      console.error('Error loading contract data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load contract data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when connection changes
  useEffect(() => {
    loadContractData();
  }, [isConnected, address]);

  // Read functions
  const getStoryContent = async (tokenId: number): Promise<string> => {
    try {
      return await MonadStoryNFTReader.getStoryContent(tokenId);
    } catch (err) {
      console.error('Error getting story content:', err);
      throw err;
    }
  };

  const getImageCount = async (tokenId: number): Promise<number> => {
    try {
      return await MonadStoryNFTReader.getImageCount(tokenId);
    } catch (err) {
      console.error('Error getting image count:', err);
      throw err;
    }
  };

  const getContentType = async (tokenId: number): Promise<number> => {
    try {
      return await MonadStoryNFTReader.getContentType(tokenId);
    } catch (err) {
      console.error('Error getting content type:', err);
      throw err;
    }
  };

  const getStoryDetails = async (tokenId: number): Promise<StoryDetails> => {
    try {
      return await MonadStoryNFTReader.getStoryDetails(tokenId);
    } catch (err) {
      console.error('Error getting story details:', err);
      throw err;
    }
  };

  const getTokenURI = async (tokenId: number): Promise<string> => {
    try {
      return await MonadStoryNFTReader.getTokenURI(tokenId);
    } catch (err) {
      console.error('Error getting token URI:', err);
      throw err;
    }
  };

  const getOwnerOf = async (tokenId: number): Promise<string> => {
    try {
      return await MonadStoryNFTReader.getOwnerOf(tokenId);
    } catch (err) {
      console.error('Error getting token owner:', err);
      throw err;
    }
  };

  // Write functions
  const mintStory = async (metadata: StoryMetadata): Promise<MintResult> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      // Validate metadata first
      const validation = monadStoryNFTUtils.validateStoryMetadata(metadata);
      if (!validation.valid) {
        throw new Error(`Invalid metadata: ${validation.errors.join(', ')}`);
      }

      const result = await MonadStoryNFTWriter.mintStory(
        metadata.storyHash,
        metadata.metadataURI,
        metadata.imageCount,
        mintPrice || undefined
      );

      // Refresh user balance after minting
      if (address) {
        const newBalance = await MonadStoryNFTReader.getBalanceOf(address);
        setUserBalance(newBalance);
      }

      return result;
    } catch (err) {
      console.error('Error minting story:', err);
      throw err;
    }
  };

  const transferNFT = async (tokenId: number, to: string): Promise<string> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      const txHash = await MonadStoryNFTWriter.transferFrom(address, to, tokenId);
      
      // Refresh user balance after transfer
      const newBalance = await MonadStoryNFTReader.getBalanceOf(address);
      setUserBalance(newBalance);

      return txHash;
    } catch (err) {
      console.error('Error transferring NFT:', err);
      throw err;
    }
  };

  const approveNFT = async (tokenId: number, to: string): Promise<string> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      return await MonadStoryNFTWriter.approve(to, tokenId);
    } catch (err) {
      console.error('Error approving NFT:', err);
      throw err;
    }
  };

  const setApprovalForAll = async (operator: string, approved: boolean): Promise<string> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      return await MonadStoryNFTWriter.setApprovalForAll(operator, approved);
    } catch (err) {
      console.error('Error setting approval for all:', err);
      throw err;
    }
  };

  // Admin functions
  const setBaseURI = async (baseURI: string): Promise<string> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    if (!isOwner) {
      throw new Error('Only contract owner can set base URI');
    }

    try {
      return await MonadStoryNFTAdmin.setBaseURI(baseURI);
    } catch (err) {
      console.error('Error setting base URI:', err);
      throw err;
    }
  };

  const setMintPriceAdmin = async (newPrice: string): Promise<string> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    if (!isOwner) {
      throw new Error('Only contract owner can set mint price');
    }

    try {
      const txHash = await MonadStoryNFTAdmin.setMintPrice(newPrice);
      
      // Refresh mint price after update
      const updatedPrice = await MonadStoryNFTReader.getMintPrice();
      setMintPrice(updatedPrice);

      return txHash;
    } catch (err) {
      console.error('Error setting mint price:', err);
      throw err;
    }
  };

  const withdrawFunds = async (): Promise<string> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    if (!isOwner) {
      throw new Error('Only contract owner can withdraw funds');
    }

    try {
      return await MonadStoryNFTAdmin.withdrawFunds();
    } catch (err) {
      console.error('Error withdrawing funds:', err);
      throw err;
    }
  };

  // Utility functions
  const validateMetadata = (metadata: StoryMetadata) => {
    return monadStoryNFTUtils.validateStoryMetadata(metadata);
  };

  const formatContentType = (contentType: number): string => {
    return monadStoryNFTUtils.formatContentType(contentType);
  };

  const refreshContractData = async (): Promise<void> => {
    await loadContractData();
  };

  return {
    // State
    mintPrice,
    maxSupply,
    userBalance,
    isOwner,
    loading,
    error,

    // Read functions
    getStoryContent,
    getImageCount,
    getContentType,
    getStoryDetails,
    getTokenURI,
    getOwnerOf,

    // Write functions
    mintStory,
    transferNFT,
    approveNFT,
    setApprovalForAll,

    // Admin functions
    setBaseURI,
    setMintPrice: setMintPriceAdmin,
    withdrawFunds,

    // Utility functions
    validateMetadata,
    formatContentType,
    refreshContractData,
  };
}
