
#!/usr/bin/env npx tsx
/**
 * Fix duplicate page mappings in the database.
 * 
 * Problem: Multiple seed scripts created conflicting page mappings for the same drawing.
 * Some drawings have TWO mappings pointing to different pages in the same PDF.
 * 
 * Fix: Keep the CORRECT mapping, remove the INCORRECT one.
 * 
 * How to determine which is correct:
 * - The ACCURATE_DRAWING_PAGE_MAPPINGS.ts file is the source of truth
 * - If a drawing has the correct page in the ACCURATE file, keep that one
 * - If not, keep the one that matches the seed-complete.ts title/structure
 * 
 * Usage: npx tsx scripts/fix-duplicate-page-mappings.ts
 */

import { PrismaClient } from '@prisma/client';
import { ALL_DRAWING_MAPPINGS_MULTI } from '../ACCURATE_DRAWING_PAGE_MAPPINGS';

const prisma = new PrismaClient();

async function main() {
  console.log('=== FIXING DUPLICATE PAGE MAPPINGS ===\n');

  // Find all drawings with multiple page mappings
  const allMappings = await prisma.drawingPageMapping.findMany({
    orderBy: { drawingNumber: 'asc' },
  });

  const byDrawingNo = new Map<string, typeof allMappings>();
  for (const m of allMappings) {
    if (!byDrawingNo.has(m.drawingNumber)) byDrawingNo.set(m.drawingNumber, []);
    byDrawingNo.get(m.drawingNumber)!.push(m);
  }

  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const [drawingNo, mappings] of byDrawingNo) {
    if (mappings.length <= 1) continue;

    // Check if mappings are for the same PDF file
    const samePdf = mappings.filter(m => m.sourceFileName === mappings[0].sourceFileName);
    if (samePdf.length <= 1) continue;

    console.log(`\nCONFLICT: ${drawingNo} has ${samePdf.length} mappings in ${samePdf[0].sourceFileName}:`);
    for (const m of samePdf) {
      console.log(`  id=${m.id} page=${m.pdfPageNo} verified=${m.verified}`);
    }

    // Check ACCURATE file for correct page
    const accurateMappings = ALL_DRAWING_MAPPINGS_MULTI[drawingNo] || [];
    const accuratePage = accurateMappings.find(m => m.pdfFile === samePdf[0].sourceFileName)?.pageNumber;

    if (accuratePage) {
      console.log(`  ACCURATE file says: page ${accuratePage}`);
      
      // Find which DB mapping matches the ACCURATE page
      const correctMapping = samePdf.find(m => m.pdfPageNo === accuratePage);
      const incorrectMappings = samePdf.filter(m => m.pdfPageNo !== accuratePage);

      if (correctMapping && incorrectMappings.length > 0) {
        console.log(`  KEEPING: page ${correctMapping.pdfPageNo}`);
        for (const m of incorrectMappings) {
          console.log(`  REMOVING: page ${m.pdfPageNo}`);
          try {
            await prisma.drawingPageMapping.delete({ where: { id: m.id } });
            fixed++;
          } catch (err) {
            console.log(`  ERROR deleting: ${err}`);
            errors++;
          }
        }
      } else {
        console.log(`  No correct mapping found in DB, skipping`);
        skipped++;
      }
    } else {
      // No ACCURATE file entry - use title-based heuristic
      // The newer seed scripts (cmqkp* IDs) tend to be more accurate
      // The older seed scripts (cmqjn* IDs) tend to be wrong
      
      const newerMappings = samePdf.filter(m => m.id.startsWith('cmqkp'));
      const olderMappings = samePdf.filter(m => !m.id.startsWith('cmqkp'));

      if (newerMappings.length > 0 && olderMappings.length > 0) {
        console.log(`  No ACCURATE file entry. Keeping newer mapping (id prefix cmqkp)`);
        for (const m of olderMappings) {
          console.log(`  REMOVING older: page ${m.pdfPageNo} (id=${m.id})`);
          try {
            await prisma.drawingPageMapping.delete({ where: { id: m.id } });
            fixed++;
          } catch (err) {
            console.log(`  ERROR deleting: ${err}`);
            errors++;
          }
        }
      } else {
        console.log(`  Cannot determine correct mapping, skipping`);
        skipped++;
      }
    }
  }

  // Also fix 942-58136 specifically (pages 1 and 37, should be page 37 based on seed-complete.ts)
  console.log('\n\n--- Special case: 942-58136 (Door Operation Left) ---');
  const m58136 = await prisma.drawingPageMapping.findMany({ where: { drawingNumber: '942-58136' } });
  if (m58136.length > 1) {
    // 942-58136 is "Door Operation Left" which should NOT be on page 1 (that's the cover)
    const page1Mapping = m58136.find(m => m.pdfPageNo === 1);
    const page37Mapping = m58136.find(m => m.pdfPageNo === 37);
    
    if (page1Mapping) {
      console.log(`  REMOVING: page 1 (cover page - incorrect for Door Operation)`);
      try {
        await prisma.drawingPageMapping.delete({ where: { id: page1Mapping.id } });
        fixed++;
      } catch (err) {
        console.log(`  ERROR: ${err}`);
        errors++;
      }
    }
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`Fixed: ${fixed}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);

  // Verify no more conflicts
  console.log('\n--- Verification ---');
  const remainingMappings = await prisma.drawingPageMapping.findMany();
  const remainingByDrawingNo = new Map<string, typeof remainingMappings>();
  for (const m of remainingMappings) {
    if (!remainingByDrawingNo.has(m.drawingNumber)) remainingByDrawingNo.set(m.drawingNumber, []);
    remainingByDrawingNo.get(m.drawingNumber)!.push(m);
  }

  let conflictsRemaining = 0;
  for (const [drawingNo, ms] of remainingByDrawingNo) {
    const samePdf = ms.filter(m => m.sourceFileName === ms[0].sourceFileName);
    if (samePdf.length > 1) {
      conflictsRemaining++;
      console.log(`  REMAINING CONFLICT: ${drawingNo} - ${samePdf.map(m => 'p.' + m.pdfPageNo).join(', ')}`);
    }
  }
  console.log(`Conflicts remaining: ${conflictsRemaining}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
