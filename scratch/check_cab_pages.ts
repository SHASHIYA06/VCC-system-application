import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Inspecting first 15 pages of CAB_PIN DRAWINGS 2.pdf...\n');

  for (let page = 1; page <= 15; page++) {
    const ocrPage = await prisma.ocrPage.findUnique({
      where: {
        sourceFileId_pageNo: {
          sourceFileId: 'CAB_PIN DRAWINGS 2.pdf',
          pageNo: page
        }
      }
    });

    console.log(`=== Page ${page} ===`);
    if (ocrPage) {
      // Find matches for drawing number patterns
      const drawingMatches = ocrPage.rawText.match(/(942[-_]\d+|38\d+)/g) || [];
      console.log(`  Drawing matches: [${Array.from(new Set(drawingMatches)).join(', ')}]`);
      
      // Look for keywords like "Sheet"
      const sheetMatch = ocrPage.rawText.match(/sheet\s*([0-9\sof\/]+)/i);
      if (sheetMatch) {
        console.log(`  Sheet text: "${sheetMatch[0]}"`);
      }
      
      // Print first 400 characters of page
      console.log(`  Text snippet: "${ocrPage.rawText.substring(0, 400).replace(/\s+/g, ' ')}"`);
    } else {
      console.log('  Page not found.');
    }
    console.log('---------------------------------------------------\n');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
