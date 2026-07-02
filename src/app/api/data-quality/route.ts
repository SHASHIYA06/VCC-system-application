import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Data Quality API — Shows coverage metrics for the VCC database.
 * Used by dashboard to display real data health status.
 */
export async function GET() {
  try {
    const [
      totalSystems, totalDrawings, totalConnectors, totalPins,
      totalWires, totalWireEndpoints, totalDrawingWires,
      totalCircuits, totalCircuitEndpoints,
      totalTrainlines, totalVCCDescs,
      pinsWithWire, connectorsWithPins,
      validatedIssues, unresolvedIssues,
      wireVerified, wireUnverified, wireDeprecated,
    ] = await Promise.all([
      prisma.system.count(),
      prisma.drawing.count(),
      prisma.connector.count(),
      prisma.connectorPin.count(),
      prisma.wire.count(),
      prisma.wireEndpoint.count(),
      prisma.drawingWire.count(),
      prisma.circuit.count(),
      prisma.circuitEndpoint.count(),
      prisma.trainLine.count(),
      prisma.vCCDescription.count(),
      prisma.connectorPin.count({ where: { wireNo: { not: null } } }),
      prisma.connector.count({ where: { pins: { some: {} } } }),
      prisma.validationIssue.count(),
      prisma.validationIssue.count({ where: { resolved: false } }),
      prisma.$queryRaw`SELECT COUNT(*)::int as count FROM "Wire" WHERE "wireStatus" = 'VERIFIED'`.then((r: any) => r[0]?.count ?? 0),
      prisma.$queryRaw`SELECT COUNT(*)::int as count FROM "Wire" WHERE "wireStatus" = 'UNVERIFIED'`.then((r: any) => r[0]?.count ?? 0),
      prisma.$queryRaw`SELECT COUNT(*)::int as count FROM "Wire" WHERE "wireStatus" = 'DEPRECATED'`.then((r: any) => r[0]?.count ?? 0),
    ]);

    return NextResponse.json({
      status: 'success',
      data: {
        entities: {
          systems: totalSystems,
          drawings: totalDrawings,
          connectors: totalConnectors,
          pins: totalPins,
          wires: totalWires,
          wireEndpoints: totalWireEndpoints,
          drawingWires: totalDrawingWires,
          circuits: totalCircuits,
          circuitEndpoints: totalCircuitEndpoints,
          trainlines: totalTrainlines,
          vccDescriptions: totalVCCDescs,
        },
        coverage: {
          wireToDrawing: { linked: totalDrawingWires, total: totalWires, percent: totalWires > 0 ? ((totalDrawingWires / totalWires) * 100).toFixed(1) : '0' },
          wireToEndpoints: { linked: totalWireEndpoints, total: totalWires, percent: totalWires > 0 ? ((totalWireEndpoints / totalWires) * 100).toFixed(1) : '0' },
          pinsWithWire: { linked: pinsWithWire, total: totalPins, percent: totalPins > 0 ? ((pinsWithWire / totalPins) * 100).toFixed(1) : '0' },
          connectorsWithPins: { linked: connectorsWithPins, total: totalConnectors, percent: totalConnectors > 0 ? ((connectorsWithPins / totalConnectors) * 100).toFixed(1) : '0' },
          vccDescriptions: { linked: totalVCCDescs, total: totalSystems, percent: totalSystems > 0 ? ((totalVCCDescs / totalSystems) * 100).toFixed(1) : '0' },
          circuitEndpoints: { linked: totalCircuitEndpoints, total: totalCircuits, percent: totalCircuits > 0 ? ((totalCircuitEndpoints / totalCircuits) * 100).toFixed(1) : '0' },
        },
        wireStatus: {
          verified: wireVerified,
          unverified: wireUnverified,
          deprecated: wireDeprecated,
        },
        dataQuality: {
          totalIssues: validatedIssues,
          unresolvedIssues,
          resolvedIssues: validatedIssues - unresolvedIssues,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
