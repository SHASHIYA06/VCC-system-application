import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const drawingNo = searchParams.get('drawing_no');
    const sourceFile = searchParams.get('source_file');

    if (!drawingNo || !sourceFile) {
      return NextResponse.json({ error: 'Missing drawing_no or source_file' }, { status: 400 });
    }

    // Find the drawing and its page mapping
    const drawing = await prisma.drawing.findFirst({
      where: {
        drawingNo: drawingNo
      },
      include: {
        pageMappings: {
          where: {
            sourceFileName: sourceFile
          }
        }
      }
    });

    if (!drawing) {
      return NextResponse.json({ error: 'Drawing not found' }, { status: 404 });
    }

    // Get the PDF page number from page mappings
    if (drawing.pageMappings && drawing.pageMappings.length > 0) {
      const pageMapping = drawing.pageMappings[0];
      return NextResponse.json({
        pdfPageNo: pageMapping.pdfPageNo,
        drawingNo: drawing.drawingNo,
        sourceFile: sourceFile,
        verified: pageMapping.verified,
        confidence: pageMapping.confidence
      });
    }

    // If no exact mapping, return default page 1
    return NextResponse.json({
      pdfPageNo: 1,
      drawingNo: drawing.drawingNo,
      sourceFile: sourceFile,
      verified: false,
      confidence: 0,
      note: 'No page mapping found, defaulting to page 1'
    });

  } catch (error: any) {
    console.error('PDF mapping error:', error);
    return NextResponse.json({
      error: 'Failed to fetch PDF mapping',
      details: error.message
    }, { status: 500 });
  }
}
