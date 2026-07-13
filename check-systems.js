const { PrismaClient } = require('@prisma/client');

async function checkSystems() {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DIRECT_URL
            }
        }
    });

    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('✅ Connected to database successfully');

        // Check systems
        const systems = await prisma.system.findMany({
            select: {
                code: true,
                name: true,
                category: true
            },
            orderBy: {
                sortOrder: 'asc'
            }
        });

        console.log('\nAvailable systems:');
        systems.forEach(sys => {
            console.log(`- ${sys.code}: ${sys.name} (${sys.category})`);
        });
        console.log(`\nTotal systems: ${systems.length}`);

        // Check for devices
        const deviceCount = await prisma.device.count();
        console.log(`Total devices: ${deviceCount}`);

        // Check for connectors
        const connectorCount = await prisma.connector.count();
        console.log(`Total connectors: ${connectorCount}`);

        // Check for wires
        const wireCount = await prisma.wire.count();
        console.log(`Total wires: ${wireCount}`);

        await prisma.$disconnect();
        console.log('\n✅ Disconnected from database');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkSystems();