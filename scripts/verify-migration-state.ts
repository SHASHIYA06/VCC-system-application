/**
 * Confirms the migration history is healthy and the title-provenance data landed.
 * Run: DATABASE_URL="..." npx tsx scripts/verify-migration-state.ts
 */
import { prisma } from '../src/lib/prisma';

async function main() {
  const prov = await prisma.$queryRaw<
    Array<{ ts: string; isReference: boolean; n: bigint }>
  >`SELECT "titleSource"::text AS ts, "isReference", COUNT(*) AS n
      FROM "Drawing" GROUP BY 1, 2 ORDER BY 3 DESC`;
  console.log('Drawing titleSource / isReference:');
  for (const r of prov) {
    console.log(`  ${String(Number(r.n)).padStart(4)}  ${r.ts.padEnd(16)} isReference=${r.isReference}`);
  }

  const counts = await prisma.$queryRaw<Array<{ t: string; n: bigint }>>`
    SELECT 'Cable' AS t, COUNT(*) AS n FROM "Cable"
    UNION ALL SELECT 'Equipment', COUNT(*) FROM "Equipment"
    UNION ALL SELECT 'ConnectorType', COUNT(*) FROM "ConnectorType"
    UNION ALL SELECT 'DrawingVerificationStatus', COUNT(*) FROM "DrawingVerificationStatus"
    UNION ALL SELECT 'DeviceSpecification', COUNT(*) FROM "DeviceSpecification"`;
  console.log('\nTables touched by the unblocked migration:');
  for (const r of counts) console.log(`  ${String(Number(r.n)).padStart(6)}  ${r.t}`);

  const bad = await prisma.$queryRaw<Array<{ migration_name: string }>>`
    SELECT migration_name FROM _prisma_migrations
    WHERE finished_at IS NULL AND rolled_back_at IS NULL`;
  console.log(`\nMigrations in a failed/unfinished state: ${bad.length}`);
  for (const b of bad) console.log(`  ${b.migration_name}`);

  const connTypes = await prisma.$queryRaw<Array<{ n: bigint }>>`
    SELECT COUNT(*) AS n FROM "Connector" WHERE "connectorTypeCode" IS NOT NULL`;
  console.log(`Connectors now linked to a ConnectorType: ${Number(connTypes[0].n)}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
