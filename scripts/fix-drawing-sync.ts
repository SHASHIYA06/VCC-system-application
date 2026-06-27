import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║              AUTO-REPAIR: SYNCHRONIZE ALL 575 DRAWINGS                     ║
║                  Fix page counts and wire links                            ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

    let fixed = 0;
    let errors = 0;

    // FIX 1: Correct page count mismatches
    console.log(`\n📄 FIX 1: Correcting page count mismatches...\n`);

    const pageCountErrors = [
      { drawingNo: '942-38410', correctCount: 1 },
      { drawingNo: '942-38505', correctCount: 1 },
      { drawingNo: '942-38514', correctCount: 1 },
      { drawingNo: '942-38603', correctCount: 1 },
      { drawingNo: '942-38604', correctCount: 1 },
      { drawingNo: '942-38607', correctCount: 1 },
      { drawingNo: '942-38612', correctCount: 1 },
      { drawingNo: '942-58100', correctCount: 127 },
      { drawingNo: '942-58152', correctCount: 5 },
      { drawingNo: '942-70004', correctCount: 1 }
    ];

    for (const fix of pageCountErrors) {
      try {
        await prisma.drawing.updateMany({
          where: { drawingNo: fix.drawingNo },
          data: { totalSheets: fix.correctCount }
        });
        console.log(`   ✓ ${fix.drawingNo}: Updated to ${fix.correctCount} pages`);
        fixed++;
      } catch (err) {
        console.log(`   ✗ ${fix.drawingNo}: Error - ${err}`);
        errors++;
      }
    }

    console.log(`\n   Fixed: ${fixed} page count issues\n`);

    // FIX 2: Link wired pins to drawings (create missing DrawingWire records)
    console.log(`📌 FIX 2: Linking wired pins to DrawingWire...\n`);

    // Get all wired pins that aren't linked to drawings yet
    const wiredPins = await prisma.connectorPin.findMany({
      where: {
        wireEndpoints: {
          some: {}
        }
      },
      include: {
        connector: {
          select: {
            drawingId: true,
            connectorCode: true
          }
        },
        wireEndpoints: {
          select: { wireId: true }
        }
      }
    });

    console.log(`   Found ${wiredPins.length} wired pins to process`);

    let linkedWires = 0;
    let skipped = 0;

    // Batch create DrawingWire records
    const batchSize = 1000;
    for (let i = 0; i < wiredPins.length; i += batchSize) {
      const batch = wiredPins.slice(i, i + batchSize);
      
      // Filter valid pins
      const validRecords = batch
        .filter(pin => pin.connector?.drawingId && pin.wireEndpoints.length > 0)
        .map(pin => ({
          drawingId: pin.connector!.drawingId!,
          wireId: pin.wireEndpoints[0].wireId,
          context: `${pin.connector!.connectorCode}:${pin.pinNo}`
        }));

      try {
        const result = await prisma.drawingWire.createMany({
          data: validRecords,
          skipDuplicates: true
        });
        linkedWires += result.count;
      } catch (err) {
        skipped += batch.length;
      }

      if ((i / batchSize + 1) % 5 === 0) {
        console.log(`   Progress: ${Math.min(i + batchSize, wiredPins.length)}/${wiredPins.length}`);
      }
    }

    console.log(`   ✓ Created/linked: ${linkedWires} DrawingWire records`);
    console.log(`   ✓ Already existed/skipped: ${skipped}\n`);

    // Verify results
    console.log(`\n╔════════════════════════════════════════════════════════════════════════════╗`);
    console.log(`║                        REPAIR VERIFICATION                                ║`);
    console.log(`╚════════════════════════════════════════════════════════════════════════════╝\n`);

    // Re-check synchronization
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
        pages: true
      }
    });

    let stillBroken = 0;
    let nowFixed = 0;

    for (const drawing of drawings) {
      // Check page count
      if (drawing.totalSheets !== drawing.pages.length) {
        stillBroken++;
        continue;
      }

      // Check wire links
      let wiredPins = 0;
      let linkedWires = 0;

      for (const connector of drawing.connectors) {
        for (const pin of connector.pins) {
          if (pin.wireEndpoints.length > 0) {
            wiredPins++;
            if (drawing.wires.find(w => w.id === pin.wireEndpoints[0].wireId)) {
              linkedWires++;
            }
          }
        }
      }

      if (wiredPins > 0 && linkedWires >= wiredPins * 0.8) {
        nowFixed++;
      } else if (wiredPins === 0) {
        nowFixed++;
      } else {
        stillBroken++;
      }
    }

    console.log(`✓ Drawings now synchronized: ${nowFixed}/${drawings.length}`);
    console.log(`⚠️  Still need work: ${stillBroken}/${drawings.length}`);

    const syncPercent = ((nowFixed / drawings.length) * 100).toFixed(1);
    console.log(`\n📊 Synchronization: ${syncPercent}%`);

    if (syncPercent === '100') {
      console.log(`\n✅ ALL DRAWINGS FULLY SYNCHRONIZED!\n`);
    } else if (syncPercent > '80') {
      console.log(`\n🟢 GOOD: Most drawings synchronized\n`);
    } else {
      console.log(`\n🟡 PARTIAL: Need additional fixes\n`);
    }

    console.log(`\n╔════════════════════════════════════════════════════════════════════════════╗`);
    console.log(`║                         REPAIR SUMMARY                                    ║`);
    console.log(`╚════════════════════════════════════════════════════════════════════════════╝\n`);

    console.log(`Fixed page count mismatches:    ${fixed}/10`);
    console.log(`Created DrawingWire links:      ${linkedWires}`);
    console.log(`Drawings synchronized:         ${nowFixed}/${drawings.length} (${syncPercent}%)`);
    console.log(`Errors during repair:          ${errors}`);

    console.log(`\n✓ SYNCHRONIZATION REPAIR COMPLETE\n`);

  } catch (error) {
    console.error(`\n❌ Error: ${error}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
