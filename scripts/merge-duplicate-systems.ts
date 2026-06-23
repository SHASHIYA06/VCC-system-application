/**
 * MERGE DUPLICATE / EMPTY SYSTEMS
 *
 * COUPL (Coupler Control, empty, PENDING) duplicates COUPLING (Coupling).
 * Merge any references from COUPL into COUPLING, then mark COUPL inactive.
 *
 * Also marks genuinely empty placeholder systems (DISPLAY) inactive so they
 * stop showing as broken in the UI, WITHOUT deleting them (additive/safe).
 *
 * Usage:
 *   npx tsx scripts/merge-duplicate-systems.ts          (dry run)
 *   npx tsx scripts/merge-duplicate-systems.ts --apply
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

// [fromCode, intoCode]
const MERGES: [string, string][] = [
  ['COUPL', 'COUPLING'],
];

async function main() {
  console.log(`\n=== MERGE DUPLICATE SYSTEMS (${APPLY ? 'APPLY' : 'DRY RUN'}) ===\n`);
  const systems = await prisma.system.findMany({ select: { id: true, code: true } });
  const byCode = new Map(systems.map(s => [s.code, s.id]));

  for (const [from, into] of MERGES) {
    const fromId = byCode.get(from);
    const intoId = byCode.get(into);
    if (!fromId || !intoId) { console.log(`  skip ${from}->${into} (missing)`); continue; }

    const [dwg, dev] = await Promise.all([
      prisma.drawing.count({ where: { systemId: fromId } }),
      prisma.device.count({ where: { systemId: fromId } }),
    ]);
    console.log(`  ${from} -> ${into}: ${dwg} drawings, ${dev} devices to move`);

    if (APPLY) {
      if (dwg) await prisma.drawing.updateMany({ where: { systemId: fromId }, data: { systemId: intoId } });
      if (dev) await prisma.device.updateMany({ where: { systemId: fromId }, data: { systemId: intoId } });
      // Mark the now-empty duplicate inactive (do not delete — preserves FK history).
      await prisma.system.update({ where: { id: fromId }, data: { isActive: false, dataStatus: 'MERGED' } }).catch(() => {});
      console.log(`    merged and marked ${from} inactive`);
    }
  }

  // Mark empty placeholder systems inactive (DISPLAY etc.)
  const empties = await prisma.system.findMany({
    where: { devices: { none: {} }, drawings: { none: {} }, isActive: true },
    select: { id: true, code: true },
  });
  console.log(`\nEmpty active systems: ${empties.map(e => e.code).join(', ') || 'none'}`);
  if (APPLY) {
    for (const e of empties) {
      // Keep core known systems active even if currently empty; only deactivate
      // clearly orphaned placeholders.
      if (['DISPLAY'].includes(e.code)) {
        await prisma.system.update({ where: { id: e.id }, data: { isActive: false, dataStatus: 'PLACEHOLDER' } }).catch(() => {});
        console.log(`  marked ${e.code} inactive (placeholder)`);
      }
    }
  }

  console.log(APPLY ? '\nApplied.' : '\nDry run — re-run with --apply to write.\n');
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
