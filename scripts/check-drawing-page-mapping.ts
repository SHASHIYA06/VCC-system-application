import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDrawing() {
  try {
    console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║            CHECK DRAWING PAGE MAPPING - 942-58120                         ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

    // Get the drawing
    const drawing = await prisma.drawing.findFirst({
      where: { drawingNo: '942-58120' },
      include: {
        pages: true,
        pageMappings: true,
        connectors: {
          include: { pins: true }
        },
        system: true
      }
    });

    if (!drawing) {
      console.log('❌ Drawing 942-58120 not found');
      return;
    }

    console.log(`\n📋 Drawing: ${drawing.drawingNo} (Rev ${drawing.revision})`);
    console.log(`   Title: ${drawing.title}`);
    console.log(`   System: ${drawing.system?.code || 'UNKNOWN'}`);
    console.log(`   Status: ${drawing.status}`);
    console.log(`\n📄 Page Information:`);
    console.log(`   Declared pages: ${drawing.totalSheets}`);
    console.log(`   Actual pages in DB: ${drawing.pages.length}`);
    console.log(`   Page mappings: ${drawing.pageMappings.length}`);

    if (drawing.pages.length > 0) {
      console.log(`\n   Page Details:`);
      drawing.pages.forEach((page: any, idx: number) => {
        console.log(`     Page ${idx + 1}:`);
        console.log(`       - pageNo: ${page.pageNo}`);
        console.log(`       - pageLabel: ${page.pageLabel || 'N/A'}`);
        console.log(`       - parseStatus: ${page.parseStatus}`);
      });
    }

    if (drawing.pageMappings.length > 0) {
      console.log(`\n   Page Mappings:`);
      drawing.pageMappings.forEach((mapping: any) => {
        console.log(`     - PDF Page ${mapping.pdfPageNo} → Drawing ${mapping.drawingNumber}`);
        console.log(`       sourceFileName: ${mapping.sourceFileName}`);
        console.log(`       verified: ${mapping.verified}`);
        console.log(`       confidence: ${mapping.confidence}`);
      });
    } else {
      console.log(`\n   ⚠️  NO PAGE MAPPINGS FOUND!`);
    }

    console.log(`\n🔧 Connector Configuration:`);
    console.log(`   Connectors: ${drawing.connectors.length}`);
    if (drawing.connectors.length > 0) {
      drawing.connectors.forEach((conn: any) => {
        console.log(`   - ${conn.connectorCode}: ${conn.pins.length} pins`);
      });
    }

    console.log(`\n⚠️  ANALYSIS:`);
    console.log(`   When you click to open the PDF for 942-58120, it shows the cover page`);
    console.log(`   instead of the actual drawing (Page 21).`);
    
    if (drawing.pageMappings.length === 0) {
      console.log(`\n   ROOT CAUSE: No page mappings exist!`);
      console.log(`   The system doesn't know which PDF page corresponds to which drawing.`);
      console.log(`   This is why it defaults to the first page (cover page).`);
    } else {
      console.log(`\n   The page mappings are set, but they may be pointing to wrong pages.`);
      console.log(`   Check if the pdfPageNo values match the actual PDF structure.`);
    }

  } catch (error) {
    console.error(`Error: ${error}`);
  } finally {
    await prisma.$disconnect();
  }
}

checkDrawing();
