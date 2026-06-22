import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface MappedConnector {
  id: string;
  code: string;
  pinCount: number;
  scope: string | null;
}

interface MappedDevice {
  id: string;
  name: string | null;
  tag: string | null;
  location: string | null;
}

export const dynamic = 'force-dynamic';

/**
 * Car-type hierarchy tree (DMC / TC / MC / ALL).
 *
 * Uses connector-level pinCount and count aggregations instead of loading the
 * full pin table (70k+ rows), which previously made this endpoint take 20s+.
 */
export async function GET(request: NextRequest) {
  try {
    const [allConnectors, allDevices, allDrawings] = await Promise.all([
      prisma.connector.findMany({
        select: {
          id: true,
          connectorCode: true,
          carType: true,
          pinCount: true,
          scope: true,
          drawing: {
            select: { drawingNo: true, system: { select: { code: true } } },
          },
          _count: { select: { pins: true } },
        },
      }),
      prisma.device.findMany({
        select: {
          id: true,
          deviceName: true,
          tagNo: true,
          carType: true,
          locationTag: true,
          system: { select: { code: true } },
          drawing: { select: { drawingNo: true } },
        },
      }),
      prisma.drawing.findMany({
        select: {
          drawingNo: true,
          title: true,
          totalSheets: true,
          remarks: true,
          system: { select: { code: true } },
        },
        orderBy: { drawingNo: 'asc' },
      }),
    ]);

    const carTypes = ['DMC', 'TC', 'MC', 'ALL'];

    const byCar = carTypes.map(car => {
      const connectors = allConnectors.filter(c =>
        car === 'ALL' ? c.carType === null || c.carType === 'ALL' : c.carType === car
      );

      const devices = allDevices.filter(d =>
        car === 'ALL' ? d.carType === null || d.carType === 'ALL' : d.carType === car
      );

      const drawingNos = new Set<string>([
        ...connectors.map(c => c.drawing?.drawingNo).filter(Boolean) as string[],
        ...devices.map(d => d.drawing?.drawingNo).filter(Boolean) as string[],
      ]);
      const carDrawings = allDrawings.filter(
        d => d.remarks?.includes(car) || drawingNos.has(d.drawingNo)
      );

      const pinsOf = (c: (typeof allConnectors)[number]) => c.pinCount || c._count?.pins || 0;

      const bySystem = connectors.reduce((acc, c) => {
        const sys = c.drawing?.system?.code || 'GEN';
        if (!acc[sys]) acc[sys] = [];
        acc[sys].push({
          id: c.id,
          code: c.connectorCode,
          pinCount: pinsOf(c),
          scope: c.scope,
        });
        return acc;
      }, {} as Record<string, MappedConnector[]>);

      const devicesBySystem = devices.reduce((acc, d) => {
        const sys = d.system?.code || 'GEN';
        if (!acc[sys]) acc[sys] = [];
        acc[sys].push({
          id: d.id,
          name: d.deviceName,
          tag: d.tagNo,
          location: d.locationTag,
        });
        return acc;
      }, {} as Record<string, MappedDevice[]>);

      return {
        carType: car,
        stats: {
          drawings: carDrawings.length,
          devices: devices.length,
          connectors: connectors.length,
          totalPins: connectors.reduce((sum, c) => sum + pinsOf(c), 0),
        },
        drawings: carDrawings.slice(0, 30).map(d => ({
          no: d.drawingNo,
          title: d.title,
          system: d.system?.code,
          sheets: d.totalSheets,
        })),
        systems: Object.entries(bySystem).map(([code, conns]) => ({
          code,
          connectors: conns.length,
          pins: conns.reduce((sum, c) => sum + c.pinCount, 0),
          connectorList: conns.slice(0, 10),
        })),
        devices: Object.entries(devicesBySystem).map(([code, devs]) => ({
          code,
          count: devs.length,
          list: devs.slice(0, 5),
        })),
      };
    });

    return NextResponse.json({
      cars: byCar,
      total: byCar.reduce((sum, c) => sum + c.stats.connectors, 0),
    });
  } catch (error) {
    console.error('Car tree error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
