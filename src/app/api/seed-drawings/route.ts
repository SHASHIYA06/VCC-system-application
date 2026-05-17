import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const VCC_DOCUMENTS = [
  { drawingNo: '942-58099', title: 'Drawing List - KMRCL RS3R VCC', sheets: 1, system: 'GEN', carType: 'ALL' },
  { drawingNo: '942-58100', title: 'Classification', sheets: 1, system: 'GEN', carType: 'ALL' },
  { drawingNo: '942-58101', title: 'Wiring Numbers and Description', sheets: 1, system: 'GEN', carType: 'ALL' },
  { drawingNo: '942-58102', title: 'Symbols', sheets: 1, system: 'GEN', carType: 'ALL' },
  { drawingNo: '942-58103', title: 'Train Lines Control (1/4)', sheets: 4, system: 'TRL', carType: 'ALL' },
  { drawingNo: '942-58104', title: 'Train Lines Signal', sheets: 1, system: 'TRL', carType: 'ALL' },
  { drawingNo: '942-58105', title: 'Low Tension Power Train Line', sheets: 1, system: 'TRL', carType: 'ALL' },
  { drawingNo: '942-58106', title: 'High Tension Power Train Line', sheets: 1, system: 'TRL', carType: 'ALL' },
  { drawingNo: '942-58107', title: 'Controlling Cab', sheets: 1, system: 'CAB', carType: 'DMC' },
  { drawingNo: '942-58108', title: 'Start-up Relay', sheets: 1, system: 'CAB', carType: 'DMC' },
  { drawingNo: '942-58109', title: 'System Status Indication', sheets: 1, system: 'CAB', carType: 'ALL' },
  { drawingNo: '942-58110', title: 'MCB Trip Status', sheets: 1, system: 'CAB', carType: 'ALL' },
  { drawingNo: '942-58111', title: 'DC Train Line Supply Contactor', sheets: 1, system: 'CAB', carType: 'ALL' },
  { drawingNo: '942-58112', title: 'Head Cab Main Light', sheets: 1, system: 'LIGHT', carType: 'CAB' },
  { drawingNo: '942-58113', title: 'Tail/Flasher/Console Light', sheets: 1, system: 'LIGHT', carType: 'CAB' },
  { drawingNo: '942-58114', title: 'Interior Light', sheets: 1, system: 'LIGHT', carType: 'ALL' },
  { drawingNo: '942-58115', title: 'Wiper Control', sheets: 1, system: 'LIGHT', carType: 'CAB' },
  { drawingNo: '942-58119', title: 'Speed Control', sheets: 1, system: 'TRAC', carType: 'ALL' },
  { drawingNo: '942-58120', title: 'VVVF Control', sheets: 1, system: 'TRAC', carType: 'DMC' },
  { drawingNo: '942-58121', title: 'Traction Return Current', sheets: 1, system: 'TRAC', carType: 'ALL' },
  { drawingNo: '942-58123', title: 'Compressor Control', sheets: 1, system: 'BRAKE', carType: 'TC' },
  { drawingNo: '942-58124', title: 'Brake Loop', sheets: 1, system: 'BRAKE', carType: 'ALL' },
  { drawingNo: '942-58125', title: 'Emergency Brake', sheets: 1, system: 'BRAKE', carType: 'ALL' },
  { drawingNo: '942-58126', title: 'Parking Brake', sheets: 1, system: 'BRAKE', carType: 'ALL' },
  { drawingNo: '942-58127', title: 'Horn', sheets: 1, system: 'BRAKE', carType: 'ALL' },
  { drawingNo: '942-58128', title: 'Brake Control - DMC/MC', sheets: 1, system: 'BRAKE', carType: 'DMC' },
  { drawingNo: '942-58129', title: 'Brake Control - TC', sheets: 1, system: 'BRAKE', carType: 'TC' },
  { drawingNo: '942-58130', title: 'APS - Auxiliary Power Supply', sheets: 1, system: 'APS', carType: 'TC' },
  { drawingNo: '942-58131', title: 'AC 415V Shore Supply', sheets: 1, system: 'APS', carType: 'TC' },
  { drawingNo: '942-58132', title: 'Battery Control', sheets: 1, system: 'APS', carType: 'TC' },
  { drawingNo: '942-58137', title: 'Saloon Door Supply Voltage', sheets: 1, system: 'DOOR', carType: 'MC' },
  { drawingNo: '942-58138', title: 'Left Door Operation', sheets: 1, system: 'DOOR', carType: 'MC' },
  { drawingNo: '942-58139', title: 'Right Door Operation', sheets: 1, system: 'DOOR', carType: 'MC' },
  { drawingNo: '942-58140', title: 'Door Proving Loop', sheets: 1, system: 'DOOR', carType: 'MC' },
  { drawingNo: '942-58141', title: 'Local Door Interlock', sheets: 1, system: 'DOOR', carType: 'MC' },
  { drawingNo: '942-58142', title: 'Door Communication with TMS', sheets: 1, system: 'DOOR', carType: 'MC' },
  { drawingNo: '942-58143', title: 'Cab VAC - Air Conditioning', sheets: 1, system: 'VAC', carType: 'CAB' },
  { drawingNo: '942-58144', title: 'Saloon VAC Power', sheets: 1, system: 'VAC', carType: 'MC' },
  { drawingNo: '942-58145', title: 'Saloon VAC Control', sheets: 1, system: 'VAC', carType: 'MC' },
  { drawingNo: '942-58146', title: 'TMS Interface 1 to 4', sheets: 4, system: 'TMS', carType: 'ALL' },
  { drawingNo: '942-58147', title: 'PIS/TIS - Passenger Information System', sheets: 2, system: 'COMMS', carType: 'ALL' },
  { drawingNo: '942-58149', title: 'DVAS/PA - Digital Voice Announcement', sheets: 1, system: 'COMMS', carType: 'ALL' },
  { drawingNo: '942-58150', title: 'PA Amplifier', sheets: 2, system: 'COMMS', carType: 'ALL' },
  { drawingNo: '942-58152', title: 'CBTC - Communication Based Train Control', sheets: 1, system: 'COMMS', carType: 'ALL' },
  { drawingNo: '942-58153', title: 'Train Radio Interface', sheets: 1, system: 'COMMS', carType: 'ALL' },
  { drawingNo: '942-58154', title: 'CCTV - Closed Circuit Television', sheets: 1, system: 'COMMS', carType: 'ALL' },
];

