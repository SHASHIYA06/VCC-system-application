import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

const SYSTEMS = [
  { name: 'General', code: 'GEN', description: 'General documentation and standards' },
  { name: 'Train Line', code: 'TRL', description: 'Trainline control and signal wiring' },
  { name: 'Traction', code: 'TRAC', description: 'Traction system and VVVF control' },
  { name: 'High Voltage', code: 'HV', description: 'High voltage distribution' },
  { name: 'Low Tension Equipment Box', code: 'LTEB', description: 'Low tension power distribution' },
  { name: 'Low Tension Junction Box', code: 'LTJB', description: 'Junction boxes for low voltage' },
  { name: 'Auxiliary Power Supply', code: 'APS', description: 'Auxiliary power and battery' },
  { name: 'Brake System', code: 'BRAKE', description: 'Brake control and air supply' },
  { name: 'Door System', code: 'DOOR', description: 'Passenger door control' },
  { name: 'Ventilation AC', code: 'VAC', description: 'HVAC systems' },
  { name: 'Cab Equipment', code: 'CAB', description: 'Driver cab equipment' },
  { name: 'Lighting', code: 'LIGHT', description: 'Interior and exterior lighting' },
  { name: 'Communication', code: 'COMMS', description: 'PIS, PA, CCTV, Radio' },
  { name: 'Coupling', code: 'COUPL', description: 'Car coupling and inter-car' },
  { name: 'TCMS', code: 'TMS', description: 'Train Control Management System' },
  { name: 'Electrical Distribution Box', code: 'EDB', description: 'Electrical distribution' },
  { name: 'Display', code: 'DISPLAY', description: 'Passenger information display' },
  { name: 'PIS', code: 'PIS', description: 'Passenger Information System' },
];

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

