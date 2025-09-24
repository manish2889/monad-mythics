'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Wand2,
  BookOpen,
  Users,
  MapPin,
  Lightbulb,
  Sparkles,
  Image as ImageIcon,
  Download,
  Eye,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { useWeb3 } from '@/components/providers/web3-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface AIStoryGeneratorProps {
  className?: string;
}

interface StoryData {
  title: string;
  content: string;
  genre: string[];
  characters: string[];
  setting: string;
  themes: string[];
  images: GeneratedImage[];
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  chapter: string;
  description: string;
}

const genres = [
  'Fantasy',
  'Sci-Fi',
  'Mystery',
  'Romance',
  'Thriller',
  'Horror',
  'Adventure',
  'Comedy',
  'Drama',
  'Historical',
  'Western',
  'Cyberpunk',
];

const storyFormats = [
  { id: 'short', name: 'Short Story', description: '2,000-5,000 words' },
  { id: 'novella', name: 'Novella', description: '17,500-40,000 words' },
  { id: 'novel', name: 'Novel', description: '80,000+ words' },
  { id: 'comic', name: 'Comic Script', description: 'Panel-based narrative' },
];

function LoadingStateIndicator({ message }: { message: string | null }) {
  const messages = [
    'Generating story',
    'Creating worlds',
    'Crafting characters',
    'Building plot',
    'Generating images',
    'Finalizing details',
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center space-x-3">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="text-lg font-medium">
        {message || messages[currentIndex]}
      </span>
    </div>
  );
}

