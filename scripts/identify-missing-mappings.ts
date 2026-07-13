import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function identifyMissingMappings() {
    console.log('Identifying missing document mappings...\n');

    // Get all existing drawings in the database
    const existingDrawings = await prisma.drawing.findMany({
        select: {
            drawingNo: true,
            isSynced: true
        }
    });

    console.log(`Existing drawings in database: ${existingDrawings.length}`);

    // Find drawings that exist but aren't synced
    const unsyncedDrawings = existingDrawings.filter(d => !d.isSynced);
    console.log(`Unsynced drawings: ${unsyncedDrawings.length}`);

    // Check PDF processing status
    const sourceFiles = await prisma.sourceFile.findMany({
        include: {
            pages: true
        }
    });

    console.log('\nPDF Processing Status:');
    sourceFiles.forEach(file => {
        console.log(`- ${file.filename}: ${file.pages.length} pages (${file.status})`);
    });

    // Check page mappings
    const mappings = await prisma.drawingPageMapping.findMany({
        take: 10
    });

    console.log('\nSample Page Mappings:');
    mappings.forEach(mapping => {
        console.log(`- ${mapping.drawingNumber}: ${mapping.sourceFileName} page ${mapping.pdfPageNo}`);
    });

    process.exit(0);
}

identifyMissingMappings().catch(e => { console.error(e); process.exit(1); });