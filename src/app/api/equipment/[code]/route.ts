import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const equipment_code = searchParams.get('equipment_code');

  try {
    if (equipment_code) {
      const device = await prisma.deviceInstance.findFirst({
        where: {
          OR: [
            { tag: { equals: equipment_code, mode: 'insensitive' } },
            { name: { equals: equipment_code, mode: 'insensitive' } },
          ],
        },
        include: { system: true, type: true, connectors: { include: { pins: { orderBy: { normPinNo: 'asc' } } } } },
      });
      if (!device) return NextResponse.json({ equipment: null, message: 'Not found' }, { status: 404 });
      return NextResponse.json({
        equipment: {
          id: device.id,
          code: device.tag || device.name,
          name: device.name,
          system_code: device.system?.code || '',
          car_code: device.carType || '',
          description: device.remarks || '',
          remarks: device.remarks || '',
          location: device.location || '',
          connectors: device.connectors.map(c => ({
            id: c.id,
            connector_code: c.connectorCode,
            connector_type: c.connectorType || '',
            pins: c.pins.map(p => ({
              pin_no: p.pinNo,
              wire_no: p.wireNo,
              wire_type: p.wireType || '',
              endpoint_label: p.endpointLabel || '',
              endpoint_pin: p.endpointPin || '',
              endpoint_dir: p.endpointDir || '',
            })),
          })),
        },
      });
    }
    return NextResponse.json({ error: 'equipment_code required' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}