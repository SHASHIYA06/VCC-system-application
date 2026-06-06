import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

/**
 * POST /api/drawings/sync
 * Synchronize all drawings with their PDF page mappings
 * 
 * Action Types:
 * - full: Complete sync of all drawings
 * - verify: Check existing mappings
 * - report: Generate sync status report
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'report';

    if (action === 'status') {
      // Return current sync status
      const totalDrawings = await prisma.drawing.count();
      const mappedDrawings = await prisma.drawing.count({
        where: {
          pageMappings: {
            some: {}
          }
        }
      });

      return NextResponse.json({
        success: true,
        status: {
          totalDrawings,
          mappedDrawings,
          unmappedDrawings: totalDrawings - mappedDrawings,
          syncPercentage: totalDrawings > 0 ? ((mappedDrawings / totalDrawings) * 100).toFixed(1) : 0,
        }
      });
    }

    if (action === 'report') {
      // Generate detailed sync report
      const totalDrawings = await prisma.drawing.count();
      const mappedDrawings = await prisma.drawing.count({
        where: {
          pageMappings: {
            some: {}
          }
        }
      });

      const verifiedMappings = await prisma.drawingPageMapping.count({
        where: { verified: true }
      });

      const totalMappings = await prisma.drawingPageMapping.count();

      // Get sample unmapped drawings
      const unmappedSample = await prisma.drawing.findMany({
        where: {
          pageMappings: {
            none: {}
          }
        },
        take: 20,
        select: {
          id: true,
          drawingNo: true,
          title: true,
          systemId: true
        }
      });

      return NextResponse.json({
        success: true,
        report: {
          overview: {
            totalDrawings,
            mappedDrawings,
            unmappedDrawings: totalDrawings - mappedDrawings,
            syncPercentage: totalDrawings > 0 ? ((mappedDrawings / totalDrawings) * 100).toFixed(1) : 0,
          },
          mappings: {
            total: totalMappings,
            verified: verifiedMappings,
            unverified: totalMappings - verifiedMappings,
            verificationPercentage: totalMappings > 0 ? ((verifiedMappings / totalMappings) * 100).toFixed(1) : 0,
          },
          unmappedSample: unmappedSample.slice(0, 10),
          timestamp: new Date().toISOString(),
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: `Unknown action: ${action}`
    }, { status: 400 });

  } catch (error) {
    console.error('Drawings sync GET error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get sync status'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = 'full', drawingNumbers } = body;

    if (action === 'full') {
      // Perform full sync
      const drawings = await prisma.drawing.findMany({
        include: { pageMappings: true }
      });

      let syncedCount = 0;
      let skippedCount = 0;
      const results = [];

      for (const drawing of drawings) {
        try {
          // Skip if already mapped and verified
          if (drawing.pageMappings.length > 0 && drawing.pageMappings.some(m => m.verified)) {
            skippedCount++;
            continue;
          }

          // Infer page number from drawing number
          const inferred = inferPageFromDrawingNumber(drawing.drawingNo);
          
          if (inferred) {
            // Check if mapping already exists
            let mapping = drawing.pageMappings.find(m => m.pdfPageNo === inferred.page);

            if (!mapping) {
              // Create new mapping
              mapping = await prisma.drawingPageMapping.create({
                data: {
                  drawingId: drawing.id,
                  drawingNumber: drawing.drawingNo,
                  sourceFileName: inferred.sourceFile,
                  pdfPageNo: inferred.page,
                  verified: false,
                  notes: 'Inferred from drawing number pattern'
                }
              });
            }

            syncedCount++;
            results.push({
              drawingNo: drawing.drawingNo,
              page: inferred.page,
              sourceFile: inferred.sourceFile,
              success: true
            });
          }
        } catch (err) {
          console.error(`Failed to sync drawing ${drawing.drawingNo}:`, err);
          results.push({
            drawingNo: drawing.drawingNo,
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error'
          });
        }
      }

      return NextResponse.json({
        success: true,
        action: 'full',
        summary: {
          totalProcessed: drawings.length,
          synced: syncedCount,
          skipped: skippedCount,
          failed: drawings.length - syncedCount - skippedCount
        },
        sampleResults: results.slice(0, 20)
      });
    }

    if (action === 'verify') {
      // Verify specific drawings
      const drawings = Array.isArray(drawingNumbers) ? drawingNumbers : [drawingNumbers];
      const results = [];

      for (const drawingNo of drawings) {
        const drawing = await prisma.drawing.findFirst({
          where: { drawingNo },
          include: { pageMappings: true }
        });

        if (!drawing) {
          results.push({
            drawingNo,
            found: false,
            error: 'Drawing not found'
          });
          continue;
        }

        const inferred = inferPageFromDrawingNumber(drawingNo);
        const mapping = drawing.pageMappings[0];

        results.push({
          drawingNo,
          found: true,
          inferred: inferred?.page,
          mapped: mapping?.pdfPageNo,
          sourceFile: mapping?.sourceFileName || inferred?.sourceFile,
          verified: mapping?.verified || false,
          match: inferred?.page === mapping?.pdfPageNo
        });
      }

      return NextResponse.json({
        success: true,
        action: 'verify',
        results
      });
    }

    return NextResponse.json({
      success: false,
      error: `Unknown action: ${action}`
    }, { status: 400 });

  } catch (error) {
    console.error('Drawings sync POST error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync drawings'
    }, { status: 500 });
  }
}

/**
 * Infer PDF page number and source file from drawing number
 * Based on established mapping patterns in CAB_PIN, DMC, TC, MC systems
 */
