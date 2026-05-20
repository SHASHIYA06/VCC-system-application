import { prisma } from '../src/lib/prisma';

async function main() {
  const stats = await Promise.all([
    prisma.system.count(),
    prisma.drawing.count(),
    prisma.trainLine.count(),
    prisma.wire.count(),
    prisma.connector.count(),
    prisma.connectorPin.count(),
    prisma.wireEndpoint.count(),
  ]);

  console.log('=== Database Statistics ===');
  console.log(`Systems: ${stats[0]}`);
  console.log(`Drawings: ${stats[1]}`);
  console.log(`Trainlines: ${stats[2]}`);
  console.log(`Wires: ${stats[3]}`);
  console.log(`Connectors: ${stats[4]}`);
  console.log(`Pins: ${stats[5]}`);
  console.log(`Wire Endpoints: ${stats[6]}`);
  
  await prisma.$disconnect();
}

main();
