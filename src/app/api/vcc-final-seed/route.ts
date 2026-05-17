import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SYSTEMS = [
  { code: 'GEN', name: 'General & Conventions', category: 'Foundation', description: 'Drawing list, classification, wiring numbers, symbols', sortOrder: 1 },
  { code: 'TRL', name: 'Trainlines', category: 'Core Systems', description: 'Train line control, signal, low/high tension power', sortOrder: 2 },
  { code: 'CAB', name: 'Cab Control & Status', category: 'Core Systems', description: 'Controlling cab, startup, status indication, MCB trip', sortOrder: 3 },
  { code: 'TRAC', name: 'Traction & Propulsion', category: 'Propulsion', description: 'Speed control, VVVF control, traction return current', sortOrder: 4 },
  { code: 'BRAKE', name: 'Brake System', category: 'Core Systems', description: 'Compressor, brake loop, emergency brake, parking brake, horn', sortOrder: 5 },
  { code: 'APS', name: 'Auxiliary Power Supply', category: 'Power', description: 'APS, shore supply, battery control', sortOrder: 6 },
  { code: 'DOOR', name: 'Door System', category: 'Core Systems', description: 'Door operation, proving loop, local interlock, TMS interface', sortOrder: 7 },
  { code: 'VAC', name: 'Ventilation AC', category: 'Comfort', description: 'Cab VAC, saloon VAC power/control', sortOrder: 8 },
  { code: 'TMS', name: 'TCMS', category: 'Control', description: 'Train Control Management System, RIO, Terminal Block', sortOrder: 9 },
  { code: 'COMMS', name: 'Communications', category: 'Communication', description: 'PIS, PA, CCTV, Radio, CBTC', sortOrder: 10 },
  { code: 'LIGHT', name: 'Lighting', category: 'Auxiliary', description: 'Head cab light, saloon lights, console light', sortOrder: 11 },
  { code: 'LTEB', name: 'Low Tension Equipment Box', category: 'Electrical', description: 'LTEB pin assignments and wiring', sortOrder: 12 },
  { code: 'LTJB', name: 'Low Tension Junction Box', category: 'Electrical', description: 'LTJB pin assignments and wiring', sortOrder: 13 },
  { code: 'EDB', name: 'Electrical Distribution Box', category: 'Electrical', description: 'EDB panel assignments', sortOrder: 14 },
  { code: 'HV', name: 'High Voltage Equipment', category: 'Power', description: 'Collector shoe, HSCB, main switch box, HTEB', sortOrder: 15 },
];

