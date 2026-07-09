import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeSystemMappings() {
    try {
        console.log('Analyzing system mappings...');

        // Get some drawings that DO have systems to understand the pattern
        const drawingsWithSystems = await prisma.drawing.findMany({
            where: {
                systemId: {
                    not: null
                }
            },
            take: 20,
            select: {
                id: true,
                drawingNo: true,
                title: true,
                system: {
                    select: {
                        code: true,
                        name: true
                    }
                }
            }
        });

        console.log('Sample drawings WITH systems:');
        const systemPatterns: Record<string, string[]> = {};

        for (const drawing of drawingsWithSystems) {
            const prefix = drawing.drawingNo.substring(0, 7);
            const systemCode = drawing.system?.code || 'UNKNOWN';

            if (!systemPatterns[systemCode]) {
                systemPatterns[systemCode] = [];
            }

            if (!systemPatterns[systemCode].includes(prefix)) {
                systemPatterns[systemCode].push(prefix);
            }

            if (systemPatterns[systemCode].length <= 3) { // Show first few examples
                console.log(`  ${drawing.drawingNo} (${prefix}) -> ${systemCode}: ${drawing.system?.name}`);
            }
        }

        console.log('\nSystem to prefix mappings identified:');
        for (const [systemCode, prefixes] of Object.entries(systemPatterns)) {
            console.log(`  ${systemCode}: ${prefixes.join(', ')}`);
        }

        // Get all systems with their codes
        const allSystems = await prisma.system.findMany({
            select: {
                id: true,
                code: true,
                name: true
            }
        });

        console.log('\nAll available systems:');
        for (const system of allSystems) {
            console.log(`  ${system.code}: ${system.name}`);
        }

        console.log('✅ Analysis completed');
    } catch (error) {
        console.error('❌ Analysis failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

analyzeSystemMappings();