import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const DOCUMENT_SET = [
  { file: 'KMRCL VCC Drawings_OCR.pdf', drawingNo: '942-58100', title: 'VCC Drawing List & Index', pages: 127, carType: 'ALL', subsystem: 'GEN' },
  { file: 'CAB_PIN DRAWINGS 2.pdf', drawingNo: '942-38104', title: 'Cab Panel Pin Assignment', pages: 48, carType: 'CAB', subsystem: 'CAB' },
  { file: 'DMC_CEILING.pdf', drawingNo: '942-38310', title: 'DMC Ceiling Pin Assignment', pages: 28, carType: 'DMC', subsystem: 'TMS' },
  { file: 'DMC UF_PIN DRAWINGS.pdf', drawingNo: '942-38305', title: 'DMC Underframe Pin Assignment', pages: 26, carType: 'DMC', subsystem: 'LTEB' },
  { file: 'TC_CEILING PIN DRAWINGS.pdf', drawingNo: '942-38409', title: 'TC Ceiling Pin Assignment', pages: 27, carType: 'TC', subsystem: 'TMS' },
  { file: 'TC _UF PIN DRAWINGS.pdf', drawingNo: '942-38508', title: 'TC Underframe Pin Assignment', pages: 21, carType: 'TC', subsystem: 'LTEB' },
  { file: 'MC_CEILING_PIN DRAWINGS.pdf', drawingNo: '942-38606', title: 'MC Ceiling Pin Assignment', pages: 58, carType: 'MC', subsystem: 'TMS' },
  { file: 'MC_UF.pdf', drawingNo: '942-38602', title: 'MC Underframe Pin Assignment', pages: 27, carType: 'MC', subsystem: 'LTEB' },
  { file: 'VCC DESCRIPTION 13.12.2017.pdf', drawingNo: 'VCC-DESC-01', title: 'VCC System Description', pages: 54, carType: 'ALL', subsystem: 'GEN' },
];

