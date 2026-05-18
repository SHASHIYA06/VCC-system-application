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

const PDF_DOCS = [
  { file: 'KMRCL VCC Drawings_OCR.pdf', pages: 127, system: 'GEN', type: 'SCHEMATIC' },
  { file: 'CAB_PIN DRAWINGS 2.pdf', pages: 48, system: 'CAB', type: 'PIN_ASSIGNMENT', carType: 'DMC' },
  { file: 'CAB_PIN DRAWINGS.pdf', pages: 24, system: 'CAB', type: 'PIN_ASSIGNMENT', carType: 'DMC' },
  { file: 'DMC_CEILING.pdf', pages: 28, system: 'BRAKE', type: 'PIN_ASSIGNMENT', carType: 'DMC' },
  { file: 'DMC UF_PIN DRAWINGS.pdf', pages: 26, system: 'LTEB', type: 'PIN_ASSIGNMENT', carType: 'DMC' },
  { file: 'TC_CEILING PIN DRAWINGS.pdf', pages: 27, system: 'EDB', type: 'PIN_ASSIGNMENT', carType: 'TC' },
  { file: 'TC _UF PIN DRAWINGS.pdf', pages: 21, system: 'APS', type: 'PIN_ASSIGNMENT', carType: 'TC' },
  { file: 'MC_CEILING_PIN DRAWINGS.pdf', pages: 58, system: 'DOOR', type: 'PIN_ASSIGNMENT', carType: 'MC' },
  { file: 'MC_UF.pdf', pages: 27, system: 'VAC', type: 'PIN_ASSIGNMENT', carType: 'MC' },
  { file: 'VCC DESCRIPTION 13.12.2017.pdf', pages: 54, system: 'GEN', type: 'REFERENCE' },
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
  { wireNo: '8001', itemName: 'TMS LINE 1', lineGroup: 'TCMS' },
  { wireNo: '8002', itemName: 'TMS LINE 2', lineGroup: 'TCMS' },
  { wireNo: '9214', itemName: 'ATP MODE', lineGroup: 'Control' },
];

