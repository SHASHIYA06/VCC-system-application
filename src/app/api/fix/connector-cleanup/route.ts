import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * FIX CONNECTOR DATA for drawing 942-58121
 * Removes duplicate VVVF connector that belongs on 942-58119 (Speed Control)
 */
export async function POST() {
  try {
    // Find the VVVF connector on 942-58121
    const drawing = await prisma.drawing.findFirst({
      where: { drawingNo: '942-58121' },
      select: { id: true, drawingNo: true, title: true },
    });

    if (!drawing) {
      return NextResponse.json({ error: 'Drawing 942-58121 not found' }, { status: 404 });
    }

    // Find VVVF connector on this drawing
    const vvvfConnector = await prisma.connector.findFirst({
      where: {
        drawingId: drawing.id,
        connectorCode: 'VVVF',
      },
      include: {
        pins: { select: { id: true, pinNo: true, wireNo: true } },
        wireEndpoints: { select: { id: true } },
      },
    });

    if (!vvvfConnector) {
      return NextResponse.json({ error: 'VVVF connector not found on 942-58121' }, { status: 404 });
    }

    console.log(`Found VVVF connector on ${drawing.drawingNo}: ${vvvfConnector.pins.length} pins, ${vvvfConnector.wireEndpoints.length} wire endpoints`);

    // Delete wire endpoints first (FK constraint)
    if (vvvfConnector.wireEndpoints.length > 0) {
      await prisma.wireEndpoint.deleteMany({
        where: { connectorId: vvvfConnector.id },
      });
      console.log(`Deleted ${vvvfConnector.wireEndpoints.length} wire endpoints`);
    }

    // Delete pins (FK constraint)
    if (vvvfConnector.pins.length > 0) {
      await prisma.connectorPin.deleteMany({
        where: { connectorId: vvvfConnector.id },
      });
      console.log(`Deleted ${vvvfConnector.pins.length} pins`);
    }

    // Delete the connector
    await prisma.connector.delete({
      where: { id: vvvfConnector.id },
    });
    console.log(`Deleted VVVF connector from ${drawing.drawingNo}`);

    // Verify remaining connectors
    const remaining = await prisma.connector.findMany({
      where: { drawingId: drawing.id },
      select: { connectorCode: true, _count: { select: { pins: true } } },
    });

    return NextResponse.json({
      status: 'success',
      drawing: drawing.drawingNo,
      removed: {
        connectorCode: 'VVVF',
        pinsDeleted: vvvfConnector.pins.length,
        wireEndpointsDeleted: vvvfConnector.wireEndpoints.length,
      },
      remainingConnectors: remaining.map(c => ({
        code: c.connectorCode,
        pins: c._count.pins,
      })),
      message: `Removed duplicate VVVF connector from ${drawing.drawingNo}. Remaining: ${remaining.map(c => c.connectorCode).join(', ')}`,
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
