import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const drawing = await prisma.drawing.findFirst({
    where: { drawingNo: '942-58142' },
    include: {
      pages: true,
      pageMappings: true,
    }
  });
  console.log(`Drawing: 942-58142`);
  console.log(`Title: ${drawing?.title}`);
  console.log(`Pages:`, drawing?.pages.map(p => ({ pageNo: p.pageNo, extra: p.extra })));
  console.log(`Page Mappings:`, drawing?.pageMappings.map(m => ({ sourceFileName: m.sourceFileName, pdfPageNo: m.pdfPageNo, verified: m.verified })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
