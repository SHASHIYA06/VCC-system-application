import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
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
      documentCount,
      systemStats,
      documentStats,
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
      prisma.sourceFile.count(),
      prisma.system.findMany({
        include: { _count: { select: { drawings: true, devices: true } } },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.sourceFile.groupBy({ by: ['status'], _count: true }),
    ]);

    const drawingStats = await prisma.drawing.groupBy({
      by: ['systemId'],
      _count: true,
    });

    const drawingsPerSystem = drawingStats.reduce((acc, item) => {
      if (item.systemId) {
        acc[item.systemId] = item._count;
      }
      return acc;
    }, {} as Record<string, number>);

    const deviceBySystem = await prisma.device.groupBy({
      by: ['systemId'],
      _count: true,
    });

    const devicesPerSystem = deviceBySystem.reduce((acc, item) => {
      if (item.systemId) {
        acc[item.systemId] = item._count;
      }
      return acc;
    }, {} as Record<string, number>);

    const wireByVoltage = await prisma.wire.groupBy({
      by: ['voltageClass'],
      _count: true,
    });

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
        documents: documentCount,
        totalConnections: pinCount,
      },
      bySystem: Object.fromEntries(
        systemStats.map(s => [s.code, { 
          drawings: s._count.drawings, 
          devices: s._count.devices,
          total: s._count.drawings + s._count.devices 
        }])
      ),
      byVoltageClass: wireByVoltage.reduce((acc, item) => {
        acc[item.voltageClass || 'Unknown'] = item._count;
        return acc;
      }, {} as Record<string, number>),
      systems: systemStats.map(s => ({
        code: s.code,
        name: s.name,
        description: s.description,
        category: s.category,
        sortOrder: s.sortOrder,
        drawingCount: s._count.drawings,
        deviceCount: s._count.devices,
      })),
      health: {
        connectorsWithPins: connectorCount > 0 ? Math.round((pinCount / connectorCount) * 100) / 100 : 0,
        averagePinsPerConnector: connectorCount > 0 ? Math.round((pinCount / connectorCount) * 100) / 100 : 0,
        trainLineCoverage: trainLineCount > 0 ? `${Math.min(100, Math.round((trainLineCount / 60) * 100))}%` : '0%',
        wireToPinRatio: pinCount > 0 && wireCount > 0 ? Math.round((pinCount / wireCount) * 100) / 100 : 0,
      },
      documentStats: documentStats.map(d => ({
        status: d.status,
        count: d._count,
      })),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats', details: String(error) }, { status: 500 });
  }
}