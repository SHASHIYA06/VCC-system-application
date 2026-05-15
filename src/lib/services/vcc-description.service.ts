import { prisma } from '@/lib/prisma';

const COMPREHENSIVE_ABBREVIATIONS = [
  { abbreviation: 'AC1,2CB', description: 'Saloon Air-con1,2 Circuit Breaker', category: 'VAC' },
  { abbreviation: 'ADCLp', description: 'All Doors Closed Indicator', category: 'DOOR' },
  { abbreviation: 'ADCR', description: 'All Doors Closed Relay', category: 'DOOR' },
  { abbreviation: 'AUX ON', description: 'Auxiliary On Switch', category: 'APS' },
  { abbreviation: 'BCU', description: 'Brake Control Unit', category: 'BRAKE' },
  { abbreviation: 'BECU', description: 'Brake Electronic Control Unit', category: 'BRAKE' },
  { abbreviation: 'CM', description: 'Compressor Motor', category: 'BRAKE' },
  { abbreviation: 'CML', description: 'Cab Main Light', category: 'LIGHT' },
  { abbreviation: 'DMS', description: 'Door Mode Switch', category: 'DOOR' },
  { abbreviation: 'EBMV', description: 'Emergency Brake Magnetic Valve', category: 'BRAKE' },
  { abbreviation: 'HSCB', description: 'High Speed Circuit Breaker', category: 'HV' },
  { abbreviation: 'HCR', description: 'Head Control Relay', category: 'CAB' },
  { abbreviation: 'KOR', description: 'Key On Relay', category: 'CAB' },
  { abbreviation: 'LCAR', description: 'Last Cab Activated Relay', category: 'CAB' },
  { abbreviation: 'MS', description: 'Mode Selector', category: 'CAB' },
  { abbreviation: 'PBMV', description: 'Parking Brake Magnetic Valve', category: 'BRAKE' },
  { abbreviation: 'STUR', description: 'Start-Up Relay', category: 'APS' },
  { abbreviation: 'TBC', description: 'Traction Brake Controller', category: 'TRAC' },
  { abbreviation: 'TCR', description: 'Tail Control Relay', category: 'CAB' },
  { abbreviation: 'TCMS', description: 'Train Control Management System', category: 'TMS' },
  { abbreviation: 'VVVF', description: 'Variable Voltage Variable Frequency Inverter', category: 'TRAC' },
  { abbreviation: 'ZVAR', description: 'Zero Velocity Auxiliary Relay', category: 'TRAC' },
  { abbreviation: 'ASDR', description: 'Auxiliary Shut Down Relay', category: 'APS' },
  { abbreviation: 'AOFFS', description: 'Auxiliary Off Switch', category: 'APS' },
  { abbreviation: 'RESET', description: 'Reset Push Button', category: 'TRL' },
  { abbreviation: 'TLSC', description: 'Train Line Supply Contactor', category: 'TRL' },
  { abbreviation: 'DCU', description: 'Door Control Unit', category: 'DOOR' },
  { abbreviation: 'EDCU', description: 'Electronic Door Control Unit', category: 'DOOR' },
  { abbreviation: 'DOLR', description: 'Door Open Left Relay', category: 'DOOR' },
  { abbreviation: 'DORR', description: 'Door Open Right Relay', category: 'DOOR' },
  { abbreviation: 'DCLR', description: 'Door Close Left Relay', category: 'DOOR' },
  { abbreviation: 'DCRR', description: 'Door Close Right Relay', category: 'DOOR' },
  { abbreviation: 'DPR', description: 'Door Proving Relay', category: 'DOOR' },
  { abbreviation: 'APS', description: 'Auxiliary Power Supply', category: 'APS' },
  { abbreviation: 'SIV', description: 'Static Inverter', category: 'APS' },
  { abbreviation: 'SSB', description: 'Shore Supply Box', category: 'APS' },
  { abbreviation: 'BATT', description: 'Battery', category: 'APS' },
  { abbreviation: 'BCB', description: 'Battery Charger Breaker', category: 'APS' },
  { abbreviation: 'BUVDR', description: 'Battery Under Voltage Detector Relay', category: 'APS' },
  { abbreviation: 'APSCB', description: 'Auxiliary Power Supply Circuit Breaker', category: 'APS' },
  { abbreviation: 'SSCB', description: 'Shore Supply Circuit Breaker', category: 'APS' },
  { abbreviation: 'ESK', description: 'Earth Switching Knife', category: 'APS' },
  { abbreviation: 'ADU', description: 'Air Dryer Unit', category: 'BRAKE' },
  { abbreviation: 'BCPS', description: 'Brake Control Pressure Switch', category: 'BRAKE' },
  { abbreviation: 'BLCB', description: 'Brake Line Circuit Breaker', category: 'BRAKE' },
  { abbreviation: 'BLPR', description: 'Brake Loop Pressure Relay', category: 'BRAKE' },
  { abbreviation: 'EBLR', description: 'Emergency Brake Loop Relay', category: 'BRAKE' },
  { abbreviation: 'EBVR', description: 'Emergency Brake Valve Relay', category: 'BRAKE' },
  { abbreviation: 'PBR', description: 'Parking Brake Relay', category: 'BRAKE' },
  { abbreviation: 'HMV1', description: 'Horn Magnetic Valve 1', category: 'BRAKE' },
  { abbreviation: 'HMV2', description: 'Horn Magnetic Valve 2', category: 'BRAKE' },
  { abbreviation: 'COLPB', description: 'Coupling Operating Lever Push Button', category: 'COUPL' },
  { abbreviation: 'UCPB', description: 'Uncoupling Push Button', category: 'COUPL' },
  { abbreviation: 'MCCMV', description: 'Master Coupler Control Magnetic Valve', category: 'COUPL' },
  { abbreviation: 'MCUCMV', description: 'Master Coupler Uncouple Magnetic Valve', category: 'COUPL' },
  { abbreviation: 'MCDR', description: 'Master Coupler Detection Relay', category: 'COUPL' },
  { abbreviation: 'COLR', description: 'Coupler Operating Lever Relay', category: 'COUPL' },
  { abbreviation: 'TBC', description: 'Traction Brake Controller', category: 'TRAC' },
  { abbreviation: 'H7L7956', description: 'Traction Motor 1', category: 'TRAC' },
  { abbreviation: 'EOSS', description: 'Encoder Optical Speed Sensor', category: 'TRAC' },
  { abbreviation: 'TCPU', description: 'Train Central Processing Unit', category: 'TMS' },
  { abbreviation: 'VDU', description: 'Vehicle Display Unit', category: 'TMS' },
  { abbreviation: 'DCS', description: 'Driver Controller System', category: 'TMS' },
  { abbreviation: 'RIO', description: 'Remote I/O', category: 'TMS' },
  { abbreviation: 'PIS', description: 'Passenger Information System', category: 'COMMS' },
  { abbreviation: 'PIB', description: 'Passenger Information Board', category: 'COMMS' },
  { abbreviation: 'DVAU', description: 'Digital Voice Announcer Unit', category: 'COMMS' },
  { abbreviation: 'PAMP', description: 'Power Amplifier', category: 'COMMS' },
  { abbreviation: 'CCTV', description: 'Closed Circuit Television', category: 'COMMS' },
  { abbreviation: 'ATPCB', description: 'ATP Circuit Breaker', category: 'COMMS' },
  { abbreviation: 'TRU', description: 'Transformer Rectifier Unit', category: 'COMMS' },
  { abbreviation: 'HLS', description: 'Head Light Signal', category: 'LIGHT' },
  { abbreviation: 'HL(L/R)', description: 'Head Light Left/Right', category: 'LIGHT' },
  { abbreviation: 'TL(L/R)', description: 'Tail Light Left/Right', category: 'LIGHT' },
  { abbreviation: 'FL', description: 'Flasher Light', category: 'LIGHT' },
  { abbreviation: 'DCL', description: 'Door Console Light', category: 'LIGHT' },
  { abbreviation: 'ELCB1-4', description: 'Earth Leakage Circuit Breaker 1-4', category: 'LIGHT' },
  { abbreviation: 'GWL', description: 'Gangway Light', category: 'LIGHT' },
  { abbreviation: 'WWCB', description: 'Windscreen Wiper Circuit Breaker', category: 'LIGHT' },
  { abbreviation: 'CAB_VAC', description: 'Cabin Air Conditioning', category: 'VAC' },
  { abbreviation: 'VAC', description: 'Air Conditioning Unit', category: 'VAC' },
  { abbreviation: 'ADMV', description: 'Air Damper Magnetic Valve', category: 'VAC' },
  { abbreviation: 'FR', description: 'Filter Regulator', category: 'VAC' },
];

