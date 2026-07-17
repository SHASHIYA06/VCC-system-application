require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function checkConnectorEvolution() {
    const prisma = new PrismaClient({
        datasources: { db: { url: process.env.DIRECT_URL } }
    });

    try {
        await prisma.$connect();
        console.log('=== CONNECTOR SCHEMA EVOLUTION ANALYSIS ===\n');

        // Get connector statistics
        const connectorCount = await prisma.connector.count();
        console.log(`Total Connectors: ${connectorCount}`);

        // Get sample connector with relations
        const sampleConnector = await prisma.connector.findFirst({
            include: {
                drawing: { select: { drawingNo: true, title: true } },
                connectorType: { select: { code: true, description: true } },
                pins: { take: 3, select: { id: true, pinNo: true, wireNo: true } },
                sheet: { select: { sheetNo: true } }
            }
        });

        if (sampleConnector) {
            console.log('\n--- Sample Connector (New Schema) ---');
            console.log(`Connector Code: ${sampleConnector.connectorCode}`);
            console.log(`Drawing: ${sampleConnector.drawing?.drawingNo} - ${sampleConnector.drawing?.title}`);
            console.log(`Connector Type: ${sampleConnector.connectorType?.code} - ${sampleConnector.connectorType?.description}`);
            console.log(`Sheet: ${sampleConnector.sheet ? `Sheet ${sampleConnector.sheet.sheetNo}` : 'N/A'}`);
            console.log(`Pin Count: ${sampleConnector.pins.length} (showing first 3)`);
            sampleConnector.pins.forEach(pin => {
                console.log(`  Pin ${pin.pinNo}: ${pin.wireNo || 'No wire'}`);
            });
        }

        // Check connector types
        const connectorTypes = await prisma.connectorType.count();
        console.log(`\nConnector Types: ${connectorTypes}`);

        if (connectorTypes > 0) {
            const sampleTypes = await prisma.connectorType.findMany({
                take: 5,
                select: { code: true, nominalPins: true, description: true }
            });
            console.log('Sample Connector Types:');
            sampleTypes.forEach(type => {
                console.log(`  ${type.code}: ${type.description} (${type.nominalPins || 'N/A'} pins)`);
            });
        }

        // Check pin statistics
        const pinCount = await prisma.connectorPin.count();
        console.log(`\nTotal Pins: ${pinCount}`);

        // Check pins with wires
        const pinsWithWires = await prisma.connectorPin.count({
            where: { wireNo: { not: null } }
        });
        console.log(`Pins with Wire Numbers: ${pinsWithWires} (${((pinsWithWires / pinCount) * 100).toFixed(1)}%)`);

        // Get sample pin with wire
        const samplePin = await prisma.connectorPin.findFirst({
            where: { wireNo: { not: null } },
            include: {
                connector: { select: { connectorCode: true } },
                conductorClass: { select: { code: true, description: true } }
            }
        });

        if (samplePin) {
            console.log('\n--- Sample Pin with Wire ---');
            console.log(`Connector: ${samplePin.connector.connectorCode}`);
            console.log(`Pin: ${samplePin.pinNo}`);
            console.log(`Wire: ${samplePin.wireNo}`);
            console.log(`Signal: ${samplePin.signalName || 'N/A'}`);
            console.log(`Conductor Class: ${samplePin.conductorClass?.code || 'N/A'}`);
        }

        console.log('\n=== OLD vs NEW CONNECTOR SCHEMA ===');

        console.log('\nOld Schema (Migration 001) Connector Table:');
        console.log('  - Simple structure with basic fields');
        console.log('  - Connector code and basic references');
        console.log('  - No connector type relationship');
        console.log('  - No pin count standardization');
        console.log('  - No sheet association');

        console.log('\nNew Schema (Current) Connector Model:');
        console.log('  - Rich relationships to drawing, sheet, connector type');
        console.log('  - Standardized connector types with nominal pin counts');
        console.log('  - Detailed pin information with wire associations');
        console.log('  - Conductor class classification');
        console.log('  - Scope and location information');

        console.log('\nKey Improvements:');
        console.log('  1. ConnectorType standardization (27 types available)');
        console.log('  2. Sheet-level granularity');
        console.log('  3. Rich pin metadata (signal names, conductor classes)');
        console.log('  4. Better wire-to-pin linking');
        console.log('  5. Enhanced searchability and filtering');

        await prisma.$disconnect();
        console.log('\nDisconnected from database');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
}

checkConnectorEvolution();