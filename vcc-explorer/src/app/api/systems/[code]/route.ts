import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { searchParams } = new URL(request.url);
  const includeDetails = searchParams.get('details') === 'true';

  if (!code) {
    return NextResponse.json({ error: 'System code required' }, { status: 400 });
  }

  try {
    const system = await prisma.system.findFirst({
      where: { code: code },
      include: includeDetails ? {
        _count: { select: { drawings: true, devices: true } },
      } : undefined,
    });

    if (!system) {
      return NextResponse.json({ error: 'System not found' }, { status: 404 });
    }

    const drawings = await prisma.drawing.findMany({
      where: { systemId: system.id },
      include: { pages: true },
    });

    const connectors = await prisma.connector.findMany({
      where: { drawing: { systemId: system.id } },
      include: { pins: true },
    });

    return NextResponse.json({
      system: {
        id: system.id,
        code: system.code,
        name: system.name,
        category: system.category,
        description: system.description || '',
        sortOrder: system.sortOrder,
      },
      drawings,
      stats: {
        drawingCount: drawings.length,
        connectorCount: connectors.length,
        pinCount: connectors.reduce((acc, c) => acc + c.pins.length, 0),
      },
    });
  } catch (error) {
    console.error('Error fetching system:', error);
    return NextResponse.json({ error: 'Failed to fetch system' }, { status: 500 });
  }
}