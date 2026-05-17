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

const ALL_DRAWINGS = [
  { drawingNo: '942-58099', title: 'Drawing List - KMRCL RS3R VCC', sheets: 127, system: 'GEN', type: 'SCHEMATIC', file: 'KMRCL VCC Drawings_OCR.pdf' },
  { drawingNo: '942-58100', title: 'Classification', sheets: 1, system: 'GEN', type: 'SCHEMATIC' },
  { drawingNo: '942-58101', title: 'Wiring Numbers and Description', sheets: 1, system: 'GEN', type: 'SCHEMATIC' },
  { drawingNo: '942-58102', title: 'Symbols', sheets: 1, system: 'GEN', type: 'SCHEMATIC' },
  { drawingNo: '942-58103', title: 'Train Lines Control (1/4)', sheets: 4, system: 'TRL', type: 'SCHEMATIC' },
  { drawingNo: '942-58104', title: 'Train Lines Signal', sheets: 1, system: 'TRL', type: 'SCHEMATIC' },
  { drawingNo: '942-58105', title: 'Low Tension Power Train Line', sheets: 1, system: 'TRL', type: 'SCHEMATIC' },
  { drawingNo: '942-58106', title: 'High Tension Power Train Line', sheets: 1, system: 'TRL', type: 'SCHEMATIC' },
  { drawingNo: '942-58107', title: 'Controlling Cab', sheets: 1, system: 'CAB', type: 'SCHEMATIC' },
  { drawingNo: '942-58108', title: 'Start-up Relay', sheets: 1, system: 'CAB', type: 'SCHEMATIC' },
  { drawingNo: '942-58109', title: 'System Status Indication', sheets: 1, system: 'CAB', type: 'SCHEMATIC' },
  { drawingNo: '942-58110', title: 'MCB Trip Status', sheets: 1, system: 'CAB', type: 'SCHEMATIC' },
  { drawingNo: '942-58111', title: 'DC Train Line Supply Contactor', sheets: 1, system: 'CAB', type: 'SCHEMATIC' },
  { drawingNo: '942-58112', title: 'Head Cab Main Light', sheets: 1, system: 'LIGHT', type: 'SCHEMATIC' },
  { drawingNo: '942-58113', title: 'Tail/Flasher/Console Light', sheets: 1, system: 'LIGHT', type: 'SCHEMATIC' },
  { drawingNo: '942-58114', title: 'Interior Light', sheets: 1, system: 'LIGHT', type: 'SCHEMATIC' },
  { drawingNo: '942-58115', title: 'Wiper Control', sheets: 1, system: 'LIGHT', type: 'SCHEMATIC' },
  { drawingNo: '942-58119', title: 'Speed Control', sheets: 1, system: 'TRAC', type: 'SCHEMATIC' },
  { drawingNo: '942-58120', title: 'VVVF Control', sheets: 1, system: 'TRAC', type: 'SCHEMATIC' },
  { drawingNo: '942-58121', title: 'Traction Return Current', sheets: 1, system: 'TRAC', type: 'SCHEMATIC' },
  { drawingNo: '942-58123', title: 'Compressor Control', sheets: 1, system: 'BRAKE', type: 'SCHEMATIC' },
  { drawingNo: '942-58124', title: 'Brake Loop', sheets: 1, system: 'BRAKE', type: 'SCHEMATIC' },
  { drawingNo: '942-58125', title: 'Emergency Brake', sheets: 1, system: 'BRAKE', type: 'SCHEMATIC' },
  { drawingNo: '942-58126', title: 'Parking Brake', sheets: 1, system: 'BRAKE', type: 'SCHEMATIC' },
  { drawingNo: '942-58127', title: 'Horn', sheets: 1, system: 'BRAKE', type: 'SCHEMATIC' },
  { drawingNo: '942-58128', title: 'Brake Control - DMC/MC', sheets: 1, system: 'BRAKE', type: 'SCHEMATIC' },
  { drawingNo: '942-58129', title: 'Brake Control - TC', sheets: 1, system: 'BRAKE', type: 'SCHEMATIC' },
  { drawingNo: '942-58130', title: 'APS - Auxiliary Power Supply', sheets: 1, system: 'APS', type: 'SCHEMATIC' },
  { drawingNo: '942-58131', title: 'AC 415V Shore Supply', sheets: 1, system: 'APS', type: 'SCHEMATIC' },
  { drawingNo: '942-58132', title: 'Battery Control', sheets: 1, system: 'APS', type: 'SCHEMATIC' },
  { drawingNo: '942-58137', title: 'Saloon Door Supply Voltage', sheets: 1, system: 'DOOR', type: 'SCHEMATIC' },
  { drawingNo: '942-58138', title: 'Left Door Operation', sheets: 1, system: 'DOOR', type: 'SCHEMATIC' },
  { drawingNo: '942-58139', title: 'Right Door Operation', sheets: 1, system: 'DOOR', type: 'SCHEMATIC' },
  { drawingNo: '942-58140', title: 'Door Proving Loop', sheets: 1, system: 'DOOR', type: 'SCHEMATIC' },
  { drawingNo: '942-58141', title: 'Local Door Interlock', sheets: 1, system: 'DOOR', type: 'SCHEMATIC' },
  { drawingNo: '942-58142', title: 'Door Communication with TMS', sheets: 1, system: 'DOOR', type: 'SCHEMATIC' },
  { drawingNo: '942-58143', title: 'Cab VAC - Air Conditioning', sheets: 1, system: 'VAC', type: 'SCHEMATIC' },
  { drawingNo: '942-58144', title: 'Saloon VAC Power', sheets: 1, system: 'VAC', type: 'SCHEMATIC' },
  { drawingNo: '942-58145', title: 'Saloon VAC Control', sheets: 1, system: 'VAC', type: 'SCHEMATIC' },
  { drawingNo: '942-58146', title: 'TMS Interface 1 to 4', sheets: 4, system: 'TMS', type: 'SCHEMATIC' },
  { drawingNo: '942-58147', title: 'PIS/TIS - Passenger Information System', sheets: 2, system: 'COMMS', type: 'SCHEMATIC' },
  { drawingNo: '942-58149', title: 'DVAS/PA - Digital Voice Announcement', sheets: 1, system: 'COMMS', type: 'SCHEMATIC' },
  { drawingNo: '942-58150', title: 'PA Amplifier', sheets: 2, system: 'COMMS', type: 'SCHEMATIC' },
  { drawingNo: '942-58152', title: 'CBTC - Communication Based Train Control', sheets: 1, system: 'COMMS', type: 'SCHEMATIC' },
  { drawingNo: '942-58153', title: 'Train Radio Interface', sheets: 1, system: 'COMMS', type: 'SCHEMATIC' },
  { drawingNo: '942-58154', title: 'CCTV - Closed Circuit Television', sheets: 1, system: 'COMMS', type: 'SCHEMATIC' },
  { drawingNo: '942-38104', title: 'Operating Panel Pin Assignment', sheets: 48, system: 'CAB', type: 'PIN_ASSIGNMENT', file: 'CAB_PIN DRAWINGS 2.pdf', carType: 'DMC', connectors: ['CN1', 'CN2', 'CN3', 'TB1', 'TB2', 'J1'] },
  { drawingNo: '942-38105', title: 'MCB Panel Pin Assignment', sheets: 1, system: 'CAB', type: 'PIN_ASSIGNMENT', file: 'CAB_PIN DRAWINGS 2.pdf', carType: 'DMC', connectors: ['MB1', 'MB2', 'F1'] },
  { drawingNo: '942-38117', title: 'Cab VAC Pin Assignment', sheets: 1, system: 'VAC', type: 'PIN_ASSIGNMENT', file: 'CAB_PIN DRAWINGS 2.pdf', carType: 'DMC', connectors: ['VAC_CN1'] },
  { drawingNo: '942-38305', title: 'LTEB Pin Assignment - DMC', sheets: 26, system: 'LTEB', type: 'PIN_ASSIGNMENT', file: 'DMC UF_PIN DRAWINGS.pdf', carType: 'DMC', connectors: ['CN1', 'CN2', 'CN3', 'X1', 'X2', 'X3', 'X4'] },
  { drawingNo: '942-38306', title: 'VVVF Inverter Pin Assignment - DMC', sheets: 2, system: 'TRAC', type: 'PIN_ASSIGNMENT', file: 'DMC UF_PIN DRAWINGS.pdf', carType: 'DMC', connectors: ['CN1', 'CN2', 'CN3', 'CN4'] },
  { drawingNo: '942-38307', title: 'Collector Shoe Junction Box - DMC', sheets: 1, system: 'HV', type: 'PIN_ASSIGNMENT', file: 'DMC UF_PIN DRAWINGS.pdf', carType: 'DMC', connectors: ['CSJB1'] },
  { drawingNo: '942-38309', title: 'Pressure Switch Box - DMC', sheets: 1, system: 'BRAKE', type: 'PIN_ASSIGNMENT', file: 'DMC UF_PIN DRAWINGS.pdf', carType: 'DMC', connectors: ['PS1', 'PS2'] },
  { drawingNo: '942-38310', title: 'BCU Pin Assignment - DM Car', sheets: 28, system: 'BRAKE', type: 'PIN_ASSIGNMENT', file: 'DMC_CEILING.pdf', carType: 'DMC', connectors: ['BCU_CN1', 'BCU_CN2', 'BCU_CN3'] },
  { drawingNo: '942-38312', title: 'LTJB Pin Assignment - DM Car', sheets: 3, system: 'LTJB', type: 'PIN_ASSIGNMENT', file: 'DMC UF_PIN DRAWINGS.pdf', carType: 'DMC', connectors: ['LTJB1', 'LTJB2'] },
  { drawingNo: '942-38319', title: 'HSCB Pin Assignment - DMC', sheets: 1, system: 'HV', type: 'PIN_ASSIGNMENT', file: 'DMC UF_PIN DRAWINGS.pdf', carType: 'DMC', connectors: ['HSCB1'] },
  { drawingNo: '942-38320', title: 'TM Connector Pin Assignment - DMC', sheets: 1, system: 'TRAC', type: 'PIN_ASSIGNMENT', file: 'DMC UF_PIN DRAWINGS.pdf', carType: 'DMC', connectors: ['TM1'] },
  { drawingNo: '942-38402', title: 'EDB Panel Pin Assignment - TC', sheets: 27, system: 'EDB', type: 'PIN_ASSIGNMENT', file: 'TC_CEILING PIN DRAWINGS.pdf', carType: 'TC', connectors: ['EDB1', 'EDB2', 'EDB3'] },
  { drawingNo: '942-38403', title: 'Passenger Door Pin Assignment - TC', sheets: 1, system: 'DOOR', type: 'PIN_ASSIGNMENT', file: 'TC_CEILING PIN DRAWINGS.pdf', carType: 'TC', connectors: ['DCU_TC1', 'DCU_TC2'] },
  { drawingNo: '942-38404', title: 'Saloon Lights Pin Assignment - TC', sheets: 1, system: 'LIGHT', type: 'PIN_ASSIGNMENT', file: 'TC_CEILING PIN DRAWINGS.pdf', carType: 'TC', connectors: ['LIGHT_CN1'] },
  { drawingNo: '942-38405', title: 'AAU - TC', sheets: 1, system: 'COMMS', type: 'PIN_ASSIGNMENT', file: 'TC_CEILING PIN DRAWINGS.pdf', carType: 'TC', connectors: ['AAU_TC1'] },
  { drawingNo: '942-38406', title: 'Ethernet Switch CCTV - TC', sheets: 1, system: 'COMMS', type: 'PIN_ASSIGNMENT', file: 'TC_CEILING PIN DRAWINGS.pdf', carType: 'TC', connectors: ['ETH_SW_TC'] },
  { drawingNo: '942-38407', title: 'Saloon VAC Pin Assignment - TC', sheets: 1, system: 'VAC', type: 'PIN_ASSIGNMENT', file: 'TC_CEILING PIN DRAWINGS.pdf', carType: 'TC', connectors: ['VAC_TC1', 'VAC_TC2'] },
  { drawingNo: '942-38409', title: 'TCMS RIO Pin Assignment - TC', sheets: 27, system: 'TMS', type: 'PIN_ASSIGNMENT', file: 'TC_CEILING PIN DRAWINGS.pdf', carType: 'TC', connectors: ['TCMS_RIO_TC', 'CN1', 'CN2'] },
  { drawingNo: '942-38508', title: 'Pressure Switch Box - T Car', sheets: 21, system: 'BRAKE', type: 'PIN_ASSIGNMENT', file: 'TC _UF PIN DRAWINGS.pdf', carType: 'TC', connectors: ['PS_TC1', 'PS_TC2'] },
  { drawingNo: '942-38512', title: 'APS Pin Assignment - T Car', sheets: 2, system: 'APS', type: 'PIN_ASSIGNMENT', file: 'TC _UF PIN DRAWINGS.pdf', carType: 'TC', connectors: ['APS_CN1', 'APS_CN2', 'APS_CN3'] },
  { drawingNo: '942-38514', title: 'Shore Supply Box - T Car', sheets: 1, system: 'APS', type: 'PIN_ASSIGNMENT', file: 'TC _UF PIN DRAWINGS.pdf', carType: 'TC', connectors: ['SSB_CN1'] },
  { drawingNo: '942-38516', title: 'Battery Box Pin Assignment - T Car', sheets: 1, system: 'APS', type: 'PIN_ASSIGNMENT', file: 'TC _UF PIN DRAWINGS.pdf', carType: 'TC', connectors: ['BATT_CN1', 'BATT_CN2'] },
  { drawingNo: '942-38519', title: 'BCU Pin Assignment - T Car', sheets: 1, system: 'BRAKE', type: 'PIN_ASSIGNMENT', file: 'TC _UF PIN DRAWINGS.pdf', carType: 'TC', connectors: ['BCU_TC'] },
  { drawingNo: '942-38602', title: 'Saloon VAC Pin Assignment - M Car', sheets: 27, system: 'VAC', type: 'PIN_ASSIGNMENT', file: 'MC_UF.pdf', carType: 'MC', connectors: ['VAC_MC1', 'VAC_MC2'] },
  { drawingNo: '942-38603', title: 'Passenger Door Pin Assignment - M Car', sheets: 58, system: 'DOOR', type: 'PIN_ASSIGNMENT', file: 'MC_CEILING_PIN DRAWINGS.pdf', carType: 'MC', connectors: ['DCU_MC1', 'DCU_MC2', 'DCU_MC3', 'DCU_MC4'] },
  { drawingNo: '942-38604', title: 'Saloon Lights Pin Assignment - M Car', sheets: 1, system: 'LIGHT', type: 'PIN_ASSIGNMENT', file: 'MC_CEILING_PIN DRAWINGS.pdf', carType: 'MC', connectors: ['LIGHT_MC1'] },
  { drawingNo: '942-38605', title: 'BECU Pin Assignment - M Car', sheets: 1, system: 'BRAKE', type: 'PIN_ASSIGNMENT', file: 'MC_UF.pdf', carType: 'MC', connectors: ['BECU_MC'] },
  { drawingNo: '942-38606', title: 'TCMS RIO Pin Assignment - M Car', sheets: 58, system: 'TMS', type: 'PIN_ASSIGNMENT', file: 'MC_CEILING_PIN DRAWINGS.pdf', carType: 'MC', connectors: ['TCMS_RIO_MC', 'CN1', 'CN2'] },
  { drawingNo: '942-38607', title: 'TCMS Terminal Block - M Car', sheets: 1, system: 'TMS', type: 'PIN_ASSIGNMENT', file: 'MC_CEILING_PIN DRAWINGS.pdf', carType: 'MC', connectors: ['TB_MC1', 'TB_MC2'] },
  { drawingNo: '942-38608', title: 'CCTV Ethernet Switch - M Car', sheets: 1, system: 'COMMS', type: 'PIN_ASSIGNMENT', file: 'MC_CEILING_PIN DRAWINGS.pdf', carType: 'MC', connectors: ['CCTV_SW_MC'] },
  { drawingNo: '942-38609', title: 'AAU Pin Assignment - M Car', sheets: 1, system: 'COMMS', type: 'PIN_ASSIGNMENT', file: 'MC_CEILING_PIN DRAWINGS.pdf', carType: 'MC', connectors: ['AAU_MC1'] },
  { drawingNo: '942-38610', title: 'EDB Panel Pin Assignment - M Car', sheets: 1, system: 'EDB', type: 'PIN_ASSIGNMENT', file: 'MC_CEILING_PIN DRAWINGS.pdf', carType: 'MC', connectors: ['EDB_MC1', 'EDB_MC2'] },
  { drawingNo: '942-38612', title: 'TCMS Communication Node-1 - M Car', sheets: 1, system: 'TMS', type: 'PIN_ASSIGNMENT', file: 'MC_CEILING_PIN DRAWINGS.pdf', carType: 'MC', connectors: ['TCMS_NODE1'] },
];

