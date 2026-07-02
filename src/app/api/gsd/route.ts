import { NextRequest, NextResponse } from 'next/server';
import { getSystemTopology, searchTopologyNodes } from '@/lib/gsd/topology';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Enhanced GSD API with proper error handling and tree system integration
 * GET /api/gsd - Get GSD topology data with comprehensive error handling
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const systemCode = searchParams.get('system');
  const deviceId = searchParams.get('device');
  const wireNo = searchParams.get('wire');
  const searchQuery = searchParams.get('search');
  const action = searchParams.get('action') || 'topology'; // Default to topology

  try {
    console.log(`🎯 GSD API Request: action=${action}, system=${systemCode}, device=${deviceId}, wire=${wireNo}`);

    // Default to topology if no valid action
    switch (action) {
      case 'topology': {
        const topology = await getSystemTopology(systemCode ?? undefined);
        return NextResponse.json({
          success: true,
          action: 'topology',
          data: topology,
          metadata: {
            nodeCount: topology.nodes.length,
            edgeCount: topology.edges.length,
            systemCount: topology.systems.length,
            executionTime: Date.now() - startTime,
            generatedAt: new Date().toISOString(),
          },
        });
      }

      case 'search': {
        if (!searchQuery) {
          return NextResponse.json({
            success: true,
            action: 'search',
            query: '',
            data: { nodes: [], searchQuery: '', resultCount: 0 },
            metadata: { resultCount: 0, executionTime: Date.now() - startTime },
          });
        }
        const nodes = await searchTopologyNodes(searchQuery, systemCode ?? undefined);
        return NextResponse.json({
          success: true,
          action: 'search',
          query: searchQuery,
          data: { nodes, searchQuery, resultCount: nodes.length },
          metadata: { resultCount: nodes.length, executionTime: Date.now() - startTime },
        });
      }

      default: {
        // Fallback to topology
        const topology = await getSystemTopology(undefined);
        return NextResponse.json({
          success: true,
          action: 'topology',
          data: topology,
          metadata: {
            nodeCount: topology.nodes.length,
            edgeCount: topology.edges.length,
            systemCount: topology.systems.length,
            executionTime: Date.now() - startTime,
            generatedAt: new Date().toISOString(),
          },
        });
      }
    }
  } catch (error) {
    console.error('❌ GSD API Error:', error);
    return NextResponse.json({
      success: false,
      action: 'topology',
      error: 'Failed to load GSD topology',
      details: String(error),
      metadata: {
        executionTime: Date.now() - startTime,
        generatedAt: new Date().toISOString(),
      },
    }, { status: 500 });
  }
}
