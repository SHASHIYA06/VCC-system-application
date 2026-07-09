import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseConsistency() {
    try {
        console.log('Checking database consistency...');

        // Check for drawings without systems
        const drawingsWithoutSystems = await prisma.drawing.count({
            where: {
                systemId: undefined
            }
        });
        console.log('Drawings without systems:', drawingsWithoutSystems);

        // Check for connectors without drawings
        const connectorsWithoutDrawings = await prisma.connector.count({
            where: {
                drawingId: undefined
            }
        });
        console.log('Connectors without drawings:', connectorsWithoutDrawings);

        // Check for wires without wire numbers
        const wiresWithoutNumbers = await prisma.wire.count({
            where: {
                wireNo: undefined
            }
        });
        console.log('Wires without numbers:', wiresWithoutNumbers);

        // Check for devices without drawings
        const devicesWithoutDrawings = await prisma.device.count({
            where: {
                drawingId: undefined
            }
        });
        console.log('Devices without drawings:', devicesWithoutDrawings);

        // Check for drawings that are not synced
        const unsyncedDrawings = await prisma.drawing.count({
            where: {
                isSynced: false
            }
        });
        console.log('Unsynced drawings:', unsyncedDrawings);

        // Check for unverified page mappings
        const unverifiedMappings = await prisma.drawingPageMapping.count({
            where: {
                verified: false
            }
        });
        console.log('Unverified page mappings:', unverifiedMappings);

        // Check for systems with pending data status
        const pendingSystems = await prisma.system.count({
            where: {
                dataStatus: 'PENDING'
            }
        });
        console.log('Systems with pending data status:', pendingSystems);

        console.log('✅ Database consistency check completed');
    } catch (error) {
        console.error('❌ Database consistency check failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabaseConsistency();