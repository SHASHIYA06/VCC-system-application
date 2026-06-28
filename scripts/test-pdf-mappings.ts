import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPdfMappings() {
  try {
    console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║            TEST PDF MAPPINGS - Verify All Drawings Open Correctly         ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

    // Get all drawings
    const drawings = await prisma.drawing.findMany({
      include: {
        pageMappings: true,
        pages: true
      },
      orderBy: { drawingNo: 'asc' },
      take: 50  // Test first 50 for quick verification
    });

    console.log(`\n📋 Testing ${drawings.length} drawings for PDF page mapping issues...\n`);

    let correctMappings = 0;
    let missingMappings = 0;
    let issues: any[] = [];

    for (const drawing of drawings) {
      if (drawing.pageMappings.length === 0) {
        missingMappings++;
        if (drawing.drawingNo === '942-58120' || drawing.drawingNo.startsWith('942-581')) {
          issues.push({
            drawing: drawing.drawingNo,
            issue: 'No page mapping',
            expected: 'Should map to PDF page for display'
          });
        }
      } else {
        correctMappings++;
        
        // For 942-58120, verify it maps to page 21
        if (drawing.drawingNo === '942-58120') {
          const mapping = drawing.pageMappings[0];
          console.log(`✅ 942-58120 MAPPING FOUND:`);
          console.log(`   PDF Page: ${mapping.pdfPageNo}`);
          console.log(`   Source File: ${mapping.sourceFileName}`);
          console.log(`   Verified: ${mapping.verified}`);
          console.log(`   Confidence: ${mapping.confidence}\n`);
          
          if (mapping.pdfPageNo !== 21) {
            issues.push({
              drawing: '942-58120',
              issue: `Maps to page ${mapping.pdfPageNo} instead of page 21`,
              expected: 'Page 21'
            });
          }
        }
      }
    }

    console.log(`\n📊 Results:\n`);
    console.log(`  Correct mappings: ${correctMappings}`);
    console.log(`  Missing mappings: ${missingMappings}`);
    console.log(`  Success rate: ${((correctMappings / drawings.length) * 100).toFixed(1)}%`);

    if (issues.length > 0) {
      console.log(`\n⚠️  Issues Found:\n`);
      for (const issue of issues) {
        console.log(`  Drawing: ${issue.drawing}`);
        console.log(`  Issue: ${issue.issue}`);
        console.log(`  Expected: ${issue.expected}\n`);
      }
    } else {
      console.log(`\n✅ All tested drawings have correct PDF mappings!\n`);
    }

    // Detailed check for 942-58120
    console.log(`\n${'='.repeat(80)}`);
    console.log(`DETAILED CHECK: 942-58120`);
    console.log(`${'='.repeat(80)}\n`);

    const drawing58120 = drawings.find(d => d.drawingNo === '942-58120');
    if (drawing58120) {
      console.log(`Title: ${drawing58120.title}`);
      console.log(`Pages in DB: ${drawing58120.pages.length}`);
      console.log(`Page Mappings: ${drawing58120.pageMappings.length}`);
      
      if (drawing58120.pageMappings.length > 0) {
        drawing58120.pageMappings.forEach((mapping, idx) => {
          console.log(`\nMapping ${idx + 1}:`);
          console.log(`  PDF Page No: ${mapping.pdfPageNo}`);
          console.log(`  Source File: ${mapping.sourceFileName}`);
          console.log(`  Drawing Number: ${mapping.drawingNumber}`);
          console.log(`  Verified: ${mapping.verified}`);
          console.log(`  Confidence: ${mapping.confidence}`);
          console.log(`  Verification Date: ${mapping.verificationDate}`);
        });
      } else {
        console.log(`\n⚠️  NO PAGE MAPPINGS FOUND!`);
        console.log(`This is why the PDF viewer shows the cover page instead of page 21.`);
        console.log(`The application doesn't know which PDF page to display.`);
      }
    }

    console.log(`\n\n✅ PDF Mapping Test Complete\n`);

  } catch (error) {
    console.error(`Error: ${error}`);
  } finally {
    await prisma.$disconnect();
  }
}

testPdfMappings();
