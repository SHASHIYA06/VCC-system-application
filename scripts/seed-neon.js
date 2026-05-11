#!/usr/bin/env node
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('Error: DATABASE_URL environment variable is not set');
  console.log('Run: DATABASE_URL="postgresql://..." node scripts/seed-neon.js');
  process.exit(1);
}

const sql = neon(dbUrl);

async function main() {
  console.log('Reading schema file...');
  const schemaPath = path.join(__dirname, '../supabase/migrations/001_kmrcl_vcc_schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  console.log('Executing schema and seed data...');
  
  const statements = schema.split(';').filter(s => s.trim());
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (stmt) {
      try {
        await sql(stmt);
        console.log(`Statement ${i + 1}/${statements.length} executed`);
      } catch (err) {
        console.error(`Error on statement ${i + 1}:`, err.message);
      }
    }
  }
  
  console.log('Done! Data seeded successfully.');
}

main().catch(console.error);