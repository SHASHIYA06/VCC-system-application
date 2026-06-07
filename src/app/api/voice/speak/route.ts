/**
 * Text-to-Speech API using OpenAI TTS
 * High quality voice synthesis for AI responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('🔊 Text-to-speech request received');

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured');
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key not configured',
        message: 'Please set OPENAI_API_KEY in your .env.local file',
        fallback: 'browser' // Fallback to browser Speech Synthesis API
      }, { status: 500 });
    }

    const body = await request.json();
    const { text, voice = 'alloy', speed = 1.0 } = body;

    if (!text) {
      return NextResponse.json({
        success: false,
        error: 'No text provided'
      }, { status: 400 });
    }

    console.log(`📝 Generating speech for text: "${text.substring(0, 50)}..."`);

    // Import OpenAI dynamically
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log(`🔄 Calling OpenAI TTS API (voice: ${voice}, speed: ${speed})...`);

    // Generate speech using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1', // or 'tts-1-hd' for higher quality
      voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      input: text,
      speed: speed,
    });

    // Convert response to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Save to temporary file
    const filename = `speech_${Date.now()}.mp3`;
    const filepath = path.join('/tmp', filename);
    await writeFile(filepath, buffer);

    const executionTime = Date.now() - startTime;
    console.log(`✅ Speech generated in ${executionTime}ms: ${filename}`);

    // Return the audio file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'X-Execution-Time': executionTime.toString(),
        'X-Provider': 'openai-tts',
        'X-Voice': voice,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('❌ Text-to-speech error:', error);

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
      error: 'Text-to-speech failed',
      details: errorMessage,
      fallback: 'browser',
      executionTime
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'OpenAI TTS (Text-to-Speech)',
    version: '1.0.0',
    models: ['tts-1', 'tts-1-hd'],
    voices: {
      alloy: 'Neutral and balanced (default)',
      echo: 'Male voice',
      fable: 'British accent',
      onyx: 'Deep male voice',
      nova: 'Female voice',
      shimmer: 'Soft female voice'
    },
    capabilities: {
      languages: ['Multiple languages supported'],
      formats: ['mp3'],
      quality: 'High (24kHz sample rate)',
      speed: 'Adjustable (0.25 - 4.0)'
    },
    usage: {
      method: 'POST',
      contentType: 'application/json',
      body: {
        text: 'Text to convert to speech (required)',
        voice: 'Voice name (optional, default: alloy)',
        speed: 'Speech speed (optional, default: 1.0, range: 0.25-4.0)'
      },
      example: {
        text: 'Hello, this is a test of the VCC voice system.',
        voice: 'alloy',
        speed: 1.0
      }
    },
    fallback: 'Browser Speech Synthesis API if OpenAI is unavailable'
  });
}