const PIN_DRAWINGS = [
  { drawingNo: '942-38104', title: 'Operating Panel Pin Assignment', sheets: 48, system: 'CAB', file: 'CAB_PIN DRAWINGS 2.pdf', carType: 'DMC', connectors: ['CN1', 'CN2', 'CN3', 'CN4', 'CN5', 'TB1', 'TB2', 'J1', 'J2'] },
  { drawingNo: '942-38105', title: 'MCB Panel Pin Assignment', sheets: 1, system: 'CAB', file: 'CAB_PIN DRAWINGS 2.pdf', carType: 'DMC', connectors: ['MB1', 'MB2', 'MB3', 'F1', 'F2', 'F3'] },
  { drawingNo: '942-38305', title: 'LTEB Pin Assignment - DMC', sheets: 26, system: 'LTEB', file: 'DMC UF_PIN DRAWINGS.pdf', carType: 'DMC', connectors: ['CN1', 'CN2', 'CN3', 'X1', 'X2', 'X3', 'X4'] },
  { drawingNo: '942-38306', title: 'VVVF Inverter Pin Assignment - DMC', sheets: 2, system: 'TRAC', file: 'DMC UF_PIN DRAWINGS.pdf', carType: 'DMC', connectors: ['CN1', 'CN2', 'CN3', 'CN4'] },
  { drawingNo: '942-38310', title: 'BCU Pin Assignment - DM Car', sheets: 28, system: 'BRAKE', file: 'DMC_CEILING.pdf', carType: 'DMC', connectors: ['CN1', 'CN2', 'CN3'] },
  { drawingNo: '942-38312', title: 'LTJB Pin Assignment - DM Car', sheets: 3, system: 'LTJB', file: 'DMC UF_PIN DRAWINGS.pdf', carType: 'DMC', connectors: ['CN1', 'CN2'] },
  { drawingNo: '942-38402', title: 'EDB Panel Pin Assignment - TC', sheets: 27, system: 'EDB', file: 'TC_CEILING PIN DRAWINGS.pdf', carType: 'TC', connectors: ['CN1', 'CN2', 'CN3'] },
  { drawingNo: '942-38409', title: 'TCMS RIO Pin Assignment - TC', sheets: 27, system: 'TMS', file: 'TC_CEILING PIN DRAWINGS.pdf', carType: 'TC', connectors: ['CN1', 'CN2'] },
  { drawingNo: '942-38512', title: 'APS Pin Assignment - T Car', sheets: 2, system: 'APS', file: 'TC _UF PIN DRAWINGS.pdf', carType: 'TC', connectors: ['CN1', 'CN2', 'CN3'] },
  { drawingNo: '942-38602', title: 'Saloon VAC Pin Assignment - M Car', sheets: 27, system: 'VAC', file: 'MC_UF.pdf', carType: 'MC', connectors: ['CN1', 'CN2'] },
  { drawingNo: '942-38603', title: 'Passenger Door Pin Assignment - M Car', sheets: 58, system: 'DOOR', file: 'MC_CEILING_PIN DRAWINGS.pdf', carType: 'MC', connectors: ['CN1', 'CN2', 'X1', 'X2'] },
  { drawingNo: '942-38605', title: 'BECU Pin Assignment - M Car', sheets: 1, system: 'BRAKE', file: 'MC_UF.pdf', carType: 'MC', connectors: ['CN1', 'CN2'] },
  { drawingNo: '942-38606', title: 'TCMS RIO Pin Assignment - M Car', sheets: 58, system: 'TMS', file: 'MC_CEILING_PIN DRAWINGS.pdf', carType: 'MC', connectors: ['CN1', 'CN2'] },
];

const SCHEMATIC_DRAWINGS = [
  { drawingNo: '942-58099', title: 'Drawing List - KMRCL RS3R VCC', sheets: 127, system: 'GEN' },
  { drawingNo: '942-58103', title: 'Train Lines Control (1/4)', sheets: 4, system: 'TRL' },
  { drawingNo: '942-58104', title: 'Train Lines Signal', sheets: 1, system: 'TRL' },
  { drawingNo: '942-58105', title: 'Low Tension Power Train Line', sheets: 1, system: 'TRL' },
  { drawingNo: '942-58107', title: 'Controlling Cab', sheets: 1, system: 'CAB' },
  { drawingNo: '942-58119', title: 'Speed Control', sheets: 1, system: 'TRAC' },
  { drawingNo: '942-58120', title: 'VVVF Control', sheets: 1, system: 'TRAC' },
  { drawingNo: '942-58124', title: 'Brake Loop', sheets: 1, system: 'BRAKE' },
  { drawingNo: '942-58130', title: 'APS - Auxiliary Power Supply', sheets: 1, system: 'APS' },
  { drawingNo: '942-58137', title: 'Saloon Door Supply Voltage', sheets: 1, system: 'DOOR' },
  { drawingNo: '942-58143', title: 'Cab VAC - Air Conditioning', sheets: 1, system: 'VAC' },
  { drawingNo: '942-58146', title: 'TMS Interface 1 to 4', sheets: 4, system: 'TMS' },
  { drawingNo: '942-58147', title: 'PIS/TIS - Passenger Information System', sheets: 2, system: 'COMMS' },
  { drawingNo: '942-58154', title: 'CCTV - Closed Circuit Television', sheets: 1, system: 'COMMS' },
];

