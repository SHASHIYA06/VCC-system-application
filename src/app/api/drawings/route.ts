import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { createApiResponse } from '@/lib/schemas';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const getParam = (key: string) => {
    const val = searchParams.get(key);
    return val === null ? undefined : val;
  };

  let system_code = getParam('system_code');
  let drawing_no = getParam('drawing_no');
  let page = 1;
  let limit = 100;

  try {
    if (searchParams.get('page')) page = parseInt(searchParams.get('page')!) || 1;
    if (searchParams.get('limit')) limit = Math.min(parseInt(searchParams.get('limit')!) || 100, 500);
  } catch (e) {
    page = 1;
    limit = 100;
  }
  
  const skip = (page - 1) * limit;

  try {
    const where: Record<string, unknown> = {};
    
    if (system_code) {
      where.system = { code: system_code };
    }
    
    if (drawing_no) {
      where.drawingNo = { contains: drawing_no, mode: Prisma.QueryMode.insensitive };
    }

    const [docs, total] = await Promise.all([
      prisma.drawing.findMany({
        where,
        include: { 
          system: true,
          _count: { select: { connectors: true, trainLines: true } }
        },
        orderBy: { drawingNo: 'asc' },
        skip,
        take: limit,
      }),
      prisma.drawing.count({ where }),
    ]);

    return NextResponse.json(createApiResponse(
      docs.map(d => ({
        id: d.id,
        drawingNo: d.drawingNo,
        title: d.title,
        revision: d.revision,
        totalSheets: d.totalSheets,
        system: d.system ? { code: d.system.code, name: d.system.name } : null,
        remarks: d.remarks,
        connectorCount: d._count.connectors,
        trainlineCount: d._count.trainLines,
      })),
      { total, page, limit }
    ));
  } catch (error) {
    console.error('Error fetching drawings:', error);
    return NextResponse.json(
      { error: { message: 'Failed to fetch drawings', code: 'DB_ERROR' } },
      { status: 500 }
    );
  }
}