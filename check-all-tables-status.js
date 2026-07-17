require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function checkAllTablesStatus() {
    const prisma = new PrismaClient({
        datasources: { db: { url: process.env.DIRECT_URL } }
    });

    try {
        await prisma.$connect();
        console.log('=== COMPLETE DATABASE TABLE STATUS ===\n');

        // List all tables we want to check
        const tables = [
            { name: 'system', model: 'System' },
            { name: 'drawing', model: 'Drawing' },
            { name: 'connector', model: 'Connector' },
            { name: 'wire', model: 'Wire' },
            { name: 'device', model: 'Device' },
            { name: 'subsystem', model: 'Subsystem' },
            { name: 'trainline', model: 'TrainLine' },
            { name: 'equipment', model: 'Equipment' },
            { name: 'cable', model: 'Cable' },
            { name: 'harness', model: 'Harness' },
            { name: 'connectorType', model: 'ConnectorType' },
            { name: 'conductorClass', model: 'ConductorClass' },
            { name: 'deviceSpecification', model: 'DeviceSpecification' },
            { name: 'drawingVerificationStatus', model: 'DrawingVerificationStatus' },
            { name: 'systemMetadata', model: 'SystemMetadata' },
            { name: 'vccDescription', model: 'VCCDescription' },
            { name: 'connectorPin', model: 'ConnectorPin' },
            { name: 'drawingWire', model: 'DrawingWire' },
            { name: 'wireEndpoint', model: 'WireEndpoint' }
        ];

        console.log('--- TABLE COUNTS ---');
        for (const table of tables) {
            try {
                const count = await prisma[table.model].count();
                console.log(`${table.name}: ${count}`);
            } catch (e) {
                console.log(`${table.name}: Error - ${e.message}`);
            }
        }

        console.log('\n--- EMPTY TABLES THAT NEED POPULATION ---');
        const emptyTables = tables.filter(async (table) => {
            try {
                const count = await prisma[table.model].count();
                return count === 0;
            } catch (e) {
                return false;
            }
        });

        // Actually check which ones are empty
        for (const table of tables) {
            try {
                const count = await prisma[table.model].count();
                if (count === 0) {
                    console.log(`${table.name}: Needs population`);
                }
            } catch (e) {
                console.log(`${table.name}: Error checking - ${e.message}`);
            }
        }

        console.log('\n--- SAMPLE DATA FROM POPULATED TABLES ---');

        // Show sample data from key populated tables
        try {
            const sampleSystem = await prisma.system.findFirst({
                select: { code: true, name: true, category: true }
            });
            console.log(`Sample System: ${sampleSystem?.code} - ${sampleSystem?.name} (${sampleSystem?.category})`);
        } catch (e) {
            console.log('Systems sample error:', e.message);
        }

        try {
            const sampleDrawing = await prisma.drawing.findFirst({
                select: { drawingNo: true, title: true, isSynced: true },
                orderBy: { createdAt: 'desc' }
            });
            console.log(`Sample Drawing: ${sampleDrawing?.drawingNo} - ${sampleDrawing?.title} (Synced: ${sampleDrawing?.isSynced})`);
        } catch (e) {
            console.log('Drawings sample error:', e.message);
        }

        try {
            const sampleConnector = await prisma.connector.findFirst({
                select: { connectorCode: true, description: true },
                orderBy: { createdAt: 'desc' }
            });
            console.log(`Sample Connector: ${sampleConnector?.connectorCode} - ${sampleConnector?.description || 'No description'}`);
        } catch (e) {
            console.log('Connectors sample error:', e.message);
        }

        try {
            const sampleWire = await prisma.wire.findFirst({
                select: { wireNo: true, wireColor: true, description: true },
                orderBy: { createdAt: 'desc' }
            });
            console.log(`Sample Wire: ${sampleWire?.wireNo} - ${wireWire?.description || wireWire?.wireColor || 'No details'}`);
        } catch (e) {
            console.log('Wires sample error:', e.message);
        }

        console.log('\n--- NEW TABLES WITH MISSING DATA ---');
        const newTables = [
            'equipment', 'deviceSpecification', 'drawingVerificationStatus',
            'cable', 'harness', 'electronicComponent'
        ];

        for (const tableName of newTables) {
            try {
                // Try to get count for each new table
                let count;
                switch (tableName) {
                    case 'equipment':
                        count = await prisma.Equipment.count();
                        break;
                    case 'deviceSpecification':
                        count = await prisma.DeviceSpecification.count();
                        break;
                    case 'drawingVerificationStatus':
                        count = await prisma.DrawingVerificationStatus.count();
                        break;
                    case 'cable':
                        count = await prisma.Cable.count();
                        break;
                    case 'harness':
                        count = await prisma.Harness.count();
                        break;
                    case 'electronicComponent':
                        count = await prisma.ElectronicComponent.count();
                        break;
                    default:
                        count = 0;
                }
                console.log(`${tableName}: ${count} records`);
            } catch (e) {
                console.log(`${tableName}: Not yet implemented or error - ${e.message}`);
            }
        }

        console.log('\n--- RECOMMENDED POPULATION STRATEGY ---');
        console.log('1. Populate ConnectorType from seed script (27 types)');
        console.log('2. Populate ConductorClass with standard classifications');
        console.log('3. Migrate Equipment data from existing sources');
        console.log('4. Create DrawingVerificationStatus records for all drawings');
        console.log('5. Generate DeviceSpecification records from device data');
        console.log('6. Add Cable and Harness information from documentation');
        console.log('7. Create SystemMetadata completeness reports');
        console.log('8. Generate VCCDescription records for all systems');

        await prisma.$disconnect();
        console.log('\nDisconnected from database');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
}

checkAllTablesStatus();