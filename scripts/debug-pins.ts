import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Debugging ConnectorPins and WireEndpoints ===');

  const unlinkedCount = await prisma.wireEndpoint.count({
    where: { pinId: null }
  });
  console.log(`Total unlinked WireEndpoints: ${unlinkedCount}`);

  // Fetch some unlinked endpoints
  const endpoints = await prisma.wireEndpoint.findMany({
    where: {
      pinId: null,
      connectorId: { not: null },
      endpointPin: { not: null },
    },
    take: 10,
    include: {
      connector: true
    }
  });

  console.log('\nSample Unlinked WireEndpoints:');
  for (const ep of endpoints) {
    console.log(`Endpoint ID: ${ep.id}`);
    console.log(`  connectorId: ${ep.connectorId} (Code: ${ep.connector?.connectorCode})`);
    console.log(`  endpointPin: "${ep.endpointPin}"`);

    // Let's see what pins exist for this connector
    if (ep.connectorId) {
      const pins = await prisma.connectorPin.findMany({
        where: { connectorId: ep.connectorId },
        take: 5
      });
      console.log(`  Pins on this connector (${pins.length}):`);
      for (const p of pins) {
        console.log(`    - pinNo: "${p.pinNo}", wireNo: "${p.wireNo}"`);
      }
    }
    console.log('-----------------------------------');
  }

  // Check some wire records to see what we have
  const sampleWires = await prisma.wire.findMany({
    where: {
      OR: [
        { sourceConnector: { not: null } },
        { destConnector: { not: null } }
      ]
    },
    take: 5
  });
  console.log('\nSample Wires in Database:');
  for (const w of sampleWires) {
    console.log(`WireNo: "${w.wireNo}", sourceConnector: "${w.sourceConnector}", sourcePin: "${w.sourcePin}", destConnector: "${w.destConnector}", destPin: "${w.destPin}"`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
