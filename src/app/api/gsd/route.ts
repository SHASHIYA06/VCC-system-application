import { NextRequest, NextResponse } from 'next/server';
import {
  getSystemTopology,
  getDeviceConnections,
  getWirePath,
  searchTopologyNodes,
  getSystemSpecificTopology,
} from '@/lib/gsd/topology';

/**
 * GSD API Endpoint
 * Returns system topology data for visualization
 *
 * Query Parameters:
 * - system: Filter by system code (e.g., DMC, TC, MC)
 * - device: Get connections for specific device
 * - wire: Get path for specific wire
 * - search: Search for nodes by label or metadata
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const systemCode = searchParams.get('system') || undefined;
  const deviceId = searchParams.get('device') || undefined;
  const wireNo = searchParams.get('wire') || undefined;
  const searchQuery = searchParams.get('search') || undefined;

  try {
    let topology;

    // Handle different query types
    if (deviceId) {
      // Get connections for specific device
      topology = await getDeviceConnections(deviceId);
    } else if (wireNo) {
      // Get path for specific wire
      topology = await getWirePath(wireNo);
    } else if (searchQuery) {
      // Search for nodes
      const nodes = await searchTopologyNodes(searchQuery, systemCode);
      return NextResponse.json({
        success: true,
        data: {
          nodes,
          searchQuery,
          resultCount: nodes.length,
        },
      });
    } else if (systemCode) {
      // Get system-specific topology
      topology = await getSystemSpecificTopology(systemCode);
    } else {
      // Get complete topology
      topology = await getSystemTopology();
    }

    return NextResponse.json({
      success: true,
      data: topology,
      query: {
        system: systemCode,
        device: deviceId,
        wire: wireNo,
        search: searchQuery,
      },
    });
  } catch (error) {
    console.error('GSD API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch GSD topology',
        details: String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for advanced queries
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { systemCode, deviceId, wireNo, searchQuery } = body;

    let topology;

    if (deviceId) {
      topology = await getDeviceConnections(deviceId);
    } else if (wireNo) {
      topology = await getWirePath(wireNo);
    } else if (searchQuery) {
      const nodes = await searchTopologyNodes(searchQuery, systemCode);
      return NextResponse.json({
        success: true,
        data: {
          nodes,
          searchQuery,
          resultCount: nodes.length,
        },
      });
    } else if (systemCode) {
      topology = await getSystemSpecificTopology(systemCode);
    } else {
      topology = await getSystemTopology();
    }

    return NextResponse.json({
      success: true,
      data: topology,
    });
  } catch (error) {
    console.error('GSD POST API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process GSD request',
      },
      { status: 500 }
    );
  }
}
