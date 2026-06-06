/**
 * VibeVoice ASR (Speech-to-Text) API Endpoint - Optimized for Serverless
 * Handles voice input for VCC dashboard navigation and queries with lazy loading
 */

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

// Runtime configuration for bundle optimization
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // 30 seconds max for voice processing

// Lazy load heavy dependencies to reduce bundle size
async function getVibeVoiceClient() {
  const { vibeVoiceClient } = await import('@/lib/voice/vibeVoiceClient');
  return vibeVoiceClient;
}

async function getFileSystem() {
  const { writeFile } = await import('fs/promises');
  return { writeFile };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const hotwords = formData.get('hotwords') as string;
    const language = (formData.get('language') as string) || 'en';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Save uploaded audio file temporarily
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const tempPath = path.join('/tmp', `voice_input_${Date.now()}.wav`);
    
    // Lazy load file system operations
    const { writeFile } = await getFileSystem();
    await writeFile(tempPath, buffer);

    // Process hotwords
    const hotwordList = hotwords ? hotwords.split(',').map(w => w.trim()) : [];

    // Lazy load VibeVoice client
    const vibeVoiceClient = await getVibeVoiceClient();

    // Process with VibeVoice ASR
    const result = await vibeVoiceClient.speechToText(
      tempPath,
      hotwordList,
      language
    );

    // Clean up temporary file - lazy load fs
    try {
      const fs = await import('fs/promises');
      await fs.unlink(tempPath);
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp file:', cleanupError);
    }

    return NextResponse.json({
      success: true,
      result: {
        transcription: result.transcription,
        speakers: result.speakers,
        hotwords: result.hotwords,
        confidence: result.confidence,
        processingTime: result.processingTime,
        language: result.language
      }
    });

  } catch (error) {
    console.error('VibeVoice ASR API Error:', error);
    return NextResponse.json(
      { 
        error: 'Voice processing failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Handle GET for endpoint info
export async function GET() {
  return NextResponse.json({
    service: 'VibeVoice ASR API',
    version: '1.0.0',
    capabilities: {
      maxDuration: '60 minutes',
      languages: ['en', 'de', 'fr', 'it', 'jp', 'kr', 'nl', 'pl', 'pt', 'es'],
      features: ['speaker_diarization', 'hotword_detection', 'timestamps']
    },
    usage: {
      method: 'POST',
      contentType: 'multipart/form-data',
      fields: {
        audio: 'Audio file (wav, mp3, m4a)',
        hotwords: 'Optional comma-separated hotwords',
        language: 'Language code (default: en)'
      }
    }
  });
}