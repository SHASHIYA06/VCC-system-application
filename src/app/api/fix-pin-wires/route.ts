import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get all trainlines that have wireNo and connector/pin info
    const trainlines = await prisma.trainLine.findMany({
      where: { 
        wireNo: { not: null },
        connectorCode: { not: null },
        pinNo: { not: null }
      },
      include: {
        drawing: true
      }
    });

    console.log(`Found ${trainlines.length} trainlines with wire connections`);

    // Group trainlines by connector code for faster lookup
    const byConnector: Record<string, any[]> = {};
    for (const tl of trainlines) {
      if (tl.connectorCode && tl.pinNo) {
        if (!byConnector[tl.connectorCode]) byConnector[tl.connectorCode] = [];
        byConnector[tl.connectorCode].push({
          pinNo: tl.pinNo,
          wireNo: tl.wireNo,
          signalName: tl.itemName,
          drawingNo: tl.drawing?.drawingNo
        });
      }
    }

    // Get all connectors with their pins
    const connectors = await prisma.connector.findMany({
      include: { pins: true }
    });

    let totalUpdated = 0;

    // Update pins based on connector code + pin number match
    for (const conn of connectors) {
      const connPins = byConnector[conn.connectorCode];
      if (!connPins) continue;

      for (const pin of conn.pins) {
        const match = connPins.find(cp => cp.pinNo === pin.pinNo);
        if (match && !pin.wireNo) {
          await prisma.connectorPin.update({
            where: { id: pin.id },
            data: {
              wireNo: match.wireNo,
              signalName: match.signalName
            }
          });
          totalUpdated++;
        }
      }
    }

    // Also try matching by drawing
    const allTrainlines = await prisma.trainLine.findMany({
      where: { wireNo: { not: null } },
      include: { drawing: true }
    });

    const unmatchedPins = await prisma.connectorPin.findMany({
      where: { wireNo: null },
      include: { connector: { include: { drawing: true } } }
    });

    for (const pin of unmatchedPins) {
      const dwgNo = pin.connector?.drawing?.drawingNo;
      const connCode = pin.connector?.connectorCode;
      
      const match = allTrainlines.find(t => 
        t.connectorCode === connCode && 
        t.pinNo === pin.pinNo &&
        t.drawing?.drawingNo === dwgNo
      );

      if (match) {
        await prisma.connectorPin.update({
          where: { id: pin.id },
          data: {
            wireNo: match.wireNo,
            signalName: match.itemName
          }
        });
        totalUpdated++;
      }
    }

    return NextResponse.json({
      success: true,
      totalTrainlines: trainlines.length,
      uniqueConnectors: Object.keys(byConnector).length,
      totalUpdated,
      message: `Updated ${totalUpdated} pins with wire connections`
    });

  } catch (error) {
    console.error('Fix pins error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const [totalPins, pinsWithWire, connectors, trainlines] = await Promise.all([
      prisma.connectorPin.count(),
      prisma.connectorPin.count({ where: { wireNo: { not: null } } }),
      prisma.connector.count(),
      prisma.trainLine.count({ where: { wireNo: { not: null } } })
    ]);

    return NextResponse.json({
      status: 'ok',
      pins: {
        total: totalPins,
        withWireNo: pinsWithWire,
        withoutWireNo: totalPins - pinsWithWire,
        percentage: totalPins > 0 ? Math.round((pinsWithWire / totalPins) * 100) : 0
      },
      trainlines: trainlines,
      connectors
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}