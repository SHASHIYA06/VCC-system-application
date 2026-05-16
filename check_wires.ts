import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const wires = await prisma.wire.findMany({ take: 10, select: { wireNo: true } });
  console.log(wires.map(w => w.wireNo).join(', '));
}
main().finally(() => prisma.$disconnect());
