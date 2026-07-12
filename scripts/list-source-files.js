const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const files = await prisma.sourceFile.findMany();
  console.log('Source Files:');
  for (const f of files) {
    console.log(`- ${f.filename} (ID: ${f.id})`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
