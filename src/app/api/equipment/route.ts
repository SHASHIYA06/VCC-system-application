import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Equipment (Devices) API
 * Returns all electrical devices/equipment with connector counts
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);
  const offset = parseInt(searchParams.get('offset') || '0');
  const search = searchParams.get('search') || '';
  const carType = searchParams.get('car_type');
  const systemCode = searchParams.get('system_code');

  try {
    const where: any = {};

    if (search.trim()) {
      where.OR = [
        { deviceName: { contains: search, mode: 'insensitive' } },
        { tagNo: { contains: search, mode: 'insensitive' } },
        { deviceType: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (carType) {
      where.carType = carType;
    }

    if (systemCode) {
      where.systemId = systemCode;
    }

    const [equipment, total] = await Promise.all([
      prisma.device.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { deviceName: 'asc' },
        include: {
          system: true,
          _count: { select: { wireEndpoints: true } },
        },
      }),
      prisma.device.count({ where }),
    ]);

    // Get filter options
    const [cars, systems] = await Promise.all([
      prisma.device.findMany({
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
      equipment: equipment.map(e => ({
        id: e.id,
        deviceName: e.deviceName,
        tagNo: e.tagNo,
        deviceType: e.deviceType,
        carType: e.carType,
        systemCode: e.system?.code,
        wireCount: e._count.wireEndpoints,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      filters: {
        cars: cars.map(c => c.carType),
        systems: systems.map(s => ({ code: s.code, name: s.name })),
      },
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
