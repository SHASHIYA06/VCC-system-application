import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const drawingNo = searchParams.get('drawing_no');
    const sourceFile = searchParams.get('source_file');

    if (!drawingNo) {
      return NextResponse.json({ error: 'Missing drawing_no' }, { status: 400 });
    }

    // Resolve source_file UUID to filename if needed
    let requestedFileName: string | null = null;
    if (sourceFile && sourceFile.length > 20) {
      try {
        const sf = await prisma.sourceFile.findUnique({ where: { id: sourceFile } });
        if (sf) requestedFileName = sf.filename;
      } catch {}
    } else if (sourceFile) {
      requestedFileName = sourceFile;
    }

    const drawing = await prisma.drawing.findFirst({
      where: { drawingNo },
      include: { pageMappings: { orderBy: { pdfPageNo: 'asc' } } },
    });

    if (!drawing) {
      return NextResponse.json({ error: 'Drawing not found' }, { status: 404 });
    }

    const mappings = drawing.pageMappings || [];
    if (mappings.length === 0) {
      return NextResponse.json({ pdfPageNo: 1, drawingNo, sourceFile: null, verified: false, confidence: 0, note: 'No page mapping found' });
    }

    let matched = mappings[0];

    if (requestedFileName) {
      // Match by resolved filename
      const byName = mappings.find(m => m.sourceFileName === requestedFileName);
      if (byName) matched = byName;
    }

    // Among all mappings, prefer: verified > VCC_OCR > commented PDF > VCC DESCRIPTION
    const priority = (m: typeof matched) => {
      let score = 0;
      if (m.verified) score += 100;
      if (m.sourceFileName?.includes('VCC Drawings_OCR')) score += 50;
      else if (m.sourceFileName?.includes('VCC_commented')) score += 40;
      else if (m.sourceFileName?.includes('PIN DRAWINGS')) score += 30;
      else if (m.sourceFileName?.includes('MC_UF') || m.sourceFileName?.includes('DMC') || m.sourceFileName?.includes('TC_') || m.sourceFileName?.includes('MC_CEILING')) score += 30;
      else if (m.sourceFileName?.includes('VCC DESCRIPTION')) score += 10;
      score += (m.confidence || 0) * 10;
      return score;
    };

    // Find the best mapping among same-source-file mappings, then overall
    const sameFileMappings = requestedFileName
      ? mappings.filter(m => m.sourceFileName === requestedFileName)
      : mappings;

    const bestSameFile = sameFileMappings.reduce((best, m) => priority(m) > priority(best) ? m : best, sameFileMappings[0]);
    if (priority(bestSameFile) > priority(matched)) matched = bestSameFile;

    return NextResponse.json({
      pdfPageNo: matched.pdfPageNo,
      drawingNo: drawing.drawingNo,
      sourceFile: matched.sourceFileName,
      verified: matched.verified,
      confidence: matched.confidence,
    });
  } catch (error: any) {
    console.error('PDF mapping error:', error);
    return NextResponse.json({ error: 'Failed to fetch PDF mapping', details: error.message }, { status: 500 });
  }
}
