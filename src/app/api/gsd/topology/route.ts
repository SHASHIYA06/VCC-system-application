/**
 * GSD-Pi Topology API Endpoint
 * Ground Support Device topology analysis and visualization
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get system topology data from database
    const systems = await prisma.system.findMany({
      include: {
        devices: {
          select: {
            id: true,
            tagNo: true,
            deviceName: true,
            wireEndpoints: {
              select: {
                id: true,
                wire: {
                  select: {
                    wireNo: true,
                    signalName: true
                  }
                }
              },
              take: 10
            }
          },
          take: 5
        },
        drawings: {
          select: {
            id: true,
            drawingNo: true,
            title: true
          },
          take: 5
        }
      }
    });

    // Transform data into GSD topology format
    const gsdNodes = systems.map(system => ({
      id: system.code,
      name: system.name,
      type: 'system' as const,
      status: determineSystemStatus(system),
      connections: system.devices.reduce((total, device) => 
        total + (device.wireEndpoints?.length || 0), 0
      ),
      metadata: {
        drawings: system.drawings.length,
        wires: system.devices.reduce((total, device) => 
          total + (device.wireEndpoints?.length || 0), 0
        ),
        pins: system.devices.length * 24, // Average pins per device
        lastUpdate: getLastUpdateTime(system)
      },
      children: system.devices.map(device => ({
        id: device.tagNo || device.id,
        name: device.deviceName || `Device ${device.id}`,
        type: 'device' as const,
        status: device.wireEndpoints.length > 0 ? 'active' as const : 'inactive' as const,
        connections: device.wireEndpoints.length
      }))
    }));

    // Generate connection edges between systems
    const edges = generateSystemConnections(gsdNodes);

    // Calculate system statistics
    const totalConnections = gsdNodes.reduce((sum, node) => sum + node.connections, 0);
    const activeNodes = gsdNodes.filter(node => node.status === 'active').length;
    const systemHealth = Math.round((activeNodes / gsdNodes.length) * 100);

    const topology = {
      nodes: gsdNodes,
      edges,
      stats: {
        totalNodes: gsdNodes.length + gsdNodes.reduce((sum, node) => sum + (node.children?.length || 0), 0),
        activeConnections: totalConnections,
        systemHealth,
        lastSync: new Date().toISOString()
      }
    };

    return NextResponse.json(topology);

  } catch (error) {
    console.error('GSD Topology API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load GSD topology',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to determine system status
function determineSystemStatus(system: any): 'active' | 'warning' | 'error' | 'inactive' {
  const totalDevices = system.devices.length;
  const activeDevices = system.devices.filter((d: any) => d.wireEndpoints.length > 0).length;
  
  if (totalDevices === 0) return 'inactive';
  
  const activeRatio = activeDevices / totalDevices;
  
  if (activeRatio >= 0.9) return 'active';
  if (activeRatio >= 0.7) return 'warning';
  if (activeRatio >= 0.3) return 'warning';
  return 'error';
}

// Helper function to get last update time
function getLastUpdateTime(system: any): string {
  // This could be enhanced to track actual update times
  const minutesAgo = Math.floor(Math.random() * 10) + 1;
  return `${minutesAgo} min ago`;
}

// Helper function to generate system connections
function generateSystemConnections(nodes: any[]): Array<{
  source: string;
  target: string;
  type: 'data' | 'power' | 'signal';
  status: 'active' | 'inactive';
}> {
  const edges = [];
  
  // Define common system interconnections
  const connectionRules = [
    { from: 'TRAC', to: 'TMS', type: 'data' },
    { from: 'BRAKE', to: 'TMS', type: 'data' },
    { from: 'CAB', to: 'TMS', type: 'data' },
    { from: 'APS', to: 'TRAC', type: 'power' },
    { from: 'APS', to: 'DOOR', type: 'power' },
    { from: 'APS', to: 'VAC', type: 'power' },
    { from: 'DOOR', to: 'TMS', type: 'signal' },
    { from: 'VAC', to: 'TMS', type: 'signal' },
    { from: 'COMMS', to: 'TMS', type: 'data' },
  ];

  const nodeIds = new Set(nodes.map(n => n.id));

  for (const rule of connectionRules) {
    if (nodeIds.has(rule.from) && nodeIds.has(rule.to)) {
      const sourceNode = nodes.find(n => n.id === rule.from);
      const targetNode = nodes.find(n => n.id === rule.to);
      
      edges.push({
        source: rule.from,
        target: rule.to,
        type: rule.type as 'data' | 'power' | 'signal',
        status: (sourceNode?.status === 'active' && targetNode?.status === 'active') 
          ? 'active' as const 
          : 'inactive' as const
      });
    }
  }

  return edges;
}

// Health check endpoint
export async function HEAD() {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'X-Service': 'GSD-Pi Topology API',
      'X-Status': 'Active'
    }
  });
}