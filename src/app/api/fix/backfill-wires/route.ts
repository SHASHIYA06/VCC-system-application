import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Starting high-speed SQL Backfill & Pin Seeding API ===');
    
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
        AND NOT EXISTS (
          SELECT 1 FROM "ConnectorPin" cp 
          WHERE cp."connectorId" = we."connectorId" 
            AND cp."pinNo" = we."endpointPin"
        )
      GROUP BY we."connectorId", we."endpointPin";
    `);
    console.log(`Pass 0A: Created ${newPinsFromEndpoints} missing ConnectorPins from WireEndpoints`);

    // Pass 0B: Create missing ConnectorPin records referenced by Wire source pins
    const newPinsFromSources = await prisma.$executeRawUnsafe(`
      INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "extra", "wireNo", "signalName")
      SELECT 
        'cp_src_' || substr(md5(c.id || w."sourcePin" || random()::text), 1, 16),
        c.id,
        w."sourcePin",
        '{}'::jsonb,
        w."wireNo",
        w."signalName"
      FROM "Wire" w
      JOIN "Connector" c ON w."sourceConnector" = c."connectorCode"
      WHERE w."sourcePin" IS NOT NULL 
        AND w."sourcePin" != ''
        AND NOT EXISTS (
          SELECT 1 FROM "ConnectorPin" cp 
          WHERE cp."connectorId" = c.id 
            AND cp."pinNo" = w."sourcePin"
        )
      GROUP BY c.id, w."sourcePin", w."wireNo", w."signalName";
    `);
    console.log(`Pass 0B: Created ${newPinsFromSources} missing ConnectorPins from Wire sources`);

    // Pass 0C: Create missing ConnectorPin records referenced by Wire dest pins
    const newPinsFromDests = await prisma.$executeRawUnsafe(`
      INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "extra", "wireNo", "signalName")
      SELECT 
        'cp_dst_' || substr(md5(c.id || w."destPin" || random()::text), 1, 16),
        c.id,
        w."destPin",
        '{}'::jsonb,
        w."wireNo",
        w."signalName"
      FROM "Wire" w
      JOIN "Connector" c ON w."destConnector" = c."connectorCode"
      WHERE w."destPin" IS NOT NULL 
        AND w."destPin" != ''
        AND NOT EXISTS (
          SELECT 1 FROM "ConnectorPin" cp 
          WHERE cp."connectorId" = c.id 
            AND cp."pinNo" = w."destPin"
        )
      GROUP BY c.id, w."destPin", w."wireNo", w."signalName";
    `);
    console.log(`Pass 0C: Created ${newPinsFromDests} missing ConnectorPins from Wire destinations`);

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

    return NextResponse.json({
      success: true,
      summary: {
        pinsCreatedFromEndpoints: newPinsFromEndpoints,
        pinsCreatedFromSources: newPinsFromSources,
        pinsCreatedFromDests: newPinsFromDests,
        endpointsLinked: pass1Count,
        pinsUpdatedViaEndpoints: pass2Count,
        pinsUpdatedViaSources: pass3Count,
        pinsUpdatedViaDestinations: pass4Count,
        totalUpdated: pass2Count + pass3Count + pass4Count
      }
    });

  } catch (error) {
    console.error('SQL Backfill API failed:', error);
    return NextResponse.json(
      { success: false, error: 'Database update failed', details: String(error) },
      { status: 500 }
    );
  }
}
