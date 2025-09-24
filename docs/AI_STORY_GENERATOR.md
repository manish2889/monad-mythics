# AI Story Generator with Image Integration

## Overview

The enhanced AI Story Generator in Monad Mythics now combines textual storytelling with AI-generated images using Google's Nano Banana API. This creates rich, multimedia NFTs that include both narrative content and visual elements.

## Features

### 🎨 **Dual Content Generation**
- **Text Generation**: Uses Groq AI for story creation
- **Image Generation**: Integrates Google Nano Banana API for visual content
- **Combined Preview**: Shows both text and images in a unified interface
- **Smart Scene Detection**: Automatically generates images for key story moments

### 📖 **Story Components**
- **Chapter-based Images**: Generates 3 images per story (Beginning, Middle, End)
- **Context-aware Prompts**: Images reflect story genre, setting, and characters
- **Style Consistency**: Maintains visual coherence across all generated images

### 🎯 **NFT Minting**
- **Comprehensive Metadata**: Includes both text and image data
- **Enhanced Attributes**: Tracks image count, content type, and generation details
- **Blockchain Storage**: Stores complete multimedia content on Monad blockchain

## Technical Implementation

### API Integration

#### Google Nano Banana API
```typescript
// API Endpoint: /api/generate-image
interface ImageGenerationRequest {
  prompt: string;
  style?: string;
  width?: number;
  height?: number;
  quality?: 'standard' | 'hd';
}
```

#### Environment Variables
```bash
# Add to .env.local
NANO_BANANA_API_KEY=your_nano_banana_api_key_here
```

### Data Structures

#### Generated Image Interface
```typescript
interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  chapter: string;
  description: string;
}
```

#### Enhanced Story Data
```typescript
interface StoryData {
  title: string;
  content: string;
  genre: string[];
  characters: string[];
  setting: string;
  themes: string[];
  images: GeneratedImage[];
}
```

### Smart Contract Updates

#### Enhanced Minting Function
```solidity
function mintStory(
    string memory storyHash, 
    string memory metadataURI, 
    uint256 imageCount
) public payable returns (uint256)
```

#### New View Functions
```solidity
function getImageCount(uint256 tokenId) public view returns (uint256)
function getContentType(uint256 tokenId) public view returns (uint8)
function getStoryDetails(uint256 tokenId) public view returns (string memory, uint256, uint8)
```

## User Workflow

### 1. Story Input
- Enter story prompt and details
- Select genres, characters, setting
- **Toggle image generation** (new feature)
- Choose story format

### 2. Generation Process
```
1. Generate story text using Groq AI
2. Extract key scenes from story
3. Generate images for each scene using Nano Banana API
4. Combine text and images in preview
```

### 3. Preview & Review
- **Enhanced Preview Tab**:
  - Full story text
  - Generated images grid
  - Image details (chapter, prompt, description)
  - Loading states for image generation

### 4. NFT Minting
- **Comprehensive NFT Metadata**:
  ```json
  {
    "name": "Story Title",
    "description": "AI-generated story with images",
    "story_content": "Full story text...",
    "images": [
      {
        "id": "1",
        "url": "https://...",
        "prompt": "Scene description...",
        "chapter": "Chapter 1",
        "description": "Opening scene"
      }
    ],
    "attributes": [
      {"trait_type": "Has Images", "value": "Yes"},
      {"trait_type": "Image Count", "value": "3"},
      {"trait_type": "Content Type", "value": "Story + Images"}
    ]
  }
  ```

## Image Generation Details

### Scene Extraction
The system automatically identifies key story moments:
- **Chapter 1**: Opening scene with main characters and setting
- **Chapter 2**: Journey/conflict progression
- **Conclusion**: Climactic finale

### Prompt Engineering
Images are generated using context-aware prompts:
```typescript
const scenes = [
  {
    prompt: `${setting} with ${characters}, ${genre} style, detailed illustration`,
    chapter: 'Chapter 1',
    description: 'Opening scene'
  }
  // ... more scenes
];
```

