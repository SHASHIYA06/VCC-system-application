import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getVCCAbbreviations, getVCCSystems, getWireClassification, getPinDrawings, searchVCCData } from '@/lib/services/vcc-description.service';

const ABBREVIATIONS = [
  { abbreviation: 'AC1,2CB', description: 'Saloon Air-con1,2 Circuit Breaker', category: 'VAC' },
  { abbreviation: 'ADCLp', description: 'All Doors Closed Indicator', category: 'DOOR' },
  { abbreviation: 'ADCR', description: 'All Doors Closed Relay', category: 'DOOR' },
  { abbreviation: 'AUX ON', description: 'Auxiliary On Switch', category: 'APS' },
  { abbreviation: 'BCU', description: 'Brake Control Unit', category: 'BRAKE' },
  { abbreviation: 'BECU', description: 'Brake Electronic Control Unit', category: 'BRAKE' },
  { abbreviation: 'CM', description: 'Compressor Motor', category: 'BRAKE' },
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
  { abbreviation: 'APS', description: 'Auxiliary Power Supply', category: 'APS' },
  { abbreviation: 'SIV', description: 'Static Inverter', category: 'APS' },
  { abbreviation: 'SSB', description: 'Shore Supply Box', category: 'APS' },
  { abbreviation: 'BATT', description: 'Battery', category: 'APS' },
  { abbreviation: 'RIO', description: 'Remote I/O', category: 'TMS' },
  { abbreviation: 'PIS', description: 'Passenger Information System', category: 'COMMS' },
  { abbreviation: 'CCTV', description: 'Closed Circuit Television', category: 'COMMS' },
];

const VCC_SYSTEMS = [
  { systemCode: 'GEN', systemName: 'General', chapter: 3, description: 'General part drawings - Drawing List, Wiring numbers, classification, symbols, train-lines', keyComponents: ['Drawing List', 'Classification', 'Wiring Numbers', 'Symbols', 'Train Lines'], drawings: ['942-58099', '942-58100', '942-58101', '942-58102'] },
  { systemCode: 'TRL', systemName: 'Train Control', chapter: 4, description: 'Train control circuits - Controlling Cab, start-up, System status indication, Train line supply Contactor', keyComponents: ['HCR', 'TCR', 'LCAR', 'STUR', 'ASDR'], drawings: ['942-58107', '942-58108', '942-58109'] },
  { systemCode: 'LIGHT', systemName: 'Vehicle Structure & Interior', chapter: 5, description: 'Vehicle structure circuits - Head Light, Tail Light, Flasher, Console Light, Saloon Lights, Gangway Light, Wiper', keyComponents: ['HLS', 'CML', 'TL', 'FL', 'DCL'], drawings: ['942-58112', '942-58113', '942-58114'] },
  { systemCode: 'COUPL', systemName: 'Coupling & Uncoupling', chapter: 6, description: 'Coupling and uncoupling control circuits for train set connection', keyComponents: ['COLPB', 'UCPB', 'MCCMV', 'MCUCMV'], drawings: ['942-58117'] },
  { systemCode: 'TRAC', systemName: 'Traction System', chapter: 7, description: 'Traction system - DC750V main power supply, speed control, VVVF Inverter interface, grounding', keyComponents: ['HSCB', 'VVVF', 'TBC', 'MS', 'EOSS'], drawings: ['942-58119', '942-58120', '942-58121'] },
  { systemCode: 'BRAKE', systemName: 'Brake System', chapter: 8, description: 'Brake system - Compressor Control, Brake Loop, Emergency Brake, Parking Brake, Horn', keyComponents: ['CM', 'ADU', 'BCU', 'BECU', 'EBLR', 'PBR'], drawings: ['942-58123', '942-58124', '942-58125', '942-58126', '942-58127'] },
  { systemCode: 'APS', systemName: 'Auxiliary Power System', chapter: 9, description: 'Auxiliary power - APS, Shore Supply 415VAC, Power Extension Box, Battery Control', keyComponents: ['APS', 'SSB', 'SIV', 'BATT', 'BCB', 'ESK'], drawings: ['942-58130', '942-58131', '942-58132'] },
  { systemCode: 'DOOR', systemName: 'Door System', chapter: 10, description: 'Door system - Supply Voltage, Operation, Proving Loop, Local Interlock, TCMS Communication', keyComponents: ['DCU', 'EDCU', 'DMS', 'DOLR', 'DORR', 'DPR', 'ADCR'], drawings: ['942-58137', '942-58138', '942-58139', '942-58140', '942-58141', '942-58142'] },
  { systemCode: 'VAC', systemName: 'Air Conditioning System', chapter: 11, description: 'Air conditioning - Cab VAC and Saloon VAC', keyComponents: ['CAB_VAC', 'VAC', 'ADMV', 'FR'], drawings: ['942-58143', '942-58144', '942-58145'] },
  { systemCode: 'TMS', systemName: 'Train Management System', chapter: 12, description: 'Train Management System (TCMS) for train control and monitoring', keyComponents: ['TCMS', 'RIO', 'TCPU', 'VDU', 'DCS'], drawings: ['942-58146'] },
  { systemCode: 'COMMS', systemName: 'Communication System', chapter: 13, description: 'Communication - PIS, PA, CCTV, Radio, ATP interface', keyComponents: ['PIS', 'PIB', 'DVAU', 'PA', 'CCTV', 'ATPCB', 'TRU'], drawings: ['942-58147', '942-58148', '942-58149', '942-58150', '942-58151', '942-58152', '942-58153', '942-58154'] },
];

