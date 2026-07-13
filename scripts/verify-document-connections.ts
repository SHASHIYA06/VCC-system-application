import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDocumentConnections() {
    console.log('Verifying all document connections...\n');

    // Check source files
    const sourceFiles = await prisma.sourceFile.findMany({
        include: {
            pages: true
        }
    });

    console.log('SOURCE FILE STATUS:');
    console.log('===================');
    sourceFiles.forEach(file => {
        console.log(`${file.filename}: ${file.status} (${file.pages.length} pages)`);
    });

    // Check drawings
    const totalDrawings = await prisma.drawing.count();
    const syncedDrawings = await prisma.drawing.count({
        where: { isSynced: true }
    });
    const unsyncedDrawings = await prisma.drawing.count({
        where: { isSynced: false }
    });

    console.log(`\nDRAWING STATUS:`);
    console.log('================');
    console.log(`Total drawings: ${totalDrawings}`);
    console.log(`Synced drawings: ${syncedDrawings}`);
    console.log(`Unsynced drawings: ${unsyncedDrawings}`);

    // Check page mappings
    const totalMappings = await prisma.drawingPageMapping.count();
    const verifiedMappings = await prisma.drawingPageMapping.count({
        where: { verified: true }
    });
    const unverifiedMappings = await prisma.drawingPageMapping.count({
        where: { verified: false }
    });

    console.log(`\nPAGE MAPPING STATUS:`);
    console.log('====================');
    console.log(`Total mappings: ${totalMappings}`);
    console.log(`Verified mappings: ${verifiedMappings}`);
    console.log(`Unverified mappings: ${unverifiedMappings}`);

    // Verification summary
    console.log(`\nVERIFICATION SUMMARY:`);
    console.log('=====================');
    console.log(`✅ Source files: ${sourceFiles.length}`);
    console.log(`✅ Total drawings: ${totalDrawings}`);
    console.log(`✅ Synced drawings: ${syncedDrawings}`);
    console.log(`✅ Unsynced drawings: ${unsyncedDrawings}`);
    console.log(`✅ Total mappings: ${totalMappings}`);
    console.log(`✅ Verified mappings: ${verifiedMappings}`);

    const isFullySynced = (unsyncedDrawings === 0);

    if (isFullySynced) {
        console.log(`\n🎉 ALL DOCUMENT CONNECTIONS ARE PROPERLY CONFIGURED! 🎉`);
    } else {
        console.log(`\n⚠️  ${unsyncedDrawings} unsynced drawings remain`);
    }

    process.exit(0);
}

verifyDocumentConnections().catch(e => { console.error(e); process.exit(1); });