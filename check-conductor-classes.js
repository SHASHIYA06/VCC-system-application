require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function checkConductorClasses() {
    const prisma = new PrismaClient({
        datasources: { db: { url: process.env.DIRECT_URL } }
    });

    try {
        await prisma.$connect();

        const count = await prisma.conductorClass.count();
        console.log('ConductorClass count:', count);

        if (count > 0) {
            const samples = await prisma.conductorClass.findMany({ take: 5 });
            console.log('Sample conductor classes:', samples);
        } else {
            console.log('No conductor classes found');
        }

        await prisma.$disconnect();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkConductorClasses();