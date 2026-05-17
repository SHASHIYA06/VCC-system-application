import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const DOCUMENT_CONFIG = [
  { file: 'KMRCL VCC Drawings_OCR.pdf', drawingNo: '942-58100', title: 'VCC Drawing List & Index', pages: 127, system: 'GEN', carType: 'ALL' },
  { file: 'CAB_PIN DRAWINGS 2.pdf', drawingNo: '942-38104', title: 'Cab Panel Pin Assignment', pages: 48, system: 'CAB', carType: 'CAB' },
  { file: 'DMC_CEILING.pdf', drawingNo: '942-38310', title: 'DMC Ceiling Pin Assignment', pages: 28, system: 'TMS', carType: 'DMC' },
  { file: 'DMC UF_PIN DRAWINGS.pdf', drawingNo: '942-38305', title: 'DMC Underframe Pin Assignment', pages: 26, system: 'LTEB', carType: 'DMC' },
  { file: 'TC_CEILING PIN DRAWINGS.pdf', drawingNo: '942-38409', title: 'TC Ceiling Pin Assignment', pages: 27, system: 'TMS', carType: 'TC' },
  { file: 'TC _UF PIN DRAWINGS.pdf', drawingNo: '942-38508', title: 'TC Underframe Pin Assignment', pages: 21, system: 'APS', carType: 'TC' },
  { file: 'MC_CEILING_PIN DRAWINGS.pdf', drawingNo: '942-38606', title: 'MC Ceiling Pin Assignment', pages: 58, system: 'TMS', carType: 'MC' },
  { file: 'MC_UF.pdf', drawingNo: '942-38602', title: 'MC Underframe Pin Assignment', pages: 27, system: 'LTEB', carType: 'MC' },
  { file: 'VCC DESCRIPTION 13.12.2017.pdf', drawingNo: 'VCC-DESC-01', title: 'VCC System Description', pages: 54, system: 'GEN', carType: 'ALL' },
];

const CAB_CONNECTORS = [
  { connectorCode: 'J1', connectorTypeCode: 'TERMINAL', description: 'Cab desk TB - Main terminal block', carType: 'CAB' },
  { connectorCode: 'J2', connectorTypeCode: 'TERMINAL', description: 'Cab desk TB - Secondary terminal', carType: 'CAB' },
  { connectorCode: 'CN1', connectorTypeCode: '74P', description: 'Operating panel connector', carType: 'CAB' },
  { connectorCode: 'CN2', connectorTypeCode: '74PW', description: 'MCB panel connector', carType: 'CAB' },
  { connectorCode: 'X1', connectorTypeCode: 'INTERCAR', description: 'Inter-car jumper to DMC', carType: 'CAB' },
  { connectorCode: 'X2', connectorTypeCode: 'INTERCAR', description: 'Inter-car jumper to TC', carType: 'CAB' },
  { connectorCode: 'TB1', connectorTypeCode: 'TERMINAL', description: 'Cab terminal block 1', carType: 'CAB' },
  { connectorCode: 'TB2', connectorTypeCode: 'TERMINAL', description: 'Cab terminal block 2', carType: 'CAB' },
];

const DMC_UF_CONNECTORS = [
  { connectorCode: 'LTEB', connectorTypeCode: 'PANEL', description: 'Low Tension Equipment Box', carType: 'DMC' },
  { connectorCode: 'VVVF', connectorTypeCode: 'INVERTER', description: 'VVVF Inverter CN1', carType: 'DMC' },
  { connectorCode: 'BCU', connectorTypeCode: 'CONTROL', description: 'Brake Control Unit', carType: 'DMC' },
  { connectorCode: 'LTJB', connectorTypeCode: 'JUNCTION', description: 'Low Tension Junction Box', carType: 'DMC' },
  { connectorCode: 'CN1', connectorTypeCode: '74P', description: 'Main trainline connector', carType: 'DMC' },
  { connectorCode: 'CN2', connectorTypeCode: '74PW', description: 'Power connector', carType: 'DMC' },
  { connectorCode: 'CN3', connectorTypeCode: '11P', description: 'AC power connector', carType: 'DMC' },
  { connectorCode: 'CSJB', connectorTypeCode: 'COLLECTOR', description: 'Collector Shoe Junction Box', carType: 'DMC' },
  { connectorCode: 'HSCB', connectorTypeCode: 'BREAKER', description: 'High Speed Circuit Breaker', carType: 'DMC' },
  { connectorCode: 'PRX', connectorTypeCode: 'PROXY', description: 'Pantograph raise connector', carType: 'DMC' },
];

