import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const prisma = new PrismaClient();

async function main() {
  const commsSys = await prisma.system.findFirst({ where: { code: 'COMMS' } });
  if (commsSys) {
    const drawings = await prisma.drawing.findMany({ where: { systemId: commsSys.id } });
    const prefixes: Record<string, number> = {};
    
    for (const d of drawings) {
      // Get the first 3 words or so
      const match = d.title.match(/^([A-Za-z_]+(?:\s+[A-Za-z_]+)?)/);
      const prefix = match ? match[1] : d.title;
      prefixes[prefix] = (prefixes[prefix] || 0) + 1;
    }
    
    console.log("Prefix summary for COMMS:");
    for (const [p, c] of Object.entries(prefixes).sort((a, b) => b[1] - a[1])) {
      if (c > 2) {
        console.log(`${p}: ${c} drawings`);
      }
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
