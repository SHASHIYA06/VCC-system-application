import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const carType = searchParams.get('car');
  const systemCode = searchParams.get('system');
  const search = searchParams.get('search') || searchParams.get('q');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 500);

  try {
    const where: Prisma.DeviceWhereInput = {};

    if (carType) where.carType = carType;
    if (systemCode) where.systemId = systemCode;
    if (search) {
      where.OR = [
        { deviceName: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { tagNo: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ];
    }

    const devices = await prisma.device.findMany({
      where,
      include: { 
        system: true,
        _count: {
          select: { connectors: true }
        }
      },
      take: limit,
      orderBy: { deviceName: 'asc' },
    });

    const equipment = devices.map(d => ({
      id: d.id,
      code: d.tagNo || d.deviceName,
      name: d.deviceName,
      system: d.system ? { code: d.system.code, name: d.system.name } : null,
      carType: d.carType || '',
      location: d.locationTag || '',
      description: d.note || '',
      connectorCount: d._count.connectors,
    }));

    return NextResponse.json({
      equipment,
      count: equipment.length,
      filters: {
        carTypes: [...new Set(devices.map(d => d.carType).filter(Boolean))] as string[],
        systems: [...new Set(devices.map(d => d.system?.code).filter(Boolean))] as string[],
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
    const { code, name, carType, systemCode, location, description, type } = body;

    if (!name) {
      return NextResponse.json({ error: 'Equipment name is required' }, { status: 400 });
    }

    const system = systemCode ? await prisma.system.findFirst({ where: { code: systemCode } }) : null;
    const project = await prisma.project.findFirst() || await prisma.project.create({ data: { projectCode: 'KMRCL_RS3R', projectName: 'KMRCL RS3R' } });
    const defaultDrawing = await prisma.drawing.findFirst({ where: { projectId: project.id } }) || await prisma.drawing.create({ data: { projectId: project.id, drawingNo: 'DUMMY', title: 'Default Drawing' } });

    const device = await prisma.device.create({
      data: {
        tagNo: code,
        deviceName: name,
        carType,
        locationTag: location,
        note: description,
        deviceType: type,
        systemId: system?.id,
        drawingId: defaultDrawing.id,
      },
      include: { system: true },
    });

    return NextResponse.json({ equipment: device }, { status: 201 });
  } catch (error) {
    console.error('Error creating equipment:', error);
    return NextResponse.json({ error: 'Failed to create equipment' }, { status: 500 });
  }
}