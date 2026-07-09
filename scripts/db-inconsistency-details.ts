import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkInconsistencyDetails() {
    try {
        console.log('Checking database inconsistency details...');

        // Check sample drawings without systems
        const sampleDrawingsWithoutSystems = await prisma.drawing.findMany({
            where: {
                systemId: undefined
            },
            take: 5,
            select: {
                id: true,
                drawingNo: true,
                title: true,
                systemId: true
            }
        });
        console.log('Sample drawings without systems:', sampleDrawingsWithoutSystems);

        // Check sample wires without wire numbers
        const sampleWiresWithoutNumbers = await prisma.wire.findMany({
            where: {
                wireNo: undefined
            },
            take: 5,
            select: {
                id: true,
                wireNo: true,
                signalName: true,
                description: true
            }
        });
        console.log('Sample wires without numbers:', sampleWiresWithoutNumbers);

        // Check sample connectors
        const sampleConnectors = await prisma.connector.findMany({
            take: 5,
            select: {
                id: true,
                connectorCode: true,
                drawingId: true,
                drawing: {
                    select: {
                        drawingNo: true,
                        title: true
                    }
                }
            }
        });
        console.log('Sample connectors:', sampleConnectors);

        console.log('✅ Database inconsistency details check completed');
    } catch (error) {
        console.error('❌ Database inconsistency details check failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkInconsistencyDetails();