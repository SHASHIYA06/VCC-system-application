import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const pages = [
    { file: 'DMC UF_PIN DRAWINGS.pdf', page: 17 },
    { file: 'DMC UF_PIN DRAWINGS.pdf', page: 7 },
    { file: 'DMC UF_PIN DRAWINGS.pdf', page: 9 },
    { file: 'DMC UF_PIN DRAWINGS.pdf', page: 11 },
    { file: 'DMC UF_PIN DRAWINGS.pdf', page: 13 },
    { file: 'DMC UF_PIN DRAWINGS.pdf', page: 15 },
    { file: 'DMC UF_PIN DRAWINGS.pdf', page: 26 },
  ];

  for (const p of pages) {
    const ocrPage = await prisma.ocrPage.findUnique({
      where: {
        sourceFileId_pageNo: {
          sourceFileId: p.file,
          pageNo: p.page
        }
      }
    });

    console.log(`=== ${p.file} Page ${p.page} ===`);
    if (ocrPage) {
      console.log(ocrPage.rawText.substring(0, 1000));
    } else {
      console.log('Page not found.');
    }
    console.log('--------------------------------------------\n');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
