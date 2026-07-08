import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNeonSchema() {
    try {
        console.log('Checking Neon database schema...\n');

        // Check if all expected tables exist
        const expectedTables = [
            'System', 'Drawing', 'Connector', 'ConnectorPin', 'Wire',
            'Device', 'DrawingWire', 'DrawingPageMapping', 'WireEndpoint',
            'ValidationIssue', 'CrossConnection'
        ];

        console.log('=== CHECKING TABLE EXISTENCE ===');
        for (const table of expectedTables) {
            try {
                // Simple query to check if table exists
                const result = await prisma.$queryRawUnsafe(`SELECT COUNT(*) FROM "${table}" LIMIT 1`);
                console.log(`✓ Table ${table} exists`);
            } catch (error) {
                console.log(`✗ Table ${table} missing or inaccessible`);
            }
        }

        // Check specific schema elements from the migration
        console.log('\n=== CHECKING SCHEMA ELEMENTS ===');

        // Check if System table has the new columns
        try {
            const systemColumns = await prisma.$queryRawUnsafe(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'System' AND column_name IN ('dataStatus', 'uiMenuDisplayName', 'iconName', 'colorTheme', 'isActive')
      `);

            console.log('System table additional columns:');
            // @ts-ignore
            systemColumns.forEach((col: any) => console.log(`  ${col.column_name}: ${col.data_type}`));
        } catch (error: any) {
            console.log('Could not check System table columns:', error.message);
        }

        // Check if Drawing table has the new columns
        try {
            const drawingColumns = await prisma.$queryRawUnsafe(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'Drawing' AND column_name IN ('isSynced', 'syncedAt')
      `);

            console.log('Drawing table additional columns:');
            // @ts-ignore
            drawingColumns.forEach((col: any) => console.log(`  ${col.column_name}: ${col.data_type}`));
        } catch (error: any) {
            console.log('Could not check Drawing table columns:', error.message);
        }

        // Check if Device table has the new columns
        try {
            const deviceColumns = await prisma.$queryRawUnsafe(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'Device' AND column_name IN ('isVerified', 'verifiedAt')
      `);

            console.log('Device table additional columns:');
            // @ts-ignore
            deviceColumns.forEach((col: any) => console.log(`  ${col.column_name}: ${col.data_type}`));
        } catch (error: any) {
            console.log('Could not check Device table columns:', error.message);
        }

        // Check if new tables exist
        const newTables = ['DrawingVerificationStatus', 'DeviceSpecification'];

        console.log('\n=== CHECKING NEW TABLES ===');
        for (const table of newTables) {
            try {
                const result = await prisma.$queryRawUnsafe(`SELECT COUNT(*) FROM "${table}" LIMIT 1`);
                console.log(`✓ Table ${table} exists`);
            } catch (error) {
                console.log(`✗ Table ${table} missing or inaccessible`);
            }
        }

        console.log('\n=== NEON SCHEMA CHECK COMPLETE ===');

    } catch (error: any) {
        console.error('Error checking Neon schema:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkNeonSchema();