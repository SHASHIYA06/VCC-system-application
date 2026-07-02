import { PrismaClient } from '@prisma/client';
import { ALL_DRAWING_MAPPINGS, ALL_DRAWING_MAPPINGS_MULTI } from '../ACCURATE_DRAWING_PAGE_MAPPINGS';
const prisma = new PrismaClient();

async function main() {
  const drawings = await prisma.drawing.findMany({
    include: {
      pages: true,
      pageMappings: true,
    },
    orderBy: { drawingNo: 'asc' }
  });

  console.log(`Comparing mappings for ${drawings.length} drawings...\n`);
  
  let mismatchCount = 0;
  let noDbMappingCount = 0;
  let multiPdfDrawings: string[] = [];

  for (const d of drawings) {
    const titleMatch = (d.title || '').match(/Page\s+(\d+)/i);
    const titlePage = titleMatch ? parseInt(titleMatch[1], 10) : null;

    const mapping = d.pageMappings[0];
    const mappingPage = mapping ? mapping.pdfPageNo : null;
    const mappingPdf = mapping ? mapping.sourceFileName : null;

    const page = d.pages[0];
    const extra = page?.extra as any;
    const extraPage = extra ? extra.pdfPageNo : null;
    const extraPdf = extra ? (extra.pdfFile || extra.sourceFile) : null;

    const accurate = ALL_DRAWING_MAPPINGS[d.drawingNo];
    const accuratePage = accurate ? accurate.pageNumber : null;
    const accuratePdf = accurate ? accurate.pdfFile : null;

    const multiMappings = ALL_DRAWING_MAPPINGS_MULTI[d.drawingNo];
    if (multiMappings && multiMappings.length > 1) {
      multiPdfDrawings.push(d.drawingNo);
    }

    const hasDbMapping = mappingPage !== null && mappingPage !== undefined;

    // Check if there is any mismatch between mappingPage, extraPage, titlePage, and accuratePage
    const hasMismatch = (mappingPage !== extraPage) || 
                        (titlePage !== null && mappingPage !== titlePage) ||
                        (accuratePage !== null && mappingPage !== accuratePage);

    if (hasMismatch) {
      mismatchCount++;
      if (mismatchCount <= 30) {
        console.log(`\nDrawing: ${d.drawingNo} | Title: "${d.title}"`);
        console.log(`  Title page (from OCR title): ${titlePage || 'N/A'}`);
        console.log(`  DrawingPageMapping table:    ${mappingPage || 'N/A'} [${mappingPdf || 'N/A'}]`);
        console.log(`  DrawingPage (pages) table:   ${extraPage || 'N/A'} [${extraPdf || 'N/A'}]`);
        console.log(`  ACCURATE_DRAWING_PAGE_MAPPINGS: ${accuratePage || 'N/A'} [${accuratePdf || 'N/A'}]`);
      }
    }

    if (!hasDbMapping && accuratePage !== null) {
      noDbMappingCount++;
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total drawings: ${drawings.length}`);
  console.log(`Drawings with mismatch: ${mismatchCount}`);
  console.log(`Drawings in DB without page mapping (but in ACCURATE file): ${noDbMappingCount}`);
  console.log(`Drawings appearing in multiple PDFs: ${multiPdfDrawings.length}`);
  if (multiPdfDrawings.length > 0) {
    console.log(`  Multi-PDF drawings: ${multiPdfDrawings.join(', ')}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
