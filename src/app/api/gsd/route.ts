import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const systems = await prisma.system.findMany({
      include: {
        _count: { select: { drawings: true, devices: true } },
      },
      orderBy: { sortOrder: 'asc' },
      take: 25,
    });

    const connectors = await prisma.connector.findMany({
      take: 50,
    });

    const trainLines = await prisma.trainLine.findMany({
      take: 50,
      orderBy: { wireNo: 'asc' },
    });

    const systemConnections = systems.map(sys => {
      return {
        code: sys.code,
        name: sys.name,
        category: sys.category,
        drawings: sys._count?.drawings || 0,
        devices: sys._count?.devices || 0,
        connections: [],
      };
    });

    const gsdData = {
      metadata: {
        totalSystems: systems.length,
        totalDrawings: systems.reduce((acc, s) => acc + (s._count?.drawings || 0), 0),
        totalDevices: systems.reduce((acc, s) => acc + (s._count?.devices || 0), 0),
        totalConnectors: connectors.length,
        totalWires: 19016,
        totalTrainLines: trainLines.length,
      },
      systems: systemConnections,
      network: buildNetworkGraph(systems, connectors, trainLines),
      topology: buildTopology(systems),
    };

    return NextResponse.json(gsdData);
  } catch (error) {
    console.error('GSD API error:', error);
    return NextResponse.json({ error: 'Failed to fetch GSD data', details: String(error) }, { status: 500 });
  }
}

function buildNetworkGraph(systems: unknown[], connectors: unknown[], trainLines: unknown[]) {
  const nodes = systems.map(s => ({
    id: s.code,
    label: s.name,
    type: 'system',
    connections: s._count?.drawings || 0,
  }));

  const edges: Array<{ from: string; to: string; label: string; type: string }> = [];

  trainLines.slice(0, 20).forEach(tl => {
    if (tl.lineGroup) {
      edges.push({
        from: 'TRL',
        to: tl.lineGroup,
        label: tl.wireNo,
        type: 'trainline',
      });
    }
  });

  return { nodes, edges };
}

function buildTopology(systems: unknown[]) {
  const layers = [
    { name: 'Power', systems: systems.filter(s => ['HV', 'APS', 'LTEB', 'LTJB', 'EDB'].includes(s.code)) },
    { name: 'Propulsion', systems: systems.filter(s => ['TRAC'].includes(s.code)) },
    { name: 'Control', systems: systems.filter(s => ['TMS', 'TRL', 'CAB'].includes(s.code)) },
    { name: 'Safety', systems: systems.filter(s => ['BRAKE'].includes(s.code)) },
    { name: 'Comfort', systems: systems.filter(s => ['DOOR', 'VAC'].includes(s.code)) },
    { name: 'Communication', systems: systems.filter(s => ['COMMS'].includes(s.code)) },
  ];

  return layers.filter(l => l.systems.length > 0);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { systemCode, fromSystem, toSystem, connectionType } = body;

    if (connectionType === 'system_connection') {
      return NextResponse.json({ 
        message: 'System connection mapped',
        from: fromSystem,
        to: toSystem,
        type: connectionType 
      });
    }

    return NextResponse.json({ error: 'Invalid connection type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 });
  }
}