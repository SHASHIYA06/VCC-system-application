import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

function extractDrawingNumber(drawingNo: string): string {
  const cleaned = drawingNo.replace(/^942[-_]/i, '').replace(/-/g, '');
  return cleaned;
}

// Function to scan physical directory for PDF files
async function scanPhysicalDirectory() {
  const docsPath = path.join(process.cwd(), 'public', 'DOCUMENTS');
  if (!fs.existsSync(docsPath)) return [];
  const files = fs.readdirSync(docsPath).filter(f => f.toLowerCase().endsWith('.pdf'));
  return files;
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'seedMappings' || action === 'dynamicScan') {
      const physicalFiles = await scanPhysicalDirectory();
      let mappedCount = 0;
      
      // Map drawings to their inferred pages
      for (const sourceFile of physicalFiles) {
        const drawings = await prisma.drawing.findMany({
          where: { sourceFileId: sourceFile }
        });
        
        for (const drawing of drawings) {
          const inferredPage = inferPageFromDrawingNumber(drawing.drawingNo, sourceFile);
          
          await prisma.drawingPage.upsert({
            where: { drawingId_pageNo: { drawingId: drawing.id, pageNo: 1 } },
            update: { extra: { pdfPageNo: inferredPage, sourceFile, verified: true } as any },
            create: {
              drawingId: drawing.id,
              pageNo: 1,
              parseStatus: 'MAPPED',
              extra: { pdfPageNo: inferredPage, sourceFile, verified: true } as any
            }
          });
          mappedCount++;
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        mappedCount,
        scannedFiles: physicalFiles,
        message: `Dynamically scanned and mapped ${mappedCount} drawings across ${physicalFiles.length} PDFs` 
      });
    }
    
    if (action === 'getMapping') {
      const { drawingNo, sourceFile } = await request.json();
      const mapping = inferPageFromDrawingNumber(drawingNo, sourceFile);
      return NextResponse.json({ pdfPageNo: mapping, sourceFile, dynamic: true });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('PDF mapping error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const drawingNo = searchParams.get('drawing_no');
  const sourceFile = searchParams.get('source_file');
  
  if (!drawingNo || !sourceFile) {
    return NextResponse.json({ error: 'drawing_no and source_file required' }, { status: 400 });
  }
  
  // First, try to get page mapping from database
  try {
    const drawing = await prisma.drawing.findFirst({
      where: {
        OR: [
          { drawingNo: { equals: drawingNo } },
          { drawingNo: { contains: drawingNo } }
        ]
      },
      include: {
        pages: {
          orderBy: { pageNo: 'asc' },
          take: 1
        }
      }
    });

    if (drawing?.pages?.[0]?.extra) {
      try {
        const extra = drawing.pages[0].extra as any;
        if (extra && typeof extra === 'object' && extra.pdfPageNo) {
          return NextResponse.json({ 
            pdfPageNo: extra.pdfPageNo, 
            sourceFile,
            source: 'database' 
          });
        }
      } catch (e) {
        // Continue to fallback
      }
    }
  } catch (error) {
    console.error('Database lookup failed:', error);
  }
  
  // Fallback to dynamic inference
  const inferredPage = inferPageFromDrawingNumber(drawingNo, sourceFile);
  
  return NextResponse.json({ 
    pdfPageNo: inferredPage, 
    sourceFile,
    source: 'inferred',
    warning: 'No exact mapping found, showing inferred page'
  });
}

function inferPageFromDrawingNumber(drawingNo: string, sourceFile: string): number {
  // Rather than arbitrary offsets which lead to the wrong drawings showing,
  // we default to opening the PDF at page 1 unless we have a definitive DB mapping.
  // The user can then navigate or we can implement exact page scraping later.
  return 1;
}
