const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CAB_PIN_DETAILED = [
  { sheet: 1, title: 'CAB A - PANNEL PINOUT - LEFT SIDE', description: 'Cab A left panel connectors J1-J8 pin assignment' },
  { sheet: 2, title: 'CAB A - PANNEL PINOUT - RIGHT SIDE', description: 'Cab A right panel connectors J9-J16 pin assignment' },
  { sheet: 3, title: 'CAB A - CONSOLE CONNECTORS', description: 'Cab A console connector details' },
  { sheet: 4, title: 'CAB B - PANNEL PINOUT - LEFT SIDE', description: 'Cab B left panel connectors' },
  { sheet: 5, title: 'CAB B - PANNEL PINOUT - RIGHT SIDE', description: 'Cab B right panel connectors' },
  { sheet: 6, title: 'CAB B - CONSOLE CONNECTORS', description: 'Cab B console connector details' },
  { sheet: 7, title: 'MASTER CONTROLLER CONNECTIONS', description: 'Master controller J1,J2 pin details' },
  { sheet: 8, title: 'BRAKE CONTROL CONNECTIONS', description: 'Brake controller connector details' },
  { sheet: 9, title: 'ATCS/ATO CONNECTIONS', description: 'Automatic train control connections' },
  { sheet: 10, title: 'VCCU CONNECTIONS', description: 'Vehicle Control Computer Unit connections' },
  { sheet: 11, title: 'RADIO COMMUNICATION CONNECTIONS', description: 'Radio system connections' },
  { sheet: 12, title: 'PIS DISPLAY CONNECTIONS', description: 'Passenger info display connections' },
];

const DMC_CEILING_CONNECTORS = [
  { connectorCode: 'CCJ1', connectorTypeCode: '74P', description: 'Ceiling junction to trainline', carType: 'DMC', location: 'Ceiling-B' },
  { connectorCode: 'CCJ2', connectorTypeCode: '37P', description: 'Ceiling junction secondary', carType: 'DMC', location: 'Ceiling-B' },
  { connectorCode: 'CCJ3', connectorTypeCode: '20P', description: 'Cab signal connector', carType: 'DMC', location: 'Ceiling-F' },
  { connectorCode: 'VCU1', connectorTypeCode: 'HDB', description: 'Vehicle Control Unit', carType: 'DMC', location: 'Ceiling-C' },
  { connectorCode: 'RIO1', connectorTypeCode: 'IO', description: 'Remote I/O Unit 1', carType: 'DMC', location: 'Ceiling-C' },
  { connectorCode: 'RIO2', connectorTypeCode: 'IO', description: 'Remote I/O Unit 2', carType: 'DMC', location: 'Ceiling-D' },
  { connectorCode: 'DCU1', connectorTypeCode: 'DOOR', description: 'Door Control Unit 1', carType: 'DMC', location: 'Ceiling-A' },
  { connectorCode: 'DCU2', connectorTypeCode: 'DOOR', description: 'Door Control Unit 2', carType: 'DMC', location: 'Ceiling-A' },
  { connectorCode: 'HVAC1', connectorTypeCode: 'HVAC', description: 'HVAC Controller 1', carType: 'DMC', location: 'Ceiling-B' },
  { connectorCode: 'HVAC2', connectorTypeCode: 'HVAC', description: 'HVAC Controller 2', carType: 'DMC', location: 'Ceiling-B' },
];

const DMC_UF_CONNECTORS_DETAILED = [
  { connectorCode: 'LTEB', connectorTypeCode: 'PANEL', description: 'Low Tension Equipment Box', carType: 'DMC', location: 'Underframe-A' },
  { connectorCode: 'VVVF1', connectorTypeCode: 'INVERTER', description: 'VVVF Inverter 1', carType: 'DMC', location: 'Underframe-B' },
  { connectorCode: 'VVVF2', connectorTypeCode: 'INVERTER', description: 'VVVF Inverter 2', carType: 'DMC', location: 'Underframe-B' },
  { connectorCode: 'BCU1', connectorTypeCode: 'CONTROL', description: 'Brake Control Unit 1', carType: 'DMC', location: 'Underframe-C' },
  { connectorCode: 'BCU2', connectorTypeCode: 'CONTROL', description: 'Brake Control Unit 2', carType: 'DMC', location: 'Underframe-C' },
  { connectorCode: 'HSCB', connectorTypeCode: 'BREAKER', description: 'High Speed Circuit Breaker', carType: 'DMC', location: 'Underframe-A' },
  { connectorCode: 'PRX', connectorTypeCode: 'PROXY', description: 'Pantograph Raise', carType: 'DMC', location: 'Underframe-Roof' },
  { connectorCode: 'CSJB', connectorTypeCode: 'COLLECTOR', description: 'Collector Shoe JB', carType: 'DMC', location: 'Underframe-A' },
  { connectorCode: 'MOT1', connectorTypeCode: 'MOTOR', description: 'Traction Motor 1', carType: 'DMC', location: 'Underframe-B' },
  { connectorCode: 'MOT2', connectorTypeCode: 'MOTOR', description: 'Traction Motor 2', carType: 'DMC', location: 'Underframe-B' },
  { connectorCode: 'MOT3', connectorTypeCode: 'MOTOR', description: 'Traction Motor 3', carType: 'DMC', location: 'Underframe-C' },
  { connectorCode: 'MOT4', connectorTypeCode: 'MOTOR', description: 'Traction Motor 4', carType: 'DMC', location: 'Underframe-C' },
];

