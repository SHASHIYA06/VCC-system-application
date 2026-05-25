import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const prisma = new PrismaClient();

async function main() {
  const systems = await prisma.system.findMany({ include: { drawings: true } });
  
  // Mapping of duplicate codes to keep -> array of codes to merge and delete
  const mergeMap = {
    'TRAC': ['TRACTION'],
    'TMS': ['TIMS'],
    'COMMS': ['COMM'],
    'VAC': ['AIRCON'],
    'GEN': ['GENERAL'],
    'COUPLING': ['COUPL'],
  };

  for (const [keepCode, removeCodes] of Object.entries(mergeMap)) {
    const keepSys = systems.find(s => s.code === keepCode);
    if (!keepSys) continue;

    for (const removeCode of removeCodes) {
      const removeSys = systems.find(s => s.code === removeCode);
      if (!removeSys) continue;

      console.log(`Merging ${removeCode} into ${keepCode}...`);
      
      // Move drawings
      if (removeSys.drawings.length > 0) {
        await prisma.drawing.updateMany({
          where: { systemId: removeSys.id },
          data: { systemId: keepSys.id }
        });
      }
      
      // We can also move connectors or other related entities if any, but let's check drawing first
      try {
        await prisma.system.delete({ where: { id: removeSys.id } });
        console.log(`Deleted system ${removeCode}`);
      } catch (e) {
        console.log(`Could not delete ${removeCode}, it might have other relations:`, e.message);
      }
    }
  }

  // Now fix COMMS drawings specifically
  const commsSys = await prisma.system.findFirst({ where: { code: 'COMMS' } });
  const pisSys = await prisma.system.findFirst({ where: { code: 'PIS' } });
  const genSys = await prisma.system.findFirst({ where: { code: 'GEN' } });
  
  if (commsSys) {
    const drawings = await prisma.drawing.findMany({ where: { systemId: commsSys.id } });
    
    let toGen = 0;
    let toPis = 0;
    
    for (const d of drawings) {
      const title = d.title.toUpperCase();
      if (title.includes('OCR')) {
        if (genSys) {
          await prisma.drawing.update({
            where: { id: d.id },
            data: { systemId: genSys.id }
          });
          toGen++;
        }
      } else if (title.includes('PIS') || title.includes('PAPIS') || title.includes('DISPLAY')) {
        if (pisSys) {
          await prisma.drawing.update({
            where: { id: d.id },
            data: { systemId: pisSys.id }
          });
          toPis++;
        }
      }
    }
    console.log(`Moved ${toGen} OCR drawings from COMMS to GEN`);
    console.log(`Moved ${toPis} PIS drawings from COMMS to PIS`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
