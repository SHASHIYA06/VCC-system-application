import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const allDrawings = await prisma.drawing.findMany({
    select: { id: true, drawingNo: true, revision: true }
  });
  console.log(`Total drawings in DB: ${allDrawings.length}`);

  const unmapped = await prisma.drawing.findMany({
    where: { pageMappings: { none: {} } },
    select: { id: true, drawingNo: true, revision: true }
  });
  console.log(`Unmapped drawings (${unmapped.length}):`);
  console.log(unmapped);

  const testDwg = await prisma.drawing.findFirst({
    where: { drawingNo: '942-58120A' }
  });
  console.log(`942-58120A:`, testDwg);

  const testDwg2 = await prisma.drawing.findFirst({
    where: { drawingNo: '942-58120' }
  });
  console.log(`942-58120:`, testDwg2);
}

main().catch(console.error).finally(() => prisma.$disconnect());
