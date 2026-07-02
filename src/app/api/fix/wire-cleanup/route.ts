import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * FIX: Remove wrong wire links from drawing 942-58121
 * 
 * Problem: DrawingWire table links VVVF control wires (8001-8006 family)
 * to 942-58121 (Traction Return Current). These wires belong on 942-58120 (VVVF Control).
 * 
 * The PDF is scanned (no text layer), so correct wires cannot be automatically extracted.
 * This repair removes the incorrect links so the drawing shows accurate data.
 */
export async function POST() {
  try {
    // Find 942-58121
    const drawing = await prisma.drawing.findFirst({
      where: { drawingNo: '942-58121' },
      select: { id: true, drawingNo: true, title: true },
    });

    if (!drawing) {
      return NextResponse.json({ error: 'Drawing 942-58121 not found' }, { status: 404 });
    }

    // Get all DrawingWire links for this drawing
    const drawingWires = await prisma.drawingWire.findMany({
      where: { drawingId: drawing.id },
      include: { wire: { select: { wireNo: true, signalName: true } } },
    });

    console.log(`Found ${drawingWires.length} DrawingWire links for ${drawing.drawingNo}`);

    // Identify VVVF control wires (8001-8006 family)
    const vvvfWireNos = ['8001', '8002', '8003', '8004', '8005', '8006'];
    const wrongLinks = drawingWires.filter(dw => {
      const wireNo = dw.wire?.wireNo || '';
      // Check if wire starts with any VVVF wire number
      return vvvfWireNos.some(vn => wireNo === vn || wireNo.startsWith(vn + '/') || wireNo.startsWith(vn + 'a') || wireNo.startsWith(vn + 'b') || wireNo.startsWith(vn + 'c') || wireNo.startsWith(vn + 'd'));
    });

    console.log(`Found ${wrongLinks.length} wrong VVVF wire links`);

    // Remove wrong links
    if (wrongLinks.length > 0) {
      const ids = wrongLinks.map(dw => dw.id);
      await prisma.drawingWire.deleteMany({
        where: { id: { in: ids } },
      });
      console.log(`Removed ${wrongLinks.length} wrong DrawingWire links`);
    }

    // Also remove SPD/TM connectors that have 0 pins (placeholders)
    const placeholderConnectors = await prisma.connector.findMany({
      where: {
        drawingId: drawing.id,
        connectorCode: { in: ['SPD', 'TM'] },
      },
      include: { _count: { select: { pins: true } } },
    });

    let connectorsRemoved = 0;
    for (const conn of placeholderConnectors) {
      if (conn._count.pins === 0) {
        await prisma.connector.delete({ where: { id: conn.id } });
        connectorsRemoved++;
        console.log(`Removed placeholder connector: ${conn.connectorCode}`);
      }
    }

    // Verify remaining state
    const remainingWires = await prisma.drawingWire.count({ where: { drawingId: drawing.id } });
    const remainingConnectors = await prisma.connector.findMany({
      where: { drawingId: drawing.id },
      select: { connectorCode: true, _count: { select: { pins: true } } },
    });

    return NextResponse.json({
      status: 'success',
      drawing: drawing.drawingNo,
      title: drawing.title,
      removed: {
        wrongWireLinks: wrongLinks.length,
        placeholderConnectors: connectorsRemoved,
      },
      remaining: {
        wireLinks: remainingWires,
        connectors: remainingConnectors.map(c => ({
          code: c.connectorCode,
          pins: c._count.pins,
        })),
      },
      message: `Removed ${wrongLinks.length} wrong VVVF wire links and ${connectorsRemoved} placeholder connectors from ${drawing.drawingNo}. The PDF is scanned so correct wires need manual identification.`,
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
