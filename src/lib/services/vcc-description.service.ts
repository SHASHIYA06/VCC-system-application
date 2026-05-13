import fs from 'fs';
import path from 'path';
import { prisma } from '../prisma';

export interface VCCAbbreviation {
  abbreviation: string;
  description: string;
  category: string;
}

export interface VCCChapter {
  chapterNo: number;
  title: string;
  description: string;
  drawings: { drawingNo: string; title: string }[];
  sections: { sectionNo: string; title: string; content: string }[];
}

export interface VCCSystem {
  systemCode: string;
  systemName: string;
  chapter: number;
  description: string;
  drawings: string[];
  keyComponents: string[];
}

const ABBREVIATIONS: VCCAbbreviation[] = [
  { abbreviation: 'AC1,2CB', description: 'Saloon Air-con1,2 Circuit Breaker', category: 'VAC' },
  { abbreviation: 'ACP', description: 'Auxiliary Control Panel for PA/PIS', category: 'COMMS' },
  { abbreviation: 'ADCLp', description: 'All Doors Closed Indicator', category: 'DOOR' },
  { abbreviation: 'ADCR', description: 'All Doors Closed Relay', category: 'DOOR' },
  { abbreviation: 'ADMV', description: 'Auto Drain Magnetic Valve', category: 'VAC' },
  { abbreviation: 'ADU', description: 'Air Dryer Unit', category: 'BRAKE' },
  { abbreviation: 'AOFFS', description: 'Auxiliary Off Switch', category: 'APS' },
  { abbreviation: 'APFLp', description: 'Auxiliary Power Fault Indicator Lamp', category: 'APS' },
  { abbreviation: 'APSFR', description: 'Auxiliary Power Supply Fault Relay', category: 'APS' },
  { abbreviation: 'APSCB1,2', description: 'APS Circuit Breaker1,2', category: 'APS' },
  { abbreviation: 'ASDR', description: 'Auxiliary Shut Down Relay', category: 'APS' },
  { abbreviation: 'ATPCB', description: 'ATP Circuit Breaker', category: 'COMMS' },
  { abbreviation: 'AUX ON', description: 'Auxiliary On Switch', category: 'APS' },
  { abbreviation: 'BBRSCB', description: 'BBRS Circuit Breaker', category: 'BRAKE' },
  { abbreviation: 'BCB', description: 'Battery Control Box', category: 'APS' },
  { abbreviation: 'BCBCB', description: 'Battery Control Box Circuit Breaker', category: 'APS' },
  { abbreviation: 'BCCOS1,2', description: 'Brake Cylinder Cut Out Switch1,2', category: 'BRAKE' },
  { abbreviation: 'BCU', description: 'Brake Control Unit', category: 'BRAKE' },
  { abbreviation: 'BCPS', description: 'Brake Cylinder Pressure Switch', category: 'BRAKE' },
  { abbreviation: 'BECU', description: 'Brake Electronic Control Unit', category: 'BRAKE' },
  { abbreviation: 'BECUCB1,2', description: 'BECU Circuit Breaker1,2', category: 'BRAKE' },
  { abbreviation: 'BF1,2', description: 'Battery Fuse1,2', category: 'APS' },
  { abbreviation: 'BIC', description: 'Battery Isolation Contactor', category: 'HV' },
  { abbreviation: 'BIS', description: 'Battery Isolation Switch', category: 'HV' },
  { abbreviation: 'BLCB', description: 'Brake Loop Circuit Breaker', category: 'BRAKE' },
  { abbreviation: 'BLPR', description: 'Brake Loop Proving Relay', category: 'BRAKE' },
  { abbreviation: 'BPIMV', description: 'Brake Pipe Pressure Isolation Magnetic Valve', category: 'BRAKE' },
  { abbreviation: 'BPPS', description: 'Brake Pipe Pressure Switch', category: 'BRAKE' },
  { abbreviation: 'BUVDR', description: 'Battery Under Voltage Detection Relay', category: 'APS' },
  { abbreviation: 'CACCB', description: 'Cab A/C Circuit Breaker', category: 'VAC' },
  { abbreviation: 'CCCB', description: 'Coupling Control Circuit Breaker', category: 'COUPL' },
  { abbreviation: 'CC1,2CB', description: 'Controlling Cab Circuit Breaker', category: 'CAB' },
  { abbreviation: 'CCTVCB', description: 'CCTV Circuit Breaker', category: 'COMMS' },
  { abbreviation: 'CM', description: 'Compressor Motor', category: 'BRAKE' },
  { abbreviation: 'CMCB', description: 'Compressor Motor Circuit Breaker', category: 'BRAKE' },
  { abbreviation: 'CMLCB', description: 'Cab Main Light Circuit Breaker', category: 'LIGHT' },
  { abbreviation: 'COLR', description: 'Call-On Light Relay', category: 'COUPL' },
  { abbreviation: 'COLS', description: 'Call-On Light Switch', category: 'COUPL' },
  { abbreviation: 'CSDOS', description: 'Cab Side Door Open Limit Switch', category: 'DOOR' },
  { abbreviation: 'CSPDS', description: 'Cab Saloon Partition Door Limit Switch', category: 'DOOR' },
  { abbreviation: 'DCAPB', description: 'Door Close Announcement Push Button', category: 'DOOR' },
  { abbreviation: 'DCRCB', description: 'Door Close Circuit Breaker', category: 'DOOR' },
  { abbreviation: 'DCLCB', description: 'Door Close Circuit Breaker(Left)', category: 'DOOR' },
  { abbreviation: 'DPLCB', description: 'Door Proving Loop Circuit Breaker', category: 'DOOR' },
  { abbreviation: 'DCLPB1,2', description: 'Door Close Push Button (Left)1,2', category: 'DOOR' },
  { abbreviation: 'DCLR', description: 'Door Close Relay(Left)', category: 'DOOR' },
  { abbreviation: 'DCRPB1,2', description: 'Door Close Push Button (Right)1,2', category: 'DOOR' },
  { abbreviation: 'DCRR', description: 'Door Close Relay (Right)', category: 'DOOR' },
  { abbreviation: 'DMS', description: 'Door Mode Switch', category: 'DOOR' },
  { abbreviation: 'DOLPB11,12,2', description: 'Door Open Push Button, Left 11,12,2', category: 'DOOR' },
  { abbreviation: 'DORPB11,12,2', description: 'Door Open Push Button, Right 11,12,2', category: 'DOOR' },
  { abbreviation: 'DOLR', description: 'Door Open Relay (Left)', category: 'DOOR' },
  { abbreviation: 'DORR', description: 'Door Open Relay (Right)', category: 'DOOR' },
  { abbreviation: 'DPR', description: 'Door Proving Relay', category: 'DOOR' },
  { abbreviation: 'DSDBS', description: 'Deadman Safety Device Bypass Switch', category: 'CAB' },
  { abbreviation: 'DCS', description: 'Data Communication Modem', category: 'TMS' },
  { abbreviation: 'EB(1,2,3,4)', description: 'Earth Brush (1,2,3,4)', category: 'HV' },
  { abbreviation: 'EBLR 1(2)', description: 'Emergency Brake Loop Relay', category: 'BRAKE' },
  { abbreviation: 'EBMV', description: 'Emergency Brake Magnetic Valve', category: 'BRAKE' },
  { abbreviation: 'EDB', description: 'Electrical Distribution Board', category: 'LTEB' },
  { abbreviation: 'EBLp', description: 'Emergency Brake Applied Indicator', category: 'BRAKE' },
  { abbreviation: 'EBLRCB', description: 'Emergency Brake Loop Relay Circuit Breaker', category: 'BRAKE' },
  { abbreviation: 'EBMVCB', description: 'Emergency Brake Magnet Valve Circuit Breaker', category: 'BRAKE' },
  { abbreviation: 'EBVR', description: 'Emergency Brake Valve Relay', category: 'BRAKE' },
  { abbreviation: 'EDCU', description: 'Electronic Door Control Unit', category: 'DOOR' },
  { abbreviation: 'ELCB1,2,3,4', description: 'Emergency Light Circuit Breaker1,2,3,4', category: 'LIGHT' },
  { abbreviation: 'ESKCB', description: 'ESK Circuit Breaker', category: 'HV' },
  { abbreviation: 'EOSS', description: 'Electro Optical Speed Sensor', category: 'TRAC' },
  { abbreviation: 'FL', description: 'Flasher Light', category: 'LIGHT' },
  { abbreviation: 'FR', description: 'Fault Relay in VAC', category: 'VAC' },
  { abbreviation: 'FSB', description: 'Full Service Brake', category: 'BRAKE' },
  { abbreviation: 'GWL1,2', description: 'Gangway Light1,2', category: 'LIGHT' },
  { abbreviation: 'HBTLp', description: 'HSCB Trip Indicator', category: 'HV' },
  { abbreviation: 'HCR', description: 'Head Control Relay', category: 'CAB' },
  { abbreviation: 'HL(L/R)', description: 'Head Light (Left)/(Right)', category: 'LIGHT' },
  { abbreviation: 'HLLCB', description: 'Head Light Left Circuit Breaker', category: 'LIGHT' },
  { abbreviation: 'HLRCB', description: 'Head Light Right Circuit Breaker', category: 'LIGHT' },
  { abbreviation: 'HMV1', description: 'Horn Magnetic Valve (Low)', category: 'BRAKE' },
  { abbreviation: 'HMV2', description: 'Horn Magnetic Valve (High)', category: 'BRAKE' },
  { abbreviation: 'HSCB', description: 'High Speed Circuit Breaker', category: 'HV' },
  { abbreviation: 'HTEB', description: 'High Tension Earth Box', category: 'HV' },
  { abbreviation: 'KOR', description: 'Key On Relay', category: 'CAB' },
  { abbreviation: 'LCAR', description: 'Last Cab Activated Relay', category: 'CAB' },
  { abbreviation: 'LDICB', description: 'Local Door Interlock Circuit Breaker', category: 'DOOR' },
  { abbreviation: 'LDRCB', description: 'Local Door Right Circuit Breaker', category: 'DOOR' },
  { abbreviation: 'LDLCB', description: 'Local Door Left Circuit Breaker', category: 'DOOR' },
  { abbreviation: 'LTEB', description: 'Low Tension Earth Box', category: 'LTEB' },
  { abbreviation: 'LTPB', description: 'Lamp Test Push Button', category: 'CAB' },
  { abbreviation: 'LTR', description: 'Lamp Test Relay', category: 'CAB' },
  { abbreviation: 'LVLp', description: 'Line Voltage Indicator', category: 'TRAC' },
  { abbreviation: 'MCP', description: 'Master Control Panel for PA/PIS', category: 'COMMS' },
  { abbreviation: 'MCCMV', description: 'Mechanical Coupler Coupled Magnetic Valve', category: 'COUPL' },
  { abbreviation: 'MCUCMV', description: 'Mechanical Coupler Uncoupled Magnetic Valve', category: 'COUPL' },
  { abbreviation: 'MS', description: 'Mode Selector', category: 'CAB' },
  { abbreviation: 'MSOCB', description: 'Maintenance Socket Outlet Circuit Breaker', category: 'APS' },
  { abbreviation: 'OCOLp', description: 'Other Cab Occupied Indicator', category: 'CAB' },
  { abbreviation: 'PAACB', description: 'PA Amplifier Circuit Breaker', category: 'COMMS' },
  { abbreviation: 'PBLp', description: 'Parking Brake Applied Indicator', category: 'BRAKE' },
  { abbreviation: 'PBCB', description: 'Parking Brake Circuit Breaker', category: 'BRAKE' },
  { abbreviation: 'PBR', description: 'Parking Brake Relay', category: 'BRAKE' },
  { abbreviation: 'PBMV', description: 'Parking Brake Magnetic Valve', category: 'BRAKE' },
  { abbreviation: 'PIBCB', description: 'Passenger Information Board Circuit Breaker', category: 'COMMS' },
  { abbreviation: 'PE', description: 'Protective Earthing', category: 'HV' },
  { abbreviation: 'RP', description: 'Relay Panel', category: 'GEN' },
  { abbreviation: 'SAC1,2CCB', description: 'Saloon Air-con 1,2 Control Circuit Breaker', category: 'VAC' },
  { abbreviation: 'SCS', description: 'Safety Cut Out Switch', category: 'CAB' },
  { abbreviation: 'SCSR', description: 'Safety Cut Out Switch Relay', category: 'CAB' },
  { abbreviation: 'SIVKR', description: 'SIV Contactor Relay', category: 'APS' },
  { abbreviation: 'SOCB', description: 'Socket Outlet Circuit Breaker', category: 'APS' },
  { abbreviation: 'SSCB', description: 'Shore Supply Circuit Breaker', category: 'APS' },
  { abbreviation: 'SSICB', description: 'System Status Indicator Circuit Breaker', category: 'CAB' },
  { abbreviation: 'SSKR', description: 'Shore Supply Contactor Relay', category: 'APS' },
  { abbreviation: 'STUR', description: 'Start-Up Relay', category: 'APS' },
  { abbreviation: 'SUCB', description: 'Start-Up Circuit Breaker', category: 'APS' },
  { abbreviation: 'TBC', description: 'Traction Brake Controller', category: 'TRAC' },
  { abbreviation: 'TBCCB', description: 'Traction Brake Controller Circuit Breaker', category: 'TRAC' },
  { abbreviation: 'TCPU1,2CB', description: 'TCPU1,2 Circuit Breaker', category: 'TMS' },
  { abbreviation: 'TCR', description: 'Tail Control Relay', category: 'CAB' },
  { abbreviation: 'TDOCB', description: 'TCMS Digital Output Circuit Breaker', category: 'TMS' },
  { abbreviation: 'TL(L)/(R)', description: 'Tail Light (Left)/(Right)', category: 'LIGHT' },
  { abbreviation: 'TLCB', description: 'Train Line Circuit Breaker', category: 'TRL' },
  { abbreviation: 'TLFR', description: 'Tail Light Flasher Relay', category: 'LIGHT' },
  { abbreviation: 'TLSC1R', description: 'Train Line Supply Contactor 1 Relay', category: 'TRL' },
  { abbreviation: 'TRUCB', description: 'Train Radio Unit Circuit Breaker', category: 'COMMS' },
  { abbreviation: 'TCMS', description: 'Train Control Management System', category: 'TMS' },
  { abbreviation: 'VDUCB', description: 'Video Display Unit Circuit Breaker', category: 'COMMS' },
  { abbreviation: 'VFCB1,2', description: 'VVVF Inverter1,2 Circuit Breaker', category: 'TRAC' },
  { abbreviation: 'VVVFFLp', description: 'VVVF Fault Indicator', category: 'TRAC' },
  { abbreviation: 'VVVFFR', description: 'VVVF Fault Relay', category: 'TRAC' },
  { abbreviation: 'VAC', description: 'Ventilation and Air Conditioning', category: 'VAC' },
  { abbreviation: 'UCCB', description: 'Uncoupling & coupling Circuit Breaker', category: 'COUPL' },
  { abbreviation: 'UCPB', description: 'Uncoupling Pushbutton', category: 'COUPL' },
  { abbreviation: 'VDU', description: 'Video Display Unit', category: 'COMMS' },
  { abbreviation: 'WWCB', description: 'Windscreen Wiper Circuit Breaker', category: 'LIGHT' },
  { abbreviation: 'ZVAR', description: 'Zero Velocity Auxiliary Relay', category: 'TRAC' },
];

