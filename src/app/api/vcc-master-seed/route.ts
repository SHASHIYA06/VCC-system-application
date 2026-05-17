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
  { code: 'BOGIE', name: 'Bogie Equipment', category: 'Running Gear', description: 'Bogie monitoring, wheel seat', sortOrder: 16 },
];

const VCC_SCHEMATIC_DRAWINGS = [
  { drawingNo: '942-58099', title: 'Drawing List - KMRCL RS3R VCC', sheets: 1, system: 'GEN' },
  { drawingNo: '942-58100', title: 'Classification', sheets: 1, system: 'GEN' },
  { drawingNo: '942-58101', title: 'Wiring Numbers and Description', sheets: 1, system: 'GEN' },
  { drawingNo: '942-58102', title: 'Symbols', sheets: 1, system: 'GEN' },
  { drawingNo: '942-58103', title: 'Train Lines Control (1/4)', sheets: 4, system: 'TRL' },
  { drawingNo: '942-58104', title: 'Train Lines Signal', sheets: 1, system: 'TRL' },
  { drawingNo: '942-58105', title: 'Low Tension Power Train Line', sheets: 1, system: 'TRL' },
  { drawingNo: '942-58106', title: 'High Tension Power Train Line', sheets: 1, system: 'TRL' },
  { drawingNo: '942-58107', title: 'Controlling Cab', sheets: 1, system: 'CAB' },
  { drawingNo: '942-58108', title: 'Start-up Relay', sheets: 1, system: 'CAB' },
  { drawingNo: '942-58109', title: 'System Status Indication', sheets: 1, system: 'CAB' },
  { drawingNo: '942-58110', title: 'MCB Trip Status', sheets: 1, system: 'CAB' },
  { drawingNo: '942-58111', title: 'DC Train Line Supply Contactor', sheets: 1, system: 'CAB' },
  { drawingNo: '942-58112', title: 'Head Cab Main Light', sheets: 1, system: 'LIGHT' },
  { drawingNo: '942-58113', title: 'Tail/Flasher/Console Light', sheets: 1, system: 'LIGHT' },
  { drawingNo: '942-58114', title: 'Interior Light', sheets: 1, system: 'LIGHT' },
  { drawingNo: '942-58115', title: 'Wiper Control', sheets: 1, system: 'LIGHT' },
  { drawingNo: '942-58116', title: 'Cab Light', sheets: 1, system: 'LIGHT' },
  { drawingNo: '942-58119', title: 'Speed Control', sheets: 1, system: 'TRAC' },
  { drawingNo: '942-58120', title: 'VVVF Control', sheets: 1, system: 'TRAC' },
  { drawingNo: '942-58121', title: 'Traction Return Current', sheets: 1, system: 'TRAC' },
  { drawingNo: '942-58123', title: 'Compressor Control', sheets: 1, system: 'BRAKE' },
  { drawingNo: '942-58124', title: 'Brake Loop', sheets: 1, system: 'BRAKE' },
  { drawingNo: '942-58125', title: 'Emergency Brake', sheets: 1, system: 'BRAKE' },
  { drawingNo: '942-58126', title: 'Parking Brake', sheets: 1, system: 'BRAKE' },
  { drawingNo: '942-58127', title: 'Horn', sheets: 1, system: 'BRAKE' },
  { drawingNo: '942-58128', title: 'Brake Control - DMC/MC', sheets: 1, system: 'BRAKE' },
  { drawingNo: '942-58129', title: 'Brake Control - TC', sheets: 1, system: 'BRAKE' },
  { drawingNo: '942-58130', title: 'APS - Auxiliary Power Supply', sheets: 1, system: 'APS' },
  { drawingNo: '942-58131', title: 'AC 415V Shore Supply', sheets: 1, system: 'APS' },
  { drawingNo: '942-58132', title: 'Battery Control', sheets: 1, system: 'APS' },
  { drawingNo: '942-58137', title: 'Saloon Door Supply Voltage', sheets: 1, system: 'DOOR' },
  { drawingNo: '942-58138', title: 'Left Door Operation', sheets: 1, system: 'DOOR' },
  { drawingNo: '942-58139', title: 'Right Door Operation', sheets: 1, system: 'DOOR' },
  { drawingNo: '942-58140', title: 'Door Proving Loop', sheets: 1, system: 'DOOR' },
  { drawingNo: '942-58141', title: 'Local Door Interlock', sheets: 1, system: 'DOOR' },
  { drawingNo: '942-58142', title: 'Door Communication with TMS', sheets: 1, system: 'DOOR' },
  { drawingNo: '942-58143', title: 'Cab VAC - Air Conditioning', sheets: 1, system: 'VAC' },
  { drawingNo: '942-58144', title: 'Saloon VAC Power', sheets: 1, system: 'VAC' },
  { drawingNo: '942-58145', title: 'Saloon VAC Control', sheets: 1, system: 'VAC' },
  { drawingNo: '942-58146', title: 'TMS Interface 1 to 4', sheets: 4, system: 'TMS' },
  { drawingNo: '942-58147', title: 'PIS/TIS - Passenger Information System', sheets: 2, system: 'COMMS' },
  { drawingNo: '942-58148', title: 'Emergency Communication', sheets: 1, system: 'COMMS' },
  { drawingNo: '942-58149', title: 'DVAS/PA - Digital Voice Announcement', sheets: 1, system: 'COMMS' },
  { drawingNo: '942-58150', title: 'PA Amplifier', sheets: 2, system: 'COMMS' },
  { drawingNo: '942-58151', title: 'Radio System', sheets: 1, system: 'COMMS' },
  { drawingNo: '942-58152', title: 'CBTC - Communication Based Train Control', sheets: 1, system: 'COMMS' },
  { drawingNo: '942-58153', title: 'Train Radio Interface', sheets: 1, system: 'COMMS' },
  { drawingNo: '942-58154', title: 'CCTV - Closed Circuit Television', sheets: 1, system: 'COMMS' },
  { drawingNo: '942-58155', title: 'Fire Detection', sheets: 1, system: 'COMMS' },
  { drawingNo: '942-58156', title: 'PAS - Public Address System', sheets: 1, system: 'COMMS' },
];

