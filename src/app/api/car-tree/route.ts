import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const carType = searchParams.get('car'); // DMC, TC, MC, ALL

  try {
    // Get all data grouped by car type
    const [allConnectors, allDevices, allDrawings] = await Promise.all([
      prisma.connector.findMany({
        include: {
          drawing: { include: { system: true } },
          pins: true
        }
      }),
      prisma.device.findMany({
        include: {
          system: true,
          drawing: { select: { drawingNo: true } }
        }
      }),
      prisma.drawing.findMany({
        include: { system: true },
        orderBy: { drawingNo: 'asc' }
      })
    ]);

    // Group by car type
    const carTypes = ['DMC', 'TC', 'MC', 'ALL'];
    
    const byCar = carTypes.map(car => {
      const connectors = allConnectors.filter(c => 
        car === 'ALL' ? (c.carType === null || c.carType === 'ALL') : c.carType === car
      );
      
      const devices = allDevices.filter(d => 
        car === 'ALL' ? (d.carType === null || d.carType === 'ALL') : d.carType === car
      );
      
      // Get drawings for this car type
      const drawingNos = new Set([
        ...connectors.map(c => c.drawing?.drawingNo).filter(Boolean),
        ...devices.map(d => d.drawing?.drawingNo).filter(Boolean)
      ]);
      const carDrawings = allDrawings.filter(d => 
        d.remarks?.includes(car) || drawingNos.has(d.drawingNo)
      );

      // Group connectors by system
      const bySystem = connectors.reduce((acc, c) => {
        const sys = c.drawing?.system?.code || 'GEN';
        if (!acc[sys]) acc[sys] = [];
        acc[sys].push({
          id: c.id,
          code: c.connectorCode,
          pinCount: c.pinCount,
          wiredPins: c.pins.filter(p => p.wireNo).length,
          scope: c.scope
        });
        return acc;
      }, {} as Record<string, unknown[]>);

      // Group devices by system
      const devicesBySystem = devices.reduce((acc, d) => {
        const sys = d.system?.code || 'GEN';
        if (!acc[sys]) acc[sys] = [];
        acc[sys].push({
          id: d.id,
          name: d.deviceName,
          tag: d.tagNo,
          location: d.locationTag
        });
        return acc;
      }, {} as Record<string, unknown[]>);

      return {
        carType: car,
        stats: {
          drawings: carDrawings.length,
          devices: devices.length,
          connectors: connectors.length,
          totalPins: connectors.reduce((sum, c) => sum + (c.pinCount || 0), 0)
        },
        drawings: carDrawings.slice(0, 30).map(d => ({
          no: d.drawingNo,
          title: d.title,
          system: d.system?.code,
          sheets: d.totalSheets
        })),
        systems: Object.entries(bySystem).map(([code, conns]) => ({
          code,
          connectors: conns.length,
          pins: conns.reduce((sum: number, c: unknown) => sum + c.pinCount, 0),
          wired: conns.reduce((sum: number, c: unknown) => sum + c.wiredPins, 0),
          connectorList: conns.slice(0, 10)
        })),
        devices: Object.entries(devicesBySystem).map(([code, devs]) => ({
          code,
          count: devs.length,
          list: devs.slice(0, 5)
        }))
      };
    });

    return NextResponse.json({
      cars: byCar,
      total: byCar.reduce((sum, c) => sum + c.stats.connectors, 0)
    });

  } catch (error) {
    console.error('Car tree error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}