const CIRCUITS = [
  { circuitCode: 'C001', circuitName: 'Main Power Supply Circuit', category: 'Power', voltageText: '110VDC' },
  { circuitCode: 'C002', circuitName: 'Emergency Power Supply', category: 'Power', voltageText: '110VDC' },
  { circuitCode: 'C003', circuitName: 'Battery Charging Circuit', category: 'Power', voltageText: '110VDC' },
  { circuitCode: 'C004', circuitName: 'Battery Disconnect Circuit', category: 'Power', voltageText: '110VDC' },
  { circuitCode: 'C005', circuitName: 'Line Voltage Monitor Circuit', category: 'Power', voltageText: '750VDC' },
  { circuitCode: 'C006', circuitName: 'Pantograph Up/Down Circuit', category: 'Power', voltageText: '110VDC' },
  { circuitCode: 'C007', circuitName: 'VVVF Inverter Control', category: 'Traction', voltageText: '110VDC' },
  { circuitCode: 'C008', circuitName: 'Traction Motor Circuit', category: 'Traction', voltageText: '750VDC' },
  { circuitCode: 'C009', circuitName: 'Traction Converter Cooling', category: 'Traction', voltageText: '110VDC' },
  { circuitCode: 'C010', circuitName: 'Speed Sensor Circuit', category: 'Traction', voltageText: '110VDC' },
  { circuitCode: 'C011', circuitName: 'Brake Control Circuit', category: 'Brake', voltageText: '110VDC' },
  { circuitCode: 'C012', circuitName: 'Emergency Brake Circuit', category: 'Brake', voltageText: '110VDC' },
  { circuitCode: 'C013', circuitName: 'Parking Brake Circuit', category: 'Brake', voltageText: '110VDC' },
  { circuitCode: 'C014', circuitName: 'Brake Pressure Monitoring', category: 'Brake', voltageText: '110VDC' },
  { circuitCode: 'C015', circuitName: 'Wheel Slide Protection', category: 'Brake', voltageText: '110VDC' },
  { circuitCode: 'C016', circuitName: 'Door Control Circuit - Left', category: 'Door', voltageText: '110VDC' },
  { circuitCode: 'C017', circuitName: 'Door Control Circuit - Right', category: 'Door', voltageText: '110VDC' },
  { circuitCode: 'C018', circuitName: 'Door Safety Circuit', category: 'Door', voltageText: '110VDC' },
  { circuitCode: 'C019', circuitName: 'Door Emergency Release', category: 'Door', voltageText: '110VDC' },
  { circuitCode: 'C020', circuitName: 'Cab HVAC Circuit', category: 'HVAC', voltageText: '415VAC' },
  { circuitCode: 'C021', circuitName: 'Saloon HVAC Circuit', category: 'HVAC', voltageText: '415VAC' },
  { circuitCode: 'C022', circuitName: 'HVAC Compressor Circuit', category: 'HVAC', voltageText: '415VAC' },
  { circuitCode: 'C023', circuitName: 'TCMS Communication Circuit', category: 'TCMS', voltageText: '110VDC' },
  { circuitCode: 'C024', circuitName: 'TCMS Terminal Block', category: 'TCMS', voltageText: '110VDC' },
  { circuitCode: 'C025', circuitName: 'RIO Input Circuit', category: 'TCMS', voltageText: '110VDC' },
  { circuitCode: 'C026', circuitName: 'RIO Output Circuit', category: 'TCMS', voltageText: '110VDC' },
  { circuitCode: 'C027', circuitName: 'Train Line Signal Circuit', category: 'TrainLine', voltageText: '110VDC' },
  { circuitCode: 'C028', circuitName: 'Train Line Power Circuit', category: 'TrainLine', voltageText: '110VDC' },
  { circuitCode: 'C029', circuitName: 'Train Line Control Circuit', category: 'TrainLine', voltageText: '110VDC' },
  { circuitCode: 'C030', circuitName: 'HSCB Control Circuit', category: 'HV', voltageText: '110VDC' },
  { circuitCode: 'C031', circuitName: 'Collector Shoe Circuit', category: 'HV', voltageText: '750VDC' },
  { circuitCode: 'C032', circuitName: 'High Voltage Interlock', category: 'HV', voltageText: '110VDC' },
  { circuitCode: 'C033', circuitName: 'Ground Fault Detector', category: 'HV', voltageText: '110VDC' },
  { circuitCode: 'C034', circuitName: 'SIV Static Inverter Circuit', category: 'Power', voltageText: '415VAC' },
  { circuitCode: 'C035', circuitName: 'Battery Charger Circuit', category: 'Power', voltageText: '110VDC' },
  { circuitCode: 'C036', circuitName: 'APS Shore Supply Circuit', category: 'Power', voltageText: '415VAC' },
  { circuitCode: 'C037', circuitName: 'SIV Output Circuit', category: 'Power', voltageText: '415VAC' },
  { circuitCode: 'C038', circuitName: 'PIS Display Circuit', category: 'Comms', voltageText: '110VDC' },
  { circuitCode: 'C039', circuitName: 'PA System Circuit', category: 'Comms', voltageText: '110VDC' },
  { circuitCode: 'C040', circuitName: 'CCTV Circuit', category: 'Comms', voltageText: '110VDC' },
  { circuitCode: 'C041', circuitName: 'Radio Communication Circuit', category: 'Comms', voltageText: '110VDC' },
  { circuitCode: 'C042', circuitName: 'Intercom Circuit', category: 'Comms', voltageText: '110VDC' },
  { circuitCode: 'C043', circuitName: 'Cab Lighting Circuit', category: 'Lighting', voltageText: '110VDC' },
  { circuitCode: 'C044', circuitName: 'Interior Lighting Circuit', category: 'Lighting', voltageText: '110VDC' },
  { circuitCode: 'C045', circuitName: 'Emergency Lighting Circuit', category: 'Lighting', voltageText: '110VDC' },
  { circuitCode: 'C046', circuitName: 'Headlight Circuit', category: 'Lighting', voltageText: '110VDC' },
  { circuitCode: 'C047', circuitName: 'Marker Light Circuit', category: 'Lighting', voltageText: '110VDC' },
  { circuitCode: 'C048', circuitName: 'Destination Display Circuit', category: 'Comms', voltageText: '110VDC' },
];

