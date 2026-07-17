require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function checkDetailedSchema() {
    const prisma = new PrismaClient({
        datasources: { db: { url: process.env.DIRECT_URL } }
    });

    try {
        await prisma.$connect();
        console.log('=== DATABASE TABLE ANALYSIS ===\n');

        // Check key tables
        const tables = [
            'system', 'drawing', 'connector', 'wire', 'equipment',
            'trainline', 'device', 'subsystem'
        ];

        for (const table of tables) {
            try {
                // Use proper Prisma model naming convention
                const modelName = table.charAt(0).toUpperCase() + table.slice(1);
                const count = await prisma[modelName].count();
                console.log(`${table}: ${count}`);

                // Show sample data for key tables
                if (count > 0 && ['system', 'drawing', 'equipment'].includes(table)) {
                    const samples = await prisma[modelName].findMany({
                        take: 3,
                        select: {
                            id: true,
                            code: true,
                            name: true,
                            drawingNo: true
                        }
                    });
                    console.log(`  Sample ${table}s:`, samples.map(s => s.code || s.drawingNo || s.name || s.id.substring(0, 8)));
                }
            } catch (e) {
                console.log(`${table}: Error - ${e.message}`);
            }
        }

        console.log('\n=== DRAWING TABLE STRUCTURE COMPARISON ===');

        // Get detailed info about Drawing table
        try {
            const drawingSample = await prisma.drawing.findFirst({
                include: {
                    system: true,
                    connectors: true,
                    wires: true,
                    devices: true
                }
            });

            if (drawingSample) {
                console.log('\nCurrent Drawing Table Structure:');
                console.log('- Fields:', Object.keys(drawingSample).filter(key => !['system', 'connectors', 'wires', 'devices'].includes(key)));
                console.log('- Relations: system, connectors, wires, devices');
                console.log('- Sample connectors:', drawingSample.connectors.length);
                console.log('- Sample wires:', drawingSample.wires.length);
                console.log('- Sample devices:', drawingSample.devices.length);
            }
        } catch (e) {
            console.log('Error getting drawing sample:', e.message);
        }

        console.log('\n=== NEW TABLES ANALYSIS ===');

        // Check specifically for new tables that might be empty
        const newTables = [
            'equipment', 'subsystem', 'trainline', 'deviceSpecification',
            'drawingVerificationStatus', 'systemMetadata', 'vccDescription'
        ];

        for (const table of newTables) {
            try {
                const modelName = table.charAt(0).toUpperCase() + table.slice(1);
                const count = await prisma[modelName].count();
                console.log(`${table}: ${count} records`);

                if (count > 0) {
                    const sample = await prisma[modelName].findFirst();
                    console.log(`  Sample ${table}:`, Object.keys(sample).slice(0, 5));
                }
            } catch (e) {
                console.log(`${table}: Error - ${e.message}`);
            }
        }

        await prisma.$disconnect();
        console.log('\nDisconnected from database');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
}

checkDetailedSchema();