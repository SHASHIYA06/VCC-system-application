import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const connector = await prisma.connector.findFirst({
    where: { connectorCode: 'APS_CN1' },
    include: {
      pins: {
        take: 10
      }
    }
  });

  if (!connector) {
    console.log('Connector not found!');
    return;
  }

  console.log('Connector:', {
    id: connector.id,
    connectorCode: connector.connectorCode,
    pinCount: connector.pinCount,
  });

  console.log('Pins sample:');
  connector.pins.forEach(p => {
    console.log(`Pin ${p.pinNo}: label=${p.pinLabel}, wireNo=${p.wireNo}, signal=${p.signalName}`);
  });

  const pinsWithWiresCount = await prisma.connectorPin.count({
    where: {
      connectorId: connector.id,
      wireNo: { not: null, not: '' }
    }
  });
  console.log(`Pins with wires in DB count: ${pinsWithWiresCount}`);
}

main().finally(() => prisma.$disconnect());
