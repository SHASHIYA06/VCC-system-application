import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const totalPins = await prisma.connectorPin.count();
  const pinsWithWires = await prisma.connectorPin.count({
    where: {
      wireNo: { not: null, not: '' }
    }
  });

  const pinsWithNonDummySignals = await prisma.connectorPin.count({
    where: {
      NOT: [
        { signalName: { startsWith: 'CN' } },
        { signalName: { startsWith: 'PIN' } },
        { signalName: { startsWith: 'X' } },
        { signalName: null }
      ]
    }
  });

  console.log(`Total Pins in DB: ${totalPins}`);
  console.log(`Pins with Wires: ${pinsWithWires}`);
  console.log(`Pins with actual/non-dummy Signals: ${pinsWithNonDummySignals}`);

  // Fetch a sample of pins that HAVE wireNo
  const sample = await prisma.connectorPin.findMany({
    where: {
      wireNo: { not: null, not: '' }
    },
    take: 10,
    include: {
      connector: true
    }
  });

  console.log('\nSample pins with wires:');
  sample.forEach(p => {
    console.log(`Connector ${p.connector.connectorCode} Pin ${p.pinNo}: wireNo=${p.wireNo}, signal=${p.signalName}`);
  });
}

main().finally(() => prisma.$disconnect());