function inferPageFromDrawingNumber(drawingNo: string): { page: number; sourceFile: string } | null {
  const num = parseInt(drawingNo.replace(/\D/g, ''), 10);
  if (!num) return null;

  // Drawing number patterns mapped to PDF files
  const lastFourDigits = num % 10000;

  // CAB PIN Drawings (942-38103 to 942-38128)
  if (lastFourDigits >= 38103 && lastFourDigits <= 38128) {
    const CAB_PIN_MAPPING: Record<number, number> = {
      38103: 1,
      38104: 8,
      38105: 16,
      38108: 24,
      38109: 27,
      38111: 28,
      38112: 29,
      38113: 30,
      38117: 33,
      38118: 34,
      38119: 35,
      38120: 37,
      38121: 38,
      38122: 41,
      38110: 42,
      38128: 46,
      38409: 15, // Intercar Jumper & Connector Layout - TC Car
    };
    const page = CAB_PIN_MAPPING[lastFourDigits] || 1;
    return { page, sourceFile: 'CAB_PIN DRAWINGS.pdf' };
  }

  // DMC UF PIN Drawings (942-383XX)
  if (lastFourDigits >= 38305 && lastFourDigits <= 38323) {
    return {
      page: Math.max(1, (lastFourDigits - 38300) * 2),
      sourceFile: 'DMC UF_PIN DRAWINGS.pdf'
    };
  }

  // DMC Ceiling (942-384XX)
  if (lastFourDigits >= 38402 && lastFourDigits <= 38413) {
    return {
      page: Math.max(1, (lastFourDigits - 38400) * 2),
      sourceFile: 'DMC_CEILING.pdf'
    };
  }

  // TC UF PIN Drawings (942-385XX)
  if (lastFourDigits >= 38505 && lastFourDigits <= 38521) {
    return {
      page: Math.max(1, (lastFourDigits - 38500) * 2),
      sourceFile: 'TC _UF PIN DRAWINGS.pdf'
    };
  }

  // TC Ceiling (942-386XX)
  if (lastFourDigits >= 38602 && lastFourDigits <= 38614) {
    return {
      page: Math.max(1, (lastFourDigits - 38600) * 2),
      sourceFile: 'TC_CEILING PIN DRAWINGS.pdf'
    };
  }

  // MC Ceiling (942-387XX)
  if (lastFourDigits >= 38604 && lastFourDigits <= 38711) {
    return {
      page: Math.max(1, (lastFourDigits - 38600) * 2),
      sourceFile: 'MC_CEILING_PIN DRAWINGS.pdf'
    };
  }

  // MC UF (942-381XX to 942-382XX)
  if ((lastFourDigits >= 38101 && lastFourDigits <= 38124) || 
      (lastFourDigits >= 38201 && lastFourDigits <= 38224)) {
    return {
      page: Math.max(1, (lastFourDigits % 100) * 2),
      sourceFile: 'MC_UF.pdf'
    };
  }

  // Main schematics (942-581XX+)
  if (lastFourDigits >= 58100) {
    const pageNum = Math.max(1, (lastFourDigits - 58100) + 1);
    return {
      page: pageNum,
      sourceFile: 'KMRCL VCC Drawings_OCR.pdf'
    };
  }

  // Default fallback
  return {
    page: 1,
    sourceFile: 'KMRCL VCC Drawings_OCR.pdf'
  };
}
