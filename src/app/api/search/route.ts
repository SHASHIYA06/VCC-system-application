import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!q || q.length < 2) {
    return NextResponse.json({ error: 'Query too short (min 2 chars)' }, { status: 400 });
  }

  try {
    const [wires, connectors, devices, docs] = await Promise.all([
      prisma.wire.findMany({ where: { wireNo: { contains: q, mode: 'insensitive' } }, take: limit, orderBy: { wireNo: 'asc' } }),
      prisma.connector.findMany({ where: { OR: [{ connectorCode: { contains: q, mode: 'insensitive' } }, { normCode: { contains: q, mode: 'insensitive' } }] }, include: { device: true, pins: true }, take: limit }),
      prisma.deviceInstance.findMany({ where: { OR: [{ name: { contains: q, mode: 'insensitive' } }, { tag: { contains: q, mode: 'insensitive' } }] }, include: { system: true }, take: limit }),
      prisma.drawingDocument.findMany({ where: { OR: [{ drawingNo: { contains: q, mode: 'insensitive' } }, { title: { contains: q, mode: 'insensitive' } }, { subsystem: { contains: q, mode: 'insensitive' } }] }, take: limit }),
    ]);
    return NextResponse.json({ wires, connectors, devices, drawings: docs, query: q });
  } catch {
    return NextResponse.json({ wires: [], connectors: [], devices: [], drawings: [], query: q });
  }
}