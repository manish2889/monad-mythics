'use client';

import { http, createConfig } from 'wagmi';
import { mainnet, sepolia, polygon, polygonMumbai, base, baseSepolia, arbitrum, arbitrumSepolia, optimism, optimismSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';
import { defineChain } from 'viem';

// Get project ID from environment variables
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'your-project-id';

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
      http: ['https://testnet-rpc.monad.xyz/'],
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
    // WalletConnect
    walletConnect({
      projectId,
      metadata: {
        name: 'GroqTales',
        description: 'AI-Generated Story NFTs',
        url: process.env.NEXT_PUBLIC_URL || 'https://groqtales.com',
        icons: ['/logo.png'],
      },
    }),
  ],
  transports: {
    [monadTestnet.id]: http(),
  },
});

export type Config = typeof wagmiConfig;
