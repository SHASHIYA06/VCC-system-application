/**
 * COMPREHENSIVE DATA INTEGRITY AUDIT
 * Identifies ALL data integrity issues across:
 * 1. Drawing Mappings
 * 2. Wire Data Issues
 * 3. Connector Pin Mappings
 * 4. System Data Completeness
 * 5. Drawing References
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Issue {
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  code: string;
  description: string;
  count: number;
  examples?: string[];
  impact?: string;
  recommendation?: string;
}

const issues: Issue[] = [];

async function auditDrawingMappings(): Promise<void> {
  console.log('\n=== CATEGORY 1: DRAWING MAPPINGS ===\n');

  // 1.1: Drawings with no page mappings
  const drawingsWithoutMapping = await prisma.drawing.count({
    where: { pageMappings: { none: {} } }
  });
  if (drawingsWithoutMapping > 0) {
    const examples = await prisma.drawing.findMany({
      where: { pageMappings: { none: {} } },
      select: { drawingNo: true },
      take: 3
    });
    issues.push({
      category: 'Drawing Mappings',
      severity: 'HIGH',
      code: 'DM-001',
      description: 'Drawings without page mappings',
      count: drawingsWithoutMapping,
      examples: examples.map(e => e.drawingNo),
      impact: 'Cannot locate drawing pages in PDFs; users cannot view document source',
      recommendation: 'Run page mapping synchronization; manually map PDFs to drawings'
    });
  }

  // 1.2: Orphaned page mappings (drawing deleted but mapping remains)
  const orphanedMappings = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM "DrawingPageMapping" dpm
    WHERE NOT EXISTS (SELECT 1 FROM "Drawing" d WHERE d.id = dpm."drawingId")
  ` as Array<{ count: bigint }>;
  
  if (orphanedMappings[0]?.count > 0) {
    issues.push({
      category: 'Drawing Mappings',
      severity: 'MEDIUM',
      code: 'DM-002',
      description: 'Orphaned page mappings (drawing deleted)',
      count: Number(orphanedMappings[0].count),
      impact: 'Database bloat; orphaned records consuming storage',
      recommendation: 'Delete orphaned mappings; implement foreign key constraints'
    });
  }

  // 1.3: Duplicate page mappings for same drawing
  const duplicateMappings = await prisma.$queryRaw`
    SELECT "drawingId", COUNT(*) as dup_count FROM "DrawingPageMapping"
    GROUP BY "drawingId" HAVING COUNT(*) > 1
  ` as Array<{ drawingId: string; dup_count: bigint }>;

  if (duplicateMappings.length > 0) {
    issues.push({
      category: 'Drawing Mappings',
      severity: 'HIGH',
      code: 'DM-003',
      description: 'Duplicate page mappings for same drawing',
      count: duplicateMappings.length,
      examples: duplicateMappings.slice(0, 3).map(d => `${d.drawingId}: ${d.dup_count} copies`),
      impact: 'Ambiguous document references; unclear page routing',
      recommendation: 'Dedup mappings; keep latest verified version'
    });
  }

  // 1.4: Page mappings with zero confidence
  const lowConfidenceMappings = await prisma.drawingPageMapping.count({
    where: { confidence: { lt: 0.3 }, verified: false }
  });
  if (lowConfidenceMappings > 0) {
    issues.push({
      category: 'Drawing Mappings',
      severity: 'MEDIUM',
      code: 'DM-004',
      description: 'Unverified page mappings with low confidence (<0.3)',
      count: lowConfidenceMappings,
      impact: 'May point to wrong drawing pages; incorrect document references',
      recommendation: 'Manual verification; re-run OCR/mapping for low-confidence entries'
    });
  }

  // 1.5: Inconsistent page counts
  const inconsistentPageCounts = await prisma.$queryRaw`
    SELECT d.id, d."drawingNo", COUNT(dp.id) as mapped_pages, d."totalSheets" as declared_pages
    FROM "Drawing" d
    LEFT JOIN "DrawingPage" dp ON dp."drawingId" = d.id
    WHERE COUNT(dp.id) != d."totalSheets" AND d."totalSheets" > 0
    GROUP BY d.id, d."drawingNo", d."totalSheets"
  ` as Array<{ id: string; drawingNo: string; mapped_pages: number; declared_pages: number }>;

  if (inconsistentPageCounts.length > 0) {
    issues.push({
      category: 'Drawing Mappings',
      severity: 'HIGH',
      code: 'DM-005',
      description: 'Drawing page count mismatch (declared vs. actual)',
      count: inconsistentPageCounts.length,
      examples: inconsistentPageCounts.slice(0, 3).map(d => `${d.drawingNo}: declared=${d.declared_pages}, actual=${d.mapped_pages}`),
      impact: 'Missing pages; incomplete drawing records',
      recommendation: 'Recount pages; update totalSheets field'
    });
  }
}

async function auditWireData(): Promise<void> {
  console.log('\n=== CATEGORY 2: WIRE DATA ISSUES ===\n');

  // 2.1: Wires missing source connector
  const wiresMissingSource = await prisma.wire.count({
    where: { OR: [{ sourceConnector: null }, { sourceEquipment: null }] }
  });
  if (wiresMissingSource > 0) {
    const examples = await prisma.wire.findMany({
      where: { OR: [{ sourceConnector: null }, { sourceEquipment: null }] },
      select: { wireNo: true, signalName: true },
      take: 3
    });
    issues.push({
      category: 'Wire Data',
      severity: 'CRITICAL',
      code: 'WD-001',
      description: 'Wires missing source connector or equipment',
      count: wiresMissingSource,
      examples: examples.map(w => `${w.wireNo}: ${w.signalName || 'unnamed'}`),
      impact: 'Cannot trace wire source; breaks wire tracing journey',
      recommendation: 'Extract source from drawings; link to connector/device'
    });
  }

  // 2.2: Wires missing destination connector
  const wiresMissingDest = await prisma.wire.count({
    where: { OR: [{ destConnector: null }, { destEquipment: null }] }
  });
  if (wiresMissingDest > 0) {
    const examples = await prisma.wire.findMany({
      where: { OR: [{ destConnector: null }, { destEquipment: null }] },
      select: { wireNo: true, signalName: true },
      take: 3
    });
    issues.push({
      category: 'Wire Data',
      severity: 'CRITICAL',
      code: 'WD-002',
      description: 'Wires missing destination connector or equipment',
      count: wiresMissingDest,
      examples: examples.map(w => `${w.wireNo}: ${w.signalName || 'unnamed'}`),
      impact: 'Incomplete wire trace; destination unknown',
      recommendation: 'Extract destination from drawings; link to connector/device'
    });
  }

  // 2.3: Wires with missing pin assignments
  const wireEndpointCount = await prisma.wireEndpoint.count();
  const wireCount = await prisma.wire.count();
  const wires_per_endpoint = wireCount > 0 ? wireEndpointCount / wireCount : 0;
  
  if (wires_per_endpoint < 1.5) {
    // Should have at least source + dest (2 endpoints per wire minimum)
    issues.push({
      category: 'Wire Data',
      severity: 'HIGH',
      code: 'WD-003',
      description: 'Incomplete wire pin assignments (ratio < 2 endpoints/wire)',
      count: wireCount - Math.floor(wireEndpointCount / 2),
      impact: 'Wires not fully routed; missing connections',
      recommendation: 'Link wire endpoints to pins; extract from drawings'
    });
  }

  // 2.4: Unverified wires count
  const unverifiedWires = await prisma.wire.count({
    where: { wireStatus: 'UNVERIFIED' }
  });
  if (unverifiedWires > 0) {
    issues.push({
      category: 'Wire Data',
      severity: 'MEDIUM',
      code: 'WD-004',
      description: 'Unverified wires (not confirmed in drawings)',
      count: unverifiedWires,
      impact: 'Cannot guarantee wire accuracy; may be synthetic/placeholder data',
      recommendation: 'Run verification batch; trace each wire to drawing'
    });
  }

  // 2.5: Deprecated wires still in use
  const deprecatedWiresInUse = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT w.id) as count FROM "Wire" w
    WHERE w."wireStatus" = 'DEPRECATED'
    AND EXISTS (SELECT 1 FROM "WireEndpoint" we WHERE we."wireId" = w.id)
  ` as Array<{ count: bigint }>;

  if (Number(deprecatedWiresInUse[0]?.count || 0) > 0) {
    issues.push({
      category: 'Wire Data',
      severity: 'HIGH',
      code: 'WD-005',
      description: 'Deprecated wires still linked to active endpoints',
      count: Number(deprecatedWiresInUse[0].count),
      impact: 'Legacy data mixed with current data; confusing wire topology',
      recommendation: 'Unlink deprecated wires; replace with current versions'
    });
  }

  // 2.6: Wires without signal names
  const wiresNoSignal = await prisma.wire.count({
    where: { signalName: null }
  });
  if (wiresNoSignal > 0) {
    issues.push({
      category: 'Wire Data',
      severity: 'MEDIUM',
      code: 'WD-006',
      description: 'Wires without signal names',
      count: wiresNoSignal,
      impact: 'Cannot identify function of wire; naming convention violated',
      recommendation: 'Extract signal names from connector pin data or drawings'
    });
  }
}

async function auditConnectorPins(): Promise<void> {
  console.log('\n=== CATEGORY 3: CONNECTOR PIN MAPPINGS ===\n');

  // 3.1: Pins without wire assignments
  const pinsNoWire = await prisma.connectorPin.count({
    where: { wireNo: null }
  });
  if (pinsNoWire > 0) {
    const percentage = (pinsNoWire / (await prisma.connectorPin.count())) * 100;
    issues.push({
      category: 'Connector Pins',
      severity: 'HIGH',
      code: 'CP-001',
      description: 'Connector pins without wire assignments',
      count: pinsNoWire,
      impact: `${percentage.toFixed(1)}% of pins not linked to wires; incomplete connection map`,
      recommendation: 'Link pins to wires; extract from drawing annotations'
    });
  }

  // 3.2: Orphaned pins (connector deleted but pins remain)
  const orphanedPins = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM "ConnectorPin" cp
    WHERE NOT EXISTS (SELECT 1 FROM "Connector" c WHERE c.id = cp."connectorId")
  ` as Array<{ count: bigint }>;

  if (Number(orphanedPins[0]?.count || 0) > 0) {
    issues.push({
      category: 'Connector Pins',
      severity: 'MEDIUM',
      code: 'CP-002',
      description: 'Orphaned pins (connector deleted)',
      count: Number(orphanedPins[0].count),
      impact: 'Database bloat; orphaned records',
      recommendation: 'Delete orphaned pins; ensure referential integrity'
    });
  }

  // 3.3: Pins with wrong voltage/current ratings (inconsistent)
  const pinsWithMissingVoltage = await prisma.connectorPin.count({
    where: { voltageText: null }
  });
  if (pinsWithMissingVoltage > 0) {
    issues.push({
      category: 'Connector Pins',
      severity: 'MEDIUM',
      code: 'CP-003',
      description: 'Connector pins missing voltage/current ratings',
      count: pinsWithMissingVoltage,
      impact: 'Cannot verify pin compatibility; risk of misconnection',
      recommendation: 'Extract ratings from drawing specifications'
    });
  }

  // 3.4: Pins missing descriptions/labels
  const pinsNoLabel = await prisma.connectorPin.count({
    where: { pinLabel: null }
  });
  if (pinsNoLabel > 0) {
    const percentage = (pinsNoLabel / (await prisma.connectorPin.count())) * 100;
    issues.push({
      category: 'Connector Pins',
      severity: 'LOW',
      code: 'CP-004',
      description: 'Connector pins without labels/descriptions',
      count: pinsNoLabel,
      impact: `${percentage.toFixed(1)}% of pins lack descriptive labels`,
      recommendation: 'Add pin labels from drawing documentation'
    });
  }

  // 3.5: Duplicate pin numbers in same connector
  const duplicatePins = await prisma.$queryRaw`
    SELECT c.id, c."connectorCode", COUNT(*) as pin_count
    FROM "ConnectorPin" cp
    JOIN "Connector" c ON c.id = cp."connectorId"
    GROUP BY c.id, cp."pinNo"
    HAVING COUNT(*) > 1
  ` as Array<{ id: string; connectorCode: string; pin_count: bigint }>;

  if (duplicatePins.length > 0) {
    issues.push({
      category: 'Connector Pins',
      severity: 'CRITICAL',
      code: 'CP-005',
      description: 'Duplicate pin numbers within same connector',
      count: duplicatePins.length,
      examples: duplicatePins.slice(0, 3).map(p => `${p.connectorCode}: ${p.pin_count} duplicates`),
      impact: 'Ambiguous pin identification; breaks pin mapping',
      recommendation: 'Dedup pins; remove incorrect duplicates'
    });
  }
}

async function auditSystemData(): Promise<void> {
  console.log('\n=== CATEGORY 4: SYSTEM DATA COMPLETENESS ===\n');

  // 4.1: Systems without descriptions
  const systemsNoDesc = await prisma.system.count({
    where: { description: null }
  });
  if (systemsNoDesc > 0) {
    issues.push({
      category: 'System Data',
      severity: 'LOW',
      code: 'SD-001',
      description: 'Systems missing descriptions',
      count: systemsNoDesc,
      impact: 'Users cannot understand system purpose from metadata',
      recommendation: 'Add system descriptions from VCC documentation'
    });
  }

  // 4.2: Systems without VCC descriptions
  const systemsNoVccDesc = await prisma.system.count({
    where: { vccDescription: null }
  });
  if (systemsNoVccDesc > 0) {
    issues.push({
      category: 'System Data',
      severity: 'MEDIUM',
      code: 'SD-002',
      description: 'Systems without VCC detailed descriptions',
      count: systemsNoVccDesc,
      impact: 'Cannot provide system learning/troubleshooting content',
      recommendation: 'Create VCC descriptions for each system'
    });
  }

  // 4.3: Devices not linked to systems
  const devicesNoSystem = await prisma.device.count({
    where: { systemId: null }
  });
  if (devicesNoSystem > 0) {
    issues.push({
      category: 'System Data',
      severity: 'HIGH',
      code: 'SD-003',
      description: 'Devices not linked to any system',
      count: devicesNoSystem,
      impact: 'Cannot navigate device → system; breaks system hierarchy',
      recommendation: 'Link devices to systems based on drawing context'
    });
  }

  // 4.4: Missing device specifications
  const devicesNoSpec = await prisma.device.count({
    where: { specifications: { none: {} } }
  });
  if (devicesNoSpec > 0) {
    const percentage = (devicesNoSpec / (await prisma.device.count())) * 100;
    issues.push({
      category: 'System Data',
      severity: 'MEDIUM',
      code: 'SD-004',
      description: 'Devices missing specifications',
      count: devicesNoSpec,
      impact: `${percentage.toFixed(1)}% of devices lack technical specs`,
      recommendation: 'Extract specifications from equipment datasheets'
    });
  }

  // 4.5: Unverified devices
  const unverifiedDevices = await prisma.device.count({
    where: { isVerified: false }
  });
  if (unverifiedDevices > 0) {
    issues.push({
      category: 'System Data',
      severity: 'MEDIUM',
      code: 'SD-005',
      description: 'Devices not verified against drawings',
      count: unverifiedDevices,
      impact: 'Device list may contain duplicates or inaccuracies',
      recommendation: 'Verify each device against original drawings'
    });
  }
}

async function auditDrawingReferences(): Promise<void> {
  console.log('\n=== CATEGORY 5: DRAWING REFERENCES ===\n');

  // 5.1: Broken drawing references (reference doesn't exist)
  const brokenReferences = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM "DrawingReference" dr
    WHERE NOT EXISTS (SELECT 1 FROM "ReferenceDrawing" rd WHERE rd.id = dr."referenceId")
  ` as Array<{ count: bigint }>;

  if (Number(brokenReferences[0]?.count || 0) > 0) {
    issues.push({
      category: 'Drawing References',
      severity: 'HIGH',
      code: 'DR-001',
      description: 'Broken drawing references (missing target)',
      count: Number(brokenReferences[0].count),
      impact: 'Cannot navigate drawing relationships; broken links',
      recommendation: 'Delete orphaned references; rebuild reference map'
    });
  }

  // 5.2: Circular references (A → B → A)
  const circularReferences = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT r1."drawingId") as count 
    FROM "DrawingReference" r1
    JOIN "DrawingReference" r2 ON r1."referenceId" = r2."referenceId"
    WHERE r1."drawingId" != r2."drawingId"
    AND EXISTS (
      SELECT 1 FROM "DrawingReference" r3 
      WHERE r3."drawingId" = r2."drawingId" 
      AND r3."referenceId" = r1."drawingId"
    )
  ` as Array<{ count: bigint }>;

  if (Number(circularReferences[0]?.count || 0) > 0) {
    issues.push({
      category: 'Drawing References',
      severity: 'MEDIUM',
      code: 'DR-002',
      description: 'Circular drawing references detected',
      count: Number(circularReferences[0].count),
      impact: 'Infinite loops in reference traversal',
      recommendation: 'Review and break circular reference chains'
    });
  }

  // 5.3: Missing drawing revision information
  const drawingsNoRevision = await prisma.drawing.count({
    where: { revisions: { none: {} } }
  });
  if (drawingsNoRevision > 0) {
    issues.push({
      category: 'Drawing References',
      severity: 'MEDIUM',
      code: 'DR-003',
      description: 'Drawings without revision history',
      count: drawingsNoRevision,
      impact: 'Cannot track drawing evolution; unclear which version is current',
      recommendation: 'Create revision records for each drawing'
    });
  }

  // 5.4: Inconsistent drawing status
  const activeDrawingCount = await prisma.drawing.count({
    where: { status: 'ACTIVE' }
  });
  const deprecatedDrawingCount = await prisma.drawing.count({
    where: { status: 'DEPRECATED' }
  });

  if (deprecatedDrawingCount > activeDrawingCount) {
    issues.push({
      category: 'Drawing References',
      severity: 'LOW',
      code: 'DR-004',
      description: 'More deprecated drawings than active',
      count: deprecatedDrawingCount - activeDrawingCount,
      impact: 'Unusual ratio; may indicate data cleanup needed',
      recommendation: 'Review and archive deprecated drawings'
    });
  }

  // 5.5: Missing drawing cross-references
  const drawingsWithoutCrossRef = await prisma.drawing.count({
    where: { crossConnections: { none: {} }, circuits: { none: {} } }
  });
  if (drawingsWithoutCrossRef > 0) {
    const percentage = (drawingsWithoutCrossRef / (await prisma.drawing.count())) * 100;
    issues.push({
      category: 'Drawing References',
      severity: 'LOW',
      code: 'DR-005',
      description: 'Drawings without cross-connections or circuits',
      count: drawingsWithoutCrossRef,
      impact: `${percentage.toFixed(1)}% of drawings lack connection data`,
      recommendation: 'Extract cross-connection info from drawings'
    });
  }
}

async function generateReport(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  VCC SYSTEM - COMPREHENSIVE DATA INTEGRITY AUDIT REPORT         ║');
  console.log('║  Generated: ' + new Date().toISOString().slice(0, 19) + '                         ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  await auditDrawingMappings();
  await auditWireData();
  await auditConnectorPins();
  await auditSystemData();
  await auditDrawingReferences();

  // Summary by severity
  const bySeverity = {
    CRITICAL: issues.filter(i => i.severity === 'CRITICAL'),
    HIGH: issues.filter(i => i.severity === 'HIGH'),
    MEDIUM: issues.filter(i => i.severity === 'MEDIUM'),
    LOW: issues.filter(i => i.severity === 'LOW')
  };

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  SUMMARY BY SEVERITY                                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`\n🔴 CRITICAL (${bySeverity.CRITICAL.length}): ${bySeverity.CRITICAL.reduce((sum, i) => sum + i.count, 0).toLocaleString()} issues`);
  console.log(`🟠 HIGH (${bySeverity.HIGH.length}): ${bySeverity.HIGH.reduce((sum, i) => sum + i.count, 0).toLocaleString()} issues`);
  console.log(`🟡 MEDIUM (${bySeverity.MEDIUM.length}): ${bySeverity.MEDIUM.reduce((sum, i) => sum + i.count, 0).toLocaleString()} issues`);
  console.log(`🟢 LOW (${bySeverity.LOW.length}): ${bySeverity.LOW.reduce((sum, i) => sum + i.count, 0).toLocaleString()} issues`);

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  ALL ISSUES (Prioritized by Severity)                           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  for (const severity of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const) {
    const severityIssues = bySeverity[severity];
    if (severityIssues.length === 0) continue;

    console.log(`\n${'═'.repeat(70)}`);
    console.log(`${severity} SEVERITY (${severityIssues.length} issues)`);
    console.log(`${'═'.repeat(70)}\n`);

    for (const issue of severityIssues) {
      console.log(`[${issue.code}] ${issue.description}`);
      console.log(`  Category: ${issue.category}`);
      console.log(`  Count: ${issue.count.toLocaleString()}`);
      if (issue.examples) console.log(`  Examples: ${issue.examples.join('; ')}`);
      if (issue.impact) console.log(`  Impact: ${issue.impact}`);
      if (issue.recommendation) console.log(`  Recommendation: ${issue.recommendation}`);
      console.log('');
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  OVERALL INTEGRITY SCORE                                        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const criticalCount = bySeverity.CRITICAL.reduce((sum, i) => sum + i.count, 0);
  const highCount = bySeverity.HIGH.reduce((sum, i) => sum + i.count, 0);
  const mediumCount = bySeverity.MEDIUM.reduce((sum, i) => sum + i.count, 0);
  const lowCount = bySeverity.LOW.reduce((sum, i) => sum + i.count, 0);
  const totalIssues = criticalCount + highCount + mediumCount + lowCount;

  const integrityScore = Math.max(0, 100 - (criticalCount * 5 + highCount * 2 + mediumCount * 0.5 + lowCount * 0.1));

  console.log(`Total Issues Found: ${issues.length}`);
  console.log(`Total Data Issues: ${totalIssues.toLocaleString()} records`);
  console.log(`Data Integrity Score: ${integrityScore.toFixed(1)}/100`);
  console.log(`Status: ${integrityScore > 80 ? '✅ ACCEPTABLE' : integrityScore > 60 ? '⚠️  NEEDS ATTENTION' : '🔴 CRITICAL'}`);

  console.log('\n');
}

async function main() {
  try {
    await generateReport();
  } catch (error) {
    console.error('Audit failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
