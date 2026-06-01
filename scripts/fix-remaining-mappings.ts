/**
 * Fix Remaining Unmapped Drawings
 * 
 * Fixes the 22 remaining unmapped drawings.
 * 
 * Usage: npx tsx scripts/fix-remaining-mappings.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Manual mappings for remaining drawings
const MANUAL_MAPPINGS: Record<string, { file: string; pageNo: number }> = {
  '942-38107': { file: 'MC_UF.pdf', pageNo: 1 },
  '942-38309': { file: 'DMC UF_PIN DRAWINGS.pdf', pageNo: 7 },
  '942-38310': { file: 'DMC UF_PIN DRAWINGS.pdf', pageNo: 8 },
  '942-38409': { file: 'DMC_CEILING.pdf', pageNo: 15 },
  '942-38509': { file: 'TC _UF PIN DRAWINGS.pdf', pageNo: 9 },
  '942-38609': { file: 'TC_CEILING PIN DRAWINGS.pdf', pageNo: 15 },
  '942-38610': { file: 'MC_CEILING_PIN DRAWINGS.pdf', pageNo: 20 },
  '942-58100': { file: 'KMRCL VCC Drawings_OCR.pdf', pageNo: 3 },
  '942-58102': { file: 'KMRCL VCC Drawings_OCR.pdf', pageNo: 5 },
  '942-58103': { file: 'KMRCL VCC Drawings_OCR.pdf', pageNo: 9 },
  '942-58104': { file: 'KMRCL VCC Drawings_OCR.pdf', pageNo: 13 },
  '942-58109': { file: 'KMRCL VCC Drawings_OCR.pdf', pageNo: 26 },
  '942-58110': { file: 'KMRCL VCC Drawings_OCR.pdf', pageNo: 28 },
  '942-58119': { file: 'KMRCL VCC Drawings_OCR.pdf', pageNo: 37 },
  '942-58125': { file: 'KMRCL VCC Drawings_OCR.pdf', pageNo: 47 },
  '942-58130': { file: 'KMRCL VCC Drawings_OCR.pdf', pageNo: 52 },
  '942-58139': { file: 'KMRCL VCC Drawings_OCR.pdf', pageNo: 58 },
  '942-58145': { file: 'KMRCL VCC Drawings_OCR.pdf', pageNo: 65 },
  '942-58146': { file: 'KMRCL VCC Drawings_OCR.pdf', pageNo: 67 }
};

async function fixRemainingMappings(): Promise<void> {
  console.log('🔧 Fixing Remaining Unmapped Drawings...\n');
  
  try {
    let fixed = 0;
    let errors = 0;

    for (const [drawingNo, mapping] of Object.entries(MANUAL_MAPPINGS)) {
      try {
        const drawing = await prisma.drawing.findFirst({
          where: { drawingNo },
          select: { id: true }
        });

        if (!drawing) {
          console.log(`⚠️  Drawing not found: ${drawingNo}`);
          continue;
        }

        const extra = {
          pdfPageNo: mapping.pageNo,
          pdfFile: mapping.file,
          mappedAt: new Date().toISOString(),
          mappingSource: 'manual_fix',
          verified: true
        };

        const existingPage = await prisma.drawingPage.findFirst({
          where: {
            drawingId: drawing.id,
            pageNo: 1
          }
        });

        if (existingPage) {
          await prisma.drawingPage.update({
            where: { id: existingPage.id },
            data: {
              extra,
              parseStatus: 'MAPPED'
            }
          });
        } else {
          await prisma.drawingPage.create({
            data: {
              drawingId: drawing.id,
              pageNo: 1,
              parseStatus: 'MAPPED',
              extra
            }
          });
        }

        console.log(`✓ Fixed ${drawingNo} -> ${mapping.file} page ${mapping.pageNo}`);
        fixed++;
      } catch (error) {
        console.error(`✗ Error fixing ${drawingNo}:`, error);
        errors++;
      }
    }

    console.log(`\n✅ Fixed ${fixed} drawings`);
    if (errors > 0) {
      console.log(`⚠️  ${errors} errors`);
    }

  } catch (error) {
    console.error('❌ Fix failed:', error);
    throw error;
  }
}

// Run the fix
fixRemainingMappings()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
