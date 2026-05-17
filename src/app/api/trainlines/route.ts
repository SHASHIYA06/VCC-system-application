import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lineGroup = searchParams.get('line_group');
  const carType = searchParams.get('car_type');
  const drawingNo = searchParams.get('drawing_no');
  const search = searchParams.get('search');
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const where: Record<string, unknown> = {};

    if (lineGroup) where.lineGroup = lineGroup;
    if (carType) where.carType = carType;
    if (drawingNo) {
      const drawings = await prisma.drawing.findMany({
        where: { drawingNo: { contains: drawingNo, mode: Prisma.QueryMode.insensitive } },
        select: { id: true }
      });
      where.drawingId = { in: drawings.map(d => d.id) };
    }
    if (search) {
      where.OR = [
        { itemName: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { wireNo: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { note: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ];
    }

    const [trainlines, total] = await Promise.all([
      prisma.trainLine.findMany({
        where,
        include: {
          drawing: { include: { system: true } },
        },
        take: limit,
        skip: offset,
        orderBy: { wireNo: 'asc' },
      }),
      prisma.trainLine.count({ where }),
    ]);

    return NextResponse.json({
      data: trainlines,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching trainlines:', error);
    return NextResponse.json({ error: 'Failed to fetch trainlines' }, { status: 500 });
  }
}