const TC_CEILING_CONNECTORS = [
  { connectorCode: 'TCJ1', connectorTypeCode: '74P', description: 'TC ceiling junction', carType: 'TC', location: 'Ceiling-Center' },
  { connectorCode: 'TCJ2', connectorTypeCode: '37P', description: 'TC ceiling secondary', carType: 'TC', location: 'Ceiling-Rear' },
  { connectorCode: 'PIS1', connectorTypeCode: 'DISPLAY', description: 'PIS Display Unit 1', carType: 'TC', location: 'Ceiling-A' },
  { connectorCode: 'PIS2', connectorTypeCode: 'DISPLAY', description: 'PIS Display Unit 2', carType: 'TC', location: 'Ceiling-B' },
  { connectorCode: 'PAU', connectorTypeCode: 'AUDIO', description: 'PA Amplifier Unit', carType: 'TC', location: 'Ceiling-C' },
  { connectorCode: 'CCTV1', connectorTypeCode: 'CAMERA', description: 'CCTV Camera 1', carType: 'TC', location: 'Ceiling-A' },
  { connectorCode: 'CCTV2', connectorTypeCode: 'CAMERA', description: 'CCTV Camera 2', carType: 'TC', location: 'Ceiling-B' },
  { connectorCode: 'TCMS1', connectorTypeCode: 'CONTROL', description: 'TCMS Controller', carType: 'TC', location: 'Ceiling-C' },
  { connectorCode: 'ETH_SW1', connectorTypeCode: 'NETWORK', description: 'Ethernet Switch 1', carType: 'TC', location: 'Ceiling-C' },
];

const TC_UF_CONNECTORS_DETAILED = [
  { connectorCode: 'APS', connectorTypeCode: 'POWER', description: 'Auxiliary Power Supply', carType: 'TC', location: 'Underframe-A' },
  { connectorCode: 'SIV', connectorTypeCode: 'INVERTER', description: 'Static Inverter', carType: 'TC', location: 'Underframe-A' },
  { connectorCode: 'BC', connectorTypeCode: 'BATTERY', description: 'Battery Charger', carType: 'TC', location: 'Underframe-B' },
  { connectorCode: 'BB1', connectorTypeCode: 'BATTERY', description: 'Battery Bank 1', carType: 'TC', location: 'Underframe-B' },
  { connectorCode: 'BB2', connectorTypeCode: 'BATTERY', description: 'Battery Bank 2', carType: 'TC', location: 'Underframe-B' },
  { connectorCode: 'SSB', connectorTypeCode: 'POWER', description: 'Shore Supply Box', carType: 'TC', location: 'Underframe-A' },
  { connectorCode: 'CM', connectorTypeCode: 'COMPRESSOR', description: 'Compressor Motor', carType: 'TC', location: 'Underframe-C' },
  { connectorCode: 'AIR_DRY', connectorTypeCode: 'AIR', description: 'Air Dryer', carType: 'TC', location: 'Underframe-C' },
  { connectorCode: 'MR_TANK', connectorTypeCode: 'TANK', description: 'Main Reservoir', carType: 'TC', location: 'Underframe-C' },
];

