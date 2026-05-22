import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function checkDatabase() {
  console.log('Checking database state...\n');

  try {
    const [systemCount, drawingCount, wireCount, connectorCount, pinCount, deviceCount, circuitCount, trainLineCount] = await Promise.all([
      prisma.system.count(),
      prisma.drawing.count(),
      prisma.wire.count(),
      prisma.connector.count(),
      prisma.connectorPin.count(),
      prisma.device.count(),
      prisma.circuit.count(),
      prisma.trainLine.count(),
    ]);

    console.log('=== Database State ===');
    console.log(`Systems: ${systemCount}`);
    console.log(`Drawings: ${drawingCount}`);
    console.log(`Wires: ${wireCount}`);
    console.log(`Connectors: ${connectorCount}`);
    console.log(`Pins: ${pinCount}`);
    console.log(`Devices: ${deviceCount}`);
    console.log(`Circuits: ${circuitCount}`);
    console.log(`TrainLines: ${trainLineCount}`);

    if (drawingCount > 0) {
      console.log('\n=== Sample Drawings ===');
      const drawings = await prisma.drawing.findMany({ take: 5 });
      drawings.forEach(d => {
        console.log(`- ${d.drawingNo}: ${d.title}`);
      });
    }

    if (wireCount > 0) {
      console.log('\n=== Sample Wires ===');
      const wires = await prisma.wire.findMany({ take: 5 });
      wires.forEach(w => {
        console.log(`- ${w.wireNo}: ${w.signalName || 'N/A'}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();