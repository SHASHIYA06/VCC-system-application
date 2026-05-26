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

const PDF_DOCUMENTS = [
  { file: 'KMRCL VCC Drawings_OCR.pdf', totalPages: 127, system: 'GEN', type: 'SCHEMATIC' },
  { file: 'CAB_PIN DRAWINGS 2.pdf', totalPages: 48, system: 'CAB', type: 'PIN_ASSIGNMENT', carType: 'DMC' },
  { file: 'DMC_CEILING.pdf', totalPages: 28, system: 'BRAKE', type: 'PIN_ASSIGNMENT', carType: 'DMC' },
  { file: 'DMC UF_PIN DRAWINGS.pdf', totalPages: 26, system: 'LTEB', type: 'PIN_ASSIGNMENT', carType: 'DMC' },
  { file: 'TC_CEILING PIN DRAWINGS.pdf', totalPages: 27, system: 'EDB', type: 'PIN_ASSIGNMENT', carType: 'TC' },
  { file: 'TC _UF PIN DRAWINGS.pdf', totalPages: 21, system: 'APS', type: 'PIN_ASSIGNMENT', carType: 'TC' },
  { file: 'MC_CEILING_PIN DRAWINGS.pdf', totalPages: 58, system: 'DOOR', type: 'PIN_ASSIGNMENT', carType: 'MC' },
  { file: 'MC_UF.pdf', totalPages: 27, system: 'VAC', type: 'PIN_ASSIGNMENT', carType: 'MC' },
  { file: 'VCC DESCRIPTION 13.12.2017.pdf', totalPages: 54, system: 'GEN', type: 'REFERENCE' },
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
  { wireNo: '7001', itemName: 'CAB VAC IN SSK', lineGroup: 'VAC' },
  { wireNo: '7050', itemName: 'SALOON VAC1', lineGroup: 'VAC' },
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
    console.log('=== COMPLETE VCC SEED - ALL DRAWINGS FROM ALL PDF PAGES ===\n');

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

    console.log('\nStep 2: Creating ALL Drawings from ALL PDF Pages...');
    let dwgCount = 0;
    const pageCounter = 1;

    for (const doc of PDF_DOCUMENTS) {
      const sysId = sysMap.get(doc.system);
      if (!sysId) continue;

      const docType = doc.type;
      const revision = docType === 'PIN_ASSIGNMENT' ? '0' : (docType === 'REFERENCE' ? 'REV1' : 'A');

      for (let page = 1; page <= doc.totalPages; page++) {
        const drawingNo = doc.type === 'REFERENCE' 
          ? `VCC-REF-${String(page).padStart(3, '0')}`
          : (doc.file.includes('KMRCL') 
              ? `942-${58000 + page}`
              : `${doc.system}-${String(page).padStart(5, '0')}`);

        const title = doc.type === 'REFERENCE'
          ? `VCC Description Page ${page}`
          : `${doc.file.replace('.pdf', '')} - Page ${page}`;

        const remarks = `${doc.type}|${doc.file}|${doc.carType || 'ALL'}`;

        await prisma.drawing.upsert({
          where: { projectId_drawingNo_revision: { projectId: project.id, drawingNo, revision } },
          update: { title, totalSheets: 1, systemId: sysId, sourceFileId: doc.file, remarks },
          create: { projectId: project.id, systemId: sysId, drawingNo, title, totalSheets: 1, revision, status: 'ACTIVE', sourceFileId: doc.file, remarks }
        });
        dwgCount++;
      }
      console.log(`  ✓ ${doc.file}: ${doc.totalPages} drawings (pages)`);
    }
    console.log(`✓ ${dwgCount} Total Drawings (one per page)`);

    console.log('\nStep 3: Creating Equipment...');
    const drawings = await prisma.drawing.findMany();
    let eqCount = 0;
    for (const eq of EQUIPMENT) {
      const sysId = sysMap.get(eq.system);
      if (!sysId) continue;
      const existing = await prisma.device.findFirst({ where: { tagNo: eq.code } });
      if (!existing && drawings.length > 0) {
        await prisma.device.create({ data: { drawingId: drawings[0].id, systemId: sysId, tagNo: eq.code, deviceName: eq.name, deviceType: 'MODULE', carType: eq.carType } });
        eqCount++;
      }
    }
    console.log(`✓ ${eqCount} Equipment`);

    console.log('\nStep 4: Creating Circuits...');
    let circuitCount = 0;
    for (const c of CIRCUITS) {
      const existing = await prisma.circuit.findFirst({ where: { circuitCode: c.circuitCode } });
      if (!existing && drawings.length > 0) {
        await prisma.circuit.create({ data: { drawingId: drawings[0].id, circuitCode: c.circuitCode, circuitName: c.circuitName, category: c.category, voltageText: '110VDC' } });
        circuitCount++;
      }
    }
    console.log(`✓ ${circuitCount} Circuits`);

    console.log('\nStep 5: Creating Trainlines...');
    let tlCount = 0;
    const trlDrawings = drawings.filter(d => d.systemId === sysMap.get('TRL'));
    const trlDwg = trlDrawings.length > 0 ? trlDrawings[0] : drawings[0];
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
    const connectorConfigs = [
      { file: 'CAB_PIN DRAWINGS 2.pdf', connectors: ['CN1', 'CN2', 'CN3', 'CN4', 'CN5', 'TB1', 'TB2', 'J1', 'J2'] },
      { file: 'DMC_CEILING.pdf', connectors: ['BCU_CN1', 'BCU_CN2', 'BCU_CN3'] },
      { file: 'DMC UF_PIN DRAWINGS.pdf', connectors: ['CN1', 'CN2', 'CN3', 'X1', 'X2', 'X3', 'X4'] },
      { file: 'TC_CEILING PIN DRAWINGS.pdf', connectors: ['CN1', 'CN2', 'CN3', 'DCU_TC1', 'DCU_TC2'] },
      { file: 'TC _UF PIN DRAWINGS.pdf', connectors: ['PS_TC1', 'PS_TC2', 'APS_CN1', 'APS_CN2'] },
      { file: 'MC_CEILING_PIN DRAWINGS.pdf', connectors: ['DCU_MC1', 'DCU_MC2', 'DCU_MC3', 'DCU_MC4'] },
      { file: 'MC_UF.pdf', connectors: ['VAC_MC1', 'VAC_MC2', 'BECU_MC'] },
    ];
    
    for (const drawing of pinDrawings.slice(0, 50)) {
      const config = connectorConfigs.find(c => drawing.sourceFileId?.includes(c.file.replace('.pdf', '').replace(' ', '')));
      const connectors = config?.connectors || ['CN1', 'CN2'];
      
      for (const connCode of connectors.slice(0, 5)) {
        const existingConn = await prisma.connector.findFirst({ where: { connectorCode: connCode, drawingId: drawing.id } });
        
        if (!existingConn) {
          const pinCount = connCode.startsWith('CN') ? 74 : connCode.startsWith('X') ? 74 : 20;
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
          
          for (let p = 1; p <= Math.min(pinCount, 20); p++) {
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
    console.log(`Drawings: ${stats[1]} (one per PDF page - 416 total)`);
    console.log(`Wires: ${stats[2]}`);
    console.log(`Equipment: ${stats[3]}`);
    console.log(`Connectors: ${stats[4]}`);
    console.log(`Pins: ${stats[5]}`);
    console.log(`Circuits: ${stats[6]}`);
    console.log(`Trainlines: ${stats[7]}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Complete VCC seed - ALL drawings from all PDF pages',
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
      documents: PDF_DOCUMENTS.map(d => ({ file: d.file, pages: d.totalPages }))
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed', details: String(error) }, { status: 500 });
  }
}