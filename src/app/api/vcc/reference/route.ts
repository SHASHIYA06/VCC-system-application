import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
];

const VCC_SYSTEMS = [
  { systemCode: 'GEN', systemName: 'General', chapter: 3, description: 'General part drawings - Drawing List, Wiring numbers, classification, symbols, train-lines' },
  { systemCode: 'TRL', systemName: 'Train Control', chapter: 4, description: 'Train control circuits - Controlling Cab, start-up, System status indication, Train line supply Contactor' },
  { systemCode: 'LIGHT', systemName: 'Vehicle Structure & Interior', chapter: 5, description: 'Vehicle structure circuits - Head Light, Tail Light, Flasher, Console Light, Saloon Lights, Gangway Light, Wiper' },
  { systemCode: 'COUPL', systemName: 'Coupling & Uncoupling', chapter: 6, description: 'Coupling and uncoupling control circuits for train set connection' },
  { systemCode: 'TRAC', systemName: 'Traction System', chapter: 7, description: 'Traction system - DC750V main power supply, speed control, VVVF Inverter interface, grounding' },
  { systemCode: 'BRAKE', systemName: 'Brake System', chapter: 8, description: 'Brake system - Compressor Control, Brake Loop, Emergency Brake, Parking Brake, Horn' },
  { systemCode: 'APS', systemName: 'Auxiliary Power System', chapter: 9, description: 'Auxiliary power - APS, Shore Supply 415VAC, Power Extension Box, Battery Control' },
  { systemCode: 'DOOR', systemName: 'Door System', chapter: 10, description: 'Door system - Supply Voltage, Operation, Proving Loop, Local Interlock, TCMS Communication' },
  { systemCode: 'VAC', systemName: 'Air Conditioning System', chapter: 11, description: 'Air conditioning - Cab VAC and Saloon VAC' },
  { systemCode: 'TMS', systemName: 'Train Management System', chapter: 12, description: 'Train Management System (TCMS) for train control and monitoring' },
  { systemCode: 'COMMS', systemName: 'Communication System', chapter: 13, description: 'Communication - PIS, PA, CCTV, Radio, ATP interface' },
];

const WIRE_CLASSIFICATION = {
  'HV': { code: 'HV', description: 'Main Circuit 750V' },
  'ED': { code: 'ED', description: 'Propulsion Circuits - AC Traction Motors' },
  'AP': { code: 'AP', description: 'Auxiliary Power - 3Ph415V & 230VAC, 50Hz' },
  'BA': { code: 'BA', description: 'Battery Supply - 110V DC' },
  'S': { code: 'S', description: 'Shielded - Measuring & Analogue Signals' },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const query = searchParams.get('query');

  try {
    if (type === 'abbreviations') {
      if (query) {
        const q = query.toLowerCase();
        const filtered = ABBREVIATIONS.filter(a => 
          a.abbreviation.toLowerCase().includes(q) || 
          a.description.toLowerCase().includes(q)
        );
        return NextResponse.json({ abbreviations: filtered, count: filtered.length });
      }
      return NextResponse.json({ abbreviations: ABBREVIATIONS, count: ABBREVIATIONS.length });
    }

    if (type === 'systems') {
      if (query) {
        const q = query.toLowerCase();
        const filtered = VCC_SYSTEMS.filter(s => 
          s.systemCode.toLowerCase().includes(q) || 
          s.systemName.toLowerCase().includes(q)
        );
        return NextResponse.json({ systems: filtered, count: filtered.length });
      }
      return NextResponse.json({ systems: VCC_SYSTEMS, count: VCC_SYSTEMS.length });
    }

    if (type === 'wire-classification') {
      return NextResponse.json({ classification: WIRE_CLASSIFICATION });
    }

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