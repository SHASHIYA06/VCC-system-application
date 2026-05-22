import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DOCUMENT_SET = [
  { 
    file: 'KMRCL VCC Drawings_OCR.pdf', 
    drawingNo: '942-58100', 
    title: 'VCC Drawing List & Index - Complete System Overview', 
    pages: 127, 
    carType: 'ALL', 
    subsystem: 'GEN',
    description: 'Master drawing index with all VCC systems - General, Trainlines, Cab, Traction, Brake, Auxiliary, Door, VAC, TMS, Communication'
  },
  { 
    file: 'CAB_PIN DRAWINGS 2.pdf', 
    drawingNo: '942-38104', 
    title: 'Cab Panel Pin Assignment - Operating Panel', 
    pages: 48, 
    carType: 'CAB', 
    subsystem: 'CAB',
    description: 'Cab operating panel, MCB panel, status indication, startup relay, controlling cab - DMC driving controls'
  },
  { 
    file: 'DMC_CEILING.pdf', 
    drawingNo: '942-38310', 
    title: 'DMC Ceiling Pin Assignment - TMS & Communication', 
    pages: 28, 
    carType: 'DMC', 
    subsystem: 'TMS',
    description: 'DMC (Driving Motor Car) ceiling - TCMS RIO, Ethernet switch, CCTV, AAU, EDB panel, communication node'
  },
  { 
    file: 'DMC UF_PIN DRAWINGS.pdf', 
    drawingNo: '942-38305', 
    title: 'DMC Underframe Pin Assignment - Power & Traction', 
    pages: 26, 
    carType: 'DMC', 
    subsystem: 'LTEB',
    description: 'DMC underframe - LTEB, VVVF inverter, collector shoe, stinger box, pressure switch, BCU, LTJB, filter reactor, HSCB'
  },
  { 
    file: 'TC_CEILING PIN DRAWINGS.pdf', 
    drawingNo: '942-38409', 
    title: 'TC Ceiling Pin Assignment - Passenger Systems', 
    pages: 27, 
    carType: 'TC', 
    subsystem: 'TMS',
    description: 'TC (Trailer Car) ceiling - EDB panel, passenger door, saloon lights, AAU, Ethernet switch, VAC, TCMS RIO, socket outlet'
  },
  { 
    file: 'TC _UF PIN DRAWINGS.pdf', 
    drawingNo: '942-38508', 
    title: 'TC Underframe Pin Assignment - Auxiliary Power', 
    pages: 21, 
    carType: 'TC', 
    subsystem: 'APS',
    description: 'TC underframe - Pressure switch, EPIC/SR, compressor, APS, shore supply, ESK box, battery box, BCU, HTEB/HTJB'
  },
  { 
    file: 'MC_CEILING_PIN DRAWINGS.pdf', 
    drawingNo: '942-38606', 
    title: 'MC Ceiling Pin Assignment - TMS & Communication', 
    pages: 58, 
    carType: 'MC', 
    subsystem: 'TMS',
    description: 'MC (Motor Car) ceiling - TCMS RIO, BECU, passenger door, saloon lights, CCTV Ethernet, AAU, EDB panel, TCMS communication'
  },
  { 
    file: 'MC_UF.pdf', 
    drawingNo: '942-38602', 
    title: 'MC Underframe Pin Assignment - Brake & Equipment', 
    pages: 27, 
    carType: 'MC', 
    subsystem: 'LTEB',
    description: 'MC underframe - Saloon VAC, BECU, passenger door, TCMS RIO, TCMS terminal block, CCTV camera, communication node'
  },
  { 
    file: 'VCC DESCRIPTION 13.12.2017.pdf', 
    drawingNo: 'VCC-DESC-01', 
    title: 'VCC System Description & Technical Manual', 
    pages: 54, 
    carType: 'ALL', 
    subsystem: 'GEN',
    description: 'Complete VCC system description - Wiring numbering, symbol library, conductor classification, system architecture'
  },
];

const SYSTEM_CONFIG = [
  { code: 'GEN', name: 'General', category: 'Foundation', description: 'General documentation, symbols, wiring rules', sortOrder: 1 },
  { code: 'TRL', name: 'Train Line', category: 'Core Systems', description: 'Trainline control and signal wiring - 1032 RESET to 9216 REV', sortOrder: 2 },
  { code: 'CAB', name: 'Cab Equipment', category: 'Core Systems', description: 'Cab controls, operating panel, MCB panel, startup, status', sortOrder: 3 },
  { code: 'TRAC', name: 'Traction', category: 'Core Systems', description: 'Speed control, VVVF, propulsion, motor control', sortOrder: 4 },
  { code: 'BRAKE', name: 'Brake System', category: 'Core Systems', description: 'Brake loop, emergency brake, parking brake, BCU/BECU', sortOrder: 5 },
  { code: 'AUX', name: 'Auxiliary Electric', category: 'Power', description: 'APS, shore supply, battery, SIV, 110V/415V systems', sortOrder: 6 },
  { code: 'DOOR', name: 'Door System', category: 'Passenger Systems', description: 'Door operation, proving loop, interlock, TMS communication', sortOrder: 7 },
  { code: 'VAC', name: 'VAC/HVAC', category: 'Passenger Systems', description: 'Cab VAC, saloon VAC, ventilation, smoke detection', sortOrder: 8 },
  { code: 'TMS', name: 'TMS/TCMS', category: 'Communication', description: 'Train management system, Remote I/O, CAN/RS485', sortOrder: 9 },
  { code: 'COMMS', name: 'Communication', category: 'Communication', description: 'PIS/TIS, PA/DVAS, CBTC, radio, CCTV', sortOrder: 10 },
  { code: 'HV', name: 'High Voltage', category: 'Power', description: 'Pantograph, collector shoe, HSCB, 750V main circuit', sortOrder: 11 },
  { code: 'LIGHT', name: 'Lighting', category: 'Auxiliary', description: 'Interior, exterior, emergency, head/tail lights', sortOrder: 12 },
  { code: 'LTEB', name: 'LTEB', category: 'Electrical', description: 'Low Tension Equipment Box', sortOrder: 13 },
  { code: 'LTJB', name: 'LTJB', category: 'Electrical', description: 'Low Tension Junction Box', sortOrder: 14 },
  { code: 'APS', name: 'APS', category: 'Power', description: 'Auxiliary Power Supply', sortOrder: 15 },
  { code: 'COUPL', name: 'Coupling', category: 'Mechanical', description: 'Gangway coupler, car coupling', sortOrder: 16 },
];

