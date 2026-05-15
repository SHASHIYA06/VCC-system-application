import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getDrawingByNo(drawingNo: string) {
  return prisma.drawing.findFirst({ where: { drawingNo } });
}

function mapScope(scope?: string): 'INTERCAR' | 'POWER' | 'COMMUNICATION' | 'DEVICE' | 'DIAGNOSTIC' | undefined {
  if (!scope) return undefined;
  const s = scope.toUpperCase();
  if (s === 'CONTROL' || s === 'SIGNAL' || s === 'DOOR' || s === 'BRAKE' || s === 'TRACTION' || s === 'TCMS' || s === 'HVAC' || s === 'COUPLING') return 'DEVICE';
  if (s === 'POWER' || s === 'HV' || s === 'AUX') return 'POWER';
  if (s === 'COMM') return 'COMMUNICATION';
  return 'DEVICE';
}

async function getOrCreateConnector(drawingId: string, code: string, description?: string, pinCount?: number, carType?: string, location?: string, scope?: string) {
  const existing = await prisma.connector.findFirst({ where: { drawingId, connectorCode: code } });
  if (existing) {
    return prisma.connector.update({
      where: { id: existing.id },
      data: { description, pinCount, carType, locationTag: location, scope: mapScope(scope) }
    });
  }
  return prisma.connector.create({
    data: { drawingId, connectorCode: code, description, pinCount, carType, locationTag: location, scope: mapScope(scope) }
  });
}

async function getOrCreatePin(connectorId: string, pinNo: string) {
  const existing = await prisma.connectorPin.findFirst({ where: { connectorId, pinNo } });
  if (existing) return existing;
  return prisma.connectorPin.create({ data: { connectorId, pinNo } });
}

async function getOrCreateWire(wireNo: string, signalName?: string, color?: string, voltageClass?: string) {
  const existing = await prisma.wire.findUnique({ where: { wireNo } });
  if (existing) {
    return prisma.wire.update({
      where: { wireNo },
      data: { signalName, wireColor: color, voltageClass }
    });
  }
  return prisma.wire.create({
    data: { wireNo, signalName, wireColor: color || 'BLUE', voltageClass: voltageClass || '110V' }
  });
}

async function getOrCreateSignal(code: string, name: string, medium?: string, direction?: string) {
  const existing = await prisma.signal.findUnique({ where: { signalCode: code } });
  if (existing) {
    return prisma.signal.update({
      where: { signalCode: code },
      data: { signalName: name, medium, direction }
    });
  }
  return prisma.signal.create({
    data: { signalCode: code, signalName: name, medium: medium || 'DIGITAL', direction }
  });
}

async function getOrCreateTrainLine(drawingId: string, wireNo: string, itemName: string, lineGroup: string, carType?: string, connectorCode?: string, pinNo?: string, note?: string) {
  const existing = await prisma.trainLine.findFirst({ where: { drawingId, wireNo } });
  if (existing) {
    return prisma.trainLine.update({
      where: { id: existing.id },
      data: { itemName, lineGroup, carType, connectorCode, pinNo, note }
    });
  }
  return prisma.trainLine.create({
    data: { drawingId, wireNo, itemName, lineGroup, carType, connectorCode, pinNo, note }
  });
}

async function getOrCreateDevice(drawingId: string, systemId: string | null, tagNo: string, deviceName: string, carType?: string, location?: string, deviceType?: string) {
  const existing = await prisma.device.findFirst({ where: { tagNo } });
  if (existing) {
    return prisma.device.update({
      where: { id: existing.id },
      data: { drawingId, systemId, carType, locationTag: location, deviceType }
    });
  }
  return prisma.device.create({
    data: { drawingId, systemId, tagNo, deviceName, carType, locationTag: location, deviceType }
  });
}

async function addCrossConnectionRule(drawingId: string, connectorCode: string, pinA: string, pinB: string, wireA: string, wireB: string, remarks: string, ruleType: string = 'INTERNAL_CROSS') {
  const existing = await prisma.crossConnectionRule.findFirst({
    where: { drawingId, connectorCode, pinA, pinB }
  });
  if (existing) return existing;
  return prisma.crossConnectionRule.create({
    data: { drawingId, connectorCode, pinA, pinB, wireA, wireB, ruleType, remarks }
  });
}