const TC_UF_CONNECTORS = [
  { connectorCode: 'APS', connectorTypeCode: 'POWER', description: 'Auxiliary Power Supply', carType: 'TC' },
  { connectorCode: 'SIV', connectorTypeCode: 'INVERTER', description: 'Static Inverter', carType: 'TC' },
  { connectorCode: 'BC', connectorTypeCode: 'BATTERY', description: 'Battery Charger', carType: 'TC' },
  { connectorCode: 'BB', connectorTypeCode: 'BATTERY', description: 'Battery Box', carType: 'TC' },
  { connectorCode: 'SSB', connectorTypeCode: 'POWER', description: 'Shore Supply Box', carType: 'TC' },
  { connectorCode: 'CM', connectorTypeCode: 'COMPRESSOR', description: 'Compressor Motor', carType: 'TC' },
  { connectorCode: 'CN1', connectorTypeCode: '74P', description: 'Main connector', carType: 'TC' },
  { connectorCode: 'CN2', connectorTypeCode: '3P', description: 'DC power connector', carType: 'TC' },
  { connectorCode: 'PG', connectorTypeCode: 'GOVERNOR', description: 'Pressure Governor', carType: 'TC' },
];

const MC_UF_CONNECTORS = [
  { connectorCode: 'VAC1', connectorTypeCode: 'HVAC', description: 'Saloon VAC Unit 1', carType: 'MC' },
  { connectorCode: 'VAC2', connectorTypeCode: 'HVAC', description: 'Saloon VAC Unit 2', carType: 'MC' },
  { connectorCode: 'BECU', connectorTypeCode: 'CONTROL', description: 'Brake Electronic Control Unit', carType: 'MC' },
  { connectorCode: 'CN1', connectorTypeCode: '74P', description: 'Main connector', carType: 'MC' },
  { connectorCode: 'CN2', connectorTypeCode: 'MULTI', description: 'Multi-pin connector', carType: 'MC' },
  { connectorCode: 'DCU', connectorTypeCode: 'DOOR', description: 'Door Control Unit', carType: 'MC' },
];

const TMS_CONNECTORS = [
  { connectorCode: 'TCMS_RIO', connectorTypeCode: 'IO', description: 'TCMS Remote I/O Unit', carType: 'ALL' },
  { connectorCode: 'ETH_SW', connectorTypeCode: 'NETWORK', description: 'Ethernet Switch', carType: 'ALL' },
  { connectorCode: 'CN1', connectorTypeCode: 'MULTI', description: 'TCMS CN1', carType: 'ALL' },
  { connectorCode: 'CN2', connectorTypeCode: 'MULTI', description: 'TCMS CN2', carType: 'ALL' },
  { connectorCode: 'AAU', connectorTypeCode: 'AUDIO', description: 'Audio Alarm Unit', carType: 'ALL' },
  { connectorCode: 'EDB', connectorTypeCode: 'PANEL', description: 'Electrical Distribution Box', carType: 'ALL' },
  { connectorCode: 'PIS', connectorTypeCode: 'DISPLAY', description: 'Passenger Info System', carType: 'ALL' },
  { connectorCode: 'CCTV', connectorTypeCode: 'CAMERA', description: 'CCTV Camera', carType: 'ALL' },
];

const WIRES = [];
for (let i = 1000; i <= 9999; i++) {
  let systemCode = 'GEN';
  if (i >= 1000 && i < 2000) systemCode = 'GEN';
  else if (i >= 2000 && i < 3000) systemCode = 'TRL';
  else if (i >= 3000 && i < 4000) systemCode = 'TRAC';
  else if (i >= 4000 && i < 5000) systemCode = 'BRAKE';
  else if (i >= 5000 && i < 6000) systemCode = 'AUX';
  else if (i >= 6000 && i < 7000) systemCode = 'DOOR';
  else if (i >= 7000 && i < 8000) systemCode = 'VAC';
  else if (i >= 8000 && i < 9000) systemCode = 'LIGHT';
  else if (i >= 9000 && i < 10000) systemCode = 'TMS';

  WIRES.push({
    wireNo: String(i),
    signalName: `SIG-${i}`,
    description: `Wire ${i} - ${systemCode} system`,
    voltageClass: i < 2000 ? '110VDC' : (i < 5000 ? '750VDC' : '110VDC'),
    wireSize: ['2.5mm²', '4mm²', '6mm²', '1.5mm²'][i % 4],
    wireColor: ['RED', 'BLUE', 'GREEN', 'WHITE', 'BLACK', 'YELLOW', 'ORANGE'][i % 7],
  });
}

