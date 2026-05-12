import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || searchParams.get('q');
  const carType = searchParams.get('car');
  const voltageClass = searchParams.get('voltage');
  const wireType = searchParams.get('type');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 500);
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const where: any = {};

    if (search) {
      where.OR = [
        { wireNo: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { wireType: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { wireColor: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ];
    }

    if (voltageClass) {
      where.voltageClass = voltageClass;
    }

    if (wireType) {
      where.wireType = wireType;
    }

    const [wires, total, voltageStats, typeStats] = await Promise.all([
      prisma.wire.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { wireNo: 'asc' },
        include: {
          endpoints: {
            include: {
              device: { include: { system: true } },
              connector: true,
              pin: true,
            },
          },
        },
      }),
      prisma.wire.count({ where }),
      prisma.wire.groupBy({
        by: ['voltageClass'],
        _count: true,
      }),
      prisma.wire.groupBy({
        by: ['wireType'],
        _count: true,
      }),
    ]);

    return NextResponse.json({
      wires,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      filters: {
        voltageClasses: voltageStats.map(v => ({ value: v.voltageClass, count: v._count })),
        wireTypes: typeStats.map(t => ({ value: t.wireType, count: t._count })),
      },
    });
  } catch (error) {
    console.error('Error fetching wires:', error);
    return NextResponse.json({ error: 'Failed to fetch wires' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wireNo, wireType, wireColor, voltageClass, cableSpec, shielded, remarks } = body;

    if (!wireNo) {
      return NextResponse.json({ error: 'Wire number is required' }, { status: 400 });
    }

    const wire = await prisma.wire.upsert({
      where: { wireNo },
      update: { wireType, wireColor, voltageClass, cableSpec, shielded, remarks },
      create: { wireNo, wireType, wireColor, voltageClass, cableSpec, shielded, remarks },
    });

    return NextResponse.json({ wire }, { status: wireNo ? 200 : 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create/update wire' }, { status: 500 });
  }
}