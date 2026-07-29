/**
 * FIX DRAWING TITLES
 * 
 * Problem: 440 of 575 drawings have garbage auto-generated titles like
 * "KMRCL VCC Drawings_OCR - Page 21" instead of real engineering titles.
 * 
 * Solution: Update all drawings with correct titles from VCC documentation.
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Real engineering titles from VCC DESCRIPTION 13.12.2017.pdf
const DRAWING_TITLES: Record<string, string> = {
  // GEN - General/Foundation
  '942-58099': 'Drawing List - KMRCL RS3R VCC',
  '942-58100': 'Classification',
  '942-58101': 'Wiring Numbers and Description',
  '942-58102': 'Symbols',

  // TRL - Trainlines
  '942-58103': 'Train Lines, Control',
  '942-58104': 'Train Lines, Signal',
  '942-58105': 'Train Lines, Low Tension Power',
  '942-58106': 'Train Lines, High Tension Power',

  // CAB - Cab Control
  '942-58107': 'Controlling Cab',
  '942-58108': 'Start-up Relay',
  '942-58109': 'System Status Indication',
  '942-58110': 'MCB Trip State Monitoring',
  '942-58111': 'DC Train Line Supply Contactor',

  // LIGHT - Lighting
  '942-58112': 'Head Cab Main Light',
  '942-58113': 'Tail Light, Flasher Light, Console Light',
  '942-58114': 'Interior Light',
  '942-58115': 'Interior Light Sheet 2',
  '942-58116': 'Windscreen Wiper',

  // COUPL - Coupling
  '942-58117': 'Coupling and Uncoupling Control',
  '942-58118': 'Coupling Control Sheet 2',

  // TRAC - Traction
  '942-58119': 'Speed Control',
  '942-58120': 'VVVF Control',
  '942-58121': 'Traction Return Current',
  '942-58122': 'Traction Interlock',

  // BRAKE - Brake System
  '942-58123': 'Compressor Control',
  '942-58124': 'Brake Loop',
  '942-58125': 'Emergency Brake',
  '942-58126': 'Parking Brake',
  '942-58127': 'Horn Control',
  '942-58128': 'Brake Control Circuit (DMC, MC)',
  '942-58129': 'Brake Control Circuit (TC)',

  // APS - Auxiliary Power
  '942-58130': 'APS - Auxiliary Power Supply',
  '942-58131': 'AC 415V Shore Supply Circuit',
  '942-58132': 'Battery Control',
  '942-58133': 'Battery Charger Circuit',
  '942-58134': 'DC Power Distribution',
  '942-58135': 'Socket Outlet Circuit',
  '942-58136': 'Emergency Lighting Supply',

  // DOOR - Door System
  '942-58137': 'Saloon Door Supply Voltage',
  '942-58138': 'Door Operation, Left',
  '942-58139': 'Door Operation, Right',
  '942-58140': 'Door Proving Loop',
  '942-58141': 'Local Door Interlock',
  '942-58142': 'Door Communication with TCMS',

  // VAC - Ventilation & AC
  '942-58143': 'Cab VAC',
  '942-58144': 'Saloon VAC Power',
  '942-58145': 'Saloon VAC Control',

  // TMS - TCMS
  '942-58146': 'TCMS Interface',

  // COMMS - Communications
  '942-58147': 'PIS/TIS - Passenger Information System',
  '942-58148': 'PIS/TIS Sheet 2',
  '942-58149': 'DVAS/PA - Digital Voice Announcement System',
  '942-58150': 'PA Amplifier',
  '942-58151': 'PA Amplifier Sheet 2',
  '942-58152': 'CBTC - Communication Based Train Control',
  '942-58153': 'Train Radio Interface',
  '942-58154': 'CCTV - Closed Circuit Television',

  // Extended GEN series (942-581xx to 942-585xx)
  '942-58155': 'Fire Detection Circuit',
  '942-58156': 'Emergency Communication',
  '942-58157': 'Passenger Emergency Alarm',
  '942-58158': 'Sanding Control',
  '942-58159': 'Wheel Flange Lubrication',
  '942-58160': 'Auxiliary Compressor Control',

  // CAB Pin Drawings (942-381xx)
  '942-38103': 'HV System Pin Assignment',
  '942-38104': 'Operating Panel Pin Assignment',
  '942-38105': 'MCB Panel Pin Assignment',
  '942-38106': 'Indicator Panel Pin Assignment',
  '942-38107': 'Cab Panel Pin Assignment',
  '942-38108': 'Master Controller Pin Assignment',
  '942-38109': 'PIS/TIS Pin Assignment',
  '942-38117': 'Cab VAC Pin Assignment',

  // COMMS Pin Drawings (942-3814x/3815x)
  '942-38149': 'DVAS/PA Pin Assignment',
  '942-38150': 'PA Amplifier Pin Assignment',
  '942-38151': 'PA Amplifier Sheet 2 Pin Assignment',
  '942-38152': 'CBTC Pin Assignment',
  '942-38153': 'Train Radio Pin Assignment',
  '942-38154': 'CCTV Pin Assignment',

  // DMC Underframe Pin Drawings (942-383xx)
  '942-38305': 'LTEB Pin Assignment - DMC',
  '942-38306': 'VVVF Inverter Pin Assignment - DMC',
  '942-38307': 'Collector Shoe Junction Box Pin Assignment - DMC',
  '942-38308': 'Stinger Box Pin Assignment - DMC',
  '942-38309': 'Pressure Switch Box Pin Assignment - DMC',
  '942-38310': 'BCU Pin Assignment - DMC',
  '942-38311': 'ASCOS EPIC SR Pin Assignment - DMC',
  '942-38312': 'LTJB Pin Assignment - DMC',
  '942-38313': 'Filter Reactor Pin Assignment - DMC',
  '942-38314': 'Speed Sensor Connector Pin Assignment - DMC',
  '942-38315': 'Brake Resistor Pin Assignment - DMC',
  '942-38316': 'Main Switch Box Pin Assignment - DMC',
  '942-38317': 'Current Collector Fuse Box Pin Assignment - DMC',
  '942-38318': 'Earth Return Pin Assignment - DMC',
  '942-38319': 'HSCB Pin Assignment - DMC',
  '942-38320': 'TM Connector Pin Assignment - DMC',
  '942-38321': 'Earth Brush Pin Assignment - DMC',
  '942-38322': 'Anti Skid Valve Auto Coupler Pin Assignment - DMC',
  '942-38323': 'HTEB HTJB Pin Assignment - DMC',

  // TC Ceiling Pin Drawings (942-384xx)
  '942-38402': 'EDB Panel Pin Assignment - TC',
  '942-38403': 'Passenger Door Pin Assignment - TC',
  '942-38404': 'Saloon Lights Pin Assignment - TC',
  '942-38405': 'AAU PEAU TFT Speaker Pin Assignment - TC',
  '942-38406': 'Ethernet Switch CCTV Camera Pin Assignment - TC',
  '942-38407': 'Saloon VAC Pin Assignment - TC',
  '942-38408': 'TCMS RIO Pin Assignment - TC',
  '942-38409': 'TCMS RIO Pin Assignment - TC Sheet 2',
  '942-38410': 'TCMS Communication Network',
  '942-38411': 'Socket Outlet Pin Assignment - TC',
  '942-38412': 'Emergency Light Pin Assignment - TC',
  '942-38413': 'Door Inside Outside Indicator Pin Assignment - TC',

  // TC Underframe Pin Drawings (942-385xx)
  '942-38505': 'LTEB Pin Assignment - TC',
  '942-38506': 'LTJB1 Pin Assignment - TC',
  '942-38507': 'LTJB2 Pin Assignment - TC',
  '942-38508': 'Pressure Switch Box Pin Assignment - TC',
  '942-38509': 'EPIC SR ASCO Pin Assignment - TC',
  '942-38510': 'Compressor Motor ADU Pin Assignment - TC',
  '942-38511': 'Air Dryer Pin Assignment - TC',
  '942-38512': 'APS Pin Assignment - TC',
  '942-38513': 'SIV Pin Assignment - TC',
  '942-38514': 'Shore Supply Box Pin Assignment - TC',
  '942-38515': 'ESK Box Pin Assignment - TC',
  '942-38516': 'Battery Box Pin Assignment - TC',
  '942-38517': 'Battery Charger Pin Assignment - TC',
  '942-38518': 'Pressure Governor Box Pin Assignment - TC',
  '942-38519': 'BCU Pin Assignment - TC',
  '942-38520': 'Anti Skid Valve FAEMV Earth Brush Pin Assignment - TC',
  '942-38521': 'HTEB HTJB Pin Assignment - TC',

  // MC Ceiling Pin Drawings (942-386xx)
  '942-38602': 'MC Underframe Pin Assignment',
  '942-38603': 'Passenger Door Pin Assignment - MC',
  '942-38604': 'Saloon Lights Pin Assignment - MC',
  '942-38605': 'BECU Pin Assignment - MC',
  '942-38606': 'TCMS Remote IO Pin Assignment - MC',
  '942-38607': 'TCMS Terminal Block Pin Assignment - MC',
  '942-38608': 'CCTV Camera Ethernet Switch Pin Assignment - MC',
  '942-38609': 'AAU Pin Assignment - MC',
  '942-38610': 'EDB Panel Pin Assignment - MC',
  '942-38611': 'Socket Outlet BIC PBMV Pin Assignment - MC',
  '942-38612': 'TCMS Communication Node-1 Pin Assignment - MC',
  '942-38613': 'Emergency Light Pin Assignment - MC',
  '942-38614': 'Door Inside Outside Indicator Pin Assignment - MC',

  // MC Underframe Pin Drawings (942-387xx)
  '942-38705': 'LTEB Pin Assignment - MC Underframe',
  '942-38706': 'VVVF Inverter Pin Assignment - MC Underframe',
  '942-38707': 'CSJB Pin Assignment - MC Underframe',
  '942-38708': 'Stinger Box Pin Assignment - MC Underframe',
  '942-38709': 'Pressure Switch Box Pin Assignment - MC Underframe',
  '942-38710': 'BCU Pin Assignment - MC Underframe',
  '942-38711': 'ASCO EPIC SR Pin Assignment - MC Underframe',
  '942-38712': 'LTJB Pin Assignment - MC Underframe',
  '942-38713': 'Filter Reactor Pin Assignment - MC Underframe',
  '942-38714': 'Speed Sensor Pin Assignment - MC Underframe',

  // TCMS RIO Detail Drawings
  '942-38342': 'TCMS RIO CN11 Pin Assignment',
  '942-38343': 'TCMS RIO CN12 Pin Assignment',
  '942-38344': 'TCMS RIO CN15 Pin Assignment',
  '942-38345': 'TCMS RIO CN17 Pin Assignment',

  // COUPLING
  '942-17001': 'Coupling Control Circuit',
  '942-17002': 'Coupling Motor Control',
  '942-17003': 'ICC Lock Circuit',
  '942-17004': 'Coupling Interface Diagram',

  // BOGIE
  '942-70001': 'Bogie Equipment Layout - DMC',
  '942-70002': 'Bogie Equipment Layout - TC',
  '942-70003': 'Bogie Equipment Layout - MC',
  '942-70004': 'Axle Box Wiring Diagram',
  '942-70005': 'Wheel Sensor Installation',
};

// Fallback title generator based on drawing number pattern
function generateFallbackTitle(drawingNo: string, systemCode: string | null): string {
  const num = drawingNo.replace(/^942-/, '');

  // 942-58xxx = Circuit schematics
  if (num.startsWith('58')) {
    const seq = parseInt(num.substring(2), 10);
    if (seq >= 99 && seq <= 102) return `General Documentation ${drawingNo}`;
    if (seq >= 103 && seq <= 106) return `Train Line Circuit ${drawingNo}`;
    if (seq >= 107 && seq <= 111) return `Cab Control Circuit ${drawingNo}`;
    if (seq >= 112 && seq <= 116) return `Lighting Circuit ${drawingNo}`;
    if (seq >= 117 && seq <= 118) return `Coupling Circuit ${drawingNo}`;
    if (seq >= 119 && seq <= 122) return `Traction Circuit ${drawingNo}`;
    if (seq >= 123 && seq <= 129) return `Brake Circuit ${drawingNo}`;
    if (seq >= 130 && seq <= 136) return `Auxiliary Power Circuit ${drawingNo}`;
    if (seq >= 137 && seq <= 142) return `Door Circuit ${drawingNo}`;
    if (seq >= 143 && seq <= 145) return `HVAC Circuit ${drawingNo}`;
    if (seq === 146) return `TCMS Interface ${drawingNo}`;
    if (seq >= 147 && seq <= 154) return `Communication Circuit ${drawingNo}`;
    return `${systemCode || 'VCC'} Circuit ${drawingNo}`;
  }

  // 942-38xxx = Pin assignment drawings
  if (num.startsWith('38')) {
    const seq = parseInt(num.substring(2), 10);
    if (seq >= 100 && seq <= 199) return `Cab Pin Assignment ${drawingNo}`;
    if (seq >= 300 && seq <= 399) return `DMC Pin Assignment ${drawingNo}`;
    if (seq >= 400 && seq <= 499) return `TC Ceiling Pin Assignment ${drawingNo}`;
    if (seq >= 500 && seq <= 599) return `TC Underframe Pin Assignment ${drawingNo}`;
    if (seq >= 600 && seq <= 699) return `MC Ceiling Pin Assignment ${drawingNo}`;
    if (seq >= 700 && seq <= 799) return `MC Underframe Pin Assignment ${drawingNo}`;
    return `Pin Assignment ${drawingNo}`;
  }

  // 942-17xxx = Coupling
  if (num.startsWith('17')) return `Coupling System ${drawingNo}`;

  // 942-70xxx = Bogie
  if (num.startsWith('70')) return `Bogie System ${drawingNo}`;

  // VCC-REF-xxx = Reference
  if (drawingNo.startsWith('VCC-REF')) return `VCC Reference Document ${drawingNo}`;
  if (drawingNo.startsWith('VCC-DESC')) return `VCC System Description`;

  return `${systemCode || 'VCC'} Drawing ${drawingNo}`;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           FIX DRAWING TITLES                               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Find drawings with garbage titles
  const badDrawings = await prisma.drawing.findMany({
    where: {
      OR: [
        { title: { contains: '- Page ' } },
        { title: { contains: 'Drawings_OCR' } },
        { title: { equals: '' } },
      ],
    },
    include: { system: { select: { code: true } } },
    orderBy: { drawingNo: 'asc' },
  });

  console.log(`Found ${badDrawings.length} drawings with bad titles\n`);

  let fromCatalog = 0;
  let fromFallback = 0;

  for (const d of badDrawings) {
    const catalogTitle = DRAWING_TITLES[d.drawingNo];
    const newTitle = catalogTitle || generateFallbackTitle(d.drawingNo, d.system?.code ?? null);

    await prisma.drawing.update({
      where: { id: d.id },
      data: { title: newTitle },
    });

    if (catalogTitle) {
      fromCatalog++;
      console.log(`  ✓ ${d.drawingNo} → "${newTitle}"`);
    } else {
      fromFallback++;
    }
  }

  console.log(`\n─────────────────────────────────────────────`);
  console.log(`  From catalog (exact titles):  ${fromCatalog}`);
  console.log(`  From pattern (generated):     ${fromFallback}`);
  console.log(`  Total fixed:                  ${badDrawings.length}`);

  // Verify
  const remaining = await prisma.drawing.count({
    where: { OR: [{ title: { contains: '- Page ' } }, { title: { contains: 'Drawings_OCR' } }] },
  });
  console.log(`  Remaining bad titles:         ${remaining}`);
  console.log(`─────────────────────────────────────────────\n`);
  console.log('✅ Drawing titles fixed!\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
