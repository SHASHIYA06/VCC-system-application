import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== OCR Pages Count per File ===');
  const counts = await prisma.ocrPage.groupBy({
    by: ['sourceFileId'],
    _count: true
  });
  
  for (const c of counts) {
    console.log(`- File: "${c.sourceFileId}", Pages: ${c._count}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
