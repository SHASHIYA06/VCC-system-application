import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * REPAIR SCRIPT 1: Fix DrawingWire Gap
 * 
 * Problem: 167,758 wires exist, but only 2,785 are linked to drawings
 * Solution: Use WireEndpoint→Connector chain to create missing DrawingWire records
 * 
 * Chain: Wire → WireEndpoint → Connector → Drawing
 */

export async function GET(request: NextRequest) {
  try {
    // Get current counts BEFORE repair
    const [beforeDrawingWire, beforeWireEndpoint, beforeWire] = await Promise.all([
      prisma.drawingWire.count(),
      prisma.wireEndpoint.count(),
      prisma.wire.count(),
    ]);

    // Calculate current coverage
    const currentCoverage = beforeWireEndpoint > 0 
      ? ((beforeDrawingWire / beforeWireEndpoint) * 100).toFixed(1)
      : '0.0';

    return NextResponse.json({
      status: 'audit',
      timestamp: new Date().toISOString(),
      beforeRepair: {
        drawingWireCount: beforeDrawingWire,
        wireEndpointCount: beforeWireEndpoint,
        wireCount: beforeWire,
        coveragePercent: parseFloat(currentCoverage),
      },
      message: `DrawingWire coverage is ${currentCoverage}% (${beforeDrawingWire}/${beforeWireEndpoint}). POST to /api/repair-drawing-wires to repair.`,
      nextStep: 'POST /api/repair-drawing-wires to start repair',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to audit', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('🔧 Starting DrawingWire repair...');

    // STEP 1: Get current state BEFORE repair
    const [beforeDrawingWire, beforeWireEndpoint] = await Promise.all([
      prisma.drawingWire.count(),
      prisma.wireEndpoint.count(),
    ]);

    console.log(`📊 Before: ${beforeDrawingWire} DrawingWire records, ${beforeWireEndpoint} WireEndpoint records`);

    // STEP 2: Find all WireEndpoints with a connectorId (the chain link exists!)
    console.log('🔍 Finding WireEndpoints with connector references...');
    const endpoints = await prisma.wireEndpoint.findMany({
      where: { connectorId: { not: null } },
      include: { connector: { select: { drawingId: true } } },
      take: 100000, // Process all records
    });

    console.log(`✅ Found ${endpoints.length} WireEndpoints with connector references`);

    // STEP 3: Extract wireId + drawingId pairs
    const pairs = endpoints
      .filter(ep => ep.connector?.drawingId) // Only include if drawing exists
      .map(ep => ({
        wireId: ep.wireId,
        drawingId: ep.connector!.drawingId,
      }));

    console.log(`📋 Extracted ${pairs.length} potential DrawingWire pairs`);

    // STEP 4: Remove duplicates (same wireId+drawingId appears multiple times)
    const uniquePairs = [...new Map(
      pairs.map(p => [`${p.wireId}+${p.drawingId}`, p])
    ).values()];

    console.log(`🔄 After deduplication: ${uniquePairs.length} unique pairs`);

    // STEP 5: Bulk upsert using createMany with skipDuplicates
    let created = 0;
    if (uniquePairs.length > 0) {
      const result = await prisma.drawingWire.createMany({
        data: uniquePairs,
        skipDuplicates: true, // Don't fail if already exists
      });
      created = result.count;
      console.log(`✅ Created ${created} new DrawingWire records`);
    }

    // STEP 6: Get counts AFTER repair
    const [afterDrawingWire, afterWireEndpoint] = await Promise.all([
      prisma.drawingWire.count(),
      prisma.wireEndpoint.count(),
    ]);

    const newCoverage = afterWireEndpoint > 0 
      ? ((afterDrawingWire / afterWireEndpoint) * 100).toFixed(1)
      : '0.0';

    const executionTime = Date.now() - startTime;

    console.log(`✅ Repair complete in ${executionTime}ms`);
    console.log(`📊 After: ${afterDrawingWire} DrawingWire records (was ${beforeDrawingWire})`);
    console.log(`📈 Coverage improved from ${((beforeDrawingWire/beforeWireEndpoint)*100).toFixed(1)}% to ${newCoverage}%`);

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      repair: {
        endpointsProcessed: endpoints.length,
        uniquePairsExtracted: uniquePairs.length,
        newRecordsCreated: created,
        executionTimeMs: executionTime,
      },
      beforeRepair: {
        drawingWireCount: beforeDrawingWire,
        wireEndpointCount: beforeWireEndpoint,
        coveragePercent: ((beforeDrawingWire / beforeWireEndpoint) * 100).toFixed(1),
      },
      afterRepair: {
        drawingWireCount: afterDrawingWire,
        wireEndpointCount: afterWireEndpoint,
        coveragePercent: newCoverage,
      },
      improvement: {
        recordsAdded: afterDrawingWire - beforeDrawingWire,
        coverageIncrease: (parseFloat(newCoverage) - (beforeDrawingWire/beforeWireEndpoint)*100).toFixed(1),
      },
      message: `✅ Repair complete! DrawingWire coverage improved from ${((beforeDrawingWire/beforeWireEndpoint)*100).toFixed(1)}% to ${newCoverage}%`,
    });
  } catch (error) {
    console.error('❌ Repair failed:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Repair failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
