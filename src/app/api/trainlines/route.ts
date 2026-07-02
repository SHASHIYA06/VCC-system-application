import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Trainlines API
 * Returns all trainlines (cross-car wiring) with cross-references
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);
  const offset = parseInt(searchParams.get('offset') || '0');
  const search = searchParams.get('search') || '';
  const wireNo = searchParams.get('wire_no');
  const systemCode = searchParams.get('system_code');

  try {
    const where: any = {};

    if (search.trim()) {
      where.OR = [
        { wireNo: { contains: search, mode: 'insensitive' } },
        { itemName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (wireNo) {
      where.wireNo = wireNo;
    }

    if (systemCode) {
      where.drawing = { system: { code: systemCode } };
    }

    const [trainlines, total] = await Promise.all([
      prisma.trainLine.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { wireNo: 'asc' },
        include: {
          drawing: { include: { system: true } },
          conductorClass: true,
        },
      }),
      prisma.trainLine.count({ where }),
    ]);

    // Get filter options
    const systems = await prisma.system.findMany({
      select: { code: true, name: true },
      orderBy: { code: 'asc' },
    });

    return NextResponse.json({
      data: trainlines.map(tl => ({
        id: tl.id,
        wireNo: tl.wireNo,
        itemName: tl.itemName,
        conductorClass: tl.conductorClass?.description,
        carType: tl.carType,
        systemCode: tl.drawing?.system?.code,
        drawingNo: tl.drawing?.drawingNo,
        lineGroup: tl.lineGroup,
        voltageText: tl.conductorClass?.voltageDomain || null,
        note: tl.note,
      })),
      trainlines: trainlines.map(tl => ({
        id: tl.id,
        wireNo: tl.wireNo,
        itemName: tl.itemName,
        conductorClass: tl.conductorClass?.description,
        carType: tl.carType,
        systemCode: tl.drawing?.system?.code,
        drawingNo: tl.drawing?.drawingNo,
        lineGroup: tl.lineGroup,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      filters: {
        systems: systems.map(s => ({ code: s.code, name: s.name })),
      },
    });
  } catch (error) {
    console.error('Error fetching trainlines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trainlines', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
