import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function t<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const t0 = Date.now();
  const r = await fn();
  const n = Array.isArray(r) ? r.length : '';
  console.log(`  ${String(Date.now() - t0).padStart(6)}ms  ${label}  ${n !== '' ? `(${n} rows)` : ''}`);
  return r;
}

async function main() {
  console.log('\nGSD sampling strategies:\n');

  await t('baseline SELECT 1', () => prisma.$queryRaw`SELECT 1`);

  await t('GROUP BY wireId HAVING >=2 LIMIT 250', () => prisma.$queryRaw<any[]>`
    SELECT we."wireId" FROM "WireEndpoint" we
    GROUP BY we."wireId" HAVING COUNT(*) >= 2 LIMIT 250`);

  await t('flat endpoints, no order, LIMIT 3000', () => prisma.$queryRaw<any[]>`
    SELECT we."wireId", we."connectorId", we."deviceId"
    FROM "WireEndpoint" we LIMIT 3000`);

  await t('self-join pairs LIMIT 250', () => prisma.$queryRaw<any[]>`
    SELECT a."wireId", a."connectorId" AS c1, b."connectorId" AS c2
    FROM "WireEndpoint" a
    JOIN "WireEndpoint" b ON b."wireId" = a."wireId" AND b.id > a.id
    WHERE a."connectorId" IS NOT NULL AND b."connectorId" IS NOT NULL
    LIMIT 250`);

  await t('DISTINCT ON wire pairs via window LIMIT 250', () => prisma.$queryRaw<any[]>`
    WITH ranked AS (
      SELECT we."wireId", we."connectorId", we."deviceId",
             ROW_NUMBER() OVER (PARTITION BY we."wireId" ORDER BY we.id) AS rn
      FROM "WireEndpoint" we
      WHERE we."connectorId" IS NOT NULL OR we."deviceId" IS NOT NULL
    )
    SELECT * FROM ranked WHERE rn <= 2 LIMIT 500`);

  await t('indexes on WireEndpoint', () => prisma.$queryRaw<any[]>`
    SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'WireEndpoint'`)
    .then((r: any[]) => r.forEach((i) => console.log(`            ${i.indexname}`)));

  console.log();
}

main().catch(console.error).finally(() => prisma.$disconnect());
