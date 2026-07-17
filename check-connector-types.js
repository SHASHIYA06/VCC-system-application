require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function checkConnectorTypes() {
    const prisma = new PrismaClient({
        datasources: { db: { url: process.env.DIRECT_URL } }
    });

    try {
        await prisma.$connect();

        const count = await prisma.connectorType.count();
        console.log('ConnectorType count:', count);

        if (count > 0) {
            const samples = await prisma.connectorType.findMany({ take: 10 });
            console.log('Sample connector types:');
            samples.forEach(c => {
                console.log(`  ${c.code}: ${c.description} (${c.nominalPins || 'N/A'} pins)`);
            });
        } else {
            console.log('No connector types found');
        }

        await prisma.$disconnect();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkConnectorTypes();