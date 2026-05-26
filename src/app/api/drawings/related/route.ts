import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const drawingNo = searchParams.get('drawing_no');
  const systemCode = searchParams.get('system');

  try {
    let drawings: any[] = [];
    
    if (drawingNo) {
      const current = await prisma.drawing.findFirst({
        where: { drawingNo: drawingNo },
        include: { system: true }
      });

      if (current?.systemId) {
        drawings = await prisma.drawing.findMany({
          where: { systemId: current.systemId },
          include: {
            system: true,
            _count: { select: { connectors: true, trainLines: true, devices: true } }
          },
          take: 20,
          orderBy: { drawingNo: 'asc' }
        });
      }
    } else if (systemCode) {
      const system = await prisma.system.findFirst({ where: { code: systemCode } });
      if (system) {
        drawings = await prisma.drawing.findMany({
          where: { systemId: system.id },
          include: {
            system: true,
            _count: { select: { connectors: true, trainLines: true, devices: true } }
          },
          take: 20,
          orderBy: { drawingNo: 'asc' }
        });
      }
    }

    const schematics = drawings.filter(d => 
      !d.title?.toLowerCase().includes('pin') && !d.title?.toLowerCase().includes('assignment')
    );
    const pinAssignments = drawings.filter(d => 
      d.title?.toLowerCase().includes('pin') || d.title?.toLowerCase().includes('assignment')
    );

    return NextResponse.json({ schematics, pinAssignments, total: drawings.length });

  } catch (error) {
    console.error('Related drawings error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}