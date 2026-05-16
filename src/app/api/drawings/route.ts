import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { drawingFiltersSchema, createApiResponse, createErrorResponse } from '@/lib/schemas';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const getParam = (key: string) => {
    const val = searchParams.get(key);
    return val === null ? undefined : val;
  };

  const validationResult = drawingFiltersSchema.safeParse({
    system_code: getParam('system_code'),
    drawing_no: getParam('drawing_no'),
    page: getParam('page'),
    limit: getParam('limit'),
  });

  if (!validationResult.success) {
    return NextResponse.json(
      createErrorResponse('Invalid query parameters', 'VALIDATION_ERROR'),
      { status: 400 }
    );
  }

  const { system_code, drawing_no, page = 1, limit = 20 } = validationResult.data;
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
      createErrorResponse('Failed to fetch drawings', 'DB_ERROR'),
      { status: 500 }
    );
  }
}