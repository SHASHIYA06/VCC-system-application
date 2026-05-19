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

    const relatedWires = await getRelatedWires(drawing, drawing.drawingNo);
    const relatedTrainlines = await getRelatedTrainlines(drawing.id);
    const relatedEquipment = await getRelatedEquipment(drawing.id);
    const relatedConnectors = await getRelatedConnectors(drawing);

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

async function getRelatedWires(drawing: any, drawingNo: string) {
  let wires: any[] = [];
  
  const byRemarks = await prisma.wire.findMany({
    where: {
      OR: [
        { remarks: { contains: drawingNo } },
        { description: { contains: drawingNo } },
      ],
    },
    take: 30,
    orderBy: { wireNo: 'asc' },
  });
  
  if (byRemarks.length > 0) {
    wires = byRemarks;
  } else if (drawing.sourceFileId) {
    const relatedDrawings = await prisma.drawing.findMany({
      where: { sourceFileId: drawing.sourceFileId },
      select: { id: true }
    });
    
    const drawingIds = relatedDrawings.map(d => d.id);
    
    if (drawingIds.length > 0) {
      const connectors = await prisma.connector.findMany({
        where: { drawingId: { in: drawingIds } },
        select: { connectorCode: true }
      });
      
      const connectorCodes = connectors.map(c => c.connectorCode);
      
      if (connectorCodes.length > 0) {
        wires = await prisma.wire.findMany({
          where: {
            OR: [
              { sourceConnector: { in: connectorCodes } },
              { destConnector: { in: connectorCodes } },
            ],
          },
          take: 50,
          orderBy: { wireNo: 'asc' },
        });
      }
    }
  }
  
  return wires.map(w => ({
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

async function getRelatedConnectors(drawing: any) {
  let connectors: any[] = [];
  
  const directConnectors = await prisma.connector.findMany({
    where: { drawingId: drawing.id },
    include: { pins: true, _count: { select: { pins: true } } },
    take: 30,
    orderBy: { connectorCode: 'asc' },
  });

  if (directConnectors.length > 0) {
    connectors = directConnectors;
  } else if (drawing.sourceFileId) {
    const relatedDrawings = await prisma.drawing.findMany({
      where: { sourceFileId: drawing.sourceFileId },
      select: { id: true }
    });
    
    const drawingIds = relatedDrawings.map(d => d.id);
    
    if (drawingIds.length > 0) {
      connectors = await prisma.connector.findMany({
        where: { drawingId: { in: drawingIds } },
        include: { pins: true, _count: { select: { pins: true } } },
        take: 50,
        orderBy: { connectorCode: 'asc' },
      });
    }
  }

  return connectors.map((c: any) => ({
    connectorCode: c.connectorCode,
    connectorType: c.connectorTypeCode,
    description: c.description,
    carType: c.carType,
    pinCount: c._count.pins,
    pins: c.pins.map((p: any) => ({
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