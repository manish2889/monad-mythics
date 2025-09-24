import { NextRequest, NextResponse } from 'next/server';

// Try multiple Hugging Face models as fallbacks
const HUGGING_FACE_MODELS = [
  'stabilityai/stable-diffusion-2-1',
  'runwayml/stable-diffusion-v1-5',
  'CompVis/stable-diffusion-v1-4',
  'stabilityai/stable-diffusion-xl-base-1.0'
];

const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;

interface ImageGenerationRequest {
  prompt: string;
  heroes?: string[];
  legends?: string[];
  style?: string;
  width?: number;
  height?: number;
  quality?: 'standard' | 'hd';
}

// Function to extract character from heroes and legends
function selectCharacter(heroes: string[] = [], legends: string[] = []): string {
  const allCharacters = [...heroes, ...legends];
  if (allCharacters.length === 0) {
    return 'hero'; // fallback
  }
  return allCharacters[0];
}

async function tryGenerateWithModel(modelUrl: string, prompt: string, apiKey: string) {
  const response = await fetch(`https://api-inference.huggingface.co/models/${modelUrl}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      options: {
        wait_for_model: true,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Model ${modelUrl} failed with status ${response.status}`);
  }

  return response.arrayBuffer();
}

export async function POST(request: NextRequest) {
  try {
    const body: ImageGenerationRequest = await request.json();
    const { prompt, heroes = [], legends = [], style = 'fantasy', quality = 'standard' } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!HUGGING_FACE_API_KEY) {
      return NextResponse.json(
        { error: 'HUGGING_FACE_API_KEY is not configured. Please add it to your environment variables.' },
        { status: 500 }
      );
    }

    // Select one character from heroes and legends
    const selectedCharacter = selectCharacter(heroes, legends);
    
    // Create enhanced prompt
    const enhancedPrompt = `${selectedCharacter}, ${prompt}, ${style} art style, ${quality === 'hd' ? 'high resolution, ultra detailed, masterpiece' : 'detailed illustration'}`;
    
    console.log('🎨 Generating image for character:', selectedCharacter);
    console.log('🔮 Enhanced prompt:', enhancedPrompt);

    let imageBuffer: ArrayBuffer | null = null;
    let usedModel = '';

    // Try each model until one works
    for (const model of HUGGING_FACE_MODELS) {
      try {
        console.log(`Trying model: ${model}`);
        imageBuffer = await tryGenerateWithModel(model, enhancedPrompt, HUGGING_FACE_API_KEY);
        usedModel = model;
        console.log(`✅ Success with model: ${model}`);
        break;
      } catch (error) {
        console.log(`❌ Model ${model} failed:`, error);
        continue;
      }
    }

    if (!imageBuffer || imageBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: 'All models failed to generate image. Please try again later.' },
        { status: 500 }
      );
    }

    // Convert to base64 for client-side usage
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({
      success: true,
      data: {
        url: imageUrl,
        id: `hf_generated_${Date.now()}`,
        prompt: enhancedPrompt,
        character: selectedCharacter,
        model: usedModel,
      },
    });

  } catch (error) {
    console.error('❌ Image generation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate image',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Character image generation API using Hugging Face Stable Diffusion models',
    methods: ['POST'],
    available_models: HUGGING_FACE_MODELS,
    required_fields: ['prompt'],
    optional_fields: ['heroes', 'legends', 'style', 'quality'],
    note: 'Generates images based on selected character from heroes/legends array',
    example_request: {
      prompt: "epic fantasy battle",
      heroes: ["Thor", "Wonder Woman"],
      legends: ["King Arthur", "Hercules"],
      style: "fantasy",
      quality: "hd"
    }
  });
}