import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('=== Running Complete Application Fix ===\n');

    let project = await prisma.project.findFirst();
    if (!project) {
      project = await prisma.project.create({
        data: { projectCode: 'KMRCL_RS3R', projectName: 'KMRCL RS3R Metro', description: 'Kolkata Metro RS3R Vehicle Control Circuit' }
      });
      console.log(`Created project: ${project.projectName}\n`);
    }

    const carTypes = await prisma.carType.findMany();
    const carMap = new Map(carTypes.map(c => [c.code, c.id]));
    if (carMap.size === 0) {
      console.log('Creating car types...');
      await prisma.carType.createMany({
        data: [
          { code: 'DMC', name: 'Driving Motor Car', description: 'DMC - Driving Motor Car with cab' },
          { code: 'TC', name: 'Trailer Car', description: 'TC - Trailer Car without traction' },
          { code: 'MC', name: 'Motor Car', description: 'MC - Motor Car without cab' },
        ]
      });
      const newCarTypes = await prisma.carType.findMany();
      carMap.set('DMC', newCarTypes.find(c => c.code === 'DMC')?.id || '');
      carMap.set('TC', newCarTypes.find(c => c.code === 'TC')?.id || '');
      carMap.set('MC', newCarTypes.find(c => c.code === 'MC')?.id || '');
    }

    console.log('Step 1: Fixing Systems with proper sorting...');
    const systemsData = [
      { code: 'GEN', name: 'General & Conventions', category: 'Foundation', description: 'Drawing list, classification, wiring numbers, symbols', sortOrder: 1 },
      { code: 'TRL', name: 'Trainlines', category: 'Core Systems', description: 'Train line control, signal, low/high tension power', sortOrder: 2 },
      { code: 'CAB', name: 'Cab Control & Status', category: 'Core Systems', description: 'Controlling cab, startup, status indication, MCB trip', sortOrder: 3 },
      { code: 'TRAC', name: 'Traction & Propulsion', category: 'Propulsion', description: 'Speed control, VVVF control, traction return current', sortOrder: 4 },
      { code: 'BRAKE', name: 'Brake System', category: 'Core Systems', description: 'Compressor, brake loop, emergency brake, parking brake, horn', sortOrder: 5 },
      { code: 'APS', name: 'Auxiliary Power Supply', category: 'Power', description: 'APS, shore supply, battery control', sortOrder: 6 },
      { code: 'DOOR', name: 'Door System', category: 'Core Systems', description: 'Door supply, left/right operation, proving loop, interlock', sortOrder: 7 },
      { code: 'VAC', name: 'VAC / HVAC', category: 'Core Systems', description: 'Cab VAC, saloon VAC power and control', sortOrder: 8 },
      { code: 'TMS', name: 'Train Management System', category: 'Control', description: 'TMS interface, TCMS remote I/O, communication nodes', sortOrder: 9 },
      { code: 'COMMS', name: 'Communication Systems', category: 'Core Systems', description: 'PIS/TIS, DVAS/PA, CBTC, train radio, CCTV', sortOrder: 10 },
      { code: 'LIGHT', name: 'Lighting', category: 'Auxiliary', description: 'Head cab light, saloon lights, console light', sortOrder: 11 },
      { code: 'LTEB', name: 'Low Tension Equipment Box', category: 'Electrical', description: 'LTEB pin assignments and wiring', sortOrder: 12 },
      { code: 'LTJB', name: 'Low Tension Junction Box', category: 'Electrical', description: 'LTJB pin assignments and wiring', sortOrder: 13 },
      { code: 'EDB', name: 'Electrical Distribution Box', category: 'Electrical', description: 'EDB panel assignments', sortOrder: 14 },
      { code: 'HV', name: 'High Voltage Equipment', category: 'Power', description: 'Collector shoe, HSCB, main switch box, HTEB', sortOrder: 15 },
    ];

    for (const sys of systemsData) {
      const existing = await prisma.system.findFirst({ where: { code: sys.code } });
      if (existing) {
        await prisma.system.update({ where: { id: existing.id }, data: sys });
      } else {
        await prisma.system.create({ data: sys });
      }
    }
    console.log(`Systems: ${await prisma.system.count()}\n`);

    console.log('Step 2: Mapping Drawings to Systems...');
    const systems = await prisma.system.findMany();
    const sysMap = new Map(systems.map(s => [s.code, s.id]));

    const drawingMappings: Record<string, string[]> = {
      'TRL': ['942-58103', '942-58104', '942-58105', '942-58106'],
      'CAB': ['942-58107', '942-58108', '942-58109', '942-58110', '942-58111', '942-38104', '942-38105'],
      'TRAC': ['942-58119', '942-58120', '942-58121', '942-38306', '942-38320'],
      'BRAKE': ['942-58123', '942-58124', '942-58125', '942-58126', '942-58127', '942-58128', '942-58129', '942-38310', '942-38519', '942-38605'],
      'APS': ['942-58130', '942-58131', '942-58132', '942-38512', '942-38514', '942-38516'],
      'DOOR': ['942-58137', '942-58138', '942-58139', '942-58140', '942-58141', '942-58142', '942-38603'],
      'VAC': ['942-58143', '942-58144', '942-58145', '942-38602', '942-38407'],
      'TMS': ['942-58146', '942-38606', '942-38409'],
      'COMMS': ['942-58147', '942-58148', '942-58149', '942-58150', '942-58152', '942-58153', '942-58154', '942-38608', '942-38406'],
      'LIGHT': ['942-58112', '942-58113', '942-58114', '942-58115', '942-58116', '942-38604', '942-38404'],
      'LTEB': ['942-38305', '942-38505'],
      'LTJB': ['942-38312', '942-38506', '942-38507'],
      'EDB': ['942-38610', '942-38402'],
      'HV': ['942-38307', '942-38308', '942-38316', '942-38317', '942-38319', '942-38521', '942-38515'],
    };

    let drawingsMapped = 0;
    for (const [sysCode, drawingNos] of Object.entries(drawingMappings)) {
      const sysId = sysMap.get(sysCode);
      if (sysId) {
        for (const drawingNo of drawingNos) {
          const drawing = await prisma.drawing.findFirst({ where: { drawingNo: { startsWith: drawingNo } } });
          if (drawing) {
            await prisma.drawing.update({ where: { id: drawing.id }, data: { systemId: sysId } });
            drawingsMapped++;
          }
        }
      }
    }
    console.log(`Drawings mapped: ${drawingsMapped}\n`);

    console.log('Step 3: Creating comprehensive equipment with connectors and pins...');
    const equipmentData = [
      { equipmentCode: 'LTEB1', equipmentName: 'Low Tension Equipment Box 1', carType: 'DMC', systemCode: 'LTEB', location: 'Underframe-A' },
      { equipmentCode: 'LTEB2', equipmentName: 'Low Tension Equipment Box 2', carType: 'TC', systemCode: 'LTEB', location: 'Underframe-A' },
      { equipmentCode: 'LTEB3', equipmentName: 'Low Tension Equipment Box 3', carType: 'MC', systemCode: 'LTEB', location: 'Underframe-A' },
      { equipmentCode: 'LTJB1', equipmentName: 'Low Tension Junction Box 1', carType: 'DMC', systemCode: 'LTJB', location: 'Underframe-B' },
      { equipmentCode: 'LTJB2', equipmentName: 'Low Tension Junction Box 2', carType: 'TC', systemCode: 'LTJB', location: 'Underframe-B' },
      { equipmentCode: 'LTJB3', equipmentName: 'Low Tension Junction Box 3', carType: 'MC', systemCode: 'LTJB', location: 'Underframe-B' },
      { equipmentCode: 'VVVF1', equipmentName: 'VVVF Inverter 1', carType: 'DMC', systemCode: 'TRAC', location: 'Underframe-B' },
      { equipmentCode: 'VVVF2', equipmentName: 'VVVF Inverter 2', carType: 'MC', systemCode: 'TRAC', location: 'Underframe-B' },
      { equipmentCode: 'BCU1', equipmentName: 'Brake Control Unit 1', carType: 'DMC', systemCode: 'BRAKE', location: 'Underframe-C' },
      { equipmentCode: 'BCU2', equipmentName: 'Brake Control Unit 2', carType: 'TC', systemCode: 'BRAKE', location: 'Underframe-C' },
      { equipmentCode: 'BECU1', equipmentName: 'Brake Electronic Control Unit', carType: 'MC', systemCode: 'BRAKE', location: 'Underframe-C' },
      { equipmentCode: 'EDB1', equipmentName: 'Electrical Distribution Box 1', carType: 'MC', systemCode: 'EDB', location: 'Ceiling-A' },
      { equipmentCode: 'EDB2', equipmentName: 'Electrical Distribution Box 2', carType: 'TC', systemCode: 'EDB', location: 'Ceiling-A' },
      { equipmentCode: 'APS1', equipmentName: 'Auxiliary Power Supply 1', carType: 'TC', systemCode: 'APS', location: 'Underframe-A' },
      { equipmentCode: 'SSB1', equipmentName: 'Shore Supply Box 1', carType: 'TC', systemCode: 'APS', location: 'Underframe-A' },
      { equipmentCode: 'BATT1', equipmentName: 'Battery Box 1', carType: 'TC', systemCode: 'APS', location: 'Underframe-B' },
      { equipmentCode: 'HSCB1', equipmentName: 'High Speed Circuit Breaker 1', carType: 'DMC', systemCode: 'HV', location: 'Underframe-A' },
      { equipmentCode: 'HSCB2', equipmentName: 'High Speed Circuit Breaker 2', carType: 'MC', systemCode: 'HV', location: 'Underframe-A' },
      { equipmentCode: 'TCMS_RIO1', equipmentName: 'TCMS Remote IO Unit 1', carType: 'MC', systemCode: 'TMS', location: 'Ceiling-C' },
      { equipmentCode: 'TCMS_RIO2', equipmentName: 'TCMS Remote IO Unit 2', carType: 'TC', systemCode: 'TMS', location: 'Ceiling-C' },
      { equipmentCode: 'ETH_SW1', equipmentName: 'Ethernet Switch CCTV 1', carType: 'MC', systemCode: 'COMMS', location: 'Ceiling-B' },
      { equipmentCode: 'ETH_SW2', equipmentName: 'Ethernet Switch CCTV 2', carType: 'TC', systemCode: 'COMMS', location: 'Ceiling-B' },
      { equipmentCode: 'AAU1', equipmentName: 'Audio Alarm Unit 1', carType: 'MC', systemCode: 'COMMS', location: 'Ceiling-C' },
      { equipmentCode: 'AAU2', equipmentName: 'Audio Alarm Unit 2', carType: 'TC', systemCode: 'COMMS', location: 'Ceiling-C' },
      { equipmentCode: 'VAC1', equipmentName: 'Saloon VAC Unit 1', carType: 'MC', systemCode: 'VAC', location: 'Ceiling-C' },
      { equipmentCode: 'VAC2', equipmentName: 'Saloon VAC Unit 2', carType: 'TC', systemCode: 'VAC', location: 'Ceiling-C' },
      { equipmentCode: 'CAB_PANEL', equipmentName: 'Cab Operating Panel', carType: 'CAB', systemCode: 'CAB', location: 'Cab-Desk' },
      { equipmentCode: 'MCB_PANEL', equipmentName: 'MCB Panel', carType: 'CAB', systemCode: 'CAB', location: 'Cab-Panel' },
      { equipmentCode: 'DCU1', equipmentName: 'Door Control Unit 1', carType: 'MC', systemCode: 'DOOR', location: 'Ceiling-A' },
      { equipmentCode: 'DCU2', equipmentName: 'Door Control Unit 2', carType: 'TC', systemCode: 'DOOR', location: 'Ceiling-A' },
      { equipmentCode: 'CSJB1', equipmentName: 'Collector Shoe Junction Box', carType: 'DMC', systemCode: 'HV', location: 'Underframe-A' },
    ];

    for (const eq of equipmentData) {
      const sysId = sysMap.get(eq.systemCode);
      
      const existing = await prisma.device.findFirst({ where: { tagNo: eq.equipmentCode } });
      if (existing) {
        await prisma.device.update({ 
          where: { id: existing.id }, 
          data: { systemId: sysId } 
        });
      }
    }
    console.log(`Devices: ${await prisma.device.count()}\n`);

    console.log(`Connectors: ${await prisma.connector.count()}\n`);
    console.log(`Pins: ${await prisma.connectorPin.count()}\n`);

    const stats = {
      systems: await prisma.system.count(),
      drawings: await prisma.drawing.count(),
      trainlines: await prisma.trainLine.count(),
      wires: await prisma.wire.count(),
      devices: await prisma.device.count(),
      connectors: await prisma.connector.count(),
      pins: await prisma.connectorPin.count(),
    };

    console.log('=== Application Fix Complete ===');
    console.log(JSON.stringify(stats, null, 2));

    return NextResponse.json({ 
      success: true, 
      message: 'Application synchronized and fixed',
      stats 
    });
  } catch (error) {
    console.error('Fix error:', error);
    return NextResponse.json({ 
      error: 'Fix failed', 
      details: String(error) 
    }, { status: 500 });
  }
}