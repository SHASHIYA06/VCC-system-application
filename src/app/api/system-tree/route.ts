import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * System hierarchy tree.
 *
 * Returns System -> Drawings (with connector/device counts) -> Devices grouped
 * by type. This endpoint must stay fast even though the database holds 70k+
 * pins, so it relies on count aggregations (_count) rather than loading every
 * pin/connector row into memory.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const systemCode = searchParams.get('system');

  try {
    const systems = await prisma.system.findMany({
      where: systemCode ? { code: systemCode } : {},
      orderBy: { sortOrder: 'asc' },
      include: {
        drawings: {
          select: {
            id: true,
            drawingNo: true,
            title: true,
            totalSheets: true,
            _count: { select: { connectors: true, devices: true, pages: true } },
            connectors: {
              select: {
                id: true,
                connectorCode: true,
                connectorTypeCode: true,
                carType: true,
                pinCount: true,
              },
            },
          },
        },
        devices: {
          select: {
            id: true,
            deviceName: true,
            deviceType: true,
            tagNo: true,
            carType: true,
            locationTag: true,
            drawing: { select: { drawingNo: true } },
            _count: { select: { wireEndpoints: true } },
          },
          orderBy: { deviceName: 'asc' },
        },
      },
    });

    const tree = systems.map(sys => {
      const systemDrawings = sys.drawings || [];
      const systemDevices = sys.devices || [];

      const drawingsWithConnectors = systemDrawings.filter(d => (d._count?.connectors || 0) > 0);
      const drawingsSchematic = systemDrawings.filter(
        d => (d._count?.pages || 0) > 0 && (d._count?.connectors || 0) === 0
      );

      const devicesByType = systemDevices.reduce((acc, dev) => {
        const type = dev.deviceType || 'Other';
        if (!acc[type]) acc[type] = [];
        acc[type].push({
          id: dev.id,
          name: dev.deviceName,
          tag: dev.tagNo,
          carType: dev.carType,
          location: dev.locationTag,
          drawing: dev.drawing?.drawingNo,
          connections: dev._count?.wireEndpoints || 0,
        });
        return acc;
      }, {} as Record<string, any[]>);

      const allConnectors = systemDrawings.flatMap(d =>
        (d.connectors || []).map(c => ({
          id: c.id,
          code: c.connectorCode,
          type: c.connectorTypeCode,
          carType: c.carType,
          pinCount: c.pinCount || 0,
          drawing: d.drawingNo,
        }))
      );

      const byCarType = allConnectors.reduce((acc, c) => {
        const car = c.carType || 'ALL';
        if (!acc[car]) acc[car] = { connectors: 0, pins: 0 };
        acc[car].connectors++;
        acc[car].pins += c.pinCount;
        return acc;
      }, {} as Record<string, { connectors: number; pins: number }>);

      const totalPins = allConnectors.reduce((sum, c) => sum + c.pinCount, 0);

      return {
        code: sys.code,
        name: sys.name,
        category: sys.category,
        stats: {
          drawings: systemDrawings.length,
          drawingsWithConnectors: drawingsWithConnectors.length,
          devices: systemDevices.length,
          connectors: allConnectors.length,
          totalPins,
        },
        byCarType,
        drawings: {
          pinAssignments: drawingsWithConnectors.map(d => ({
            no: d.drawingNo,
            title: d.title,
            sheets: d.totalSheets,
            connectors: (d.connectors || []).length,
            connectorList: (d.connectors || []).map(c => ({
              code: c.connectorCode,
              pins: c.pinCount || 0,
            })),
          })),
          schematics: drawingsSchematic.map(d => ({
            no: d.drawingNo,
            title: d.title,
            sheets: d.totalSheets,
          })),
        },
        devices: Object.entries(devicesByType).map(([type, devs]) => ({
          type,
          count: devs.length,
          list: devs,
        })),
      };
    });

    return NextResponse.json({
      total: tree.length,
      hierarchy: tree,
    });
  } catch (error) {
    console.error('Tree error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