async function seedGeneralSystem() {
  console.log('Seeding GENERAL system wiring...');
  
  // 942-58103 Train Lines Control
  const d58103 = await getDrawingByNo('942-58103');
  if (d58103) {
    // Main Connectors X1, X2
    const x1 = await getOrCreateConnector(d58103.id, 'X1', '74P Control Signal Connector - Forward/Reverse', 74, 'ALL', 'Jumper Plug', 'CONTROL');
    const x2 = await getOrCreateConnector(d58103.id, 'X2', '74P Control Signal Connector - RS422 Signal', 74, 'ALL', 'Jumper Plug', 'SIGNAL');
    const x3 = await getOrCreateConnector(d58103.id, 'X3', '11P 415V/230V AC Power Connector', 11, 'ALL', 'Jumper Plug', 'POWER');
    const x4 = await getOrCreateConnector(d58103.id, 'X4', '3P 110V DC Power Connector', 3, 'ALL', 'Jumper Plug', 'POWER');
    
    // Create pins for X1
    for (let i = 1; i <= 74; i++) {
      await getOrCreatePin(x1.id, String(i));
    }
    for (let i = 1; i <= 74; i++) {
      await getOrCreatePin(x2.id, String(i));
    }
    
    // Train Lines Control
    const trainLinesControl = [
      { wireNo: '3001', name: 'FWD', itemName: 'Forward Direction', group: 'CONTROL' },
      { wireNo: '3002', name: 'REV', itemName: 'Reverse Direction', group: 'CONTROL' },
      { wireNo: '3003', name: 'EB', itemName: 'Emergency Brake', group: 'CONTROL' },
      { wireNo: '3004', name: 'SB', itemName: 'Service Brake', group: 'CONTROL' },
      { wireNo: '3005', name: 'TRAC_EN', itemName: 'Traction Enable', group: 'CONTROL' },
      { wireNo: '3006', name: 'TRAC_EN_C', itemName: 'Traction Enable Complementary', group: 'CONTROL' },
      { wireNo: '3007', name: 'PANT_UP', itemName: 'Pantograph Raise', group: 'CONTROL' },
      { wireNo: '3008', name: 'PANT_DN', itemName: 'Pantograph Lower', group: 'CONTROL' },
      { wireNo: '3009', name: 'MCB_ON', itemName: 'MCB On Command', group: 'CONTROL' },
      { wireNo: '3010', name: 'MCB_OFF', itemName: 'MCB Off Command', group: 'CONTROL' },
      { wireNo: '3011', name: 'HSCB_ON', itemName: 'HSCB Close Command', group: 'CONTROL' },
      { wireNo: '3012', name: 'HSCB_OFF', itemName: 'HSCB Open Command', group: 'CONTROL' },
      { wireNo: '6001', name: 'DOOR_OP', itemName: 'Door Open Command', group: 'DOOR' },
      { wireNo: '6002', name: 'DOOR_CL', itemName: 'Door Close Command', group: 'DOOR' },
      { wireNo: '6003', name: 'DOOR_LK', itemName: 'Door Lock Status', group: 'DOOR' },
      { wireNo: '6004', name: 'DOOR_UNLK', itemName: 'Door Unlock Status', group: 'DOOR' },
      { wireNo: '6005', name: 'DOOR_OVRD', itemName: 'Door Override', group: 'DOOR' },
      { wireNo: '6009', name: 'DOOR_OP_L', itemName: 'Door Open Left', group: 'DOOR' },
      { wireNo: '6014', name: 'DOOR_CL_L', itemName: 'Door Close Left', group: 'DOOR' },
      { wireNo: '6046', name: 'DOOR_OP_L_C', itemName: 'Door Open Left Complementary', group: 'DOOR' },
      { wireNo: '6051', name: 'DOOR_CL_L_C', itemName: 'Door Close Left Complementary', group: 'DOOR' },
    ];
    
    for (const tl of trainLinesControl) {
      await getOrCreateWire(tl.wireNo, tl.name);
      await getOrCreateTrainLine(d58103.id, tl.wireNo, tl.itemName, tl.group, 'ALL', 'X1', String(trainLinesControl.indexOf(tl) + 1));
    }
    
    // Cross connection rules
    await addCrossConnectionRule(d58103.id, 'X1', '19', '20', '3005', '3006', 'Forward/Reverse internally cross connected in X1 jumper plug');
    await addCrossConnectionRule(d58103.id, 'X1', '43', '44', '6009', '6046', 'Door open left internally cross connected in X1 jumper plug');
    await addCrossConnectionRule(d58103.id, 'X1', '46', '47', '6014', '6051', 'Door close left internally cross connected in X1 jumper plug');
  }
  
  // 942-58104 Train Lines Signal
  const d58104 = await getDrawingByNo('942-58104');
  if (d58104) {
    const x2 = await getOrCreateConnector(d58104.id, 'X2', '74P RS422 Signal Connector', 74, 'ALL', 'Jumper Plug', 'SIGNAL');
    const x5b = await getOrCreateConnector(d58104.id, 'X5-B', 'TCMS/EBCU Connector B', null, 'DMC', 'Ceiling', 'TCMS');
    const x5c = await getOrCreateConnector(d58104.id, 'X5-C', 'CCTV Connector C', null, 'ALL', 'Ceiling', 'CCTV');
    const x5d = await getOrCreateConnector(d58104.id, 'X5-D', 'Display Connector D', null, 'MC', 'Ceiling', 'DISPLAY');
    
    for (let i = 1; i <= 74; i++) {
      await getOrCreatePin(x2.id, String(i));
    }
    
    // Signal Train Lines
    const signalLines = [
      { wireNo: '92431', name: 'RS422_TX_P', itemName: 'RS422 Transmit Positive', group: 'SIGNAL' },
      { wireNo: '92432', name: 'RS422_TX_N', itemName: 'RS422 Transmit Negative', group: 'SIGNAL' },
      { wireNo: '92433', name: 'RS422_RX_P', itemName: 'RS422 Receive Positive', group: 'SIGNAL' },
      { wireNo: '92434', name: 'RS422_RX_N', itemName: 'RS422 Receive Negative', group: 'SIGNAL' },
      { wireNo: '92451', name: 'RS422_TX_P_C', itemName: 'RS422 TX Positive Complementary', group: 'SIGNAL' },
      { wireNo: '92452', name: 'RS422_TX_N_C', itemName: 'RS422 TX Negative Complementary', group: 'SIGNAL' },
      { wireNo: '92453', name: 'RS422_RX_P_C', itemName: 'RS422 RX Positive Complementary', group: 'SIGNAL' },
      { wireNo: '92454', name: 'RS422_RX_N_C', itemName: 'RS422 RX Negative Complementary', group: 'SIGNAL' },
    ];
    
    for (const tl of signalLines) {
      await getOrCreateWire(tl.wireNo, tl.name);
      await getOrCreateTrainLine(d58104.id, tl.wireNo, tl.itemName, tl.group, 'ALL', 'X2', String(signalLines.indexOf(tl) + 29));
    }
    
    // Cross connections for RS422
    await addCrossConnectionRule(d58104.id, 'X2', '29', '31', '92431', '92451', 'Rear RS422 TX/RX pair internally cross connected in X2');
    await addCrossConnectionRule(d58104.id, 'X2', '30', '32', '92432', '92452', 'Rear RS422 TX-/RX- internally cross connected in X2');
  }
  
  // 942-58105 Train Lines Low Tension Power
  const d58105 = await getDrawingByNo('942-58105');
  if (d58105) {
    const x4 = await getOrCreateConnector(d58105.id, 'X4', '3P 110V DC Power', 3, 'ALL', 'Jumper Plug', 'POWER');
    
    const ltPower = [
      { wireNo: '501', name: 'BATT_+110', itemName: 'Battery +110V', group: 'LT_POWER' },
      { wireNo: '502', name: 'BATT_GND', itemName: 'Battery Ground', group: 'LT_POWER' },
      { wireNo: '503', name: 'AUX_+110', itemName: 'Auxiliary +110V', group: 'LT_POWER' },
      { wireNo: '504', name: 'AUX_GND', itemName: 'Auxiliary Ground', group: 'LT_POWER' },
      { wireNo: '505', name: 'EMERG_+110', itemName: 'Emergency +110V', group: 'LT_POWER' },
      { wireNo: '506', name: 'EMERG_GND', itemName: 'Emergency Ground', group: 'LT_POWER' },
    ];
    
    for (const tl of ltPower) {
      await getOrCreateWire(tl.wireNo, tl.name, 'YELLOW', '110V DC');
      await getOrCreateTrainLine(d58105.id, tl.wireNo, tl.itemName, tl.group, 'ALL');
    }
  }
  
  // 942-58106 Train Lines High Tension Power
  const d58106 = await getDrawingByNo('942-58106');
  if (d58106) {
    const x6 = await getOrCreateConnector(d58106.id, 'X6', '1P High Tension Power', 1, 'DMC', 'Underframe', 'HV');
    const x7 = await getOrCreateConnector(d58106.id, 'X7', '1P High Tension Earth', 1, 'DMC', 'Underframe', 'HV');
    
    const htPower = [
      { wireNo: '750P', name: 'HV_+750V', itemName: 'High Tension +750V', group: 'HT_POWER' },
      { wireNo: '750N', name: 'HV_-750V', itemName: 'High Tension -750V (Return)', group: 'HT_POWER' },
      { wireNo: '750E', name: 'HV_EARTH', itemName: 'High Tension Earth', group: 'HT_POWER' },
      { wireNo: 'TR_M1', name: 'TRAC_M1', itemName: 'Traction Motor 1 Supply', group: 'HT_POWER' },
      { wireNo: 'TR_M2', name: 'TRAC_M2', itemName: 'Traction Motor 2 Supply', group: 'HT_POWER' },
    ];
    
    for (const tl of htPower) {
      await getOrCreateWire(tl.wireNo, tl.name, 'RED', '750V DC');
      await getOrCreateTrainLine(d58106.id, tl.wireNo, tl.itemName, tl.group, 'DMC');
    }
  }
  
  console.log('GENERAL system wiring seeded!');
}

