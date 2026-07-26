import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyVCCDescriptions() {
    try {
        console.log('🔍 Verifying VCC Description data...');

        // Count VCC descriptions
        const count = await prisma.vCCDescription.count();
        console.log(`✅ Found ${count} VCC descriptions in the database`);

        // Get all VCC descriptions
        const descriptions = await prisma.vCCDescription.findMany({
            include: {
                system: true
            }
        });

        console.log('\n📋 VCC Descriptions:');
        for (const desc of descriptions) {
            console.log(`- ${desc.systemCode}: ${desc.systemName}`);
            console.log(`  Description: ${desc.description?.substring(0, 100)}...`);
            console.log(`  Source: ${desc.source}`);
            console.log('');
        }

        // Verify that each system has a corresponding VCC description
        const systems = await prisma.system.findMany();
        console.log(`📊 Total systems: ${systems.length}`);

        let missingDescriptions = 0;
        for (const system of systems) {
            const hasDescription = descriptions.some(desc => desc.systemCode === system.code);
            if (!hasDescription) {
                console.log(`❌ Missing VCC description for system: ${system.code} (${system.name})`);
                missingDescriptions++;
            }
        }

        if (missingDescriptions === 0) {
            console.log('✅ All systems have corresponding VCC descriptions');
        } else {
            console.log(`❌ ${missingDescriptions} systems are missing VCC descriptions`);
        }

    } catch (error) {
        console.error('❌ Error verifying VCC descriptions:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the verification function
verifyVCCDescriptions().catch(console.error);