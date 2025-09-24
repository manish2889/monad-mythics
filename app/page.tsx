'use client';

import {
  BookOpen,
  Sparkles,
  ArrowRight,
  PenSquare,
  Wallet,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { GalaxyBackground } from '@/components/galaxy-background';
import { useWeb3 } from '@/components/providers/web3-provider';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { account, connectWallet } = useWeb3();

  return (
    <main className="flex min-h-screen flex-col relative">
      {/* Add the galaxy background */}
      <GalaxyBackground />

      {/* Updated overlay with reduced opacity */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-blue-950/80 pointer-events-none" />

      {/* Wrap all content in a relative container for proper z-indexing */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-20 min-h-[80vh] flex items-center">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center">
              <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent [text-shadow:_0_1px_30px_rgb(255_255_255_/_20%)] min-w-0">
                  Craft Legendary Tales with AI Magic
                </h1>

                <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                  Monad Mythics transforms your imagination into captivating
                  stories using advanced AI. Create, own, and trade your
                  narratives as unique NFTs.
                </p>

                <div className="flex flex-wrap gap-4 pt-4 justify-center">
                  <Link href="/create/ai-story">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/20 min-w-[160px] btn-comic"
                    >
                      <PenSquare className="mr-2 h-5 w-5" />
                      Create Story
                    </Button>
                  </Link>

                  {!account ? (
                    <Button
                      onClick={connectWallet}
                      variant="outline"
                      size="lg"
                      className="border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 min-w-[160px] btn-spring"
                    >
                      <Wallet className="mr-2 h-5 w-5" />
                      Connect Wallet
                    </Button>
                  ) : (
                    <Link href="/gallery">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-pink-600 to-purple-500 shadow-lg shadow-pink-500/20 min-w-[160px] btn-comic"
                      >
                        <Sparkles className="mr-2 h-5 w-5" />
                        Browse NFTs
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Updated NFT Gallery section */}
        <section className="py-16 bg-black/20 backdrop-blur-[1px]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                Legendary Tale Collection
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover extraordinary narratives crafted by AI and immortalized
                as digital collectibles
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Link href={`/nft-gallery/${i + 1}`} key={i}>
                  <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={
                          [
                            'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&h=600&fit=crop&q=80',
                            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop&q=80',
                            'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=600&fit=crop&q=80',
                          ][i] as string
                        }
                        alt={
                          [
                            'Digital Dreamer NFT',
                            'Echoes of Tomorrow NFT',
                            'Chronicles of the Forgotten NFT',
                          ][i] as string
                        }
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-xl">
                        {
                          [
                            'The Digital Dreamer',
                            'Echoes of Tomorrow',
                            'Chronicles of the Forgotten',
                          ][i]
                        }
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {
                          [
                            'A sci-fi adventure in a virtual world',
                            'Post-apocalyptic survival story',
                            'Fantasy tale of ancient magic',
                          ][i]
                        }
                      </p>
                    </div>
                    <div className="p-4 pt-0 flex justify-between">
                      <span className="text-sm flex items-center">
                        <Sparkles className="h-4 w-4 mr-1 text-primary" />
                        NFT #{i + 101}
                      </span>
                      <span className="text-sm">
                        By @{['neuralink', 'stargazer', 'cryptobard'][i]}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link href="/nft-gallery">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-600 to-red-600 btn-spring"
                >
                  Explore All Tales
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Trending Stories Section - COMMENTED OUT */}
        {/* <TrendingStories /> */}

        {/* Featured Creators Section - COMMENTED OUT */}
        {/* <FeaturedCreators /> */}

        {/* Updated How It Works section */}
        <section className="py-16 bg-black/20 backdrop-blur-[1px]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                Your Creative Journey
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Transform your wildest ideas into digital masterpieces
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Spark Imagination',
                  description:
                    'Feed your wildest concepts to our AI storyteller and watch as it weaves narratives beyond your dreams',
                },
                {
                  title: 'Forge Digital Legacy',
                  description:
                    'Transform your tale into an immortal NFT, securing your creative masterpiece on the blockchain forever',
                },
                {
                  title: 'Build Community',
                  description:
                    'Connect with fellow creators, share your stories, and discover amazing narratives from around the world',
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="border-2 border-muted/50 bg-background/50 rounded-lg p-6 h-full"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 p-4 rounded-full bg-muted/30">
                      {
                        [
                          <PenSquare
                            key="pen"
                            className="h-12 w-12 text-orange-500"
                          />,
                          <Sparkles
                            key="sparkles"
                            className="h-12 w-12 text-red-500"
                          />,
                          <BookOpen
                            key="book"
                            className="h-12 w-12 text-pink-500"
                          />,
                        ][i]
                      }
                    </div>
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground mt-2">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-16">
              <Link href="/create/ai-story">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-red-500 to-pink-500 btn-comic"
                >
                  Start Creating
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Updated CTA section */}
        <section className="py-16 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 backdrop-blur-[1px]">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                Ready to Unleash Your Creative Power?
              </h2>

              <p className="text-lg text-muted-foreground mb-8">
                Join the Monad Mythics community today and transform your ideas
                into unique stories powered by cutting-edge AI technology
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/create/ai-story">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-red-500 btn-comic"
                  >
                    Get Started Now
                  </Button>
                </Link>

                <Link href="/about">
                  <Button variant="outline" size="lg" className="btn-spring">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
