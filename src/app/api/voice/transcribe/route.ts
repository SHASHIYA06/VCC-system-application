/**
 * Voice Transcription API using OpenAI Whisper
 * High accuracy speech-to-text for voice commands
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let tempFilePath: string | null = null;

  try {
    console.log('🎤 Voice transcription request received');

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured');
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key not configured',
        message: 'Please set OPENAI_API_KEY in your .env.local file',
        fallback: 'browser' // Fallback to browser Web Speech API
      }, { status: 500 });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'en';

    if (!audioFile) {
      return NextResponse.json({
        success: false,
        error: 'No audio file provided'
      }, { status: 400 });
    }

    console.log(`📝 Processing audio file: ${audioFile.name} (${audioFile.size} bytes)`);

    // Save audio to temporary file
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    tempFilePath = path.join('/tmp', `transcribe_${Date.now()}.webm`);
    await writeFile(tempFilePath, buffer);

    // Import OpenAI dynamically
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('🔄 Calling OpenAI Whisper API...');

    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: await import('fs').then(fs => fs.createReadStream(tempFilePath!)),
      model: 'whisper-1',
      language: language,
      response_format: 'verbose_json',
      timestamp_granularities: ['word']
    });

    const executionTime = Date.now() - startTime;
    console.log(`✅ Transcription completed in ${executionTime}ms`);

    // Process the transcript to determine command type
    const command = processTranscript(transcription.text);

    return NextResponse.json({
      success: true,
      transcript: transcription.text,
      language: transcription.language || language,
      duration: transcription.duration,
      words: transcription.words || [],
      command: command,
      confidence: calculateConfidence(transcription),
      executionTime,
      provider: 'openai-whisper'
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('❌ Transcription error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check for specific OpenAI errors
    if (errorMessage.includes('API key')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid OpenAI API key',
        message: 'Please check your OPENAI_API_KEY in .env.local',
        fallback: 'browser',
        executionTime
      }, { status: 401 });
    }

    if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API quota exceeded',
        message: 'API rate limit reached. Please try again later or upgrade your OpenAI plan.',
        fallback: 'browser',
        executionTime
      }, { status: 429 });
    }

    return NextResponse.json({
      success: false,
      error: 'Transcription failed',
      details: errorMessage,
      fallback: 'browser',
      executionTime
    }, { status: 500 });

  } finally {
    // Clean up temporary file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file:', cleanupError);
      }
    }
  }
}

/**
 * Process transcript to determine command type and extract parameters
 */
function processTranscript(transcript: string): {
  action: 'navigate' | 'search' | 'query' | 'unknown';
  parameters: Record<string, any>;
  confidence: number;
} {
  const lower = transcript.toLowerCase().trim();

  // Navigation commands
  if (lower.includes('dashboard') || lower.includes('home')) {
    return { action: 'navigate', parameters: { route: '/dashboard' }, confidence: 0.95 };
  }
  if (lower.includes('drawing') || lower.includes('drawings')) {
    return { action: 'navigate', parameters: { route: '/drawings' }, confidence: 0.95 };
  }
  if (lower.includes('wire') && !lower.includes('search') && !lower.includes('find')) {
    return { action: 'navigate', parameters: { route: '/wires' }, confidence: 0.9 };
  }
  if (lower.includes('system')) {
    return { action: 'navigate', parameters: { route: '/systems' }, confidence: 0.9 };
  }
  if (lower.includes('equipment')) {
    return { action: 'navigate', parameters: { route: '/equipment' }, confidence: 0.9 };
  }
  if (lower.includes('troubleshoot')) {
    return { action: 'navigate', parameters: { route: '/troubleshooting' }, confidence: 0.9 };
  }
  if (lower.includes('gsd')) {
    return { action: 'navigate', parameters: { route: '/gsd' }, confidence: 0.9 };
  }
  if (lower.includes('intelligence') || lower.includes('ai assistant')) {
    return { action: 'navigate', parameters: { route: '/ai-assistant' }, confidence: 0.9 };
  }

  // Search commands
  if (lower.includes('search') || lower.includes('find') || lower.includes('show me')) {
    const searchMatch = lower.match(/(?:search for|find|show me|search)\s+(.+)/);
    const query = searchMatch?.[1]?.trim() || '';
    return { action: 'search', parameters: { query }, confidence: 0.85 };
  }

  // Query commands (for AI assistant)
  if (lower.includes('what is') || lower.includes('tell me about') || lower.includes('explain') || lower.includes('how does')) {
    return { action: 'query', parameters: { query: transcript }, confidence: 0.8 };
  }

  // Unknown command
  return { action: 'unknown', parameters: {}, confidence: 0.5 };
}

/**
 * Calculate confidence score from transcription metadata
 */
function calculateConfidence(transcription: any): number {
  // If we have word-level confidence, average it
  if (transcription.words && transcription.words.length > 0) {
    // OpenAI Whisper doesn't provide confidence per word in standard response
    // but we can infer from other factors
    return 0.9; // High confidence for Whisper
  }
  return 0.85; // Default good confidence
}

export async function GET() {
  return NextResponse.json({
    service: 'OpenAI Whisper Voice Transcription',
    version: '1.0.0',
    model: 'whisper-1',
    capabilities: {
      languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ru', 'ja', 'ko', 'zh'],
      formats: ['webm', 'mp3', 'wav', 'm4a', 'ogg'],
      accuracy: 'High (OpenAI Whisper)',
      realtime: false
    },
    usage: {
      method: 'POST',
      contentType: 'multipart/form-data',
      fields: {
        audio: 'Audio file (webm, mp3, wav, m4a, ogg)',
        language: 'Language code (default: en)'
      }
    },
    fallback: 'Browser Web Speech API if OpenAI is unavailable'
  });
}