const PIN_ASSIGNMENT_DRAWINGS = [
  { drawingNo: '942-38104', title: 'Operating Panel Pin Assignment', sheets: 2, system: 'CAB', file: 'CAB_PIN DRAWINGS 2.pdf' },
  { drawingNo: '942-38105', title: 'MCB Panel Pin Assignment', sheets: 1, system: 'CAB', file: 'CAB_PIN DRAWINGS 2.pdf' },
  { drawingNo: '942-38117', title: 'Cab VAC Pin Assignment', sheets: 1, system: 'VAC', file: 'CAB_PIN DRAWINGS 2.pdf' },
  { drawingNo: '942-38305', title: 'LTEB Pin Assignment - DMC', sheets: 2, system: 'LTEB', file: 'DMC UF_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38306', title: 'VVVF Inverter Pin Assignment - DMC', sheets: 2, system: 'TRAC', file: 'DMC UF_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38307', title: 'Collector Shoe Junction Box - DMC', sheets: 1, system: 'HV', file: 'DMC UF_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38309', title: 'Pressure Switch Box - DMC', sheets: 1, system: 'BRAKE', file: 'DMC UF_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38310', title: 'BCU Pin Assignment - DM Car', sheets: 1, system: 'BRAKE', file: 'DMC_CEILING.pdf' },
  { drawingNo: '942-38312', title: 'LTJB Pin Assignment - DM Car', sheets: 3, system: 'LTJB', file: 'DMC UF_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38319', title: 'HSCB Pin Assignment - DMC', sheets: 1, system: 'HV', file: 'DMC UF_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38320', title: 'TM Connector Pin Assignment - DMC', sheets: 1, system: 'TRAC', file: 'DMC UF_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38402', title: 'EDB Panel Pin Assignment - TC', sheets: 1, system: 'EDB', file: 'TC_CEILING PIN DRAWINGS.pdf' },
  { drawingNo: '942-38403', title: 'Passenger Door Pin Assignment - TC', sheets: 1, system: 'DOOR', file: 'TC_CEILING PIN DRAWINGS.pdf' },
  { drawingNo: '942-38404', title: 'Saloon Lights Pin Assignment - TC', sheets: 1, system: 'LIGHT', file: 'TC_CEILING PIN DRAWINGS.pdf' },
  { drawingNo: '942-38405', title: 'AAU - TC', sheets: 1, system: 'COMMS', file: 'TC_CEILING PIN DRAWINGS.pdf' },
  { drawingNo: '942-38406', title: 'Ethernet Switch CCTV - TC', sheets: 1, system: 'COMMS', file: 'TC_CEILING PIN DRAWINGS.pdf' },
  { drawingNo: '942-38407', title: 'Saloon VAC Pin Assignment - TC', sheets: 1, system: 'VAC', file: 'TC_CEILING PIN DRAWINGS.pdf' },
  { drawingNo: '942-38409', title: 'TCMS RIO Pin Assignment - TC', sheets: 4, system: 'TMS', file: 'TC_CEILING PIN DRAWINGS.pdf' },
  { drawingNo: '942-38508', title: 'Pressure Switch Box - T Car', sheets: 1, system: 'BRAKE', file: 'TC _UF PIN DRAWINGS.pdf' },
  { drawingNo: '942-38512', title: 'APS Pin Assignment - T Car', sheets: 2, system: 'APS', file: 'TC _UF PIN DRAWINGS.pdf' },
  { drawingNo: '942-38514', title: 'Shore Supply Box - T Car', sheets: 1, system: 'APS', file: 'TC _UF PIN DRAWINGS.pdf' },
  { drawingNo: '942-38516', title: 'Battery Box Pin Assignment - T Car', sheets: 1, system: 'APS', file: 'TC _UF PIN DRAWINGS.pdf' },
  { drawingNo: '942-38519', title: 'BCU Pin Assignment - T Car', sheets: 1, system: 'BRAKE', file: 'TC _UF PIN DRAWINGS.pdf' },
  { drawingNo: '942-38602', title: 'Saloon VAC Pin Assignment - M Car', sheets: 1, system: 'VAC', file: 'MC_UF.pdf' },
  { drawingNo: '942-38603', title: 'Passenger Door Pin Assignment - M Car', sheets: 1, system: 'DOOR', file: 'MC_CEILING_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38604', title: 'Saloon Lights Pin Assignment - M Car', sheets: 1, system: 'LIGHT', file: 'MC_CEILING_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38605', title: 'BECU Pin Assignment - M Car', sheets: 1, system: 'BRAKE', file: 'MC_UF.pdf' },
  { drawingNo: '942-38606', title: 'TCMS RIO Pin Assignment - M Car', sheets: 4, system: 'TMS', file: 'MC_CEILING_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38607', title: 'TCMS Terminal Block - M Car', sheets: 1, system: 'TMS', file: 'MC_CEILING_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38608', title: 'CCTV Ethernet Switch - M Car', sheets: 1, system: 'COMMS', file: 'MC_CEILING_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38609', title: 'AAU Pin Assignment - M Car', sheets: 1, system: 'COMMS', file: 'MC_CEILING_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38610', title: 'EDB Panel Pin Assignment - M Car', sheets: 1, system: 'EDB', file: 'MC_CEILING_PIN DRAWINGS.pdf' },
  { drawingNo: '942-38612', title: 'TCMS Communication Node-1 - M Car', sheets: 1, system: 'TMS', file: 'MC_CEILING_PIN DRAWINGS.pdf' },
];

