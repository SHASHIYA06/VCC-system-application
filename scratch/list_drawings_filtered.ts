import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const seriesList = ['381', '382', '383', '384', '385', '386', '387'];
  
  console.log('=== Listing 38xxx series drawings in DB ===');
  
  for (const s of seriesList) {
    const drawings = await prisma.drawing.findMany({
      where: {
        drawingNo: { contains: s }
      },
      orderBy: { drawingNo: 'asc' }
    });
    
    console.log(`\n--- Series ${s} (${drawings.length} drawings) ---`);
    for (const d of drawings) {
      console.log(`  - ${d.drawingNo}: ${d.title} (SourceFileId: ${d.sourceFileId})`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
