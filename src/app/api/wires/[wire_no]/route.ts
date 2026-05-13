import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { wire_no: string } }
) {
  try {
    const wireNo = params.wire_no;

    const wire = await prisma.wire.findUnique({
      where: { wireNo },
      include: {
        endpoints: {
          include: {
            device: true,
            connector: true,
            pin: true,
          },
        },
      },
    });

    if (!wire) {
      return NextResponse.json({ error: 'Wire not found' }, { status: 404 });
    }

    let trace = null;
    let relatedDrawings: any[] = [];

    if (wire.sourceEq && wire.destEq) {
      trace = {
        source: {
          type: 'equipment',
          code: wire.sourceEq,
          name: wire.sourceEq,
          pin: wire.sourcePin ? `${wire.sourceConnector}-${wire.sourcePin}` : undefined,
          description: `Source device`,
        },
        destination: {
          type: 'equipment',
          code: wire.destEq,
          name: wire.destEq,
          pin: wire.destPin ? `${wire.destConnector}-${wire.destPin}` : undefined,
          description: `Destination device`,
        },
        wires: [wireNo],
        colorCode: '#00BFFF',
        junctions: [],
      };
    }

    relatedDrawings = await prisma.drawingDocument.findMany({
      where: {
        OR: [
          { carType: { contains: 'ALL' } },
          { subsystem: { contains: 'TRL' } },
        ],
      },
      take: 5,
      orderBy: { drawingNo: 'asc' },
    });

    return NextResponse.json({
      wire: {
        id: wire.id,
        wireNo: wire.wireNo,
        signalName: wire.signalName,
        description: wire.description,
        wireColor: wire.wireColor,
        voltageClass: wire.voltageClass,
        cableSpec: wire.cableSpec,
        sourceEq: wire.sourceEq,
        sourceConnector: wire.sourceConnector,
        sourcePin: wire.sourcePin,
        destEq: wire.destEq,
        destConnector: wire.destConnector,
        destPin: wire.destPin,
      },
      trace,
      relatedDrawings,
    });
  } catch (error) {
    console.error('Error fetching wire:', error);
    return NextResponse.json({ error: 'Failed to fetch wire' }, { status: 500 });
  }
}