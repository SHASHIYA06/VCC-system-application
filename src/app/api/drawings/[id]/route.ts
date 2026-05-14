import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
          { drawingNo: id },
        ],
      },
      include: {
        pages: { orderBy: { pageNo: 'asc' } },
        system: true,
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
      take: 100,
    });

    const formattedPins = pins.map(pin => ({
      id: pin.id,
      pinNo: pin.pinNo,
      signalName: pin.signalName,
      wireNo: pin.wireNo,
      pinLabel: pin.pinLabel,
      connectorCode: pin.connector?.connectorCode || 'N/A',
      equipmentCode: pin.connector?.connectorCode || 'N/A',
    }));

    return NextResponse.json({
      drawing: {
        id: drawing.id,
        drawingNo: drawing.drawingNo,
        title: drawing.title,
        revision: drawing.revision,
        systemCode: drawing.systemId,
        systemName: drawing.system?.name,
        totalSheets: drawing.totalSheets,
        remarks: drawing.remarks,
        sourceFile: drawing.sourceFileId,
      },
      pins: formattedPins,
      pageCount: drawing.pages.length,
    });
  } catch (error) {
    console.error('Error fetching drawing:', error);
    return NextResponse.json({ error: 'Failed to fetch drawing' }, { status: 500 });
  }
}