import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Drawing lookup — resolves a drawing number to its record, source PDF,
 * page number, and related connectors / wires / trainlines / equipment.
 *
 * PERFORMANCE CONTRACT: must return in < 3s so it never trips Vercel's
 * function timeout. Every query below is bounded and index-friendly.
 *
 * SOURCE-OF-TRUTH: the PDF filename and page number come from
 * `Drawing.sourceFileId` + `DrawingPageMapping`. Hard-coded filename guessing
 * is only a last resort for records with no mapping at all — guessing must
 * never override stored data, otherwise the viewer opens PDF "A" and jumps to
 * a page number that only makes sense in PDF "B".
 */

const MAX_CONNECTORS = 60;
const MAX_PINS_PER_CONNECTOR = 120;
const MAX_WIRES = 150;
const MAX_TRAINLINES = 200;
const MAX_EQUIPMENT = 100;

/** Last-resort filename guess for drawings with no stored source file. */
function guessPdfForDrawing(drawingNo: string): string {
  const u = drawingNo.toUpperCase();
  if (/942[-]?383/.test(u)) return 'DMC UF_PIN DRAWINGS.pdf';
  if (/942[-]?382/.test(u)) return 'DMC_CEILING.pdf';
  if (/942[-]?385/.test(u)) return 'TC _UF PIN DRAWINGS.pdf';
  if (/942[-]?384/.test(u)) return 'TC_CEILING PIN DRAWINGS.pdf';
  if (/942[-]?386/.test(u)) return 'MC_CEILING_PIN DRAWINGS.pdf';
  if (/942[-]?387/.test(u)) return 'MC_CEILING_PIN DRAWINGS.pdf';
  if (/942[-]?381/.test(u)) return 'CAB_PIN DRAWINGS.pdf';
  return 'KMRCL VCC Drawings_OCR.pdf';
}

