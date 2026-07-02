import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const getParam = (key: string) => {
    const val = searchParams.get(key);
    return val === null ? undefined : val;
  };

  const systemCode = getParam('system_code');
  const drawing_no = getParam('drawing_no');
  const wireNo = getParam('wire_no');
  const connectorCode = getParam('connector_code');
  const search = getParam('search');
  let page = 1;
  let limit = 100;

  try {
    if (searchParams.get('page')) page = Math.max(1, parseInt(searchParams.get('page')!) || 1);
    if (searchParams.get('limit')) limit = Math.min(parseInt(searchParams.get('limit')!) || 100, 1000);
  } catch (e) {
    page = 1;
    limit = 100;
  }

  const skip = (page - 1) * limit;

  try {
    const where: any = {};

    if (systemCode) {
      const system = await prisma.system.findFirst({ where: { code: systemCode } });
      if (system) {
        where.systemId = system.id;
      }
    }
    
    if (drawing_no) {
      where.drawingNo = { contains: drawing_no };
    }

    if (search) {
      where.OR = [
        { drawingNo: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    // NEW: Support wire-based filtering - returns ALL drawings containing this wire
    if (wireNo) {
      // Find drawings that have this wire in trainlines
      const trainlineDrawings = await prisma.trainLine.findMany({
        where: { wireNo: { contains: wireNo } },
        include: { drawing: true },
      });
      
      // Find drawings that have this wire in connector pins
      const pinDrawings = await prisma.connectorPin.findMany({
        where: { wireNo: { contains: wireNo } },
        include: { connector: { include: { drawing: true } } },
      });
      
      // Combine unique drawing IDs
      const drawingIds = [
        ...new Set([
          ...trainlineDrawings.map(tl => tl.drawingId),
          ...pinDrawings.map(p => p.connector?.drawingId).filter(Boolean),
        ]),
      ];
      
      where.id = { in: drawingIds };
    }

    const [docs, total, systemCount] = await Promise.all([
      prisma.drawing.findMany({
        where,
        include: { 
          system: true,
          _count: { select: { connectors: true, trainLines: true, devices: true, pages: true } }
        },
        orderBy: { drawingNo: 'asc' },
        skip,
        take: limit,
      }),
      prisma.drawing.count({ where }),
      prisma.system.count(),
    ]);

    const groupedBySystem = docs.reduce((acc, d) => {
      const sysCode = d.system?.code || 'GEN';
      if (!acc[sysCode]) acc[sysCode] = [];
      acc[sysCode].push({
        id: d.id,
        drawingNo: d.drawingNo,
        title: d.title,
        revision: d.revision,
        totalSheets: d.totalSheets,
        system: d.system ? { code: d.system.code, name: d.system.name } : null,
        remarks: d.remarks,
        connectorCount: d._count.connectors,
        trainlineCount: d._count.trainLines,
        deviceCount: d._count.devices,
        pageCount: d._count.pages,
        _count: d._count,
      });
      return acc;
    }, {} as Record<string, unknown[]>);

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
        deviceCount: d._count.devices,
      })),
      groupedBySystem,
      pagination: { 
        total, 
        page, 
        limit, 
        totalPages: Math.ceil(total / limit),
        hasMore: skip + docs.length < total,
        hasPrev: page > 1,
        hasNext: skip + docs.length < total,
      },
      meta: {
        totalDrawings: total,
        totalSystems: systemCount,
        currentSystem: systemCode || null,
        wireFilter: wireNo || null,
      }
    });
  } catch (error) {
    console.error('Error fetching drawings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drawings', details: String(error) },
      { status: 500 }
    );
  }
}
