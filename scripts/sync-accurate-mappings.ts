/**
 * Sync ACCURATE_DRAWING_PAGE_MAPPINGS into the database
 * Run: npx tsx scripts/sync-accurate-mappings.ts
 */
import { PrismaClient } from '@prisma/client';
import { ALL_DRAWING_MAPPINGS } from '../ACCURATE_DRAWING_PAGE_MAPPINGS';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Syncing accurate drawing-to-PDF page mappings...\n');

  const mappings = Object.values(ALL_DRAWING_MAPPINGS);
  console.log(`📊 Total mappings to sync: ${mappings.length}\n`);

  let synced = 0, skipped = 0, notFound = 0;

  for (const mapping of mappings) {
    // Find drawing in database
    const drawing = await prisma.drawing.findFirst({
      where: { drawingNo: mapping.drawingNumber },
    });

    if (!drawing) {
      notFound++;
      continue;
    }

    try {
      // Upsert the mapping
      await prisma.drawingPageMapping.upsert({
        where: {
          drawingId_sourceFileId: {
            drawingId: drawing.id,
            sourceFileId: mapping.pdfFile,
          },
        },
        update: {
          pdfPageNo: mapping.pageNumber,
          sourceFileName: mapping.pdfFile,
          drawingNumber: mapping.drawingNumber,
          verified: mapping.verified,
          notes: mapping.notes || null,
        },
        create: {
          drawingId: drawing.id,
          sourceFileId: mapping.pdfFile,
          sourceFileName: mapping.pdfFile,
          pdfPageNo: mapping.pageNumber,
          drawingNumber: mapping.drawingNumber,
          verified: mapping.verified,
          notes: mapping.notes || null,
        },
      });
      synced++;
    } catch (e) {
      skipped++;
    }
  }

  console.log(`✅ Synced: ${synced}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Not found in DB: ${notFound}`);
  console.log(`\n📊 Total DrawingPageMapping records: ${await prisma.drawingPageMapping.count()}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