const TRAINLINES = [
  { wireNo: '1032', itemName: 'RESET', lineGroup: 'Control', note: 'System reset command', carType: 'ALL' },
  { wireNo: '1050', itemName: 'SHUT DOWN', lineGroup: 'Control', note: 'System shutdown', carType: 'ALL' },
  { wireNo: '1040', itemName: 'AUX ON', lineGroup: 'Control', note: 'Auxiliary power on', carType: 'ALL' },
  { wireNo: '1205', itemName: 'LINE VOLTAGE', lineGroup: 'Power', note: '750V DC line voltage', carType: 'ALL' },
  { wireNo: '1207', itemName: 'VVF FAULT', lineGroup: 'Status', note: 'VVVF fault signal', carType: 'ALL' },
  { wireNo: '1209', itemName: 'HSCB TRIP', lineGroup: 'Status', note: 'High speed circuit breaker trip', carType: 'ALL' },
  { wireNo: '1515', itemName: 'ATP', lineGroup: 'Control', note: 'Automatic train protection', carType: 'ALL' },
  { wireNo: '2043', itemName: 'SCS', lineGroup: 'Control', note: 'Stationary condition signal', carType: 'ALL' },
  { wireNo: '3003', itemName: 'FORWARD', lineGroup: 'Traction', note: 'Forward command', carType: 'ALL' },
  { wireNo: '3004', itemName: 'REVERSE', lineGroup: 'Traction', note: 'Reverse command', carType: 'ALL' },
  { wireNo: '3005', itemName: 'POWERING1', lineGroup: 'Traction', note: 'Propulsion enable 1', carType: 'ALL' },
  { wireNo: '3006', itemName: 'POWERING2', lineGroup: 'Traction', note: 'Propulsion enable 2', carType: 'ALL' },
  { wireNo: '3010', itemName: 'BRAKING', lineGroup: 'Traction', note: 'Braking command', carType: 'ALL' },
  { wireNo: '3011', itemName: 'FULL SERVICE BRAKE', lineGroup: 'Brake', note: 'Full service brake', carType: 'ALL' },
  { wireNo: '3013', itemName: 'RM', lineGroup: 'Control', note: 'Restricted mode', carType: 'ALL' },
  { wireNo: '3018', itemName: 'STANDBY', lineGroup: 'Control', note: 'Standby mode', carType: 'ALL' },
  { wireNo: '3019', itemName: 'WC', lineGroup: 'Control', note: 'Wheelspin control', carType: 'ALL' },
  { wireNo: '4024', itemName: 'BRAKE LOOP', lineGroup: 'Brake', note: 'Emergency brake loop', carType: 'ALL' },
  { wireNo: '4062', itemName: 'EM BRAKE LOOP NORMAL', lineGroup: 'Brake', note: 'EB loop normal path', carType: 'ALL' },
  { wireNo: '4103', itemName: 'EM BRAKE LOOP REDUNDANCY', lineGroup: 'Brake', note: 'EB loop redundancy', carType: 'ALL' },
  { wireNo: '4122', itemName: 'PARKING BRAKE APPLIED', lineGroup: 'Brake', note: 'Parking brake applied', carType: 'ALL' },
  { wireNo: '4153', itemName: 'PARKING BRAKE RELEASED', lineGroup: 'Brake', note: 'Parking brake released', carType: 'ALL' },
  { wireNo: '4155', itemName: 'PARKING BRAKE PRESSURE SWITCH', lineGroup: 'Brake', note: 'PB pressure feedback', carType: 'ALL' },
  { wireNo: '5000', itemName: 'SHORE SUPPLY CONTACT', lineGroup: 'Power', note: 'Shore supply contactor', carType: 'TC' },
  { wireNo: '5030', itemName: 'SIV CONTACT1', lineGroup: 'Power', note: 'Static inverter contact 1', carType: 'TC' },
  { wireNo: '5031', itemName: 'SIV CONTACT2', lineGroup: 'Power', note: 'Static inverter contact 2', carType: 'TC' },
  { wireNo: '5064', itemName: 'BATTERY UNDER-VOLTAGE', lineGroup: 'Power', note: 'Battery under-voltage', carType: 'ALL' },
  { wireNo: '6009', itemName: 'DOOR OPEN LEFT', lineGroup: 'Door', note: 'Left door open', carType: 'MC' },
  { wireNo: '6014', itemName: 'DOOR CLOSE LEFT', lineGroup: 'Door', note: 'Left door close', carType: 'MC' },
  { wireNo: '6046', itemName: 'DOOR OPEN RIGHT', lineGroup: 'Door', note: 'Right door open', carType: 'MC' },
  { wireNo: '6051', itemName: 'DOOR CLOSE RIGHT', lineGroup: 'Door', note: 'Right door close', carType: 'MC' },
  { wireNo: '6073', itemName: 'DOOR PROVING LOOP 1', lineGroup: 'Door', note: 'Door proving loop', carType: 'MC' },
  { wireNo: '6076', itemName: 'DOOR PROVING LOOP 2', lineGroup: 'Door', note: 'Door proving loop 2', carType: 'MC' },
  { wireNo: '6112', itemName: 'ZERO SPEED', lineGroup: 'Status', note: 'Zero speed signal', carType: 'ALL' },
  { wireNo: '7001', itemName: 'CAB VAC IN SSK', lineGroup: 'VAC', note: 'Cab VAC in SSK', carType: 'DMC' },
  { wireNo: '7050', itemName: 'SALOON VAC1 IN SSK', lineGroup: 'VAC', note: 'Saloon VAC 1 in SSK', carType: 'TC' },
  { wireNo: '7060', itemName: 'SALOON VAC2 IN SSK', lineGroup: 'VAC', note: 'Saloon VAC 2 in SSK', carType: 'TC' },
  { wireNo: '7070', itemName: 'SMOKE DETECTION', lineGroup: 'VAC', note: 'Smoke detection', carType: 'ALL' },
  { wireNo: '7071', itemName: 'DAMPER OPERATION', lineGroup: 'VAC', note: 'Damper operation', carType: 'ALL' },
  { wireNo: '9214', itemName: 'ATP MODE', lineGroup: 'Control', note: 'ATP mode indicator', carType: 'ALL' },
  { wireNo: '9215', itemName: 'FWD MODE', lineGroup: 'Control', note: 'Forward mode', carType: 'ALL' },
  { wireNo: '9216', itemName: 'REV MODE', lineGroup: 'Control', note: 'Reverse mode', carType: 'ALL' },
];

