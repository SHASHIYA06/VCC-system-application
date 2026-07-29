/**
 * Audits the System table: which codes exist, what each is attached to, and
 * which are orphans / near-duplicates. Read-only.
 * Run: DATABASE_URL="..." npx tsx scripts/audit-systems.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      code: string;
      name: string;
      sortOrder: number | null;
      devices: bigint;
      drawings: bigint;
      subsystems: bigint;
    }>
  >`
    SELECT s.id, s."code", s."name", s."sortOrder",
           COALESCE(dv.cnt,0) AS devices,
           COALESCE(dr.cnt,0) AS drawings,
           COALESCE(sb.cnt,0) AS subsystems
    FROM "System" s
    LEFT JOIN (SELECT "systemId", COUNT(*) cnt FROM "Device"    GROUP BY 1) dv ON dv."systemId"=s.id
    LEFT JOIN (SELECT "systemId", COUNT(*) cnt FROM "Drawing"   GROUP BY 1) dr ON dr."systemId"=s.id
    LEFT JOIN (SELECT "systemId", COUNT(*) cnt FROM "Subsystem" GROUP BY 1) sb ON sb."systemId"=s.id
    ORDER BY s."sortOrder" NULLS LAST, s."code"`;

  const wireCov = await prisma.$queryRaw<Array<{ sys: string; wires: bigint }>>`
    SELECT COALESCE(cs."code", ds."code") AS sys, COUNT(DISTINCT we."wireId") AS wires
    FROM "WireEndpoint" we
    LEFT JOIN "Connector" c ON c.id = we."connectorId"
    LEFT JOIN "Drawing"  cd ON cd.id = c."drawingId"
    LEFT JOIN "System"   cs ON cs.id = cd."systemId"
    LEFT JOIN "Device"    d ON d.id = we."deviceId"
    LEFT JOIN "System"   ds ON ds.id = d."systemId"
    WHERE COALESCE(cs."code", ds."code") IS NOT NULL
    GROUP BY 1`;
  const wireMap = new Map(wireCov.map((r) => [r.sys, Number(r.wires)]));

  console.log(`\nSystem table: ${rows.length} rows\n`);
  console.log(
    'code'.padEnd(12) +
      'devices'.padStart(8) +
      'drawings'.padStart(9) +
      'subsys'.padStart(7) +
      'wires'.padStart(7) +
      '  name',
  );
  console.log('-'.repeat(84));

  const orphans: string[] = [];
  for (const r of rows) {
    const w = wireMap.get(r.code) ?? 0;
    const dv = Number(r.devices);
    const dr = Number(r.drawings);
    const sb = Number(r.subsystems);
    if (dv === 0 && dr === 0 && sb === 0 && w === 0) orphans.push(r.code);
    console.log(
      r.code.padEnd(12) +
        String(dv).padStart(8) +
        String(dr).padStart(9) +
        String(sb).padStart(7) +
        String(w).padStart(7) +
        '  ' +
        r.name,
    );
  }

  console.log(`\nFully orphaned systems (nothing attached): ${orphans.length}`);
  if (orphans.length) console.log('  ' + orphans.join(', '));

  // Codes referenced by wire data but missing from System — would break filters.
  const missing = [...wireMap.keys()].filter((k) => !rows.some((r) => r.code === k));
  console.log(`\nWire-referenced codes absent from System: ${missing.length}`);
  if (missing.length) console.log('  ' + missing.join(', '));

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
