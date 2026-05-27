import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * Normalize a wire number for flexible matching.
 * Examples: "3001a" → base="3001", norm="3001a"
 *           "3001/1" → base="3001", norm="30011"
 *           "3001A" → base="3001", norm="3001a"
 */
function buildWireSearchConditions(q: string): any[] {
  const trimmed = q.trim();
  // Extract leading numeric portion (base number before any alpha suffix)
  const numericBase = trimmed.replace(/[a-zA-Z\/\-]+$/, '').replace(/[\/\-]/g, '');
  // Normalized: remove slashes/dashes for flexible matching
  const normalized = trimmed.replace(/[\/\-\s]/g, '');
  // Upper and lower for case insensitive
  const upper = trimmed.toUpperCase();
  const lower = trimmed.toLowerCase();

  const conditions: any[] = [
    // Exact matches first (highest relevance)
    { wireNo: { equals: trimmed } },
    { wireNo: { equals: upper } },
    { wireAlias: { equals: trimmed, mode: Prisma.QueryMode.insensitive } },

    // Contains matches (picks up 3001, 3001a, X3001, etc.)
    { wireNo: { contains: trimmed, mode: Prisma.QueryMode.insensitive } },
    { wireAlias: { contains: trimmed, mode: Prisma.QueryMode.insensitive } },
    { signalName: { contains: trimmed, mode: Prisma.QueryMode.insensitive } },
    { description: { contains: trimmed, mode: Prisma.QueryMode.insensitive } },
  ];

  // Add base number prefix — catches 3001, 3001a, 3001A, 3001/1, 3001-1
  if (numericBase && numericBase.length >= 2 && numericBase !== trimmed) {
    conditions.push({ wireNo: { startsWith: numericBase } });
  }

  // Normalized form (removes / and -)
  if (normalized !== trimmed && normalized.length >= 2) {
    conditions.push({ wireNo: { contains: normalized, mode: Prisma.QueryMode.insensitive } });
    conditions.push({ wireAlias: { contains: normalized, mode: Prisma.QueryMode.insensitive } });
  }

  return conditions;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || searchParams.get('q') || searchParams.get('wire') || '';
  const voltageClass = searchParams.get('voltage');
  const wireType = searchParams.get('type');
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const where: any = {};

    if (search.trim()) {
      where.OR = buildWireSearchConditions(search);
    }

    if (voltageClass) where.voltageClass = voltageClass;
    if (wireType) where.conductorClassCode = wireType;

    const [wires, total, voltageStats] = await Promise.all([
      prisma.wire.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { wireNo: 'asc' },
        include: {
          endpoints: {
            include: {
              device: { select: { deviceName: true, tagNo: true, carType: true } },
              connector: { select: { connectorCode: true, description: true, carType: true } },
            }
          }
        }
      }),
      prisma.wire.count({ where }),
      prisma.wire.groupBy({
        by: ['voltageClass'],
        _count: true,
      }).catch(() => []),
    ]);

    return NextResponse.json({
      wires,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      filters: {
        voltageClasses: voltageStats.map(v => ({ value: v.voltageClass, count: v._count })),
      },
      searchInfo: search ? {
        query: search,
        matchCount: total,
        tip: total === 0 ? 'Try shorter prefix (e.g., "3001" instead of "3001a"), or check the wire alias.' : undefined,
      } : undefined,
    });
  } catch (error) {
    console.error('Error fetching wires:', error);
    return NextResponse.json({ error: 'Failed to fetch wires' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wireNo, signalName, conductorClass, description, wireSize, wireColor, voltageClass, remarks, wireAlias } = body;

    if (!wireNo) {
      return NextResponse.json({ error: 'Wire number is required' }, { status: 400 });
    }

    const wire = await prisma.wire.upsert({
      where: { wireNo },
      update: { signalName, description, wireSize, wireColor, voltageClass, remarks, conductorClassCode: conductorClass, wireAlias: wireAlias || null },
      create: {
        wireNo,
        wireAlias: wireAlias || null,
        signalName,
        description,
        wireSize,
        wireColor,
        voltageClass,
        remarks,
        conductorClassCode: conductorClass,
      },
    });

    return NextResponse.json({ wire }, { status: 200 });
  } catch (error) {
    console.error('Error creating/updating wire:', error);
    return NextResponse.json({ error: 'Failed to create/update wire' }, { status: 500 });
  }
}