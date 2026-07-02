import { prisma } from '../src/lib/prisma';

/**
 * VERIFIED PDF Page Mappings
 * Extracted from actual PDF content using pdftotext
 * Each entry: { drawingNo, sourceFile, pdfPageNo }
 */
const VERIFIED_MAPPINGS = [
  // CAB_PIN DRAWINGS 2.pdf
  { drawingNo: '942-38104', sourceFile: 'CAB_PIN DRAWINGS 2.pdf', pdfPageNo: 9 },
  { drawingNo: '942-38105', sourceFile: 'CAB_PIN DRAWINGS 2.pdf', pdfPageNo: 16 },
  { drawingNo: '942-38108', sourceFile: 'CAB_PIN DRAWINGS 2.pdf', pdfPageNo: 24 },
  { drawingNo: '942-38109', sourceFile: 'CAB_PIN DRAWINGS 2.pdf', pdfPageNo: 27 },
  { drawingNo: '942-38119', sourceFile: 'CAB_PIN DRAWINGS 2.pdf', pdfPageNo: 35 },

  // DMC UF_PIN DRAWINGS.pdf
  { drawingNo: '942-38310', sourceFile: 'DMC UF_PIN DRAWINGS.pdf', pdfPageNo: 8 },
  { drawingNo: '942-38312', sourceFile: 'DMC UF_PIN DRAWINGS.pdf', pdfPageNo: 11 },
  { drawingNo: '942-38314', sourceFile: 'DMC UF_PIN DRAWINGS.pdf', pdfPageNo: 15 },

  // DMC_CEILING.pdf
  { drawingNo: '942-38209', sourceFile: 'DMC_CEILING.pdf', pdfPageNo: 14 },
  { drawingNo: '942-38212', sourceFile: 'DMC_CEILING.pdf', pdfPageNo: 22 },
  { drawingNo: '942-38214', sourceFile: 'DMC_CEILING.pdf', pdfPageNo: 24 },
  { drawingNo: '942-38217', sourceFile: 'DMC_CEILING.pdf', pdfPageNo: 28 },

  // TC _UF PIN DRAWINGS.pdf
  { drawingNo: '942-38506', sourceFile: 'TC _UF PIN DRAWINGS.pdf', pdfPageNo: 3 },
  { drawingNo: '942-38518', sourceFile: 'TC _UF PIN DRAWINGS.pdf', pdfPageNo: 18 },
  { drawingNo: '942-38519', sourceFile: 'TC _UF PIN DRAWINGS.pdf', pdfPageNo: 19 },

  // TC_CEILING PIN DRAWINGS.pdf
  { drawingNo: '942-38408', sourceFile: 'TC_CEILING PIN DRAWINGS.pdf', pdfPageNo: 16 },

  // MC_UF.pdf
  { drawingNo: '942-38101', sourceFile: 'MC_UF.pdf', pdfPageNo: 6 },
  { drawingNo: '942-38105', sourceFile: 'MC_UF.pdf', pdfPageNo: 1 },
  { drawingNo: '942-38106', sourceFile: 'MC_UF.pdf', pdfPageNo: 3 },
  { drawingNo: '942-38109', sourceFile: 'MC_UF.pdf', pdfPageNo: 7 },
  { drawingNo: '942-38110', sourceFile: 'MC_UF.pdf', pdfPageNo: 8 },
  { drawingNo: '942-38111', sourceFile: 'MC_UF.pdf', pdfPageNo: 9 },
  { drawingNo: '942-38112', sourceFile: 'MC_UF.pdf', pdfPageNo: 10 },
  { drawingNo: '942-38114', sourceFile: 'MC_UF.pdf', pdfPageNo: 13 },
  { drawingNo: '942-38115', sourceFile: 'MC_UF.pdf', pdfPageNo: 14 },
  { drawingNo: '942-38116', sourceFile: 'MC_UF.pdf', pdfPageNo: 15 },
  { drawingNo: '942-38118', sourceFile: 'MC_UF.pdf', pdfPageNo: 18 },
  { drawingNo: '942-38119', sourceFile: 'MC_UF.pdf', pdfPageNo: 19 },
  { drawingNo: '942-38120', sourceFile: 'MC_UF.pdf', pdfPageNo: 20 },
  { drawingNo: '942-38121', sourceFile: 'MC_UF.pdf', pdfPageNo: 22 },
  { drawingNo: '942-38122', sourceFile: 'MC_UF.pdf', pdfPageNo: 23 },
  { drawingNo: '942-38123', sourceFile: 'MC_UF.pdf', pdfPageNo: 24 },
  { drawingNo: '942-38124', sourceFile: 'MC_UF.pdf', pdfPageNo: 25 },

  // MC_CEILING_PIN DRAWINGS.pdf
  { drawingNo: '942-38604', sourceFile: 'MC_CEILING_PIN DRAWINGS.pdf', pdfPageNo: 3 },
  { drawingNo: '942-38609', sourceFile: 'MC_CEILING_PIN DRAWINGS.pdf', pdfPageNo: 16 },
  { drawingNo: '942-38610', sourceFile: 'MC_CEILING_PIN DRAWINGS.pdf', pdfPageNo: 20 },
];

