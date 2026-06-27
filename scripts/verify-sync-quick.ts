import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                   QUICK SYNCHRONIZATION VERIFICATION                       ║
║                  Check if drawings are now synchronized                    ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

    // Quick check: Verify page counts are now correct
    console.log(`\n✓ Checking page count fixes...\n`);

    const pageIssues = await prisma.drawing.findMany({
      where: {
        drawingNo: {
          in: ['942-38410', '942-38505', '942-38514', '942-38603', '942-38604', 
               '942-38607', '942-38612', '942-58100', '942-58152', '942-70004']
        }
      },
      select: {
        drawingNo: true,
        totalSheets: true,
        _count: { select: { pages: true } }
      }
    });

    let fixedCount = 0;
    for (const drawing of pageIssues) {
      const match = drawing.totalSheets === drawing._count.pages;
      const status = match ? '✓' : '✗';
      console.log(`  ${status} ${drawing.drawingNo}: ${drawing.totalSheets} pages (actual: ${drawing._count.pages})`);
      if (match) fixedCount++;
    }

    console.log(`\n  Fixed: ${fixedCount}/10 page count issues\n`);

  } catch (error) {
    console.error(`\n❌ Error: ${error}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
