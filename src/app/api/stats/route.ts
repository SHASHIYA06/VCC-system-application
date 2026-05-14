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
      trainLineCount,
      signalCount,
      circuitCount,
      deviceBySystem,
      wireByVoltage,
    ] = await Promise.all([
      prisma.system.count(),
      prisma.wire.count(),
      prisma.drawing.count(),
      prisma.device.count(),
      prisma.connector.count(),
      prisma.connectorPin.count(),
      prisma.trainLine.count(),
      prisma.signal.count(),
      prisma.circuit.count(),
      prisma.device.groupBy({
        by: ['systemId'],
        _count: true,
      }),
      prisma.wire.groupBy({
        by: ['voltageClass'],
        _count: true,
      }),
    ]);

    const systemStats = await prisma.system.findMany({
      include: {
        _count: { select: { drawings: true, devices: true } },
      },
    });

    const drawingStats = await prisma.drawing.groupBy({
      by: ['systemId'],
      _count: true,
    });

    const drawingsPerSystem = drawingStats.reduce((acc, item) => {
      acc[item.systemId || 'Unknown'] = item._count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      overview: {
        systems: systemCount,
        wires: wireCount,
        drawings: drawingCount,
        equipment: deviceCount,
        connectors: connectorCount,
        pins: pinCount,
        trainLines: trainLineCount,
        signals: signalCount,
        circuits: circuitCount,
        totalConnections: pinCount * 2,
      },
      bySystem: deviceBySystem.reduce((acc, item) => {
        acc[item.systemId || 'Unknown'] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byVoltageClass: wireByVoltage.reduce((acc, item) => {
        acc[item.voltageClass || 'Unknown'] = item._count;
        return acc;
      }, {} as Record<string, number>),
      systems: systemStats.map(s => ({
        code: s.code,
        name: s.name,
        description: s.description,
        category: s.category,
        drawingCount: s._count.drawings,
        deviceCount: s._count.devices,
      })),
      health: {
        connectorsWithPins: connectorCount > 0 ? Math.round((pinCount / connectorCount) * 100) / 100 : 0,
        averagePinsPerConnector: connectorCount > 0 ? Math.round((pinCount / connectorCount) * 100) / 100 : 0,
        trainLineCoverage: trainLineCount > 0 ? `${Math.round((trainLineCount / 100) * 100)}%` : '0%',
        signalCoverage: signalCount > 0 ? `${Math.round((signalCount / 100) * 100)}%` : '0%',
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}