/**
 * Lightweight AI API - Optimized for Serverless Deployment
 * Uses minimal dependencies with dynamic loading for heavy operations
 */

import { NextRequest, NextResponse } from 'next/server';

// Use Edge Runtime for smaller bundle size
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max

// Lazy load functions to reduce bundle size
async function getLightweightRAG() {
  const module = await import('@/lib/ai/lightweight-rag');
  return {
    executeLightweightRAGQuery: module.executeLightweightRAGQuery,
    shouldUseLightweightMode: module.shouldUseLightweightMode,
    executeLightweightVoiceRAG: module.executeLightweightVoiceRAG,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      query, 
      useMultiAgent = false, 
      forceHeavy = false,
      includeVoiceResponse = false,
      model = 'lightweight-local',
      temperature = 0.2 
    } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Get lightweight RAG functions
    const { executeLightweightRAGQuery, shouldUseLightweightMode } = await getLightweightRAG();

    // Determine processing mode
    const useLightweight = !forceHeavy && (
      !useMultiAgent || 
      shouldUseLightweightMode(query)
    );

    // Execute query based on mode
    const result = await executeLightweightRAGQuery(query, {
      model,
      temperature,
      useMultiAgent: useLightweight ? false : useMultiAgent,
    });

    // Return appropriate response format
    if ('unifiedResponse' in result) {
      // Multi-agent response
      return NextResponse.json({
        query: result.query,
        response: result.unifiedResponse,
        executionTime: result.executionTime,
        mode: 'multi-agent',
        degradedMode: result.degradedMode,
        agentCount: result.agentCount,
      });
    } else {
      // Single agent response
      return NextResponse.json({
        query: result.query,
        response: result.response,
        confidence: result.confidence,
        executionTime: result.executionTime,
        sources: result.sources,
        mode: useLightweight ? 'lightweight' : 'single-agent',
        model: result.model,
      });
    }

  } catch (error) {
    console.error('AI Lite API Error:', error);
    return NextResponse.json(
      { 
        error: 'AI processing failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        mode: 'error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    if (action === 'status') {
      return NextResponse.json({
        service: 'VCC AI Lite API',
        version: '1.0.0',
        status: 'operational',
        features: {
          lightweight: true,
          multiAgent: true,
          voiceIntegration: true,
          serverlessOptimized: true,
        },
        modes: {
          lightweight: 'Fast responses using local database queries',
          multiAgent: 'Comprehensive AI analysis with multiple specialized agents',
          voiceRAG: 'Voice-enabled AI interactions with TTS response',
        },
      });
    }

    if (action === 'health') {
      // Quick health check without loading heavy dependencies
      let dbStatus = 'unknown';
      try {
        // Lazy load prisma for health check
        const { prisma } = await import('@/lib/prisma');
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = 'connected';
      } catch (dbError) {
        dbStatus = 'disconnected';
      }

      return NextResponse.json({
        status: 'healthy',
        database: dbStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    }

    return NextResponse.json({
      message: 'VCC AI Lite API - Serverless optimized AI processing',
      endpoints: {
        POST: {
          description: 'Process AI queries with automatic lightweight/heavy mode selection',
          body: {
            query: 'string (required) - Your question or query',
            useMultiAgent: 'boolean (optional) - Force multi-agent processing',
            forceHeavy: 'boolean (optional) - Force heavy processing mode',
            includeVoiceResponse: 'boolean (optional) - Generate voice response',
            model: 'string (optional) - AI model preference',
            temperature: 'number (optional) - Response creativity (0-1)',
          },
        },
        GET: {
          'action=status': 'Get API status and capabilities',
          'action=health': 'Health check with database connectivity',
        },
      },
      examples: {
        lightweightQuery: {
          query: 'Find wire 3003',
          useMultiAgent: false,
        },
        comprehensiveQuery: {
          query: 'Explain the TRAC system architecture',
          useMultiAgent: true,
        },
        voiceQuery: {
          query: 'What is the APS system?',
          includeVoiceResponse: true,
        },
      },
    });

  } catch (error) {
    console.error('AI Lite GET Error:', error);
    return NextResponse.json(
      { error: 'API information retrieval failed' },
      { status: 500 }
    );
  }
}

// Handle voice-specific queries
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcription, includeVoiceResponse = true, model } = body;

    if (!transcription || typeof transcription !== 'string') {
      return NextResponse.json(
        { error: 'Transcription is required and must be a string' },
        { status: 400 }
      );
    }

    // Get lightweight voice RAG function
    const { executeLightweightVoiceRAG } = await getLightweightRAG();

    // Process voice query
    const result = await executeLightweightVoiceRAG(transcription, {
      includeVoiceResponse,
      model,
    });

    return NextResponse.json({
      query: transcription,
      textResponse: result.textResponse,
      voiceResponse: result.voiceResponse,
      mode: 'voice-rag',
    });

  } catch (error) {
    console.error('Voice RAG Error:', error);
    return NextResponse.json(
      { 
        error: 'Voice processing failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}