/** Rank candidate page mappings so the viewer lands on the right sheet. */
function filePriority(fileName: string | null | undefined): number {
  if (!fileName) return 0;
  if (fileName.includes('VCC Drawings_OCR')) return 100;
  if (fileName.includes('VCC_commented')) return 90;
  if (fileName.includes('PIN DRAWINGS')) return 80;
  if (fileName.includes('_CEILING') || fileName.includes('_UF')) return 75;
  if (fileName.includes('VCC DESCRIPTION')) return 30;
  return 50;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const drawingNo = searchParams.get('drawing_no');

  if (!drawingNo) {
    return NextResponse.json({ error: 'Drawing number required' }, { status: 400 });
  }

  try {
    const q = drawingNo.trim().toUpperCase();
    const baseNumber = q.replace(/[A-Z]+$/, '');          // 942-58120D -> 942-58120
    const pageSuffix = q.slice(baseNumber.length) || null; // "D"
    const noPrefix = q.replace(/^942[-_]/, '');            // 58120
    const baseNoPrefix = noPrefix.replace(/[A-Z]+$/, '');

    // ── Resolve the drawing ────────────────────────────────────────────────
    // Staged lookup: cheap indexed equality first, fuzzy only if needed.
    let drawing = await prisma.drawing.findFirst({
      where: { drawingNo: q },
      include: {
        system: true,
        pageMappings: true,
        _count: { select: { connectors: true, trainLines: true, devices: true, pages: true } },
      },
      orderBy: { revision: 'desc' },
    });

    if (!drawing) {
      drawing = await prisma.drawing.findFirst({
        where: { drawingNo: baseNumber },
        include: {
          system: true,
          pageMappings: true,
          _count: { select: { connectors: true, trainLines: true, devices: true, pages: true } },
        },
        orderBy: { revision: 'desc' },
      });
    }

    if (!drawing) {
      drawing = await prisma.drawing.findFirst({
        where: {
          OR: [
            { drawingNo: { startsWith: baseNumber } },
            { drawingNo: { endsWith: baseNoPrefix } },
            { drawingNo: { contains: noPrefix } },
          ],
        },
        include: {
          system: true,
          pageMappings: true,
          _count: { select: { connectors: true, trainLines: true, devices: true, pages: true } },
        },
        orderBy: { drawingNo: 'asc' },
      });
    }

    if (!drawing) {
      const [suggestions, allPageVariants] = await Promise.all([
        getDrawingSuggestions(q),
        getPageVariants(baseNumber),
      ]);
      return NextResponse.json({
        error: 'Drawing not found',
        searchedQuery: drawingNo,
        suggestions,
        allPageVariants,
        tip: 'Try the base number (e.g. 942-58120) or just the numeric part (58120).',
      }, { status: 404 });
    }

    // ── Resolve PDF file + page from stored data (never guess over stored) ──
    const mappings = drawing.pageMappings ?? [];
    let sourceFile: string | null = drawing.sourceFileId ?? null;
    let pdfPageNo: number | null = null;
    let pageVerified = false;

    if (mappings.length > 0) {
      // Prefer a mapping that agrees with the drawing's own source file.
      let candidates = sourceFile
        ? mappings.filter((m) => m.sourceFileName === sourceFile)
        : [];

      // Otherwise fall back to the highest-priority file present.
      if (candidates.length === 0) {
        const bestFile = mappings
          .map((m) => m.sourceFileName)
          .sort((a, b) => filePriority(b) - filePriority(a))[0];
        candidates = mappings.filter((m) => m.sourceFileName === bestFile);
      }

      // If a page suffix was requested (…A/B/C), offset from the first sheet.
      const sorted = [...candidates].sort((a, b) => a.pdfPageNo - b.pdfPageNo);
      let chosen = sorted[0];
      if (pageSuffix && sorted.length > 1) {
        const idx = pageSuffix.charCodeAt(0) - 65; // A=0, B=1 …
        if (idx >= 0 && idx < sorted.length) chosen = sorted[idx];
      }

      if (chosen) {
        sourceFile = chosen.sourceFileName;
        pdfPageNo = chosen.pdfPageNo;
        pageVerified = chosen.verified;
      }
    }

    // Only guess when we truly have nothing stored.
    if (!sourceFile) sourceFile = guessPdfForDrawing(drawing.drawingNo);

    // ── Related data (all bounded, run in parallel) ─────────────────────────
    const [relatedConnectors, relatedWires, relatedTrainlines, relatedEquipment, allPageVariants] =
      await Promise.all([
        getRelatedConnectors(drawing.id),
        getRelatedWires(drawing.id),
        getRelatedTrainlines(drawing.id),
        getRelatedEquipment(drawing.id),
        getPageVariants(baseNumber),
      ]);

    const isPinDrawing =
      /942-38[1-9]/i.test(drawing.drawingNo) ||
      (drawing.title?.toLowerCase().includes('pin') ?? false);

    return NextResponse.json({
      drawing: {
        id: drawing.id,
        drawingNo: drawing.drawingNo,
        title: drawing.title,
        // `titleSource === 'PLACEHOLDER'` means the title was auto-generated at
        // import time and is not the real engineering title. Exposed so the
        // detail view can say so instead of asserting a fabricated name — that
        // mismatch is what made looked-up drawings read as "totally different"
        // from the actual drawing.
        titleSource: drawing.titleSource,
        titleVerified: drawing.titleSource !== 'PLACEHOLDER',
        isReference: drawing.isReference,
        revision: drawing.revision,
        systemCode: drawing.system?.code || '',
        systemName: drawing.system?.name || '',
        totalSheets: drawing.totalSheets,
        sourceFile,
        pdfPageNo,
        pageVerified,
        remarks: drawing.remarks,
        pageCount: drawing._count.pages,
        isPinDrawing,
        pageSuffix,
        status: drawing.status,
        _count: {
          connectors: drawing._count.connectors,
          trainLines: drawing._count.trainLines,
          devices: drawing._count.devices,
        },
      },
      allPageVariants,
      relatedConnectors,
      relatedWires,
      relatedTrainlines,
      relatedEquipment,
      suggestions: [],
    });
  } catch (error) {
    console.error('Drawing lookup error:', error);
    return NextResponse.json(
      { error: 'Database error', details: String(error) },
      { status: 500 },
    );
  }
}

// ─── Bounded helper queries ─────────────────────────────────────────────────

async function getPageVariants(baseNumber: string) {
  if (baseNumber.length < 6) return [];
  try {
    return await prisma.drawing.findMany({
      where: { drawingNo: { startsWith: baseNumber } },
      select: {
        id: true,
        drawingNo: true,
        title: true,
        revision: true,
        totalSheets: true,
        sourceFileId: true,
      },
      orderBy: [{ drawingNo: 'asc' }, { revision: 'asc' }],
      take: 20,
    });
  } catch {
    return [];
  }
}

