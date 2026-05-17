import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function seedSystems() {
  const systems = [
    { name: 'General', code: 'GEN', category: 'Foundation', description: 'General documentation and standards', sortOrder: 1 },
    { name: 'Train Line', code: 'TRL', category: 'Core Systems', description: 'Trainline control and signal wiring', sortOrder: 2 },
    { name: 'Traction', code: 'TRAC', category: 'Propulsion', description: 'Traction system and VVVF control', sortOrder: 3 },
    { name: 'High Voltage', code: 'HV', category: 'Power', description: 'High voltage distribution', sortOrder: 4 },
    { name: 'Low Tension Equipment Box', code: 'LTEB', category: 'Power', description: 'Low tension power distribution', sortOrder: 5 },
    { name: 'Low Tension Junction Box', code: 'LTJB', category: 'Power', description: 'Junction boxes for low voltage', sortOrder: 6 },
    { name: 'Auxiliary Power Supply', code: 'APS', category: 'Power', description: 'Auxiliary power and battery', sortOrder: 7 },
    { name: 'Brake System', code: 'BRAKE', category: 'Core Systems', description: 'Brake control and air supply', sortOrder: 8 },
    { name: 'Door System', code: 'DOOR', category: 'Core Systems', description: 'Passenger door control', sortOrder: 9 },
    { name: 'Ventilation AC', code: 'VAC', category: 'Comfort', description: 'HVAC systems', sortOrder: 10 },
    { name: 'Cab Equipment', code: 'CAB', category: 'Control', description: 'Driver cab equipment', sortOrder: 11 },
    { name: 'Lighting', code: 'LIGHT', category: 'Comfort', description: 'Interior and exterior lighting', sortOrder: 12 },
    { name: 'Communication', code: 'COMMS', category: 'Communication', description: 'PIS, PA, CCTV, Radio', sortOrder: 13 },
    { name: 'Coupling', code: 'COUPL', category: 'Mechanical', description: 'Car coupling and inter-car', sortOrder: 14 },
    { name: 'TCMS', code: 'TMS', category: 'Control', description: 'Train Control Management System', sortOrder: 15 },
    { name: 'Electrical Distribution Box', code: 'EDB', category: 'Power', description: 'Electrical distribution', sortOrder: 16 },
    { name: 'Bogie', code: 'BOGIE', category: 'Mechanical', description: 'Bogie and wheelset', sortOrder: 17 },
  ];
  for (const s of systems) {
    await prisma.system.upsert({ where: { code: s.code }, update: s, create: s });
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
    { drawingNo: '942-38109', title: 'PIS/TIS Sheet 2', carType: 'MC', subsystem: 'COMMS', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-38149', title: 'DVAS/PA - Digital Voice Announcement', carType: 'MC', subsystem: 'COMMS', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-38150', title: 'PA Amplifier', carType: 'MC', subsystem: 'COMMS', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-38151', title: 'PA Amplifier Sheet 2', carType: 'MC', subsystem: 'COMMS', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-38152', title: 'CBTC - Communication Based Train Control', carType: 'MC', subsystem: 'COMMS', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-38153', title: 'Train Radio Interface', carType: 'MC', subsystem: 'COMMS', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-38154', title: 'CCTV - Closed Circuit Television', carType: 'MC', subsystem: 'COMMS', drawingType: 'SCHEMATIC', pageCount: 1 },
    { drawingNo: '942-38309', title: 'DMC Underframe PIN Drawing', carType: 'DMC', subsystem: 'LTEB', drawingType: 'PIN_ASSIGNMENT', pageCount: 26 },
    { drawingNo: '942-38409', title: 'TC Ceiling PIN Drawing', carType: 'TC', subsystem: 'TMS', drawingType: 'PIN_ASSIGNMENT', pageCount: 27 },
    { drawingNo: '942-38509', title: 'TC Underframe PIN Drawing', carType: 'TC', subsystem: 'APS', drawingType: 'PIN_ASSIGNMENT', pageCount: 21 },
    { drawingNo: '942-38609', title: 'MC Underframe PIN Drawing', carType: 'MC', subsystem: 'LTEB', drawingType: 'PIN_ASSIGNMENT', pageCount: 27 },
    { drawingNo: '942-38610', title: 'MC Ceiling PIN Drawing', carType: 'MC', subsystem: 'TMS', drawingType: 'PIN_ASSIGNMENT', pageCount: 58 },
    { drawingNo: '942-38103', title: 'HV System PIN Drawing', carType: 'DMC', subsystem: 'HV', drawingType: 'PIN_ASSIGNMENT', pageCount: 1 },
    { drawingNo: '942-38107', title: 'CAB PIN Drawing', carType: 'CAB', subsystem: 'CAB', drawingType: 'PIN_ASSIGNMENT', pageCount: 48 },
  ];
  const project = await prisma.project.findFirst() || await prisma.project.create({ data: { projectCode: 'KMRCL_RS3R', projectName: 'KMRCL RS3R Metro' } });
  for (const d of drawings) {
    const sys = await prisma.system.findFirst({ where: { code: d.subsystem } });
    await prisma.drawing.upsert({ 
      where: { projectId_drawingNo_revision: { projectId: project.id, drawingNo: d.drawingNo, revision: 'A' } }, 
      update: { title: d.title, systemId: sys?.id, totalSheets: d.pageCount, remarks: `${d.carType}|${d.subsystem}` }, 
      create: { projectId: project.id, drawingNo: d.drawingNo, title: d.title, systemId: sys?.id, totalSheets: d.pageCount, remarks: `${d.carType}|${d.subsystem}` } 
    });
  }
  return drawings.length;
}

