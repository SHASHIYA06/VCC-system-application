import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
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
      },
      orderBy: { drawingNo: 'asc' }
    });

    const noConnectors: any[] = [];
    const emptyConnectors: any[] = [];
    const pageCountIssues: any[] = [];

    for (const drawing of drawings) {
      // Page count check
      if (drawing.totalSheets !== drawing.pages.length && drawing.totalSheets > 0) {
        pageCountIssues.push(drawing);
      }

      // Connector checks
      if (drawing.connectors.length === 0) {
        noConnectors.push(drawing);
      } else {
        const totalPins = drawing.connectors.reduce((sum, c) => sum + c.pins.length, 0);
        if (totalPins === 0) {
          emptyConnectors.push(drawing);
        }
      }
    }

    console.log(`\n╔════════════════════════════════════════════════════════════════════════════╗`);
    console.log(`║         FAILED DRAWINGS - DETAILED CATEGORIZATION                         ║`);
    console.log(`╚════════════════════════════════════════════════════════════════════════════╝\n`);

    console.log(`\n═══════════════════════════════════════════════════════════════════════════════`);
    console.log(`CATEGORY 1: NO CONNECTORS DEFINED (${noConnectors.length} drawings)`);
    console.log(`═══════════════════════════════════════════════════════════════════════════════\n`);

    for (const d of noConnectors) {
      console.log(`  ${d.drawingNo} (Rev ${d.revision}) - System: ${d.system?.code || 'UNASSIGNED'}`);
    }

    console.log(`\n═══════════════════════════════════════════════════════════════════════════════`);
    console.log(`CATEGORY 2: EMPTY CONNECTORS (${emptyConnectors.length} drawings)`);
    console.log(`═══════════════════════════════════════════════════════════════════════════════\n`);

    for (const d of emptyConnectors) {
      const connectorCodes = d.connectors.map((c: any) => c.connectorCode).join(', ');
      console.log(`  ${d.drawingNo} (Rev ${d.revision})`);
      console.log(`    Connectors: ${connectorCodes}`);
      console.log(`    System: ${d.system?.code || 'UNASSIGNED'}`);
    }

    console.log(`\n═══════════════════════════════════════════════════════════════════════════════`);
    console.log(`CATEGORY 3: PAGE COUNT ISSUES (${pageCountIssues.length} drawings)`);
    console.log(`═══════════════════════════════════════════════════════════════════════════════\n`);

    for (const d of pageCountIssues) {
      console.log(`  ${d.drawingNo} (Rev ${d.revision})`);
      console.log(`    Declared: ${d.totalSheets}, Actual: ${d.pages.length}`);
    }

    console.log(`\n\n╔════════════════════════════════════════════════════════════════════════════╗`);
    console.log(`║                            SUMMARY                                        ║`);
    console.log(`╚════════════════════════════════════════════════════════════════════════════╝\n`);

    console.log(`No Connectors:     ${noConnectors.length}`);
    console.log(`Empty Connectors:  ${emptyConnectors.length}`);
    console.log(`Page Count Issues: ${pageCountIssues.length}`);
    console.log(`TOTAL FAILED:      ${noConnectors.length + emptyConnectors.length + pageCountIssues.length}\n`);

  } catch (error) {
    console.error(`Error:`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
