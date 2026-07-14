require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function deepWireAudit() {
    const prisma = new PrismaClient({
        datasources: { db: { url: process.env.DIRECT_URL } }
    });

    try {
        await prisma.$connect();
        console.log('Connected to database successfully');

        console.log('\n=== DEEP WIRE AUDIT ===\n');

        // Check all wire-related tables
        const tables = [
            { name: 'Wire', model: 'wire', count: 0 },
            { name: 'WireEndpoint', model: 'wireEndpoint', count: 0 },
            { name: 'DrawingWire', model: 'drawingWire', count: 0 },
            { name: 'ConnectorPin', model: 'connectorPin', count: 0 },
            { name: 'WireConnection', model: 'wireConnection', count: 0 },
            { name: 'WireSegment', model: 'wireSegment', count: 0 }
        ];

        console.log('1. Current wire-related table counts:');
        for (const table of tables) {
            try {
                table.count = await prisma[table.model].count();
                console.log(`   ${table.name}: ${table.count.toLocaleString()}`);
            } catch (e) {
                console.log(`   ${table.name}: Error - ${e.message}`);
            }
        }

        // Check wire status distribution
        console.log('\n2. Wire status distribution:');
        try {
            const statusCounts = await prisma.$queryRaw`
        SELECT "wireStatus", COUNT(*) as count
        FROM "Wire"
        GROUP BY "wireStatus"
        ORDER BY count DESC
      `;
            statusCounts.forEach(row => {
                console.log(`   ${row.wireStatus || 'NULL'}: ${parseInt(row.count).toLocaleString()}`);
            });
        } catch (e) {
            console.log(`   Error retrieving status distribution: ${e.message}`);
        }

        // Sample some wires to see what we have
        console.log('\n3. Sample wires (first 10):');
        try {
            const sampleWires = await prisma.wire.findMany({
                take: 10,
                orderBy: { wireNo: 'asc' }
            });
            sampleWires.forEach(wire => {
                console.log(`   ${wire.wireNo}: ${wire.signalName || 'No signal name'} (${wire.wireStatus || 'No status'})`);
            });
        } catch (e) {
            console.log(`   Error retrieving sample wires: ${e.message}`);
        }

        // Check if there are any synthetic wires vs verified
        console.log('\n4. Wire verification status:');
        try {
            const verificationStats = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN "wireStatus" = 'VERIFIED' THEN 1 END) as verified,
          COUNT(CASE WHEN "wireStatus" = 'SYNTHETIC' THEN 1 END) as synthetic,
          COUNT(CASE WHEN "wireStatus" = 'UNVERIFIED' THEN 1 END) as unverified,
          COUNT(CASE WHEN "wireStatus" IS NULL THEN 1 END) as null_status
        FROM "Wire"
      `;

            const stats = verificationStats[0];
            console.log(`   Total: ${parseInt(stats.total).toLocaleString()}`);
            console.log(`   Verified: ${parseInt(stats.verified).toLocaleString()}`);
            console.log(`   Synthetic: ${parseInt(stats.synthetic).toLocaleString()}`);
            console.log(`   Unverified: ${parseInt(stats.unverified).toLocaleString()}`);
            console.log(`   Null status: ${parseInt(stats.null_status).toLocaleString()}`);
        } catch (e) {
            console.log(`   Error retrieving verification stats: ${e.message}`);
        }

        // Check drawing-wire relationships
        console.log('\n5. Drawing-wire relationship analysis:');
        try {
            const drawingWireStats = await prisma.$queryRaw`
        SELECT 
          COUNT(DISTINCT "drawingId") as drawings_with_wires,
          COUNT(DISTINCT "wireId") as unique_wires_linked,
          COUNT(*) as total_links
        FROM "DrawingWire"
      `;

            const stats = drawingWireStats[0];
            console.log(`   Drawings with wires: ${parseInt(stats.drawings_with_wires).toLocaleString()}`);
            console.log(`   Unique wires linked: ${parseInt(stats.unique_wires_linked).toLocaleString()}`);
            console.log(`   Total links: ${parseInt(stats.total_links).toLocaleString()}`);
        } catch (e) {
            console.log(`   Error retrieving drawing-wire stats: ${e.message}`);
        }

        // Check connector-pin relationships
        console.log('\n6. Connector-pin analysis:');
        try {
            const connectorPinStats = await prisma.$queryRaw`
        SELECT 
          COUNT(DISTINCT "connectorId") as connectors_with_pins,
          COUNT(*) as total_pins,
          COUNT(CASE WHEN "wireNo" IS NOT NULL THEN 1 END) as pins_with_wires
        FROM "ConnectorPin"
      `;

            const stats = connectorPinStats[0];
            console.log(`   Connectors with pins: ${parseInt(stats.connectors_with_pins).toLocaleString()}`);
            console.log(`   Total pins: ${parseInt(stats.total_pins).toLocaleString()}`);
            console.log(`   Pins with wires: ${parseInt(stats.pins_with_wires).toLocaleString()}`);
            if (stats.total_pins > 0) {
                const percentage = (parseInt(stats.pins_with_wires) / parseInt(stats.total_pins) * 100).toFixed(2);
                console.log(`   Percentage with wires: ${percentage}%`);
            }
        } catch (e) {
            console.log(`   Error retrieving connector-pin stats: ${e.message}`);
        }

        await prisma.$disconnect();
        console.log('\nDisconnected from database');

    } catch (error) {
        console.error('Database audit failed:', error.message);
        process.exit(1);
    }
}

deepWireAudit();