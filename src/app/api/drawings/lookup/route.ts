import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readdir } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

// ─── PDF filename to drawing number prefix mappings ──────────────────────────
// Maps actual PDF files in public/DOCUMENTS to the drawing number ranges they cover
const PDF_FILE_REGISTRY: Record<string, { file: string; systems: string[]; description: string; drawingPrefixes: string[] }> = {
  'KMRCL VCC Drawings_OCR.pdf': {
    file: 'KMRCL VCC Drawings_OCR.pdf',
    systems: ['GEN', 'TRAC', 'BRAKE', 'TMS', 'DOOR', 'VAC', 'APS', 'COMMS', 'CBTC', 'LIGHT', 'PIS'],
    description: 'Main VCC Drawings (all schematics)',
    drawingPrefixes: ['942-38', '942-58'],
  },
  'DMC UF_PIN DRAWINGS.pdf': {
    file: 'DMC UF_PIN DRAWINGS.pdf',
    systems: ['TRAC', 'BRAKE', 'APS'],
    description: 'DMC Underframe PIN Drawing',
    drawingPrefixes: ['942-383'],
  },
  'DMC_CEILING.pdf': {
    file: 'DMC_CEILING.pdf',
    systems: ['TMS', 'DOOR', 'COMMS'],
    description: 'DMC Ceiling PIN Drawing',
    drawingPrefixes: ['942-384'],
  },
  'TC _UF PIN DRAWINGS.pdf': {
    file: 'TC _UF PIN DRAWINGS.pdf',
    systems: ['APS', 'BRAKE'],
    description: 'TC Underframe PIN Drawing',
    drawingPrefixes: ['942-385'],
  },
  'TC_CEILING PIN DRAWINGS.pdf': {
    file: 'TC_CEILING PIN DRAWINGS.pdf',
    systems: ['TMS', 'VAC'],
    description: 'TC Ceiling PIN Drawing',
    drawingPrefixes: ['942-386'],
  },
  'MC_UF.pdf': {
    file: 'MC_UF.pdf',
    systems: ['TRAC', 'BRAKE', 'DOOR'],
    description: 'MC Underframe PIN Drawing',
    drawingPrefixes: ['942-386'],
  },
  'MC_CEILING_PIN DRAWINGS.pdf': {
    file: 'MC_CEILING_PIN DRAWINGS.pdf',
    systems: ['TMS', 'DOOR', 'VAC', 'COMMS'],
    description: 'MC Ceiling PIN Drawing',
    drawingPrefixes: ['942-387'],
  },
  'CAB_PIN DRAWINGS.pdf': {
    file: 'CAB_PIN DRAWINGS.pdf',
    systems: ['CAB', 'TMS'],
    description: 'CAB PIN Drawing',
    drawingPrefixes: ['942-381'],
  },
  'CAB_PIN DRAWINGS 2.pdf': {
    file: 'CAB_PIN DRAWINGS 2.pdf',
    systems: ['CAB'],
    description: 'CAB PIN Drawing (Part 2)',
    drawingPrefixes: ['942-382'],
  },
  'VCC DESCRIPTION 13.12.2017.pdf': {
    file: 'VCC DESCRIPTION 13.12.2017.pdf',
    systems: ['GEN'],
    description: 'VCC System Description',
    drawingPrefixes: [],
  },
};

/**
 * Resolve which PDF file contains a given drawing number.
 * Returns the filename and a hint at page number.
 */