const MC_CEILING_CONNECTORS = [
  { connectorCode: 'MCJ1', connectorTypeCode: '74P', description: 'MC ceiling junction main', carType: 'MC', location: 'Ceiling-Center' },
  { connectorCode: 'MCJ2', connectorTypeCode: '74P', description: 'MC ceiling junction aux', carType: 'MC', location: 'Ceiling-Rear' },
  { connectorCode: 'MCJ3', connectorTypeCode: '37P', description: 'MC ceiling junction spare', carType: 'MC', location: 'Ceiling-B' },
  { connectorCode: 'DCU_L1', connectorTypeCode: 'DOOR', description: 'Door Control Left 1', carType: 'MC', location: 'Ceiling-A' },
  { connectorCode: 'DCU_L2', connectorTypeCode: 'DOOR', description: 'Door Control Left 2', carType: 'MC', location: 'Ceiling-A' },
  { connectorCode: 'DCU_R1', connectorTypeCode: 'DOOR', description: 'Door Control Right 1', carType: 'MC', location: 'Ceiling-B' },
  { connectorCode: 'DCU_R2', connectorTypeCode: 'DOOR', description: 'Door Control Right 2', carType: 'MC', location: 'Ceiling-B' },
  { connectorCode: 'HVAC_MC1', connectorTypeCode: 'HVAC', description: 'MC HVAC Unit 1', carType: 'MC', location: 'Ceiling-C' },
  { connectorCode: 'HVAC_MC2', connectorTypeCode: 'HVAC', description: 'MC HVAC Unit 2', carType: 'MC', location: 'Ceiling-C' },
  { connectorCode: 'RIO_MC1', connectorTypeCode: 'IO', description: 'MC RIO 1', carType: 'MC', location: 'Ceiling-A' },
  { connectorCode: 'RIO_MC2', connectorTypeCode: 'IO', description: 'MC RIO 2', carType: 'MC', location: 'Ceiling-B' },
];

const MC_UF_CONNECTORS_DETAILED = [
  { connectorCode: 'BECU', connectorTypeCode: 'CONTROL', description: 'Brake Electronic Control Unit', carType: 'MC', location: 'Underframe-A' },
  { connectorCode: 'WSP', connectorTypeCode: 'SENSOR', description: 'Wheel Slide Protection', carType: 'MC', location: 'Underframe-A' },
  { connectorCode: 'AXLE1', connectorTypeCode: 'SENSOR', description: 'Axle Box Sensor 1', carType: 'MC', location: 'Underframe-B1' },
  { connectorCode: 'AXLE2', connectorTypeCode: 'SENSOR', description: 'Axle Box Sensor 2', carType: 'MC', location: 'Underframe-B2' },
  { connectorCode: 'AXLE3', connectorTypeCode: 'SENSOR', description: 'Axle Box Sensor 3', carType: 'MC', location: 'Underframe-B3' },
  { connectorCode: 'AXLE4', connectorTypeCode: 'SENSOR', description: 'Axle Box Sensor 4', carType: 'MC', location: 'Underframe-B4' },
  { connectorCode: 'SPEED1', connectorTypeCode: 'SENSOR', description: 'Speed Sensor 1', carType: 'MC', location: 'Underframe-C' },
  { connectorCode: 'SPEED2', connectorTypeCode: 'SENSOR', description: 'Speed Sensor 2', carType: 'MC', location: 'Underframe-C' },
  { connectorCode: 'DOOR_JB1', connectorTypeCode: 'JUNCTION', description: 'Door Junction Box 1', carType: 'MC', location: 'Underframe-A' },
  { connectorCode: 'DOOR_JB2', connectorTypeCode: 'JUNCTION', description: 'Door Junction Box 2', carType: 'MC', location: 'Underframe-B' },
];

