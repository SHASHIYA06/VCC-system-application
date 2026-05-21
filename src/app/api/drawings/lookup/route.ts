import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const drawingNo = searchParams.get('drawing_no');

  if (!drawingNo) {
    return NextResponse.json({ error: 'Drawing number required' }, { status: 400 });
  }

  try {
    const normalizedQuery = drawingNo.trim().toUpperCase();

    const drawing = await prisma.drawing.findFirst({
      where: {
        OR: [
          { drawingNo: { equals: normalizedQuery } },
          { drawingNo: { equals: normalizedQuery.replace(/-/g, '') } },
          { drawingNo: { contains: normalizedQuery } },
          { drawingNo: { contains: normalizedQuery.replace(/-/g, '') } },
          { drawingNo: { contains: normalizedQuery.replace('942-', '') } },
        ],
      },
      include: {
        pages: { orderBy: { pageNo: 'asc' } },
        system: true,
        connectors: { include: { pins: true } },
        trainLines: true,
        devices: { include: { system: true } },
        _count: { select: { connectors: true, trainLines: true, devices: true } }
      },
    });

    if (!drawing) {
      const suggestions = await getDrawingSuggestions(drawingNo);
      return NextResponse.json({ 
        error: 'Drawing not found', 
        suggestions,
        searchedQuery: drawingNo,
        tip: 'Try entering just the numeric portion (e.g., 58120 instead of 942-58120)'
      }, { status: 404 });
    }

    const relatedWires = await getRelatedWires(drawing.id, drawing.drawingNo);
    const relatedTrainlines = await getRelatedTrainlines(drawing.id);
    const relatedEquipment = await getRelatedEquipment(drawing.id);
    const relatedConnectors = await getRelatedConnectors(drawing.id);

    return NextResponse.json({
      drawing: {
        id: drawing.id,
        drawingNo: drawing.drawingNo,
        title: drawing.title,
        revision: drawing.revision,
        systemCode: drawing.system?.code || '',
        systemName: drawing.system?.name || '',
        totalSheets: drawing.totalSheets,
        sourceFile: drawing.sourceFileId,
        remarks: drawing.remarks,
        pageCount: drawing.pages.length,
        _count: drawing._count,
      },
      relatedWires,
      relatedTrainlines,
      relatedEquipment,
      relatedConnectors,
      suggestions: [],
    });
  } catch (error) {
    console.error('Drawing lookup error:', error);
    return NextResponse.json({ error: 'Database error', details: String(error) }, { status: 500 });
  }
}

async function getRelatedWires(drawingId: string, drawingNo: string) {
  // Method 1: Get wires through connector pins on this drawing
  const connectorsOnDrawing = await prisma.connector.findMany({
    where: { drawingId },
    include: {
      pins: {
        where: { wireNo: { not: null } },
        select: { wireNo: true }
      }
    }
  });

  const wireNosFromPins = connectorsOnDrawing
    .flatMap(c => c.pins.map(p => p.wireNo))
    .filter((w): w is string => w !== null);

  // Method 2: Get wires through wire endpoints linked to connectors on this drawing
  const wireEndpoints = await prisma.wireEndpoint.findMany({
    where: {
      connector: { drawingId }
    },
    include: {
      wire: true
    }
  });

  const wiresFromEndpoints = wireEndpoints.map(we => we.wire);

  // Method 3: Get wires mentioned in drawing remarks/description (fallback)
  const wiresFromRemarks = await prisma.wire.findMany({
    where: {
      OR: [
        { remarks: { contains: drawingNo } },
        { description: { contains: drawingNo } },
      ],
    },
    take: 20,
  });

  // Method 4: Get wires by wireNo if we have them from pins
  const wiresFromPinRefs = wireNosFromPins.length > 0 
    ? await prisma.wire.findMany({
        where: { wireNo: { in: wireNosFromPins } },
        take: 50
      })
    : [];

  // Combine and deduplicate
  const allWires = [...wiresFromEndpoints, ...wiresFromRemarks, ...wiresFromPinRefs];
  const uniqueWires = Array.from(
    new Map(allWires.map(w => [w.wireNo, w])).values()
  );

  return uniqueWires.slice(0, 50).map(w => ({
    wireNo: w.wireNo,
    signalName: w.signalName,
    wireColor: w.wireColor,
    voltageClass: w.voltageClass,
    sourceConnector: w.sourceConnector,
    destConnector: w.destConnector,
    sourceEquipment: w.sourceEquipment,
    destEquipment: w.destEquipment,
  }));
}

async function getRelatedTrainlines(drawingId: string) {
  const trainlines = await prisma.trainLine.findMany({
    where: { drawingId },
    orderBy: { wireNo: 'asc' },
    take: 100,
  });
  return trainlines;
}

async function getRelatedEquipment(drawingId: string) {
  const equipment = await prisma.device.findMany({
    where: { drawingId },
    include: { system: true },
    take: 50,
    orderBy: { deviceName: 'asc' },
  });
  return equipment.map(e => ({
    name: e.deviceName,
    tag: e.tagNo,
    carType: e.carType,
    systemCode: e.system?.code,
    systemName: e.system?.name,
  }));
}

async function getRelatedConnectors(drawingId: string) {
  const connectors = await prisma.connector.findMany({
    where: { drawingId },
    include: { pins: true, _count: { select: { pins: true } } },
    take: 50,
    orderBy: { connectorCode: 'asc' },
  });
  return connectors.map(c => ({
    connectorCode: c.connectorCode,
    connectorType: c.connectorTypeCode,
    description: c.description,
    carType: c.carType,
    pinCount: c._count.pins,
    pins: c.pins.map(p => ({
      pinNo: p.pinNo,
      signalName: p.signalName,
      wireNo: p.wireNo,
    })),
  }));
}

async function getDrawingSuggestions(query: string) {
  const normalizedQuery = query.trim().toUpperCase();
  
  const drawings = await prisma.drawing.findMany({
    where: {
      OR: [
        { drawingNo: { contains: normalizedQuery } },
        { drawingNo: { contains: normalizedQuery.replace(/-/g, '') } },
        { title: { contains: normalizedQuery, mode: 'insensitive' } },
      ],
    },
    select: { drawingNo: true, title: true, revision: true, system: { select: { code: true } } },
    take: 10,
    orderBy: { drawingNo: 'asc' },
  });
  return drawings;
}