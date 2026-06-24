import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wireNo = searchParams.get('wireNo');
    const includeSchematic = searchParams.get('schematic') === 'true';

    if (!wireNo) {
      return NextResponse.json({ error: 'wireNo parameter required' }, { status: 400 });
    }

    const wire = await prisma.wire.findUnique({
      where: { wireNo },
      include: {
        endpoints: {
          include: {
            device: true,
            connector: {
              include: {
                drawing: true,
                pins: true
              }
            },
            pin: true
          }
        }
      }
    });

    if (!wire) {
      return NextResponse.json({ error: 'Wire not found' }, { status: 404 });
    }

    const relatedDrawings = [];
    const seenDrawings = new Set();

    if (wire.endpoints) {
      for (const ep of wire.endpoints) {
        if (ep.connector?.drawing) {
          if (!seenDrawings.has(ep.connector.drawing.id)) {
            seenDrawings.add(ep.connector.drawing.id);
            relatedDrawings.push({
              id: ep.connector.drawing.id,
              drawingNo: ep.connector.drawing.drawingNo,
              title: ep.connector.drawing.title,
              system: { code: 'CONNECTOR', name: 'Connector Drawing' },
              connectionType: ep.endpointRole || 'connected',
              connectorCode: ep.connector?.connectorCode,
              pinNo: ep.endpointPin
            });
          }
        }
      }
    }

    const trainlines = await prisma.trainLine.findMany({
      where: { wireNo: wireNo },
      include: {
        drawing: true
      }
    });

    for (const tl of trainlines) {
      if (tl.drawing && !seenDrawings.has(tl.drawing.id)) {
        seenDrawings.add(tl.drawing.id);
        relatedDrawings.push({
          id: tl.drawing.id,
          drawingNo: tl.drawing.drawingNo,
          title: tl.drawing.title,
          system: { code: 'TRL', name: 'Trainline' },
          connectionType: 'trainline',
          trainlineNo: tl.wireNo,
          itemName: tl.itemName
        });
      }
    }

    const signals = await prisma.signal.findMany({
      where: { signalName: { contains: wire.signalName || '' } },
      include: { drawing: true }
    });

    for (const sig of signals) {
      if (sig.drawing && !seenDrawings.has(sig.drawing.id)) {
        seenDrawings.add(sig.drawing.id);
        relatedDrawings.push({
          id: sig.drawing.id,
          drawingNo: sig.drawing.drawingNo,
          title: sig.drawing.title,
          system: { code: 'SIGNAL', name: 'Signal' },
          connectionType: 'signal'
        });
      }
    }

    const systemName = wireNo.startsWith('3') ? 'TRACTION' :
      wireNo.startsWith('4') ? 'BRAKE' :
      wireNo.startsWith('5') ? 'AUXILIARY' :
      wireNo.startsWith('6') ? 'DOOR' :
      wireNo.startsWith('7') ? 'VAC' :
      wireNo.startsWith('9') ? 'TMS' :
      wireNo.startsWith('1') ? 'CONTROL' : 'OTHER';

    const systemDrawings = await prisma.drawing.findMany({
      where: {
        systemId: { not: null },
        totalSheets: { gt: 1 }
      },
      take: 10
    });

    for (const d of systemDrawings) {
      if (!seenDrawings.has(d.id)) {
        seenDrawings.add(d.id);
        relatedDrawings.push({
          id: d.id,
          drawingNo: d.drawingNo,
          title: d.title,
          system: { code: systemName, name: `${systemName} System` },
          connectionType: 'system-related'
        });
      }
    }

    const connectors = await prisma.connector.findMany({
      where: {
        pins: {
          some: {
            wireNo: { contains: wireNo }
          }
        }
      },
      include: {
        drawing: true,
        pins: {
          where: { wireNo: { contains: wireNo } }
        }
      }
    });

    for (const conn of connectors) {
      if (conn.drawing && !seenDrawings.has(conn.drawing.id)) {
        seenDrawings.add(conn.drawing.id);
        relatedDrawings.push({
          id: conn.drawing.id,
          drawingNo: conn.drawing.drawingNo,
          title: conn.drawing.title,
          system: { code: 'PIN', name: 'Pin Connection' },
          connectionType: 'pin-connection',
          connectorCode: conn.connectorCode,
          pins: conn.pins.map(p => ({ pinNo: p.pinNo, wireNo: p.wireNo }))
        });
      }
    }

    const response = {
      wire: {
        wireNo: wire.wireNo,
        signalName: wire.signalName,
        description: wire.description,
        voltageClass: wire.voltageClass,
        wireSize: wire.wireSize,
        wireColor: wire.wireColor,
        shielded: wire.shielded,
        sourceEquipment: wire.sourceEquipment,
        sourceConnector: wire.sourceConnector,
        sourcePin: wire.sourcePin,
        destEquipment: wire.destEquipment,
        destConnector: wire.destConnector,
        destPin: wire.destPin
      },
      relatedDrawings: relatedDrawings,
      trainlines: trainlines.map(tl => ({
        wireNo: tl.wireNo,
        itemName: tl.itemName,
        lineGroup: tl.lineGroup,
        note: tl.note,
        carType: tl.carType
      })),
      connections: wire.endpoints?.map(ep => ({
        role: ep.endpointRole,
        equipment: ep.device?.deviceName || ep.endpointLabel,
        connector: ep.connector?.connectorCode,
        pin: ep.endpointPin,
        side: ep.endpointRole === 'SOURCE' ? 'source' : 'destination'
      })) || [],
      schematic: includeSchematic ? {
        path: generateSchematicPath(wire, relatedDrawings),
        nodes: generateSchematicNodes(wire, relatedDrawings),
        connections: generateSchematicConnections(wire, relatedDrawings)
      } : null
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Wire detail error:', error);
    return NextResponse.json({ error: 'Failed to get wire details', details: String(error) }, { status: 500 });
  }
}

