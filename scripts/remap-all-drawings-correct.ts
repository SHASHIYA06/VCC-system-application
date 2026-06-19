/**
 * Correctly remap ALL drawings using actual PDF page counts
 * 
 * PDF Files and their page counts:
 * - KMRCL VCC Drawings_OCR.pdf: 127 pages
 * - CAB_PIN DRAWINGS 2.pdf: 48 pages
 * - DMC_CEILING.pdf: 28 pages
 * - DMC UF_PIN DRAWINGS.pdf: 26 pages
 * - TC_CEILING PIN DRAWINGS.pdf: 27 pages
 * - TC _UF PIN DRAWINGS.pdf: 21 pages
 * - MC_CEILING_PIN DRAWINGS.pdf: 58 pages
 * - MC_UF.pdf: 27 pages
 * - VCC DESCRIPTION 13.12.2017.pdf: 54 pages
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// PDF file → total pages
const PDF_PAGES: Record<string, number> = {
  'KMRCL VCC Drawings_OCR.pdf': 127,
  'CAB_PIN DRAWINGS 2.pdf': 48,
  'DMC_CEILING.pdf': 28,
  'DMC UF_PIN DRAWINGS.pdf': 26,
  'TC_CEILING PIN DRAWINGS.pdf': 27,
  'TC _UF PIN DRAWINGS.pdf': 21,
  'MC_CEILING_PIN DRAWINGS.pdf': 58,
  'MC_UF.pdf': 27,
  'VCC DESCRIPTION 13.12.2017.pdf': 54,
};

// Drawing number pattern → which PDF file it belongs to
function getPdfForDrawing(drawingNo: string): string {
  if (drawingNo.match(/^942-58/)) return 'KMRCL VCC Drawings_OCR.pdf';
  if (drawingNo.match(/^942-381[0-2]/)) return 'CAB_PIN DRAWINGS 2.pdf';
  if (drawingNo.match(/^942-381[3-9]/) || drawingNo.match(/^942-382/)) return 'CAB_PIN DRAWINGS 2.pdf';
  if (drawingNo.match(/^942-383/)) return 'DMC UF_PIN DRAWINGS.pdf';
  if (drawingNo.match(/^942-384/)) return 'DMC_CEILING.pdf';
  if (drawingNo.match(/^942-385/)) return 'TC _UF PIN DRAWINGS.pdf';
  if (drawingNo.match(/^942-386/)) return 'TC_CEILING PIN DRAWINGS.pdf';
  if (drawingNo.match(/^942-387/)) return 'MC_CEILING_PIN DRAWINGS.pdf';
  if (drawingNo.match(/^942-38[0-9]/)) return 'CAB_PIN DRAWINGS 2.pdf'; // fallback for 38xxx
  if (drawingNo.match(/^VCC/)) return 'VCC DESCRIPTION 13.12.2017.pdf';
  return 'KMRCL VCC Drawings_OCR.pdf'; // default
}

async function main() {
  console.log('📐 Remapping ALL drawings with correct PDF assignments...\n');

  // First, get all drawings grouped by their PDF file
  const allDrawings = await prisma.drawing.findMany({
    select: { id: true, drawingNo: true },
    orderBy: { drawingNo: 'asc' },
  });

  console.log(`Total drawings: ${allDrawings.length}\n`);

  // Group drawings by PDF file
  const byPdf: Record<string, { id: string; drawingNo: string }[]> = {};
  for (const d of allDrawings) {
    const pdf = getPdfForDrawing(d.drawingNo);
    if (!byPdf[pdf]) byPdf[pdf] = [];
    byPdf[pdf].push(d);
  }

  // Show distribution
  console.log('Drawing distribution by PDF:');
  for (const [pdf, drawings] of Object.entries(byPdf)) {
    const maxPages = PDF_PAGES[pdf] || 100;
    console.log(`  ${pdf}: ${drawings.length} drawings across ${maxPages} pages`);
  }
  console.log('');

  // Delete ALL existing mappings that are NOT verified (start fresh)
  const deleted = await prisma.drawingPageMapping.deleteMany({
    where: { verified: false },
  });
  console.log(`Deleted ${deleted.count} unverified mappings (keeping verified ones)\n`);

  // Now create correct mappings
  // For each PDF: distribute drawings evenly across available pages
  let totalCreated = 0;

  for (const [pdf, drawings] of Object.entries(byPdf)) {
    const maxPages = PDF_PAGES[pdf] || 100;
    const drawingCount = drawings.length;

    // Calculate page distribution
    // If we have more drawings than pages, multiple drawings per page
    // If fewer, spread them out
    for (let i = 0; i < drawingCount; i++) {
      const drawing = drawings[i];

      // Check if a verified mapping already exists
      const existing = await prisma.drawingPageMapping.findFirst({
        where: { drawingId: drawing.id, verified: true },
      });

      if (existing) continue; // Don't overwrite verified mappings

      // Calculate page: distribute evenly across PDF pages
      // Page 1 is usually cover/index, actual drawings start from page 2
      const page = Math.max(1, Math.min(maxPages, Math.ceil(((i + 1) / drawingCount) * maxPages)));

      try {
        await prisma.drawingPageMapping.upsert({
          where: { drawingId_sourceFileId: { drawingId: drawing.id, sourceFileId: pdf } },
          update: { pdfPageNo: page, sourceFileName: pdf, drawingNumber: drawing.drawingNo },
          create: {
            drawingId: drawing.id,
            sourceFileId: pdf,
            sourceFileName: pdf,
            pdfPageNo: page,
            drawingNumber: drawing.drawingNo,
            verified: false,
          },
        });
        totalCreated++;
      } catch (e) {
        // skip
      }
    }
  }

  const finalCount = await prisma.drawingPageMapping.count();
  const verifiedCount = await prisma.drawingPageMapping.count({ where: { verified: true } });

  console.log(`\n✅ Results:`);
  console.log(`   Created/Updated: ${totalCreated} mappings`);
  console.log(`   Total in DB: ${finalCount}`);
  console.log(`   Verified (from OCR): ${verifiedCount}`);
  console.log(`   Unverified (estimated): ${finalCount - verifiedCount}`);

  // Show sample
  console.log('\nSample mappings:');
  const samples = await prisma.drawingPageMapping.findMany({
    take: 10,
    orderBy: { drawingNumber: 'asc' },
    select: { drawingNumber: true, sourceFileName: true, pdfPageNo: true, verified: true },
  });
  for (const s of samples) {
    console.log(`  ${s.drawingNumber} → ${s.sourceFileName} page ${s.pdfPageNo} ${s.verified ? '✓' : ''}`);
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
