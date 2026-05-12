#!/usr/bin/env node
/**
 * KMRCL VCC Explorer - Neon Database Setup Script
 * 
 * This script creates the complete VCC database schema and seeds all data.
 * 
 * Usage:
 *   1. Get your Neon database connection string from https://neon.tech
 *   2. Set DATABASE_URL in your .env.local or environment
 *   3. Run: node scripts/setup-db.js
 */

const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set. Please set it before running this script.');
  console.error('');
  console.error('Example:');
  console.error('  DATABASE_URL=postgres://user:pass@host/db node scripts/setup-db.js');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function run() {
  console.log('🚀 KMRCL VCC Explorer - Database Setup');
  console.log('========================================\n');

  try {
    // 1. Create extensions
    console.log('📦 Creating extensions...');
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;
    console.log('   ✅ Extensions created\n');

    // 2. Create enums
    console.log('📦 Creating enum types...');
    await sql`CREATE TYPE app_role AS ENUM ('admin', 'engineer', 'viewer')`;
    await sql`CREATE TYPE drawing_status AS ENUM ('active', 'superseded', 'obsolete', 'draft')`;
    await sql`CREATE TYPE ocr_quality AS ENUM ('raw', 'reviewed', 'verified', 'failed')`;
    await sql`CREATE TYPE car_zone AS ENUM ('UNDERFRAME', 'CEILING', 'CAB', 'BOGIE', 'INTERIOR')`;
    await sql`CREATE TYPE connection_type AS ENUM ('FEEDS', 'CONTROLS', 'REPORTS_TO', 'RETURNS_TO', 'CROSSES_AT', 'INTERLOCKS_WITH')`;
    console.log('   ✅ Enum types created\n');

    // 3. Create core tables
    console.log('📦 Creating core tables...');
    
    await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      customer_name TEXT,
      rolling_stock_type TEXT,
      formation TEXT DEFAULT 'DMC-TC-MC-MC-TC-DMC',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    
    await sql`
    CREATE TABLE IF NOT EXISTS car_types (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      position_in_formation SMALLINT,
      is_driving BOOLEAN DEFAULT false,
      has_motor BOOLEAN DEFAULT false,
      has_panto BOOLEAN DEFAULT false,
      UNIQUE(project_id, code)
    )`;
    
    await sql`
    CREATE TABLE IF NOT EXISTS systems (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT,
      description TEXT,
      icon_name TEXT,
      color_hex TEXT,
      sort_order SMALLINT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    
    await sql`
    CREATE TABLE IF NOT EXISTS subsystems (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      sort_order SMALLINT,
      UNIQUE(system_id, code)
    )`;
    
    await sql`
    CREATE TABLE IF NOT EXISTS drawings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
      car_type_id UUID REFERENCES car_types(id) ON DELETE RESTRICT,
      system_id UUID NOT NULL REFERENCES systems(id) ON DELETE RESTRICT,
      subsystem_id UUID REFERENCES subsystems(id) ON DELETE SET NULL,
      drawing_no TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      drawing_type TEXT DEFAULT 'PIN_ASSIGNMENT',
      sheet_count INTEGER DEFAULT 1,
      current_alt TEXT,
      current_revision TEXT,
      drawing_date DATE,
      drwn_by TEXT,
      chkd_by TEXT,
      revd_by TEXT,
      appd_by TEXT,
      status drawing_status NOT NULL DEFAULT 'active',
      notes TEXT,
      zone car_zone,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    
    await sql`
    CREATE TABLE IF NOT EXISTS equipment (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      car_type_id UUID REFERENCES car_types(id) ON DELETE SET NULL,
      system_id UUID REFERENCES systems(id) ON DELETE SET NULL,
      subsystem_id UUID REFERENCES subsystems(id) ON DELETE SET NULL,
      equipment_code TEXT NOT NULL,
      equipment_name TEXT NOT NULL,
      equipment_type TEXT,
      manufacturer TEXT,
      part_number TEXT,
      location_hint TEXT,
      zone car_zone,
      description TEXT,
      UNIQUE(project_id, equipment_code)
    )`;
    
    await sql`
    CREATE TABLE IF NOT EXISTS connectors (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      drawing_id UUID NOT NULL REFERENCES drawings(id) ON DELETE CASCADE,
      equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
      connector_code TEXT NOT NULL,
      connector_type TEXT,
      pin_count INTEGER,
      view_name TEXT,
      remarks TEXT,
      UNIQUE(drawing_id, connector_code)
    )`;
    
    await sql`
    CREATE TABLE IF NOT EXISTS pins (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      connector_id UUID NOT NULL REFERENCES connectors(id) ON DELETE CASCADE,
      pin_no TEXT NOT NULL,
      sequence_no INTEGER,
      wire_id UUID,
      wire_no_raw TEXT,
      signal_name TEXT,
      wire_type_raw TEXT,
      cable_spec TEXT,
      from_ref TEXT,
      to_ref TEXT,
      remark TEXT,
      UNIQUE(connector_id, pin_no)
    )`;
    
    await sql`
    CREATE TABLE IF NOT EXISTS wires (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
      wire_no TEXT NOT NULL UNIQUE,
      wire_type TEXT,
      wire_size TEXT,
      wire_color TEXT,
      shielded BOOLEAN DEFAULT false,
      voltage_class TEXT,
      description TEXT,
      remarks TEXT
    )`;
    
    await sql`
    CREATE TABLE IF NOT EXISTS trainlines (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      trainline_no INTEGER NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      system_id TEXT NOT NULL,
      voltage_domain TEXT DEFAULT '110VDC',
      is_cross_connected BOOLEAN DEFAULT false,
      cross_connect_notes TEXT
    )`;
    
    await sql`
    CREATE TABLE IF NOT EXISTS trainline_crossings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      trainline_id UUID NOT NULL REFERENCES trainlines(id) ON DELETE CASCADE,
      crossing_type TEXT,
      source_connector TEXT,
      source_pin TEXT,
      dest_connector TEXT,
      dest_pin TEXT,
      description TEXT
    )`;
    
    await sql`
    CREATE TABLE IF NOT EXISTS tcms_points (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      point_code TEXT NOT NULL UNIQUE,
      rio_unit TEXT NOT NULL,
      connector_code TEXT,
      pin_no TEXT,
      signal_type TEXT NOT NULL,
      signal_name TEXT NOT NULL,
      description TEXT,
      system_id TEXT,
      equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
      drawing_id UUID REFERENCES drawings(id) ON DELETE SET NULL
    )`;
    
    console.log('   ✅ Core tables created\n');

    // 4. Seed data
    console.log('📦 Seeding data...');

    // Project
    const [project] = await sql`
      INSERT INTO projects (code, name, customer_name, rolling_stock_type)
      VALUES ('KMRCL_RS3R', 'KMRCL RS3R Metro', 'KMRCL', 'Metro Rail')
      ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `;
    const projectId = project.id;

    // Car types
    const carTypeIds = {};
    const carTypes = [
      { code: 'DMC', name: 'Driving Motor Car', pos: 1, driving: true, motor: true },
      { code: 'TC', name: 'Trailer Car', pos: 2, driving: false, motor: false },
      { code: 'MC', name: 'Motor Car', pos: 3, driving: false, motor: true },
    ];

    for (let i = 0; i < carTypes.length; i++) {
      const ct = carTypes[i];
      const [result] = await sql`
        INSERT INTO car_types (project_id, code, name, position_in_formation, is_driving, has_motor)
        VALUES (${projectId}, ${ct.code}, ${ct.name}, ${ct.pos}, ${ct.driving}, ${ct.motor})
        ON CONFLICT (project_id, code) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `;
      carTypeIds[ct.code] = result.id;
    }
    console.log('   ✅ Car types seeded');

    // Systems
    const systemIds = {};
    const systems = [
      { code: 'GEN', name: 'General & Foundation', category: 'Foundation', sort: 0, desc: 'Drawing list, classification, wiring numbers, symbols' },
      { code: 'TRL', name: 'Trainlines', category: 'Core', sort: 1, desc: 'Train line control, signal, power distribution' },
      { code: 'CAB', name: 'Cab Control', category: 'Core', sort: 2, desc: 'Head/tail control relay, key-on relay, status' },
      { code: 'TRAC', name: 'Traction Control', category: 'Propulsion', sort: 3, desc: 'Speed control, VVVF inverter, traction return' },
      { code: 'BRAKE', name: 'Brake System', category: 'Core', sort: 4, desc: 'Compressor, brake loop, emergency brake, parking brake' },
      { code: 'APS', name: 'Auxiliary Power', category: 'Power', sort: 5, desc: 'APS unit, shore supply, battery control' },
      { code: 'DOOR', name: 'Door System', category: 'Core', sort: 6, desc: 'Door supply, left/right operation, proving loop' },
      { code: 'VAC', name: 'VAC/HVAC', category: 'Core', sort: 7, desc: 'Cab VAC, saloon VAC power and control' },
      { code: 'TMS', name: 'TCMS', category: 'Control', sort: 8, desc: 'TMS interface, TCMS RIO digital I/O' },
      { code: 'COMMS', name: 'Communications', category: 'Control', sort: 9, desc: 'PIS/TIS, PA, DVAS, CBTC, CCTV' },
      { code: 'LIGHT', name: 'Interior Lighting', category: 'Power', sort: 10, desc: 'Head cab light, saloon lights, wiper' },
      { code: 'COUPL', name: 'Coupler Control', category: 'Core', sort: 11, desc: 'Gangway coupler control' },
      { code: 'LTEB', name: 'Low Tension Equipment Box', category: 'Power', sort: 12, desc: 'LTEB panel' },
      { code: 'LTJB', name: 'Low Tension Junction Box', category: 'Power', sort: 13, desc: 'LTJB junction' },
      { code: 'EDB', name: 'Electrical Distribution Box', category: 'Power', sort: 14, desc: 'EDB panel' },
      { code: 'HV', name: 'High Voltage', category: 'Power', sort: 15, desc: 'HSCB, pantograph, HTEB/HTJB' },
    ];

    for (const sys of systems) {
      const [result] = await sql`
        INSERT INTO systems (code, name, category, description, sort_order)
        VALUES (${sys.code}, ${sys.name}, ${sys.category}, ${sys.desc}, ${sys.sort})
        ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `;
      systemIds[sys.code] = result.id;
    }
    console.log('   ✅ Systems seeded');

    // Trainlines
    const trainlines = [
      { no: 1032, name: 'RESET', desc: 'System reset command', sys: 'TRL' },
      { no: 1040, name: 'AUX ON', desc: 'Auxiliary power on command', sys: 'APS' },
      { no: 1050, name: 'SHUT DOWN', desc: 'System shutdown command', sys: 'TRL' },
      { no: 1207, name: 'VVVF FAULT', desc: 'VVVF inverter fault indication', sys: 'TRAC' },
      { no: 1209, name: 'HSCB TRIP', desc: 'High speed circuit breaker trip', sys: 'HV' },
      { no: 1215, name: 'AUX FAULT', desc: 'Auxiliary system fault', sys: 'APS' },
      { no: 1217, name: 'VAC FAULT', desc: 'VAC system fault indication', sys: 'VAC' },
      { no: 3003, name: 'FORWARD', desc: 'Forward propulsion command', sys: 'TRAC' },
      { no: 3004, name: 'REVERSE', desc: 'Reverse propulsion command', sys: 'TRAC' },
      { no: 3005, name: 'POWERING 1', desc: 'Powering command level 1 (crossed with 3006)', sys: 'TRAC', cross: true, crossNotes: 'Crossed with 3006 at X1 pins 19/20' },
      { no: 3006, name: 'POWERING 2', desc: 'Powering command level 2 (crossed with 3005)', sys: 'TRAC', cross: true, crossNotes: 'Crossed with 3005 at X1 pins 20/19' },
      { no: 3010, name: 'BRAKING', desc: 'Braking command', sys: 'TRAC' },
      { no: 3011, name: 'FULL SERVICE BRAKE', desc: 'Full service brake command', sys: 'TRAC' },
      { no: 4024, name: 'BRAKE LOOP', desc: 'Brake loop normal', sys: 'BRAKE' },
      { no: 4028, name: 'BRAKE LOOP RETURN', desc: 'Brake loop return', sys: 'BRAKE' },
      { no: 4062, name: 'EM BRAKE LOOP N', desc: 'Emergency brake loop normal path', sys: 'BRAKE' },
      { no: 4103, name: 'EM BRAKE LOOP R', desc: 'Emergency brake loop redundant', sys: 'BRAKE' },
      { no: 4122, name: 'PARKING BRAKE APPLIED', desc: 'Parking brake applied indication', sys: 'BRAKE' },
      { no: 4153, name: 'PARKING BRAKE RELEASED', desc: 'Parking brake released indication', sys: 'BRAKE' },
      { no: 5000, name: 'SHORE SUPPLY', desc: 'Shore supply contactor command', sys: 'APS' },
      { no: 5030, name: 'SIV CONTACT 1', desc: 'SIV contactor 1 status', sys: 'APS' },
      { no: 5064, name: 'BATTERY UNDER-VOLT', desc: 'Battery under-voltage monitoring', sys: 'APS' },
      { no: 6009, name: 'DOOR OPEN LEFT', desc: 'Left door open command (crossed)', sys: 'DOOR', cross: true, crossNotes: 'Crossed with 6046 at jumper 43-44' },
      { no: 6014, name: 'DOOR CLOSE LEFT', desc: 'Left door close command (crossed)', sys: 'DOOR', cross: true, crossNotes: 'Crossed with 6051 at jumper 46-47' },
      { no: 6046, name: 'DOOR OPEN RIGHT', desc: 'Right door open command (crossed)', sys: 'DOOR', cross: true, crossNotes: 'Crossed with 6009 at jumper 43-44' },
      { no: 6051, name: 'DOOR CLOSE RIGHT', desc: 'Right door close command (crossed)', sys: 'DOOR', cross: true, crossNotes: 'Crossed with 6014 at jumper 46-47' },
      { no: 6073, name: 'DOOR PROVE 1', desc: 'Door 1 proving loop', sys: 'DOOR' },
      { no: 6112, name: 'ZERO SPEED', desc: 'Zero speed signal - enables door opening', sys: 'DOOR' },
      { no: 7001, name: 'CAB VAC FAULT', desc: 'Cab VAC fault indication', sys: 'VAC' },
      { no: 7050, name: 'SALOON VAC 1', desc: 'Saloon VAC 1 status', sys: 'VAC' },
      { no: 7060, name: 'SALOON VAC 2', desc: 'Saloon VAC 2 status', sys: 'VAC' },
      { no: 7070, name: 'SMOKE DETECT', desc: 'Smoke detection alarm', sys: 'VAC' },
      { no: 9214, name: 'ATP MODE', desc: 'ATP mode active', sys: 'TMS' },
    ];

    for (const tl of trainlines) {
      await sql`
        INSERT INTO trainlines (trainline_no, name, description, system_id, voltage_domain, is_cross_connected, cross_connect_notes)
        VALUES (${tl.no}, ${tl.name}, ${tl.desc}, ${tl.sys}, '110VDC', ${tl.cross || false}, ${tl.crossNotes || null})
        ON CONFLICT (trainline_no) DO UPDATE SET 
          name = EXCLUDED.name, 
          description = EXCLUDED.description,
          is_cross_connected = EXCLUDED.is_cross_connected,
          cross_connect_notes = EXCLUDED.cross_connect_notes
      `;
    }
    console.log('   ✅ Trainlines seeded');

    // Equipment
    const equipment = [
      { code: 'V1', name: 'VVVF Inverter 1', sys: 'TRAC', car: 'DMC', type: 'INVERTER', loc: 'Underframe' },
      { code: 'V2', name: 'VVVF Inverter 2', sys: 'TRAC', car: 'MC', type: 'INVERTER', loc: 'Underframe' },
      { code: 'BCU1', name: 'Brake Control Unit 1', sys: 'BRAKE', car: 'DMC', type: 'CONTROL_UNIT', loc: 'Underframe' },
      { code: 'BCU2', name: 'Brake Control Unit 2', sys: 'BRAKE', car: 'TC', type: 'CONTROL_UNIT', loc: 'Underframe' },
      { code: 'BCU3', name: 'Brake Control Unit 3', sys: 'BRAKE', car: 'MC', type: 'CONTROL_UNIT', loc: 'Underframe' },
      { code: 'BECU1', name: 'Brake Electronic Control Unit 1', sys: 'BRAKE', car: 'MC', type: 'CONTROL_UNIT', loc: 'Underframe' },
      { code: 'TCMS_RIO1', name: 'TCMS Remote IO Unit 1', sys: 'TMS', car: 'MC', type: 'RIO', loc: 'Ceiling' },
      { code: 'TCMS_RIO2', name: 'TCMS Remote IO Unit 2', sys: 'TMS', car: 'TC', type: 'RIO', loc: 'Ceiling' },
      { code: 'APS1', name: 'Auxiliary Power Supply 1', sys: 'APS', car: 'TC', type: 'POWER_UNIT', loc: 'Underframe' },
      { code: 'DCU1', name: 'Door Control Unit 1', sys: 'DOOR', car: 'MC', type: 'CONTROL_UNIT', loc: 'Ceiling' },
      { code: 'VAC1', name: 'Saloon VAC Unit 1', sys: 'VAC', car: 'MC', type: 'HVAC_UNIT', loc: 'Ceiling' },
      { code: 'VAC2', name: 'Saloon VAC Unit 2', sys: 'VAC', car: 'TC', type: 'HVAC_UNIT', loc: 'Ceiling' },
      { code: 'CAB_VAC1', name: 'Cab VAC Unit 1', sys: 'VAC', car: 'CAB', type: 'HVAC_UNIT', loc: 'Cab' },
      { code: 'HSCB1', name: 'High Speed Circuit Breaker 1', sys: 'HV', car: 'DMC', type: 'BREAKER', loc: 'Underframe' },
      { code: 'LTEB1', name: 'Low Tension Equipment Box 1', sys: 'LTEB', car: 'DMC', type: 'PANEL', loc: 'Underframe' },
      { code: 'LTEB2', name: 'Low Tension Equipment Box 2', sys: 'LTEB', car: 'TC', type: 'PANEL', loc: 'Underframe' },
      { code: 'LTEB3', name: 'Low Tension Equipment Box 3', sys: 'LTEB', car: 'MC', type: 'PANEL', loc: 'Underframe' },
      { code: 'EDB1', name: 'Electrical Distribution Box 1', sys: 'EDB', car: 'MC', type: 'PANEL', loc: 'Ceiling' },
      { code: 'EDB2', name: 'Electrical Distribution Box 2', sys: 'EDB', car: 'TC', type: 'PANEL', loc: 'Ceiling' },
      { code: 'BATT1', name: 'Battery Box 1', sys: 'APS', car: 'TC', type: 'BATTERY', loc: 'Underframe' },
      { code: 'SSB1', name: 'Shore Supply Box 1', sys: 'APS', car: 'TC', type: 'POWER_UNIT', loc: 'Underframe' },
      { code: 'PBMV1', name: 'Parking Brake Magnetic Valve 1', sys: 'BRAKE', car: 'DMC', type: 'VALVE', loc: 'Underframe' },
      { code: 'ETH_SW1', name: 'Ethernet Switch CCTV 1', sys: 'COMMS', car: 'MC', type: 'NETWORK_SWITCH', loc: 'Ceiling' },
    ];

    for (const eq of equipment) {
      await sql`
        INSERT INTO equipment (project_id, car_type_id, system_id, equipment_code, equipment_name, equipment_type, location_hint)
        VALUES (
          ${projectId}, 
          ${carTypeIds[eq.car]}, 
          ${systemIds[eq.sys]}, 
          ${eq.code}, 
          ${eq.name}, 
          ${eq.type}, 
          ${eq.loc}
        )
        ON CONFLICT (project_id, equipment_code) DO UPDATE SET equipment_name = EXCLUDED.equipment_name
      `;
    }
    console.log('   ✅ Equipment seeded');

    // TCMS Points
    const tcmsPoints = [
      { code: 'U15-J7', rio: 'TCMS_RIO1', type: 'DO', signal: 'DOOR_OPEN_LEFT', desc: 'Left door open command' },
      { code: 'U15-J8', rio: 'TCMS_RIO1', type: 'DO', signal: 'DOOR_OPEN_RIGHT', desc: 'Right door open command' },
      { code: 'U15-J9', rio: 'TCMS_RIO1', type: 'DO', signal: 'DOOR_CLOSE_LEFT', desc: 'Left door close command' },
      { code: 'U15-J10', rio: 'TCMS_RIO1', type: 'DO', signal: 'DOOR_CLOSE_RIGHT', desc: 'Right door close command' },
      { code: 'U15-K4', rio: 'TCMS_RIO1', type: 'DI', signal: 'PARKING_BRAKE_APPLIED', desc: 'Parking brake applied status' },
      { code: 'U15-K5', rio: 'TCMS_RIO1', type: 'DI', signal: 'PARKING_BRAKE_RELEASED', desc: 'Parking brake released status' },
      { code: 'U15-L3', rio: 'TCMS_RIO1', type: 'DI', signal: 'ZERO_SPEED', desc: 'Zero speed signal' },
      { code: 'U15-F4', rio: 'TCMS_RIO1', type: 'DI', signal: 'VAC1_STATUS', desc: 'Saloon VAC 1 status' },
      { code: 'U15-F5', rio: 'TCMS_RIO1', type: 'DI', signal: 'VAC2_STATUS', desc: 'Saloon VAC 2 status' },
      { code: 'U15-H2', rio: 'TCMS_RIO1', type: 'DI', signal: 'DOOR1_STATUS', desc: 'Door 1 status' },
      { code: 'U15-H4', rio: 'TCMS_RIO1', type: 'DI', signal: 'HSCB_TRIP', desc: 'HSCB trip status' },
      { code: 'U15-M2', rio: 'TCMS_RIO1', type: 'DI', signal: 'VVVF_FAULT', desc: 'VVVF fault indication' },
      { code: 'U25-F2', rio: 'TCMS_RIO2', type: 'DI', signal: 'CAB_VAC_FAULT', desc: 'Cab VAC fault' },
      { code: 'U25-G3', rio: 'TCMS_RIO2', type: 'DI', signal: 'APS_FAULT', desc: 'APS auxiliary fault' },
      { code: 'U25-G4', rio: 'TCMS_RIO2', type: 'DI', signal: 'BATTERY_UNDER_VOLT', desc: 'Battery under-voltage' },
      { code: 'U25-H5', rio: 'TCMS_RIO2', type: 'DO', signal: 'SHORE_SUPPLY_CMD', desc: 'Shore supply command' },
      { code: 'U25-J6', rio: 'TCMS_RIO2', type: 'DI', signal: 'SIV_STATUS', desc: 'SIV contactor status' },
      { code: 'U25-K3', rio: 'TCMS_RIO2', type: 'DI', signal: 'BRAKE_PRESSURE_LOW', desc: 'Low brake pressure warning' },
    ];

    for (const p of tcmsPoints) {
      await sql`
        INSERT INTO tcms_points (point_code, rio_unit, signal_type, signal_name, description, system_id)
        VALUES (${p.code}, ${p.rio}, ${p.type}, ${p.signal}, ${p.desc}, ${p.rio.includes('U15') ? 'DOOR' : 'APS'})
        ON CONFLICT (point_code) DO UPDATE SET signal_name = EXCLUDED.signal_name
      `;
    }
    console.log('   ✅ TCMS points seeded');

    console.log('\n✅ Database setup complete!');
    console.log('\n📊 Stats:');
    console.log('   - Project: KMRCL_RS3R');
    console.log('   - Car types: 3 (DMC, TC, MC)');
    console.log('   - Systems: 16');
    console.log('   - Trainlines: ' + trainlines.length);
    console.log('   - Equipment: ' + equipment.length);
    console.log('   - TCMS Points: ' + tcmsPoints.length);
    console.log('\n🚀 Run "npm run dev" to start the application');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

run();