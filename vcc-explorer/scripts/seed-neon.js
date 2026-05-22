#!/usr/bin/env node
const { neon } = require('@neondatabase/serverless');

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('Error: DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(dbUrl);

async function main() {
  console.log('=== VCC Comprehensive Seed ===\n');
  
  // Create tables
  console.log('Creating tables...');
  
  await sql(`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      customer_name TEXT,
      rolling_stock_type TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  
  await sql(`CREATE TABLE IF NOT EXISTS car_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    position_in_formation INTEGER
  )`);
  
  await sql(`CREATE TABLE IF NOT EXISTS systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    icon_name TEXT,
    sort_order SMALLINT
  )`);
  
  await sql(`CREATE TABLE IF NOT EXISTS drawings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    car_type_id UUID REFERENCES car_types(id) ON DELETE SET NULL,
    system_id UUID REFERENCES systems(id) ON DELETE SET NULL,
    drawing_no TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    drawing_type TEXT DEFAULT 'SCHEMATIC',
    sheet_count INTEGER,
    current_revision TEXT,
    current_alt TEXT,
    status TEXT DEFAULT 'active'
  )`);
  
  await sql(`CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    car_type_id UUID REFERENCES car_types(id) ON DELETE SET NULL,
    system_id UUID REFERENCES systems(id) ON DELETE SET NULL,
    equipment_code TEXT NOT NULL,
    equipment_name TEXT NOT NULL,
    equipment_type TEXT,
    location_hint TEXT
  )`);
  
  await sql(`CREATE TABLE IF NOT EXISTS connectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drawing_id UUID REFERENCES drawings(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
    connector_code TEXT NOT NULL,
    connector_type TEXT,
    connector_variant TEXT
  )`);
  
  await sql(`CREATE TABLE IF NOT EXISTS wires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wire_no TEXT UNIQUE NOT NULL,
    wire_type TEXT,
    wire_size TEXT,
    wire_color TEXT,
    voltage_class TEXT,
    description TEXT
  )`);
  
  await sql(`CREATE TABLE IF NOT EXISTS pins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connector_id UUID REFERENCES connectors(id) ON DELETE CASCADE,
    pin_no TEXT NOT NULL,
    wire_no_raw TEXT,
    signal_name TEXT,
    from_ref TEXT,
    to_ref TEXT
  )`);
  
  await sql(`CREATE TABLE IF NOT EXISTS trainlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainline_no INTEGER UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    voltage_domain TEXT,
    is_cross_connected BOOLEAN DEFAULT FALSE
  )`);
  
  await sql(`CREATE TABLE IF NOT EXISTS tcms_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    point_code TEXT UNIQUE NOT NULL,
    rio_unit TEXT,
    connector_code TEXT,
    pin_no TEXT,
    signal_type TEXT,
    signal_name TEXT,
    system_id UUID REFERENCES systems(id) ON DELETE SET NULL
  )`);
  
  console.log('Tables created.\n');
  
  // Insert data
  console.log('Seeding data...');
  
  // Projects
  await sql(`INSERT INTO projects (code, name, customer_name, rolling_stock_type) 
    VALUES ('KMRCL_RS3R', 'KMRCL RS3R Metro Cars', 'Bangalore Metro Rail Corporation Ltd', '6 Car Formation')
    ON CONFLICT (code) DO NOTHING`);
  
  // Get project ID
  const proj = await sql("SELECT id FROM projects WHERE code = 'KMRCL_RS3R'");
  const projectId = proj[0]?.id;
  
  // Car Types
  const carTypes = [
    ['DMC', 'Driving Motor Car', 1],
    ['TC', 'Trailer Car', 2],
    ['MC', 'Motor Car', 3],
    ['MC2', 'Motor Car Pos 4', 4],
    ['TC2', 'Trailer Car Pos 5', 5],
    ['DMC2', 'Driving Motor Car Pos 6', 6]
  ];
  for (const [code, name, pos] of carTypes) {
    await sql(`INSERT INTO car_types (project_id, code, name, position_in_formation) 
      VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`, [projectId, code, name, pos]);
  }
  
  // Systems
  const systemsData = [
    ['GEN', 'General & Conventions', 'Foundation', 1],
    ['TRL', 'Trainlines', 'Core Systems', 2],
    ['CAB', 'Cab Control & Status', 'Core Systems', 3],
    ['TRAC', 'Traction & Propulsion', 'Propulsion', 4],
    ['BRAKE', 'Brake System', 'Core Systems', 5],
    ['APS', 'Auxiliary Power Supply', 'Power', 6],
    ['DOOR', 'Door System', 'Core Systems', 7],
    ['VAC', 'VAC / HVAC', 'Core Systems', 8],
    ['TMS', 'Train Management System', 'Control', 9],
    ['COMMS', 'Communication Systems', 'Core Systems', 10],
    ['LTEB', 'Low Tension Equipment Box', 'Electrical', 13],
    ['LTJB', 'Low Tension Junction Box', 'Electrical', 14],
    ['EDB', 'Electrical Distribution Box', 'Electrical', 15],
    ['HV', 'High Voltage Equipment', 'Power', 16]
  ];
  for (const [code, name, cat, sort] of systemsData) {
    await sql(`INSERT INTO systems (code, name, category, sort_order) 
      VALUES ($1, $2, $3, $4) ON CONFLICT (code) DO NOTHING`, [code, name, cat, sort]);
  }
  
  // Get system IDs
  const sysMap = {};
  const sysResult = await sql("SELECT code, id FROM systems");
  for (const s of sysResult) sysMap[s.code] = s.id;
  
  // Get car type IDs
  const carMap = {};
  const carResult = await sql("SELECT code, id FROM car_types");
  for (const c of carResult) carMap[c.code] = c.id;
  
  // Trainlines
  console.log('Seeding trainlines...');
  const trainlines = [
    [1032, 'RESET', 'System reset trainline', '110VDC'],
    [1050, 'SHUT DOWN', 'System shutdown trainline', '110VDC'],
    [1040, 'AUX ON', 'Auxiliary power on command', '110VDC'],
    [1207, 'VVVF FAULT', 'VVVF inverter fault', '110VDC'],
    [1209, 'HSCB TRIP', 'High speed circuit breaker trip', '110VDC'],
    [1215, 'AUX FAULT', 'Auxiliary system fault', '110VDC'],
    [1217, 'VAC FAULT', 'VAC system fault', '110VDC'],
    [1219, 'PARKING BRAKE', 'Parking brake status', '110VDC'],
    [3003, 'FORWARD', 'Forward propulsion command', '110VDC'],
    [3004, 'REVERSE', 'Reverse propulsion command', '110VDC'],
    [3005, 'POWERING 1', 'Powering command level 1', '110VDC', true],
    [3006, 'POWERING 2', 'Powering command level 2', '110VDC', true],
    [3010, 'BRAKING', 'Braking command', '110VDC'],
    [3011, 'FULL SERVICE BRAKE', 'Full service brake command', '110VDC'],
    [4024, 'BRAKE LOOP', 'Brake loop normal', '110VDC'],
    [4028, 'BRAKE LOOP RETURN', 'Brake loop return', '110VDC'],
    [4062, 'EM BRAKE LOOP NORMAL', 'Emergency brake loop normal', '110VDC'],
    [4103, 'EM BRAKE LOOP REDUNDANT', 'Emergency brake loop redundant', '110VDC'],
    [4122, 'PARKING BRAKE APPLIED', 'Parking brake applied', '110VDC'],
    [4153, 'PARKING BRAKE RELEASED', 'Parking brake released', '110VDC'],
    [6009, 'DOOR OPEN LEFT', 'Left door open command', '110VDC'],
    [6014, 'DOOR CLOSE LEFT', 'Left door close command', '110VDC'],
    [6046, 'DOOR OPEN RIGHT', 'Right door open command', '110VDC'],
    [6051, 'DOOR CLOSE RIGHT', 'Right door close command', '110VDC'],
    [6073, 'DOOR PROVING LOOP 1', 'Door proving loop 1', '110VDC'],
    [6112, 'ZERO SPEED', 'Zero speed signal', '110VDC'],
    [7001, 'CAB VAC IN SSK', 'Cab VAC in SSK', '110VDC'],
    [7050, 'SALOON VAC 1', 'Saloon VAC 1', '110VDC'],
    [7070, 'SMOKE DETECTION', 'Smoke detection', '110VDC'],
    [9214, 'ATP MODE', 'ATP mode active', '110VDC'],
    [9215, 'FWD MODE', 'Forward mode active', '110VDC'],
    [9216, 'REV MODE', 'Reverse mode active', '110VDC']
  ];
  for (const [no, name, desc, vol, cross] of trainlines) {
    await sql(`INSERT INTO trainlines (trainline_no, name, description, voltage_domain, is_cross_connected)
      VALUES ($1, $2, $3, $4, $5) ON CONFLICT (trainline_no) DO NOTHING`, 
      [no, name, desc, vol, cross || false]);
  }
  
  // Drawings
  console.log('Seeding drawings...');
  const drawings = [
    ['942-58099', 'Drawing List', 'GEN', 'DMC', 1],
    ['942-58100', 'Classification', 'GEN', 'DMC', 1],
    ['942-58101', 'Wiring Numbers Definition', 'GEN', 'DMC', 1],
    ['942-58102', 'Symbols', 'GEN', 'DMC', 1],
    ['942-58103', 'Train Lines Control', 'TRL', 'DMC', 4],
    ['942-58104', 'Train Lines Signal', 'TRL', 'DMC', 4],
    ['942-58105', 'Low Tension Power', 'TRL', 'DMC', 4],
    ['942-58106', 'High Tension Power', 'TRL', 'DMC', 4],
    ['942-58107', 'Controlling Cab', 'CAB', 'DMC', 5],
    ['942-58108', 'Start-up Relay', 'CAB', 'DMC', 5],
    ['942-58109', 'System Status Indication', 'CAB', 'DMC', 5],
    ['942-58119', 'Speed Control', 'TRAC', 'DMC', 3],
    ['942-58120', 'VVVF Control', 'TRAC', 'DMC', 3],
    ['942-58121', 'Traction Return Current', 'TRAC', 'DMC', 3],
    ['942-58123', 'Compressor Control', 'BRAKE', 'TC', 7],
    ['942-58124', 'Brake Loop', 'BRAKE', 'DMC', 7],
    ['942-58125', 'Emergency Brake', 'BRAKE', 'DMC', 7],
    ['942-58126', 'Parking Brake', 'BRAKE', 'DMC', 7],
    ['942-58130', 'APS', 'APS', 'TC', 3],
    ['942-58131', 'Shore Supply', 'APS', 'TC', 3],
    ['942-58132', 'Battery Control', 'APS', 'TC', 3],
    ['942-58137', 'Door Supply Voltage', 'DOOR', 'MC', 6],
    ['942-58138', 'Left Door Operation', 'DOOR', 'MC', 6],
    ['942-58139', 'Right Door Operation', 'DOOR', 'MC', 6],
    ['942-58143', 'Cab VAC', 'VAC', 'DMC', 3],
    ['942-58144', 'Saloon VAC Power', 'VAC', 'TC', 3],
    ['942-58145', 'Saloon VAC Control', 'VAC', 'MC', 3],
    ['942-58146', 'TMS Interface', 'TMS', 'DMC', 4],
    ['942-58147', 'PIS/TIS', 'COMMS', 'MC', 8],
    ['942-58154', 'CCTV', 'COMMS', 'MC', 8],
    ['942-38305', 'Pin Assignment - LTEB', 'LTEB', 'DMC', 2],
    ['942-38306', 'Pin Assignment - VVVF', 'VVVF', 'DMC', 2],
    ['942-38606', 'Pin Assignment - TCMS RIO', 'TMS', 'MC', 4],
    ['942-38512', 'Pin Assignment - APS', 'APS', 'TC', 2],
    ['942-38402', 'Pin Assignment - EDB', 'EDB', 'TC', 1],
    ['942-38409', 'Pin Assignment - TCMS RIO TC', 'TMS', 'TC', 4]
  ];
  for (const [no, title, sys, car, sheets] of drawings) {
    const sid = sysMap[sys];
    const cid = carMap[car];
    if (sid && cid) {
      await sql(`INSERT INTO drawings (project_id, drawing_no, title, system_id, car_type_id, sheet_count)
        VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (drawing_no) DO NOTHING`,
        [projectId, no, title, sid, cid, sheets]);
    }
  }
  
  // Equipment
  console.log('Seeding equipment...');
  const equipmentData = [
    ['LTEB', 'Low Tension Equipment Box', 'LTEB', 'DMC', 'Underframe'],
    ['LTJB', 'Low Tension Junction Box', 'LTJB', 'TC', 'Underframe'],
    ['BCU', 'Brake Control Unit', 'BRAKE', 'DMC', 'Underframe'],
    ['BECU', 'Brake Electronic Control Unit', 'BRAKE', 'MC', 'Underframe'],
    ['VVVF', 'VVVF Inverter', 'TRAC', 'DMC', 'Underframe'],
    ['APS', 'Auxiliary Power Supply', 'APS', 'TC', 'Underframe'],
    ['HSCB', 'High Speed Circuit Breaker', 'HV', 'DMC', 'Underframe'],
    ['TCMS_RIO', 'TCMS Remote I/O', 'TMS', 'MC', 'Ceiling'],
    ['EDB', 'Electrical Distribution Box', 'EDB', 'TC', 'Ceiling'],
    ['ETH_SW', 'CCTV Ethernet Switch', 'COMMS', 'MC', 'Ceiling'],
    ['AAU', 'Audio Alert Unit', 'COMMS', 'MC', 'Ceiling'],
    ['VAC1', 'Saloon VAC Unit 1', 'VAC', 'MC', 'Roof'],
    ['CSJB', 'Collector Shoe Junction Box', 'HV', 'DMC', 'Underframe'],
    ['PSB', 'Pressure Switch Box', 'BRAKE', 'TC', 'Underframe'],
    ['BRK_RES', 'Brake Resistor', 'TRAC', 'DMC', 'Underframe'],
    ['BATT', 'Battery Box', 'APS', 'TC', 'Underframe']
  ];
  for (const [code, name, sys, car, loc] of equipmentData) {
    const sid = sysMap[sys];
    const cid = carMap[car];
    if (sid && cid) {
      await sql(`INSERT INTO equipment (project_id, equipment_code, equipment_name, system_id, car_type_id, location_hint)
        VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
        [projectId, code, name, sid, cid, loc]);
    }
  }
  
  // Wires
  console.log('Seeding wires...');
  const wiresData = [
    ['3003', 'FORWARD', '1.5', 'RED', '110VDC'],
    ['3004', 'REVERSE', '1.5', 'BLUE', '110VDC'],
    ['3005', 'POWERING 1', '2.5', 'WHITE', '110VDC'],
    ['3006', 'POWERING 2', '2.5', 'WHITE', '110VDC'],
    ['3010', 'BRAKING', '1.5', 'YELLOW', '110VDC'],
    ['3011', 'FULL SERVICE BRAKE', '1.5', 'ORANGE', '110VDC'],
    ['4024', 'BRAKE LOOP', '1.5', 'GREEN', '110VDC'],
    ['4062', 'EM BRAKE LOOP', '1.5', 'RED/WHITE', '110VDC'],
    ['4122', 'PARKING BRAKE APPLIED', '1.5', 'BROWN', '110VDC'],
    ['4153', 'PARKING BRAKE RELEASED', '1.5', 'VIOLET', '110VDC'],
    ['6009', 'DOOR OPEN LEFT', '1.5', 'PINK', '110VDC'],
    ['6014', 'DOOR CLOSE LEFT', '1.5', 'LTGREEN', '110VDC'],
    ['6046', 'DOOR OPEN RIGHT', '1.5', 'SKYBLUE', '110VDC'],
    ['6051', 'DOOR CLOSE RIGHT', '1.5', 'GRAY', '110VDC'],
    ['6112', 'ZERO SPEED', '1.5', 'BLACK', '110VDC'],
    ['OV501-1', 'LTEB Feed', '3GKW', 'BLACK', '110VDC'],
    ['DV971-4', 'BCU Feed', '1.5', 'RED', '110VDC'],
    ['M95921', 'Eth Cable', 'CAT5e', 'BLUE', 'DATA']
  ];
  for (const [no, desc, size, color, vol] of wiresData) {
    await sql(`INSERT INTO wires (wire_no, description, wire_size, wire_color, voltage_class)
      VALUES ($1, $2, $3, $4, $5) ON CONFLICT (wire_no) DO NOTHING`,
      [no, desc, size, color, vol]);
  }
  
  // TCMS Points
  console.log('Seeding TCMS points...');
  const tcmsData = [
    ['U1513', 'RIO1', 'CN1', '1', 'DI', 'Door Open Left'],
    ['U1514', 'RIO1', 'CN1', '2', 'DI', 'Door Close Left'],
    ['U1525', 'RIO1', 'CN1', '13', 'DI', 'Door Open Right'],
    ['U1526', 'RIO1', 'CN1', '14', 'DI', 'Door Close Right'],
    ['U2513', 'RIO2', 'CN1', '1', 'DI', 'Door Open Left'],
    ['U2514', 'RIO2', 'CN1', '2', 'DI', 'Door Close Left'],
    ['U1125', 'RIO1', 'CN11', '25', 'DO', 'VAC Fault'],
    ['U1101', 'RIO1', 'CN1', '31', 'DI', 'Brake Applied'],
    ['U1102', 'RIO1', 'CN1', '32', 'DI', 'Parking Brake Applied'],
    ['U2101', 'RIO2', 'CN1', '31', 'DI', 'Brake Applied'],
    ['U2102', 'RIO2', 'CN1', '32', 'DI', 'Parking Brake Applied']
  ];
  for (const [code, rio, conn, pin, type, name] of tcmsData) {
    const sid = sysMap['DOOR'] || sysMap['TMS'];
    await sql(`INSERT INTO tcms_points (point_code, rio_unit, connector_code, pin_no, signal_type, signal_name, system_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (point_code) DO NOTHING`,
      [code, rio, conn, pin, type, name, sid]);
  }
  
  console.log('\n=== Seed Complete ===');
  
  // Verify
  const [sysCount, tlCount, drwCount, eqCount, wireCount, tcmsCount] = await Promise.all([
    sql('SELECT COUNT(*) FROM systems'),
    sql('SELECT COUNT(*) FROM trainlines'),
    sql('SELECT COUNT(*) FROM drawings'),
    sql('SELECT COUNT(*) FROM equipment'),
    sql('SELECT COUNT(*) FROM wires'),
    sql('SELECT COUNT(*) FROM tcms_points')
  ]);
  
  console.log(`Systems: ${sysCount[0].count}`);
  console.log(`Trainlines: ${tlCount[0].count}`);
  console.log(`Drawings: ${drwCount[0].count}`);
  console.log(`Equipment: ${eqCount[0].count}`);
  console.log(`Wires: ${wireCount[0].count}`);
  console.log(`TCMS Points: ${tcmsCount[0].count}`);
}

main().catch(console.error);