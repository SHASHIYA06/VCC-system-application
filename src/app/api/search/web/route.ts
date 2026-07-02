/**
 * TinyFish Web Search API
 * POST /api/search/web - Search the web using TinyFish
 * GET /api/search/web?q=query - Search the web
 */

import { NextRequest, NextResponse } from 'next/server';
import { TinyFishClient } from '@/lib/tinyfish';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const location = searchParams.get('location') || 'India';
  const numResults = parseInt(searchParams.get('num_results') || '5');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const client = new TinyFishClient();
    const results = await client.search(query, {
      location,
      language: 'en',
      numResults: Math.min(numResults, 20),
    });

    return NextResponse.json({
      success: true,
      data: results,
      query,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('TinyFish search error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Search failed',
        query,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, location = 'India', numResults = 5 } = body;

    if (!query) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    const client = new TinyFishClient();
    const results = await client.search(query, {
      location,
      language: 'en',
      numResults: Math.min(numResults, 20),
    });

    return NextResponse.json({
      success: true,
      data: results,
      query,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('TinyFish search error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Search failed',
      },
      { status: 500 }
    );
  }
}
