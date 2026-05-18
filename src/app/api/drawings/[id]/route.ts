import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const drawing = await prisma.drawing.findFirst({
      where: {
        OR: [
          { id: id },
          { drawingNo: { contains: id, mode: Prisma.QueryMode.insensitive } },
        ],
      },
      include: {
        pages: { orderBy: { pageNo: 'asc' } },
        system: true,
        connectors: { include: { pins: true } },
      },
    });

    if (!drawing) {
      return NextResponse.json({ error: 'Drawing not found' }, { status: 404 });
    }

    const pins = await prisma.connectorPin.findMany({
      where: {
        connector: {
          drawingId: drawing.id,
        },
      },
      include: {
        connector: true,
      },
      take: 500,
    });

    const trainLines = await prisma.trainLine.findMany({
      where: { drawingId: drawing.id },
      take: 200,
    });

    const formattedPins = pins.map(pin => ({
      id: pin.id,
      pinNo: pin.pinNo,
      signalName: pin.signalName,
      wireNo: pin.wireNo,
      wireColor: pin.conductorClassCode,
      pinLabel: pin.pinLabel,
      connectorCode: pin.connector?.connectorCode || 'N/A',
      equipmentCode: pin.connector?.connectorCode || 'N/A',
      endpointLabel: pin.terminalFrom || pin.terminalTo,
    }));

    const formattedTrainLines = trainLines.map(tl => ({
      id: tl.id,
      lineGroup: tl.lineGroup,
      itemName: tl.itemName,
      wireNo: tl.wireNo,
      connectorCode: tl.connectorCode,
      pinNo: tl.pinNo,
    }));

    const remarks = drawing.remarks || '';
    const isPinAssignment = remarks.includes('PIN_ASSIGNMENT');
    const isReference = remarks.includes('REFERENCE');
    const remarksParts = remarks.split('|');
    const carType = remarksParts[2] || (isPinAssignment ? drawing.system?.code : 'ALL') || 'ALL';
    const subsystem = drawing.system?.code || 'GEN';

    const drawingTypeMap: Record<string, string> = {
      GEN: 'DRAWING_LIST',
      TRL: 'SCHEMATIC',
      TRAC: 'SCHEMATIC',
      HV: 'SCHEMATIC',
      BRAKE: 'SCHEMATIC',
      DOOR: 'SCHEMATIC',
      TMS: isPinAssignment ? 'PIN_ASSIGNMENT' : 'SCHEMATIC',
      COMMS: 'SCHEMATIC',
      APS: 'SCHEMATIC',
    };

    const finalDrawingType = isPinAssignment ? 'PIN_ASSIGNMENT' : (isReference ? 'REFERENCE' : drawingTypeMap[drawing.system?.code || 'GEN'] || 'SCHEMATIC');

    return NextResponse.json({
      drawing: {
        id: drawing.id,
        drawingNo: drawing.drawingNo,
        title: drawing.title,
        carType: carType,
        subsystem: subsystem,
        drawingType: finalDrawingType,
        currentRevision: drawing.revision || 'A',
        pageCount: drawing.totalSheets,
        notes: drawing.remarks || '',
        systemCode: drawing.system?.code || 'GEN',
        systemName: drawing.system?.name || 'General',
        sourceFile: drawing.sourceFileId,
        totalConnectors: drawing.connectors?.length || 0,
        totalPins: pins.length,
        totalTrainLines: trainLines.length,
      },
      pins: formattedPins,
      trainLines: formattedTrainLines,
      connectors: drawing.connectors?.map(c => ({
        id: c.id,
        code: c.connectorCode,
        pinCount: c.pins?.length || c.pinCount || 0,
        description: c.description,
        carType: c.carType,
      })) || [],
    });
  } catch (error) {
    console.error('Error fetching drawing:', error);
    return NextResponse.json({ error: 'Failed to fetch drawing', details: String(error) }, { status: 500 });
  }
}