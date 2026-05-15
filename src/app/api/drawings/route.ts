import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const systemCode = searchParams.get('system_code');
  const drawingNo = searchParams.get('drawing_no');

  try {
    const where: Record<string, unknown> = {};
    
    if (systemCode) {
      where.system = { code: systemCode };
    }
    
    if (drawingNo) {
      where.drawingNo = { contains: drawingNo, mode: Prisma.QueryMode.insensitive };
    }

    const docs = await prisma.drawing.findMany({
      where,
      include: { 
        system: true,
        _count: { select: { connectors: true, trainLines: true } }
      },
      orderBy: { drawingNo: 'asc' },
      take: 500,
    });

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
      count: docs.length 
    });
  } catch (error) {
    console.error('Error fetching drawings:', error);
    return NextResponse.json({ drawings: [], count: 0, error: String(error) });
  }
}