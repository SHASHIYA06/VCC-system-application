import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const connectorCode = searchParams.get('connector_code');
  const drawingNo = searchParams.get('drawing_no');

  try {
    const where: Record<string, unknown> = {};

    if (connectorCode) {
      where.connectorCode = { contains: connectorCode };
    }

    if (drawingNo) {
      where.drawingId = drawingNo;
    }

    const connectors = await prisma.connector.findMany({
      where,
      include: {
        connectorType: true,
        pins: { orderBy: { pinNo: 'asc' } },
      },
      orderBy: { connectorCode: 'asc' },
    });

    const points = connectors.flatMap(c =>
      c.pins.map(p => ({
        id: p.id,
        pointCode: p.pinNo,
        signalName: p.signalName || '',
        connectorCode: c.connectorCode,
        wireNo: p.wireNo,
        conductorClass: p.conductorClassCode || '',
        pinLabel: p.pinLabel || '',
        note: p.note || '',
      }))
    );

    return NextResponse.json({ points, count: points.length, connectors });
  } catch (error) {
    console.error('Error fetching TCMS points:', error);
    return NextResponse.json({ error: 'Failed to fetch TCMS points' }, { status: 500 });
  }
}