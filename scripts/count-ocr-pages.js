const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const total = await prisma.ocrPage.count();
  console.log(`Total OcrPages: ${total}`);
  
  const counts = await prisma.ocrPage.groupBy({
    by: ['sourceFileId'],
    _count: true
  });
  
  for (const c of counts) {
    const file = await prisma.sourceFile.findUnique({
      where: { id: c.sourceFileId }
    });
    console.log(`- File: ${file ? file.filename : 'Unknown'} (ID: ${c.sourceFileId}): ${c._count} pages`);
  }
  
  // Find page 35 of CAB_PIN DRAWINGS 2.pdf
  const file = await prisma.sourceFile.findFirst({
    where: { filename: 'CAB_PIN DRAWINGS 2.pdf' }
  });
  if (file) {
    const ocrPage = await prisma.ocrPage.findUnique({
      where: {
        sourceFileId_pageNo: {
          sourceFileId: file.id,
          pageNo: 35
        }
      }
    });
    if (ocrPage) {
      console.log(`\nFound page 35 of CAB_PIN DRAWINGS 2.pdf:`);
      console.log(ocrPage.rawText.substring(0, 1000));
    } else {
      console.log('\nPage 35 of CAB_PIN DRAWINGS 2.pdf not found in OcrPage');
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
