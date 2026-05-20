import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET - Trace a wire across all drawings
 * This fixes the issue where wire search only returned one drawing
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wireNo = searchParams.get('wire_no');
    const includeDetails = searchParams.get('details') === 'true';
    
    if (!wireNo) {
      return NextResponse.json(
        { error: 'wire_no parameter is required' },
        { status: 400 }
      );
    }
    
    console.log(`🔍 Tracing wire: ${wireNo}`);
    
    // Find the wire record
    const wire = await prisma.wire.findUnique({
      where: { wireNo },
      include: {
        endpoints: {
          include: {
            device: true,
            connector: {
              include: {
                drawing: {
                  include: {
                    system: true,
                  },
                },
                pins: true,
              },
            },
            pin: true,
          },
        },
      },
    });
    
    if (!wire) {
      return NextResponse.json(
        { 
          error: `Wire ${wireNo} not found`,
          suggestions: [
            'Check the wire number format',
            'Try searching for partial wire numbers',
            'Check related trainlines',
          ],
        },
        { status: 404 }
      );
    }
    
    // Find all trainlines that use this wire
    const trainlines = await prisma.trainLine.findMany({
      where: { wireNo: { contains: wireNo } },
      include: {
        drawing: {
          include: {
            system: true,
          },
        },
      },
    });
    
    // Find all connectors with pins using this wire
    const connectorPins = await prisma.connectorPin.findMany({
      where: { wireNo: { contains: wireNo } },
      include: {
        connector: {
          include: {
            drawing: {
              include: {
                system: true,
              },
            },
          },
        },
      },
    });
    
    // Group by drawing to show all drawings containing this wire
    const drawingsMap = new Map();
    
    // Add from wire endpoints
    wire.endpoints.forEach(endpoint => {
      if (endpoint.connector?.drawing) {
        const drawing = endpoint.connector.drawing;
        if (!drawingsMap.has(drawing.id)) {
          drawingsMap.set(drawing.id, {
            drawing,
            endpoints: [],
            pins: [],
          });
        }
        drawingsMap.get(drawing.id).endpoints.push(endpoint);
      }
    });
    
    // Add from trainlines
    trainlines.forEach(tl => {
      if (tl.drawing && !drawingsMap.has(tl.drawing.id)) {
        drawingsMap.set(tl.drawing.id, {
          drawing: tl.drawing,
          endpoints: [],
          pins: [],
          trainline: tl,
        });
      }
    });
    
    // Add from connector pins
    connectorPins.forEach(pin => {
      if (pin.connector?.drawing && !drawingsMap.has(pin.connector.drawing.id)) {
        drawingsMap.set(pin.connector.drawing.id, {
          drawing: pin.connector.drawing,
          endpoints: [],
          pins: [pin],
        });
      } else if (pin.connector?.drawing) {
        drawingsMap.get(pin.connector.drawing.id).pins.push(pin);
      }
    });
    
    // Build response
    const result = {
      wire: {
        wireNo: wire.wireNo,
        signalName: wire.signalName,
        description: wire.description,
        conductorClassCode: wire.conductorClassCode,
        voltageClass: wire.voltageClass,
        wireSize: wire.wireSize,
        wireColor: wire.wireColor,
        cableSpec: wire.cableSpec,
      },
      summary: {
        totalDrawings: drawingsMap.size,
        totalEndpoints: wire.endpoints.length,
        totalTrainlines: trainlines.length,
        totalConnectorPins: connectorPins.length,
      },
      drawings: Array.from(drawingsMap.values()).map(item => ({
        drawingId: item.drawing.id,
        drawingNo: item.drawing.drawingNo,
        title: item.drawing.title,
        revision: item.drawing.revision,
        system: item.drawing.system ? {
          code: item.drawing.system.code,
          name: item.drawing.system.name,
        } : null,
        endpoints: item.endpoints.map((e: any) => ({
          endpointId: e.id,
          role: e.endpointRole,
          label: e.endpointLabel,
          device: e.device ? {
            tagNo: e.device.tagNo,
            deviceName: e.device.deviceName,
          } : null,
          connector: e.connector ? {
            code: e.connector.connectorCode,
            locationTag: e.connector.locationTag,
          } : null,
        })),
        pins: item.pins.map(p => ({
          pinNo: p.pinNo,
          signalName: p.signalName,
          voltageText: p.voltageText,
          terminalFrom: p.terminalFrom,
          terminalTo: p.terminalTo,
        })),
        trainline: item.trainline ? {
          itemName: item.trainline.itemName,
          lineGroup: item.trainline.lineGroup,
          note: item.trainline.note,
        } : null,
      })),
      trainlines: trainlines.map(tl => ({
        wireNo: tl.wireNo,
        itemName: tl.itemName,
        lineGroup: tl.lineGroup,
        carType: tl.carType,
        sourceSheet: tl.sourceSheet,
        note: tl.note,
        drawing: tl.drawing ? {
          drawingNo: tl.drawing.drawingNo,
          title: tl.drawing.title,
        } : null,
      })),
      connectorPins: connectorPins.map(p => ({
        connectorCode: p.connector?.connectorCode,
        pinNo: p.pinNo,
        signalName: p.signalName,
        voltageText: p.voltageText,
        terminalFrom: p.terminalFrom,
        terminalTo: p.terminalTo,
        drawing: p.connector?.drawing ? {
          drawingNo: p.connector.drawing.drawingNo,
          title: p.connector.drawing.title,
        } : null,
      })),
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Wire trace error:', error);
    return NextResponse.json(
      { error: 'Failed to trace wire', details: String(error) },
      { status: 500 }
    );
  }
}
