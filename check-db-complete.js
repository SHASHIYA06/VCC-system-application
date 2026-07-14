const { PrismaClient } = require('@prisma/client');

async function checkCompleteData() {
    const prisma = new PrismaClient({
        datasources: { db: { url: process.env.DIRECT_URL } }
    });

    try {
        await prisma.$connect();
        console.log('Connected to database successfully');

        // Check all key tables
        const tables = [
            { name: 'System', model: 'system', count: 0 },
            { name: 'Drawing', model: 'drawing', count: 0 },
            { name: 'Connector', model: 'connector', count: 0 },
            { name: 'Wire', model: 'wire', count: 0 },
            { name: 'CrossConnection', model: 'crossConnection', count: 0 },
            { name: 'CrossConnectionRule', model: 'crossConnectionRule', count: 0 },
            { name: 'VCCDescription', model: 'vCCDescription', count: 0 },
            { name: 'SystemMetadata', model: 'systemMetadata', count: 0 },
            { name: 'ReferenceDrawing', model: 'referenceDrawing', count: 0 },
            { name: 'Note', model: 'note', count: 0 },
            { name: 'DrawingApplicability', model: 'drawingApplicability', count: 0 }
        ];

        for (const table of tables) {
            try {
                table.count = await prisma[table.model].count();
                console.log(`${table.name}: ${table.count}`);
            } catch (e) {
                console.log(`${table.name}: Error - ${e.message}`);
            }
        }

        // Check specific data completeness
        console.log('\n--- Detailed Analysis ---');

        // Check VCC Descriptions
        try {
            const vccDescs = await prisma.vCCDescription.findMany();
            console.log(`VCC Descriptions found: ${vccDescs.length}`);
            vccDescs.forEach(desc => {
                console.log(`  - ${desc.systemCode}: ${desc.systemName}`);
            });
        } catch (e) {
            console.log(`VCC Descriptions: Error - ${e.message}`);
        }

        // Check System Metadata
        try {
            const sysMeta = await prisma.systemMetadata.findMany();
            console.log(`\nSystem Metadata records: ${sysMeta.length}`);
            sysMeta.forEach(meta => {
                console.log(`  - ${meta.systemCode}: ${meta.dataCompleteness}% complete`);
            });
        } catch (e) {
            console.log(`System Metadata: Error - ${e.message}`);
        }

        // Check Cross Connections
        try {
            const crossConns = await prisma.crossConnection.findMany({ take: 5 });
            console.log(`\nCross Connections sample: ${crossConns.length} shown of ${tables.find(t => t.name === 'CrossConnection').count}`);
            crossConns.forEach(conn => {
                console.log(`  - Drawing: ${conn.drawingId?.substring(0, 8)}..., Pins: ${conn.pinA}-${conn.pinB}`);
            });
        } catch (e) {
            console.log(`Cross Connections: Error - ${e.message}`);
        }

        await prisma.$disconnect();
        console.log('\nDisconnected from database');

    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
}

checkCompleteData();