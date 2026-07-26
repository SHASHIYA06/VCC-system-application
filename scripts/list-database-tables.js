require('dotenv').config();
const { Client } = require('pg');

async function listTables() {
    const client = new Client({
        connectionString: process.env.DIRECT_URL
    });

    try {
        await client.connect();
        console.log('Connected to database successfully');

        // List all tables in the public schema
        const result = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename
        `);

        console.log('\n=== DATABASE TABLES ===');
        if (result.rows.length === 0) {
            console.log('No tables found in the database');
        } else {
            result.rows.forEach(row => {
                console.log(`- ${row.tablename}`);
            });
        }

        await client.end();
        console.log('\nDisconnected from database');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
}

listTables();