const EQUIPMENT = [
  { code: 'LTEB1', name: 'Low Tension Equipment Box 1', carType: 'DMC', system: 'LTEB' },
  { code: 'LTEB2', name: 'Low Tension Equipment Box 2', carType: 'TC', system: 'LTEB' },
  { code: 'LTEB3', name: 'Low Tension Equipment Box 3', carType: 'MC', system: 'LTEB' },
  { code: 'VVVF1', name: 'VVVF Inverter 1', carType: 'DMC', system: 'TRAC' },
  { code: 'VVVF2', name: 'VVVF Inverter 2', carType: 'MC', system: 'TRAC' },
  { code: 'BCU1', name: 'Brake Control Unit 1', carType: 'DMC', system: 'BRAKE' },
  { code: 'BCU2', name: 'Brake Control Unit 2', carType: 'TC', system: 'BRAKE' },
  { code: 'BECU1', name: 'Brake Electronic Control Unit', carType: 'MC', system: 'BRAKE' },
  { code: 'APS1', name: 'Auxiliary Power Supply 1', carType: 'TC', system: 'APS' },
  { code: 'SSB1', name: 'Shore Supply Box 1', carType: 'TC', system: 'APS' },
  { code: 'BATT1', name: 'Battery Box 1', carType: 'TC', system: 'APS' },
  { code: 'HSCB1', name: 'High Speed Circuit Breaker 1', carType: 'DMC', system: 'HV' },
  { code: 'HSCB2', name: 'High Speed Circuit Breaker 2', carType: 'MC', system: 'HV' },
  { code: 'TCMS_RIO1', name: 'TCMS Remote IO Unit 1', carType: 'MC', system: 'TMS' },
  { code: 'TCMS_RIO2', name: 'TCMS Remote IO Unit 2', carType: 'TC', system: 'TMS' },
  { code: 'DCU1', name: 'Door Control Unit 1', carType: 'MC', system: 'DOOR' },
  { code: 'DCU2', name: 'Door Control Unit 2', carType: 'TC', system: 'DOOR' },
  { code: 'VAC1', name: 'Saloon VAC Unit 1', carType: 'MC', system: 'VAC' },
  { code: 'VAC2', name: 'Saloon VAC Unit 2', carType: 'TC', system: 'VAC' },
  { code: 'CAB_PANEL', name: 'Cab Operating Panel', carType: 'DMC', system: 'CAB' },
];

const TRAINLINES = [
  { wireNo: '1032', itemName: 'RESET', lineGroup: 'Control' },
  { wireNo: '1050', itemName: 'SHUT DOWN', lineGroup: 'Control' },
  { wireNo: '1205', itemName: 'LINE VOLTAGE', lineGroup: 'Power' },
  { wireNo: '1207', itemName: 'VVF FAULT', lineGroup: 'Status' },
  { wireNo: '1209', itemName: 'HSCB TRIP', lineGroup: 'Status' },
  { wireNo: '3003', itemName: 'FORWARD', lineGroup: 'Traction' },
  { wireNo: '3004', itemName: 'REVERSE', lineGroup: 'Traction' },
  { wireNo: '3005', itemName: 'POWERING1', lineGroup: 'Traction' },
  { wireNo: '3006', itemName: 'POWERING2', lineGroup: 'Traction' },
  { wireNo: '3010', itemName: 'BRAKING', lineGroup: 'Traction' },
  { wireNo: '3011', itemName: 'FULL SERVICE BRAKE', lineGroup: 'Brake' },
  { wireNo: '4024', itemName: 'BRAKE LOOP', lineGroup: 'Brake' },
  { wireNo: '4062', itemName: 'EM BRAKE LOOP NORMAL', lineGroup: 'Brake' },
  { wireNo: '4122', itemName: 'PARKING BRAKE APPLIED', lineGroup: 'Brake' },
  { wireNo: '4153', itemName: 'PARKING BRAKE RELEASED', lineGroup: 'Brake' },
  { wireNo: '5000', itemName: 'SHORE SUPPLY CONTACT', lineGroup: 'Power' },
  { wireNo: '6009', itemName: 'DOOR OPEN LEFT', lineGroup: 'Door' },
  { wireNo: '6014', itemName: 'DOOR CLOSE LEFT', lineGroup: 'Door' },
  { wireNo: '6046', itemName: 'DOOR OPEN RIGHT', lineGroup: 'Door' },
  { wireNo: '6051', itemName: 'DOOR CLOSE RIGHT', lineGroup: 'Door' },
  { wireNo: '6073', itemName: 'DOOR PROVING LOOP 1', lineGroup: 'Door' },
  { wireNo: '6076', itemName: 'DOOR PROVING LOOP 2', lineGroup: 'Door' },
  { wireNo: '6112', itemName: 'ZERO SPEED', lineGroup: 'Status' },
  { wireNo: '7001', itemName: 'CAB VAC IN SSK', lineGroup: 'VAC' },
  { wireNo: '7050', itemName: 'SALOON VAC1', lineGroup: 'VAC' },
  { wireNo: '7060', itemName: 'SALOON VAC2', lineGroup: 'VAC' },
];