async function seedTrainLineSystem() {
  console.log('Seeding TRAIN LINE system wiring...');
  
  // 942-58131 Trainlines DMC
  const d58131 = await getDrawingByNo('942-58131');
  if (d58131) {
    const dmcLines = [
      { wireNo: '1001', name: 'DMC_FWD', itemName: 'DMC Forward', group: 'CONTROL' },
      { wireNo: '1002', name: 'DMC_REV', itemName: 'DMC Reverse', group: 'CONTROL' },
      { wireNo: '1003', name: 'DMC_EB', itemName: 'DMC Emergency Brake', group: 'CONTROL' },
      { wireNo: '1004', name: 'DMC_PB', itemName: 'DMC Parking Brake', group: 'CONTROL' },
      { wireNo: '1005', name: 'DMC_DOOR', itemName: 'DMC Door Control', group: 'DOOR' },
      { wireNo: '1006', name: 'DMC_TCMS', itemName: 'DMC TCMS Data', group: 'TCMS' },
    ];
    for (const tl of dmcLines) {
      await getOrCreateTrainLine(d58131.id, tl.wireNo, tl.itemName, tl.group, 'DMC');
    }
  }
  
  // 942-58132 Trainlines TC
  const d58132 = await getDrawingByNo('942-58132');
  if (d58132) {
    const tcLines = [
      { wireNo: '2001', name: 'TC_FWD', itemName: 'TC Forward', group: 'CONTROL' },
      { wireNo: '2002', name: 'TC_REV', itemName: 'TC Reverse', group: 'CONTROL' },
      { wireNo: '2003', name: 'TC_EB', itemName: 'TC Emergency Brake', group: 'CONTROL' },
      { wireNo: '2004', name: 'TC_PB', itemName: 'TC Parking Brake', group: 'CONTROL' },
    ];
    for (const tl of tcLines) {
      await getOrCreateTrainLine(d58132.id, tl.wireNo, tl.itemName, tl.group, 'TC');
    }
  }
  
  // 942-58133 Trainlines MC
  const d58133 = await getDrawingByNo('942-58133');
  if (d58133) {
    const mcLines = [
      { wireNo: '3001', name: 'MC_FWD', itemName: 'MC Forward', group: 'CONTROL' },
      { wireNo: '3002', name: 'MC_REV', itemName: 'MC Reverse', group: 'CONTROL' },
      { wireNo: '3003', name: 'MC_EB', itemName: 'MC Emergency Brake', group: 'CONTROL' },
    ];
    for (const tl of mcLines) {
      await getOrCreateTrainLine(d58133.id, tl.wireNo, tl.itemName, tl.group, 'MC');
    }
  }
  
  console.log('TRAIN LINE system wiring seeded!');
}

