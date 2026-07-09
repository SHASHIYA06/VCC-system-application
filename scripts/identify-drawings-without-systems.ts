import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function identifyDrawingsWithoutSystems() {
    try {
        console.log('Identifying drawings without systems...');

        // Get drawings with null systemId
        const drawingsWithoutSystems = await prisma.drawing.findMany({
            where: {
                systemId: null
            },
            select: {
                id: true,
                drawingNo: true,
                title: true,
                systemId: true
            }
        });

        console.log(`Found ${drawingsWithoutSystems.length} drawings without systems:`);

        // Group by drawing number prefix to identify patterns
        const groupedByPrefix: Record<string, any[]> = {};

        for (const drawing of drawingsWithoutSystems) {
            const prefix = drawing.drawingNo.substring(0, 7); // Extract prefix like "942-581"
            if (!groupedByPrefix[prefix]) {
                groupedByPrefix[prefix] = [];
            }
            groupedByPrefix[prefix].push(drawing);
        }

        // Show grouped results
        for (const [prefix, drawings] of Object.entries(groupedByPrefix)) {
            console.log(`\nPrefix ${prefix}: ${drawings.length} drawings`);
            for (const drawing of drawings.slice(0, 3)) { // Show first 3 of each group
                console.log(`  - ${drawing.drawingNo}: ${drawing.title}`);
            }
            if (drawings.length > 3) {
                console.log(`  ... and ${drawings.length - 3} more`);
            }
        }

        // Get all systems to understand mapping possibilities
        const allSystems = await prisma.system.findMany({
            select: {
                id: true,
                code: true,
                name: true
            }
        });

        console.log('\nAvailable systems for mapping:');
        for (const system of allSystems.slice(0, 10)) {
            console.log(`  ${system.code}: ${system.name}`);
        }
        if (allSystems.length > 10) {
            console.log(`  ... and ${allSystems.length - 10} more systems`);
        }

        console.log('✅ Identification completed');
    } catch (error) {
        console.error('❌ Identification failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

identifyDrawingsWithoutSystems();