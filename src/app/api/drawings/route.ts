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

    const [docs, total, systemCount, systemFacets] = await Promise.all([
      prisma.drawing.findMany({
        where,
        include: { 
          system: true,
          _count: { select: { connectors: true, trainLines: true, devices: true, pages: true } }
        },
        orderBy: [{ drawingNo: 'asc' }, { revision: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.drawing.count({ where }),
      prisma.system.count(),
      // Facets are deliberately computed WITHOUT `where` applied. The client uses
      // them to populate the system filter, and deriving that list from the
      // filtered page instead collapsed the dropdown to the one system already
      // selected — leaving no way to switch systems without clearing the filter.
      prisma.system.findMany({
        select: {
          code: true,
          name: true,
          _count: { select: { drawings: true } },
        },
        orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
      }),
    ]);

    /**
     * A `PLACEHOLDER` title was auto-generated during import and never appeared in
     * any source document, so it must not be presented as the engineering title.
     * The row itself is real (these drawings do have pages and connectors), which
     * is why they stay visible — they are just labelled honestly.
     */
    const shape = (d: (typeof docs)[number]) => ({
      id: d.id,
      drawingNo: d.drawingNo,
      title: d.title,
      titleSource: d.titleSource,
      titleVerified: d.titleSource !== 'PLACEHOLDER',
      isReference: d.isReference,
      revision: d.revision,
      totalSheets: d.totalSheets,
      system: d.system ? { code: d.system.code, name: d.system.name } : null,
      remarks: d.remarks,
      connectorCount: d._count.connectors,
      trainlineCount: d._count.trainLines,
      deviceCount: d._count.devices,
      pageCount: d._count.pages,
    });

    const drawings = docs.map(shape);

    const groupedBySystem = drawings.reduce((acc, d) => {
      const sysCode = d.system?.code || 'GEN';
      (acc[sysCode] ??= []).push(d);
      return acc;
    }, {} as Record<string, typeof drawings>);

    return NextResponse.json({
      drawings,
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
        // Unfiltered list so the client's system filter always offers every
        // option, and can show which systems actually hold drawings.
        systems: systemFacets.map((s) => ({
          code: s.code,
          name: s.name,
          drawingCount: s._count.drawings,
        })),
        titleProvenance: {
          verified: drawings.filter((d) => d.titleVerified).length,
          placeholder: drawings.filter((d) => !d.titleVerified).length,
        },
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
