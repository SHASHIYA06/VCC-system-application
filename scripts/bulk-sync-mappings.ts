import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const MAPPINGS: [string, string, number][] = [
  ['942-58099','KMRCL VCC Drawings_OCR.pdf',1],['942-58100','KMRCL VCC Drawings_OCR.pdf',5],['942-58101','KMRCL VCC Drawings_OCR.pdf',7],['942-58102','KMRCL VCC Drawings_OCR.pdf',9],['942-58103','KMRCL VCC Drawings_OCR.pdf',13],['942-58104','KMRCL VCC Drawings_OCR.pdf',17],['942-58105','KMRCL VCC Drawings_OCR.pdf',25],['942-58106','KMRCL VCC Drawings_OCR.pdf',28],['942-58107','KMRCL VCC Drawings_OCR.pdf',33],['942-58108','KMRCL VCC Drawings_OCR.pdf',39],['942-58119','KMRCL VCC Drawings_OCR.pdf',45],['942-58120','KMRCL VCC Drawings_OCR.pdf',49],['942-58121','KMRCL VCC Drawings_OCR.pdf',53],['942-58137','KMRCL VCC Drawings_OCR.pdf',54],['942-58138','KMRCL VCC Drawings_OCR.pdf',55],['942-58139','KMRCL VCC Drawings_OCR.pdf',57],['942-58140','KMRCL VCC Drawings_OCR.pdf',58],['942-58141','KMRCL VCC Drawings_OCR.pdf',59],['942-58142','KMRCL VCC Drawings_OCR.pdf',59],['942-58123','KMRCL VCC Drawings_OCR.pdf',60],['942-58124','KMRCL VCC Drawings_OCR.pdf',62],['942-58125','KMRCL VCC Drawings_OCR.pdf',64],['942-58126','KMRCL VCC Drawings_OCR.pdf',66],['942-58127','KMRCL VCC Drawings_OCR.pdf',68],['942-58128','KMRCL VCC Drawings_OCR.pdf',69],['942-58129','KMRCL VCC Drawings_OCR.pdf',70],['942-58130','KMRCL VCC Drawings_OCR.pdf',71],['942-58131','KMRCL VCC Drawings_OCR.pdf',72],['942-58132','KMRCL VCC Drawings_OCR.pdf',73],['942-58143','KMRCL VCC Drawings_OCR.pdf',74],['942-58144','KMRCL VCC Drawings_OCR.pdf',75],['942-58145','KMRCL VCC Drawings_OCR.pdf',76],['942-58146','KMRCL VCC Drawings_OCR.pdf',78],['942-58147','KMRCL VCC Drawings_OCR.pdf',79],['942-58148','KMRCL VCC Drawings_OCR.pdf',80],['942-58149','KMRCL VCC Drawings_OCR.pdf',81],['942-58150','KMRCL VCC Drawings_OCR.pdf',82],['942-58151','KMRCL VCC Drawings_OCR.pdf',83],['942-58152','KMRCL VCC Drawings_OCR.pdf',84],['942-58153','KMRCL VCC Drawings_OCR.pdf',85],['942-58154','KMRCL VCC Drawings_OCR.pdf',86],
  ['942-38103','CAB_PIN DRAWINGS.pdf',1],['942-38104','CAB_PIN DRAWINGS.pdf',9],['942-38105','CAB_PIN DRAWINGS.pdf',17],['942-38108','CAB_PIN DRAWINGS.pdf',20],['942-38109','CAB_PIN DRAWINGS.pdf',21],['942-38111','CAB_PIN DRAWINGS.pdf',22],['942-38112','CAB_PIN DRAWINGS.pdf',23],['942-38113','CAB_PIN DRAWINGS.pdf',24],['942-38117','CAB_PIN DRAWINGS.pdf',25],['942-38118','CAB_PIN DRAWINGS.pdf',26],['942-38119','CAB_PIN DRAWINGS.pdf',27],['942-38120','CAB_PIN DRAWINGS.pdf',28],['942-38121','CAB_PIN DRAWINGS.pdf',29],['942-38122','CAB_PIN DRAWINGS.pdf',30],['942-38110','CAB_PIN DRAWINGS.pdf',31],['942-38128','CAB_PIN DRAWINGS.pdf',32],['942-38409','CAB_PIN DRAWINGS.pdf',33],
  ['942-38305','DMC UF_PIN DRAWINGS.pdf',1],['942-38306','DMC UF_PIN DRAWINGS.pdf',3],['942-38307','DMC UF_PIN DRAWINGS.pdf',5],['942-38309','DMC UF_PIN DRAWINGS.pdf',7],['942-38310','DMC UF_PIN DRAWINGS.pdf',9],['942-38312','DMC UF_PIN DRAWINGS.pdf',11],['942-38314','DMC UF_PIN DRAWINGS.pdf',14],['942-38315','DMC UF_PIN DRAWINGS.pdf',15],['942-38316','DMC UF_PIN DRAWINGS.pdf',16],['942-38317','DMC UF_PIN DRAWINGS.pdf',17],['942-38319','DMC UF_PIN DRAWINGS.pdf',18],['942-38320','DMC UF_PIN DRAWINGS.pdf',19],['942-38321','DMC UF_PIN DRAWINGS.pdf',20],['942-38323','DMC UF_PIN DRAWINGS.pdf',21],
  ['942-38402','DMC_CEILING.pdf',1],['942-38404','DMC_CEILING.pdf',3],['942-38405','DMC_CEILING.pdf',5],['942-38406','DMC_CEILING.pdf',7],['942-38407','DMC_CEILING.pdf',9],['942-38410','DMC_CEILING.pdf',13],['942-38413','DMC_CEILING.pdf',15],
  ['942-38505','TC _UF PIN DRAWINGS.pdf',1],['942-38506','TC _UF PIN DRAWINGS.pdf',3],['942-38507','TC _UF PIN DRAWINGS.pdf',5],['942-38508','TC _UF PIN DRAWINGS.pdf',7],['942-38510','TC _UF PIN DRAWINGS.pdf',9],['942-38512','TC _UF PIN DRAWINGS.pdf',11],['942-38514','TC _UF PIN DRAWINGS.pdf',13],['942-38516','TC _UF PIN DRAWINGS.pdf',15],['942-38518','TC _UF PIN DRAWINGS.pdf',17],['942-38519','TC _UF PIN DRAWINGS.pdf',19],['942-38521','TC _UF PIN DRAWINGS.pdf',21],
  ['942-38602','TC_CEILING PIN DRAWINGS.pdf',1],['942-38603','TC_CEILING PIN DRAWINGS.pdf',3],['942-38604','TC_CEILING PIN DRAWINGS.pdf',5],['942-38605','TC_CEILING PIN DRAWINGS.pdf',7],['942-38607','TC_CEILING PIN DRAWINGS.pdf',9],['942-38608','TC_CEILING PIN DRAWINGS.pdf',11],['942-38614','TC_CEILING PIN DRAWINGS.pdf',13],
  ['942-38101','MC_UF.pdf',1],['942-38102','MC_UF.pdf',3],['942-38104','MC_UF.pdf',7],['942-38105','MC_UF.pdf',9],['942-38106','MC_UF.pdf',11],['942-38122','MC_UF.pdf',15],['942-38124','MC_UF.pdf',17],
  ['942-38606','MC_CEILING_PIN DRAWINGS.pdf',5],['942-38608','MC_CEILING_PIN DRAWINGS.pdf',9],['942-38710','MC_CEILING_PIN DRAWINGS.pdf',11],['942-38711','MC_CEILING_PIN DRAWINGS.pdf',13],
];

async function main() {
  console.log(`Syncing ${MAPPINGS.length} drawing→page mappings...`);
  let ok = 0, skip = 0, miss = 0;

  for (const [dwgNo, pdf, page] of MAPPINGS) {
    const drawing = await prisma.drawing.findFirst({ where: { drawingNo: dwgNo } });
    if (!drawing) { miss++; continue; }
    try {
      await prisma.drawingPageMapping.upsert({
        where: { drawingId_sourceFileId: { drawingId: drawing.id, sourceFileId: pdf } },
        update: { pdfPageNo: page, sourceFileName: pdf, drawingNumber: dwgNo },
        create: { drawingId: drawing.id, sourceFileId: pdf, sourceFileName: pdf, pdfPageNo: page, drawingNumber: dwgNo, verified: dwgNo === '942-58142' },
      });
      ok++;
    } catch (e) { skip++; }
    if ((ok + skip + miss) % 20 === 0) process.stdout.write('.');
  }

  console.log(`\n✅ Synced: ${ok} | Skipped: ${skip} | Not in DB: ${miss}`);
  console.log(`Total DrawingPageMapping records: ${await prisma.drawingPageMapping.count()}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
