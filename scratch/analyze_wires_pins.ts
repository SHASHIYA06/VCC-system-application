import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DIRECT_URL } }
});

async function main() {
    console.log('=== ANALYZING WIRE NO DISCREPANCIES ===');
    
    const wireCount = await prisma.wire.count();
    console.log(`Total Wires in 'Wire' table: ${wireCount}`);
    
    // Count distinct wireNo in ConnectorPin
    const distinctPinWireNos = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT "wireNo") as count 
        FROM "ConnectorPin" 
        WHERE "wireNo" IS NOT NULL AND "wireNo" != '';
    `;
    console.log(`Distinct wireNo in 'ConnectorPin': ${distinctPinWireNos[0].count}`);
    
    // Count distinct wireNo in WireEndpoint
    const distinctEndpointPins = await prisma.$queryRaw`
        SELECT COUNT(DISTINCT "endpointPin") as count 
        FROM "WireEndpoint" 
        WHERE "endpointPin" IS NOT NULL AND "endpointPin" != '';
    `;
    console.log(`Distinct endpointPin in 'WireEndpoint': ${distinctEndpointPins[0].count}`);

    // Let's see some sample mismatches between Wire.wireNo and ConnectorPin.wireNo
    const unmatchedPins = await prisma.$queryRaw`
        SELECT cp."wireNo", c."connectorCode", cp."pinNo"
        FROM "ConnectorPin" cp
        JOIN "Connector" c ON cp."connectorId" = c.id
        WHERE cp."wireNo" IS NOT NULL 
          AND cp."wireNo" NOT IN (SELECT "wireNo" FROM "Wire")
        LIMIT 10;
    `;
    console.log('\nSample ConnectorPins with wireNo NOT in Wire table:');
    unmatchedPins.forEach((row: any) => {
        console.log(`   Connector ${row.connectorCode} Pin ${row.pinNo}: WireNo = "${row.wireNo}"`);
    });

    const totalUnmatchedPins = await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM "ConnectorPin" cp
        WHERE cp."wireNo" IS NOT NULL 
          AND cp."wireNo" NOT IN (SELECT "wireNo" FROM "Wire");
    `;
    console.log(`Total ConnectorPins with wireNo NOT in Wire table: ${totalUnmatchedPins[0].count}`);

    process.exit(0);
}

main().catch(console.error);
