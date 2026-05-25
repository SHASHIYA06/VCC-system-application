import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const prisma = new PrismaClient();

async function main() {
  const commsSys = await prisma.system.findFirst({ where: { code: 'COMMS' } });
  const genSys = await prisma.system.findFirst({ where: { code: 'GEN' } });
  const tmsSys = await prisma.system.findFirst({ where: { code: 'TMS' } });
  
  if (commsSys && genSys) {
    const drawings = await prisma.drawing.findMany({ where: { systemId: commsSys.id } });
    let toGen = 0;
    
    for (const d of drawings) {
      const upper = d.title.toUpperCase();
      if (
        upper.includes('VCC DESCRIPTION') ||
        upper.includes('CEILING') ||
        upper.includes('UF')
      ) {
        await prisma.drawing.update({
          where: { id: d.id },
          data: { systemId: genSys.id }
        });
        toGen++;
      }
    }
    console.log(`Moved ${toGen} generic layout drawings from COMMS to GEN`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
