import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Searching for drawing occurrences in OCR text...\n');

  const drawings = await prisma.drawing.findMany({
    orderBy: { drawingNo: 'asc' }
  });

  console.log(`Found ${drawings.length} drawings in database to check.\n`);

  const results: any[] = [];

  for (const d of drawings) {
    const rawNo = d.drawingNo;
    const cleanNo = rawNo.replace(/^942[-_]/i, '').replace(/-/g, '');
    
    // Search in OCR text
    const ocrPages = await prisma.ocrPage.findMany({
      where: {
        OR: [
          { rawText: { contains: rawNo } },
          { rawText: { contains: cleanNo } }
        ]
      },
      select: {
        sourceFileId: true,
        pageNo: true
      }
    });

    if (ocrPages.length > 0) {
      results.push({
        drawingNo: rawNo,
        title: d.title,
        sourceFileId: d.sourceFileId,
        actualOcrPages: ocrPages.map(p => `${p.sourceFileId} p.${p.pageNo}`)
      });
      console.log(`Found ${rawNo} (${d.title}):`, ocrPages.map(p => `${p.sourceFileId} p.${p.pageNo}`).join(', '));
    }
  }

  console.log(`\nMatched ${results.length} / ${drawings.length} drawings to actual OCR pages.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
