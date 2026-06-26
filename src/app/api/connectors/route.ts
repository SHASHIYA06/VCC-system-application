import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Connectors API
 * Returns all electrical connectors with pin counts and metadata
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
        { connectorCode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (carType) {
      where.carType = carType;
    }

    if (systemCode) {
      where.drawing = { system: { code: systemCode } };
    }

    const [connectors, total] = await Promise.all([
      prisma.connector.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { connectorCode: 'asc' },
        include: {
          drawing: { include: { system: true } },
          _count: { select: { pins: true, wireEndpoints: true } },
        },
      }),
      prisma.connector.count({ where }),
    ]);

    // Get filter options
    const [cars, systems] = await Promise.all([
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
      connectors: connectors.map(c => ({
        id: c.id,
        connectorCode: c.connectorCode,
        description: c.description,
        carType: c.carType,
        pinCount: c._count.pins,
        wireEndpointCount: c._count.wireEndpoints,
        systemCode: c.drawing?.system?.code,
        drawingNo: c.drawing?.drawingNo,
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
    console.error('Error fetching connectors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connectors', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
