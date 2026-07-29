import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      connectorByCarType,
      wiresByCarType,
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
      prisma.connector.groupBy({ by: ['carType'], _count: { _all: true } }),
      /**
       * Real distinct-wire count per car, resolved through
       * WireEndpoint -> Device.carType.
       *
       * `byCarType` used to be a `connector.groupBy` whose own comment admitted it
       * was a "proxy for wire distribution" — and the dashboard rendered that
       * connector count under a "wires" label. Counting distinct wires that
       * actually terminate on a device in each car is the measurement the label
       * claims, so the label is no longer a lie.
       */
      prisma.$queryRaw<Array<{ carType: string | null; wires: bigint }>>`
        SELECT d."carType", COUNT(DISTINCT we."wireId") AS wires
        FROM "WireEndpoint" we
        JOIN "Device" d ON d.id = we."deviceId"
        WHERE d."carType" IS NOT NULL
        GROUP BY d."carType"`,
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

    // Calculate actual wire connections from wire endpoints
    const wireEndpointCount = await prisma.wireEndpoint.count();

    // Distinct wires terminating on a device in each car. This is a real count,
    // not the connector-count proxy that used to be reported here.
    const byCarType = wiresByCarType.reduce((acc: Record<string, number>, item) => {
      if (item.carType) {
        const ct = item.carType.toUpperCase().trim();
        acc[ct] = (acc[ct] || 0) + Number(item.wires);
      }
      return acc;
    }, {} as Record<string, number>);

    // Connector counts per car kept as their own key so nothing conflates the two.
    const connectorsByCarType = connectorByCarType.reduce((acc: Record<string, number>, item) => {
      if (item.carType) {
        const ct = item.carType.toUpperCase().trim();
        acc[ct] = (acc[ct] || 0) + (item._count._all ?? 0);
      }
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
        documents: documentCount,
        totalConnections: wireEndpointCount,
        dataSource: 'database',
      },
      byCarType,
      connectorsByCarType,
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