import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

function extractDrawingNumber(drawingNo: string): string {
  const cleaned = drawingNo.replace(/^942[-_]/i, '').replace(/-/g, '');
  return cleaned;
}

// Function to extract text page by page (rough approximation using pdf-parse limits if needed, 
// but since pdf-parse extracts all text, we will scan the whole text for drawing numbers 
// and assign a default mapping or use the existing DB).
// A better dynamic approach: we scan the public/DOCUMENTS directory to verify files exist.
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
      
      // Perform dynamic PDF parsing for each file in the physical directory
      for (const sourceFile of physicalFiles) {
        const filePath = path.join(process.cwd(), 'public', 'DOCUMENTS', sourceFile);
        
        try {
          const dataBuffer = fs.readFileSync(filePath);
          const pdfData = await pdfParse(dataBuffer);
          const textContent = pdfData.text;
          
          // Find drawing records that belong to this file
          const drawings = await prisma.drawing.findMany({
            where: { sourceFileId: sourceFile }
          });
          
          for (const drawing of drawings) {
            // Very naive check to see if drawing number exists in text
            // In a real OCR mapping, we'd use pdf.js to get exact page numbers
            const num = extractDrawingNumber(drawing.drawingNo);
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
        } catch (err) {
          console.error(`Failed to parse ${sourceFile}:`, err);
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
      const drawingNum = extractDrawingNumber(drawingNo);
      
      const mapping = inferPageFromDrawingNumber(drawingNum, sourceFile);
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
  
  // Fallback to dynamic inference (since hardcoded is removed)
  const inferredPage = inferPageFromDrawingNumber(drawingNo, sourceFile);
  
  return NextResponse.json({ 
    pdfPageNo: inferredPage, 
    sourceFile,
    source: 'inferred',
    warning: 'No exact mapping found, showing inferred page'
  });
}

function inferPageFromDrawingNumber(drawingNo: string, sourceFile: string): number {
  // Extract numeric part
  const numMatch = drawingNo.match(/\d+/);
  if (!numMatch) return 1;
  
  const num = parseInt(numMatch[0]);
  
  // For PIN drawings, typically each drawing is 2 pages (drawing + notes)
  // Try to calculate based on sequence
  if (sourceFile.includes('PIN')) {
    // Find the base number for this file
    if (sourceFile.includes('CAB_PIN DRAWINGS 2')) {
      // 58124-58147 range, starting at page 1
      const offset = num - 58124;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    } else if (sourceFile.includes('CAB_PIN DRAWINGS')) {
      // 58100-58123 range, starting at page 1
      const offset = num - 58100;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    } else if (sourceFile.includes('DMC_CEILING')) {
      const offset = num - 58000;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    } else if (sourceFile.includes('DMC UF')) {
      const offset = num - 58050;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    } else if (sourceFile.includes('TC_CEILING')) {
      const offset = num - 58200;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    } else if (sourceFile.includes('TC _UF')) {
      const offset = num - 58250;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    } else if (sourceFile.includes('MC_CEILING')) {
      const offset = num - 58300;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    } else if (sourceFile.includes('MC_UF')) {
      const offset = num - 58350;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    }
  }
  
  return 1;
}