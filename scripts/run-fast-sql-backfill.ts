import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Starting High-Speed SQL Backfill Script (Robust) ===\n');

  // Pass 0A: Create missing ConnectorPin records referenced by WireEndpoints
  const newPinsFromEndpoints = await prisma.$executeRawUnsafe(`
    INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "extra")
    SELECT 
      'cp_ep_' || substr(md5(we."connectorId" || we."endpointPin" || random()::text), 1, 16),
      we."connectorId",
      we."endpointPin",
      '{}'::jsonb
    FROM "WireEndpoint" we
    WHERE we."connectorId" IS NOT NULL 
      AND we."endpointPin" IS NOT NULL 
      AND we."endpointPin" != ''
    GROUP BY we."connectorId", we."endpointPin"
    ON CONFLICT ("connectorId", "pinNo") DO NOTHING;
  `);
  console.log(`Pass 0A: Created missing ConnectorPins from WireEndpoints (inserted or skipped via conflict: ${newPinsFromEndpoints})`);

  // Pass 0B: Create missing ConnectorPin records referenced by Wire source pins
  const newPinsFromSources = await prisma.$executeRawUnsafe(`
    INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "extra", "wireNo", "signalName")
    SELECT 
      'cp_src_' || substr(md5(c.id || w."sourcePin" || random()::text), 1, 16),
      c.id,
      w."sourcePin",
      '{}'::jsonb,
      MIN(w."wireNo"),
      MIN(w."signalName")
    FROM "Wire" w
    JOIN "Connector" c ON w."sourceConnector" = c."connectorCode"
    WHERE w."sourcePin" IS NOT NULL 
      AND w."sourcePin" != ''
    GROUP BY c.id, w."sourcePin"
    ON CONFLICT ("connectorId", "pinNo") DO NOTHING;
  `);
  console.log(`Pass 0B: Created missing ConnectorPins from Wire sources (inserted or skipped: ${newPinsFromSources})`);

  // Pass 0C: Create missing ConnectorPin records referenced by Wire dest pins
  const newPinsFromDests = await prisma.$executeRawUnsafe(`
    INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "extra", "wireNo", "signalName")
    SELECT 
      'cp_dst_' || substr(md5(c.id || w."destPin" || random()::text), 1, 16),
      c.id,
      w."destPin",
      '{}'::jsonb,
      MIN(w."wireNo"),
      MIN(w."signalName")
    FROM "Wire" w
    JOIN "Connector" c ON w."destConnector" = c."connectorCode"
    WHERE w."destPin" IS NOT NULL 
      AND w."destPin" != ''
    GROUP BY c.id, w."destPin"
    ON CONFLICT ("connectorId", "pinNo") DO NOTHING;
  `);
  console.log(`Pass 0C: Created missing ConnectorPins from Wire destinations (inserted or skipped: ${newPinsFromDests})`);

  // Pass 1: Update WireEndpoint.pinId from matching ConnectorPin
  const pass1Count = await prisma.$executeRawUnsafe(`
    UPDATE "WireEndpoint" we
    SET "pinId" = cp.id
    FROM "ConnectorPin" cp
    WHERE we."pinId" IS NULL
      AND we."connectorId" = cp."connectorId"
      AND we."endpointPin" = cp."pinNo";
  `);
  console.log(`Pass 1: Linked ${pass1Count} WireEndpoints to ConnectorPins`);

  // Pass 2: Update ConnectorPin.wireNo from linked WireEndpoint & Wire
  const pass2Count = await prisma.$executeRawUnsafe(`
    UPDATE "ConnectorPin" cp
    SET "wireNo" = w."wireNo",
        "signalName" = COALESCE(cp."signalName", w."signalName")
    FROM "WireEndpoint" we
    JOIN "Wire" w ON we."wireId" = w.id
    WHERE cp.id = we."pinId"
      AND cp."wireNo" IS NULL;
  `);
  console.log(`Pass 2: Backfilled ${pass2Count} ConnectorPins via endpoints`);

  // Pass 3: Update ConnectorPin.wireNo directly from Wire sourceConnector/sourcePin
  const pass3Count = await prisma.$executeRawUnsafe(`
    UPDATE "ConnectorPin" cp
    SET "wireNo" = w."wireNo",
        "signalName" = COALESCE(cp."signalName", w."signalName")
    FROM "Connector" c
    JOIN "Wire" w ON w."sourceConnector" = c."connectorCode"
    WHERE cp."connectorId" = c.id
      AND cp."pinNo" = w."sourcePin"
      AND cp."wireNo" IS NULL;
  `);
  console.log(`Pass 3: Backfilled ${pass3Count} ConnectorPins directly from Wire sources`);

  // Pass 4: Update ConnectorPin.wireNo directly from Wire destConnector/destPin
  const pass4Count = await prisma.$executeRawUnsafe(`
    UPDATE "ConnectorPin" cp
    SET "wireNo" = w."wireNo",
        "signalName" = COALESCE(cp."signalName", w."signalName")
    FROM "Connector" c
    JOIN "Wire" w ON w."destConnector" = c."connectorCode"
    WHERE cp."connectorId" = c.id
      AND cp."pinNo" = w."destPin"
      AND cp."wireNo" IS NULL;
  `);
  console.log(`Pass 4: Backfilled ${pass4Count} ConnectorPins directly from Wire destinations`);

  console.log('\n=== Fast SQL Backfill Completed Successfully! ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
