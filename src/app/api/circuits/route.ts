import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const getParam = (key: string) => {
    const val = searchParams.get(key);
    return val === null ? undefined : val;
  };

  const query = getParam('query');
  const circuitCode = getParam('circuit_code');
  const carScope = getParam('car_type');
  const page = Math.max(1, parseInt(getParam('page') || '1'));
  const limit = Math.min(parseInt(getParam('limit') || '50') || 50, 200);
  const skip = (page - 1) * limit;

  try {
    const where: Record<string, unknown> = {};
    
    if (query) {
      where.OR = [
        { circuitCode: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { circuitName: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { note: { contains: query, mode: Prisma.QueryMode.insensitive } },
      ];
    }
    
    if (circuitCode) {
      where.circuitCode = { contains: circuitCode, mode: Prisma.QueryMode.insensitive };
    }
    
    if (carScope) {
      where.carScope = carScope;
    }

    const [circuits, total] = await Promise.all([
      prisma.circuit.findMany({
        where,
        include: { 
          drawing: { select: { id: true, drawingNo: true, title: true } },
          endpoints: true,
        },
        orderBy: { circuitCode: 'asc' },
        skip,
        take: limit,
      }),
      prisma.circuit.count({ where }),
    ]);

    return NextResponse.json({
      circuits: circuits.map(c => ({
        id: c.id,
        circuitCode: c.circuitCode,
        circuitName: c.circuitName,
        category: c.category,
        voltageText: c.voltageText,
        carScope: c.carScope,
        note: c.note,
        drawingNo: c.drawing?.drawingNo,
        drawingTitle: c.drawing?.title,
        endpointCount: c.endpoints?.length || 0,
      })),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching circuits:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch circuits', code: 'DB_ERROR' } },
      { status: 500 }
    );
  }
}