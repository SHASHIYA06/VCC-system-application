import { NextRequest, NextResponse } from 'next/server';
import { extractPdfPage, getPdfPageInfo } from '@/lib/pdf/pdf-extraction';
import * as fs from 'fs/promises';
import * as path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sourceFile = searchParams.get('source_file');
    const pageNo = searchParams.get('page_no');
    const action = searchParams.get('action') || 'extract';

    if (!sourceFile) {
      return NextResponse.json({ error: 'source_file parameter is required' }, { status: 400 });
    }

    // Construct the full path to the PDF file
    // Assuming PDFs are stored in a DOCUMENTS folder at the project root
    const documentsDir = path.join(process.cwd(), 'DOCUMENTS');
    const sourcePath = path.join(documentsDir, sourceFile);

    // Check if file exists
    try {
      await fs.access(sourcePath);
    } catch {
      return NextResponse.json({ error: 'PDF file not found', path: sourceFile }, { status: 404 });
    }

    // If action is 'info', return page information
    if (action === 'info') {
      const pageInfo = await getPdfPageInfo(sourcePath);
      return NextResponse.json({
        sourceFile,
        totalPages: pageInfo.length,
        pages: pageInfo,
      });
    }

    // Extract specific page
    if (!pageNo) {
      return NextResponse.json({ error: 'page_no parameter is required for extraction' }, { status: 400 });
    }

    const pageNumber = parseInt(pageNo, 10);
    if (isNaN(pageNumber) || pageNumber < 1) {
      return NextResponse.json({ error: 'Invalid page number' }, { status: 400 });
    }

    // Extract the page
    const outputPath = await extractPdfPage({
      sourcePath,
      pageNumber,
      outputFileName: `${path.basename(sourceFile, '.pdf')}-page-${pageNumber}.pdf`,
    });

    // Read the extracted PDF
    const pdfBuffer = await fs.readFile(outputPath);

    // Return the PDF as a response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="page-${pageNumber}.pdf"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error in PDF extraction API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to extract PDF page', details: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceFile, pageNumbers } = body;

    if (!sourceFile || !Array.isArray(pageNumbers)) {
      return NextResponse.json({ error: 'sourceFile and pageNumbers array are required' }, { status: 400 });
    }

    const documentsDir = path.join(process.cwd(), 'DOCUMENTS');
    const sourcePath = path.join(documentsDir, sourceFile);

    // Check if file exists
    try {
      await fs.access(sourcePath);
    } catch {
      return NextResponse.json({ error: 'PDF file not found' }, { status: 404 });
    }

    // Extract multiple pages
    const results = [];
    for (const pageNo of pageNumbers) {
      const outputPath = await extractPdfPage({
        sourcePath,
        pageNumber: pageNo,
      });
      results.push({
        pageNumber: pageNo,
        path: outputPath,
      });
    }

    return NextResponse.json({
      success: true,
      sourceFile,
      extractedPages: results,
    });
  } catch (error) {
    console.error('Error in PDF batch extraction:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to extract PDF pages', details: errorMessage }, { status: 500 });
  }
}
