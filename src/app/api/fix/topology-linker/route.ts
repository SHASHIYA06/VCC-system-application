import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const maxDuration = 300; // Allow long execution

export async function POST(request: Request) {
  try {
    const { batchSize = 1000 } = await request.json().catch(() => ({}));

    // Find wires that DO NOT have endpoints yet
    const wires = await prisma.wire.findMany({
      where: {
        endpoints: {
          none: {}
        }
      },
      take: batchSize,
    });

    if (wires.length === 0) {
      return NextResponse.json({ message: 'All wires have endpoints mapped.', processed: 0 });
    }

    let createdEndpoints = 0;
    let failedToMapSource = 0;
    let failedToMapDest = 0;

    // Build lookup maps for performance
    const deviceMap = new Map();
    const connectorMap = new Map();
    const pinMap = new Map();

    const getDevice = async (name: string | null) => {
      if (!name) return null;
      if (deviceMap.has(name)) return deviceMap.get(name);
      const dev = await prisma.device.findFirst({
        where: { OR: [{ tagNo: name }, { deviceName: name }] }
      });
      deviceMap.set(name, dev);
      return dev;
    };

    const getConnector = async (code: string | null) => {
      if (!code) return null;
      if (connectorMap.has(code)) return connectorMap.get(code);
      const conn = await prisma.connector.findFirst({
        where: { connectorCode: code }
      });
      connectorMap.set(code, conn);
      return conn;
    };

    const getPin = async (connId: string, pinNo: string | null) => {
      if (!pinNo) return null;
      const key = `${connId}_${pinNo}`;
      if (pinMap.has(key)) return pinMap.get(key);
      const pin = await prisma.connectorPin.findFirst({
        where: { connectorId: connId, pinNo: pinNo }
      });
      pinMap.set(key, pin);
      return pin;
    };

    for (const wire of wires) {
      // MAP SOURCE
      if (wire.sourceEquipment || wire.sourceConnector || wire.sourcePin) {
        const dev = await getDevice(wire.sourceEquipment);
        const conn = await getConnector(wire.sourceConnector);
        const pin = conn ? await getPin(conn.id, wire.sourcePin) : null;

        if (dev || conn || pin) {
          await prisma.wireEndpoint.create({
            data: {
              wireId: wire.id,
              deviceId: dev?.id,
              connectorId: conn?.id,
              pinId: pin?.id,
              endpointRole: 'SOURCE',
              endpointLabel: wire.sourceEquipment || wire.sourceConnector || 'SOURCE',
              endpointPin: wire.sourcePin
            }
          });
          createdEndpoints++;
        } else {
          failedToMapSource++;
        }
      }

      // MAP DESTINATION
      if (wire.destEquipment || wire.destConnector || wire.destPin) {
        const dev = await getDevice(wire.destEquipment);
        const conn = await getConnector(wire.destConnector);
        const pin = conn ? await getPin(conn.id, wire.destPin) : null;

        if (dev || conn || pin) {
          await prisma.wireEndpoint.create({
            data: {
              wireId: wire.id,
              deviceId: dev?.id,
              connectorId: conn?.id,
              pinId: pin?.id,
              endpointRole: 'DESTINATION',
              endpointLabel: wire.destEquipment || wire.destConnector || 'DESTINATION',
              endpointPin: wire.destPin
            }
          });
          createdEndpoints++;
        } else {
          failedToMapDest++;
        }
      }
    }

    return NextResponse.json({
      message: 'Batch processing complete',
      processedWires: wires.length,
      createdEndpoints,
      failedToMapSource,
      failedToMapDest,
      remaining: await prisma.wire.count({ where: { endpoints: { none: {} } } })
    });

  } catch (error: any) {
    console.error('Topology Linker Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