const TRAINLINE_DETAILED = [
  { wireNo: '1032', itemName: 'RESET', lineGroup: 'Control', carType: 'ALL', function: 'System Reset', from: 'VCCU', to: 'ALL' },
  { wireNo: '1050', itemName: 'SHUT DOWN', lineGroup: 'Control', carType: 'ALL', function: 'System Shutdown', from: 'CAB', to: 'ALL' },
  { wireNo: '1040', itemName: 'AUX ON', lineGroup: 'Control', carType: 'ALL', function: 'Aux Power On', from: 'CAB', to: 'APS' },
  { wireNo: '1205', itemName: 'LINE VOLTAGE', lineGroup: 'Power', carType: 'ALL', function: '750V DC Line', from: 'PANTO', to: 'HSCB' },
  { wireNo: '1207', itemName: 'VVF FAULT', lineGroup: 'Status', carType: 'ALL', function: 'VVVF Fault Signal', from: 'VVVF', to: 'VCCU' },
  { wireNo: '1209', itemName: 'HSCB TRIP', lineGroup: 'Status', carType: 'ALL', function: 'HSCB Trip Signal', from: 'HSCB', to: 'VCCU' },
  { wireNo: '1515', itemName: 'ATP', lineGroup: 'Control', carType: 'ALL', function: 'ATP Enable', from: 'ATP', to: 'VCCU' },
  { wireNo: '2043', itemName: 'SCS', lineGroup: 'Control', carType: 'ALL', function: 'Stationary Condition', from: 'VCCU', to: 'ALL' },
  { wireNo: '3003', itemName: 'FORWARD', lineGroup: 'Traction', carType: 'ALL', function: 'Forward Command', from: 'MC', to: 'VVVF' },
  { wireNo: '3004', itemName: 'REVERSE', lineGroup: 'Traction', carType: 'ALL', function: 'Reverse Command', from: 'MC', to: 'VVVF' },
  { wireNo: '3005', itemName: 'POWERING1', lineGroup: 'Traction', carType: 'ALL', function: 'Propulsion Enable 1', from: 'VCCU', to: 'VVVF' },
  { wireNo: '3006', itemName: 'POWERING2', lineGroup: 'Traction', carType: 'ALL', function: 'Propulsion Enable 2', from: 'VCCU', to: 'VVVF' },
  { wireNo: '3010', itemName: 'BRAKING', lineGroup: 'Traction', carType: 'ALL', function: 'Braking Command', from: 'MC', to: 'VVVF' },
  { wireNo: '3011', itemName: 'FULL SERVICE BRAKE', lineGroup: 'Brake', carType: 'ALL', function: 'Full Service Brake', from: 'CAB', to: 'BCU' },
  { wireNo: '3013', itemName: 'RM', lineGroup: 'Control', carType: 'ALL', function: 'Restricted Mode', from: 'CAB', to: 'VCCU' },
  { wireNo: '3018', itemName: 'STANDBY', lineGroup: 'Control', carType: 'ALL', function: 'Standby Mode', from: 'CAB', to: 'ALL' },
  { wireNo: '3019', itemName: 'WC', lineGroup: 'Control', carType: 'ALL', function: 'Wheelspin Control', from: 'VCCU', to: 'VVVF' },
  { wireNo: '4024', itemName: 'BRAKE LOOP', lineGroup: 'Brake', carType: 'ALL', function: 'Emergency Brake Loop', from: 'ALL', to: 'ALL' },
  { wireNo: '4062', itemName: 'EM BRAKE LOOP NORMAL', lineGroup: 'Brake', carType: 'ALL', function: 'EB Loop Normal', from: 'DMC', to: 'MC' },
  { wireNo: '4103', itemName: 'EM BRAKE LOOP REDUNDANCY', lineGroup: 'Brake', carType: 'ALL', function: 'EB Loop Redundancy', from: 'DMC', to: 'MC' },
  { wireNo: '4122', itemName: 'PARKING BRAKE APPLIED', lineGroup: 'Brake', carType: 'ALL', function: 'Parking Brake Applied', from: 'MC', to: 'CAB' },
  { wireNo: '4153', itemName: 'PARKING BRAKE RELEASED', lineGroup: 'Brake', carType: 'ALL', function: 'Parking Brake Released', from: 'MC', to: 'CAB' },
  { wireNo: '4155', itemName: 'PARKING BRAKE PRESSURE SWITCH', lineGroup: 'Brake', carType: 'ALL', function: 'PB Pressure Feedback', from: 'MC', to: 'VCCU' },
  { wireNo: '5000', itemName: 'SHORE SUPPLY CONTACT', lineGroup: 'Power', carType: 'TC', function: 'Shore Supply Enable', from: 'SSB', to: 'APS' },
  { wireNo: '5030', itemName: 'SIV CONTACT1', lineGroup: 'Power', carType: 'TC', function: 'SIV Contactor 1', from: 'SIV', to: 'BC' },
  { wireNo: '5031', itemName: 'SIV CONTACT2', lineGroup: 'Power', carType: 'TC', function: 'SIV Contactor 2', from: 'SIV', to: 'BB' },
  { wireNo: '5064', itemName: 'BATTERY UNDER-VOLTAGE', lineGroup: 'Power', carType: 'ALL', function: 'Battery Low Warning', from: 'BB', to: 'VCCU' },
  { wireNo: '6009', itemName: 'DOOR OPEN LEFT', lineGroup: 'Door', carType: 'MC', function: 'Left Door Open', from: 'CAB', to: 'DCU' },
  { wireNo: '6014', itemName: 'DOOR CLOSE LEFT', lineGroup: 'Door', carType: 'MC', function: 'Left Door Close', from: 'CAB', to: 'DCU' },
  { wireNo: '6046', itemName: 'DOOR OPEN RIGHT', lineGroup: 'Door', carType: 'MC', function: 'Right Door Open', from: 'CAB', to: 'DCU' },
  { wireNo: '6051', itemName: 'DOOR CLOSE RIGHT', lineGroup: 'Door', carType: 'MC', function: 'Right Door Close', from: 'CAB', to: 'DCU' },
  { wireNo: '6073', itemName: 'DOOR PROVING LOOP 1', lineGroup: 'Door', carType: 'MC', function: 'Door Proving 1', from: 'DCU', to: 'VCCU' },
  { wireNo: '6076', itemName: 'DOOR PROVING LOOP 2', lineGroup: 'Door', carType: 'MC', function: 'Door Proving 2', from: 'DCU', to: 'VCCU' },
  { wireNo: '6112', itemName: 'ZERO SPEED', lineGroup: 'Status', carType: 'ALL', function: 'Zero Speed Signal', from: 'VCCU', to: 'ALL' },
  { wireNo: '7001', itemName: 'CAB VAC IN SSK', lineGroup: 'VAC', carType: 'DMC', function: 'Cab VAC Control', from: 'CAB', to: 'HVAC' },
  { wireNo: '7050', itemName: 'SALOON VAC1 IN SSK', lineGroup: 'VAC', carType: 'TC', function: 'Saloon VAC 1', from: 'TCMS', to: 'HVAC' },
  { wireNo: '7060', itemName: 'SALOON VAC2 IN SSK', lineGroup: 'VAC', carType: 'TC', function: 'Saloon VAC 2', from: 'TCMS', to: 'HVAC' },
  { wireNo: '7070', itemName: 'SMOKE DETECTION', lineGroup: 'VAC', carType: 'ALL', function: 'Smoke Alarm', from: 'SMOKE', to: 'TCMS' },
  { wireNo: '7071', itemName: 'DAMPER OPERATION', lineGroup: 'VAC', carType: 'ALL', function: 'Damper Control', from: 'TCMS', to: 'HVAC' },
  { wireNo: '9214', itemName: 'ATP MODE', lineGroup: 'Control', carType: 'ALL', function: 'ATP Mode Ind', from: 'ATP', to: 'CAB' },
  { wireNo: '9215', itemName: 'FWD MODE', lineGroup: 'Control', carType: 'ALL', function: 'Forward Mode', from: 'VCCU', to: 'CAB' },
  { wireNo: '9216', itemName: 'REV MODE', lineGroup: 'Control', carType: 'ALL', function: 'Reverse Mode', from: 'VCCU', to: 'CAB' },
];

