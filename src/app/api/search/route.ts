import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { multiAgentRAG } from '@/lib/rag/multiagent';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || searchParams.get('query');
  const type = searchParams.get('type') || 'all';
  const wireNo = searchParams.get('wire') || searchParams.get('wire_no');
  const connectorCode = searchParams.get('connector');
  const systemCode = searchParams.get('subsystem');
  const carType = searchParams.get('car');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);

  if (!query && !wireNo) {
    return NextResponse.json({ error: 'Query parameter "q" or "wire" is required' }, { status: 400 });
  }

  const searchQuery = (query || wireNo)!;

  try {
    if (wireNo) {
      return await searchWireEverywhere(wireNo, limit);
    }

    // Helper function to build wire search conditions
    const buildSearchConditions = (query: string): any[] => {
      const match = query.match(/^(\d+(?:-\d+)?)(.*)?$/);
      let numericBase = '';
      let suffix = '';
      
      if (match) {
        numericBase = match[1];
        suffix = match[2] || '';
      }
      
      if (!numericBase) {
        const drawingMatch = query.match(/^([A-Z0-9-]+?)([A-Z]+)?$/);
        if (drawingMatch) {
          numericBase = drawingMatch[1];
          suffix = drawingMatch[2] || '';
        }
      }
      
      const upper = query.toUpperCase();
      const normalizedNoSpecial = query.replace(/[\/\-\s]/g, '');
      const normalizedNoSpaces = query.replace(/\s/g, '');
      
      const conditions: any[] = [
        { wireNo: { equals: query } },
        { wireNo: { equals: upper } },
        { wireAlias: { equals: query, mode: 'insensitive' } },
        { wireAlias: { equals: upper, mode: 'insensitive' } },
        { wireNo: { contains: query, mode: 'insensitive' } },
        { wireNo: { contains: normalizedNoSpaces, mode: 'insensitive' } },
        { wireAlias: { contains: query, mode: 'insensitive' } },
        { signalName: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
      
      if (numericBase && numericBase.length >= 2) {
        conditions.push({ wireNo: { startsWith: numericBase } });
        const normalizedBase = numericBase.replace(/-/g, '');
        if (normalizedBase !== numericBase) {
          conditions.push({ wireNo: { startsWith: normalizedBase } });
        }
      }
      
      if (normalizedNoSpecial && normalizedNoSpecial !== query && normalizedNoSpecial.length >= 2) {
        conditions.push({ wireNo: { contains: normalizedNoSpecial, mode: 'insensitive' } });
        conditions.push({ wireAlias: { contains: normalizedNoSpecial, mode: 'insensitive' } });
      }
      
      if (suffix && suffix.length >= 1) {
        conditions.push({ wireNo: { endsWith: suffix } });
        const normalizedSuffix = suffix.replace(/[\/\-]/g, '');
        if (normalizedSuffix !== suffix) {
          conditions.push({ wireNo: { endsWith: normalizedSuffix } });
        }
      }
      
      return conditions;
    };

    const results: Record<string, any> = {
      query: searchQuery,
      type,
      total: 0,
    };

    if (type === 'all' || type === 'wires') {
      // Alphanumeric wire search: support 3001a, 3001/1, 3001A, 3001-1
      const wireWhere: any = { OR: buildSearchConditions(searchQuery) };
      const rawWires = await prisma.wire.findMany({
        where: wireWhere,
        take: Math.min(limit * 5, 500),
        orderBy: { wireNo: 'asc' },
      });
      // Re-rank by relevance so exact match (3001a) beats incidental (01222a)
      const q = searchQuery.trim().toLowerCase();
      const qNoSpecial = q.replace(/[\/\-\s]/g, '');
      const base = q.match(/^(\d+(?:-\d+)?)/)?.[1] || '';
      const score = (wireNo: string): number => {
        const w = wireNo.toLowerCase();
        const wNoSpecial = w.replace(/[\/\-\s]/g, '');
        if (w === q) return 1000;
        if (wNoSpecial === qNoSpecial) return 900;
        if (w.startsWith(q)) return 800;
        if (base && w === base) return 700;
        if (base && w.startsWith(base)) return 600;
        if (w.includes(q)) return 400;
        if (wNoSpecial.includes(qNoSpecial)) return 300;
        return 100;
      };
      const wires = rawWires
        .map(w => ({ w, s: score(w.wireNo) }))
        .sort((a, b) => (b.s - a.s) || a.w.wireNo.localeCompare(b.w.wireNo))
        .slice(0, limit)
        .map(x => x.w);
      results.wires = wires;
      results.total += wires.length;
    }

    if (type === 'all' || type === 'connectors') {
      const connectors = await prisma.connector.findMany({
        where: {
          OR: [
            { connectorCode: { contains: searchQuery } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        include: {
          connectorType: true,
          drawing: { include: { system: true } },
          _count: { select: { pins: true } },
          pins: { take: 5, orderBy: { pinNo: 'asc' } },
        },
        take: limit,
        orderBy: { connectorCode: 'asc' },
      });
      results.connectors = connectors.map(c => ({
        ...c,
        pinCount: c._count.pins,
        system: c.drawing?.system?.code,
        drawingNo: c.drawing?.drawingNo,
      }));
      results.total += connectors.length;
    }

    if (type === 'all' || type === 'equipment') {
      const equipment = await prisma.device.findMany({
        where: {
          OR: [
            { deviceName: { contains: searchQuery, mode: 'insensitive' } },
            { tagNo: { contains: searchQuery } },
          ],
          ...(carType && { carType }),
        },
        include: { system: true },
        take: limit,
        orderBy: { deviceName: 'asc' },
      });
      results.equipment = equipment;
      results.total += equipment.length;
    }

    if (type === 'all' || type === 'drawings') {
      // Support suffix variants: 942-58120 finds 942-58120A, 942-58120B, etc.
      const drawBase = searchQuery.replace(/[A-Z]+$/, '');
      const drawings = await prisma.drawing.findMany({
        where: { OR: [
          { drawingNo: { contains: searchQuery } },
          { drawingNo: { contains: searchQuery.replace(/-/g, '') } },
          { drawingNo: { startsWith: drawBase } },
          { title: { contains: searchQuery, mode: 'insensitive' } },
        ]},
        include: { system: true },
        take: limit,
        orderBy: { drawingNo: 'asc' },
      });
      results.drawings = drawings;
      results.total += drawings.length;
    }

    if (type === 'all' || type === 'trainlines') {
      const trainlines = await prisma.trainLine.findMany({
        where: {
          OR: [
            { wireNo: { contains: searchQuery } },
            { itemName: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        include: { drawing: { include: { system: true } } },
        take: limit,
        orderBy: { wireNo: 'asc' },
      });
      results.trainlines = trainlines;
      results.total += trainlines.length;
    }

    if (type === 'all' || type === 'systems') {
      const systems = await prisma.system.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { code: { contains: searchQuery } },
          ],
        },
        include: { _count: { select: { devices: true, drawings: true } } },
        take: limit,
        orderBy: { name: 'asc' },
      });
      results.systems = systems;
      results.total += systems.length;
    }

    if (type === 'all' || type === 'signals') {
      const signals = await prisma.signal.findMany({
        where: {
          OR: [
            { signalName: { contains: searchQuery, mode: 'insensitive' } },
            { signalCode: { contains: searchQuery } },
          ],
        },
        take: limit,
        orderBy: { signalName: 'asc' },
      });
      results.signals = signals;
      results.total += signals.length;
    }

    if (type === 'all' || type === 'pins') {
      const pins = await prisma.connectorPin.findMany({
        where: {
          OR: [
            { wireNo: { contains: searchQuery } },
            { signalName: { contains: searchQuery, mode: 'insensitive' } },
            { pinNo: { contains: searchQuery } },
          ],
        },
        include: {
          connector: { include: { drawing: { include: { system: true } } } },
        },
        take: limit,
        orderBy: { wireNo: 'asc' },
      });
      results.pins = pins.map(p => ({
        id: p.id,
        pinNo: p.pinNo,
        signalName: p.signalName,
        wireNo: p.wireNo,
        connectorCode: p.connector?.connectorCode,
        drawingNo: p.connector?.drawing?.drawingNo,
        systemCode: p.connector?.drawing?.system?.code,
      }));
      results.total += pins.length;
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

async function searchWireEverywhere(wireNo: string, limit: number) {
  // Alphanumeric normalization: 3001a → base 3001, 3001/1 → base 3001
  const normalizedWireNo = wireNo.trim().toUpperCase();
  // Extract numeric base correctly: leading digits (with optional -digits),
  // ignoring any alpha/slash suffix. 3001A → 3001, 3001/1 → 3001, 942-58142 → 942-58142
  const numBase = (normalizedWireNo.match(/^(\d+(?:-\d+)?)/)?.[1]) || normalizedWireNo.replace(/[A-Z]+$/, '').replace(/[\/\-]/g, '');
  const normalized = normalizedWireNo.replace(/[\/\-\s]/g, '');

  const wireDetails = await prisma.wire.findFirst({
    where: {
      OR: [
        { wireNo: normalizedWireNo },
        { wireNo: { equals: normalizedWireNo, mode: 'insensitive' } },
        { wireAlias: { equals: normalizedWireNo, mode: 'insensitive' } },
        { wireNo: { contains: normalizedWireNo, mode: 'insensitive' } },
        { wireNo: { startsWith: numBase } },
      ],
    },
  });

  const wireSearchWhere = { OR: [
    { wireNo: { contains: normalizedWireNo, mode: 'insensitive' } },
    { wireNo: { startsWith: numBase } },
    { wireAlias: { contains: normalizedWireNo, mode: 'insensitive' } },
    normalized !== normalizedWireNo ? { wireNo: { contains: normalized, mode: 'insensitive' } } : {},
  ].filter(c => Object.keys(c).length > 0) };

  const pinSearchWhere = { OR: [
    { wireNo: { contains: normalizedWireNo } },
    { wireNo: normalizedWireNo },
    { wireNo: { startsWith: numBase } },
  ]};

  const [pins, trainlines, wires, signalMatches] = await Promise.all([
    prisma.connectorPin.findMany({
      where: pinSearchWhere,
      include: {
        connector: {
          include: {
            drawing: { include: { system: true } },
            _count: { select: { pins: true } },
          },
        },
      },
      orderBy: { wireNo: 'asc' },
    }),
    prisma.trainLine.findMany({
      where: {
        OR: [
          { wireNo: { contains: normalizedWireNo } },
          { wireNo: normalizedWireNo },
        ],
      },
      include: {
        drawing: { include: { system: true } },
        conductorClass: true,
      },
      orderBy: { wireNo: 'asc' },
    }),
    prisma.wire.findMany({
      where: {
        OR: [
          { wireNo: normalizedWireNo },
          { wireNo: { contains: normalizedWireNo } },
          { signalName: { contains: normalizedWireNo, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { wireNo: 'asc' },
    }),
    prisma.signal.findMany({
      where: {
        OR: [
          { signalCode: { contains: normalizedWireNo } },
          { signalName: { contains: normalizedWireNo, mode: 'insensitive' } },
        ],
      },
      take: limit,
    }),
  ]);

  const pinsByDrawing = pins.reduce((acc, pin) => {
    const dwgNo = pin.connector?.drawing?.drawingNo || 'Unknown';
    if (!acc[dwgNo]) {
      acc[dwgNo] = {
        drawingNo: dwgNo,
        system: pin.connector?.drawing?.system?.code || 'N/A',
        title: pin.connector?.drawing?.title || 'N/A',
        pins: [],
      };
    }
    acc[dwgNo].pins.push({
      pinNo: pin.pinNo,
      signalName: pin.signalName,
      connectorCode: pin.connector?.connectorCode || 'Unknown',
      wireNo: pin.wireNo,
    });
    return acc;
  }, {} as Record<string, { drawingNo: string; system: string; title: string; pins: unknown[] }>);

  const uniqueDrawings = Object.values(pinsByDrawing);

  return NextResponse.json({
    query: wireNo,
    type: 'wire_trace',
    wire: wireDetails ? {
      wireNo: wireDetails.wireNo,
      signalName: wireDetails.signalName,
      voltageClass: wireDetails.voltageClass,
      wireColor: wireDetails.wireColor,
      description: wireDetails.description,
      sourceEquipment: wireDetails.sourceEquipment,
      sourceConnector: wireDetails.sourceConnector,
      destEquipment: wireDetails.destEquipment,
      destConnector: wireDetails.destConnector,
    } : null,
    pinConnections: uniqueDrawings,
    trainlineEntries: trainlines,
    signalMatches,
    metadata: {
      totalPins: pins.length,
      totalTrainlineEntries: trainlines.length,
      totalDrawings: uniqueDrawings.length,
      wireFound: !!wireDetails,
    },
    locations: uniqueDrawings.map(d => ({
      drawingNo: d.drawingNo,
      system: d.system,
      pinCount: d.pins.length,
    })),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, wireNo, filters = {} } = body;
    const { carType, systemCode, limit = 50 } = filters;

    if (wireNo) {
      return await searchWireEverywhere(wireNo, limit);
    }

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const task = {
      taskId: `search-${Date.now()}`,
      taskType: 'unified_search' as const,
      query,
      context: { carType, systemCode },
    };
    const result = await multiAgentRAG.executeTask(task);

    return NextResponse.json({
      query,
      agentResult: {
        agent: result.agentId,
        content: result.content,
        confidence: result.confidence,
        data: result.data,
      },
    });
  } catch (error) {
    console.error('Search POST error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}