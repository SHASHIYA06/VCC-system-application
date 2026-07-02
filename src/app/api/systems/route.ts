import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subsystem = searchParams.get('subsystem');
  const search = searchParams.get('search');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  try {
    const where: Record<string, unknown> = {};
    if (subsystem) where.code = subsystem;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const systems = await prisma.system.findMany({
      where,
      include: {
        _count: {
          select: { drawings: true, devices: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
      take: limit,
    });

    return NextResponse.json({
      systems: systems.map(s => ({
        id: s.id,
        code: s.code,
        name: s.name,
        category: s.category,
        description: s.description,
        sortOrder: s.sortOrder,
        drawingCount: s._count.drawings,
        deviceCount: s._count.devices,
      })),
      count: systems.length,
    });
  } catch (error) {
    console.error('Error fetching systems:', error);
    return NextResponse.json({ error: 'Failed to fetch systems' }, { status: 500 });
  }
}