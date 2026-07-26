import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Running comprehensive seed...');
  
  // Get or create project
  let project = await prisma.project.findFirst();
  if (!project) {
    project = await prisma.project.create({ data: { projectCode: 'KMRCL-RS3R', projectName: 'KMRCL RS3R Metro', description: 'Kochi Metro Rail Corporation RS3R Vehicles' } });
  }
  console.log(`Project: ${project.projectCode}`);

  // Get a drawing for device references
  const refDrawing = await prisma.drawing.findFirst({ where: { projectId: project.id } });
  if (!refDrawing) { console.log('No drawings found - skipping device seed'); return; }

  const systemMap = new Map((await prisma.system.findMany()).map(s => [s.code, s]));

  // Seed equipment
  const EQUIPMENT = [
    { code: 'LTEB1', name: 'Low Tension Equipment Box 1', carType: 'DMC', systemCode: 'LTEB', location: 'Underframe' },
    { code: 'LTEB2', name: 'Low Tension Equipment Box 2', carType: 'TC', systemCode: 'LTEB', location: 'Underframe' },
    { code: 'LTEB3', name: 'Low Tension Equipment Box 3', carType: 'MC', systemCode: 'LTEB', location: 'Underframe' },
    { code: 'LTJB1', name: 'Low Tension Junction Box 1', carType: 'DMC', systemCode: 'LTJB', location: 'Underframe' },
    { code: 'LTJB2', name: 'Low Tension Junction Box 2', carType: 'TC', systemCode: 'LTJB', location: 'Underframe' },
    { code: 'V1', name: 'VVVF Inverter 1', carType: 'DMC', systemCode: 'TRAC', location: 'Underframe' },
    { code: 'V2', name: 'VVVF Inverter 2', carType: 'MC', systemCode: 'TRAC', location: 'Underframe' },
    { code: 'BCU1', name: 'Brake Control Unit 1', carType: 'DMC', systemCode: 'BRAKE', location: 'Underframe' },
    { code: 'BCU2', name: 'Brake Control Unit 2', carType: 'TC', systemCode: 'BRAKE', location: 'Underframe' },
    { code: 'BCU3', name: 'Brake Control Unit 3', carType: 'MC', systemCode: 'BRAKE', location: 'Underframe' },
    { code: 'BECU1', name: 'Brake Electronic Control Unit 1', carType: 'MC', systemCode: 'BRAKE', location: 'Underframe' },
    { code: 'EDB1', name: 'Electrical Distribution Box 1', carType: 'MC', systemCode: 'EDB', location: 'Ceiling' },
    { code: 'EDB2', name: 'Electrical Distribution Box 2', carType: 'TC', systemCode: 'EDB', location: 'Ceiling' },
    { code: 'APS1', name: 'Auxiliary Power Supply 1', carType: 'TC', systemCode: 'APS', location: 'Underframe' },
    { code: 'SSB1', name: 'Shore Supply Box 1', carType: 'TC', systemCode: 'APS', location: 'Underframe' },
    { code: 'BATT1', name: 'Battery Box 1', carType: 'TC', systemCode: 'APS', location: 'Underframe' },
    { code: 'HSCB1', name: 'High Speed Circuit Breaker 1', carType: 'DMC', systemCode: 'HV', location: 'Underframe' },
    { code: 'HSCB2', name: 'High Speed Circuit Breaker 2', carType: 'MC', systemCode: 'HV', location: 'Underframe' },
    { code: 'MSB1', name: 'Main Switch Box 1', carType: 'DMC', systemCode: 'HV', location: 'Underframe' },
    { code: 'TCMS_RIO1', name: 'TCMS Remote IO Unit 1', carType: 'MC', systemCode: 'TMS', location: 'Ceiling' },
    { code: 'TCMS_RIO2', name: 'TCMS Remote IO Unit 2', carType: 'TC', systemCode: 'TMS', location: 'Ceiling' },
    { code: 'ETH_SW1', name: 'Ethernet Switch 1', carType: 'MC', systemCode: 'COMMS', location: 'Ceiling' },
    { code: 'ETH_SW2', name: 'Ethernet Switch 2', carType: 'TC', systemCode: 'COMMS', location: 'Ceiling' },
    { code: 'DCU1', name: 'Door Control Unit 1', carType: 'MC', systemCode: 'DOOR', location: 'Ceiling' },
    { code: 'DCU2', name: 'Door Control Unit 2', carType: 'TC', systemCode: 'DOOR', location: 'Ceiling' },
    { code: 'VAC1', name: 'Saloon VAC Unit 1', carType: 'MC', systemCode: 'VAC', location: 'Ceiling' },
    { code: 'VAC2', name: 'Saloon VAC Unit 2', carType: 'TC', systemCode: 'VAC', location: 'Ceiling' },
    { code: 'OP_PNL1', name: 'Operating Panel', carType: 'DMC', systemCode: 'CAB', location: 'Cab Desk' },
    { code: 'IND_PNL1', name: 'Indicator Panel', carType: 'DMC', systemCode: 'CAB', location: 'Cab Desk' },
    { code: 'MCB_PNL1', name: 'MCB Panel', carType: 'DMC', systemCode: 'CAB', location: 'Cab' },
    { code: 'TFT_R1', name: 'TFT Display R1', carType: 'MC', systemCode: 'DISPLAY', location: 'Ceiling' },
    { code: 'TFT_L1', name: 'TFT Display L1', carType: 'MC', systemCode: 'DISPLAY', location: 'Ceiling' },
    { code: 'COMP1', name: 'Compressor Motor', carType: 'TC', systemCode: 'BRAKE', location: 'Underframe' },
    { code: 'CSJB1', name: 'Collector Shoe Junction Box 1', carType: 'DMC', systemCode: 'HV', location: 'Underframe' },
    { code: 'TM1', name: 'Traction Motor 1', carType: 'DMC', systemCode: 'TRAC', location: 'Bogie' },
    { code: 'TM2', name: 'Traction Motor 2', carType: 'MC', systemCode: 'TRAC', location: 'Bogie' },
  ];

  let devicesAdded = 0;
  for (const eq of EQUIPMENT) {
    const system = systemMap.get(eq.systemCode);
    if (!system) continue;
    const existing = await prisma.device.findFirst({ where: { tagNo: eq.code } });
    if (!existing) {
      await prisma.device.create({
        data: { drawingId: refDrawing.id, systemId: system.id, tagNo: eq.code, deviceName: eq.name, carType: eq.carType, locationTag: eq.location }
      });
      devicesAdded++;
    }
  }
  console.log(`Devices added: ${devicesAdded}`);

  // Seed ConductorClasses
  const classes = [
    { code: 'TL-C', description: 'Train Line - Control', voltageDomain: '110V DC' },
    { code: 'TL-S', description: 'Train Line - Signal', voltageDomain: '24V DC' },
    { code: 'TL-LP', description: 'Train Line - Low Power', voltageDomain: '110V DC' },
    { code: 'TL-HP', description: 'Train Line - High Power', voltageDomain: '750V DC' },
    { code: 'LC', description: 'Local Cable', voltageDomain: '110V DC' },
    { code: 'IC', description: 'Inter-Car Cable', voltageDomain: '110V DC' },
    { code: 'HV', description: 'High Voltage Cable', voltageDomain: '750V DC' },
  ];
  for (const cls of classes) {
    await prisma.conductorClass.upsert({ where: { code: cls.code }, update: cls, create: cls });
  }
  console.log(`ConductorClasses: ${classes.length}`);

  // Final counts
  const devices = await prisma.device.count();
  const systems = await prisma.system.count();
  const drawings = await prisma.drawing.count();
  console.log(`\nFinal: ${systems} systems, ${drawings} drawings, ${devices} devices`);
  console.log('✅ Seed complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
