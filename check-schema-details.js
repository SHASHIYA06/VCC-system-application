require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function checkSchemaDetails() {
    const prisma = new PrismaClient({
        datasources: { db: { url: process.env.DIRECT_URL } }
    });

    try {
        await prisma.$connect();
        console.log('=== DATABASE TABLE ANALYSIS ===\n');

        // Check key tables with proper field selection
        console.log('--- Table Counts ---');
        const tableCounts = [
            { name: 'system', model: 'System' },
            { name: 'drawing', model: 'Drawing' },
            { name: 'connector', model: 'Connector' },
            { name: 'wire', model: 'Wire' },
            { name: 'equipment', model: 'Equipment' },
            { name: 'device', model: 'Device' },
            { name: 'subsystem', model: 'Subsystem' },
            { name: 'trainline', model: 'TrainLine' }
        ];

        for (const table of tableCounts) {
            try {
                const count = await prisma[table.model].count();
                console.log(`${table.name}: ${count}`);
            } catch (e) {
                console.log(`${table.name}: Error - ${e.message}`);
            }
        }

        console.log('\n--- Sample Data ---');

        // Get sample systems
        try {
            const systems = await prisma.system.findMany({
                take: 3,
                select: { id: true, code: true, name: true }
            });
            console.log('Sample systems:', systems.map(s => `${s.code} (${s.name})`));
        } catch (e) {
            console.log('Systems error:', e.message);
        }

        // Get sample drawings
        try {
            const drawings = await prisma.drawing.findMany({
                take: 3,
                select: { id: true, drawingNo: true, title: true, systemId: true }
            });
            console.log('Sample drawings:', drawings.map(d => `${d.drawingNo} (${d.title})`));
        } catch (e) {
            console.log('Drawings error:', e.message);
        }

        console.log('\n=== DRAWING TABLE EVOLUTION ===');

        // Compare old vs new schema features
        try {
            const drawingFields = [
                'id', 'projectId', 'systemId', 'drawingNo', 'revision', 'title',
                'totalSheets', 'sourceFileId', 'isReference', 'remarks',
                'createdAt', 'updatedAt', 'status', 'drawingPdfUrl',
                'isSynced', 'syncedAt'  // These are NEW fields
            ];

            console.log('Drawing table fields:');
            drawingFields.forEach(field => {
                const isNew = ['isSynced', 'syncedAt'].includes(field);
                console.log(`  ${field}${isNew ? ' (NEW)' : ''}`);
            });

            // Check a sample drawing with relations
            const sampleDrawing = await prisma.drawing.findFirst({
                include: {
                    system: { select: { code: true, name: true } },
                    _count: { select: { connectors: true, wires: true, devices: true } }
                }
            });

            if (sampleDrawing) {
                console.log('\nSample drawing with relations:');
                console.log(`  Drawing: ${sampleDrawing.drawingNo}`);
                console.log(`  System: ${sampleDrawing.system?.code} - ${sampleDrawing.system?.name}`);
                console.log(`  Connectors: ${sampleDrawing._count.connectors}`);
                console.log(`  Wires: ${sampleDrawing._count.wires}`);
                console.log(`  Devices: ${sampleDrawing._count.devices}`);
                console.log(`  Sync Status: ${sampleDrawing.isSynced ? 'Synced' : 'Not synced'}${sampleDrawing.syncedAt ? ` (${sampleDrawing.syncedAt})` : ''}`);
            }
        } catch (e) {
            console.log('Drawing analysis error:', e.message);
        }

        console.log('\n=== NEW TABLES STATUS ===');

        // Check specifically for new tables
        const newTables = [
            { name: 'equipment', model: 'Equipment' },
            { name: 'subsystem', model: 'Subsystem' },
            { name: 'trainline', model: 'TrainLine' },
            { name: 'deviceSpecification', model: 'DeviceSpecification' },
            { name: 'drawingVerificationStatus', model: 'DrawingVerificationStatus' },
            { name: 'systemMetadata', model: 'SystemMetadata' },
            { name: 'vccDescription', model: 'VCCDescription' }
        ];

        for (const table of newTables) {
            try {
                const count = await prisma[table.model].count();
                console.log(`${table.name}: ${count} records`);

                if (count > 0) {
                    // Get a sample for non-empty tables
                    if (table.name === 'subsystem') {
                        const sample = await prisma[table.model].findFirst({
                            select: { id: true, code: true, name: true, systemId: true }
                        });
                        console.log(`  Sample ${table.name}: ${sample?.code} - ${sample?.name}`);
                    } else if (table.name === 'systemMetadata') {
                        const sample = await prisma[table.model].findFirst({
                            select: { id: true, systemCode: true, dataCompleteness: true, syncStatus: true }
                        });
                        console.log(`  Sample ${table.name}: ${sample?.systemCode} (${sample?.syncStatus}, ${sample?.dataCompleteness}% complete)`);
                    }
                }
            } catch (e) {
                console.log(`${table.name}: Error - ${e.message}`);
            }
        }

        console.log('\n=== OLD vs NEW SCHEMA COMPARISON ===');

        console.log('\nOld Schema (Migration 001) had:');
        console.log('  - Basic tables: projects, car_types, systems, drawings');
        console.log('  - Simple relationships with minimal metadata');
        console.log('  - No verification or sync tracking');
        console.log('  - No subsystems, equipment, or advanced modeling');

        console.log('\nNew Schema (Current) has:');
        console.log('  - Enhanced tables with metadata fields');
        console.log('  - Advanced relationships and hierarchies');
        console.log('  - Verification and sync tracking (isSynced, syncedAt)');
        console.log('  - Subsystems, equipment, conductor classes, connector types');
        console.log('  - Quality metrics (SystemMetadata, DrawingVerificationStatus)');
        console.log('  - AI integration ready (embeddings, RAG support)');

        await prisma.$disconnect();
        console.log('\nDisconnected from database');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
}

checkSchemaDetails();