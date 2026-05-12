import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const device_id = searchParams.get('device_id');
  const connector_code = searchParams.get('connector_code');

  try {
    const where: Record<string, unknown> = {};
    if (device_id) where.deviceId = device_id;
    if (connector_code) where.OR = [
      { connectorCode: { contains: connector_code, mode: 'insensitive' } },
      { normCode: connector_code.toUpperCase().replace(/[^A-Z0-9]/g, '') },
    ];

    const connectors = await prisma.connector.findMany({
      where,
      include: {
        device: { include: { system: true } },
        pins: { orderBy: { normPinNo: 'asc' } },
      },
      orderBy: { connectorCode: 'asc' },
    });
    return NextResponse.json({ connectors, count: connectors.length });
  } catch {
    return NextResponse.json({ connectors: [], count: 0 });
  }
}