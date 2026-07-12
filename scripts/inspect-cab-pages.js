const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pages = [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40];
  
  for (const pageNo of pages) {
    const page = await prisma.sourcePage.findFirst({
      where: {
        sourceFile: { filename: 'CAB_PIN DRAWINGS 2.pdf' },
        pageNo: pageNo
      }
    });
    
    console.log(`\n=========================================`);
    console.log(`CAB_PIN DRAWINGS.pdf Page ${pageNo}:`);
    if (page && page.rawText) {
      // Look for DRAWING NO: and TITLE: and SHEET NO:
      const raw = page.rawText;
      const drawingNoMatch = raw.match(/DRAWING\s+NO:\s*([0-9a-zA-Z-]+)/i);
      const titleMatch = raw.match(/TITLE:\s*([^\n]+)/i);
      const sheetMatch = raw.match(/SHEET\s+NO:\s*([0-9a-zA-Z\s+of]+)/i);
      
      console.log(`Extracted Info:`);
      console.log(`  - Drawing No: ${drawingNoMatch ? drawingNoMatch[1] : 'NOT FOUND'}`);
      console.log(`  - Title:      ${titleMatch ? titleMatch[1].trim() : 'NOT FOUND'}`);
      console.log(`  - Sheet No:   ${sheetMatch ? sheetMatch[1].trim() : 'NOT FOUND'}`);
      console.log(`Text Snippet:`);
      console.log(raw.substring(0, 300));
    } else {
      console.log(`No OCR or text found for this page`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
