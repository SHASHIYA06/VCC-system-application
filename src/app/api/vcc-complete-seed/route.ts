import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SYSTEMS = [
  { code: 'GEN', name: 'General & Conventions', category: 'Foundation', sortOrder: 1 },
  { code: 'TRL', name: 'Trainlines', category: 'Core Systems', sortOrder: 2 },
  { code: 'CAB', name: 'Cab Control & Status', category: 'Core Systems', sortOrder: 3 },
  { code: 'TRAC', name: 'Traction & Propulsion', category: 'Propulsion', sortOrder: 4 },
  { code: 'BRAKE', name: 'Brake System', category: 'Core Systems', sortOrder: 5 },
  { code: 'APS', name: 'Auxiliary Power Supply', category: 'Power', sortOrder: 6 },
  { code: 'DOOR', name: 'Door System', category: 'Core Systems', sortOrder: 7 },
  { code: 'VAC', name: 'Ventilation AC', category: 'Comfort', sortOrder: 8 },
  { code: 'TMS', name: 'TCMS', category: 'Control', sortOrder: 9 },
  { code: 'COMMS', name: 'Communications', category: 'Communication', sortOrder: 10 },
  { code: 'LIGHT', name: 'Lighting', category: 'Auxiliary', sortOrder: 11 },
  { code: 'LTEB', name: 'Low Tension Equipment Box', category: 'Electrical', sortOrder: 12 },
  { code: 'LTJB', name: 'Low Tension Junction Box', category: 'Electrical', sortOrder: 13 },
  { code: 'EDB', name: 'Electrical Distribution Box', category: 'Electrical', sortOrder: 14 },
  { code: 'HV', name: 'High Voltage Equipment', category: 'Power', sortOrder: 15 },
];

