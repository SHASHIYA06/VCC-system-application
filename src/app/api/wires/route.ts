import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * Normalize a wire number for flexible matching.
 * Handles suffix variants: 3001a, 3001/1, 3001/2, 3001-1, 3001b, 92572c
 * 
 * Algorithm:
 * 1. Extract numeric base: 3001a → 3001, 3001/1 → 3001, 92572c → 92572
 * 2. Store original form (case-sensitive)
 * 3. Store uppercase form
 * 4. Store forms with special chars removed (for fuzzy matching)
 * 5. Support drawing suffixes: 942-38409-A, 942-38409-B, 942-38409-C
 */
function buildWireSearchConditions(q: string): any[] {
  const trimmed = q.trim();
  
  // Extract numeric base - handles suffixes like a, /1, /2, -1, b, c, etc.
  // Pattern: one or more digits at start, possibly followed by dash and more digits
  // Then capture optional suffix (letters, slashes, dashes with alphanumeric)
  const match = trimmed.match(/^(\d+(?:-\d+)?)(.*)?$/);
  
  let numericBase = '';
  let suffix = '';
  
  if (match) {
    numericBase = match[1];
    suffix = match[2] || '';
  }
  
  // If no match, try simpler pattern (for drawings like 942-38409-A)
  if (!numericBase) {
    const drawingMatch = trimmed.match(/^([A-Z0-9-]+?)([A-Z]+)?$/);
    if (drawingMatch) {
      numericBase = drawingMatch[1];
      suffix = drawingMatch[2] || '';
    }
  }
  
  // Create variants for case-insensitive matching
  const upper = trimmed.toUpperCase();
  const lower = trimmed.toLowerCase();
  
  // Normalized form: remove spaces, but preserve / and - for drawing numbers
  // This allows "3001/1" to be found as "3001/1" or "30011"
  const normalizedNoSpaces = trimmed.replace(/\s/g, '');
  const normalizedNoSpecial = trimmed.replace(/[\/\-\s]/g, '');
  
  const conditions: any[] = [];
  
  // Exact matches (highest priority)
  conditions.push({ wireNo: { equals: trimmed } });
  conditions.push({ wireNo: { equals: upper } });
  conditions.push({ wireNo: { equals: lower } });
  conditions.push({ wireAlias: { equals: trimmed, mode: Prisma.QueryMode.insensitive } });
  conditions.push({ wireAlias: { equals: upper, mode: Prisma.QueryMode.insensitive } });
  
  // Contains matches - picks up substrings like 3001, X3001, etc.
  conditions.push({ wireNo: { contains: trimmed, mode: Prisma.QueryMode.insensitive } });
  conditions.push({ wireNo: { contains: normalizedNoSpaces, mode: Prisma.QueryMode.insensitive } });
  conditions.push({ wireAlias: { contains: trimmed, mode: Prisma.QueryMode.insensitive } });
  conditions.push({ signalName: { contains: trimmed, mode: Prisma.QueryMode.insensitive } });
  conditions.push({ description: { contains: trimmed, mode: Prisma.QueryMode.insensitive } });
  
  // Base number prefix match - catches 3001a, 3001/1, 3001-1 when searching 3001
  if (numericBase && numericBase.length >= 2) {
    conditions.push({ wireNo: { startsWith: numericBase } });
    
    // Also match normalized base (removes dashes)
    const normalizedBase = numericBase.replace(/-/g, '');
    if (normalizedBase !== numericBase) {
      conditions.push({ wireNo: { startsWith: normalizedBase } });
    }
  }
  
  // Normalized form for flexible matching (removes / and - but keeps letters)
  if (normalizedNoSpecial && normalizedNoSpecial !== trimmed && normalizedNoSpecial.length >= 2) {
    conditions.push({ wireNo: { contains: normalizedNoSpecial, mode: Prisma.QueryMode.insensitive } });
    conditions.push({ wireAlias: { contains: normalizedNoSpecial, mode: Prisma.QueryMode.insensitive } });
  }

  // NOTE: We deliberately do NOT add a bare `endsWith: suffix` condition.
  // Matching every wire that ends in "a" (e.g. searching 3001a returning 01222a)
  // produces irrelevant noise. The base-prefix match above already captures the
  // full family (3001, 3001a, 3001/1, ...). Relevance ordering is applied after.

  return conditions;
}

/**
 * Score a wire against the query for relevance ordering.
 * Higher score = more relevant. Ensures exact matches surface first.
 */
function wireRelevanceScore(wireNo: string, query: string): number {
  const w = wireNo.toLowerCase();
  const q = query.trim().toLowerCase();
  const qNoSpecial = q.replace(/[\/\-\s]/g, '');
  const wNoSpecial = w.replace(/[\/\-\s]/g, '');
  const base = q.match(/^(\d+(?:-\d+)?)/)?.[1] || '';

  if (w === q) return 1000;                      // exact
  if (wNoSpecial === qNoSpecial) return 900;      // exact ignoring separators
  if (w.startsWith(q)) return 800;                // prefix on full query
  if (base && w === base) return 700;             // equals base number
  if (base && w.startsWith(base)) return 600;     // base family member
  if (w.includes(q)) return 400;                  // substring
  if (wNoSpecial.includes(qNoSpecial)) return 300;
  return 100;
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

    // Exclude DEPRECATED wires by default (engineering data accuracy)
    // Users can explicitly request deprecated wires with ?includeDeprecated=true
    const includeDeprecated = searchParams.get('includeDeprecated') === 'true';
    if (!includeDeprecated) {
      where.wireStatus = {
        in: ['VERIFIED', 'SYNTHETIC', 'UNVERIFIED']
      };
    }

    // NOTE: groupBy(['voltageClass']) scans the entire wire table (100k+ rows)
    // and previously exhausted the connection pool (P2024). Run the list +
    // count first (fast, indexed), then fetch voltage facets separately with a
    // guarded fallback so a slow facet query can never break the listing.
    const isSearching = !!search.trim();

    // When searching, over-fetch then re-rank by relevance so exact matches
    // (3001a) surface above incidental matches (01222a). The DB cannot order
    // by our custom relevance, so we fetch a wider window and sort in memory.
    const fetchTake = isSearching ? Math.min(limit * 5, 1000) : limit;

    const [rawWires, total] = await Promise.all([
      prisma.wire.findMany({
        where,
        take: fetchTake,
        skip: isSearching ? 0 : offset,
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
    ]);

    // Apply relevance ranking + pagination window when searching.
    const wires = isSearching
      ? rawWires
          .map(w => ({ w, score: wireRelevanceScore(w.wireNo, search) }))
          .sort((a, b) => (b.score - a.score) || a.w.wireNo.localeCompare(b.w.wireNo))
          .slice(offset, offset + limit)
          .map(x => x.w)
      : rawWires;

    // Voltage facets are best-effort only; never let them fail the request.
    const voltageStats = await prisma.wire
      .groupBy({ by: ['voltageClass'], _count: true })
      .catch(() => [] as { voltageClass: string | null; _count: number }[]);

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