const TRAINLINES = [
  { wireNo: '1032', itemName: 'RESET', lineGroup: 'Control', note: 'System reset command', carType: 'ALL' },
  { wireNo: '1050', itemName: 'SHUT DOWN', lineGroup: 'Control', note: 'System shutdown', carType: 'ALL' },
  { wireNo: '1040', itemName: 'AUX ON', lineGroup: 'Control', note: 'Auxiliary power on', carType: 'ALL' },
  { wireNo: '1205', itemName: 'LINE VOLTAGE', lineGroup: 'Power', note: '750V DC line voltage', carType: 'ALL' },
  { wireNo: '1207', itemName: 'VVF FAULT', lineGroup: 'Status', note: 'VVVF fault signal', carType: 'ALL' },
  { wireNo: '1209', itemName: 'HSCB TRIP', lineGroup: 'Status', note: 'High speed circuit breaker trip', carType: 'ALL' },
  { wireNo: '1515', itemName: 'ATP', lineGroup: 'Control', note: 'Automatic train protection', carType: 'ALL' },
  { wireNo: '2043', itemName: 'SCS', lineGroup: 'Control', note: 'Stationary condition signal', carType: 'ALL' },
  { wireNo: '3003', itemName: 'FORWARD', lineGroup: 'Traction', note: 'Forward command', carType: 'ALL' },
  { wireNo: '3004', itemName: 'REVERSE', lineGroup: 'Traction', note: 'Reverse command', carType: 'ALL' },
  { wireNo: '3005', itemName: 'POWERING1', lineGroup: 'Traction', note: 'Propulsion enable 1', carType: 'ALL' },
  { wireNo: '3006', itemName: 'POWERING2', lineGroup: 'Traction', note: 'Propulsion enable 2', carType: 'ALL' },
  { wireNo: '3010', itemName: 'BRAKING', lineGroup: 'Traction', note: 'Braking command', carType: 'ALL' },
  { wireNo: '3011', itemName: 'FULL SERVICE BRAKE', lineGroup: 'Brake', note: 'Full service brake', carType: 'ALL' },
  { wireNo: '3013', itemName: 'RM', lineGroup: 'Control', note: 'Restricted mode', carType: 'ALL' },
  { wireNo: '3018', itemName: 'STANDBY', lineGroup: 'Control', note: 'Standby mode', carType: 'ALL' },
  { wireNo: '3019', itemName: 'WC', lineGroup: 'Control', note: 'Wheelspin control', carType: 'ALL' },
  { wireNo: '4024', itemName: 'BRAKE LOOP', lineGroup: 'Brake', note: 'Emergency brake loop', carType: 'ALL' },
  { wireNo: '4062', itemName: 'EM BRAKE LOOP NORMAL', lineGroup: 'Brake', note: 'EB loop normal path', carType: 'ALL' },
  { wireNo: '4103', itemName: 'EM BRAKE LOOP REDUNDANCY', lineGroup: 'Brake', note: 'EB loop redundancy', carType: 'ALL' },
  { wireNo: '4122', itemName: 'PARKING BRAKE APPLIED', lineGroup: 'Brake', note: 'Parking brake applied', carType: 'ALL' },
  { wireNo: '4153', itemName: 'PARKING BRAKE RELEASED', lineGroup: 'Brake', note: 'Parking brake released', carType: 'ALL' },
  { wireNo: '4155', itemName: 'PARKING BRAKE PRESSURE SWITCH', lineGroup: 'Brake', note: 'PB pressure feedback', carType: 'ALL' },
  { wireNo: '5000', itemName: 'SHORE SUPPLY CONTACT', lineGroup: 'Power', note: 'Shore supply contactor', carType: 'TC' },
  { wireNo: '5030', itemName: 'SIV CONTACT1', lineGroup: 'Power', note: 'Static inverter contact 1', carType: 'TC' },
  { wireNo: '5031', itemName: 'SIV CONTACT2', lineGroup: 'Power', note: 'Static inverter contact 2', carType: 'TC' },
  { wireNo: '5064', itemName: 'BATTERY UNDER-VOLTAGE', lineGroup: 'Power', note: 'Battery under-voltage', carType: 'ALL' },
  { wireNo: '6009', itemName: 'DOOR OPEN LEFT', lineGroup: 'Door', note: 'Left door open', carType: 'MC' },
  { wireNo: '6014', itemName: 'DOOR CLOSE LEFT', lineGroup: 'Door', note: 'Left door close', carType: 'MC' },
  { wireNo: '6046', itemName: 'DOOR OPEN RIGHT', lineGroup: 'Door', note: 'Right door open', carType: 'MC' },
  { wireNo: '6051', itemName: 'DOOR CLOSE RIGHT', lineGroup: 'Door', note: 'Right door close', carType: 'MC' },
  { wireNo: '6073', itemName: 'DOOR PROVING LOOP 1', lineGroup: 'Door', note: 'Door proving loop', carType: 'MC' },
  { wireNo: '6076', itemName: 'DOOR PROVING LOOP 2', lineGroup: 'Door', note: 'Door proving loop 2', carType: 'MC' },
  { wireNo: '6112', itemName: 'ZERO SPEED', lineGroup: 'Status', note: 'Zero speed signal', carType: 'ALL' },
  { wireNo: '7001', itemName: 'CAB VAC IN SSK', lineGroup: 'VAC', note: 'Cab VAC in SSK', carType: 'DMC' },
  { wireNo: '7050', itemName: 'SALOON VAC1 IN SSK', lineGroup: 'VAC', note: 'Saloon VAC 1 in SSK', carType: 'TC' },
  { wireNo: '7060', itemName: 'SALOON VAC2 IN SSK', lineGroup: 'VAC', note: 'Saloon VAC 2 in SSK', carType: 'TC' },
  { wireNo: '7070', itemName: 'SMOKE DETECTION', lineGroup: 'VAC', note: 'Smoke detection', carType: 'ALL' },
  { wireNo: '7071', itemName: 'DAMPER OPERATION', lineGroup: 'VAC', note: 'Damper operation', carType: 'ALL' },
  { wireNo: '9214', itemName: 'ATP MODE', lineGroup: 'Control', note: 'ATP mode indicator', carType: 'ALL' },
  { wireNo: '9215', itemName: 'FWD MODE', lineGroup: 'Control', note: 'Forward mode', carType: 'ALL' },
  { wireNo: '9216', itemName: 'REV MODE', lineGroup: 'Control', note: 'Reverse mode', carType: 'ALL' },
];

