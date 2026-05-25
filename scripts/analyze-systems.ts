import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function main() {
  const systems = await prisma.system.findMany();
  const drawings = await prisma.drawing.findMany({
    include: { system: true }
  });

  const systemMap = new Map(systems.map(s => [s.code, s.id]));

  console.log(`Total Systems: ${systems.length}`);
  console.log(`Total Drawings: ${drawings.length}`);

  console.log('\nCurrent Assignments (Sample 10 COMMS):');
  const commsDrawings = drawings.filter(d => d.system?.code === 'COMMS');
  console.log(`Total COMMS Drawings: ${commsDrawings.length}`);
  for (const d of commsDrawings.slice(0, 10)) {
    console.log(` - [${d.drawingNo}] ${d.title}`);
  }

  // Keywords to System Mapping
  const rules = [
    { code: 'DOOR', keywords: ['DOOR'] },
    { code: 'BRAKE', keywords: ['BRAKE', 'AIR SUPPLY'] },
    { code: 'TRAC', keywords: ['TRACTION', 'VVVF', 'MOTOR'] },
    { code: 'HV', keywords: ['HIGH VOLTAGE', 'PANTOGRAPH', 'VCB'] },
    { code: 'VAC', keywords: ['HVAC', 'AIR CONDITION', 'VAC'] },
    { code: 'COMMS', keywords: ['PIS', 'PA', 'CCTV', 'RADIO', 'COMMUNICATION'] },
    { code: 'TMS', keywords: ['TCMS', 'TMS', 'TRAIN CONTROL'] },
    { code: 'CAB', keywords: ['CAB', 'DRIVER'] },
    { code: 'LIGHT', keywords: ['LIGHTING', 'ILLUMINATION'] },
    { code: 'APS', keywords: ['AUXILIARY POWER', 'APS', 'SIV'] },
    { code: 'BOGIE', keywords: ['BOGIE'] },
    { code: 'COUPLING', keywords: ['COUPLER', 'COUPLING'] },
    { code: 'AUX', keywords: ['BATTERY', 'AUXILIARY'] }
  ];

  let misclassifiedCount = 0;
  console.log('\nPotential Misclassifications:');

  for (const d of drawings) {
    let suggestedCode = null;
    const upperTitle = d.title.toUpperCase();
    
    for (const rule of rules) {
      if (rule.keywords.some(k => upperTitle.includes(k))) {
        suggestedCode = rule.code;
        break; // Match first rule
      }
    }

    if (suggestedCode && d.system?.code !== suggestedCode) {
      misclassifiedCount++;
      if (misclassifiedCount <= 15) {
        console.log(`[${d.drawingNo}] "${d.title}" -> Currently: ${d.system?.code || 'NONE'}, Suggested: ${suggestedCode}`);
      }
    }
  }

  console.log(`\nTotal potential misclassified drawings found: ${misclassifiedCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
