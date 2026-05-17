import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const stats = {
      projects: await prisma.project.count(),
      systems: await prisma.system.count(),
      drawings: await prisma.drawing.count(),
      connectors: await prisma.connector.count(),
      wires: await prisma.wire.count(),
      devices: await prisma.device.count(),
      carTypes: await prisma.carType.count(),
      signals: await prisma.signal.count(),
    };

    return NextResponse.json({
      message: 'VCC data is seeded via SQL migrations',
      stats,
      note: 'Use SQL migrations in supabase/migrations/ for data updates'
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}