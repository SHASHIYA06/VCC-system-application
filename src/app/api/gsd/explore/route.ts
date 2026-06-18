/**
 * GSD Explorer API - Deep drill-down into train wiring
 * 
 * GET /api/gsd/explore - Get full train hierarchy
 * GET /api/gsd/explore?system=BRAKE - Get system detail with all connectors/wires
 * GET /api/gsd/explore?drawing=942-58128 - Get drawing with all pins and wires
 * GET /api/gsd/explore?connector=CN1&drawing=942-58128 - Get connector pins with wire destinations
 * GET /api/gsd/explore?wire=3001 - Trace wire through entire train
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const systemCode = searchParams.get('system');
  const drawingNo = searchParams.get('drawing');
  const connectorCode = searchParams.get('connector');
  const wireNo = searchParams.get('wire');

  try {
    // LEVEL 1: Full train overview (all systems)
    if (!systemCode && !drawingNo && !connectorCode && !wireNo) {
      const systems = await prisma.system.findMany({
        include: {
          _count: { select: { drawings: true, devices: true } },
          metadata: { select: { totalConnectors: true, totalWires: true, dataCompleteness: true } },
        },
        orderBy: { sortOrder: 'asc' },
      });

      const totalWires = await prisma.wire.count();
      const totalPins = await prisma.connectorPin.count();
      const totalConnectors = await prisma.connector.count();

      return NextResponse.json({
        success: true,
        level: 'train',
        data: {
          systems: systems.map(s => ({
            code: s.code,
            name: s.name,
            category: s.category,
            drawings: s._count.drawings,
            devices: s._count.devices,
            connectors: s.metadata?.totalConnectors || 0,
            wires: s.metadata?.totalWires || 0,
            completeness: Math.round((s.metadata?.dataCompleteness || 0) * 100),
          })),
          totals: { systems: systems.length, drawings: 574, connectors: totalConnectors, pins: totalPins, wires: totalWires },
        },
        executionTime: Date.now() - startTime,
      });
    }

    // LEVEL 2: System detail — all drawings with their connectors
    if (systemCode && !drawingNo && !connectorCode && !wireNo) {
      const system = await prisma.system.findUnique({
        where: { code: systemCode },
        include: {
          drawings: {
            select: {
              id: true, drawingNo: true, title: true, totalSheets: true,
              _count: { select: { connectors: true, devices: true, trainLines: true } },
              connectors: {
                select: { connectorCode: true, pinCount: true, _count: { select: { pins: true } } },
                take: 50,
              },
            },
            orderBy: { drawingNo: 'asc' },
          },
          devices: { select: { id: true, tagNo: true, deviceName: true, deviceType: true }, take: 50 },
          _count: { select: { drawings: true, devices: true } },
        },
      });

      if (!system) return NextResponse.json({ error: 'System not found' }, { status: 404 });

      return NextResponse.json({
        success: true,
        level: 'system',
        data: {
          code: system.code,
          name: system.name,
          category: system.category,
          totalDrawings: system._count.drawings,
          totalDevices: system._count.devices,
          drawings: system.drawings.map(d => ({
            drawingNo: d.drawingNo,
            title: d.title,
            sheets: d.totalSheets,
            connectors: d.connectors.map(c => ({ code: c.connectorCode, pins: c._count.pins || c.pinCount })),
            connectorCount: d._count.connectors,
            deviceCount: d._count.devices,
            trainlineCount: d._count.trainLines,
          })),
          devices: system.devices,
        },
        executionTime: Date.now() - startTime,
      });
    }

    // LEVEL 3: Drawing detail — all connectors with all pins and wires
    if (drawingNo && !connectorCode && !wireNo) {
      const drawing = await prisma.drawing.findFirst({
        where: { drawingNo: { contains: drawingNo } },
        include: {
          system: { select: { code: true, name: true } },
          connectors: {
            include: {
              pins: {
                select: { id: true, pinNo: true, signalName: true, wireNo: true, voltageText: true, conductorClassCode: true },
                orderBy: { pinNo: 'asc' },
              },
            },
            orderBy: { connectorCode: 'asc' },
          },
          devices: { select: { tagNo: true, deviceName: true, deviceType: true } },
          trainLines: { select: { wireNo: true, itemName: true, lineGroup: true }, take: 100 },
        },
      });

      if (!drawing) return NextResponse.json({ error: 'Drawing not found' }, { status: 404 });

      return NextResponse.json({
        success: true,
        level: 'drawing',
        data: {
          drawingNo: drawing.drawingNo,
          title: drawing.title,
          system: drawing.system,
          sheets: drawing.totalSheets,
          connectors: drawing.connectors.map(c => ({
            code: c.connectorCode,
            carType: c.carType,
            location: c.locationTag,
            totalPins: c.pins.length,
            pins: c.pins.map(p => ({
              pin: p.pinNo,
              signal: p.signalName,
              wire: p.wireNo,
              voltage: p.voltageText,
              class: p.conductorClassCode,
            })),
          })),
          devices: drawing.devices,
          trainlines: drawing.trainLines,
        },
        executionTime: Date.now() - startTime,
      });
    }

    // LEVEL 4: Wire trace — follow wire through entire train
    if (wireNo) {
      const wire = await prisma.wire.findFirst({
        where: { wireNo: wireNo },
        include: {
          endpoints: {
            include: {
              device: { select: { tagNo: true, deviceName: true, system: { select: { code: true } } } },
              connector: { select: { connectorCode: true, drawing: { select: { drawingNo: true, system: { select: { code: true } } } } } },
              pin: { select: { pinNo: true, signalName: true } },
            },
          },
          drawings: {
            include: { drawing: { select: { drawingNo: true, title: true, system: { select: { code: true, name: true } } } } },
            take: 20,
          },
        },
      });

      // Also find all pins with this wireNo
      const pins = await prisma.connectorPin.findMany({
        where: { wireNo: wireNo },
        include: {
          connector: {
            select: {
              connectorCode: true, carType: true,
              drawing: { select: { drawingNo: true, system: { select: { code: true } } } },
            },
          },
        },
        take: 50,
      });

      if (!wire && pins.length === 0) {
        return NextResponse.json({ error: `Wire ${wireNo} not found` }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        level: 'wire_trace',
        data: {
          wireNo: wire?.wireNo || wireNo,
          signalName: wire?.signalName,
          description: wire?.description,
          wireSize: wire?.wireSize,
          wireColor: wire?.wireColor,
          voltageClass: wire?.voltageClass,
          source: { equipment: wire?.sourceEquipment, connector: wire?.sourceConnector, pin: wire?.sourcePin },
          destination: { equipment: wire?.destEquipment, connector: wire?.destConnector, pin: wire?.destPin },
          endpoints: wire?.endpoints.map(ep => ({
            role: ep.endpointRole,
            device: ep.device ? { tag: ep.device.tagNo, name: ep.device.deviceName, system: ep.device.system?.code } : null,
            connector: ep.connector ? { code: ep.connector.connectorCode, drawing: ep.connector.drawing?.drawingNo, system: ep.connector.drawing?.system?.code } : null,
            pin: ep.pin ? { no: ep.pin.pinNo, signal: ep.pin.signalName } : null,
          })) || [],
          appearances: pins.map(p => ({
            connector: p.connector?.connectorCode,
            pin: p.pinNo,
            signal: p.signalName,
            carType: p.connector?.carType,
            drawing: p.connector?.drawing?.drawingNo,
            system: p.connector?.drawing?.system?.code,
          })),
          drawingsContaining: wire?.drawings.map(dw => ({
            drawingNo: dw.drawing.drawingNo,
            title: dw.drawing.title,
            system: dw.drawing.system?.code,
          })) || [],
        },
        executionTime: Date.now() - startTime,
      });
    }

    // LEVEL 3b: Specific connector on a drawing
    if (connectorCode && drawingNo) {
      const connector = await prisma.connector.findFirst({
        where: {
          connectorCode: connectorCode,
          drawing: { drawingNo: { contains: drawingNo } },
        },
        include: {
          pins: {
            orderBy: { pinNo: 'asc' },
            select: { id: true, pinNo: true, signalName: true, wireNo: true, voltageText: true, terminalFrom: true, terminalTo: true, conductorClassCode: true, note: true },
          },
          drawing: { select: { drawingNo: true, title: true, system: { select: { code: true, name: true } } } },
        },
      });

      if (!connector) return NextResponse.json({ error: 'Connector not found' }, { status: 404 });

      return NextResponse.json({
        success: true,
        level: 'connector',
        data: {
          connectorCode: connector.connectorCode,
          carType: connector.carType,
          location: connector.locationTag,
          drawing: { no: connector.drawing?.drawingNo, title: connector.drawing?.title, system: connector.drawing?.system },
          totalPins: connector.pins.length,
          pins: connector.pins.map(p => ({
            pin: p.pinNo,
            signal: p.signalName,
            wire: p.wireNo,
            voltage: p.voltageText,
            from: p.terminalFrom,
            to: p.terminalTo,
            class: p.conductorClassCode,
            note: p.note,
          })),
        },
        executionTime: Date.now() - startTime,
      });
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  } catch (error) {
    console.error('GSD Explore error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
