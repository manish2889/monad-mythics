import { NextRequest, NextResponse } from 'next/server';

// Pinata endpoints
const PINATA_BASE_URL = 'https://api.pinata.cloud';
const PIN_FILE = `${PINATA_BASE_URL}/pinning/pinFileToIPFS`;
const PIN_JSON = `${PINATA_BASE_URL}/pinning/pinJSONToIPFS`;

// Prefer JWT if provided, otherwise fall back to key/secret
const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY; // may exist server-side too
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const kind: 'json' | 'text' | 'file' = body.kind || 'json';
    const content = body.content;
    const metadata = body.metadata || {};

    if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_API_SECRET)) {
      return NextResponse.json(
        { error: 'Pinata credentials are not configured on the server' },
        { status: 500 }
      );
    }

    if (kind === 'json') {
      const payload = {
        pinataContent: content,
        pinataMetadata: {
          name: metadata?.name || 'GroqTales JSON',
          ...metadata,
        },
        pinataOptions: { cidVersion: 1 },
      };

      const res = await fetch(PIN_JSON, {
        method: 'POST',
        headers: PINATA_JWT
          ? {
              Authorization: `Bearer ${PINATA_JWT}`,
              'Content-Type': 'application/json',
            }
          : {
              pinata_api_key: PINATA_API_KEY as string,
              pinata_secret_api_key: PINATA_API_SECRET as string,
              'Content-Type': 'application/json',
            },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text();
        return NextResponse.json({ error: t }, { status: res.status });
      }
      const data = await res.json();
      return NextResponse.json({ cid: data.IpfsHash }, { status: 200 });
    }

    // text/file path -> use pinFileToIPFS
    const form = new FormData();

    if (kind === 'text') {
      const blob = new Blob([String(content ?? '')], { type: 'text/plain' });
      form.append('file', blob, 'content.txt');
    } else if (kind === 'file') {
      // Expect content to be base64 { name, mime, base64 }
      const { name, mime, base64 } = content || {};
      if (!name || !mime || !base64) {
        return NextResponse.json({ error: 'Invalid file payload' }, { status: 400 });
      }
      const bin = Buffer.from(base64, 'base64');
      const blob = new Blob([bin], { type: mime });
      form.append('file', blob, name);
    }

    form.append(
      'pinataMetadata',
      JSON.stringify({ name: metadata?.name || 'GroqTales Content', ...metadata })
    );
    form.append('pinataOptions', JSON.stringify({ cidVersion: 1, wrapWithDirectory: false }));

    const res = await fetch(PIN_FILE, {
      method: 'POST',
      headers: PINATA_JWT
        ? { Authorization: `Bearer ${PINATA_JWT}` }
        : {
            pinata_api_key: PINATA_API_KEY as string,
            pinata_secret_api_key: PINATA_API_SECRET as string,
          },
      body: form,
    });

    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: t }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ cid: data.IpfsHash }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}
