'use client';

import { Loader2, ExternalLink, Eye, Hash, Calendar, User, Palette, Users } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { useWeb3 } from '@/components/providers/web3-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { getIPFSUrl, getIPFSFallbackUrls } from '@/utils/ipfs';

// Helper: fetch IPFS JSON/Text with gateway fallbacks
const sanitizeCid = (raw: string) => raw.replace(/^ipfs:\/\//, '').replace(/^\/?ipfs\//, '');
// Basic base58btc CIDv0 validator (starts with Qm and 46 chars, no 0/O/I/l)
const isLikelyValidCidV0 = (cid: string) => /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(cid);
const fetchFromIPFS = async (cid: string, as: 'json' | 'text') => {
  const clean = sanitizeCid(cid);
  if (!isLikelyValidCidV0(clean)) {
    throw new Error('Invalid CID');
  }

  // 1) Try server proxy to avoid CORS/rate limits
  try {
    const proxyRes = await fetch(`/api/ipfs/get?cid=${encodeURIComponent(clean)}&as=${as}`);
    if (proxyRes.ok) {
      const body = await proxyRes.json();
      return body.data;
    }
  } catch (_) {
    // ignore and fallback to direct gateways
  }

  // 2) Direct gateways as fallback
  const urls = getIPFSFallbackUrls(clean);
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { Accept: as === 'json' ? 'application/json' : 'text/plain' } });
      if (res.ok) {
        return as === 'json' ? await res.json() : await res.text();
      }
    } catch (_) {
      // continue to next gateway
    }
  }
  throw new Error(`All IPFS gateways failed for ${clean}`);
};

interface StoryNFT {
  tokenId: string;
  title: string;
  description: string;
  storyContent: string;
  imageUrl?: string;
  owner: string;
  genre: string;
  author: string;
  aiModel: string;
  createdAt: string;
  imageCount: number;
  contentType: string;
  transactionHash?: string;
  images?: { url: string; chapter?: string; description?: string }[];
}

interface NFTGalleryProps {
  highlightTokenId?: string; // To highlight a specific NFT (e.g., newly minted)
}