const CAB_WIRE_CONNECTIONS = [
  { wireNo: '3003', function: 'FORWARD', connector: 'J1', pin: '1', signal: 'FWD_CMD', voltage: '110V' },
  { wireNo: '3004', function: 'REVERSE', connector: 'J1', pin: '2', signal: 'REV_CMD', voltage: '110V' },
  { wireNo: '3005', function: 'POWERING 1', connector: 'J1', pin: '3', signal: 'PWR_EN1', voltage: '110V' },
  { wireNo: '3006', function: 'POWERING 2', connector: 'J1', pin: '4', signal: 'PWR_EN2', voltage: '110V' },
  { wireNo: '3010', function: 'BRAKING', connector: 'J1', pin: '5', signal: 'BRAKE_CMD', voltage: '110V' },
  { wireNo: '3011', function: 'FULL SERVICE BRAKE', connector: 'J1', pin: '6', signal: 'FSB_CMD', voltage: '110V' },
  { wireNo: '3013', function: 'RM MODE', connector: 'J1', pin: '7', signal: 'RM_MODE', voltage: '110V' },
  { wireNo: '1515', function: 'ATP ENABLE', connector: 'J2', pin: '1', signal: 'ATP_EN', voltage: '110V' },
  { wireNo: '1032', function: 'RESET', connector: 'J2', pin: '2', signal: 'SYS_RST', voltage: '110V' },
  { wireNo: '1050', function: 'SHUT DOWN', connector: 'J2', pin: '3', signal: 'SHT_DWN', voltage: '110V' },
  { wireNo: '1040', function: 'AUX ON', connector: 'J2', pin: '4', signal: 'AUX_ON', voltage: '110V' },
  { wireNo: '9214', function: 'ATP MODE', connector: 'J3', pin: '1', signal: 'ATP_MODE', voltage: '24V' },
  { wireNo: '9215', function: 'FWD MODE', connector: 'J3', pin: '2', signal: 'FWD_MODE', voltage: '24V' },
  { wireNo: '9216', function: 'REV MODE', connector: 'J3', pin: '3', signal: 'REV_MODE', voltage: '24V' },
  { wireNo: '4010', function: 'EMERGENCY BRAKE', connector: 'J4', pin: '1', signal: 'EM_BRAKE', voltage: '110V' },
  { wireNo: '4024', function: 'BRAKE LOOP', connector: 'J4', pin: '2', signal: 'BRAKE_LP', voltage: '110V' },
  { wireNo: '4122', function: 'PARKING BRAKE APPLIED', connector: 'J5', pin: '1', signal: 'PB_APPLIED', voltage: '110V' },
  { wireNo: '4153', function: 'PARKING BRAKE RELEASED', connector: 'J5', pin: '2', signal: 'PB_RELEASED', voltage: '110V' },
  { wireNo: '6009', function: 'DOOR OPEN L', connector: 'J6', pin: '1', signal: 'DOOR_OPEN_L', voltage: '110V' },
  { wireNo: '6014', function: 'DOOR CLOSE L', connector: 'J6', pin: '2', signal: 'DOOR_CLOSE_L', voltage: '110V' },
  { wireNo: '6046', function: 'DOOR OPEN R', connector: 'J6', pin: '3', signal: 'DOOR_OPEN_R', voltage: '110V' },
  { wireNo: '6051', function: 'DOOR CLOSE R', connector: 'J6', pin: '4', signal: 'DOOR_CLOSE_R', voltage: '110V' },
  { wireNo: '7001', function: 'CAB VAC', connector: 'J7', pin: '1', signal: 'CAB_VAC_CMD', voltage: '110V' },
  { wireNo: '7070', function: 'SMOKE DETECT', connector: 'J7', pin: '2', signal: 'SMOKE_DET', voltage: '24V' },
  { wireNo: '1001', function: 'BATTERY +', connector: 'TB1', pin: '1', signal: 'BATT_POS', voltage: '110V' },
  { wireNo: '1002', function: 'BATTERY -', connector: 'TB1', pin: '2', signal: 'BATT_NEG', voltage: '110V' },
  { wireNo: '1205', function: 'LINE VOLTAGE', connector: 'TB2', pin: '1', signal: 'LINE_VOLT', voltage: '750V' },
  { wireNo: '5064', function: 'BATTERY UNDER-VOLT', connector: 'TB2', pin: '2', signal: 'BATT_LOW', voltage: '110V' },
];

