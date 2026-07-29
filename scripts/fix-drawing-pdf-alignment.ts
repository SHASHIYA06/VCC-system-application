/**
 * FIX DRAWING → PDF ALIGNMENT
 *
 * Problem: 451 of 574 drawings have `sourceFileId` pointing to PDF "A"
 * while their DrawingPageMapping rows point to PDF "B". The viewer opens
 * PDF A but jumps to a page number that only makes sense in PDF B →
 * user sees a completely different drawing.
 *
 * Fix: For every drawing, choose ONE authoritative (sourceFile, page) pair
 * and make `Drawing.sourceFileId` agree with it. Preference order:
 *   1. A mapping whose sourceFileName already equals Drawing.sourceFileId
 *   2. Highest-priority verified mapping (OCR > PIN > CEILING/UF > DESCRIPTION)
 *   3. Any mapping at all
 * Then delete duplicate mappings for the same (drawing, file) pair, keeping
 * the lowest page number so the viewer always lands on sheet 1.
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function filePriority(fileName: string | null): number {
  if (!fileName) return 0;
  if (fileName.includes('VCC Drawings_OCR')) return 100;   // master schematic set
  if (fileName.includes('VCC_commented')) return 90;
  if (fileName.includes('PIN DRAWINGS')) return 80;        // CAB / DMC / TC pin sets
  if (fileName.includes('_CEILING') || fileName.includes('_UF') || fileName.includes('MC_UF')) return 75;
  if (fileName.includes('VCC DESCRIPTION')) return 30;     // prose doc, weakest
  return 50;
}

function mappingScore(m: { sourceFileName: string; verified: boolean; confidence: number }): number {
  return filePriority(m.sourceFileName) + (m.verified ? 25 : 0) + (m.confidence ?? 0) * 5;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║        FIX DRAWING → PDF ALIGNMENT                           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const drawings = await prisma.drawing.findMany({
    include: { pageMappings: true },
    orderBy: { drawingNo: 'asc' },
  });

  let aligned = 0;
  let sourceChanged = 0;
  let dupsRemoved = 0;
  let noMapping = 0;

  for (const d of drawings) {
    const maps = d.pageMappings;
    if (maps.length === 0) {
      noMapping++;
      continue;
    }

    // 1. Prefer a mapping that already agrees with the drawing's source file
    let chosen = maps.find((m) => m.sourceFileName === d.sourceFileId);

    // 2. Otherwise take the highest-scoring mapping
    if (!chosen) {
      chosen = maps.reduce((best, m) => (mappingScore(m) > mappingScore(best) ? m : best), maps[0]);
    }

    // Within the chosen file, always land on the LOWEST page (sheet 1)
    const sameFile = maps.filter((m) => m.sourceFileName === chosen!.sourceFileName);
    const lowest = sameFile.reduce((a, b) => (a.pdfPageNo <= b.pdfPageNo ? a : b));

    // Align Drawing.sourceFileId with the chosen mapping's file
    if (d.sourceFileId !== lowest.sourceFileName) {
      await prisma.drawing.update({
        where: { id: d.id },
        data: { sourceFileId: lowest.sourceFileName },
      });
      sourceChanged++;
    }

    // Remove exact duplicates (same file + same page) keeping the best row
    const seen = new Set<string>();
    for (const m of maps) {
      const key = `${m.sourceFileName}::${m.pdfPageNo}`;
      if (seen.has(key)) {
        await prisma.drawingPageMapping.delete({ where: { id: m.id } });
        dupsRemoved++;
      } else {
        seen.add(key);
      }
    }

    aligned++;
  }

  console.log(`  Drawings processed:        ${drawings.length}`);
  console.log(`  Aligned:                   ${aligned}`);
  console.log(`  sourceFileId corrected:    ${sourceChanged}`);
  console.log(`  Duplicate mappings removed:${dupsRemoved}`);
  console.log(`  Drawings with no mapping:  ${noMapping}\n`);

  // ── Verification ────────────────────────────────────────────────────────
  const mismatch = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint as count
    FROM "Drawing" d
    WHERE d."sourceFileId" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "DrawingPageMapping" m
        WHERE m."drawingId" = d.id AND m."sourceFileName" = d."sourceFileId"
      )
  `;
  console.log(`  Remaining mismatches:      ${Number(mismatch[0].count)}`);
  console.log('\n✅ Drawing → PDF alignment complete.\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
