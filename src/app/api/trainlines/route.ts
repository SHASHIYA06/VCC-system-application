import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lineGroup = searchParams.get('line_group');
  const carType = searchParams.get('car_type');
  const drawingNo = searchParams.get('drawing_no');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '100');

  try {
    const where: Record<string, unknown> = {};

    if (lineGroup) where.lineGroup = lineGroup;
    if (carType) where.carType = carType;
    if (drawingNo) where.drawingId = { contains: drawingNo };
    if (search) {
      where.OR = [
        { itemName: { contains: search, mode: 'insensitive' } },
        { wireNo: { contains: search, mode: 'insensitive' } },
        { note: { contains: search, mode: 'insensitive' } },
      ];
    }

    const trainlines = await prisma.trainLine.findMany({
      where,
      include: {
        drawing: { include: { system: true } },
      },
      take: limit,
      orderBy: { wireNo: 'asc' },
    });

    return NextResponse.json({ trainlines, count: trainlines.length });
  } catch (error) {
    console.error('Error fetching trainlines:', error);
    return NextResponse.json({ error: 'Failed to fetch trainlines' }, { status: 500 });
  }
}