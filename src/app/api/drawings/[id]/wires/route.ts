import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/drawings/[id]/wires
 * 
 * Returns all wires connected to a specific drawing with full connectivity information.
 * Includes source/destination equipment, connectors, pins, and signal details.
 * 
 * Query Parameters:
 * - include_trace: 'true' to include complete wire path tracing (default: true)
 * - limit: max results (default: 500)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const includeTrace = request.nextUrl.searchParams.get('include_trace') !== 'false';
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

    // Get all wires on this drawing
    const drawingWires = await prisma.drawingWire.findMany({
      where: { drawingId: drawing.id },
      include: {
        wire: {
          include: {
            endpoints: {
              include: {
                device: true,
                connector: true,
                pin: true,
              },
            },
          },
        },
      },
      orderBy: { wire: { wireNo: 'asc' } },
      take: limit,
    });

    // Format with complete trace information
    const wires = drawingWires.map(dw => {
      const w = dw.wire;
      const endpoints = w.endpoints || [];

      // Find source and destination
      const sourceEp = endpoints.find(ep => ep.endpointRole === 'SOURCE' || ep.endpointRole === 'FROM');
      const destEp = endpoints.find(ep => ep.endpointRole === 'DEST' || ep.endpointRole === 'TO');

      return {
        id: w.id,
        wireNo: w.wireNo,
        signalName: w.signalName,
        wireSize: w.wireSize,
        wireColor: w.wireColor,
        cableSpec: w.cableSpec,
        shielded: w.shielded,
        voltageClass: w.voltageClass,
        conductorClass: w.conductorClassCode,
        remarks: w.remarks,
        pageNo: dw.pageNo,
        sheetNo: dw.sheetNo,
        context: dw.context,
        // Connectivity
        source: sourceEp ? {
          label: sourceEp.endpointLabel,
          device: sourceEp.device?.deviceName,
          deviceId: sourceEp.device?.id,
          deviceTag: sourceEp.device?.tagNo,
          connector: sourceEp.connector?.connectorCode,
          pin: sourceEp.pin?.pinNo,
        } : null,
        destination: destEp ? {
          label: destEp.endpointLabel,
          device: destEp.device?.deviceName,
          deviceId: destEp.device?.id,
          deviceTag: destEp.device?.tagNo,
          connector: destEp.connector?.connectorCode,
          pin: destEp.pin?.pinNo,
        } : null,
        // All endpoints if include_trace
        ...(includeTrace && {
          allEndpoints: endpoints.map(ep => ({
            role: ep.endpointRole,
            label: ep.endpointLabel,
            device: ep.device?.deviceName,
            connector: ep.connector?.connectorCode,
            pin: ep.pin?.pinNo,
          })),
        }),
      };
    });

    return NextResponse.json({
      drawing: {
        id: drawing.id,
        drawingNo: drawing.drawingNo,
        title: drawing.title,
      },
      wires,
      summary: {
        total: wires.length,
        withSource: wires.filter(w => w.source).length,
        withDest: wires.filter(w => w.destination).length,
        shielded: wires.filter(w => w.shielded).length,
      },
    });
  } catch (error) {
    console.error('Error fetching drawing wires:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drawing wires', details: String(error) },
      { status: 500 }
    );
  }
}
