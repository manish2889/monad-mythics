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
// CID validator for both CIDv0 and CIDv1 formats
const isLikelyValidCid = (cid: string) => {
  // Check for null/zero CIDs (placeholder values)
  if (/^Qm0+[a-z0-9]*$/i.test(cid) || cid.includes('000000000000000000000000000000')) {
    return false; // These are null/placeholder CIDs
  }
  // CIDv0: starts with Qm and 46 chars total, base58btc encoding
  if (/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(cid)) return true;
  // CIDv1: starts with baf and is typically 59+ chars, be more permissive with character set
  if (/^baf[a-z0-9]{50,}$/i.test(cid)) return true;
  return false;
};
const fetchFromIPFS = async (cid: string, as: 'json' | 'text') => {
  const clean = sanitizeCid(cid);
  if (!isLikelyValidCid(clean)) {
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

  // Load locally cached NFTs (minted this session) so they are visible immediately
  const loadCachedNFTs = () => {
    try {
      if (typeof window === 'undefined') return { cached: [] as StoryNFT[], maxId: 0 };
      const cached: StoryNFT[] = [];
      let maxId = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || '';
        if (!key.startsWith('story_nft_')) continue;
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        try {
          const data = JSON.parse(raw);
          const tokenId = String(data.tokenId ?? '').trim();
          if (!tokenId) continue;
          const tnum = Number(tokenId);
          if (!Number.isNaN(tnum)) maxId = Math.max(maxId, tnum);
          const attributes = data.metadata?.attributes || [];
          const getAttr = (name: string) => attributes.find((a: any) => a?.trait_type === name)?.value || 'Unknown';
          const images = Array.isArray(data.images)
            ? data.images.map((img: any) => ({ url: img.url, chapter: img.chapter, description: img.description }))
            : [];
          const item: StoryNFT = {
            tokenId,
            title: data.metadata?.name || `Story NFT #${tokenId}`,
            description: data.metadata?.description || 'AI-generated story NFT',
            storyContent: data.storyContent || 'Story content not available',
            imageUrl: data.metadata?.image || images[0]?.url,
            owner: '0xLOCALCACHE',
            genre: getAttr('Genre'),
            author: getAttr('Author'),
            aiModel: 'Not specified',
            createdAt: getAttr('Created At'),
            imageCount: images.length,
            contentType: images.length > 0 ? 'Text + Images' : 'Text Only',
            images,
          };
          cached.push(item);
        } catch {}
      }
      // Deduplicate by tokenId in case of multiple writes
      const map = new Map<string, StoryNFT>();
      for (const c of cached) map.set(c.tokenId, c);
      return { cached: Array.from(map.values()), maxId };
    } catch {
      return { cached: [] as StoryNFT[], maxId: 0 };
    }
  };

  useEffect(() => {
    // Only auto-fetch if wallet is connected, or if we have a highlight token to show
    const { cached, maxId } = loadCachedNFTs();
    if (cached.length > 0) {
      // Merge with existing (dedupe by tokenId)
      setNfts((prev) => {
        const ids = new Set(prev.map((n) => n.tokenId));
        const merged = [...prev];
        for (const c of cached) if (!ids.has(c.tokenId)) merged.push(c);
        return merged;
      });
      // Bias scan start around cached max if no highlight is provided
      if (!highlightTokenId && maxTokensChecked === 0) {
        setMaxTokensChecked(Math.max(0, maxId - 5));
      }
    }
    if (connected || highlightTokenId || cached.length > 0) {
      fetchNFTs();
    }
  }, [connected, account, highlightTokenId]);

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
                                   errorMsg.includes('execution reverted') ||
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
        return null;
      }

      // Get token URI and story details
      const [tokenURI, storyDetails] = await Promise.all([
        MonadStoryNFTReader.getTokenURI(tokenId),
        MonadStoryNFTReader.getStoryDetails(tokenId),
      ]);

      // Parse metadata from tokenURI
      let metadata: any = {};
      let usedLocalCache = false;

      // Handle different URI formats and clean up any double prefixes
      let normalizedTokenURI = tokenURI;
      if (normalizedTokenURI.startsWith('ipfs://ipfs://')) {
        normalizedTokenURI = normalizedTokenURI.replace('ipfs://ipfs://', 'ipfs://');
      }
      if (normalizedTokenURI.startsWith('ipfs://data:')) {
        normalizedTokenURI = normalizedTokenURI.replace('ipfs://', '');
      }

      if (normalizedTokenURI.startsWith('data:application/json;base64,')) {
        const base64Data = normalizedTokenURI.replace('data:application/json;base64,', '');
        const jsonString = atob(base64Data);
        metadata = JSON.parse(jsonString);
      } else if (normalizedTokenURI.startsWith('ipfs://')) {
        const cid = normalizedTokenURI.replace('ipfs://', '');
        if (isLikelyValidCid(cid)) {
          try {
            console.log(`Fetching metadata from IPFS for token ${tokenId}, CID:`, cid);
            metadata = await fetchFromIPFS(cid, 'json');
            console.log(`Successfully fetched metadata for token ${tokenId}:`, metadata);
          } catch (e) {
            console.warn(`Failed to fetch metadata from IPFS for token ${tokenId}:`, e);
            // Will try localStorage fallback below
          }
        } else {
          const isNullCid = cid.includes('000000000000000000000000000000') || /^Qm0+[a-z0-9]*$/i.test(cid);
          if (isNullCid) {
            console.warn(`Token ${tokenId} has null/placeholder CID - IPFS content not uploaded. Will try localStorage fallback.`);
          } else {
            console.warn(`Invalid CID for token ${tokenId}:`, cid, '(extracted from:', normalizedTokenURI, ')');
          }
          // Invalid CID - will rely on local cache below
        }
      }

      // Parse story content from storyHash
      let storyContent = 'Story content not available';
      let storyHash = storyDetails.storyHash;
      
      // Clean up double IPFS prefixes in story hash
      if (storyHash.startsWith('ipfs://ipfs://')) {
        storyHash = storyHash.replace('ipfs://ipfs://', 'ipfs://');
      }

      if (storyHash.startsWith('data:text/plain;base64,')) {
        const base64Data = storyHash.replace('data:text/plain;base64,', '');
        storyContent = atob(base64Data);
      } else if (storyHash.startsWith('ipfs://')) {
        const cid = storyHash.replace('ipfs://', '');
        if (isLikelyValidCid(cid)) {
          try {
            console.log(`Fetching story content from IPFS for token ${tokenId}, CID:`, cid);
            storyContent = await fetchFromIPFS(cid, 'text');
            console.log(`Successfully fetched story content for token ${tokenId}:`, storyContent.substring(0, 100) + '...');
          } catch (e) {
            console.warn(`Failed to fetch story content from IPFS for token ${tokenId}:`, e);
            // Will try localStorage fallback below
          }
        } else {
          const isNullCid = cid.includes('000000000000000000000000000000') || /^Qm0+[a-z0-9]*$/i.test(cid);
          if (isNullCid) {
            console.warn(`Token ${tokenId} has null/placeholder story CID - IPFS content not uploaded. Will try localStorage fallback.`);
          } else {
            console.warn(`Invalid story CID for token ${tokenId}:`, cid, '(extracted from:', storyHash, ')');
          }
        }
      }

      // Try localStorage fallback if IPFS failed or data is incomplete
      try {
        if (typeof window !== 'undefined') {
          const cacheRaw = localStorage.getItem(`story_nft_${tokenId}`);
          if (cacheRaw) {
            const cache = JSON.parse(cacheRaw);
            console.log(`Found localStorage cache for token ${tokenId}:`, cache);
            console.log(`Cache author: ${cache.author}, Cache genre: ${cache.genre}`);
            
            // Always use cache if IPFS failed (null CIDs) - be more aggressive
            usedLocalCache = true;
            console.log(`Using localStorage fallback for token ${tokenId}`);
            
            // Merge cached metadata with what we have
            metadata = { ...metadata, ...(cache.metadata || {}) };
            if (!metadata.image && cache.metadata?.image) {
              metadata.image = cache.metadata.image;
            }
            
            // Use cached story content if we don't have it
            if (storyContent === 'Story content not available' && cache.storyContent) {
              storyContent = cache.storyContent;
            }
            
            // Also merge direct cache properties for author, genre, etc.
            if (cache.author) metadata.author = cache.author;
            if (cache.genre) metadata.genre = cache.genre;
            
            // Try to extract author/genre from cache metadata attributes
            if (cache.metadata?.attributes) {
              const authorAttr = cache.metadata.attributes.find((attr: any) => attr.trait_type === 'Author');
              const genreAttr = cache.metadata.attributes.find((attr: any) => attr.trait_type === 'Genre');
              if (authorAttr?.value) metadata.author = authorAttr.value;
              if (genreAttr?.value) metadata.genre = genreAttr.value;
            }
          } else {
            console.log(`No localStorage cache found for token ${tokenId}`);
          }
        }
      } catch (e) {
        console.warn(`Error accessing localStorage for token ${tokenId}:`, e);
      }

      // Parse images from metadata or localStorage
      let imagesArr: { url: string; chapter?: string; description?: string }[] = [];
      
      // First try to get images from metadata
      if (metadata.images && Array.isArray(metadata.images)) {
        imagesArr = metadata.images.map((img: any) => ({
          url: img.url || img,
          chapter: img.chapter,
          description: img.description
        }));
        console.log(`Found ${imagesArr.length} images in metadata for token ${tokenId}`);
      }
      
      // If no images in metadata, try localStorage
      if (imagesArr.length === 0) {
        try {
          if ((typeof window !== 'undefined')) {
            const cacheRaw = localStorage.getItem(`story_nft_${tokenId}`);
            if (cacheRaw) {
              const cache = JSON.parse(cacheRaw);
              if (cache.images && Array.isArray(cache.images)) {
                imagesArr = cache.images.map((img: any) => ({
                  url: img.url || img,
                  chapter: img.chapter,
                  description: img.description
                }));
                console.log(`Found ${imagesArr.length} images in localStorage for token ${tokenId}`);
              }
            }
          }
        } catch (e) {
          console.warn(`Error parsing images from localStorage for token ${tokenId}:`, e);
        }
      }

      // Determine content type
      const contentType = Number(storyDetails.contentType);

      // Final author resolution
      const finalAuthor = metadata.attributes?.find((attr: any) => attr.trait_type === 'Author')?.value || metadata.author || 'Unknown';
      const finalGenre = metadata.attributes?.find((attr: any) => attr.trait_type === 'Genre')?.value || metadata.genre || 'Unknown';
      
      console.log(`Final author for token ${tokenId}: ${finalAuthor}, Final genre: ${finalGenre}`);

      return {
        tokenId: tokenId.toString(),
        title: metadata.name || `Story NFT #${tokenId}`,
        description: metadata.description || 'No description available',
        imageUrl: metadata.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop&crop=center',
        storyContent,
        owner,
        genre: finalGenre,
        author: finalAuthor,
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

  const fetchNFTs = async (loadMore = false) => {
    setIsLoading(true);
    try {
      // Import contract utilities
      const { MonadStoryNFTReader, MONAD_STORY_NFT_ADDRESS } = await import('@/lib/contracts/monadStoryNFT');
      
      // Fetch NFTs sequentially with delays to avoid rate limiting
      const existingIds = new Set((loadMore ? nfts : []).map((n) => Number(n.tokenId)));
      const validNFTs: StoryNFT[] = loadMore ? [...nfts] : [];

      // 0) Auto-detect NFTs by scanning from 0 upwards, display immediately as found
      if (!loadMore) {
        console.log('Auto-detecting NFTs by scanning from token 0 upwards...');
        
        // Start from 0 and scan upwards to find all existing tokens
        let tokenId = 0;
        let consecutiveFailures = 0;
        const maxConsecutiveFailures = 3; // Stop after 3 consecutive failures
        const maxTokensToScan = 50; // Safety limit
        
        while (tokenId < maxTokensToScan && consecutiveFailures < maxConsecutiveFailures) {
          if (existingIds.has(tokenId)) {
            tokenId++;
            continue;
          }
          
          try {
            console.log(`Auto-scanning token ${tokenId}...`);
            const nftData = await fetchNFTData(tokenId);
            if (nftData) {
              console.log(`✅ Found NFT ${tokenId}:`, nftData.title);
              validNFTs.push(nftData);
              existingIds.add(tokenId);
              consecutiveFailures = 0; // Reset failure count on success
              
              // Sort by tokenId descending to show newest first and update immediately
              validNFTs.sort((a, b) => Number(b.tokenId) - Number(a.tokenId));
              setNfts([...validNFTs]); // Update UI immediately with found NFTs
              setIsLoading(false); // Stop loading spinner after first NFT is found
              
              // Small delay to avoid rate limiting
              await new Promise((r) => setTimeout(r, 200));
            } else {
              console.log(`❌ Token ${tokenId} does not exist`);
              consecutiveFailures++;
            }
          } catch (e) {
            console.warn(`Failed to fetch token ${tokenId}:`, e);
            consecutiveFailures++;
          }
          
          tokenId++;
        }
        
        console.log(`Auto-scan complete. Found ${validNFTs.length} NFTs. Last scanned token: ${tokenId - 1}`);
      }

      // If we have a highlight token, scan a window around it to pick up nearby recent mints
      let startToken = loadMore ? maxTokensChecked : (maxTokensChecked || 0);
      let tokensToCheck = 5;
      if (!loadMore && highlightTokenId) {
        const hl = Number(highlightTokenId);
        startToken = Math.max(0, hl - 10);
        tokensToCheck = 25; // scan a larger window around highlight
      }
      let endToken = startToken + tokensToCheck;
      let consecutiveMisses = 0;
      const maxConsecutiveMisses = 10; // stop early if we seem past the end
      const minDesired = 8; // try to show at least this many per fetch
      const hardCallCap = 200; // do not exceed this many owner/token calls per fetch
      let calls = 0;

      // Skip additional range scanning if we already found NFTs from auto-scan
      if (validNFTs.length > 0 && !loadMore) {
        console.log(`Auto-scan found ${validNFTs.length} NFTs, skipping additional range scan`);
      } else {
        console.log(`Starting range scan from ${startToken} to ${endToken}, already have ${validNFTs.length} NFTs`);
        for (let i = startToken; i < endToken && calls < hardCallCap; i++) {
          try {
            // Deduplicate
            if (existingIds.has(i)) continue;

            calls++;
            console.log(`Range scanning token ${i}...`);
            const nft = await fetchNFTData(i);
            if (nft) {
              console.log(`Range scan found NFT ${i}:`, nft.title);
              validNFTs.push(nft);
              existingIds.add(i);
              consecutiveMisses = 0; // reset on success
              
              // Update UI immediately for range scan too
              setNfts([...validNFTs]);
              setIsLoading(false); // Stop loading spinner after first NFT is found
            } else {
              consecutiveMisses++;
              console.log(`Token ${i} not found, consecutive misses: ${consecutiveMisses}`);
              // Don't stop early if we haven't found many NFTs yet - keep scanning
              if (consecutiveMisses >= maxConsecutiveMisses && validNFTs.length >= 3) {
                // Only stop if we have found several NFTs and hit many consecutive misses
                console.log(`Stopping range scan after ${consecutiveMisses} consecutive misses with ${validNFTs.length} NFTs found`);
                break;
              }
            }
            
            // Add delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
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
      }
      
      // Only set NFTs at the end if we're doing loadMore (since auto-scan updates immediately)
      if (loadMore) {
        setNfts(validNFTs);
      }
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
                {/* Display all images including the main one */}
                {selectedNFT.images && selectedNFT.images.length > 0 ? (
                  <div>
                    <h4 className="font-medium mb-2">Generated Images ({selectedNFT.images.length})</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedNFT.images.map((img, idx) => (
                        <div key={idx} className="aspect-video rounded overflow-hidden">
                          <img 
                            src={img.url} 
                            alt={img.description || `Image ${idx+1}`} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" 
                            onClick={() => window.open(img.url, '_blank')}
                          />
                          {img.description && (
                            <p className="text-xs text-muted-foreground mt-1 px-2">{img.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <img
                    src={selectedNFT.imageUrl}
                    alt={selectedNFT.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
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
