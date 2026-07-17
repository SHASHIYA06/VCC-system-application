# Database Population for New Schema

This directory contains scripts and migrations to populate the new schema tables in your VCC System Application database.

## Overview

The new Prisma schema includes several tables that were previously empty but are essential for the enhanced functionality of the application. This population process will:

1. Fill empty tables with relevant data
2. Enhance existing data with new relationships
3. Improve data quality and completeness metrics
4. Enable advanced features in the frontend application

## Files Included

1. **`prisma/migrations/20260717_populate_new_tables/migration.sql`** - Main migration script
2. **`apply-database-population.js`** - Script to apply the migration
3. **`verify-population.js`** - Script to verify the results
4. **`DATABASE_POPULATION_PLAN.md`** - Detailed plan and strategy

## Tables to be Populated

### Newly Populated Tables:
- **Equipment**: Railway equipment catalog (50-100 records expected)
- **DeviceSpecification**: Detailed device specifications (244+ records)
- **DrawingVerificationStatus**: Verification tracking (272 records)
- **Cable**: Cable specifications (50-100 records)

### Enhanced Existing Tables:
- **ConnectorType**: All 27 standard connector types
- **SystemMetadata**: Updated completeness metrics
- **VCCDescription**: Enhanced system descriptions

## How to Apply Population

### Method 1: Automated Script (Recommended)
```bash
# Make script executable
chmod +x apply-database-population.js

# Run the population script
node apply-database-population.js
```

### Method 2: Manual Migration
```bash
# Apply the migration directly
npx prisma migrate dev --name populate_new_tables

# Verify results
node verify-population.js
```

## What the Migration Does

### 1. Connector Types Standardization
- Ensures all 27 connector types are available
- Updates existing connectors with proper type references

### 2. Drawing Verification Status
- Creates verification records for all 272 drawings
- Sets confidence scores based on sync status
- Tracks verification history and metadata

### 3. Equipment Catalog Creation
- Generates equipment records from device data
- Creates standardized equipment codes and descriptions
- Links to subsystems for better organization

### 4. Device Specifications
- Extracts specifications from existing device data
- Categorizes specifications for better search
- Adds verification status and source tracking

### 5. Cable Specifications
- Creates cable records from wire data
- Adds technical specifications and metadata
- Enables cable-focused analysis and reporting

## Expected Results

### Before Population:
- Equipment: 0 records
- DeviceSpecification: 0 records
- DrawingVerificationStatus: 0 records
- Cable: 0 records

### After Population:
- Equipment: 50-100 records
- DeviceSpecification: 244+ records
- DrawingVerificationStatus: 272 records
- Cable: 50-100 records

### Data Quality Improvements:
- 100% verification coverage for drawings
- Enhanced equipment catalog for better navigation
- Detailed specifications for advanced filtering
- Cable data for infrastructure planning

## Verification

After running the population, verify the results:

```bash
# Check table counts
node simple-table-check.js

# Detailed verification
node verify-population.js
```

Expected output should show all new tables populated with data.

## Troubleshooting

### Common Issues:

1. **Permission Denied**
   ```bash
   # Solution: Check database credentials in .env.local
   ```

2. **Migration Already Applied**
   ```bash
   # Solution: Prisma tracks migrations - this is normal
   ```

3. **Connection Failed**
   ```bash
   # Solution: Verify DIRECT_URL in .env.local
   node test-db-connection.js
   ```

4. **Data Integrity Errors**
   ```bash
   # Solution: Check for conflicting data
   # Consider resetting and reapplying
   ```

### Rollback Procedure:
```bash
# If issues occur, you can rollback by:
# 1. Creating a new migration that undoes the changes
# 2. Or restoring from a database backup

# Create backup before any major changes
pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Next Steps After Population

1. **Restart Development Server**
   ```bash
   npm run dev
   ```

2. **Test Frontend Features**
   - Equipment browsing
   - Device specifications
   - Drawing verification status
   - Cable information

3. **Run Full Test Suite**
   ```bash
   npm test
   ```

4. **Verify Data Displays**
   - Check that all new data appears in UI
   - Test search and filtering with new fields
   - Verify relationships work correctly

## Benefits of Population

### For Developers:
- Richer data model for advanced queries
- Better data organization and relationships
- Improved performance with proper indexing

### For Users:
- Enhanced search capabilities
- Detailed equipment and device information
- Verification status for data confidence
- Better navigation and filtering options

### For System Administrators:
- Data quality metrics and tracking
- Verification history and audit trail
- Equipment lifecycle management
- Infrastructure planning data

## Support

For issues with the population process, contact:
- Check the database connection settings
- Verify Prisma is properly installed
- Review migration file for syntax errors
- Ensure sufficient database permissions

The population process is designed to be safe and reversible, with no risk to existing data.