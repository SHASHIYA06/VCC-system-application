import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * Consolidated, idempotent data-integrity repair.
 *
 * Fixes the root causes behind "missing connector/pin/wire details",
 * "drawing mapping shows wrongly" and orphaned equipment:
 *
 *  1. WIRE ENDPOINTS  - link every ConnectorPin that carries a wireNo to its
 *     Wire by creating a WireEndpoint row. This restores pin -> wire ->
 *     connector traceability (164k wires currently have no endpoint).
 *  2. DRAWING SYNC    - mark drawings as synced where a page mapping exists,
 *     so the mapping/dashboard stats reflect reality.
 *  3. DEVICE SYSTEMS  - assign orphaned devices to the system of their drawing.
 *
 * Run with ?dryRun=true (default) to preview counts WITHOUT writing.
 * Run with ?dryRun=false to apply. All operations are idempotent and additive
 * (no deletes), so they are safe to run repeatedly.
 */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get('dryRun') !== 'false';
  const startTime = Date.now();

  try {
    const result: Record<string, unknown> = { dryRun };

    // ---- 0. Create missing Wire rows referenced by pins -------------------
    // 69k pins reference wire numbers that have no Wire row, so they can never
    // be traced. Create a Wire row for each distinct missing wireNo (carrying
    // the pin's signal name where available) so the pin becomes traceable.
    const missingWires = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(DISTINCT p."wireNo")::bigint AS count
       FROM "ConnectorPin" p
       WHERE p."wireNo" IS NOT NULL AND p."wireNo" <> ''
         AND NOT EXISTS (SELECT 1 FROM "Wire" w WHERE w."wireNo" = p."wireNo")`
    );
    const wiresToCreate = Number(missingWires[0].count);
    let wiresCreated = 0;
    if (!dryRun && wiresToCreate > 0) {
      wiresCreated = await prisma.$executeRawUnsafe(
        `INSERT INTO "Wire" (id, "wireNo", "signalName", description, "createdAt", "updatedAt")
         SELECT gen_random_uuid()::text, src."wireNo", src."signalName",
                'Auto-created from connector pin mapping', now(), now()
         FROM (
           SELECT DISTINCT ON (p."wireNo") p."wireNo",
                  NULLIF(p."signalName", '') AS "signalName"
           FROM "ConnectorPin" p
           WHERE p."wireNo" IS NOT NULL AND p."wireNo" <> ''
             AND NOT EXISTS (SELECT 1 FROM "Wire" w WHERE w."wireNo" = p."wireNo")
           ORDER BY p."wireNo", p."signalName" NULLS LAST
         ) src
         ON CONFLICT ("wireNo") DO NOTHING`
      );
    }
    result.missingWires = { candidates: wiresToCreate, created: wiresCreated };

    // ---- 1. Wire endpoints from pins -------------------------------------
    // Count candidates against wires that exist now. In apply mode the wire
    // creation above has already run, so newly created wires are included.
    const countEndpointCandidates = async () =>
      Number(
        (
          await prisma.$queryRawUnsafe<{ count: bigint }[]>(
            `SELECT COUNT(*)::bigint AS count
             FROM "ConnectorPin" p
             JOIN "Wire" w ON w."wireNo" = p."wireNo"
             WHERE p."wireNo" IS NOT NULL AND p."wireNo" <> ''
               AND NOT EXISTS (
                 SELECT 1 FROM "WireEndpoint" e
                 WHERE e."wireId" = w.id AND e."pinId" = p.id
               )`
          )
        )[0].count
      );

    // In dry-run we also project how many endpoints become possible AFTER the
    // (not-yet-created) wires would exist, so the preview is realistic.
    const endpointsToCreate = dryRun
      ? Number(
          (
            await prisma.$queryRawUnsafe<{ count: bigint }[]>(
              `SELECT COUNT(*)::bigint AS count
               FROM "ConnectorPin" p
               WHERE p."wireNo" IS NOT NULL AND p."wireNo" <> ''
                 AND NOT EXISTS (
                   SELECT 1 FROM "WireEndpoint" e
                   JOIN "Wire" w2 ON w2.id = e."wireId"
                   WHERE w2."wireNo" = p."wireNo" AND e."pinId" = p.id
                 )`
            )
          )[0].count
        )
      : await countEndpointCandidates();

    let endpointsCreated = 0;
    if (!dryRun && endpointsToCreate > 0) {
      const inserted = await prisma.$executeRawUnsafe(
        `INSERT INTO "WireEndpoint"
           (id, "wireId", "pinId", "connectorId", "endpointRole", "endpointLabel", "createdAt")
         SELECT gen_random_uuid()::text, w.id, p.id, p."connectorId", 'PIN',
                COALESCE(NULLIF(p."pinLabel", ''), p."pinNo"), now()
         FROM "ConnectorPin" p
         JOIN "Wire" w ON w."wireNo" = p."wireNo"
         WHERE p."wireNo" IS NOT NULL AND p."wireNo" <> ''
           AND NOT EXISTS (
             SELECT 1 FROM "WireEndpoint" e
             WHERE e."wireId" = w.id AND e."pinId" = p.id
           )`
      );
      endpointsCreated = inserted;
    }
    result.wireEndpoints = {
      candidates: endpointsToCreate,
      created: endpointsCreated,
    };

    // ---- 2. Mark drawings synced where a page mapping exists -------------
    const unsyncedWithMapping = await prisma.drawing.count({
      where: { isSynced: false, pageMappings: { some: {} } },
    });
    let drawingsSynced = 0;
    if (!dryRun && unsyncedWithMapping > 0) {
      const updated = await prisma.$executeRawUnsafe(
        `UPDATE "Drawing" d
         SET "isSynced" = true, "syncedAt" = now()
         WHERE d."isSynced" = false
           AND EXISTS (SELECT 1 FROM "DrawingPageMapping" m WHERE m."drawingId" = d.id)`
      );
      drawingsSynced = updated;
    }
    result.drawingSync = {
      candidates: unsyncedWithMapping,
      synced: drawingsSynced,
    };

    // ---- 3. Assign orphaned devices to their drawing's system ------------
    const orphanDevicesFixable = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*)::bigint AS count
       FROM "Device" dev
       JOIN "Drawing" d ON d.id = dev."drawingId"
       WHERE dev."systemId" IS NULL AND d."systemId" IS NOT NULL`
    );
    const devicesFixable = Number(orphanDevicesFixable[0].count);
    let devicesFixed = 0;
    if (!dryRun && devicesFixable > 0) {
      const updated = await prisma.$executeRawUnsafe(
        `UPDATE "Device" dev
         SET "systemId" = d."systemId"
         FROM "Drawing" d
         WHERE d.id = dev."drawingId"
           AND dev."systemId" IS NULL
           AND d."systemId" IS NOT NULL`
      );
      devicesFixed = updated;
    }
    result.deviceSystems = {
      candidates: devicesFixable,
      fixed: devicesFixed,
    };

    result.executionTime = Date.now() - startTime;
    result.note = dryRun
      ? 'DRY RUN — no changes were written. Re-run with ?dryRun=false to apply.'
      : 'Applied. All operations are idempotent and additive.';

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Data integrity repair error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/** GET returns a read-only audit of current data integrity. */
export async function GET() {
  try {
    const [
      drawings, drawingsSynced, pageMappings,
      connectors, connectorsNoPins,
      wires, wiresNoEndpoint, wireEndpoints,
      devices, devicesNoSystem,
    ] = await Promise.all([
      prisma.drawing.count(),
      prisma.drawing.count({ where: { isSynced: true } }),
      prisma.drawingPageMapping.count(),
      prisma.connector.count(),
      prisma.connector.count({ where: { pins: { none: {} } } }),
      prisma.wire.count(),
      prisma.wire.count({ where: { endpoints: { none: {} } } }),
      prisma.wireEndpoint.count(),
      prisma.device.count(),
      prisma.device.count({ where: { systemId: null } }),
    ]);

    return NextResponse.json({
      success: true,
      audit: {
        drawings: { total: drawings, synced: drawingsSynced },
        pageMappings,
        connectors: { total: connectors, withoutPins: connectorsNoPins },
        wires: { total: wires, withoutEndpoint: wiresNoEndpoint, endpoints: wireEndpoints },
        devices: { total: devices, withoutSystem: devicesNoSystem },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