async function seedBrakeSystem() {
  console.log('Seeding BRAKE system wiring...');
  
  const brakeDrawings = ['942-58123', '942-58124', '942-58125', '942-58126', '942-58127', '942-58128', '942-58129'];
  
  for (const drawingNo of brakeDrawings) {
    const drawing = await getDrawingByNo(drawingNo);
    if (drawing) {
      const conn = await getOrCreateConnector(drawing.id, 'X1', 'Brake Control Connector', 20, 'ALL', 'Underframe', 'BRAKE');
      
      // Brake system train lines
      const brakeLines = [
        { wireNo: '7001', name: 'BRK_DEM', itemName: 'Brake Demand', group: 'BRAKE' },
        { wireNo: '7002', name: 'BRK_REL', itemName: 'Brake Release', group: 'BRAKE' },
        { wireNo: '7003', name: 'BRK_PRES', itemName: 'Brake Cylinder Pressure', group: 'BRAKE' },
        { wireNo: '7004', name: 'WSP', itemName: 'Wheel Slide Protection', group: 'BRAKE' },
        { wireNo: '7005', name: 'EBCU_STS', itemName: 'EBCU Status', group: 'BRAKE' },
      ];
      
      for (const tl of brakeLines) {
        await getOrCreateTrainLine(drawing.id, tl.wireNo, tl.itemName, tl.group, 'ALL', 'X1');
      }
    }
  }
  
  console.log('BRAKE system wiring seeded!');
}

