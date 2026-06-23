import { prisma } from '@/lib/prisma';

export async function seedDatabase() {
  console.log('Starting seed...');
  
  // 1. Ensure Project exists
  const project = await prisma.project.findFirst();
  const finalProject = project || await prisma.project.create({
    data: { projectCode: 'KMRCL_RS3R', projectName: 'KMRCL RS3R Metro' }
  });
  console.log('Project:', finalProject.projectCode);

  // 2. Create Systems
  const systemData = [
    { code: 'GEN', name: 'General', description: 'General documentation', sortOrder: 0 },
    { code: 'TRAC', name: 'Traction', description: 'Traction System', sortOrder: 1 },
    { code: 'BRAKE', name: 'Brake', description: 'Brake System', sortOrder: 2 },
    { code: 'DOOR', name: 'Door', description: 'Door Control', sortOrder: 3 },
    { code: 'TMS', name: 'TCMS', description: 'Train Control and Management', sortOrder: 4 },
    { code: 'APS', name: 'Auxiliary Power', description: 'Auxiliary Power Supply', sortOrder: 5 },
  ];
  
  for (const sys of systemData) {
    await prisma.system.upsert({
      where: { code: sys.code },
      update: sys,
      create: sys
    });
  }
  console.log('Systems created');
  
  const tracSystem = await prisma.system.findUniqueOrThrow({ where: { code: 'TRAC' }});
  
  // 3. Create Subsystems
  const subSystems = [
    { systemId: tracSystem.id, code: 'INV', name: 'Inverter', description: 'Traction Inverter' },
    { systemId: tracSystem.id, code: 'MOT', name: 'Motor', description: 'Traction Motor' },
  ];
  
  for (const sub of subSystems) {
    await prisma.subsystem.upsert({
      where: { systemId_code: { systemId: sub.systemId, code: sub.code } },
      update: sub,
      create: sub
    });
  }
  console.log('Subsystems created');

  // 4. Create Formation
  const formation = await prisma.formation.findFirst() || await prisma.formation.create({
    data: { projectId: finalProject.id, formationCode: 'RS3R_01', formationName: 'Set 01', carCount: 6 }
  });
  console.log('Formation:', formation.formationCode);
  
  // 5. Create Cars
  for (let i = 1; i <= 6; i++) {
    let car = await prisma.car.findFirst({
      where: { formationId: formation.id, carPosition: i }
    });
    
    if (!car) {
      car = await prisma.car.create({
        data: { 
          formationId: formation.id, 
          carCode: `DMC${i}`, 
          carPosition: i, 
          carType: i % 2 === 1 ? 'DMC' : 'TC', 
          carLabel: `Car ${i}` 
        }
      });
    }
    
    // Link car to all systems
    for (const sys of systemData) {
      const sysRec = await prisma.system.findUnique({ where: { code: sys.code } });
      if (sysRec) {
        await prisma.carSystem.upsert({
          where: { carId_systemId: { carId: car.id, systemId: sysRec.id } },
          update: {},
          create: { carId: car.id, systemId: sysRec.id }
        });
      }
    }
  }
  console.log('Cars created');
  
  // 6. Create Test Drawing
  let testDrawing = await prisma.drawing.findFirst({
    where: { 
      projectId: finalProject.id, 
      drawingNo: '942-58120A',
      revision: 'A'
    }
  });
  
  if (!testDrawing) {
    testDrawing = await prisma.drawing.create({
      data: {
        projectId: finalProject.id,
        drawingNo: '942-58120A',
        systemId: tracSystem.id,
        title: 'Traction Inverter Schematic',
        revision: 'A',
        totalSheets: 1,
        remarks: 'Main traction inverter diagram',
      }
    });
  } else {
    testDrawing = await prisma.drawing.update({
      where: { id: testDrawing.id },
      data: {
        systemId: tracSystem.id,
        title: 'Traction Inverter Schematic',
        totalSheets: 1,
        remarks: 'Main traction inverter diagram'
      }
    });
  }
  console.log('Test Drawing:', testDrawing.drawingNo);

  // 7. Create Device
  const device = await prisma.device.upsert({
    where: { id: 'test-inv-device' },
    update: {},
    create: {
      id: 'test-inv-device',
      drawingId: testDrawing.id,
      systemId: tracSystem.id,
      tagNo: 'INV-01',
      deviceName: 'Traction Inverter Module',
      deviceType: 'Inverter',
      carType: 'DMC',
      manufacturerRef: 'ABB-1234',
      isVerified: true,
    }
  });
  console.log('Device created');
  
  // 8. Create Connector
  const connector = await prisma.connector.upsert({
    where: { id: 'test-conn-1' },
    update: {},
    create: {
      id: 'test-conn-1',
      drawingId: testDrawing.id,
      connectorCode: 'CN-101',
      pinCount: 8,
      carType: 'DMC',
      description: 'Main Power Connector'
    }
  });
  
  // 9. Create Connector Pins
  for (let i = 1; i <= 8; i++) {
    await prisma.connectorPin.upsert({
      where: { id: `pin-${connector.id}-${i}` },
      update: {},
      create: {
        id: `pin-${connector.id}-${i}`,
        connectorId: connector.id,
        pinNo: String(i),
        signalName: i % 2 === 1 ? 'POSITIVE' : 'NEGATIVE',
        wireNo: i <= 4 ? `W-${i * 100}` : null
      }
    });
  }
  console.log('Connector and pins created');
  
  // 10. Create Wires
  for (let i = 1; i <= 4; i++) {
    await prisma.wire.upsert({
      where: { id: `wire-${i}` },
      update: {},
      create: {
        id: `wire-${i}`,
        wireNo: `W-${i*100}`,
        signalName: `Power ${i}`,
        wireColor: i % 2 === 1 ? 'RED' : 'BLUE',
        wireSize: '16mm²',
        voltageClass: '110V',
        description: 'Main power feed'
      }
    });
  }
  
  console.log('Seed complete!');
  return { success: true, drawingNo: testDrawing.drawingNo };
}

// Execute seed when run directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seed finished!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    });
}
