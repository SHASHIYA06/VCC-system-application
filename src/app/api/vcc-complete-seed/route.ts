import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TRAINLINES_SEED = [
  { trainlineNo: 1032, name: 'RESET', description: 'System reset trainline', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 1040, name: 'AUX ON', description: 'Auxiliary power on command', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 1050, name: 'SHUT DOWN', description: 'System shutdown trainline', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 1205, name: 'LINE VOLTAGE', description: '750V DC line voltage', voltageDomain: '750VDC', isCrossConnected: false },
  { trainlineNo: 1207, name: 'VVVF FAULT', description: 'VVVF inverter fault indication', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 1209, name: 'HSCB TRIP', description: 'High speed circuit breaker trip indication', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 1215, name: 'AUX FAULT', description: 'Auxiliary system fault indication', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 1217, name: 'VAC FAULT', description: 'VAC system fault indication', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 1219, name: 'PARKING BRAKE', description: 'Parking brake status', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 1515, name: 'ATP', description: 'Automatic train protection', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 2043, name: 'SCS', description: 'Service continuity signal', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 3003, name: 'FORWARD', description: 'Forward propulsion command', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 3004, name: 'REVERSE', description: 'Reverse propulsion command', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 3005, name: 'POWERING 1', description: 'Powering command level 1', voltageDomain: '110VDC', isCrossConnected: true },
  { trainlineNo: 3006, name: 'POWERING 2', description: 'Powering command level 2', voltageDomain: '110VDC', isCrossConnected: true },
  { trainlineNo: 3010, name: 'BRAKING', description: 'Braking command', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 3011, name: 'FULL SERVICE BRAKE', description: 'Full service brake command', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 3013, name: 'RM', description: 'Restricted manual mode', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 3018, name: 'STANDBY', description: 'Standby mode', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 3019, name: 'WC', description: 'Wash coupling mode', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 3020, name: 'PROPULSION ENABLE', description: 'Propulsion enable signal', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 3026, name: 'SPEED ZERO', description: 'Speed zero signal', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 4024, name: 'BRAKE LOOP', description: 'Brake loop normal', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 4028, name: 'BRAKE LOOP RETURN', description: 'Brake loop return', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 4062, name: 'EM BRAKE LOOP NORMAL', description: 'Emergency brake loop normal path', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 4070, name: 'EM BRAKE LOOP NORMAL RTN', description: 'Emergency brake loop normal return', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 4103, name: 'EM BRAKE LOOP REDUNDANT', description: 'Emergency brake loop redundant path', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 4110, name: 'EM BRAKE LOOP REDUNDANT RTN', description: 'Emergency brake loop redundant return', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 4122, name: 'PARKING BRAKE APPLIED', description: 'Parking brake applied indication', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 4123, name: 'HOLDING BRAKE', description: 'Holding brake command', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 4153, name: 'PARKING BRAKE RELEASED', description: 'Parking brake released indication', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 4155, name: 'PARKING BRAKE PRESSURE SW', description: 'Parking brake pressure switch signal', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 5000, name: 'SHORE SUPPLY CONTACT', description: 'Shore supply contactor status', voltageDomain: '415VAC', isCrossConnected: false },
  { trainlineNo: 5030, name: 'SIV CONTACT 1', description: 'Static inverter contact 1', voltageDomain: '415VAC', isCrossConnected: false },
  { trainlineNo: 5031, name: 'SIV CONTACT 2', description: 'Static inverter contact 2', voltageDomain: '415VAC', isCrossConnected: false },
  { trainlineNo: 5064, name: 'BATTERY UNDER-VOLTAGE', description: 'Battery under-voltage monitoring', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 6009, name: 'DOOR OPEN LEFT', description: 'Left side door open command', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 6014, name: 'DOOR CLOSE LEFT', description: 'Left side door close command', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 6034, name: 'DOOR CLOSE ANNOUNCEMENT', description: 'Door close announcement signal', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 6046, name: 'DOOR OPEN RIGHT', description: 'Right side door open command', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 6051, name: 'DOOR CLOSE RIGHT', description: 'Right side door close command', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 6073, name: 'DOOR PROVING LOOP 1', description: 'Door proving loop signal 1', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 6076, name: 'DOOR PROVING LOOP 2', description: 'Door proving loop signal 2', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 6112, name: 'ZERO SPEED', description: 'Zero speed signal', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 7001, name: 'CAB VAC IN SSK', description: 'Cab VAC in SSK signal', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 7050, name: 'SALOON VAC 1 IN SSK', description: 'Saloon VAC 1 in SSK signal', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 7060, name: 'SALOON VAC 2 IN SSK', description: 'Saloon VAC 2 in SSK signal', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 7070, name: 'SMOKE DETECTION', description: 'Smoke detection alarm', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 7071, name: 'DAMPER OPERATION', description: 'Damper operation signal', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 9214, name: 'ATP MODE', description: 'ATP mode active', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 9215, name: 'FWD MODE', description: 'Forward mode active', voltageDomain: '110VDC', isCrossConnected: false },
  { trainlineNo: 9216, name: 'REV MODE', description: 'Reverse mode active', voltageDomain: '110VDC', isCrossConnected: false },
];