async function main() {
  console.log('=== UPDATING VERIFIED PDF PAGE MAPPINGS ===\n');

  let updated = 0;
  let created = 0;
  let skipped = 0;

  for (const mapping of VERIFIED_MAPPINGS) {
    // Find the drawing
    const drawing = await prisma.drawing.findFirst({
      where: { drawingNo: mapping.drawingNo },
      select: { id: true, drawingNo: true },
    });

    if (!drawing) {
      console.log(`  SKIP: ${mapping.drawingNo} - drawing not found in database`);
      skipped++;
      continue;
    }

    // Check if mapping already exists
    const existing = await prisma.drawingPageMapping.findFirst({
      where: {
        drawingId: drawing.id,
        sourceFileName: mapping.sourceFile,
      },
    });

    if (existing) {
      // Update existing mapping
      if (existing.pdfPageNo !== mapping.pdfPageNo || !existing.verified) {
        await prisma.drawingPageMapping.update({
          where: { id: existing.id },
          data: {
            pdfPageNo: mapping.pdfPageNo,
            verified: true,
            confidence: 1.0,
            verificationDate: new Date(),
            notes: `Verified via pdftotext content extraction`,
          },
        });
        console.log(`  UPDATED: ${mapping.drawingNo} -> Page ${mapping.pdfPageNo} in ${mapping.sourceFile}`);
        updated++;
      } else {
        console.log(`  OK: ${mapping.drawingNo} -> Page ${mapping.pdfPageNo} (already correct)`);
      }
    } else {
      // Create new mapping
      await prisma.drawingPageMapping.create({
        data: {
          drawingId: drawing.id,
          sourceFileName: mapping.sourceFile,
          pdfPageNo: mapping.pdfPageNo,
          drawingNumber: mapping.drawingNo,
          verified: true,
          confidence: 1.0,
          verificationDate: new Date(),
          notes: `Verified via pdftotext content extraction`,
        },
      });
      console.log(`  CREATED: ${mapping.drawingNo} -> Page ${mapping.pdfPageNo} in ${mapping.sourceFile}`);
      created++;
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Created: ${created}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Total: ${updated + created + skipped}`);

  // Verify the key fix
  console.log('\n=== VERIFYING KEY FIX: 942-38109 ===');
  const testMapping = await prisma.drawingPageMapping.findFirst({
    where: {
      drawing: { drawingNo: '942-38109' },
      sourceFileName: 'CAB_PIN DRAWINGS 2.pdf',
    },
  });
  if (testMapping) {
    console.log(`  942-38109 -> Page ${testMapping.pdfPageNo} in CAB_PIN DRAWINGS 2.pdf (verified=${testMapping.verified})`);
  } else {
    console.log('  WARNING: Mapping not found!');
  }

  await prisma.$disconnect();
}

main().catch(console.error);
