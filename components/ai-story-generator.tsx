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
  User,
  Upload,
  File,
  X,
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

import { useWeb3 } from '@/components/providers/web3-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { uploadToIPFS, getIPFSUrl } from '@/utils/ipfs';

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
  const [author, setAuthor] = useState('');
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

  // File upload states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileAnalysis, setFileAnalysis] = useState<any>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [creationMode, setCreationMode] = useState<'manual' | 'upload'>('manual');
  const [sourceFileIpfsHash, setSourceFileIpfsHash] = useState<string>('');
  const [isUploadingToIpfs, setIsUploadingToIpfs] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const { account, connected, connectWallet, mintNFTOnMonad } = useWeb3();

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  // File upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'text/plain',
      'text/markdown',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Unsupported File Type',
        description: 'Please upload a text file, markdown, PDF, or Word document.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessingFile(true);
    setUploadedFile(file);

    try {
      // First, upload the original file to IPFS
      setIsUploadingToIpfs(true);
      const ipfsHash = await uploadToIPFS(file, {
        name: `Source File - ${file.name}`,
        description: 'Original source file for story generation',
        fileType: file.type,
        fileName: file.name,
        fileSize: file.size,
      });
      setSourceFileIpfsHash(ipfsHash);
      
      toast({
        title: 'File Uploaded to IPFS',
        description: `${file.name} successfully uploaded to IPFS with hash: ${ipfsHash.substring(0, 10)}...`,
      });
      
      setIsUploadingToIpfs(false);

      // Then process the file for content analysis
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/process-file', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setFileContent(result.data.content);
        setFileAnalysis(result.data.analysis);
        
        // Auto-populate fields based on file analysis
        if (result.data.analysis.characters.length > 0) {
          setMainCharacters(result.data.analysis.characters.join(', '));
        }
        
        if (result.data.analysis.themes.length > 0) {
          setThemes(result.data.analysis.themes.join(', '));
        }
        
        if (result.data.analysis.settings.length > 0) {
          setSetting(result.data.analysis.settings[0]);
        }

        // Auto-populate prompt with file content
        if (result.data.content && result.data.content !== 'PDF_PROCESSING_REQUIRED' && result.data.content !== 'DOCUMENT_PROCESSING_REQUIRED') {
          const truncatedContent = result.data.content.length > 1000 ? result.data.content.substring(0, 1000) + '...' : result.data.content;
          setPrompt(`Based on this content: "${truncatedContent}"\n\nGenerate a story that continues or reimagines this narrative:`);
        } else {
          // For PDF/Word files that need manual extraction
          if (result.data.content === 'PDF_PROCESSING_REQUIRED') {
            setPrompt('Please paste the content from your PDF file above, then describe the story you want to generate based on that content:');
          } else if (result.data.content === 'DOCUMENT_PROCESSING_REQUIRED') {
            setPrompt('Please paste the content from your Word document above, then describe the story you want to generate based on that content:');
          }
        }

        toast({
          title: 'File Processed Successfully',
          description: `${file.name} analyzed and uploaded to IPFS. Found ${result.data.analysis.themes.length} themes, ${result.data.analysis.characters.length} characters.`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error processing file:', error);
      toast({
        title: 'File Processing Error',
        description: error.message || 'Failed to process the uploaded file. Please try again.',
        variant: 'destructive',
      });
      setUploadedFile(null);
      setSourceFileIpfsHash('');
    } finally {
      setIsProcessingFile(false);
      setIsUploadingToIpfs(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    setFileContent('');
    setFileAnalysis(null);
    setSourceFileIpfsHash('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    // Validation logic for different creation modes
    if (creationMode === 'manual') {
      if (!prompt.trim()) {
        toast({
          title: 'Missing Prompt',
          description: 'Please enter a story prompt to generate content.',
          variant: 'destructive',
        });
        return;
      }
    } else if (creationMode === 'upload') {
      if (!title.trim()) {
        toast({
          title: 'Missing Title',
          description: 'Please enter a title for your story.',
          variant: 'destructive',
        });
        return;
      }
      if (!author.trim()) {
        toast({
          title: 'Missing Author',
          description: 'Please enter an author name.',
          variant: 'destructive',
        });
        return;
      }
      if (!uploadedFile || !fileContent) {
        toast({
          title: 'Missing File',
          description: 'Please upload a source file to generate content from.',
          variant: 'destructive',
        });
        return;
      }
      if (selectedGenres.length === 0) {
        toast({
          title: 'Missing Genres',
          description: 'Please select at least one genre for your story.',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsGenerating(true);
    try {
      // Generate story content
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Incorporate file content if available
      let baseContent = prompt;
      if (fileContent && uploadedFile) {
        baseContent = `Based on the uploaded file "${uploadedFile.name}":\n\n${fileContent.substring(0, 2000)}${fileContent.length > 2000 ? '...' : ''}\n\n${prompt}`;
      }

      const mockStory = `# ${title || 'Generated Story'}

## Chapter 1: The Beginning

${baseContent} 

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

    // Validate required fields for minting
    if (!author.trim()) {
      toast({
        title: 'Author Required',
        description: 'Please enter the author name before minting.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedGenres.length === 0) {
      toast({
        title: 'Genre Required',
        description: 'Please select at least one genre before minting.',
        variant: 'destructive',
      });
      return;
    }

    setIsMinting(true);
    try {
      // First upload the story content to IPFS (Pinata)
      const storyCid = await uploadToIPFS(generatedContent, {
        name: (title || 'Monad Mythics Story') + ' - Story Content',
      });
      const storyIpfsUri = `ipfs://${storyCid}`;

      // Create NFT metadata JSON
      const nftMetadata = {
        name: title || 'Monad Mythics Story',
        description: `AI-generated story: ${prompt.substring(0, 100)}...`,
        image: generatedImages.length > 0 ? generatedImages[0]?.url : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop&crop=center',
        images: generatedImages.map(img => ({ url: img.url, chapter: img.chapter, description: img.description })),
        // Include source file information if available
        sourceFile: sourceFileIpfsHash ? {
          ipfsHash: sourceFileIpfsHash,
          fileName: uploadedFile?.name || 'Unknown',
          fileType: uploadedFile?.type || 'Unknown',
          fileSize: uploadedFile?.size || 0,
          uploadedAt: new Date().toISOString(),
        } : null,
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
          {
            trait_type: 'Creation Mode',
            value: creationMode === 'upload' ? 'File Upload' : 'Manual Creation',
          },
          {
            trait_type: 'Has Source File',
            value: sourceFileIpfsHash ? 'Yes' : 'No',
          },
          { trait_type: 'Generated By', value: 'Monad Mythics AI' },
        ],
        created_at: new Date().toISOString(),
        creator: account,
      };

      // Upload metadata JSON to IPFS and use ipfs:// URI
      const metadataCid = await uploadToIPFS(nftMetadata, {
        name: (title || 'Monad Mythics Story') + ' - Metadata',
      });
      const metadataURI = `ipfs://${metadataCid}`;

      // Prepare the metadata in the format expected by the Web3 provider
      const contractMetadata = {
        storyHash: storyIpfsUri,
        metadataURI,
        imageCount: generatedImages.length,
      };

      console.log('Minting NFT with contract metadata:', contractMetadata);

      // Use the real Web3 provider to mint the NFT
      const result = await mintNFTOnMonad(contractMetadata);
      
      console.log('NFT minted successfully:', result);

      // Create the gallery URL to view the minted NFT
      const nftUrl = `/gallery`;
      setMintedNftUrl(nftUrl);

      // Cache locally for gallery fallback
      try {
        const cacheKey = `story_nft_${result.tokenId}`;
        const cachePayload = {
          tokenId: result.tokenId,
          metadata: nftMetadata,
          storyContent: generatedContent,
          images: generatedImages,
          createdAt: new Date().toISOString(),
          source: 'local-cache',
        };
        localStorage.setItem(cacheKey, JSON.stringify(cachePayload));
      } catch (e) {
        console.warn('Failed to cache NFT locally:', e);
      }

      toast({
        title: 'NFT Minted Successfully!',
        description:
          generatedImages.length > 0
            ? `Your story with ${generatedImages.length} images has been minted as an NFT on Monad blockchain.`
            : 'Your story has been minted as an NFT on Monad blockchain.',
      });
    } catch (error: any) {
      console.error('Minting error:', error);
      toast({
        title: 'Minting Failed',
        description: error.message || 'Failed to mint NFT. Please try again.',
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
    setAuthor('');
    setPlotOutline('');
    setSetting('');
    setThemes('');
    setSelectedGenres([]);
    setGeneratedContent('');
    setGeneratedImages([]);
    setMintedNftUrl('');
    setUploadedFile(null);
    setFileContent('');
    setFileAnalysis(null);
    setSourceFileIpfsHash('');
    setCreationMode('manual');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
              {/* Creation Mode Toggle */}
              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-6 rounded-xl border border-indigo-500/20">
                <div className="flex flex-col space-y-4">
                  <h3 className="text-lg font-semibold text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    ⚡ Choose Your Creation Method ⚡
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant={creationMode === 'manual' ? 'default' : 'outline'}
                      className={`h-auto p-4 flex flex-col items-center space-y-2 transition-all duration-300 ${
                        creationMode === 'manual'
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg border-0'
                          : 'border-indigo-500/40 text-indigo-300 hover:border-indigo-400 hover:bg-indigo-500/10 bg-slate-800/50'
                      }`}
                      onClick={() => setCreationMode('manual')}
                    >
                      <Wand2 className="h-8 w-8" />
                      <div className="text-center">
                        <div className="font-semibold">Manual Creation</div>
                        <div className="text-xs opacity-80">Full control over all story elements</div>
                      </div>
                    </Button>

                    <Button
                      variant={creationMode === 'upload' ? 'default' : 'outline'}
                      className={`h-auto p-4 flex flex-col items-center space-y-2 transition-all duration-300 ${
                        creationMode === 'upload'
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg border-0'
                          : 'border-blue-500/40 text-blue-300 hover:border-blue-400 hover:bg-blue-500/10 bg-slate-800/50'
                      }`}
                      onClick={() => setCreationMode('upload')}
                    >
                      <Upload className="h-8 w-8" />
                      <div className="text-center">
                        <div className="font-semibold">Upload & Generate</div>
                        <div className="text-xs opacity-80">Upload content + title & author</div>
                      </div>
                    </Button>
                  </div>

                  <p className="text-center text-sm text-slate-400">
                    {creationMode === 'manual' 
                      ? '🎯 Craft every detail of your story from scratch with full customization options'
                      : '📚 Upload existing content and let AI transform it with minimal input required'
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {creationMode === 'manual' ? (
                  // Manual Creation Mode - All Input Fields
                  <>
                    <div className="relative">
                      <label className="text-sm font-medium mb-2 flex items-center">
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
                        <label className="text-sm font-medium mb-2 flex items-center">
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
                        <label className="text-sm font-medium mb-2 flex items-center">
                          <User className="h-4 w-4 mr-2 text-green-500" />
                          Author Name *
                        </label>
                        <Input
                          placeholder="Who created this masterpiece? (Required for minting)"
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          className="bg-slate-900/80 border-green-500/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 text-white placeholder:text-slate-400 transition-all duration-300 backdrop-blur-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 flex items-center">
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
                      <div>
                        <label className="text-sm font-medium mb-2 flex items-center">
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
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 flex items-center">
                        <Wand2 className="h-4 w-4 mr-2 text-blue-500" />
                        Tale Archetypes *
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
                        ✨ Choose the mystical forces that will shape your narrative (Required for minting)
                      </p>
                    </div>
                  </>
                ) : (
                  // Upload Mode - Simplified Input
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 flex items-center">
                          <BookOpen className="h-4 w-4 mr-2 text-red-500" />
                          Epic Title *
                        </label>
                        <Input
                          placeholder="Name your legendary tale..."
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="bg-slate-900/80 border-red-500/30 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 text-white placeholder:text-slate-400 transition-all duration-300 backdrop-blur-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 flex items-center">
                          <User className="h-4 w-4 mr-2 text-green-500" />
                          Author Name *
                        </label>
                        <Input
                          placeholder="Who created this masterpiece?"
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          className="bg-slate-900/80 border-green-500/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 text-white placeholder:text-slate-400 transition-all duration-300 backdrop-blur-sm"
                        />
                      </div>
                    </div>

                    {/* File Upload Section */}
                    <div className="border-2 border-dashed border-blue-500/40 rounded-xl p-6 bg-slate-900/60 backdrop-blur-sm relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 animate-pulse"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <label className="text-lg font-semibold flex items-center text-blue-400">
                            <Upload className="h-6 w-6 mr-3 text-blue-400" />
                            Upload Source Material *
                          </label>
                          {uploadedFile && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearUploadedFile}
                              className="border-red-500/50 text-red-300 hover:bg-red-500/10 bg-slate-800/50"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Clear
                            </Button>
                          )}
                        </div>

                        {uploadedFile ? (
                          <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-600/30">
                            <div className="flex items-center space-x-3 mb-3">
                              <File className="h-8 w-8 text-blue-400" />
                              <div className="flex-1">
                                <p className="font-medium text-blue-400">{uploadedFile.name}</p>
                                <p className="text-xs text-slate-400">
                                  {(uploadedFile.size / 1024).toFixed(1)} KB • {uploadedFile.type}
                                </p>
                                {sourceFileIpfsHash && (
                                  <p className="text-xs text-green-400 mt-1">
                                    📦 IPFS: {sourceFileIpfsHash.substring(0, 10)}...{sourceFileIpfsHash.substring(-6)}
                                  </p>
                                )}
                              </div>
                              {isUploadingToIpfs && (
                                <div className="flex items-center space-x-2">
                                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                                  <span className="text-xs text-blue-400">Uploading to IPFS...</span>
                                </div>
                              )}
                            </div>
                            {fileContent && fileContent !== 'Please paste the content from your PDF file here...' && fileContent !== 'Please paste the content from your document here...' && (
                              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/30 max-h-32 overflow-y-auto">
                                <p className="text-xs text-slate-300 leading-relaxed">
                                  {fileContent.substring(0, 300)}
                                  {fileContent.length > 300 && '...'}
                                </p>
                              </div>
                            )}
                            <div className="mt-3 flex items-center justify-between">
                              <div className="text-xs text-slate-400">
                                ✨ File content will be used as the basis for your story generation
                              </div>
                              {sourceFileIpfsHash && (
                                <div className="flex items-center space-x-1 text-xs text-green-400">
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                  <span>Stored on IPFS</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div
                            className="border-2 border-dashed border-blue-500/30 rounded-lg p-8 text-center hover:border-blue-400/50 transition-colors duration-300 cursor-pointer"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".txt,.md,.pdf,.doc,.docx"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                            
                            {isProcessingFile || isUploadingToIpfs ? (
                              <div className="flex flex-col items-center justify-center space-y-3">
                                <div className="flex items-center space-x-3">
                                  <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                                  <span className="text-blue-400">
                                    {isUploadingToIpfs ? 'Uploading to IPFS...' : 'Processing file...'}
                                  </span>
                                </div>
                                {isUploadingToIpfs && (
                                  <p className="text-xs text-slate-400 text-center">
                                    📦 Securing your file on the decentralized web
                                  </p>
                                )}
                              </div>
                            ) : (
                              <>
                                <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-blue-400 mb-2">
                                  Upload Source Document
                                </h3>
                                <p className="text-slate-400 mb-4 max-w-md mx-auto">
                                  Drop your file here or click to browse. Support for text files, markdown, PDF, and Word documents.
                                </p>
                                <div className="flex items-center justify-center space-x-4 text-xs text-slate-500">
                                  <span>.txt</span>
                                  <span>•</span>
                                  <span>.md</span>
                                  <span>•</span>
                                  <span>.pdf</span>
                                  <span>•</span>
                                  <span>.doc/.docx</span>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        <p className="text-sm text-slate-300 leading-relaxed mt-4">
                          📚 Upload existing content to transform into a new story. The AI will analyze your document and create an original narrative based on its themes and content.
                        </p>
                      </div>
                    </div>

                    {/* Genres Selection for Upload Mode */}
                    <div>
                      <label className="text-sm font-medium mb-2 flex items-center">
                        <Wand2 className="h-4 w-4 mr-2 text-blue-500" />
                        Tale Archetypes *
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
                      {/* <p className="text-xs text-muted-foreground mt-2">
                        ✨ Choose the mystical forces that will shape your narrative (Required for minting)
                      </p> */}
                    </div>
                  </>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 flex items-center">
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
                  disabled={
                    isGenerating ||
                    (creationMode === 'manual' && !prompt.trim()) ||
                    (creationMode === 'upload' && (!title.trim() || !author.trim() || !uploadedFile))
                  }
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
                          <strong>Author:</strong> {author || 'Not specified'}
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
                        {/* <p>
                          <strong>Setting:</strong> {setting || 'Not specified'}
                        </p>
                        <p>
                          <strong>Themes:</strong> {themes || 'Not specified'}
                        </p> */}
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
                        >
                          View in Gallery
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
