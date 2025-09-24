'use client';

import React, { useState } from 'react';
import { useMonadStoryNFT } from '@/hooks/useMonadStoryNFT';
import { useWeb3 } from '@/components/providers/web3-provider';

interface StoryNFTMinterProps {
  onMintSuccess?: (tokenId: string, txHash: string) => void;
  onMintError?: (error: Error) => void;
}

export function StoryNFTMinter({ onMintSuccess, onMintError }: StoryNFTMinterProps) {
  const { connected, connectWallet } = useWeb3();
  const {
    mintPrice,
    maxSupply,
    userBalance,
    isOwner,
    loading: contractLoading,
    error: contractError,
    mintStory,
    validateMetadata,
  } = useMonadStoryNFT();

  // Form state
  const [storyHash, setStoryHash] = useState('');
  const [metadataURI, setMetadataURI] = useState('');
  const [imageCount, setImageCount] = useState(0);
  const [minting, setMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [mintSuccess, setMintSuccess] = useState<string | null>(null);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected) {
      await connectWallet();
      return;
    }

    setMinting(true);
    setMintError(null);
    setMintSuccess(null);

    try {
      // Prepare metadata
      const metadata = {
        storyHash: storyHash.trim(),
        metadataURI: metadataURI.trim(),
        imageCount,
      };

      // Validate metadata
      const validation = validateMetadata(metadata);
      if (!validation.valid) {
        throw new Error(`Invalid metadata: ${validation.errors.join(', ')}`);
      }

      // Mint the NFT
      const result = await mintStory(metadata);
      
      setMintSuccess(`Story NFT minted successfully! Token ID: ${result.tokenId}, Transaction: ${result.transactionHash}`);
      
      // Clear form
      setStoryHash('');
      setMetadataURI('');
      setImageCount(0);

      // Call success callback
      onMintSuccess?.(result.tokenId, result.transactionHash);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mint NFT';
      setMintError(errorMessage);
      onMintError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setMinting(false);
    }
  };

  if (contractLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading contract data...</span>
      </div>
    );
  }

  if (contractError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-semibold">Contract Error</h3>
        <p className="text-red-600">{contractError}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mint Story NFT</h2>
        <p className="text-gray-600">Create a unique story NFT on the Monad network</p>
      </div>

      {/* Contract Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">Contract Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Mint Price:</span>
            <span className="ml-2 font-mono">{mintPrice || 'Loading...'} ETH</span>
          </div>
          <div>
            <span className="text-gray-600">Max Supply:</span>
            <span className="ml-2 font-mono">{maxSupply || 'Loading...'}</span>
          </div>
          <div>
            <span className="text-gray-600">Your Balance:</span>
            <span className="ml-2 font-mono">{userBalance !== null ? userBalance : 'N/A'} NFTs</span>
          </div>
          <div>
            <span className="text-gray-600">Owner Status:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${isOwner ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              {isOwner ? 'Owner' : 'User'}
            </span>
          </div>
        </div>
      </div>

      {/* Mint Form */}
      <form onSubmit={handleMint} className="space-y-4">
        <div>
          <label htmlFor="storyHash" className="block text-sm font-medium text-gray-700 mb-1">
            Story Hash (IPFS CID)
          </label>
          <input
            type="text"
            id="storyHash"
            value={storyHash}
            onChange={(e) => setStoryHash(e.target.value)}
            placeholder="QmYourStoryHashHere..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            The IPFS hash of your story content
          </p>
        </div>

        <div>
          <label htmlFor="metadataURI" className="block text-sm font-medium text-gray-700 mb-1">
            Metadata URI
          </label>
          <input
            type="text"
            id="metadataURI"
            value={metadataURI}
            onChange={(e) => setMetadataURI(e.target.value)}
            placeholder="QmYourMetadataHashHere..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            The IPFS hash of your NFT metadata JSON
          </p>
        </div>

        <div>
          <label htmlFor="imageCount" className="block text-sm font-medium text-gray-700 mb-1">
            Image Count
          </label>
          <input
            type="number"
            id="imageCount"
            value={imageCount}
            onChange={(e) => setImageCount(parseInt(e.target.value) || 0)}
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Number of images in your story (0 for text-only)
          </p>
        </div>

        {/* Error Display */}
        {mintError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-800 text-sm">{mintError}</p>
          </div>
        )}

        {/* Success Display */}
        {mintSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-green-800 text-sm">{mintSuccess}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={minting || !connected}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            minting || !connected
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {!connected ? (
            'Connect Wallet to Mint'
          ) : minting ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Minting...
            </span>
          ) : (
            `Mint Story NFT (${mintPrice || '...'} ETH)`
          )}
        </button>
      </form>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">How to mint a Story NFT:</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Upload your story content to IPFS and get the hash</li>
          <li>Create metadata JSON with title, description, and image</li>
          <li>Upload metadata to IPFS and get the hash</li>
          <li>Enter both hashes and image count in the form above</li>
          <li>Click "Mint Story NFT" and confirm the transaction</li>
        </ol>
      </div>
    </div>
  );
}
