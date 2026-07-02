import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * REPAIR WireEndpoints from Wire.sourceConnector/destConnector fields.
 * 
 * Many wires have sourceConnector + sourcePin and destConnector + destPin
 * but no WireEndpoint records. This creates them.
 */
export async function POST() {
  const startTime = Date.now();

  try {
    // STEP 1: Find wires with source/dest fields but no endpoints
    const wiresWithSource = await prisma.wire.findMany({
      where: {
        AND: [
          { sourceConnector: { not: null } },
          { endpoints: { none: {} } },
        ],
      },
      select: { id: true, wireNo: true, sourceConnector: true, sourcePin: true, destConnector: true, destPin: true },
      take: 50000,
    });

    console.log(`Found ${wiresWithSource.length} wires with source/dest but no endpoints`);

    // STEP 2: Find connectors by code
    const allConnectorCodes = [...new Set([
      ...wiresWithSource.map(w => w.sourceConnector).filter(Boolean) as string[],
      ...wiresWithSource.map(w => w.destConnector).filter(Boolean) as string[],
    ])] as string[];

    const connectors = await prisma.connector.findMany({
      where: { connectorCode: { in: allConnectorCodes } },
      select: { id: true, connectorCode: true },
    });
    const connectorCodeToId = new Map(connectors.map(c => [c.connectorCode, c.id]));

    console.log(`Mapped ${connectorCodeToId.size} connector codes to IDs`);

    // STEP 3: Find pins by connector + pinNo
    const connectorPins = await prisma.connectorPin.findMany({
      where: { connector: { connectorCode: { in: allConnectorCodes } } },
      select: { id: true, connectorId: true, pinNo: true },
      take: 100000,
    });
    
    // Build a lookup: connectorId|pinNo → pinId
    const pinLookup = new Map<string, string>();
    for (const pin of connectorPins) {
      pinLookup.set(`${pin.connectorId}|${pin.pinNo}`, pin.id);
    }

    console.log(`Mapped ${pinLookup.size} connector+pin combinations`);

    // STEP 4: Build WireEndpoint records
    const newEndpoints: Array<{
      wireId: string;
      connectorId: string;
      pinId: string | null;
      endpointRole: string;
      endpointLabel: string;
    }> = [];

    for (const wire of wiresWithSource) {
      // Source endpoint
      if (wire.sourceConnector) {
        const connectorId = connectorCodeToId.get(wire.sourceConnector);
        if (connectorId) {
          const pinId = wire.sourcePin ? pinLookup.get(`${connectorId}|${wire.sourcePin}`) || null : null;
          newEndpoints.push({
            wireId: wire.id,
            connectorId,
            pinId,
            endpointRole: 'source',
            endpointLabel: `${wire.sourceConnector}${wire.sourcePin ? ':' + wire.sourcePin : ''}`,
          });
        }
      }

      // Destination endpoint
      if (wire.destConnector) {
        const connectorId = connectorCodeToId.get(wire.destConnector);
        if (connectorId) {
          const pinId = wire.destPin ? pinLookup.get(`${connectorId}|${wire.destPin}`) || null : null;
          newEndpoints.push({
            wireId: wire.id,
            connectorId,
            pinId,
            endpointRole: 'destination',
            endpointLabel: `${wire.destConnector}${wire.destPin ? ':' + wire.destPin : ''}`,
          });
        }
      }
    }

    console.log(`Built ${newEndpoints.length} new endpoint records`);

    // STEP 5: Bulk insert
    let created = 0;
    for (let i = 0; i < newEndpoints.length; i += 500) {
      const batch = newEndpoints.slice(i, i + 500);
      const result = await prisma.wireEndpoint.createMany({
        data: batch,
        skipDuplicates: true,
      });
      created += result.count;
    }

    const afterEndpointCount = await prisma.wireEndpoint.count();
    const afterWiresWithEndpoints = await prisma.wireEndpoint.findMany({
      select: { wireId: true },
      distinct: ['wireId'],
    });

    return NextResponse.json({
      status: 'success',
      wiresWithSourceFields: wiresWithSource.length,
      connectorCodesFound: connectorCodeToId.size,
      newEndpointsCreated: created,
      totalEndpoints: afterEndpointCount,
      uniqueWiresWithEndpoints: afterWiresWithEndpoints.length,
      coveragePercent: ((afterWiresWithEndpoints.length / 167758) * 100).toFixed(1),
      executionTimeMs: Date.now() - startTime,
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
