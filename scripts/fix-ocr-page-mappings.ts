/**
 * FIX OCR PAGE MAPPINGS FROM TITLE
 *
 * Many OCR-imported drawings have titles like
 *   "KMRCL VCC Drawings_OCR - Page 21"
 * which literally state the correct PDF page. The inferred page mappings,
 * however, were computed by a (broken) linear formula and disagree — this is
 * the root cause of "search drawing number and actual output drawing totally
 * mismatch" reported by the user.
 *
 * This script reads the authoritative page number from the title and corrects
 * the DrawingPageMapping.pdfPageNo (and marks it verified) for every OCR
 * drawing whose title encodes "Page N". User-verified mappings are never
 * overwritten.
 *
 * Usage:
 *   npx tsx scripts/fix-ocr-page-mappings.ts          (dry run)
 *   npx tsx scripts/fix-ocr-page-mappings.ts --apply
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

const OCR_FILE = 'KMRCL VCC Drawings_OCR.pdf';

async function main() {
  console.log(`\n=== FIX OCR PAGE MAPPINGS FROM TITLE (${APPLY ? 'APPLY' : 'DRY RUN'}) ===\n`);

  const drawings = await prisma.drawing.findMany({
    where: { title: { contains: 'Page', mode: 'insensitive' } },
    select: {
      id: true, drawingNo: true, title: true,
      pageMappings: { select: { id: true, pdfPageNo: true, sourceFileName: true, verified: true } },
    },
  });

  let corrected = 0, alreadyOk = 0, created = 0, skippedVerified = 0;
  const samples: string[] = [];

  // Map a title prefix to its actual source PDF file name.
  const sourceFromTitle = (title: string): string => {
    const t = title.toUpperCase();
    if (t.includes('CAB_PIN DRAWINGS 2')) return 'CAB_PIN DRAWINGS 2.pdf';
    if (t.includes('CAB_PIN')) return 'CAB_PIN DRAWINGS.pdf';
    if (t.includes('DMC UF') || t.includes('DMC_UF')) return 'DMC UF_PIN DRAWINGS.pdf';
    if (t.includes('DMC_CEILING') || t.includes('DMC CEILING')) return 'DMC_CEILING.pdf';
    if (t.includes('TC _UF') || t.includes('TC_UF') || t.includes('TC UF')) return 'TC _UF PIN DRAWINGS.pdf';
    if (t.includes('TC_CEILING') || t.includes('TC CEILING')) return 'TC_CEILING PIN DRAWINGS.pdf';
    if (t.includes('MC_CEILING') || t.includes('MC CEILING')) return 'MC_CEILING_PIN DRAWINGS.pdf';
    if (t.includes('MC_UF') || t.includes('MC UF')) return 'MC_UF.pdf';
    if (t.includes('VCC DESCRIPTION')) return 'VCC DESCRIPTION 13.12.2017.pdf';
    return OCR_FILE; // default: main schematic OCR
  };

  for (const d of drawings) {
    // Extract "Page N" from the title (the authoritative OCR page).
    const m = (d.title || '').match(/Page\s+(\d+)/i);
    if (!m) continue;
    const truePage = parseInt(m[1], 10);
    if (!truePage || truePage < 1) continue;

    const sourceFile = sourceFromTitle(d.title || '');
    const existing = d.pageMappings.find(pm => pm.sourceFileName === sourceFile) || d.pageMappings[0];

    if (existing) {
      if (existing.verified) { skippedVerified++; continue; }   // never overwrite verified
      if (existing.pdfPageNo === truePage && existing.sourceFileName === sourceFile) { alreadyOk++; continue; }
      if (samples.length < 15) samples.push(`${d.drawingNo}: p${existing.pdfPageNo} -> p${truePage} [${sourceFile}]`);
      corrected++;
      if (APPLY) {
        await prisma.drawingPageMapping.update({
          where: { id: existing.id },
          data: { pdfPageNo: truePage, verified: true, sourceFileName: sourceFile,
                  notes: 'Corrected from OCR title page number', verificationDate: new Date() },
        });
      }
    } else {
      created++;
      if (APPLY) {
        await prisma.drawingPageMapping.create({
          data: { drawingId: d.id, drawingNumber: d.drawingNo, sourceFileId: sourceFile,
                  sourceFileName: sourceFile, pdfPageNo: truePage, verified: true,
                  notes: 'Created from OCR title page number', confidence: 1.0 },
        }).catch(() => {});
      }
    }
  }

  console.log('Sample corrections:');
  samples.forEach(s => console.log('  ' + s));
  console.log(`\nCorrected: ${corrected}, Created: ${created}, Already correct: ${alreadyOk}, Skipped (verified): ${skippedVerified}`);
  console.log(APPLY ? 'Applied.\n' : 'Dry run — re-run with --apply to write.\n');

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
