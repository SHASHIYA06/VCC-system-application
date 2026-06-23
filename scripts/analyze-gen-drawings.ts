/**
 * Analyze drawings in GEN to understand drawing-number distribution.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const gen = await prisma.system.findFirst({ where: { code: 'GEN' } });
  if (!gen) { console.log('No GEN system'); return; }

  const drawings = await prisma.drawing.findMany({
    where: { systemId: gen.id },
    select: { drawingNo: true },
    orderBy: { drawingNo: 'asc' },
  });

  // Group by drawing number prefix (942-58 schematic, 942-38 pin, etc.)
  const prefixes: Record<string, number> = {};
  const distinct = new Set<string>();
  for (const d of drawings) {
    distinct.add(d.drawingNo);
    const m = d.drawingNo.match(/^(\d+-\d{2})/);
    const p = m ? m[1] : d.drawingNo.slice(0, 6);
    prefixes[p] = (prefixes[p] || 0) + 1;
  }
  console.log(`GEN: ${drawings.length} rows, ${distinct.size} distinct drawing numbers\n`);
  console.log('By prefix:');
  Object.entries(prefixes).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}xxx : ${v}`));

  // Show the distinct 942-58 schematic numbers (the main VCC series)
  const schem = [...distinct].filter(n => n.startsWith('942-58')).sort();
  console.log(`\n942-58 schematic distinct numbers (${schem.length}):`);
  console.log('  ' + schem.join(', '));

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
