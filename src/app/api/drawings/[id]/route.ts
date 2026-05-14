import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    let drawing = await prisma.drawing.findFirst({
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

    const remarksParts = (drawing.remarks || '').split('|');
    const carType = remarksParts[0] || 'ALL';
    const subsystem = remarksParts[1] || drawing.system?.code || 'GEN';

    const drawingTypeMap: Record<string, string> = {
      GEN: 'DRAWING_LIST',
      TRL: 'SCHEMATIC',
      TRAC: 'SCHEMATIC',
      HV: 'SCHEMATIC',
      BRAKE: 'SCHEMATIC',
      DOOR: 'SCHEMATIC',
      TMS: 'PIN_ASSIGNMENT',
      COMMS: 'SCHEMATIC',
      APS: 'SCHEMATIC',
    };

    return NextResponse.json({
      drawing: {
        id: drawing.id,
        drawingNo: drawing.drawingNo,
        title: drawing.title,
        carType: carType,
        subsystem: subsystem,
        drawingType: drawingTypeMap[drawing.system?.code || 'GEN'] || 'SCHEMATIC',
        currentRevision: drawing.revision || 'A',
        pageCount: drawing.totalSheets,
        notes: drawing.remarks || '',
        systemCode: drawing.system?.code || 'GEN',
        systemName: drawing.system?.name || 'General',
        sourceFile: drawing.sourceFileId,
        totalConnectors: drawing.connectors?.length || 0,
        totalPins: pins.length,
      },
      pins: formattedPins,
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