const CIRCUITS = [
  { circuitCode: 'C001', circuitName: 'Main Power Supply Circuit', category: 'Power' },
  { circuitCode: 'C002', circuitName: 'Emergency Power Supply', category: 'Power' },
  { circuitCode: 'C003', circuitName: 'Battery Charging Circuit', category: 'Power' },
  { circuitCode: 'C007', circuitName: 'VVVF Inverter Control', category: 'Traction' },
  { circuitCode: 'C008', circuitName: 'Traction Motor Circuit', category: 'Traction' },
  { circuitCode: 'C011', circuitName: 'Brake Control Circuit', category: 'Brake' },
  { circuitCode: 'C012', circuitName: 'Emergency Brake Circuit', category: 'Brake' },
  { circuitCode: 'C016', circuitName: 'Door Control Circuit - Left', category: 'Door' },
  { circuitCode: 'C017', circuitName: 'Door Control Circuit - Right', category: 'Door' },
  { circuitCode: 'C018', circuitName: 'Door Safety Circuit', category: 'Door' },
  { circuitCode: 'C020', circuitName: 'Cab HVAC Circuit', category: 'HVAC' },
  { circuitCode: 'C021', circuitName: 'Saloon HVAC Circuit', category: 'HVAC' },
  { circuitCode: 'C023', circuitName: 'TCMS Communication Circuit', category: 'TCMS' },
  { circuitCode: 'C027', circuitName: 'Train Line Signal Circuit', category: 'TrainLine' },
  { circuitCode: 'C028', circuitName: 'Train Line Power Circuit', category: 'TrainLine' },
  { circuitCode: 'C032', circuitName: 'HSCB Control Circuit', category: 'HV' },
  { circuitCode: 'C036', circuitName: 'APS Shore Supply Circuit', category: 'Power' },
  { circuitCode: 'C037', circuitName: 'SIV Static Inverter Circuit', category: 'Power' },
  { circuitCode: 'C039', circuitName: 'PIS Display Circuit', category: 'Comms' },
  { circuitCode: 'C040', circuitName: 'CCTV Circuit', category: 'Comms' },
  { circuitCode: 'C041', circuitName: 'PA System Circuit', category: 'Comms' },
  { circuitCode: 'C044', circuitName: 'Interior Lighting Circuit', category: 'Lighting' },
  { circuitCode: 'C045', circuitName: 'Cab Lighting Circuit', category: 'Lighting' },
];

for (let i = 25; i <= 300; i++) {
  const cats = ['Power', 'Traction', 'Brake', 'Door', 'HVAC', 'TCMS', 'TrainLine', 'HV', 'Comms', 'Lighting'];
  CIRCUITS.push({ circuitCode: `C${String(i).padStart(3, '0')}`, circuitName: `${cats[i % 10]} Circuit ${i}`, category: cats[i % 10] });
}

