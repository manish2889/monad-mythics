'use client';

import { useSearchParams } from 'next/navigation';
import { NFTGallery } from '@/components/nft-gallery';

export default function GalleryPage() {
  const searchParams = useSearchParams();
  const highlightTokenId = searchParams.get('highlight');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <NFTGallery highlightTokenId={highlightTokenId || undefined} />
    </div>
  );
}
