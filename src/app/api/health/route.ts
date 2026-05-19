import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Simple query without any joins
    const [drawingCount, connectorCount, pinCount] = await Promise.all([
      prisma.drawing.count(),
      prisma.connector.count(),
      prisma.connectorPin.count()
    ]);
    
    return NextResponse.json({
      status: 'ok',
      drawings: drawingCount,
      connectors: connectorCount,
      pins: pinCount
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      error: String(error)
    }, { status: 500 });
  }
}