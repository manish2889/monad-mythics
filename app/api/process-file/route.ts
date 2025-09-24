import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'text/plain',
      'text/markdown',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unsupported file type. Please upload a text file, markdown, PDF, or Word document.' 
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'File too large. Maximum size is 10MB.' 
        },
        { status: 400 }
      );
    }

    let content = '';
    
    if (file.type === 'text/plain' || file.type === 'text/markdown') {
      // Handle text files
      const buffer = await file.arrayBuffer();
      content = new TextDecoder().decode(buffer);
    } else if (file.type === 'application/pdf') {
      // For PDF files, we'd need a proper PDF parser like pdf-parse
      // For now, return instructions for manual extraction
      content = 'PDF_PROCESSING_REQUIRED';
    } else {
      // For Word documents, we'd need a proper parser like mammoth
      // For now, return instructions for manual extraction
      content = 'DOCUMENT_PROCESSING_REQUIRED';
    }

    // Extract key information for story generation
    const analysis = analyzeContent(content);

    return NextResponse.json({
      success: true,
      data: {
        filename: file.name,
        size: file.size,
        type: file.type,
        content: content.substring(0, 5000), // Limit content to 5000 chars
        analysis,
      }
    });

  } catch (error) {
    console.error('File processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process file' 
      },
      { status: 500 }
    );
  }
}

function analyzeContent(content: string) {
  if (content === 'PDF_PROCESSING_REQUIRED' || content === 'DOCUMENT_PROCESSING_REQUIRED') {
    return {
      wordCount: 0,
      estimatedReadingTime: 0,
      themes: [],
      characters: [],
      settings: [],
    };
  }

  const words = content.toLowerCase().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  const estimatedReadingTime = Math.ceil(wordCount / 200); // 200 words per minute

  // Basic theme detection
  const themes = [];
  const themeKeywords = {
    'adventure': ['journey', 'quest', 'travel', 'explore', 'discover'],
    'romance': ['love', 'heart', 'kiss', 'romance', 'relationship'],
    'mystery': ['mystery', 'secret', 'detective', 'clue', 'investigate'],
    'fantasy': ['magic', 'wizard', 'dragon', 'spell', 'enchanted'],
    'horror': ['fear', 'dark', 'scary', 'ghost', 'monster'],
  };

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    const found = keywords.some(keyword => words.includes(keyword));
    if (found) themes.push(theme);
  }

  // Basic character detection (names that appear multiple times)
  const namePattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const potentialNames = content.match(namePattern) || [];
  const nameFreq: { [key: string]: number } = {};
  
  potentialNames.forEach(name => {
    if (name.length > 2 && name.length < 20) {
      nameFreq[name] = (nameFreq[name] || 0) + 1;
    }
  });

  const characters = Object.entries(nameFreq)
    .filter(([_, count]) => count > 1)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name]) => name);

  // Basic setting detection
  const settings = [];
  const settingKeywords = {
    'medieval': ['castle', 'kingdom', 'knight', 'sword', 'medieval'],
    'modern': ['city', 'car', 'phone', 'computer', 'internet'],
    'futuristic': ['space', 'robot', 'technology', 'future', 'alien'],
    'forest': ['forest', 'trees', 'woods', 'nature', 'wilderness'],
    'ocean': ['ocean', 'sea', 'ship', 'island', 'water'],
  };

  for (const [setting, keywords] of Object.entries(settingKeywords)) {
    const found = keywords.some(keyword => words.includes(keyword));
    if (found) settings.push(setting);
  }

  return {
    wordCount,
    estimatedReadingTime,
    themes: themes.slice(0, 3),
    characters: characters.slice(0, 3),
    settings: settings.slice(0, 2),
  };
}