const TRAINLINES = [
  { wireNo: '1032', itemName: 'RESET', lineGroup: 'Control', note: 'System reset command', carType: 'ALL' },
  { wireNo: '1050', itemName: 'SHUT DOWN', lineGroup: 'Control', note: 'System shutdown', carType: 'ALL' },
  { wireNo: '1205', itemName: 'LINE VOLTAGE', lineGroup: 'Power', note: '750V DC line voltage', carType: 'ALL' },
  { wireNo: '1207', itemName: 'VVF FAULT', lineGroup: 'Status', note: 'VVVF fault signal', carType: 'ALL' },
  { wireNo: '1209', itemName: 'HSCB TRIP', lineGroup: 'Status', note: 'High speed circuit breaker trip', carType: 'ALL' },
  { wireNo: '3003', itemName: 'FORWARD', lineGroup: 'Traction', note: 'Forward command', carType: 'ALL' },
  { wireNo: '3004', itemName: 'REVERSE', lineGroup: 'Traction', note: 'Reverse command', carType: 'ALL' },
  { wireNo: '3005', itemName: 'POWERING1', lineGroup: 'Traction', note: 'Propulsion enable 1', carType: 'ALL' },
  { wireNo: '3006', itemName: 'POWERING2', lineGroup: 'Traction', note: 'Propulsion enable 2', carType: 'ALL' },
  { wireNo: '3010', itemName: 'BRAKING', lineGroup: 'Traction', note: 'Braking command', carType: 'ALL' },
  { wireNo: '3011', itemName: 'FULL SERVICE BRAKE', lineGroup: 'Brake', note: 'Full service brake', carType: 'ALL' },
  { wireNo: '4024', itemName: 'BRAKE LOOP', lineGroup: 'Brake', note: 'Emergency brake loop', carType: 'ALL' },
  { wireNo: '4062', itemName: 'EM BRAKE LOOP NORMAL', lineGroup: 'Brake', note: 'EB loop normal path', carType: 'ALL' },
  { wireNo: '4122', itemName: 'PARKING BRAKE APPLIED', lineGroup: 'Brake', note: 'Parking brake applied', carType: 'ALL' },
  { wireNo: '6009', itemName: 'DOOR OPEN LEFT', lineGroup: 'Door', note: 'Left door open', carType: 'MC' },
  { wireNo: '6014', itemName: 'DOOR CLOSE LEFT', lineGroup: 'Door', note: 'Left door close', carType: 'MC' },
  { wireNo: '6046', itemName: 'DOOR OPEN RIGHT', lineGroup: 'Door', note: 'Right door open', carType: 'MC' },
  { wireNo: '6051', itemName: 'DOOR CLOSE RIGHT', lineGroup: 'Door', note: 'Right door close', carType: 'MC' },
  { wireNo: '6112', itemName: 'ZERO SPEED', lineGroup: 'Status', note: 'Zero speed signal', carType: 'ALL' },
  { wireNo: '7001', itemName: 'CAB VAC IN SSK', lineGroup: 'VAC', note: 'Cab VAC in SSK', carType: 'DMC' },
  { wireNo: '7050', itemName: 'SALOON VAC1', lineGroup: 'VAC', note: 'Saloon VAC 1 in SSK', carType: 'TC' },
  { wireNo: '7060', itemName: 'SALOON VAC2', lineGroup: 'VAC', note: 'Saloon VAC 2 in SSK', carType: 'TC' },
  { wireNo: '9214', itemName: 'ATP MODE', lineGroup: 'Control', note: 'ATP mode indicator', carType: 'ALL' },
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
  { code: 'TCMS_RIO1', name: 'TCMS Remote IO Unit 1', carType: 'MC', system: 'TMS' },
  { code: 'TCMS_RIO2', name: 'TCMS Remote IO Unit 2', carType: 'TC', system: 'TMS' },
  { code: 'DCU1', name: 'Door Control Unit 1', carType: 'MC', system: 'DOOR' },
  { code: 'DCU2', name: 'Door Control Unit 2', carType: 'TC', system: 'DOOR' },
  { code: 'VAC1', name: 'Saloon VAC Unit 1', carType: 'MC', system: 'VAC' },
  { code: 'VAC2', name: 'Saloon VAC Unit 2', carType: 'TC', system: 'VAC' },
  { code: 'CAB_PANEL', name: 'Cab Operating Panel', carType: 'DMC', system: 'CAB' },
  { code: 'MCB_PANEL', name: 'MCB Panel', carType: 'DMC', system: 'CAB' },
];

