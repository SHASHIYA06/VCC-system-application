/**
 * PDF Mapping Verification Script
 * 
 * Verifies that all drawings have correct PDF page mappings.
 * 
 * Usage: npx tsx scripts/verify-pdf-mappings.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyPdfMappings(): Promise<void> {
  console.log('🔍 Verifying PDF Mappings...\n');
  
  try {
    // Get all drawings
    const drawings = await prisma.drawing.findMany({
      select: {
        id: true,
        drawingNo: true,
        sourceFileId: true,
        pages: {
          select: {
            id: true,
            pageNo: true,
            extra: true
          }
        }
      },
      orderBy: { drawingNo: 'asc' }
    });

    console.log(`📊 Total Drawings: ${drawings.length}\n`);

    let withMapping = 0;
    let withoutMapping = 0;
    let withSourceFile = 0;
    let withoutSourceFile = 0;

    const pdfDistribution: Record<string, number> = {};
    const unmappedDrawings: string[] = [];

    for (const drawing of drawings) {
      const hasPage = drawing.pages.length > 0;
      const hasMapping = hasPage && drawing.pages[0].extra?.pdfPageNo;
      const hasPdfFile = drawing.pages[0]?.extra?.pdfFile;

      if (hasMapping) {
        withMapping++;
        const pdfFile = hasPdfFile || drawing.sourceFileId || 'UNKNOWN';
        pdfDistribution[pdfFile] = (pdfDistribution[pdfFile] || 0) + 1;
      } else {
        withoutMapping++;
        unmappedDrawings.push(drawing.drawingNo);
      }

      if (drawing.sourceFileId) {
        withSourceFile++;
      } else {
        withoutSourceFile++;
      }
    }

    console.log('📈 Statistics:');
    console.log(`   With PDF Mapping: ${withMapping} (${((withMapping / drawings.length) * 100).toFixed(2)}%)`);
    console.log(`   Without PDF Mapping: ${withoutMapping} (${((withoutMapping / drawings.length) * 100).toFixed(2)}%)`);
    console.log(`   With Source File: ${withSourceFile}`);
    console.log(`   Without Source File: ${withoutSourceFile}\n`);

    console.log('📁 Distribution by PDF File:');
    for (const [pdf, count] of Object.entries(pdfDistribution).sort((a, b) => b[1] - a[1])) {
      console.log(`   ${pdf}: ${count}`);
    }

    if (unmappedDrawings.length > 0) {
      console.log(`\n⚠️  Unmapped Drawings (${unmappedDrawings.length}):`);
      for (const drawing of unmappedDrawings.slice(0, 20)) {
        console.log(`   ${drawing}`);
      }
      if (unmappedDrawings.length > 20) {
        console.log(`   ... and ${unmappedDrawings.length - 20} more`);
      }
    }

    console.log('\n' + '='.repeat(60));
    if (withoutMapping === 0) {
      console.log('✅ SUCCESS: All drawings have PDF mappings!');
    } else {
      console.log(`⚠️  ${withoutMapping} drawings still need mapping`);
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  }
}

// Run verification
verifyPdfMappings()
  .then(() => {
    console.log('\n✅ Verification completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
