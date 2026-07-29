/**
 * Isolates the cost of each query inside getSystemTopology so we know which one
 * to optimise, and prototypes a SQL-side system filter.
 * Run: DATABASE_URL="..." npx tsx scripts/profile-gsd4.ts
 */
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const WIRE_SAMPLE = 250;

async function t<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const t0 = Date.now();
  const r = await fn();
  console.log(`  ${String(Date.now() - t0).padStart(6)}ms  ${label}`);
  return r;
}

async function main() {
  await t('warmup', () => prisma.$queryRaw`SELECT 1`);
  console.log('\n--- individual queries (sequential) ---');

  await t('A. systemsInfo aggregate', () => prisma.$queryRaw`
    SELECT s."code", s."name",
           COALESCE(d.cnt, 0) AS devices, COALESCE(w.cnt, 0) AS drawings
    FROM "System" s
    LEFT JOIN (SELECT "systemId", COUNT(*) AS cnt FROM "Device"  GROUP BY "systemId") d ON d."systemId" = s.id
    LEFT JOIN (SELECT "systemId", COUNT(*) AS cnt FROM "Drawing" GROUP BY "systemId") w ON w."systemId" = s.id
    ORDER BY s."sortOrder" ASC, s."code" ASC`);

  await t('B. statistics totals (reltuples)', () => prisma.$queryRaw`
    SELECT (SELECT COUNT(*) FROM "Device") AS devices,
           (SELECT COUNT(*) FROM "System") AS systems,
           (SELECT COUNT(*) FROM "Connector") AS connectors,
           GREATEST((SELECT reltuples::bigint FROM pg_class WHERE relname='Wire'),0) AS wires,
           GREATEST((SELECT reltuples::bigint FROM pg_class WHERE relname='WireEndpoint'),0) AS endpoints`);

  await t('C. devicesBySystem groups', () => prisma.$queryRaw`
    SELECT s."code", COUNT(d.id) AS cnt FROM "System" s
    JOIN "Device" d ON d."systemId" = s.id GROUP BY s."code" ORDER BY cnt DESC`);

  const rows = await t('D. graph CTE (current, unfiltered)', () => prisma.$queryRaw<any[]>`
    WITH ranked AS (
      SELECT we."wireId", we."connectorId", we."deviceId", we."endpointRole", we."endpointPin",
             ROW_NUMBER() OVER (PARTITION BY we."wireId" ORDER BY we.id) AS rn
      FROM "WireEndpoint" we
      WHERE we."connectorId" IS NOT NULL OR we."deviceId" IS NOT NULL
    ),
    two_ended AS (SELECT DISTINCT "wireId" FROM ranked WHERE rn = 2 LIMIT ${WIRE_SAMPLE})
    SELECT r."wireId", r.rn, w."wireNo", c."connectorCode", d."tagNo"
    FROM ranked r
    JOIN two_ended t ON t."wireId" = r."wireId"
    JOIN "Wire" w ON w.id = r."wireId"
    LEFT JOIN "Connector" c ON c.id = r."connectorId"
    LEFT JOIN "Device" d ON d.id = r."deviceId"
    WHERE r.rn <= 2 ORDER BY r."wireId", r.rn`);
  console.log(`         -> ${rows.length} rows`);

  console.log('\n--- prototype: SQL-side system filter ---');
  for (const sys of ['TCMS', 'DOOR', 'CCTV']) {
    const filter = Prisma.sql`
      WITH target_conn AS (
        SELECT c.id FROM "Connector" c
        JOIN "Drawing" cd ON cd.id = c."drawingId"
        JOIN "System" cs ON cs.id = cd."systemId"
        WHERE cs."code" = ${sys}
      ),
      target_dev AS (
        SELECT d.id FROM "Device" d
        JOIN "System" ds ON ds.id = d."systemId"
        WHERE ds."code" = ${sys}
      ),
      sys_wires AS (
        SELECT DISTINCT we."wireId" FROM "WireEndpoint" we
        WHERE we."connectorId" IN (SELECT id FROM target_conn)
           OR we."deviceId"    IN (SELECT id FROM target_dev)
      ),
      ranked AS (
        SELECT we."wireId", ROW_NUMBER() OVER (PARTITION BY we."wireId" ORDER BY we.id) AS rn
        FROM "WireEndpoint" we
        WHERE (we."connectorId" IS NOT NULL OR we."deviceId" IS NOT NULL)
          AND we."wireId" IN (SELECT "wireId" FROM sys_wires)
      )
      SELECT COUNT(*) AS n FROM (SELECT DISTINCT "wireId" FROM ranked WHERE rn = 2 LIMIT ${WIRE_SAMPLE}) x`;
    const r = await t(`E. system=${sys} candidate wires`, () => prisma.$queryRaw<any[]>(filter));
    console.log(`         -> ${r[0]?.n} wires`);
  }

  console.log('\n--- how many systems actually have wired endpoints? ---');
  const coverage = await t('F. wires per system', () => prisma.$queryRaw<any[]>`
    SELECT COALESCE(cs."code", ds."code") AS sys, COUNT(DISTINCT we."wireId") AS wires
    FROM "WireEndpoint" we
    LEFT JOIN "Connector" c ON c.id = we."connectorId"
    LEFT JOIN "Drawing"  cd ON cd.id = c."drawingId"
    LEFT JOIN "System"   cs ON cs.id = cd."systemId"
    LEFT JOIN "Device"    d ON d.id = we."deviceId"
    LEFT JOIN "System"   ds ON ds.id = d."systemId"
    WHERE COALESCE(cs."code", ds."code") IS NOT NULL
    GROUP BY 1 ORDER BY 2 DESC`);
  for (const c of coverage) console.log(`         ${c.sys}: ${c.wires}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
