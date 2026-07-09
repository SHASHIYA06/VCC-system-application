import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAccurateDatabaseState() {
    try {
        console.log('Checking accurate database state...');

        // Check total drawings
        const totalDrawings = await prisma.drawing.count();
        console.log('Total drawings:', totalDrawings);

        // Check drawings with systems
        const drawingsWithSystems = await prisma.drawing.count({
            where: {
                systemId: {
                    not: null
                }
            }
        });
        console.log('Drawings with systems:', drawingsWithSystems);

        // Check drawings without systems
        const drawingsWithoutSystems = await prisma.drawing.count({
            where: {
                systemId: null
            }
        });
        console.log('Drawings without systems:', drawingsWithoutSystems);

        // Check total wires
        const totalWires = await prisma.wire.count();
        console.log('Total wires:', totalWires);

        // Check wires with numbers
        const wiresWithNumbers = await prisma.wire.count({
            where: {
                wireNo: {
                    not: null
                }
            }
        });
        console.log('Wires with numbers:', wiresWithNumbers);

        // Check wires without numbers
        const wiresWithoutNumbers = await prisma.wire.count({
            where: {
                wireNo: null
            }
        });
        console.log('Wires without numbers:', wiresWithoutNumbers);

        // Check total connectors
        const totalConnectors = await prisma.connector.count();
        console.log('Total connectors:', totalConnectors);

        // Check connectors with drawings
        const connectorsWithDrawings = await prisma.connector.count({
            where: {
                drawingId: {
                    not: null
                }
            }
        });
        console.log('Connectors with drawings:', connectorsWithDrawings);

        // Check connectors without drawings
        const connectorsWithoutDrawings = await prisma.connector.count({
            where: {
                drawingId: null
            }
        });
        console.log('Connectors without drawings:', connectorsWithoutDrawings);

        // Check total devices
        const totalDevices = await prisma.device.count();
        console.log('Total devices:', totalDevices);

        // Check devices with drawings
        const devicesWithDrawings = await prisma.device.count({
            where: {
                drawingId: {
                    not: null
                }
            }
        });
        console.log('Devices with drawings:', devicesWithDrawings);

        // Check devices without drawings
        const devicesWithoutDrawings = await prisma.device.count({
            where: {
                drawingId: null
            }
        });
        console.log('Devices without drawings:', devicesWithoutDrawings);

        console.log('✅ Accurate database state check completed');
    } catch (error) {
        console.error('❌ Accurate database state check failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAccurateDatabaseState();