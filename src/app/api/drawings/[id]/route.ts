import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const includeAll = request.nextUrl.searchParams.get('detailed') === 'true';

  try {
    const drawing = await prisma.drawing.findFirst({
      where: {
        OR: [
          { id: id },
          { drawingNo: { contains: id, mode: Prisma.QueryMode.insensitive } },
        ],
      },
      include: {
        pages: { orderBy: { pageNo: 'asc' } },
        system: true,
        connectors: { include: { pins: true } },
        devices: true,
        notes: true,
        wires: {
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
        },
        pageMappings: true,
      },
    });

    if (!drawing) {
      return NextResponse.json({ error: 'Drawing not found' }, { status: 404 });
    }

    // CRITICAL: Get all connector pins with wire details
    const pins = await prisma.connectorPin.findMany({
      where: {
        connector: {
          drawingId: drawing.id,
        },
      },
      include: {
        connector: true,
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
          },
        },
      },
      take: 1000,
    });

    // CRITICAL: Get all wires connected to this drawing
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
    });

    // CRITICAL: Get all equipment/devices on this drawing
    const equipment = await prisma.device.findMany({
      where: { drawingId: drawing.id },
      include: {
        wireEndpoints: {
          include: {
            wire: {
              include: {
                endpoints: {
                  include: {
                    device: true,
                    connector: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Get all train lines
    const trainLines = await prisma.trainLine.findMany({
      where: { drawingId: drawing.id },
      include: {
        conductorClass: true,
      },
      take: 500,
    });

    // Format pins with complete wire trace information
    const formattedPins = pins.map(pin => {
      const wireEndpointsData = pin.wireEndpoints || [];
      const wires = wireEndpointsData.map(we => we.wire);

      return {
        id: pin.id,
        pinNo: pin.pinNo,
        pinLabel: pin.pinLabel,
        signalName: pin.signalName,
        wireNo: pin.wireNo,
        conductorClass: pin.conductorClassCode,
        voltageText: pin.voltageText,
        terminalFrom: pin.terminalFrom,
        terminalTo: pin.terminalTo,
        connectorCode: pin.connector?.connectorCode || 'N/A',
        connectorId: pin.connector?.id,
        note: pin.note,
        // Wire trace information
        connectedWires: wires.map(w => ({
          id: w.id,
          wireNo: w.wireNo,
          signalName: w.signalName,
          wireSize: w.wireSize,
          wireColor: w.wireColor,
          cableSpec: w.cableSpec,
          shielded: w.shielded,
          endpoints: w.endpoints.map(ep => ({
            role: ep.endpointRole,
            label: ep.endpointLabel,
            device: ep.device?.deviceName,
            deviceTag: ep.device?.tagNo,
            connector: ep.connector?.connectorCode,
            pin: ep.pin?.pinNo,
          })),
        })),
      };
    });

    // Format wires with full connectivity
    const formattedWires = drawingWires.map(dw => ({
      id: dw.wire.id,
      wireNo: dw.wire.wireNo,
      signalName: dw.wire.signalName,
      wireSize: dw.wire.wireSize,
      wireColor: dw.wire.wireColor,
      cableSpec: dw.wire.cableSpec,
      shielded: dw.wire.shielded,
      voltageClass: dw.wire.voltageClass,
      conductorClass: dw.wire.conductorClassCode,
      sourceEquipment: dw.wire.sourceEquipment,
      destEquipment: dw.wire.destEquipment,
      pageNo: dw.pageNo,
      sheetNo: dw.sheetNo,
      context: dw.context,
      endpoints: dw.wire.endpoints.map(ep => ({
        role: ep.endpointRole,
        label: ep.endpointLabel,
        device: ep.device?.deviceName,
        deviceId: ep.device?.id,
        deviceTag: ep.device?.tagNo,
        connector: ep.connector?.connectorCode,
        connectorId: ep.connector?.id,
        pin: ep.pin?.pinNo,
        pinId: ep.pin?.id,
      })),
    }));

    // Format equipment with wire connections
    const formattedEquipment = equipment.map(dev => ({
      id: dev.id,
      tagNo: dev.tagNo,
      deviceName: dev.deviceName,
      deviceType: dev.deviceType,
      locationTag: dev.locationTag,
      carType: dev.carType,
      manufacturerRef: dev.manufacturerRef,
      connectedWires: dev.wireEndpoints.map(we => ({
        wireNo: we.wire.wireNo,
        signalName: we.wire.signalName,
        role: we.endpointRole,
        label: we.endpointLabel,
      })),
      wireCount: dev.wireEndpoints.length,
    }));

    // Format train lines with wire data
    const formattedTrainLines = trainLines.map(tl => ({
      id: tl.id,
      lineGroup: tl.lineGroup,
      itemName: tl.itemName,
      wireNo: tl.wireNo,
      connectorCode: tl.connectorCode,
      pinNo: tl.pinNo,
      carType: tl.carType,
      conductorClass: tl.conductorClassCode,
      conductorClassName: tl.conductorClass?.description,
      note: tl.note,
    }));

    // Format connectors with all pins
    const formattedConnectors = drawing.connectors.map(c => ({
      id: c.id,
      code: c.connectorCode,
      type: c.connectorTypeCode,
      pinCount: c.pins?.length || c.pinCount || 0,
      description: c.description,
      carType: c.carType,
      locationTag: c.locationTag,
      scope: c.scope,
      pins: c.pins?.map(p => ({
        pinNo: p.pinNo,
        signalName: p.signalName,
        wireNo: p.wireNo,
        conductorClass: p.conductorClassCode,
      })) || [],
    }));

    const remarks = drawing.remarks || '';
    const isPinAssignment = remarks.includes('PIN_ASSIGNMENT');
    const isReference = remarks.includes('REFERENCE');
    const remarksParts = remarks.split('|');
    const carType = remarksParts[2] || (isPinAssignment ? drawing.system?.code : 'ALL') || 'ALL';
    const subsystem = drawing.system?.code || 'GEN';

    const drawingTypeMap: Record<string, string> = {
      GEN: 'DRAWING_LIST',
      TRL: 'SCHEMATIC',
      TRAC: 'SCHEMATIC',
      HV: 'SCHEMATIC',
      BRAKE: 'SCHEMATIC',
      DOOR: 'SCHEMATIC',
      TMS: isPinAssignment ? 'PIN_ASSIGNMENT' : 'SCHEMATIC',
      COMMS: 'SCHEMATIC',
      APS: 'SCHEMATIC',
    };

    const finalDrawingType = isPinAssignment ? 'PIN_ASSIGNMENT' : (isReference ? 'REFERENCE' : drawingTypeMap[drawing.system?.code || 'GEN'] || 'SCHEMATIC');

    // Format all pins in a simple flat structure for frontend display
    const allPins = pins.map(pin => ({
      id: pin.id,
      pinNo: pin.pinNo,
      signalName: pin.signalName,
      wireNo: pin.wireNo,
      connectorCode: pin.connector?.connectorCode,
      connectorId: pin.connector?.id,
      conductorClass: pin.conductorClassCode,
      terminalFrom: pin.terminalFrom,
      terminalTo: pin.terminalTo,
      note: pin.note,
    }));

    return NextResponse.json({
      drawing: {
        id: drawing.id,
        drawingNo: drawing.drawingNo,
        title: drawing.title,
        carType: carType,
        subsystem: subsystem,
        drawingType: finalDrawingType,
        currentRevision: drawing.revision || 'A',
        pageCount: drawing.totalSheets,
        notes: drawing.remarks || '',
        systemCode: drawing.system?.code || 'GEN',
        systemName: drawing.system?.name || 'General',
        sourceFile: drawing.sourceFileId,
        status: drawing.status,
        pdfUrl: drawing.drawingPdfUrl,
      },
      summary: {
        totalConnectors: drawing.connectors?.length || 0,
        totalPins: pins.length,
        totalWires: drawingWires.length,
        totalEquipment: equipment.length,
        totalTrainLines: trainLines.length,
      },
      // Complete detailed data - CRITICAL: All pins flattened for display
      pins: allPins,
      wires: formattedWires,
      equipment: formattedEquipment,
      trainLines: formattedTrainLines,
      connectors: formattedConnectors,
      pageMappings: drawing.pageMappings,
      drawingNotes: drawing.notes,
    });
  } catch (error) {
    console.error('Error fetching drawing:', error);
    return NextResponse.json({ error: 'Failed to fetch drawing', details: String(error) }, { status: 500 });
  }
}