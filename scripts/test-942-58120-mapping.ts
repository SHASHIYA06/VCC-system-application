import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    console.log(`\n✅ TESTING: 942-58120 PDF Mapping\n`);

    const drawing = await prisma.drawing.findFirst({
      where: { drawingNo: '942-58120' },
      include: {
        pageMappings: true,
        pages: true
      }
    });

    if (!drawing) {
      console.log('❌ Drawing 942-58120 not found');
      return;
    }

    console.log(`Drawing: ${drawing.drawingNo} (Rev ${drawing.revision})`);
    console.log(`Title: ${drawing.title}`);
    console.log(`Pages in DB: ${drawing.pages.length}`);
    console.log(`Page Mappings Count: ${drawing.pageMappings.length}\n`);

    if (drawing.pageMappings.length === 0) {
      console.log(`❌ NO PAGE MAPPINGS FOUND FOR 942-58120`);
      console.log(`This explains why the PDF viewer shows the cover page!`);
      console.log(`The system doesn't have mapping data for this drawing.\n`);
      
      // Check if we need to create the mapping
      console.log(`📋 Creating page mapping for 942-58120...`);
      const mapping = await prisma.drawingPageMapping.create({
        data: {
          drawingId: drawing.id,
          sourceFileName: 'KMRCL VCC Drawings_OCR.pdf',
          pdfPageNo: 21,
          drawingNumber: '942-58120',
          verified: true,
          confidence: 95
        }
      });
      
      console.log(`✅ Page mapping created successfully!`);
      console.log(`   PDF Page: ${mapping.pdfPageNo}`);
      console.log(`   Source File: ${mapping.sourceFileName}`);
      console.log(`   Verified: ${mapping.verified}`);
      console.log(`   Now when users open 942-58120, it will show PDF page 21!\n`);
      
    } else {
      console.log(`✅ Page mappings found:\n`);
      drawing.pageMappings.forEach((mapping, idx) => {
        console.log(`Mapping ${idx + 1}:`);
        console.log(`  PDF Page: ${mapping.pdfPageNo}`);
        console.log(`  Source File: ${mapping.sourceFileName}`);
        console.log(`  Drawing: ${mapping.drawingNumber}`);
        console.log(`  Verified: ${mapping.verified}`);
        console.log(`  Confidence: ${mapping.confidence}\n`);
      });
    }

  } catch (error) {
    console.error(`Error: ${error}`);
  } finally {
    await prisma.$disconnect();
  }
}

test();
