import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface PostgresStatus {
  connected: boolean;
  error: string | null;
  stats: { systems: number; devices: number; wires: number; drawings: number } | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    if (action === 'status') {
      let postgresStatus: PostgresStatus = { connected: false, error: null, stats: null };

      try {
        await prisma.$connect();
        postgresStatus.connected = true;
        const [systemCount, deviceCount, wireCount, drawingCount] = await Promise.all([
          prisma.system.count(),
          prisma.device.count(),
          prisma.wire.count(),
          prisma.drawing.count(),
        ]);
        postgresStatus.stats = { systems: systemCount, devices: deviceCount, wires: wireCount, drawings: drawingCount };
      } catch (e) {
        const err = e as Error;
        postgresStatus.error = err.message || 'Connection failed';
      }

      return NextResponse.json({
        postgresql: postgresStatus,
        status: postgresStatus.connected ? 'ok' : 'unavailable',
      });
    }

    return NextResponse.json({ message: 'Use ?action=status' });
  } catch (error) {
    console.error('RAG API error:', error);
    return NextResponse.json({ error: 'RAG operation failed' }, { status: 500 });
  }
}