### Style Consistency
- Genre-based art styles (fantasy, sci-fi, mystery, etc.)
- Consistent character representation
- Coherent visual narrative

## Minting Process

### What Gets Minted?
**Both text and images are minted as a single NFT containing:**

1. **Story Text**: Complete narrative content
2. **Image Collection**: All generated images with metadata
3. **Combined Metadata**: Comprehensive NFT attributes
4. **Provenance Data**: Generation timestamps, creator info, AI model details

### NFT Structure
```
NFT Token
├── Story Content (IPFS hash)
├── Image Collection (3 images)
│   ├── Chapter 1 Image
│   ├── Chapter 2 Image
│   └── Conclusion Image
├── Metadata
│   ├── Title, Genre, Setting
│   ├── Image Count & Type
│   └── Generation Details
└── Attributes
    ├── Content Type: "Story + Images"
    ├── Image Count: "3"
    └── Generated By: "Monad Mythics AI"
```

## Benefits

### For Creators
- **Rich Content**: Stories enhanced with visual elements
- **Higher Value**: Multimedia NFTs command premium prices
- **Creative Control**: Toggle image generation on/off
- **Professional Quality**: AI-generated images match story themes

### For Collectors
- **Complete Experience**: Both reading and visual enjoyment
- **Unique Assets**: Each NFT contains original text + images
- **Verifiable Authenticity**: Blockchain-verified AI generation
- **Display Ready**: Images perfect for showcasing collections

## Configuration Options

### Image Generation Settings
```typescript
const imageSettings = {
  includeImages: true,        // Enable/disable image generation
  imageCount: 3,             // Number of images per story
  quality: 'standard',       // 'standard' or 'hd'
  style: 'fantasy',          // Based on selected genres
  dimensions: '800x600'      // Image resolution
};
```

### Fallback Handling
- **API Failures**: Graceful fallback to placeholder images
- **Rate Limiting**: Queue management for bulk generation
- **Error Recovery**: Retry logic with exponential backoff

## Future Enhancements

### Planned Features
- **Custom Image Styles**: User-selectable art styles
- **Interactive Scenes**: Clickable image elements
- **Animation Support**: GIF/video generation
- **Collaborative Creation**: Multi-user story building
- **Advanced Prompting**: Fine-tuned image control

### Integration Roadmap
- **Multiple AI Providers**: Stability AI, DALL-E integration
- **Voice Narration**: Text-to-speech for stories
- **AR/VR Support**: Immersive story experiences
- **Social Features**: Story sharing and collaboration

## Troubleshooting

### Common Issues

#### Image Generation Fails
```typescript
// Check API key configuration
if (!NANO_BANANA_API_KEY) {
  console.error('Nano Banana API key not configured');
}

// Verify API endpoint
const response = await fetch('/api/generate-image/test');
```

#### Slow Generation
- **Parallel Processing**: Images generated concurrently
- **Caching**: Store generated images temporarily
- **Progressive Loading**: Show images as they complete

#### Minting Errors
- **Metadata Size**: Ensure IPFS upload succeeds
- **Gas Estimation**: Account for larger metadata
- **Network Issues**: Retry logic for blockchain calls

## API Reference

### Generate Image Endpoint
```http
POST /api/generate-image
Content-Type: application/json

{
  "prompt": "Fantasy castle with brave hero, detailed illustration",
  "style": "fantasy",
  "width": 800,
  "height": 600,
  "quality": "standard"
}
```

### Response Format
```json
{
  "success": true,
  "data": {
    "url": "https://generated-image-url.com/image.jpg",
    "id": "generated_123456",
    "prompt": "Fantasy castle with brave hero, detailed illustration"
  }
}
```

## Conclusion

The enhanced AI Story Generator transforms Monad Mythics into a comprehensive multimedia storytelling platform. By combining Groq's powerful text generation with Google's Nano Banana image AI, creators can now mint rich, visual narratives that offer both literary and artistic value.

This integration represents the future of AI-assisted creative content, where stories come alive through the seamless blend of text and imagery, all verifiably stored on the blockchain as unique, collectible NFTs.
