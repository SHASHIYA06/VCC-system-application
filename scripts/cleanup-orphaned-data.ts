#!/usr/bin/env node

/**
 * PHASE 1: Cleanup Orphaned Data
 * Removes orphaned connectors, fixes incomplete wire connections
 * Generates comprehensive validation report
 */

import { prisma } from '@/lib/prisma';

interface CleanupStats {
  orphanedConnectors: number;
  orphanedPins: number;
  incompleteWires: number;
  wireEndpointsWithoutWire: number;
  connectorsWithoutDrawing: number;
  fixed: number;
  errors: number;
}

async function findOrphanedConnectors(): Promise<{
  count: number;
  connectorIds: string[];
}> {
  console.log(`\n🔍 Finding orphaned connectors (without pins)...`);

  // Since drawingId is required, we can't have truly orphaned connectors
  // But we can find ones without pins
  const orphaned = await prisma.connector.findMany({
    where: {
      pins: {
        none: {},
      },
    },
    select: { id: true, connectorCode: true },
  });

  console.log(`   Found ${orphaned.length} connector(s) without pins`);

  return {
    count: orphaned.length,
    connectorIds: orphaned.map((c) => c.id),
  };
}

async function findOrphanedPins(): Promise<{
  count: number;
  pinIds: string[];
}> {
  console.log(`\n🔍 Finding incomplete pins (without wire numbers)...`);

  // Since connectorId is required, find pins without wireNo
  const orphaned = await prisma.connectorPin.findMany({
    where: {
      wireNo: null,
    },
    select: { id: true, pinNo: true },
  });

  console.log(`   Found ${orphaned.length} pin(s) without wire assignment`);

  return {
    count: orphaned.length,
    pinIds: orphaned.map((p) => p.id),
  };
}

async function findIncompleteWires(): Promise<{
  count: number;
  wireIds: string[];
  details: Array<{
    wireNo: string;
    endpointCount: number;
  }>;
}> {
  console.log(`\n🔍 Finding incomplete wires (less than 2 endpoints)...`);

  const wires = await prisma.wire.findMany({
    include: { endpoints: { select: { id: true } } },
  });

  const incomplete = wires.filter((w) => w.endpoints.length < 2);

  console.log(`   Found ${incomplete.length} incomplete wire(s)`);

  return {
    count: incomplete.length,
    wireIds: incomplete.map((w) => w.id),
    details: incomplete.map((w) => ({
      wireNo: w.wireNo,
      endpointCount: w.endpoints.length,
    })),
  };
}

async function findWireEndpointsWithoutWire(): Promise<{
  count: number;
  endpointIds: string[];
}> {
  console.log(`\n🔍 Finding wire endpoints without complete connections...`);

  // Since wire is required, check for incomplete endpoints instead
  const orphaned = await prisma.wireEndpoint.findMany({
    where: {
      AND: [
        {
          OR: [
            { deviceId: null },
            { connectorId: null },
          ],
        },
      ],
    },
    select: { id: true },
  });

  console.log(`   Found ${orphaned.length} incomplete endpoint(s)`);

  return {
    count: orphaned.length,
    endpointIds: orphaned.map((e) => e.id),
  };
}

async function cleanupOrphanedConnectors(
  connectorIds: string[]
): Promise<number> {
  if (connectorIds.length === 0) {
    console.log(`   ✅ No orphaned connectors to clean`);
    return 0;
  }

  console.log(`\n🧹 Removing ${connectorIds.length} orphaned connector(s)...`);

  const result = await prisma.connector.deleteMany({
    where: { id: { in: connectorIds } },
  });

  console.log(`   ✅ Removed ${result.count} connector(s)`);

  return result.count;
}

async function cleanupOrphanedPins(pinIds: string[]): Promise<number> {
  if (pinIds.length === 0) {
    console.log(`   ✅ No orphaned pins to clean`);
    return 0;
  }

  console.log(`\n🧹 Removing ${pinIds.length} orphaned pin(s)...`);

  const result = await prisma.connectorPin.deleteMany({
    where: { id: { in: pinIds } },
  });

  console.log(`   ✅ Removed ${result.count} pin(s)`);

  return result.count;
}

async function cleanupIncompleteWires(wireIds: string[]): Promise<number> {
  if (wireIds.length === 0) {
    console.log(`   ✅ No incomplete wires to clean`);
    return 0;
  }

  console.log(
    `\n🧹 Marking ${wireIds.length} incomplete wire(s) for review...`
  );

  // Don't delete wires, but flag them for manual review
  for (const wireId of wireIds) {
    await prisma.validationIssue.create({
      data: {
        severity: 'WARNING',
        issueType: 'INCOMPLETE_WIRE',
        sourceTable: 'Wire',
        sourceId: wireId,
        message: 'Wire has less than 2 endpoints',
        details: { reviewed: false },
      },
    });
  }

  console.log(`   ✅ Created ${wireIds.length} validation issue(s)`);

  return wireIds.length;
}

async function cleanupWireEndpoints(endpointIds: string[]): Promise<number> {
  if (endpointIds.length === 0) {
    console.log(`   ✅ No orphaned endpoints to clean`);
    return 0;
  }

  console.log(`\n🧹 Removing ${endpointIds.length} orphaned endpoint(s)...`);

  const result = await prisma.wireEndpoint.deleteMany({
    where: { id: { in: endpointIds } },
  });

  console.log(`   ✅ Removed ${result.count} endpoint(s)`);

  return result.count;
}