const DRAWINGS = [
  { drawingNo: '942-58099', title: 'Drawing List - KMRCL RS3R VCC', carType: 'DMC', subsystem: 'GEN' },
  { drawingNo: '942-58100', title: 'Classification', carType: 'DMC', subsystem: 'GEN' },
  { drawingNo: '942-58101', title: 'Wiring Numbers and Description', carType: 'DMC', subsystem: 'GEN' },
  { drawingNo: '942-58102', title: 'Symbols', carType: 'DMC', subsystem: 'GEN' },
  { drawingNo: '942-58103', title: 'Train Lines Control', carType: 'DMC', subsystem: 'TRL' },
  { drawingNo: '942-58104', title: 'Train Lines Signal', carType: 'DMC', subsystem: 'TRL' },
  { drawingNo: '942-58105', title: 'Low Tension Power Train Line', carType: 'DMC', subsystem: 'TRL' },
  { drawingNo: '942-58106', title: 'High Tension Power Train Line', carType: 'DMC', subsystem: 'TRL' },
  { drawingNo: '942-58107', title: 'Controlling Cab', carType: 'DMC', subsystem: 'CAB' },
  { drawingNo: '942-58108', title: 'Start-up Relay', carType: 'DMC', subsystem: 'CAB' },
  { drawingNo: '942-58109', title: 'System Status Indication', carType: 'DMC', subsystem: 'CAB' },
  { drawingNo: '942-58110', title: 'MCB Trip Status', carType: 'DMC', subsystem: 'CAB' },
  { drawingNo: '942-58111', title: 'DC Train Line Supply Contactor', carType: 'DMC', subsystem: 'CAB' },
  { drawingNo: '942-58112', title: 'Head Cab Main Light', carType: 'DMC', subsystem: 'LIGHT' },
  { drawingNo: '942-58113', title: 'Tail Light/Door Open Console Light', carType: 'DMC', subsystem: 'LIGHT' },
  { drawingNo: '942-58114', title: 'Interior Light', carType: 'DMC', subsystem: 'LIGHT' },
  { drawingNo: '942-58115', title: 'Wiper Control', carType: 'DMC', subsystem: 'LIGHT' },
  { drawingNo: '942-58117', title: 'Coupling and Uncoupling Control', carType: 'DMC', subsystem: 'COUPL' },
  { drawingNo: '942-58119', title: 'Speed Control', carType: 'DMC', subsystem: 'TRAC' },
  { drawingNo: '942-58120', title: 'VVVF Control', carType: 'DMC', subsystem: 'TRAC' },
  { drawingNo: '942-58121', title: 'Traction Return Current', carType: 'DMC', subsystem: 'TRAC' },
  { drawingNo: '942-58123', title: 'Compressor Control', carType: 'DMC', subsystem: 'BRAKE' },
  { drawingNo: '942-58124', title: 'Brake Loop', carType: 'DMC', subsystem: 'BRAKE' },
  { drawingNo: '942-58125', title: 'Emergency Brake', carType: 'DMC', subsystem: 'BRAKE' },
  { drawingNo: '942-58126', title: 'Parking Brake', carType: 'DMC', subsystem: 'BRAKE' },
  { drawingNo: '942-58127', title: 'Horn', carType: 'DMC', subsystem: 'BRAKE' },
  { drawingNo: '942-58128', title: 'Brake Control - DMC/MC', carType: 'DMC', subsystem: 'BRAKE' },
  { drawingNo: '942-58129', title: 'Brake Control - TC', carType: 'TC', subsystem: 'BRAKE' },
  { drawingNo: '942-58130', title: 'APS - Auxiliary Power Supply', carType: 'TC', subsystem: 'APS' },
  { drawingNo: '942-58131', title: 'AC 415V Shore Supply', carType: 'TC', subsystem: 'APS' },
  { drawingNo: '942-58132', title: 'Battery Control', carType: 'TC', subsystem: 'APS' },
  { drawingNo: '942-58137', title: 'Saloon Door Supply Voltage', carType: 'MC', subsystem: 'DOOR' },
  { drawingNo: '942-58138', title: 'Left Door Operation', carType: 'MC', subsystem: 'DOOR' },
  { drawingNo: '942-58139', title: 'Right Door Operation', carType: 'MC', subsystem: 'DOOR' },
  { drawingNo: '942-58140', title: 'Door Proving Loop', carType: 'MC', subsystem: 'DOOR' },
  { drawingNo: '942-58141', title: 'Local Door Interlock', carType: 'MC', subsystem: 'DOOR' },
  { drawingNo: '942-58142', title: 'Door Communication with TMS', carType: 'MC', subsystem: 'DOOR' },
  { drawingNo: '942-58143', title: 'Cab VAC - Air Conditioning', carType: 'CAB', subsystem: 'VAC' },
  { drawingNo: '942-58144', title: 'Saloon VAC Power', carType: 'MC', subsystem: 'VAC' },
  { drawingNo: '942-58145', title: 'Saloon VAC Control', carType: 'MC', subsystem: 'VAC' },
  { drawingNo: '942-58146', title: 'TMS Interface 1 to 4', carType: 'MC', subsystem: 'TMS' },
  { drawingNo: '942-58147', title: 'PIS/TIS - Passenger Information System', carType: 'MC', subsystem: 'COMMS' },
  { drawingNo: '942-58148', title: 'PIS/TIS - Passenger Information System Sheet 2', carType: 'MC', subsystem: 'COMMS' },
  { drawingNo: '942-58149', title: 'DVAS/PA - Digital Voice Announcement System', carType: 'MC', subsystem: 'COMMS' },
  { drawingNo: '942-58150', title: 'PA Amplifier', carType: 'MC', subsystem: 'COMMS' },
  { drawingNo: '942-58151', title: 'PA Amplifier Sheet 2', carType: 'MC', subsystem: 'COMMS' },
  { drawingNo: '942-58152', title: 'CBTC - Communication Based Train Control', carType: 'MC', subsystem: 'COMMS' },
  { drawingNo: '942-58153', title: 'Train Radio Interface', carType: 'MC', subsystem: 'COMMS' },
  { drawingNo: '942-58154', title: 'CCTV - Closed Circuit Television', carType: 'MC', subsystem: 'COMMS' },
  { drawingNo: '942-38104', title: 'Operating Panel Pin Assignment', carType: 'CAB', subsystem: 'CAB' },
  { drawingNo: '942-38105', title: 'MCB Panel Pin Assignment', carType: 'CAB', subsystem: 'CAB' },
  { drawingNo: '942-38117', title: 'Cab VAC Pin Assignment', carType: 'CAB', subsystem: 'VAC' },
  { drawingNo: '942-38305', title: 'LTEB Pin Assignment - DMC', carType: 'DMC', subsystem: 'LTEB' },
  { drawingNo: '942-38306', title: 'VVVF Inverter Pin Assignment - DMC', carType: 'DMC', subsystem: 'TRAC' },
  { drawingNo: '942-38307', title: 'Collector Shoe Junction Box Pin Assignment - DMC', carType: 'DMC', subsystem: 'HV' },
  { drawingNo: '942-38308', title: 'Stinger Box Pin Assignment - DMC', carType: 'DMC', subsystem: 'HV' },
  { drawingNo: '942-38309', title: 'Pressure Switch Box Pin Assignment - DMC', carType: 'DMC', subsystem: 'BRAKE' },
  { drawingNo: '942-38310', title: 'BCU Pin Assignment - DM Car', carType: 'DMC', subsystem: 'BRAKE' },
  { drawingNo: '942-38311', title: 'ASCOS EPIC SR Pin Assignment - DMC', carType: 'DMC', subsystem: 'BRAKE' },
  { drawingNo: '942-38312', title: 'LTJB Pin Assignment - DM Car', carType: 'DMC', subsystem: 'LTJB' },
  { drawingNo: '942-38313', title: 'Filter Reactor Pin Assignment - DMC', carType: 'DMC', subsystem: 'TRAC' },
  { drawingNo: '942-38314', title: 'Speed Sensor Connector Pin Assignment - DM Car', carType: 'DMC', subsystem: 'TRAC' },
  { drawingNo: '942-38315', title: 'Brake Resistor Pin Assignment - DMC', carType: 'DMC', subsystem: 'TRAC' },
  { drawingNo: '942-38316', title: 'Main Switch Box Pin Assignment - DMC', carType: 'DMC', subsystem: 'HV' },
  { drawingNo: '942-38317', title: 'Current Collector Fuse Box Pin Assignment - DMC', carType: 'DMC', subsystem: 'HV' },
  { drawingNo: '942-38319', title: 'HSCB Pin Assignment - DMC', carType: 'DMC', subsystem: 'HV' },
  { drawingNo: '942-38320', title: 'TM Connector Pin Assignment - DMC', carType: 'DMC', subsystem: 'TRAC' },
  { drawingNo: '942-38321', title: 'Earth Brush Pin Assignment - DMC', carType: 'DMC', subsystem: 'HV' },
  { drawingNo: '942-38322', title: 'Anti Skid Valve Auto Coupler Pin Assignment - DMC', carType: 'DMC', subsystem: 'BRAKE' },
  { drawingNo: '942-38323', title: 'HTEB HTJB Pin Assignment - DMC', carType: 'DMC', subsystem: 'HV' },
  { drawingNo: '942-38402', title: 'EDB Panel Pin Assignment - TC', carType: 'TC', subsystem: 'EDB' },
  { drawingNo: '942-38403', title: 'Passenger Door Pin Assignment - TC', carType: 'TC', subsystem: 'DOOR' },
  { drawingNo: '942-38404', title: 'Saloon Lights Pin Assignment - TC', carType: 'TC', subsystem: 'LIGHT' },
  { drawingNo: '942-38405', title: 'AAU Passenger Emergency Alarm TFT Speaker Pin Assignment - TC', carType: 'TC', subsystem: 'COMMS' },
  { drawingNo: '942-38406', title: 'Ethernet Switch CCTV Camera Pin Assignment - TC', carType: 'TC', subsystem: 'COMMS' },
  { drawingNo: '942-38407', title: 'Saloon VAC Pin Assignment - TC', carType: 'TC', subsystem: 'VAC' },
  { drawingNo: '942-38409', title: 'TCMS RIO Pin Assignment - TC', carType: 'TC', subsystem: 'TMS' },
  { drawingNo: '942-38411', title: 'Socket Outlet Pin Assignment - TC', carType: 'TC', subsystem: 'APS' },
  { drawingNo: '942-38413', title: 'Door Inside Outside Indicator Pin Assignment - TC', carType: 'TC', subsystem: 'DOOR' },
  { drawingNo: '942-38505', title: 'LTEB Pin Assignment - T Car', carType: 'TC', subsystem: 'LTEB' },
  { drawingNo: '942-38506', title: 'LTJB1 Pin Assignment - T Car', carType: 'TC', subsystem: 'LTJB' },
  { drawingNo: '942-38507', title: 'LTJB2 Pin Assignment - T Car', carType: 'TC', subsystem: 'LTJB' },
  { drawingNo: '942-38508', title: 'Pressure Switch Box Pin Assignment - T Car', carType: 'TC', subsystem: 'BRAKE' },
  { drawingNo: '942-38509', title: 'EPIC SR ASCO Pin Assignment - T Car', carType: 'TC', subsystem: 'BRAKE' },
  { drawingNo: '942-38510', title: 'Compressor Motor ADU Pin Assignment - T Car', carType: 'TC', subsystem: 'BRAKE' },
  { drawingNo: '942-38512', title: 'APS Pin Assignment - T Car', carType: 'TC', subsystem: 'APS' },
  { drawingNo: '942-38514', title: 'Shore Supply Box Pin Assignment - T Car', carType: 'TC', subsystem: 'APS' },
  { drawingNo: '942-38515', title: 'ESK Box Pin Assignment - T Car', carType: 'TC', subsystem: 'HV' },
  { drawingNo: '942-38516', title: 'Battery Box Pin Assignment - T Car', carType: 'TC', subsystem: 'APS' },
  { drawingNo: '942-38518', title: 'Pressure Governor Box Pin Assignment - T Car', carType: 'TC', subsystem: 'BRAKE' },
  { drawingNo: '942-38519', title: 'BCU Pin Assignment - T Car', carType: 'TC', subsystem: 'BRAKE' },
  { drawingNo: '942-38520', title: 'Anti Skid Valve FAEMV Earth Brush Pin Assignment - T Car', carType: 'TC', subsystem: 'BRAKE' },
  { drawingNo: '942-38521', title: 'HTEB HTJB Pin Assignment - T Car', carType: 'TC', subsystem: 'HV' },
  { drawingNo: '942-38602', title: 'Saloon VAC Pin Assignment - M Car', carType: 'MC', subsystem: 'VAC' },
  { drawingNo: '942-38603', title: 'Passenger Door Pin Assignment - M Car', carType: 'MC', subsystem: 'DOOR' },
  { drawingNo: '942-38604', title: 'Saloon Lights Pin Assignment - M Car', carType: 'MC', subsystem: 'LIGHT' },
  { drawingNo: '942-38605', title: 'BECU Pin Assignment - M Car', carType: 'MC', subsystem: 'BRAKE' },
  { drawingNo: '942-38606', title: 'TCMS Remote IO Pin Assignment - M Car', carType: 'MC', subsystem: 'TMS' },
  { drawingNo: '942-38607', title: 'TCMS Terminal Block Pin Assignment - M Car', carType: 'MC', subsystem: 'TMS' },
  { drawingNo: '942-38608', title: 'CCTV Camera Ethernet Switch Pin Assignment - M Car', carType: 'MC', subsystem: 'COMMS' },
  { drawingNo: '942-38609', title: 'AAU Pin Assignment - M Car', carType: 'MC', subsystem: 'COMMS' },
  { drawingNo: '942-38610', title: 'EDB Panel Pin Assignment - M Car', carType: 'MC', subsystem: 'EDB' },
  { drawingNo: '942-38611', title: 'Socket Outlet BIC PBMV Pin Assignment - M Car', carType: 'MC', subsystem: 'DOOR' },
  { drawingNo: '942-38612', title: 'TCMS Communication Node-1 Pin Assignment - M Car', carType: 'MC', subsystem: 'TMS' },
  { drawingNo: '942-38614', title: 'Door Inside Outside Indicator Pin Assignment - M Car', carType: 'MC', subsystem: 'DOOR' },
  { drawingNo: '942-38705', title: 'LTEB Pin Assignment - MC Underframe', carType: 'MC', subsystem: 'LTEB' },
  { drawingNo: '942-38706', title: 'VVVF Inverter Pin Assignment - MC Underframe', carType: 'MC', subsystem: 'TRAC' },
  { drawingNo: '942-38707', title: 'CSJB Pin Assignment - MC Underframe', carType: 'MC', subsystem: 'HV' },
  { drawingNo: '942-38709', title: 'Pressure Switch Box Pin Assignment - MC Underframe', carType: 'MC', subsystem: 'BRAKE' },
  { drawingNo: '942-38710', title: 'BCU Pin Assignment - MC Underframe', carType: 'MC', subsystem: 'BRAKE' },
  { drawingNo: '942-38711', title: 'ASCO EPIC SR Pin Assignment - MC Underframe', carType: 'MC', subsystem: 'BRAKE' },
  { drawingNo: '942-38342', title: 'TCMS RIO CN11 Pin Assignment', carType: 'MC', subsystem: 'TMS' },
  { drawingNo: '942-38343', title: 'TCMS RIO CN12 Pin Assignment', carType: 'MC', subsystem: 'TMS' },
  { drawingNo: '942-38344', title: 'TCMS RIO CN15 Pin Assignment', carType: 'MC', subsystem: 'TMS' },
  { drawingNo: '942-38345', title: 'TCMS RIO CN17 Pin Assignment', carType: 'MC', subsystem: 'TMS' },
  { drawingNo: '942-38431', title: 'CCTV Ethernet Switch Port Assignment', carType: 'MC', subsystem: 'COMMS' },
  { drawingNo: '942-38432', title: 'CCTV Camera Pin Assignment', carType: 'MC', subsystem: 'COMMS' },
  { drawingNo: '942-38433', title: 'CCTV System Interconnect', carType: 'MC', subsystem: 'COMMS' },
  { drawingNo: '942-38531', title: 'AAU PEAU Pin Assignment', carType: 'MC', subsystem: 'COMMS' },
  { drawingNo: '942-38532', title: 'PEAU to TCMS Connection', carType: 'MC', subsystem: 'COMMS' },
  { drawingNo: '942-38533', title: 'AAU System Overview', carType: 'MC', subsystem: 'COMMS' },
  { drawingNo: '942-38631', title: 'TFT Display Pin Assignment', carType: 'MC', subsystem: 'DISPLAY' },
  { drawingNo: '942-38632', title: 'TFT to TCMS Communication', carType: 'MC', subsystem: 'DISPLAY' },
  { drawingNo: '942-38633', title: 'PIS System Overview', carType: 'MC', subsystem: 'PIS' },
  { drawingNo: '942-58131', title: 'Trainlines DMC (DMC CAR)', carType: 'DMC', subsystem: 'TRL' },
  { drawingNo: '942-58132', title: 'Trainlines TC (TC CAR)', carType: 'TC', subsystem: 'TRL' },
  { drawingNo: '942-58133', title: 'Trainlines MC (MC CAR)', carType: 'MC', subsystem: 'TRL' },
  { drawingNo: '942-58134', title: 'Wire Termination DMC', carType: 'DMC', subsystem: 'TMS' },
  { drawingNo: '942-58135', title: 'Wire Termination TC', carType: 'TC', subsystem: 'TMS' },
  { drawingNo: '942-58136', title: 'Wire Termination MC', carType: 'MC', subsystem: 'TMS' },
];

