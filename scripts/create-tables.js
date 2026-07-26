require('dotenv').config();
const { Client } = require('pg');

async function createTables() {
    const client = new Client({
        connectionString: process.env.DIRECT_URL
    });

    try {
        await client.connect();
        console.log('Connected to database successfully');

        // Read the SQL file
        const fs = require('fs');
        const path = require('path');
        const sql = fs.readFileSync(path.join(__dirname, 'create-tables.sql'), 'utf8');

        // Execute the SQL
        await client.query(sql);
        console.log('Tables created successfully!');

        // Verify tables were created
        const result = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
            AND tablename IN ('systems', 'drawings', 'connectors', 'wires', 'equipment', 'devices', 'ConnectorType')
            ORDER BY tablename
        `);

        console.log('\n=== CREATED TABLES ===');
        result.rows.forEach(row => {
            console.log(`- ${row.tablename}`);
        });

        await client.end();
        console.log('\nDisconnected from database');
    } catch (error) {
        console.error('Failed to create tables:', error.message);
        await client.end();
        process.exit(1);
    }
}

createTables();