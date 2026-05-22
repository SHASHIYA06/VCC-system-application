import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const drawingId = searchParams.get('drawing_id');
  const connectorCode = searchParams.get('connector_code');
  const carType = searchParams.get('car_type');
  const systemCode = searchParams.get('system_code');
  const wireNo = searchParams.get('wire_no');
  const limit = Math.min(parseInt(searchParams.get('limit') || '200'), 500);

  try {
    const where: Record<string, unknown> = {};
    
    if (drawingId) where.drawingId = drawingId;
    if (connectorCode) where.connectorCode = { contains: connectorCode };
    
    if (carType) {
      where.carType = carType;
    }
    
    if (systemCode) {
      const system = await prisma.system.findFirst({ where: { code: systemCode } });
      if (system) {
        where.drawing = { systemId: system.id };
      }
    }
    
    if (wireNo) {
      where.pins = {
        some: { wireNo: { contains: wireNo } }
      };
    }

    const connectors = await prisma.connector.findMany({
      where,
      include: {
        connectorType: true,
        drawing: { include: { system: true } },
        pins: { 
          orderBy: { pinNo: 'asc' },
          include: {
            wireEndpoints: { include: { wire: true, device: true } },
          },
        },
        wireEndpoints: { 
          include: { wire: true, device: true } 
        },
      },
      orderBy: { connectorCode: 'asc' },
      take: limit,
    });

    const mapped = connectors.map(conn => ({
      id: conn.id,
      connectorCode: conn.connectorCode,
      connectorTypeCode: conn.connectorTypeCode,
      connectorType: conn.connectorType?.description || conn.connectorTypeCode || 'Standard',
      pinCount: conn.pinCount || conn.pins.length,
      description: conn.description || `${conn.connectorCode} connector`,
      scope: conn.scope,
      carType: conn.carType,
      locationTag: conn.locationTag,
      sideTag: conn.sideTag,
      instanceLabel: conn.instanceLabel,
      drawing: {
        id: conn.drawing?.id,
        drawingNo: conn.drawing?.drawingNo,
        title: conn.drawing?.title,
        revision: conn.drawing?.revision,
        totalSheets: conn.drawing?.totalSheets,
      },
      system: conn.drawing?.system ? {
        code: conn.drawing.system.code,
        name: conn.drawing.system.name,
        category: conn.drawing.system.category,
      } : null,
      pins: conn.pins.map(p => ({
        id: p.id,
        pinNo: p.pinNo,
        pinLabel: p.pinLabel,
        wireNo: p.wireNo,
        signalName: p.signalName,
        conductorClassCode: p.conductorClassCode,
        voltageText: p.voltageText,
        terminalFrom: p.terminalFrom,
        terminalTo: p.terminalTo,
        sourceSheetRef: p.sourceSheetRef,
        note: p.note,
        endpointLabel: `${conn.connectorCode}:${p.pinNo} - ${p.signalName || 'N/A'}`,
        wireEndpoints: p.wireEndpoints.map(we => ({
          wireNo: we.wire?.wireNo,
          signalName: we.wire?.signalName,
          deviceTag: we.device?.tagNo,
          deviceName: we.device?.deviceName,
          endpointRole: we.endpointRole,
          endpointLabel: we.endpointLabel,
        })),
      })),
      wireEndpoints: conn.wireEndpoints.map(we => ({
        wireNo: we.wire?.wireNo,
        signalName: we.wire?.signalName,
        deviceTag: we.device?.tagNo,
        deviceName: we.device?.deviceName,
        endpointRole: we.endpointRole,
        endpointLabel: we.endpointLabel,
      })),
      _count: {
        pins: conn.pins.length,
        wireEndpoints: conn.wireEndpoints.length,
      }
    }));

    const total = await prisma.connector.count({ where });
    
    return NextResponse.json({ 
      connectors: mapped, 
      count: mapped.length,
      total,
      filters: { drawingId, connectorCode, carType, systemCode, wireNo }
    });
  } catch (error) {
    console.error('Connector API error:', error);
    return NextResponse.json({ connectors: [], count: 0, error: String(error) }, { status: 500 });
  }
}
