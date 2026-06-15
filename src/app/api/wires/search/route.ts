import { NextRequest, NextResponse } from 'next/server';
import { prisma, withDatabaseRetry } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * Dedicated wire search endpoint with full alphanumeric support.
 * Handles: 3001, 3001a, 3001A, 3001/1, 3001-1, X3001, X3001a
 * Returns wires sorted by wireNo with all related data.
 */
function buildWireSearchConditions(q: string): Prisma.WireWhereInput['OR'] {
  const trimmed = q.trim();
  if (!trimmed) return [];

  // Strip trailing letter suffix to get the numeric base
  const numericBase = trimmed.replace(/[a-zA-Z]+$/, '').replace(/[\/\-]/g, '');
  // Strip all separators for normalized comparison
  const normalized = trimmed.replace(/[\/\-\s]/g, '');
  const upper = trimmed.toUpperCase();

  const conditions: Prisma.WireWhereInput[] = [
    // Exact match
    { wireNo: { equals: upper } },
    { wireAlias: { equals: upper, mode: Prisma.QueryMode.insensitive } },
    // Contains (catches XYZ3001, 3001abc prefix/suffix)
    { wireNo: { contains: trimmed, mode: Prisma.QueryMode.insensitive } },
    { wireAlias: { contains: trimmed, mode: Prisma.QueryMode.insensitive } },
    { signalName: { contains: trimmed, mode: Prisma.QueryMode.insensitive } },
    { description: { contains: trimmed, mode: Prisma.QueryMode.insensitive } },
  ];

  // Numeric base prefix search (3001 → also finds 3001a, 3001A, 3001/1, 3001-2)
  if (numericBase && numericBase.length >= 2 && numericBase !== trimmed) {
    conditions.push({ wireNo: { startsWith: numericBase } });
  }

  // Normalized form search (removes / and -)
  if (normalized !== trimmed && normalized !== upper && normalized.length >= 2) {
    conditions.push({ wireNo: { contains: normalized, mode: Prisma.QueryMode.insensitive } });
    conditions.push({ wireAlias: { contains: normalized, mode: Prisma.QueryMode.insensitive } });
  }

  return conditions;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || searchParams.get('wire') || '').trim();
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 500);
  const offset = parseInt(searchParams.get('offset') || '0');
  const include = searchParams.get('include') || 'basic'; // basic | endpoints | full

  if (!q) {
    return NextResponse.json({ error: 'Query parameter "q" or "wire" required' }, { status: 400 });
  }

  try {
    const conditions = buildWireSearchConditions(q);
    if (!conditions || conditions.length === 0) {
      return NextResponse.json({ wires: [], total: 0, query: q });
    }

    const where: Prisma.WireWhereInput = { OR: conditions };

    const includeEndpoints = include === 'endpoints' || include === 'full';

    const [wires, total] = await withDatabaseRetry(async () => Promise.all([
      prisma.wire.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { wireNo: 'asc' },
        include: includeEndpoints ? {
          endpoints: {
            include: {
              device: { select: { deviceName: true, tagNo: true, carType: true, locationTag: true } },
              connector: { select: { connectorCode: true, description: true, carType: true } },
            }
          }
        } : undefined,
      }),
      prisma.wire.count({ where }),
    ]), 'Wire Search API');

    // For each wire, also fetch its pin connections if available
    let pinData: any[] = [];
    if (wires.length > 0 && include === 'full') {
      const wireNos = wires.map(w => w.wireNo);
      pinData = await withDatabaseRetry(async () => prisma.connectorPin.findMany({
        where: {
          OR: [
            { wireNo: { in: wireNos } },
            ...wireNos.map(wn => ({ wireNo: { startsWith: wn.replace(/[a-zA-Z]+$/, '') } })),
          ]
        },
        include: {
          connector: {
            include: { drawing: { select: { drawingNo: true, title: true } } }
          }
        },
        take: 200,
        orderBy: { wireNo: 'asc' },
      }), 'Wire Pin Connections Search');
    }

    return NextResponse.json({
      query: q,
      wires,
      total,
      offset,
      hasMore: offset + limit < total,
      pinConnections: pinData.length > 0 ? pinData.map(p => ({
        pinNo: p.pinNo,
        wireNo: p.wireNo,
        signalName: p.signalName,
        connectorCode: p.connector?.connectorCode,
        drawingNo: p.connector?.drawing?.drawingNo,
        drawingTitle: p.connector?.drawing?.title,
      })) : undefined,
      searchInfo: {
        query: q,
        numericBase: q.replace(/[a-zA-Z]+$/, '').replace(/[\/\-]/g, ''),
        matchCount: total,
        note: total === 0
          ? `No wires found for "${q}". Tried: exact match, prefix search, alias match, and normalized form (without separators).`
          : `Found ${total} wire(s) matching "${q}" including variants with alphabetic suffixes.`,
      },
    });
  } catch (error) {
    console.error('Wire search error:', error);
    return NextResponse.json({ error: 'Search failed', details: String(error) }, { status: 500 });
  }
}