const COMPREHENSIVE_TRAINLINES = [
  { wireNo: '1001', itemName: 'LINE VOLTAGE PRESENCE', lineGroup: 'Power', note: '750V DC line voltage presence indication' },
  { wireNo: '1002', itemName: 'LINE VOLTAGE FAIL', lineGroup: 'Power', note: '750V DC line voltage failure signal' },
  { wireNo: '1003', itemName: 'OVERVOLTAGE', lineGroup: 'Power', note: 'Overvoltage protection' },
  { wireNo: '1004', itemName: 'UNDERVOLTAGE', lineGroup: 'Power', note: 'Undervoltage protection' },
  { wireNo: '1032', itemName: 'RESET', lineGroup: 'Control', note: 'System reset command' },
  { wireNo: '1050', itemName: 'SHUT DOWN', lineGroup: 'Control', note: 'System shutdown command' },
  { wireNo: '1040', itemName: 'AUX ON', lineGroup: 'Control', note: 'Auxiliary power on command' },
  { wireNo: '1041', itemName: 'AUX OFF', lineGroup: 'Control', note: 'Auxiliary power off command' },
  { wireNo: '1042', itemName: 'AUX READY', lineGroup: 'Status', note: 'Auxiliary power ready signal' },
  { wireNo: '1051', itemName: 'EMERGENCY STOP', lineGroup: 'Control', note: 'Emergency stop command' },
  { wireNo: '1201', itemName: 'PANTOGRAPH UP', lineGroup: 'Power', note: 'Pantograph raised command' },
  { wireNo: '1202', itemName: 'PANTOGRAPH DOWN', lineGroup: 'Power', note: 'Pantograph lowered command' },
  { wireNo: '1203', itemName: 'PANTOGRAPH UP IND', lineGroup: 'Status', note: 'Pantograph up indication' },
  { wireNo: '1204', itemName: 'PANTOGRAPH DOWN IND', lineGroup: 'Status', note: 'Pantograph down indication' },
  { wireNo: '1205', itemName: 'LINE VOLTAGE', lineGroup: 'Power', note: 'DC line voltage feedback 750V' },
  { wireNo: '1206', itemName: 'HSCB CLOSE', lineGroup: 'Power', note: 'High speed circuit breaker close command' },
  { wireNo: '1207', itemName: 'VVF FAULT', lineGroup: 'Status', note: 'VVVF inverter fault signal' },
  { wireNo: '1208', itemName: 'HSCB OPEN', lineGroup: 'Power', note: 'High speed circuit breaker open command' },
  { wireNo: '1209', itemName: 'HSCB TRIP', lineGroup: 'Status', note: 'High speed circuit breaker trip signal' },
  { wireNo: '1210', itemName: 'HSCB CLOSED IND', lineGroup: 'Status', note: 'HSCB closed indication' },
  { wireNo: '1211', itemName: 'HSCB OPEN IND', lineGroup: 'Status', note: 'HSCB open indication' },
  { wireNo: '1215', itemName: 'AUX FAULT', lineGroup: 'Status', note: 'Auxiliary system fault' },
  { wireNo: '1217', itemName: 'VAC FAULT', lineGroup: 'Status', note: 'VAC system fault indication' },
  { wireNo: '1219', itemName: 'PARKING BRAKE APPLIED', lineGroup: 'Status', note: 'Parking brake applied status' },
  { wireNo: '1220', itemName: 'SIV FAULT', lineGroup: 'Status', note: 'Static inverter fault' },
  { wireNo: '1221', itemName: 'BATTERY LOW', lineGroup: 'Status', note: 'Low battery voltage warning' },
  { wireNo: '1501', itemName: 'MODE AUTO', lineGroup: 'Control', note: 'Automatic mode selection' },
  { wireNo: '1502', itemName: 'MODE MANUAL', lineGroup: 'Control', note: 'Manual mode selection' },
  { wireNo: '1503', 'itemName': 'MODE EMERGENCY', lineGroup: 'Control', note: 'Emergency mode' },
  { wireNo: '1515', itemName: 'ATP', lineGroup: 'Control', note: 'Automatic train protection' },
  { wireNo: '1516', itemName: 'ATP FAULT', lineGroup: 'Status', note: 'ATP fault indication' },
  { wireNo: '2001', itemName: 'MASTER CONTROLLER FWD', lineGroup: 'Traction', note: 'Master controller forward command' },
  { wireNo: '2002', itemName: 'MASTER CONTROLLER REV', lineGroup: 'Traction', note: 'Master controller reverse command' },
  { wireNo: '2003', itemName: 'MASTER CONTROLLER OFF', lineGroup: 'Traction', note: 'Master controller off position' },
  { wireNo: '2043', itemName: 'SCS', lineGroup: 'Control', note: 'Stationary condition signal' },
  { wireNo: '2044', itemName: 'MOVING', lineGroup: 'Status', note: 'Train in motion signal' },
  { wireNo: '3001', itemName: 'FWD', lineGroup: 'Traction', note: 'Forward direction command' },
  { wireNo: '3002', itemName: 'REV', lineGroup: 'Traction', note: 'Reverse direction command' },
  { wireNo: '3003', itemName: 'FORWARD', lineGroup: 'Traction', note: 'Forward command from cab to VVVF' },
  { wireNo: '3004', itemName: 'REVERSE', lineGroup: 'Traction', note: 'Reverse command' },
  { wireNo: '3005', itemName: 'POWERING1', lineGroup: 'Traction', note: 'Propulsion enable 1 - crossed at X1/19-20' },
  { wireNo: '3006', itemName: 'POWERING2', lineGroup: 'Traction', note: 'Propulsion enable 2 - crossed at X1/20-19' },
  { wireNo: '3007', itemName: 'POWERING READY', lineGroup: 'Status', note: 'Propulsion ready signal' },
  { wireNo: '3008', itemName: 'MOTOR 1 FAULT', lineGroup: 'Status', note: 'Motor 1 fault indication' },
  { wireNo: '3009', itemName: 'MOTOR 2 FAULT', lineGroup: 'Status', note: 'Motor 2 fault indication' },
  { wireNo: '3010', itemName: 'BRAKING', lineGroup: 'Traction', note: 'Braking command' },
  { wireNo: '3011', itemName: 'FULL SERVICE BRAKE', lineGroup: 'Brake', note: 'Full service brake command' },
  { wireNo: '3012', itemName: 'QUICK BRAKE', lineGroup: 'Brake', note: 'Quick brake command' },
  { wireNo: '3013', itemName: 'RM', lineGroup: 'Control', note: 'Restricted mode' },
  { wireNo: '3014', itemName: 'DMR', lineGroup: 'Control', note: 'Deadman relay' },
  { wireNo: '3015', itemName: 'CREEP MODE', lineGroup: 'Control', note: 'Creep mode operation' },
  { wireNo: '3016', itemName: 'SANDING', lineGroup: 'Control', note: 'Sandite application command' },
  { wireNo: '3017', itemName: 'WIPER', lineGroup: 'Auxiliary', note: 'Wiper operation' },
  { wireNo: '3018', itemName: 'STANDBY', lineGroup: 'Control', note: 'Standby mode' },
  { wireNo: '3019', itemName: 'WC', lineGroup: 'Control', note: 'Wheelspin control' },
  { wireNo: '3020', itemName: 'EB DEMAND', lineGroup: 'Brake', note: 'Emergency brake demand' },
  { wireNo: '3020A', itemName: 'BRAKE DEMAND', lineGroup: 'Brake', note: 'Brake demand signal' },
  { wireNo: '3021', itemName: 'BRAKE RELEASE', lineGroup: 'Brake', note: 'Brake release command' },
  { wireNo: '3022', itemName: 'BRAKE PRESSURE OK', lineGroup: 'Status', note: 'Brake pressure OK indication' },
  { wireNo: '3023', itemName: 'BRAKE FAULT', lineGroup: 'Status', note: 'Brake system fault' },
  { wireNo: '3024', itemName: 'BCU FAULT', lineGroup: 'Status', note: 'Brake control unit fault' },
  { wireNo: '3025', itemName: 'REGENERATIVE BRAKE', lineGroup: 'Traction', note: 'Regenerative braking' },
  { wireNo: '3026', itemName: 'LOAD COMP', lineGroup: 'Traction', note: 'Load compensation' },
  { wireNo: '3027', itemName: 'SPEED 0', lineGroup: 'Status', note: 'Zero speed detection' },
  { wireNo: '3028', itemName: 'SPEED >5', lineGroup: 'Status', note: 'Speed above 5km/h' },
  { wireNo: '3030', itemName: 'MAX SPEED', lineGroup: 'Control', note: 'Maximum speed command' },
  { wireNo: '3060', itemName: 'ATO', lineGroup: 'Control', note: 'Automatic train operation' },
  { wireNo: '3061', itemName: 'ATB', lineGroup: 'Control', note: 'Automatic train braking' },
  { wireNo: '4001', itemName: 'COMPRESSOR ON', lineGroup: 'Brake', note: 'Compressor start command' },
  { wireNo: '4002', itemName: 'COMPRESSOR OFF', lineGroup: 'Brake', note: 'Compressor stop command' },
  { wireNo: '4003', itemName: 'COMPRESSOR RUN', lineGroup: 'Status', note: 'Compressor running indication' },
  { wireNo: '4004', itemName: 'COMPRESSOR FAULT', lineGroup: 'Status', note: 'Compressor fault' },
  { wireNo: '4005', itemName: 'MR PRESSURE LOW', lineGroup: 'Status', note: 'Main reservoir pressure low' },
  { wireNo: '4006', itemName: 'MR PRESSURE HIGH', lineGroup: 'Status', note: 'Main reservoir pressure high' },
  { wireNo: '4020', itemName: 'BC PRESSURE', lineGroup: 'Brake', note: 'Brake cylinder pressure' },
  { wireNo: '4021', itemName: 'BC PRESSURE LOW', lineGroup: 'Status', note: 'Brake cylinder pressure low' },
  { wireNo: '4022', itemName: 'BC PRESSURE HIGH', lineGroup: 'Status', note: 'Brake cylinder pressure high' },
  { wireNo: '4023', itemName: 'ARP PRESSURE', lineGroup: 'Brake', note: 'Auxiliary reservoir pressure' },
  { wireNo: '4024', itemName: 'BRAKE LOOP', lineGroup: 'Brake', note: 'Emergency brake loop normal' },
  { wireNo: '4025', itemName: 'BRAKE APPLIED', lineGroup: 'Status', note: 'Brake applied indication' },
  { wireNo: '4026', itemName: 'BRAKE RELEASED', lineGroup: 'Status', note: 'Brake released indication' },
  { wireNo: '4027', itemName: 'EB APPLIED', lineGroup: 'Status', note: 'Emergency brake applied' },
  { wireNo: '4028', itemName: 'BRAKE LOOP RETURN', lineGroup: 'Brake', note: 'Emergency brake loop return' },
  { wireNo: '4030', itemName: 'BRAKE TEST', lineGroup: 'Brake', note: 'Brake test command' },
  { wireNo: '4060', itemName: 'EB1', lineGroup: 'Brake', note: 'Emergency brake circuit 1' },
  { wireNo: '4061', itemName: 'EB2', lineGroup: 'Brake', note: 'Emergency brake circuit 2' },
  { wireNo: '4062', itemName: 'EM BRAKE LOOP NORMAL', lineGroup: 'Brake', note: 'Emergency brake loop normal path' },
  { wireNo: '4070', itemName: 'EM BRAKE LOOP RETURN', lineGroup: 'Brake', note: 'Emergency brake loop return path' },
  { wireNo: '4100', itemName: 'DIRECT BRAKE', lineGroup: 'Brake', note: 'Direct brake command' },
  { wireNo: '4101', itemName: 'DISC BRAKE', lineGroup: 'Brake', note: 'Disc brake control' },
  { wireNo: '4102', itemName: 'SOLENOID BRAKE', lineGroup: 'Brake', note: 'Solenoid brake' },
  { wireNo: '4103', itemName: 'EM BRAKE LOOP REDUNDANCY', lineGroup: 'Brake', note: 'Emergency brake loop redundancy path' },
  { wireNo: '4110', itemName: 'EM BRAKE LOOP REDUNDANCY RETURN', lineGroup: 'Brake', note: 'Emergency brake loop redundancy return' },
  { wireNo: '4120', itemName: 'PARKING BRAKE CMD', lineGroup: 'Brake', note: 'Parking brake command' },
  { wireNo: '4121', itemName: 'PARKING BRAKE RELEASE', lineGroup: 'Brake', note: 'Parking brake release command' },
  { wireNo: '4122', itemName: 'PARKING BRAKE APPLIED', lineGroup: 'Brake', note: 'Parking brake applied status' },
  { wireNo: '4123', itemName: 'HOLDING BRAKE', lineGroup: 'Brake', note: 'Holding brake command' },
  { wireNo: '4150', itemName: 'PBR ON', lineGroup: 'Brake', note: 'Parking brake relay on' },
  { wireNo: '4151', itemName: 'PBR OFF', lineGroup: 'Brake', note: 'Parking brake relay off' },
  { wireNo: '4152', itemName: 'PBR FAULT', lineGroup: 'Status', note: 'Parking brake relay fault' },
  { wireNo: '4153', itemName: 'PARKING BRAKE RELEASED', lineGroup: 'Brake', note: 'Parking brake released status' },
  { wireNo: '4154', itemName: 'PARKING BRAKE PRESSURE', lineGroup: 'Status', note: 'Parking brake pressure' },
  { wireNo: '4155', itemName: 'PARKING BRAKE PRESSURE SWITCH', lineGroup: 'Brake', note: 'Parking brake pressure feedback' },
  { wireNo: '4160', itemName: 'HORN HIGH', lineGroup: 'Auxiliary', note: 'High horn' },
  { wireNo: '4161', itemName: 'HORN LOW', lineGroup: 'Auxiliary', note: 'Low horn' },
  { wireNo: '4162', itemName: 'HORN COMMAND', lineGroup: 'Auxiliary', note: 'Horn command' },
  { wireNo: '4600', itemName: 'ATO BRAKE CUTOUT', lineGroup: 'Control', note: 'ATO brake cut-out signal' },
  { wireNo: '4601', itemName: 'MANUAL BRAKE', lineGroup: 'Control', note: 'Manual braking mode' },
  { wireNo: '5000', itemName: 'SHORE SUPPLY CONTACT', lineGroup: 'Power', note: 'Shore supply contactor control' },
  { wireNo: '5001', itemName: 'SHORE SUPPLY ON', lineGroup: 'Power', note: 'Shore supply on command' },
  { wireNo: '5002', itemName: 'SHORE SUPPLY OFF', lineGroup: 'Power', note: 'Shore supply off command' },
  { wireNo: '5003', itemName: 'SHORE SUPPLY IND', lineGroup: 'Status', note: 'Shore supply indication' },
  { wireNo: '5010', itemName: 'SIV ON', lineGroup: 'Power', note: 'Static inverter on command' },
  { wireNo: '5011', itemName: 'SIV OFF', lineGroup: 'Power', note: 'Static inverter off command' },
  { wireNo: '5020', itemName: 'APS ON', lineGroup: 'Power', note: 'Auxiliary power supply on' },
  { wireNo: '5021', itemName: 'APS OFF', lineGroup: 'Power', note: 'Auxiliary power supply off' },
  { wireNo: '5022', itemName: 'APS FAULT', lineGroup: 'Status', note: 'APS fault indication' },
  { wireNo: '5030', itemName: 'SIV CONTACT1', lineGroup: 'Power', note: 'Static inverter contact 1' },
  { wireNo: '5031', itemName: 'SIV CONTACT2', lineGroup: 'Power', note: 'Static inverter contact 2' },
  { wireNo: '5032', itemName: 'SIV CONTACT3', lineGroup: 'Power', note: 'Static inverter contact 3' },
  { wireNo: '5040', itemName: 'CONVERTER 1 ON', lineGroup: 'Power', note: 'Converter 1 on command' },
  { wireNo: '5041', itemName: 'CONVERTER 2 ON', lineGroup: 'Power', note: 'Converter 2 on command' },
  { wireNo: '5050', itemName: 'INVERTER 1 ON', lineGroup: 'Power', note: 'Inverter 1 on command' },
  { wireNo: '5051', itemName: 'INVERTER 2 ON', lineGroup: 'Power', note: 'Inverter 2 on command' },
  { wireNo: '5060', itemName: 'BATTERY CHARGE', lineGroup: 'Power', note: 'Battery charger on' },
  { wireNo: '5061', itemName: 'BATTERY DISCHARGE', lineGroup: 'Power', note: 'Battery discharge mode' },
  { wireNo: '5062', itemName: 'BATTERY VOLTAGE', lineGroup: 'Power', note: 'Battery voltage monitoring' },
  { wireNo: '5063', itemName: 'BATTERY TEMP', lineGroup: 'Status', note: 'Battery temperature' },
  { wireNo: '5064', itemName: 'BATTERY UNDER-VOLTAGE', lineGroup: 'Power', note: 'Battery under-voltage monitoring' },
  { wireNo: '5065', itemName: 'BATTERY OVER-VOLTAGE', lineGroup: 'Power', note: 'Battery over-voltage protection' },
  { wireNo: '5070', itemName: '110V DC POSITIVE', lineGroup: 'Power', note: '110V DC positive bus' },
  { wireNo: '5071', itemName: '110V DC NEGATIVE', lineGroup: 'Power', note: '110V DC negative bus' },
  { wireNo: '5072', itemName: '110V DC EARTH', lineGroup: 'Power', note: '110V DC earth' },
  { wireNo: '5080', itemName: '415V AC POSITIVE', lineGroup: 'Power', note: '415V AC positive' },
  { wireNo: '5081', itemName: '415V AC NEUTRAL', lineGroup: 'Power', note: '415V AC neutral' },
  { wireNo: '5082', itemName: '415V AC EARTH', lineGroup: 'Power', note: '415V AC earth' },
  { wireNo: '6001', itemName: 'DOOR POWER', lineGroup: 'Door', note: 'Door system power supply' },
  { wireNo: '6002', itemName: 'DOOR ENABLE', lineGroup: 'Door', note: 'Door enable signal' },
  { wireNo: '6009', itemName: 'DOOR OPEN LEFT', lineGroup: 'Door', note: 'Left door open command - door L1' },
  { wireNo: '6010', itemName: 'DOOR OPEN L2', lineGroup: 'Door', note: 'Left door 2 open' },
  { wireNo: '6011', itemName: 'DOOR OPEN L3', lineGroup: 'Door', note: 'Left door 3 open' },
  { wireNo: '6012', itemName: 'DOOR OPEN L4', lineGroup: 'Door', note: 'Left door 4 open' },
  { wireNo: '6013', itemName: 'DOOR OPEN L5', lineGroup: 'Door', note: 'Left door 5 open' },
  { wireNo: '6014', itemName: 'DOOR CLOSE LEFT', lineGroup: 'Door', note: 'Left door close - crossed at X1/46-47' },
  { wireNo: '6015', itemName: 'DOOR CLOSE L2', lineGroup: 'Door', note: 'Left door 2 close' },
  { wireNo: '6016', itemName: 'DOOR CLOSE L3', lineGroup: 'Door', note: 'Left door 3 close' },
  { wireNo: '6017', itemName: 'DOOR CLOSE L4', lineGroup: 'Door', note: 'Left door 4 close' },
  { wireNo: '6018', itemName: 'DOOR CLOSE L5', lineGroup: 'Door', note: 'Left door 5 close' },
  { wireNo: '6020', itemName: 'DOOR OPEN RIGHT', lineGroup: 'Door', note: 'Right door open command' },
  { wireNo: '6021', itemName: 'DOOR OPEN R2', lineGroup: 'Door', note: 'Right door 2 open' },
  { wireNo: '6022', itemName: 'DOOR OPEN R3', lineGroup: 'Door', note: 'Right door 3 open' },
  { wireNo: '6023', itemName: 'DOOR OPEN R4', lineGroup: 'Door', note: 'Right door 4 open' },
  { wireNo: '6024', itemName: 'DOOR OPEN R5', lineGroup: 'Door', note: 'Right door 5 open' },
  { wireNo: '6025', itemName: 'DOOR CLOSE RIGHT', lineGroup: 'Door', note: 'Right door close' },
  { wireNo: '6026', itemName: 'DOOR CLOSE R2', lineGroup: 'Door', note: 'Right door 2 close' },
  { wireNo: '6027', itemName: 'DOOR CLOSE R3', lineGroup: 'Door', note: 'Right door 3 close' },
  { wireNo: '6028', itemName: 'DOOR CLOSE R4', lineGroup: 'Door', note: 'Right door 4 close' },
  { wireNo: '6029', itemName: 'DOOR CLOSE R5', lineGroup: 'Door', note: 'Right door 5 close' },
  { wireNo: '6030', itemName: 'DOOR ALL CLOSED', lineGroup: 'Door', note: 'All doors closed indication' },
  { wireNo: '6031', itemName: 'DOOR ANY OPEN', lineGroup: 'Door', note: 'Any door open indication' },
  { wireNo: '6032', itemName: 'DOOR EMERGENCY RELEASE', lineGroup: 'Door', note: 'Emergency door release' },
  { wireNo: '6033', itemName: 'DOOR ISOLATED', lineGroup: 'Door', note: 'Door isolated signal' },
  { wireNo: '6034', itemName: 'DOOR CLOSE ANNOUNCEMENT', lineGroup: 'Door', note: 'Door close announcement' },
  { wireNo: '6040', itemName: 'DOOR L1 OPEN', lineGroup: 'Door', note: 'Left door 1 open status' },
  { wireNo: '6041', itemName: 'DOOR L2 OPEN', lineGroup: 'Door', note: 'Left door 2 open status' },
  { wireNo: '6042', itemName: 'DOOR L3 OPEN', lineGroup: 'Door', note: 'Left door 3 open status' },
  { wireNo: '6043', itemName: 'DOOR L4 OPEN', lineGroup: 'Door', note: 'Left door 4 open status' },
  { wireNo: '6044', itemName: 'DOOR L5 OPEN', lineGroup: 'Door', note: 'Left door 5 open status' },
  { wireNo: '6045', itemName: 'DOOR R1 OPEN', lineGroup: 'Door', note: 'Right door 1 open status' },
  { wireNo: '6046', itemName: 'DOOR OPEN RIGHT', lineGroup: 'Door', note: 'Right door open - door R1' },
  { wireNo: '6047', itemName: 'DOOR OPEN R2', lineGroup: 'Door', note: 'Right door open R2' },
  { wireNo: '6048', itemName: 'DOOR OPEN R3', lineGroup: 'Door', note: 'Right door open R3' },
  { wireNo: '6049', itemName: 'DOOR R4 OPEN', lineGroup: 'Door', note: 'Right door 4 open status' },
  { wireNo: '6050', itemName: 'DOOR R5 OPEN', lineGroup: 'Door', note: 'Right door 5 open status' },
  { wireNo: '6051', itemName: 'DOOR CLOSE RIGHT', lineGroup: 'Door', note: 'Right door close - crossed at X1/47-46' },
  { wireNo: '6052', itemName: 'DOOR CLOSE R2', lineGroup: 'Door', note: 'Right door close R2' },
  { wireNo: '6053', itemName: 'DOOR CLOSE R3', lineGroup: 'Door', note: 'Right door close R3' },
  { wireNo: '6054', itemName: 'DOOR R4 CLOSE', lineGroup: 'Door', note: 'Right door 4 close status' },
  { wireNo: '6055', itemName: 'DOOR R5 CLOSE', lineGroup: 'Door', note: 'Right door 5 close status' },
  { wireNo: '6070', itemName: 'DOOR PROVING', lineGroup: 'Door', note: 'Door proving circuit' },
  { wireNo: '6071', itemName: 'DOOR PROVING 1', lineGroup: 'Door', note: 'Door proving loop 1' },
  { wireNo: '6072', itemName: 'DOOR PROVING 2', lineGroup: 'Door', note: 'Door proving loop 2' },
  { wireNo: '6073', itemName: 'DOOR PROVING LOOP 1', lineGroup: 'Door', note: 'Door proving loop 1 - safety interlock' },
  { wireNo: '6074', itemName: 'DOOR PROVING 3', lineGroup: 'Door', note: 'Door proving loop 3' },
  { wireNo: '6075', itemName: 'DOOR PROVING 4', lineGroup: 'Door', note: 'Door proving loop 4' },
  { wireNo: '6076', itemName: 'DOOR PROVING LOOP 2', lineGroup: 'Door', note: 'Door proving loop 2' },
  { wireNo: '6100', itemName: 'DOOR MODE AUTO', lineGroup: 'Door', note: 'Door auto mode' },
  { wireNo: '6101', itemName: 'DOOR MODE MANUAL', lineGroup: 'Door', note: 'Door manual mode' },
  { wireNo: '6102', itemName: 'DOOR MODE OFF', lineGroup: 'Door', note: 'Door off mode' },
  { wireNo: '6110', itemName: 'DOOR INTERLOCK', lineGroup: 'Door', note: 'Door interlock status' },
  { wireNo: '6111', itemName: 'DOOR BYPASS', lineGroup: 'Door', note: 'Door bypass' },
  { wireNo: '6112', itemName: 'ZERO SPEED', lineGroup: 'Status', note: 'Zero speed signal - required for door operation' },
  { wireNo: '6120', itemName: 'DOOR FAULT', lineGroup: 'Status', note: 'Door system fault' },
  { wireNo: '6121', itemName: 'DOOR MOTOR FAULT', lineGroup: 'Status', note: 'Door motor fault' },
  { wireNo: '7000', itemName: 'CAB VAC CMD', lineGroup: 'VAC', note: 'Cab VAC command' },
  { wireNo: '7001', itemName: 'CAB VAC IN SSK', lineGroup: 'VAC', note: 'Cab VAC in stationary keeper' },
  { wireNo: '7002', itemName: 'CAB VAC ON', lineGroup: 'VAC', note: 'Cab VAC on' },
  { wireNo: '7003', itemName: 'CAB VAC OFF', lineGroup: 'VAC', note: 'Cab VAC off' },
  { wireNo: '7004', itemName: 'CAB VAC FAULT', lineGroup: 'Status', note: 'Cab VAC fault' },
  { wireNo: '7005', itemName: 'CAB TEMP', lineGroup: 'Status', note: 'Cab temperature' },
  { wireNo: '7050', itemName: 'SALOON VAC1 IN SSK', lineGroup: 'VAC', note: 'Saloon VAC 1 in SSK' },
  { wireNo: '7051', itemName: 'SALOON VAC1 ON', lineGroup: 'VAC', note: 'Saloon VAC 1 on' },
  { wireNo: '7052', itemName: 'SALOON VAC1 OFF', lineGroup: 'VAC', note: 'Saloon VAC 1 off' },
  { wireNo: '7053', itemName: 'SALOON VAC1 FAULT', lineGroup: 'Status', note: 'Saloon VAC 1 fault' },
  { wireNo: '7060', itemName: 'SALOON VAC2 IN SSK', lineGroup: 'VAC', note: 'Saloon VAC 2 in SSK' },
  { wireNo: '7061', itemName: 'SALOON VAC2 ON', lineGroup: 'VAC', note: 'Saloon VAC 2 on' },
  { wireNo: '7062', itemName: 'SALOON VAC2 OFF', lineGroup: 'VAC', note: 'Saloon VAC 2 off' },
  { wireNo: '7063', itemName: 'SALOON VAC2 FAULT', lineGroup: 'Status', note: 'Saloon VAC 2 fault' },
  { wireNo: '7070', itemName: 'SMOKE DETECTION', lineGroup: 'VAC', note: 'Smoke detection signal' },
  { wireNo: '7071', itemName: 'DAMPER OPERATION', lineGroup: 'VAC', note: 'Damper operation control' },
  { wireNo: '7072', itemName: 'DAMPER OPEN', lineGroup: 'VAC', note: 'Damper open command' },
  { wireNo: '7073', itemName: 'DAMPER CLOSE', lineGroup: 'VAC', note: 'Damper close command' },
  { wireNo: '7080', itemName: 'FAN HIGH', lineGroup: 'VAC', note: 'Ventilation fan high speed' },
  { wireNo: '7081', itemName: 'FAN LOW', lineGroup: 'VAC', note: 'Ventilation fan low speed' },
  { wireNo: '7082', itemName: 'FAN OFF', lineGroup: 'VAC', note: 'Ventilation fan off' },
  { wireNo: '8000', itemName: 'LIGHT CAB', lineGroup: 'Lighting', note: 'Cab lighting on' },
  { wireNo: '8001', itemName: 'LIGHT SALOON', lineGroup: 'Lighting', note: 'Saloon lighting on' },
  { wireNo: '8002', itemName: 'LIGHT EMERGENCY', lineGroup: 'Lighting', note: 'Emergency lighting' },
  { wireNo: '8003', itemName: 'LIGHT HEAD', lineGroup: 'Lighting', note: 'Head light' },
  { wireNo: '8004', itemName: 'LIGHT TAIL', lineGroup: 'Lighting', note: 'Tail/marker light' },
  { wireNo: '8005', itemName: 'LIGHT DESTINATION', lineGroup: 'Lighting', note: 'Destination display' },
  { wireNo: '9000', itemName: 'TCMS RIO U1', lineGroup: 'TCMS', note: 'TCMS Remote IO U1' },
  { wireNo: '9001', itemName: 'TCMS RIO U2', lineGroup: 'TCMS', note: 'TCMS Remote IO U2' },
  { wireNo: '9010', itemName: 'DI-1', lineGroup: 'TCMS', note: 'Digital input 1' },
  { wireNo: '9011', itemName: 'DI-2', lineGroup: 'TCMS', note: 'Digital input 2' },
  { wireNo: '9020', itemName: 'DO-1', lineGroup: 'TCMS', note: 'Digital output 1' },
  { wireNo: '9021', itemName: 'DO-2', lineGroup: 'TCMS', note: 'Digital output 2' },
  { wireNo: '9100', itemName: 'CAN HIGH', lineGroup: 'TCMS', note: 'CAN bus high' },
  { wireNo: '9101', itemName: 'CAN LOW', lineGroup: 'TCMS', note: 'CAN bus low' },
  { wireNo: '9102', itemName: 'CAN TERMINATE', lineGroup: 'TCMS', note: 'CAN termination' },
  { wireNo: '9110', itemName: 'RS485 A', lineGroup: 'TCMS', note: 'RS485 line A' },
  { wireNo: '9111', itemName: 'RS485 B', lineGroup: 'TCMS', note: 'RS485 line B' },
  { wireNo: '9200', itemName: 'PIS DISPLAY', lineGroup: 'Comms', note: 'PIS display data' },
  { wireNo: '9201', itemName: 'PIS BROADCAST', lineGroup: 'Comms', note: 'PIS broadcast' },
  { wireNo: '9210', itemName: 'PA AMPLIFIER', lineGroup: 'Comms', note: 'PA amplifier control' },
  { wireNo: '9211', itemName: 'PA MIC', lineGroup: 'Comms', note: 'PA microphone' },
  { wireNo: '9212', itemName: 'PA EMERGENCY', lineGroup: 'Comms', note: 'PA emergency announcement' },
  { wireNo: '9213', itemName: 'DVAS', lineGroup: 'Comms', note: 'Driver voice announcement system' },
  { wireNo: '9214', itemName: 'ATP MODE', lineGroup: 'Control', note: 'ATP mode indicator' },
  { wireNo: '9215', itemName: 'FWD MODE', lineGroup: 'Control', note: 'Forward mode indicator' },
  { wireNo: '9216', itemName: 'REV MODE', lineGroup: 'Control', note: 'Reverse mode indicator' },
  { wireNo: '9220', itemName: 'CBTC ANTENNA', lineGroup: 'Comms', note: 'CBTC antenna' },
  { wireNo: '9221', itemName: 'CBTC ACTIVE', lineGroup: 'Comms', note: 'CBTC active' },
  { wireNo: '9230', itemName: 'RADIO TX', lineGroup: 'Comms', note: 'Radio transmit' },
  { wireNo: '9231', itemName: 'RADIO RX', lineGroup: 'Comms', note: 'Radio receive' },
  { wireNo: '9240', itemName: 'CCTV CAM1', lineGroup: 'Comms', note: 'CCTV camera 1' },
  { wireNo: '9241', itemName: 'CCTV CAM2', lineGroup: 'Comms', note: 'CCTV camera 2' },
  { wireNo: '9242', itemName: 'CCTV REC', lineGroup: 'Comms', note: 'CCTV recording' },
];