export async function POST() {
  try {
    console.log('=== VCC FULL SEED WITH PIN DRAWINGS ===\n');

    let project = await prisma.project.findFirst();
    if (!project) {
      project = await prisma.project.create({
        data: { projectCode: 'KMRCL_RS3R', projectName: 'KMRCL RS3R Metro', description: 'Kolkata Metro RS3R Vehicle Control Circuit' }
      });
      console.log(`✓ Created project: ${project.projectName}`);
    }

    console.log('\nStep 1: Creating Systems...');
    for (const sys of SYSTEMS) {
      await prisma.system.upsert({ where: { code: sys.code }, update: sys, create: sys });
    }
    const systems = await prisma.system.findMany();
    const sysMap = new Map(systems.map(s => [s.code, s.id]));
    console.log(`✓ Systems: ${systems.length}`);

    console.log('\nStep 2: Creating ALL Drawings (Schematic + PIN Assignments)...');
    let dwgCount = 0;
    for (const d of ALL_DRAWINGS) {
      const sysId = sysMap.get(d.system);
      if (!sysId) continue;
      
      const existing = await prisma.drawing.findFirst({ where: { drawingNo: d.drawingNo } });
      const remarks = d.file ? `${d.system}|${d.type}|${d.file}|${d.carType || 'ALL'}` : `${d.system}|${d.type}`;
      
      if (!existing) {
        await prisma.drawing.create({
          data: {
            projectId: project.id,
            systemId: sysId,
            drawingNo: d.drawingNo,
            title: d.title,
            totalSheets: d.sheets,
            revision: d.type === 'PIN_ASSIGNMENT' ? '0' : 'A',
            status: 'ACTIVE',
            sourceFileId: d.file || null,
            remarks: remarks
          }
        });
        dwgCount++;
      }
    }
    console.log(`✓ Created ${dwgCount} drawings`);

    console.log('\nStep 3: Creating Equipment...');
    const drawings = await prisma.drawing.findMany();
    const dwgMap = new Map(drawings.map(d => [d.drawingNo, d]));
    let eqCount = 0;
    for (const eq of EQUIPMENT) {
      const sysId = sysMap.get(eq.system);
      if (!sysId) continue;
      const existing = await prisma.device.findFirst({ where: { tagNo: eq.code } });
      if (!existing) {
        const defaultDwg = dwgMap.get('942-58103') || drawings[0];
        if (defaultDwg) {
          await prisma.device.create({
            data: { drawingId: defaultDwg.id, systemId: sysId, tagNo: eq.code, deviceName: eq.name, deviceType: 'MODULE', carType: eq.carType }
          });
          eqCount++;
        }
      }
    }
    console.log(`✓ Created ${eqCount} equipment`);

    console.log('\nStep 4: Creating Trainlines...');
    const trlDwg = drawings.find(d => d.systemId === sysMap.get('TRL')) || drawings[0];
    let tlCount = 0;
    if (trlDwg) {
      for (const tl of TRAINLINES) {
        const existing = await prisma.trainLine.findFirst({ where: { wireNo: tl.wireNo } });
        if (!existing) {
          await prisma.trainLine.create({
            data: { drawingId: trlDwg.id, wireNo: tl.wireNo, itemName: tl.itemName, lineGroup: tl.lineGroup, note: tl.note, carType: tl.carType }
          });
          tlCount++;
        }
      }
    }
    console.log(`✓ Created ${tlCount} trainlines`);

    console.log('\nStep 5: Creating Wires...');
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
    console.log(`✓ Created ${wireCount} wires`);

    console.log('\nStep 6: Creating Connectors with Pins for ALL PIN Drawings...');
    let connCreated = 0;
    let pinsCreated = 0;
    
    const pinDrawings = drawings.filter(d => d.remarks?.includes('PIN_ASSIGNMENT'));
    console.log(`  Found ${pinDrawings.length} PIN assignment drawings`);
    
    for (const drawing of pinDrawings) {
      const drawingNo = drawing.drawingNo;
      const pinDwgConfig = ALL_DRAWINGS.find(d => d.drawingNo === drawingNo);
      const connectors = pinDwgConfig?.connectors || ['CN1', 'CN2'];
      
      for (const connCode of connectors) {
        const existingConn = await prisma.connector.findFirst({ 
          where: { connectorCode: connCode, drawingId: drawing.id } 
        });
        
        if (!existingConn) {
          const pinCount = connCode.includes('CN') ? 74 : connCode.includes('TB') ? 40 : 20;
          const conn = await prisma.connector.create({
            data: {
              drawingId: drawing.id,
              connectorCode: connCode,
              connectorTypeCode: connCode.startsWith('CN') ? '74P' : 'TERMINAL',
              pinCount: pinCount,
              carType: pinDwgConfig?.carType || 'ALL',
              description: `${connCode} connector for ${drawing.title}`
            }
          });
          
          for (let p = 1; p <= pinCount; p++) {
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
    console.log(`✓ Created ${connCreated} connectors with ${pinsCreated} pins`);

    const stats = await Promise.all([
      prisma.system.count(),
      prisma.drawing.count(),
      prisma.wire.count(),
      prisma.device.count(),
      prisma.connector.count(),
      prisma.connectorPin.count(),
      prisma.trainLine.count(),
    ]);

    console.log('\n=== VCC FULL SEED COMPLETE ===');
    console.log(`  Systems: ${stats[0]}`);
    console.log(`  Drawings: ${stats[1]} (Schematic + PIN)`);
    console.log(`  Wires: ${stats[2]}`);
    console.log(`  Equipment: ${stats[3]}`);
    console.log(`  Connectors: ${stats[4]}`);
    console.log(`  Pins: ${stats[5]}`);
    console.log(`  Trainlines: ${stats[6]}`);

    return NextResponse.json({
      success: true,
      message: 'VCC Full Seed Complete - All Drawings, Pins, and Connectors',
      stats: { systems: stats[0], drawings: stats[1], wires: stats[2], equipment: stats[3], connectors: stats[4], pins: stats[5], trainlines: stats[6] }
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed', details: String(error) }, { status: 500 });
  }
}