export function NFTGallery({ highlightTokenId }: NFTGalleryProps) {
  const [nfts, setNfts] = useState<StoryNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<StoryNFT | null>(null);
  const [maxTokensChecked, setMaxTokensChecked] = useState(0);
  const { connected, account } = useWeb3();
  const { toast } = useToast();

  useEffect(() => {
    // Only auto-fetch if wallet is connected, or if we have a highlight token to show
    if (connected || highlightTokenId) {
      fetchNFTs();
    }
  }, [connected, account, highlightTokenId]);

  const fetchNFTs = async (loadMore = false) => {
    setIsLoading(true);
    try {
      // Import contract utilities
      const { MonadStoryNFTReader, MONAD_STORY_NFT_ADDRESS } = await import('@/lib/contracts/monadStoryNFT');
      
      // Fetch NFTs sequentially with delays to avoid rate limiting
      const validNFTs: StoryNFT[] = loadMore ? [...nfts] : [];
      const startToken = loadMore ? maxTokensChecked : 0;
      const tokensToCheck = 5; // Check 5 tokens at a time
      const endToken = startToken + tokensToCheck;
      
      for (let i = startToken; i < endToken; i++) {
        try {
          const nft = await fetchNFTData(i);
          if (nft) {
            validNFTs.push(nft);
          }
          
          // Add delay between requests to avoid rate limiting
          if (i < endToken - 1) {
            await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay
          }
        } catch (error: any) {
          console.warn(`Failed to fetch NFT ${i}:`, error.message?.substring(0, 100));
          
          // If we get rate limited, add a longer delay
          if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
            console.log('Rate limited, waiting 2 seconds...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          // Continue with next token - don't let one failure stop the whole process
        }
      }
      
      setNfts(validNFTs);
      setMaxTokensChecked(endToken);
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
      // Don't show error toast if wallet is not connected - this is expected
      if (connected) {
        toast({
          title: 'Error',
          description: 'Failed to load NFT gallery. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNFTData = async (tokenId: number): Promise<StoryNFT | null> => {
    try {
      const { MonadStoryNFTReader } = await import('@/lib/contracts/monadStoryNFT');
      
      // Check if token exists by trying to get owner
      // This will throw an error if token doesn't exist, which is expected
      let owner: string;
      try {
        owner = await MonadStoryNFTReader.getOwnerOf(tokenId);
      } catch (error: any) {
        // Token doesn't exist - this is normal for non-minted tokens
        // Check for various nonexistent token error patterns
        const errorMsg = error?.message || '';
        const isNonExistentToken = errorMsg.includes('ERC721NonexistentToken') ||
                                   errorMsg.includes('nonexistent') ||
                                   errorMsg.includes('ERC721:') ||
                                   errorMsg.includes('owner query for nonexistent token') ||
                                   errorMsg.includes('ERC721NonexistentToken(uint256') ||
                                   errorMsg.includes('Invalid parameters were provided to the RPC method') ||
                                   errorMsg.includes('Block requested not found') ||
                                   error?.name === 'ContractFunctionRevertedError';

        if (isNonExistentToken) {
          // Silently handle non-existent tokens - this is expected
          return null;
        }

        // Handle rate limiting
        if (errorMsg.includes('429') || errorMsg.includes('Too Many Requests')) {
          console.warn(`Rate limited when checking token ${tokenId}, skipping...`);
          return null;
        }

        // Re-throw other errors
        console.error(`Unexpected error for token ${tokenId}:`, error);
        throw error;
      }
      
      if (!owner || owner === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      // Get story details
      const storyDetails = await MonadStoryNFTReader.getStoryDetails(tokenId);
      const tokenURI = await MonadStoryNFTReader.getTokenURI(tokenId);
      const contentType = await MonadStoryNFTReader.getContentType(tokenId);

      // Normalize weird cases where tokenURI is like ipfs://data:application/json;base64,...
      let normalizedTokenURI = tokenURI.startsWith('ipfs://data:')
        ? tokenURI.replace('ipfs://', '')
        : tokenURI;

      // Parse metadata from tokenURI (base64 or IPFS JSON)
      let metadata: any = {};
      let usedLocalCache = false;
      try {
        if (normalizedTokenURI.startsWith('data:application/json;base64,')) {
          const base64Data = normalizedTokenURI.replace('data:application/json;base64,', '');
          const jsonString = Buffer.from(base64Data, 'base64').toString('utf-8');
          metadata = JSON.parse(jsonString);
        } else if (normalizedTokenURI.startsWith('ipfs://')) {
          const cid = normalizedTokenURI.replace('ipfs://', '');
          if (isLikelyValidCidV0(cid)) {
            metadata = await fetchFromIPFS(cid, 'json');
          } else {
            // Invalid CID - will rely on local cache below
          }
        }
      } catch (e) {
        console.warn('Could not parse metadata for token', tokenId);
      }

      // Parse story content from storyHash (base64 or IPFS)
      let storyContent = 'Story content not available';
      try {
        const normalizedStoryHash = storyDetails.storyHash.startsWith('ipfs://data:')
          ? storyDetails.storyHash.replace('ipfs://', '')
          : storyDetails.storyHash;
        if (normalizedStoryHash.startsWith('data:text/plain;base64,')) {
          const base64Data = normalizedStoryHash.replace('data:text/plain;base64,', '');
          storyContent = Buffer.from(base64Data, 'base64').toString('utf-8');
        } else if (normalizedStoryHash.startsWith('ipfs://')) {
          const cid = normalizedStoryHash.replace('ipfs://', '');
          if (isLikelyValidCidV0(cid)) {
            storyContent = await fetchFromIPFS(cid, 'text');
          } else {
            // Invalid CID - will rely on local cache below
          }
        }
      } catch (e) {
        console.warn('Could not parse story content for token', tokenId);
      }

      // LocalStorage fallback if IPFS failed or gave minimal data
      try {
        if ((typeof window !== 'undefined') && (!metadata.name || storyContent === 'Story content not available')) {
          const cacheRaw = localStorage.getItem(`story_nft_${tokenId}`);
          if (cacheRaw) {
            const cache = JSON.parse(cacheRaw);
            usedLocalCache = true;
            metadata = { ...metadata, ...(cache.metadata || {}) };
            if (!metadata.image && cache.metadata?.image) metadata.image = cache.metadata.image;
            storyContent = cache.storyContent || storyContent;
          }
        }
      } catch (e) {
        // ignore cache errors
      }

      const imagesArr: { url: string; chapter?: string; description?: string }[] = Array.isArray(metadata.images) ? metadata.images : (Array.isArray(metadata.content_images) ? metadata.content_images.map((u: string) => ({ url: u })) : []);
      // If still empty, use cached images
      if ((!imagesArr || imagesArr.length === 0) && typeof window !== 'undefined') {
        try {
          const cacheRaw = localStorage.getItem(`story_nft_${tokenId}`);
          if (cacheRaw) {
            const cache = JSON.parse(cacheRaw);
            if (Array.isArray(cache.images) && cache.images.length > 0) {
              metadata.image = metadata.image || cache.images[0]?.url;
              metadata.images = cache.images.map((img: any) => ({ url: img.url, chapter: img.chapter, description: img.description }));
            }
          }
        } catch {}
      }

      // If we still don't have usable metadata and no cache, skip this token silently
      if (!metadata.name && (!metadata.images || metadata.images.length === 0) && storyContent === 'Story content not available') {
        return null;
      }

      return {
        tokenId: tokenId.toString(),
        title: metadata.name || `Story NFT #${tokenId}`,
        description: metadata.description || 'AI-generated story NFT',
        storyContent: metadata.full_story || storyContent, // Always keep full story for modal view
        imageUrl: metadata.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop&crop=center',
        owner,
        genre: metadata.attributes?.find((attr: any) => attr.trait_type === 'Genre')?.value || 'Unknown',
        author: metadata.attributes?.find((attr: any) => attr.trait_type === 'Author')?.value || 'Unknown',
        aiModel: 'Not specified', // Removed AI model as requested
        createdAt: metadata.attributes?.find((attr: any) => attr.trait_type === 'Created At')?.value || 'Unknown',
        imageCount: Number(storyDetails.imageCount),
        contentType: contentType === 0 ? 'Text Only' : 'Text + Images',
        // attach parsed images for UI consumption
        images: imagesArr,
      };
    } catch (error) {
      // Token doesn't exist or error fetching
      return null;
    }
  };

  const openStoryModal = (nft: StoryNFT) => {
    setSelectedNFT(nft);
  };

  const closeStoryModal = () => {
    setSelectedNFT(null);
  };

  const viewOnExplorer = (tokenId: string) => {
    const contractAddress = process.env.NEXT_PUBLIC_STORY_NFT_CONTRACT || '0x6bFEF8ac708ef73142Fb59D29590351D0C07920a';
    const explorerUrl = `https://testnet.monadexplorer.com/token/${contractAddress}?a=${tokenId}`;
    window.open(explorerUrl, '_blank');
  };

  const handleRefresh = () => {
    fetchNFTs(false);
  };

  const handleLoadMore = () => {
    fetchNFTs(true);
  };

  const handleLoadNFTs = () => {
    fetchNFTs(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading Story NFTs...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-2 py-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground pl-2">Story NFT Gallery</h2>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <Loader2 className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {!connected && nfts.length === 0 && !isLoading && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-blue-600 dark:text-blue-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Browse Story NFTs
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  View all minted story NFTs without connecting your wallet.
                </p>
              </div>
            </div>
            <Button onClick={handleLoadNFTs} variant="outline" size="sm">
              Load NFTs
            </Button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {nfts.length > 0 ? (
          nfts.map((nft) => (
            <Card 
              key={nft.tokenId} 
              className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
                highlightTokenId === nft.tokenId ? 'ring-2 ring-purple-500 shadow-purple-500/25' : ''
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg truncate">{nft.title}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    <Hash className="h-3 w-3 mr-1" />
                    {nft.tokenId}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <img
                  src={nft.imageUrl}
                  alt={nft.title}
                  className="w-full h-48 object-cover rounded-md mb-3"
                />
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {nft.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center">
                      <Palette className="h-3 w-3 mr-1" />
                      {nft.genre}
                    </span>
                    <span className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {nft.author}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{nft.contentType}</span>
                    <span>{nft.imageCount} images</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-2 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openStoryModal(nft)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Read Story
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => viewOnExplorer(nft.tokenId)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-muted-foreground">
              <Hash className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Story NFTs Found</h3>
              <p>No minted story NFTs available yet. Create your first story to see it here!</p>
            </div>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {nfts.length > 0 && maxTokensChecked < 20 && (
        <div className="flex justify-center mt-6">
          <Button 
            onClick={handleLoadMore} 
            variant="outline" 
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span>Load More NFTs</span>
          </Button>
        </div>
      )}

      {/* Story Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{selectedNFT.title}</h3>
                <Button variant="ghost" size="sm" onClick={closeStoryModal}>
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <img
                  src={selectedNFT.imageUrl}
                  alt={selectedNFT.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
                {selectedNFT.images && selectedNFT.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedNFT.images.map((img, idx) => (
                      <div key={idx} className="aspect-video rounded overflow-hidden">
                        <img src={img.url} alt={img.description || `Image ${idx+1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Token ID:</strong> #{selectedNFT.tokenId}
                  </div>
                  <div>
                    <strong>Owner:</strong> {selectedNFT.owner.substring(0, 8)}...
                  </div>
                  <div>
                    <strong>Genre:</strong> {selectedNFT.genre}
                  </div>
                  <div>
                    <strong>Author:</strong> {selectedNFT.author}
                  </div>
                  <div>
                    <strong>Content Type:</strong> {selectedNFT.contentType}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Story Content:</h4>
                  <div className="bg-muted p-4 rounded-lg text-sm max-h-[60vh] overflow-y-auto whitespace-pre-wrap">
                    {selectedNFT.storyContent}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => viewOnExplorer(selectedNFT.tokenId)}
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Monad Explorer
                  </Button>
                  <Button variant="outline" onClick={closeStoryModal}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
