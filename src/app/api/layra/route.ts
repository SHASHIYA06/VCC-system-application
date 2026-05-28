import { NextRequest, NextResponse } from 'next/server';

const LAYRA_API_URL = process.env.LAYRA_API_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, taskType } = body;

    // Call LAYRA sidecar backend
    const layraResponse = await fetch(`${LAYRA_API_URL}/api/v1/workflows/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: 'document-qa',
        inputs: {
          query: query,
          context: taskType || 'engineering'
        }
      }),
      // Fast timeout since we expect it to be a local sidecar
      signal: AbortSignal.timeout(30000)
    });

    if (!layraResponse.ok) {
      console.warn('LAYRA sidecar unavailable or returned error. Status:', layraResponse.status);
      return NextResponse.json({ 
        success: false, 
        message: 'LAYRA sidecar is not running or returned an error. Ensure the docker containers are active.',
        isFallback: true 
      });
    }

    const data = await layraResponse.json();
    
    return NextResponse.json({
      success: true,
      agent: 'LAYRA Workflow Engine',
      content: data.output || data.result,
      sourceDocuments: data.sources || []
    });

  } catch (error) {
    console.error('Failed to communicate with LAYRA sidecar:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to reach LAYRA backend sidecar. Ensure you have run the setup-layra.sh script.',
      isFallback: true
    }, { status: 503 });
  }
}