async function ensureSystem(code: string, name: string, category: string, description: string, sortOrder: number) {
  const existing = await prisma.system.findFirst({ where: { code } });
  if (!existing) {
    await prisma.system.create({
      data: { code, name, category, description, sortOrder }
    });
    console.log(`Created system: ${code}`);
  }
}

export async function POST() {
  try {
    console.log('=== Starting Full VCC Document & System Setup ===\n');

    // 1. Setup all systems
    console.log('Step 1: Setting up systems...');
    for (const sys of SYSTEM_CONFIG) {
      await ensureSystem(sys.code, sys.name, sys.category, sys.description, sys.sortOrder);
    }
    console.log('Systems setup complete.\n');

    // 2. Register all documents
    console.log('Step 2: Registering all documents...');
    
    const project = await prisma.project.findFirst();
    const projectId = project?.id || 'default';
    
    let docsCreated = 0;
    let pagesCreated = 0;

    for (const doc of DOCUMENT_SET) {
      const system = await prisma.system.findFirst({ where: { code: doc.subsystem } });
      
      const existing = await prisma.drawing.findFirst({ where: { drawingNo: doc.drawingNo } });
      
      if (existing) {
        await prisma.drawing.update({
          where: { id: existing.id },
          data: {
            title: doc.title,
            sourceFileId: doc.file,
            remarks: `${doc.carType}|${doc.subsystem}`,
            totalSheets: doc.pages,
            systemId: system?.id,
          }
        });
        console.log(`  Updated: ${doc.drawingNo} - ${doc.title} (${doc.pages} pages)`);
      } else {
        const newDoc = await prisma.drawing.create({
          data: {
            drawingNo: doc.drawingNo,
            title: doc.title,
            sourceFileId: doc.file,
            revision: 'A',
            totalSheets: doc.pages,
            remarks: `${doc.carType}|${doc.subsystem}`,
            systemId: system?.id,
            projectId: projectId,
            status: 'ACTIVE',
          }
        });

        // Create pages for the document
        for (let i = 1; i <= doc.pages; i++) {
          await prisma.drawingPage.create({
            data: {
              drawingId: newDoc.id,
              pageNo: i,
              ocrText: `Page ${i} of ${doc.file} - ${doc.description}`,
            }
          });
        }
        pagesCreated += doc.pages;
        console.log(`  Created: ${doc.drawingNo} - ${doc.title} (${doc.pages} pages)`);
      }
      docsCreated++;
    }
    console.log(`\nDocuments: ${docsCreated}, Pages: ${pagesCreated}\n`);

    // 3. Get final statistics
    const [totalDocs, totalPages, totalSystems, totalTrainlines, totalCircuits, totalWires, totalConnectors, totalPins] = await Promise.all([
      prisma.drawing.count(),
      prisma.drawingPage.count(),
      prisma.system.count(),
      prisma.trainLine.count(),
      prisma.circuit.count(),
      prisma.wire.count(),
      prisma.connector.count(),
      prisma.connectorPin.count(),
    ]);

    console.log('=== Final Database Statistics ===');
    console.log(`  Documents: ${totalDocs}`);
    console.log(`  Pages: ${totalPages}`);
    console.log(`  Systems: ${totalSystems}`);
    console.log(`  Trainlines: ${totalTrainlines}`);
    console.log(`  Circuits: ${totalCircuits}`);
    console.log(`  Wires: ${totalWires}`);
    console.log(`  Connectors: ${totalConnectors}`);
    console.log(`  Pins: ${totalPins}`);
    console.log('\n=== Setup Complete ===');

    return NextResponse.json({
      success: true,
      message: 'Full VCC Document & System Setup Complete',
      results: {
        documentsProcessed: docsCreated,
        pagesCreated,
        totalDocuments: totalDocs,
        totalPages,
        totalSystems,
        totalTrainlines,
        totalCircuits,
        totalWires,
        totalConnectors,
        totalPins,
      }
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Setup failed', details: String(error) }, { status: 500 });
  }
}