import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function seedSystems() {
  const systems = [
    { name: 'General', code: 'GEN', category: 'Foundation', description: 'General documentation and standards', iconName: 'Settings', sortOrder: 1 },
    { name: 'Train Line', code: 'TRL', category: 'Core Systems', description: 'Trainline control and signal wiring', iconName: 'Train', sortOrder: 2 },
    { name: 'Traction', code: 'TRAC', category: 'Propulsion', description: 'Traction system and VVVF control', iconName: 'Zap', sortOrder: 3 },
    { name: 'High Voltage', code: 'HV', category: 'Power', description: 'High voltage distribution', iconName: 'Battery', sortOrder: 4 },
    { name: 'Low Tension Equipment Box', code: 'LTEB', category: 'Power', description: 'Low tension power distribution', iconName: 'Box', sortOrder: 5 },
    { name: 'Low Tension Junction Box', code: 'LTJB', category: 'Power', description: 'Junction boxes for low voltage', iconName: 'Box', sortOrder: 6 },
    { name: 'Auxiliary Power Supply', code: 'APS', category: 'Power', description: 'Auxiliary power and battery', iconName: 'Battery', sortOrder: 7 },
    { name: 'Brake System', code: 'BRAKE', category: 'Core Systems', description: 'Brake control and air supply', iconName: 'ShieldCheck', sortOrder: 8 },
    { name: 'Door System', code: 'DOOR', category: 'Core Systems', description: 'Passenger door control', iconName: 'DoorOpen', sortOrder: 9 },
    { name: 'Ventilation AC', code: 'VAC', category: 'Comfort', description: 'HVAC systems', iconName: 'Wind', sortOrder: 10 },
    { name: 'Cab Equipment', code: 'CAB', category: 'Control', description: 'Driver cab equipment', iconName: 'Monitor', sortOrder: 11 },
    { name: 'Lighting', code: 'LIGHT', category: 'Comfort', description: 'Interior and exterior lighting', iconName: 'Lightbulb', sortOrder: 12 },
    { name: 'Communication', code: 'COMMS', category: 'Communication', description: 'PIS, PA, CCTV, Radio', iconName: 'Radio', sortOrder: 13 },
    { name: 'Coupling', code: 'COUPL', category: 'Mechanical', description: 'Car coupling and inter-car', iconName: 'Link', sortOrder: 14 },
    { name: 'TCMS', code: 'TMS', category: 'Control', description: 'Train Control Management System', iconName: 'Cpu', sortOrder: 15 },
    { name: 'Electrical Distribution Box', code: 'EDB', category: 'Power', description: 'Electrical distribution', iconName: 'Box', sortOrder: 16 },
  ];
  for (const s of systems) {
    await prisma.system.upsert({ where: { name: s.name }, update: s, create: s });
  }
  return systems.length;
}

