import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
const prisma = new PrismaClient();

async function main() {
  console.log('Starting System Classification Fix...');

  // Step 1: Standardize 'COMM' to 'COMMS' if COMM exists
  const commSystem = await prisma.system.findFirst({ where: { code: 'COMM' } });
  const commsSystem = await prisma.system.findFirst({ where: { code: 'COMMS' } });
  
  if (commSystem && commsSystem) {
    console.log('Merging COMM into COMMS...');
    await prisma.drawing.updateMany({
      where: { systemId: commSystem.id },
      data: { systemId: commsSystem.id }
    });
    // Can't delete system easily if it has constraints, so we just empty it.
  }

  // Reload systems to build a fresh map
  const systems = await prisma.system.findMany();
  const systemMap = new Map(systems.map(s => [s.code, s.id]));

  // Rules based on keywords in drawing titles
  const rules = [
    { code: 'DOOR', keywords: ['DOOR'] },
    { code: 'BRAKE', keywords: ['BRAKE', 'AIR SUPPLY', 'COMPRESSOR'] },
    { code: 'TRAC', keywords: ['TRACTION', 'VVVF', 'MOTOR', 'INVERTER', 'TRAC'] },
    { code: 'HV', keywords: ['HIGH VOLTAGE', 'PANTOGRAPH', 'VCB'] },
    { code: 'VAC', keywords: ['HVAC', 'AIR CONDITION', 'VAC', 'VENTILATION'] },
    { code: 'COMMS', keywords: ['PIS', 'PA', 'CCTV', 'RADIO', 'COMMUNICATION', 'COMM', 'DISPLAY', 'SPEAKER'] },
    { code: 'TMS', keywords: ['TCMS', 'TMS', 'TRAIN CONTROL', 'CCU'] },
    { code: 'CAB', keywords: ['CAB', 'DRIVER', 'WIPER'] },
    { code: 'LIGHT', keywords: ['LIGHTING', 'ILLUMINATION', 'LIGHT'] },
    { code: 'APS', keywords: ['AUXILIARY POWER', 'APS', 'SIV'] },
    { code: 'BOGIE', keywords: ['BOGIE'] },
    { code: 'COUPLING', keywords: ['COUPLER', 'COUPLING', 'UNCOUPLING'] },
    { code: 'AUX', keywords: ['BATTERY', 'AUXILIARY'] }
  ];

  const drawings = await prisma.drawing.findMany({ include: { system: true } });
  let updatedCount = 0;

  for (const d of drawings) {
    let suggestedCode = null;
    const upperTitle = d.title.toUpperCase();

    for (const rule of rules) {
      if (rule.keywords.some(k => upperTitle.includes(k))) {
        suggestedCode = rule.code;
        break;
      }
    }

    if (suggestedCode && systemMap.has(suggestedCode)) {
      if (d.system?.code !== suggestedCode) {
        await prisma.drawing.update({
          where: { id: d.id },
          data: { systemId: systemMap.get(suggestedCode) }
        });
        updatedCount++;
        console.log(`Updated [${d.drawingNo}] "${d.title}" -> ${suggestedCode}`);
      }
    } else if (d.title.includes('OCR')) {
      // For generic OCR pages without keywords, we can attempt a guess based on document clusters.
      // E.g., page numbers in a certain range belong to a certain system.
      // If we don't have exact rules, we leave them in GEN.
      if (d.system?.code !== 'GEN' && !d.system?.code) {
         if (systemMap.has('GEN')) {
           await prisma.drawing.update({
             where: { id: d.id },
             data: { systemId: systemMap.get('GEN') }
           });
           updatedCount++;
         }
      }
    }
  }

  console.log(`\nClassification complete. Total drawings updated: ${updatedCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
