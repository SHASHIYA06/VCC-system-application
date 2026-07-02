import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const drawings = await prisma.drawing.findMany({
    where: {
      drawingNo: {
        startsWith: '942-581'
      }
    },
    include: {
      pages: true,
      pageMappings: true
    },
    orderBy: {
      drawingNo: 'asc'
    }
  });

  console.log(`Found ${drawings.length} drawings matching 942-581:`);
  for (const d of drawings) {
    console.log(`No: ${d.drawingNo} | Title: "${d.title}"`);
    console.log(`  Pages (DrawingPage):`, d.pages.map(p => ({ pageNo: p.pageNo, extra: p.extra })));
    console.log(`  Mappings (DrawingPageMapping):`, d.pageMappings.map(m => ({ pdf: m.sourceFileName, page: m.pdfPageNo, verified: m.verified })));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