async function seedDrawings() {
  const drawings = [
    { drawingNo: '942-58099', title: 'Drawing List - KMRCL RS3R VCC', carType: 'ALL', subsystem: 'GEN', drawingType: 'DRAWING_LIST', pageCount: 1 },
    { drawingNo: '942-58100', title: 'Classification', carType: 'ALL', subsystem: 'GEN', drawingType: 'CLASSIFICATION', pageCount: 1 },
    { drawingNo: '942-58101', title: 'Wiring Numbers and Description', carType: 'ALL', subsystem: 'GEN', drawingType: 'WIRING_NUMBER_DEF', pageCount: 1 },
    { drawingNo: '942-58102', title: 'Symbols', carType: 'ALL', subsystem: 'GEN', drawingType: 'SYMBOL_LIBRARY', pageCount: 1 },
    { drawingNo: '942-58103', title: 'Train Lines Control (1/4)', carType: 'ALL', subsystem: 'TRL', drawingType: 'SCHEMATIC', pageCount: 4 },
    { drawingNo: '942-58104', title: 'Train Lines Signal (1/8)', carType: 'ALL', subsystem: 'TRL', drawingType: 'SCHEMATIC', pageCount: 8 },
    { drawingNo: '942-58105', title: 'Low Tension Power Train Line', carType: 'ALL', subsystem: 'TRL', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58106', title: 'High Tension Power Train Line', carType: 'ALL', subsystem: 'TRL', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58107', title: 'Controlling Cab', carType: 'CAB', subsystem: 'CAB', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58108', title: 'Start-up Relay', carType: 'CAB', subsystem: 'CAB', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58109', title: 'System Status Indication (1/2)', carType: 'CAB', subsystem: 'CAB', drawingType: 'SCHEMATIC', pageCount: 2 },
    { drawingNo: '942-58110', title: 'MCB Trip Status', carType: 'CAB', subsystem: 'CAB', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58111', title: 'DC Train Line Supply Contactor', carType: 'CAB', subsystem: 'CAB', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58112', title: 'Head Cab Main Light', carType: 'DMC', subsystem: 'LIGHT', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58113', title: 'Tail/Door Open Console Light', carType: 'DMC', subsystem: 'LIGHT', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58114', title: 'Interior Light', carType: 'DMC', subsystem: 'LIGHT', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58115', title: 'Wiper Control', carType: 'DMC', subsystem: 'LIGHT', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58117', title: 'Coupling and Uncoupling Control', carType: 'DMC', subsystem: 'COUPL', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58119', title: 'Speed Control', carType: 'DMC', subsystem: 'TRAC', drawingType: 'SCHEMATIC', pageCount: 2 },
    { drawingNo: '942-58120', title: 'VVVF Control', carType: 'DMC', subsystem: 'TRAC', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58121', title: 'Traction Return Current', carType: 'DMC', subsystem: 'TRAC', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58123', title: 'Compressor Control', carType: 'DMC', subsystem: 'BRAKE', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58124', title: 'Brake Loop', carType: 'DMC', subsystem: 'BRAKE', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58125', title: 'Emergency Brake', carType: 'DMC', subsystem: 'BRAKE', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58126', title: 'Parking Brake', carType: 'DMC', subsystem: 'BRAKE', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58127', title: 'Horn', carType: 'DMC', subsystem: 'BRAKE', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58128', title: 'Brake Control - DMC/MC', carType: 'DMC', subsystem: 'BRAKE', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58129', title: 'Brake Control - TC', carType: 'TC', subsystem: 'BRAKE', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58130', title: 'APS - Auxiliary Power Supply', carType: 'TC', subsystem: 'APS', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58131', title: 'AC 415V Shore Supply', carType: 'TC', subsystem: 'APS', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58132', title: 'Battery Control', carType: 'TC', subsystem: 'APS', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58137', title: 'Saloon Door Supply Voltage', carType: 'MC', subsystem: 'DOOR', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58138', title: 'Left Door Operation', carType: 'MC', subsystem: 'DOOR', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58139', title: 'Right Door Operation', carType: 'MC', subsystem: 'DOOR', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58140', title: 'Door Proving Loop', carType: 'MC', subsystem: 'DOOR', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58141', title: 'Local Door Interlock', carType: 'MC', subsystem: 'DOOR', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58142', title: 'Door Communication with TMS', carType: 'MC', subsystem: 'DOOR', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58143', title: 'Cab VAC - Air Conditioning', carType: 'CAB', subsystem: 'VAC', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58144', title: 'Saloon VAC Power', carType: 'MC', subsystem: 'VAC', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58145', title: 'Saloon VAC Control', carType: 'MC', subsystem: 'VAC', drawingType: 'SCHEMATIC', pageCount: 2 },
    { drawingNo: '942-58146', title: 'TMS Interface 1 to 4', carType: 'MC', subsystem: 'TMS', drawingType: 'SCHEMATIC', pageCount: 4 },
    { drawingNo: '942-58147', title: 'PIS/TIS - Passenger Information System', carType: 'MC', subsystem: 'COMMS', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58148', title: 'PIS/TIS Sheet 2', carType: 'MC', subsystem: 'COMMS', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58149', title: 'DVAS/PA - Digital Voice Announcement', carType: 'MC', subsystem: 'COMMS', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58150', title: 'PA Amplifier', carType: 'MC', subsystem: 'COMMS', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58151', title: 'PA Amplifier Sheet 2', carType: 'MC', subsystem: 'COMMS', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58152', title: 'CBTC - Communication Based Train Control', carType: 'MC', subsystem: 'COMMS', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58153', title: 'Train Radio Interface', carType: 'MC', subsystem: 'COMMS', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-58154', title: 'CCTV - Closed Circuit Television', carType: 'MC', subsystem: 'COMMS', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-38309', title: 'DMC Underframe PIN Drawing', carType: 'DMC', subsystem: 'LTEB', drawingType: 'PIN_ASSIGNMENT', pageCount: 26 },
    { drawingNo: '942-38409', title: 'TC Ceiling PIN Drawing', carType: 'TC', subsystem: 'TMS', drawingType: 'PIN_ASSIGNMENT', pageCount: 27 },
    { drawingNo: '942-38509', title: 'TC Underframe PIN Drawing', carType: 'TC', subsystem: 'APS', drawingType: 'PIN_ASSIGNMENT', pageCount: 21 },
    { drawingNo: '942-38609', title: 'MC Underframe PIN Drawing', carType: 'MC', subsystem: 'LTEB', drawingType: 'PIN_ASSIGNMENT', pageCount: 27 },
    { drawingNo: '942-38610', title: 'MC Ceiling PIN Drawing', carType: 'MC', subsystem: 'TMS', drawingType: 'PIN_ASSIGNMENT', pageCount: 58 },
    { drawingNo: '942-38103', title: 'HV System PIN Drawing', carType: 'DMC', subsystem: 'HV', drawingType: 'PIN_ASSIGNMENT', pageCount: 1 },
    { drawingNo: '942-38107', title: 'CAB PIN Drawing', carType: 'CAB', subsystem: 'CAB', drawingType: 'PIN_ASSIGNMENT', pageCount: 48 },
  ];
  for (const d of drawings) {
    await prisma.drawingDocument.upsert({ where: { drawingNo: d.drawingNo }, update: d, create: d });
  }
  return drawings.length;
}

async function seedEquipment() {
  const equipment = [
    { tag: 'V1', name: 'VVVF Inverter 1', carType: 'DMC', systemCode: 'TRAC', location: 'Underframe' },
    { tag: 'V2', name: 'VVVF Inverter 2', carType: 'MC', systemCode: 'TRAC', location: 'Underframe' },
    { tag: 'BCU1', name: 'Brake Control Unit 1', carType: 'DMC', systemCode: 'BRAKE', location: 'Underframe' },
    { tag: 'BCU2', name: 'Brake Control Unit 2', carType: 'TC', systemCode: 'BRAKE', location: 'Underframe' },
    { tag: 'BCU3', name: 'Brake Control Unit 3', carType: 'MC', systemCode: 'BRAKE', location: 'Underframe' },
    { tag: 'BECU1', name: 'Brake Electronic Control Unit 1', carType: 'MC', systemCode: 'BRAKE', location: 'Underframe' },
    { tag: 'TCMS_RIO1', name: 'TCMS Remote IO Unit 1', carType: 'MC', systemCode: 'TMS', location: 'Ceiling' },
    { tag: 'TCMS_RIO2', name: 'TCMS Remote IO Unit 2', carType: 'TC', systemCode: 'TMS', location: 'Ceiling' },
    { tag: 'APS1', name: 'Auxiliary Power Supply 1', carType: 'TC', systemCode: 'APS', location: 'Underframe' },
    { tag: 'SSB1', name: 'Shore Supply Box 1', carType: 'TC', systemCode: 'APS', location: 'Underframe' },
    { tag: 'BATT1', name: 'Battery Box 1', carType: 'TC', systemCode: 'APS', location: 'Underframe' },
    { tag: 'HSCB1', name: 'High Speed Circuit Breaker 1', carType: 'DMC', systemCode: 'HV', location: 'Underframe' },
    { tag: 'HSCB2', name: 'High Speed Circuit Breaker 2', carType: 'MC', systemCode: 'HV', location: 'Underframe' },
    { tag: 'DCU1', name: 'Door Control Unit 1', carType: 'MC', systemCode: 'DOOR', location: 'Ceiling' },
    { tag: 'DCU2', name: 'Door Control Unit 2', carType: 'TC', systemCode: 'DOOR', location: 'Ceiling' },
    { tag: 'VAC1', name: 'Saloon VAC Unit 1', carType: 'MC', systemCode: 'VAC', location: 'Ceiling' },
    { tag: 'VAC2', name: 'Saloon VAC Unit 2', carType: 'TC', systemCode: 'VAC', location: 'Ceiling' },
    { tag: 'CAB_VAC1', name: 'Cab VAC Unit 1', carType: 'CAB', systemCode: 'VAC', location: 'Cab' },
    { tag: 'OP_PNL1', name: 'Operating Panel 1', carType: 'CAB', systemCode: 'CAB', location: 'Cab Desk' },
    { tag: 'IND_PNL1', name: 'Indicator Panel 1', carType: 'CAB', systemCode: 'CAB', location: 'Cab Desk' },
    { tag: 'MCB_PNL1', name: 'MCB Panel 1', carType: 'CAB', systemCode: 'CAB', location: 'Cab' },
    { tag: 'LTEB1', name: 'Low Tension Equipment Box 1', carType: 'DMC', systemCode: 'LTEB', location: 'Underframe' },
    { tag: 'LTEB2', name: 'Low Tension Equipment Box 2', carType: 'TC', systemCode: 'LTEB', location: 'Underframe' },
    { tag: 'LTEB3', name: 'Low Tension Equipment Box 3', carType: 'MC', systemCode: 'LTEB', location: 'Underframe' },
    { tag: 'LTJB1', name: 'Low Tension Junction Box 1', carType: 'DMC', systemCode: 'LTJB', location: 'Underframe' },
    { tag: 'LTJB2', name: 'Low Tension Junction Box 2', carType: 'TC', systemCode: 'LTJB', location: 'Underframe' },
    { tag: 'LTJB3', name: 'Low Tension Junction Box 3', carType: 'MC', systemCode: 'LTJB', location: 'Underframe' },
    { tag: 'EDB1', name: 'Electrical Distribution Box 1', carType: 'MC', systemCode: 'EDB', location: 'Ceiling' },
    { tag: 'EDB2', name: 'Electrical Distribution Box 2', carType: 'TC', systemCode: 'EDB', location: 'Ceiling' },
    { tag: 'ETH_SW1', name: 'Ethernet Switch CCTV 1', carType: 'MC', systemCode: 'COMMS', location: 'Ceiling' },
    { tag: 'ETH_SW2', name: 'Ethernet Switch CCTV 2', carType: 'TC', systemCode: 'COMMS', location: 'Ceiling' },
    { tag: 'AAU1', name: 'Audio Alarm Unit 1', carType: 'MC', systemCode: 'COMMS', location: 'Ceiling' },
    { tag: 'AAU2', name: 'Audio Alarm Unit 2', carType: 'TC', systemCode: 'COMMS', location: 'Ceiling' },
    { tag: 'COMP1', name: 'Compressor Motor 1', carType: 'TC', systemCode: 'BRAKE', location: 'Underframe' },
    { tag: 'PBMV1', name: 'Parking Brake Magnetic Valve 1', carType: 'MC', systemCode: 'BRAKE', location: 'Underframe' },
    { tag: 'CSJB1', name: 'Collector Shoe Junction Box 1', carType: 'DMC', systemCode: 'HV', location: 'Underframe' },
    { tag: 'CSJB2', name: 'Collector Shoe Junction Box 2', carType: 'TC', systemCode: 'HV', location: 'Underframe' },
    { tag: 'CSJB3', name: 'Collector Shoe Junction Box 3', carType: 'MC', systemCode: 'HV', location: 'Underframe' },
  ];
  let count = 0;
  for (const eq of equipment) {
    const sys = await prisma.system.findFirst({ where: { code: eq.systemCode } });
    const existing = await prisma.deviceInstance.findFirst({ where: { tag: eq.tag } });
    if (!existing && sys) {
      await prisma.deviceInstance.create({ data: { name: eq.name, tag: eq.tag, carType: eq.carType, location: eq.location, systemId: sys.id } });
      count++;
    }
  }
  return count;
}

async function seedWires() {
  const trainlines = [
    { no: '3003', name: 'FORWARD', desc: 'Forward propulsion command', system: 'TRAC' },
    { no: '3004', name: 'REVERSE', desc: 'Reverse propulsion command', system: 'TRAC' },
    { no: '3005', name: 'POWERING_1', desc: 'Powering command level 1 (crossed with 3006)', system: 'TRAC', crossed: true, crossWith: '3006' },
    { no: '3006', name: 'POWERING_2', desc: 'Powering command level 2 (crossed with 3005)', system: 'TRAC', crossed: true, crossWith: '3005' },
    { no: '3010', name: 'BRAKING', desc: 'Braking command to VVVF', system: 'TRAC' },
    { no: '3011', name: 'FSB_CMD', desc: 'Full service brake command', system: 'TRAC' },
    { no: '4024', name: 'BRAKE_LOOP_N', desc: 'Brake loop normal', system: 'BRAKE' },
    { no: '4028', name: 'BRAKE_LOOP_R', desc: 'Brake loop return path', system: 'BRAKE' },
    { no: '4062', name: 'EM_BRAKE_N', desc: 'Emergency brake loop normal', system: 'BRAKE' },
    { no: '4070', name: 'EM_BRAKE_N_RTN', desc: 'Emergency brake loop normal return', system: 'BRAKE' },
    { no: '4103', name: 'EM_BRAKE_R', desc: 'Emergency brake loop redundant', system: 'BRAKE' },
    { no: '4110', name: 'EM_BRAKE_R_RTN', desc: 'Emergency brake loop redundant return', system: 'BRAKE' },
    { no: '4122', name: 'PB_APPLIED', desc: 'Parking brake applied indication', system: 'BRAKE' },
    { no: '4153', name: 'PB_RELEASED', desc: 'Parking brake released indication', system: 'BRAKE' },
    { no: '6009', name: 'DOOR_OPEN_L', desc: 'Left door open command (crossed with 6046)', system: 'DOOR', crossed: true, crossWith: '6046' },
    { no: '6014', name: 'DOOR_CLOSE_L', desc: 'Left door close command (crossed with 6051)', system: 'DOOR', crossed: true, crossWith: '6051' },
    { no: '6046', name: 'DOOR_OPEN_R', desc: 'Right door open command (crossed with 6009)', system: 'DOOR', crossed: true, crossWith: '6009' },
    { no: '6051', name: 'DOOR_CLOSE_R', desc: 'Right door close command (crossed with 6014)', system: 'DOOR', crossed: true, crossWith: '6014' },
    { no: '6073', name: 'DOOR_PROVE_1', desc: 'Door 1 proving loop feedback', system: 'DOOR' },
    { no: '6076', name: 'DOOR_PROVE_2', desc: 'Door 2 proving loop feedback', system: 'DOOR' },
    { no: '6112', name: 'ZERO_SPEED', desc: 'Zero speed signal - enables door opening', system: 'DOOR' },
    { no: '7001', name: 'CAB_VAC_FLT', desc: 'Cab VAC fault indication', system: 'VAC' },
    { no: '7050', name: 'VAC1_STATUS', desc: 'Saloon VAC 1 status feedback', system: 'VAC' },
    { no: '7060', name: 'VAC2_STATUS', desc: 'Saloon VAC 2 status feedback', system: 'VAC' },
    { no: '7070', name: 'SMOKE_DETECT', desc: 'Smoke detection alarm', system: 'VAC' },
    { no: '7071', name: 'DAMPER', desc: 'Damper operation signal', system: 'VAC' },
    { no: '5000', name: 'SHORE_SUPPLY', desc: 'Shore supply contactor command', system: 'APS' },
    { no: '5030', name: 'SIV_CONTACT1', desc: 'SIV contactor 1 status', system: 'APS' },
    { no: '5031', name: 'SIV_CONTACT2', desc: 'SIV contactor 2 status', system: 'APS' },
    { no: '5064', name: 'BAT_UNDER_VOLT', desc: 'Battery under-voltage warning', system: 'APS' },
    { no: '1207', name: 'VVVF_FAULT', desc: 'VVVF fault indication', system: 'TRAC' },
    { no: '1209', name: 'HSCB_TRIP', desc: 'HSCB trip status indication', system: 'HV' },
    { no: '1215', name: 'AUX_FAULT', desc: 'Auxiliary system fault', system: 'APS' },
    { no: '1032', name: 'RESET', desc: 'System reset command', system: 'TRL' },
    { no: '1040', name: 'AUX_ON', desc: 'Auxiliary power on command', system: 'APS' },
    { no: '1050', name: 'SHUTDOWN', desc: 'System shutdown command', system: 'TRL' },
  ];
  let count = 0;
  for (const tl of trainlines) {
    const existing = await prisma.wire.findUnique({ where: { wireNo: tl.no } });
    if (!existing) {
      await prisma.wire.create({
        data: {
          wireNo: tl.no,
          wireType: 'single',
          wireColor: 'Blue',
          voltageClass: tl.no.startsWith('5') ? '415V' : '110V',
          cableSpec: tl.no.startsWith('5') ? '2.5sqmm' : '1.5sqmm',
          description: tl.desc,
          signalName: tl.name,
        }
      });
      count++;
    }
  }
  return count;
}

async function seedConnectorsAndPins() {
  const deviceConnectors = [
    { deviceTag: 'TCMS_RIO1', connectors: ['X1', 'CN1', 'CN2', 'U15', 'U25'] },
    { deviceTag: 'TCMS_RIO2', connectors: ['X1', 'U15', 'U25'] },
    { deviceTag: 'V1', connectors: ['CN1', 'CN2'] },
    { deviceTag: 'V2', connectors: ['CN1', 'CN2'] },
    { deviceTag: 'BCU1', connectors: ['X1', 'CN1'] },
    { deviceTag: 'BCU2', connectors: ['X1', 'CN1'] },
    { deviceTag: 'BCU3', connectors: ['X1', 'CN1'] },
    { deviceTag: 'APS1', connectors: ['CN1', 'CN2', 'CN3'] },
    { deviceTag: 'DCU1', connectors: ['CN1', 'CN2'] },
    { deviceTag: 'DCU2', connectors: ['CN1', 'CN2'] },
    { deviceTag: 'VAC1', connectors: ['CN1'] },
    { deviceTag: 'VAC2', connectors: ['CN1'] },
    { deviceTag: 'CAB_VAC1', connectors: ['CN1'] },
    { deviceTag: 'LTEB1', connectors: ['X1', 'X2', 'X3', 'X4'] },
    { deviceTag: 'LTEB2', connectors: ['X1', 'X2', 'X3', 'X4'] },
    { deviceTag: 'LTEB3', connectors: ['X1', 'X2', 'X3', 'X4'] },
    { deviceTag: 'EDB1', connectors: ['X1', 'X2'] },
    { deviceTag: 'EDB2', connectors: ['X1', 'X2'] },
    { deviceTag: 'HSCB1', connectors: ['CN1'] },
    { deviceTag: 'HSCB2', connectors: ['CN1'] },
  ];
  let connCount = 0;
  let pinCount = 0;
  for (const dc of deviceConnectors) {
    const device = await prisma.deviceInstance.findFirst({ where: { tag: dc.deviceTag } });
    if (!device) continue;
    for (const connCode of dc.connectors) {
      const existingConn = await prisma.connector.findFirst({ where: { deviceId: device.id, connectorCode: connCode } });
      if (!existingConn) {
        const conn = await prisma.connector.create({
          data: { deviceId: device.id, connectorCode, connectorType: 'IO', normCode: connCode }
        });
        connCount++;
        const pinCountNum = connCode.startsWith('X') ? 20 : 10;
        for (let i = 1; i <= pinCountNum; i++) {
          await prisma.connectorPin.create({
            data: { connectorId: conn.id, pinNo: String(i), normPinNo: `${connCode}-${i}` }
          });
          pinCount++;
        }
      }
    }
  }
  return { connCount, pinCount };
}

export async function POST() {
  try {
    const systemsCount = await seedSystems();
    const drawingsCount = await seedDrawings();
    const equipmentCount = await seedEquipment();
    const wiresCount = await seedWires();
    const { connCount, pinCount } = await seedConnectorsAndPins();

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      count: systemsCount + drawingsCount + equipmentCount + wiresCount + connCount + pinCount,
      details: { systems: systemsCount, drawings: drawingsCount, equipment: equipmentCount, wires: wiresCount, connectors: connCount, pins: pinCount }
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, message: 'Seeding failed', errors: [(error as Error).message] }, { status: 500 });
  }
}