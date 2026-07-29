/**
 * "GEN" (General) holds 320 of 575 drawings — 56% of the catalogue is
 * unclassified, which breaks every system-scoped view. This probe samples those
 * drawings to see whether their titles/numbers imply a real system. Read-only.
 * Run: DATABASE_URL="..." npx tsx scripts/probe-gen-bucket.ts
 */
import { prisma } from '../src/lib/prisma';

/** Title keywords that map onto an existing System.code. */
const KEYWORD_SYSTEM: Array<[RegExp, string]> = [
  [/\btcms\b|train control management|communication node|mvb\b/i, 'TMS'],
  [/passenger door|door inside|door outside|\bdcu\b|door control/i, 'DOOR'],
  [/traction|vvvf|\btcu\b|inverter drive|motor/i, 'TRAC'],
  [/brake|\bebcu\b|\bbecu\b|friction brake|regenerat/i, 'BRAKE'],
  [/\bhvac\b|air condition|ventilat|\bvac\b/i, 'VAC'],
  [/auxiliary power|\baps\b|\bsiv\b|static inverter|battery charger/i, 'APS'],
  [/\bcctv\b|surveillance|camera/i, 'CCTV'],
  [/announce|passenger information|\bpis\b|\bpa\b system|intercom/i, 'PIS'],
  [/lighting|\blamp\b|emergency light|head light|tail light/i, 'LIGHT'],
  [/high tension|\bhv\b|pantograph|line breaker|\bvcb\b|earth(ing)? switch/i, 'HV'],
  [/coupler|coupling|\bbic\b/i, 'COUPLING'],
  [/train ?line|trainline/i, 'TRL'],
  [/\bcab\b|driver desk|\bmascot\b|cab console/i, 'CAB'],
  [/radio|\btetra\b|ethernet|network switch|antenna|communicat/i, 'COMMS'],
  [/bogie|axle|wheel|suspension/i, 'BOGIE'],
  [/low tension equipment box|\blteb\b/i, 'LTEB'],
  [/low tension junction box|\bltjb\b/i, 'LTJB'],
  [/electrical distribution box|\bedb\b|distribution board/i, 'EDB'],
  [/fire (detection|alarm)|smoke detect/i, 'FIRE'],
  [/emergency alarm|\bpeau\b|passenger emergency/i, 'PEAU'],
  [/\btft\b|display unit|monitor/i, 'DISPLAY'],
];

function classify(title: string): string | null {
  for (const [re, code] of KEYWORD_SYSTEM) if (re.test(title)) return code;
  return null;
}

async function main() {
  const gen = await prisma.drawing.findMany({
    where: { system: { code: 'GEN' } },
    select: { id: true, drawingNo: true, title: true },
    orderBy: { drawingNo: 'asc' },
  });

  console.log(`GEN drawings: ${gen.length}\n`);

  const hits: Record<string, string[]> = {};
  const misses: Array<{ drawingNo: string; title: string }> = [];

  for (const d of gen) {
    const code = classify(d.title ?? '');
    if (code) (hits[code] ??= []).push(`${d.drawingNo} — ${d.title}`);
    else misses.push({ drawingNo: d.drawingNo, title: d.title ?? '' });
  }

  const classified = Object.values(hits).reduce((a, b) => a + b.length, 0);
  console.log(`Classifiable by title keyword: ${classified}/${gen.length}`);
  console.log(`Unclassifiable:                ${misses.length}\n`);

  for (const [code, list] of Object.entries(hits).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`${code.padEnd(9)} ${String(list.length).padStart(4)}   e.g. ${list[0]}`);
  }

  console.log('\nSample of unclassifiable titles (first 30):');
  for (const m of misses.slice(0, 30)) console.log(`   ${m.drawingNo} — ${m.title}`);

  // Distinct title shapes among the misses tell us if they're still garbage.
  const shapes = new Map<string, number>();
  for (const m of misses) {
    const key = (m.title || '(empty)').replace(/\d+/g, '#').slice(0, 50);
    shapes.set(key, (shapes.get(key) ?? 0) + 1);
  }
  console.log('\nMost common unclassifiable title shapes:');
  for (const [k, v] of [...shapes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
    console.log(`   ${String(v).padStart(4)}  ${k}`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