async function seedDoorSystem() {
  console.log('Seeding DOOR system wiring...');
  
  const doorDrawings = ['942-58137', '942-58138', '942-58139', '942-58140', '942-58141', '942-58142'];
  
  for (const drawingNo of doorDrawings) {
    const drawing = await getDrawingByNo(drawingNo);
    if (drawing) {
      const dcua = await getOrCreateConnector(drawing.id, 'DCUA', 'Door Control Unit A', 25, 'ALL', 'Door Panel', 'DOOR');
      const dcub = await getOrCreateConnector(drawing.id, 'DCUB', 'Door Control Unit B', 25, 'ALL', 'Door Panel', 'DOOR');
      
      const doorLines = [
        { wireNo: '6001', name: 'DO_L', itemName: 'Door Open Left', group: 'DOOR' },
        { wireNo: '6002', name: 'DO_R', itemName: 'Door Open Right', group: 'DOOR' },
        { wireNo: '6003', name: 'DC_L', itemName: 'Door Close Left', group: 'DOOR' },
        { wireNo: '6004', name: 'DC_R', itemName: 'Door Close Right', group: 'DOOR' },
        { wireNo: '6005', name: 'DL_L', itemName: 'Door Lock Left', group: 'DOOR' },
        { wireNo: '6006', name: 'DL_R', itemName: 'Door Lock Right', group: 'DOOR' },
        { wireNo: '6007', name: 'ED_L', itemName: 'Emergency Door Release Left', group: 'DOOR' },
        { wireNo: '6008', name: 'ED_R', itemName: 'Emergency Door Release Right', group: 'DOOR' },
      ];
      
      for (const tl of doorLines) {
        await getOrCreateTrainLine(drawing.id, tl.wireNo, tl.itemName, tl.group, 'ALL');
      }
    }
  }
  
  console.log('DOOR system wiring seeded!');
}

async function seedTractionSystem() {
  console.log('Seeding TRACTION system wiring...');
  
  const tracDrawings = ['942-58119', '942-58120', '942-58121'];
  
  for (const drawingNo of tracDrawings) {
    const drawing = await getDrawingByNo(drawingNo);
    if (drawing) {
      const vvfb = await getOrCreateConnector(drawing.id, 'X1', 'VVVF Inverter Connector', 40, 'DMC', 'Underframe', 'TRACTION');
      const tmConn = await getOrCreateConnector(drawing.id, 'TM', 'Traction Motor Connector', 6, 'DMC', 'Bogie', 'TRACTION');
      
      const tracLines = [
        { wireNo: '8001', name: 'VVVF_RUN', itemName: 'VVVF Run Command', group: 'TRACTION' },
        { wireNo: '8002', name: 'VVVF_FAULT', itemName: 'VVVF Fault Signal', group: 'TRACTION' },
        { wireNo: '8003', name: 'VVVF_STS', itemName: 'VVVF Status', group: 'TRACTION' },
        { wireNo: '8004', name: 'TRAC_I', itemName: 'Traction Current Feedback', group: 'TRACTION' },
        { wireNo: '8005', name: 'TRAC_V', itemName: 'Traction Voltage Feedback', group: 'TRACTION' },
        { wireNo: '8006', name: 'SPDO', itemName: 'Speed Output', group: 'TRACTION' },
      ];
      
      for (const tl of tracLines) {
        await getOrCreateTrainLine(drawing.id, tl.wireNo, tl.itemName, tl.group, 'DMC');
      }
    }
  }
  
  console.log('TRACTION system wiring seeded!');
}

async function seedHVSystem() {
  console.log('Seeding HIGH VOLTAGE system wiring...');
  
  const hvDrawings = ['942-38307', '942-38308', '942-38316', '942-38317', '942-38319', '942-38321', '942-38323'];
  
  for (const drawingNo of hvDrawings) {
    const drawing = await getDrawingByNo(drawingNo);
    if (drawing) {
      const hscb = await getOrCreateConnector(drawing.id, 'HSCB', 'High Speed Circuit Breaker', 10, 'DMC', 'Underframe', 'HV');
      const csjb = await getOrCreateConnector(drawing.id, 'CSJB', 'Collector Shoe Junction Box', 20, 'DMC', 'Underframe', 'HV');
      
      const hvLines = [
        { wireNo: '7501', name: 'HV_IN', itemName: 'HV Input from Pantograph', group: 'HV' },
        { wireNo: '7502', name: 'HV_OUT', itemName: 'HV Output to VVVF', group: 'HV' },
        { wireNo: '7503', name: 'HV_FB', itemName: 'HV Feedback', group: 'HV' },
        { wireNo: '7504', name: 'HSCB_STS', itemName: 'HSCB Status', group: 'HV' },
      ];
      
      for (const tl of hvLines) {
        await getOrCreateTrainLine(drawing.id, tl.wireNo, tl.itemName, tl.group, 'DMC');
      }
    }
  }
  
  console.log('HIGH VOLTAGE system wiring seeded!');
}