const PIN_DRAWINGS = [
  { drawingNo: '942-38104', title: 'Operating Panel Pin Assignment', sheets: 2, system: 'CAB', carType: 'CAB', file: 'CAB_PIN DRAWINGS 2.pdf' },
  { drawingNo: '942-38105', title: 'MCB Panel Pin Assignment', sheets: 1, system: 'CAB', carType: 'CAB', file: 'CAB_PIN DRAWINGS 2.pdf' },
  { drawingNo: '942-38117', title: 'Cab VAC Pin Assignment', sheets: 1, system: 'VAC', carType: 'CAB', file: 'CAB_PIN DRAWINGS 2.pdf' },
  { drawingNo: '942-38305', title: 'LTEB Pin Assignment - DMC', sheets: 2, system: 'LTEB', carType: 'DMC', file: 'DMC UF_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38306', title: 'VVVF Inverter Pin Assignment - DMC', sheets: 2, system: 'TRAC', carType: 'DMC', file: 'DMC UF_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38307', title: 'Collector Shoe Junction Box - DMC', sheets: 1, system: 'HV', carType: 'DMC', file: 'DMC UF_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38309', title: 'Pressure Switch Box - DMC', sheets: 1, system: 'BRAKE', carType: 'DMC', file: 'DMC UF_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38310', title: 'BCU Pin Assignment - DM Car', sheets: 1, system: 'BRAKE', carType: 'DMC', file: 'DMC_CEILING.pdf' },
  { drawingNo: '942-38312', title: 'LTJB Pin Assignment - DM Car', sheets: 3, system: 'LTJB', carType: 'DMC', file: 'DMC UF_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38319', title: 'HSCB Pin Assignment - DMC', sheets: 1, system: 'HV', carType: 'DMC', file: 'DMC UF_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38320', title: 'TM Connector Pin Assignment - DMC', sheets: 1, system: 'TRAC', carType: 'DMC', file: 'DMC UF_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38402', title: 'EDB Panel Pin Assignment - TC', sheets: 1, system: 'EDB', carType: 'TC', file: 'TC_CEILING PIN DRAWINGS.pdf' },
  { drawingNo: '942-38403', title: 'Passenger Door Pin Assignment - TC', sheets: 1, system: 'DOOR', carType: 'TC', file: 'TC_CEILING PIN DRAWINGS.pdf' },
  { drawingNo: '942-38404', title: 'Saloon Lights Pin Assignment - TC', sheets: 1, system: 'LIGHT', carType: 'TC', file: 'TC_CEILING PIN DRAWINGS.pdf' },
  { drawingNo: '942-38405', title: 'AAU - TC', sheets: 1, system: 'COMMS', carType: 'TC', file: 'TC_CEILING PIN DRAWINGS.pdf' },
  { drawingNo: '942-38406', title: 'Ethernet Switch CCTV - TC', sheets: 1, system: 'COMMS', carType: 'TC', file: 'TC_CEILING PIN DRAWINGS.pdf' },
  { drawingNo: '942-38407', title: 'Saloon VAC Pin Assignment - TC', sheets: 1, system: 'VAC', carType: 'TC', file: 'TC_CEILING PIN DRAWINGS.pdf' },
  { drawingNo: '942-38409', title: 'TCMS RIO Pin Assignment - TC', sheets: 4, system: 'TMS', carType: 'TC', file: 'TC_CEILING PIN DRAWINGS.pdf' },
  { drawingNo: '942-38508', title: 'Pressure Switch Box - T Car', sheets: 1, system: 'BRAKE', carType: 'TC', file: 'TC _UF PIN DRAWINGS.pdf' },
  { drawingNo: '942-38512', title: 'APS Pin Assignment - T Car', sheets: 2, system: 'APS', carType: 'TC', file: 'TC _UF PIN DRAWINGS.pdf' },
  { drawingNo: '942-38514', title: 'Shore Supply Box - T Car', sheets: 1, system: 'APS', carType: 'TC', file: 'TC _UF PIN DRAWINGS.pdf' },
  { drawingNo: '942-38516', title: 'Battery Box Pin Assignment - T Car', sheets: 1, system: 'APS', carType: 'TC', file: 'TC _UF PIN DRAWINGS.pdf' },
  { drawingNo: '942-38519', title: 'BCU Pin Assignment - T Car', sheets: 1, system: 'BRAKE', carType: 'TC', file: 'TC _UF PIN DRAWINGS.pdf' },
  { drawingNo: '942-38602', title: 'Saloon VAC Pin Assignment - M Car', sheets: 1, system: 'VAC', carType: 'MC', file: 'MC_UF.pdf' },
  { drawingNo: '942-38603', title: 'Passenger Door Pin Assignment - M Car', sheets: 1, system: 'DOOR', carType: 'MC', file: 'MC_CEILING_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38604', title: 'Saloon Lights Pin Assignment - M Car', sheets: 1, system: 'LIGHT', carType: 'MC', file: 'MC_CEILING_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38605', title: 'BECU Pin Assignment - M Car', sheets: 1, system: 'BRAKE', carType: 'MC', file: 'MC_UF.pdf' },
  { drawingNo: '942-38606', title: 'TCMS RIO Pin Assignment - M Car', sheets: 4, system: 'TMS', carType: 'MC', file: 'MC_CEILING_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38607', title: 'TCMS Terminal Block - M Car', sheets: 1, system: 'TMS', carType: 'MC', file: 'MC_CEILING_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38608', title: 'CCTV Ethernet Switch - M Car', sheets: 1, system: 'COMMS', carType: 'MC', file: 'MC_CEILING_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38609', title: 'AAU Pin Assignment - M Car', sheets: 1, system: 'COMMS', carType: 'MC', file: 'MC_CEILING_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38610', title: 'EDB Panel Pin Assignment - M Car', sheets: 1, system: 'EDB', carType: 'MC', file: 'MC_CEILING_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38612', title: 'TCMS Communication Node-1 - M Car', sheets: 1, system: 'TMS', carType: 'MC', file: 'MC_CEILING_PIN DRAWINGS.pdf' },
];