async function generateDetailedReport(): Promise<void> {
  console.log(`\n📊 Generating detailed validation report...`);

  const stats = {
    totalDrawings: await prisma.drawing.count(),
    totalConnectors: await prisma.connector.count(),
    totalPins: await prisma.connectorPin.count(),
    totalWires: await prisma.wire.count(),
    totalDevices: await prisma.device.count(),
    totalSystems: await prisma.system.count(),
    totalTrainlines: await prisma.trainLine.count(),
    validationIssues: await prisma.validationIssue.count(),
    unresolved: await prisma.validationIssue.count({ where: { resolved: false } }),
  };

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║ DATABASE VALIDATION REPORT                                     ║
╠════════════════════════════════════════════════════════════════╣
║ Entity Counts:                                                  ║
║   Drawings:                ${String(stats.totalDrawings).padEnd(45)} │
║   Connectors:              ${String(stats.totalConnectors).padEnd(45)} │
║   Connector Pins:          ${String(stats.totalPins).padEnd(45)} │
║   Wires:                   ${String(stats.totalWires).padEnd(45)} │
║   Devices/Equipment:       ${String(stats.totalDevices).padEnd(45)} │
║   Systems:                 ${String(stats.totalSystems).padEnd(45)} │
║   Trainlines:              ${String(stats.totalTrainlines).padEnd(45)} │
║                                                                ║
║ Data Quality:                                                   ║
║   Validation Issues:       ${String(stats.validationIssues).padEnd(45)} │
║   Unresolved Issues:       ${String(stats.unresolved).padEnd(45)} │
╚════════════════════════════════════════════════════════════════╝
`);

  // Find issues by type
  const issuesByType = await prisma.validationIssue.findMany({
    where: { resolved: false },
    select: { issueType: true },
  });

  const grouped = issuesByType.reduce(
    (acc, issue) => {
      acc[issue.issueType] = (acc[issue.issueType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  if (Object.keys(grouped).length > 0) {
    console.log(`\n📋 Issues by Type:`);
    for (const [type, count] of Object.entries(grouped)) {
      console.log(`   - ${type}: ${count}`);
    }
  }

  // Connection statistics
  const wiresWithEndpoints = await prisma.wire.findMany({
    select: { wireNo: true, endpoints: { select: { id: true } } },
    where: { endpoints: { some: {} } },
  });

  console.log(`\n📡 Wire Connectivity:`);
  console.log(`   Wires with connections: ${wiresWithEndpoints.length} / ${stats.totalWires}`);
  console.log(
    `   Coverage: ${((wiresWithEndpoints.length / stats.totalWires) * 100).toFixed(1)}%`
  );
}

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║ PHASE 1: CLEANUP ORPHANED DATA & VALIDATE DATABASE             ║
║ Removing incomplete data and generating validation report      ║
╚════════════════════════════════════════════════════════════════╝
`);

  try {
    const stats: CleanupStats = {
      orphanedConnectors: 0,
      orphanedPins: 0,
      incompleteWires: 0,
      wireEndpointsWithoutWire: 0,
      connectorsWithoutDrawing: 0,
      fixed: 0,
      errors: 0,
    };

    // Find issues
    console.log(`\n🔍 SCANNING FOR DATA ISSUES...`);

    const orphanedConnResult = await findOrphanedConnectors();
    const orphanedPinsResult = await findOrphanedPins();
    const incompleteWiresResult = await findIncompleteWires();
    const orphanedEndpointsResult = await findWireEndpointsWithoutWire();

    stats.orphanedConnectors = orphanedConnResult.count;
    stats.orphanedPins = orphanedPinsResult.count;
    stats.incompleteWires = incompleteWiresResult.count;
    stats.wireEndpointsWithoutWire = orphanedEndpointsResult.count;

    // Cleanup issues
    console.log(`\n🧹 CLEANING UP DATA ISSUES...`);

    const cleanedConnectors = await cleanupOrphanedConnectors(
      orphanedConnResult.connectorIds
    );
    const cleanedPins = await cleanupOrphanedPins(orphanedPinsResult.pinIds);
    const cleanedWires = await cleanupIncompleteWires(
      incompleteWiresResult.wireIds
    );
    const cleanedEndpoints = await cleanupWireEndpoints(
      orphanedEndpointsResult.endpointIds
    );

    stats.fixed = cleanedConnectors + cleanedPins + cleanedWires + cleanedEndpoints;

    // Generate report
    await generateDetailedReport();

    console.log(`
✅ CLEANUP COMPLETE
═══════════════════════════════════════════════════════════════
   Orphaned Connectors Removed:    ${cleanedConnectors}
   Orphaned Pins Removed:          ${cleanedPins}
   Incomplete Wires Flagged:       ${cleanedWires}
   Orphaned Endpoints Removed:     ${cleanedEndpoints}
   ─────────────────────────────────────────────────
   Total Cleaned:                  ${stats.fixed}
═══════════════════════════════════════════════════════════════

✅ PHASE 1 CLEANUP COMPLETE
`);

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ CLEANUP FAILED:`, error);
    process.exit(1);
  }
}

main();
