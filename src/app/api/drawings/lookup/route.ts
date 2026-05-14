import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const drawingNo = searchParams.get('drawing_no');

  if (!drawingNo) {
    return NextResponse.json({ error: 'Drawing number required' }, { status: 400 });
  }

  try {
    const drawing = await prisma.drawing.findFirst({
      where: {
        OR: [
          { drawingNo: { equals: drawingNo } },
          { drawingNo: { contains: drawingNo } },
        ],
      },
      include: {
        pages: { orderBy: { pageNo: 'asc' } },
        system: true,
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
        systemCode: drawing.system?.code || '',
        totalSheets: drawing.totalSheets,
        sourceFile: drawing.sourceFileId,
        remarks: drawing.remarks,
      },
      relatedWires,
      relatedTrainlines,
      relatedEquipment,
      pageCount: drawing.pages.length,
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
        { remarks: { contains: drawingNo } },
        { description: { contains: drawingNo } },
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
  const trainlines = await prisma.trainLine.findMany({
    where: { drawingId: drawingNo },
    select: { wireNo: true, itemName: true, lineGroup: true },
    take: 10,
  });
  return trainlines;
}

async function getRelatedEquipment(drawingNo: string) {
  const equipment = await prisma.device.findMany({
    where: { drawingId: drawingNo },
    include: { system: true },
    take: 20,
  });
  return equipment.map(e => ({
    name: e.deviceName,
    tag: e.tagNo,
    carType: e.carType,
    systemCode: e.system?.code,
  }));
}

async function getDrawingSuggestions(query: string) {
  const drawings = await prisma.drawing.findMany({
    where: { drawingNo: { contains: query } },
    select: { drawingNo: true, title: true },
    take: 5,
  });
  return drawings;
}