import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Generating exact PDF page mappings from OCR text...\n');

  const drawings = await prisma.drawing.findMany({
    orderBy: { drawingNo: 'asc' }
  });

  console.log(`Found ${drawings.length} drawings in database.`);

  let matchCount = 0;
  const updates: any[] = [];

  for (const d of drawings) {
    const rawNo = d.drawingNo;
    // Extract base number (e.g. 38305 from 942-38305)
    const baseMatch = rawNo.match(/\d+$/);
    const baseNo = baseMatch ? baseMatch[0] : null;

    if (!baseNo) {
      console.log(`⚠️ Could not parse base number from drawing ${rawNo}`);
      continue;
    }

    // Try to search for matches in OCR pages
    // We prioritize pages where the raw text contains the full drawing number or the base number
    // We also prefer the file that matches the drawing classification if there are multiple files
    const ocrPages = await prisma.ocrPage.findMany({
      where: {
        OR: [
          { rawText: { contains: rawNo } },
          { rawText: { contains: baseNo } }
        ]
      },
      orderBy: { pageNo: 'asc' }
    });

    if (ocrPages.length === 0) {
      continue;
    }

    // Determine the best match. 
    // If the drawing's remarks contain the car type or system, we try to match it with the source file name.
    let bestPage = ocrPages[0];
    
    // Check if drawing matches file name classification
    const preferredFiles = getPreferredFilesForDrawing(rawNo);
    const filteredPages = ocrPages.filter(p => preferredFiles.some(f => p.sourceFileId.includes(f)));
    
    if (filteredPages.length > 0) {
      bestPage = filteredPages[0];
    }

    // Special exact matches or title sheet checks if possible
    // E.g., sheet 1 should usually map to the first page of that drawing
    matchCount++;
    console.log(`🎯 Matched ${rawNo} (${d.title}) -> ${bestPage.sourceFileId} page ${bestPage.pageNo}`);
    
    updates.push({
      drawingId: d.id,
      drawingNo: rawNo,
      title: d.title,
      sourceFile: bestPage.sourceFileId,
      pdfPageNo: bestPage.pageNo
    });
  }

  console.log(`\nMatched ${matchCount} / ${drawings.length} drawings.`);
  console.log('Writing mappings to database...');

  for (const item of updates) {
    // Check if DrawingPage already exists
    const existing = await prisma.drawingPage.findFirst({
      where: { drawingId: item.drawingId }
    });

    const extra = {
      pdfPageNo: item.pdfPageNo,
      sourceFile: item.sourceFile,
      mappedAt: new Date().toISOString(),
      mappingSource: 'ocr_discovered'
    };

    if (existing) {
      await prisma.drawingPage.update({
        where: { id: existing.id },
        data: {
          extra,
          ocrText: existing.ocrText || `Auto-mapped to ${item.sourceFile} page ${item.pdfPageNo}`
        }
      });
    } else {
      await prisma.drawingPage.create({
        data: {
          drawingId: item.drawingId,
          pageNo: 1,
          parseStatus: 'MAPPED',
          extra
        }
      });
    }

    // Also update Drawing's sourceFileId if it differs or is empty
    await prisma.drawing.update({
      where: { id: item.drawingId },
      data: {
        sourceFileId: item.sourceFile
      }
    });
  }

  console.log('\nDone updating database mappings!');
}

function getPreferredFilesForDrawing(drawingNo: string): string[] {
  const upper = drawingNo.toUpperCase();
  if (upper.includes('381') || upper.includes('382')) {
    return ['CAB_PIN DRAWINGS.pdf', 'CAB_PIN DRAWINGS 2.pdf'];
  }
  if (upper.includes('383')) {
    return ['DMC UF_PIN DRAWINGS.pdf'];
  }
  if (upper.includes('384') || upper.includes('38409')) {
    return ['DMC_CEILING.pdf', 'TC_CEILING PIN DRAWINGS.pdf'];
  }
  if (upper.includes('385')) {
    return ['TC _UF PIN DRAWINGS.pdf'];
  }
  if (upper.includes('386')) {
    return ['MC_CEILING_PIN DRAWINGS.pdf', 'TC_CEILING PIN DRAWINGS.pdf'];
  }
  if (upper.includes('387')) {
    return ['MC_CEILING_PIN DRAWINGS.pdf', 'MC_UF.pdf'];
  }
  return [];
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
