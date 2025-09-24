import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, parseAbiItem, defineChain } from 'viem';
import MonadStoryNFT from '@/lib/contracts/MonadStoryNFT.json';
import { MONAD_STORY_NFT_ADDRESS } from '@/lib/contracts/monadStoryNFT';

// Define Monad Testnet chain directly to avoid client module import issues
const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: [
        'https://monad-testnet.g.alchemy.com/v2/hXhQfjPGOQhoXyl3yAd0jfL88WodwAnf',
        'https://testnet-rpc.monad.xyz/',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet.monadexplorer.com/',
    },
  },
  testnet: true,
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const maxParam = Number(searchParams.get('max') || '24');
    const max = Math.max(1, Math.min(100, maxParam));
    const lookbackParam = searchParams.get('lookback');
    const lookback = lookbackParam ? BigInt(lookbackParam) : 100n; // limit to 100 blocks due to RPC restrictions

    const rpc = monadTestnet.rpcUrls.default.http[1] || monadTestnet.rpcUrls.default.http[0];
    const client = createPublicClient({ chain: monadTestnet, transport: http(rpc) });

    const latest = await client.getBlockNumber();
    const fromBlock = latest > lookback ? latest - lookback : 0n;

    // Define the event signature via ABI fragment
    const event = parseAbiItem('event StoryMinted(uint256 indexed tokenId, address indexed owner, string storyHash, string metadataURI, uint256 imageCount, uint8 contentType)');

    const storyLogs = await client.getLogs({
      address: MONAD_STORY_NFT_ADDRESS,
      event,
      fromBlock,
      toBlock: latest,
      strict: false,
    });

    let allTokenIds: number[] = [];

    // Extract from StoryMinted logs
    for (const log of storyLogs) {
      try {
        const tokenId = log.args?.tokenId;
        if (typeof tokenId === 'bigint') {
          allTokenIds.push(Number(tokenId));
        }
      } catch {}
    }

    // Fallback to Transfer logs if no StoryMinted logs found
    if (allTokenIds.length === 0) {
      const transferEvent = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)');
      const transferLogs = await client.getLogs({
        address: MONAD_STORY_NFT_ADDRESS,
        event: transferEvent,
        fromBlock,
        toBlock: latest,
        strict: false,
      });
      
      for (const log of transferLogs) {
        try {
          const tokenId = log.args?.tokenId;
          if (typeof tokenId === 'bigint') {
            allTokenIds.push(Number(tokenId));
          }
        } catch {}
      }
    }

    // Deduplicate and sort (descending)
    const ids = Array.from(new Set(allTokenIds))
      .sort((a, b) => b - a)
      .slice(0, max);

    return NextResponse.json({ tokenIds: ids }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch latest NFTs' }, { status: 500 });
  }
}