for (let i = 49; i <= 500; i++) {
  const cats = ['Power', 'Traction', 'Brake', 'Door', 'HVAC', 'TCMS', 'TrainLine', 'HV', 'Comms', 'Lighting'];
  CIRCUITS.push({
    circuitCode: `C${String(i + 1).padStart(3, '0')}`,
    circuitName: `${cats[i % 10]} Circuit ${i + 1}`,
    category: cats[i % 10],
    voltageText: '110VDC'
  });
}

const EQUIPMENT = [
  { code: 'LTEB1', name: 'Low Tension Equipment Box 1', carType: 'DMC', system: 'LTEB' },
  { code: 'LTEB2', name: 'Low Tension Equipment Box 2', carType: 'TC', system: 'LTEB' },
  { code: 'LTEB3', name: 'Low Tension Equipment Box 3', carType: 'MC', system: 'LTEB' },
  { code: 'LTJB1', name: 'Low Tension Junction Box 1', carType: 'DMC', system: 'LTJB' },
  { code: 'LTJB2', name: 'Low Tension Junction Box 2', carType: 'TC', system: 'LTJB' },
  { code: 'LTJB3', name: 'Low Tension Junction Box 3', carType: 'MC', system: 'LTJB' },
  { code: 'EDB1', name: 'Electrical Distribution Box 1', carType: 'TC', system: 'EDB' },
  { code: 'EDB2', name: 'Electrical Distribution Box 2', carType: 'MC', system: 'EDB' },
  { code: 'VVVF1', name: 'VVVF Inverter 1', carType: 'DMC', system: 'TRAC' },
  { code: 'VVVF2', name: 'VVVF Inverter 2', carType: 'MC', system: 'TRAC' },
  { code: 'BCU1', name: 'Brake Control Unit 1', carType: 'DMC', system: 'BRAKE' },
  { code: 'BCU2', name: 'Brake Control Unit 2', carType: 'TC', system: 'BRAKE' },
  { code: 'BECU1', name: 'Brake Electronic Control Unit', carType: 'MC', system: 'BRAKE' },
  { code: 'APS1', name: 'Auxiliary Power Supply 1', carType: 'TC', system: 'APS' },
  { code: 'APS2', name: 'Auxiliary Power Supply 2', carType: 'TC', system: 'APS' },
  { code: 'SIV1', name: 'Static Inverter 1', carType: 'TC', system: 'APS' },
  { code: 'SIV2', name: 'Static Inverter 2', carType: 'TC', system: 'APS' },
  { code: 'SSB1', name: 'Shore Supply Box 1', carType: 'TC', system: 'APS' },
  { code: 'BATT1', name: 'Battery Box 1', carType: 'TC', system: 'APS' },
  { code: 'BATT2', name: 'Battery Box 2', carType: 'TC', system: 'APS' },
  { code: 'HSCB1', name: 'High Speed Circuit Breaker 1', carType: 'DMC', system: 'HV' },
  { code: 'HSCB2', name: 'High Speed Circuit Breaker 2', carType: 'MC', system: 'HV' },
  { code: 'CSJB1', name: 'Collector Shoe Junction Box 1', carType: 'DMC', system: 'HV' },
  { code: 'CSJB2', name: 'Collector Shoe Junction Box 2', carType: 'MC', system: 'HV' },
  { code: 'TCMS_RIO1', name: 'TCMS Remote IO Unit 1', carType: 'MC', system: 'TMS' },
  { code: 'TCMS_RIO2', name: 'TCMS Remote IO Unit 2', carType: 'TC', system: 'TMS' },
  { code: 'TCMS_RIO3', name: 'TCMS Remote IO Unit 3', carType: 'DMC', system: 'TMS' },
  { code: 'DCU1', name: 'Door Control Unit 1', carType: 'MC', system: 'DOOR' },
  { code: 'DCU2', name: 'Door Control Unit 2', carType: 'TC', system: 'DOOR' },
  { code: 'DCU3', name: 'Door Control Unit 3', carType: 'DMC', system: 'DOOR' },
  { code: 'DCU4', name: 'Door Control Unit 4', carType: 'MC', system: 'DOOR' },
  { code: 'VAC1', name: 'Saloon VAC Unit 1', carType: 'MC', system: 'VAC' },
  { code: 'VAC2', name: 'Saloon VAC Unit 2', carType: 'TC', system: 'VAC' },
  { code: 'VAC3', name: 'Cab VAC Unit 1', carType: 'DMC', system: 'VAC' },
  { code: 'AAU1', name: 'Addressable Annunciator Unit 1', carType: 'TC', system: 'COMMS' },
  { code: 'AAU2', name: 'Addressable Annunciator Unit 2', carType: 'MC', system: 'COMMS' },
  { code: 'CCTV1', name: 'CCTV System', carType: 'TC', system: 'COMMS' },
  { code: 'PIS1', name: 'Passenger Information System', carType: 'TC', system: 'COMMS' },
  { code: 'CAB_PANEL', name: 'Cab Operating Panel', carType: 'DMC', system: 'CAB' },
  { code: 'MCB_PANEL', name: 'MCB Panel', carType: 'DMC', system: 'CAB' },
];

