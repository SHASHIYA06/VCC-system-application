import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { text, voice, model } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required for VoxCPM' }, { status: 400 });
    }

    // Call the local VoxCPM engine (vLLM-Omni compatible server)
    const voxcpmUrl = 'http://localhost:8000/v1/audio/speech';
    
    console.log(`[VoxCPM] Generating audio for text: "${text.substring(0, 50)}..."`);
    
    const response = await fetch(voxcpmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'openbmb/VoxCPM2',
        input: text,
        voice: voice || 'default'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[VoxCPM] Engine Error: ${response.status} - ${errorText}`);
      throw new Error(`VoxCPM Engine Error: ${response.status} - ${errorText}`);
    }

    // Return the audio buffer directly to the client
    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('[VoxCPM] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech with VoxCPM' },
      { status: 500 }
    );
  }
}
