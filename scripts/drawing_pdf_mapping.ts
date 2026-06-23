import { prisma } from '../src/lib/prisma';

async function main() {
  const mappings = await prisma.drawing.findMany({
    select: {
      drawingNo: true,
      system: { select: { code: true, name: true } },
      pageMappings: { select: { sourceFileName: true, pdfPageNo: true }, orderBy: { pdfPageNo: 'asc' } },
    },
    where: { pageMappings: { some: {} } },
    orderBy: { drawingNo: 'asc' },
  });

  const byPDF: Record<string, typeof mappings> = {};
  for (const m of mappings) {
    const pdf = m.pageMappings[0]?.sourceFileName || 'UNKNOWN';
    if (!byPDF[pdf]) byPDF[pdf] = [];
    byPDF[pdf].push({ drawingNo: m.drawingNo, system: m.system?.code, pages: m.pageMappings.map(pm => pm.pdfPageNo) });
  }

  for (const [pdf, drawings] of Object.entries(byPDF)) {
    console.log(`\n${pdf}`);
    console.log(drawings.slice(0, 10).map(d => `  ${d.drawingNo} (${d.system}) pages: [${d.pages.join(', ')}]`).join('\n'));
    if (drawings.length > 10) console.log(`  ... and ${drawings.length - 10} more`);
  }

  await prisma.$disconnect();
}
main();
