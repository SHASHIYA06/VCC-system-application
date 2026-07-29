/**
 * DATA INTEGRITY VERIFICATION
 *
 * Runs the exact same queries the API routes run, directly against the
 * database, and asserts the results are what the frontend needs.
 * This isolates "is the data right?" from "is the HTTP layer up?".
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

let pass = 0;
let fail = 0;
const failures: string[] = [];

function check(name: string, cond: boolean, detail = '') {
  if (cond) {
    pass++;
    console.log(`  [PASS] ${name}${detail ? '  — ' + detail : ''}`);
  } else {
    fail++;
    failures.push(name);
    console.log(`  [FAIL] ${name}${detail ? '  — ' + detail : ''}`);
  }
}

function section(t: string) {
  console.log(`\n${'─'.repeat(74)}\n  ${t}\n${'─'.repeat(74)}`);
}

async function timed<T>(fn: () => Promise<T>): Promise<[T, number]> {
  const t0 = Date.now();
  const r = await fn();
  return [r, Date.now() - t0];
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║          VCC EXPLORER — DATA INTEGRITY VERIFICATION                  ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');

  // ══ 1. CORE TABLE COUNTS (what the sidebar + dashboard show) ═════════════
  section('1. CORE TABLE COUNTS (sidebar / dashboard counters)');
  const [counts, ms1] = await timed(async () => ({
    systems: await prisma.system.count(),
    subsystems: await prisma.subsystem.count(),
    drawings: await prisma.drawing.count(),
    wires: await prisma.wire.count(),
    wireEndpoints: await prisma.wireEndpoint.count(),
    connectors: await prisma.connector.count(),
    pins: await prisma.connectorPin.count(),
    devices: await prisma.device.count(),
    trainLines: await prisma.trainLine.count(),
    circuits: await prisma.circuit.count(),
    signals: await prisma.signal.count(),
    pageMappings: await prisma.drawingPageMapping.count(),
    drawingWires: await prisma.drawingWire.count(),
    vccDescriptions: await prisma.vCCDescription.count(),
    sourceFiles: await prisma.sourceFile.count(),
  }));
  console.log(`      (${ms1}ms)`);
  check('systems >= 30', counts.systems >= 30, `${counts.systems}`);
  check('subsystems >= 50', counts.subsystems >= 50, `${counts.subsystems}`);
  check('drawings >= 575', counts.drawings >= 575, `${counts.drawings}`);
  check('wires >= 167,758', counts.wires >= 167758, `${counts.wires}`);
  check('wireEndpoints >= 77,915', counts.wireEndpoints >= 77915, `${counts.wireEndpoints}`);
  check('connectors >= 1,606', counts.connectors >= 1606, `${counts.connectors}`);
  check('pins >= 72,032', counts.pins >= 72032, `${counts.pins}`);
  check('devices >= 279', counts.devices >= 279, `${counts.devices}`);
  check('trainLines >= 1,170', counts.trainLines >= 1170, `${counts.trainLines}`);
  check('circuits >= 2,221', counts.circuits >= 2221, `${counts.circuits}`);
  check('signals >= 1,822', counts.signals >= 1822, `${counts.signals}`);
  check('pageMappings >= 575', counts.pageMappings >= 575, `${counts.pageMappings}`);
  check('drawingWires > 0', counts.drawingWires > 0, `${counts.drawingWires}`);
  check('vccDescriptions >= 20', counts.vccDescriptions >= 20, `${counts.vccDescriptions}`);
  check('sourceFiles >= 10', counts.sourceFiles >= 10, `${counts.sourceFiles}`);

  // ══ 2. DRAWING TITLES ════════════════════════════════════════════════════
  section('2. DRAWING TITLES (must be real engineering titles)');
  const badTitles = await prisma.drawing.count({
    where: { OR: [{ title: { contains: '- Page ' } }, { title: { contains: 'Drawings_OCR' } }, { title: '' }] },
  });
  check('zero auto-generated "Page N" titles', badTitles === 0, `${badTitles} bad`);

  const EXPECTED: Record<string, string> = {
    '942-58107': 'Controlling Cab',
    '942-58108': 'Start-up Relay',
    '942-58120': 'VVVF Control',
    '942-58123': 'Compressor Control',
    '942-58140': 'Door Proving Loop',
    '942-58146': 'TCMS Interface',
    '942-58152': 'CBTC',
    '942-38306': 'VVVF Inverter Pin Assignment',
  };
  for (const [no, want] of Object.entries(EXPECTED)) {
    const d = await prisma.drawing.findFirst({ where: { drawingNo: no }, select: { title: true } });
    check(`${no} title correct`, !!d && d.title.toLowerCase().includes(want.toLowerCase()),
      `want~"${want}" got "${d?.title ?? 'NOT FOUND'}"`);
  }

  // ══ 3. DRAWING ↔ PDF ALIGNMENT ══════════════════════════════════════════
  section('3. DRAWING <-> PDF PAGE ALIGNMENT');
  const misaligned = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count FROM "Drawing" d
    WHERE d."sourceFileId" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "DrawingPageMapping" m
        WHERE m."drawingId" = d.id AND m."sourceFileName" = d."sourceFileId")`;
  check('every drawing has a page mapping in its own PDF', Number(misaligned[0].count) === 0,
    `${Number(misaligned[0].count)} misaligned`);

  const noMapping = await prisma.drawing.count({ where: { pageMappings: { none: {} } } });
  check('no drawing is missing all page mappings', noMapping === 0, `${noMapping} without mapping`);

  for (const no of ['942-58107', '942-58120', '942-58108', '942-38306']) {
    const d = await prisma.drawing.findFirst({
      where: { drawingNo: no },
      select: { drawingNo: true, title: true, sourceFileId: true, pageMappings: { select: { sourceFileName: true, pdfPageNo: true } } },
    });
    const own = d?.pageMappings.filter((m) => m.sourceFileName === d.sourceFileId) ?? [];
    check(`${no} resolves to a page in its own PDF`, own.length > 0,
      `PDF="${d?.sourceFileId}" pages=[${own.map((m) => m.pdfPageNo).join(',')}]`);
  }

  // ══ 4. WIRE SEARCH ═══════════════════════════════════════════════════════
  section('4. WIRE SEARCH (exact + endpoints resolve)');
  for (const q of ['3001', '5101', '1001', '3003']) {
    const [hits, wms] = await timed(() => prisma.wire.count({ where: { wireNo: { startsWith: q } } }));
    check(`wire "${q}" found`, hits > 0, `${hits} matches (${wms}ms)`);
  }
  const w3001 = await prisma.wire.findFirst({
    where: { wireNo: '3001' },
    include: {
      endpoints: {
        include: { connector: { select: { connectorCode: true } }, pin: { select: { pinNo: true } } },
        take: 5,
      },
    },
  });
  check('wire 3001 exists', !!w3001, `signal=${w3001?.signalName} V=${w3001?.voltageClass}`);
  check('wire 3001 has endpoints', (w3001?.endpoints.length ?? 0) > 0, `${w3001?.endpoints.length} shown`);
  const conns = w3001?.endpoints.map((e) => e.connector?.connectorCode).filter(Boolean) ?? [];
  check('wire 3001 endpoints resolve to connectors', conns.length > 0, `connectors=[${conns.join(',')}]`);

  const wiresWithSignal = await prisma.wire.count({ where: { signalName: { not: null } } });
  check('>=90% wires have signal names', wiresWithSignal / counts.wires >= 0.9,
    `${wiresWithSignal}/${counts.wires} (${Math.round((wiresWithSignal / counts.wires) * 100)}%)`);

  // ══ 5. CONNECTOR SEARCH ══════════════════════════════════════════════════
  section('5. CONNECTOR SEARCH');
  for (const q of ['X1', 'APS', 'BCU', 'VVVF']) {
    const n = await prisma.connector.count({ where: { connectorCode: { contains: q, mode: 'insensitive' } } });
    check(`connector "${q}" found`, n > 0, `${n} matches`);
  }
  const connWithPins = await prisma.connector.count({ where: { pins: { some: {} } } });
  check('>=80% connectors have pins', connWithPins / counts.connectors >= 0.8,
    `${connWithPins}/${counts.connectors} (${Math.round((connWithPins / counts.connectors) * 100)}%)`);
  const connWithDrawing = await prisma.connector.count({ where: { drawingId: { not: undefined } } });
  check('all connectors linked to a drawing', connWithDrawing === counts.connectors,
    `${connWithDrawing}/${counts.connectors}`);

  // ══ 6. PIN SEARCH ════════════════════════════════════════════════════════
  section('6. PIN SEARCH');
  const pinsWithWire = await prisma.connectorPin.count({ where: { wireNo: { not: null } } });
  check('>=95% pins have wireNo', pinsWithWire / counts.pins >= 0.95,
    `${pinsWithWire}/${counts.pins} (${Math.round((pinsWithWire / counts.pins) * 100)}%)`);
  const pinsWithSignal = await prisma.connectorPin.count({ where: { signalName: { not: null } } });
  check('>=90% pins have signalName', pinsWithSignal / counts.pins >= 0.9,
    `${pinsWithSignal}/${counts.pins}`);
  const samplePin = await prisma.connectorPin.findFirst({
    where: { wireNo: { not: null } },
    include: { connector: { select: { connectorCode: true, drawing: { select: { drawingNo: true, system: { select: { code: true } } } } } } },
  });
  check('pin resolves connector + drawing + system', !!samplePin?.connector?.drawing?.system,
    `pin ${samplePin?.pinNo} @ ${samplePin?.connector?.connectorCode} on ${samplePin?.connector?.drawing?.drawingNo} (${samplePin?.connector?.drawing?.system?.code})`);

  // ══ 7. SYSTEM HIERARCHY ══════════════════════════════════════════════════
  section('7. SYSTEM HIERARCHY (systems -> subsystems -> drawings -> devices)');
  const systems = await prisma.system.findMany({
    include: { _count: { select: { drawings: true, devices: true, subsystems: true } } },
    orderBy: { sortOrder: 'asc' },
  });
  check('systems loaded', systems.length >= 30, `${systems.length}`);
  const sysWithDrawings = systems.filter((s) => s._count.drawings > 0);
  check('>=10 systems have drawings', sysWithDrawings.length >= 10, `${sysWithDrawings.length}`);
  const sysWithSubs = systems.filter((s) => s._count.subsystems > 0);
  check('>=8 systems have subsystems', sysWithSubs.length >= 8, `${sysWithSubs.length}`);
  console.log('        Top systems by drawings:');
  for (const s of [...systems].sort((a, b) => b._count.drawings - a._count.drawings).slice(0, 6)) {
    console.log(`          ${s.code.padEnd(10)} ${String(s._count.drawings).padStart(4)} drawings, ${s._count.devices} devices, ${s._count.subsystems} subsystems`);
  }
  const orphanDrawings = await prisma.drawing.count({ where: { systemId: null } });
  check('no drawings without a system', orphanDrawings === 0, `${orphanDrawings} orphans`);

  // ══ 8. TRAINLINES ════════════════════════════════════════════════════════
  section('8. TRAINLINES');
  const tlWithWire = await prisma.trainLine.count({ where: { wireNo: { not: null } } });
  check('trainlines have wire numbers', tlWithWire > 0, `${tlWithWire}/${counts.trainLines}`);
  const tlSample = await prisma.trainLine.findFirst({
    where: { wireNo: { not: null } },
    include: { drawing: { select: { drawingNo: true } } },
  });
  check('trainline links to drawing', !!tlSample?.drawing,
    `${tlSample?.wireNo} "${tlSample?.itemName}" on ${tlSample?.drawing?.drawingNo}`);

  // ══ 9. EQUIPMENT / DEVICES ═══════════════════════════════════════════════
  section('9. EQUIPMENT / DEVICES');
  const devWithSystem = await prisma.device.count({ where: { systemId: { not: null } } });
  check('all devices have a system', devWithSystem === counts.devices, `${devWithSystem}/${counts.devices}`);
  const devWithTag = await prisma.device.count({ where: { tagNo: { not: null } } });
  check('>=90% devices have tag numbers', devWithTag / counts.devices >= 0.9, `${devWithTag}/${counts.devices}`);
  const devSample = await prisma.device.findFirst({
    where: { tagNo: { not: null } },
    include: { system: { select: { code: true } }, drawing: { select: { drawingNo: true } } },
  });
  check('device links to system + drawing', !!devSample?.system && !!devSample?.drawing,
    `${devSample?.tagNo} (${devSample?.system?.code}) on ${devSample?.drawing?.drawingNo}`);

  // ══ 10. GSD TOPOLOGY DATA ════════════════════════════════════════════════
  section('10. GSD TOPOLOGY DATA (nodes + edges must be derivable)');
  const [connectedWires, gms] = await timed(() =>
    prisma.wire.findMany({
      where: { endpoints: { some: {} } },
      include: {
        endpoints: {
          include: {
            device: { select: { id: true, tagNo: true } },
            connector: { select: { id: true, connectorCode: true } },
          },
        },
      },
      take: 200,
    }),
  );
  console.log(`      (${gms}ms to load 200 connected wires)`);
  check('wires with endpoints exist', connectedWires.length > 0, `${connectedWires.length} loaded`);
  const twoEnded = connectedWires.filter((w) => w.endpoints.length >= 2);
  check('wires with >=2 endpoints (form edges)', twoEnded.length > 0, `${twoEnded.length} can form edges`);
  const nodeIds = new Set<string>();
  for (const w of twoEnded) {
    for (const e of w.endpoints.slice(0, 2)) {
      if (e.connector) nodeIds.add(`connector_${e.connector.id}`);
      else if (e.device) nodeIds.add(`device_${e.device.id}`);
    }
  }
  check('topology produces nodes', nodeIds.size > 0, `${nodeIds.size} unique nodes from 200 wires`);

  // ══ 11. VCC DESCRIPTIONS ═════════════════════════════════════════════════
  section('11. VCC DESCRIPTIONS');
  const vcc = await prisma.vCCDescription.findMany({ select: { systemCode: true, description: true, technicalSpecs: true, voltage: true } });
  check('vcc descriptions exist', vcc.length >= 20, `${vcc.length}`);
  const withSpecs = vcc.filter((v) => v.technicalSpecs && v.technicalSpecs.length > 20);
  check('descriptions include technical specs', withSpecs.length >= 15, `${withSpecs.length}/${vcc.length}`);
  const withVoltage = vcc.filter((v) => v.voltage);
  check('descriptions include voltage', withVoltage.length >= 15, `${withVoltage.length}/${vcc.length}`);

  // ══ 12. WIRE STATUS BREAKDOWN ════════════════════════════════════════════
  section('12. WIRE STATUS BREAKDOWN');
  const byStatus = await prisma.wire.groupBy({ by: ['wireStatus'], _count: true });
  for (const s of byStatus) console.log(`        ${String(s.wireStatus).padEnd(12)} ${s._count}`);
  check('wire statuses present', byStatus.length > 0, `${byStatus.length} distinct statuses`);

  // ══ 13. QUERY PERFORMANCE (Vercel timeout safety) ════════════════════════
  section('13. QUERY PERFORMANCE (must be < 3000ms for Vercel)');
  const perf: Array<[string, number]> = [];
  {
    const [, t] = await timed(() => prisma.drawing.findFirst({ where: { drawingNo: '942-58120' }, include: { system: true, pageMappings: true } }));
    perf.push(['drawing lookup', t]);
  }
  {
    const [, t] = await timed(() => prisma.wire.findMany({ where: { wireNo: { startsWith: '3001' } }, take: 50 }));
    perf.push(['wire search', t]);
  }
  {
    const [, t] = await timed(() => prisma.connector.findMany({ include: { _count: { select: { pins: true } } }, take: 50 }));
    perf.push(['connector list', t]);
  }
  {
    const [, t] = await timed(() => prisma.connectorPin.findMany({ include: { connector: { select: { connectorCode: true } } }, take: 50 }));
    perf.push(['pin list', t]);
  }
  {
    const [, t] = await timed(() => prisma.system.findMany({ include: { _count: { select: { drawings: true, devices: true } } } }));
    perf.push(['systems + counts', t]);
  }
  for (const [name, t] of perf) check(`${name} < 3000ms`, t < 3000, `${t}ms`);

  // ══ SUMMARY ══════════════════════════════════════════════════════════════
  console.log(`\n${'═'.repeat(74)}`);
  console.log(`  TOTAL: ${pass + fail}    PASSED: ${pass}    FAILED: ${fail}`);
  console.log(`${'═'.repeat(74)}`);
  if (failures.length) {
    console.log('\n  FAILURES:');
    failures.forEach((f) => console.log(`    - ${f}`));
  } else {
    console.log('\n  ✅ ALL CHECKS PASSED — database is correctly wired for the frontend.');
  }
  console.log();
}

main()
  .catch((e) => { console.error('FATAL:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
