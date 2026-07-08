import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const drawingsCount = await prisma.drawing.count();
  console.log(`Total drawings in DB: ${drawingsCount}`);

  const drawings = await prisma.drawing.findMany({
    select: { drawingNo: true, title: true, revision: true },
    orderBy: { drawingNo: 'asc' }
  });

  console.log('\nList of Drawings (first 20):');
  console.log(drawings.slice(0, 20));

  const pageMappingsCount = await prisma.drawingPageMapping.count();
  console.log(`\nTotal page mappings in DB: ${pageMappingsCount}`);

  const wiresCount = await prisma.wire.count();
  console.log(`Total wires in DB: ${wiresCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
