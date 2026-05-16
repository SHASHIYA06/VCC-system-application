import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || searchParams.get('q');
  const voltageClass = searchParams.get('voltage');
  const wireType = searchParams.get('type');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 500);
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const where: any = {};

    if (search) {
      where.OR = [
        { wireNo: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { signalName: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ];
    }

    if (voltageClass) {
      where.voltageClass = voltageClass;
    }

    if (wireType) {
      where.conductorClassCode = wireType;
    }

    const [wires, total, voltageStats] = await Promise.all([
      prisma.wire.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { wireNo: 'asc' },
        include: {
          endpoints: {
            include: {
              device: true,
              connector: true,
            }
          }
        }
      }),
      prisma.wire.count({ where }),
      prisma.wire.groupBy({
        by: ['voltageClass'],
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
    const { wireNo, signalName, conductorClass, description, wireSize, wireColor, voltageClass, remarks } = body;

    if (!wireNo) {
      return NextResponse.json({ error: 'Wire number is required' }, { status: 400 });
    }

    const wire = await prisma.wire.upsert({
      where: { wireNo },
      update: { signalName, description, wireSize, wireColor, voltageClass, remarks, conductorClassCode: conductorClass },
      create: { 
        wireNo, 
        signalName, 
        description, 
        wireSize, 
        wireColor, 
        voltageClass, 
        remarks, 
        conductorClassCode: conductorClass,
      },
    });

    return NextResponse.json({ wire }, { status: 200 });
  } catch (error) {
    console.error('Error creating/updating wire:', error);
    return NextResponse.json({ error: 'Failed to create/update wire' }, { status: 500 });
  }
}