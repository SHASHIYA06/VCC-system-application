import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Analyzing OCR pages for drawing number references...\n');

  const files = [
    'DMC UF_PIN DRAWINGS.pdf',
    'CAB_PIN DRAWINGS.pdf',
    'CAB_PIN DRAWINGS 2.pdf',
    'TC_CEILING PIN DRAWINGS.pdf',
    'TC _UF PIN DRAWINGS.pdf',
    'MC_CEILING_PIN DRAWINGS.pdf',
    'MC_UF.pdf'
  ];

  for (const file of files) {
    console.log(`=== File: ${file} ===`);
    const pages = await prisma.ocrPage.findMany({
      where: { sourceFileId: file },
      orderBy: { pageNo: 'asc' }
    });

    console.log(`Found ${pages.length} pages.`);

    for (const p of pages) {
      // Find drawing number patterns in the text
      const matches = p.rawText.match(/942[-_]\d+/g) || [];
      const cleanMatches = p.rawText.match(/3[89]\d+/g) || [];
      
      const allMatches = Array.from(new Set([...matches, ...cleanMatches]));
      
      if (allMatches.length > 0) {
        console.log(`  Page ${p.pageNo}: matches: [${allMatches.join(', ')}]`);
      } else {
        // Log first 100 characters if no matches
        const snippet = p.rawText.substring(0, 100).replace(/\s+/g, ' ');
        console.log(`  Page ${p.pageNo}: no drawing no matches. Snippet: "${snippet}"`);
      }
    }
    console.log('');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
