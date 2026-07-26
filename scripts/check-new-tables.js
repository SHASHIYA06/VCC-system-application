require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function checkNewTables() {
    const prisma = new PrismaClient({
        datasources: { db: { url: process.env.DIRECT_URL } }
    });

    try {
        await prisma.$connect();
        console.log('Connected to database successfully');

        // Check both old and new tables
        const tableChecks = [
            // Old tables (legacy schema)
            { name: 'System', model: 'system', label: 'System (old)' },
            { name: 'Drawing', model: 'drawing', label: 'Drawing (old)' },
            { name: 'Connector', model: 'connector', label: 'Connector (old)' },
            { name: 'Wire', model: 'wire', label: 'Wire (old)' },

            // New tables (updated schema)
            { name: 'systems', model: 'systems', label: 'systems (new)' },
            { name: 'drawings', model: 'drawings', label: 'drawings (new)' },
            { name: 'connectors', model: 'connectors', label: 'connectors (new)' },
            { name: 'wires', model: 'wires', label: 'wires (new)' },
            { name: 'equipment', model: 'equipment', label: 'equipment (new)' },
            { name: 'devices', model: 'devices', label: 'devices (new)' },
            { name: 'pins', model: 'connectorPin', label: 'pins (new)' },
            { name: 'circuits', model: 'circuit', label: 'circuits (new)' }
        ];

        console.log('=== DATABASE TABLE STATUS ===');
        for (const { name, model, label } of tableChecks) {
            try {
                // Skip models that don't exist in the current schema
                if (!prisma[model]) {
                    console.log(`${label}: Model not available in current schema`);
                    continue;
                }

                const count = await prisma[model].count();
                console.log(`${label}: ${count} records`);
            } catch (e) {
                console.log(`${label}: Error - ${e.message}`);
            }
        }

        // Check if new tables have data
        console.log('\n=== NEW SCHEMA TABLE DATA CHECK ===');

        try {
            const systemsCount = await prisma.systems.count();
            console.log(`New systems table: ${systemsCount} records`);

            const drawingsCount = await prisma.drawings.count();
            console.log(`New drawings table: ${drawingsCount} records`);

            const connectorsCount = await prisma.connectors.count();
            console.log(`New connectors table: ${connectorsCount} records`);

            const wiresCount = await prisma.wires.count();
            console.log(`New wires table: ${wiresCount} records`);

            const equipmentCount = await prisma.equipment.count();
            console.log(`New equipment table: ${equipmentCount} records`);

            const devicesCount = await prisma.devices.count();
            console.log(`New devices table: ${devicesCount} records`);
        } catch (e) {
            console.log(`Error checking new tables: ${e.message}`);
        }

        // Check if old tables still have data
        console.log('\n=== OLD SCHEMA TABLE DATA CHECK ===');

        try {
            const oldSystemsCount = await prisma.system.count();
            console.log(`Old system table: ${oldSystemsCount} records`);

            const oldDrawingsCount = await prisma.drawing.count();
            console.log(`Old drawing table: ${oldDrawingsCount} records`);

            const oldConnectorsCount = await prisma.connector.count();
            console.log(`Old connector table: ${oldConnectorsCount} records`);

            const oldWiresCount = await prisma.wire.count();
            console.log(`Old wire table: ${oldWiresCount} records`);
        } catch (e) {
            console.log(`Error checking old tables: ${e.message}`);
        }

        await prisma.$disconnect();
        console.log('\nDisconnected from database');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
}

checkNewTables();