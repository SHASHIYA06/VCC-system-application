import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  normalizeOcrText, 
  extractDrawingNo, 
  extractSheetMeta,
  extractInlinePageNo,
  OcrValidationError 
} from '@/lib/ocr/validator';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const sourceId = searchParams.get('source_id');
  const pageNo = searchParams.get('page_no');

  try {
    if (action === 'sources') {
      const sources = await prisma.sourceFile.findMany({
        select: {
          id: true,
          filename: true,
          fileType: true,
          createdAt: true,
          _count: { select: { pages: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ sources });
    }

    if (action === 'pages' && sourceId) {
      const pages = await prisma.sourcePage.findMany({
        where: { sourceFileId: sourceId },
        orderBy: { pageNo: 'asc' },
        select: {
          id: true,
          pageNo: true,
          drawingNo: true,
          sheetNo: true,
          sheetCount: true,
          rawText: true,
        },
      });
      return NextResponse.json({ pages });
    }

    if (action === 'page' && sourceId && pageNo) {
      const page = await prisma.sourcePage.findFirst({
        where: { sourceFileId: sourceId, pageNo: parseInt(pageNo) },
      });
      if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });
      return NextResponse.json({ page });
    }

    if (action === 'search') {
      const query = searchParams.get('q') || '';
      const pages = await prisma.sourcePage.findMany({
        where: {
          OR: [
            { drawingNo: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { rawText: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
        },
        take: 20,
        orderBy: { pageNo: 'asc' },
      });
      return NextResponse.json({ results: pages });
    }

    return NextResponse.json({ message: 'Use ?action=sources|pages|page|search' });
  } catch (error) {
    console.error('OCR API error:', error);
    return NextResponse.json({ error: 'OCR operation failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sourceFilename, text, pages } = body;

    if (action === 'import_text' && text && sourceFilename) {
      const normalizedText = normalizeOcrText(text);
      const drawingNo = extractDrawingNo(normalizedText);
      const sheet = extractSheetMeta(normalizedText);
      const pageNo = extractInlinePageNo(normalizedText) || 1;

      const project = await prisma.project.findFirst();
      if (!project) return NextResponse.json({ error: 'No project found' }, { status: 400 });

      let sourceFile = await prisma.sourceFile.findFirst({
        where: { projectId: project.id, filename: sourceFilename },
      });

      if (!sourceFile) {
        sourceFile = await prisma.sourceFile.create({
          data: { projectId: project.id, filename: sourceFilename, fileType: 'OCR_TEXT' },
        });
      }

      const page = await prisma.sourcePage.create({
        data: {
          sourceFileId: sourceFile.id,
          pageNo,
          rawText: normalizedText,
          drawingNo: drawingNo || 'UNKNOWN',
          sheetNo: sheet?.sheetNo,
          sheetCount: sheet?.sheetCount,
        },
      });

      return NextResponse.json({ success: true, page });
    }

    if (action === 'import_pages' && pages && Array.isArray(pages)) {
      const project = await prisma.project.findFirst();
      if (!project) return NextResponse.json({ error: 'No project found' }, { status: 400 });

      let sourceFile = await prisma.sourceFile.findFirst({
        where: { projectId: project.id, filename: sourceFilename || 'bulk-import' },
      });

      if (!sourceFile) {
        sourceFile = await prisma.sourceFile.create({
          data: { projectId: project.id, filename: sourceFilename || 'bulk-import', fileType: 'OCR_BULK' },
        });
      }

      const imported = [];
      for (const p of pages) {
        const normalizedText = normalizeOcrText(p.text || '');
        const drawingNo = extractDrawingNo(normalizedText);
        const sheet = extractSheetMeta(normalizedText);

        const page = await prisma.sourcePage.create({
          data: {
            sourceFileId: sourceFile.id,
            pageNo: p.pageNo || 1,
            rawText: normalizedText,
            drawingNo: drawingNo || 'UNKNOWN',
            sheetNo: sheet?.sheetNo,
            sheetCount: sheet?.sheetCount,
          },
        });
        imported.push(page);
      }

      return NextResponse.json({ success: true, imported: imported.length, pages: imported });
    }

    if (action === 'validate_text' && text) {
      try {
        const normalized = normalizeOcrText(text);
        const drawingNo = extractDrawingNo(normalized);
        const sheet = extractSheetMeta(normalized);
        const pageNo = extractInlinePageNo(normalized);

        return NextResponse.json({
          valid: true,
          normalized,
          metadata: { drawingNo, sheet, pageNo, length: normalized.length },
        });
      } catch (err) {
        if (err instanceof OcrValidationError) {
          return NextResponse.json({ valid: false, errors: err.issues }, { status: 400 });
        }
        throw err;
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('OCR POST error:', error);
    return NextResponse.json({ error: 'OCR operation failed' }, { status: 500 });
  }
}