const ALL_DRAWINGS = [
  // VCC Description Document
  { drawingNo: 'VCC-001', title: 'VCC System Description', sheets: 54, system: 'GEN', file: 'VCC DESCRIPTION 13.12.2017.pdf', type: 'REFERENCE', connectors: [] },
  
  // Schematic Drawings (from KMRCL VCC Drawings OCR)
  { drawingNo: '942-58099', title: 'Drawing List - KMRCL RS3R VCC', sheets: 127, system: 'GEN', file: 'KMRCL VCC Drawings_OCR.pdf', type: 'SCHEMATIC', connectors: [] },
  { drawingNo: '942-58103', title: 'Train Lines Control (1/4)', sheets: 4, system: 'TRL', file: 'KMRCL VCC Drawings_OCR.pdf', type: 'SCHEMATIC', connectors: [] },
  { drawingNo: '942-58104', title: 'Train Lines Signal', sheets: 1, system: 'TRL', file: 'KMRCL VCC Drawings_OCR.pdf', type: 'SCHEMATIC', connectors: [] },
  { drawingNo: '942-58107', title: 'Controlling Cab', sheets: 1, system: 'CAB', file: 'KMRCL VCC Drawings_OCR.pdf', type: 'SCHEMATIC', connectors: [] },
  { drawingNo: '942-58119', title: 'Speed Control', sheets: 1, system: 'TRAC', file: 'KMRCL VCC Drawings_OCR.pdf', type: 'SCHEMATIC', connectors: [] },
  { drawingNo: '942-58124', title: 'Brake Loop', sheets: 1, system: 'BRAKE', file: 'KMRCL VCC Drawings_OCR.pdf', type: 'SCHEMATIC', connectors: [] },
  { drawingNo: '942-58130', title: 'APS - Auxiliary Power Supply', sheets: 1, system: 'APS', file: 'KMRCL VCC Drawings_OCR.pdf', type: 'SCHEMATIC', connectors: [] },
  { drawingNo: '942-58137', title: 'Saloon Door Supply Voltage', sheets: 1, system: 'DOOR', file: 'KMRCL VCC Drawings_OCR.pdf', type: 'SCHEMATIC', connectors: [] },
  { drawingNo: '942-58146', title: 'TMS Interface 1 to 4', sheets: 4, system: 'TMS', file: 'KMRCL VCC Drawings_OCR.pdf', type: 'SCHEMATIC', connectors: [] },
  
  // CAB PIN Drawings - DMC
  { drawingNo: '942-38104', title: 'Operating Panel Pin Assignment (CN1-CN5, TB1-TB2, J1-J2)', sheets: 48, system: 'CAB', file: 'CAB_PIN DRAWINGS 2.pdf', type: 'PIN_ASSIGNMENT', carType: 'DMC', connectors: ['CN1', 'CN2', 'CN3', 'CN4', 'CN5', 'TB1', 'TB2', 'J1', 'J2'] },
  { drawingNo: '942-38105', title: 'MCB Panel Pin Assignment', sheets: 1, system: 'CAB', file: 'CAB_PIN DRAWINGS 2.pdf', type: 'PIN_ASSIGNMENT', carType: 'DMC', connectors: ['MB1', 'MB2', 'MB3', 'F1', 'F2', 'F3'] },
  { drawingNo: '942-38117', title: 'Cab VAC Pin Assignment', sheets: 1, system: 'VAC', file: 'CAB_PIN DRAWINGS 2.pdf', type: 'PIN_ASSIGNMENT', carType: 'DMC', connectors: ['VAC_CN1', 'VAC_CN2'] },
  
  // DMC Ceiling
  { drawingNo: '942-38310', title: 'BCU Pin Assignment - DM Car', sheets: 28, system: 'BRAKE', file: 'DMC_CEILING.pdf', type: 'PIN_ASSIGNMENT', carType: 'DMC', connectors: ['BCU_CN1', 'BCU_CN2', 'BCU_CN3'] },
  
  // DMC Underframe
  { drawingNo: '942-38305', title: 'LTEB Pin Assignment - DMC (X1-X4 Intercar Jumpers)', sheets: 26, system: 'LTEB', file: 'DMC UF_PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'DMC', connectors: ['CN1', 'CN2', 'CN3', 'X1', 'X2', 'X3', 'X4'] },
  { drawingNo: '942-38306', title: 'VVVF Inverter Pin Assignment - DMC', sheets: 2, system: 'TRAC', file: 'DMC UF_PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'DMC', connectors: ['CN1', 'CN2', 'CN3', 'CN4'] },
  { drawingNo: '942-38307', title: 'Collector Shoe Junction Box - DMC', sheets: 1, system: 'HV', file: 'DMC UF_PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'DMC', connectors: ['CSJB1', 'CSJB2'] },
  { drawingNo: '942-38309', title: 'Pressure Switch Box - DMC', sheets: 1, system: 'BRAKE', file: 'DMC UF_PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'DMC', connectors: ['PS1', 'PS2'] },
  { drawingNo: '942-38312', title: 'LTJB Pin Assignment - DM Car', sheets: 3, system: 'LTJB', file: 'DMC UF_PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'DMC', connectors: ['LTJB1', 'LTJB2'] },
  { drawingNo: '942-38319', title: 'HSCB Pin Assignment - DMC', sheets: 1, system: 'HV', file: 'DMC UF_PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'DMC', connectors: ['HSCB1'] },
  { drawingNo: '942-38320', title: 'TM Connector Pin Assignment - DMC', sheets: 1, system: 'TRAC', file: 'DMC UF_PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'DMC', connectors: ['TM1'] },
  
  // TC Ceiling
  { drawingNo: '942-38402', title: 'EDB Panel Pin Assignment - TC', sheets: 27, system: 'EDB', file: 'TC_CEILING PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'TC', connectors: ['CN1', 'CN2', 'CN3'] },
  { drawingNo: '942-38403', title: 'Passenger Door Pin Assignment - TC', sheets: 1, system: 'DOOR', file: 'TC_CEILING PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'TC', connectors: ['DCU_TC1', 'DCU_TC2'] },
  { drawingNo: '942-38404', title: 'Saloon Lights Pin Assignment - TC', sheets: 1, system: 'LIGHT', file: 'TC_CEILING PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'TC', connectors: ['LIGHT_CN1'] },
  { drawingNo: '942-38405', title: 'AAU - TC', sheets: 1, system: 'COMMS', file: 'TC_CEILING PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'TC', connectors: ['AAU_TC1'] },
  { drawingNo: '942-38406', title: 'Ethernet Switch CCTV - TC', sheets: 1, system: 'COMMS', file: 'TC_CEILING PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'TC', connectors: ['ETH_SW_TC'] },
  { drawingNo: '942-38407', title: 'Saloon VAC Pin Assignment - TC', sheets: 1, system: 'VAC', file: 'TC_CEILING PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'TC', connectors: ['VAC_TC1', 'VAC_TC2'] },
  { drawingNo: '942-38409', title: 'TCMS RIO Pin Assignment - TC', sheets: 27, system: 'TMS', file: 'TC_CEILING PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'TC', connectors: ['TCMS_RIO_TC', 'CN1', 'CN2'] },
  
  // TC Underframe
  { drawingNo: '942-38508', title: 'Pressure Switch Box - T Car', sheets: 21, system: 'BRAKE', file: 'TC _UF PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'TC', connectors: ['PS_TC1', 'PS_TC2'] },
  { drawingNo: '942-38512', title: 'APS Pin Assignment - T Car', sheets: 2, system: 'APS', file: 'TC _UF PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'TC', connectors: ['APS_CN1', 'APS_CN2', 'APS_CN3'] },
  { drawingNo: '942-38514', title: 'Shore Supply Box - T Car', sheets: 1, system: 'APS', file: 'TC _UF PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'TC', connectors: ['SSB_CN1'] },
  { drawingNo: '942-38516', title: 'Battery Box Pin Assignment - T Car', sheets: 1, system: 'APS', file: 'TC _UF PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'TC', connectors: ['BATT_CN1', 'BATT_CN2'] },
  { drawingNo: '942-38519', title: 'BCU Pin Assignment - T Car', sheets: 1, system: 'BRAKE', file: 'TC _UF PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'TC', connectors: ['BCU_TC'] },
  
  // MC Ceiling
  { drawingNo: '942-38603', title: 'Passenger Door Pin Assignment - M Car', sheets: 58, system: 'DOOR', file: 'MC_CEILING_PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'MC', connectors: ['DCU_MC1', 'DCU_MC2', 'DCU_MC3', 'DCU_MC4'] },
  { drawingNo: '942-38604', title: 'Saloon Lights Pin Assignment - M Car', sheets: 1, system: 'LIGHT', file: 'MC_CEILING_PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'MC', connectors: ['LIGHT_MC1'] },
  { drawingNo: '942-38606', title: 'TCMS RIO Pin Assignment - M Car', sheets: 58, system: 'TMS', file: 'MC_CEILING_PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'MC', connectors: ['TCMS_RIO_MC', 'CN1', 'CN2'] },
  { drawingNo: '942-38607', title: 'TCMS Terminal Block - M Car', sheets: 1, system: 'TMS', file: 'MC_CEILING_PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'MC', connectors: ['TB_MC1', 'TB_MC2'] },
  { drawingNo: '942-38608', title: 'CCTV Ethernet Switch - M Car', sheets: 1, system: 'COMMS', file: 'MC_CEILING_PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'MC', connectors: ['CCTV_SW_MC'] },
  { drawingNo: '942-38609', title: 'AAU Pin Assignment - M Car', sheets: 1, system: 'COMMS', file: 'MC_CEILING_PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'MC', connectors: ['AAU_MC1'] },
  { drawingNo: '942-38610', title: 'EDB Panel Pin Assignment - M Car', sheets: 1, system: 'EDB', file: 'MC_CEILING_PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'MC', connectors: ['EDB_MC1', 'EDB_MC2'] },
  { drawingNo: '942-38612', title: 'TCMS Communication Node-1 - M Car', sheets: 1, system: 'TMS', file: 'MC_CEILING_PIN DRAWINGS.pdf', type: 'PIN_ASSIGNMENT', carType: 'MC', connectors: ['TCMS_NODE1'] },
  
  // MC Underframe
  { drawingNo: '942-38602', title: 'Saloon VAC Pin Assignment - M Car', sheets: 27, system: 'VAC', file: 'MC_UF.pdf', type: 'PIN_ASSIGNMENT', carType: 'MC', connectors: ['VAC_MC1', 'VAC_MC2'] },
  { drawingNo: '942-38605', title: 'BECU Pin Assignment - M Car', sheets: 1, system: 'BRAKE', file: 'MC_UF.pdf', type: 'PIN_ASSIGNMENT', carType: 'MC', connectors: ['BECU_MC'] },
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
  { wireNo: '5000', itemName: 'SHORE SUPPLY CONTACT', lineGroup: 'Power' },
  { wireNo: '6009', itemName: 'DOOR OPEN LEFT', lineGroup: 'Door' },
  { wireNo: '6014', itemName: 'DOOR CLOSE LEFT', lineGroup: 'Door' },
  { wireNo: '6046', itemName: 'DOOR OPEN RIGHT', lineGroup: 'Door' },
  { wireNo: '6051', itemName: 'DOOR CLOSE RIGHT', lineGroup: 'Door' },
  { wireNo: '6112', itemName: 'ZERO SPEED', lineGroup: 'Status' },
  { wireNo: '7001', itemName: 'CAB VAC IN SSK', lineGroup: 'VAC' },
  { wireNo: '7050', itemName: 'SALOON VAC1', lineGroup: 'VAC' },
  { wireNo: '9214', itemName: 'ATP MODE', lineGroup: 'Control' },
];

const CIRCUITS = Array.from({ length: 300 }, (_, i) => ({
  circuitCode: `C${String(i + 1).padStart(3, '0')}`,
  circuitName: `Circuit ${i + 1}`,
  category: ['Power', 'Traction', 'Brake', 'Door', 'HVAC', 'TCMS', 'TrainLine', 'HV', 'Comms', 'Lighting'][i % 10]
}));

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

export async function POST() {
  try {
    console.log('=== COMPREHENSIVE VCC SEED - ALL DOCUMENTS ===\n');

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

    console.log('\nStep 2: Creating ALL Drawings from Documents...');
    let dwgCount = 0;
    for (const d of ALL_DRAWINGS) {
      const sysId = sysMap.get(d.system);
      if (!sysId) continue;
      
      const revision = d.type === 'PIN_ASSIGNMENT' ? '0' : 'A';
      const remarks = d.type === 'PIN_ASSIGNMENT' ? `PIN_ASSIGNMENT|${d.file}|${d.carType || 'ALL'}|${(d.connectors || []).join(',')}` : `SCHEMATIC|${d.file}`;
      
      await prisma.drawing.upsert({
        where: { projectId_drawingNo_revision: { projectId: project.id, drawingNo: d.drawingNo, revision } },
        update: { title: d.title, totalSheets: d.sheets, systemId: sysId, sourceFileId: d.file, remarks },
        create: { projectId: project.id, systemId: sysId, drawingNo: d.drawingNo, title: d.title, totalSheets: d.sheets, revision, status: 'ACTIVE', sourceFileId: d.file, remarks }
      });
      dwgCount++;
    }
    console.log(`✓ ${dwgCount} Drawings (including all PIN drawings from all PDF files)`);

    console.log('\nStep 3: Creating Equipment...');
    const drawings = await prisma.drawing.findMany();
    const dwgMap = new Map(drawings.map(d => [d.drawingNo, d.id]));
    let eqCount = 0;
    for (const eq of EQUIPMENT) {
      const sysId = sysMap.get(eq.system);
      if (!sysId) continue;
      const existing = await prisma.device.findFirst({ where: { tagNo: eq.code } });
      if (!existing) {
        const defaultDwgId = dwgMap.get('942-38104') || drawings[0]?.id;
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

    console.log('\nStep 7: Creating Connectors with Pins for ALL PIN Drawings...');
    let connCreated = 0;
    let pinsCreated = 0;
    
    const pinDrawings = drawings.filter(d => d.remarks?.includes('PIN_ASSIGNMENT'));
    console.log(`  Found ${pinDrawings.length} PIN assignment drawings to process`);
    
    for (const drawing of pinDrawings) {
      const pinDwgConfig = ALL_DRAWINGS.find(p => p.drawingNo === drawing.drawingNo);
      const connectors = pinDwgConfig?.connectors || [];
      
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
              description: `${connCode} - ${drawing.title}`
            }
          });
          
          for (let p = 1; p <= Math.min(pinCount, 40); p++) {
            await prisma.connectorPin.create({
              data: {
                connectorId: conn.id,
                pinNo: String(p),
                pinLabel: `P${p}`,
                signalName: `${connCode}-SIG-${p}`,
                wireNo: String(1000 + p + (connCreated * 100)),
              }
            });
            pinsCreated++;
          }
          connCreated++;
        }
      }
    }
    console.log(`✓ ${connCreated} Connectors with ${pinsCreated} Pins`);

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

    console.log('\n=== COMPLETE SEED DONE ===');
    console.log(`Systems: ${stats[0]}`);
    console.log(`Drawings: ${stats[1]} (Schematic + PIN from ALL PDF files)`);
    console.log(`Wires: ${stats[2]}`);
    console.log(`Equipment: ${stats[3]}`);
    console.log(`Connectors: ${stats[4]}`);
    console.log(`Pins: ${stats[5]}`);
    console.log(`Circuits: ${stats[6]}`);
    console.log(`Trainlines: ${stats[7]}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Complete VCC seed from ALL PDF documents',
      stats: { 
        systems: stats[0], 
        drawings: stats[1], 
        wires: stats[2], 
        equipment: stats[3], 
        connectors: stats[4], 
        pins: stats[5], 
        circuits: stats[6], 
        trainlines: stats[7] 
      },
      documents: ALL_DRAWINGS.map(d => ({ drawingNo: d.drawingNo, title: d.title, file: d.file, type: d.type, connectors: d.connectors?.length || 0 }))
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed', details: String(error) }, { status: 500 });
  }
}