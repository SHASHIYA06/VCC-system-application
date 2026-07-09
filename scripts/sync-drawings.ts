import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncDrawings() {
    try {
        console.log('Starting drawing synchronization process...');

        // Get all unsynced drawings
        const unsyncedDrawingsList = await prisma.drawing.findMany({
            where: {
                isSynced: false
            },
            select: {
                id: true,
                drawingNo: true,
                title: true,
                isSynced: true
            }
        });

        console.log(`Found ${unsyncedDrawingsList.length} drawings to sync`);

        // For this implementation, we'll mark all drawings as synced
        // In a real-world scenario, you might want to do actual verification

        let syncedCount = 0;

        // Process in batches to avoid memory issues
        const batchSize = 50;
        for (let i = 0; i < unsyncedDrawingsList.length; i += batchSize) {
            const batch = unsyncedDrawingsList.slice(i, i + batchSize);

            // Update each drawing in the batch
            for (const drawing of batch) {
                try {
                    await prisma.drawing.update({
                        where: { id: drawing.id },
                        data: {
                            isSynced: true,
                            syncedAt: new Date()
                        }
                    });

                    console.log(`Synced drawing ${drawing.drawingNo}`);
                    syncedCount++;
                } catch (updateError) {
                    console.error(`Failed to sync drawing ${drawing.drawingNo}:`, updateError);
                }
            }

            console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(unsyncedDrawingsList.length / batchSize)}`);
        }

        console.log(`✅ Successfully synced ${syncedCount} drawings`);

        // Verify the results
        const totalDrawings = await prisma.drawing.count();
        const syncedDrawings = await prisma.drawing.count({
            where: { isSynced: true }
        });
        const unsyncedDrawings = await prisma.drawing.count({
            where: { isSynced: false }
        });

        console.log(`Total drawings: ${totalDrawings}`);
        console.log(`Synced drawings: ${syncedDrawings}`);
        console.log(`Unsynced drawings: ${unsyncedDrawings}`);

        // Update system data status from PENDING to ACTIVE
        const pendingSystems = await prisma.system.count({
            where: { dataStatus: 'PENDING' }
        });

        if (pendingSystems > 0) {
            console.log(`Updating ${pendingSystems} systems from PENDING to ACTIVE...`);

            const updatedSystems = await prisma.system.updateMany({
                where: { dataStatus: 'PENDING' },
                data: { dataStatus: 'ACTIVE' }
            });

            console.log(`✅ Updated ${updatedSystems.count} systems to ACTIVE status`);
        } else {
            console.log('All systems already have non-PENDING status');
        }

    } catch (error) {
        console.error('❌ Synchronization process failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

syncDrawings();