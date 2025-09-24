import React from 'react';

import './globals.css';
import fs from 'fs';
import path from 'path';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';

import BackToTop from '@/components/back-to-top';
import ClientLayout from '@/components/client-layout';
import { Header } from '@/components/header';
import { AnimatedLayout } from '@/components/layout/animated-layout';
import { Web3Provider } from '@/components/providers/web3-provider'; // DISABLED VERSION FOR PRODUCTION
import { QueryProvider } from '@/components/query-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

// Optimize font loading
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

// Build-time environment variable validation
const requiredEnvVars = [
  'NEXT_PUBLIC_URL',
  // 'NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME', // Commented out OnChain references
  'NEXT_PUBLIC_VERSION',
  'NEXT_PUBLIC_IMAGE_URL',
  'NEXT_PUBLIC_SPLASH_IMAGE_URL',
  'NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR',
];

// Validate required environment variables at build time (only in production)
// Skip validation during build process (CI/Vercel build)
if (
  process.env.NODE_ENV === 'production' &&
  !process.env.CI &&
  !process.env.NEXT_PUBLIC_BUILD_MODE
) {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
} else {
  // In development or build mode, set default values for missing environment variables
  const defaultEnvVars: Record<string, string> = {
    NEXT_PUBLIC_URL: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000',
    // 'NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME': 'GroqTales', // Commented out OnChain references
    NEXT_PUBLIC_VERSION: '1.0.0',
    NEXT_PUBLIC_IMAGE_URL: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/images`
      : 'https://groqtales.com/images',
    NEXT_PUBLIC_SPLASH_IMAGE_URL: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/splash.jpg`
      : 'https://groqtales.com/splash.jpg',
    NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR: '#1a1a2e',
  };

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      process.env[envVar] = defaultEnvVars[envVar];
    }
  }
}

// Get quick boot script content
function getQuickBootScript(): string {
  try {
    const filePath = path.join(process.cwd(), 'public', 'quick-boot.js');
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    console.warn('Could not read quick-boot.js:', e);
    return ''; // Return empty string if file reading fails
  }
}

// Quick boot script to prevent flashing and improve initial load
const quickBootScript = getQuickBootScript();

export const metadata: Metadata = {
  title: 'Monad Mythics - AI-Generated Story NFTs',
  description:
    'Create, mint, and share AI-generated stories as NFTs on the Monad blockchain.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://groqtales.com'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      {
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111111' },
  ],
};

// Disable static optimization for the entire app layout to prevent build-time
// evaluation of client components that access browser-only globals.
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Force dynamic rendering to avoid static export attempting to execute
  // client-only logic (e.g., window / localStorage usage) during build.
  // This mitigates build errors like "window is not defined" across pages
  // that are intentionally client components.
  // (Next.js will ignore static optimization for this layout subtree.)
  // Ref: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _forceDynamic: 'force-dynamic' = 'force-dynamic';
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline critical JS for fastest possible execution */}
        <script dangerouslySetInnerHTML={{ __html: quickBootScript }} />

        {/* Preload critical resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Optimize for performance */}
        <meta name="color-scheme" content="light dark" />

        {/* Performance optimization scripts */}
        <Script
          id="theme-fix"
          src="/theme-fix.js"
          strategy="beforeInteractive"
        />
        <Script
          id="performance-fix"
          src="/performance-fix.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${inter.className} optimize-paint`}>
        <Web3Provider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              disableTransitionOnChange={false}
              storageKey="monad-mythics-theme"
            >
              <AnimatedLayout>
                <ClientLayout>
                  <div className="min-h-screen bg-background flex flex-col">
                    <Header />
                    <main className="container mx-auto px-4 py-6 flex-grow">
                      {children}
                    </main>
                  </div>
                </ClientLayout>
              </AnimatedLayout>
              <Toaster />
              <BackToTop />
            </ThemeProvider>
          </QueryProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
