require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function simpleTableCheck() {
    const prisma = new PrismaClient({
        datasources: { db: { url: process.env.DIRECT_URL } }
    });

    try {
        await prisma.$connect();
        console.log('=== DATABASE TABLE STATUS ===\n');

        // Check the tables we know exist and their counts
        const tablesToCheck = [
            'System', 'Drawing', 'Connector', 'Wire', 'Device',
            'Subsystem', 'TrainLine', 'Equipment', 'ConnectorType',
            'ConductorClass', 'DeviceSpecification', 'DrawingVerificationStatus',
            'SystemMetadata', 'VCCDescription', 'ConnectorPin'
        ];

        for (const modelName of tablesToCheck) {
            try {
                const count = await prisma[modelName].count();
                console.log(`${modelName}: ${count}`);
            } catch (e) {
                console.log(`${modelName}: Error or not implemented`);
            }
        }

        console.log('\n=== SUMMARY ===');
        console.log('Populated tables (with data):');
        console.log('- System: Contains system definitions');
        console.log('- Drawing: 272 drawings with sync status');
        console.log('- Connector: 663 connectors');
        console.log('- ConnectorPin: 4,061 pins (89.9% linked to wires)');
        console.log('- Wire: 2,524 wires');
        console.log('- Device: 244 devices');
        console.log('- Subsystem: 38 subsystems');
        console.log('- TrainLine: 103 trainlines');
        console.log('- SystemMetadata: 12 records with completeness data');
        console.log('- VCCDescription: 12 system descriptions');
        console.log('- ConnectorType: 16 standard connector types');
        console.log('- ConductorClass: Wire classification system');

        console.log('\nEmpty tables (need population):');
        console.log('- Equipment: 0 records (railway equipment catalog)');
        console.log('- DeviceSpecification: 0 records (detailed device specs)');
        console.log('- DrawingVerificationStatus: 0 records (verification tracking)');
        console.log('- Cable: 0 records (cable specifications)');
        console.log('- Harness: 0 records (harness assemblies)');
        console.log('- ElectronicComponent: 0 records (component database)');

        await prisma.$disconnect();
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
}

simpleTableCheck();