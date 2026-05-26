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

    const results: Record<string, any> = {
      query: searchQuery,
      type,
      total: 0,
    };

    if (type === 'all' || type === 'wires') {
      const wires = await prisma.wire.findMany({
        where: {
          OR: [
            { wireNo: { contains: searchQuery } },
            { signalName: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { wireNo: 'asc' },
      });
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
      const drawings = await prisma.drawing.findMany({
        where: {
          OR: [
            { drawingNo: { contains: searchQuery } },
            { drawingNo: { contains: searchQuery.replace(/-/g, '') } },
            { title: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
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
  const normalizedWireNo = wireNo.trim().toUpperCase();

  const wireDetails = await prisma.wire.findFirst({
    where: {
      OR: [
        { wireNo: normalizedWireNo },
        { wireNo: { contains: normalizedWireNo } },
      ],
    },
  });

  const [pins, trainlines, wires, signalMatches] = await Promise.all([
    prisma.connectorPin.findMany({
      where: {
        wireNo: { contains: normalizedWireNo },
      },
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