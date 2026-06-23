/**
 * APPLY DATA INTEGRITY REPAIR (standalone, idempotent, additive)
 *
 * Mirrors /api/fix/data-integrity but runs directly against the DB using the
 * DIRECT_URL so it cannot time out behind a serverless function.
 *
 *   1. Create missing Wire rows referenced by pins (restores traceability)
 *   2. Link every pin carrying a wireNo to its Wire via WireEndpoint
 *   3. Mark drawings synced where a page mapping exists
 *   4. Assign orphaned devices to their drawing's system
 *
 * Usage:
 *   npx tsx scripts/apply-data-integrity.ts            (dry run, default)
 *   npx tsx scripts/apply-data-integrity.ts --apply    (writes changes)
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

async function scalar(sql: string): Promise<number> {
  const rows = await prisma.$queryRawUnsafe<{ count: bigint }[]>(sql);
  return Number(rows[0].count);
}

async function main() {
  console.log(`\n=== DATA INTEGRITY REPAIR (${APPLY ? 'APPLY' : 'DRY RUN'}) ===\n`);
  const t0 = Date.now();

  // --- 1. Missing wires referenced by pins -------------------------------
  const missingWires = await scalar(
    `SELECT COUNT(DISTINCT p."wireNo")::bigint AS count
     FROM "ConnectorPin" p
     WHERE p."wireNo" IS NOT NULL AND p."wireNo" <> ''
       AND NOT EXISTS (SELECT 1 FROM "Wire" w WHERE w."wireNo" = p."wireNo")`
  );
  console.log(`1. Missing Wire rows referenced by pins: ${missingWires}`);
  if (APPLY && missingWires > 0) {
    const created = await prisma.$executeRawUnsafe(
      `INSERT INTO "Wire" (id, "wireNo", "signalName", description, "createdAt", "updatedAt")
       SELECT gen_random_uuid()::text, src."wireNo", src."signalName",
              'Auto-created from connector pin mapping', now(), now()
       FROM (
         SELECT DISTINCT ON (p."wireNo") p."wireNo", NULLIF(p."signalName", '') AS "signalName"
         FROM "ConnectorPin" p
         WHERE p."wireNo" IS NOT NULL AND p."wireNo" <> ''
           AND NOT EXISTS (SELECT 1 FROM "Wire" w WHERE w."wireNo" = p."wireNo")
         ORDER BY p."wireNo", p."signalName" NULLS LAST
       ) src
       ON CONFLICT ("wireNo") DO NOTHING`
    );
    console.log(`   → created ${created} wires`);
  }

  // --- 2. Wire endpoints from pins ---------------------------------------
  const endpointCandidates = await scalar(
    `SELECT COUNT(*)::bigint AS count
     FROM "ConnectorPin" p
     JOIN "Wire" w ON w."wireNo" = p."wireNo"
     WHERE p."wireNo" IS NOT NULL AND p."wireNo" <> ''
       AND NOT EXISTS (
         SELECT 1 FROM "WireEndpoint" e WHERE e."wireId" = w.id AND e."pinId" = p.id
       )`
  );
  console.log(`2. Pin→Wire endpoints to create: ${endpointCandidates}`);
  if (APPLY && endpointCandidates > 0) {
    const created = await prisma.$executeRawUnsafe(
      `INSERT INTO "WireEndpoint"
         (id, "wireId", "pinId", "connectorId", "endpointRole", "endpointLabel", "createdAt")
       SELECT gen_random_uuid()::text, w.id, p.id, p."connectorId", 'PIN',
              COALESCE(NULLIF(p."pinLabel", ''), p."pinNo"), now()
       FROM "ConnectorPin" p
       JOIN "Wire" w ON w."wireNo" = p."wireNo"
       WHERE p."wireNo" IS NOT NULL AND p."wireNo" <> ''
         AND NOT EXISTS (
           SELECT 1 FROM "WireEndpoint" e WHERE e."wireId" = w.id AND e."pinId" = p.id
         )`
    );
    console.log(`   → created ${created} endpoints`);
  }

  // --- 3. Mark drawings synced where a page mapping exists ---------------
  const unsyncedWithMapping = await prisma.drawing.count({
    where: { isSynced: false, pageMappings: { some: {} } },
  });
  console.log(`3. Drawings to mark synced: ${unsyncedWithMapping}`);
  if (APPLY && unsyncedWithMapping > 0) {
    const updated = await prisma.$executeRawUnsafe(
      `UPDATE "Drawing" d SET "isSynced" = true, "syncedAt" = now()
       WHERE d."isSynced" = false
         AND EXISTS (SELECT 1 FROM "DrawingPageMapping" m WHERE m."drawingId" = d.id)`
    );
    console.log(`   → synced ${updated} drawings`);
  }

  // --- 4. Assign orphaned devices to their drawing's system --------------
  const devicesFixable = await scalar(
    `SELECT COUNT(*)::bigint AS count
     FROM "Device" dev
     JOIN "Drawing" d ON d.id = dev."drawingId"
     WHERE dev."systemId" IS NULL AND d."systemId" IS NOT NULL`
  );
  console.log(`4. Orphaned devices fixable via drawing: ${devicesFixable}`);
  if (APPLY && devicesFixable > 0) {
    const updated = await prisma.$executeRawUnsafe(
      `UPDATE "Device" dev SET "systemId" = d."systemId"
       FROM "Drawing" d
       WHERE d.id = dev."drawingId" AND dev."systemId" IS NULL AND d."systemId" IS NOT NULL`
    );
    console.log(`   → fixed ${updated} devices`);
  }

  console.log(`\nDone in ${Date.now() - t0}ms. ${APPLY ? 'Changes applied.' : 'Dry run — re-run with --apply to write.'}\n`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
