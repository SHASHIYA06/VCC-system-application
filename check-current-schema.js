require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function checkSchema() {
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

        console.log('\n--- Table Counts ---');
        for (const table of tables) {
            try {
                // Use proper Prisma model naming convention
                const modelName = table.charAt(0).toUpperCase() + table.slice(1);
                const count = await prisma[modelName].count();
                console.log(`${table}: ${count}`);
            } catch (e) {
                // Try lowercase version
                try {
                    const count = await prisma[table].count();
                    console.log(`${table}: ${count}`);
                } catch (e2) {
                    console.log(`${table}: Error - ${e2.message}`);
                }
            }
        }

        // Check some specific data
        console.log('\n--- Sample Data ---');
        const systems = await prisma.system.findMany({ take: 10 });
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

        // Check for DrawingVerificationStatus table
        try {
            const verificationStatus = await prisma.drawingVerificationStatus.count();
            console.log(`Drawing Verification Status: ${verificationStatus}`);
        } catch (e) {
            console.log(`Drawing Verification Status: Error - ${e.message}`);
        }

        // Check for DeviceSpecification table
        try {
            const deviceSpecs = await prisma.deviceSpecification.count();
            console.log(`Device Specifications: ${deviceSpecs}`);
        } catch (e) {
            console.log(`Device Specifications: Error - ${e.message}`);
        }

        await prisma.$disconnect();
        console.log('\nDisconnected from database');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
}

checkSchema();