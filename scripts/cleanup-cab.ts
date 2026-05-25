import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const prisma = new PrismaClient();

async function main() {
  const commsSys = await prisma.system.findFirst({ where: { code: 'COMMS' } });
  const cabSys = await prisma.system.findFirst({ where: { code: 'CAB' } });
  
  if (commsSys && cabSys) {
    const drawings = await prisma.drawing.findMany({ where: { systemId: commsSys.id } });
    let toCab = 0;
    
    for (const d of drawings) {
      if (d.title.toUpperCase().includes('CAB_PIN') || d.title.toUpperCase().includes('CAB ')) {
        await prisma.drawing.update({
          where: { id: d.id },
          data: { systemId: cabSys.id }
        });
        toCab++;
      }
    }
    console.log(`Moved ${toCab} CAB drawings from COMMS to CAB`);
  }

  // Also TCMS / TMS
  const tmsSys = await prisma.system.findFirst({ where: { code: 'TMS' } });
  if (commsSys && tmsSys) {
    const drawings = await prisma.drawing.findMany({ where: { systemId: commsSys.id } });
    let toTms = 0;
    
    for (const d of drawings) {
      if (d.title.toUpperCase().includes('TCMS')) {
        await prisma.drawing.update({
          where: { id: d.id },
          data: { systemId: tmsSys.id }
        });
        toTms++;
      }
    }
    console.log(`Moved ${toTms} TCMS drawings from COMMS to TMS`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
