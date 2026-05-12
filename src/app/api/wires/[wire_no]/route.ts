import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wire_no: string }> }
) {
  const { wire_no } = await params;

  try {
    const wire = await prisma.wire.findUnique({
      where: { wireNo: wire_no },
      include: {
        endpoints: {
          include: {
            device: { include: { system: true, connectors: true } },
            connector: { include: { device: true } },
            pin: true,
          },
        },
      },
    });

    if (!wire) {
      return NextResponse.json({ error: 'Wire not found' }, { status: 404 });
    }

    const connections = wire.endpoints.map(ep => ({
      role: ep.endpointRole,
      device: ep.device ? { code: ep.device.tag || ep.device.name, name: ep.device.name, car: ep.device.carType } : null,
      connector: ep.connector ? { code: ep.connector.connectorCode, type: ep.connector.connectorType } : null,
      pin: ep.pin ? { number: ep.pin.pinNo, name: ep.pin.signalName || ep.pin.endpointLabel } : null,
      label: ep.endpointLabel,
    }));

    return NextResponse.json({
      wire,
      connections,
      connectionCount: connections.length,
    });
  } catch (error) {
    console.error('Error fetching wire:', error);
    return NextResponse.json({ error: 'Failed to fetch wire' }, { status: 500 });
  }
}