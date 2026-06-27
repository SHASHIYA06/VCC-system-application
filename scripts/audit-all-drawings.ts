import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DrawingIssue {
  drawingNo: string;
  revision: string;
  issue: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  details: string;
}

async function main() {
  try {
    console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║           COMPLETE DRAWING AUDIT - ALL 575 DRAWINGS                        ║
║              Verify accuracy and identify all mapping issues               ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

    // Get all drawings with their data
    const drawings = await prisma.drawing.findMany({
      include: {
        connectors: {
          include: {
            pins: {
              select: {
                id: true,
                pinNo: true,
                wireNo: true,
                wireEndpoints: { select: { id: true } }
              }
            }
          }
        },
        wires: { select: { id: true } },
        devices: { select: { id: true } }
      },
      orderBy: { drawingNo: 'asc' }
    });

    console.log(`\n📊 AUDIT START: Checking ${drawings.length} drawings\n`);

    const issues: DrawingIssue[] = [];
    let checked = 0;
    let criticalCount = 0;
    let highCount = 0;

    for (const drawing of drawings) {
      const connectorCount = drawing.connectors.length;
      const wireCount = drawing.wires.length;
      const deviceCount = drawing.devices.length;
      const totalPins = drawing.connectors.reduce((sum, c) => sum + c.pins.length, 0);
      const wiredPins = drawing.connectors.reduce((sum, c) => sum + c.pins.filter(p => p.wireNo || p.wireEndpoints.length > 0).length, 0);

      // Check for issues
      
      // Issue 1: Empty drawing (no connectors)
      if (connectorCount === 0) {
        issues.push({
          drawingNo: drawing.drawingNo,
          revision: drawing.revision,
          issue: 'EMPTY_DRAWING',
          severity: 'CRITICAL',
          details: `No connectors defined (0 connectors, 0 wires, 0 devices)`
        });
        criticalCount++;
      }

      // Issue 2: Connectors but no pins
      if (connectorCount > 0) {
        const emptyConnectors = drawing.connectors.filter(c => c.pins.length === 0);
        if (emptyConnectors.length > 0) {
          issues.push({
            drawingNo: drawing.drawingNo,
            revision: drawing.revision,
            issue: 'EMPTY_CONNECTORS',
            severity: 'HIGH',
            details: `${emptyConnectors.length}/${connectorCount} connectors have no pins: ${emptyConnectors.map(c => c.connectorCode).join(', ')}`
          });
          highCount++;
        }
      }

      // Issue 3: Pins without wires
      if (totalPins > 0 && wiredPins < totalPins * 0.5) {
        const unwiredPercent = (((totalPins - wiredPins) / totalPins) * 100).toFixed(1);
        issues.push({
          drawingNo: drawing.drawingNo,
          revision: drawing.revision,
          issue: 'LOW_WIRE_COVERAGE',
          severity: 'MEDIUM',
          details: `Only ${wiredPins}/${totalPins} pins wired (${unwiredPercent}% unwired)`
        });
      }

      // Issue 4: No wires linked to drawing
      if (connectorCount > 0 && wireCount === 0 && totalPins > 0 && wiredPins > 0) {
        issues.push({
          drawingNo: drawing.drawingNo,
          revision: drawing.revision,
          issue: 'NO_DRAWING_WIRES',
          severity: 'HIGH',
          details: `Has ${connectorCount} connectors with ${totalPins} pins but 0 wires linked to drawing`
        });
        highCount++;
      }

      // Issue 5: Unusual page count
      if (drawing.totalSheets < 1 && connectorCount > 0) {
        issues.push({
          drawingNo: drawing.drawingNo,
          revision: drawing.revision,
          issue: 'INVALID_PAGE_COUNT',
          severity: 'MEDIUM',
          details: `Invalid page count: ${drawing.totalSheets} (should be >= 1)`
        });
      }

      checked++;
      if (checked % 50 === 0) {
        console.log(`  Progress: ${checked}/${drawings.length} (${((checked/drawings.length)*100).toFixed(1)}%)`);
      }
    }

    // Generate report
    console.log(`\n╔════════════════════════════════════════════════════════════════════════════╗`);
    console.log(`║                        AUDIT RESULTS                                      ║`);
    console.log(`╚════════════════════════════════════════════════════════════════════════════╝\n`);

    console.log(`✓ Drawings checked: ${checked}`);
    console.log(`✓ Issues found: ${issues.length}`);
    console.log(`  • CRITICAL: ${criticalCount}`);
    console.log(`  • HIGH: ${highCount}`);
    console.log(`  • MEDIUM/LOW: ${issues.length - criticalCount - highCount}`);

    // Group by issue type
    const byType = new Map<string, DrawingIssue[]>();
    for (const issue of issues) {
      if (!byType.has(issue.issue)) {
        byType.set(issue.issue, []);
      }
      byType.get(issue.issue)!.push(issue);
    }

    console.log(`\n╔════════════════════════════════════════════════════════════════════════════╗`);
    console.log(`║                   ISSUES BY CATEGORY                                      ║`);
    console.log(`╚════════════════════════════════════════════════════════════════════════════╝\n`);

    for (const [issueType, issueList] of byType) {
      const severity = issueList[0].severity;
      const icon = severity === 'CRITICAL' ? '🔴' : severity === 'HIGH' ? '🟠' : '🟡';
      console.log(`\n${icon} ${issueType} (${issueList.length} drawings):`);
      
      // Show first 5 examples
      for (let i = 0; i < Math.min(5, issueList.length); i++) {
        const issue = issueList[i];
        console.log(`   • ${issue.drawingNo} (Rev ${issue.revision}): ${issue.details}`);
      }
      
      if (issueList.length > 5) {
        console.log(`   • ... and ${issueList.length - 5} more`);
      }
    }

    // List all CRITICAL issues
    const criticalIssues = issues.filter(i => i.severity === 'CRITICAL');
    if (criticalIssues.length > 0) {
      console.log(`\n╔════════════════════════════════════════════════════════════════════════════╗`);
      console.log(`║                   🔴 CRITICAL ISSUES (${criticalIssues.length})                               ║`);
      console.log(`╚════════════════════════════════════════════════════════════════════════════╝\n`);
      
      console.log(`EMPTY DRAWINGS - These must be fixed before production:\n`);
      for (const issue of criticalIssues) {
        console.log(`  • ${issue.drawingNo} (Rev ${issue.revision})`);
      }
    }

    // List all HIGH severity issues
    const highIssues = issues.filter(i => i.severity === 'HIGH');
    if (highIssues.length > 0) {
      console.log(`\n╔════════════════════════════════════════════════════════════════════════════╗`);
      console.log(`║                   🟠 HIGH PRIORITY (${highIssues.length})                                  ║`);
      console.log(`╚════════════════════════════════════════════════════════════════════════════╝\n`);
      
      console.log(`HIGH PRIORITY ISSUES:\n`);
      for (const issue of highIssues.slice(0, 10)) {
        console.log(`  • ${issue.drawingNo} (Rev ${issue.revision}): ${issue.issue}`);
      }
      
      if (highIssues.length > 10) {
        console.log(`  ... and ${highIssues.length - 10} more high priority issues`);
      }
    }

    // Summary by drawing status
    console.log(`\n╔════════════════════════════════════════════════════════════════════════════╗`);
    console.log(`║                   DRAWING STATUS SUMMARY                                  ║`);
    console.log(`╚════════════════════════════════════════════════════════════════════════════╝\n`);

    const perfectDrawings = drawings.filter(d => !issues.find(i => i.drawingNo === d.drawingNo));
    const problemDrawings = drawings.filter(d => issues.find(i => i.drawingNo === d.drawingNo));

    console.log(`✓ Good drawings (0 issues): ${perfectDrawings.length}/${drawings.length} (${((perfectDrawings.length/drawings.length)*100).toFixed(1)}%)`);
    console.log(`❌ Problem drawings: ${problemDrawings.length}/${drawings.length} (${((problemDrawings.length/drawings.length)*100).toFixed(1)}%)\n`);

    console.log(`Need to fix: ${problemDrawings.length} drawings\n`);

    // Export complete issue list
    console.log(`\n✓ Audit complete. Detailed findings ready for Phase 2 repair.`);
    console.log(`\n⏭️  Next: Run mapping correction script to fix each drawing systematically\n`);

  } catch (error) {
    console.error(`\n❌ Error: ${error}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
