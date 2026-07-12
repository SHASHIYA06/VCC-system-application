const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const total = await prisma.sourcePage.count();
  console.log(`Total SourcePages: ${total}`);
  
  const counts = await prisma.sourcePage.groupBy({
    by: ['sourceFileId'],
    _count: true
  });
  
  for (const c of counts) {
    const file = await prisma.sourceFile.findUnique({
      where: { id: c.sourceFileId }
    });
    console.log(`- File: ${file ? file.filename : 'Unknown'} (ID: ${c.sourceFileId}): ${c._count} pages`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
