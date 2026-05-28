import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const keywords = [
    'stinger',
    'reactor',
    'collector shoe',
    'vvvf',
    'bcu',
    'ltjb',
    'battery',
    'shore supply',
    'compressor',
    'door',
    'ceiling',
    'underframe',
    'cab panel',
    'main switch box',
    'hscb',
    'bogie',
    'earth brush'
  ];

  console.log('Searching OCR pages for keywords...\n');

  for (const keyword of keywords) {
    console.log(`=== Keyword: "${keyword}" ===`);
    const pages = await prisma.ocrPage.findMany({
      where: {
        rawText: { contains: keyword, mode: 'insensitive' }
      },
      select: {
        sourceFileId: true,
        pageNo: true
      },
      orderBy: [
        { sourceFileId: 'asc' },
        { pageNo: 'asc' }
      ]
    });

    if (pages.length === 0) {
      console.log('  No matches found.');
    } else {
      console.log(`  Found ${pages.length} matches:`);
      const grouped: Record<string, number[]> = {};
      for (const p of pages) {
        if (!grouped[p.sourceFileId]) grouped[p.sourceFileId] = [];
        grouped[p.sourceFileId].push(p.pageNo);
      }
      for (const [file, pNos] of Object.entries(grouped)) {
        console.log(`    - ${file}: pages [${pNos.join(', ')}]`);
      }
    }
    console.log('');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