const SYSTEMS = [
  { code: 'GEN', name: 'General', category: 'Foundation', sortOrder: 1 },
  { code: 'TRL', name: 'Train Line', category: 'Core Systems', sortOrder: 2 },
  { code: 'CAB', name: 'Cab Equipment', category: 'Core Systems', sortOrder: 3 },
  { code: 'TRAC', name: 'Traction', category: 'Core Systems', sortOrder: 4 },
  { code: 'BRAKE', name: 'Brake System', category: 'Core Systems', sortOrder: 5 },
  { code: 'AUX', name: 'Auxiliary Electric', category: 'Power', sortOrder: 6 },
  { code: 'DOOR', name: 'Door System', category: 'Passenger Systems', sortOrder: 7 },
  { code: 'VAC', name: 'VAC/HVAC', category: 'Passenger Systems', sortOrder: 8 },
  { code: 'TMS', name: 'TMS/TCMS', category: 'Communication', sortOrder: 9 },
  { code: 'COMMS', name: 'Communication', category: 'Communication', sortOrder: 10 },
  { code: 'HV', name: 'High Voltage', category: 'Power', sortOrder: 11 },
  { code: 'LIGHT', name: 'Lighting', category: 'Auxiliary', sortOrder: 12 },
  { code: 'LTEB', name: 'LTEB', category: 'Electrical', sortOrder: 13 },
  { code: 'LTJB', name: 'LTJB', category: 'Electrical', sortOrder: 14 },
  { code: 'APS', name: 'APS', category: 'Power', sortOrder: 15 },
];

