import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { mode, limit } = await request.json();
    const batchSize = Math.min(limit || 50, 100);
    const results = { created: 0 };

    if (mode === 'batch-endpoints') {
      const sourceWires = await prisma.$queryRaw<Array<{
        id: string;
        sourceConnector: string | null;
        sourcePin: string | null;
      }>>`
        SELECT w.id, w."sourceConnector", w."sourcePin"
        FROM "Wire" w
        WHERE w."sourceConnector" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM "WireEndpoint" we 
          WHERE we."wireId" = w.id AND we."endpointRole" = 'SOURCE'
        )
        LIMIT ${batchSize}
      `;

      const destWires = await prisma.$queryRaw<Array<{
        id: string;
        destConnector: string | null;
        destPin: string | null;
      }>>`
        SELECT w.id, w."destConnector", w."destPin"
        FROM "Wire" w
        WHERE w."destConnector" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM "WireEndpoint" we 
          WHERE we."wireId" = w.id AND we."endpointRole" = 'DESTINATION'
        )
        LIMIT ${batchSize}
      `;

      const allConnectorCodes = [
        ...sourceWires.map(w => w.sourceConnector).filter(Boolean),
        ...destWires.map(w => w.destConnector).filter(Boolean)
      ] as string[];

      const connectors = await prisma.connector.findMany({
        where: { connectorCode: { in: [...new Set(allConnectorCodes)] } }
      });

      const connectorMap = new Map(connectors.map(c => [c.connectorCode, c.id]));

      for (const wire of sourceWires) {
        if (!wire.sourceConnector) continue;
        
        await prisma.wireEndpoint.create({
          data: {
            wireId: wire.id,
            connectorId: connectorMap.get(wire.sourceConnector) || null,
            endpointPin: wire.sourcePin || '',
            endpointLabel: wire.sourceConnector,
            endpointRole: 'SOURCE'
          }
        });
        results.created++;
      }

      for (const wire of destWires) {
        if (!wire.destConnector) continue;
        
        await prisma.wireEndpoint.create({
          data: {
            wireId: wire.id,
            connectorId: connectorMap.get(wire.destConnector) || null,
            endpointPin: wire.destPin || '',
            endpointLabel: wire.destConnector,
            endpointRole: 'DESTINATION'
          }
        });
        results.created++;
      }

      return NextResponse.json({ success: true, results });
    }

    return NextResponse.json({ error: 'Unknown mode. Use: batch-endpoints' }, { status: 400 });
  } catch (error) {
    console.error('Sync error:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function GET() {
  const [totalWires, connectedWires, endpoints] = await Promise.all([
    prisma.wire.count(),
    prisma.wire.count({ where: { sourceConnector: { not: null } } }),
    prisma.wireEndpoint.count()
  ]);

  return NextResponse.json({ 
    wires: { total: totalWires, connected: connectedWires },
    endpoints: endpoints
  });
}