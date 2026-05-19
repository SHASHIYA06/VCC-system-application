import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const PDF_MAPPINGS = [
  // CAB system
  { drawingPattern: '942-58107', pdf: 'CAB_PIN DRAWINGS 2.pdf' },
  { drawingPattern: '942-58108', pdf: 'CAB_PIN DRAWINGS 2.pdf' },
  { drawingPattern: '942-58109', pdf: 'CAB_PIN DRAWINGS 2.pdf' },
  { drawingPattern: '942-58110', pdf: 'CAB_PIN DRAWINGS 2.pdf' },
  { drawingPattern: '942-58111', pdf: 'CAB_PIN DRAWINGS 2.pdf' },
  { drawingPattern: '942-58112', pdf: 'CAB_PIN DRAWINGS 2.pdf' },
  { drawingPattern: 'CAB_PIN', pdf: 'CAB_PIN DRAWINGS 2.pdf' },
  { drawingPattern: '942-58113', pdf: 'CAB_PIN DRAWINGS 2.pdf' },
  { drawingPattern: '942-58114', pdf: 'CAB_PIN DRAWINGS 2.pdf' },
  { drawingPattern: '942-58115', pdf: 'CAB_PIN DRAWINGS 2.pdf' },
  { drawingPattern: '942-58116', pdf: 'CAB_PIN DRAWINGS 2.pdf' },
  { drawingPattern: '942-58117', pdf: 'CAB_PIN DRAWINGS 2.pdf' },

  // DMC - Underframe
  { drawingPattern: 'DMC UF', pdf: 'DMC UF_PIN DRAWINGS.pdf' },
  { drawingPattern: '942-38305', pdf: 'DMC UF_PIN DRAWINGS.pdf' },
  { drawingPattern: '942-38306', pdf: 'DMC UF_PIN DRAWINGS.pdf' },
  { drawingPattern: '942-38307', pdf: 'DMC UF_PIN DRAWINGS.pdf' },
  { drawingPattern: '942-38309', pdf: 'DMC UF_PIN DRAWINGS.pdf' },
  { drawingPattern: '942-38310', pdf: 'DMC UF_PIN DRAWINGS.pdf' },
  { drawingPattern: '942-38312', pdf: 'DMC UF_PIN DRAWINGS.pdf' },

  // DMC - Ceiling/Bogie
  { drawingPattern: 'DMC CEILING', pdf: 'DMC_CEILING.pdf' },
  { drawingPattern: 'DMC_CEILING', pdf: 'DMC_CEILING.pdf' },
  { drawingPattern: '942-38405', pdf: 'DMC_CEILING.pdf' },
  { drawingPattern: '942-38406', pdf: 'DMC_CEILING.pdf' },
  { drawingPattern: '942-38409', pdf: 'DMC_CEILING.pdf' },
  { drawingPattern: '942-38602', pdf: 'DMC_CEILING.pdf' },
  { drawingPattern: '942-38603', pdf: 'DMC_CEILING.pdf' },

  // TC - Underframe
  { drawingPattern: 'TC UF', pdf: 'TC _UF PIN DRAWINGS.pdf' },
  { drawingPattern: 'TC_UF', pdf: 'TC _UF PIN DRAWINGS.pdf' },
  { drawingPattern: '942-38512', pdf: 'TC _UF PIN DRAWINGS.pdf' },
  { drawingPattern: '942-38514', pdf: 'TC _UF PIN DRAWINGS.pdf' },
  { drawingPattern: '942-38516', pdf: 'TC _UF PIN DRAWINGS.pdf' },
  { drawingPattern: '942-38308', pdf: 'TC _UF PIN DRAWINGS.pdf' },
  { drawingPattern: '942-38311', pdf: 'TC _UF PIN DRAWINGS.pdf' },
  { drawingPattern: '942-38313', pdf: 'TC _UF PIN DRAWINGS.pdf' },

  // TC - Ceiling
  { drawingPattern: 'TC CEILING', pdf: 'TC_CEILING PIN DRAWINGS.pdf' },
  { drawingPattern: 'TC_CEILING', pdf: 'TC_CEILING PIN DRAWINGS.pdf' },
  { drawingPattern: '942-38405', pdf: 'TC_CEILING PIN DRAWINGS.pdf' },
  { drawingPattern: '942-38406', pdf: 'TC_CEILING PIN DRAWINGS.pdf' },
  { drawingPattern: '942-38608', pdf: 'TC_CEILING PIN DRAWINGS.pdf' },

  // MC - Underframe
  { drawingPattern: 'MC UF', pdf: 'MC_UF.pdf' },
  { drawingPattern: 'MC_UF', pdf: 'MC_UF.pdf' },
  { drawingPattern: '942-38513', pdf: 'MC_UF.pdf' },
  { drawingPattern: '942-38515', pdf: 'MC_UF.pdf' },
  { drawingPattern: '942-38517', pdf: 'MC_UF.pdf' },

  // MC - Ceiling/Bogie
  { drawingPattern: 'MC CEILING', pdf: 'MC_CEILING_PIN DRAWINGS.pdf' },
  { drawingPattern: 'MC_CEILING', pdf: 'MC_CEILING_PIN DRAWINGS.pdf' },
  { drawingPattern: '942-38601', pdf: 'MC_CEILING_PIN DRAWINGS.pdf' },
  { drawingPattern: '942-38602', pdf: 'MC_CEILING_PIN DRAWINGS.pdf' },
  { drawingPattern: '942-38603', pdf: 'MC_CEILING_PIN DRAWINGS.pdf' },
  { drawingPattern: '942-38604', pdf: 'MC_CEILING_PIN DRAWINGS.pdf' },

  // GEN - Master drawings
  { drawingPattern: '942-58099', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58100', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58101', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58102', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58103', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58104', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58105', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58106', pdf: 'KMRCL VCC Drawings_OCR.pdf' },

  // TRAC - Traction
  { drawingPattern: '942-58119', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58120', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58121', pdf: 'KMRCL VCC Drawings_OCR.pdf' },

  // BRAKE
  { drawingPattern: '942-58123', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58124', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58125', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58126', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58127', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58128', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58129', pdf: 'KMRCL VCC Drawings_OCR.pdf' },

  // DOOR
  { drawingPattern: '942-58138', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58139', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58140', pdf: 'KMRCL VCC Drawings_OCR.pdf' },

  // COMMS
  { drawingPattern: '942-58147', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58148', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58149', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58150', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58152', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58153', pdf: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingPattern: '942-58154', pdf: 'KMRCL VCC Drawings_OCR.pdf' },

  // VCC DESCRIPTION
  { drawingPattern: 'VCC DESCRIPTION', pdf: 'VCC DESCRIPTION 13.12.2017.pdf' },
];

export async function POST(request: NextRequest) {
  try {
    let updated = 0;
    let skipped = 0;
    
    // Get all drawings that don't have sourceFileId
    const drawings = await prisma.drawing.findMany({
      where: {
        sourceFileId: null
      },
      take: 500
    });
    
    for (const drawing of drawings) {
      const dwgNo = drawing.drawingNo.toUpperCase();
      const title = (drawing.title || '').toUpperCase();
      const remarks = (drawing.remarks || '').toUpperCase();
      
      let matchedPdf = null;
      
      for (const mapping of PDF_MAPPINGS) {
        const pattern = mapping.drawingPattern.toUpperCase();
        if (dwgNo.includes(pattern) || title.includes(pattern) || remarks.includes(pattern)) {
          matchedPdf = mapping.pdf;
          break;
        }
      }
      
      if (matchedPdf) {
        await prisma.drawing.update({
          where: { id: drawing.id },
          data: { sourceFileId: matchedPdf }
        });
        updated++;
      } else {
        skipped++;
      }
    }
    
    // Also update some specific patterns
    const specificUpdates = await prisma.drawing.updateMany({
      where: {
        OR: [
          { drawingNo: { contains: '942-381' } },
          { drawingNo: { contains: 'cmp' } }
        ]
      },
      data: { sourceFileId: 'KMRCL VCC Drawings_OCR.pdf' }
    });
    
    const totalWithPdf = await prisma.drawing.count({
      where: { sourceFileId: { not: null } }
    });
    
    return NextResponse.json({
      success: true,
      message: `Updated ${updated} drawings with PDF links, skipped ${skipped}`,
      stats: { 
        totalDrawings: await prisma.drawing.count(),
        withPdf: totalWithPdf
      }
    });
    
  } catch (error) {
    console.error('PDF mapping error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  const total = await prisma.drawing.count();
  const withPdf = await prisma.drawing.count({
    where: { sourceFileId: { not: null } }
  });
  
  return NextResponse.json({
    total,
    withPdf,
    without: total - withPdf,
    endpoint: 'POST to link drawings to PDFs'
  });
}