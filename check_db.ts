import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const drawCount = await prisma.drawing.count();
  const wireCount = await prisma.wire.count();
  const pinCount = await prisma.connectorPin.count();
  const trainLineCount = await prisma.trainLine.count();
  console.log(`Drawings: ${drawCount}, Wires: ${wireCount}, Pins: ${pinCount}, TrainLines: ${trainLineCount}`);
}
main().finally(() => prisma.$disconnect());