const CONNECTORS = [
  { connectorCode: 'CN1', connectorTypeCode: '74P', description: 'Trainline connector - Control signals', carType: 'ALL' },
  { connectorCode: 'CN2', connectorTypeCode: '74PW', description: 'Trainline connector - Power signals', carType: 'ALL' },
  { connectorCode: 'CN3', connectorTypeCode: '11P', description: 'AC Power connector - 415V/230V', carType: 'ALL' },
  { connectorCode: 'CN4', connectorTypeCode: '3P', description: 'DC Power connector - 110V', carType: 'ALL' },
  { connectorCode: 'CN5', connectorTypeCode: 'MULTI', description: 'CCTV/TCMS/EBCU connector', carType: 'ALL' },
  { connectorCode: 'CN6', connectorTypeCode: 'HV', description: 'High tension power connector', carType: 'DMC' },
  { connectorCode: 'CN7', connectorTypeCode: 'HTE', description: 'High tension earth', carType: 'DMC' },
  { connectorCode: 'X1', connectorTypeCode: '74P', description: 'Inter-car jumper - Trainline control', carType: 'ALL' },
  { connectorCode: 'X2', connectorTypeCode: '74PW', description: 'Inter-car jumper - Trainline power', carType: 'ALL' },
  { connectorCode: 'X3', connectorTypeCode: '11P', description: 'Inter-car - AC power', carType: 'ALL' },
  { connectorCode: 'X4', connectorTypeCode: '3P', description: 'Inter-car - DC power', carType: 'ALL' },
  { connectorCode: 'X5', connectorTypeCode: 'MULTI', description: 'CCTV/TCMS/EBCU jumper', carType: 'ALL' },
  { connectorCode: 'X6', connectorTypeCode: 'HV', description: 'HT jumper', carType: 'DMC' },
  { connectorCode: 'X7', connectorTypeCode: 'HTE', description: 'HT earth jumper', carType: 'DMC' },
  { connectorCode: 'X8', connectorTypeCode: 'EOSS1', description: 'End of train EOSS1', carType: 'ALL' },
  { connectorCode: 'X9', connectorTypeCode: 'EOSS2', description: 'End of train EOSS2', carType: 'ALL' },
  { connectorCode: 'X10', connectorTypeCode: 'CBTC', description: 'CBTC antenna connector', carType: 'ALL' },
  { connectorCode: 'J1', connectorTypeCode: 'TERMINAL', description: 'Terminal block J1', carType: 'ALL' },
  { connectorCode: 'J2', connectorTypeCode: 'TERMINAL', description: 'Terminal block J2', carType: 'ALL' },
  { connectorCode: 'TB1', connectorTypeCode: 'TERMINAL', description: 'Terminal block TB1', carType: 'ALL' },
  { connectorCode: 'TB2', connectorTypeCode: 'TERMINAL', description: 'Terminal block TB2', carType: 'ALL' },
  { connectorCode: 'LTJB', connectorTypeCode: 'JUNCTION', description: 'Low tension junction box', carType: 'ALL' },
  { connectorCode: 'LTEB', connectorTypeCode: 'PANEL', description: 'Low tension equipment box', carType: 'ALL' },
  { connectorCode: 'EDB', connectorTypeCode: 'PANEL', description: 'Electrical distribution box', carType: 'MC' },
  { connectorCode: 'BCU', connectorTypeCode: 'CONTROL', description: 'Brake control unit', carType: 'ALL' },
  { connectorCode: 'BECU', connectorTypeCode: 'CONTROL', description: 'Brake electronic control unit', carType: 'MC' },
  { connectorCode: 'DCU', connectorTypeCode: 'CONTROL', description: 'Door control unit', carType: 'MC' },
  { connectorCode: 'VVVF', connectorTypeCode: 'INVERTER', description: 'VVVF inverter', carType: 'DMC' },
  { connectorCode: 'APS', connectorTypeCode: 'POWER', description: 'Auxiliary power supply', carType: 'TC' },
  { connectorCode: 'SIV', connectorTypeCode: 'INVERTER', description: 'Static inverter', carType: 'TC' },
  { connectorCode: 'HSCB', connectorTypeCode: 'BREAKER', description: 'High speed circuit breaker', carType: 'DMC' },
  { connectorCode: 'PANT', connectorTypeCode: 'COLLECTOR', description: 'Pantograph', carType: 'DMC' },
  { connectorCode: 'CSJ', connectorTypeCode: 'COLLECTOR', description: 'Collector shoe junction', carType: 'DMC' },
  { connectorCode: 'TCMS_RIO', connectorTypeCode: 'IO', description: 'TCMS Remote IO', carType: 'ALL' },
  { connectorCode: 'ETH_SW', connectorTypeCode: 'NETWORK', description: 'Ethernet switch', carType: 'ALL' },
  { connectorCode: 'AAU', connectorTypeCode: 'AUDIO', description: 'Audio alarm unit', carType: 'ALL' },
  { connectorCode: 'PIS', connectorTypeCode: 'DISPLAY', description: 'Passenger info system', carType: 'ALL' },
];

