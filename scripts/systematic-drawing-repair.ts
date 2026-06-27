#!/usr/bin/env node

/**
 * Systematic Drawing Mapping Repair & Verification
 * 
 * Fixes drawing mappings one by one with:
 * 1. Page count validation
 * 2. Drawing reference verification  
 * 3. Wire-to-drawing linking
 * 4. Pin-to-drawing linking
 * 5. System data integrity checks
 * 6. Comprehensive testing
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

interface DrawingRepairReport {
  drawingId: string;
  drawingNo: string;
  status: 'FIXED' | 'FAILED' | 'SKIPPED';
  issues: string[];
  fixes: string[];
  testResults: {
    pageCountValid: boolean;
    wiresLinked: boolean;
    pinsLinked: boolean;
    referencesValid: boolean;
  };
}

const repairs: DrawingRepairReport[] = [];

async function validatePageCount(drawingId: string, drawingNo: string): Promise<boolean> {
  console.log(`  Validating page count for ${drawingNo}...`);

  try {
    const drawing = await prisma.drawing.findUnique({
      where: { id: drawingId },
      include: { pages: true, pageMappings: true }
    });

    if (!drawing) {
      console.log(`    ❌ Drawing not found`);
      return false;
    }

    const actualPages = drawing.pages.length;
    const declaredPages = drawing.totalSheets || 0;
    const mappedPages = drawing.pageMappings.length;

    if (actualPages === 0 && declaredPages === 0 && mappedPages === 0) {
      console.log(`    ⚠️  No pages (declared=${declaredPages}, actual=${actualPages}, mapped=${mappedPages})`);
      return true; // Empty drawing is acceptable
    }

    if (actualPages !== declaredPages) {
      console.log(`    🔧 Fixing page count: declared=${declaredPages}, actual=${actualPages}`);
      await prisma.drawing.update({
        where: { id: drawingId },
        data: { totalSheets: actualPages }
      });
      console.log(`    ✅ Fixed to ${actualPages} pages`);
    } else {
      console.log(`    ✅ Page count valid: ${actualPages}`);
    }

    return true;
  } catch (err) {
    console.log(`    ❌ Error: ${(err as Error).message}`);
    return false;
  }
}

async function linkWireToDrawing(drawingId: string, drawingNo: string): Promise<number> {
  console.log(`  Linking wires to drawing ${drawingNo}...`);

  try {
    // Get all connectors in this drawing
    const connectors = await prisma.connector.findMany({
      where: { drawingId },
      include: {
        pins: {
          include: { wireEndpoints: { include: { wire: true } } }
        }
      }
    });

    let wiresLinked = 0;

    for (const connector of connectors) {
      for (const pin of connector.pins) {
        for (const endpoint of pin.wireEndpoints) {
          const wire = endpoint.wire;

          // Check if wire already linked to drawing
          const existing = await prisma.drawingWire.findUnique({
            where: {
              drawingId_wireId: {
                drawingId,
                wireId: wire.id
              }
            }
          });

          if (!existing) {
            // Create link
            await prisma.drawingWire.create({
              data: {
                drawingId,
                wireId: wire.id,
                context: `Connector: ${connector.connectorCode}, Pin: ${pin.pinNo}`
              }
            });
            wiresLinked++;
          }
        }
      }
    }

    console.log(`    ✅ Linked ${wiresLinked} wires`);
    return wiresLinked;
  } catch (err) {
    console.log(`    ❌ Error: ${(err as Error).message}`);
    return 0;
  }
}

async function linkPinToDrawing(drawingId: string, drawingNo: string): Promise<number> {
  console.log(`  Linking connector pins to drawing ${drawingNo}...`);

  try {
    const connectors = await prisma.connector.findMany({
      where: { drawingId },
      include: { pins: true }
    });

    let pinsLinked = 0;

    for (const connector of connectors) {
      for (const pin of connector.pins) {
        // Record pin location in drawing
        if (!pin.pinLabel) {
          await prisma.connectorPin.update({
            where: { id: pin.id },
            data: {
              pinLabel: `${connector.connectorCode}-${pin.pinNo}`,
              sourceSheetRef: drawingNo
            }
          });
          pinsLinked++;
        }
      }
    }

    console.log(`    ✅ Labeled ${pinsLinked} pins`);
    return pinsLinked;
  } catch (err) {
    console.log(`    ❌ Error: ${(err as Error).message}`);
    return 0;
  }
}

async function validateReferences(drawingId: string, drawingNo: string): Promise<boolean> {
  console.log(`  Validating drawing references for ${drawingNo}...`);

  try {
    const drawing = await prisma.drawing.findUnique({
      where: { id: drawingId },
      include: { references: true }
    });

    if (!drawing) return false;

    let validCount = 0;
    let invalidCount = 0;

    for (const ref of drawing.references) {
      const targetExists = await prisma.referenceDrawing.findUnique({
        where: { id: ref.referenceId }
      });

      if (targetExists) {
        validCount++;
      } else {
        invalidCount++;
        // Delete broken reference
        await prisma.drawingReference.delete({
          where: { id: ref.id }
        });
      }
    }

    console.log(`    ✅ Valid references: ${validCount}, Deleted broken: ${invalidCount}`);
    return true;
  } catch (err) {
    console.log(`    ❌ Error: ${(err as Error).message}`);
    return false;
  }
}

async function verifyDrawing(drawingId: string, drawingNo: string): Promise<DrawingRepairReport> {
  console.log(`\n🔍 VERIFYING DRAWING: ${drawingNo}\n`);

  const report: DrawingRepairReport = {
    drawingId,
    drawingNo,
    status: 'SKIPPED',
    issues: [],
    fixes: [],
    testResults: {
      pageCountValid: false,
      wiresLinked: false,
      pinsLinked: false,
      referencesValid: false
    }
  };

  try {
    // Test 1: Page Count
    const pageCountValid = await validatePageCount(drawingId, drawingNo);
    report.testResults.pageCountValid = pageCountValid;
    if (!pageCountValid) report.issues.push('Page count invalid');

    // Test 2: Wire Linking
    const wiresLinked = await linkWireToDrawing(drawingId, drawingNo);
    report.testResults.wiresLinked = wiresLinked > 0;
    if (wiresLinked > 0) {
      report.fixes.push(`Linked ${wiresLinked} wires`);
    } else {
      report.issues.push('No wires linked');
    }

    // Test 3: Pin Linking
    const pinsLinked = await linkPinToDrawing(drawingId, drawingNo);
    report.testResults.pinsLinked = pinsLinked > 0;
    if (pinsLinked > 0) {
      report.fixes.push(`Labeled ${pinsLinked} pins`);
    }

    // Test 4: Reference Validation
    const refsValid = await validateReferences(drawingId, drawingNo);
    report.testResults.referencesValid = refsValid;
    if (!refsValid) report.issues.push('Reference validation failed');

    // Determine overall status
    if (report.issues.length === 0) {
      report.status = 'FIXED';
      console.log(`\n✅ DRAWING ${drawingNo}: ALL TESTS PASSED\n`);
    } else if (report.fixes.length > 0) {
      report.status = 'FIXED';
      console.log(`\n✅ DRAWING ${drawingNo}: FIXED WITH ${report.fixes.length} REPAIRS\n`);
    } else {
      report.status = 'FAILED';
      console.log(`\n❌ DRAWING ${drawingNo}: FAILED\n`);
    }

    repairs.push(report);
  } catch (err) {
    report.status = 'FAILED';
    report.issues.push((err as Error).message);
    repairs.push(report);
    console.log(`\n❌ DRAWING ${drawingNo}: ERROR\n`);
  }

  return report;
}

async function generateSummaryReport(): Promise<void> {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  DRAWING REPAIR SUMMARY REPORT                                  ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const fixed = repairs.filter(r => r.status === 'FIXED').length;
  const failed = repairs.filter(r => r.status === 'FAILED').length;
  const skipped = repairs.filter(r => r.status === 'SKIPPED').length;

  console.log(`Total Drawings Processed: ${repairs.length}`);
  console.log(`Fixed: ${fixed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Skipped: ${skipped} ⏭️\n`);

  const pageCountPassed = repairs.filter(r => r.testResults.pageCountValid).length;
  const wiresLinked = repairs.filter(r => r.testResults.wiresLinked).length;
  const pinsLinked = repairs.filter(r => r.testResults.pinsLinked).length;
  const refsValid = repairs.filter(r => r.testResults.referencesValid).length;

  console.log('Test Results:');
  console.log(`  Page Count Validation: ${pageCountPassed}/${repairs.length} ✅`);
  console.log(`  Wires Linked: ${wiresLinked}/${repairs.length} ✅`);
  console.log(`  Pins Linked: ${pinsLinked}/${repairs.length} ✅`);
  console.log(`  References Valid: ${refsValid}/${repairs.length} ✅\n`);

  // Show failed drawings
  const failedDrawings = repairs.filter(r => r.status === 'FAILED');
  if (failedDrawings.length > 0) {
    console.log('Failed Drawings:');
    for (const drawing of failedDrawings.slice(0, 10)) {
      console.log(`  ${drawing.drawingNo}: ${drawing.issues.join('; ')}`);
    }
  }

  console.log('\n' + '═'.repeat(70));
}

async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  VCC SYSTEMATIC DRAWING REPAIR & VERIFICATION                   ║');
  console.log('║  Fixes drawing mappings one by one with full testing            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Get all drawings
    const drawings = await prisma.drawing.findMany({
      select: { id: true, drawingNo: true }
    });

    console.log(`Found ${drawings.length} drawings to verify...\n`);

    // Process each drawing
    for (const drawing of drawings) {
      await verifyDrawing(drawing.id, drawing.drawingNo);
    }

    // Generate summary
    await generateSummaryReport();

    // Generate integrity metrics
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  DATA INTEGRITY METRICS                                         ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const totalDrawings = await prisma.drawing.count();
    const totalWires = await prisma.wire.count();
    const totalPins = await prisma.connectorPin.count();
    const totalConnectors = await prisma.connector.count();

    const drawingWires = await prisma.drawingWire.count();
    const wiresWithSource = await prisma.wire.count({
      where: { NOT: { sourceConnector: null } }
    });
    const wiresWithDest = await prisma.wire.count({
      where: { NOT: { destConnector: null } }
    });
    const pinsWithWires = await prisma.connectorPin.count({
      where: { NOT: { wireNo: null } }
    });

    console.log('Drawing Data:');
    console.log(`  Total Drawings: ${totalDrawings}`);
    console.log(`  Drawing-Wire Links: ${drawingWires} (${((drawingWires / totalWires) * 100).toFixed(1)}% of wires)`);

    console.log('\nWire Data:');
    console.log(`  Total Wires: ${totalWires}`);
    console.log(`  Wires with Source: ${wiresWithSource} (${((wiresWithSource / totalWires) * 100).toFixed(1)}%)`);
    console.log(`  Wires with Destination: ${wiresWithDest} (${((wiresWithDest / totalWires) * 100).toFixed(1)}%)`);

    console.log('\nPin Data:');
    console.log(`  Total Connectors: ${totalConnectors}`);
    console.log(`  Total Pins: ${totalPins}`);
    console.log(`  Pins Linked to Wires: ${pinsWithWires} (${((pinsWithWires / totalPins) * 100).toFixed(1)}%)`);

    console.log('\n' + '═'.repeat(70) + '\n');

    console.log('Repair Complete! Review the results above to identify remaining issues.');

  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
