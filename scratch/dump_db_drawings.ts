import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const drawings = await prisma.drawing.findMany({
    orderBy: { drawingNo: 'asc' }
  });

  console.log(`=== Total drawings in DB: ${drawings.length} ===`);
  for (const d of drawings) {
    console.log(`- DrawingNo: "${d.drawingNo}", Title: "${d.title}", SourceFileId: "${d.sourceFileId}", Remarks: "${d.remarks}"`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
