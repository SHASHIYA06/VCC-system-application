import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const connectorCode = searchParams.get('connector_code');
  const carType = searchParams.get('car_type');
  const systemCode = searchParams.get('system_code');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '200');

  try {
    const where: any = {};

    if (connectorCode) {
      where.connector = { connectorCode: { contains: connectorCode, mode: Prisma.QueryMode.insensitive } };
    }

    if (carType) {
      where.connector = { ...where.connector, carType: { contains: carType, mode: Prisma.QueryMode.insensitive } };
    }

    if (search) {
      where.OR = [
        { signalName: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { pinNo: { contains: search } },
        { wireNo: { contains: search } },
      ];
    }

    const [pins, connectors, cars, systems] = await Promise.all([
      prisma.connectorPin.findMany({
        where,
        include: { 
          connector: { 
            include: { 
              drawing: { 
                include: { system: true } 
              } 
            } 
          } 
        },
        orderBy: { pinNo: 'asc' },
        take: limit,
      }),
      prisma.connector.findMany({ select: { connectorCode: true, carType: true }, distinct: ['connectorCode'] }),
      prisma.device.findMany({ select: { carType: true }, distinct: ['carType'] }),
      prisma.system.findMany({ select: { code: true }, distinct: ['code'] }),
    ]);

    const formattedPins = pins.map(pin => ({
      id: pin.id,
      connector_code: pin.connector?.connectorCode || 'N/A',
      equipment_code: pin.connector?.drawing?.system?.code || 'N/A',
      car_code: pin.connector?.carType || 'N/A',
      system_code: pin.connector?.drawing?.system?.code || 'N/A',
      pin_no: pin.pinNo,
      signal_name: pin.signalName || '-',
      wire: pin.wireNo || '-',
      description: `${pin.connector?.connectorCode || ''} - Pin ${pin.pinNo}`,
      voltageText: pin.voltageText,
      terminalFrom: pin.terminalFrom,
      terminalTo: pin.terminalTo,
      sourceSheetRef: pin.sourceSheetRef,
      note: pin.note,
      conductorClassCode: pin.conductorClassCode,
    }));

    return NextResponse.json({
      pins: formattedPins,
      connectors: connectors.map(c => c.connectorCode),
      cars: cars.map(c => c.carType).filter(Boolean),
      systems: systems.map(s => s.code),
      total: formattedPins.length,
    });
  } catch (error) {
    console.error('Error fetching pins:', error);
    return NextResponse.json({ error: 'Failed to fetch pins', details: String(error) }, { status: 500 });
  }
}
