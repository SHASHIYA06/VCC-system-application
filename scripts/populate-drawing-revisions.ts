/**
 * Populate DrawingRevision records from existing drawings.
 *
 * Strategy:
 * 1. For each drawing, create a DrawingRevision row capturing its current
 *    revision label, marked isCurrent = true.
 * 2. Detect parent/child relationships from drawing numbers:
 *    base "942-38409" is parent of "942-38409A", "942-38409B", etc.
 * 3. revisionNo derived from label (0=base/0, A=1, B=2, ... or numeric).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function revisionToNumber(rev: string): number {
  const r = (rev || '').trim().toUpperCase();
  if (!r || r === '0') return 0;
  if (/^\d+$/.test(r)) return parseInt(r, 10);
  // Letter revision: A=1, B=2 ...
  if (/^[A-Z]$/.test(r)) return r.charCodeAt(0) - 64;
  return 0;
}

/** Extract a base drawing number by stripping a trailing letter suffix. */
function baseDrawingNo(drawingNo: string): string {
  return drawingNo.replace(/[A-Z]$/i, '');
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('   POPULATE DRAWING REVISIONS');
  console.log('═══════════════════════════════════════════════════\n');

  const drawings = await prisma.drawing.findMany({
    select: { id: true, drawingNo: true, revision: true },
  });

  console.log(`Found ${drawings.length} drawings\n`);

  // Build a lookup from drawingNo -> id for parent resolution
  const byNo = new Map<string, string>();
  for (const d of drawings) byNo.set(d.drawingNo.toUpperCase(), d.id);

  let created = 0;
  let withParent = 0;

  for (const d of drawings) {
    const label = (d.revision || '0').trim() || '0';
    const revisionNo = revisionToNumber(label);

    // Resolve parent: if drawingNo ends with a letter, parent is the base
    const base = baseDrawingNo(d.drawingNo).toUpperCase();
    let parentDrawingId: string | null = null;
    if (base !== d.drawingNo.toUpperCase() && byNo.has(base)) {
      parentDrawingId = byNo.get(base)!;
      withParent++;
    }

    try {
      await prisma.drawingRevision.upsert({
        where: {
          drawingId_revisionLabel: { drawingId: d.id, revisionLabel: label },
        },
        update: {
          revisionNo,
          isCurrent: true,
          parentDrawingId,
        },
        create: {
          drawingId: d.id,
          revisionLabel: label,
          revisionNo,
          isCurrent: true,
          parentDrawingId,
          notes: 'Auto-populated from drawing revision field',
        },
      });
      created++;
    } catch (e) {
      // Skip duplicates / FK issues quietly
    }
  }

  console.log(`✓ Created/updated ${created} revision records`);
  console.log(`✓ ${withParent} drawings linked to a parent drawing\n`);

  const total = await prisma.drawingRevision.count();
  console.log(`Total DrawingRevision rows: ${total}\n`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
