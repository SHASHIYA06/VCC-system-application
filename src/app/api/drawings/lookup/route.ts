import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const drawingNo = searchParams.get('drawing_no');

  if (!drawingNo) {
    return NextResponse.json({ error: 'Drawing number required' }, { status: 400 });
  }

  try {
    const drawing = await prisma.drawingDocument.findFirst({
      where: {
        OR: [
          { drawingNo: { equals: drawingNo, mode: 'insensitive' } },
          { drawingNo: { contains: drawingNo, mode: 'insensitive' } },
        ],
      },
      include: {
        pages: { orderBy: { pageNo: 'asc' } },
        devices: {
          include: {
            system: true,
            type: true,
            connectors: {
              include: {
                pins: {
                  orderBy: { pinNo: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!drawing) {
      return NextResponse.json({ 
        error: 'Drawing not found', 
        suggestions: await getDrawingSuggestions(drawingNo) 
      }, { status: 404 });
    }

    const relatedWires = await getRelatedWires(drawing.drawingNo);
    const relatedTrainlines = await getRelatedTrainlines(drawing.drawingNo);
    const relatedEquipment = await getRelatedEquipment(drawing.drawingNo);

    return NextResponse.json({
      drawing: {
        id: drawing.id,
        drawingNo: drawing.drawingNo,
        title: drawing.title,
        revision: drawing.revision,
        carType: drawing.carType,
        subsystem: drawing.subsystem,
        drawingType: drawing.drawingType,
        pageCount: drawing.pageCount,
        currentRevision: drawing.revision,
        systemCode: drawing.systemCode,
        sourceFile: drawing.sourceFile,
        notes: drawing.notes,
      },
      relatedWires,
      relatedTrainlines,
      relatedEquipment,
      deviceCount: drawing.devices.length,
      pinCount: drawing.devices.reduce((acc, d) => 
        acc + d.connectors.reduce((a, c) => a + c.pins.length, 0), 0
      ),
    });
  } catch (error) {
    console.error('Drawing lookup error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

async function getRelatedWires(drawingNo: string) {
  const wires = await prisma.wire.findMany({
    where: {
      OR: [
        { sourceEq: { contains: drawingNo, mode: 'insensitive' } },
        { destEq: { contains: drawingNo, mode: 'insensitive' } },
      ],
    },
    take: 20,
    orderBy: { wireNo: 'asc' },
  });
  return wires.map(w => ({
    wireNo: w.wireNo,
    signalName: w.signalName,
    wireColor: w.wireColor,
    sourceConnector: w.sourceConnector,
    destConnector: w.destConnector,
  }));
}

async function getRelatedTrainlines(drawingNo: string) {
  const trainlines = await prisma.wire.findMany({
    where: {
      signalName: { contains: drawingNo, mode: 'insensitive' },
    },
    select: { wireNo: true },
    take: 10,
  });
  return trainlines;
}

async function getRelatedEquipment(drawingNo: string) {
  const equipment = await prisma.deviceInstance.findMany({
    where: { documentId: drawingNo },
    include: { system: true },
    take: 20,
  });
  return equipment.map(e => ({
    name: e.name,
    tag: e.tag,
    carType: e.carType,
    systemCode: e.system?.code,
  }));
}

async function getDrawingSuggestions(query: string) {
  const drawings = await prisma.drawingDocument.findMany({
    where: {
      drawingNo: { contains: query, mode: 'insensitive' },
    },
    select: { drawingNo: true, title: true },
    take: 5,
  });
  return drawings;
}