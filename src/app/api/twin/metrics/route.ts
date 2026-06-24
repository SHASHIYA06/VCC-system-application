/**
 * DIGITAL TWIN — ENGINEERING ACCURACY METRICS API
 *
 * GET /api/twin/metrics
 *
 * Computes real coverage percentages for the Engineering Accuracy Dashboard.
 * Returns a flat object the dashboard reads directly (data.data.*).
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10; // 1 decimal place
}

export async function GET() {
  try {
    const [
      totalWires,
      verifiedWires,
      deprecatedWires,
      wiresWithEndpoints,
      totalConnectors,
      connectorsWithPins,
      totalPins,
      pinsWithWire,
      totalDevices,
      devicesWithSystem,
      totalSystems,
      systemsWithDrawings,
      totalDrawings,
      drawingsWithSystem,
      drawingsWithRevisions,
    ] = await Promise.all([
      prisma.wire.count(),
      // Verified wires (raw SQL because wireStatus column is varchar enum)
      prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*)::int AS count FROM "Wire" WHERE "wireStatus" = 'VERIFIED'`,
      prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*)::int AS count FROM "Wire" WHERE "wireStatus" = 'DEPRECATED'`,
      prisma.wire.count({ where: { endpoints: { some: {} } } }),
      prisma.connector.count(),
      prisma.connector.count({ where: { pins: { some: {} } } }),
      prisma.connectorPin.count(),
      prisma.connectorPin.count({ where: { wireNo: { not: null } } }),
      prisma.device.count(),
      prisma.device.count({ where: { systemId: { not: null } } }),
      prisma.system.count(),
      prisma.system.count({ where: { drawings: { some: {} } } }),
      prisma.drawing.count(),
      prisma.drawing.count({ where: { systemId: { not: null } } }),
      prisma.drawing.count({ where: { revisions: { some: {} } } }).catch(() => 0),
    ]);

    const verifiedWireCount = Number(verifiedWires[0]?.count ?? 0);
    const deprecatedWireCount = Number(deprecatedWires[0]?.count ?? 0);

    // Coverage metrics
    const drawingCoverage = pct(drawingsWithSystem, totalDrawings);
    const connectorCoverage = pct(connectorsWithPins, totalConnectors);
    const pinCoverage = pct(pinsWithWire, totalPins);
    // Wire coverage = wires that are traceable (have endpoints) of non-deprecated
    const activeWires = totalWires - deprecatedWireCount;
    const wireCoverage = pct(wiresWithEndpoints, activeWires);
    const systemCoverage = pct(systemsWithDrawings, totalSystems);
    const revisionCoverage = pct(drawingsWithRevisions, totalDrawings);

    // Synthetic data remaining = deprecated wires as % of total
    const syntheticDataRemaining = pct(deprecatedWireCount, totalWires);

    // Overall validation score — weighted average of key coverages
    const validationScore = Math.round(
      (drawingCoverage * 0.2 +
        connectorCoverage * 0.2 +
        pinCoverage * 0.15 +
        wireCoverage * 0.2 +
        systemCoverage * 0.25) * 10
    ) / 10;

    return NextResponse.json({
      success: true,
      data: {
        drawingCoverage,
        connectorCoverage,
        pinCoverage,
        wireCoverage,
        systemCoverage,
        revisionCoverage,
        validationScore,
        syntheticDataRemaining,
        verifiedWires: verifiedWireCount,
        totalWires,
        verifiedConnectors: connectorsWithPins,
        totalConnectors,
        verifiedDevices: devicesWithSystem,
        totalDevices,
        // Extra detail
        totalSystems,
        systemsWithDrawings,
        totalDrawings,
        totalPins,
        wiresWithEndpoints,
        deprecatedWires: deprecatedWireCount,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Twin metrics error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
