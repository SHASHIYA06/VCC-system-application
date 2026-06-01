import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const total = await prisma.drawing.count();
  const mapped = await prisma.drawingPage.count({
    where: {
      extra: {
        path: ['pdfPageNo'],
        not: null
      }
    }
  });
  console.log(`Total: ${total}, Mapped: ${mapped}, Coverage: ${((mapped/total)*100).toFixed(2)}%`);
  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
