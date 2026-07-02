import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * REPAIR 3: Link OCR-extracted wires to drawings via remarks field.
 * 
 * Wires have remarks like:
 *   "OCR: CAB_PIN DRAWINGS 2.pdf p.45"
 *   "Variant of 01222"
 * 
 * This repair:
 * 1. Parses remarks to find PDF source file + page number
 * 2. Maps PDF filename → SourceFile → SourcePage → Drawing
 * 3. Creates DrawingWire links
 * 4. For "Variant of X" wires, copies endpoint links from parent wire
 */

// Map PDF filenames to likely drawing number prefixes
const PDF_TO_DRAWING_PREFIX: Record<string, string[]> = {
  'KMRCL VCC Drawings_OCR.pdf': ['942-58', '942-38'],
  'CAB_PIN DRAWINGS.pdf': ['942-381'],
  'CAB_PIN DRAWINGS 2.pdf': ['942-382'],
  'DMC UF_PIN DRAWINGS.pdf': ['942-383'],
  'DMC_CEILING.pdf': ['942-384'],
  'TC _UF PIN DRAWINGS.pdf': ['942-385'],
  'TC_CEILING PIN DRAWINGS.pdf': ['942-386'],
  'MC_UF.pdf': ['942-386'],
  'MC_CEILING_PIN DRAWINGS.pdf': ['942-387'],
};