const CIRCUITS = [
  { circuitCode: 'C001', circuitName: 'Main Power Supply Circuit', category: 'Power' },
  { circuitCode: 'C002', circuitName: 'Emergency Power Supply', category: 'Power' },
  { circuitCode: 'C003', circuitName: 'Battery Charging Circuit', category: 'Power' },
  { circuitCode: 'C004', circuitName: 'Auxiliary Power Distribution', category: 'Power' },
  { circuitCode: 'C005', circuitName: 'AC Power Circuit', category: 'Power' },
  { circuitCode: 'C006', circuitName: 'DC Power Circuit', category: 'Power' },
  { circuitCode: 'C007', circuitName: 'VVVF Inverter Control', category: 'Traction' },
  { circuitCode: 'C008', circuitName: 'Traction Motor Circuit', category: 'Traction' },
  { circuitCode: 'C009', circuitName: 'Traction Feedback Circuit', category: 'Traction' },
  { circuitCode: 'C010', circuitName: 'Speed Sensor Circuit', category: 'Traction' },
  { circuitCode: 'C011', circuitName: 'Brake Control Circuit', category: 'Brake' },
  { circuitCode: 'C012', circuitName: 'Emergency Brake Circuit', category: 'Brake' },
  { circuitCode: 'C013', circuitName: 'Parking Brake Circuit', category: 'Brake' },
  { circuitCode: 'C014', circuitName: 'Brake Pressure Monitoring', category: 'Brake' },
  { circuitCode: 'C015', circuitName: 'Brake Fault Detection', category: 'Brake' },
  { circuitCode: 'C016', circuitName: 'Door Control Circuit - Left', category: 'Door' },
  { circuitCode: 'C017', circuitName: 'Door Control Circuit - Right', category: 'Door' },
  { circuitCode: 'C018', circuitName: 'Door Safety Circuit', category: 'Door' },
  { circuitCode: 'C019', circuitName: 'Door Interlock Circuit', category: 'Door' },
  { circuitCode: 'C020', circuitName: 'Cab HVAC Circuit', category: 'HVAC' },
  { circuitCode: 'C021', circuitName: 'Saloon HVAC Circuit', category: 'HVAC' },
  { circuitCode: 'C022', circuitName: 'HVAC Temperature Control', category: 'HVAC' },
  { circuitCode: 'C023', circuitName: 'TCMS Communication Circuit', category: 'TCMS' },
  { circuitCode: 'C024', circuitName: 'RIO Input Circuit', category: 'TCMS' },
  { circuitCode: 'C025', circuitName: 'RIO Output Circuit', category: 'TCMS' },
  { circuitCode: 'C026', circuitName: 'Train Line Signal Circuit', category: 'TrainLine' },
  { circuitCode: 'C027', circuitName: 'Train Line Power Circuit', category: 'TrainLine' },
  { circuitCode: 'C028', circuitName: 'HSCB Control Circuit', category: 'HV' },
  { circuitCode: 'C029', circuitName: 'Collector Shoe Circuit', category: 'HV' },
  { circuitCode: 'C030', circuitName: 'Pantograph Control Circuit', category: 'HV' },
];

