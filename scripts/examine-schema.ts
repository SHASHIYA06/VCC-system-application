import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function examineSchema() {
    try {
        console.log('Examining database schema and relationships...\n');

        // Get counts for key tables
        const [
            systemCount,
            drawingCount,
            connectorCount,
            wireCount,
            deviceCount
        ] = await Promise.all([
            prisma.system.count(),
            prisma.drawing.count(),
            prisma.connector.count(),
            prisma.wire.count(),
            prisma.device.count()
        ]);

        console.log('=== DATABASE ENTITY COUNTS ===');
        console.log(`Systems: ${systemCount}`);
        console.log(`Drawings: ${drawingCount}`);
        console.log(`Connectors: ${connectorCount}`);
        console.log(`Wires: ${wireCount}`);
        console.log(`Devices: ${deviceCount}\n`);

        // Examine System-Drawing relationship
        console.log('=== SYSTEM-DRAWING RELATIONSHIPS ===');
        const systemsWithDrawings = await prisma.system.findMany({
            where: {
                drawings: {
                    some: {}
                }
            },
            include: {
                drawings: {
                    take: 3,
                    select: {
                        drawingNo: true,
                        title: true
                    }
                }
            },
            take: 5
        });

        systemsWithDrawings.forEach(system => {
            console.log(`System: ${system.code} - ${system.name}`);
            console.log(`  Sample drawings: ${system.drawings.map(d => d.drawingNo).join(', ')}`);
        });

        console.log('\n=== WIRE-CONNECTOR RELATIONSHIPS ===');
        const wiresWithEndpoints = await prisma.wire.findMany({
            where: {
                OR: [
                    { sourceConnector: { not: null } },
                    { destConnector: { not: null } }
                ]
            },
            select: {
                wireNo: true,
                sourceConnector: true,
                destConnector: true,
                sourcePin: true,
                destPin: true
            },
            take: 5
        });

        wiresWithEndpoints.forEach(wire => {
            console.log(`Wire: ${wire.wireNo}`);
            if (wire.sourceConnector) {
                console.log(`  Source: ${wire.sourceConnector} pin ${wire.sourcePin}`);
            }
            if (wire.destConnector) {
                console.log(`  Destination: ${wire.destConnector} pin ${wire.destPin}`);
            }
        });

        console.log('\n=== DRAWING-CONNECTOR RELATIONSHIPS ===');
        const drawingsWithConnectors = await prisma.drawing.findMany({
            where: {
                connectors: {
                    some: {}
                }
            },
            include: {
                connectors: {
                    take: 3,
                    select: {
                        connectorCode: true,
                        description: true
                    }
                }
            },
            take: 3
        });

        drawingsWithConnectors.forEach(drawing => {
            console.log(`Drawing: ${drawing.drawingNo} - ${drawing.title}`);
            console.log(`  Connectors: ${drawing.connectors.map(c => c.connectorCode).join(', ')}`);
        });

        console.log('\n=== SCHEMA EXAMINATION COMPLETE ===');

    } catch (error) {
        console.error('Error examining schema:', error);
    } finally {
        await prisma.$disconnect();
    }
}

examineSchema();