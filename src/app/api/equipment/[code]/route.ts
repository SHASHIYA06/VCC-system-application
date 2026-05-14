import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  
  try {
    const device = await prisma.device.findFirst({
      where: {
        OR: [
          { tagNo: code },
          { deviceName: { contains: code } },
        ],
      },
      include: { 
        system: true,
        drawing: true,
      },
    });

    if (!device) {
      return NextResponse.json({ equipment: null, message: 'Not found' }, { status: 404 });
    }

    const connectors = await prisma.connector.findMany({
      where: { drawingId: device.drawingId },
      include: { 
        pins: { orderBy: { pinNo: 'asc' } },
      },
    });

    return NextResponse.json({
      equipment: {
        id: device.id,
        code: device.tagNo || device.deviceName,
        name: device.deviceName,
        systemCode: device.system?.code || '',
        systemName: device.system?.name || '',
        carType: device.carType || '',
        description: device.note || '',
        remarks: device.note || '',
        location: device.locationTag || '',
        deviceType: device.deviceType || '',
        connectors: connectors.map(c => ({
          id: c.id,
          connectorCode: c.connectorCode,
          description: c.description || '',
          pinCount: c.pins.length,
          pins: c.pins.map(p => ({
            id: p.id,
            pinNo: p.pinNo,
            pinLabel: p.pinLabel,
            wireNo: p.wireNo,
            signalName: p.signalName || '',
            note: p.note || '',
          })),
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 });
  }
}