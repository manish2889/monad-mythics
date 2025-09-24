import { NextRequest, NextResponse } from 'next/server';
import { getIPFSFallbackUrls } from '@/utils/ipfs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cidRaw = searchParams.get('cid') || '';
  const as = (searchParams.get('as') || 'json') as 'json' | 'text';

  const cid = cidRaw.replace(/^ipfs:\/\//, '').replace(/^\/?ipfs\//, '');
  if (!cid) {
    return NextResponse.json({ error: 'cid query param required' }, { status: 400 });
  }

  const urls = getIPFSFallbackUrls(cid);
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { Accept: as === 'json' ? 'application/json' : 'text/plain' } });
      if (!res.ok) continue;
      const data = as === 'json' ? await res.json() : await res.text();
      const response = NextResponse.json({ data });
      response.headers.set('Access-Control-Allow-Origin', '*');
      return response;
    } catch (_) {
      // try the next gateway
    }
  }

  return NextResponse.json({ error: 'All IPFS gateways failed' }, { status: 502 });
}
