import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/drawings/[id]/connectors
 * 
 * Returns all connectors on a drawing with complete pinout information.
 * Shows which wires/signals are on each pin.
 * 
 * Query Parameters:
 * - include_pins: 'true' to include all pins (default: true)
 * - limit: max connectors (default: 500)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const includePins = request.nextUrl.searchParams.get('include_pins') !== 'false';
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '500'), 1000);

  try {
    // Find the drawing
    const drawing = await prisma.drawing.findFirst({
      where: {
        OR: [
          { id },
          { drawingNo: { contains: id } },
        ],
      },
    });

    if (!drawing) {
      return NextResponse.json({ error: 'Drawing not found' }, { status: 404 });
    }

    // Get all connectors on this drawing
    const connectors = await prisma.connector.findMany({
      where: { drawingId: drawing.id },
      include: {
        pins: {
          include: {
            wireEndpoints: {
              include: {
                wire: {
                  include: {
                    endpoints: {
                      include: {
                        device: true,
                      },
                    },
                  },
                },
              },
            },
            conductorClass: true,
          },
          orderBy: { pinNo: 'asc' },
        },
        connectorType: true,
        wireEndpoints: {
          include: {
            wire: true,
          },
        },
      },
      orderBy: { connectorCode: 'asc' },
      take: limit,
    });

    // Format connectors with complete pinout
    const formattedConnectors = connectors.map(conn => ({
      id: conn.id,
      code: conn.connectorCode,
      type: conn.connectorTypeCode,
      typeName: conn.connectorType?.description,
      description: conn.description,
      locationTag: conn.locationTag,
      carType: conn.carType,
      scope: conn.scope,
      instanceLabel: conn.instanceLabel,
      sideTag: conn.sideTag,
      pinCount: conn.pinCount || conn.pins.length,
      totalWires: conn.wireEndpoints.length,
      // Pins with wire/signal information
      ...(includePins && {
        pins: conn.pins.map(pin => ({
          id: pin.id,
          pinNo: pin.pinNo,
          pinLabel: pin.pinLabel,
          signalName: pin.signalName,
          wireNo: pin.wireNo,
          conductorClass: pin.conductorClassCode,
          conductorClassName: pin.conductorClass?.description,
          voltage: pin.voltageText,
          terminalFrom: pin.terminalFrom,
          terminalTo: pin.terminalTo,
          note: pin.note,
          // Wire connectivity on this pin
          connectedWires: pin.wireEndpoints.map(we => ({
            wireNo: we.wire.wireNo,
            signalName: we.wire.signalName,
            wireColor: we.wire.wireColor,
            wireSize: we.wire.wireSize,
            // Trace where this wire goes
            otherEndpoints: we.wire.endpoints
              .filter(ep => ep.id !== we.id)
              .map(ep => ({
                role: ep.endpointRole,
                label: ep.endpointLabel,
                device: ep.device?.deviceName,
                deviceTag: ep.device?.tagNo,
              })),
          })),
        })),
      }),
    }));

    return NextResponse.json({
      drawing: {
        id: drawing.id,
        drawingNo: drawing.drawingNo,
        title: drawing.title,
      },
      connectors: formattedConnectors,
      summary: {
        total: formattedConnectors.length,
        totalPins: formattedConnectors.reduce((sum, c) => sum + (c.pinCount || 0), 0),
        totalWires: formattedConnectors.reduce((sum, c) => sum + (c.totalWires || 0), 0),
        byScope: formattedConnectors.reduce((acc, c) => {
          const scope = c.scope || 'UNKNOWN';
          acc[scope] = (acc[scope] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    console.error('Error fetching drawing connectors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drawing connectors', details: String(error) },
      { status: 500 }
    );
  }
}
