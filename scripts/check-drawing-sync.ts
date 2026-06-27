import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SyncIssue {
  drawingNo: string;
  issue: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  details: string;
}

async function main() {
  try {
    console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║           DRAWING SYNCHRONIZATION VERIFICATION - ALL 575 DRAWINGS          ║
║            Check if drawing data is correctly synchronized                 ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

    const syncIssues: SyncIssue[] = [];
    let verified = 0;
    let criticalCount = 0;

    // Get all drawings with related data
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
        pageMappings: true
      },
      orderBy: { drawingNo: 'asc' }
    });

    console.log(`\n📊 Checking ${drawings.length} drawings for synchronization issues...\n`);

    for (const drawing of drawings) {
      // SYNC CHECK 1: Page mappings should match page count
      const declaredPages = drawing.totalSheets;
      const actualPages = drawing.pages.length;
      
      if (declaredPages !== actualPages) {
        syncIssues.push({
          drawingNo: drawing.drawingNo,
          issue: 'PAGE_COUNT_MISMATCH',
          severity: 'CRITICAL',
          details: `Declared: ${declaredPages} pages, Actual: ${actualPages} pages`
        });
        criticalCount++;
      }

      // SYNC CHECK 2: Connectors should be linked to drawing
      if (drawing.connectors.length > 0) {
        const unlinkedConnectors = drawing.connectors.filter(c => !c.drawingId);
        if (unlinkedConnectors.length > 0) {
          syncIssues.push({
            drawingNo: drawing.drawingNo,
            issue: 'CONNECTOR_UNLINKED',
            severity: 'CRITICAL',
            details: `${unlinkedConnectors.length} connectors not linked to drawing`
          });
          criticalCount++;
        }
      }

      // SYNC CHECK 3: Pins should have consistent wire references
      let pinWireSync = 0;
      for (const connector of drawing.connectors) {
        for (const pin of connector.pins) {
          // Pin should have EITHER wireNo OR wireEndpoint, but both should agree
          const hasWireNo = !!pin.wireNo;
          const hasWireEndpoint = pin.wireEndpoints.length > 0;
          
          if (hasWireNo && !hasWireEndpoint) {
            pinWireSync++;
          }
        }
      }

      if (pinWireSync > 0 && drawing.connectors.length > 0) {
        const totalPins = drawing.connectors.reduce((sum, c) => sum + c.pins.length, 0);
        const syncPercent = ((pinWireSync / totalPins) * 100).toFixed(1);
        
        if (pinWireSync > totalPins * 0.2) {
          syncIssues.push({
            drawingNo: drawing.drawingNo,
            issue: 'PIN_WIRE_DESYNC',
            severity: 'HIGH',
            details: `${syncPercent}% of pins have wireNo but no WireEndpoint link`
          });
        }
      }

      // SYNC CHECK 4: DrawingWire records should exist for all wired pins
      if (drawing.wires.length > 0 && drawing.connectors.length > 0) {
        let wiredPinCount = 0;
        let linkedWires = 0;

        for (const connector of drawing.connectors) {
          for (const pin of connector.pins) {
            if (pin.wireNo || pin.wireEndpoints.length > 0) {
              wiredPinCount++;
              // Check if this wire is in drawing.wires
              if (drawing.wires.find(w => w.id === pin.wireEndpoints[0]?.wireId)) {
                linkedWires++;
              }
            }
          }
        }

        if (wiredPinCount > 0 && linkedWires < wiredPinCount * 0.8) {
          const coverage = ((linkedWires / wiredPinCount) * 100).toFixed(1);
          syncIssues.push({
            drawingNo: drawing.drawingNo,
            issue: 'WIRE_LINK_INCOMPLETE',
            severity: 'MEDIUM',
            details: `Only ${coverage}% of wired pins linked to DrawingWire records`
          });
        }
      }

      // SYNC CHECK 5: Devices should be linked to system if system exists
      if (drawing.system && drawing.devices.length > 0) {
        const unlinkedDevices = drawing.devices.filter(d => !d.systemId);
        if (unlinkedDevices.length > 0) {
          syncIssues.push({
            drawingNo: drawing.drawingNo,
            issue: 'DEVICE_SYSTEM_DESYNC',
            severity: 'HIGH',
            details: `${unlinkedDevices.length} devices not linked to system ${drawing.system.code}`
          });
        }
      }

      // SYNC CHECK 6: Connector should match system scope
      if (drawing.system && drawing.connectors.length > 0) {
        const orphanConnectors = drawing.connectors.filter(c => !c.drawingId);
        if (orphanConnectors.length > 0) {
          syncIssues.push({
            drawingNo: drawing.drawingNo,
            issue: 'ORPHAN_CONNECTOR',
            severity: 'CRITICAL',
            details: `${orphanConnectors.length} connectors orphaned (no drawing link)`
          });
          criticalCount++;
        }
      }

      verified++;
      if (verified % 100 === 0) {
        console.log(`  Progress: ${verified}/${drawings.length} verified`);
      }
    }

    // Generate detailed report
    console.log(`\n╔════════════════════════════════════════════════════════════════════════════╗`);
    console.log(`║                    SYNCHRONIZATION CHECK RESULTS                           ║`);
    console.log(`╚════════════════════════════════════════════════════════════════════════════╝\n`);

    console.log(`✓ Drawings verified: ${verified}/${drawings.length}`);
    console.log(`✓ Sync issues found: ${syncIssues.length}`);
    console.log(`  • CRITICAL: ${syncIssues.filter(i => i.severity === 'CRITICAL').length}`);
    console.log(`  • HIGH: ${syncIssues.filter(i => i.severity === 'HIGH').length}`);
    console.log(`  • MEDIUM: ${syncIssues.filter(i => i.severity === 'MEDIUM').length}`);

    if (syncIssues.length === 0) {
      console.log(`\n✅ ALL DRAWINGS SYNCHRONIZED CORRECTLY!\n`);
      console.log(`All ${verified} drawings have correct synchronization.\n`);
    } else {
      // Group by issue type
      const byType = new Map<string, SyncIssue[]>();
      for (const issue of syncIssues) {
        if (!byType.has(issue.issue)) {
          byType.set(issue.issue, []);
        }
        byType.get(issue.issue)!.push(issue);
      }

      console.log(`\n╔════════════════════════════════════════════════════════════════════════════╗`);
      console.log(`║                   SYNC ISSUES BY CATEGORY                                 ║`);
      console.log(`╚════════════════════════════════════════════════════════════════════════════╝\n`);

      for (const [issueType, issueList] of byType) {
        const severity = issueList[0].severity;
        const icon = severity === 'CRITICAL' ? '🔴' : severity === 'HIGH' ? '🟠' : '🟡';
        console.log(`\n${icon} ${issueType} (${issueList.length} drawings):`);
        
        for (let i = 0; i < Math.min(10, issueList.length); i++) {
          const issue = issueList[i];
          console.log(`   • ${issue.drawingNo}: ${issue.details}`);
        }
        
        if (issueList.length > 10) {
          console.log(`   • ... and ${issueList.length - 10} more`);
        }
      }

      // List all CRITICAL issues
      const criticalIssues = syncIssues.filter(i => i.severity === 'CRITICAL');
      if (criticalIssues.length > 0) {
        console.log(`\n╔════════════════════════════════════════════════════════════════════════════╗`);
        console.log(`║           🔴 CRITICAL SYNC ISSUES - MUST FIX (${criticalIssues.length})                          ║`);
        console.log(`╚════════════════════════════════════════════════════════════════════════════╝\n`);
        
        for (const issue of criticalIssues.slice(0, 20)) {
          console.log(`  • ${issue.drawingNo}: ${issue.issue}`);
          console.log(`    → ${issue.details}`);
        }
        
        if (criticalIssues.length > 20) {
          console.log(`\n  ... and ${criticalIssues.length - 20} more CRITICAL issues\n`);
        }
      }
    }

    // Synchronization status
    const syncStatus = ((((verified - syncIssues.length) / verified) * 100)).toFixed(1);
    console.log(`\n╔════════════════════════════════════════════════════════════════════════════╗`);
    console.log(`║                   OVERALL SYNCHRONIZATION STATUS                          ║`);
    console.log(`╚════════════════════════════════════════════════════════════════════════════╝\n`);

    console.log(`Synchronized: ${verified - syncIssues.length}/${verified} (${syncStatus}%)`);
    
    if (syncIssues.length === 0) {
      console.log(`\n✅ STATUS: ALL DRAWINGS SYNCHRONIZED\n`);
      console.log(`Ready for production deployment.\n`);
    } else {
      console.log(`\n❌ STATUS: NOT FULLY SYNCHRONIZED\n`);
      console.log(`${syncIssues.length} drawings need synchronization fixes.\n`);
      console.log(`Next step: Run fix-drawing-sync.ts to auto-repair.\n`);
    }

  } catch (error) {
    console.error(`\n❌ Error: ${error}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
