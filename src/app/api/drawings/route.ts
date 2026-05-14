import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const systemCode = searchParams.get('system_code');
  const drawingNo = searchParams.get('drawing_no');

  try {
    const where: Record<string, unknown> = {};
    if (systemCode) where.systemId = systemCode;
    if (drawingNo) where.drawingNo = { contains: drawingNo, mode: 'insensitive' as const };

    const docs = await prisma.drawing.findMany({
      where,
      include: { pages: { orderBy: { pageNo: 'asc' } } },
      orderBy: { drawingNo: 'asc' },
    });
    return NextResponse.json({ drawings: docs, count: docs.length });
  } catch {
    return NextResponse.json({ drawings: [], count: 0 });
  }
}