const VCC_SYSTEMS: VCCSystem[] = [
  {
    systemCode: 'GEN',
    systemName: 'General',
    chapter: 3,
    description: 'General part drawings provide useful information such as Drawing List, Wiring numbers, description, Train-lines, symbols etc.',
    drawings: ['942-58099', '942-58100', '942-58101', '942-58102', '942-58103', '942-58104', '942-58105', '942-58106'],
    keyComponents: ['Drawing List', 'Classification', 'Wiring Numbers', 'Symbols', 'Train Lines']
  },
  {
    systemCode: 'TRL',
    systemName: 'Train Control',
    chapter: 4,
    description: 'Train control circuits including Controlling Cab, start-up, System status indication and Train line supply Contactor circuits.',
    drawings: ['942-58107', '942-58108', '942-58109', '942-58110', '942-58111'],
    keyComponents: ['HCR', 'TCR', 'LCAR', 'STUR', 'ASDR', 'AUX ON', 'AOFFS', 'RESET', 'TLSC']
  },
  {
    systemCode: 'LIGHT',
    systemName: 'Vehicle Structure & Interior',
    chapter: 5,
    description: 'Vehicle structure & interior fitting circuits including Head Light, Cab Main Light, Tail Light, Flasher Light, Console Light, Saloon Lights, Gangway Light, Windscreen Wiper.',
    drawings: ['942-58112', '942-58113', '942-58114', '942-58115', '942-58116'],
    keyComponents: ['HLS', 'HL(L/R)', 'CML', 'TL(L/R)', 'FL', 'DCL', 'ELCB1-4', 'GWL', 'WWCB']
  },
  {
    systemCode: 'COUPL',
    systemName: 'Coupling & Uncoupling',
    chapter: 6,
    description: 'Coupling and uncoupling control circuits for train set connection.',
    drawings: ['942-58117'],
    keyComponents: ['COLPB', 'UCPB', 'MCCMV', 'MCUCMV', 'MCDR', 'COLR']
  },
  {
    systemCode: 'TRAC',
    systemName: 'Traction System',
    chapter: 7,
    description: 'Traction system including DC750V main power supply, speed control, VVVF Inverter interface and grounding.',
    drawings: ['H7L7956', '942-58119', '942-58120', '942-58121'],
    keyComponents: ['HSCB', 'VVVF', 'TBC', 'MS', 'EB(1-4)', 'EOSS']
  },
  {
    systemCode: 'BRAKE',
    systemName: 'Brake System',
    chapter: 8,
    description: 'Brake system including Compressor Control, Brake Loop, Emergency Brake Loop, Parking Brake, Horn and Brake Control.',
    drawings: ['942-58123', '942-58124', '942-58125', '942-58126', '942-58127', '942-58128', '942-58129'],
    keyComponents: ['CM', 'ADU', 'BCU', 'BECU', 'BCPS', 'BLCB', 'BLPR', 'EBLR', 'EBMV', 'EBVR', 'PBR', 'PBMV', 'HMV1', 'HMV2']
  },
  {
    systemCode: 'APS',
    systemName: 'Auxiliary Power System',
    chapter: 9,
    description: 'Auxiliary power system including APS, Shore Supply 415VAC, Power Extension Box and Battery Control.',
    drawings: ['942-58130', '942-58131', '942-58132'],
    keyComponents: ['APS', 'SSB', 'SIV', 'BATT', 'BCB', 'BUVDR', 'APSCB', 'SSCB', 'ESK']
  },
  {
    systemCode: 'DOOR',
    systemName: 'Door System',
    chapter: 10,
    description: 'Door system including Saloon Door Supply Voltage, Door Operation, Door Proving Loop, Local Door Interlock Circuit and Communication with TCMS.',
    drawings: ['942-58137', '942-58138', '942-58139', '942-58140', '942-58141', '942-58142'],
    keyComponents: ['DCU', 'EDCU', 'DMS', 'DOLR', 'DORR', 'DCLR', 'DCRR', 'DPR', 'ADCR', 'ADCLp']
  },
  {
    systemCode: 'VAC',
    systemName: 'Air Conditioning System',
    chapter: 11,
    description: 'Air conditioning system including Cab VAC and Saloon VAC.',
    drawings: ['942-58143', '942-58144', '942-58145'],
    keyComponents: ['CAB_VAC', 'VAC', 'ADMV', 'FR']
  },
  {
    systemCode: 'TMS',
    systemName: 'Train Management System',
    chapter: 12,
    description: 'Train Management System (TCMS) for train control and monitoring.',
    drawings: ['942-58146'],
    keyComponents: ['TCMS', 'RIO', 'TCPU', 'VDU', 'DCS']
  },
  {
    systemCode: 'COMMS',
    systemName: 'Communication System',
    chapter: 13,
    description: 'Communication system including PIS, PA, CCTV, Radio, ATP interface.',
    drawings: ['942-58147', '942-58148', '942-58149', '942-58150', '942-58151', '942-58152', '942-58153', '942-58154'],
    keyComponents: ['PIS', 'PIB', 'DVAU', 'PA', 'PAMP', 'CCTV', 'VDU', 'ATPCB', 'TRU']
  }
];

