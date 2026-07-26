/**
 * RESTORE MAIN BRANCH FROM WIRE-INTEGRITY BRANCH
 * 
 * This uses raw pg client for maximum speed.
 * Transfers all data from wire-integrity to main branch.
 */

import { Pool } from 'pg';

const SOURCE_URL = 'postgresql://neondb_owner:npg_KyjXIOVCDW32@ep-young-wildflower-aqy2a92u-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require';
const TARGET_URL = 'postgresql://neondb_owner:npg_KyjXIOVCDW32@ep-tiny-mode-aq7698gi-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require';

const sourcePool = new Pool({ connectionString: SOURCE_URL, max: 5 });
const targetPool = new Pool({ connectionString: TARGET_URL, max: 5 });

async function transferTable(tableName: string, idColumn: string = 'id') {
  const startTime = Date.now();
  
  // Get count from source
  const countResult = await sourcePool.query(`SELECT COUNT(*) as cnt FROM "${tableName}"`);
  const sourceCount = parseInt(countResult.rows[0].cnt);
  
  if (sourceCount === 0) {
    console.log(`   ⏭️  ${tableName}: 0 rows (skipping)`);
    return 0;
  }

  // Get column names
  const colResult = await sourcePool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = $1 AND table_schema = 'public'
    ORDER BY ordinal_position
  `, [tableName]);
  const columns = colResult.rows.map((r: any) => r.column_name);
  const colList = columns.map((c: string) => `"${c}"`).join(', ');

  // Transfer in batches
  const BATCH_SIZE = 5000;
  let totalInserted = 0;
  let offset = 0;

  while (offset < sourceCount) {
    const batch = await sourcePool.query(
      `SELECT ${colList} FROM "${tableName}" ORDER BY "${idColumn}" LIMIT ${BATCH_SIZE} OFFSET ${offset}`
    );

    if (batch.rows.length === 0) break;

    // Build INSERT with ON CONFLICT DO NOTHING
    const values: any[] = [];
    const placeholders: string[] = [];
    let paramIdx = 1;

    for (const row of batch.rows) {
      const rowPlaceholders: string[] = [];
      for (const col of columns) {
        values.push(row[col]);
        rowPlaceholders.push(`$${paramIdx++}`);
      }
      placeholders.push(`(${rowPlaceholders.join(', ')})`);
    }

    try {
      const insertSQL = `INSERT INTO "${tableName}" (${colList}) VALUES ${placeholders.join(', ')} ON CONFLICT DO NOTHING`;
      const result = await targetPool.query(insertSQL, values);
      totalInserted += result.rowCount || 0;
    } catch (e: any) {
      // If batch fails due to size, try smaller batches
      if (e.message?.includes('too many parameters')) {
        for (const row of batch.rows) {
          const rowValues = columns.map(c => row[c]);
          const rowPlaceholders = columns.map((_, i) => `$${i + 1}`);
          try {
            await targetPool.query(
              `INSERT INTO "${tableName}" (${colList}) VALUES (${rowPlaceholders.join(', ')}) ON CONFLICT DO NOTHING`,
              rowValues
            );
            totalInserted++;
          } catch { /* skip individual failures */ }
        }
      } else {
        console.log(`     ⚠️ Batch error: ${e.message?.substring(0, 100)}`);
      }
    }

    offset += BATCH_SIZE;
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`   ✅ ${tableName}: ${totalInserted}/${sourceCount} rows (${elapsed}s)`);
  return totalInserted;
}

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║      RESTORE MAIN BRANCH FROM WIRE-INTEGRITY BRANCH                       ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

  try {
    // Test connections
    await sourcePool.query('SELECT 1');
    console.log('✅ Source (wire-integrity) connected');
    await targetPool.query('SELECT 1');
    console.log('✅ Target (main) connected\n');

    // Transfer tables in dependency order (parents first)
    const tables = [
      // Level 0: No dependencies
      { name: 'Project', id: 'id' },
      { name: 'ConductorClass', id: 'code' },
      { name: 'ConnectorType', id: 'code' },
      
      // Level 1: Depends on Project
      { name: 'Formation', id: 'id' },
      { name: 'System', id: 'id' },
      { name: 'SourceFile', id: 'id' },
      { name: 'ReferenceDrawing', id: 'id' },
      
      // Level 2: Depends on System, Formation
      { name: 'Drawing', id: 'id' },
      { name: 'Car', id: 'id' },
      
      // Level 3: Depends on Drawing
      { name: 'DrawingPage', id: 'id' },
      { name: 'DrawingPageMapping', id: 'id' },
      { name: 'DrawingSheet', id: 'id' },
      { name: 'DrawingNote', id: 'id' },
      { name: 'Circuit', id: 'id' },
      { name: 'Device', id: 'id' },
      { name: 'Connector', id: 'id' },
      { name: 'Signal', id: 'id' },
      { name: 'TrainLine', id: 'id' },
      { name: 'CrossConnection', id: 'id' },
      { name: 'Note', id: 'id' },
      
      // Level 4: Depends on Connector, Circuit, Device
      { name: 'ConnectorPin', id: 'id' },
      { name: 'CircuitEndpoint', id: 'id' },
      
      // Level 5: Depends on Wire (standalone)
      { name: 'Wire', id: 'id' },
      
      // Level 6: Depends on Wire + Connector + Pin + Device
      { name: 'WireEndpoint', id: 'id' },
      { name: 'DrawingWire', id: 'id' },
    ];

    let totalRows = 0;
    for (const table of tables) {
      try {
        const count = await transferTable(table.name, table.id);
        totalRows += count;
      } catch (e: any) {
        console.log(`   ❌ ${table.name}: FAILED - ${e.message?.substring(0, 100)}`);
      }
    }

    console.log(`\n\n✅ RESTORE COMPLETE: ${totalRows} total rows transferred\n`);

    // Verify final state
    const verifyResult = await targetPool.query(`
      SELECT 'Drawing' as tbl, COUNT(*) as cnt FROM "Drawing"
      UNION ALL SELECT 'Wire', COUNT(*) FROM "Wire"
      UNION ALL SELECT 'WireEndpoint', COUNT(*) FROM "WireEndpoint"
      UNION ALL SELECT 'Connector', COUNT(*) FROM "Connector"
      UNION ALL SELECT 'ConnectorPin', COUNT(*) FROM "ConnectorPin"
      ORDER BY tbl
    `);
    
    console.log('📊 Final state of main branch:');
    for (const row of verifyResult.rows) {
      console.log(`   ${row.tbl}: ${row.cnt}`);
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await sourcePool.end();
    await targetPool.end();
  }
}

main();
