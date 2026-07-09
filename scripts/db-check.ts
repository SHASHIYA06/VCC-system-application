import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
    try {
        console.log('Checking database connection...');

        // Check systems
        const systems = await prisma.system.findMany({ take: 5 });
        console.log('Sample systems:', systems);

        // Count major entities
        const drawingsCount = await prisma.drawing.count();
        console.log('Total drawings:', drawingsCount);

        const connectorsCount = await prisma.connector.count();
        console.log('Total connectors:', connectorsCount);

        const wiresCount = await prisma.wire.count();
        console.log('Total wires:', wiresCount);

        const devicesCount = await prisma.device.count();
        console.log('Total devices:', devicesCount);

        // Check if we have page mappings
        const mappingsCount = await prisma.drawingPageMapping.count();
        console.log('Total page mappings:', mappingsCount);

        console.log('✅ Database check completed successfully');
    } catch (error) {
        console.error('❌ Database check failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();