import { NextRequest, NextResponse } from 'next/server';

// Google Nano Banana API configuration
const NANO_BANANA_API_URL = 'https://api.nanobana.com/v1/generate';
const NANO_BANANA_API_KEY = process.env.NANO_BANANA_API_KEY;

interface ImageGenerationRequest {
  prompt: string;
  style?: string;
  width?: number;
  height?: number;
  quality?: 'standard' | 'hd';
}

interface NanoBananaResponse {
  success: boolean;
  data?: {
    url: string;
    id: string;
    prompt: string;
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ImageGenerationRequest = await request.json();
    const { prompt, style = 'fantasy', width = 800, height = 600, quality = 'standard' } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!NANO_BANANA_API_KEY) {
      console.warn('NANO_BANANA_API_KEY not configured, using mock response');
      
      // Mock response for development
      const mockResponse = {
        success: true,
        data: {
          url: `https://picsum.photos/${width}/${height}?random=${Date.now()}`,
          id: `mock_${Date.now()}`,
          prompt: prompt
        }
      };
      
      return NextResponse.json(mockResponse);
    }

    // Real API call to Google Nano Banana
    const response = await fetch(NANO_BANANA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NANO_BANANA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `${prompt}, ${style} art style, high quality, detailed`,
        width,
        height,
        quality,
        model: 'nano-banana-v2', // Latest model
        safety_filter: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: {
        url: data.image_url || data.url,
        id: data.id || `generated_${Date.now()}`,
        prompt: prompt
      }
    });

  } catch (error) {
    console.error('Image generation error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate image'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Image generation API endpoint',
    methods: ['POST'],
    required_fields: ['prompt'],
    optional_fields: ['style', 'width', 'height', 'quality']
  });
}