function resolveDrawingToPdf(drawingNo: string): { file: string; isPin: boolean } | null {
  const upper = drawingNo.toUpperCase();
  
  // Handle drawing numbers with alphabetic suffixes (e.g., 942-58128D)
  const cleanNo = upper.replace(/[A-Z]+$/, '');
  
  // PIN drawings: 942-381xx = CAB, 942-382xx = CAB Part 2, 942-383xx = DMC_UF, etc.
  if (upper.match(/942[-]?381/i)) return { file: 'CAB_PIN DRAWINGS.pdf', isPin: true };
  if (upper.match(/942[-]?382/i)) return { file: 'CAB_PIN DRAWINGS 2.pdf', isPin: true };
  if (upper.match(/942[-]?383/i)) return { file: 'DMC UF_PIN DRAWINGS.pdf', isPin: true };
  if (upper.match(/942[-]?384/i)) return { file: 'DMC_CEILING.pdf', isPin: true };
  if (upper.match(/942[-]?385/i)) return { file: 'TC _UF PIN DRAWINGS.pdf', isPin: true };
  if (upper.match(/942[-]?386/i)) return { file: 'TC_CEILING PIN DRAWINGS.pdf', isPin: true };
  if (upper.match(/942[-]?387/i)) return { file: 'MC_CEILING_PIN DRAWINGS.pdf', isPin: true };

  // Schematic drawings: 942-58xxx
  if (upper.match(/942[-]?58/i)) return { file: 'KMRCL VCC Drawings_OCR.pdf', isPin: false };
  if (upper.match(/942[-]?38/i)) return { file: 'KMRCL VCC Drawings_OCR.pdf', isPin: false };

  // Fallback to main OCR file
  return { file: 'KMRCL VCC Drawings_OCR.pdf', isPin: false };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const drawingNo = searchParams.get('drawing_no');
  const includePages = searchParams.get('include_pages') === 'true';

  if (!drawingNo) {
    return NextResponse.json({ error: 'Drawing number required' }, { status: 400 });
  }

  try {
    const normalizedQuery = drawingNo.trim().toUpperCase();

    // Handle drawings with alphabetic page suffixes (e.g., 942-58128D means page D of 942-58128)
    // Extract base number — everything before trailing A/B/C/D/E etc.
    const baseNumber = normalizedQuery.replace(/[A-Z]+$/, '');
    const pageSuffix = normalizedQuery.slice(baseNumber.length); // e.g. "A", "B", "D"
    const withoutPrefix = normalizedQuery.replace(/^942[-_]/i, '');
    const baseWithoutPrefix = withoutPrefix.replace(/[A-Z]+$/, '');

    // Build an OR search that catches ALL page variants of this drawing
    const drawing = await prisma.drawing.findFirst({
      where: {
        OR: [
          { drawingNo: { equals: normalizedQuery } },
          { drawingNo: { equals: normalizedQuery.replace(/-/g, '') } },
          { drawingNo: { contains: normalizedQuery } },
          { drawingNo: { contains: normalizedQuery.replace(/-/g, '') } },
          { drawingNo: { contains: withoutPrefix } },
          { drawingNo: { startsWith: baseNumber } },
          { drawingNo: { startsWith: baseWithoutPrefix } },
          { drawingNo: { contains: baseWithoutPrefix } },
        ],
      },
      include: {
        pages: { orderBy: { pageNo: 'asc' } },
        system: true,
        connectors: { include: { pins: { orderBy: { pinNo: 'asc' } } } },
        trainLines: { orderBy: { wireNo: 'asc' } },
        devices: { include: { system: true } },
        sheets: { orderBy: { sheetNo: 'asc' } },
        _count: { select: { connectors: true, trainLines: true, devices: true } },
      },
    });

    // Also fetch ALL page variants of this drawing (e.g. 942-58120, 942-58120A, 942-58120B...)
    let allPages: any[] = [];
    if (baseNumber.length >= 6) {
      allPages = await prisma.drawing.findMany({
        where: {
          drawingNo: { startsWith: baseNumber },
        },
        select: {
          id: true,
          drawingNo: true,
          title: true,
          revision: true,
          totalSheets: true,
          _count: { select: { connectors: true, trainLines: true } },
        },
        orderBy: { drawingNo: 'asc' },
        take: 20,
      });
    }

    if (!drawing) {
      const suggestions = await getDrawingSuggestions(drawingNo);
      return NextResponse.json({
        error: 'Drawing not found',
        suggestions,
        searchedQuery: drawingNo,
        allPageVariants: allPages,
        tip: 'Try entering just the numeric portion (e.g., 58120 instead of 942-58120). For multi-page drawings, use the base number (e.g., 942-58120 to find 942-58120A, 942-58120B).',
      }, { status: 404 });
    }

    // Resolve PDF source file
    let resolvedSourceFile: string | null = null;

    // 1. Try DB-stored sourceFileId
    if (drawing.sourceFileId) {
      try {
        const sfRecord = await prisma.sourceFile.findUnique({
          where: { id: drawing.sourceFileId },
          select: { filename: true },
        });
        if (sfRecord?.filename) resolvedSourceFile = sfRecord.filename;
      } catch { /* ignore */ }
      if (!resolvedSourceFile) resolvedSourceFile = drawing.sourceFileId;
    }

    // 2. Fall back to intelligent mapping based on drawing number
    if (!resolvedSourceFile || !resolvedSourceFile.endsWith('.pdf')) {
      const mapped = resolveDrawingToPdf(drawing.drawingNo);
      if (mapped) resolvedSourceFile = mapped.file;
    }

    // 3. Last resort: list actual PDF files in public/DOCUMENTS
    if (!resolvedSourceFile) {
      try {
        const docsDir = join(process.cwd(), 'public', 'DOCUMENTS');
        const files = await readdir(docsDir);
        const pdfs = files.filter(f => f.endsWith('.pdf'));
        if (pdfs.length > 0) resolvedSourceFile = pdfs[0];
      } catch { /* ignore */ }
    }

    const relatedWires = await getRelatedWires(drawing.id, drawing.drawingNo);
    const relatedTrainlines = await getRelatedTrainlines(drawing.id);
    const relatedEquipment = await getRelatedEquipment(drawing.id);
    const relatedConnectors = await getRelatedConnectors(drawing.id);

    // Determine if this is a PIN drawing
    const isPinDrawing = drawing.drawingNo.match(/942-38[1-9]/i) !== null ||
      drawing.title?.toLowerCase().includes('pin') || false;

    return NextResponse.json({
      drawing: {
        id: drawing.id,
        drawingNo: drawing.drawingNo,
        title: drawing.title,
        revision: drawing.revision,
        systemCode: drawing.system?.code || '',
        systemName: drawing.system?.name || '',
        totalSheets: drawing.totalSheets,
        sourceFile: resolvedSourceFile,
        remarks: drawing.remarks,
        pageCount: drawing.pages.length,
        isPinDrawing,
        pageSuffix: pageSuffix || null,
        _count: drawing._count,
      },
      // All page variants: 942-58120, 942-58120A, 942-58120B
      allPageVariants: allPages,
      relatedWires,
      relatedTrainlines,
      relatedEquipment,
      relatedConnectors,
      suggestions: [],
    });
  } catch (error) {
    console.error('Drawing lookup error:', error);
    return NextResponse.json({ error: 'Database error', details: String(error) }, { status: 500 });
  }
}

