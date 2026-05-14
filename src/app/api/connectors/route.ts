import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const drawingId = searchParams.get('drawing_id');
  const connectorCode = searchParams.get('connector_code');

  try {
    const where: Record<string, unknown> = {};
    if (drawingId) where.drawingId = drawingId;
    if (connectorCode) where.connectorCode = { contains: connectorCode };

    const connectors = await prisma.connector.findMany({
      where,
      include: {
        connectorType: true,
        pins: { orderBy: { pinNo: 'asc' } },
      },
      orderBy: { connectorCode: 'asc' },
    });
    return NextResponse.json({ connectors, count: connectors.length });
  } catch {
    return NextResponse.json({ connectors: [], count: 0 });
  }
}