for (let i = 31; i <= 200; i++) {
  const categories = ['Power', 'Traction', 'Brake', 'Door', 'HVAC', 'TCMS', 'TrainLine', 'HV', 'Comms', 'Lighting'];
  const category = categories[i % categories.length];
  CIRCUITS.push({
    circuitCode: `C${String(i).padStart(3, '0')}`,
    circuitName: `${category} Circuit ${i - 30}`,
    category: category
  });
}

const EQUIPMENT = [
  { code: 'LTEB1', name: 'Low Tension Equipment Box 1', carType: 'DMC', system: 'LTEB', location: 'Underframe-A' },
  { code: 'LTEB2', name: 'Low Tension Equipment Box 2', carType: 'TC', system: 'LTEB', location: 'Underframe-A' },
  { code: 'LTEB3', name: 'Low Tension Equipment Box 3', carType: 'MC', system: 'LTEB', location: 'Underframe-A' },
  { code: 'LTJB1', name: 'Low Tension Junction Box 1', carType: 'DMC', system: 'LTJB', location: 'Underframe-B' },
  { code: 'LTJB2', name: 'Low Tension Junction Box 2', carType: 'TC', system: 'LTJB', location: 'Underframe-B' },
  { code: 'LTJB3', name: 'Low Tension Junction Box 3', carType: 'MC', system: 'LTJB', location: 'Underframe-B' },
  { code: 'VVVF1', name: 'VVVF Inverter 1', carType: 'DMC', system: 'TRAC', location: 'Underframe-B' },
  { code: 'VVVF2', name: 'VVVF Inverter 2', carType: 'MC', system: 'TRAC', location: 'Underframe-B' },
  { code: 'BCU1', name: 'Brake Control Unit 1', carType: 'DMC', system: 'BRAKE', location: 'Underframe-C' },
  { code: 'BCU2', name: 'Brake Control Unit 2', carType: 'TC', system: 'BRAKE', location: 'Underframe-C' },
  { code: 'BECU1', name: 'Brake Electronic Control Unit', carType: 'MC', system: 'BRAKE', location: 'Underframe-C' },
  { code: 'EDB1', name: 'Electrical Distribution Box 1', carType: 'MC', system: 'EDB', location: 'Ceiling-A' },
  { code: 'EDB2', name: 'Electrical Distribution Box 2', carType: 'TC', system: 'EDB', location: 'Ceiling-A' },
  { code: 'APS1', name: 'Auxiliary Power Supply 1', carType: 'TC', system: 'APS', location: 'Underframe-A' },
  { code: 'SSB1', name: 'Shore Supply Box 1', carType: 'TC', system: 'APS', location: 'Underframe-A' },
  { code: 'BATT1', name: 'Battery Box 1', carType: 'TC', system: 'APS', location: 'Underframe-B' },
  { code: 'HSCB1', name: 'High Speed Circuit Breaker 1', carType: 'DMC', system: 'HV', location: 'Underframe-A' },
  { code: 'HSCB2', name: 'High Speed Circuit Breaker 2', carType: 'MC', system: 'HV', location: 'Underframe-A' },
  { code: 'TCMS_RIO1', name: 'TCMS Remote IO Unit 1', carType: 'MC', system: 'TMS', location: 'Ceiling-C' },
  { code: 'TCMS_RIO2', name: 'TCMS Remote IO Unit 2', carType: 'TC', system: 'TMS', location: 'Ceiling-C' },
  { code: 'ETH_SW1', name: 'Ethernet Switch CCTV 1', carType: 'MC', system: 'COMMS', location: 'Ceiling-B' },
  { code: 'ETH_SW2', name: 'Ethernet Switch CCTV 2', carType: 'TC', system: 'COMMS', location: 'Ceiling-B' },
  { code: 'AAU1', name: 'Audio Alarm Unit 1', carType: 'MC', system: 'COMMS', location: 'Ceiling-C' },
  { code: 'AAU2', name: 'Audio Alarm Unit 2', carType: 'TC', system: 'COMMS', location: 'Ceiling-C' },
  { code: 'VAC1', name: 'Saloon VAC Unit 1', carType: 'MC', system: 'VAC', location: 'Ceiling-C' },
  { code: 'VAC2', name: 'Saloon VAC Unit 2', carType: 'TC', system: 'VAC', location: 'Ceiling-C' },
  { code: 'CAB_PANEL', name: 'Cab Operating Panel', carType: 'DMC', system: 'CAB', location: 'Cab-Desk' },
  { code: 'MCB_PANEL', name: 'MCB Panel', carType: 'DMC', system: 'CAB', location: 'Cab-Panel' },
  { code: 'DCU1', name: 'Door Control Unit 1', carType: 'MC', system: 'DOOR', location: 'Ceiling-A' },
  { code: 'DCU2', name: 'Door Control Unit 2', carType: 'TC', system: 'DOOR', location: 'Ceiling-A' },
  { code: 'CSJB1', name: 'Collector Shoe Junction Box', carType: 'DMC', system: 'HV', location: 'Underframe-A' },
  { code: 'PIS1', name: 'Passenger Info Display 1', carType: 'MC', system: 'COMMS', location: 'Saloon' },
  { code: 'PIS2', name: 'Passenger Info Display 2', carType: 'TC', system: 'COMMS', location: 'Saloon' },
  { code: 'CCTV1', name: 'CCTV Camera 1', carType: 'MC', system: 'COMMS', location: 'Saloon' },
  { code: 'CCTV2', name: 'CCTV Camera 2', carType: 'TC', system: 'COMMS', location: 'Saloon' },
];

