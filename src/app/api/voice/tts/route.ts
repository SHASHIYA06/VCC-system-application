/**
 * VibeVoice TTS (Text-to-Speech) API Endpoint
 * Converts text responses to natural voice output
 */

import { NextRequest, NextResponse } from 'next/server';
import { vibeVoiceClient } from '@/lib/voice/vibeVoiceClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, speakers = ['default'], outputFormat = 'wav' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      );
    }

    if (text.length > 10000) {
      return NextResponse.json(
        { error: 'Text too long (max 10,000 characters)' },
        { status: 400 }
      );
    }

    // Process with VibeVoice TTS
    const result = await vibeVoiceClient.textToSpeech(text, speakers);

    // Return audio file as binary response
    const headers = new Headers();
    headers.set('Content-Type', `audio/${result.format}`);
    headers.set('Content-Length', result.audioData.length.toString());
    headers.set('X-Audio-Duration', result.duration.toString());
    headers.set('X-Processing-Time', result.processingTime.toString());
    headers.set('X-Speaker-Count', result.speakers.toString());
    headers.set('Content-Disposition', `attachment; filename="vcc_voice_output.${result.format}"`);

    return new NextResponse(result.audioData as BodyInit, { 
      status: 200, 
      headers 
    });

  } catch (error) {
    console.error('VibeVoice TTS API Error:', error);
    return NextResponse.json(
      { 
        error: 'Text-to-speech conversion failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Handle GET for endpoint info
export async function GET() {
  return NextResponse.json({
    service: 'VibeVoice TTS API',
    version: '1.0.0',
    capabilities: {
      maxDuration: '90 minutes',
      maxSpeakers: 4,
      languages: ['en', 'de', 'fr', 'it', 'jp', 'kr', 'nl', 'pl', 'pt', 'es'],
      outputFormats: ['wav', 'mp3']
    },
    usage: {
      method: 'POST',
      contentType: 'application/json',
      body: {
        text: 'Text to convert to speech (required)',
        speakers: 'Array of speaker names (optional)',
        outputFormat: 'Audio format: wav or mp3 (optional, default: wav)'
      }
    }
  });
}