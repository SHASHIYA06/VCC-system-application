import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADDITIONAL_DEVICES = [
  // COMMS - more devices
  { name: 'Central Control Unit 1', tag: 'CCU_01', system: 'COMMS', carType: 'DMC', location: 'Cab' },
  { name: 'Central Control Unit 2', tag: 'CCU_02', system: 'COMMS', carType: 'DMC', location: 'Cab' },
  { name: 'Intercom Unit 1', tag: 'ICOM_01', system: 'COMMS', carType: 'ALL', location: 'Saloon' },
  { name: 'Intercom Unit 2', tag: 'ICOM_02', system: 'COMMS', carType: 'ALL', location: 'Saloon' },
  { name: 'MOXA Ethernet Switch 1', tag: 'MOXA_01', system: 'COMMS', carType: 'DMC', location: 'Ceiling' },
  { name: 'MOXA Ethernet Switch 2', tag: 'MOXA_02', system: 'COMMS', carType: 'MC', location: 'Ceiling' },
  { name: 'PA Speaker 1', tag: 'SPK_01', system: 'COMMS', carType: 'ALL', location: 'Ceiling' },
  { name: 'PA Speaker 2', tag: 'SPK_02', system: 'COMMS', carType: 'ALL', location: 'Ceiling' },
  { name: 'PA Speaker 3', tag: 'SPK_03', system: 'COMMS', carType: 'ALL', location: 'Ceiling' },
  { name: 'PA Speaker 4', tag: 'SPK_04', system: 'COMMS', carType: 'ALL', location: 'Ceiling' },
];

async function run() {
  try {
    let added = 0;
    let skipped = 0;
    
    for (const device of ADDITIONAL_DEVICES) {
      const system = await prisma.system.findFirst({
        where: { code: device.system }
      });
      
      if (!system) {
        console.log(`System not found: ${device.system}`);
        skipped++;
        continue;
      }
      
      let drawing = await prisma.drawing.findFirst({
        where: { systemId: system.id }
      });
      
      if (!drawing) {
        drawing = await prisma.drawing.findFirst({
          where: { system: { code: 'GEN' } }
        });
      }
      
      if (!drawing) {
        console.log(`No drawing for system: ${device.system}`);
        skipped++;
        continue;
      }
      
      const existing = await prisma.device.findFirst({
        where: { tagNo: device.tag }
      });
      
      if (existing) {
        console.log(`Device already exists: ${device.tag}`);
        skipped++;
        continue;
      }
      
      await prisma.device.create({
        data: {
          drawingId: drawing.id,
          systemId: system.id,
          deviceName: device.name,
          tagNo: device.tag,
          carType: device.carType,
          locationTag: device.location,
          note: `${device.system} system - ${device.location}`
        }
      });
      console.log(`Added device: ${device.tag}`);
      added++;
    }
    console.log(`Done! Added: ${added}, Skipped: ${skipped}`);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
