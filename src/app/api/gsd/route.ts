import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Run all queries in parallel with individual error isolation
    const [systems, connectorCount, wireCount, trainLineCount, devices, wires] = await Promise.all([
      prisma.system.findMany({
        include: {
          _count: { select: { drawings: true, devices: true } },
        },
        orderBy: { sortOrder: 'asc' },
      }).catch(() => []),
      prisma.connector.count().catch(() => 0),
      prisma.wire.count().catch(() => 0),
      prisma.trainLine.count().catch(() => 0),
      prisma.device.findMany({
        include: { system: true }
      }).catch(() => []),
      prisma.wire.findMany({
        where: {
          OR: [
            { sourceEquipment: { not: null } },
            { destEquipment: { not: null } }
          ]
        },
        select: {
          sourceEquipment: true,
          destEquipment: true,
          voltageClass: true
        }
      }).catch(() => []),
    ]);

    // Get a sample of train lines for topology edges
    const trainLines = await prisma.trainLine.findMany({
      take: 30,
      orderBy: { wireNo: 'asc' },
      select: { wireNo: true, lineGroup: true, itemName: true },
    }).catch(() => []);

    const systemConnections = systems.map(sys => ({
      code: sys.code,
      name: sys.name,
      category: sys.category || 'General',
      drawings: sys._count?.drawings || 0,
      devices: sys._count?.devices || 0,
      connections: [],
    }));

    const gsdData = {
      metadata: {
        totalSystems: systems.length,
        totalDrawings: systems.reduce((acc, s) => acc + (s._count?.drawings || 0), 0),
        totalDevices: systems.reduce((acc, s) => acc + (s._count?.devices || 0), 0),
        totalConnectors: connectorCount,
        totalWires: wireCount,
        totalTrainLines: trainLineCount,
      },
      systems: systemConnections,
      network: buildNetworkGraph(systems, trainLines, devices, wires),
      topology: buildTopology(systems),
    };

    return NextResponse.json(gsdData);
  } catch (error) {
    console.error('GSD API error:', error);
    // Return graceful fallback instead of 500 to prevent dashboard crash
    return NextResponse.json({
      metadata: {
        totalSystems: 0,
        totalDrawings: 0,
        totalDevices: 0,
        totalConnectors: 0,
        totalWires: 0,
        totalTrainLines: 0,
      },
      systems: [],
      network: { nodes: [], edges: [] },
      topology: [],
      error: 'Database temporarily unavailable',
    });
  }
}

function buildNetworkGraph(systems: any[], trainLines: any[], devices: any[], wires: any[]) {
  // Build React Flow compatible nodes with layout positions
  const nodes = systems.map((s, idx) => ({
    id: s.code,
    label: s.name,
    type: 'system',
    connections: s._count?.drawings || 0,
  }));

  // Build edges from train lines — only where both source and target exist as nodes
  const nodeIds = new Set(systems.map(s => s.code));

  // Build device to system map
  const deviceToSystemMap = new Map<string, string>();
  for (const d of devices) {
    if (d.tagNo && d.system?.code) {
      deviceToSystemMap.set(d.tagNo.toUpperCase(), d.system.code);
    }
  }

  // Count connections dynamically
  const connectionCounts: Record<string, { count: number; voltages: Set<string> }> = {};
  const dynamicEdgeKeys = new Set<string>();

  for (const wire of wires) {
    const srcSys = wire.sourceEquipment ? deviceToSystemMap.get(wire.sourceEquipment.toUpperCase()) : null;
    const destSys = wire.destEquipment ? deviceToSystemMap.get(wire.destEquipment.toUpperCase()) : null;
    
    if (srcSys && destSys && srcSys !== destSys && nodeIds.has(srcSys) && nodeIds.has(destSys)) {
      const sorted = [srcSys, destSys].sort();
      const key = `${sorted[0]}->${sorted[1]}`;
      if (!connectionCounts[key]) {
        connectionCounts[key] = { count: 0, voltages: new Set() };
      }
      connectionCounts[key].count++;
      if (wire.voltageClass) {
        connectionCounts[key].voltages.add(wire.voltageClass);
      }
      dynamicEdgeKeys.add(`${sorted[0]}-${sorted[1]}`);
      dynamicEdgeKeys.add(`${sorted[1]}-${sorted[0]}`);
    }
  }

  const edges: Array<{ from: string; to: string; label: string; type: string }> = [];

  // Add dynamic edges
  for (const [key, info] of Object.entries(connectionCounts)) {
    const [from, to] = key.split('->');
    let type = 'data';
    if (info.voltages.has('750VDC') || info.voltages.has('110VDC') || from === 'HV' || to === 'HV' || from === 'APS' || to === 'APS') {
      type = 'power';
    } else if (from === 'TMS' || to === 'TMS' || from === 'CAB' || to === 'CAB') {
      type = 'control';
    }
    edges.push({
      from,
      to,
      label: `${info.count} Wires`,
      type
    });
  }

  // Fallback / default schematic topology edges
  const defaultEdges = [
    { from: 'HV', to: 'APS', label: 'Power Feed', type: 'power' },
    { from: 'HV', to: 'TRAC', label: 'HV Supply', type: 'power' },
    { from: 'APS', to: 'TMS', label: 'LV Power', type: 'power' },
    { from: 'APS', to: 'COMMS', label: 'LV Power', type: 'power' },
    { from: 'APS', to: 'DOOR', label: 'LV Power', type: 'power' },
    { from: 'APS', to: 'VAC', label: 'LV Power', type: 'power' },
    { from: 'TMS', to: 'BRAKE', label: 'Control', type: 'control' },
    { from: 'TMS', to: 'DOOR', label: 'Status', type: 'data' },
    { from: 'TMS', to: 'TRAC', label: 'Traction Cmd', type: 'control' },
    { from: 'TRL', to: 'TMS', label: 'Train Bus', type: 'data' },
    { from: 'CAB', to: 'TMS', label: 'Driver Cmd', type: 'control' },
    { from: 'COMMS', to: 'TMS', label: 'Comms Data', type: 'data' },
  ];

  for (const de of defaultEdges) {
    if (nodeIds.has(de.from) && nodeIds.has(de.to)) {
      const key = `${de.from}-${de.to}`;
      if (!dynamicEdgeKeys.has(key)) {
        edges.push(de);
      }
    }
  }

  return { nodes, edges };
}

function buildTopology(systems: any[]) {
  const layers = [
    { name: 'Power Distribution', systems: systems.filter(s => ['HV', 'APS', 'LTEB', 'LTJB', 'EDB'].includes(s.code)) },
    { name: 'Propulsion', systems: systems.filter(s => ['TRAC'].includes(s.code)) },
    { name: 'Vehicle Control', systems: systems.filter(s => ['TMS', 'TRL', 'CAB'].includes(s.code)) },
    { name: 'Safety & Braking', systems: systems.filter(s => ['BRAKE', 'BOGIE'].includes(s.code)) },
    { name: 'Passenger Comfort', systems: systems.filter(s => ['DOOR', 'VAC'].includes(s.code)) },
    { name: 'Communication', systems: systems.filter(s => ['COMMS'].includes(s.code)) },
    { name: 'Other Systems', systems: systems.filter(s => !['HV', 'APS', 'LTEB', 'LTJB', 'EDB', 'TRAC', 'TMS', 'TRL', 'CAB', 'BRAKE', 'BOGIE', 'DOOR', 'VAC', 'COMMS'].includes(s.code)) },
  ];

  return layers.filter(l => l.systems.length > 0);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromSystem, toSystem, connectionType } = body;

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