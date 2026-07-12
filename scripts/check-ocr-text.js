const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const mappings = await prisma.drawingPageMapping.findMany({
    where: { drawingNumber: '942-38119' }
  });
  
  console.log(`Found ${mappings.length} mappings for 942-38119`);
  
  for (const m of mappings) {
    // Find the OcrPage or SourcePage that matches this filename and page number
    const page = await prisma.sourcePage.findFirst({
      where: {
        sourceFile: { filename: m.sourceFileName },
        pageNo: m.pdfPageNo
      }
    });
    
    console.log(`\nMapping: ${m.sourceFileName} Page ${m.pdfPageNo}`);
    if (page) {
      console.log(`SourcePage drawingNo: ${page.drawingNo}, sheetNo: ${page.sheetNo}`);
      console.log(`OCR Raw Text Snippet:`);
      console.log(page.rawText ? page.rawText.substring(0, 400) : 'No OCR text');
    } else {
      console.log(`No SourcePage entry found`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