const VCC_SYSTEMS_DATA = [
  { systemCode: 'GEN', systemName: 'General', chapter: 3, description: 'General part drawings provide useful information such as Drawing List, Wiring numbers, description, Train-lines, symbols etc.', drawings: ['942-58099', '942-58100', '942-58101', '942-58102', '942-58103', '942-58104', '942-58105', '942-58106'], keyComponents: ['Drawing List', 'Classification', 'Wiring Numbers', 'Symbols', 'Train Lines'] },
  { systemCode: 'TRL', systemName: 'Train Control', chapter: 4, description: 'Train control circuits including Controlling Cab, start-up, System status indication and Train line supply Contactor circuits.', drawings: ['942-58107', '942-58108', '942-58109', '942-58110', '942-58111'], keyComponents: ['HCR', 'TCR', 'LCAR', 'STUR', 'ASDR', 'AUX ON', 'AOFFS', 'RESET', 'TLSC'] },
  { systemCode: 'LIGHT', systemName: 'Vehicle Structure & Interior', chapter: 5, description: 'Vehicle structure & interior fitting circuits including Head Light, Cab Main Light, Tail Light, Flasher Light, Console Light, Saloon Lights, Gangway Light, Windscreen Wiper.', drawings: ['942-58112', '942-58113', '942-58114', '942-58115', '942-58116'], keyComponents: ['HLS', 'HL(L/R)', 'CML', 'TL(L/R)', 'FL', 'DCL', 'ELCB1-4', 'GWL', 'WWCB'] },
  { systemCode: 'COUPL', systemName: 'Coupling & Uncoupling', chapter: 6, description: 'Coupling and uncoupling control circuits for train set connection.', drawings: ['942-58117'], keyComponents: ['COLPB', 'UCPB', 'MCCMV', 'MCUCMV', 'MCDR', 'COLR'] },
  { systemCode: 'TRAC', systemName: 'Traction System', chapter: 7, description: 'Traction system including DC750V main power supply, speed control, VVVF Inverter interface and grounding.', drawings: ['H7L7956', '942-58119', '942-58120', '942-58121'], keyComponents: ['HSCB', 'VVVF', 'TBC', 'MS', 'EB(1-4)', 'EOSS'] },
  { systemCode: 'BRAKE', systemName: 'Brake System', chapter: 8, description: 'Brake system including Compressor Control, Brake Loop, Emergency Brake Loop, Parking Brake, Horn and Brake Control.', drawings: ['942-58123', '942-58124', '942-58125', '942-58126', '942-58127', '942-58128', '942-58129'], keyComponents: ['CM', 'ADU', 'BCU', 'BECU', 'BCPS', 'BLCB', 'BLPR', 'EBLR', 'EBMV', 'EBVR', 'PBR', 'PBMV', 'HMV1', 'HMV2'] },
  { systemCode: 'APS', systemName: 'Auxiliary Power System', chapter: 9, description: 'Auxiliary power system including APS, Shore Supply 415VAC, Power Extension Box and Battery Control.', drawings: ['942-58130', '942-58131', '942-58132'], keyComponents: ['APS', 'SSB', 'SIV', 'BATT', 'BCB', 'BUVDR', 'APSCB', 'SSCB', 'ESK'] },
  { systemCode: 'DOOR', systemName: 'Door System', chapter: 10, description: 'Door system including Saloon Door Supply Voltage, Door Operation, Door Proving Loop, Local Door Interlock Circuit and Communication with TCMS.', drawings: ['942-58137', '942-58138', '942-58139', '942-58140', '942-58141', '942-58142'], keyComponents: ['DCU', 'EDCU', 'DMS', 'DOLR', 'DORR', 'DCLR', 'DCRR', 'DPR', 'ADCR', 'ADCLp'] },
  { systemCode: 'VAC', systemName: 'Air Conditioning System', chapter: 11, description: 'Air conditioning system including Cab VAC and Saloon VAC.', drawings: ['942-58143', '942-58144', '942-58145'], keyComponents: ['CAB_VAC', 'VAC', 'ADMV', 'FR'] },
  { systemCode: 'TMS', systemName: 'Train Management System', chapter: 12, description: 'Train Management System (TCMS) for train control and monitoring.', drawings: ['942-58146'], keyComponents: ['TCMS', 'RIO', 'TCPU', 'VDU', 'DCS'] },
  { systemCode: 'COMMS', systemName: 'Communication System', chapter: 13, description: 'Communication system including PIS, PA, CCTV, Radio, ATP interface.', drawings: ['942-58147', '942-58148', '942-58149', '942-58150', '942-58151', '942-58152', '942-58153', '942-58154'], keyComponents: ['PIS', 'PIB', 'DVAU', 'PA', 'PAMP', 'CCTV', 'VDU', 'ATPCB', 'TRU'] },
];

