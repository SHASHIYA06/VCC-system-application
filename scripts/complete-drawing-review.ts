import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DrawingReviewItem {
  drawingNo: string;
  revision: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  checks: {
    pageCount: boolean;
    connectors: boolean;
    pins: boolean;
    wires: boolean;
    devices: boolean;
    system: boolean;
    overall: boolean;
  };
  issues: string[];
}

async function main() {
  try {
    console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                 COMPLETE DRAWING SETUP REVIEW                             ║
║              Verify all 575 drawings are correctly configured              ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

    const reviews: DrawingReviewItem[] = [];
    let passed = 0;
    let failed = 0;
    let warned = 0;

    // Get all drawings with complete data
    const drawings = await prisma.drawing.findMany({
      include: {
        connectors: {
          include: {
            pins: {
              include: {
                wireEndpoints: true
              }
            }
          }
        },
        wires: true,
        devices: true,
        system: true,
        pages: true,
        pageMappings: true,
        project: true
      },
      orderBy: { drawingNo: 'asc' }
    });

    console.log(`\n📊 Reviewing ${drawings.length} drawings for complete setup...\n`);

    for (const drawing of drawings) {
      const review: DrawingReviewItem = {
        drawingNo: drawing.drawingNo,
        revision: drawing.revision,
        status: 'PASS',
        checks: {
          pageCount: false,
          connectors: false,
          pins: false,
          wires: false,
          devices: false,
          system: false,
          overall: false
        },
        issues: []
      };

      // CHECK 1: Page Count
      const pageMismatch = drawing.totalSheets !== drawing.pages.length;
      if (!pageMismatch && drawing.totalSheets > 0) {
        review.checks.pageCount = true;
      } else {
        review.issues.push(`Page count mismatch: declared ${drawing.totalSheets}, actual ${drawing.pages.length}`);
        review.status = 'FAIL';
      }

      // CHECK 2: Connectors
      if (drawing.connectors.length > 0) {
        const orphanConnectors = drawing.connectors.filter(c => !c.drawingId || c.drawingId !== drawing.id);
        if (orphanConnectors.length === 0) {
          review.checks.connectors = true;
        } else {
          review.issues.push(`${orphanConnectors.length} orphan connectors`);
          review.status = 'FAIL';
        }
      } else {
        review.issues.push(`No connectors defined`);
        review.status = 'FAIL';
      }

      // CHECK 3: Pins (should have pins if connectors exist)
      if (drawing.connectors.length > 0) {
        const totalPins = drawing.connectors.reduce((sum, c) => sum + c.pins.length, 0);
        if (totalPins > 0) {
          review.checks.pins = true;
        } else {
          review.issues.push(`Connectors exist but no pins defined`);
          if (drawing.status === 'ACTIVE') {
            review.status = 'FAIL';
          } else {
            review.status = 'WARN';
          }
        }
      }

      // CHECK 4: Wires
      if (drawing.wires.length > 0) {
        review.checks.wires = true;
      } else {
        if (drawing.connectors.length > 0) {
          const hasWiredPins = drawing.connectors.some(c => 
            c.pins.some(p => p.wireEndpoints.length > 0)
          );
          if (hasWiredPins) {
            review.issues.push(`Wired pins exist but DrawingWire records missing`);
            review.status = 'WARN';
          }
        }
      }

      // CHECK 5: Devices
      if (drawing.devices.length > 0) {
        const linkedDevices = drawing.devices.filter(d => d.systemId);
        if (linkedDevices.length === drawing.devices.length) {
          review.checks.devices = true;
        } else {
          review.issues.push(`${drawing.devices.length - linkedDevices.length} devices not linked to system`);
          review.status = 'WARN';
        }
      }

      // CHECK 6: System
      if (drawing.system) {
        review.checks.system = true;
      } else {
        if (drawing.connectors.length > 0 || drawing.devices.length > 0) {
          review.issues.push(`Drawing has data but no system assigned`);
          review.status = 'WARN';
        }
      }

      // Overall check
      const passChecks = Object.values(review.checks).filter(v => v).length;
      if (passChecks >= 4) {
        review.checks.overall = true;
      }

      if (review.status === 'PASS') {
        passed++;
      } else if (review.status === 'FAIL') {
        failed++;
      } else {
        warned++;
      }

      reviews.push(review);
    }

    // Print summary
    console.log(`\n╔════════════════════════════════════════════════════════════════════════════╗`);
    console.log(`║                         REVIEW SUMMARY                                    ║`);
    console.log(`╚════════════════════════════════════════════════════════════════════════════╝\n`);

    console.log(`✅ PASS (Fully Setup):    ${passed}/${drawings.length} (${((passed/drawings.length)*100).toFixed(1)}%)`);
    console.log(`⚠️  WARN (Partial):       ${warned}/${drawings.length} (${((warned/drawings.length)*100).toFixed(1)}%)`);
    console.log(`❌ FAIL (Broken):         ${failed}/${drawings.length} (${((failed/drawings.length)*100).toFixed(1)}%)`);

    // Details of failures
    const failures = reviews.filter(r => r.status === 'FAIL');
    if (failures.length > 0) {
      console.log(`\n╔════════════════════════════════════════════════════════════════════════════╗`);
      console.log(`║                   ❌ FAILED DRAWINGS (${failures.length})                                ║`);
      console.log(`╚════════════════════════════════════════════════════════════════════════════╝\n`);

      for (const fail of failures.slice(0, 20)) {
        console.log(`❌ ${fail.drawingNo} (Rev ${fail.revision})`);
        for (const issue of fail.issues) {
          console.log(`   • ${issue}`);
        }
      }

      if (failures.length > 20) {
        console.log(`\n... and ${failures.length - 20} more failed drawings\n`);
      }
    }

    // Details of warnings
    const warnings = reviews.filter(r => r.status === 'WARN');
    if (warnings.length > 0) {
      console.log(`\n╔════════════════════════════════════════════════════════════════════════════╗`);
      console.log(`║                   ⚠️  WARNING DRAWINGS (${warnings.length})                               ║`);
      console.log(`╚════════════════════════════════════════════════════════════════════════════╝\n`);

      for (const warn of warnings.slice(0, 15)) {
        console.log(`⚠️  ${warn.drawingNo} (Rev ${warn.revision})`);
        for (const issue of warn.issues) {
          console.log(`   • ${issue}`);
        }
      }

      if (warnings.length > 15) {
        console.log(`\n... and ${warnings.length - 15} more warning drawings\n`);
      }
    }

    // List passed drawings
    const passes = reviews.filter(r => r.status === 'PASS');
    console.log(`\n╔════════════════════════════════════════════════════════════════════════════╗`);
    console.log(`║                   ✅ PROPERLY CONFIGURED (${passed})                              ║`);
    console.log(`╚════════════════════════════════════════════════════════════════════════════╝\n`);

    if (passes.length > 0) {
      for (const pass of passes.slice(0, 20)) {
        console.log(`✅ ${pass.drawingNo} (Rev ${pass.revision})`);
      }

      if (passes.length > 20) {
        console.log(`\n... and ${passes.length - 20} more properly configured drawings\n`);
      }
    }

    // Overall status
    console.log(`\n╔════════════════════════════════════════════════════════════════════════════╗`);
    console.log(`║                      OVERALL SETUP STATUS                                 ║`);
    console.log(`╚════════════════════════════════════════════════════════════════════════════╝\n`);

    const setupPercent = ((passed / drawings.length) * 100).toFixed(1);

    if (setupPercent === '100') {
      console.log(`✅ ALL 575 DRAWINGS CORRECTLY SETUP!\n`);
      console.log(`Complete configuration verified.\n`);
      console.log(`Ready for production deployment.\n`);
    } else if (setupPercent > '80') {
      console.log(`🟢 MOSTLY CONFIGURED: ${setupPercent}%\n`);
      console.log(`Most drawings properly setup.\n`);
      console.log(`${warnings.length + failed} drawings need attention.\n`);
    } else if (setupPercent > '50') {
      console.log(`🟡 PARTIALLY CONFIGURED: ${setupPercent}%\n`);
      console.log(`Many drawings need work.\n`);
      console.log(`${warnings.length + failed} drawings need repair.\n`);
    } else {
      console.log(`🔴 POORLY CONFIGURED: ${setupPercent}%\n`);
      console.log(`Most drawings have issues.\n`);
      console.log(`${warnings.length + failed} drawings need major repair.\n`);
    }

    // Breakdown of issues
    console.log(`📋 Issue Breakdown:\n`);

    const pageIssues = reviews.filter(r => !r.checks.pageCount).length;
    const connectorIssues = reviews.filter(r => !r.checks.connectors).length;
    const pinIssues = reviews.filter(r => !r.checks.pins).length;
    const wireIssues = reviews.filter(r => !r.checks.wires).length;
    const deviceIssues = reviews.filter(r => !r.checks.devices).length;
    const systemIssues = reviews.filter(r => !r.checks.system).length;

    if (pageIssues > 0) console.log(`  • Page count problems: ${pageIssues}`);
    if (connectorIssues > 0) console.log(`  • Connector problems: ${connectorIssues}`);
    if (pinIssues > 0) console.log(`  • Pin problems: ${pinIssues}`);
    if (wireIssues > 0) console.log(`  • Wire problems: ${wireIssues}`);
    if (deviceIssues > 0) console.log(`  • Device problems: ${deviceIssues}`);
    if (systemIssues > 0) console.log(`  • System assignment problems: ${systemIssues}`);

    console.log(`\n✓ Review complete.\n`);

  } catch (error) {
    console.error(`\n❌ Error: ${error}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
