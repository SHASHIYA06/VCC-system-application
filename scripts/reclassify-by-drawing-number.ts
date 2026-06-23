/**
 * RECLASSIFY DRAWINGS BY DRAWING NUMBER (authoritative VCC scheme)
 *
 * The 942-58xxx schematic series and 942-38xxx pin series encode the owning
 * system in their number range. OCR titles are generic ("Page 21"), so the
 * drawing number — not the title — is the reliable signal.
 *
 * Ranges below are derived from ACCURATE_DRAWING_PAGE_MAPPINGS.ts notes and the
 * KMRCL VCC drawing index. Each rule maps a numeric range to a system code.
 *
 * Usage:
 *   npx tsx scripts/reclassify-by-drawing-number.ts          (dry run)
 *   npx tsx scripts/reclassify-by-drawing-number.ts --apply  (writes)
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

// Numeric-range rules for the 942-58 schematic series (the "5" middle digit).
// [startInclusive, endInclusive, systemCode]
// ONLY ranges documented/verified in ACCURATE_DRAWING_PAGE_MAPPINGS.ts and the
// KMRCL VCC drawing index are included. Undocumented high ranges are left in
// GEN rather than guessed, to preserve 100% classification accuracy.
const SCHEMATIC_RANGES: [number, number, string][] = [
  [58099, 58101, 'GEN'],    // Index, drawing list, symbols
  [58102, 58102, 'CAB'],    // Cab schematic
  [58103, 58108, 'TRAC'],   // Traction system + overview
  [58109, 58118, 'HV'],     // MCB / high-tension monitoring
  [58119, 58122, 'TRAC'],   // Traction power/control module
  [58123, 58129, 'BRAKE'],  // Brake compressor, loops, parking, horn
  [58130, 58136, 'APS'],    // APS distribution, shore supply, battery
  [58137, 58142, 'DOOR'],   // Door supply, operation, proving, interlock, TMS comm
  [58143, 58145, 'VAC'],    // VAC air conditioning
  [58146, 58146, 'TMS'],    // Train management system
  [58147, 58154, 'COMMS'],  // PA, data network, CCTV, fire, intercom
];

// 942-38 pin-drawing series by car/location. Only the CAB block is reliably
// number-encoded; the rest are disambiguated by title keywords instead.
const PIN_RANGES: [number, number, string][] = [
  [38101, 38199, 'CAB'],    // MC underframe + cab pins
];

function systemForDrawing(drawingNo: string, title: string): string | null {
  const upper = (title || '').toUpperCase();

  // 1) Strong title keywords always win (most specific).
  const titleRules: [string[], string][] = [
    [['DOOR'], 'DOOR'],
    [['COUPLER', 'COUPLING', 'UNCOUPLING'], 'COUPLING'],
    [['CCTV', 'PIS', 'PA SYSTEM', 'RADIO', 'COMMUNICATION', 'INTERCOM', 'ETHERNET', 'SPEAKER'], 'COMMS'],
    [['TCMS', 'TRAIN MANAGEMENT', 'TRAIN CONTROL', 'CCU'], 'TMS'],
    [['TRACTION', 'VVVF', 'INVERTER'], 'TRAC'],
    [['BRAKE', 'COMPRESSOR', 'AIR SUPPLY'], 'BRAKE'],
    [['HVAC', 'AIR CONDITION', 'VENTILATION', ' VAC'], 'VAC'],
    [['PANTOGRAPH', 'HIGH VOLTAGE', 'HIGH TENSION', 'VCB'], 'HV'],
    [['LIGHTING', 'ILLUMINATION'], 'LIGHT'],
    [['APS', 'AUXILIARY POWER', 'SIV', 'BATTERY'], 'APS'],
    [['BOGIE'], 'BOGIE'],
    [['DISPLAY', 'TFT', 'MONITOR'], 'DISPLAY'],
  ];
  for (const [keys, code] of titleRules) {
    if (keys.some(k => upper.includes(k.trim()))) return code;
  }

  // 2) Fall back to numeric range from the drawing number.
  const m = drawingNo.match(/942-(\d{5})/);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 58000 && n <= 58999) {
      for (const [lo, hi, code] of SCHEMATIC_RANGES) if (n >= lo && n <= hi) return code;
    }
    if (n >= 38000 && n <= 38999) {
      for (const [lo, hi, code] of PIN_RANGES) if (n >= lo && n <= hi) return code;
    }
  }
  return null;
}

async function main() {
  console.log(`\n=== RECLASSIFY BY DRAWING NUMBER (${APPLY ? 'APPLY' : 'DRY RUN'}) ===\n`);

  const systems = await prisma.system.findMany({ select: { id: true, code: true } });
  const systemMap = new Map(systems.map(s => [s.code, s.id]));

  const drawings = await prisma.drawing.findMany({
    select: { id: true, drawingNo: true, title: true, system: { select: { code: true } } },
  });

  const moves: Record<string, number> = {};
  let changes = 0;

  for (const d of drawings) {
    const target = systemForDrawing(d.drawingNo, d.title || '');
    if (!target || !systemMap.has(target)) continue;
    const current = d.system?.code || 'NONE';
    // Only move drawings sitting in the GEN catch-all (or unassigned). Never
    // override a drawing already placed in a specific system by earlier work.
    if (current !== 'GEN' && current !== 'NONE') continue;
    if (current === target) continue;

    const key = `${current} -> ${target}`;
    moves[key] = (moves[key] || 0) + 1;
    changes++;

    if (APPLY) {
      await prisma.drawing.update({ where: { id: d.id }, data: { systemId: systemMap.get(target)! } });
    }
  }

  console.log('Planned/applied moves:');
  Object.entries(moves).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k.padEnd(20)} ${v}`));
  console.log(`\nTotal: ${changes} drawings ${APPLY ? 'reclassified' : 'would be reclassified'}.`);
  console.log(APPLY ? 'Applied.' : 'Dry run — re-run with --apply to write.\n');

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
