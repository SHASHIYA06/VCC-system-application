import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * MASTER AUDIT: Complete database health check
 * Returns all critical metrics needed to understand if the platform is working
 */

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('🏥 Running Master Database Audit...');

    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    // Get all critical counts in parallel
    const [
      wireCount,
      wireEndpointCount,
      connectorPinCount,
      connectorCount,
      deviceCount,
      drawingCount,
      drawingWireCount,
      drawingPageMappingCount,
      trainLineCount,
      systemCount,
      formationCount,
      carCount,
      vccDescriptionCount,
      validationIssueCount,
      validationIssueResolvedCount,
    ] = await Promise.all([
      prisma.wire.count(),
      prisma.wireEndpoint.count(),
      prisma.connectorPin.count(),
      prisma.connector.count(),
      prisma.device.count(),
      prisma.drawing.count(),
      prisma.drawingWire.count(),
      prisma.drawingPageMapping.count(),
      prisma.trainLine.count(),
      prisma.system.count(),
      prisma.formation.count(),
      prisma.car.count(),
      prisma.vCCDescription.count(),
      prisma.validationIssue.count(),
      prisma.validationIssue.count({ where: { resolved: true } }),
    ]);

    // Calculate key metrics
    const totalValidationIssues = validationIssueCount;
    const unresolvedValidationIssues = totalValidationIssues - validationIssueResolvedCount;
    const validationResolutionPercent = totalValidationIssues > 0 
      ? ((validationIssueResolvedCount / totalValidationIssues) * 100).toFixed(1)
      : '0.0';

    const drawingWireCoverage = wireEndpointCount > 0 
      ? ((drawingWireCount / wireEndpointCount) * 100).toFixed(1)
      : '0.0';

    const vccDescriptionCoverage = systemCount > 0 
      ? ((vccDescriptionCount / systemCount) * 100).toFixed(1)
      : '0.0';

    // Identify critical gaps
    const criticalGaps = [];
    if (drawingWireCount === 0) criticalGaps.push('❌ CRITICAL: DrawingWire count is 0 - run /api/repair-drawing-wires');
    if (wireEndpointCount === 0) criticalGaps.push('❌ CRITICAL: WireEndpoint count is 0 - data not imported');
    if (unresolvedValidationIssues > 1000) criticalGaps.push(`❌ CRITICAL: ${unresolvedValidationIssues} unresolved validation issues - run /api/validation-audit`);
    if (parseFloat(vccDescriptionCoverage) < 50) criticalGaps.push(`⚠️ WARNING: VCC Description coverage is ${vccDescriptionCoverage}% - run /api/seed-vcc-descriptions`);

    const executionTime = Date.now() - startTime;

    console.log(`✅ Master Audit complete in ${executionTime}ms`);

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      executionTimeMs: executionTime,
      connection: {
        status: 'connected',
        responseTimeMs: executionTime,
      },
      hierarchy: {
        formations: formationCount,
        cars: carCount,
        systems: systemCount,
      },
      engineering_data: {
        wires: wireCount,
        wireEndpoints: wireEndpointCount,
        connectors: connectorCount,
        connectorPins: connectorPinCount,
        devices: deviceCount,
        trainLines: trainLineCount,
        drawings: drawingCount,
        drawingWires: drawingWireCount,
        drawingPageMappings: drawingPageMappingCount,
      },
      vcc_system_coverage: {
        totalSystems: systemCount,
        systemsWithDescription: vccDescriptionCount,
        coveragePercent: vccDescriptionCoverage,
      },
      drawing_wire_coverage: {
        totalWireEndpoints: wireEndpointCount,
        linkedToDrawing: drawingWireCount,
        coveragePercent: drawingWireCoverage,
      },
      data_quality: {
        validationIssuesTotal: totalValidationIssues,
        validationIssuesResolved: validationIssueResolvedCount,
        validationIssuesUnresolved: unresolvedValidationIssues,
        resolutionPercent: validationResolutionPercent,
      },
      repair_status: {
        repair_1_drawing_wires: {
          status: drawingWireCount > 1000 ? '✅ Good' : '⚠️ Needs repair',
          coverage: drawingWireCoverage,
          action: drawingWireCount < 1000 ? 'POST /api/repair-drawing-wires' : 'None needed',
        },
        repair_2_validation_issues: {
          status: unresolvedValidationIssues < 100 ? '✅ Good' : '⚠️ Needs review',
          unresolved: unresolvedValidationIssues,
          action: unresolvedValidationIssues > 100 ? 'GET /api/validation-audit then POST to mass-resolve' : 'None needed',
        },
        repair_3_vcc_descriptions: {
          status: parseFloat(vccDescriptionCoverage) > 50 ? '✅ Good' : '⚠️ Needs seeding',
          coverage: vccDescriptionCoverage,
          action: parseFloat(vccDescriptionCoverage) < 50 ? 'POST /api/seed-vcc-descriptions' : 'None needed',
        },
      },
      critical_gaps: criticalGaps.length > 0 ? criticalGaps : ['✅ No critical gaps detected'],
      health_score: calculateHealthScore(
        drawingWireCount,
        wireEndpointCount,
        unresolvedValidationIssues,
        parseFloat(vccDescriptionCoverage)
      ),
      next_steps: generateNextSteps(
        drawingWireCount,
        wireEndpointCount,
        unresolvedValidationIssues,
        parseFloat(vccDescriptionCoverage)
      ),
    });
  } catch (error) {
    console.error('❌ Master Audit failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: 'Master audit failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

function calculateHealthScore(
  drawingWireCount: number,
  wireEndpointCount: number,
  unresolvedIssues: number,
  vccCoverage: number
): { score: number; rating: string; description: string } {
  let score = 100;

  // DrawingWire coverage (40% weight)
  const drawingWireCoverage = wireEndpointCount > 0 
    ? (drawingWireCount / wireEndpointCount) * 100
    : 0;
  if (drawingWireCoverage < 50) score -= 40;
  else if (drawingWireCoverage < 80) score -= 20;

  // Validation issues (30% weight)
  if (unresolvedIssues > 1000) score -= 30;
  else if (unresolvedIssues > 100) score -= 15;

  // VCC coverage (20% weight)
  if (vccCoverage < 50) score -= 20;
  else if (vccCoverage < 80) score -= 10;

  // Data completeness (10% weight)
  if (drawingWireCount === 0 || wireEndpointCount === 0) score -= 10;

  let rating = '🔴 Critical';
  if (score >= 80) rating = '🟢 Healthy';
  else if (score >= 60) rating = '🟡 Degraded';
  else if (score >= 40) rating = '🟠 Poor';

  const description = score >= 80 
    ? 'Platform is operational and ready for use'
    : score >= 60
    ? 'Platform is working but needs maintenance'
    : score >= 40
    ? 'Platform has significant issues needing repair'
    : 'Platform requires immediate attention before use';

  return { score, rating, description };
}

function generateNextSteps(
  drawingWireCount: number,
  wireEndpointCount: number,
  unresolvedIssues: number,
  vccCoverage: number
): string[] {
  const steps: string[] = [];

  if (drawingWireCount < 1000) {
    steps.push('1. Run: POST /api/repair-drawing-wires (fix DrawingWire gap)');
  }

  if (unresolvedIssues > 100) {
    steps.push('2. Run: GET /api/validation-audit (see issues), then POST to resolve');
  }

  if (vccCoverage < 50) {
    steps.push('3. Run: POST /api/seed-vcc-descriptions (fill missing system descriptions)');
  }

  if (steps.length === 0) {
    steps.push('✅ All repairs complete - platform is ready for production use');
  }

  return steps;
}
