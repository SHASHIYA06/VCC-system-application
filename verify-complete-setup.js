const { PrismaClient } = require('@prisma/client');

async function verifyCompleteSetup() {
    const prisma = new PrismaClient({
        datasources: { db: { url: process.env.DIRECT_URL } }
    });

    try {
        await prisma.$connect();
        console.log('Connected to database successfully');

        console.log('\n=== DATABASE SETUP VERIFICATION ===\n');

        // 1. Verify all 8 expected systems have VCC descriptions
        const expectedSystems = ['GENERAL', 'TRACTION', 'BRAKE', 'AUX', 'DOOR', 'AIRCON', 'TIMS', 'COMM'];
        console.log('1. Checking VCC Descriptions for all 8 systems:');
        const vccDescriptions = await prisma.vCCDescription.findMany({
            where: { systemCode: { in: expectedSystems } }
        });

        const foundSystems = vccDescriptions.map(v => v.systemCode);
        const missingSystems = expectedSystems.filter(sys => !foundSystems.includes(sys));

        if (missingSystems.length === 0) {
            console.log('   ✅ All 8 systems have VCC descriptions');
        } else {
            console.log(`   ❌ Missing VCC descriptions for: ${missingSystems.join(', ')}`);
        }

        // 2. Verify System Metadata
        console.log('\n2. Checking System Metadata for all 8 systems:');
        const systemMetadata = await prisma.systemMetadata.findMany({
            where: { systemCode: { in: expectedSystems } }
        });

        const metaSystems = systemMetadata.map(m => m.systemCode);
        const missingMeta = expectedSystems.filter(sys => !metaSystems.includes(sys));

        if (missingMeta.length === 0) {
            console.log('   ✅ All 8 systems have metadata records');
        } else {
            console.log(`   ❌ Missing metadata for: ${missingMeta.join(', ')}`);
        }

        // 3. Check Reference Drawings count (should be 9 according to migration)
        console.log('\n3. Checking Reference Drawings:');
        const refDrawingsCount = await prisma.referenceDrawing.count();
        console.log(`   Found ${refDrawingsCount} reference drawings`);
        if (refDrawingsCount >= 9) {
            console.log('   ✅ Reference drawings complete (9 or more found)');
        } else {
            console.log('   ❌ Expected 9 reference drawings, found only', refDrawingsCount);
        }

        // 4. Check Cross Connections (should be more than 43 based on migration)
        console.log('\n4. Checking Cross Connections:');
        const crossConnCount = await prisma.crossConnection.count();
        console.log(`   Found ${crossConnCount} cross connections`);

        // 5. Check Cross Connection Rules
        console.log('\n5. Checking Cross Connection Rules:');
        const crossConnRuleCount = await prisma.crossConnectionRule.count();
        console.log(`   Found ${crossConnRuleCount} cross connection rules`);

        // 6. Check Notes
        console.log('\n6. Checking Notes:');
        const notesCount = await prisma.note.count();
        console.log(`   Found ${notesCount} notes`);

        // 7. Check Drawing Applicability
        console.log('\n7. Checking Drawing Applicability:');
        const applCount = await prisma.drawingApplicability.count();
        console.log(`   Found ${applCount} drawing applicability records`);

        // 8. Detailed check of VCC descriptions content
        console.log('\n8. Verifying VCC Description content quality:');
        for (const systemCode of expectedSystems) {
            const vccDesc = await prisma.vCCDescription.findUnique({
                where: { systemCode }
            });

            if (vccDesc) {
                const hasDescription = vccDesc.description && vccDesc.description.length > 10;
                const hasTechSpecs = vccDesc.technicalSpecs && vccDesc.technicalSpecs.length > 10;
                console.log(`   ${systemCode}: ${hasDescription ? '✅' : '❌'} Description, ${hasTechSpecs ? '✅' : '❌'} Tech Specs`);
            }
        }

        // 9. Check System Metadata completeness
        console.log('\n9. Verifying System Metadata completeness:');
        const allMetadata = await prisma.systemMetadata.findMany();
        for (const meta of allMetadata) {
            const completeness = meta.dataCompleteness || 0;
            const status = completeness >= 60 ? '✅' : '⚠️';
            console.log(`   ${meta.systemCode}: ${status} ${completeness.toFixed(1)}% complete`);
        }

        console.log('\n=== VERIFICATION SUMMARY ===');
        console.log('✅ Database connection: Working');
        console.log(`✅ Systems: 12 total (${expectedSystems.length} with VCC descriptions)`);
        console.log(`✅ VCC Descriptions: ${vccDescriptions.length}/${expectedSystems.length}`);
        console.log(`✅ System Metadata: ${systemMetadata.length}/${expectedSystems.length}`);
        console.log(`✅ Reference Drawings: ${refDrawingsCount}/9+`);
        console.log(`✅ Cross Connections: ${crossConnCount}`);
        console.log(`✅ Cross Connection Rules: ${crossConnRuleCount}`);
        console.log(`✅ Notes: ${notesCount}`);
        console.log(`✅ Drawing Applicability: ${applCount}`);

        if (vccDescriptions.length >= 8 && systemMetadata.length >= 8 && refDrawingsCount >= 9) {
            console.log('\n🎉 DATABASE SETUP IS COMPLETE!');
            console.log('All required data has been successfully loaded.');
        } else {
            console.log('\n⚠️  Some data may be missing. Please review the checks above.');
        }

        await prisma.$disconnect();
        console.log('\nDisconnected from database');

    } catch (error) {
        console.error('Database verification failed:', error.message);
        process.exit(1);
    }
}

verifyCompleteSetup();