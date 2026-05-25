import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const prisma = new PrismaClient();

async function main() {
  const systems = await prisma.system.findMany();
  const sysMap = new Map();
  for (const s of systems) {
    sysMap.set(s.code, s);
  }

  // Find COMMS
  const commsSystem = sysMap.get('COMMS');
  const genSystem = sysMap.get('GEN');
  const pisSystem = sysMap.get('PIS');
  const commSystem = sysMap.get('COMM');
  
  if (commsSystem) {
    const drawings = await prisma.drawing.findMany({
      where: { systemId: commsSystem.id }
    });
    
    let movedToGen = 0;
    let movedToPis = 0;
    
    for (const d of drawings) {
      if (d.title.includes('OCR')) {
        if (genSystem) {
          await prisma.drawing.update({
            where: { id: d.id },
            data: { systemId: genSystem.id }
          });
          movedToGen++;
        }
      } else if (d.title.includes('PIS') || d.title.includes('PAPIS')) {
        if (pisSystem) {
          await prisma.drawing.update({
            where: { id: d.id },
            data: { systemId: pisSystem.id }
          });
          movedToPis++;
        }
      }
    }
    console.log(`Moved ${movedToGen} OCR drawings from COMMS to GEN`);
    console.log(`Moved ${movedToPis} PIS drawings from COMMS to PIS`);
  }

  // Print summary
  const updatedSystems = await prisma.system.findMany({ include: { drawings: true } });
  for (const s of updatedSystems) {
    console.log(`${s.code}: ${s.drawings.length} drawings`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