const WIRES: Array<{wireNo: string, signalName: string, description: string, voltageClass: string, wireSize: string, wireColor: string, sourceEquipment: string, sourceConnector: string, sourcePin: string, destEquipment: string, destConnector: string, destPin: string}> = [];

for (let i = 1000; i <= 9999; i++) {
  const systemCode = 
    (i >= 1000 && i < 2000) ? 'GEN' :
    (i >= 2000 && i < 3000) ? 'TRL' :
    (i >= 3000 && i < 4000) ? 'TRAC' :
    (i >= 4000 && i < 5000) ? 'BRAKE' :
    (i >= 5000 && i < 6000) ? 'APS' :
    (i >= 6000 && i < 7000) ? 'DOOR' :
    (i >= 7000 && i < 8000) ? 'VAC' :
    (i >= 8000 && i < 9000) ? 'LIGHT' : 'TMS';

  const sourceEq = EQUIPMENT[i % EQUIPMENT.length].code;
  const destEq = EQUIPMENT[(i + 5) % EQUIPMENT.length].code;

  WIRES.push({
    wireNo: String(i),
    signalName: `SIG-${i}`,
    description: `Wire ${i} - ${systemCode} system connection`,
    voltageClass: i < 2000 ? '110VDC' : (i < 5000 ? '750VDC' : '110VDC'),
    wireSize: ['2.5mm²', '4mm²', '6mm²', '1.5mm²'][i % 4],
    wireColor: ['RED', 'BLUE', 'GREEN', 'WHITE', 'BLACK', 'YELLOW', 'ORANGE'][i % 7],
    sourceEquipment: sourceEq,
    sourceConnector: 'CN1',
    sourcePin: String((i % 74) + 1),
    destEquipment: destEq,
    destConnector: 'CN1',
    destPin: String(((i + 10) % 74) + 1),
  });
}

