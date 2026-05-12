import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'System code required' }, { status: 400 });
  }

  try {
    const system = await prisma.system.findFirst({
      where: {
        OR: [
          { code: { equals: code, mode: 'insensitive' } },
          { name: { equals: code, mode: 'insensitive' } },
        ],
      },
      include: {
        devices: {
          include: { type: true, connectors: { include: { pins: true } } },
        },
      },
    });

    if (!system) return NextResponse.json({ error: 'System not found' }, { status: 404 });

    const drawings = await prisma.drawingDocument.findMany({
      where: { subsystem: { equals: code, mode: 'insensitive' } },
    });

    return NextResponse.json({
      system: {
        id: system.id,
        code: system.code || system.name,
        name: system.name,
        description: system.description || '',
        device_count: system.devices.length,
        devices: system.devices.map(d => ({
          id: d.id,
          name: d.name,
          tag: d.tag || '',
          car_type: d.carType || '',
          connector_count: d.connectors.length,
          connectors: d.connectors.map(c => ({
            connector_code: c.connectorCode,
            connector_type: c.connectorType || '',
            pin_count: c.pins.length,
          })),
        })),
      },
      drawings,
      count: { devices: system.devices.length, drawings: drawings.length },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}