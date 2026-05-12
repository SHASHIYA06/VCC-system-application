import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const signal_type = searchParams.get('signal_type');
  const device_id = searchParams.get('device_id');

  try {
    const where: Record<string, unknown> = {};
    if (device_id) where.connectorId = device_id;

    const connectors = await prisma.connector.findMany({
      where,
      include: {
        device: { include: { system: true } },
        pins: { orderBy: { normPinNo: 'asc' } },
      },
      orderBy: { connectorCode: 'asc' },
    });

    const points = connectors.flatMap(c =>
      c.pins.map(p => ({
        id: p.id,
        point_code: p.normPinNo || p.pinNo,
        signal_name: p.signalName || p.endpointLabel || '',
        signal_type: p.endpointDir || signal_type || 'DIGITAL',
        connector_code: c.connectorCode,
        wire_no: p.wireNo,
        device_name: c.device?.name || '',
        remarks: p.remarks || '',
      }))
    );
    return NextResponse.json({ points, count: points.length });
  } catch {
    return NextResponse.json({ points: [], count: 0 });
  }
}