async function ensureSystem(code: string, name: string, category: string) {
  const existing = await prisma.system.findFirst({ where: { code } });
  if (!existing) {
    const maxOrder = await prisma.system.findFirst({ orderBy: { sortOrder: 'desc' } });
    await prisma.system.create({
      data: { code, name, category, description: `${name} system`, sortOrder: (maxOrder?.sortOrder || 0) + 1 }
    });
  }
}

export async function POST() {
  try {
    console.log('Starting comprehensive VCC data seeding...');

    await ensureSystem('GEN', 'General', 'Foundation');
    await ensureSystem('TRL', 'Train Line', 'Core Systems');
    await ensureSystem('CAB', 'Cab Equipment', 'Core Systems');
    await ensureSystem('TRAC', 'Traction', 'Core Systems');
    await ensureSystem('BRAKE', 'Brake System', 'Core Systems');
    await ensureSystem('AUX', 'Auxiliary Electric', 'Power');
    await ensureSystem('DOOR', 'Door System', 'Passenger Systems');
    await ensureSystem('VAC', 'VAC/HVAC', 'Passenger Systems');
    await ensureSystem('TMS', 'TMS/TCMS', 'Communication');
    await ensureSystem('COMMS', 'Communication', 'Communication');
    await ensureSystem('HV', 'High Voltage', 'Power');
    await ensureSystem('LIGHT', 'Lighting', 'Auxiliary');

    let trainlinesAdded = 0;
    const defaultDrawing = await prisma.drawing.findFirst();

    for (const tl of COMPREHENSIVE_TRAINLINES) {
      const existing = await prisma.trainLine.findFirst({ where: { wireNo: tl.wireNo } });
      if (!existing && defaultDrawing) {
        await prisma.trainLine.create({
          data: { wireNo: tl.wireNo, itemName: tl.itemName, lineGroup: tl.lineGroup, note: tl.note, drawingId: defaultDrawing.id }
        });
        trainlinesAdded++;
      }
    }

    let connectorsAdded = 0;
    for (const conn of CONNECTORS) {
      const existing = await prisma.connector.findFirst({ where: { connectorCode: conn.connectorCode } });
      if (!existing && defaultDrawing) {
        await prisma.connector.create({
          data: {
            connectorCode: conn.connectorCode,
            connectorTypeCode: conn.connectorTypeCode,
            description: conn.description,
            carType: conn.carType,
            drawingId: defaultDrawing.id
          }
        });
        connectorsAdded++;
      }
    }

    const [totalTrainlines, totalConnectors, totalCircuits, totalWires] = await Promise.all([
      prisma.trainLine.count(),
      prisma.connector.count(),
      prisma.circuit.count(),
      prisma.wire.count(),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Full VCC data seeded successfully',
      results: {
        trainlinesAdded,
        totalTrainlines,
        connectorsAdded,
        totalConnectors,
        totalCircuits,
        totalWires,
        documentsProcessed: DOCUMENT_SET.length,
        totalPages: DOCUMENT_SET.reduce((a, d) => a + d.pages, 0)
      }
    });
  } catch (error) {
    console.error('Full seed error:', error);
    return NextResponse.json({ error: 'Full seed failed', details: String(error) }, { status: 500 });
  }
}