const WIRE_CLASSIFICATION = {
  'HV': { code: 'HV', description: 'Main Circuit 750V', color: 'red' },
  'ED': { code: 'ED', description: 'Propulsion Circuits - AC Traction Motors', color: 'orange' },
  'AP': { code: 'AP', description: 'Auxiliary Power - 3Ph415V & 230VAC, 50Hz', color: 'green' },
  'BA': { code: 'BA', description: 'Battery Supply - 110V DC', color: 'blue' },
  'S': { code: 'S', description: 'Shielded - Measuring & Analogue Signals', color: 'purple' },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const query = searchParams.get('query');

  try {
    if (type === 'abbreviations') {
      const abbrs = await getVCCAbbreviations();
      if (query) {
        const q = query.toLowerCase();
        const filtered = abbrs.filter(a => 
          a.abbreviation.toLowerCase().includes(q) || 
          a.description.toLowerCase().includes(q)
        );
        return NextResponse.json({ abbreviations: filtered, count: filtered.length });
      }
      return NextResponse.json({ abbreviations: abbrs, count: abbrs.length });
    }

    if (type === 'systems') {
      const systems = await getVCCSystems();
      if (query) {
        const q = query.toLowerCase();
        const filtered = systems.filter(s => 
          s.systemCode.toLowerCase().includes(q) || 
          s.systemName.toLowerCase().includes(q)
        );
        return NextResponse.json({ systems: filtered, count: filtered.length });
      }
      return NextResponse.json({ systems, count: systems.length });
    }

    if (type === 'wire-classification') {
      const classification = await getWireClassification();
      return NextResponse.json({ classification });
    }

    if (type === 'pin-drawings') {
      const pinDrawings = await getPinDrawings();
      return NextResponse.json({ pinDrawings, count: pinDrawings.length });
    }

    if (type === 'search' && query) {
      const results = await searchVCCData(query);
      return NextResponse.json(results);
    }

    const pinDrawings = await getPinDrawings();
    return NextResponse.json({
      document: {
        title: 'VCC Description Document',
        docNo: 'GR/TD/3328',
        date: '13.12.2017',
        revision: '01',
        pages: 54,
        sourceFile: 'VCC DESCRIPTION 13.12.2017.pdf'
      },
      abbreviations: ABBREVIATIONS,
      systems: VCC_SYSTEMS,
      wireClassification: WIRE_CLASSIFICATION,
      pinDrawings,
    });
  } catch (error) {
    console.error('Error fetching VCC data:', error);
    return NextResponse.json({ error: 'Failed to fetch VCC data' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const project = await prisma.project.findFirst() || await prisma.project.create({ data: { projectCode: 'KMRCL_RS3R', projectName: 'KMRCL RS3R' } });
    await prisma.drawing.upsert({
      where: { projectId_drawingNo_revision: { projectId: project.id, drawingNo: 'VCC-DESC-01', revision: '01' } },
      update: {
        title: 'VCC Description Document',
        totalSheets: 54,
        sourceFileId: 'VCC DESCRIPTION 13.12.2017.pdf',
        remarks: 'ALL|GEN',
      },
      create: {
        projectId: project.id,
        drawingNo: 'VCC-DESC-01',
        title: 'VCC Description Document',
        totalSheets: 54,
        sourceFileId: 'VCC DESCRIPTION 13.12.2017.pdf',
        remarks: 'ALL|GEN',
        revision: '01',
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'VCC Description document registered',
      pages: 54,
      systems: VCC_SYSTEMS.length,
      abbreviations: ABBREVIATIONS.length
    });
  } catch (error) {
    console.error('Error registering VCC document:', error);
    return NextResponse.json({ error: 'Failed to register VCC document' }, { status: 500 });
  }
}