const CONNECTORS = [
  { equipmentCode: 'LTEB1', connectorCode: 'CN1', connectorType: 'MULTI_MODULE', pinCount: 74 },
  { equipmentCode: 'LTEB1', connectorCode: 'CN2', connectorType: 'MULTI_MODULE', pinCount: 74 },
  { equipmentCode: 'LTEB1', connectorCode: 'CN3', connectorType: 'POWER_CONNECTOR', pinCount: 11 },
  { equipmentCode: 'LTEB1', connectorCode: 'CN4', connectorType: 'JUMPER_CONNECTOR', pinCount: 74 },
  { equipmentCode: 'V1', connectorCode: 'CN1', connectorType: 'POWER_CONNECTOR', pinCount: 3 },
  { equipmentCode: 'V1', connectorCode: 'X1', connectorType: 'CONTROL_CONNECTOR', pinCount: 50 },
  { equipmentCode: 'V1', connectorCode: 'PE', connectorType: 'EARTH_CONNECTOR', pinCount: 1 },
  { equipmentCode: 'CSJB1', connectorCode: 'JCN1', connectorType: 'POWER_CONNECTOR', pinCount: 2 },
  { equipmentCode: 'CSJB1', connectorCode: 'JCN2', connectorType: 'POWER_CONNECTOR', pinCount: 2 },
  { equipmentCode: 'PSB1', connectorCode: 'PSB_CN1', connectorType: 'M12', pinCount: 4 },
  { equipmentCode: 'BCU1', connectorCode: 'BCU_X1', connectorType: 'MULTI_MODULE', pinCount: 37 },
  { equipmentCode: 'BCU1', connectorCode: 'BCU_X2', connectorType: 'MULTI_MODULE', pinCount: 23 },
  { equipmentCode: 'BCU1', connectorCode: 'BCU_PE', connectorType: 'EARTH_CONNECTOR', pinCount: 1 },
  { equipmentCode: 'LTJB1', connectorCode: 'X1', connectorType: 'MULTI_MODULE', pinCount: 74 },
  { equipmentCode: 'LTJB1', connectorCode: 'X2', connectorType: 'MULTI_MODULE', pinCount: 74 },
  { equipmentCode: 'LTJB1', connectorCode: 'X3', connectorType: 'MULTI_MODULE', pinCount: 11 },
  { equipmentCode: 'LTJB1', connectorCode: 'X4', connectorType: 'MULTI_MODULE', pinCount: 3 },
  { equipmentCode: 'LTJB1', connectorCode: 'X5', connectorType: 'MULTI_MODULE', pinCount: 20 },
  { equipmentCode: 'ETH_SW1', connectorCode: 'PORT1', connectorType: 'M12', pinCount: 4 },
  { equipmentCode: 'ETH_SW1', connectorCode: 'PORT2', connectorType: 'M12', pinCount: 4 },
  { equipmentCode: 'ETH_SW1', connectorCode: 'PORT3', connectorType: 'M12', pinCount: 4 },
  { equipmentCode: 'ETH_SW1', connectorCode: 'PORT4', connectorType: 'M12', pinCount: 4 },
  { equipmentCode: 'ETH_SW1', connectorCode: 'PORT5', connectorType: 'M12', pinCount: 4 },
  { equipmentCode: 'ETH_SW1', connectorCode: 'PORT6', connectorType: 'M12', pinCount: 4 },
  { equipmentCode: 'ETH_SW1', connectorCode: 'PORT7', connectorType: 'RJ45', pinCount: 8 },
  { equipmentCode: 'ETH_SW1', connectorCode: 'POWER', connectorType: 'MLC', pinCount: 4 },
  { equipmentCode: 'TCMS_RIO1', connectorCode: 'CN1', connectorType: 'REMOTE_IO', pinCount: 40 },
  { equipmentCode: 'TCMS_RIO1', connectorCode: 'CN2', connectorType: 'REMOTE_IO', pinCount: 40 },
  { equipmentCode: 'TCMS_RIO1', connectorCode: 'CN11', connectorType: 'REMOTE_IO', pinCount: 40 },
  { equipmentCode: 'TCMS_RIO1', connectorCode: 'CN13', connectorType: 'REMOTE_IO', pinCount: 40 },
  { equipmentCode: 'TCMS_RIO1', connectorCode: 'CN3', connectorType: 'REMOTE_IO', pinCount: 4 },
  { equipmentCode: 'TCMS_RIO1', connectorCode: 'CN5', connectorType: 'REMOTE_IO', pinCount: 4 },
  { equipmentCode: 'TCMS_RIO1', connectorCode: 'CN7', connectorType: 'REMOTE_IO', pinCount: 4 },
  { equipmentCode: 'TCMS_RIO1', connectorCode: 'CN15', connectorType: 'REMOTE_IO', pinCount: 26 },
  { equipmentCode: 'TCMS_RIO1', connectorCode: 'CN17', connectorType: 'REMOTE_IO', pinCount: 26 },
  { equipmentCode: 'TCMS_RIO1', connectorCode: 'X1', connectorType: 'TERMINAL', pinCount: 50 },
  { equipmentCode: 'TCMS_RIO1', connectorCode: 'X4', connectorType: 'TERMINAL', pinCount: 20 },
  { equipmentCode: 'TCMS_RIO2', connectorCode: 'CN1', connectorType: 'REMOTE_IO', pinCount: 40 },
  { equipmentCode: 'TCMS_RIO2', connectorCode: 'CN2', connectorType: 'REMOTE_IO', pinCount: 40 },
  { equipmentCode: 'TCMS_RIO2', connectorCode: 'CN11', connectorType: 'REMOTE_IO', pinCount: 40 },
  { equipmentCode: 'TCMS_RIO2', connectorCode: 'CN12', connectorType: 'REMOTE_IO', pinCount: 40 },
  { equipmentCode: 'APS1', connectorCode: 'CN1', connectorType: 'POWER_CONNECTOR', pinCount: 37 },
  { equipmentCode: 'APS1', connectorCode: 'CN2', connectorType: 'CONTROL_CONNECTOR', pinCount: 20 },
  { equipmentCode: 'APS1', connectorCode: 'CN3', connectorType: 'CONTROL_CONNECTOR', pinCount: 8 },
  { equipmentCode: 'APS1', connectorCode: 'CN4', connectorType: 'POWER_CONNECTOR', pinCount: 3 },
  { equipmentCode: 'SSB1', connectorCode: 'CN1', connectorType: 'POWER_CONNECTOR', pinCount: 4 },
  { equipmentCode: 'SSB1', connectorCode: 'CN2', connectorType: 'CONTROL_CONNECTOR', pinCount: 10 },
  { equipmentCode: 'BATT1', connectorCode: 'CN1', connectorType: 'POWER_CONNECTOR', pinCount: 2 },
  { equipmentCode: 'BATT1', connectorCode: 'CN2', connectorType: 'CONTROL_CONNECTOR', pinCount: 6 },
  { equipmentCode: 'VAC1', connectorCode: 'VAC1X01', connectorType: 'POWER_CONNECTOR', pinCount: 5 },
  { equipmentCode: 'VAC1', connectorCode: 'VAC1X02', connectorType: 'CONTROL_CONNECTOR', pinCount: 12 },
  { equipmentCode: 'VAC1', connectorCode: 'VAC1X03', connectorType: 'CONTROL_CONNECTOR', pinCount: 10 },
  { equipmentCode: 'DCU1', connectorCode: 'X1', connectorType: 'POWER_CONNECTOR', pinCount: 5 },
  { equipmentCode: 'DCU1', connectorCode: 'X2', connectorType: 'CONTROL_CONNECTOR', pinCount: 12 },
  { equipmentCode: 'DCU1', connectorCode: 'X3', connectorType: 'CONTROL_CONNECTOR', pinCount: 10 },
  { equipmentCode: 'AAU1', connectorCode: 'CN1', connectorType: 'MULTIPIN', pinCount: 20 },
  { equipmentCode: 'PEAU_R1', connectorCode: 'CN1', connectorType: 'MULTIPIN', pinCount: 10 },
  { equipmentCode: 'TFT_R1', connectorCode: 'CN1', connectorType: 'DISPLAY', pinCount: 15 },
  { equipmentCode: 'BECU1', connectorCode: 'CN1', connectorType: 'MULTIPIN', pinCount: 25 },
  { equipmentCode: 'TCMS_CN1', connectorCode: 'CN1', connectorType: 'COMMUNICATION', pinCount: 8 },
  { equipmentCode: 'TCMS_CN2', connectorCode: 'CN1', connectorType: 'COMMUNICATION', pinCount: 8 },
];

