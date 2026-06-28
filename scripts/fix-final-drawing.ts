import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixFinalDrawing() {
  try {
    console.log(`\nFixing final drawing: 942-58120A...\n`);

    // Find the problematic drawing by searching all
    const drawings = await prisma.drawing.findMany({
      where: {
        drawingNo: '942-58120A'
      },
      include: {
        pages: true
      }
    });

    if (drawings.length === 0) {
      console.log('❌ Drawing not found');
      return;
    }

    const drawing = drawings[0];

    console.log(`Current state:`);
    console.log(`  Drawing: ${drawing.drawingNo} (Rev ${drawing.revision})`);
    console.log(`  Declared pages: ${drawing.totalSheets}`);
    console.log(`  Actual pages: ${drawing.pages.length}`);

    // Fix: Set totalSheets to 1 (or actual if greater)
    const updated = await prisma.drawing.update({
      where: { id: drawing.id },
      data: {
        totalSheets: Math.max(1, drawing.pages.length)
      }
    });

    console.log(`\nAfter fix:`);
    console.log(`  Drawing: ${updated.drawingNo} (Rev ${updated.revision})`);
    console.log(`  Declared pages: ${updated.totalSheets}`);
    console.log(`\n✅ Fixed!\n`);

  } catch (error) {
    console.error(`Error: ${error}`);
  } finally {
    await prisma.$disconnect();
  }
}

fixFinalDrawing();
