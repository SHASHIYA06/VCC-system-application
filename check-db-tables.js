const { PrismaClient } = require('@prisma/client');

async function checkTables() {
    const prisma = new PrismaClient({
        datasources: { db: { url: process.env.DIRECT_URL } }
    });

    try {
        await prisma.$connect();
        console.log('Connected to database successfully');

        // Check key tables
        const tables = [
            'system', 'drawing', 'connector', 'wire', 'crossConnection',
            'vccDescription', 'systemMetadata', 'referenceDrawing'
        ];

        for (const table of tables) {
            try {
                const count = await prisma[table].count();
                console.log(`${table}: ${count}`);
            } catch (e) {
                console.log(`${table}: Error - ${e.message}`);
            }
        }

        // Check some specific data
        console.log('\n--- Sample Data ---');
        const systems = await prisma.system.findMany({ take: 5 });
        console.log('Sample systems:', systems.map(s => s.code));

        const vccDescriptions = await prisma.vccDescription.count();
        console.log(`VCC Descriptions: ${vccDescriptions}`);

        const systemMetadata = await prisma.systemMetadata.count();
        console.log(`System Metadata records: ${systemMetadata}`);

        const crossConnections = await prisma.crossConnection.count();
        console.log(`Cross Connections: ${crossConnections}`);

        await prisma.$disconnect();
        console.log('\nDisconnected from database');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
}

checkTables();