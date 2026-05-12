import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const [
      systemCount,
      wireCount,
      drawingCount,
      deviceCount,
      connectorCount,
      pinCount,
      deviceByCar,
      deviceBySystem,
      wireByVoltage,
    ] = await Promise.all([
      prisma.system.count(),
      prisma.wire.count(),
      prisma.drawingDocument.count(),
      prisma.deviceInstance.count(),
      prisma.connector.count(),
      prisma.connectorPin.count(),
      prisma.deviceInstance.groupBy({
        by: ['carType'],
        _count: true,
      }),
      prisma.deviceInstance.groupBy({
        by: ['carType'],
        _count: true,
      }),
      prisma.wire.groupBy({
        by: ['voltageClass'],
        _count: true,
      }),
    ]);

    const systemStats = await prisma.system.findMany({
      include: {
        _count: { select: { devices: true } },
      },
    });

    return NextResponse.json({
      overview: {
        systems: systemCount,
        wires: wireCount,
        drawings: drawingCount,
        equipment: deviceCount,
        connectors: connectorCount,
        pins: pinCount,
        totalConnections: pinCount * 2,
      },
      byCarType: deviceByCar.reduce((acc, item) => {
        acc[item.carType || 'Unknown'] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byVoltageClass: wireByVoltage.reduce((acc, item) => {
        acc[item.voltageClass || 'Unknown'] = item._count;
        return acc;
      }, {} as Record<string, number>),
      systems: systemStats.map(s => ({
        code: s.code || s.name,
        name: s.name,
        deviceCount: s._count.devices,
        category: s.description,
      })),
      health: {
        connectorsWithPins: connectorCount > 0 ? Math.round((pinCount / connectorCount) * 100) / 100 : 0,
        averagePinsPerConnector: connectorCount > 0 ? Math.round((pinCount / connectorCount) * 100) / 100 : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}