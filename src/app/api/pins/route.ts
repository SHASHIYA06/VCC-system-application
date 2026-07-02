import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Connector Pins API
 * Returns all connector pins with filtering and pagination
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);
  const offset = parseInt(searchParams.get('offset') || '0');
  const search = searchParams.get('search') || '';
  const connectorCode = searchParams.get('connector_code');
  const carType = searchParams.get('car_type');
  const systemCode = searchParams.get('system_code');
  const wireNo = searchParams.get('wire_no');

  try {
    const where: any = {};

    if (search.trim()) {
      where.OR = [
        { pinNo: { contains: search, mode: 'insensitive' } },
        { signalName: { contains: search, mode: 'insensitive' } },
        { wireNo: { contains: search, mode: 'insensitive' } },
        { connector: { connectorCode: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (connectorCode) {
      where.connector = { connectorCode };
    }

    if (wireNo) {
      where.wireNo = wireNo;
    }

    if (carType || systemCode) {
      where.connector = {
        ...where.connector,
        ...(carType && { carType }),
        ...(systemCode && { drawing: { system: { code: systemCode } } }),
      };
    }

    const [pins, total] = await Promise.all([
      prisma.connectorPin.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { pinNo: 'asc' },
        include: {
          connector: {
            include: {
              drawing: { include: { system: true } },
            },
          },
        },
      }),
      prisma.connectorPin.count({ where }),
    ]);

    // Get distinct filter values
    const [connectors, cars, systems] = await Promise.all([
      prisma.connector.findMany({
        select: { connectorCode: true },
        distinct: ['connectorCode'],
        orderBy: { connectorCode: 'asc' },
        take: 100,
      }),
      prisma.connector.findMany({
        select: { carType: true },
        distinct: ['carType'],
        where: { carType: { not: null } },
        orderBy: { carType: 'asc' },
      }),
      prisma.system.findMany({
        select: { code: true, name: true },
        orderBy: { code: 'asc' },
      }),
    ]);

    return NextResponse.json({
      pins: pins.map(p => ({
        id: p.id,
        connector_code: p.connector?.connectorCode || '',
        equipment_code: '',
        car_code: p.connector?.carType || '',
        system_code: p.connector?.drawing?.system?.code || '',
        pin_no: p.pinNo,
        signal_name: p.signalName || '',
        wire: p.wireNo || '',
        description: p.note || p.signalName || '',
        conductorClassCode: p.conductorClassCode,
        voltageText: p.voltageText,
        terminalFrom: p.terminalFrom,
        terminalTo: p.terminalTo,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      connectors: connectors.map(c => c.connectorCode),
      cars: cars.map(c => c.carType),
      systems: systems.map(s => s.code),
    });
  } catch (error) {
    console.error('Error fetching pins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pins', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
