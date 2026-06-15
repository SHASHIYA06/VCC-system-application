/**
 * GET /api/pins/[pinId] - Get specific pin with full connection details
 * Returns: pin details + connected wire + connector info + other pins on same connector
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pinId: string }> }
) {
  const { pinId } = await params;

  try {
    // Fetch the specific pin with all related data
    const pin = await prisma.connectorPin.findUnique({
      where: { id: pinId },
      include: {
        connector: {
          include: {
            drawing: {
              include: {
                system: { select: { code: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!pin) {
      return NextResponse.json({ error: 'Pin not found' }, { status: 404 });
    }

    // Get the wire details if wireNo exists
    let wire = null;
    if (pin.wireNo) {
      wire = await prisma.wire.findFirst({
        where: { wireNo: pin.wireNo },
        select: {
          wireNo: true,
          signalName: true,
          description: true,
          wireColor: true,
          wireSize: true,
          voltageClass: true,
          sourceEquipment: true,
          sourceConnector: true,
          sourcePin: true,
          destEquipment: true,
          destConnector: true,
          destPin: true,
        },
      });
    }

    // Get other pins on the same connector (for context)
    const otherPins = await prisma.connectorPin.findMany({
      where: {
        connectorId: pin.connectorId,
        id: { not: pin.id },
      },
      select: {
        pinNo: true,
        signalName: true,
        wireNo: true,
      },
      orderBy: { pinNo: 'asc' },
      take: 30,
    });

    return NextResponse.json({
      id: pin.id,
      pinNo: pin.pinNo,
      signalName: pin.signalName,
      wireNo: pin.wireNo,
      voltageText: pin.voltageText,
      conductorClassCode: pin.conductorClassCode,
      terminalFrom: pin.terminalFrom,
      terminalTo: pin.terminalTo,
      note: pin.note,
      connector: pin.connector ? {
        connectorCode: pin.connector.connectorCode,
        carType: pin.connector.carType,
        locationTag: pin.connector.locationTag,
        pinCount: pin.connector.pinCount,
        drawing: pin.connector.drawing ? {
          drawingNo: pin.connector.drawing.drawingNo,
          title: pin.connector.drawing.title,
          system: pin.connector.drawing.system,
        } : null,
      } : null,
      wire,
      otherPinsOnConnector: otherPins,
    });
  } catch (error) {
    console.error('Pin detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pin details', details: String(error) },
      { status: 500 }
    );
  }
}