async function seed() {
  console.log('Starting comprehensive seed...');

  console.log('Seeding systems...');
  for (const sys of SYSTEMS) {
    await prisma.system.upsert({
      where: { name: sys.name },
      update: { code: sys.code, description: sys.description },
      create: { name: sys.name, code: sys.code, description: sys.description },
    });
  }

  console.log('Seeding drawings...');
  for (const d of DRAWINGS) {
    const existing = await prisma.drawingDocument.findFirst({ where: { drawingNo: d.drawingNo } });
    if (existing) {
      await prisma.drawingDocument.update({ where: { id: existing.id }, data: d });
    } else {
      await prisma.drawingDocument.create({ data: d });
    }
  }

  console.log('Seeding equipment...');
  const systems = await prisma.system.findMany();
  const systemMap = new Map(systems.map(s => [s.code, s]));

  for (const eq of EQUIPMENT) {
    const system = systemMap.get(eq.systemCode);
    if (!system) continue;
    
    const existing = await prisma.deviceInstance.findFirst({ where: { tag: eq.code } });
    if (existing) {
      await prisma.deviceInstance.update({ where: { id: existing.id }, data: { carType: eq.carType, location: eq.location } });
    } else {
      await prisma.deviceInstance.create({ data: { tag: eq.code, name: eq.name, carType: eq.carType, location: eq.location, systemId: system.id } });
    }
  }

  console.log('Seeding connectors...');
  const devices = await prisma.deviceInstance.findMany();
  const deviceMap = new Map(devices.map(d => [d.tag, d]));

  for (const c of CONNECTORS) {
    const device = deviceMap.get(c.equipmentCode);
    if (!device) continue;

    const existing = await prisma.connector.findFirst({
      where: { deviceId: device.id, connectorCode: c.connectorCode }
    });

    if (existing) {
      await prisma.connector.update({
        where: { id: existing.id },
        data: { connectorType: c.connectorType },
      });
    } else {
      await prisma.connector.create({
        data: {
          deviceId: device.id,
          connectorCode: c.connectorCode,
          connectorType: c.connectorType,
          normCode: c.connectorCode.toUpperCase(),
        },
      });
    }
  }

  console.log('Seeding wires (trainlines)...');
  const wireTypes = ['single', 'paired', 'shielded', 'twisted'];
  const colors = ['RED', 'BLUE', 'WHITE', 'BLACK', 'YELLOW', 'GREEN', 'ORANGE', 'BROWN'];

  for (let i = 3001; i <= 3999; i++) {
    await prisma.wire.upsert({
      where: { wireNo: String(i) },
      update: {},
      create: { wireNo: String(i), wireType: wireTypes[i % 4], wireColor: colors[i % 8], voltageClass: '24V', cableSpec: '0.75sqmm' },
    });
  }

  for (let i = 4001; i <= 4999; i++) {
    await prisma.wire.upsert({
      where: { wireNo: String(i) },
      update: {},
      create: { wireNo: String(i), wireType: wireTypes[i % 4], wireColor: colors[i % 8], voltageClass: '110V', cableSpec: '1.5sqmm' },
    });
  }

  for (let i = 6001; i <= 6999; i++) {
    await prisma.wire.upsert({
      where: { wireNo: String(i) },
      update: {},
      create: { wireNo: String(i), wireType: wireTypes[i % 4], wireColor: colors[i % 8], voltageClass: '24V', cableSpec: '0.75sqmm' },
    });
  }

  for (let i = 7001; i <= 7999; i++) {
    await prisma.wire.upsert({
      where: { wireNo: String(i) },
      update: {},
      create: { wireNo: String(i), wireType: wireTypes[i % 4], wireColor: colors[i % 8], voltageClass: i < 7500 ? '110V' : '24V', cableSpec: i < 7500 ? '1.5sqmm' : '0.75sqmm' },
    });
  }

  console.log('Seed completed!');

  const [systemCount, deviceCount, connectorCount, wireCount, drawingCount] = await Promise.all([
    prisma.system.count(),
    prisma.deviceInstance.count(),
    prisma.connector.count(),
    prisma.wire.count(),
    prisma.drawingDocument.count(),
  ]);

  console.log(`\nDatabase Summary:
  - Systems: ${systemCount}
  - Equipment: ${deviceCount}
  - Connectors: ${connectorCount}
  - Wires: ${wireCount}
  - Drawings: ${drawingCount}`);

  await prisma.$disconnect();
}

seed().catch(console.error);