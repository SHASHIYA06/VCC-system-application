import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// CORRECT page numbers from ACCURATE_DRAWING_PAGE_MAPPINGS.ts
const CORRECT: [string, number][] = [
  ['942-58099', 1],['942-58100', 5],['942-58101', 7],['942-58102', 9],
  ['942-58103', 13],['942-58104', 17],['942-58105', 25],['942-58106', 28],
  ['942-58107', 33],['942-58108', 39],['942-58119', 45],['942-58120', 49],
  ['942-58121', 53],['942-58137', 54],['942-58138', 55],['942-58139', 57],
  ['942-58140', 58],['942-58141', 59],['942-58142', 59],['942-58123', 60],
  ['942-58124', 62],['942-58125', 64],['942-58126', 66],['942-58127', 68],
  ['942-58128', 69],['942-58129', 70],['942-58130', 71],['942-58131', 72],
  ['942-58132', 73],['942-58143', 74],['942-58144', 75],['942-58145', 76],
  ['942-58146', 78],['942-58147', 79],['942-58148', 80],['942-58149', 81],
  ['942-58150', 82],['942-58151', 83],['942-58152', 84],['942-58153', 85],
  ['942-58154', 86],
];

async function main() {
  console.log(`Fixing ${CORRECT.length} main schematic page mappings...`);
  let fixed = 0;

  for (const [dwgNo, correctPage] of CORRECT) {
    const drawing = await prisma.drawing.findFirst({ where: { drawingNo: dwgNo } });
    if (!drawing) continue;

    const result = await prisma.drawingPageMapping.updateMany({
      where: { drawingId: drawing.id, sourceFileName: 'KMRCL VCC Drawings_OCR.pdf' },
      data: { pdfPageNo: correctPage, verified: dwgNo === '942-58142' },
    });
    if (result.count > 0) fixed++;
  }

  console.log(`✅ Fixed ${fixed} mappings`);

  // Verify
  const d = await prisma.drawing.findFirst({ where: { drawingNo: '942-58120' } });
  if (d) {
    const m = await prisma.drawingPageMapping.findFirst({ where: { drawingId: d.id } });
    console.log(`Verify 942-58120: page ${m?.pdfPageNo} (should be 49)`);
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
