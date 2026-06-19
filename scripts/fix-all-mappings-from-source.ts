/**
 * Fix ALL drawing page mappings using SourcePage data
 * The SourcePage table knows EXACTLY which drawing is on which page of which PDF
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('📐 Fixing ALL mappings from SourcePage data...\n');

  // Get all source pages that have a drawingNo assigned
  const sourcePages = await prisma.sourcePage.findMany({
    where: { drawingNo: { not: null } },
    select: {
      drawingNo: true,
      pageNo: true,
      sourceFile: { select: { filename: true } },
    },
    orderBy: [{ sourceFile: { filename: 'asc' } }, { pageNo: 'asc' }],
  });

  console.log(`Found ${sourcePages.length} source pages with drawing numbers\n`);

  // Group by file for reporting
  const byFile: Record<string, number> = {};
  for (const sp of sourcePages) {
    const f = sp.sourceFile.filename;
    byFile[f] = (byFile[f] || 0) + 1;
  }
  console.log('Distribution:');
  for (const [file, count] of Object.entries(byFile)) {
    console.log(`  ${file}: ${count} pages`);
  }
  console.log('');

  // Now update DrawingPageMapping for each
  let updated = 0, created = 0, notFound = 0;

  for (const sp of sourcePages) {
    if (!sp.drawingNo) continue;
    const filename = sp.sourceFile.filename;

    // Find the drawing in the database
    const drawing = await prisma.drawing.findFirst({
      where: { drawingNo: sp.drawingNo },
    });

    if (!drawing) {
      notFound++;
      continue;
    }

    // Upsert the correct mapping
    try {
      const existing = await prisma.drawingPageMapping.findFirst({
        where: { drawingId: drawing.id, sourceFileName: filename },
      });

      if (existing) {
        await prisma.drawingPageMapping.update({
          where: { id: existing.id },
          data: { pdfPageNo: sp.pageNo, verified: true },
        });
        updated++;
      } else {
        await prisma.drawingPageMapping.create({
          data: {
            drawingId: drawing.id,
            sourceFileId: filename,
            sourceFileName: filename,
            pdfPageNo: sp.pageNo,
            drawingNumber: sp.drawingNo,
            verified: true,
          },
        });
        created++;
      }
    } catch (e) {
      // skip duplicates
    }
  }

  const total = await prisma.drawingPageMapping.count();
  const verified = await prisma.drawingPageMapping.count({ where: { verified: true } });

  console.log(`\n✅ Results:`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Created: ${created}`);
  console.log(`   Not found in Drawing table: ${notFound}`);
  console.log(`   Total mappings: ${total}`);
  console.log(`   Verified (from SourcePage): ${verified}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
