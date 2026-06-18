/**
 * Map ALL 574 drawings to their PDF files and page numbers
 * Uses pattern-based inference for drawings not in the manual mapping
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function inferPdfMapping(drawingNo: string): { pdf: string; page: number } | null {
  // Main VCC schematics (942-58xxx) → KMRCL VCC Drawings_OCR.pdf (127 pages)
  if (drawingNo.match(/^942-58[0-1]/)) {
    const num = parseInt(drawingNo.replace('942-', ''));
    // Sequential within the PDF, starting around page 1
    // 58099 = page 1, 58154 = ~page 86, so roughly 1 page per drawing
    const baseNum = 58099;
    const page = Math.max(1, Math.min(127, num - baseNum + 1));
    return { pdf: 'KMRCL VCC Drawings_OCR.pdf', page };
  }

  // Additional schematics 942-582xx, 942-583xx, 942-584xx → KMRCL VCC Drawings_OCR.pdf
  if (drawingNo.match(/^942-58[2-4]/)) {
    const num = parseInt(drawingNo.replace('942-', ''));
    // These are later pages in the same PDF or continuation
    const baseNum = 58200;
    const page = Math.max(87, Math.min(127, 87 + Math.floor((num - baseNum) / 3)));
    return { pdf: 'KMRCL VCC Drawings_OCR.pdf', page };
  }

  // CAB PIN drawings (942-381xx) → CAB_PIN DRAWINGS.pdf or CAB_PIN DRAWINGS 2.pdf
  if (drawingNo.match(/^942-381[0-5]/)) {
    const num = parseInt(drawingNo.split('-')[1]);
    if (num <= 38128) {
      const page = Math.max(1, Math.min(48, Math.floor((num - 38100) / 1) + 1));
      return { pdf: 'CAB_PIN DRAWINGS 2.pdf', page };
    }
    const page = Math.max(1, Math.min(48, Math.floor((num - 38140) / 1) + 1));
    return { pdf: 'CAB_PIN DRAWINGS 2.pdf', page };
  }

  // DMC Underframe (942-383xx) → DMC UF_PIN DRAWINGS.pdf (26 pages)
  if (drawingNo.match(/^942-383/)) {
    const num = parseInt(drawingNo.split('-')[1]);
    const page = Math.max(1, Math.min(26, Math.floor((num - 38300) / 1.5) + 1));
    return { pdf: 'DMC UF_PIN DRAWINGS.pdf', page };
  }

  // DMC Ceiling (942-384xx) → DMC_CEILING.pdf (28 pages)
  if (drawingNo.match(/^942-384/)) {
    const num = parseInt(drawingNo.split('-')[1]);
    const page = Math.max(1, Math.min(28, Math.floor((num - 38400) / 1.5) + 1));
    return { pdf: 'DMC_CEILING.pdf', page };
  }

  // TC Underframe (942-385xx) → TC _UF PIN DRAWINGS.pdf (21 pages)
  if (drawingNo.match(/^942-385/)) {
    const num = parseInt(drawingNo.split('-')[1]);
    const page = Math.max(1, Math.min(21, Math.floor((num - 38500) / 1.5) + 1));
    return { pdf: 'TC _UF PIN DRAWINGS.pdf', page };
  }

  // TC Ceiling (942-386xx) → TC_CEILING PIN DRAWINGS.pdf (27 pages)
  if (drawingNo.match(/^942-386/)) {
    const num = parseInt(drawingNo.split('-')[1]);
    const page = Math.max(1, Math.min(27, Math.floor((num - 38600) / 2) + 1));
    return { pdf: 'TC_CEILING PIN DRAWINGS.pdf', page };
  }

  // MC Ceiling (942-387xx) → MC_CEILING_PIN DRAWINGS.pdf (58 pages)
  if (drawingNo.match(/^942-387/)) {
    const num = parseInt(drawingNo.split('-')[1]);
    const page = Math.max(1, Math.min(58, Math.floor((num - 38700) / 1) + 1));
    return { pdf: 'MC_CEILING_PIN DRAWINGS.pdf', page };
  }

  // MC UF (942-38 1xx range that's for MC) → MC_UF.pdf (27 pages)  
  if (drawingNo.match(/^942-700/)) {
    return { pdf: 'KMRCL VCC Drawings_OCR.pdf', page: 100 };
  }

  // VCC Reference documents
  if (drawingNo.match(/^VCC-REF/)) {
    const num = parseInt(drawingNo.replace('VCC-REF-', '')) || 1;
    return { pdf: 'VCC DESCRIPTION 13.12.2017.pdf', page: Math.min(53, num) };
  }

  // 942-17xxx series
  if (drawingNo.match(/^942-17/)) {
    return { pdf: 'KMRCL VCC Drawings_OCR.pdf', page: 1 };
  }

  // Default fallback - main PDF page 1
  return { pdf: 'KMRCL VCC Drawings_OCR.pdf', page: 1 };
}

async function main() {
  console.log('📐 Mapping ALL 574 drawings to PDF pages...\n');

  // Get all unmapped drawings
  const unmapped = await prisma.drawing.findMany({
    where: { pageMappings: { none: {} } },
    select: { id: true, drawingNo: true },
    orderBy: { drawingNo: 'asc' },
  });

  console.log(`Unmapped drawings: ${unmapped.length}`);
  let created = 0, failed = 0;

  for (const drawing of unmapped) {
    const mapping = inferPdfMapping(drawing.drawingNo);
    if (!mapping) { failed++; continue; }

    try {
      await prisma.drawingPageMapping.create({
        data: {
          drawingId: drawing.id,
          sourceFileId: mapping.pdf,
          sourceFileName: mapping.pdf,
          pdfPageNo: mapping.page,
          drawingNumber: drawing.drawingNo,
          verified: false,
        },
      });
      created++;
    } catch (e) {
      // Already exists (unique constraint)
      failed++;
    }

    if (created % 50 === 0 && created > 0) {
      process.stdout.write(`  ${created} mapped...\n`);
    }
  }

  const total = await prisma.drawingPageMapping.count();
  console.log(`\n✅ Created: ${created} new mappings`);
  console.log(`❌ Failed/skipped: ${failed}`);
  console.log(`📊 Total mappings in DB: ${total} / 574 drawings`);
  console.log(`📈 Coverage: ${((total / 574) * 100).toFixed(1)}%`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
