/**
 * Voice TTS API - Text to Speech using Browser-compatible streaming
 * POST /api/voice/speak - Convert text to speech audio
 * 
 * Uses OpenAI TTS API when available, falls back to browser Web Speech API indication
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'shimmer', speed = 1.0 } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;

    if (openaiKey) {
      // Use OpenAI TTS API - 'shimmer' voice is closest to young female
      const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text.substring(0, 4096), // Max 4096 chars
          voice: voice, // shimmer = young female voice
          speed: speed,
          response_format: 'mp3',
        }),
      });

      if (!ttsResponse.ok) {
        const error = await ttsResponse.text();
        console.error('OpenAI TTS failed:', error);
        return NextResponse.json({
          success: false,
          error: 'TTS generation failed',
          fallback: 'browser',
          message: 'Use browser Web Speech API for voice output',
          text,
        }, { status: 200 });
      }

      const audioBuffer = await ttsResponse.arrayBuffer();
      
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.byteLength.toString(),
          'X-Voice': voice,
          'X-Speed': speed.toString(),
        },
      });
    }

    // No OpenAI key - instruct client to use browser TTS
    return NextResponse.json({
      success: true,
      fallback: 'browser',
      message: 'Use browser Web Speech API',
      text,
      voiceConfig: {
        lang: 'en-IN',
        rate: 1.1,
        pitch: 1.4,
        voicePreference: 'Google हिन्दी',
        fallbackVoice: 'Microsoft Zira',
      },
    });
  } catch (error) {
    console.error('Voice speak error:', error);
    return NextResponse.json({
      success: false,
      error: 'Voice synthesis failed',
      fallback: 'browser',
      details: String(error),
    }, { status: 500 });
  }
}
