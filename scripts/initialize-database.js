require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function initializeDatabase() {
    const prisma = new PrismaClient({
        datasources: { db: { url: process.env.DIRECT_URL } }
    });

    try {
        await prisma.$connect();
        console.log('Connected to database successfully');

        // Create sample systems
        console.log('\n1. Creating sample systems...');
        const systems = [
            { code: 'GENERAL', name: 'General', description: 'General System' },
            { code: 'TRACTION', name: 'Traction System', description: 'Traction System' },
            { code: 'BRAKE', name: 'Brake System', description: 'Brake System' },
            { code: 'DOOR', name: 'Door System', description: 'Door System' },
            { code: 'AIRCON', name: 'Air Conditioning System', description: 'Air Conditioning System' },
            { code: 'TIMS', name: 'Train Integrated Management System', description: 'Train Integrated Management System' },
            { code: 'COMM', name: 'Communication System', description: 'Communication System' },
            { code: 'AUX', name: 'Auxiliary Electric System', description: 'Auxiliary Electric System' },
            { code: 'CAB', name: 'CAB', description: 'CAB System' },
            { code: 'LTEB', name: 'LTEB', description: 'LTEB System' },
            { code: 'LIGHT', name: 'LIGHT', description: 'LIGHT System' },
            { code: 'LTJB', name: 'LTJB', description: 'LTJB System' }
        ];

        for (const system of systems) {
            try {
                await prisma.systems.upsert({
                    where: { code: system.code },
                    update: {},
                    create: {
                        id: system.code.toLowerCase(),
                        name: system.name,
                        code: system.code,
                        description: system.description,
                        sort_order: 0,
                        status: 'active',
                        metadata: {},
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                });
                console.log(`   Created system: ${system.code}`);
            } catch (e) {
                console.error(`   Error creating system ${system.code}:`, e.message);
            }
        }

        // Create connector types
        console.log('\n2. Creating connector types...');
        const connectorTypes = [
            { code: '74P', nominalPins: 74, description: '74-Pin Intercar Connector', voltageClass: '110V', remarks: 'Standard 74-pin connector for intercar connections between train cars' },
            { code: 'CN', nominalPins: null, description: 'Standard Connector', voltageClass: null, remarks: 'Generic connector type used across multiple systems' },
            { code: 'CN1', nominalPins: null, description: 'CN1 Series Connector', voltageClass: null, remarks: 'CN1 series connector - first connector in a group' },
            { code: 'CN2', nominalPins: null, description: 'CN2 Series Connector', voltageClass: null, remarks: 'CN2 series connector - second connector in a group' },
            { code: 'X1', nominalPins: 74, description: 'X1 Connector', voltageClass: '110V', remarks: 'X1 connector for CAB (Cab) systems - 74P jumper plug' },
            { code: 'X2', nominalPins: 74, description: 'X2 Connector', voltageClass: '110V', remarks: 'X2 connector for CAB (Cab) systems - 74PW jumper plug' },
            { code: 'X3', nominalPins: 11, description: 'X3 Connector', voltageClass: '415VAC', remarks: 'X3 connector for 415V AC / 230V AC' },
            { code: 'J1', nominalPins: null, description: 'J1 Connector', voltageClass: '110V', remarks: 'J1 connector for EDB (Emergency Door Bypass) panels' },
            { code: 'J2', nominalPins: null, description: 'J2 Connector', voltageClass: '110V', remarks: 'J2 connector for EDB panels' }
        ];

        for (const type of connectorTypes) {
            try {
                await prisma.connectorType.upsert({
                    where: { code: type.code },
                    update: {},
                    create: {
                        code: type.code,
                        nominalPins: type.nominalPins,
                        description: type.description,
                        voltageClass: type.voltageClass,
                        remarks: type.remarks
                    }
                });
                console.log(`   Created connector type: ${type.code}`);
            } catch (e) {
                console.error(`   Error creating connector type ${type.code}:`, e.message);
            }
        }

        // Create sample drawings
        console.log('\n3. Creating sample drawings...');
        const drawings = [
            { drawing_number: '942-58101', title: 'General Arrangement', drawing_type: 'electrical' },
            { drawing_number: '942-58102', title: 'Traction System Schematic', drawing_type: 'electrical' },
            { drawing_number: '942-58103', title: 'Brake System Schematic', drawing_type: 'electrical' },
            { drawing_number: '942-58104', title: 'Door System Schematic', drawing_type: 'electrical' }
        ];

        for (const drawing of drawings) {
            try {
                await prisma.drawings.upsert({
                    where: { drawing_number: drawing.drawing_number },
                    update: {},
                    create: {
                        id: `drawing_${drawing.drawing_number.replace('-', '_')}`,
                        drawing_number: drawing.drawing_number,
                        title: drawing.title,
                        drawing_type: drawing.drawing_type,
                        revision: '0',
                        status: 'active',
                        metadata: {},
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                });
                console.log(`   Created drawing: ${drawing.drawing_number}`);
            } catch (e) {
                console.error(`   Error creating drawing ${drawing.drawing_number}:`, e.message);
            }
        }

        console.log('\n✅ Database initialization completed successfully!');

        // Verify creation
        console.log('\n=== VERIFICATION ===');
        const systemCount = await prisma.systems.count();
        console.log(`Systems: ${systemCount}`);

        const connectorTypeCount = await prisma.connectorType.count();
        console.log(`Connector Types: ${connectorTypeCount}`);

        const drawingCount = await prisma.drawings.count();
        console.log(`Drawings: ${drawingCount}`);

        await prisma.$disconnect();
        console.log('\n🎉 Database initialized successfully!');

    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        console.error('Error stack:', error.stack);
        await prisma.$disconnect();
        process.exit(1);
    }
}

initializeDatabase();