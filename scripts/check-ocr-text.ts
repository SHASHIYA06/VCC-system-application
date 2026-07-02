import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const pages = await prisma.drawingPage.findMany({
    where: {
      drawing: {
        drawingNo: '942-58120'
      }
    },
    select: {
      pageNo: true,
      ocrText: true,
      extra: true
    }
  });

  console.log(`Pages for drawing 942-58120:`, pages.length);
  for (const p of pages) {
    console.log(`PageNo: ${p.pageNo} | Extra:`, p.extra);
    console.log(`OCR snippet:`, p.ocrText?.slice(0, 500));
  }

  // Also query drawingPage table for page with drawingNo containing 58120
  const ocrPages = await prisma.drawingPage.findMany({
    where: {
      ocrText: {
        contains: '942-58120'
      }
    },
    select: {
      id: true,
      pageNo: true,
      drawing: {
        select: {
          drawingNo: true,
          title: true
        }
      },
      extra: true
    }
  });
  console.log(`\nPages containing '942-58120' in OCR text:`, ocrPages.length);
  for (const op of ocrPages) {
    console.log(`Drawing: ${op.drawing.drawingNo} (${op.drawing.title}) | PageNo: ${op.pageNo} | Extra:`, op.extra);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
