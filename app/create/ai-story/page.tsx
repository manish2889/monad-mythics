'use client';

import { motion } from 'framer-motion';
import {
  Sparkles,
  BookText,
  Wallet,
  NetworkIcon,
  ArrowLeft,
  PenSquare,
  BookOpen,
  Wand2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, Suspense } from 'react';

import AIStoryGenerator from '@/components/ai-story-generator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function AIStoryGeneratorPage() {
  return (
    <Suspense fallback={<div>Loading AI story page...</div>}>
      <AIStoryContent />
    </Suspense>
  );
}
function AIStoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [navigatedFrom, setNavigatedFrom] = useState<string | null>(null);

  // Get parameters from URL
  const source = searchParams.get('source');
  const genre = searchParams.get('genre') || 'fantasy';
  const format = searchParams.get('format') || 'free';

  // Create story creation data from URL parameters
  useEffect(() => {
    try {
      console.log('Setting up storyCreationData from URL parameters');

      // Create data from URL parameters
      const storyData = {
        type: 'ai',
        format,
        genre,
        redirectToCreate: !!source, // Set true if source exists
        timestamp: new Date().getTime(),
      };

      console.log('Created storyCreationData from URL params:', storyData);
      localStorage.setItem('storyCreationData', JSON.stringify(storyData));
    } catch (error) {
      console.error('Error setting up story creation data:', error);
      // Create fresh data with default values on error
      const defaultData = {
        type: 'ai',
        format: 'free',
        genre: 'fantasy',
        redirectToCreate: true,
        timestamp: new Date().getTime(),
      };
      localStorage.setItem('storyCreationData', JSON.stringify(defaultData));
    }
  }, [source, genre, format]);

  // Enhanced navigation detection from URL parameters
  useEffect(() => {
    // This runs when the component mounts to detect navigation source
    const detectNavigationSource = () => {
      // Check URL parameters for source
      if (source) {
        console.log('Navigation source from URL:', source);

        // Set the navigation source for customized welcome
        if (source === 'story') {
          setNavigatedFrom('story');

          toast({
            title: 'Inspired to create your own story?',
            description:
              'Now you can craft your unique story with our AI tools!',
          });
        } else if (
          source === 'stories' ||
          source === 'stories_page' ||
          source === 'stories_cta'
        ) {
          setNavigatedFrom('stories');

          toast({
            title: 'Ready to join our storytellers?',
            description: 'Create your own unique story with AI assistance.',
          });
        } else if (source === 'trending' || source === 'card') {
          setNavigatedFrom('trending');

          toast({
            title: 'Create your own amazing story!',
            description: `Start crafting your ${genre} masterpiece now.`,
          });
        } else {
          setNavigatedFrom('homepage');

          toast({
            title: "Let's create something amazing!",
            description: 'Fill out the story details below to get started.',
          });
        }
      } else {
        // Direct navigation (typed URL or bookmark)
        setNavigatedFrom('direct');
      }
    };

    // Run once on mount
    detectNavigationSource();
  }, [toast, source, genre]); // Add dependencies

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-12"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            className="flex items-center"
            onClick={() => {
              if (navigatedFrom === 'story') {
                router.back(); // Go back to the previous page
              } else if (
                navigatedFrom === 'stories' ||
                source?.includes('stories')
              ) {
                router.push('/stories');
              } else {
                router.push('/');
              }
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to{' '}
            {navigatedFrom === 'story'
              ? 'Story'
              : navigatedFrom === 'stories' || source?.includes('stories')
                ? 'Stories'
                : 'Home'}
          </Button>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
            ✨ Mythic Tale Forge ✨
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Harness the ancient powers of AI to weave legendary tales that transcend reality. 
            Each story becomes an immortal artifact, forever preserved in the mystical realm of blockchain.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg text-orange-600 mb-2">🔮 Conjure</h3>
              <p className="text-sm text-muted-foreground text-center">
                Channel mystical AI forces to birth legendary narratives from pure imagination
              </p>
            </div>

            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <BookText className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg text-red-600 mb-2">✨ Enchant</h3>
              <p className="text-sm text-muted-foreground text-center">
                Weave visual magic into your tales with AI-conjured illustrations
              </p>
            </div>

            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg text-pink-600 mb-2">🏛️ Immortalize</h3>
              <p className="text-sm text-muted-foreground text-center">
                Etch your masterpiece into the eternal blockchain archives
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              onClick={() => {
                // Direct navigation with URL parameters
                window.location.href = `/create/ai-story?source=homepage&format=free`;
              }}
            >
              <Wand2 className="mr-2 h-5 w-5" />
              ✨ Begin Forging ✨
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-orange-400 text-orange-600 hover:bg-orange-50 hover:border-orange-500 transition-all duration-300"
              asChild
            >
              <Link href="/stories">
                <BookOpen className="mr-2 h-5 w-5" />
                📚 Browse Legends
              </Link>
            </Button>
          </div>
        </div>

        <AIStoryGenerator />

        <div className="mt-16 p-8 border-2 border-dashed border-gradient-to-r from-orange-300 to-pink-300 rounded-2xl bg-gradient-to-br from-orange-50/30 to-pink-50/30">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent flex items-center">
            <Sparkles className="h-6 w-6 mr-3 text-orange-500" />
            The Ancient Art of Tale Forging
          </h2>
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p className="text-lg">
              🔮 <strong>The Mythic Tale Forge</strong> channels primordial AI energies to birth legendary narratives from the depths of imagination. 
              Each tale is woven with mystical threads and can be immortalized as sacred NFT artifacts on the eternal Monad blockchain.
            </p>
            <p>
              ✨ <strong>The Forging Process:</strong> Whisper your vision into the ethereal realm, choose your mystical parameters, 
              and watch as ancient AI spirits craft your legend. Your tale can then be crystallized into an immortal NFT, 
              creating an unbreakable bond between creator and creation across the blockchain dimensions.
            </p>
            <p>
              🏛️ <strong>Sacred Requirements:</strong> To perform the immortalization ritual, you must connect your mystical Web3 conduit 
              and ensure it resonates with the Monad network's frequencies. Only then can your tale transcend the mortal realm.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
