import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const analysis: any = {
      connectors: {},
      wires: {},
      drawings: {},
      issues: []
    };

    const [allConnectors, allWires, allDrawings] = await Promise.all([
      prisma.connector.findMany({ include: { pins: true } }),
      prisma.wire.findMany({ take: 1000 }),
      prisma.drawing.findMany({ include: { connectors: { include: { pins: true } }, trainLines: true }, take: 100 })
    ]);

    const connectorsWithPins = allConnectors.filter(c => c.pins.length > 0).length;
    const connectorsWithoutPins = allConnectors.filter(c => c.pins.length === 0).length;

    analysis.connectors = {
      total: allConnectors.length,
      withPins: connectorsWithPins,
      withoutPins: connectorsWithoutPins,
      totalPins: allConnectors.reduce((acc, c) => acc + c.pins.length, 0),
      avgPinsPerConnector: allConnectors.length > 0 
        ? (allConnectors.reduce((acc, c) => acc + c.pins.length, 0) / allConnectors.length).toFixed(2)
        : 0
    };

    analysis.connectors.withoutPinsExamples = allConnectors
      .filter(c => c.pins.length === 0)
      .slice(0, 10)
      .map(c => ({ code: c.connectorCode, carType: c.carType, description: c.description }));

    const wiresWithSource = allWires.filter(w => w.sourceConnector).length;
    const wiresWithDest = allWires.filter(w => w.destConnector).length;
    const wiresWithBoth = allWires.filter(w => w.sourceConnector && w.destConnector).length;
    const wiresWithNoConnections = allWires.filter(w => !w.sourceConnector && !w.destConnector).length;

    analysis.wires = {
      sampled: allWires.length,
      withSource: wiresWithSource,
      withDest: wiresWithDest,
      withBoth: wiresWithBoth,
      withoutConnections: wiresWithNoConnections,
      connectionPercentage: ((wiresWithBoth / allWires.length) * 100).toFixed(1)
    };

    analysis.wires.withoutConnectionsExamples = await prisma.wire.findMany({
      where: { AND: [{ sourceConnector: null }, { destConnector: null }] },
      take: 20,
      select: { wireNo: true, signalName: true, voltageClass: true }
    });

    const drawingsWithConnectors = allDrawings.filter(d => d.connectors.length > 0).length;
    const drawingsWithoutConnectors = allDrawings.filter(d => d.connectors.length === 0).length;
    const totalConnectorsInDrawings = allDrawings.reduce((acc, d) => acc + d.connectors.length, 0);

    analysis.drawings = {
      sampled: allDrawings.length,
      withConnectors: drawingsWithConnectors,
      withoutConnectors: drawingsWithoutConnectors,
      totalConnectorsLinked: totalConnectorsInDrawings
    };

    analysis.drawings.withoutConnectorsExamples = allDrawings
      .filter(d => d.connectors.length === 0)
      .slice(0, 10)
      .map(d => ({ drawingNo: d.drawingNo, title: d.title, sourceFile: d.sourceFileId }));

    const allPins = await prisma.connectorPin.findMany({ take: 500 });
    const pinsWithWire = allPins.filter(p => p.wireNo).length;
    const pinsWithoutWire = allPins.filter(p => !p.wireNo).length;

    analysis.pins = {
      sampled: allPins.length,
      withWire: pinsWithWire,
      withoutWire: pinsWithoutWire,
      percentageWithWire: ((pinsWithWire / allPins.length) * 100).toFixed(1)
    };

    analysis.issues = [
      {
        severity: 'critical',
        category: 'Connectors',
        message: `${connectorsWithoutPins} connectors (${((connectorsWithoutPins/allConnectors.length)*100).toFixed(1)}%) have no pins assigned`,
        count: connectorsWithoutPins
      },
      {
        severity: 'critical',
        category: 'Wires',
        message: `${wiresWithNoConnections} sampled wires have no connections (${analysis.wires.connectionPercentage}% connected)`,
        count: wiresWithNoConnections
      },
      {
        severity: 'high',
        category: 'Drawings',
        message: `${drawingsWithoutConnectors} sampled drawings have no connectors linked`,
        count: drawingsWithoutConnectors
      },
      {
        severity: 'medium',
        category: 'Pins',
        message: `${pinsWithoutWire} pins have no wire connections`,
        count: pinsWithoutWire
      }
    ];

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Wiring analysis error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}