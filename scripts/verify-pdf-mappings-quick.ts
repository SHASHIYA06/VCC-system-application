import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Coverage
  const total = await prisma.drawing.count();
  const withMap = await prisma.drawing.count({ where: { pageMappings: { some: {} } } });
  const verified = await prisma.drawingPageMapping.count({ where: { verified: true } });
  const totalMap = await prisma.drawingPageMapping.count();
  console.log(`Drawings: ${total}, with mapping: ${withMap}`);
  console.log(`Page mappings: ${totalMap} (verified: ${verified})\n`);

  // Spot check user-verified drawing
  for (const dn of ['942-58142', '942-58120', '942-38305', '942-38103']) {
    const d = await prisma.drawing.findFirst({
      where: { drawingNo: dn },
      select: { drawingNo: true, title: true, drawingPdfUrl: true,
        pageMappings: { select: { sourceFileName: true, pdfPageNo: true, verified: true } } },
    });
    if (!d) { console.log(`${dn}: NOT FOUND`); continue; }
    const m = d.pageMappings[0];
    console.log(`${dn}: "${(d.title||'').slice(0,40)}"`);
    console.log(`   pdfUrl=${d.drawingPdfUrl ? 'yes' : 'NO'} | mapping=${m ? `${m.sourceFileName} p${m.pdfPageNo} ${m.verified?'✓':'(inferred)'}` : 'NONE'}`);
  }
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
