import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const carType = searchParams.get('car');
  const systemCode = searchParams.get('system');
  const search = searchParams.get('search') || searchParams.get('q');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 500);
  const includeConnectors = searchParams.get('connectors') === 'true';

  try {
    const where: any = {};

    if (carType) where.carType = carType;
    if (systemCode) where.system = { code: systemCode };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { tag: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ];
    }

    const devices = await prisma.deviceInstance.findMany({
      where,
      include: {
        system: true,
        type: true,
        ...(includeConnectors && {
          connectors: {
            include: { pins: true },
          },
        }),
      },
      take: limit,
      orderBy: { name: 'asc' },
    });

    const equipment = devices.map(d => ({
      id: d.id,
      code: d.tag || d.name,
      name: d.name,
      system: d.system ? { code: d.system.code, name: d.system.name } : null,
      type: d.type?.name || null,
      carType: d.carType || '',
      location: d.location || '',
      description: d.remarks || '',
      connectorCount: includeConnectors ? d.connectors?.length || 0 : undefined,
    }));

    return NextResponse.json({
      equipment,
      count: equipment.length,
      filters: {
        carTypes: [...new Set(devices.map(d => d.carType).filter(Boolean))],
        systems: [...new Set(devices.map(d => d.system?.code).filter(Boolean))],
      },
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, carType, systemCode, location, remarks, typeName } = body;

    if (!name) {
      return NextResponse.json({ error: 'Equipment name is required' }, { status: 400 });
    }

    const system = systemCode ? await prisma.system.findFirst({ where: { code: systemCode } }) : null;
    const deviceType = typeName ? await prisma.deviceType.findUnique({ where: { name: typeName } }) : null;

    const device = await prisma.deviceInstance.create({
      data: {
        tag: code,
        name,
        carType,
        location,
        remarks,
        systemId: system?.id,
        typeId: deviceType?.id,
      },
      include: { system: true, type: true },
    });

    return NextResponse.json({ equipment: device }, { status: 201 });
  } catch (error) {
    console.error('Error creating equipment:', error);
    return NextResponse.json({ error: 'Failed to create equipment' }, { status: 500 });
  }
}