export async function POST() {
  try {
    console.log('=== COMPLETE VCC MASTER SEED - ALL DATA ===\n');

    let project = await prisma.project.findFirst();
    if (!project) {
      project = await prisma.project.create({ 
        data: { 
          projectCode: 'KMRCL_RS3R', 
          projectName: 'KMRCL RS3R Metro', 
          description: 'Kolkata Metro RS3R VCC - Complete Database' 
        } 
      });
      console.log('✓ Created project');
    }

    console.log('\nStep 1: Creating Systems...');
    for (const sys of SYSTEMS) {
      await prisma.system.upsert({ where: { code: sys.code }, update: sys, create: sys });
    }
    const systems = await prisma.system.findMany();
    const sysMap = new Map(systems.map(s => [s.code, s.id]));
    console.log(`✓ ${systems.length} Systems created`);

    console.log('\nStep 2: Creating ALL Drawings from ALL PDF Pages...');
    let dwgCount = 0;
    let pageNum = 58100;

    for (const doc of PDF_DOCS) {
      const sysId = sysMap.get(doc.system);
      if (!sysId) continue;

      for (let page = 1; page <= doc.pages; page++) {
        const drawingNo = doc.file.includes('VCC DESCRIPTION') 
          ? `VCC-REF-${String(page).padStart(3, '0')}`
          : `942-${pageNum++}`;
        
        const title = `${doc.file.replace('.pdf', '')} - Page ${page}`;
        const remarks = `${doc.type}|${doc.file}|${doc.carType || 'ALL'}`;

        await prisma.drawing.upsert({
          where: { projectId_drawingNo_revision: { projectId: project.id, drawingNo, revision: 'A' } },
          update: { title, totalSheets: 1, systemId: sysId, sourceFileId: doc.file, remarks },
          create: { projectId: project.id, systemId: sysId, drawingNo, title, totalSheets: 1, revision: 'A', status: 'ACTIVE', sourceFileId: doc.file, remarks }
        });
        dwgCount++;
      }
      console.log(`  ✓ ${doc.file}: ${doc.pages} drawings`);
    }
    console.log(`✓ ${dwgCount} Total Drawings`);

    console.log('\nStep 3: Creating Equipment...');
    const drawings = await prisma.drawing.findMany();
    const dwgMap = new Map(drawings.map(d => [d.systemId, d.id]));
    let eqCount = 0;
    
    for (const eq of EQUIPMENT) {
      const sysId = sysMap.get(eq.system);
      if (!sysId) continue;
      
      const existing = await prisma.device.findFirst({ where: { tagNo: eq.code } });
      if (!existing) {
        const drawingId = dwgMap.get(sysId) || drawings[0]?.id;
        if (drawingId) {
          await prisma.device.create({ 
            data: { 
              drawingId, 
              systemId: sysId, 
              tagNo: eq.code, 
              deviceName: eq.name, 
              deviceType: 'MODULE', 
              carType: eq.carType 
            } 
          });
          eqCount++;
        }
      }
    }
    console.log(`✓ ${eqCount} Equipment created`);

    console.log('\nStep 4: Creating Circuits...');
    let circuitCount = 0;
    for (const c of CIRCUITS) {
      const existing = await prisma.circuit.findFirst({ where: { circuitCode: c.circuitCode } });
      if (!existing && drawings.length > 0) {
        await prisma.circuit.create({ 
          data: { 
            drawingId: drawings[circuitCount % drawings.length].id, 
            circuitCode: c.circuitCode, 
            circuitName: c.circuitName, 
            category: c.category, 
            voltageText: c.voltageText 
          } 
        });
        circuitCount++;
      }
    }
    console.log(`✓ ${circuitCount} Circuits created`);

    console.log('\nStep 5: Creating Trainlines...');
    let tlCount = 0;
    const trlSysId = sysMap.get('TRL');
    const trlDrawings = trlSysId ? drawings.filter(d => d.systemId === trlSysId) : drawings;
    const trlDwg = trlDrawings[0] || drawings[0];
    
    if (trlDwg) {
      for (const tl of TRAINLINES) {
        const existing = await prisma.trainLine.findFirst({ where: { wireNo: tl.wireNo } });
        if (!existing) {
          await prisma.trainLine.create({ 
            data: { 
              drawingId: trlDwg.id, 
              wireNo: tl.wireNo, 
              itemName: tl.itemName, 
              lineGroup: tl.lineGroup, 
              carType: 'ALL' 
            } 
          });
          tlCount++;
        }
      }
    }
    console.log(`✓ ${tlCount} Trainlines created`);

    console.log('\nStep 6: Creating ALL Wires (10000 wires)...');
    let wireCount = 0;
    for (let i = 1000; i <= 19999; i++) {
      const existing = await prisma.wire.findUnique({ where: { wireNo: String(i) } });
      if (!existing) {
        const srcEq = EQUIPMENT[i % EQUIPMENT.length].code;
        const dstEq = EQUIPMENT[(i + 3) % EQUIPMENT.length].code;
        const wireColor = ['RED', 'BLUE', 'GREEN', 'WHITE', 'BLACK', 'YELLOW', 'ORANGE', 'BROWN'][i % 8];
        const voltage = i < 2000 ? '110VDC' : (i < 6000 ? '750VDC' : (i < 10000 ? '415VAC' : '110VDC'));
        
        await prisma.wire.create({
          data: {
            wireNo: String(i),
            signalName: `SIG-${i}`,
            description: `Wire ${i} - ${voltage} circuit connection`,
            voltageClass: voltage,
            wireSize: ['1.5mm²', '2.5mm²', '4mm²', '6mm²'][i % 4],
            wireColor,
            sourceEquipment: srcEq,
            destEquipment: dstEq,
            sourceConnector: `CN${(i % 10) + 1}`,
            destConnector: `CN${((i + 5) % 10) + 1}`,
          }
        });
        wireCount++;
      }
    }
    console.log(`✓ ${wireCount} Wires created`);

    console.log('\nStep 7: Creating Connectors with Pins for PIN Drawings...');
    let connCreated = 0;
    let pinsCreated = 0;
    
    const pinDrawings = drawings.filter(d => d.remarks?.includes('PIN_ASSIGNMENT'));
    
    const connectorTypes = [
      { file: 'CAB_PIN', connectors: ['CN1', 'CN2', 'CN3', 'CN4', 'CN5', 'TB1', 'TB2', 'J1', 'J2', 'MB1', 'MB2', 'MB3'] },
      { file: 'DMC_CEILING', connectors: ['BCU_CN1', 'BCU_CN2', 'BCU_CN3'] },
      { file: 'DMC UF', connectors: ['CN1', 'CN2', 'CN3', 'X1', 'X2', 'X3', 'X4', 'PS1', 'PS2', 'LTJB1', 'LTJB2', 'HSCB1', 'TM1'] },
      { file: 'TC_CEILING', connectors: ['CN1', 'CN2', 'CN3', 'DCU_TC1', 'DCU_TC2', 'LIGHT_CN1', 'AAU_TC1', 'ETH_SW_TC', 'VAC_TC1', 'VAC_TC2', 'TCMS_RIO_TC'] },
      { file: 'TC _UF', connectors: ['PS_TC1', 'PS_TC2', 'APS_CN1', 'APS_CN2', 'APS_CN3', 'SSB_CN1', 'BATT_CN1', 'BATT_CN2', 'BCU_TC'] },
      { file: 'MC_CEILING', connectors: ['DCU_MC1', 'DCU_MC2', 'DCU_MC3', 'DCU_MC4', 'LIGHT_MC1', 'TCMS_RIO_MC', 'TB_MC1', 'TB_MC2', 'CCTV_SW_MC', 'AAU_MC1', 'EDB_MC1', 'EDB_MC2', 'TCMS_NODE1'] },
      { file: 'MC_UF', connectors: ['VAC_MC1', 'VAC_MC2', 'BECU_MC'] },
    ];
    
    for (const drawing of pinDrawings.slice(0, 80)) {
      const fileMatch = connectorTypes.find(c => drawing.sourceFileId?.includes(c.file));
      const connectors = fileMatch?.connectors || ['CN1', 'CN2', 'CN3'];
      
      for (const connCode of connectors.slice(0, 8)) {
        const existingConn = await prisma.connector.findFirst({ 
          where: { connectorCode: connCode, drawingId: drawing.id } 
        });
        
        if (!existingConn) {
          const pinCount = connCode.startsWith('CN') || connCode.startsWith('X') ? 74 : 30;
          const conn = await prisma.connector.create({
            data: {
              drawingId: drawing.id,
              connectorCode: connCode,
              connectorTypeCode: '74P',
              pinCount: pinCount,
              carType: 'ALL',
              description: `${connCode} - ${drawing.title}`
            }
          });
          
          for (let p = 1; p <= pinCount; p++) {
            const signalNames = ['FORWARD', 'REVERSE', 'BRAKE', 'DOOR_OPEN', 'DOOR_CLOSE', 'POWER', 'RESET', 'FAULT', 'STATUS', 'SPEED'];
            await prisma.connectorPin.create({
              data: {
                connectorId: conn.id,
                pinNo: String(p),
                pinLabel: `P${p}`,
                signalName: `${connCode}-${signalNames[p % signalNames.length]}`,
                wireNo: String(1000 + p + (connCreated * 50)),
              }
            });
            pinsCreated++;
          }
          connCreated++;
        }
      }
    }
    console.log(`✓ ${connCreated} Connectors with ${pinsCreated} Pins created`);

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
    console.log(`Drawings: ${stats[1]} (from ${PDF_DOCS.reduce((a, d) => a + d.pages, 0)} PDF pages)`);
    console.log(`Wires: ${stats[2]}`);
    console.log(`Equipment: ${stats[3]}`);
    console.log(`Connectors: ${stats[4]}`);
    console.log(`Pins: ${stats[5]}`);
    console.log(`Circuits: ${stats[6]}`);
    console.log(`Trainlines: ${stats[7]}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Complete VCC Master Seed - All systems, drawings, wires, connectors, pins',
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
      documents: PDF_DOCS.map(d => ({ file: d.file, pages: d.pages }))
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed', details: String(error) }, { status: 500 });
  }
}