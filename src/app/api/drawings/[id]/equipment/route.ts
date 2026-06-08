import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/drawings/[id]/equipment
 * 
 * Returns all equipment/devices on a drawing with wire connections.
 * Shows which wires are connected to each device.
 * 
 * Query Parameters:
 * - include_wires: 'true' to include connected wires (default: true)
 * - limit: max equipment (default: 500)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const includeWires = request.nextUrl.searchParams.get('include_wires') !== 'false';
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

    // Get all equipment on this drawing
    const equipment = await prisma.device.findMany({
      where: { drawingId: drawing.id },
      include: {
        system: true,
        wireEndpoints: {
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
            connector: true,
            pin: true,
          },
          orderBy: { wire: { wireNo: 'asc' } },
        },
      },
      orderBy: { deviceName: 'asc' },
      take: limit,
    });

    // Format equipment with wire connections
    const formattedEquipment = equipment.map(dev => {
      const wireEndpoints = dev.wireEndpoints || [];

      return {
        id: dev.id,
        tagNo: dev.tagNo,
        deviceName: dev.deviceName,
        deviceType: dev.deviceType,
        manufacturerRef: dev.manufacturerRef,
        locationTag: dev.locationTag,
        carType: dev.carType,
        systemCode: dev.system?.code,
        systemName: dev.system?.name,
        note: dev.note,
        wireCount: wireEndpoints.length,
        // Wire connections
        ...(includeWires && {
          wireConnections: wireEndpoints.map(we => {
            const wire = we.wire;
            const otherEndpoints = wire.endpoints.filter(ep => ep.id !== we.id);

            return {
              wireNo: wire.wireNo,
              signalName: wire.signalName,
              wireColor: wire.wireColor,
              wireSize: wire.wireSize,
              conductorClass: wire.conductorClassCode,
              voltageClass: wire.voltageClass,
              shielded: wire.shielded,
              // This device's connection point
              connectedAt: {
                role: we.endpointRole,
                label: we.endpointLabel,
                endpointPin: we.endpointPin,
                connector: we.connector?.connectorCode,
                pin: we.pin?.pinNo,
              },
              // Where this wire goes from this device
              routes: otherEndpoints.map(ep => ({
                role: ep.endpointRole,
                label: ep.endpointLabel,
                device: ep.device?.deviceName,
                deviceTag: ep.device?.tagNo,
                connector: ep.connector?.connectorCode,
                connectorCode: ep.connector?.connectorCode,
                pin: ep.pin?.pinNo,
              })),
            };
          }),
        }),
      };
    });

    // Statistics
    const totalWires = equipment.reduce((sum, e) => sum + e.wireEndpoints.length, 0);
    const devicesByType = equipment.reduce((acc, e) => {
      const type = e.deviceType || 'UNKNOWN';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      drawing: {
        id: drawing.id,
        drawingNo: drawing.drawingNo,
        title: drawing.title,
      },
      equipment: formattedEquipment,
      summary: {
        totalEquipment: formattedEquipment.length,
        totalWires,
        averageWiresPerEquipment: formattedEquipment.length > 0
          ? (totalWires / formattedEquipment.length).toFixed(2)
          : 0,
        devicesByType,
      },
    });
  } catch (error) {
    console.error('Error fetching drawing equipment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drawing equipment', details: String(error) },
      { status: 500 }
    );
  }
}