// ─── Helper queries ─────────────────────────────────────────────────────────

async function getRelatedWires(drawingId: string, drawingNo: string) {
  try {
    // Get wire numbers from connector pins
    const connectorsOnDrawing = await prisma.connector.findMany({
      where: { drawingId },
      include: { pins: { where: { wireNo: { not: null } }, select: { wireNo: true } } }
    });
    const wireNosFromPins = [...new Set(
      connectorsOnDrawing.flatMap(c => c.pins.map(p => p.wireNo)).filter(Boolean) as string[]
    )];

    // Get wires from endpoints
    const wireEndpoints = await prisma.wireEndpoint.findMany({
      where: { connector: { drawingId } },
      include: { wire: true },
    });
    const wiresFromEndpoints = wireEndpoints.map(we => we.wire);

    // Get wires by wire number prefix from drawing
    const baseNumMatch = drawingNo.match(/\d+/);
    const baseNum = baseNumMatch ? baseNumMatch[0].slice(-4) : '';

    // Fetch by PIN wire numbers + search
    const [wiresFromPins, wiresFromSearch] = await Promise.all([
      wireNosFromPins.length > 0 ? prisma.wire.findMany({
        where: {
          OR: [
            { wireNo: { in: wireNosFromPins } },
            ...wireNosFromPins.slice(0, 10).map(wn => ({ wireNo: { startsWith: wn.replace(/[a-zA-Z]+$/, '') } }))
          ]
        },
        take: 100,
      }) : [],
      baseNum ? prisma.wire.findMany({
        where: {
          OR: [
            { remarks: { contains: drawingNo } },
            { description: { contains: drawingNo } },
          ]
        },
        take: 30,
      }) : [],
    ]);

    const allWires = [...wiresFromEndpoints, ...wiresFromPins, ...wiresFromSearch];
    const unique = Array.from(new Map(allWires.map(w => [w.wireNo, w])).values());

    return unique.slice(0, 150).map(w => ({
      wireNo: w.wireNo,
      signalName: w.signalName,
      wireColor: w.wireColor,
      voltageClass: w.voltageClass,
      wireSize: w.wireSize,
      sourceConnector: w.sourceConnector,
      destConnector: w.destConnector,
      sourceEquipment: w.sourceEquipment,
      destEquipment: w.destEquipment,
      cableSpec: w.cableSpec,
    }));
  } catch { return []; }
}

async function getRelatedTrainlines(drawingId: string) {
  try {
    return await prisma.trainLine.findMany({
      where: { drawingId },
      orderBy: { wireNo: 'asc' },
      take: 200,
    });
  } catch { return []; }
}

async function getRelatedEquipment(drawingId: string) {
  try {
    const equipment = await prisma.device.findMany({
      where: { drawingId },
      include: { system: true },
      take: 100,
      orderBy: { deviceName: 'asc' },
    });
    return equipment.map(e => ({
      name: e.deviceName,
      tag: e.tagNo,
      carType: e.carType,
      systemCode: e.system?.code,
      systemName: e.system?.name,
      location: e.locationTag,
    }));
  } catch { return []; }
}

async function getRelatedConnectors(drawingId: string) {
  try {
    const connectors = await prisma.connector.findMany({
      where: { drawingId },
      include: {
        pins: { orderBy: { pinNo: 'asc' } },
        _count: { select: { pins: true } },
      },
      take: 100,
      orderBy: { connectorCode: 'asc' },
    });
    return connectors.map(c => ({
      connectorCode: c.connectorCode,
      connectorType: c.connectorTypeCode,
      description: c.description,
      carType: c.carType,
      pinCount: c._count.pins,
      pins: c.pins.map(p => ({
        pinNo: p.pinNo,
        signalName: p.signalName,
        wireNo: p.wireNo,
      })),
    }));
  } catch { return []; }
}

async function getDrawingSuggestions(query: string) {
  try {
    const q = query.trim().toUpperCase();
    const base = q.replace(/[A-Z]+$/, '');
    return await prisma.drawing.findMany({
      where: {
        OR: [
          { drawingNo: { contains: q } },
          { drawingNo: { startsWith: base } },
          { drawingNo: { contains: q.replace(/-/g, '') } },
          { title: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        drawingNo: true, title: true, revision: true,
        system: { select: { code: true, name: true } },
        _count: { select: { connectors: true, trainLines: true } },
      },
      take: 15,
      orderBy: { drawingNo: 'asc' },
    });
  } catch { return []; }
}