async function getRelatedConnectors(drawingId: string) {
  try {
    const connectors = await prisma.connector.findMany({
      where: { drawingId },
      select: {
        connectorCode: true,
        connectorTypeCode: true,
        description: true,
        carType: true,
        locationTag: true,
        pinCount: true,
        _count: { select: { pins: true } },
        pins: {
          select: { pinNo: true, signalName: true, wireNo: true, pinLabel: true },
          orderBy: { pinNo: 'asc' },
          take: MAX_PINS_PER_CONNECTOR,
        },
      },
      orderBy: { connectorCode: 'asc' },
      take: MAX_CONNECTORS,
    });

    return connectors.map((c) => ({
      connectorCode: c.connectorCode,
      connectorType: c.connectorTypeCode,
      description: c.description,
      carType: c.carType,
      locationTag: c.locationTag,
      pinCount: c._count.pins || c.pinCount || 0,
      pins: c.pins,
    }));
  } catch {
    return [];
  }
}

/**
 * Wires on this drawing, resolved through two bounded chains:
 *   1. DrawingWire join table (authoritative)
 *   2. ConnectorPin.wireNo for connectors on this drawing (fills gaps)
 *
 * Deliberately does NOT scan Wire.remarks / Wire.description — those columns
 * are unindexed and a `contains` over 167k rows costs ~15s.
 */
async function getRelatedWires(drawingId: string) {
  try {
    const [drawingWires, pinWireNos] = await Promise.all([
      prisma.drawingWire.findMany({
        where: { drawingId },
        select: {
          wire: {
            select: {
              wireNo: true, signalName: true, wireColor: true, voltageClass: true,
              wireSize: true, sourceConnector: true, destConnector: true,
              sourceEquipment: true, destEquipment: true, cableSpec: true,
              conductorClassCode: true, wireStatus: true,
            },
          },
        },
        take: MAX_WIRES,
      }),
      prisma.connectorPin.findMany({
        where: { connector: { drawingId }, wireNo: { not: null } },
        select: { wireNo: true },
        distinct: ['wireNo'],
        take: MAX_WIRES,
      }),
    ]);

    const byWireNo = new Map<string, any>();
    for (const dw of drawingWires) {
      if (dw.wire) byWireNo.set(dw.wire.wireNo, dw.wire);
    }

    // Fill in wires referenced by pins but missing from DrawingWire.
    const missing = pinWireNos
      .map((p) => p.wireNo!)
      .filter((n) => n && !byWireNo.has(n))
      .slice(0, MAX_WIRES);

    if (missing.length > 0) {
      const extra = await prisma.wire.findMany({
        where: { wireNo: { in: missing } },
        select: {
          wireNo: true, signalName: true, wireColor: true, voltageClass: true,
          wireSize: true, sourceConnector: true, destConnector: true,
          sourceEquipment: true, destEquipment: true, cableSpec: true,
          conductorClassCode: true, wireStatus: true,
        },
        take: MAX_WIRES,
      });
      for (const w of extra) byWireNo.set(w.wireNo, w);
    }

    return Array.from(byWireNo.values())
      .sort((a, b) => a.wireNo.localeCompare(b.wireNo, undefined, { numeric: true }))
      .slice(0, MAX_WIRES);
  } catch {
    return [];
  }
}

async function getRelatedTrainlines(drawingId: string) {
  try {
    return await prisma.trainLine.findMany({
      where: { drawingId },
      select: {
        wireNo: true, itemName: true, lineGroup: true, connectorCode: true,
        pinNo: true, carType: true, note: true, conductorClassCode: true,
      },
      orderBy: { wireNo: 'asc' },
      take: MAX_TRAINLINES,
    });
  } catch {
    return [];
  }
}

async function getRelatedEquipment(drawingId: string) {
  try {
    const equipment = await prisma.device.findMany({
      where: { drawingId },
      select: {
        deviceName: true, tagNo: true, deviceType: true, carType: true,
        locationTag: true, isVerified: true,
        system: { select: { code: true, name: true } },
      },
      orderBy: { deviceName: 'asc' },
      take: MAX_EQUIPMENT,
    });
    return equipment.map((e) => ({
      name: e.deviceName,
      tag: e.tagNo,
      deviceType: e.deviceType,
      carType: e.carType,
      location: e.locationTag,
      verified: e.isVerified,
      systemCode: e.system?.code,
      systemName: e.system?.name,
    }));
  } catch {
    return [];
  }
}

async function getDrawingSuggestions(q: string) {
  try {
    const base = q.replace(/[A-Z]+$/, '');
    return await prisma.drawing.findMany({
      where: {
        OR: [
          { drawingNo: { startsWith: base } },
          { drawingNo: { contains: q } },
          { title: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        drawingNo: true,
        title: true,
        revision: true,
        system: { select: { code: true, name: true } },
        _count: { select: { connectors: true, trainLines: true } },
      },
      take: 15,
      orderBy: { drawingNo: 'asc' },
    });
  } catch {
    return [];
  }
}
