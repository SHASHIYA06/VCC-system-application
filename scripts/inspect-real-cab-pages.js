const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Let's find the source file first
  const file = await prisma.sourceFile.findFirst({
    where: { filename: 'CAB_PIN DRAWINGS 2.pdf' }
  });
  
  if (!file) {
    console.error('File not found');
    return;
  }
  
  console.log(`Found file: ${file.filename} (ID: ${file.id})`);
  
  const pages = await prisma.sourcePage.findMany({
    where: {
      sourceFileId: file.id,
      pageNo: { gte: 25, lte: 40 }
    },
    orderBy: { pageNo: 'asc' }
  });
  
  console.log(`Found ${pages.length} pages in database`);
  for (const page of pages) {
    console.log(`\n=========================================`);
    console.log(`Page ${page.pageNo}:`);
    console.log(`  - drawingNo: ${page.drawingNo}`);
    console.log(`  - sheetNo:   ${page.sheetNo}`);
    if (page.rawText) {
      const raw = page.rawText;
      const drawingNoMatch = raw.match(/DRAWING\s+NO:\s*([0-9a-zA-Z-]+)/i);
      const titleMatch = raw.match(/TITLE:\s*([^\n]+)/i);
      const sheetMatch = raw.match(/SHEET\s+NO:\s*([0-9a-zA-Z\s+of]+)/i);
      
      console.log(`Extracted from OCR text:`);
      console.log(`  - Drawing No: ${drawingNoMatch ? drawingNoMatch[1] : 'NOT FOUND'}`);
      console.log(`  - Title:      ${titleMatch ? titleMatch[1].trim() : 'NOT FOUND'}`);
      console.log(`  - Sheet No:   ${sheetMatch ? sheetMatch[1].trim() : 'NOT FOUND'}`);
    } else {
      console.log(`No rawText populated on this SourcePage`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
