import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * REPAIR SCRIPT 2: Fix DrawingWire via ConnectorPin.wireNo chain
 * 
 * Chain: ConnectorPin.wireNo → Wire.wireNo → Connector → Drawing
 * This catches wires that are referenced on pins but not linked via WireEndpoint.
 */

export async function POST() {
  const startTime = Date.now();

  try {
    // STEP 1: Get pins with wireNo that are on connectors with drawings
    const pinsWithWire = await prisma.connectorPin.findMany({
      where: { wireNo: { not: null } },
      include: {
        connector: {
          select: { id: true, drawingId: true, drawing: { select: { drawingNo: true } } }
        },
      },
    });

    console.log(`Found ${pinsWithWire.length} pins with wire numbers`);

    // STEP 2: Map wireNo → wireId via Wire table
    const uniqueWireNos = [...new Set(pinsWithWire.map(p => p.wireNo).filter(Boolean))] as string[];
    
    const wires = await prisma.wire.findMany({
      where: { wireNo: { in: uniqueWireNos } },
      select: { id: true, wireNo: true },
    });
    
    const wireNoToId = new Map(wires.map(w => [w.wireNo, w.id]));
    console.log(`Mapped ${wireNoToId.size} wire numbers to IDs`);

    // STEP 3: Build DrawingWire pairs from pin→wire→drawing chain
    const pairs: { wireId: string; drawingId: string }[] = [];
    
    for (const pin of pinsWithWire) {
      if (!pin.wireNo || !pin.connector?.drawingId) continue;
      const wireId = wireNoToId.get(pin.wireNo);
      if (!wireId) continue;
      
      pairs.push({ wireId, drawingId: pin.connector.drawingId });
    }

    const uniquePairs = [...new Map(
      pairs.map(p => [`${p.wireId}+${p.drawingId}`, p])
    ).values()];

    console.log(`${uniquePairs.length} unique pairs to insert`);

    // STEP 4: Bulk insert
    let created = 0;
    if (uniquePairs.length > 0) {
      const result = await prisma.drawingWire.createMany({
        data: uniquePairs,
        skipDuplicates: true,
      });
      created = result.count;
    }

    const afterCount = await prisma.drawingWire.count();
    const wireCount = await prisma.wire.count();

    return NextResponse.json({
      status: 'success',
      method: 'ConnectorPin→Wire→Drawing',
      pinsProcessed: pinsWithWire.length,
      uniquePairsExtracted: uniquePairs.length,
      newRecordsCreated: created,
      totalDrawingWire: afterCount,
      totalWires: wireCount,
      coveragePercent: ((afterCount / wireCount) * 100).toFixed(1),
      executionTimeMs: Date.now() - startTime,
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