export async function POST() {
  try {
    console.log('=== VCC COMPREHENSIVE SEED ===\n');

    let project = await prisma.project.findFirst();
    if (!project) {
      project = await prisma.project.create({ data: { projectCode: 'KMRCL_RS3R', projectName: 'KMRCL RS3R Metro', description: 'Kolkata Metro RS3R VCC' } });
      console.log('✓ Created project');
    }

    console.log('\nStep 1: Creating Systems...');
    for (const sys of SYSTEMS) {
      await prisma.system.upsert({ where: { code: sys.code }, update: sys, create: sys });
    }
    const systems = await prisma.system.findMany();
    const sysMap = new Map(systems.map(s => [s.code, s.id]));
    console.log(`✓ ${systems.length} Systems`);

    console.log('\nStep 2: Creating Drawings (Schematic + PIN)...');
    let dwgCount = 0;
    for (const d of [...SCHEMATIC_DRAWINGS, ...PIN_DRAWINGS]) {
      const sysId = sysMap.get(d.system);
      if (!sysId) continue;
      const revision = d.connectors ? '0' : 'A';
      await prisma.drawing.upsert({
        where: { projectId_drawingNo_revision: { projectId: project.id, drawingNo: d.drawingNo, revision } },
        update: { title: d.title, totalSheets: d.sheets, systemId: sysId },
        create: { projectId: project.id, systemId: sysId, drawingNo: d.drawingNo, title: d.title, totalSheets: d.sheets, revision, status: 'ACTIVE', sourceFileId: d.file || null, remarks: d.connectors ? `PIN_ASSIGNMENT|${d.file}` : 'SCHEMATIC' }
      });
      dwgCount++;
    }
    console.log(`✓ ${dwgCount} Drawings`);

    console.log('\nStep 3: Creating Equipment...');
    const drawings = await prisma.drawing.findMany();
    const dwgMap = new Map(drawings.map(d => [d.drawingNo, d.id]));
    let eqCount = 0;
    for (const eq of EQUIPMENT) {
      const sysId = sysMap.get(eq.system);
      if (!sysId) continue;
      const existing = await prisma.device.findFirst({ where: { tagNo: eq.code } });
      if (!existing) {
        const defaultDwgId = dwgMap.get('942-58103') || drawings[0]?.id;
        if (defaultDwgId) {
          await prisma.device.create({ data: { drawingId: defaultDwgId, systemId: sysId, tagNo: eq.code, deviceName: eq.name, deviceType: 'MODULE', carType: eq.carType } });
          eqCount++;
        }
      }
    }
    console.log(`✓ ${eqCount} Equipment`);

    console.log('\nStep 4: Creating Circuits...');
    let circuitCount = 0;
    const defaultDwg = drawings[0];
    for (const c of CIRCUITS) {
      const existing = await prisma.circuit.findFirst({ where: { circuitCode: c.circuitCode } });
      if (!existing && defaultDwg) {
        await prisma.circuit.create({ data: { drawingId: defaultDwg.id, circuitCode: c.circuitCode, circuitName: c.circuitName, category: c.category, voltageText: '110VDC' } });
        circuitCount++;
      }
    }
    console.log(`✓ ${circuitCount} Circuits`);

    console.log('\nStep 5: Creating Trainlines...');
    const trlDwg = drawings.find(d => d.systemId === sysMap.get('TRL')) || drawings[0];
    let tlCount = 0;
    if (trlDwg) {
      for (const tl of TRAINLINES) {
        const existing = await prisma.trainLine.findFirst({ where: { wireNo: tl.wireNo } });
        if (!existing) {
          await prisma.trainLine.create({ data: { drawingId: trlDwg.id, wireNo: tl.wireNo, itemName: tl.itemName, lineGroup: tl.lineGroup, carType: 'ALL' } });
          tlCount++;
        }
      }
    }
    console.log(`✓ ${tlCount} Trainlines`);

    console.log('\nStep 6: Creating Wires...');
    let wireCount = 0;
    for (let i = 1000; i <= 9999; i++) {
      const existing = await prisma.wire.findUnique({ where: { wireNo: String(i) } });
      if (!existing) {
        await prisma.wire.create({
          data: {
            wireNo: String(i),
            signalName: `SIG-${i}`,
            description: `Wire ${i} - VCC system connection`,
            voltageClass: i < 2000 ? '110VDC' : (i < 5000 ? '750VDC' : '110VDC'),
            wireSize: ['2.5mm²', '4mm²', '6mm²', '1.5mm²'][i % 4],
            wireColor: ['RED', 'BLUE', 'GREEN', 'WHITE', 'BLACK', 'YELLOW', 'ORANGE'][i % 7],
            sourceEquipment: EQUIPMENT[i % EQUIPMENT.length].code,
            destEquipment: EQUIPMENT[(i + 5) % EQUIPMENT.length].code,
          }
        });
        wireCount++;
      }
    }
    console.log(`✓ ${wireCount} Wires`);

    console.log('\nStep 7: Creating Connectors with Pins for PIN Drawings...');
    let connCreated = 0;
    let pinsCreated = 0;
    
    const pinDrawings = drawings.filter(d => d.remarks?.includes('PIN_ASSIGNMENT'));
    for (const drawing of pinDrawings) {
      const pinDwgConfig = PIN_DRAWINGS.find(p => p.drawingNo === drawing.drawingNo);
      const connectors = pinDwgConfig?.connectors || ['CN1', 'CN2'];
      
      for (const connCode of connectors) {
        const existingConn = await prisma.connector.findFirst({ where: { connectorCode: connCode, drawingId: drawing.id } });
        
        if (!existingConn) {
          const pinCount = connCode.startsWith('CN') ? 74 : connCode.startsWith('X') ? 74 : connCode.startsWith('MB') ? 30 : 20;
          const conn = await prisma.connector.create({
            data: {
              drawingId: drawing.id,
              connectorCode: connCode,
              connectorTypeCode: connCode.startsWith('CN') ? '74P' : 'TERMINAL',
              pinCount: pinCount,
              carType: pinDwgConfig?.carType || 'ALL',
              description: `${connCode} - ${pinDwgConfig?.title || 'Connector'}`
            }
          });
          
          for (let p = 1; p <= pinCount; p++) {
            const signalNames = ['FORWARD', 'REVERSE', 'BRAKE', 'DOOR_OPEN', 'DOOR_CLOSE', 'POWER', 'RESET', 'FAULT', 'STATUS', 'SPEED'];
            await prisma.connectorPin.create({
              data: {
                connectorId: conn.id,
                pinNo: String(p),
                pinLabel: `P${p}`,
                signalName: `${connCode}-${signalNames[p % signalNames.length]}-${p}`,
                wireNo: String(1000 + p + (connCreated * 100)),
              }
            });
            pinsCreated++;
          }
          connCreated++;
        }
      }
    }
    console.log(`✓ ${connCreated} Connectors, ${pinsCreated} Pins`);

    const stats = await Promise.all([
      prisma.system.count(),
      prisma.drawing.count(),
      prisma.wire.count(),
      prisma.device.count(),
      prisma.connector.count(),
      prisma.connectorPin.count(),
      prisma.circuit.count(),
      prisma.trainLine.count(),
    ]);

    console.log('\n=== SEED COMPLETE ===');
    console.log(`Systems: ${stats[0]}`);
    console.log(`Drawings: ${stats[1]} (Schematic + PIN)`);
    console.log(`Wires: ${stats[2]}`);
    console.log(`Equipment: ${stats[3]}`);
    console.log(`Connectors: ${stats[4]}`);
    console.log(`Pins: ${stats[5]}`);
    console.log(`Circuits: ${stats[6]}`);
    console.log(`Trainlines: ${stats[7]}`);

    return NextResponse.json({ success: true, stats: { systems: stats[0], drawings: stats[1], wires: stats[2], equipment: stats[3], connectors: stats[4], pins: stats[5], circuits: stats[6], trainlines: stats[7] } });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed', details: String(error) }, { status: 500 });
  }
}