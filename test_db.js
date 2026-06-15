const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const mappings = await prisma.drawingPageMapping.findMany({
    where: { sourceFileName: { contains: 'OCR' } },
    take: 5
  });
  console.log(mappings);
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