async function seedEquipment() {
  const equipment = [
    { tagNo: 'V1', deviceName: 'VVVF Inverter 1', carType: 'DMC', systemCode: 'TRAC', locationTag: 'Underframe' },
    { tagNo: 'V2', deviceName: 'VVVF Inverter 2', carType: 'MC', systemCode: 'TRAC', locationTag: 'Underframe' },
    { tagNo: 'BCU1', deviceName: 'Brake Control Unit 1', carType: 'DMC', systemCode: 'BRAKE', locationTag: 'Underframe' },
    { tagNo: 'BCU2', deviceName: 'Brake Control Unit 2', carType: 'TC', systemCode: 'BRAKE', locationTag: 'Underframe' },
    { tagNo: 'BCU3', deviceName: 'Brake Control Unit 3', carType: 'MC', systemCode: 'BRAKE', locationTag: 'Underframe' },
    { tagNo: 'BECU1', deviceName: 'Brake Electronic Control Unit 1', carType: 'MC', systemCode: 'BRAKE', locationTag: 'Underframe' },
    { tagNo: 'TCMS_RIO1', deviceName: 'TCMS Remote IO Unit 1', carType: 'MC', systemCode: 'TMS', locationTag: 'Ceiling' },
    { tagNo: 'TCMS_RIO2', deviceName: 'TCMS Remote IO Unit 2', carType: 'TC', systemCode: 'TMS', locationTag: 'Ceiling' },
    { tagNo: 'APS1', deviceName: 'Auxiliary Power Supply 1', carType: 'TC', systemCode: 'APS', locationTag: 'Underframe' },
    { tagNo: 'SSB1', deviceName: 'Shore Supply Box 1', carType: 'TC', systemCode: 'APS', locationTag: 'Underframe' },
    { tagNo: 'BATT1', deviceName: 'Battery Box 1', carType: 'TC', systemCode: 'APS', locationTag: 'Underframe' },
    { tagNo: 'HSCB1', deviceName: 'High Speed Circuit Breaker 1', carType: 'DMC', systemCode: 'HV', locationTag: 'Underframe' },
    { tagNo: 'HSCB2', deviceName: 'High Speed Circuit Breaker 2', carType: 'MC', systemCode: 'HV', locationTag: 'Underframe' },
    { tagNo: 'DCU1', deviceName: 'Door Control Unit 1', carType: 'MC', systemCode: 'DOOR', locationTag: 'Ceiling' },
    { tagNo: 'DCU2', deviceName: 'Door Control Unit 2', carType: 'TC', systemCode: 'DOOR', locationTag: 'Ceiling' },
    { tagNo: 'VAC1', deviceName: 'Saloon VAC Unit 1', carType: 'MC', systemCode: 'VAC', locationTag: 'Ceiling' },
    { tagNo: 'VAC2', deviceName: 'Saloon VAC Unit 2', carType: 'TC', systemCode: 'VAC', locationTag: 'Ceiling' },
    { tagNo: 'CAB_VAC1', deviceName: 'Cab VAC Unit 1', carType: 'CAB', systemCode: 'VAC', locationTag: 'Cab' },
    { tagNo: 'OP_PNL1', deviceName: 'Operating Panel 1', carType: 'CAB', systemCode: 'CAB', locationTag: 'Cab Desk' },
    { tagNo: 'IND_PNL1', deviceName: 'Indicator Panel 1', carType: 'CAB', systemCode: 'CAB', locationTag: 'Cab Desk' },
    { tagNo: 'MCB_PNL1', deviceName: 'MCB Panel 1', carType: 'CAB', systemCode: 'CAB', locationTag: 'Cab' },
    { tagNo: 'LTEB1', deviceName: 'Low Tension Equipment Box 1', carType: 'DMC', systemCode: 'LTEB', locationTag: 'Underframe' },
    { tagNo: 'LTEB2', deviceName: 'Low Tension Equipment Box 2', carType: 'TC', systemCode: 'LTEB', locationTag: 'Underframe' },
    { tagNo: 'LTEB3', deviceName: 'Low Tension Equipment Box 3', carType: 'MC', systemCode: 'LTEB', locationTag: 'Underframe' },
    { tagNo: 'LTJB1', deviceName: 'Low Tension Junction Box 1', carType: 'DMC', systemCode: 'LTJB', locationTag: 'Underframe' },
    { tagNo: 'LTJB2', deviceName: 'Low Tension Junction Box 2', carType: 'TC', systemCode: 'LTJB', locationTag: 'Underframe' },
    { tagNo: 'LTJB3', deviceName: 'Low Tension Junction Box 3', carType: 'MC', systemCode: 'LTJB', locationTag: 'Underframe' },
    { tagNo: 'EDB1', deviceName: 'Electrical Distribution Box 1', carType: 'MC', systemCode: 'EDB', locationTag: 'Ceiling' },
    { tagNo: 'EDB2', deviceName: 'Electrical Distribution Box 2', carType: 'TC', systemCode: 'EDB', locationTag: 'Ceiling' },
    { tagNo: 'ETH_SW1', deviceName: 'Ethernet Switch CCTV 1', carType: 'MC', systemCode: 'COMMS', locationTag: 'Ceiling' },
    { tagNo: 'ETH_SW2', deviceName: 'Ethernet Switch CCTV 2', carType: 'TC', systemCode: 'COMMS', locationTag: 'Ceiling' },
    { tagNo: 'AAU1', deviceName: 'Audio Alarm Unit 1', carType: 'MC', systemCode: 'COMMS', locationTag: 'Ceiling' },
    { tagNo: 'AAU2', deviceName: 'Audio Alarm Unit 2', carType: 'TC', systemCode: 'COMMS', locationTag: 'Ceiling' },
    { tagNo: 'COMP1', deviceName: 'Compressor Motor 1', carType: 'TC', systemCode: 'BRAKE', locationTag: 'Underframe' },
    { tagNo: 'PBMV1', deviceName: 'Parking Brake Magnetic Valve 1', carType: 'MC', systemCode: 'BRAKE', locationTag: 'Underframe' },
    { tagNo: 'CSJB1', deviceName: 'Collector Shoe Junction Box 1', carType: 'DMC', systemCode: 'HV', locationTag: 'Underframe' },
    { tagNo: 'CSJB2', deviceName: 'Collector Shoe Junction Box 2', carType: 'TC', systemCode: 'HV', locationTag: 'Underframe' },
    { tagNo: 'CSJB3', deviceName: 'Collector Shoe Junction Box 3', carType: 'MC', systemCode: 'HV', locationTag: 'Underframe' },
  ];
  let count = 0;
  const project = await prisma.project.findFirst() || await prisma.project.create({ data: { projectCode: 'KMRCL_RS3R', projectName: 'KMRCL RS3R' } });
  const defaultDrawing = await prisma.drawing.findFirst({ where: { projectId: project.id } }) || await prisma.drawing.create({ data: { projectId: project.id, drawingNo: 'DUMMY', title: 'Default Drawing' } });
  for (const eq of equipment) {
    const sys = await prisma.system.findFirst({ where: { code: eq.systemCode } });
    const existing = await prisma.device.findFirst({ where: { tagNo: eq.tagNo } });
    if (!existing) {
      await prisma.device.create({ data: { tagNo: eq.tagNo, deviceName: eq.deviceName, carType: eq.carType, locationTag: eq.locationTag, systemId: sys?.id, drawingId: defaultDrawing.id } });
      count++;
    }
  }
  return count;
}

