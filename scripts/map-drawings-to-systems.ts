import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define mapping rules based on drawing number prefixes and titles
const SYSTEM_MAPPING_RULES: Record<string, string> = {
    // Based on the analysis, these are the mappings we need to apply:
    '942-381': 'CAB',      // Cab drawings
    '942-383': 'LTEB',     // DMC Underframe (LTEB system)
    '942-385': 'LTEB',     // TC Underframe (LTEB system)
    '942-386': 'LTJB',     // MC Ceiling (LTJB system)
    'FT-UNMA': 'GENERAL',  // Unmapped drawings go to General
    'FT00530': 'GENERAL',  // Unmapped drawings go to General
};

// Special cases based on title keywords
const TITLE_KEYWORD_MAPPINGS: Record<string, string> = {
    'CAB': 'CAB',
    'LTEB': 'LTEB',
    'LTJB': 'LTJB',
    'LIGHT': 'LIGHT',
    'DOOR': 'DOOR',
    'BRAKE': 'BRAKE',
    'TRACTION': 'TRACTION',
    'VVVF': 'TRACTION',
    'AUX': 'AUX',
    'APS': 'AUX',
    'AC CONVERTER': 'AUX',
    'BATTERY': 'AUX',
    'SHORE': 'AUX',
    'VAC': 'AIRCON',
    'AIR CONDITIONING': 'AIRCON',
    'COMM': 'COMM',
    'PIS': 'COMM',
    'PA': 'COMM',
    'CCTV': 'COMM',
    'RADIO': 'COMM',
    'CBTC': 'COMM',
    'TCMS': 'TIMS',
    'TMS': 'TIMS',
    'RIO': 'TIMS',
};

async function mapDrawingsToSystems() {
    try {
        console.log('Mapping drawings to systems...');

        // Get all systems to have their IDs
        const allSystems = await prisma.system.findMany({
            select: {
                id: true,
                code: true
            }
        });

        const systemIdMap: Record<string, string> = {};
        for (const system of allSystems) {
            systemIdMap[system.code] = system.id;
        }

        // Get drawings without systems
        const drawingsWithoutSystems = await prisma.drawing.findMany({
            where: {
                systemId: null
            },
            select: {
                id: true,
                drawingNo: true,
                title: true
            }
        });

        console.log(`Found ${drawingsWithoutSystems.length} drawings to map`);

        let updatedCount = 0;

        // Process each drawing
        for (const drawing of drawingsWithoutSystems) {
            let systemCode: string | null = null;

            // First, try to match by drawing number prefix
            const prefix = drawing.drawingNo.substring(0, 7);
            if (SYSTEM_MAPPING_RULES[prefix]) {
                systemCode = SYSTEM_MAPPING_RULES[prefix];
            }

            // If no prefix match, try to match by title keywords
            if (!systemCode) {
                const titleUpper = drawing.title.toUpperCase();
                for (const [keyword, code] of Object.entries(TITLE_KEYWORD_MAPPINGS)) {
                    if (titleUpper.includes(keyword)) {
                        systemCode = code;
                        break;
                    }
                }
            }

            // If still no match, assign to GENERAL
            if (!systemCode) {
                systemCode = 'GENERAL';
                console.log(`Assigning ${drawing.drawingNo} to GENERAL (no clear match)`);
            }

            // Get system ID
            const systemId = systemIdMap[systemCode];
            if (!systemId) {
                console.warn(`Warning: Could not find system ID for code ${systemCode}`);
                continue;
            }

            // Update the drawing
            try {
                await prisma.drawing.update({
                    where: { id: drawing.id },
                    data: { systemId: systemId }
                });

                console.log(`Mapped ${drawing.drawingNo} to ${systemCode}`);
                updatedCount++;
            } catch (updateError) {
                console.error(`Failed to update drawing ${drawing.drawingNo}:`, updateError);
            }
        }

        console.log(`✅ Successfully mapped ${updatedCount} drawings to systems`);

        // Verify the results
        const remainingUnmapped = await prisma.drawing.count({
            where: { systemId: null }
        });

        console.log(`Remaining unmapped drawings: ${remainingUnmapped}`);

    } catch (error) {
        console.error('❌ Mapping process failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

mapDrawingsToSystems();