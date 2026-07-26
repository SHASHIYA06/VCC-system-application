require('dotenv').config();
const { Client } = require('pg');

async function debugColumns() {
    const client = new Client({
        connectionString: process.env.DIRECT_URL
    });

    try {
        await client.connect();
        console.log('Connected to database successfully');

        // Test querying the System table with different column name formats
        console.log('\n=== Testing System Table Column Access ===');

        try {
            const result1 = await client.query(`SELECT "createdAt" FROM "System" LIMIT 1`);
            console.log('✅ "createdAt" works');
        } catch (e) {
            console.log('❌ "createdAt" failed:', e.message);
        }

        try {
            const result2 = await client.query(`SELECT createdAt FROM "System" LIMIT 1`);
            console.log('✅ createdAt works');
        } catch (e) {
            console.log('❌ createdAt failed:', e.message);
        }

        try {
            const result3 = await client.query(`SELECT "createdAt" as created_at FROM "System" LIMIT 1`);
            console.log('✅ "createdAt" as created_at works');
        } catch (e) {
            console.log('❌ "createdAt" as created_at failed:', e.message);
        }

        // Show first few rows with all columns
        console.log('\n=== Sample System Rows ===');
        const sampleResult = await client.query(`SELECT * FROM "System" LIMIT 3`);
        console.log('Sample row:', sampleResult.rows[0]);

        await client.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

debugColumns();