const WIRES_SEED = [
  { wireNo: '1032', signalName: 'RESET', description: 'System Reset', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BLUE' },
  { wireNo: '1040', signalName: 'AUX_ON', description: 'Auxiliary Power On', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'GREEN' },
  { wireNo: '1050', signalName: 'SHUT_DWN', description: 'System Shutdown', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'RED' },
  { wireNo: '1205', signalName: 'LINE_VOLT', description: 'Line Voltage 750V', voltageClass: '750VDC', wireSize: '3x2.5', wireColor: 'RED' },
  { wireNo: '1207', signalName: 'VVVF_FAULT', description: 'VVVF Fault', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'YELLOW' },
  { wireNo: '1209', signalName: 'HSCB_TRIP', description: 'HSCB Trip', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'ORANGE' },
  { wireNo: '1515', signalName: 'ATP', description: 'ATP Enable', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'WHITE' },
  { wireNo: '2043', signalName: 'SCS', description: 'Stationary Condition Signal', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BROWN' },
  { wireNo: '3003', signalName: 'FWD_CMD', description: 'Forward Command', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BLUE' },
  { wireNo: '3004', signalName: 'REV_CMD', description: 'Reverse Command', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BLUE' },
  { wireNo: '3005', signalName: 'PWR_EN1', description: 'Powering Enable 1', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BLUE' },
  { wireNo: '3006', signalName: 'PWR_EN2', description: 'Powering Enable 2', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BLUE' },
  { wireNo: '3010', signalName: 'BRAKE_CMD', description: 'Braking Command', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BLUE' },
  { wireNo: '3011', signalName: 'FSB_CMD', description: 'Full Service Brake', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'RED' },
  { wireNo: '3013', signalName: 'RM_MODE', description: 'Restricted Manual Mode', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'YELLOW' },
  { wireNo: '3018', signalName: 'STANDBY', description: 'Standby Mode', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'GREEN' },
  { wireNo: '3019', signalName: 'WC', description: 'Wash Coupling', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'WHITE' },
  { wireNo: '4024', signalName: 'BRAKE_LP', description: 'Brake Loop', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BLUE' },
  { wireNo: '4062', signalName: 'EM_BRAKE_N', description: 'EM Brake Loop Normal', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BLUE' },
  { wireNo: '4103', signalName: 'EM_BRAKE_R', description: 'EM Brake Loop Redundant', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'RED' },
  { wireNo: '4122', signalName: 'PB_APPLIED', description: 'Parking Brake Applied', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'YELLOW' },
  { wireNo: '4153', signalName: 'PB_RELEASED', description: 'Parking Brake Released', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'GREEN' },
  { wireNo: '4155', signalName: 'PB_PS', description: 'Parking Brake Pressure Switch', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'WHITE' },
  { wireNo: '5000', signalName: 'SHORE_CNT', description: 'Shore Supply Contact', voltageClass: '415VAC', wireSize: '3x2.5', wireColor: 'BLACK' },
  { wireNo: '5030', signalName: 'SIV_C1', description: 'SIV Contact 1', voltageClass: '415VAC', wireSize: '3x2.5', wireColor: 'BLACK' },
  { wireNo: '5031', signalName: 'SIV_C2', description: 'SIV Contact 2', voltageClass: '415VAC', wireSize: '3x2.5', wireColor: 'BLACK' },
  { wireNo: '5064', signalName: 'BATT_UV', description: 'Battery Under-Voltage', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'RED' },
  { wireNo: '6009', signalName: 'DOOR_OPEN_L', description: 'Door Open Left', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BLUE' },
  { wireNo: '6014', signalName: 'DOOR_CLOSE_L', description: 'Door Close Left', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'GREEN' },
  { wireNo: '6046', signalName: 'DOOR_OPEN_R', description: 'Door Open Right', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BLUE' },
  { wireNo: '6051', signalName: 'DOOR_CLOSE_R', description: 'Door Close Right', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'GREEN' },
  { wireNo: '6073', signalName: 'DOOR_PROV1', description: 'Door Proving Loop 1', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'WHITE' },
  { wireNo: '6076', signalName: 'DOOR_PROV2', description: 'Door Proving Loop 2', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'WHITE' },
  { wireNo: '6112', signalName: 'ZERO_SPD', description: 'Zero Speed', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BROWN' },
  { wireNo: '7001', signalName: 'CAB_VAC', description: 'Cab VAC Control', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'RED' },
  { wireNo: '7050', signalName: 'SALOON_VAC1', description: 'Saloon VAC 1', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'ORANGE' },
  { wireNo: '7060', signalName: 'SALOON_VAC2', description: 'Saloon VAC 2', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'ORANGE' },
  { wireNo: '7070', signalName: 'SMOKE_DET', description: 'Smoke Detection', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'RED' },
  { wireNo: '7071', signalName: 'DAMPER', description: 'Damper Operation', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'YELLOW' },
  { wireNo: '9214', signalName: 'ATP_MODE', description: 'ATP Mode', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BLUE' },
  { wireNo: '9215', signalName: 'FWD_MODE', description: 'Forward Mode', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'GREEN' },
  { wireNo: '9216', signalName: 'REV_MODE', description: 'Reverse Mode', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'RED' },
];

const EQUIPMENT_SEED = [
  { equipmentCode: 'LTEB1', equipmentName: 'Low Tension Equipment Box 1', equipmentType: 'PANEL', locationHint: 'Underframe', carType: 'DMC' },
  { equipmentCode: 'LTEB2', equipmentName: 'Low Tension Equipment Box 2', equipmentType: 'PANEL', locationHint: 'Underframe', carType: 'TC' },
  { equipmentCode: 'LTEB3', equipmentName: 'Low Tension Equipment Box 3', equipmentType: 'PANEL', locationHint: 'Underframe', carType: 'MC' },
  { equipmentCode: 'LTJB1', equipmentName: 'Low Tension Junction Box 1', equipmentType: 'JUNCTION_BOX', locationHint: 'Underframe', carType: 'DMC' },
  { equipmentCode: 'LTJB2', equipmentName: 'Low Tension Junction Box 2', equipmentType: 'JUNCTION_BOX', locationHint: 'Underframe', carType: 'TC' },
  { equipmentCode: 'LTJB3', equipmentName: 'Low Tension Junction Box 3', equipmentType: 'JUNCTION_BOX', locationHint: 'Underframe', carType: 'MC' },
  { equipmentCode: 'V1', equipmentName: 'VVVF Inverter 1', equipmentType: 'INVERTER', locationHint: 'Underframe', carType: 'DMC' },
  { equipmentCode: 'V2', equipmentName: 'VVVF Inverter 2', equipmentType: 'INVERTER', locationHint: 'Underframe', carType: 'MC' },
  { equipmentCode: 'BCU1', equipmentName: 'Brake Control Unit 1', equipmentType: 'CONTROL_UNIT', locationHint: 'Underframe', carType: 'DMC' },
  { equipmentCode: 'BCU2', equipmentName: 'Brake Control Unit 2', equipmentType: 'CONTROL_UNIT', locationHint: 'Underframe', carType: 'TC' },
  { equipmentCode: 'BECU1', equipmentName: 'Brake Electronic Control Unit 1', equipmentType: 'CONTROL_UNIT', locationHint: 'Underframe', carType: 'MC' },
  { equipmentCode: 'EDB1', equipmentName: 'Electrical Distribution Box 1', equipmentType: 'PANEL', locationHint: 'Ceiling', carType: 'MC' },
  { equipmentCode: 'EDB2', equipmentName: 'Electrical Distribution Box 2', equipmentType: 'PANEL', locationHint: 'Ceiling', carType: 'TC' },
  { equipmentCode: 'APS1', equipmentName: 'Auxiliary Power Supply 1', equipmentType: 'POWER_UNIT', locationHint: 'Underframe', carType: 'TC' },
  { equipmentCode: 'SSB1', equipmentName: 'Shore Supply Box 1', equipmentType: 'POWER_UNIT', locationHint: 'Underframe', carType: 'TC' },
  { equipmentCode: 'BATT1', equipmentName: 'Battery Box 1', equipmentType: 'BATTERY', locationHint: 'Underframe', carType: 'TC' },
  { equipmentCode: 'HSCB1', equipmentName: 'High Speed Circuit Breaker 1', equipmentType: 'BREAKER', locationHint: 'Underframe', carType: 'DMC' },
  { equipmentCode: 'HSCB2', equipmentName: 'High Speed Circuit Breaker 2', equipmentType: 'BREAKER', locationHint: 'Underframe', carType: 'MC' },
  { equipmentCode: 'TCMS_RIO1', equipmentName: 'TCMS Remote IO Unit 1', equipmentType: 'RIO', locationHint: 'Ceiling', carType: 'MC' },
  { equipmentCode: 'TCMS_RIO2', equipmentName: 'TCMS Remote IO Unit 2', equipmentType: 'RIO', locationHint: 'Ceiling', carType: 'TC' },
  { equipmentCode: 'ETH_SW1', equipmentName: 'Ethernet Switch CCTV 1', equipmentType: 'NETWORK_SWITCH', locationHint: 'Ceiling', carType: 'MC' },
  { equipmentCode: 'ETH_SW2', equipmentName: 'Ethernet Switch CCTV 2', equipmentType: 'NETWORK_SWITCH', locationHint: 'Ceiling', carType: 'TC' },
  { equipmentCode: 'AAU1', equipmentName: 'Audio Alarm Unit 1', equipmentType: 'AMPLIFIER', locationHint: 'Ceiling', carType: 'MC' },
  { equipmentCode: 'AAU2', equipmentName: 'Audio Alarm Unit 2', equipmentType: 'AMPLIFIER', locationHint: 'Ceiling', carType: 'TC' },
  { equipmentCode: 'VAC1', equipmentName: 'Saloon VAC Unit 1', equipmentType: 'HVAC_UNIT', locationHint: 'Ceiling', carType: 'MC' },
  { equipmentCode: 'VAC2', equipmentName: 'Saloon VAC Unit 2', equipmentType: 'HVAC_UNIT', locationHint: 'Ceiling', carType: 'TC' },
  { equipmentCode: 'CAB_VAC1', equipmentName: 'Cab VAC Unit 1', equipmentType: 'HVAC_UNIT', locationHint: 'Cab', carType: 'CAB' },
  { equipmentCode: 'OP_PNL1', equipmentName: 'Operating Panel 1', equipmentType: 'PANEL', locationHint: 'Cab Desk', carType: 'CAB' },
  { equipmentCode: 'DCU1', equipmentName: 'Door Control Unit 1', equipmentType: 'CONTROL_UNIT', locationHint: 'Ceiling', carType: 'MC' },
  { equipmentCode: 'DCU2', equipmentName: 'Door Control Unit 2', equipmentType: 'CONTROL_UNIT', locationHint: 'Ceiling', carType: 'TC' },
];

const CONNECTORS_SEED = [
  { connectorCode: 'CN1', connectorType: 'MULTI_MODULE', pinCount: 74, viewName: 'Front View', description: 'Main control connector', equipment: 'LTEB1', drawing: '942-38305' },
  { connectorCode: 'CN2', connectorType: 'MULTI_MODULE', pinCount: 74, viewName: 'Front View', description: 'Control signal connector', equipment: 'LTEB1', drawing: '942-38305' },
  { connectorCode: 'CN3', connectorType: 'POWER_CONNECTOR', pinCount: 11, viewName: 'Front View', description: 'Low tension power', equipment: 'LTEB1', drawing: '942-38305' },
  { connectorCode: 'X1', connectorType: 'CONTROL_CONNECTOR', pinCount: 50, viewName: 'Control Terminal', description: 'VVVF control signals', equipment: 'V1', drawing: '942-38306' },
  { connectorCode: 'BCU_X1', connectorType: 'MULTI_MODULE', pinCount: 37, viewName: 'Front View', description: 'KNORR BCU main connector', equipment: 'BCU1', drawing: '942-38310' },
  { connectorCode: 'PORT1', connectorType: 'M12', pinCount: 4, viewName: 'Front View', description: 'Camera 1', equipment: 'ETH_SW1', drawing: '942-38608' },
  { connectorCode: 'PORT2', connectorType: 'M12', pinCount: 4, viewName: 'Front View', description: 'Camera 2', equipment: 'ETH_SW1', drawing: '942-38608' },
  { connectorCode: 'CN1', connectorType: 'REMOTE_IO', pinCount: 40, viewName: 'Front View', description: 'RIO-1 Main I/O Bank 1', equipment: 'TCMS_RIO1', drawing: '942-38606' },
  { connectorCode: 'CN2', connectorType: 'REMOTE_IO', pinCount: 40, viewName: 'Front View', description: 'RIO-1 Main I/O Bank 2', equipment: 'TCMS_RIO1', drawing: '942-38606' },
  { connectorCode: 'CN1', connectorType: 'POWER_CONNECTOR', pinCount: 37, viewName: 'Front View', description: 'Main power in/out', equipment: 'APS1', drawing: '942-38512' },
  { connectorCode: 'X1', connectorType: 'TERMINAL_BLOCK', pinCount: 20, viewName: 'Front View', description: 'Cab desk terminal block', equipment: 'OP_PNL1', drawing: '942-38104' },
];

const TCMS_POINTS_SEED = [
  { pointCode: 'U1513', rioUnit: 'RIO-1', signalType: 'DI', signalName: 'Door Open Left', description: 'Door open left feedback from DCU' },
  { pointCode: 'U2513', rioUnit: 'RIO-1', signalType: 'DI', signalName: 'Door Open Right', description: 'Door open right feedback from DCU' },
  { pointCode: 'U1125', rioUnit: 'RIO-1', signalType: 'DI', signalName: 'EM Brake Normal', description: 'Emergency brake loop normal path' },
  { pointCode: 'U2125', rioUnit: 'RIO-1', signalType: 'DI', signalName: 'EM Brake Redundant', description: 'Emergency brake loop redundant path' },
  { pointCode: 'U1126', rioUnit: 'RIO-1', signalType: 'DI', signalName: 'Parking Brake Applied', description: 'Parking brake applied indication' },
  { pointCode: 'U2126', rioUnit: 'RIO-1', signalType: 'DI', signalName: 'Parking Brake Released', description: 'Parking brake released indication' },
  { pointCode: 'U1130', rioUnit: 'RIO-1', signalType: 'DO', signalName: 'Forward Command', description: 'Forward command to VVVF' },
  { pointCode: 'U2130', rioUnit: 'RIO-1', signalType: 'DO', signalName: 'Reverse Command', description: 'Reverse command to VVVF' },
  { pointCode: 'U1131', rioUnit: 'RIO-1', signalType: 'DO', signalName: 'Powering Enable', description: 'Powering enable to VVVF' },
  { pointCode: 'U1132', rioUnit: 'RIO-1', signalType: 'DI', signalName: 'Zero Speed', description: 'Zero speed signal from BCU' },
  { pointCode: 'U1135', rioUnit: 'RIO-1', signalType: 'DI', signalName: 'Smoke Detection', description: 'Smoke detection alarm' },
  { pointCode: 'U1136', rioUnit: 'RIO-1', signalType: 'DO', signalName: 'Damper Control', description: 'Damper operation control' },
  { pointCode: 'U1140', rioUnit: 'RIO-1', signalType: 'DI', signalName: 'ATP Mode', description: 'ATP mode active indication' },
  { pointCode: 'U1141', rioUnit: 'RIO-1', signalType: 'DI', signalName: 'FWD Mode', description: 'Forward mode indication' },
  { pointCode: 'U1142', rioUnit: 'RIO-1', signalType: 'DI', signalName: 'REV Mode', description: 'Reverse mode indication' },
];

export async function POST() {
  try {
    console.log('=== Starting Complete VCC Seed ===\n');

    const project = await prisma.project.findFirst();
    if (!project) return NextResponse.json({ error: 'No project found' }, { status: 400 });

    const systems = await prisma.system.findMany();
    const drawings = await prisma.drawing.findMany();
    const carTypes = await prisma.carType.findMany();

    console.log(`Project: ${project.projectName}, Systems: ${systems.length}, Drawings: ${drawings.length}\n`);

    console.log('Step 1: Seeding Trainlines...');
    for (const tl of TRAINLINES_SEED) {
      const sys = systems.find(s => ['TRL', 'CAB', 'TRAC', 'BRAKE', 'APS', 'DOOR', 'VAC', 'TMS'].includes(s.code));
      await prisma.trainline.upsert({
        where: { trainlineNo: tl.trainlineNo },
        update: { ...tl, systemId: sys?.id },
        create: { ...tl, systemId: sys?.id }
      });
    }
    console.log(`Trainlines seeded: ${await prisma.trainline.count()}\n`);

    console.log('Step 2: Seeding Wires...');
    for (const w of WIRES_SEED) {
      await prisma.wire.upsert({
        where: { wireNo: w.wireNo },
        update: w,
        create: w
      });
    }
    console.log(`Wires seeded: ${await prisma.wire.count()}\n`);

    console.log('Step 3: Seeding Equipment...');
    const projectId = project.id;
    for (const eq of EQUIPMENT_SEED) {
      const carType = carTypes.find(c => c.code === eq.carType);
      const system = systems.find(s => s.code === (eq.carType === 'CAB' ? 'CAB' : 
        (eq.equipmentType === 'CONTROL_UNIT' && eq.carType === 'MC' ? 'BRAKE' :
        (eq.equipmentType === 'CONTROL_UNIT' && eq.carType === 'DMC' ? 'BRAKE' :
        (eq.equipmentType === 'INVERTER' ? 'TRAC' :
        (eq.equipmentType === 'NETWORK_SWITCH' || eq.equipmentType === 'AMPLIFIER' ? 'COMMS' :
        (eq.equipmentType === 'HVAC_UNIT' ? 'VAC' :
        (eq.equipmentType === 'RIO' ? 'TMS' :
        (eq.equipmentType === 'POWER_UNIT' || eq.equipmentType === 'BATTERY' ? 'APS' : 'LTEB')))))))));
      
      await prisma.equipment.upsert({
        where: { 
          equipment_code: eq.equipmentCode 
        },
        update: { carTypeId: carType?.id, systemId: system?.id },
        create: {
          projectId,
          equipmentCode: eq.equipmentCode,
          equipmentName: eq.equipmentName,
          equipmentType: eq.equipmentType,
          locationHint: eq.locationHint,
          carTypeId: carType?.id,
          systemId: system?.id
        }
      });
    }
    console.log(`Equipment seeded: ${await prisma.equipment.count()}\n`);

    console.log('Step 4: Seeding Connectors...');
    for (const conn of CONNECTORS_SEED) {
      const drawing = drawings.find(d => d.drawingNo === conn.drawing);
      const equipment = await prisma.equipment.findFirst({ where: { equipmentCode: conn.equipment } });
      if (drawing && equipment) {
        await prisma.connector.upsert({
          where: {
            drawingId_connectorCode: {
              drawingId: drawing.id,
              connectorCode: conn.connectorCode
            }
          },
          update: { 
            equipmentId: equipment.id, 
            connectorTypeCode: conn.connectorType,
            pinCount: conn.pinCount,
            viewName: conn.viewName,
            description: conn.description
          },
          create: {
            drawingId: drawing.id,
            connectorCode: conn.connectorCode,
            connectorTypeCode: conn.connectorType,
            pinCount: conn.pinCount,
            viewName: conn.viewName,
            description: conn.description,
            equipmentId: equipment.id
          }
        });
      }
    }
    console.log(`Connectors seeded: ${await prisma.connector.count()}\n`);

    console.log('Step 5: Seeding TCMS Points...');
    for (const tp of TCMS_POINTS_SEED) {
      const system = systems.find(s => s.code === 'TMS');
      await prisma.tCMSPoint.upsert({
        where: { pointCode: tp.pointCode },
        update: { ...tp, systemId: system?.id },
        create: { ...tp, systemId: system?.id }
      });
    }
    console.log(`TCMS Points seeded: ${await prisma.tCMSPoint.count()}\n`);

    const stats = {
      trainlines: await prisma.trainline.count(),
      wires: await prisma.wire.count(),
      equipment: await prisma.equipment.count(),
      connectors: await prisma.connector.count(),
      tcmsPoints: await prisma.tCMSPoint.count(),
      drawings: await prisma.drawing.count(),
      systems: await prisma.system.count()
    };

    console.log('=== Final Statistics ===');
    console.log(`  Systems: ${stats.systems}`);
    console.log(`  Drawings: ${stats.drawings}`);
    console.log(`  Trainlines: ${stats.trainlines}`);
    console.log(`  Wires: ${stats.wires}`);
    console.log(`  Equipment: ${stats.equipment}`);
    console.log(`  Connectors: ${stats.connectors}`);
    console.log(`  TCMS Points: ${stats.tcmsPoints}`);
    console.log('\n=== Complete VCC Seed Done ===');

    return NextResponse.json({ success: true, message: 'Complete VCC Seed Successful', stats });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed', details: String(error) }, { status: 500 });
  }
}