async function seedAPSSystem() {
  console.log('Seeding APS system wiring...');
  
  const apsDrawings = ['942-58130', '942-58131', '942-58132'];
  
  for (const drawingNo of apsDrawings) {
    const drawing = await getDrawingByNo(drawingNo);
    if (drawing) {
      const aps = await getOrCreateConnector(drawing.id, 'APS', 'Auxiliary Power Supply', 30, 'TC', 'Underframe', 'APS');
      const batt = await getOrCreateConnector(drawing.id, 'BATT', 'Battery Connector', 20, 'TC', 'Underframe', 'APS');
      
      const apsLines = [
        { wireNo: '415A', name: 'AC_415V_A', itemName: '415V AC Phase A', group: 'AUX' },
        { wireNo: '415B', name: 'AC_415V_B', itemName: '415V AC Phase B', group: 'AUX' },
        { wireNo: '415C', name: 'AC_415V_C', itemName: '415V AC Phase C', group: 'AUX' },
        { wireNo: '230A', name: 'AC_230V_A', itemName: '230V AC Phase A', group: 'AUX' },
        { wireNo: '230B', name: 'AC_230V_B', itemName: '230V AC Phase B', group: 'AUX' },
        { wireNo: '110P', name: 'DC_110V_P', itemName: '110V DC Positive', group: 'AUX' },
        { wireNo: '110N', name: 'DC_110V_N', itemName: '110V DC Negative', group: 'AUX' },
      ];
      
      for (const tl of apsLines) {
        await getOrCreateTrainLine(drawing.id, tl.wireNo, tl.itemName, tl.group, 'TC');
      }
    }
  }
  
  console.log('APS system wiring seeded!');
}

async function seedLightingSystem() {
  console.log('Seeding LIGHTING system wiring...');
  
  const lightDrawings = ['942-58112', '942-58113', '942-58114', '942-58115', '942-58116'];
  
  for (const drawingNo of lightDrawings) {
    const drawing = await getDrawingByNo(drawingNo);
    if (drawing) {
      const light = await getOrCreateConnector(drawing.id, 'LIGHT', 'Lighting Connector', 15, 'ALL', 'Ceiling', 'LIGHT');
      
      const lightLines = [
        { wireNo: '9001', name: 'SAL_LT_1', itemName: 'Saloon Light 1', group: 'LIGHT' },
        { wireNo: '9002', name: 'SAL_LT_2', itemName: 'Saloon Light 2', group: 'LIGHT' },
        { wireNo: '9003', name: 'SAL_LT_3', itemName: 'Saloon Light 3', group: 'LIGHT' },
        { wireNo: '9004', name: 'CAB_LT', itemName: 'Cab Light', group: 'LIGHT' },
        { wireNo: '9005', name: 'HEAD_LT', itemName: 'Head Light', group: 'LIGHT' },
        { wireNo: '9006', name: 'TAIL_LT', itemName: 'Tail Light', group: 'LIGHT' },
        { wireNo: '9007', name: 'EMERG_LT', itemName: 'Emergency Light', group: 'LIGHT' },
      ];
      
      for (const tl of lightLines) {
        await getOrCreateTrainLine(drawing.id, tl.wireNo, tl.itemName, tl.group, 'ALL');
      }
    }
  }
  
  console.log('LIGHTING system wiring seeded!');
}

async function seedTCMSystem() {
  console.log('Seeding TCMS/TMS system wiring...');
  
  const tmsDrawings = ['942-58146', '942-38409', '942-38606', '942-38607', '942-38612'];
  
  for (const drawingNo of tmsDrawings) {
    const drawing = await getDrawingByNo(drawingNo);
    if (drawing) {
      const rio = await getOrCreateConnector(drawing.id, 'RIO', 'Remote IO Connector', 40, 'ALL', 'Ceiling', 'TCMS');
      const cn1 = await getOrCreateConnector(drawing.id, 'CN1', 'Communication Node 1', 20, 'MC', 'Ceiling', 'TCMS');
      const cn2 = await getOrCreateConnector(drawing.id, 'CN2', 'Communication Node 2', 20, 'MC', 'Ceiling', 'TCMS');
      
      const tmsLines = [
        { wireNo: '9101', name: 'ETH_1', itemName: 'Ethernet Channel 1', group: 'TCMS' },
        { wireNo: '9102', name: 'ETH_2', itemName: 'Ethernet Channel 2', group: 'TCMS' },
        { wireNo: '9103', name: 'MVB', itemName: 'MVB Bus', group: 'TCMS' },
        { wireNo: '9104', name: 'WTB', itemName: 'WTB Train Bus', group: 'TCMS' },
        { wireNo: '9105', name: 'CCU_STS', itemName: 'CCU Status', group: 'TCMS' },
        { wireNo: '9106', name: 'RIO_DATA', itemName: 'RIO Data', group: 'TCMS' },
      ];
      
      for (const tl of tmsLines) {
        await getOrCreateTrainLine(drawing.id, tl.wireNo, tl.itemName, tl.group, 'ALL');
      }
    }
  }
  
  console.log('TCMS/TMS system wiring seeded!');
}

