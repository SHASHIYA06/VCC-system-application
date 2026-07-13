const { PrismaClient } = require('@prisma/client');

async function testConnection() {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DIRECT_URL
            }
        }
    });

    try {
        console.log('Testing database connection...');
        await prisma.$connect();
        console.log('✅ Connected to database successfully');

        // Test a simple query
        const systems = await prisma.system.count();
        console.log(`Found ${systems} systems in the database`);

        await prisma.$disconnect();
        console.log('✅ Disconnected from database');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();