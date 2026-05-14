import { prisma } from '@/lib/prisma';

export async function seedComplete() {
  console.log('Starting comprehensive VCC seed...');

  const project = await prisma.project.findFirst() || await prisma.project.create({
    data: { projectCode: 'KMRCL_RS3R', projectName: 'KMRCL RS3R Metro', description: 'Kochi Metro Rail Corporation RS3R Vehicles' }
  });

  const SYSTEMS = [
    { code: 'GEN', name: 'General', description: 'General documentation and standards', category: 'DOCUMENTATION', sortOrder: 1 },
    { code: 'TRL', name: 'Train Line', description: 'Trainline control and signal wiring', category: 'CONTROL', sortOrder: 2 },
    { code: 'TRAC', name: 'Traction', description: 'Traction system and VVVF control', category: 'POWER', sortOrder: 3 },
    { code: 'HV', name: 'High Voltage', description: 'High voltage distribution', category: 'POWER', sortOrder: 4 },
    { code: 'LTEB', name: 'Low Tension Equipment Box', description: 'Low tension power distribution', category: 'POWER', sortOrder: 5 },
    { code: 'LTJB', name: 'Low Tension Junction Box', description: 'Junction boxes for low voltage', category: 'POWER', sortOrder: 6 },
    { code: 'APS', name: 'Auxiliary Power Supply', description: 'Auxiliary power and battery', category: 'POWER', sortOrder: 7 },
    { code: 'BRAKE', name: 'Brake System', description: 'Brake control and air supply', category: 'CONTROL', sortOrder: 8 },
    { code: 'DOOR', name: 'Door System', description: 'Passenger door control', category: 'CONTROL', sortOrder: 9 },
    { code: 'VAC', name: 'Ventilation AC', description: 'HVAC systems', category: 'ENVIRONMENT', sortOrder: 10 },
    { code: 'CAB', name: 'Cab Equipment', description: 'Driver cab equipment', category: 'CONTROL', sortOrder: 11 },
    { code: 'LIGHT', name: 'Lighting', description: 'Interior and exterior lighting', category: 'ELECTRICAL', sortOrder: 12 },
    { code: 'COMMS', name: 'Communication', description: 'PIS, PA, CCTV, Radio', category: 'COMMUNICATION', sortOrder: 13 },
    { code: 'COUPL', name: 'Coupling', description: 'Car coupling and inter-car', category: 'MECHANICAL', sortOrder: 14 },
    { code: 'TMS', name: 'TCMS', description: 'Train Control Management System', category: 'CONTROL', sortOrder: 15 },
    { code: 'EDB', name: 'Electrical Distribution Box', description: 'Electrical distribution', category: 'POWER', sortOrder: 16 },
    { code: 'DISPLAY', name: 'Display', description: 'Passenger information display', category: 'COMMUNICATION', sortOrder: 17 },
    { code: 'PIS', name: 'PIS', description: 'Passenger Information System', category: 'COMMUNICATION', sortOrder: 18 },
    { code: 'BOGIE', name: 'Bogie', description: 'Bogie and wheel set monitoring', category: 'MECHANICAL', sortOrder: 19 },
  ];

  for (const sys of SYSTEMS) {
    await prisma.system.upsert({ where: { code: sys.code }, update: sys, create: sys });
  }
  console.log(`Seeded ${SYSTEMS.length} systems`);

  const systemMap = new Map((await prisma.system.findMany()).map(s => [s.code, s]));

  const DRAWINGS = [
    { drawingNo: '942-58099', title: 'Drawing List - KMRCL RS3R VCC', subsystem: 'GEN', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-58100', title: 'Classification', subsystem: 'GEN', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-58101', title: 'Wiring Numbers and Description', subsystem: 'GEN', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-58102', title: 'Symbols', subsystem: 'GEN', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-58103', title: 'Train Lines Control', subsystem: 'TRL', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58104', title: 'Train Lines Signal', subsystem: 'TRL', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58105', title: 'Low Tension Power Train Line', subsystem: 'TRL', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-58106', title: 'High Tension Power Train Line', subsystem: 'TRL', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-58107', title: 'Controlling Cab', subsystem: 'CAB', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58108', title: 'Start-up Relay', subsystem: 'CAB', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-58109', title: 'System Status Indication', subsystem: 'CAB', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58110', title: 'MCB Trip Status', subsystem: 'CAB', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-58111', title: 'DC Train Line Supply Contactor', subsystem: 'CAB', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-58112', title: 'Head Cab Main Light', subsystem: 'LIGHT', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-58113', title: 'Tail Light/Door Open Console Light', subsystem: 'LIGHT', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-58114', title: 'Interior Light', subsystem: 'LIGHT', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58115', title: 'Wiper Control', subsystem: 'LIGHT', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-58117', title: 'Coupling and Uncoupling Control', subsystem: 'COUPL', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58119', title: 'Speed Control', subsystem: 'TRAC', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58120', title: 'VVVF Control', subsystem: 'TRAC', totalSheets: 3, revision: 'A' },
    { drawingNo: '942-58121', title: 'Traction Return Current', subsystem: 'TRAC', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-58123', title: 'Compressor Control', subsystem: 'BRAKE', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58124', title: 'Brake Loop', subsystem: 'BRAKE', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58125', title: 'Emergency Brake', subsystem: 'BRAKE', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58126', title: 'Parking Brake', subsystem: 'BRAKE', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58127', title: 'Horn', subsystem: 'BRAKE', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-58128', title: 'Brake Control - DMC/MC', subsystem: 'BRAKE', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58129', title: 'Brake Control - TC', subsystem: 'BRAKE', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58130', title: 'APS - Auxiliary Power Supply', subsystem: 'APS', totalSheets: 3, revision: 'A' },
    { drawingNo: '942-58131', title: 'AC 415V Shore Supply', subsystem: 'APS', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58132', title: 'Battery Control', subsystem: 'APS', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58137', title: 'Saloon Door Supply Voltage', subsystem: 'DOOR', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-58138', title: 'Left Door Operation', subsystem: 'DOOR', totalSheets: 4, revision: 'A' },
    { drawingNo: '942-58139', title: 'Right Door Operation', subsystem: 'DOOR', totalSheets: 4, revision: 'A' },
    { drawingNo: '942-58140', title: 'Door Proving Loop', subsystem: 'DOOR', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58141', title: 'Local Door Interlock', subsystem: 'DOOR', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58142', title: 'Door Communication with TMS', subsystem: 'DOOR', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58143', title: 'Cab VAC - Air Conditioning', subsystem: 'VAC', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58144', title: 'Saloon VAC Power', subsystem: 'VAC', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58145', title: 'Saloon VAC Control', subsystem: 'VAC', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58146', title: 'TMS Interface 1 to 4', subsystem: 'TMS', totalSheets: 4, revision: 'A' },
    { drawingNo: '942-58147', title: 'PIS/TIS - Passenger Information System', subsystem: 'COMMS', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58148', title: 'PIS/TIS - Passenger Information System Sheet 2', subsystem: 'COMMS', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58149', title: 'DVAS/PA - Digital Voice Announcement System', subsystem: 'COMMS', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58150', title: 'PA Amplifier', subsystem: 'COMMS', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58151', title: 'PA Amplifier Sheet 2', subsystem: 'COMMS', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58152', title: 'CBTC - Communication Based Train Control', subsystem: 'COMMS', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58153', title: 'Train Radio Interface', subsystem: 'COMMS', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58154', title: 'CCTV - Closed Circuit Television', subsystem: 'COMMS', totalSheets: 3, revision: 'A' },
    { drawingNo: '942-38104', title: 'Operating Panel Pin Assignment', subsystem: 'CAB', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38105', title: 'MCB Panel Pin Assignment', subsystem: 'CAB', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38117', title: 'Cab VAC Pin Assignment', subsystem: 'VAC', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38305', title: 'LTEB Pin Assignment - DMC', subsystem: 'LTEB', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38306', title: 'VVVF Inverter Pin Assignment - DMC', subsystem: 'TRAC', totalSheets: 3, revision: 'A' },
    { drawingNo: '942-38307', title: 'Collector Shoe Junction Box Pin Assignment - DMC', subsystem: 'HV', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38308', title: 'Stinger Box Pin Assignment - DMC', subsystem: 'HV', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38309', title: 'Pressure Switch Box Pin Assignment - DMC', subsystem: 'BRAKE', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38310', title: 'BCU Pin Assignment - DM Car', subsystem: 'BRAKE', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38311', title: 'ASCOS EPIC SR Pin Assignment - DMC', subsystem: 'BRAKE', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38312', title: 'LTJB Pin Assignment - DM Car', subsystem: 'LTJB', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38313', title: 'Filter Reactor Pin Assignment - DMC', subsystem: 'TRAC', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38314', title: 'Speed Sensor Connector Pin Assignment - DM Car', subsystem: 'TRAC', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38315', title: 'Brake Resistor Pin Assignment - DMC', subsystem: 'TRAC', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38316', title: 'Main Switch Box Pin Assignment - DMC', subsystem: 'HV', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38317', title: 'Current Collector Fuse Box Pin Assignment - DMC', subsystem: 'HV', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38319', title: 'HSCB Pin Assignment - DMC', subsystem: 'HV', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38320', title: 'TM Connector Pin Assignment - DMC', subsystem: 'TRAC', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38321', title: 'Earth Brush Pin Assignment - DMC', subsystem: 'HV', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38322', title: 'Anti Skid Valve Auto Coupler Pin Assignment - DMC', subsystem: 'BRAKE', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38323', title: 'HTEB HTJB Pin Assignment - DMC', subsystem: 'HV', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38402', title: 'EDB Panel Pin Assignment - TC', subsystem: 'EDB', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38403', title: 'Passenger Door Pin Assignment - TC', subsystem: 'DOOR', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38404', title: 'Saloon Lights Pin Assignment - TC', subsystem: 'LIGHT', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38405', title: 'AAU Passenger Emergency Alarm TFT Speaker Pin Assignment - TC', subsystem: 'COMMS', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38406', title: 'Ethernet Switch CCTV Camera Pin Assignment - TC', subsystem: 'COMMS', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38407', title: 'Saloon VAC Pin Assignment - TC', subsystem: 'VAC', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38409', title: 'TCMS RIO Pin Assignment - TC', subsystem: 'TMS', totalSheets: 4, revision: 'A' },
    { drawingNo: '942-38411', title: 'Socket Outlet Pin Assignment - TC', subsystem: 'APS', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38413', title: 'Door Inside Outside Indicator Pin Assignment - TC', subsystem: 'DOOR', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38505', title: 'LTEB Pin Assignment - T Car', subsystem: 'LTEB', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38506', title: 'LTJB1 Pin Assignment - T Car', subsystem: 'LTJB', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38507', title: 'LTJB2 Pin Assignment - T Car', subsystem: 'LTJB', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38508', title: 'Pressure Switch Box Pin Assignment - T Car', subsystem: 'BRAKE', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38509', title: 'EPIC SR ASCO Pin Assignment - T Car', subsystem: 'BRAKE', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38510', title: 'Compressor Motor ADU Pin Assignment - T Car', subsystem: 'BRAKE', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38512', title: 'APS Pin Assignment - T Car', subsystem: 'APS', totalSheets: 3, revision: 'A' },
    { drawingNo: '942-38514', title: 'Shore Supply Box Pin Assignment - T Car', subsystem: 'APS', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38515', title: 'ESK Box Pin Assignment - T Car', subsystem: 'HV', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38516', title: 'Battery Box Pin Assignment - T Car', subsystem: 'APS', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38518', title: 'Pressure Governor Box Pin Assignment - T Car', subsystem: 'BRAKE', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38519', title: 'BCU Pin Assignment - T Car', subsystem: 'BRAKE', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38520', title: 'Anti Skid Valve FAEMV Earth Brush Pin Assignment - T Car', subsystem: 'BRAKE', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38521', title: 'HTEB HTJB Pin Assignment - T Car', subsystem: 'HV', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38602', title: 'Saloon VAC Pin Assignment - M Car', subsystem: 'VAC', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38603', title: 'Passenger Door Pin Assignment - M Car', subsystem: 'DOOR', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38604', title: 'Saloon Lights Pin Assignment - M Car', subsystem: 'LIGHT', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38605', title: 'BECU Pin Assignment - M Car', subsystem: 'BRAKE', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38606', title: 'TCMS Remote IO Pin Assignment - M Car', subsystem: 'TMS', totalSheets: 6, revision: 'A' },
    { drawingNo: '942-38607', title: 'TCMS Terminal Block Pin Assignment - M Car', subsystem: 'TMS', totalSheets: 4, revision: 'A' },
    { drawingNo: '942-38608', title: 'CCTV Camera Ethernet Switch Pin Assignment - M Car', subsystem: 'COMMS', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38609', title: 'AAU Pin Assignment - M Car', subsystem: 'COMMS', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38610', title: 'EDB Panel Pin Assignment - M Car', subsystem: 'EDB', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38611', title: 'Socket Outlet BIC PBMV Pin Assignment - M Car', subsystem: 'DOOR', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38612', title: 'TCMS Communication Node-1 Pin Assignment - M Car', subsystem: 'TMS', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38614', title: 'Door Inside Outside Indicator Pin Assignment - M Car', subsystem: 'DOOR', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38705', title: 'LTEB Pin Assignment - MC Underframe', subsystem: 'LTEB', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38706', title: 'VVVF Inverter Pin Assignment - MC Underframe', subsystem: 'TRAC', totalSheets: 3, revision: 'A' },
    { drawingNo: '942-38707', title: 'CSJB Pin Assignment - MC Underframe', subsystem: 'HV', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38709', title: 'Pressure Switch Box Pin Assignment - MC Underframe', subsystem: 'BRAKE', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38710', title: 'BCU Pin Assignment - MC Underframe', subsystem: 'BRAKE', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38711', title: 'ASCO EPIC SR Pin Assignment - MC Underframe', subsystem: 'BRAKE', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-38342', title: 'TCMS RIO CN11 Pin Assignment', subsystem: 'TMS', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38343', title: 'TCMS RIO CN12 Pin Assignment', subsystem: 'TMS', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38344', title: 'TCMS RIO CN15 Pin Assignment', subsystem: 'TMS', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-38345', title: 'TCMS RIO CN17 Pin Assignment', subsystem: 'TMS', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58131', title: 'Trainlines DMC (DMC CAR)', subsystem: 'TRL', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-58132', title: 'Trainlines TC (TC CAR)', subsystem: 'TRL', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-58133', title: 'Trainlines MC (MC CAR)', subsystem: 'TRL', totalSheets: 1, revision: 'A' },
    { drawingNo: '942-58128', title: 'Bogie Speed Sensors', subsystem: 'BOGIE', totalSheets: 2, revision: 'A' },
    { drawingNo: '942-58129', title: 'Bogie Monitoring', subsystem: 'BOGIE', totalSheets: 2, revision: 'A' },
  ];

  for (const d of DRAWINGS) {
    const system = systemMap.get(d.subsystem);
    await prisma.drawing.upsert({
      where: { projectId_drawingNo_revision: { projectId: project.id, drawingNo: d.drawingNo, revision: d.revision } },
      update: { title: d.title, totalSheets: d.totalSheets, systemId: system?.id },
      create: { projectId: project.id, drawingNo: d.drawingNo, title: d.title, revision: d.revision, totalSheets: d.totalSheets, systemId: system?.id, remarks: `ALL|${d.subsystem}` }
    });
  }
  console.log(`Seeded ${DRAWINGS.length} drawings`);

  const EQUIPMENT = [
    { code: 'LTEB1', name: 'Low Tension Equipment Box 1', carType: 'DMC', systemCode: 'LTEB', location: 'Underframe' },
    { code: 'LTEB2', name: 'Low Tension Equipment Box 2', carType: 'TC', systemCode: 'LTEB', location: 'Underframe' },
    { code: 'LTEB3', name: 'Low Tension Equipment Box 3', carType: 'MC', systemCode: 'LTEB', location: 'Underframe' },
    { code: 'LTJB1', name: 'Low Tension Junction Box 1', carType: 'DMC', systemCode: 'LTJB', location: 'Underframe' },
    { code: 'LTJB2', name: 'Low Tension Junction Box 2', carType: 'TC', systemCode: 'LTJB', location: 'Underframe' },
    { code: 'LTJB3', name: 'Low Tension Junction Box 3', carType: 'MC', systemCode: 'LTJB', location: 'Underframe' },
    { code: 'V1', name: 'VVVF Inverter 1', carType: 'DMC', systemCode: 'TRAC', location: 'Underframe' },
    { code: 'V2', name: 'VVVF Inverter 2', carType: 'MC', systemCode: 'TRAC', location: 'Underframe' },
    { code: 'CSJB1', name: 'Collector Shoe Junction Box 1', carType: 'DMC', systemCode: 'HV', location: 'Underframe' },
    { code: 'CSJB2', name: 'Collector Shoe Junction Box 2', carType: 'TC', systemCode: 'HV', location: 'Underframe' },
    { code: 'CSJB3', name: 'Collector Shoe Junction Box 3', carType: 'MC', systemCode: 'HV', location: 'Underframe' },
    { code: 'PSB1', name: 'Pressure Switch Box 1', carType: 'DMC', systemCode: 'BRAKE', location: 'Underframe/Bogie' },
    { code: 'PSB2', name: 'Pressure Switch Box 2', carType: 'TC', systemCode: 'BRAKE', location: 'Underframe/Bogie' },
    { code: 'PSB3', name: 'Pressure Switch Box 3', carType: 'MC', systemCode: 'BRAKE', location: 'Underframe/Bogie' },
    { code: 'BCU1', name: 'Brake Control Unit 1', carType: 'DMC', systemCode: 'BRAKE', location: 'Underframe' },
    { code: 'BCU2', name: 'Brake Control Unit 2', carType: 'TC', systemCode: 'BRAKE', location: 'Underframe' },
    { code: 'BCU3', name: 'Brake Control Unit 3', carType: 'MC', systemCode: 'BRAKE', location: 'Underframe' },
    { code: 'BECU1', name: 'Brake Electronic Control Unit 1', carType: 'MC', systemCode: 'BRAKE', location: 'Underframe' },
    { code: 'EDB1', name: 'Electrical Distribution Box 1', carType: 'MC', systemCode: 'EDB', location: 'Ceiling' },
    { code: 'EDB2', name: 'Electrical Distribution Box 2', carType: 'TC', systemCode: 'EDB', location: 'Ceiling' },
    { code: 'APS1', name: 'Auxiliary Power Supply 1', carType: 'TC', systemCode: 'APS', location: 'Underframe' },
    { code: 'SSB1', name: 'Shore Supply Box 1', carType: 'TC', systemCode: 'APS', location: 'Underframe' },
    { code: 'BATT1', name: 'Battery Box 1', carType: 'TC', systemCode: 'APS', location: 'Underframe' },
    { code: 'ESK1', name: 'ESK Box 1', carType: 'TC', systemCode: 'HV', location: 'Underframe' },
    { code: 'HSCB1', name: 'High Speed Circuit Breaker 1', carType: 'DMC', systemCode: 'HV', location: 'Underframe' },
    { code: 'HSCB2', name: 'High Speed Circuit Breaker 2', carType: 'MC', systemCode: 'HV', location: 'Underframe' },
    { code: 'MSB1', name: 'Main Switch Box 1', carType: 'DMC', systemCode: 'HV', location: 'Underframe' },
    { code: 'CCFB1', name: 'Current Collector Fuse Box 1', carType: 'DMC', systemCode: 'HV', location: 'Underframe' },
    { code: 'HTEB1', name: 'High Tension Equipment Box 1', carType: 'DMC', systemCode: 'HV', location: 'Underframe' },
    { code: 'HTJB1', name: 'High Tension Junction Box 1', carType: 'DMC', systemCode: 'HV', location: 'Underframe' },
    { code: 'HTEB2', name: 'High Tension Equipment Box 2', carType: 'TC', systemCode: 'HV', location: 'Underframe' },
    { code: 'HTJB2', name: 'High Tension Junction Box 2', carType: 'TC', systemCode: 'HV', location: 'Underframe' },
    { code: 'TCMS_RIO1', name: 'TCMS Remote IO Unit 1', carType: 'MC', systemCode: 'TMS', location: 'Ceiling' },
    { code: 'TCMS_RIO2', name: 'TCMS Remote IO Unit 2', carType: 'TC', systemCode: 'TMS', location: 'Ceiling' },
    { code: 'TCMS_TB1', name: 'TCMS Terminal Block 1', carType: 'MC', systemCode: 'TMS', location: 'Ceiling' },
    { code: 'TCMS_CN1', name: 'TCMS Communication Node 1', carType: 'MC', systemCode: 'TMS', location: 'Ceiling' },
    { code: 'TCMS_CN2', name: 'TCMS Communication Node 2', carType: 'MC', systemCode: 'TMS', location: 'Ceiling' },
    { code: 'ETH_SW1', name: 'Ethernet Switch CCTV 1', carType: 'MC', systemCode: 'COMMS', location: 'Ceiling' },
    { code: 'ETH_SW2', name: 'Ethernet Switch CCTV 2', carType: 'TC', systemCode: 'COMMS', location: 'Ceiling' },
    { code: 'AAU1', name: 'Audio Alarm Unit 1', carType: 'MC', systemCode: 'COMMS', location: 'Ceiling' },
    { code: 'AAU2', name: 'Audio Alarm Unit 2', carType: 'TC', systemCode: 'COMMS', location: 'Ceiling' },
    { code: 'PEAU_R1', name: 'PEAU R1', carType: 'MC', systemCode: 'COMMS', location: 'Ceiling' },
    { code: 'PEAU_R2', name: 'PEAU R2', carType: 'MC', systemCode: 'COMMS', location: 'Ceiling' },
    { code: 'PEAU_L1', name: 'PEAU L1', carType: 'MC', systemCode: 'COMMS', location: 'Ceiling' },
    { code: 'PEAU_L2', name: 'PEAU L2', carType: 'MC', systemCode: 'COMMS', location: 'Ceiling' },
    { code: 'VAC1', name: 'Saloon VAC Unit 1', carType: 'MC', systemCode: 'VAC', location: 'Ceiling' },
    { code: 'VAC2', name: 'Saloon VAC Unit 2', carType: 'TC', systemCode: 'VAC', location: 'Ceiling' },
    { code: 'CAB_VAC1', name: 'Cab VAC Unit 1', carType: 'CAB', systemCode: 'VAC', location: 'Cab' },
    { code: 'OP_PNL1', name: 'Operating Panel 1', carType: 'CAB', systemCode: 'CAB', location: 'Cab Desk' },
    { code: 'IND_PNL1', name: 'Indicator Panel 1', carType: 'CAB', systemCode: 'CAB', location: 'Cab Desk' },
    { code: 'MCB_PNL1', name: 'MCB Panel 1', carType: 'CAB', systemCode: 'CAB', location: 'Cab' },
    { code: 'DCU1', name: 'Door Control Unit 1', carType: 'MC', systemCode: 'DOOR', location: 'Ceiling' },
    { code: 'DCU2', name: 'Door Control Unit 2', carType: 'TC', systemCode: 'DOOR', location: 'Ceiling' },
    { code: 'STINGER1', name: 'Stinger Box 1', carType: 'DMC', systemCode: 'HV', location: 'Underframe' },
    { code: 'TM1', name: 'Traction Motor Connector 1', carType: 'DMC', systemCode: 'TRAC', location: 'Underframe/Bogie' },
    { code: 'FILT_REACT1', name: 'Filter Reactor 1', carType: 'DMC', systemCode: 'TRAC', location: 'Underframe' },
    { code: 'BRAKE_RES1', name: 'Brake Resistor 1', carType: 'DMC', systemCode: 'TRAC', location: 'Underframe' },
    { code: 'COMP1', name: 'Compressor Motor 1', carType: 'TC', systemCode: 'BRAKE', location: 'Underframe' },
    { code: 'ADU1', name: 'Air Drying Unit 1', carType: 'TC', systemCode: 'BRAKE', location: 'Underframe' },
    { code: 'PBMV1', name: 'Parking Brake Magnetic Valve 1', carType: 'MC', systemCode: 'BRAKE', location: 'Underframe' },
    { code: 'BIC1', name: 'Brake Interface Controller 1', carType: 'MC', systemCode: 'BRAKE', location: 'Underframe' },
    { code: 'TFT_R1', name: 'TFT Display R1', carType: 'MC', systemCode: 'DISPLAY', location: 'Ceiling' },
    { code: 'TFT_R2', name: 'TFT Display R2', carType: 'MC', systemCode: 'DISPLAY', location: 'Ceiling' },
    { code: 'TFT_L1', name: 'TFT Display L1', carType: 'MC', systemCode: 'DISPLAY', location: 'Ceiling' },
    { code: 'TFT_L2', name: 'TFT Display L2', carType: 'MC', systemCode: 'DISPLAY', location: 'Ceiling' },
  ];

  const drawings = await prisma.drawing.findMany();
  const drawingMap = new Map(drawings.map(d => [d.drawingNo, d]));

  for (const eq of EQUIPMENT) {
    const drawing = drawingMap.get('942-58103');
    const system = systemMap.get(eq.systemCode);
    if (!drawing || !system) continue;

    const existing = await prisma.device.findFirst({ where: { tagNo: eq.code } });
    if (existing) {
      await prisma.device.update({ where: { id: existing.id }, data: { carType: eq.carType, locationTag: eq.location } });
    } else {
      await prisma.device.create({ data: { drawingId: drawing.id, systemId: system.id, tagNo: eq.code, deviceName: eq.name, carType: eq.carType, locationTag: eq.location } });
    }
  }
  console.log(`Seeded ${EQUIPMENT.length} equipment`);

  const TRAINLINES = [
    { wireNo: '3001', itemName: 'Forward', lineGroup: 'CONTROL', carType: 'ALL', note: 'Forward direction control' },
    { wireNo: '3002', itemName: 'Reverse', lineGroup: 'CONTROL', carType: 'ALL', note: 'Reverse direction control' },
    { wireNo: '3003', itemName: 'Emergency Brake', lineGroup: 'CONTROL', carType: 'ALL', note: 'Emergency brake request' },
    { wireNo: '3004', itemName: 'Service Brake', lineGroup: 'CONTROL', carType: 'ALL', note: 'Service brake request' },
    { wireNo: '3005', itemName: 'Master Controller Power', lineGroup: 'CONTROL', carType: 'ALL', note: 'Master controller enable' },
    { wireNo: '3006', itemName: 'Traction Enable', lineGroup: 'CONTROL', carType: 'ALL', note: 'Traction system enable' },
    { wireNo: '3007', itemName: 'Door Enable', lineGroup: 'CONTROL', carType: 'ALL', note: 'Door system enable' },
    { wireNo: '3008', itemName: 'Horn', lineGroup: 'CONTROL', carType: 'ALL', note: 'Horn control' },
    { wireNo: '3009', itemName: 'Headlight', lineGroup: 'CONTROL', carType: 'ALL', note: 'Headlight control' },
    { wireNo: '3010', itemName: 'Taillight', lineGroup: 'CONTROL', carType: 'ALL', note: 'Taillight control' },
    { wireNo: '3011', itemName: 'Pantograph', lineGroup: 'CONTROL', carType: 'ALL', note: 'Pantograph raise/lower' },
    { wireNo: '3012', itemName: 'Main Circuit Breaker', lineGroup: 'CONTROL', carType: 'ALL', note: 'MCB control' },
    { wireNo: '3013', itemName: 'Converter', lineGroup: 'CONTROL', carType: 'ALL', note: 'Converter enable' },
    { wireNo: '3014', itemName: 'Inverter', lineGroup: 'CONTROL', carType: 'ALL', note: 'Inverter enable' },
    { wireNo: '3015', itemName: 'Brake Control', lineGroup: 'CONTROL', carType: 'ALL', note: 'Brake control signal' },
    { wireNo: '3016', itemName: 'Speed Signal', lineGroup: 'CONTROL', carType: 'ALL', note: 'Speed measurement signal' },
    { wireNo: '3017', itemName: 'Train ID', lineGroup: 'CONTROL', carType: 'ALL', note: 'Train identification' },
    { wireNo: '3018', itemName: 'Cab Active', lineGroup: 'CONTROL', carType: 'ALL', note: 'Cab active status' },
    { wireNo: '3019', itemName: 'ATP Enable', lineGroup: 'CONTROL', carType: 'ALL', note: 'ATP system enable' },
    { wireNo: '3020', itemName: 'ATS Enable', lineGroup: 'CONTROL', carType: 'ALL', note: 'ATS system enable' },
    { wireNo: '3021', itemName: 'Door Open Left', lineGroup: 'CONTROL', carType: 'ALL', note: 'Left door open command' },
    { wireNo: '3022', itemName: 'Door Close Left', lineGroup: 'CONTROL', carType: 'ALL', note: 'Left door close command' },
    { wireNo: '3023', itemName: 'Door Open Right', lineGroup: 'CONTROL', carType: 'ALL', note: 'Right door open command' },
    { wireNo: '3024', itemName: 'Door Close Right', lineGroup: 'CONTROL', carType: 'ALL', note: 'Right door close command' },
    { wireNo: '3025', itemName: 'Door Lock Status', lineGroup: 'CONTROL', carType: 'ALL', note: 'Door locked confirmation' },
    { wireNo: '3026', itemName: 'Fire Alarm', lineGroup: 'CONTROL', carType: 'ALL', note: 'Fire detection alarm' },
    { wireNo: '3027', itemName: 'TCMS Data', lineGroup: 'CONTROL', carType: 'ALL', note: 'TCMS communication data' },
    { wireNo: '3030', itemName: 'Battery Voltage', lineGroup: 'CONTROL', carType: 'ALL', note: 'Battery voltage monitoring' },
    { wireNo: '3031', itemName: 'Charger Status', lineGroup: 'CONTROL', carType: 'ALL', note: 'Battery charger status' },
    { wireNo: '3032', itemName: 'Emergency Stop', lineGroup: 'CONTROL', carType: 'ALL', note: 'Emergency stop signal' },
    { wireNo: '3033', itemName: 'Panto Up Status', lineGroup: 'CONTROL', carType: 'ALL', note: 'Pantograph up status' },
    { wireNo: '3034', itemName: 'Panto Down Status', lineGroup: 'CONTROL', carType: 'ALL', note: 'Pantograph down status' },
    { wireNo: '3035', itemName: 'MCB Closed', lineGroup: 'CONTROL', carType: 'ALL', note: 'Main circuit breaker closed' },
    { wireNo: '3036', itemName: 'MCB Open', lineGroup: 'CONTROL', carType: 'ALL', note: 'Main circuit breaker open' },
    { wireNo: '3037', itemName: 'Converter On', lineGroup: 'CONTROL', carType: 'ALL', note: 'Converter operating' },
    { wireNo: '3038', itemName: 'Inverter On', lineGroup: 'CONTROL', carType: 'ALL', note: 'Inverter operating' },
    { wireNo: '3039', itemName: 'Brake Applied', lineGroup: 'CONTROL', carType: 'ALL', note: 'Brake applied status' },
    { wireNo: '3040', itemName: 'Brake Released', lineGroup: 'CONTROL', carType: 'ALL', note: 'Brake released status' },
    { wireNo: '4021', itemName: 'CCTV ETH 1', lineGroup: 'CONTROL', carType: 'TC', note: 'CCTV Ethernet 1' },
    { wireNo: '4022', itemName: 'CCTV ETH 2', lineGroup: 'CONTROL', carType: 'TC', note: 'CCTV Ethernet 2' },
    { wireNo: '4024', itemName: 'AAU Audio In', lineGroup: 'CONTROL', carType: 'TC', note: 'AAU audio input' },
    { wireNo: '4062', itemName: 'PEAU Signal', lineGroup: 'CONTROL', carType: 'TC', note: 'PEAU signal' },
    { wireNo: '4103', itemName: 'TFT ETH 1', lineGroup: 'CONTROL', carType: 'TC', note: 'TFT Ethernet 1' },
    { wireNo: '4122', itemName: 'TCMS Comm 1', lineGroup: 'CONTROL', carType: 'TC', note: 'TCMS communication 1' },
    { wireNo: '6009', itemName: 'Door Open CMD', lineGroup: 'CONTROL', carType: 'MC', note: 'Door open command' },
    { wireNo: '6014', itemName: 'Door Close CMD', lineGroup: 'CONTROL', carType: 'MC', note: 'Door close command' },
    { wireNo: '6046', itemName: 'Door Open FB', lineGroup: 'CONTROL', carType: 'MC', note: 'Door open feedback' },
    { wireNo: '6051', itemName: 'Door Close FB', lineGroup: 'CONTROL', carType: 'MC', note: 'Door close feedback' },
    { wireNo: '6112', itemName: 'TCMS TB Signal', lineGroup: 'CONTROL', carType: 'MC', note: 'TCMS terminal block signal' },
    { wireNo: '5000', itemName: 'Shore Supply', lineGroup: 'CONTROL', carType: 'TC', note: 'Shore supply control' },
    { wireNo: '5030', itemName: 'SIV Contact 1', lineGroup: 'CONTROL', carType: 'TC', note: 'SIV contactor 1' },
    { wireNo: '5031', itemName: 'SIV Contact 2', lineGroup: 'CONTROL', carType: 'TC', note: 'SIV contactor 2' },
    { wireNo: '5064', itemName: 'Bat Under Volt', lineGroup: 'CONTROL', carType: 'TC', note: 'Battery under voltage' },
  ];

  for (const tl of TRAINLINES) {
    const drawing = drawingMap.get('942-58103');
    if (!drawing) continue;

    const existing = await prisma.trainLine.findFirst({ where: { wireNo: tl.wireNo } });
    if (existing) {
      await prisma.trainLine.update({ where: { id: existing.id }, data: { itemName: tl.itemName, lineGroup: tl.lineGroup, carType: tl.carType, note: tl.note } });
    } else {
      await prisma.trainLine.create({ data: { drawingId: drawing.id, wireNo: tl.wireNo, itemName: tl.itemName, lineGroup: tl.lineGroup, carType: tl.carType, note: tl.note } });
    }
  }
  console.log(`Seeded ${TRAINLINES.length} trainlines`);

  const WIRE_TYPES = ['single', 'paired', 'shielded', 'twisted'];
  const COLORS = ['RED', 'BLUE', 'WHITE', 'BLACK', 'YELLOW', 'GREEN', 'ORANGE', 'BROWN'];

  const WIRE_RANGES = [
    { start: 3001, end: 3999, voltageClass: '24V', cableSpec: '0.75sqmm' },
    { start: 4001, end: 4999, voltageClass: '110V', cableSpec: '1.5sqmm' },
    { start: 6001, end: 6999, voltageClass: '24V', cableSpec: '0.75sqmm' },
    { start: 7001, end: 7999, voltageClass: '110V', cableSpec: '1.5sqmm' },
  ];

  let wireCount = 0;
  for (const range of WIRE_RANGES) {
    for (let i = range.start; i <= range.end; i++) {
      const wireNo = String(i);
      await prisma.wire.upsert({
        where: { wireNo },
        update: {},
        create: {
          wireNo,
          wireColor: COLORS[i % 8],
          voltageClass: range.voltageClass,
          cableSpec: range.cableSpec,
          wireSize: range.voltageClass === '110V' ? '1.5 sqmm' : '0.75 sqmm',
          signalName: `Signal ${wireNo}`,
          description: `Trainline wire ${wireNo}`,
        }
      });
      wireCount++;
    }
  }
  console.log(`Seeded ${wireCount} wires`);

  const summary = {
    systems: await prisma.system.count(),
    drawings: await prisma.drawing.count(),
    devices: await prisma.device.count(),
    trainlines: await prisma.trainLine.count(),
    wires: await prisma.wire.count(),
    connectors: await prisma.connector.count(),
  };

  console.log('\nDatabase Summary:', summary);
  return { seeded: true, ...summary };
}