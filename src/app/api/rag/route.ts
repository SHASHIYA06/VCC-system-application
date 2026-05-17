import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ragService } from '@/lib/rag';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const query = searchParams.get('query');
  const wireNo = searchParams.get('wire_no');

  try {
    if (action === 'status') {
      const [systemCount, deviceCount, wireCount, drawingCount, circuitCount, trainlineCount, connectorCount, pinCount] = await Promise.all([
        prisma.system.count(),
        prisma.device.count(),
        prisma.wire.count(),
        prisma.drawing.count(),
        prisma.circuit.count(),
        prisma.trainLine.count(),
        prisma.connector.count(),
        prisma.connectorPin.count(),
      ]);

      return NextResponse.json({
        status: 'ok',
        database: {
          systems: systemCount,
          devices: deviceCount,
          wires: wireCount,
          drawings: drawingCount,
          circuits: circuitCount,
          trainlines: trainlineCount,
          connectors: connectorCount,
          pins: pinCount,
        },
        rag: {
          enabled: true,
          indexed_entities: ['drawings', 'circuits', 'wires', 'trainlines', 'connectors', 'devices'],
        },
      });
    }

    if (action === 'query' && query) {
      const result = await ragService.query(query);
      return NextResponse.json(result);
    }

    if (action === 'explain' && wireNo) {
      const explanation = await ragService.explainCircuit(wireNo);
      return NextResponse.json({ explanation, wireNo });
    }

    return NextResponse.json({ message: 'Use ?action=status or ?action=query or ?action=explain' });
  } catch (error) {
    console.error('RAG API error:', error);
    return NextResponse.json({ error: 'RAG operation failed', details: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, query, wireNo } = body;

    if (action === 'query' && query) {
      const result = await ragService.query(query);
      return NextResponse.json(result);
    }

    if (action === 'explain' && wireNo) {
      const explanation = await ragService.explainCircuit(wireNo);
      return NextResponse.json({ explanation });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('RAG POST error:', error);
    return NextResponse.json({ error: 'RAG operation failed' }, { status: 500 });
  }
}