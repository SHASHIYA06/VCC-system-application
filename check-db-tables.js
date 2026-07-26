require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function checkTables() {
    const prisma = new PrismaClient({
        datasources: { db: { url: process.env.DIRECT_URL } }
    });

    try {
        await prisma.$connect();
        console.log('Connected to database successfully');

        // Check key tables with proper model naming
        const tableChecks = [
            { name: 'system', model: 'system', label: 'system' },
            { name: 'drawing', model: 'drawing', label: 'drawing' },
            { name: 'connector', model: 'connector', label: 'connector' },
            { name: 'wire', model: 'wire', label: 'wire' },
            { name: 'crossConnection', model: 'crossConnection', label: 'crossConnection' },
            { name: 'VCCDescription', model: 'vCCDescription', label: 'vccDescription' },
            { name: 'SystemMetadata', model: 'systemMetadata', label: 'systemMetadata' },
            { name: 'ReferenceDrawing', model: 'referenceDrawing', label: 'referenceDrawing' },
            { name: 'Device', model: 'device', label: 'device' },
            { name: 'Equipment', model: 'equipment', label: 'equipment' },
            { name: 'ConnectorType', model: 'connectorType', label: 'connectorType' },
            { name: 'DrawingVerificationStatus', model: 'drawingVerificationStatus', label: 'drawingVerificationStatus' }
        ];

        for (const { name, model, label } of tableChecks) {
            try {
                const count = await prisma[model].count();
                console.log(`${label}: ${count}`);
            } catch (e) {
                console.log(`${label}: Error - ${e.message}`);
            }
        }

        // Check some specific data
        console.log('\n--- Sample Data ---');
        const systems = await prisma.system.findMany({ take: 5 });
        console.log('Sample systems:', systems.map(s => s.code));

        try {
            const vccDescriptions = await prisma.vCCDescription.count();
            console.log(`VCC Descriptions: ${vccDescriptions}`);
        } catch (e) {
            console.log(`VCC Descriptions: Error - ${e.message}`);
        }

        try {
            const systemMetadata = await prisma.systemMetadata.count();
            console.log(`System Metadata records: ${systemMetadata}`);
        } catch (e) {
            console.log(`System Metadata: Error - ${e.message}`);
        }

        try {
            const crossConnections = await prisma.crossConnection.count();
            console.log(`Cross Connections: ${crossConnections}`);
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

checkTables();