async function seedWires() {
  const trainlines = [
    { no: '3003', name: 'FORWARD', desc: 'Forward propulsion command', system: 'TRAC' },
    { no: '3004', name: 'REVERSE', desc: 'Reverse propulsion command', system: 'TRAC' },
    { no: '3005', name: 'POWERING_1', desc: 'Powering command level 1 (crossed with 3006)', system: 'TRAC' },
    { no: '3006', name: 'POWERING_2', desc: 'Powering command level 2 (crossed with 3005)', system: 'TRAC' },
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
    { no: '6009', name: 'DOOR_OPEN_L', desc: 'Left door open command (crossed with 6046)', system: 'DOOR' },
    { no: '6014', name: 'DOOR_CLOSE_L', desc: 'Left door close command (crossed with 6051)', system: 'DOOR' },
    { no: '6046', name: 'DOOR_OPEN_R', desc: 'Right door open command (crossed with 6009)', system: 'DOOR' },
    { no: '6051', name: 'DOOR_CLOSE_R', desc: 'Right door close command (crossed with 6051)', system: 'DOOR' },
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
          wireColor: 'Blue',
          voltageClass: tl.no.startsWith('5') ? '415V' : '110V',
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
    const device = await prisma.device.findFirst({ where: { tagNo: dc.deviceTag } });
    if (!device) continue;
    const drawing = await prisma.drawing.findFirst({ where: { id: device.drawingId } });
    for (const connCode of dc.connectors) {
      const existingConn = await prisma.connector.findFirst({ where: { drawingId: device.drawingId, connectorCode: connCode } });
      if (!existingConn && drawing) {
        const conn = await prisma.connector.create({
          data: { drawingId: device.drawingId, connectorCode: connCode }
        });
        connCount++;
        const pinCountNum = connCode.startsWith('X') ? 20 : 10;
        for (let i = 1; i <= pinCountNum; i++) {
          await prisma.connectorPin.create({
            data: { connectorId: conn.id, pinNo: String(i) }
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