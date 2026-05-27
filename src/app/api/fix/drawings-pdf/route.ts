import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Maps drawing numbers to their correct PDF source files.
 * Based on real VCC document structure analysis.
 */
function resolveDrawingPdfFile(drawingNo: string): string {
  const upper = drawingNo.toUpperCase().replace(/\s+/g, '');
  
  // Strip any suffix (A/B/C/D) and get numeric part
  const baseMatch = upper.match(/942-?(\d{5})/);
  if (!baseMatch) return 'KMRCL VCC Drawings_OCR.pdf';
  
  const num = parseInt(baseMatch[1]);
  
  // CAB PIN drawings: 942-381xx, 942-382xx
  if (num >= 38100 && num <= 38199) return 'CAB_PIN DRAWINGS.pdf';
  if (num >= 38200 && num <= 38299) return 'CAB_PIN DRAWINGS 2.pdf';
  
  // DMC Underframe: 942-383xx  
  if (num >= 38300 && num <= 38399) return 'DMC UF_PIN DRAWINGS.pdf';
  
  // DMC Ceiling: 942-384xx
  if (num >= 38400 && num <= 38499) return 'DMC_CEILING.pdf';
  
  // TC Underframe: 942-385xx
  if (num >= 38500 && num <= 38599) return 'TC _UF PIN DRAWINGS.pdf';
  
  // TC Ceiling: 942-386xx
  if (num >= 38600 && num <= 38699) return 'TC_CEILING PIN DRAWINGS.pdf';
  
  // MC Underframe: 942-387xx (some in MC_UF.pdf)
  if (num >= 38700 && num <= 38799) return 'MC_CEILING_PIN DRAWINGS.pdf';
  
  // All system schematic drawings: 942-581xx
  if (num >= 58100 && num <= 58999) return 'KMRCL VCC Drawings_OCR.pdf';
  
  // Default: main OCR file
  return 'KMRCL VCC Drawings_OCR.pdf';
}

export async function GET(request: NextRequest) {
  // Preview mode — show what would be updated
  const { searchParams } = new URL(request.url);
  const preview = searchParams.get('preview') !== 'false';
  
  const drawings = await prisma.drawing.findMany({
    select: { id: true, drawingNo: true, sourceFileId: true, drawingPdfUrl: true },
    orderBy: { drawingNo: 'asc' },
  });
  
  const updates = drawings.map(d => {
    const correctFile = resolveDrawingPdfFile(d.drawingNo);
    const correctUrl = `/api/pdf/${encodeURIComponent(correctFile)}`;
    const needsUpdate = d.sourceFileId !== correctFile || !d.drawingPdfUrl;
    
    return {
      drawingNo: d.drawingNo,
      currentSourceFile: d.sourceFileId,
      correctSourceFile: correctFile,
      currentUrl: d.drawingPdfUrl,
      correctUrl,
      needsUpdate,
    };
  });
  
  const needsUpdateCount = updates.filter(u => u.needsUpdate).length;
  
  if (!preview) {
    return NextResponse.json({
      total: drawings.length,
      needsUpdate: needsUpdateCount,
      sample: updates.slice(0, 10),
    });
  }
  
  return NextResponse.json({
    total: drawings.length,
    needsUpdate: needsUpdateCount,
    preview: true,
    message: 'Add ?preview=false to execute updates',
    byFile: Object.entries(
      updates.reduce((acc, u) => {
        const key = u.correctSourceFile;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ),
  });
}

export async function POST(request: NextRequest) {
  // Execute the update
  try {
    const drawings = await prisma.drawing.findMany({
      select: { id: true, drawingNo: true, sourceFileId: true },
    });
    
    let updated = 0;
    const errors: string[] = [];
    
    // Process in batches of 50
    for (let i = 0; i < drawings.length; i += 50) {
      const batch = drawings.slice(i, i + 50);
      
      await Promise.all(batch.map(async (d) => {
        try {
          const correctFile = resolveDrawingPdfFile(d.drawingNo);
          const correctUrl = `/api/pdf/${encodeURIComponent(correctFile)}`;
          
          await prisma.drawing.update({
            where: { id: d.id },
            data: {
              sourceFileId: correctFile,
              drawingPdfUrl: correctUrl,
            },
          });
          updated++;
        } catch (e) {
          errors.push(`${d.drawingNo}: ${String(e).slice(0, 100)}`);
        }
      }));
    }
    

    return NextResponse.json({
      success: true,
      totalDrawings: drawings.length,
      updated,
      errors: errors.slice(0, 10),
      message: `Updated ${updated} of ${drawings.length} drawings with correct PDF URLs`,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
