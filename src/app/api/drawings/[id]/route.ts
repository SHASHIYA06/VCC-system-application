import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    let drawing = await prisma.drawingDocument.findFirst({
      where: {
        OR: [
          { id: id },
          { drawingNo: id },
        ],
      },
      include: {
        pages: { orderBy: { pageNo: 'asc' } },
      },
    });

    if (!drawing) {
      return NextResponse.json({ error: 'Drawing not found' }, { status: 404 });
    }

    const deviceIds = await prisma.deviceInstance.findMany({
      where: { carType: drawing.carType === 'ALL' ? undefined : drawing.carType },
      select: { id: true },
    });

    const pins = await prisma.connectorPin.findMany({
      where: {
        connector: {
          deviceId: { in: deviceIds.map(d => d.id) },
        },
      },
      include: {
        connector: {
          include: {
            device: true,
          },
        },
      },
      take: 100,
    });

    const formattedPins = pins.map(pin => ({
      id: pin.id,
      pinNo: pin.pinNo,
      signalName: pin.signalName,
      wireNo: pin.wireNo,
      connectorCode: pin.connector?.connectorCode || 'N/A',
      equipmentCode: pin.connector?.device?.tag || pin.connector?.device?.name || 'N/A',
      endpointLabel: pin.endpointLabel,
    }));

    return NextResponse.json({
      drawing: {
        id: drawing.id,
        drawingNo: drawing.drawingNo,
        title: drawing.title,
        carType: drawing.carType,
        subsystem: drawing.subsystem,
        drawingType: drawing.drawingType,
        pageCount: drawing.pageCount,
        currentRevision: drawing.revision,
        notes: drawing.notes,
        systemCode: drawing.subsystem,
        sourceFile: drawing.sourceFile,
      },
      pins: formattedPins,
    });
  } catch (error) {
    console.error('Error fetching drawing:', error);
    return NextResponse.json({ error: 'Failed to fetch drawing' }, { status: 500 });
  }
}