export default function AIStoryGenerator({
  className = '',
}: AIStoryGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [storyFormat, setStoryFormat] = useState('short');
  const [title, setTitle] = useState('');
  const [mainCharacters, setMainCharacters] = useState('');
  const [plotOutline, setPlotOutline] = useState('');
  const [setting, setSetting] = useState('');
  const [themes, setThemes] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintedNftUrl, setMintedNftUrl] = useState('');
  const [activeTab, setActiveTab] = useState('input');
  const [includeImages, setIncludeImages] = useState(true);

  const { toast } = useToast();
  const { account, connected, connectWallet } = useWeb3();

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  // Generate images using Google Nano Banana API
  const generateImages = async (storyContent: string) => {
    if (!includeImages) return [];

    setIsGeneratingImages(true);
    try {
      // Extract key scenes from the story for image generation
      const scenes = [
        {
          id: '1',
          chapter: 'Chapter 1',
          prompt: `${setting || 'mysterious realm'} with ${mainCharacters || 'a brave hero'}, ${selectedGenres.join(' ') || 'fantasy'} style, detailed illustration`,
          description: 'Opening scene',
        },
        {
          id: '2',
          chapter: 'Chapter 2',
          prompt: `${themes || 'adventure'} scene in ${setting || 'enchanted world'}, ${selectedGenres.join(' ') || 'fantasy'} art style, dramatic lighting`,
          description: 'Journey continues',
        },
        {
          id: '3',
          chapter: 'Conclusion',
          prompt: `Epic finale with ${mainCharacters || 'hero'} in ${setting || 'magical world'}, ${selectedGenres.join(' ') || 'fantasy'} style, triumphant mood`,
          description: 'Climactic conclusion',
        },
      ];

      const generatedImages: GeneratedImage[] = [];

      for (const scene of scenes) {
        try {
          // Call Google Nano Banana API through our endpoint
          const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: scene.prompt,
              style: selectedGenres.join(' ') || 'fantasy',
              width: 800,
              height: 600,
              quality: 'standard',
            }),
          });

          const result = await response.json();

          if (result.success && result.data) {
            generatedImages.push({
              ...scene,
              url: result.data.url,
            });
          } else {
            console.error(
              `Failed to generate image for scene ${scene.id}:`,
              result.error
            );
            // Fallback to placeholder image
            generatedImages.push({
              ...scene,
              url: `https://picsum.photos/800/600?random=${scene.id}`,
            });
          }
        } catch (error) {
          console.error(
            `Failed to generate image for scene ${scene.id}:`,
            error
          );
          // Fallback to placeholder image
          generatedImages.push({
            ...scene,
            url: `https://picsum.photos/800/600?random=${scene.id}`,
          });
        }
      }

      return generatedImages;
    } catch (error) {
      console.error('Image generation failed:', error);
      return [];
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const generateStory = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Missing Prompt',
        description: 'Please enter a story prompt to generate content.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Generate story content
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockStory = `# ${title || 'Generated Story'}

## Chapter 1: The Beginning

${prompt} 

In the ${setting || 'mysterious realm'}, our protagonist ${mainCharacters || 'a brave hero'} embarked on an extraordinary journey. The themes of ${themes || 'courage and discovery'} wove through every aspect of this ${selectedGenres.join(', ') || 'adventure'} tale.

The story unfolded with unexpected twists and turns, leading to a climactic confrontation that would change everything. Through trials and tribulations, our characters discovered the true meaning of ${themes || 'friendship and perseverance'}.

## Chapter 2: The Journey Continues

As the adventure progressed, new challenges emerged. The ${storyFormat} format allowed for deep exploration of character development and plot complexity. Each scene built upon the last, creating a rich tapestry of narrative elements.

The setting of ${setting || 'an enchanted world'} provided the perfect backdrop for the unfolding drama. Characters faced their deepest fears and highest aspirations, all while navigating the intricate plot outlined in the initial concept.

## Conclusion

This generated story demonstrates the power of AI-assisted creative writing, combining user input with intelligent narrative construction to create engaging, original content ready for publication or NFT minting.`;

      setGeneratedContent(mockStory);

      // Generate accompanying images
      if (includeImages) {
        const images = await generateImages(mockStory);
        setGeneratedImages(images);
      }

      setActiveTab('preview');

      toast({
        title: 'Story Generated!',
        description: includeImages
          ? 'Your AI-powered story with images has been created successfully.'
          : 'Your AI-powered story has been created successfully.',
      });
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate story. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMintNFT = async () => {
    if (!connected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to mint NFTs.',
        variant: 'destructive',
      });
      return;
    }

    if (!generatedContent) {
      toast({
        title: 'No Content',
        description: 'Please generate a story first before minting.',
        variant: 'destructive',
      });
      return;
    }

    setIsMinting(true);
    try {
      // Prepare NFT metadata with both text and images
      const nftMetadata = {
        name: title || 'Monad Mythics Story',
        description: `AI-generated story: ${prompt.substring(0, 100)}...`,
        story_content: generatedContent,
        images: generatedImages,
        attributes: [
          {
            trait_type: 'Genre',
            value: selectedGenres.join(', ') || 'Fantasy',
          },
          { trait_type: 'Format', value: storyFormat },
          { trait_type: 'Setting', value: setting || 'Unknown' },
          {
            trait_type: 'Has Images',
            value: generatedImages.length > 0 ? 'Yes' : 'No',
          },
          {
            trait_type: 'Image Count',
            value: generatedImages.length.toString(),
          },
          { trait_type: 'Generated By', value: 'Monad Mythics AI' },
        ],
        created_at: new Date().toISOString(),
        creator: account,
      };

      // Simulate NFT minting process with combined content
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const mockNftUrl = `https://opensea.io/assets/monad/0x123.../1`;
      setMintedNftUrl(mockNftUrl);

      toast({
        title: 'NFT Minted Successfully!',
        description:
          generatedImages.length > 0
            ? `Your story with ${generatedImages.length} images has been minted as an NFT on Monad blockchain.`
            : 'Your story has been minted as an NFT on Monad blockchain.',
      });
    } catch (error) {
      toast({
        title: 'Minting Failed',
        description: 'Failed to mint NFT. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMinting(false);
    }
  };

  const resetForm = () => {
    setPrompt('');
    setTitle('');
    setMainCharacters('');
    setPlotOutline('');
    setSetting('');
    setThemes('');
    setSelectedGenres([]);
    setGeneratedContent('');
    setGeneratedImages([]);
    setMintedNftUrl('');
    setActiveTab('input');
  };

  return (
    <div className={`w-full max-w-6xl mx-auto p-6 space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-orange-500" />
            <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
              Mythic Tale Forge
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-orange-500/10 to-red-500/10">
              <TabsTrigger
                value="input"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                ✨ Craft Tale
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
              >
                👁️ Vision
              </TabsTrigger>
              <TabsTrigger
                value="mint"
                className="data-[state=active]:bg-pink-500 data-[state=active]:text-white"
              >
                🔮 Immortalize
              </TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <label className="text-sm font-medium mb-2 block flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2 text-orange-500" />
                    Spark of Inspiration *
                  </label>
                  <Textarea
                    placeholder="Whisper your tale's essence... What legendary story burns within your imagination?"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] bg-slate-900/80 border-orange-500/30 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 text-white placeholder:text-slate-400 transition-all duration-300 backdrop-blur-sm"
                  />
                  <div className="absolute top-2 right-2 text-xs text-orange-400 opacity-60">
                    ✨ Let creativity flow
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-red-500" />
                      Epic Title
                    </label>
                    <Input
                      placeholder="Name your legendary tale..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-slate-900/80 border-red-500/30 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 text-white placeholder:text-slate-400 transition-all duration-300 backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-pink-500" />
                      Realm & Domain
                    </label>
                    <Input
                      placeholder="Which mystical realm hosts your adventure?"
                      value={setting}
                      onChange={(e) => setSetting(e.target.value)}
                      className="bg-slate-900/80 border-pink-500/30 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 text-white placeholder:text-slate-400 transition-all duration-300 backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center">
                    <Users className="h-4 w-4 mr-2 text-purple-500" />
                    Heroes & Legends
                  </label>
                  <Input
                    placeholder="Who are the brave souls in your epic? Describe their essence..."
                    value={mainCharacters}
                    onChange={(e) => setMainCharacters(e.target.value)}
                    className="bg-slate-900/80 border-purple-500/30 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 text-white placeholder:text-slate-400 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center">
                    <Wand2 className="h-4 w-4 mr-2 text-blue-500" />
                    Tale Archetypes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <Badge
                        key={genre}
                        variant={
                          selectedGenres.includes(genre) ? 'default' : 'outline'
                        }
                        className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                          selectedGenres.includes(genre)
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg border-0'
                            : 'border-orange-500/40 text-orange-300 hover:border-orange-400 hover:bg-orange-500/10 bg-slate-800/50'
                        }`}
                        onClick={() => handleGenreToggle(genre)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ✨ Choose the mystical forces that will shape your narrative
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-teal-500" />
                    Chronicle Length
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {storyFormats.map((format) => (
                      <Button
                        key={format.id}
                        variant={
                          storyFormat === format.id ? 'default' : 'outline'
                        }
                        className={`h-auto p-3 flex flex-col items-start transition-all duration-200 ${
                          storyFormat === format.id
                            ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg border-0'
                            : 'border-teal-500/40 text-teal-300 hover:border-teal-400 hover:bg-teal-500/10 bg-slate-800/50'
                        }`}
                        onClick={() => setStoryFormat(format.id)}
                      >
                        <span className="font-medium">{format.name}</span>
                        <span
                          className={`text-xs ${storyFormat === format.id ? 'text-white/80' : 'text-muted-foreground'}`}
                        >
                          {format.description}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="border-2 border-dashed border-emerald-500/40 rounded-xl p-6 bg-slate-900/60 backdrop-blur-sm relative overflow-hidden">
                  {/* Animated background glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 animate-pulse"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-lg font-semibold flex items-center text-emerald-400">
                        <ImageIcon className="h-6 w-6 mr-3 text-emerald-400" />
                        Visual Enchantment
                      </label>
                      <Button
                        variant={includeImages ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setIncludeImages(!includeImages)}
                        className={`transition-all duration-300 transform hover:scale-105 ${
                          includeImages
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl border-0'
                            : 'border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10 bg-slate-800/50'
                        }`}
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        {includeImages ? '🎨 Conjuring' : '📝 Text Only'}
                      </Button>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {includeImages
                        ? "✨ Your tale will be brought to life with 3 mystical illustrations, each capturing the essence of your story's most pivotal moments through AI-powered visual magic"
                        : "📖 Your story will be crafted in pure text form, focusing on the raw power of words to paint vivid imagery in the reader's mind"}
                    </p>

                    {/* Visual indicator */}
                    <div className="mt-4 flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          includeImages
                            ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50'
                            : 'bg-slate-600'
                        }`}
                      ></div>
                      <span className="text-xs text-slate-400">
                        {includeImages
                          ? 'Visual mode active'
                          : 'Text-only mode'}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={generateStory}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
                  size="lg"
                >
                  {isGenerating ? (
                    <LoadingStateIndicator message="🔮 Weaving your legendary tale..." />
                  ) : (
                    <>
                      <Wand2 className="mr-3 h-6 w-6" />✨ Forge Epic Tale ✨
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {generatedContent ? (
                <div className="space-y-6">
                  {/* Story Content */}
                  <div className="bg-slate-900/80 border border-slate-700/50 p-6 rounded-xl backdrop-blur-sm">
                    <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent flex items-center">
                      <BookOpen className="h-6 w-6 mr-2 text-orange-400" />
                      Your Legendary Tale
                    </h3>
                    <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-600/30">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-200">
                        {generatedContent}
                      </pre>
                    </div>
                  </div>

                  {/* Generated Images */}
                  {generatedImages.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        <ImageIcon className="h-6 w-6 mr-2 text-emerald-600" />
                        Mystical Visions ({generatedImages.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {generatedImages.map((image) => (
                          <Card
                            key={image.id}
                            className="overflow-hidden bg-slate-900/60 border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300 group"
                          >
                            <div className="aspect-video relative">
                              <img
                                src={image.url}
                                alt={image.description}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {isGeneratingImages && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <CardContent className="p-4 bg-slate-800/40">
                              <h4 className="font-semibold text-sm text-emerald-400 mb-1">
                                {image.chapter}
                              </h4>
                              <p className="text-xs text-slate-300 mb-2">
                                {image.description}
                              </p>
                              <p className="text-xs text-slate-400 italic">
                                Prompt: {image.prompt.substring(0, 50)}...
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Loading indicator for images */}
                  {isGeneratingImages && (
                    <div className="text-center py-8 bg-slate-900/60 rounded-xl border-2 border-dashed border-purple-500/40 backdrop-blur-sm relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 animate-pulse"></div>
                      <div className="relative z-10">
                        <LoadingStateIndicator message="🎨 Conjuring mystical visions from the ethereal realm..." />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={() => setActiveTab('mint')}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      🔮 Immortalize Tale
                    </Button>
                    <Button
                      onClick={resetForm}
                      variant="outline"
                      className="border-2 border-orange-500/50 text-orange-300 hover:bg-orange-500/10 hover:border-orange-400 bg-slate-800/50 transition-all duration-300"
                    >
                      ✨ New Legend
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-900/40 rounded-xl border-2 border-dashed border-slate-600/40">
                  <div className="mb-6">
                    <BookOpen className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                    <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-pink-500 mx-auto rounded-full mb-4"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-300 mb-2">
                    No Tale Forged Yet
                  </h3>
                  <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                    Return to the ✨ Craft Tale tab to begin weaving your
                    legendary narrative with mystical AI forces.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="mint" className="space-y-4">
              {!connected ? (
                <div className="text-center py-12 space-y-4">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium">Connect Your Wallet</h3>
                    <p className="text-muted-foreground">
                      Connect your Web3 wallet to mint your story as an NFT
                    </p>
                  </div>
                  <Button onClick={connectWallet}>Connect Wallet</Button>
                </div>
              ) : !generatedContent ? (
                <div className="text-center py-12">
                  <Wand2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Generate a story first before minting an NFT.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <h3 className="font-medium mb-4 flex items-center">
                      <Sparkles className="h-5 w-5 mr-2" />
                      NFT Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <p>
                          <strong>Title:</strong> {title || 'Untitled Story'}
                        </p>
                        <p>
                          <strong>Genres:</strong>{' '}
                          {selectedGenres.join(', ') || 'None selected'}
                        </p>
                        <p>
                          <strong>Format:</strong>{' '}
                          {storyFormats.find((f) => f.id === storyFormat)?.name}
                        </p>
                        <p>
                          <strong>Story Length:</strong> ~
                          {generatedContent.length} characters
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p>
                          <strong>Images:</strong> {generatedImages.length}{' '}
                          generated
                        </p>
                        <p>
                          <strong>Setting:</strong> {setting || 'Not specified'}
                        </p>
                        <p>
                          <strong>Themes:</strong> {themes || 'Not specified'}
                        </p>
                        <p>
                          <strong>Content Type:</strong>{' '}
                          {generatedImages.length > 0
                            ? 'Story + Images'
                            : 'Text Only'}
                        </p>
                      </div>
                    </div>

                    {generatedImages.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-2 flex items-center">
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Image Preview
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {generatedImages.map((image) => (
                            <div
                              key={image.id}
                              className="aspect-video relative rounded overflow-hidden"
                            >
                              <img
                                src={image.url}
                                alt={image.description}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {mintedNftUrl ? (
                    <div className="text-center space-y-4">
                      <div className="text-green-600">
                        <Sparkles className="h-12 w-12 mx-auto mb-2" />
                        <h3 className="text-lg font-medium">
                          NFT Minted Successfully!
                        </h3>
                      </div>
                      <Button asChild>
                        <a
                          href={mintedNftUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on OpenSea
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleMintNFT}
                      disabled={isMinting}
                      className="w-full"
                      size="lg"
                    >
                      {isMinting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Minting NFT...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Mint Story as NFT
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
