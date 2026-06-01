import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PDF page mapping configuration
const PDF_MAPPINGS = {
  'KMRCL VCC Drawings_OCR.pdf': {
    pattern: /^942-581\d{2}$/,
    mappings: {
      58100: 3, 58101: 4, 58102: 5, 58103: 9, 58104: 13, 58105: 21, 58106: 22,
      58107: 23, 58108: 24, 58109: 26, 58110: 28, 58111: 29, 58112: 30, 58113: 31,
      58114: 32, 58115: 33, 58116: 34, 58117: 35, 58118: 36, 58119: 37, 58120: 38,
      58121: 39, 58123: 45, 58124: 46, 58125: 47, 58126: 48, 58127: 49, 58128: 50,
      58129: 51, 58130: 52, 58131: 53, 58132: 54, 58137: 55, 58138: 56, 58139: 58,
      58140: 60, 58141: 61, 58142: 62, 58143: 63, 58144: 64, 58145: 65, 58146: 67,
      58147: 68, 58148: 69, 58149: 70, 58150: 71, 58151: 72, 58152: 73, 58153: 74,
      58154: 75
    }
  },
  'CAB_PIN DRAWINGS 2.pdf': {
    pattern: /^942-381(0[3-9]|1[0-9]|2[0-8])$/,
    mappings: {
      38103: 1, 38104: 8, 38105: 16, 38108: 24, 38109: 27, 38111: 28, 38112: 29,
      38113: 30, 38117: 33, 38118: 34, 38119: 35, 38120: 37, 38121: 38, 38122: 41,
      38110: 42, 38128: 46
    }
  },
  'DMC UF_PIN DRAWINGS.pdf': {
    pattern: /^942-383(0[5-9]|1[0-9]|2[0-3])$/,
    mappings: {
      38305: 1, 38306: 3, 38307: 5, 38308: 6, 38309: 7, 38310: 8, 38311: 9,
      38312: 10, 38314: 15, 38315: 14, 38316: 17, 38317: 16, 38319: 19, 38320: 20,
      38321: 21, 38322: 22, 38323: 26
    }
  },
  'TC _UF PIN DRAWINGS.pdf': {
    pattern: /^942-385(0[5-9]|1[0-9]|2[0-1])$/,
    mappings: {
      38505: 2, 38506: 3, 38507: 7, 38508: 8, 38509: 9, 38510: 10, 38512: 12,
      38514: 14, 38515: 15, 38516: 16, 38518: 18, 38519: 19, 38520: 20, 38521: 21
    }
  },
  'MC_UF.pdf': {
    pattern: /^942-381(0[1-9]|1[0-9]|2[0-4])$/,
    mappings: {
      38105: 1, 38106: 3, 38101: 6, 38109: 7, 38110: 8, 38111: 9, 38112: 10,
      38114: 13, 38115: 14, 38116: 15, 38118: 18, 38119: 19, 38120: 20, 38121: 22,
      38122: 23, 38123: 24, 38124: 25
    }
  },
  'DMC_CEILING.pdf': {
    pattern: /^942-384(0[2-9]|1[0-3])$/,
    mappings: {
      38402: 1, 38403: 3, 38404: 5, 38405: 7, 38406: 9, 38407: 11, 38409: 15,
      38410: 17, 38411: 19, 38413: 23
    }
  },
  'TC_CEILING PIN DRAWINGS.pdf': {
    pattern: /^942-386(0[2-9]|1[0-4])$/,
    mappings: {
      38602: 1, 38603: 3, 38605: 5, 38606: 7, 38607: 9, 38608: 11, 38611: 17,
      38612: 19, 38614: 23
    }
  },
  'MC_CEILING_PIN DRAWINGS.pdf': {
    pattern: /^942-38(604|609|610|70[5-9]|71[0-1])$/,
    mappings: {
      38604: 3, 38609: 16, 38610: 20, 38705: 21, 38706: 22, 38707: 23, 38709: 25,
      38710: 26, 38711: 27
    }
  },
  'VCC DESCRIPTION 13.12.2017.pdf': {
    pattern: /^VCC-REF-/,
    mappings: {}
  }
};

function extractDrawingNumber(drawingNo: string): number | null {
  const match = drawingNo.match(/(\d+)([a-zA-Z])?$/);
  if (match) {
    return parseInt(match[1]);
  }
  return null;
}

function findPdfFileForDrawing(drawingNo: string): { file: string; pageNo: number } | null {
  for (const [pdfFile, config] of Object.entries(PDF_MAPPINGS)) {
    if (config.pattern.test(drawingNo)) {
      const num = extractDrawingNumber(drawingNo);
      if (num !== null && config.mappings[num as keyof typeof config.mappings]) {
        return {
          file: pdfFile,
          pageNo: config.mappings[num as keyof typeof config.mappings]
        };
      }
    }
  }

  if (drawingNo.startsWith('VCC-REF-')) {
    const pageNum = parseInt(drawingNo.replace('VCC-REF-', ''));
    if (!isNaN(pageNum)) {
      return {
        file: 'VCC DESCRIPTION 13.12.2017.pdf',
        pageNo: pageNum
      };
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Get all drawings
    const drawings = await prisma.drawing.findMany({
      select: {
        id: true,
        drawingNo: true,
        sourceFileId: true
      }
    });

    let updated = 0;
    let created = 0;
    let skipped = 0;
    let errors = 0;

    // Process each drawing
    for (const drawing of drawings) {
      try {
        const mapping = findPdfFileForDrawing(drawing.drawingNo);

        if (!mapping) {
          skipped++;
          continue;
        }

        const existingPage = await prisma.drawingPage.findFirst({
          where: {
            drawingId: drawing.id,
            pageNo: 1
          }
        });

        const extra = {
          pdfPageNo: mapping.pageNo,
          pdfFile: mapping.file,
          mappedAt: new Date().toISOString(),
          mappingSource: 'api_sync',
          verified: true
        };

        if (existingPage) {
          await prisma.drawingPage.update({
            where: { id: existingPage.id },
            data: {
              extra,
              parseStatus: 'MAPPED'
            }
          });
          updated++;
        } else {
          await prisma.drawingPage.create({
            data: {
              drawingId: drawing.id,
              pageNo: 1,
              parseStatus: 'MAPPED',
              extra
            }
          });
          created++;
        }

        if (!drawing.sourceFileId) {
          await prisma.drawing.update({
            where: { id: drawing.id },
            data: { sourceFileId: mapping.file }
          });
        }
      } catch (error) {
        errors++;
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Get verification stats
    const totalMapped = await prisma.drawingPage.count({
      where: {
        extra: {
          path: ['pdfPageNo'],
          not: {}
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'PDF synchronization completed',
      stats: {
        totalDrawings: drawings.length,
        created,
        updated,
        skipped,
        errors,
        totalMapped,
        coverage: ((totalMapped / drawings.length) * 100).toFixed(2) + '%',
        duration: duration + 's'
      }
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get sync status
    const totalDrawings = await prisma.drawing.count();
    const totalMapped = await prisma.drawingPage.count({
      where: {
        extra: {
          path: ['pdfPageNo'],
          not: {}
        }
      }
    });

    return NextResponse.json({
      success: true,
      status: 'ready',
      stats: {
        totalDrawings,
        totalMapped,
        coverage: ((totalMapped / totalDrawings) * 100).toFixed(2) + '%',
        message: 'Use POST to trigger sync'
      }
    });
  } catch (error) {
    console.error('Status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
