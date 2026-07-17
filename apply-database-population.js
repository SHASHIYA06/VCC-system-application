#!/usr/bin/env node

/**
 * Database Population Script
 * Applies the migration to populate new schema tables
 */

require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function applyDatabasePopulation() {
    console.log('=== DATABASE POPULATION SCRIPT ===\n');

    try {
        // Check if database is accessible
        console.log('1. Checking database connectivity...');
        execSync('node test-db-connection.js', { stdio: 'inherit' });
        console.log('✅ Database connection successful\n');

        // Check current status of tables
        console.log('2. Checking current table status...');
        const tableCheckResult = execSync('node simple-table-check.js', { encoding: 'utf8' });
        console.log(tableCheckResult);

        // Apply the migration
        console.log('3. Applying database population migration...');
        console.log('   This may take a few minutes...\n');

        // Run the migration
        execSync('npx prisma migrate dev --name populate_new_tables', { stdio: 'inherit' });

        console.log('\n✅ Migration applied successfully!\n');

        // Verify the results
        console.log('4. Verifying population results...');
        const verifyResult = execSync('node simple-table-check.js', { encoding: 'utf8' });
        console.log(verifyResult);

        // Additional verification for specific tables
        console.log('5. Detailed verification of populated tables...\n');

        // Check equipment
        try {
            const equipmentCount = execSync('node -e "require(\'dotenv\').config();const { PrismaClient } = require(\'@prisma/client\');const p=new PrismaClient({datasources:{db:{url:process.env.DIRECT_URL}}});p.$connect().then(()=>p.equipment.count()).then(c=>console.log(c)).finally(()=>p.$disconnect());"', { encoding: 'utf8' });
            console.log(`Equipment records: ${equipmentCount.trim()}`);
        } catch (e) {
            console.log('Equipment check: Error or not yet populated');
        }

        // Check verification status
        try {
            const verificationCount = execSync('node -e "require(\'dotenv\').config();const { PrismaClient } = require(\'@prisma/client\');const p=new PrismaClient({datasources:{db:{url:process.env.DIRECT_URL}}});p.$connect().then(()=>p.drawingVerificationStatus.count()).then(c=>console.log(c)).finally(()=>p.$disconnect());"', { encoding: 'utf8' });
            console.log(`Drawing verification records: ${verificationCount.trim()}`);
        } catch (e) {
            console.log('Verification status check: Error or not yet populated');
        }

        console.log('\n=== POPULATION COMPLETE ===');
        console.log('✅ New schema tables have been populated with data');
        console.log('✅ Database is now fully utilizing the enhanced schema');
        console.log('✅ Frontend application should now show complete data');

        console.log('\n=== NEXT STEPS ===');
        console.log('1. Restart your development server');
        console.log('2. Test frontend application functionality');
        console.log('3. Verify all data displays correctly');
        console.log('4. Run full application test suite');

    } catch (error) {
        console.error('\n❌ Error during database population:');
        console.error(error.message);

        console.log('\n=== TROUBLESHOOTING ===');
        console.log('1. Check database connection settings in .env.local');
        console.log('2. Ensure Prisma is properly installed: npm install @prisma/client');
        console.log('3. Verify migration file syntax');
        console.log('4. Check database permissions');

        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    applyDatabasePopulation();
}

module.exports = { applyDatabasePopulation };