export async function POST() {
  const startTime = Date.now();

  try {
    let drawingLinksCreated = 0;
    let variantEndpointsCreated = 0;

    // === PART 1: Link wires via remarks → SourceFile → Drawing ===
    console.log('=== PART 1: Remarks-based Drawing Links ===');
    
    const wiresWithRemarks = await prisma.wire.findMany({
      where: {
        AND: [
          { remarks: { not: null } },
          { remarks: { contains: 'OCR:' } },
        ],
      },
      select: { id: true, wireNo: true, remarks: true },
      take: 100000,
    });

    console.log(`Found ${wiresWithRemarks.length} wires with OCR remarks`);

    // Parse remarks to extract PDF filename and page number
    const wireToPdf = new Map<string, { pdf: string; page: number | null }>();
    for (const wire of wiresWithRemarks) {
      const match = wire.remarks?.match(/OCR:\s*(.+?\.pdf)\s*(?:p\.(\d+))?/i);
      if (match) {
        wireToPdf.set(wire.id, {
          pdf: match[1].trim(),
          page: match[2] ? parseInt(match[2]) : null,
        });
      }
    }

    console.log(`Parsed ${wireToPdf.size} wire-to-PDF mappings`);

    // Find SourceFiles that match these PDFs
    const pdfNames = [...new Set([...wireToPdf.values()].map(v => v.pdf))];
    const sourceFiles = await prisma.sourceFile.findMany({
      where: { filename: { in: pdfNames } },
      select: { id: true, filename: true },
    });
    const pdfToSourceFileId = new Map(sourceFiles.map(sf => [sf.filename, sf.id]));
    console.log(`Found ${pdfToSourceFileId.size} matching SourceFiles`);

    // Find DrawingPageMappings that link SourceFiles to Drawings
    const sourceFileIds = [...pdfToSourceFileId.values()];
    const pageMappings = await prisma.drawingPageMapping.findMany({
      where: { sourceFileId: { in: sourceFileIds } },
      select: { drawingId: true, sourceFileId: true, pdfPageNo: true, drawingNumber: true },
    });

    // Build lookup: sourceFileId|pdfPageNo → drawingId
    const pageToDrawing = new Map<string, string>();
    for (const pm of pageMappings) {
      const key = `${pm.sourceFileId}|${pm.pdfPageNo}`;
      pageToDrawing.set(key, pm.drawingId);
      // Also map by sourceFileId only (for wires without page number)
      const fileKey = `${pm.sourceFileId}|*`;
      if (!pageToDrawing.has(fileKey)) {
        pageToDrawing.set(fileKey, pm.drawingId);
      }
    }
    console.log(`Found ${pageToDrawing.size} page-to-drawing mappings`);

    // Create DrawingWire links
    const drawingWirePairs: { wireId: string; drawingId: string }[] = [];
    for (const [wireId, pdfInfo] of wireToPdf) {
      const sourceFileId = pdfToSourceFileId.get(pdfInfo.pdf);
      if (!sourceFileId) continue;

      let drawingId: string | undefined;
      if (pdfInfo.page !== null) {
        drawingId = pageToDrawing.get(`${sourceFileId}|${pdfInfo.page}`);
      }
      if (!drawingId) {
        drawingId = pageToDrawing.get(`${sourceFileId}|*`);
      }
      if (drawingId) {
        drawingWirePairs.push({ wireId, drawingId });
      }
    }

    const uniqueDrawingWirePairs = [...new Map(
      drawingWirePairs.map(p => [`${p.wireId}|${p.drawingId}`, p])
    ).values()];

    if (uniqueDrawingWirePairs.length > 0) {
      const result = await prisma.drawingWire.createMany({
        data: uniqueDrawingWirePairs,
        skipDuplicates: true,
      });
      drawingLinksCreated = result.count;
    }
    console.log(`Created ${drawingLinksCreated} DrawingWire links from remarks`);

    // === PART 2: Copy endpoints from parent wires (Variant of X) ===
    console.log('\\n=== PART 2: Variant Wire Endpoint Inheritance ===');
    
    const wiresWithVariants = await prisma.wire.findMany({
      where: {
        AND: [
          { remarks: { contains: 'Variant of' } },
          { endpoints: { none: {} } },
        ],
      },
      select: { id: true, wireNo: true, remarks: true },
      take: 50000,
    });

    console.log(`Found ${wiresWithVariants.length} variant wires without endpoints`);

    // Extract parent wire number from remarks
    const parentWireNos = [...new Set(
      wiresWithVariants
        .map(w => {
          const match = w.remarks?.match(/Variant of\s+(.+)/i);
          return match ? match[1].trim() : null;
        })
        .filter(Boolean)
    )] as string[];

    // Find parent wires
    const parentWires = await prisma.wire.findMany({
      where: { wireNo: { in: parentWireNos } },
      select: { id: true, wireNo: true },
    });
    const parentNoToId = new Map(parentWires.map(w => [w.wireNo, w.id]));
    console.log(`Found ${parentNoToId.size} parent wires`);

    // Get parent wire endpoints
    const parentWireIds = [...parentNoToId.values()];
    const parentEndpoints = await prisma.wireEndpoint.findMany({
      where: { wireId: { in: parentWireIds } },
      select: { wireId: true, connectorId: true, pinId: true, endpointRole: true, endpointLabel: true },
    });

    // Build parent wire endpoints lookup
    const parentToEndpoints = new Map<string, typeof parentEndpoints>();
    for (const ep of parentEndpoints) {
      const existing = parentToEndpoints.get(ep.wireId) || [];
      existing.push(ep);
      parentToEndpoints.set(ep.wireId, existing);
    }

    // Create endpoints for variant wires
    const newVariantEndpoints: Array<{
      wireId: string;
      connectorId: string;
      pinId: string | null;
      endpointRole: string | null;
      endpointLabel: string | null;
    }> = [];

    for (const wire of wiresWithVariants) {
      const match = wire.remarks?.match(/Variant of\s+(.+)/i);
      if (!match) continue;
      const parentWireNo = match[1].trim();
      const parentWireId = parentNoToId.get(parentWireNo);
      if (!parentWireId) continue;

      const parentEps = parentToEndpoints.get(parentWireId) || [];
      for (const ep of parentEps) {
        if (!ep.connectorId) continue;
        newVariantEndpoints.push({
          wireId: wire.id,
          connectorId: ep.connectorId,
          pinId: ep.pinId,
          endpointRole: ep.endpointRole,
          endpointLabel: ep.endpointLabel,
        });
      }
    }

    if (newVariantEndpoints.length > 0) {
      const result = await prisma.wireEndpoint.createMany({
        data: newVariantEndpoints,
        skipDuplicates: true,
      });
      variantEndpointsCreated = result.count;
    }
    console.log(`Created ${variantEndpointsCreated} endpoints from variant wires`);

    // === PART 3: Re-run DrawingWire repair with new endpoints ===
    console.log('\\n=== PART 3: Re-link DrawingWire via new endpoints ===');
    
    const endpointsWithConnectors = await prisma.wireEndpoint.findMany({
      where: { connectorId: { not: null } },
      include: { connector: { select: { drawingId: true } } },
      take: 100000,
    });

    const newPairs = endpointsWithConnectors
      .filter(ep => ep.connector?.drawingId)
      .map(ep => ({ wireId: ep.wireId, drawingId: ep.connector!.drawingId }));

    const uniqueNewPairs = [...new Map(
      newPairs.map(p => [`${p.wireId}|${p.drawingId}`, p])
    ).values()];

    let additionalDrawingWire = 0;
    if (uniqueNewPairs.length > 0) {
      const result = await prisma.drawingWire.createMany({
        data: uniqueNewPairs,
        skipDuplicates: true,
      });
      additionalDrawingWire = result.count;
    }
    console.log(`Created ${additionalDrawingWire} additional DrawingWire links`);

    // Final counts
    const [totalEndpoints, totalDrawingWires, wiresWithEndpoints] = await Promise.all([
      prisma.wireEndpoint.count(),
      prisma.drawingWire.count(),
      prisma.wireEndpoint.findMany({ select: { wireId: true }, distinct: ['wireId'] }),
    ]);

    return NextResponse.json({
      status: 'success',
      parts: {
        remarksDrawingLinks: drawingLinksCreated,
        variantEndpoints: variantEndpointsCreated,
        additionalDrawingWire: additionalDrawingWire,
      },
      final: {
        totalEndpoints,
        totalDrawingWires,
        uniqueWiresWithEndpoints: wiresWithEndpoints.length,
        endpointCoverage: ((wiresWithEndpoints.length / 167758) * 100).toFixed(1) + '%',
        drawingCoverage: ((totalDrawingWires / 167758) * 100).toFixed(1) + '%',
      },
      executionTimeMs: Date.now() - startTime,
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