export async function POST() {
  try {
    console.log('=== VCC MASTER SEED STARTING ===\n');

    let project = await prisma.project.findFirst();
    if (!project) {
      project = await prisma.project.create({
        data: { 
          projectCode: 'KMRCL_RS3R', 
          projectName: 'KMRCL RS3R Metro', 
          description: 'Kolkata Metro RS3R Vehicle Control Circuit Application' 
        }
      });
      console.log(`✓ Created project: ${project.projectName}\n`);
    }

    const carTypes = await prisma.carType.findMany();
    const carMap = new Map(carTypes.map(c => [c.code, c.id]));
    if (carMap.size === 0) {
      await prisma.carType.createMany({
        data: [
          { code: 'DMC', name: 'Driving Motor Car', description: 'DMC - Driving Motor Car with cab' },
          { code: 'TC', name: 'Trailer Car', description: 'TC - Trailer Car without traction' },
          { code: 'MC', name: 'Motor Car', description: 'MC - Motor Car without cab' },
          { code: 'ALL', name: 'All Car Types', description: 'Applies to all car types' },
        ]
      });
      const newCarTypes = await prisma.carType.findMany();
      newCarTypes.forEach(c => carMap.set(c.code, c.id));
      console.log(`✓ Created ${newCarTypes.length} car types\n`);
    }

    console.log('Step 1: Creating Systems...');
    for (const sys of SYSTEMS) {
      await prisma.system.upsert({
        where: { code: sys.code },
        update: sys,
        create: sys
      });
    }
    const systems = await prisma.system.findMany();
    const sysMap = new Map(systems.map(s => [s.code, s.id]));
    console.log(`✓ Created ${systems.length} systems\n`);

    console.log('Step 2: Creating Schematic Drawings...');
    let dwgCount = 0;
    for (const d of VCC_SCHEMATIC_DRAWINGS) {
      const sysId = sysMap.get(d.system);
      if (!sysId) continue;
      const existing = await prisma.drawing.findFirst({ where: { drawingNo: d.drawingNo } });
      if (!existing) {
        await prisma.drawing.create({
          data: {
            projectId: project.id,
            systemId: sysId,
            drawingNo: d.drawingNo,
            title: d.title,
            totalSheets: d.sheets,
            revision: 'A',
            status: 'ACTIVE',
            remarks: `${d.system}`
          }
        });
        dwgCount++;
      }
    }
    console.log(`✓ Created ${dwgCount} schematic drawings\n`);

    console.log('Step 3: Creating PIN Assignment Drawings...');
    let pinDwgCount = 0;
    for (const d of PIN_ASSIGNMENT_DRAWINGS) {
      const sysId = sysMap.get(d.system);
      if (!sysId) continue;
      const existing = await prisma.drawing.findFirst({ where: { drawingNo: d.drawingNo } });
      if (!existing) {
        await prisma.drawing.create({
          data: {
            projectId: project.id,
            systemId: sysId,
            drawingNo: d.drawingNo,
            title: d.title,
            totalSheets: d.sheets,
            revision: '0',
            status: 'ACTIVE',
            remarks: `${d.system}|${d.file}`
          }
        });
        pinDwgCount++;
      }
    }
    console.log(`✓ Created ${pinDwgCount} pin assignment drawings\n`);

    console.log('Step 4: Creating Equipment...');
    let eqCount = 0;
    for (const eq of EQUIPMENT) {
      const sysId = sysMap.get(eq.system);
      if (!sysId) continue;
      const drawing = await prisma.drawing.findFirst();
      const existing = await prisma.device.findFirst({ where: { tagNo: eq.code } });
      if (!existing && drawing) {
        await prisma.device.create({
          data: {
            drawingId: drawing.id,
            systemId: sysId,
            tagNo: eq.code,
            deviceName: eq.name,
            deviceType: 'MODULE',
            carType: eq.carType,
            locationTag: eq.location
          }
        });
        eqCount++;
      }
    }
    console.log(`✓ Created ${eqCount} equipment\n`);

    console.log('Step 5: Creating Circuits...');
    let circuitCount = 0;
    for (const c of CIRCUITS) {
      const drawing = await prisma.drawing.findFirst();
      if (drawing) {
        const existing = await prisma.circuit.findFirst({ where: { circuitCode: c.circuitCode } });
        if (!existing) {
          await prisma.circuit.create({
            data: {
              drawingId: drawing.id,
              circuitCode: c.circuitCode,
              circuitName: c.circuitName,
              category: c.category,
              voltageText: '110VDC'
            }
          });
          circuitCount++;
        }
      }
    }
    console.log(`✓ Created ${circuitCount} circuits\n`);

    console.log('Step 6: Creating Trainlines...');
    let tlCount = 0;
    for (const tl of TRAINLINES) {
      const drawing = await prisma.drawing.findFirst({ where: { systemId: sysMap.get('TRL') } });
      if (drawing) {
        const existing = await prisma.trainLine.findFirst({ where: { wireNo: tl.wireNo } });
        if (!existing) {
          await prisma.trainLine.create({
            data: {
              drawingId: drawing.id,
              wireNo: tl.wireNo,
              itemName: tl.itemName,
              lineGroup: tl.lineGroup,
              note: tl.note,
              carType: tl.carType
            }
          });
          tlCount++;
        }
      }
    }
    console.log(`✓ Created ${tlCount} trainlines\n`);

    console.log('Step 7: Creating Wires...');
    let wireCount = 0;
    for (const w of WIRES) {
      const existing = await prisma.wire.findUnique({ where: { wireNo: w.wireNo } });
      if (!existing) {
        await prisma.wire.create({ data: w });
        wireCount++;
      }
    }
    console.log(`✓ Created ${wireCount} wires\n`);

    console.log('Step 8: Creating Connectors...');
    const connectorsData = [
      { code: 'CN1', type: '74P', pins: 74, carType: 'ALL' },
      { code: 'CN2', type: '37P', pins: 37, carType: 'ALL' },
      { code: 'CN3', type: '11P', pins: 11, carType: 'ALL' },
      { code: 'X1', type: 'TERMINAL', pins: 20, carType: 'ALL' },
      { code: 'X2', type: 'TERMINAL', pins: 20, carType: 'ALL' },
      { code: 'TB1', type: 'TERMINAL', pins: 30, carType: 'ALL' },
      { code: 'J1', type: '74P', pins: 74, carType: 'DMC' },
      { code: 'PORT1', type: 'M12', pins: 4, carType: 'ALL' },
    ];
    let connCount = 0;
    const drawings = await prisma.drawing.findMany({ take: 10 });
    for (let i = 0; i < connectorsData.length; i++) {
      const c = connectorsData[i];
      const drawing = drawings[i % drawings.length];
      if (!drawing) continue;
      const existing = await prisma.connector.findFirst({ where: { connectorCode: c.code, drawingId: drawing.id } });
      if (!existing) {
        const conn = await prisma.connector.create({
          data: {
            drawingId: drawing.id,
            connectorCode: c.code,
            connectorTypeCode: c.type,
            pinCount: c.pins,
            carType: c.carType,
            description: `Connector ${c.code} with ${c.pins} pins`
          }
        });
        for (let p = 1; p <= Math.min(c.pins, 20); p++) {
          await prisma.connectorPin.create({
            data: {
              connectorId: conn.id,
              pinNo: String(p),
              pinLabel: `P${p}`,
              signalName: `${c.code}-SIG-${p}`,
              wireNo: String(1000 + p + (i * 10))
            }
          });
        }
        connCount++;
      }
    }
    console.log(`✓ Created ${connCount} connectors with pins\n`);

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

    console.log('=== VCC MASTER SEED COMPLETE ===');
    console.log(`  Systems: ${stats[0]}`);
    console.log(`  Drawings: ${stats[1]}`);
    console.log(`  Wires: ${stats[2]}`);
    console.log(`  Equipment: ${stats[3]}`);
    console.log(`  Connectors: ${stats[4]}`);
    console.log(`  Pins: ${stats[5]}`);
    console.log(`  Circuits: ${stats[6]}`);
    console.log(`  Trainlines: ${stats[7]}`);

    return NextResponse.json({
      success: true,
      message: 'VCC Master Seed Complete',
      stats: {
        systems: stats[0],
        drawings: stats[1],
        wires: stats[2],
        equipment: stats[3],
        connectors: stats[4],
        pins: stats[5],
        circuits: stats[6],
        trainlines: stats[7],
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed', details: String(error) }, { status: 500 });
  }
}