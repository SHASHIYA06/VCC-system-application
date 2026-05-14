import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const systemCode = searchParams.get('system');
  const carType = searchParams.get('carType');

  try {
    const where: Record<string, unknown> = {};
    if (systemCode) where.systemId = systemCode;

    const drawings = await prisma.drawing.findMany({
      where,
      include: {
        system: true,
        pages: { orderBy: { pageNo: 'asc' } },
        _count: { select: { devices: true, connectors: true } },
      },
      orderBy: { drawingNo: 'asc' },
    });

    return NextResponse.json({
      documents: drawings,
      count: drawings.length,
      stats: {
        totalDrawings: drawings.length,
        totalPages: drawings.reduce((acc, d) => acc + d.pages.length, 0),
        totalDevices: drawings.reduce((acc, d) => acc + d._count.devices, 0),
      },
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}