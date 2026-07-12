const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const drawings = await prisma.drawing.findMany({
    where: {
      drawingNo: '942-38119'
    },
    include: {
      system: true,
      pageMappings: true
    }
  });
  
  console.log(`Found ${drawings.length} drawings with drawingNo = 942-38119`);
  for (const d of drawings) {
    console.log(`\nID: ${d.id}, No: ${d.drawingNo}, Title: ${d.title}, System: ${d.system?.code}`);
    console.log(`Page Mappings (${d.pageMappings.length}):`);
    for (const m of d.pageMappings) {
      console.log(`  - Page ${m.pdfPageNo} in ${m.sourceFileName} (sourceFileId: ${m.sourceFileId})`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
