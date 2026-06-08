/**
 * DRAWING MAPPING VERIFICATION ENDPOINT
 * 
 * Verifies drawing-to-PDF page mappings with coverage statistics
 * Uses database records + ACCURATE_DRAWING_PAGE_MAPPINGS as reference
 * 
 * Returns:
 * - Verification status for all 574 drawings
 * - Coverage percentages by car type and system
 * - Recommendations for unverified drawings
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface DrawingVerification {
  drawingNo: string;
  verified: boolean;
  pdfFile?: string;
  pageNo?: number;
  carType?: string;
  system?: string;
  notes?: string;
}

interface VerificationReport {
  totalDrawings: number;
  verifiedCount: number;
  unverifiedCount: number;
  verificationPercentage: number;
  bySystem: Record<string, { total: number; verified: number; percentage: number }>;
  byCarType: Record<string, { total: number; verified: number; percentage: number }>;
  unverifiedDrawings: DrawingVerification[];
  recommendations: string[];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const carTypeFilter = searchParams.get('carType');
    const systemFilter = searchParams.get('system');

    // Get all drawings with their mappings
    const drawings = await prisma.drawing.findMany({
      include: {
        system: true,
        pageMappings: true,
        applicability: { include: { carType: true } },
      },
      orderBy: { drawingNo: 'asc' },
    });

    let filteredDrawings = drawings;

    // Apply filters if provided
    if (carTypeFilter) {
      filteredDrawings = drawings.filter(d => 
        d.applicability.some(a => a.carType?.code === carTypeFilter)
      );
    }

    if (systemFilter) {
      filteredDrawings = drawings.filter(d => d.system?.code === systemFilter);
    }

    // Build verification report
    const verified: DrawingVerification[] = [];
    const unverified: DrawingVerification[] = [];
    const bySystem: Record<string, { total: number; verified: number; percentage: number }> = {};
    const byCarType: Record<string, { total: number; verified: number; percentage: number }> = {};

    for (const drawing of filteredDrawings) {
      const mapping = drawing.pageMappings?.[0];
      const systemCode = drawing.system?.code || 'GEN';
      const carTypes = drawing.applicability.map(a => a.carType?.code || 'UNKNOWN');

      // Initialize counters if needed
      if (!bySystem[systemCode]) {
        bySystem[systemCode] = { total: 0, verified: 0, percentage: 0 };
      }

      for (const carType of carTypes) {
        if (!byCarType[carType]) {
          byCarType[carType] = { total: 0, verified: 0, percentage: 0 };
        }
      }

      bySystem[systemCode].total++;
      for (const carType of carTypes) {
        byCarType[carType].total++;
      }

      const verificationEntry: DrawingVerification = {
        drawingNo: drawing.drawingNo,
        verified: mapping?.verified || false,
        pdfFile: mapping?.sourceFileName,
        pageNo: mapping?.pdfPageNo,
        carType: carTypes.join(', '),
        system: systemCode,
        notes: mapping?.notes || undefined,
      };

      if (mapping?.verified) {
        verified.push(verificationEntry);
        bySystem[systemCode].verified++;
        for (const carType of carTypes) {
          byCarType[carType].verified++;
        }
      } else {
        unverified.push(verificationEntry);
      }
    }

    // Calculate percentages
    for (const system of Object.values(bySystem)) {
      system.percentage = system.total > 0 ? Math.round((system.verified / system.total) * 100) : 0;
    }

    for (const carType of Object.values(byCarType)) {
      carType.percentage = carType.total > 0 ? Math.round((carType.verified / carType.total) * 100) : 0;
    }

    // Generate recommendations
    const recommendations: string[] = [];
    const totalDrawings = filteredDrawings.length;
    const verificationPercentage = totalDrawings > 0 ? Math.round((verified.length / totalDrawings) * 100) : 0;

    if (verificationPercentage < 50) {
      recommendations.push('⚠️ CRITICAL: Less than 50% of drawings verified. Recommend running auto-sync.');
    } else if (verificationPercentage < 100) {
      recommendations.push('⚠️ WARNING: ' + unverified.length + ' drawings still unverified. Consider manual verification.');
    } else {
      recommendations.push('✅ SUCCESS: All drawings verified! System ready for production.');
    }

    // Identify missing systems
    const systemsWithLowestCoverage = Object.entries(bySystem)
      .sort((a, b) => a[1].percentage - b[1].percentage)
      .slice(0, 3)
      .map(([sys, data]) => `${sys} (${data.percentage}% verified)`);

    if (systemsWithLowestCoverage.length > 0) {
      recommendations.push(`Priority systems for verification: ${systemsWithLowestCoverage.join(', ')}`);
    }

    const report: VerificationReport = {
      totalDrawings,
      verifiedCount: verified.length,
      unverifiedCount: unverified.length,
      verificationPercentage,
      bySystem,
      byCarType,
      unverifiedDrawings: unverified.slice(0, 50), // Return first 50 for display
      recommendations,
    };

    return NextResponse.json({
      success: true,
      report,
      executionTime: Date.now(),
      filters: { carType: carTypeFilter, system: systemFilter },
    });

  } catch (error) {
    console.error('❌ Verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { drawingNo, verified, pdfFile, pageNo, notes } = body;

    if (!drawingNo) {
      return NextResponse.json(
        { error: 'drawingNo is required' },
        { status: 400 }
      );
    }

    // Find drawing
    const drawing = await prisma.drawing.findFirst({
      where: {
        OR: [
          { drawingNo: { equals: drawingNo, mode: 'insensitive' } },
          { id: drawingNo },
        ],
      },
    });

    if (!drawing) {
      return NextResponse.json(
        { error: 'Drawing not found' },
        { status: 404 }
      );
    }

    // Update or create mapping
    const existingMapping = await prisma.drawingPageMapping.findFirst({
      where: { drawingId: drawing.id },
    });

    let mapping;
    if (existingMapping) {
      mapping = await prisma.drawingPageMapping.update({
        where: { id: existingMapping.id },
        data: {
          verified: verified !== undefined ? verified : existingMapping.verified,
          pdfPageNo: pageNo !== undefined ? pageNo : existingMapping.pdfPageNo,
          sourceFileName: pdfFile || existingMapping.sourceFileName,
          notes: notes || existingMapping.notes,
          updatedAt: new Date(),
        },
      });
    } else {
      mapping = await prisma.drawingPageMapping.create({
        data: {
          drawingId: drawing.id,
          drawingNumber: drawingNo,
          sourceFileName: pdfFile || 'UNKNOWN',
          pdfPageNo: pageNo || 0,
          verified: verified || false,
          notes: notes || '',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Drawing ${drawingNo} mapping updated`,
      mapping,
    });

  } catch (error) {
    console.error('❌ Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update mapping', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
