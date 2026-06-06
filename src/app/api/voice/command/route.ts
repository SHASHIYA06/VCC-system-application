/**
 * Voice Command Processing API - Optimized for Serverless
 * Handles dashboard navigation and system queries via voice with lazy loading
 */

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

// Runtime configuration for bundle optimization
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 45; // 45 seconds max for voice command processing

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
    const includeResponse = formData.get('includeResponse') === 'true';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Save uploaded audio file temporarily
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const tempPath = path.join('/tmp', `voice_command_${Date.now()}.wav`);
    
    // Lazy load file system
    const { writeFile } = await getFileSystem();
    await writeFile(tempPath, buffer);

    // Lazy load VibeVoice client
    const vibeVoiceClient = await getVibeVoiceClient();

    // Process voice command
    const commandResult = await vibeVoiceClient.processVoiceCommand(tempPath);

    // If this is a query command and response is requested, process with RAG
    let ragResponse = null;
    let voiceResponse = null;

    if (commandResult.action === 'query' && includeResponse) {
      try {
        const ragResult = await vibeVoiceClient.voiceRAGQuery(tempPath);
        ragResponse = ragResult.aiResponse;
        voiceResponse = {
          audioFile: ragResult.voiceOutput.audioFile,
          duration: ragResult.voiceOutput.duration,
          speakers: ragResult.voiceOutput.speakers
        };
      } catch (ragError) {
        console.error('RAG processing error:', ragError);
        // Continue without RAG response
      }
    }

    // Clean up temporary file - lazy load fs
    try {
      const fs = await import('fs/promises');
      await fs.unlink(tempPath);
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp file:', cleanupError);
    }

    return NextResponse.json({
      success: true,
      command: {
        transcript: commandResult.command,
        action: commandResult.action,
        parameters: commandResult.parameters,
        confidence: commandResult.confidence
      },
      ragResponse,
      voiceResponse,
      suggestions: generateActionSuggestions(commandResult.action, commandResult.parameters)
    });

  } catch (error) {
    console.error('Voice Command API Error:', error);
    return NextResponse.json(
      { 
        error: 'Voice command processing failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

function generateActionSuggestions(
  action: string, 
  parameters: Record<string, any>
): Array<{ type: string; route?: string; query?: string; description: string }> {
  switch (action) {
    case 'navigate':
      return [
        {
          type: 'navigate',
          route: parameters.route,
          description: `Navigate to ${parameters.route}`
        }
      ];
      
    case 'search':
      return [
        {
          type: 'search',
          query: parameters.query,
          description: `Search for: "${parameters.query}"`
        },
        {
          type: 'navigate',
          route: '/search',
          description: 'Open advanced search'
        }
      ];
      
    case 'query':
      return [
        {
          type: 'ai_query',
          query: parameters.query,
          description: 'Process with AI Assistant'
        }
      ];
      
    default:
      return [
        {
          type: 'help',
          description: 'Try saying: "Show dashboard", "Search for wire 3003", or "What is TRAC system"'
        }
      ];
  }
}

// Handle GET for endpoint info and available commands
export async function GET() {
  return NextResponse.json({
    service: 'VCC Voice Command API',
    version: '1.0.0',
    availableCommands: {
      navigation: [
        'Go to dashboard',
        'Show drawings',
        'Show wires',
        'Show systems',
        'Show equipment',
        'Open reports',
        'Go to admin panel'
      ],
      search: [
        'Search for [term]',
        'Find wire [number]',
        'Find drawing [number]',
        'Show connector [name]',
        'Find system [code]'
      ],
      queries: [
        'What is [system/component]?',
        'Explain [technical term]',
        'Tell me about [wire/drawing/system]',
        'How does [system] work?'
      ]
    },
    usage: {
      method: 'POST',
      contentType: 'multipart/form-data',
      fields: {
        audio: 'Voice command audio file',
        includeResponse: 'Whether to include AI response (true/false)'
      }
    }
  });
}