function generateSchematicPath(wire: any, drawings: any[]) {
  const path = [];
  if (wire.sourceEquipment) {
    path.push({ type: 'equipment', name: wire.sourceEquipment });
  }
  if (wire.sourceConnector) {
    path.push({ type: 'connector', name: wire.sourceConnector, pin: wire.sourcePin });
  }
  path.push({ type: 'wire', name: wire.wireNo, signal: wire.signalName });
  if (wire.destConnector) {
    path.push({ type: 'connector', name: wire.destConnector, pin: wire.destPin });
  }
  if (wire.destEquipment) {
    path.push({ type: 'equipment', name: wire.destEquipment });
  }
  return path;
}

function generateSchematicNodes(wire: any, drawings: any[]) {
  const nodes = [];
  const seen = new Set();
  
  nodes.push({ id: 'wire', type: 'wire', label: wire.wireNo, description: wire.signalName });
  
  for (const d of drawings.slice(0, 15)) {
    if (!seen.has(d.id)) {
      seen.add(d.id);
      nodes.push({
        id: d.id,
        type: 'drawing',
        label: d.drawingNo,
        description: d.title,
        connectionType: d.connectionType
      });
    }
  }
  
  if (wire.sourceEquipment) {
    nodes.push({ id: 'src-equip', type: 'equipment', label: wire.sourceEquipment });
  }
  if (wire.destEquipment) {
    nodes.push({ id: 'dest-equip', type: 'equipment', label: wire.destEquipment });
  }
  
  return nodes;
}

function generateSchematicConnections(wire: any, drawings: any[]) {
  const connections = [];
  
  connections.push({ from: 'wire', to: 'wire', type: 'self' });
  
  for (const d of drawings.slice(0, 15)) {
    connections.push({ from: 'wire', to: d.id, type: d.connectionType || 'connected' });
  }
  
  if (wire.sourceEquipment) {
    connections.push({ from: 'wire', to: 'src-equip', type: 'source' });
  }
  if (wire.destEquipment) {
    connections.push({ from: 'wire', to: 'dest-equip', type: 'destination' });
  }
  
  return connections;
}