const SYSTEMS = [
  { code: 'GEN', name: 'General', category: 'Foundation', description: 'General system documentation' },
  { code: 'CAB', name: 'Cab Equipment', category: 'Core Systems', description: 'Driver cab equipment and controls' },
  { code: 'TRAC', name: 'Traction', category: 'Core Systems', description: 'Traction system and VVVF control' },
  { code: 'BRAKE', name: 'Brake System', category: 'Core Systems', description: 'Brake control and air supply' },
  { code: 'AUX', name: 'Auxiliary Electric', category: 'Power', description: 'Auxiliary power and battery' },
  { code: 'DOOR', name: 'Door System', category: 'Passenger Systems', description: 'Passenger door control' },
  { code: 'VAC', name: 'VAC/HVAC', category: 'Passenger Systems', description: 'HVAC systems' },
  { code: 'TMS', name: 'TCMS', category: 'Communication', description: 'Train Control Management System' },
  { code: 'COMMS', name: 'Communication', category: 'Communication', description: 'PIS, PA, CCTV, Radio' },
  { code: 'HV', name: 'High Voltage', category: 'Power', description: 'High voltage distribution' },
  { code: 'LIGHT', name: 'Lighting', category: 'Auxiliary', description: 'Interior and exterior lighting' },
  { code: 'LTEB', name: 'LTEB', category: 'Electrical', description: 'Low Tension Equipment Box' },
  { code: 'LTJB', name: 'LTJB', category: 'Electrical', description: 'Low Tension Junction Box' },
  { code: 'APS', name: 'APS', category: 'Power', description: 'Auxiliary Power Supply' },
];

const DRAWINGS = [
  { drawingNo: '942-58100', title: 'VCC Drawing List & Index', source: 'KMRCL VCC Drawings_OCR.pdf', system: 'GEN', carTypes: 'ALL', sheets: 127 },
  { drawingNo: '942-38104', title: 'Cab Panel PIN Assignment', source: 'CAB_PIN DRAWINGS 2.pdf', system: 'CAB', carTypes: 'CAB', sheets: 48 },
  { drawingNo: '942-38310', title: 'DMC Ceiling PIN Assignment', source: 'DMC_CEILING.pdf', system: 'TMS', carTypes: 'DMC', sheets: 28 },
  { drawingNo: '942-38305', title: 'DMC Underframe PIN Assignment', source: 'DMC UF_PIN DRAWINGS.pdf', system: 'LTEB', carTypes: 'DMC', sheets: 26 },
  { drawingNo: '942-38409', title: 'TC Ceiling PIN Assignment', source: 'TC_CEILING PIN DRAWINGS.pdf', system: 'TMS', carTypes: 'TC', sheets: 27 },
  { drawingNo: '942-38508', title: 'TC Underframe PIN Assignment', source: 'TC _UF PIN DRAWINGS.pdf', system: 'APS', carTypes: 'TC', sheets: 21 },
  { drawingNo: '942-38606', title: 'MC Ceiling PIN Assignment', source: 'MC_CEILING_PIN DRAWINGS.pdf', system: 'TMS', carTypes: 'MC', sheets: 58 },
  { drawingNo: '942-38602', title: 'MC Underframe PIN Assignment', source: 'MC_UF.pdf', system: 'LTEB', carTypes: 'MC', sheets: 27 },
  { drawingNo: 'VCC-DESC-01', title: 'VCC System Description', source: 'VCC DESCRIPTION 13.12.2017.pdf', system: 'GEN', carTypes: 'ALL', sheets: 54 },
];