export async function POST() {
  try {
    console.log('=== Starting Complete VCC Full Seed ===\n');

    const project = await prisma.project.findFirst();
    if (!project) return NextResponse.json({ error: 'No project found' }, { status: 400 });
    console.log(`Project: ${project.projectName}\n`);

    console.log('Step 1: Setting up systems...');
    for (const sys of SYSTEMS) {
      const existing = await prisma.system.findFirst({ where: { code: sys.code } });
      if (!existing) {
        await prisma.system.create({
          data: { code: sys.code, name: sys.name, category: sys.category, description: sys.name, sortOrder: sys.sortOrder }
        });
      }
    }
    console.log('Systems done.\n');

    console.log('Step 2: Creating drawings...');
    for (const doc of DOCUMENT_CONFIG) {
      const system = await prisma.system.findFirst({ where: { code: doc.system } });
      const existing = await prisma.drawing.findFirst({ where: { drawingNo: doc.drawingNo } });
      
      if (existing) {
        await prisma.drawing.update({
          where: { id: existing.id },
          data: { title: doc.title, sourceFileId: doc.file, totalSheets: doc.pages, remarks: `${doc.carType}|${doc.system}`, systemId: system?.id }
        });
      } else {
        await prisma.drawing.create({
          data: { drawingNo: doc.drawingNo, title: doc.title, sourceFileId: doc.file, totalSheets: doc.pages, projectId: project.id, systemId: system?.id, revision: 'A', status: 'ACTIVE', remarks: `${doc.carType}|${doc.system}` }
        });
      }
    }
    console.log('Drawings done.\n');

    console.log('Step 3: Creating trainlines...');
    for (const tl of TRAINLINES) {
      const existing = await prisma.trainLine.findFirst({ where: { wireNo: tl.wireNo } });
      if (!existing) {
        const drawing = await prisma.drawing.findFirst();
        await prisma.trainLine.create({
          data: { wireNo: tl.wireNo, itemName: tl.itemName, lineGroup: tl.lineGroup, note: tl.note, carType: tl.carType, drawingId: drawing?.id || '' }
        });
      }
    }
    console.log(`Trainlines: ${await prisma.trainLine.count()}\n`);

    console.log('Step 4: Creating wires...');
    let wiresAdded = 0;
    for (const w of WIRES) {
      const existing = await prisma.wire.findUnique({ where: { wireNo: w.wireNo } });
      if (!existing) {
        await prisma.wire.create({ data: w });
        wiresAdded++;
      }
    }
    console.log(`Wires added: ${wiresAdded}\n`);

    console.log('Step 5: Creating connectors...');
    const allConnectors = [...CAB_CONNECTORS, ...DMC_UF_CONNECTORS, ...TC_UF_CONNECTORS, ...MC_UF_CONNECTORS, ...TMS_CONNECTORS];
    let connectorsAdded = 0;
    for (const conn of allConnectors) {
      const existing = await prisma.connector.findFirst({ where: { connectorCode: conn.connectorCode } });
      if (!existing) {
        const drawing = await prisma.drawing.findFirst();
        await prisma.connector.create({
          data: { connectorCode: conn.connectorCode, connectorTypeCode: conn.connectorTypeCode, description: conn.description, carType: conn.carType, drawingId: drawing?.id || '' }
        });
        connectorsAdded++;
      }
    }
    console.log(`Connectors added: ${connectorsAdded}\n`);

    console.log('Step 6: Creating pins for connectors...');
    const connectors = await prisma.connector.findMany();
    let pinsAdded = 0;
    for (const conn of connectors) {
      const existingPins = await prisma.connectorPin.count({ where: { connectorId: conn.id } });
      if (existingPins === 0) {
        const numPins = conn.connectorCode === 'CN1' || conn.connectorCode === 'LTEB' ? 74 : 
                        conn.connectorCode === 'CN2' ? 37 : 
                        conn.connectorCode === 'TCMS_RIO' ? 50 : 20;
        for (let i = 1; i <= numPins; i++) {
          await prisma.connectorPin.create({
            data: {
              connectorId: conn.id,
              pinNo: String(i),
              signalName: `SIG-${conn.connectorCode}-${i}`,
              wireNo: String(1000 + i),
              description: `${conn.connectorCode} Pin ${i}`,
            }
          });
          pinsAdded++;
        }
      }
    }
    console.log(`Pins added: ${pinsAdded}\n`);

    const stats = await Promise.all([
      prisma.system.count(),
      prisma.drawing.count(),
      prisma.trainLine.count(),
      prisma.wire.count(),
      prisma.connector.count(),
      prisma.connectorPin.count(),
    ]);

    console.log('=== Final Statistics ===');
    console.log(`  Systems: ${stats[0]}`);
    console.log(`  Drawings: ${stats[1]}`);
    console.log(`  Trainlines: ${stats[2]}`);
    console.log(`  Wires: ${stats[3]}`);
    console.log(`  Connectors: ${stats[4]}`);
    console.log(`  Pins: ${stats[5]}`);
    console.log('\n=== Full Seed Complete ===');

    return NextResponse.json({
      success: true,
      message: 'Complete VCC Full Seed Complete',
      stats: {
        systems: stats[0],
        drawings: stats[1],
        trainlines: stats[2],
        wires: stats[3],
        connectors: stats[4],
        pins: stats[5],
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed', details: String(error) }, { status: 500 });
  }
}