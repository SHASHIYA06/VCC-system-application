import { NextRequest, NextResponse } from 'next/server';
import { executeMultiAgentQuery, executeSingleAgentQuery } from '@/lib/ai/multi-agent-rag';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, agentType = null, timeout = 30000 } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Set timeout for the query execution
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      let result;

      if (agentType) {
        // Single agent query
        const validAgents = ['drawing', 'wire', 'system', 'device', 'diagnostic'];
        if (!validAgents.includes(agentType)) {
          return NextResponse.json(
            {
              error: `Invalid agent type. Must be one of: ${validAgents.join(', ')}`,
            },
            { status: 400 }
          );
        }

        result = await executeSingleAgentQuery(agentType, query);
      } else {
        // Multi-agent query (all agents)
        result = await executeMultiAgentQuery(query);
      }

      clearTimeout(timeoutId);

      return NextResponse.json(result, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    } catch (error) {
      clearTimeout(timeoutId);

      if ((error as Error).name === 'AbortError') {
        return NextResponse.json(
          { error: `Query execution exceeded ${timeout}ms timeout` },
          { status: 504 }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error('Multi-Agent API Error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const agentType = searchParams.get('agent');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  // Redirect to POST for consistency
  return POST(
    new NextRequest(request.nextUrl, {
      method: 'POST',
      body: JSON.stringify({ query, agentType }),
    })
  );
}