async function seedCommSystem() {
  console.log('Seeding COMMUNICATION system wiring...');
  
  const commDrawings = ['942-58147', '942-58148', '942-58149', '942-58150', '942-58151', '942-58152', '942-58153', '942-58154'];
  
  for (const drawingNo of commDrawings) {
    const drawing = await getDrawingByNo(drawingNo);
    if (drawing) {
      const pa = await getOrCreateConnector(drawing.id, 'PA', 'PA Amplifier', 15, 'ALL', 'Ceiling', 'COMM');
      const cctv = await getOrCreateConnector(drawing.id, 'CCTV', 'CCTV Connector', 20, 'ALL', 'Ceiling', 'COMM');
      const pis = await getOrCreateConnector(drawing.id, 'PIS', 'PIS Connector', 10, 'ALL', 'Ceiling', 'COMM');
      
      const commLines = [
        { wireNo: '9201', name: 'PA_AUD', itemName: 'PA Audio', group: 'COMM' },
        { wireNo: '9202', name: 'PA_MIC', itemName: 'PA Microphone', group: 'COMM' },
        { wireNo: '9203', name: 'CCTV_VID', itemName: 'CCTV Video', group: 'COMM' },
        { wireNo: '9204', name: 'CCTV_PWR', itemName: 'CCTV Power', group: 'COMM' },
        { wireNo: '9205', name: 'PIS_DATA', itemName: 'PIS Data', group: 'COMM' },
        { wireNo: '9206', name: 'RADIO', itemName: 'Radio Communication', group: 'COMM' },
      ];
      
      for (const tl of commLines) {
        await getOrCreateTrainLine(drawing.id, tl.wireNo, tl.itemName, tl.group, 'ALL');
      }
    }
  }
  
  console.log('COMMUNICATION system wiring seeded!');
}

async function seedVACSystem() {
  console.log('Seeding HVAC/VAC system wiring...');
  
  const vacDrawings = ['942-58143', '942-58144', '942-58145'];
  
  for (const drawingNo of vacDrawings) {
    const drawing = await getDrawingByNo(drawingNo);
    if (drawing) {
      const vac = await getOrCreateConnector(drawing.id, 'VAC', 'VAC Connector', 25, 'ALL', 'Roof/Ceiling', 'HVAC');
      
      const vacLines = [
        { wireNo: '9301', name: 'VAC_ON', itemName: 'VAC On Command', group: 'HVAC' },
        { wireNo: '9302', name: 'VAC_OFF', itemName: 'VAC Off Command', group: 'HVAC' },
        { wireNo: '9303', name: 'VAC_FAN', itemName: 'VAC Fan Speed', group: 'HVAC' },
        { wireNo: '9304', name: 'VAC_TEMP', itemName: 'Temperature Sensor', group: 'HVAC' },
        { wireNo: '9305', name: 'VAC_STS', itemName: 'VAC Status', group: 'HVAC' },
        { wireNo: '9306', name: 'VAC_FAULT', itemName: 'VAC Fault', group: 'HVAC' },
      ];
      
      for (const tl of vacLines) {
        await getOrCreateTrainLine(drawing.id, tl.wireNo, tl.itemName, tl.group, 'ALL');
      }
    }
  }
  
  console.log('HVAC/VAC system wiring seeded!');
}

async function seedCabSystem() {
  console.log('Seeding CAB system wiring...');
  
  const cabDrawings = ['942-58107', '942-58108', '942-58109', '942-58110', '942-58111'];
  
  for (const drawingNo of cabDrawings) {
    const drawing = await getDrawingByNo(drawingNo);
    if (drawing) {
      const op = await getOrCreateConnector(drawing.id, 'OP', 'Operating Panel', 40, 'CAB', 'Cab Desk', 'CAB');
      const mcb = await getOrCreateConnector(drawing.id, 'MCB', 'MCB Panel', 30, 'CAB', 'Cab', 'CAB');
      
      const cabLines = [
        { wireNo: '9401', name: 'CAB_ACT', itemName: 'Cab Active', group: 'CAB' },
        { wireNo: '9402', name: 'CAB_SEL', itemName: 'Cab Selection', group: 'CAB' },
        { wireNo: '9403', name: 'Horn', itemName: 'Horn Command', group: 'CAB' },
        { wireNo: '9404', name: 'WIPER', itemName: 'Wiper Control', group: 'CAB' },
        { wireNo: '9405', name: 'HEADLIGHT', itemName: 'Headlight Control', group: 'CAB' },
        { wireNo: '9406', name: 'IND_LT', itemName: 'Indicator Light', group: 'CAB' },
      ];
      
      for (const tl of cabLines) {
        await getOrCreateTrainLine(drawing.id, tl.wireNo, tl.itemName, tl.group, 'CAB');
      }
    }
  }
  
  console.log('CAB system wiring seeded!');
}

