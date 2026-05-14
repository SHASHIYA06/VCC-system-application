import fs from 'fs';

export interface DrawingDetail {
  drawingNo: string;
  title: string;
  description: string;
  carType: string;
  subsystem: string;
  pageRef?: string;
  system: string;
}

export const VCC_OCR_DRAWINGS: DrawingDetail[] = [
  // Trainlines - DMC (3000 series)
  { drawingNo: '942-58131', title: 'TRAINLINE NO.3003 DMC', description: 'DOOR STATUS-1', carType: 'DMC', subsystem: 'TRL', system: 'DOOR' },
  { drawingNo: '942-58131', title: 'TRAINLINE NO.3004 DMC', description: 'DOOR STATUS-2', carType: 'DMC', subsystem: 'TRL', system: 'DOOR' },
  { drawingNo: '942-58131', title: 'TRAINLINE NO.3005 DMC', description: 'PROPULSION SIGNAL', carType: 'DMC', subsystem: 'TRL', system: 'TRAC' },
  { drawingNo: '942-58131', title: 'TRAINLINE NO.3006 DMC', description: 'PROPULSION FEEDBACK', carType: 'DMC', subsystem: 'TRL', system: 'TRAC' },
  { drawingNo: '942-58131', title: 'TRAINLINE NO.3007 DMC', description: 'TCMS_RIO_IN-1', carType: 'DMC', subsystem: 'TRL', system: 'TMS' },
  { drawingNo: '942-58131', title: 'TRAINLINE NO.3008 DMC', description: 'TCMS_RIO_IN-2', carType: 'DMC', subsystem: 'TRL', system: 'TMS' },
  { drawingNo: '942-58131', title: 'TRAINLINE NO.3009 DMC', description: 'TCMS_RIO_OUT-1', carType: 'DMC', subsystem: 'TRL', system: 'TMS' },
  { drawingNo: '942-58131', title: 'TRAINLINE NO.3010 DMC', description: 'TCMS_RIO_OUT-2', carType: 'DMC', subsystem: 'TRL', system: 'TMS' },
  
  // Trainlines - TC (4000 series)
  { drawingNo: '942-58132', title: 'TRAINLINE NO.4021 TC', description: 'CCTV_ETH-1', carType: 'TC', subsystem: 'TRL', system: 'COMMS' },
  { drawingNo: '942-58132', title: 'TRAINLINE NO.4022 TC', description: 'CCTV_ETH-2', carType: 'TC', subsystem: 'TRL', system: 'COMMS' },
  { drawingNo: '942-58132', title: 'TRAINLINE NO.4024 TC', description: 'AAU_AUDIO_IN', carType: 'TC', subsystem: 'TRL', system: 'COMMS' },
  { drawingNo: '942-58132', title: 'TRAINLINE NO.4062 TC', description: 'PEAU_SIGNAL', carType: 'TC', subsystem: 'TRL', system: 'AAU' },
  { drawingNo: '942-58132', title: 'TRAINLINE NO.4103 TC', description: 'TFT_ETH-1', carType: 'TC', subsystem: 'TRL', system: 'COMMS' },
  { drawingNo: '942-58132', title: 'TRAINLINE NO.4122 TC', description: 'TCMS_COMM-1', carType: 'TC', subsystem: 'TRL', system: 'TMS' },
  
  // Trainlines - MC (6000 series)
  { drawingNo: '942-58133', title: 'TRAINLINE NO.6009 MC', description: 'DOOR_OPEN_CMD', carType: 'MC', subsystem: 'TRL', system: 'DOOR' },
  { drawingNo: '942-58133', title: 'TRAINLINE NO.6014 MC', description: 'DOOR_CLOSE_CMD', carType: 'MC', subsystem: 'TRL', system: 'DOOR' },
  { drawingNo: '942-58133', title: 'TRAINLINE NO.6046 MC', description: 'DOOR_OPEN_FB', carType: 'MC', subsystem: 'TRL', system: 'DOOR' },
  { drawingNo: '942-58133', title: 'TRAINLINE NO.6051 MC', description: 'DOOR_CLOSE_FB', carType: 'MC', subsystem: 'TRL', system: 'DOOR' },
  { drawingNo: '942-58133', title: 'TRAINLINE NO.6112 MC', description: 'TCMS_TB_SIGNAL', carType: 'MC', subsystem: 'TRL', system: 'TMS' },
  
  // Trainlines - APS (5000 series)
  { drawingNo: '942-58134', title: 'TRAINLINE NO.5000 TC', description: 'SHORE_SUPPLY', carType: 'TC', subsystem: 'APS', system: 'APS' },
  { drawingNo: '942-58134', title: 'TRAINLINE NO.5030 TC', description: 'SIV_CONTACT-1', carType: 'TC', subsystem: 'APS', system: 'APS' },
  { drawingNo: '942-58134', title: 'TRAINLINE NO.5031 TC', description: 'SIV_CONTACT-2', carType: 'TC', subsystem: 'APS', system: 'APS' },
  { drawingNo: '942-58134', title: 'TRAINLINE NO.5064 TC', description: 'BAT_UNDER_VOLT', carType: 'TC', subsystem: 'APS', system: 'APS' },
  
  // Brake System
  { drawingNo: '942-58123', title: 'BRAKE CONTROL CIRCUIT', description: 'BCU control and compressor control', carType: 'ALL', subsystem: 'BRAKE', system: 'BRAKE' },
  { drawingNo: '942-58124', title: 'EMERGENCY BRAKE CIRCUIT', description: 'Emergency brake valve and EM loop', carType: 'ALL', subsystem: 'BRAKE', system: 'BRAKE' },
  { drawingNo: '942-58125', title: 'BRAKE ELECTRONICS', description: 'BECU and pressure sensor wiring', carType: 'ALL', subsystem: 'BRAKE', system: 'BRAKE' },
  { drawingNo: '942-58126', title: 'PARKING BRAKE CIRCUIT', description: 'Parking brake valve control', carType: 'ALL', subsystem: 'BRAKE', system: 'BRAKE' },
  { drawingNo: '942-58127', title: 'BRAKE PNEUMATIC CIRCUIT', description: 'Air piping and reservoirs', carType: 'ALL', subsystem: 'BRAKE', system: 'BRAKE' },
  
  // Traction System
  { drawingNo: '942-58119', title: 'TRACTION MOTOR CIRCUIT', description: 'Traction motor power and control wiring', carType: 'MC', subsystem: 'TRAC', system: 'TRAC' },
  { drawingNo: '942-58120', title: 'VVVF CONTROL CIRCUIT', description: 'VVVF inverter control and status signals', carType: 'MC', subsystem: 'TRAC', system: 'TRAC' },
  { drawingNo: '942-58121', title: 'TRACTION POWER CIRCUIT', description: 'Main power and filtering circuit', carType: 'MC', subsystem: 'TRAC', system: 'TRAC' },
  
  // Door System
  { drawingNo: '942-58137', title: 'DOOR SUPPLY CIRCUIT', description: 'Door power supply and distribution', carType: 'ALL', subsystem: 'DOOR', system: 'DOOR' },
  { drawingNo: '942-58138', title: 'DOOR CONTROL CIRCUIT', description: 'DCU control and motor drive', carType: 'ALL', subsystem: 'DOOR', system: 'DOOR' },
  { drawingNo: '942-58139', title: 'DOOR POSITION SENSORS', description: 'Position sensor wiring', carType: 'ALL', subsystem: 'DOOR', system: 'DOOR' },
  { drawingNo: '942-58140', title: 'DOOR PROVING LOOP', description: 'Proving loop circuit', carType: 'ALL', subsystem: 'DOOR', system: 'DOOR' },
  { drawingNo: '942-58141', title: 'DOOR LOCAL CONTROL', description: 'Local control panel wiring', carType: 'ALL', subsystem: 'DOOR', system: 'DOOR' },
  { drawingNo: '942-58142', title: 'DOOR EMERGENCY RELEASE', description: 'Emergency release circuit', carType: 'ALL', subsystem: 'DOOR', system: 'DOOR' },
  
  // APS System
  { drawingNo: '942-58130', title: 'APS MAIN CIRCUIT', description: 'APS unit and battery system', carType: 'TC', subsystem: 'APS', system: 'APS' },
  { drawingNo: '942-58131', title: 'SIV AND DISTRIBUTION', description: 'Static inverter and EDB distribution', carType: 'TC', subsystem: 'APS', system: 'APS' },
  { drawingNo: '942-58132', title: 'SHORE SUPPLY', description: 'Shore supply box and connection', carType: 'TC', subsystem: 'APS', system: 'APS' },
  
  // VAC/HVAC System
  { drawingNo: '942-58143', title: 'CAB HVAC CIRCUIT', description: 'Cab air conditioning', carType: 'CAB', subsystem: 'VAC', system: 'VAC' },
  { drawingNo: '942-58144', title: 'SALOON HVAC CIRCUIT', description: 'Saloon air conditioning', carType: 'ALL', subsystem: 'VAC', system: 'VAC' },
  { drawingNo: '942-58145', title: 'SMOKE DETECTION', description: 'Fire detection system', carType: 'ALL', subsystem: 'VAC', system: 'VAC' },
  
  // TCMS System
  { drawingNo: '942-58146', title: 'TCMS SYSTEM OVERVIEW', description: 'Complete TCMS architecture', carType: 'ALL', subsystem: 'TMS', system: 'TMS' },
  { drawingNo: '942-38409', title: 'TCMS RIO CN11', description: 'TCMS RIO pin assignments', carType: 'ALL', subsystem: 'TMS', system: 'TMS' },
  { drawingNo: '942-38606', title: 'MC CAR TCMS', description: 'MC car TCMS wiring', carType: 'MC', subsystem: 'TMS', system: 'TMS' },
  
  // Communications System
  { drawingNo: '942-58147', title: 'PA SYSTEM', description: 'Public address and DVAS', carType: 'ALL', subsystem: 'COMMS', system: 'COMMS' },
  { drawingNo: '942-58148', title: 'DVAS CIRCUIT', description: 'Digital voice announcer', carType: 'ALL', subsystem: 'COMMS', system: 'COMMS' },
  { drawingNo: '942-58149', title: 'PIS SYSTEM', description: 'Passenger information displays', carType: 'ALL', subsystem: 'COMMS', system: 'COMMS' },
  { drawingNo: '942-58150', title: 'TFT DISPLAY CIRCUIT', description: 'Display wiring', carType: 'ALL', subsystem: 'COMMS', system: 'COMMS' },
  { drawingNo: '942-58151', title: 'RADIO SYSTEM', description: 'Train radio', carType: 'ALL', subsystem: 'COMMS', system: 'COMMS' },
  { drawingNo: '942-58152', title: 'ATC/CBTC', description: 'Automatic train control', carType: 'ALL', subsystem: 'COMMS', system: 'COMMS' },
  { drawingNo: '942-58153', title: 'CCTV SYSTEM', description: 'Closed circuit TV', carType: 'ALL', subsystem: 'COMMS', system: 'COMMS' },
  { drawingNo: '942-58154', title: 'CAMERA WIRING', description: 'Camera connections', carType: 'ALL', subsystem: 'COMMS', system: 'COMMS' },
  
  // HV System
  { drawingNo: '942-58103', title: 'HV SYSTEM CIRCUIT', description: 'HSCB, HTEB, HTJB, earth brushes', carType: 'DMC', subsystem: 'HV', system: 'HV' },
  { drawingNo: '942-58104', title: 'PANTOGRAPH CIRCUIT', description: 'Pantograph and surge protection', carType: 'MC', subsystem: 'HV', system: 'HV' },
  
  // Bogie System
  { drawingNo: '942-58128', title: 'BOGIE SPEED SENSORS', description: 'Speed and wheel diameter sensors', carType: 'ALL', subsystem: 'BOGIE', system: 'BOGIE' },
  { drawingNo: '942-58129', title: 'BOGIE MONITORING', description: 'Suspension and temperature', carType: 'ALL', subsystem: 'BOGIE', system: 'BOGIE' },
  
  // General
  { drawingNo: '942-58099', title: 'VCC DRAWING LIST', description: 'Drawing index and classification', carType: 'ALL', subsystem: 'GEN', system: 'GEN' },
  { drawingNo: '942-58100', title: 'DRAWING CLASSIFICATION', description: 'Classification system', carType: 'ALL', subsystem: 'GEN', system: 'GEN' },
  { drawingNo: '942-58101', title: 'WIRING NUMBER SYSTEM', description: 'Wire numbering conventions', carType: 'ALL', subsystem: 'GEN', system: 'GEN' },
  { drawingNo: '942-58102', title: 'SYMBOL LIBRARY', description: 'Electrical symbols', carType: 'ALL', subsystem: 'GEN', system: 'GEN' },
  
  // DMC Pin Drawings
  { drawingNo: '942-38309', title: 'DMC UNDERFRAME PIN - LTEB', description: 'LTEB, VVVF, BCU, HSCB pin assignments', carType: 'DMC', subsystem: 'UF', system: 'TRAC' },
  { drawingNo: '942-38342', title: 'DMC TCMS RIO CN11', description: 'TCMS RIO CN11 connector pins', carType: 'DMC', subsystem: 'TMS', system: 'TMS' },
  { drawingNo: '942-38343', title: 'DMC TCMS RIO CN12', description: 'TCMS RIO CN12 connector pins', carType: 'DMC', subsystem: 'TMS', system: 'TMS' },
  { drawingNo: '942-38344', title: 'DMC TCMS RIO CN15', description: 'TCMS RIO CN15 connector pins', carType: 'DMC', subsystem: 'TMS', system: 'TMS' },
  { drawingNo: '942-38345', title: 'DMC TCMS RIO CN17', description: 'TCMS RIO CN17 connector pins', carType: 'DMC', subsystem: 'TMS', system: 'TMS' },
  
  // TC Pin Drawings
  { drawingNo: '942-38509', title: 'TC UNDERFRAME PIN - APS', description: 'APS, BECU, ESK, EDB2 pin assignments', carType: 'TC', subsystem: 'UF', system: 'APS' },
  { drawingNo: '942-38510', title: 'TC CEILING PIN - TCMS_RIO2', description: 'TCMS_RIO2, DCU2, VAC2 pin assignments', carType: 'TC', subsystem: 'CEILING', system: 'TMS' },
  { drawingNo: '942-38519', title: 'TC BRAKE CIRCUIT', description: 'TC brake system wiring', carType: 'TC', subsystem: 'BRAKE', system: 'BRAKE' },
  
  // MC Pin Drawings
  { drawingNo: '942-38609', title: 'MC UNDERFRAME PIN - VVVF2', description: 'VVVF2, BCU3, BECU1, LTEB3 pin assignments', carType: 'MC', subsystem: 'UF', system: 'TRAC' },
  { drawingNo: '942-38610', title: 'MC CEILING PIN - TCMS_RIO1', description: 'TCMS_RIO1, DCU1, VAC1, ETH pin assignments', carType: 'MC', subsystem: 'CEILING', system: 'TMS' },
  { drawingNo: '942-38603', title: 'MC DOOR WIRING', description: 'MC door system wiring', carType: 'MC', subsystem: 'DOOR', system: 'DOOR' },
  { drawingNo: '942-38606', title: 'MC TCMS RIO', description: 'MC TCMS RIO pin assignment', carType: 'MC', subsystem: 'TMS', system: 'TMS' },
  { drawingNo: '942-38607', title: 'MC CCTV WIRING', description: 'MC CCTV system wiring', carType: 'MC', subsystem: 'COMMS', system: 'COMMS' },
  
  // VCC Description Reference
  { drawingNo: 'VCC-001', title: 'VCC DESCRIPTION COVER', description: 'VCC system description cover page', carType: 'ALL', subsystem: 'GEN', system: 'GEN' },
  { drawingNo: 'VCC-002', title: 'TRAINLINE REFERENCE 1000-9000', description: 'Complete trainline number reference', carType: 'ALL', subsystem: 'TRL', system: 'TRL' },
  { drawingNo: 'VCC-003', title: 'CONNECTOR PIN ASSIGNMENTS', description: 'All connector pin assignments by car', carType: 'ALL', subsystem: 'GEN', system: 'GEN' },
  { drawingNo: 'VCC-004', title: 'EQUIPMENT LAYOUT - DMC', description: 'DMC equipment locations', carType: 'DMC', subsystem: 'GEN', system: 'GEN' },
  { drawingNo: 'VCC-005', title: 'EQUIPMENT LAYOUT - TC', description: 'TC equipment locations', carType: 'TC', subsystem: 'GEN', system: 'GEN' },
  { drawingNo: 'VCC-006', title: 'EQUIPMENT LAYOUT - MC', description: 'MC equipment locations', carType: 'MC', subsystem: 'GEN', system: 'GEN' },
  { drawingNo: 'VCC-007', title: 'CROSS-CONNECTION DETAILS', description: 'X1, J43-47 cross connections', carType: 'ALL', subsystem: 'TRL', system: 'TRL' },
  { drawingNo: 'VCC-008', title: 'INTER-CAR JUMPER PINOUT', description: 'X1-X4 jumper pin configurations', carType: 'ALL', subsystem: 'TRL', system: 'TRL' },
  { drawingNo: 'VCC-009', title: 'VVVF CONNECTOR DETAILS', description: 'VVVF CN1-CN4 pin details', carType: 'MC', subsystem: 'TRAC', system: 'TRAC' },
  { drawingNo: 'VCC-010', title: 'TCMS RIO POINT MAPPING', description: 'TCMS RIO digital I/O mapping', carType: 'ALL', subsystem: 'TMS', system: 'TMS' },
];

export function getAllVCCDrawings() {
  return VCC_OCR_DRAWINGS;
}

export function getDrawingsBySystem(system: string) {
  return VCC_OCR_DRAWINGS.filter(d => d.system === system);
}

export function getDrawingsByCarType(carType: string) {
  return VCC_OCR_DRAWINGS.filter(d => d.carType === carType || d.carType === 'ALL');
}

export function getDrawingByNumber(drawingNo: string) {
  return VCC_OCR_DRAWINGS.find(d => d.drawingNo === drawingNo);
}

export const TOTAL_DRAWINGS = VCC_OCR_DRAWINGS.length;