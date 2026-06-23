/**
 * DIGITAL TWIN — WIRE TRACE API
 *
 * GET /api/twin/trace?wire=3001            full electrical trace of one wire
 * GET /api/twin/trace?wire=3001&multiHop=1 follow the continuity family
 * GET /api/twin/trace?connector=CN1&pin=3  trace starting from a pin
 */
import { NextRequest, NextResponse } from 'next/server';
import { traceWire, multiHopTrace, traceFromPin } from '@/lib/twin/trace-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wire = searchParams.get('wire') || searchParams.get('wireNo');
  const connector = searchParams.get('connector');
  const pin = searchParams.get('pin');
  const multiHop = searchParams.get('multiHop') === '1' || searchParams.get('multiHop') === 'true';

  try {
    if (connector && pin) {
      const trace = await traceFromPin(connector, pin);
      if (!trace) {
        return NextResponse.json(
          { success: false, error: `No wire found at ${connector} pin ${pin}` },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, mode: 'pin', trace });
    }

    if (!wire) {
      return NextResponse.json(
        { success: false, error: 'Provide ?wire=<number> or ?connector=<code>&pin=<no>' },
        { status: 400 }
      );
    }

    if (multiHop) {
      const result = await multiHopTrace(wire);
      return NextResponse.json({ success: true, mode: 'multiHop', ...result });
    }

    const trace = await traceWire(wire);
    if (!trace) {
      return NextResponse.json(
        { success: false, error: `Wire "${wire}" not found` },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, mode: 'wire', trace });
  } catch (error) {
    console.error('Twin trace error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
