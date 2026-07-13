import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const total = await prisma.drawing.count();
  const mapped = await prisma.drawing.count({
    where: {
      isSynced: true
    }
  });
  console.log(`Total: ${total}, Mapped: ${mapped}, Coverage: ${total > 0 ? ((mapped / total) * 100).toFixed(2) : '0.00'}%`);
  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
