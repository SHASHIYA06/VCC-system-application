/**
 * Voice Transcription API - Speech to Text
 * POST /api/voice/transcribe - Transcribe audio using OpenAI Whisper or fallback
 */

import { NextRequest, NextResponse } from 'next/server';

// VCC-specific navigation routes
const NAVIGATION_ROUTES: Record<string, string> = {
  'dashboard': '/dashboard',
  'home': '/dashboard',
  'drawings': '/drawings',
  'drawing': '/drawings',
  'wires': '/wires',
  'wire': '/wires',
  'systems': '/systems',
  'system': '/systems',
  'equipment': '/equipment',
  'connectors': '/connectors',
  'connector': '/connectors',
  'trainlines': '/trainlines',
  'pins': '/pins',
  'pin': '/pins',
  'troubleshooting': '/troubleshooting',
  'troubleshoot': '/troubleshooting',
  'gsd': '/gsd',
  'topology': '/gsd',
  'ai': '/ai-assistant',
  'intelligence': '/ai-assistant',
  'assistant': '/ai-assistant',
  'documents': '/documents',
  'vcc': '/vcc-reference',
  'reference': '/vcc-reference',
  'admin': '/admin',
  'reports': '/reports',
  'cars': '/cars',
};

function parseCommand(transcript: string): { action: string; parameters: Record<string, any> } {
  const lower = transcript.toLowerCase().trim();

  // Navigation commands
  for (const [keyword, route] of Object.entries(NAVIGATION_ROUTES)) {
    if (lower.includes(keyword)) {
      if (lower.includes('go to') || lower.includes('open') || lower.includes('show') || lower.includes('navigate')) {
        return { action: 'navigate', parameters: { route } };
      }
    }
  }

  // Search commands
  if (lower.includes('search') || lower.includes('find') || lower.includes('look for')) {
    const searchMatch = lower.match(/(?:search|find|look for)\s+(?:for\s+)?(.+)/);
    return { action: 'search', parameters: { query: searchMatch?.[1]?.trim() || '' } };
  }

  // Query commands (for AI)
  if (lower.includes('what is') || lower.includes('tell me') || lower.includes('explain') || lower.includes('how does')) {
    return { action: 'query', parameters: { query: transcript } };
  }

  // Default: treat as query
  return { action: 'query', parameters: { query: transcript } };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as Blob;
    const language = (formData.get('language') as string) || 'en';

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;

    if (openaiKey) {
      // Use OpenAI Whisper API
      const whisperFormData = new FormData();
      whisperFormData.append('file', audioFile, 'audio.webm');
      whisperFormData.append('model', 'whisper-1');
      whisperFormData.append('language', language);
      whisperFormData.append('response_format', 'json');

      const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: whisperFormData,
      });

      if (!whisperResponse.ok) {
        const error = await whisperResponse.text();
        console.error('Whisper transcription failed:', error);
        return NextResponse.json({
          success: false,
          error: 'Transcription failed',
          fallback: 'browser',
          message: 'OpenAI Whisper unavailable. Use browser Web Speech API.',
        }, { status: 200 });
      }

      const result = await whisperResponse.json();
      const transcript = result.text;
      const command = parseCommand(transcript);

      return NextResponse.json({
        success: true,
        transcript,
        command,
        confidence: 0.95,
        language,
        model: 'whisper-1',
      });
    }

    // No OpenAI key - instruct client to use browser recognition
    return NextResponse.json({
      success: false,
      fallback: 'browser',
      message: 'No OPENAI_API_KEY configured. Use browser Web Speech API for voice recognition.',
      voiceConfig: {
        lang: 'en-IN',
        continuous: false,
        interimResults: true,
      },
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({
      success: false,
      error: 'Transcription failed',
      fallback: 'browser',
      details: String(error),
    }, { status: 500 });
  }
}