async function seedCouplingSystem() {
  console.log('Seeding COUPLING system wiring...');
  
  const drawing = await getDrawingByNo('942-58117');
  if (drawing) {
    const coupl = await getOrCreateConnector(drawing.id, 'COUP', 'Coupling Connector', 30, 'ALL', 'Front/Bogies', 'COUPLING');
    
    const couplLines = [
      { wireNo: '9501', name: 'COUP_REQ', itemName: 'Coupling Request', group: 'COUPLING' },
      { wireNo: '9502', name: 'COUP_ACK', itemName: 'Coupling Acknowledge', group: 'COUPLING' },
      { wireNo: '9503', name: 'COUP_DONE', itemName: 'Coupling Complete', group: 'COUPLING' },
      { wireNo: '9504', name: 'UNCOUP', itemName: 'Uncoupling Command', group: 'COUPLING' },
      { wireNo: '9505', name: 'JUMPER', itemName: 'Jumper Connection Status', group: 'COUPLING' },
    ];
    
    for (const tl of couplLines) {
      await getOrCreateTrainLine(drawing.id, tl.wireNo, tl.itemName, tl.group, 'ALL');
    }
  }
  
  console.log('COUPLING system wiring seeded!');
}

async function seedPinAssignmentDrawings() {
  console.log('Seeding Pin Assignment drawings...');
  
  // LTEB drawings
  const ltebDrawings = ['942-38305', '942-38505', '942-38705'];
  for (const drawingNo of ltebDrawings) {
    const drawing = await getDrawingByNo(drawingNo);
    if (drawing) {
      const lteb = await getOrCreateConnector(drawing.id, 'LTEB', 'Low Tension Equipment Box', 50, drawingNo.includes('383') ? 'DMC' : drawingNo.includes('385') ? 'TC' : 'MC', 'Underframe', 'POWER');
      
      for (let i = 1; i <= 50; i++) {
        await getOrCreatePin(lteb.id, String(i));
      }
    }
  }
  
  // LTJB drawings
  const ltjbDrawings = ['942-38312', '942-38506', '942-38507'];
  for (const drawingNo of ltjbDrawings) {
    const drawing = await getDrawingByNo(drawingNo);
    if (drawing) {
      const ltjb = await getOrCreateConnector(drawing.id, 'LTJB', 'Low Tension Junction Box', 30, drawingNo.includes('383') ? 'DMC' : 'TC', 'Underframe', 'POWER');
      
      for (let i = 1; i <= 30; i++) {
        await getOrCreatePin(ltjb.id, String(i));
      }
    }
  }
  
  // VVVF drawings
  const vvvfDrawings = ['942-38306', '942-38706'];
  for (const drawingNo of vvvfDrawings) {
    const drawing = await getDrawingByNo(drawingNo);
    if (drawing) {
      const vvbf = await getOrCreateConnector(drawing.id, 'VVVF', 'VVVF Inverter Connector', 40, drawingNo.includes('383') ? 'DMC' : 'MC', 'Underframe', 'TRACTION');
      
      for (let i = 1; i <= 40; i++) {
        await getOrCreatePin(vvbf.id, String(i));
      }
    }
  }
  
  // BCU drawings
  const bcuDrawings = ['942-38310', '942-38519', '942-38710'];
  for (const drawingNo of bcuDrawings) {
    const drawing = await getDrawingByNo(drawingNo);
    if (drawing) {
      const bcu = await getOrCreateConnector(drawing.id, 'BCU', 'Brake Control Unit', 30, drawingNo.includes('383') ? 'DMC' : drawingNo.includes('385') ? 'TC' : 'MC', 'Underframe', 'BRAKE');
      
      for (let i = 1; i <= 30; i++) {
        await getOrCreatePin(bcu.id, String(i));
      }
    }
  }
  
  // EDB drawings
  const edbDrawings = ['942-38402', '942-38610'];
  for (const drawingNo of edbDrawings) {
    const drawing = await getDrawingByNo(drawingNo);
    if (drawing) {
      const edb = await getOrCreateConnector(drawing.id, 'EDB', 'Electrical Distribution Box', 40, drawingNo.includes('384') ? 'TC' : 'MC', 'Ceiling', 'POWER');
      
      for (let i = 1; i <= 40; i++) {
        await getOrCreatePin(edb.id, String(i));
      }
    }
  }
  
  console.log('Pin Assignment drawings seeded!');
}

async function main() {
  console.log('Starting comprehensive wiring seed...');
  
  try {
    await seedGeneralSystem();
    await seedTrainLineSystem();
    await seedBrakeSystem();
    await seedDoorSystem();
    await seedTractionSystem();
    await seedHVSystem();
    await seedAPSSystem();
    await seedLightingSystem();
    await seedTCMSystem();
    await seedCommSystem();
    await seedVACSystem();
    await seedCabSystem();
    await seedCouplingSystem();
    await seedPinAssignmentDrawings();
    
    console.log('\\n=== Wiring Seed Complete ===');
    
    // Print summary
    const connectors = await prisma.connector.count();
    const trainLines = await prisma.trainLine.count();
    const wires = await prisma.wire.count();
    const crossRules = await prisma.crossConnectionRule.count();
    
    console.log('Connectors:', connectors);
    console.log('TrainLines:', trainLines);
    console.log('Wires:', wires);
    console.log('CrossConnectionRules:', crossRules);
    
  } catch (error) {
    console.error('Error seeding wiring:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();