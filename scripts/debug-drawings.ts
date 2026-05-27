import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Inspecting Drawings and SourceFiles ===');

  const drawingsCount = await prisma.drawing.count();
  console.log(`Total Drawings: ${drawingsCount}`);

  // Fetch some drawings
  const drawings = await prisma.drawing.findMany({
    take: 10,
    include: {
      system: true
    }
  });

  console.log('\nSample Drawings:');
  for (const d of drawings) {
    console.log(`ID: ${d.id}`);
    console.log(`  DrawingNo: "${d.drawingNo}"`);
    console.log(`  Title: "${d.title}"`);
    console.log(`  SourceFileId: "${d.sourceFileId}"`);
    console.log(`  Remarks: "${d.remarks}"`);
    console.log('-----------------------------------');
  }

  // Fetch some source files
  const sourceFiles = await prisma.sourceFile.findMany({
    take: 10
  });
  console.log('\nSample SourceFiles:');
  for (const sf of sourceFiles) {
    console.log(`ID: "${sf.id}", Filename: "${sf.filename}"`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
