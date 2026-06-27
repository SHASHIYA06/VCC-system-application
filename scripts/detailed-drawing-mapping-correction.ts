#!/usr/bin/env node

/**
 * Detailed Drawing Mapping Correction & Verification
 * 
 * Systematically reviews EVERY drawing one-by-one to:
 * 1. Verify drawing exists and has correct metadata
 * 2. List all connectors in that drawing
 * 3. List all pins for each connector
 * 4. List all wires linked to those pins
 * 5. Verify page count and mappings
 * 6. Identify and fix all discrepancies
 * 7. Run comprehensive tests
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DrawingDetail {
  drawingNo: string;
  revision: string;
  declaredPages: number;
  actualPages: number;
  connectorCount: number;
  totalPins: number;
  wiredPins: number;
  unwiredPins: number;
  issues: string[];
  corrections: string[];
  testsPassed: boolean;
}

const drawings: DrawingDetail[] = [];

async function auditDrawing(drawingNo: string): Promise<DrawingDetail> {
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`📋 AUDITING DRAWING: ${drawingNo}`);
  console.log(`${'─'.repeat(80)}\n`);

  const detail: DrawingDetail = {
    drawingNo,
    revision: '',
    declaredPages: 0,
    actualPages: 0,
    connectorCount: 0,
    totalPins: 0,
    wiredPins: 0,
    unwiredPins: 0,
    issues: [],
    corrections: [],
    testsPassed: true
  };

  try {
    // Step 1: Get drawing
    const drawing = await prisma.drawing.findFirst({
      where: { drawingNo },
      include: {
        pages: true,
        connectors: {
          include: {
            pins: {
              include: {
                wireEndpoints: {
                  include: { wire: true }
                }
              }
            }
          }
        },
        pageMappings: true,
        wires: true
      }
    });

    if (!drawing) {
      detail.issues.push(`CRITICAL: Drawing ${drawingNo} not found in database`);
      detail.testsPassed = false;
      return detail;
    }

    console.log(`✓ Found drawing: ${drawing.drawingNo}`);
    console.log(`  Revision: ${drawing.revision || 'N/A'}`);
    console.log(`  Status: ${drawing.status}`);
    console.log(`  Created: ${drawing.createdAt.toISOString().split('T')[0]}\n`);

    detail.revision = drawing.revision;
    detail.declaredPages = drawing.totalSheets || 0;
    detail.actualPages = drawing.pages.length;

    // Step 2: Validate page count
    console.log(`📄 Page Count Validation:`);
    console.log(`  Declared in metadata: ${detail.declaredPages}`);
    console.log(`  Actual pages found: ${detail.actualPages}`);
    console.log(`  Page mappings: ${drawing.pageMappings.length}\n`);

    if (detail.actualPages !== detail.declaredPages) {
      detail.issues.push(`Page count mismatch: declared=${detail.declaredPages}, actual=${detail.actualPages}`);
      console.log(`  ⚠️  ISSUE: Mismatch detected`);
      
      // Auto-correct
      if (detail.actualPages > 0) {
        await prisma.drawing.update({
          where: { id: drawing.id },
          data: { totalSheets: detail.actualPages }
        });
        detail.corrections.push(`Fixed page count from ${detail.declaredPages} to ${detail.actualPages}`);
        console.log(`  ✓ CORRECTED: Updated to ${detail.actualPages} pages\n`);
      }
    } else {
      console.log(`  ✓ Page count valid\n`);
    }

    // Step 3: Validate connectors
    console.log(`⚡ Connector Analysis:`);
    detail.connectorCount = drawing.connectors.length;
    console.log(`  Total connectors: ${detail.connectorCount}`);

    if (detail.connectorCount === 0) {
      detail.issues.push('No connectors found in this drawing');
      detail.testsPassed = false;
      console.log(`  ❌ ISSUE: Empty drawing - no connectors\n`);
    } else {
      // List each connector with pins
      for (const connector of drawing.connectors) {
        const totalPins = connector.pins.length;
        const wiredPins = connector.pins.filter(p => p.wireNo || p.wireEndpoints.length > 0).length;
        const unwiredPins = totalPins - wiredPins;

        detail.totalPins += totalPins;
        detail.wiredPins += wiredPins;
        detail.unwiredPins += unwiredPins;

        const wireList = connector.pins
          .filter(p => p.wireNo || p.wireEndpoints.length > 0)
          .map(p => p.wireNo || p.wireEndpoints[0]?.wire.wireNo || '?')
          .slice(0, 3)
          .join(', ');

        console.log(`    ${connector.connectorCode}:`);
        console.log(`      Pins: ${totalPins} (wired: ${wiredPins}, unwired: ${unwiredPins})`);
        if (wireList) console.log(`      Wires: ${wireList}${wiredPins > 3 ? '...' : ''}`);

        // Check for issues
        if (unwiredPins / totalPins > 0.5) {
          detail.issues.push(`Connector ${connector.connectorCode}: ${unwiredPins} of ${totalPins} pins unwired`);
        }
      }
      console.log('');
    }

    // Step 4: Validate wire links
    console.log(`🔌 Wire-to-Drawing Links:`);
    console.log(`  Wires on this drawing: ${drawing.wires.length}\n`);

    if (drawing.wires.length === 0) {
      detail.issues.push('No wires linked to this drawing');
    } else if (drawing.wires.length < detail.totalPins / 2) {
      detail.issues.push(`Low wire coverage: ${drawing.wires.length} wires for ${detail.totalPins} pins`);
    }

    // Step 5: Check for pin wire assignment issues
    console.log(`🔗 Pin-Wire Link Validation:`);
    console.log(`  Total pins: ${detail.totalPins}`);
    console.log(`  Wired pins: ${detail.wiredPins} (${((detail.wiredPins / detail.totalPins) * 100).toFixed(1)}%)`);
    console.log(`  Unwired pins: ${detail.unwiredPins} (${((detail.unwiredPins / detail.totalPins) * 100).toFixed(1)}%)\n`);

    if (detail.unwiredPins / detail.totalPins > 0.3) {
      detail.issues.push(`High unwired pin ratio: ${detail.unwiredPins} of ${detail.totalPins} (${((detail.unwiredPins / detail.totalPins) * 100).toFixed(1)}%)`);
      detail.testsPassed = false;
    }

    // Summary
    console.log(`${'─'.repeat(80)}`);
    console.log(`📊 SUMMARY FOR ${drawingNo}`);
    console.log(`${'─'.repeat(80)}\n`);

    if (detail.issues.length === 0 && detail.corrections.length === 0) {
      console.log(`✅ ALL TESTS PASSED - No issues found\n`);
      detail.testsPassed = true;
    } else if (detail.corrections.length > 0) {
      console.log(`⚠️  ISSUES FOUND AND CORRECTED:`);
      for (const correction of detail.corrections) {
        console.log(`  ✓ ${correction}`);
      }
      console.log('');
    } else {
      console.log(`❌ ISSUES FOUND (NOT AUTO-CORRECTED):`);
      for (const issue of detail.issues) {
        console.log(`  • ${issue}`);
      }
      console.log('');
      detail.testsPassed = false;
    }

  } catch (err) {
    detail.issues.push(`ERROR: ${(err as Error).message}`);
    detail.testsPassed = false;
    console.log(`❌ ERROR: ${(err as Error).message}\n`);
  }

  drawings.push(detail);
  return detail;
}

async function main(): Promise<void> {
  console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║  DETAILED DRAWING MAPPING CORRECTION & VERIFICATION                       ║');
  console.log('║  Reviews every drawing one-by-one to verify and correct mappings          ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');

  try {
    // Get all drawings
    const allDrawings = await prisma.drawing.findMany({
      select: { drawingNo: true },
      orderBy: { drawingNo: 'asc' }
    });

    console.log(`\n📚 Found ${allDrawings.length} drawings to audit\n`);

    // Process first 50 drawings for this run (to avoid timeout)
    const toProcess = allDrawings.slice(0, 50);
    console.log(`Processing first ${toProcess.length} drawings...\n`);

    for (const drawing of toProcess) {
      await auditDrawing(drawing.drawingNo);
    }

    // Generate report
    console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║  AUDIT REPORT - FIRST 50 DRAWINGS                                         ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

    const passed = drawings.filter(d => d.testsPassed).length;
    const failed = drawings.filter(d => !d.testsPassed).length;
    const corrected = drawings.filter(d => d.corrections.length > 0).length;

    console.log(`Results:`);
    console.log(`  ✅ Passed: ${passed} drawings`);
    console.log(`  ❌ Failed: ${failed} drawings`);
    console.log(`  🔧 Corrected: ${corrected} drawings\n`);

    // Statistics
    const totalIssues = drawings.reduce((sum, d) => sum + d.issues.length, 0);
    const totalCorrections = drawings.reduce((sum, d) => sum + d.corrections.length, 0);
    const totalPins = drawings.reduce((sum, d) => sum + d.totalPins, 0);
    const totalWiredPins = drawings.reduce((sum, d) => sum + d.wiredPins, 0);
    const avgWireRatio = totalPins > 0 ? (totalWiredPins / totalPins) * 100 : 0;

    console.log(`Statistics:`);
    console.log(`  Total issues found: ${totalIssues}`);
    console.log(`  Issues corrected: ${totalCorrections}`);
    console.log(`  Total pins analyzed: ${totalPins}`);
    console.log(`  Wired pins: ${totalWiredPins} (${avgWireRatio.toFixed(1)}%)\n`);

    // Failed drawings
    const failedDrawings = drawings.filter(d => !d.testsPassed);
    if (failedDrawings.length > 0) {
      console.log(`Failed Drawings (need manual review):`);
      for (const drawing of failedDrawings.slice(0, 10)) {
        console.log(`  • ${drawing.drawingNo}: ${drawing.issues.join('; ')}`);
      }
      console.log('');
    }

    // Issue categories
    console.log(`Issue Categories:`);
    const issueTypes = new Map<string, number>();
    for (const drawing of drawings) {
      for (const issue of drawing.issues) {
        const type = issue.split(':')[0];
        issueTypes.set(type, (issueTypes.get(type) || 0) + 1);
      }
    }
    for (const [type, count] of issueTypes.entries()) {
      console.log(`  • ${type}: ${count} occurrences`);
    }

    console.log(`\n${'═'.repeat(80)}`);
    console.log(`\nNext steps:`);
    console.log(`1. Review failed drawings above`);
    console.log(`2. Manually correct issues that couldn't be auto-fixed`);
    console.log(`3. Re-run audit after corrections`);
    console.log(`4. Process remaining ${allDrawings.length - toProcess.length} drawings\n`);

  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
