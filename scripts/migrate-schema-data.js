require('dotenv').config();
const { Client } = require('pg');

async function migrateSchemaData() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Start transaction
    await client.query('BEGIN');
    console.log('Starting data migration...');

    // 1. Migrate Systems
    console.log('\n1. Migrating Systems...');
    const systemRows = await client.query(`SELECT * FROM "System"`);
    let systemCount = 0;

    for (const row of systemRows.rows) {
      try {
        await client.query(`
          INSERT INTO systems (
            id, name, code, category, description, sort_order, 
            status, metadata, created_at, updated_at
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9
          )
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            code = EXCLUDED.code,
            category = EXCLUDED.category,
            description = EXCLUDED.description,
            sort_order = EXCLUDED.sort_order,
            status = EXCLUDED.status,
            metadata = EXCLUDED.metadata,
            updated_at = EXCLUDED.updated_at
        `, [
          row.name,
          row.code,
          row.category,
          row.description,
          row.sortOrder,
          row.isActive ? 'active' : 'inactive',
          JSON.stringify({
            dataStatus: row.dataStatus,
            colorTheme: row.colorTheme,
            iconName: row.iconName,
            uiMenuDisplayName: row.uiMenuDisplayName
          }),
          new Date(),
          new Date()
        ]);
        systemCount++;
      } catch (e) {
        console.error(`Error migrating system ${row.code}:`, e.message);
      }
    }
    console.log(`   Migrated ${systemCount} systems`);

    // 2. Migrate Drawings
    console.log('\n2. Migrating Drawings...');
    const drawingRows = await client.query(`SELECT * FROM "Drawing"`);
    let drawingCount = 0;

    for (const row of drawingRows.rows) {
      try {
        await client.query(`
          INSERT INTO drawings (
            id, drawing_number, title, drawing_type, car_type, 
            revision, status, pdf_url, metadata, 
            created_at, updated_at
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
          )
          ON CONFLICT (drawing_number) DO UPDATE SET
            title = EXCLUDED.title,
            drawing_type = EXCLUDED.drawing_type,
            car_type = EXCLUDED.car_type,
            revision = EXCLUDED.revision,
            status = EXCLUDED.status,
            pdf_url = EXCLUDED.pdf_url,
            metadata = EXCLUDED.metadata,
            updated_at = EXCLUDED.updated_at
        `, [
          row.drawingNo,
          row.title,
          row.isReference ? 'reference' : 'electrical',
          null, // car_type not in original table
          row.revision,
          row.status?.toLowerCase() || 'active',
          row.drawingPdfUrl,
          JSON.stringify({
            projectId: row.projectId,
            sourceFileId: row.sourceFileId,
            totalSheets: row.totalSheets,
            remarks: row.remarks,
            isSynced: row.isSynced,
            syncedAt: row.syncedAt
          }),
          row.createdAt,
          row.updatedAt
        ]);
        drawingCount++;
      } catch (e) {
        console.error(`Error migrating drawing ${row.drawingNo}:`, e.message);
      }
    }
    console.log(`   Migrated ${drawingCount} drawings`);

    // 3. Migrate Connectors
    console.log('\n3. Migrating Connectors...');
    const connectorRows = await client.query(`SELECT * FROM "Connector"`);
    let connectorCount = 0;

    for (const row of connectorRows.rows) {
      try {
        await client.query(`
          INSERT INTO connectors (
            id, name, code, location, drawing_reference, 
            pin_count, status, metadata, created_at, updated_at
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9
          )
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            code = EXCLUDED.code,
            location = EXCLUDED.location,
            drawing_reference = EXCLUDED.drawing_reference,
            pin_count = EXCLUDED.pin_count,
            status = EXCLUDED.status,
            metadata = EXCLUDED.metadata,
            updated_at = EXCLUDED.updated_at
        `, [
          row.connectorCode,
          row.connectorCode,
          row.locationTag,
          row.drawingId,
          row.pinCount,
          'active',
          JSON.stringify({
            carType: row.carType,
            instanceLabel: row.instanceLabel,
            sideTag: row.sideTag,
            description: row.description,
            extra: row.extra,
            connectorTypeCode: row.connectorTypeCode,
            scope: row.scope,
            sheetId: row.sheetId
          }),
          row.createdAt,
          new Date()
        ]);
        connectorCount++;
      } catch (e) {
        console.error(`Error migrating connector ${row.connectorCode}:`, e.message);
      }
    }
    console.log(`   Migrated ${connectorCount} connectors`);

    // 4. Migrate Wires
    console.log('\n4. Migrating Wires...');
    const wireRows = await client.query(`SELECT * FROM "Wire"`);
    let wireCount = 0;

    for (const row of wireRows.rows) {
      try {
        await client.query(`
          INSERT INTO wires (
            id, wire_number, wire_color, wire_gauge, signal_medium,
            drawing_reference, status, metadata, created_at, updated_at
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9
          )
          ON CONFLICT (id) DO UPDATE SET
            wire_number = EXCLUDED.wire_number,
            wire_color = EXCLUDED.wire_color,
            wire_gauge = EXCLUDED.wire_gauge,
            signal_medium = EXCLUDED.signal_medium,
            drawing_reference = EXCLUDED.drawing_reference,
            status = EXCLUDED.status,
            metadata = EXCLUDED.metadata,
            updated_at = EXCLUDED.updated_at
        `, [
          row.wireNo,
          row.wireColor,
          row.wireSize,
          row.voltageClass,
          row.sourceConnector,
          row.wireStatus?.toLowerCase() || 'unverified',
          JSON.stringify({
            signalName: row.signalName,
            conductorClassCode: row.conductorClassCode,
            description: row.description,
            cableSpec: row.cableSpec,
            shielded: row.shielded,
            sourceEquipment: row.sourceEquipment,
            sourcePin: row.sourcePin,
            destEquipment: row.destEquipment,
            destConnector: row.destConnector,
            destPin: row.destPin,
            remarks: row.remarks,
            wireAlias: row.wireAlias,
            verificationSource: row.verificationSource,
            verifiedAt: row.verifiedAt
          }),
          row.createdAt,
          row.updatedAt
        ]);
        wireCount++;
      } catch (e) {
        console.error(`Error migrating wire ${row.wireNo}:`, e.message);
      }
    }
    console.log(`   Migrated ${wireCount} wires`);

    // 5. Migrate Equipment
    console.log('\n5. Migrating Equipment...');
    const equipmentRows = await client.query(`SELECT * FROM "Equipment"`);
    let equipmentCount = 0;

    for (const row of equipmentRows.rows) {
      try {
        await client.query(`
          INSERT INTO equipment (
            id, name, part_number, manufacturer, model,
            status, metadata, created_at, updated_at
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8
          )
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            part_number = EXCLUDED.part_number,
            manufacturer = EXCLUDED.manufacturer,
            model = EXCLUDED.model,
            status = EXCLUDED.status,
            metadata = EXCLUDED.metadata,
            updated_at = EXCLUDED.updated_at
        `, [
          row.name,
          row.partNumber,
          row.manufacturer,
          row.model,
          'active',
          JSON.stringify({
            code: row.code,
            subsystemId: row.subsystemId,
            description: row.description,
            metadata: row.metadata
          }),
          row.createdAt,
          row.updatedAt
        ]);
        equipmentCount++;
      } catch (e) {
        console.error(`Error migrating equipment ${row.name}:`, e.message);
      }
    }
    console.log(`   Migrated ${equipmentCount} equipment items`);

    // 6. Migrate Devices
    console.log('\n6. Migrating Devices...');
    const deviceRows = await client.query(`SELECT * FROM "Device"`);
    let deviceCount = 0;

    for (const row of deviceRows.rows) {
      try {
        await client.query(`
          INSERT INTO devices (
            id, name, device_type, location, part_number,
            manufacturer, status, metadata, created_at, updated_at
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9
          )
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            device_type = EXCLUDED.device_type,
            location = EXCLUDED.location,
            part_number = EXCLUDED.part_number,
            manufacturer = EXCLUDED.manufacturer,
            status = EXCLUDED.status,
            metadata = EXCLUDED.metadata,
            updated_at = EXCLUDED.updated_at
        `, [
          row.deviceName,
          row.deviceType,
          row.locationTag,
          row.manufacturerRef,
          row.manufacturerRef,
          row.isVerified ? 'active' : 'pending',
          JSON.stringify({
            drawingId: row.drawingId,
            systemId: row.systemId,
            subsystemId: row.subsystemId,
            tagNo: row.tagNo,
            carType: row.carType,
            note: row.note,
            extra: row.extra,
            verifiedAt: row.verifiedAt
          }),
          new Date(),
          new Date()
        ]);
        deviceCount++;
      } catch (e) {
        console.error(`Error migrating device ${row.deviceName}:`, e.message);
      }
    }
    console.log(`   Migrated ${deviceCount} devices`);

    // Commit transaction
    await client.query('COMMIT');
    console.log('\n✅ Data migration completed successfully!');

    // Verify migration
    console.log('\n=== VERIFICATION ===');
    const verificationQueries = [
      { table: 'systems', query: 'SELECT COUNT(*) as count FROM systems' },
      { table: 'drawings', query: 'SELECT COUNT(*) as count FROM drawings' },
      { table: 'connectors', query: 'SELECT COUNT(*) as count FROM connectors' },
      { table: 'wires', query: 'SELECT COUNT(*) as count FROM wires' },
      { table: 'equipment', query: 'SELECT COUNT(*) as count FROM equipment' },
      { table: 'devices', query: 'SELECT COUNT(*) as count FROM devices' }
    ];

    for (const { table, query } of verificationQueries) {
      const result = await client.query(query);
      console.log(`${table}: ${result.rows[0].count} records`);
    }

    await client.end();
    console.log('\n🎉 Schema upgrade and data migration completed successfully!');

  } catch (error) {
    // Rollback transaction on error
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Failed to rollback transaction:', rollbackError.message);
    }

    console.error('❌ Migration failed:', error.message);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

migrateSchemaData();