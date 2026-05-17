import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const where: any = {};
    
    if (system_code) {
      const system = await prisma.system.findFirst({ where: { code: system_code } });
      if (system) {
        where.systemId = system.id;
      }
    }
    
    if (drawing_no) {
      where.drawingNo = { contains: drawing_no };
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

    return NextResponse.json({
      drawings: docs.map(d => ({
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
      pagination: { total, page, limit, hasMore: skip + docs.length < total }
    });
  } catch (error) {
    console.error('Error fetching drawings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drawings', details: String(error) },
      { status: 500 }
    );
  }
}