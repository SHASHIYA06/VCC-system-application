import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const nos = ['942-38117', '942-58104', '942-58120'];
  for (const no of nos) {
    const drawing = await prisma.drawing.findFirst({
      where: { drawingNo: no },
      include: {
        pages: true,
        pageMappings: true,
      }
    });
    console.log(`\nDrawing: ${no}`);
    console.log(`Title: ${drawing?.title}`);
    console.log(`Pages:`, drawing?.pages.map(p => ({ pageNo: p.pageNo, extra: p.extra })));
    console.log(`Page Mappings:`, drawing?.pageMappings.map(m => ({ sourceFileName: m.sourceFileName, pdfPageNo: m.pdfPageNo, verified: m.verified })));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
