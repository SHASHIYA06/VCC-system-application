import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * Full-text OCR search across indexed PDF pages.
 * Uses OcrPage.rawText for searching.
 * Returns: matching pages with drawing context, wire numbers found on page.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const type = searchParams.get('type') || 'all'; // wire | drawing | text | all
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const sourceFile = searchParams.get('file') || undefined;

  if (!q) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }

  try {
    const results: {
      pages: any[];
      wires: any[];
      drawings: any[];
      pins: any[];
      totalMatches: number;
    } = { pages: [], wires: [], drawings: [], pins: [], totalMatches: 0 };

    // ── 1. OCR page full-text search ──────────────────────────────────────
    if (type === 'all' || type === 'text') {
      const pageWhere: Prisma.OcrPageWhereInput = {
        rawText: { contains: q, mode: Prisma.QueryMode.insensitive },
      };
      if (sourceFile) pageWhere.sourceFileId = { contains: sourceFile };

      const pages = await prisma.ocrPage.findMany({
        where: pageWhere,
        orderBy: { pageNo: 'asc' },
        take: limit,
        select: {
          id: true,
          sourceFileId: true,
          pageNo: true,
          sourcePageLabel: true,
          parseStatus: true,
          extra: true,
        },
      });

      results.pages = pages.map(p => {
        const extra = (p.extra as any) || {};
        return {
          sourceFile: p.sourceFileId,
          pageNo: p.pageNo,
          label: p.sourcePageLabel,
          drawingNos: extra.drawingNos || [],
          wireCount: extra.wireCount || 0,
          pdfUrl: `/api/pdf/${encodeURIComponent(p.sourceFileId)}#page=${p.pageNo}`,
        };
      });
      results.totalMatches += pages.length;
    }

    // ── 2. Wire search with alphanumeric support ───────────────────────────
    if (type === 'all' || type === 'wire') {
      const numBase = q.replace(/[a-zA-Z]+$/, '').replace(/[\/\-]/g, '');
      const wireWhere: Prisma.WireWhereInput = {
        OR: [
          { wireNo: { contains: q, mode: Prisma.QueryMode.insensitive } },
          { wireAlias: { contains: q, mode: Prisma.QueryMode.insensitive } },
          { signalName: { contains: q, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: q, mode: Prisma.QueryMode.insensitive } },
          numBase.length >= 3 ? { wireNo: { startsWith: numBase } } : {},
        ].filter(c => Object.keys(c).length > 0),
      };

      const wires = await prisma.wire.findMany({
        where: wireWhere,
        orderBy: { wireNo: 'asc' },
        take: limit,
        include: {
          endpoints: {
            include: {
              connector: { select: { connectorCode: true, carType: true } },
            }
          }
        }
      });

      results.wires = wires;
      results.totalMatches += wires.length;
    }

    // ── 3. Drawing number search ───────────────────────────────────────────
    if (type === 'all' || type === 'drawing') {
      const drawBase = q.replace(/[A-D]$/, '');
      const drawings = await prisma.drawing.findMany({
        where: {
          OR: [
            { drawingNo: { contains: q } },
            { drawingNo: { startsWith: drawBase } },
            { title: { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        },
        orderBy: { drawingNo: 'asc' },
        take: limit,
        include: { system: { select: { code: true, name: true } } },
      });

      results.drawings = drawings.map(d => ({
        id: d.id,
        drawingNo: d.drawingNo,
        title: d.title,
        revision: d.revision,
        systemCode: d.system?.code,
        systemName: d.system?.name,
        sourceFile: d.sourceFileId,
        pdfUrl: d.drawingPdfUrl || (d.sourceFileId ? `/api/pdf/${encodeURIComponent(d.sourceFileId)}` : null),
        totalSheets: d.totalSheets,
      }));
      results.totalMatches += drawings.length;
    }

    // ── 4. Pin search ─────────────────────────────────────────────────────
    if (type === 'all' || type === 'pin') {
      const pins = await prisma.connectorPin.findMany({
        where: {
          OR: [
            { wireNo: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { signalName: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { pinNo: { contains: q } },
          ],
        },
        take: limit,
        include: {
          connector: {
            include: {
              drawing: { select: { drawingNo: true, title: true, sourceFileId: true } }
            }
          }
        },
        orderBy: { wireNo: 'asc' },
      });

      results.pins = pins.map(p => ({
        id: p.id,
        pinNo: p.pinNo,
        wireNo: p.wireNo,
        signalName: p.signalName,
        connectorCode: p.connector?.connectorCode,
        drawingNo: p.connector?.drawing?.drawingNo,
        drawingTitle: p.connector?.drawing?.title,
        pdfUrl: p.connector?.drawing?.sourceFileId 
          ? `/api/pdf/${encodeURIComponent(p.connector.drawing.sourceFileId)}`
          : null,
      }));
      results.totalMatches += pins.length;
    }

    return NextResponse.json({
      query: q,
      type,
      ...results,
      searchTip: results.totalMatches === 0
        ? `No results for "${q}". Try: shorter query, use drawing number (e.g. 58120), or wire base number (e.g. 3001).`
        : undefined,
    });

  } catch (error) {
    console.error('OCR search error:', error);
    return NextResponse.json({ error: 'Search failed', details: String(error) }, { status: 500 });
  }
}
