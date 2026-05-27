import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Verifying CN1 (ID: 493c7699-547f-446c-8190-82877e883244) ===');

  const connector = await prisma.connector.findUnique({
    where: { id: '493c7699-547f-446c-8190-82877e883244' },
    include: {
      pins: {
        orderBy: { pinNo: 'asc' }
      }
    }
  });

  if (!connector) {
    console.log('Connector not found!');
    return;
  }

  console.log(`Connector ${connector.connectorCode} (ID: ${connector.id}, DrawingId: ${connector.drawingId}):`);
  for (const pin of connector.pins) {
    console.log(`  PinNo: "${pin.pinNo}", WireNo: "${pin.wireNo}", SignalName: "${pin.signalName}"`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