export async function POST() {
  try {
    console.log('=== Seeding Complete VCC Drawing Register ===\n');

    const project = await prisma.project.findFirst();
    if (!project) return NextResponse.json({ error: 'No project found' }, { status: 400 });

    const systems = await prisma.system.findMany();
    const sysMap = new Map(systems.map(s => [s.code, s.id]));

    const carTypes = await prisma.carType.findMany();
    const carMap = new Map(carTypes.map(c => [c.code, c.id]));

    console.log('Step 1: Creating VCC Schematic Drawings...');
    let drawingsCreated = 0;
    for (const d of VCC_DOCUMENTS) {
      const sysId = sysMap.get(d.system);
      const carId = d.carType === 'ALL' ? null : carMap.get(d.carType);
      
      const existing = await prisma.drawing.findFirst({ where: { drawingNo: d.drawingNo } });
      if (!existing && sysId) {
        await prisma.drawing.create({
          data: {
            projectId: project.id,
            systemId: sysId,
            drawingNo: d.drawingNo,
            title: d.title,
            totalSheets: d.sheets,
            revision: 'A',
            status: 'ACTIVE',
            remarks: `${d.carType}|${d.system}`
          }
        });
        drawingsCreated++;
      }
    }
    console.log(`VCC Drawings created: ${drawingsCreated}\n`);

    console.log('Step 2: Creating PIN Assignment Drawings...');
    let pinDrawingsCreated = 0;
    for (const d of PIN_DRAWINGS) {
      const sysId = sysMap.get(d.system);
      
      const existing = await prisma.drawing.findFirst({ where: { drawingNo: d.drawingNo } });
      if (!existing && sysId) {
        await prisma.drawing.create({
          data: {
            projectId: project.id,
            systemId: sysId,
            drawingNo: d.drawingNo,
            title: d.title,
            totalSheets: d.sheets,
            revision: '0',
            status: 'ACTIVE',
            remarks: `${d.carType}|${d.system}|${d.file}`
          }
        });
        pinDrawingsCreated++;
      }
    }
    console.log(`PIN Drawings created: ${pinDrawingsCreated}\n`);

    console.log('Step 3: Creating Equipment for each Drawing...');
    const equipmentList = [
      { code: 'LTEB1', name: 'Low Tension Equipment Box 1', drawingNo: '942-38305', system: 'LTEB' },
      { code: 'LTEB2', name: 'Low Tension Equipment Box 2', drawingNo: '942-38512', system: 'LTEB' },
      { code: 'VVVF1', name: 'VVVF Inverter 1', drawingNo: '942-38306', system: 'TRAC' },
      { code: 'VVVF2', name: 'VVVF Inverter 2', drawingNo: '942-38602', system: 'TRAC' },
      { code: 'BCU1', name: 'Brake Control Unit 1', drawingNo: '942-38310', system: 'BRAKE' },
      { code: 'BCU2', name: 'Brake Control Unit 2', drawingNo: '942-38519', system: 'BRAKE' },
      { code: 'BECU1', name: 'Brake Electronic Control Unit', drawingNo: '942-38605', system: 'BRAKE' },
      { code: 'APS1', name: 'Auxiliary Power Supply 1', drawingNo: '942-38512', system: 'APS' },
      { code: 'SSB1', name: 'Shore Supply Box 1', drawingNo: '942-38514', system: 'APS' },
      { code: 'BATT1', name: 'Battery Box 1', drawingNo: '942-38516', system: 'APS' },
      { code: 'EDB1', name: 'Electrical Distribution Box 1', drawingNo: '942-38610', system: 'EDB' },
      { code: 'EDB2', name: 'Electrical Distribution Box 2', drawingNo: '942-38402', system: 'EDB' },
      { code: 'TCMS_RIO1', name: 'TCMS Remote IO Unit 1', drawingNo: '942-38606', system: 'TMS' },
      { code: 'TCMS_RIO2', name: 'TCMS Remote IO Unit 2', drawingNo: '942-38409', system: 'TMS' },
      { code: 'ETH_SW1', name: 'Ethernet Switch CCTV 1', drawingNo: '942-38608', system: 'COMMS' },
      { code: 'ETH_SW2', name: 'Ethernet Switch CCTV 2', drawingNo: '942-38406', system: 'COMMS' },
      { code: 'AAU1', name: 'Audio Alarm Unit 1', drawingNo: '942-38609', system: 'COMMS' },
      { code: 'AAU2', name: 'Audio Alarm Unit 2', drawingNo: '942-38405', system: 'COMMS' },
      { code: 'VAC1', name: 'Saloon VAC Unit 1', drawingNo: '942-38602', system: 'VAC' },
      { code: 'VAC2', name: 'Saloon VAC Unit 2', drawingNo: '942-38407', system: 'VAC' },
      { code: 'CAB_PANEL', name: 'Cab Operating Panel', drawingNo: '942-38104', system: 'CAB' },
      { code: 'MCB_PANEL', name: 'MCB Panel', drawingNo: '942-38105', system: 'CAB' },
      { code: 'DCU1', name: 'Door Control Unit 1', drawingNo: '942-38603', system: 'DOOR' },
      { code: 'DCU2', name: 'Door Control Unit 2', drawingNo: '942-38403', system: 'DOOR' },
    ];

    let deviceCreated = 0;
    for (const eq of equipmentList) {
      const drawing = await prisma.drawing.findFirst({ where: { drawingNo: eq.drawingNo } });
      const sysId = sysMap.get(eq.system);
      
      const existing = await prisma.device.findFirst({ where: { tagNo: eq.code } });
      if (!existing && drawing && sysId) {
        await prisma.device.create({
          data: {
            drawingId: drawing.id,
            systemId: sysId,
            tagNo: eq.code,
            deviceName: eq.name,
            deviceType: 'MODULE'
          }
        });
        deviceCreated++;
      }
    }
    console.log(`Devices created: ${deviceCreated}\n`);

    console.log('Step 4: Creating Connectors for Drawings...');
    const connectorsList = [
      { drawingNo: '942-38305', code: 'CN1', type: '74P', pins: 74 },
      { drawingNo: '942-38305', code: 'CN2', type: '74P', pins: 74 },
      { drawingNo: '942-38305', code: 'CN3', type: '11P', pins: 11 },
      { drawingNo: '942-38606', code: 'CN1', type: '40P', pins: 40 },
      { drawingNo: '942-38606', code: 'CN2', type: '40P', pins: 40 },
      { drawingNo: '942-38409', code: 'CN1', type: '40P', pins: 40 },
      { drawingNo: '942-38409', code: 'CN2', type: '40P', pins: 40 },
      { drawingNo: '942-38104', code: 'TB1', type: 'TERMINAL', pins: 20 },
      { drawingNo: '942-38104', code: 'TB2', type: 'TERMINAL', pins: 20 },
      { drawingNo: '942-38104', code: 'J1', type: '74P', pins: 74 },
      { drawingNo: '942-38608', code: 'PORT1', type: 'M12', pins: 4 },
      { drawingNo: '942-38608', code: 'PORT2', type: 'M12', pins: 4 },
      { drawingNo: '942-38512', code: 'CN1', type: '37P', pins: 37 },
      { drawingNo: '942-38512', code: 'CN2', type: '20P', pins: 20 },
      { drawingNo: '942-38603', code: 'X1', type: 'POWER', pins: 5 },
      { drawingNo: '942-38603', code: 'X2', type: 'CONTROL', pins: 12 },
      { drawingNo: '942-38602', code: 'X1', type: 'POWER', pins: 5 },
      { drawingNo: '942-38602', code: 'X2', type: 'CONTROL', pins: 12 },
    ];

    let connectorsCreated = 0;
    for (const c of connectorsList) {
      const drawing = await prisma.drawing.findFirst({ where: { drawingNo: c.drawingNo } });
      if (drawing) {
        const existing = await prisma.connector.findFirst({
          where: { drawingId: drawing.id, connectorCode: c.code }
        });
        if (!existing) {
          const newConn = await prisma.connector.create({
            data: {
              drawingId: drawing.id,
              connectorCode: c.code,
              connectorTypeCode: c.type,
              pinCount: c.pins,
              description: `Connector ${c.code} with ${c.pins} pins`
            }
          });

          for (let i = 1; i <= Math.min(c.pins, 10); i++) {
            await prisma.connectorPin.create({
              data: {
                connectorId: newConn.id,
                pinNo: String(i),
                pinLabel: `P${i}`,
                signalName: `${c.code}-SIG-${i}`,
                wireNo: String(1000 + Math.floor(Math.random() * 8000))
              }
            });
          }
          connectorsCreated++;
        }
      }
    }
    console.log(`Connectors created: ${connectorsCreated}\n`);

    const stats = {
      drawings: await prisma.drawing.count(),
      systems: await prisma.system.count(),
      devices: await prisma.device.count(),
      connectors: await prisma.connector.count(),
      pins: await prisma.connectorPin.count(),
      wires: await prisma.wire.count(),
      trainlines: await prisma.trainLine.count(),
    };

    console.log('=== Complete Drawing Register ===');
    console.log(JSON.stringify(stats, null, 2));

    return NextResponse.json({ 
      success: true, 
      message: 'Complete VCC Drawing Register seeded',
      stats 
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}