const WIRE_CLASSIFICATION = {
  'HV': { code: 'HV', description: 'Main Circuit 750V', color: 'red' },
  'ED': { code: 'ED', description: 'Propulsion Circuits - AC Traction Motors', color: 'orange' },
  'AP': { code: 'AP', description: 'Auxiliary Power - 3Ph 415V & 230VAC, 50Hz', color: 'green' },
  'BA': { code: 'BA', description: 'Battery Supply - 110V DC', color: 'blue' },
  'S': { code: 'S', description: 'Shielded - Measuring & Analogue Signals', color: 'purple' },
};

const PIN_DRAWING_REFERENCES = [
  { drawingNo: '942-38309', title: 'DMC UNDERFRAME PIN - LTEB', carType: 'DMC', location: 'UNDERFRAME', description: 'LTEB, VVVF, BCU, HSCB pin assignments' },
  { drawingNo: '942-38342', title: 'DMC TCMS RIO CN11', carType: 'DMC', location: 'CEILING', description: 'TCMS RIO CN11 connector pins' },
  { drawingNo: '942-38343', title: 'DMC TCMS RIO CN12', carType: 'DMC', location: 'CEILING', description: 'TCMS RIO CN12 connector pins' },
  { drawingNo: '942-38344', title: 'DMC TCMS RIO CN15', carType: 'DMC', location: 'CEILING', description: 'TCMS RIO CN15 connector pins' },
  { drawingNo: '942-38345', title: 'DMC TCMS RIO CN17', carType: 'DMC', location: 'CEILING', description: 'TCMS RIO CN17 connector pins' },
  { drawingNo: '942-38509', title: 'TC UNDERFRAME PIN - APS', carType: 'TC', location: 'UNDERFRAME', description: 'APS, BECU, ESK, EDB2 pin assignments' },
  { drawingNo: '942-38510', title: 'TC CEILING PIN - TCMS_RIO2', carType: 'TC', location: 'CEILING', description: 'TCMS_RIO2, DCU2, VAC2 pin assignments' },
  { drawingNo: '942-38519', title: 'TC BRAKE CIRCUIT', carType: 'TC', location: 'UNDERFRAME', description: 'TC brake system wiring' },
  { drawingNo: '942-38609', title: 'MC UNDERFRAME PIN - VVVF2', carType: 'MC', location: 'UNDERFRAME', description: 'VVVF2, BCU3, BECU1, LTEB3 pin assignments' },
  { drawingNo: '942-38610', title: 'MC CEILING PIN - TCMS_RIO1', carType: 'MC', location: 'CEILING', description: 'TCMS_RIO1, DCU1, VAC1, ETH pin assignments' },
  { drawingNo: '942-38603', title: 'MC DOOR WIRING', carType: 'MC', location: 'DOOR', description: 'MC door system wiring' },
  { drawingNo: '942-38606', title: 'MC TCMS RIO', carType: 'MC', location: 'CEILING', description: 'MC TCMS RIO pin assignment' },
  { drawingNo: '942-38607', title: 'MC CCTV WIRING', carType: 'MC', location: 'CEILING', description: 'MC CCTV system wiring' },
  { drawingNo: 'TC_CEILING', title: 'TC CEILING PIN DRAWINGS', carType: 'TC', location: 'CEILING', description: 'Train Controller ceiling pin assignments' },
  { drawingNo: 'TC_UF', title: 'TC UNDERFRAME PIN DRAWINGS', carType: 'TC', location: 'UNDERFRAME', description: 'TC underframe pin assignments' },
  { drawingNo: 'MC_CEILING', title: 'MC CEILING PIN DRAWINGS', carType: 'MC', location: 'CEILING', description: 'Master Controller ceiling pin assignments' },
  { drawingNo: 'MC_UF', title: 'MC UNDERFRAME PIN DRAWINGS', carType: 'MC', location: 'UNDERFRAME', description: 'Master Controller underframe pin assignments' },
  { drawingNo: 'DMC_UF', title: 'DMC UNDERFRAME PIN DRAWINGS', carType: 'DMC', location: 'UNDERFRAME', description: 'Driving Motor Coach underframe pin assignments' },
  { drawingNo: 'DMC_CEILING', title: 'DMC CEILING PIN DRAWINGS', carType: 'DMC', location: 'CEILING', description: 'Driving Motor Coach ceiling pin assignments' },
  { drawingNo: 'CAB_PIN', title: 'CAB PIN DRAWINGS', carType: 'CAB', location: 'CAB', description: 'Cabin connector pin assignments' },
];

