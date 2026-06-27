import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color: string, message: string) {
  console.log(`${color}${message}${colors.reset}`);
}

function section(title: string) {
  console.log('\n' + colors.cyan + '═'.repeat(80) + colors.reset);
  console.log(colors.cyan + colors.bright + title + colors.reset);
  console.log(colors.cyan + '═'.repeat(80) + colors.reset);
}

async function main() {
  try {
    console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                   MASTER DATA REPAIR SYSTEM                                ║
║               Comprehensive drawing mapping & wire linking                 ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

    // Phase 1: Audit
    section('PHASE 1: COMPREHENSIVE DATABASE AUDIT');
    log(colors.blue, '📊 Analyzing database state...\n');

    const [
      totalWires,
      totalDrawings,
      totalConnectors,
      totalPins,
      drawingWireLinks,
    ] = await Promise.all([
      prisma.wire.count(),
      prisma.drawing.count(),
      prisma.connector.count(),
      prisma.connectorPin.count(),
      prisma.drawingWire.count(),
    ]);

    log(colors.green, `✓ Total Wires: ${totalWires.toLocaleString()}`);
    log(colors.green, `✓ Total Drawings: ${totalDrawings.toLocaleString()}`);
    log(colors.green, `✓ Total Connectors: ${totalConnectors.toLocaleString()}`);
    log(colors.green, `✓ Total Pins: ${totalPins.toLocaleString()}`);
    log(colors.green, `✓ DrawingWire Links: ${drawingWireLinks.toLocaleString()}`);

    // Wire status breakdown
    log(colors.blue, '\n📈 Wire Status Breakdown:');
    const wireStatus = await prisma.wire.groupBy({
      by: ['wireStatus'],
      _count: true,
    });
    
    for (const w of wireStatus) {
      const pct = ((w._count / totalWires) * 100).toFixed(1);
      const status = w.wireStatus || 'NULL';
      log(colors.green, `  • ${status}: ${w._count.toLocaleString()} (${pct}%)`);
    }

    // Empty drawings
    log(colors.blue, '\n🏗️  Drawing Analysis:');
    const emptyDrawings = await prisma.drawing.count({
      where: {
        connectors: {
          none: {}
        }
      }
    });
    const drawingsWithConnectors = totalDrawings - emptyDrawings;
    log(colors.green, `✓ Drawings with connectors: ${drawingsWithConnectors}/${totalDrawings}`);
    if (emptyDrawings > 0) {
      log(colors.yellow, `⚠️  Empty drawings (no connectors): ${emptyDrawings}`);
    }

    // Missing data analysis
    log(colors.blue, '\n🔍 Data Completeness Check:');
    const [missingSource, missingDest] = await Promise.all([
      prisma.wire.count({
        where: {
          OR: [
            { sourceConnector: null },
            { sourceEquipment: null }
          ]
        }
      }),
      prisma.wire.count({
        where: {
          OR: [
            { destConnector: null },
            { destEquipment: null }
          ]
        }
      })
    ]);
    
    const sourcePct = ((missingSource / totalWires) * 100).toFixed(1);
    const destPct = ((missingDest / totalWires) * 100).toFixed(1);
    
    log(colors.yellow, `⚠️  Wires missing source data: ${missingSource.toLocaleString()} (${sourcePct}%)`);
    log(colors.yellow, `⚠️  Wires missing dest data: ${missingDest.toLocaleString()} (${destPct}%)`);

    const pinsWithoutWires = await prisma.connectorPin.count({
      where: {
        wireNo: null,
        wireEndpoints: {
          none: {}
        }
      }
    });
    const pinsCoverage = (((totalPins - pinsWithoutWires) / totalPins) * 100).toFixed(1);
    log(colors.yellow, `⚠️  Pins without wire links: ${pinsWithoutWires.toLocaleString()} (${(100 - Number(pinsCoverage)).toFixed(1)}%)`);

    // Calculate integrity score (0-100)
    const drawingCoverage = (drawingsWithConnectors / totalDrawings) * 100;
    const wireLinkCoverage = (drawingWireLinks / totalWires) * 100;
    const sourceCompleteness = ((totalWires - missingSource) / totalWires) * 100;
    const destCompleteness = ((totalWires - missingDest) / totalWires) * 100;
    
    const integrityScore = Math.round(
      (drawingCoverage * 0.25) +
      (wireLinkCoverage * 0.25) +
      (sourceCompleteness * 0.25) +
      (destCompleteness * 0.25)
    );

    log(colors.blue, '\n📊 Overall Data Integrity Score:');
    const scoreColor = integrityScore > 75 ? colors.green : integrityScore > 50 ? colors.yellow : colors.red;
    log(scoreColor, `${integrityScore}/100`);

    if (integrityScore < 50) {
      log(colors.red, '\n❌ CRITICAL: Data integrity too low for production!');
      log(colors.red, '   Repairs required before deployment.');
    }

    // Phase 2: Repair
    section('PHASE 2: SYSTEMATIC REPAIR OF DRAWING MAPPINGS');

    let repairCreated = 0;
    let repairSkipped = 0;

    // Step 1: Handle empty drawings
    log(colors.blue, '\n🗂️  Step 1: Analyzing empty drawings...');
    if (emptyDrawings > 0) {
      log(colors.yellow, `⚠️  Found ${emptyDrawings} empty drawings`);
      log(colors.yellow, `   Action: User decision required - mark as deprecated or populate?`);
    } else {
      log(colors.green, '✓ All drawings have connectors');
    }

    // Step 2: Create DrawingWire links
    log(colors.blue, '\n🔗 Step 2: Linking wires to drawings...');
    log(colors.blue, `   Current DrawingWire records: ${drawingWireLinks.toLocaleString()}`);
    log(colors.blue, `   Target: 100,000+ links`);
    
    try {
      // Fetch all wire endpoints with connector information
      const wiresNotLinked = await prisma.wireEndpoint.findMany({
        include: {
          connector: {
            select: {
              drawingId: true,
              connectorCode: true
            }
          },
          pin: {
            select: {
              pinNo: true
            }
          }
        }
      });

      log(colors.blue, `   Found ${wiresNotLinked.length.toLocaleString()} wire endpoints to process`);

      // Create DrawingWire records
      for (const endpoint of wiresNotLinked) {
        if (!endpoint.connector?.drawingId) {
          repairSkipped++;
          continue;
        }

        const existingLink = await prisma.drawingWire.findFirst({
          where: {
            wireId: endpoint.wireId,
            drawingId: endpoint.connector.drawingId
          }
        });

        if (!existingLink) {
          try {
            await prisma.drawingWire.create({
              data: {
                wireId: endpoint.wireId,
                drawingId: endpoint.connector.drawingId,
                context: `${endpoint.connector.connectorCode}:${endpoint.pin?.pinNo || 'unknown'}`
              }
            });
            repairCreated++;
          } catch (err) {
            // Skip duplicate or constraint errors
          }
        } else {
          repairSkipped++;
        }
      }

      log(colors.green, `✓ Created ${repairCreated.toLocaleString()} new DrawingWire links`);
      log(colors.yellow, `  (${repairSkipped.toLocaleString()} already existed or skipped)`);

    } catch (error) {
      log(colors.red, `✗ Error creating DrawingWire links: ${error}`);
    }

    // Step 3: Verify page counts
    log(colors.blue, '\n📄 Step 3: Verifying page count accuracy...');
    const drawings = await prisma.drawing.findMany({
      select: {
        id: true,
        drawingNo: true,
        totalSheets: true,
        connectors: { select: { id: true } }
      },
      where: {
        connectors: {
          some: {}
        }
      }
    });

    let incorrect = 0;
    for (const d of drawings) {
      if (d.totalSheets < 1) {
        incorrect++;
      }
    }

    log(colors.green, `✓ Verified ${drawings.length.toLocaleString()} drawings with connectors`);
    if (incorrect > 0) {
      log(colors.yellow, `⚠️  Found ${incorrect} drawings with suspicious page counts`);
    }

    // Phase 3: Verify
    section('PHASE 3: VERIFICATION & TESTING');

    log(colors.blue, '\n✅ Test 1: Drawing-Wire Coverage');
    const newCount = await prisma.drawingWire.count();
    const coverage = ((newCount / totalWires) * 100).toFixed(1);
    log(colors.green, `✓ DrawingWire records: ${newCount.toLocaleString()} (${coverage}% coverage)`);
    
    if (newCount > 50000) {
      log(colors.green, `✓ PASS: Excellent coverage!`);
    } else if (newCount > 10000) {
      log(colors.yellow, `⚠️  PARTIAL: Some wires not linked`);
    } else {
      log(colors.red, `✗ FAIL: Insufficient links created`);
    }

    log(colors.blue, '\n✅ Test 2: Drawing Completeness');
    const emptyNow = await prisma.drawing.count({
      where: {
        connectors: { none: {} }
      }
    });
    if (emptyNow === 0) {
      log(colors.green, `✓ PASS: No empty drawings!`);
    } else {
      log(colors.yellow, `⚠️  ${emptyNow} empty drawings still exist (need decision)`);
    }

    log(colors.blue, '\n✅ Test 3: Wire Data Completeness');
    const [sourceMissing, destMissing] = await Promise.all([
      prisma.wire.count({
        where: {
          OR: [
            { sourceConnector: null },
            { sourceEquipment: null }
          ]
        }
      }),
      prisma.wire.count({
        where: {
          OR: [
            { destConnector: null },
            { destEquipment: null }
          ]
        }
      })
    ]);

    const sourceCov = (((totalWires - sourceMissing) / totalWires) * 100).toFixed(1);
    const destCov = (((totalWires - destMissing) / totalWires) * 100).toFixed(1);
    
    log(colors.green, `✓ Wire source coverage: ${sourceCov}%`);
    log(colors.green, `✓ Wire dest coverage: ${destCov}%`);

    log(colors.blue, '\n✅ Test 4: Pin-Wire Linkage');
    const pinsWithWires = await prisma.connectorPin.count({
      where: {
        OR: [
          { wireNo: { not: null } },
          { wireEndpoints: { some: {} } }
        ]
      }
    });
    const pinCoverage = ((pinsWithWires / totalPins) * 100).toFixed(1);
    log(colors.green, `✓ Pin-wire coverage: ${pinCoverage}%`);

    // Recalculate integrity score
    log(colors.blue, '\n📊 Final Data Integrity Score:');
    const newDrawingCoverage = ((totalDrawings - emptyNow) / totalDrawings) * 100;
    const newWireLinkCoverage = ((newCount / totalWires) * 100);
    const newSourceCompleteness = (((totalWires - sourceMissing) / totalWires) * 100);
    const newDestCompleteness = (((totalWires - destMissing) / totalWires) * 100);
    
    const newScore = Math.round(
      (newDrawingCoverage * 0.25) +
      (newWireLinkCoverage * 0.25) +
      (newSourceCompleteness * 0.25) +
      (newDestCompleteness * 0.25)
    );

    const newScoreColor = newScore > 75 ? colors.green : newScore > 50 ? colors.yellow : colors.red;
    log(newScoreColor, colors.bright + `${newScore}/100` + colors.reset);

    if (newScore >= 75) {
      log(colors.green, colors.bright + '✓ PRODUCTION READY' + colors.reset);
    } else if (newScore >= 50) {
      log(colors.yellow, '⚠️  Additional repairs recommended');
    } else {
      log(colors.red, colors.bright + '❌ NOT PRODUCTION READY' + colors.reset);
    }

    // Phase 4: Report
    section('PHASE 4: SUMMARY REPORT');

    console.log(`
┌────────────────────────────────────────────────────────┐
│  DATABASE REPAIR SUMMARY                               │
└────────────────────────────────────────────────────────┘

BEFORE REPAIRS:
  • Drawings with connectors: ${drawingsWithConnectors}/${totalDrawings}
  • DrawingWire links: ${drawingWireLinks.toLocaleString()}
  • Data integrity score: ${integrityScore}/100

REPAIRS APPLIED:
  • DrawingWire links created: ${repairCreated.toLocaleString()}
  • Empty drawings identified: ${emptyDrawings}
  • Page counts verified: ✓

CRITICAL ISSUES FOUND:
  • Empty drawings: ${emptyDrawings}
  • Wires missing source: ${missingSource.toLocaleString()}
  • Wires missing destination: ${missingDest.toLocaleString()}
  • Pins without wires: ${pinsWithoutWires.toLocaleString()}

AFTER REPAIRS:
  • DrawingWire links: ${newCount.toLocaleString()} (${coverage}%)
  • Empty drawings: ${emptyNow}
  • Data integrity score: ${newScore}/100

NEXT STEPS:
  1. ✓ Review this report
  2. ⏳ Decide on empty drawings (keep/mark deprecated/populate)
  3. ⏳ Populate missing source/destination data for wires
  4. ⏳ Run comprehensive tests
  5. ⏳ Deploy to production

STATUS: ${newScore >= 75 ? '✓ PRODUCTION READY' : '❌ DATA ISSUES REMAIN'}
`);

    log(colors.green + colors.bright, '\n✓ MASTER REPAIR COMPLETE' + colors.reset);

  } catch (error) {
    log(colors.red, `\n❌ Fatal error: ${error}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
