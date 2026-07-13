import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkPdfStatus() {
    const sourceFiles = await prisma.sourceFile.findMany({
        include: {
            pages: true
        }
    });

    console.log('PDF Files in Database:');
    sourceFiles.forEach(file => {
        console.log(`- ${file.filename}: ${file.pages.length} pages`);
    });

    const unmappedDrawings = await prisma.drawing.findMany({
        where: {
            isSynced: false
        },
        select: {
            drawingNo: true,
            title: true
        }
    });

    console.log(`\nUnmapped drawings: ${unmappedDrawings.length}`);

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

checkPdfStatus().catch(e => { console.error(e); process.exit(1); });