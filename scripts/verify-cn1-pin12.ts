import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Verifying CN1 Pin 12 and other pins ===');

  const connector = await prisma.connector.findFirst({
    where: { connectorCode: 'CN1' },
    include: {
      pins: {
        orderBy: { pinNo: 'asc' }
      }
    }
  });

  if (!connector) {
    console.log('Connector CN1 not found!');
    return;
  }

  console.log(`Connector CN1 (ID: ${connector.id}):`);
  for (const pin of connector.pins) {
    console.log(`  PinNo: "${pin.pinNo}", WireNo: "${pin.wireNo}", SignalName: "${pin.signalName}"`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
