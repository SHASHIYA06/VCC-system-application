import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/drawings/mapping-verify
 * 
 * Verify and get accurate drawing-to-PDF mappings.
 * Handles duplicate drawing numbers with car-type disambiguation.
 * 
 * Query Parameters:
 * - drawing_no: Drawing number to lookup
 * - car_type: Optional - DMC, TC, MC to disambiguate
 * - source_file: Optional - specific PDF file
 */
export async function GET(request: NextRequest) {
  const drawingNo = request.nextUrl.searchParams.get('drawing_no');
  const carType = request.nextUrl.searchParams.get('car_type');
  const sourceFile = request.nextUrl.searchParams.get('source_file');

  if (!drawingNo) {
    return NextResponse.json(
      { error: 'drawing_no parameter required' },
      { status: 400 }
    );
  }

  try {
    // Get all possible mappings for this drawing
    let mappings = await prisma.drawingPageMapping.findMany({
      where: {
        drawingNumber: drawingNo,
      },
    });

    if (mappings.length === 0) {
      return NextResponse.json({
        error: 'No mappings found',
        drawingNo,
        suggestion: 'Try with a different drawing number or check if it exists',
      }, { status: 404 });
    }

    // If multiple mappings, try to disambiguate by car type
    if (mappings.length > 1 && carType) {
      // Try to find one matching the car type
      let filtered = mappings.filter(m => 
        m.sourceFileName.includes(carType.toUpperCase())
      );
      
      if (filtered.length === 0) {
        // Try fuzzy match
        const carTypeMap: Record<string, string[]> = {
          'DMC': ['DMC', 'MOTOR'],
          'TC': ['TC', 'TRAILING'],
          'MC': ['MC', 'MIDDLE'],
          'CAB': ['CAB'],
          'UF': ['UNDERFRAME', 'UF'],
          'CEILING': ['CEILING'],
        };
        
        const patterns = carTypeMap[carType.toUpperCase()] || [carType.toUpperCase()];
        filtered = mappings.filter(m =>
          patterns.some(p => m.sourceFileName.toUpperCase().includes(p))
        );
      }
      
      if (filtered.length > 0) {
        mappings = filtered;
      }
    }

    // If sourceFile specified, filter to that file
    if (sourceFile) {
      mappings = mappings.filter(m => m.sourceFileName.includes(sourceFile));
    }

    // Return all found mappings with disambiguation info
    const result = mappings.map((m, idx) => ({
      mapping: {
        id: m.id,
        drawingNumber: m.drawingNumber,
        sourceFileName: m.sourceFileName,
        pdfPageNo: m.pdfPageNo,
        verified: m.verified,
        notes: m.notes,
      },
      disambiguationInfo: {
        index: idx,
        isPreferred: idx === 0 && mappings.length > 1,
        carTypeHint: extractCarTypeFromFilename(m.sourceFileName),
      },
    }));

    return NextResponse.json({
      drawingNo,
      found: mappings.length,
      carTypeFilter: carType || null,
      sourceFileFilter: sourceFile || null,
      results: result,
      primaryMapping: result.length > 0 ? result[0] : null,
      disambiguation: mappings.length > 1 ? {
        message: `${mappings.length} different PDFs contain drawing ${drawingNo}`,
        recommendation: carType 
          ? `Use car type "${carType}" for accurate location`
          : 'Specify car_type parameter: DMC, TC, MC, or CAB',
      } : null,
    });
  } catch (error) {
    console.error('Error verifying drawing mapping:', error);
    return NextResponse.json(
      { error: 'Failed to verify drawing mapping', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/drawings/mapping-verify
 * 
 * Update a drawing mapping verification status.
 * Body:
 * - mapping_id: ID of the mapping to update
 * - verified: true/false
 * - notes: Optional notes about verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mapping_id, verified, notes } = body;

    if (!mapping_id) {
      return NextResponse.json(
        { error: 'mapping_id required' },
        { status: 400 }
      );
    }

    const updated = await prisma.drawingPageMapping.update({
      where: { id: mapping_id },
      data: {
        verified: verified ?? true,
        notes: notes || undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      mapping: {
        id: updated.id,
        drawingNumber: updated.drawingNumber,
        sourceFileName: updated.sourceFileName,
        pdfPageNo: updated.pdfPageNo,
        verified: updated.verified,
        notes: updated.notes,
      },
    });
  } catch (error) {
    console.error('Error updating mapping:', error);
    return NextResponse.json(
      { error: 'Failed to update mapping', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Helper: Extract car type from PDF filename
 */
function extractCarTypeFromFilename(filename: string): string {
  const upper = filename.toUpperCase();
  if (upper.includes('DMC')) return 'DMC';
  if (upper.includes('TC')) return 'TC';
  if (upper.includes('MC')) return 'MC';
  if (upper.includes('CAB')) return 'CAB';
  if (upper.includes('UNDERFRAME') || upper.includes('UF')) return 'UF';
  if (upper.includes('CEILING')) return 'CEILING';
  return 'UNKNOWN';
}
