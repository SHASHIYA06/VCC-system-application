import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MISSING_DRAWINGS = [
  // BOGIE - 0 drawings
  { drawingNo: '942-70001', title: 'Bogie Equipment Layout - DMC', system: 'BOGIE', sheets: 1 },
  { drawingNo: '942-70002', title: 'Bogie Equipment Layout - TC', system: 'BOGIE', sheets: 1 },
  { drawingNo: '942-70003', title: 'Bogie Equipment Layout - MC', system: 'BOGIE', sheets: 1 },
  { drawingNo: '942-70004', title: 'Axle Box Wiring Diagram', system: 'BOGIE', sheets: 2 },
  { drawingNo: '942-70005', title: 'Wheel Sensor Installation', system: 'BOGIE', sheets: 1 },
  
  // COUPL - 0 drawings  
  { drawingNo: '942-17001', title: 'Coupling Control Circuit', system: 'COUPL', sheets: 2 },
  { drawingNo: '942-17002', title: 'Coupling Motor Control', system: 'COUPL', sheets: 1 },
  { drawingNo: '942-17003', title: 'ICC Lock Circuit', system: 'COUPL', sheets: 1 },
  { drawingNo: '942-17004', title: 'Coupling Interface Diagram', system: 'COUPL', sheets: 1 },
  
  // These systems can merge with existing ones (use existing system codes)
  // DISPLAY -> COMMS
  { drawingNo: '942-58147', title: 'TFT FDI Display - DMC', system: 'COMMS', sheets: 1 },
  { drawingNo: '942-58148', title: 'TFT Display - TC, MC', system: 'COMMS', sheets: 1 },
  
  // PIS -> COMMS  
  { drawingNo: '942-38109', title: 'PIS/TIS Diagram', system: 'COMMS', sheets: 2 },
  { drawingNo: '942-38149', title: 'DVAS/PA System', system: 'COMMS', sheets: 1 },
  
  // TRACTION -> TRAC
  { drawingNo: '942-58119', title: 'Speed Control System', system: 'TRAC', sheets: 2 },
  { drawingNo: '942-58120', title: 'VVVF Control Interface', system: 'TRAC', sheets: 2 },
  
  // AIRCON -> VAC
  { drawingNo: '942-38602', title: 'Saloon VAC System', system: 'VAC', sheets: 3 },
  { drawingNo: '942-38603', title: 'Cab HVAC Control', system: 'VAC', sheets: 2 },
  
  // TIMS -> TMS
  { drawingNo: '942-38409', title: 'TCMS RIO Configuration', system: 'TMS', sheets: 4 },
  { drawingNo: '942-38410', title: 'TCMS Communication Network', system: 'TMS', sheets: 2 },
];

export async function POST(request: NextRequest) {
  try {
    let added = 0;
    let skipped = 0;
    
    // Get existing project
    const project = await prisma.project.findFirst();
    
    if (!project) {
      return NextResponse.json({ error: 'No project found in database' }, { status: 500 });
    }
    
    for (const dwg of MISSING_DRAWINGS) {
      const system = await prisma.system.findFirst({
        where: { code: dwg.system }
      });
      
      if (!system) {
        console.log(`System not found: ${dwg.system}`);
        skipped++;
        continue;
      }
      
      const existing = await prisma.drawing.findFirst({
        where: { drawingNo: dwg.drawingNo }
      });
      
      if (existing) {
        // Link to correct system if not already linked
        if (existing.systemId !== system.id) {
          await prisma.drawing.update({
            where: { id: existing.id },
            data: { systemId: system.id }
          });
        }
        skipped++;
        continue;
      }
      
      await prisma.drawing.create({
        data: {
          projectId: project.id,
          systemId: system.id,
          drawingNo: dwg.drawingNo,
          title: dwg.title,
          totalSheets: dwg.sheets,
          revision: 'A',
          status: 'ACTIVE',
          remarks: `${dwg.system} system`
        }
      });
      added++;
    }
    
    const drawingCount = await prisma.drawing.count();
    
    return NextResponse.json({
      success: true,
      message: `Added ${added} drawings, skipped ${skipped} existing`,
      stats: { drawings: drawingCount }
    });
    
  } catch (error) {
    console.error('Drawing seed error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  const drawingCount = await prisma.drawing.count();
  return NextResponse.json({
    current: { drawings: drawingCount },
    endpoint: 'POST to /api/seed-drawings-missing to add missing drawings'
  });
}