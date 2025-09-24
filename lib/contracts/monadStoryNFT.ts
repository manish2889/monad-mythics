import { parseEther, formatEther } from 'viem';
import { readContract, writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { wagmiConfig } from '@/lib/wagmi-config';
import MonadStoryNFTContract from './MonadStoryNFT.json';

// Contract configuration
export const MONAD_STORY_NFT_ADDRESS = (process.env.NEXT_PUBLIC_STORY_NFT_CONTRACT || '0x6bFEF8ac708ef73142Fb59D29590351D0C07920a') as `0x${string}`;
export const MONAD_STORY_NFT_ABI = MonadStoryNFTContract.abi;

// Debug logging
console.log('Contract Address:', MONAD_STORY_NFT_ADDRESS);
console.log('Environment Variable:', process.env.NEXT_PUBLIC_STORY_NFT_CONTRACT);

// Types for story NFT data
export interface StoryMetadata {
  storyHash: string;
  metadataURI: string;
  imageCount: number;
}

export interface StoryDetails {
  storyHash: string;
  imageCount: bigint;
  contentType: number;
}

export interface MintResult {
  tokenId: string;
  transactionHash: string;
}

// Contract read functions
export class MonadStoryNFTReader {
  /**
   * Get the current mint price
   */
  static async getMintPrice(): Promise<string> {
    try {
      const price = await readContract(wagmiConfig, {
        address: MONAD_STORY_NFT_ADDRESS,
        abi: MONAD_STORY_NFT_ABI,
        functionName: 'mintPrice',
      }) as bigint;
      
      return formatEther(price);
    } catch (error) {
      console.error('Error getting mint price:', error);
      throw error;
    }
  }

  /**
   * Get the maximum supply
   */
  static async getMaxSupply(): Promise<number> {
    try {
      const supply = await readContract(wagmiConfig, {
        address: MONAD_STORY_NFT_ADDRESS,
        abi: MONAD_STORY_NFT_ABI,
        functionName: 'MAX_SUPPLY',
      }) as bigint;
      
      return Number(supply);
    } catch (error) {
      console.error('Error getting max supply:', error);
      throw error;
    }
  }

  /**
   * Get story content hash by token ID
   */
  static async getStoryContent(tokenId: number): Promise<string> {
    try {
      const content = await readContract(wagmiConfig, {
        address: MONAD_STORY_NFT_ADDRESS,
        abi: MONAD_STORY_NFT_ABI,
        functionName: 'getStoryContent',
        args: [BigInt(tokenId)],
      }) as string;
      
      return content;
    } catch (error) {
      console.error('Error getting story content:', error);
      throw error;
    }
  }

  /**
   * Get image count by token ID
   */
  static async getImageCount(tokenId: number): Promise<number> {
    try {
      const count = await readContract(wagmiConfig, {
        address: MONAD_STORY_NFT_ADDRESS,
        abi: MONAD_STORY_NFT_ABI,
        functionName: 'getImageCount',
        args: [BigInt(tokenId)],
      }) as bigint;
      
      return Number(count);
    } catch (error) {
      console.error('Error getting image count:', error);
      throw error;
    }
  }

  /**
   * Get content type by token ID
   */
  static async getContentType(tokenId: number): Promise<number> {
    try {
      const type = await readContract(wagmiConfig, {
        address: MONAD_STORY_NFT_ADDRESS,
        abi: MONAD_STORY_NFT_ABI,
        functionName: 'getContentType',
        args: [BigInt(tokenId)],
      }) as number;
      
      return type;
    } catch (error) {
      console.error('Error getting content type:', error);
      throw error;
    }
  }

  /**
   * Get all story details by token ID (batch call)
   */
  static async getStoryDetails(tokenId: number): Promise<StoryDetails> {
    try {
      const details = await readContract(wagmiConfig, {
        address: MONAD_STORY_NFT_ADDRESS,
        abi: MONAD_STORY_NFT_ABI,
        functionName: 'getStoryDetails',
        args: [BigInt(tokenId)],
      }) as [string, bigint, number];
      
      return {
        storyHash: details[0],
        imageCount: details[1],
        contentType: details[2],
      };
    } catch (error) {
      console.error('Error getting story details:', error);
      throw error;
    }
  }

  /**
   * Get token URI by token ID
   */
  static async getTokenURI(tokenId: number): Promise<string> {
    try {
      const uri = await readContract(wagmiConfig, {
        address: MONAD_STORY_NFT_ADDRESS,
        abi: MONAD_STORY_NFT_ABI,
        functionName: 'tokenURI',
        args: [BigInt(tokenId)],
      }) as string;
      
      return uri;
    } catch (error) {
      console.error('Error getting token URI:', error);
      throw error;
    }
  }

  /**
   * Get owner of a token
   */
  static async getOwnerOf(tokenId: number): Promise<string> {
    try {
      const owner = await readContract(wagmiConfig, {
        address: MONAD_STORY_NFT_ADDRESS,
        abi: MONAD_STORY_NFT_ABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)],
      }) as string;
      
      return owner;
    } catch (error: any) {
      // Don't log expected errors for non-existent tokens
      const errorMsg = error.message || '';
      if (!errorMsg.includes('ERC721NonexistentToken') && !errorMsg.includes('nonexistent')) {
        console.error('Error getting token owner:', error);
      }
      throw error;
    }
  }

  /**
   * Get balance of an address
   */
  static async getBalanceOf(address: string): Promise<number> {
    try {
      const balance = await readContract(wagmiConfig, {
        address: MONAD_STORY_NFT_ADDRESS,
        abi: MONAD_STORY_NFT_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      }) as bigint;
      
      return Number(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }
}

// Contract write functions
export class MonadStoryNFTWriter {
  /**
   * Mint a new story NFT
   */
  static async mintStory(
    storyHash: string,
    metadataURI: string,
    imageCount: number,
    mintPrice?: string
  ): Promise<MintResult> {
    try {
      console.log('Starting mint process...');
      console.log('Contract Address:', MONAD_STORY_NFT_ADDRESS);
      console.log('Story Hash:', storyHash);
      console.log('Metadata URI:', metadataURI);
      console.log('Image Count:', imageCount);

      // Get current mint price if not provided
      const price = mintPrice || await MonadStoryNFTReader.getMintPrice();
      console.log('Mint Price:', price, 'ETH');
      
      // Validate inputs
      if (!storyHash || !metadataURI) {
        throw new Error('Story hash and metadata URI are required');
      }

      if (!MONAD_STORY_NFT_ADDRESS || MONAD_STORY_NFT_ADDRESS === '0x') {
        throw new Error('Contract address not configured properly');
      }

      console.log('Executing mint transaction...');
      
      // Execute the mint transaction
      const hash = await writeContract(wagmiConfig, {
        address: MONAD_STORY_NFT_ADDRESS,
        abi: MONAD_STORY_NFT_ABI,
        functionName: 'mintStory',
        args: [storyHash, metadataURI, BigInt(imageCount)],
        value: parseEther(price),
      });

      console.log('Transaction submitted:', hash);

      // Wait for transaction confirmation
      console.log('Waiting for transaction confirmation...');
      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
      });

      console.log('Transaction confirmed:', receipt);

      // Extract token ID from logs (StoryMinted event)
      // StoryMinted event signature: keccak256("StoryMinted(uint256,address,string,string,uint256,uint8)")
      const storyMintedEventSignature = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'; // This needs to be the actual signature
      
      let tokenId = '0';
      
      // Try to extract token ID from logs
      for (const log of receipt.logs) {
        try {
          // The first topic is the event signature, second is the token ID (indexed)
          if (log.topics && log.topics.length > 1) {
            // Token ID is the first indexed parameter (second topic)
            const tokenIdHex = log.topics[1];
            if (tokenIdHex) {
              tokenId = BigInt(tokenIdHex).toString();
              console.log('Extracted Token ID:', tokenId);
              break;
            }
          }
        } catch (e) {
          console.log('Could not parse log:', e);
        }
      }
      
      const result = {
        tokenId,
        transactionHash: hash,
      };

      console.log('Mint successful:', result);
      return result;
    } catch (error) {
      console.error('Error minting story NFT:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Transfer a token to another address
   */
  static async transferFrom(
    from: string,
    to: string,
    tokenId: number
  ): Promise<string> {
    try {
      const hash = await writeContract(wagmiConfig, {
        address: MONAD_STORY_NFT_ADDRESS,
        abi: MONAD_STORY_NFT_ABI,
        functionName: 'transferFrom',
        args: [from as `0x${string}`, to as `0x${string}`, BigInt(tokenId)],
      });

      await waitForTransactionReceipt(wagmiConfig, {
        hash,
      });

      return hash;
    } catch (error) {
      console.error('Error transferring NFT:', error);
      throw error;
    }
  }

  /**
   * Approve another address to transfer a specific token
   */
  static async approve(to: string, tokenId: number): Promise<string> {
    try {
      const hash = await writeContract(wagmiConfig, {
        address: MONAD_STORY_NFT_ADDRESS,
        abi: MONAD_STORY_NFT_ABI,
        functionName: 'approve',
        args: [to as `0x${string}`, BigInt(tokenId)],
      });

      await waitForTransactionReceipt(wagmiConfig, {
        hash,
      });

      return hash;
    } catch (error) {
      console.error('Error approving NFT:', error);
      throw error;
    }
  }

  /**
   * Set approval for all tokens (marketplace integration)
   */
  static async setApprovalForAll(
    operator: string,
    approved: boolean
  ): Promise<string> {
    try {
      const hash = await writeContract(wagmiConfig, {
        address: MONAD_STORY_NFT_ADDRESS,
        abi: MONAD_STORY_NFT_ABI,
        functionName: 'setApprovalForAll',
        args: [operator as `0x${string}`, approved],
      });

      await waitForTransactionReceipt(wagmiConfig, {
        hash,
      });

      return hash;
    } catch (error) {
      console.error('Error setting approval for all:', error);
      throw error;
    }
  }
}

// Owner-only functions (for contract administration)
export class MonadStoryNFTAdmin {
  /**
   * Set the base URI for metadata (owner only)
   */
  static async setBaseURI(baseURI: string): Promise<string> {
    try {
      const hash = await writeContract(wagmiConfig, {
        address: MONAD_STORY_NFT_ADDRESS,
        abi: MONAD_STORY_NFT_ABI,
        functionName: 'setBaseURI',
        args: [baseURI],
      });

      await waitForTransactionReceipt(wagmiConfig, {
        hash,
      });

      return hash;
    } catch (error) {
      console.error('Error setting base URI:', error);
      throw error;
    }
  }

  /**
   * Set the mint price (owner only)
   */
  static async setMintPrice(newPrice: string): Promise<string> {
    try {
      const hash = await writeContract(wagmiConfig, {
        address: MONAD_STORY_NFT_ADDRESS,
        abi: MONAD_STORY_NFT_ABI,
        functionName: 'setMintPrice',
        args: [parseEther(newPrice)],
      });

      await waitForTransactionReceipt(wagmiConfig, {
        hash,
      });

      return hash;
    } catch (error) {
      console.error('Error setting mint price:', error);
      throw error;
    }
  }

  /**
   * Withdraw contract funds (owner only)
   */
  static async withdrawFunds(): Promise<string> {
    try {
      const hash = await writeContract(wagmiConfig, {
        address: MONAD_STORY_NFT_ADDRESS,
        abi: MONAD_STORY_NFT_ABI,
        functionName: 'withdrawFunds',
      });

      await waitForTransactionReceipt(wagmiConfig, {
        hash,
      });

      return hash;
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      throw error;
    }
  }
}

// Utility functions
export const monadStoryNFTUtils = {
  /**
   * Check if an address is the contract owner
   */
  async isOwner(address: string): Promise<boolean> {
    try {
      const owner = await readContract(wagmiConfig, {
        address: MONAD_STORY_NFT_ADDRESS,
        abi: MONAD_STORY_NFT_ABI,
        functionName: 'owner',
      }) as string;
      
      return owner.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Error checking owner:', error);
      return false;
    }
  },

  /**
   * Format content type to human readable string
   */
  formatContentType(contentType: number): string {
    switch (contentType) {
      case 0:
        return 'Text Only';
      case 1:
        return 'Text + Images';
      default:
        return 'Unknown';
    }
  },

  /**
   * Validate story metadata before minting
   */
  validateStoryMetadata(metadata: StoryMetadata): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!metadata.storyHash || metadata.storyHash.trim() === '') {
      errors.push('Story hash is required');
    }

    if (!metadata.metadataURI || metadata.metadataURI.trim() === '') {
      errors.push('Metadata URI is required');
    }

    if (metadata.imageCount < 0) {
      errors.push('Image count cannot be negative');
    }

    if (metadata.imageCount > 100) {
      errors.push('Image count cannot exceed 100');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};
