import { prisma } from '../src/lib/prisma';

/**
 * FIX ALL KMRCL VCC Drawings_OCR.pdf PAGE MAPPINGS
 * Verified via pdftotext content extraction from all 127 pages
 */
const VERIFIED_OCR_MAPPINGS = [
  { drawingNo: '942-58099', pdfPageNo: 2 },
  { drawingNo: '942-58100', pdfPageNo: 3 },
  { drawingNo: '942-58101', pdfPageNo: 4 },
  { drawingNo: '942-58102', pdfPageNo: 5 },
  { drawingNo: '942-58103', pdfPageNo: 9 },
  { drawingNo: '942-58104', pdfPageNo: 13 },
  { drawingNo: '942-58105', pdfPageNo: 21 },
  { drawingNo: '942-58106', pdfPageNo: 22 },
  { drawingNo: '942-58108', pdfPageNo: 24 },
  { drawingNo: '942-58109', pdfPageNo: 26 },
  { drawingNo: '942-58110', pdfPageNo: 27 },
  { drawingNo: '942-58111', pdfPageNo: 29 },
  { drawingNo: '942-58112', pdfPageNo: 30 },
  { drawingNo: '942-58113', pdfPageNo: 31 },
  { drawingNo: '942-58114', pdfPageNo: 32 },
  { drawingNo: '942-58115', pdfPageNo: 33 },
  { drawingNo: '942-58116', pdfPageNo: 34 },
  { drawingNo: '942-58119', pdfPageNo: 36 },
  { drawingNo: '942-58120', pdfPageNo: 38 },
  { drawingNo: '942-58121', pdfPageNo: 39 },
  { drawingNo: '942-58123', pdfPageNo: 40 },
  { drawingNo: '942-58125', pdfPageNo: 43 },
  { drawingNo: '942-58126', pdfPageNo: 44 },
  { drawingNo: '942-58128', pdfPageNo: 46 },
  { drawingNo: '942-58130', pdfPageNo: 48 },
  { drawingNo: '942-58131', pdfPageNo: 50 },
  { drawingNo: '942-58132', pdfPageNo: 51 },
  { drawingNo: '942-58138', pdfPageNo: 54 },
  { drawingNo: '942-58139', pdfPageNo: 55 },
  { drawingNo: '942-58140', pdfPageNo: 57 },
  { drawingNo: '942-58141', pdfPageNo: 58 },
  { drawingNo: '942-58143', pdfPageNo: 60 },
  { drawingNo: '942-58144', pdfPageNo: 61 },
  { drawingNo: '942-58146', pdfPageNo: 64 },
  { drawingNo: '942-58148', pdfPageNo: 69 },
  { drawingNo: '942-58149', pdfPageNo: 70 },
  { drawingNo: '942-58150', pdfPageNo: 71 },
  { drawingNo: '942-58151', pdfPageNo: 72 },
  { drawingNo: '942-58152', pdfPageNo: 73 },
  { drawingNo: '942-58154', pdfPageNo: 79 },
];

const SOURCE_FILE = 'KMRCL VCC Drawings_OCR.pdf';

async function main() {
  console.log('=== FIXING KMRCL VCC OCR PAGE MAPPINGS ===\n');

  let updated = 0;
  let created = 0;
  let skipped = 0;

  for (const mapping of VERIFIED_OCR_MAPPINGS) {
    const drawing = await prisma.drawing.findFirst({
      where: { drawingNo: mapping.drawingNo },
      select: { id: true, drawingNo: true },
    });

    if (!drawing) {
      console.log(`  SKIP: ${mapping.drawingNo} - not in database`);
      skipped++;
      continue;
    }

    const existing = await prisma.drawingPageMapping.findFirst({
      where: {
        drawingId: drawing.id,
        sourceFileName: SOURCE_FILE,
      },
    });

    if (existing) {
      if (existing.pdfPageNo !== mapping.pdfPageNo || !existing.verified) {
        const oldPage = existing.pdfPageNo;
        await prisma.drawingPageMapping.update({
          where: { id: existing.id },
          data: {
            pdfPageNo: mapping.pdfPageNo,
            verified: true,
            confidence: 1.0,
            verificationDate: new Date(),
            notes: `Verified: page ${oldPage} → page ${mapping.pdfPageNo} via pdftotext`,
          },
        });
        console.log(`  FIXED: ${mapping.drawingNo} page ${oldPage} → ${mapping.pdfPageNo}`);
        updated++;
      } else {
        console.log(`  OK: ${mapping.drawingNo} page ${mapping.pdfPageNo}`);
      }
    } else {
      await prisma.drawingPageMapping.create({
        data: {
          drawingId: drawing.id,
          sourceFileName: SOURCE_FILE,
          pdfPageNo: mapping.pdfPageNo,
          drawingNumber: mapping.drawingNo,
          verified: true,
          confidence: 1.0,
          verificationDate: new Date(),
          notes: `Verified via pdftotext content extraction`,
        },
      });
      console.log(`  CREATED: ${mapping.drawingNo} page ${mapping.pdfPageNo}`);
      created++;
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`  Fixed: ${updated}`);
  console.log(`  Created: ${created}`);
  console.log(`  Skipped: ${skipped}`);

  // Verify key fix
  console.log('\n=== VERIFY: 942-58121 ===');
  const test = await prisma.drawingPageMapping.findFirst({
    where: {
      drawing: { drawingNo: '942-58121' },
      sourceFileName: SOURCE_FILE,
    },
  });
  console.log(`  942-58121 → Page ${test?.pdfPageNo} (verified=${test?.verified})`);

  await prisma.$disconnect();
}

main().catch(console.error);
