import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * TCMS / pin-point listing.
 *
 * Without a filter this used to load every connector and all 70k+ pins, taking
 * 35s+. We now paginate connectors and cap pins so the endpoint stays fast,
 * while still supporting filtering by connector code or drawing.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const connectorCode = searchParams.get('connector_code');
  const drawingNo = searchParams.get('drawing_no');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const where: Record<string, unknown> = {};

    if (connectorCode) {
      where.connectorCode = { contains: connectorCode, mode: 'insensitive' };
    }

    if (drawingNo) {
      where.drawingId = drawingNo;
    }

    const [connectors, totalConnectors] = await Promise.all([
      prisma.connector.findMany({
        where,
        include: {
          connectorType: true,
          pins: { orderBy: { pinNo: 'asc' } },
        },
        orderBy: { connectorCode: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.connector.count({ where }),
    ]);

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

    return NextResponse.json({
      points,
      count: points.length,
      connectors,
      pagination: {
        total: totalConnectors,
        limit,
        offset,
        hasMore: offset + limit < totalConnectors,
      },
    });
  } catch (error) {
    console.error('Error fetching TCMS points:', error);
    return NextResponse.json({ error: 'Failed to fetch TCMS points' }, { status: 500 });
  }
}
