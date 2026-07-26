require('dotenv').config();
const { Client } = require('pg');

async function analyzeExistingSchema() {
    const client = new Client({
        connectionString: process.env.DIRECT_URL
    });

    try {
        await client.connect();
        console.log('Connected to database successfully');

        // Get all tables in the public schema
        const tablesResult = await client.query(`
            SELECT tablename, schemaname
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename
        `);

        console.log('=== ALL TABLES IN DATABASE ===');
        if (tablesResult.rows.length === 0) {
            console.log('No tables found');
        } else {
            tablesResult.rows.forEach(row => {
                console.log(`- ${row.tablename}`);
            });
        }

        // Check for common table names (both old and new schema)
        const commonTables = [
            'System', 'system', 'systems',
            'Drawing', 'drawing', 'drawings',
            'Connector', 'connector', 'connectors',
            'Wire', 'wire', 'wires',
            'Device', 'device', 'devices',
            'Equipment', 'equipment',
            'ConnectorType', 'connector_type',
            'pins', 'connector_pins', 'ConnectorPin'
        ];

        console.log('\n=== CHECKING FOR SPECIFIC TABLES ===');
        for (const tableName of commonTables) {
            try {
                const countResult = await client.query(`
                    SELECT COUNT(*) as count 
                    FROM "${tableName}"
                    LIMIT 1
                `);
                console.log(`${tableName}: ${countResult.rows[0].count} records`);
            } catch (e) {
                console.log(`${tableName}: Table does not exist or inaccessible`);
            }
        }

        // Try to get column information for common tables
        console.log('\n=== COLUMN STRUCTURE ANALYSIS ===');
        for (const tableName of ['System', 'system', 'systems']) {
            try {
                const columnsResult = await client.query(`
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns
                    WHERE table_name = $1
                    ORDER BY ordinal_position
                `, [tableName]);

                if (columnsResult.rows.length > 0) {
                    console.log(`\nColumns in ${tableName}:`);
                    columnsResult.rows.forEach(col => {
                        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
                    });
                }
            } catch (e) {
                // Table doesn't exist, continue
            }
        }

        await client.end();
        console.log('\nDisconnected from database');
    } catch (error) {
        console.error('Database analysis failed:', error.message);
        await client.end();
        process.exit(1);
    }
}

analyzeExistingSchema();