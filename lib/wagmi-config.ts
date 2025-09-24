'use client';

import { http, createConfig } from 'wagmi';
import { mainnet, sepolia, polygon, polygonMumbai, base, baseSepolia, arbitrum, arbitrumSepolia, optimism, optimismSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';
import { defineChain, fallback } from 'viem';

// WalletConnect removed to avoid unexpected QR modal

// Define Monad Testnet chain
export const monadTestnet = defineChain({
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
        'https://testnet-rpc.monad.xyz/',
        'https://monad-testnet.g.alchemy.com/v2/hXhQfjPGOQhoXyl3yAd0jfL88WodwAnf', // Backup RPC for rate limiting
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

// Define the chains your app supports - Only Monad Testnet
export const chains = [
  monadTestnet,
] as const;

// Configure wagmi
export const wagmiConfig = createConfig({
  chains,
  connectors: [
    // MetaMask and other injected wallets
    injected({
      shimDisconnect: true,
    }),
    // Coinbase Wallet
    coinbaseWallet({
      appName: 'GroqTales',
      appLogoUrl: '/logo.png',
    }),
  ],
  transports: {
    // Try Alchemy first, then public endpoint with fallback & retries
    [monadTestnet.id]: fallback([
      http(monadTestnet.rpcUrls.default.http[1] || monadTestnet.rpcUrls.default.http[0], {
        retryCount: 3,
        retryDelay: 400,
        timeout: 15000,
      }),
      http(monadTestnet.rpcUrls.default.http[0], {
        retryCount: 3,
        retryDelay: 400,
        timeout: 15000,
      }),
    ]),
  },
});

export type Config = typeof wagmiConfig;