export async function getVCCDescription() {
  const systems = await prisma.system.findMany({ orderBy: { sortOrder: 'asc' } });
  const drawings = await prisma.drawing.findMany({ take: 100 });

  return {
    document: {
      title: 'VCC Description Document',
      docNo: 'GR/TD/3328',
      date: '13.12.2017',
      revision: '01',
      pages: 54,
      sourceFile: 'VCC DESCRIPTION 13.12.2017.pdf'
    },
    systems: systems.map(s => ({ code: s.code, name: s.name, description: s.description })),
    drawings: drawings.map(d => ({ drawingNo: d.drawingNo, title: d.title, revision: d.revision })),
    totalSystems: systems.length,
    totalDrawings: drawings.length,
  };
}

export async function getVCCAbbreviations() {
  return COMPREHENSIVE_ABBREVIATIONS;
}

export async function getVCCSystems() {
  return VCC_SYSTEMS_DATA;
}

export async function getWireClassification() {
  return WIRE_CLASSIFICATION;
}

export async function getPinDrawings() {
  return PIN_DRAWING_REFERENCES;
}

export async function searchVCCData(query: string) {
  const q = query.toLowerCase();
  
  const matchingAbbrs = COMPREHENSIVE_ABBREVIATIONS.filter(a => 
    a.abbreviation.toLowerCase().includes(q) || 
    a.description.toLowerCase().includes(q)
  );
  
  const matchingSystems = VCC_SYSTEMS_DATA.filter(s => 
    s.systemCode.toLowerCase().includes(q) || 
    s.systemName.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q)
  );
  
  return {
    abbreviations: matchingAbbrs,
    systems: matchingSystems,
    total: matchingAbbrs.length + matchingSystems.length
  };
}