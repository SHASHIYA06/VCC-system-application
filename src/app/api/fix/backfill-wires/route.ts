import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Starting high-speed SQL Backfill API ===');
    
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
