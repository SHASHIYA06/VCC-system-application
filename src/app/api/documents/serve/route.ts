import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

/**
 * Serve PDF documents with proper routing
 * Maps drawing numbers to actual PDF files
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const drawingId = searchParams.get('drawing_id');
    const drawingNo = searchParams.get('drawing_no');
    const page = parseInt(searchParams.get('page') || '1');
    const format = searchParams.get('format') || 'pdf';
    
    if (!drawingId && !drawingNo) {
      return NextResponse.json(
        { error: 'drawing_id or drawing_no parameter is required' },
        { status: 400 }
      );
    }
    
    // Find the drawing
    let drawing;
    if (drawingId) {
      drawing = await prisma.drawing.findUnique({
        where: { id: drawingId },
        include: { pages: true },
      });
    } else if (drawingNo) {
      drawing = await prisma.drawing.findUnique({
        where: { drawingNo },
        include: { pages: true },
      });
    }
    
    if (!drawing) {
      return NextResponse.json(
        { error: 'Drawing not found' },
        { status: 404 }
      );
    }
    
    // Map drawing number to PDF file
    const pdfMapping = getDrawingPdfMapping(drawing.drawingNo);
    
    if (!pdfMapping) {
      return NextResponse.json(
        { 
          error: 'PDF file not found for this drawing',
          drawingNo: drawing.drawingNo,
          title: drawing.title,
        },
        { status: 404 }
      );
    }
    
    // Determine file path
    const filePath = path.join(process.cwd(), 'public', 'DOCUMENTS', pdfMapping.filename);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { 
          error: 'PDF file not found on server',
          expectedPath: filePath,
        },
        { status: 404 }
      );
    }
    
    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Set response headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `inline; filename="${pdfMapping.filename}"`);
    headers.set('Content-Length', fileBuffer.length.toString());
    
    // Return PDF
    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error('PDF serve error:', error);
    return NextResponse.json(
      { error: 'Failed to serve PDF', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Map drawing numbers to PDF filenames
 */
function getDrawingPdfMapping(drawingNo: string): { filename: string; pageOffset?: number } | null {
  const mappings: Record<string, { filename: string; pageOffset?: number }> = {
    // VCC Drawing List & Index
    '942-58100': { filename: 'KMRCL VCC Drawings_OCR.pdf' },
    
    // Cab Panel PIN Assignment
    '942-38104': { filename: 'CAB_PIN DRAWINGS 2.pdf' },
    
    // DMC Ceiling PIN Assignment
    '942-38310': { filename: 'DMC_CEILING.pdf' },
    
    // DMC Underframe PIN Assignment
    '942-38305': { filename: 'DMC UF_PIN DRAWINGS.pdf' },
    
    // TC Ceiling PIN Assignment
    '942-38409': { filename: 'TC_CEILING PIN DRAWINGS.pdf' },
    
    // TC Underframe PIN Assignment
    '942-38508': { filename: 'TC _UF PIN DRAWINGS.pdf' },
    
    // MC Ceiling PIN Assignment
    '942-38606': { filename: 'MC_CEILING_PIN DRAWINGS.pdf' },
    
    // MC Underframe PIN Assignment
    '942-38602': { filename: 'MC_UF.pdf' },
    
    // VCC System Description
    'VCC-DESC-01': { filename: 'VCC DESCRIPTION 13.12.2017.pdf' },
  };
  
  // Try exact match first
  if (mappings[drawingNo]) {
    return mappings[drawingNo];
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(mappings)) {
    if (drawingNo.includes(key) || key.includes(drawingNo)) {
      return value;
    }
  }
  
  return null;
}

/**
 * Get all available PDF documents
 */
export async function GET_DOCUMENTS() {
  try {
    const drawings = await prisma.drawing.findMany({
      select: {
        id: true,
        drawingNo: true,
        title: true,
        revision: true,
        totalSheets: true,
        system: { select: { code: true, name: true } },
        pages: true,
      },
      orderBy: { drawingNo: 'asc' },
    });
    
    const documents = drawings.map(d => ({
      id: d.id,
      drawingNo: d.drawingNo,
      title: d.title,
      revision: d.revision,
      totalSheets: d.totalSheets,
      system: d.system ? { code: d.system.code, name: d.system.name } : null,
      pages: d.pages.length,
      pdfFile: getDrawingPdfMapping(d.drawingNo)?.filename || null,
    }));
    
    return NextResponse.json({ documents, count: documents.length });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