async function seed() {
  console.log('=== Starting Detailed VCC Seed ===\n');

  try {
    const project = await prisma.project.findFirst();
    if (!project) {
      console.log('No project found, creating default...');
      return;
    }
    console.log(`Project: ${project.projectName}\n`);

    console.log('Step 1: Systems...');
    for (const sys of SYSTEMS) {
      const existing = await prisma.system.findFirst({ where: { code: sys.code } });
      if (!existing) {
        await prisma.system.create({ data: sys });
      }
    }
    console.log('Systems done.\n');

    console.log('Step 2: Drawings...');
    for (const d of DRAWINGS) {
      const sys = await prisma.system.findFirst({ where: { code: d.system } });
      const existing = await prisma.drawing.findFirst({ where: { drawingNo: d.drawingNo } });
      if (!existing) {
        await prisma.drawing.create({
          data: {
            drawingNo: d.drawingNo,
            title: d.title,
            sourceFileId: d.source,
            totalSheets: d.sheets,
            projectId: project.id,
            systemId: sys?.id,
            revision: 'A',
            status: 'ACTIVE',
            remarks: `${d.carTypes}|${d.system}`
          }
        });
      }
    }
    console.log('Drawings done.\n');

    console.log('Step 3: Connectors - CAB Sheets...');
    const cabDrawing = await prisma.drawing.findFirst({ where: { drawingNo: '942-38104' } });
    for (const conn of CAB_PIN_DETAILED) {
      const existing = await prisma.connector.findFirst({ where: { connectorCode: `CAB-${conn.sheet}` } });
      if (!existing && cabDrawing) {
        await prisma.connector.create({
          data: {
            connectorCode: `CAB-${conn.sheet}`,
            description: conn.title,
            carType: 'CAB',
            drawingId: cabDrawing.id,
            locationTag: `Sheet ${conn.sheet}`
          }
        });
      }
    }
    console.log('CAB connectors done.\n');

    console.log('Step 4: Connectors - DMC Ceiling...');
    const dmcCeilingDrawing = await prisma.drawing.findFirst({ where: { drawingNo: '942-38310' } });
    for (const conn of DMC_CEILING_CONNECTORS) {
      const existing = await prisma.connector.findFirst({ where: { connectorCode: conn.connectorCode } });
      if (!existing && dmcCeilingDrawing) {
        await prisma.connector.create({
          data: {
            connectorCode: conn.connectorCode,
            description: conn.description,
            carType: conn.carType,
            drawingId: dmcCeilingDrawing.id,
            locationTag: conn.location
          }
        });
      }
    }
    console.log('DMC Ceiling connectors done.\n');

    console.log('Step 5: Connectors - DMC Underframe...');
    const dmcUfDrawing = await prisma.drawing.findFirst({ where: { drawingNo: '942-38305' } });
    for (const conn of DMC_UF_CONNECTORS_DETAILED) {
      const existing = await prisma.connector.findFirst({ where: { connectorCode: conn.connectorCode } });
      if (!existing && dmcUfDrawing) {
        await prisma.connector.create({
          data: {
            connectorCode: conn.connectorCode,
            description: conn.description,
            carType: conn.carType,
            drawingId: dmcUfDrawing.id,
            locationTag: conn.location
          }
        });
      }
    }
    console.log('DMC Underframe connectors done.\n');

    console.log('Step 6: Connectors - TC Ceiling...');
    const tcCeilingDrawing = await prisma.drawing.findFirst({ where: { drawingNo: '942-38409' } });
    for (const conn of TC_CEILING_CONNECTORS) {
      const existing = await prisma.connector.findFirst({ where: { connectorCode: conn.connectorCode } });
      if (!existing && tcCeilingDrawing) {
        await prisma.connector.create({
          data: {
            connectorCode: conn.connectorCode,
            description: conn.description,
            carType: conn.carType,
            drawingId: tcCeilingDrawing.id,
            locationTag: conn.location
          }
        });
      }
    }
    console.log('TC Ceiling connectors done.\n');

    console.log('Step 7: Connectors - TC Underframe...');
    const tcUfDrawing = await prisma.drawing.findFirst({ where: { drawingNo: '942-38508' } });
    for (const conn of TC_UF_CONNECTORS_DETAILED) {
      const existing = await prisma.connector.findFirst({ where: { connectorCode: conn.connectorCode } });
      if (!existing && tcUfDrawing) {
        await prisma.connector.create({
          data: {
            connectorCode: conn.connectorCode,
            description: conn.description,
            carType: conn.carType,
            drawingId: tcUfDrawing.id,
            locationTag: conn.location
          }
        });
      }
    }
    console.log('TC Underframe connectors done.\n');

    console.log('Step 8: Connectors - MC Ceiling...');
    const mcCeilingDrawing = await prisma.drawing.findFirst({ where: { drawingNo: '942-38606' } });
    for (const conn of MC_CEILING_CONNECTORS) {
      const existing = await prisma.connector.findFirst({ where: { connectorCode: conn.connectorCode } });
      if (!existing && mcCeilingDrawing) {
        await prisma.connector.create({
          data: {
            connectorCode: conn.connectorCode,
            description: conn.description,
            carType: conn.carType,
            drawingId: mcCeilingDrawing.id,
            locationTag: conn.location
          }
        });
      }
    }
    console.log('MC Ceiling connectors done.\n');

    console.log('Step 9: Connectors - MC Underframe...');
    const mcUfDrawing = await prisma.drawing.findFirst({ where: { drawingNo: '942-38602' } });
    for (const conn of MC_UF_CONNECTORS_DETAILED) {
      const existing = await prisma.connector.findFirst({ where: { connectorCode: conn.connectorCode } });
      if (!existing && mcUfDrawing) {
        await prisma.connector.create({
          data: {
            connectorCode: conn.connectorCode,
            description: conn.description,
            carType: conn.carType,
            drawingId: mcUfDrawing.id,
            locationTag: conn.location
          }
        });
      }
    }
    console.log('MC Underframe connectors done.\n');

    console.log('Step 10: Trainlines (detailed)...');
    for (const tl of TRAINLINE_DETAILED) {
      const existing = await prisma.trainLine.findFirst({ where: { wireNo: tl.wireNo } });
      if (!existing) {
        const drawing = await prisma.drawing.findFirst();
        await prisma.trainLine.create({
          data: { 
            wireNo: tl.wireNo, 
            itemName: tl.itemName, 
            lineGroup: tl.lineGroup, 
            note: tl.function,
            carType: tl.carType,
            drawingId: drawing?.id 
          }
        });
      }
    }
    console.log('Trainlines done.\n');

    console.log('Step 11: Wire connections (CAB)...');
    for (const wc of CAB_WIRE_CONNECTIONS) {
      const existingWire = await prisma.wire.findUnique({ where: { wireNo: wc.wireNo } });
      if (!existingWire) {
        await prisma.wire.create({
          data: {
            wireNo: wc.wireNo,
            signalName: wc.signal,
            description: wc.function,
            voltageClass: wc.voltage,
            wireSize: '2.5mm²',
            wireColor: 'BLUE'
          }
        });
      }
    }
    console.log('Wires done.\n');

    console.log('Step 12: Creating pins for all connectors (limited)...');
    const connectors = await prisma.connector.findMany();
    let pinsCreated = 0;
    for (const conn of connectors.slice(0, 10)) {
      const existingPins = await prisma.connectorPin.count({ where: { connectorId: conn.id } });
      if (existingPins === 0) {
        const pinCount = 20;
        for (let i = 1; i <= pinCount; i++) {
          await prisma.connectorPin.create({
            data: {
              connectorId: conn.id,
              pinNo: String(i),
              pinLabel: `P${i}`,
              signalName: `${conn.connectorCode}-SIG-${i}`,
              wireNo: String(1000 + (i % 9000))
            }
          });
          pinsCreated++;
        }
      }
    }
    console.log(`Created ${pinsCreated} pins for first 10 connectors.\n`);

    const stats = await Promise.all([
      prisma.system.count(),
      prisma.drawing.count(),
      prisma.trainLine.count(),
      prisma.wire.count(),
      prisma.connector.count(),
      prisma.connectorPin.count(),
    ]);

    console.log('=== Final Statistics ===');
    console.log(`  Systems: ${stats[0]}`);
    console.log(`  Drawings: ${stats[1]}`);
    console.log(`  Trainlines: ${stats[2]}`);
    console.log(`  Wires: ${stats[3]}`);
    console.log(`  Connectors: ${stats[4]}`);
    console.log(`  Pins: ${stats[5]}`);
    console.log('\n=== Seed Complete ===');

    return {
      systems: stats[0],
      drawings: stats[1],
      trainlines: stats[2],
      wires: stats[3],
      connectors: stats[4],
      pins: stats[5]
    };
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .then(result => {
    console.log('\nDone!', result);
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  });