const WIRE_CLASSIFICATION: Record<string, { code: string; description: string }> = {
  'HV': { code: 'HV', description: 'Main Circuit 750V' },
  'ED': { code: 'ED', description: 'Propulsion Circuits supply of AC traction Motors' },
  'AP': { code: 'AP', description: 'Auxiliary power cables for 3Ph415V and 230VAC, 50Hz' },
  'BA': { code: 'BA', description: 'Conductors directly supplied by the battery (110VDC)' },
  'S': { code: 'S', description: 'Shielded cables for measuring and analogue voltage signals' },
};

export async function seedVCCData() {
  console.log('=== Seeding VCC Description Data ===\n');

  let abbreviationCount = 0;
  for (const abbr of ABBREVIATIONS) {
    await prisma.validationIssue.upsert({
      where: { id: `abbr_${abbr.abbreviation.replace(/[^a-zA-Z0-9]/g, '_')}` },
      update: {
        severity: 'info',
        issueType: 'ABBREVIATION',
        message: `${abbr.abbreviation}: ${abbr.description}`,
        details: { category: abbr.category, description: abbr.description },
        resolved: true,
      },
      create: {
        id: `abbr_${abbr.abbreviation.replace(/[^a-zA-Z0-9]/g, '_')}`,
        severity: 'info',
        issueType: 'ABBREVIATION',
        message: `${abbr.abbreviation}: ${abbr.description}`,
        details: { category: abbr.category, description: abbr.description },
        resolved: true,
      },
    });
    abbreviationCount++;
  }
  console.log(`✓ ${abbreviationCount} abbreviations seeded`);

  const systemDocs = [
    { drawingNo: 'VCC-DESC-01', title: 'VCC Description Document', subsystem: 'GEN', carType: 'ALL', notes: 'Complete VCC technical description - 54 pages', pageCount: 54, sourceFile: 'VCC DESCRIPTION 13.12.2017.pdf' },
  ];

  for (const doc of systemDocs) {
    await prisma.drawingDocument.upsert({
      where: { drawingNo: doc.drawingNo },
      update: doc,
      create: doc,
    });
  }
  console.log(`✓ ${systemDocs.length} VCC description documents seeded`);

  console.log('\n=== VCC Data Seed Complete ===');
  console.log(`Total Abbreviations: ${abbreviationCount}`);
  console.log(`Total Systems: ${VCC_SYSTEMS.length}`);
  console.log('VCC Description Document: VCC DESCRIPTION 13.12.2017.pdf (54 pages)');
  
  return { abbreviationCount, systemCount: VCC_SYSTEMS.length };
}

export async function searchAbbreviations(query: string) {
  const normalized = query.toLowerCase();
  return ABBREVIATIONS.filter(a => 
    a.abbreviation.toLowerCase().includes(normalized) ||
    a.description.toLowerCase().includes(normalized)
  );
}

export async function getSystemDetails(systemCode: string) {
  return VCC_SYSTEMS.find(s => s.systemCode === systemCode) || null;
}

export async function getAllSystems() {
  return VCC_SYSTEMS;
}

export async function getWireClassification() {
  return WIRE_CLASSIFICATION;
}

export default {
  seedVCCData,
  searchAbbreviations,
  getSystemDetails,
  getAllSystems,
  getWireClassification,
  ABBREVIATIONS,
  VCC_SYSTEMS,
  WIRE_CLASSIFICATION,
};