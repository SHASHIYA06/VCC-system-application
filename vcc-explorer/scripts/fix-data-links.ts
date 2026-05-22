import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_KyjXIOVCDW32@ep-tiny-mode-aq7698gi-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
    }
  }
});

async function fixDataLinks() {
  console.log('=== Fixing Data Links ===\n');

  // 1. Fix: Update connector pins from trainline data
  console.log('1. Linking pins from trainline data...');
  
  const trainlines = await prisma.trainLine.findMany({
    where: {
      connectorCode: { not: null },
      pinNo: { not: null },
    },
    include: { drawing: true },
  });

  let linkedCount = 0;
  for (const tl of trainlines) {
    if (tl.connectorCode && tl.pinNo && tl.drawingId) {
      const connector = await prisma.connector.findFirst({
        where: {
          drawingId: tl.drawingId,
          connectorCode: tl.connectorCode,
        },
      });

      if (connector) {
        const existingPin = await prisma.connectorPin.findFirst({
          where: {
            connectorId: connector.id,
            pinNo: tl.pinNo,
          },
        });

        if (!existingPin && tl.wireNo) {
          await prisma.connectorPin.create({
            data: {
              connectorId: connector.id,
              pinNo: tl.pinNo,
              signalName: tl.itemName,
              wireNo: tl.wireNo,
              conductorClassCode: tl.conductorClassCode,
            },
          });
          linkedCount++;
        }
      }
    }
  }
  console.log(`   Created ${linkedCount} new pin links from trainlines`);

  // 2. Fix: Update connector descriptions from drawings
  console.log('\n2. Updating connector descriptions...');
  
  const drawings = await prisma.drawing.findMany({
    where: {
      title: { contains: 'Pin Assignment', mode: 'insensitive' },
    },
    include: {
      connectors: true,
    },
    take: 20,
  });

  for (const drawing of drawings) {
    const carTypeMatch = drawing.title.match(/\((TC|DMC|MC|T|M)\s*Car\)/i);
    const carType = carTypeMatch ? carTypeMatch[1].toUpperCase() : null;

    for (const connector of drawing.connectors) {
      await prisma.connector.update({
        where: { id: connector.id },
        data: {
          carType: carType || connector.carType,
          description: connector.description || `${connector.connectorCode} - ${drawing.title}`,
        },
      });
    }
  }
  console.log(`   Updated ${drawings.length} drawings with connector info`);

  // 3. Check circuits
  console.log('\n3. Checking circuits...');
  const existingCircuits = await prisma.circuit.count();
  console.log(`   Current circuits: ${existingCircuits}`);

  // 4. Ensure all drawings have proper page count
  console.log('\n4. Updating drawing page counts...');
  const allDrawings = await prisma.drawing.findMany();
  let updatedDrawings = 0;
  
  for (const dwg of allDrawings) {
    const pages = await prisma.drawingPage.count({ where: { drawingId: dwg.id } });
    if (pages > 0 && dwg.totalSheets !== pages) {
      await prisma.drawing.update({
        where: { id: dwg.id },
        data: { totalSheets: pages },
      });
      updatedDrawings++;
    }
  }
  console.log(`   Updated ${updatedDrawings} drawing page counts`);

  // 5. Final stats
  console.log('\n=== Final Database Stats ===');
  const stats = await Promise.all([
    prisma.system.count(),
    prisma.drawing.count(),
    prisma.circuit.count(),
    prisma.connector.count(),
    prisma.connectorPin.count(),
    prisma.trainLine.count(),
    prisma.wire.count(),
    prisma.device.count(),
  ]);

  console.log(`Systems: ${stats[0]}`);
  console.log(`Drawings: ${stats[1]}`);
  console.log(`Circuits: ${stats[2]}`);
  console.log(`Connectors: ${stats[3]}`);
  console.log(`Pins: ${stats[4]}`);
  console.log(`TrainLines: ${stats[5]}`);
  console.log(`Wires: ${stats[6]}`);
  console.log(`Devices: ${stats[7]}`);

  await prisma.$disconnect();
  console.log('\n✅ Data linking fix complete!');
}

fixDataLinks().catch(console.error);