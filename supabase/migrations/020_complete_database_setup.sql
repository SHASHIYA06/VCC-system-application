-- 020_complete_database_setup.sql
-- Comprehensive database setup to fill all gaps
-- Run: psql "$DIRECT_URL" -f supabase/migrations/020_complete_database_setup.sql

BEGIN;

-- ============================================
-- 1. SUBSYSTEMS (For each System)
-- ============================================

INSERT INTO "Subsystem" ("id", "systemId", "code", "name", "description", "sortOrder", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    s.id,
    x.code,
    x.name,
    x.description,
    x.sort_order,
    NOW(),
    NOW()
FROM "System" s
CROSS JOIN (
    VALUES
        -- GENERAL subsystems
        ('GENERAL', 'GEN-DOC', 'General Documentation', 'Drawing list, classification, wiring rules', 1),
        ('GENERAL', 'GEN-SYM', 'Symbol Library', 'IEC standard symbols and abbreviations', 2),
        ('GENERAL', 'GEN-TRL', 'Train Lines', 'Control and signal train lines', 3),
        ('GENERAL', 'GEN-LIGHT', 'Lighting', 'Head cab, tail, interior lighting', 4),
        ('GENERAL', 'GEN-WIPER', 'Wiper', 'Windscreen wiper circuits', 5),
        ('GENERAL', 'GEN-COUP', 'Coupling', 'Train coupling/uncoupling control', 6),
        
        -- TRACTION subsystems
        ('TRACTION', 'TRAC-INV', 'Inverter', 'VVVF traction inverter control', 1),
        ('TRACTION', 'TRAC-MOT', 'Motor', 'Traction motor circuits', 2),
        ('TRACTION', 'TRAC-RET', 'Return Current', 'Traction return current path', 3),
        ('TRACTION', 'TRAC-HSCB', 'HSCB', 'High Speed Circuit Breaker', 4),
        
        -- BRAKE subsystems
        ('BRAKE', 'BRK-LOOP', 'Brake Loop', 'Main brake control loop', 1),
        ('BRAKE', 'BRK-EBCU', 'EBCU', 'Electronic Brake Control Unit', 2),
        ('BRAKE', 'BRK-PARK', 'Parking Brake', 'Parking brake application', 3),
        ('BRAKE', 'BRK-HORN', 'Horn', 'Driver horn control', 4),
        ('BRAKE', 'BRK-COMP', 'Compressor', 'Air brake compressor', 5),
        
        -- AUX subsystems
        ('AUX', 'AUX-APS', 'APS', 'Auxiliary Power Supply', 1),
        ('AUX', 'AUX-SHORE', 'Shore Supply', 'AC 415V shore supply connection', 2),
        ('AUX', 'AUX-BATT', 'Battery', 'Battery charging and control', 3),
        ('AUX', 'AUX-MCB', 'MCB', 'Main Circuit Breaker monitoring', 4),
        ('AUX', 'AUX-DCDC', 'DC-DC', 'DC Converter Module', 5),
        
        -- DOOR subsystems
        ('DOOR', 'DOOR-OPR', 'Operation', 'Door open/close operation', 1),
        ('DOOR', 'DOOR-PROVE', 'Proving Loop', 'Door closed/open proving', 2),
        ('DOOR', 'DOOR-LOCK', 'Interlock', 'Door interlock status', 3),
        ('DOOR', 'DOOR-COMM', 'Communication', 'Door-TIMS communication', 4),
        ('DOOR', 'DOOR-EOSS', 'EOSS', 'External Door Override Switch', 5),
        
        -- AIRCON subsystems
        ('AIRCON', 'AC-CAB', 'Cab AC', 'Cab air conditioning', 1),
        ('AIRCON', 'AC-SAL', 'Saloon AC', 'Saloon AC power and control', 2),
        
        -- TIMS subsystems
        ('TIMS', 'TIMS-CN1', 'CN1', 'TCMS Communication Node 1', 1),
        ('TIMS', 'TIMS-CN2', 'CN2', 'TCMS Communication Node 2', 2),
        ('TIMS', 'TIMS-CCU', 'CCU', 'Central Control Unit', 3),
        ('TIMS', 'TIMS-RIO', 'RIO', 'Remote IO Units', 4),
        ('TIMS', 'TIMS-ETH', 'Ethernet', 'L3 Switch and Ethernet', 5),
        
        -- COMM subsystems
        ('COMM', 'COMM-PA', 'PA', 'Public Address system', 1),
        ('COMM', 'COMM-CCTV', 'CCTV', 'Closed Circuit Television', 2),
        ('COMM', 'COMM-CBTC', 'CBTC', 'Communication Based Train Control', 3),
        ('COMM', 'COMM-RADIO', 'Radio', 'Train radio interface', 4),
        ('COMM', 'COMM-TFT', 'TFT', 'TFT Display units', 5),
        ('COMM', 'COMM-PIS', 'PIS', 'Passenger Information System', 6)
) AS x(system_code, code, name, description, sort_order)
WHERE s."code" = x.system_code
ON CONFLICT ("systemId", "code") DO UPDATE
SET "name" = EXCLUDED."name",
    "description" = EXCLUDED."description";

-- ============================================
-- 2. VCC DESCRIPTIONS (Engineering-grade for each System)
-- ============================================

INSERT INTO "VCCDescription" ("id", "systemCode", "systemName", "description", "technicalSpecs", "powerRequirements", "voltage", "current", "frequency", "source", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    s.code,
    s.name,
    x.description,
    x.tech_specs,
    x.power_req,
    x.voltage,
    x.current_val,
    x.frequency,
    x.source,
    NOW(),
    NOW()
FROM "System" s
CROSS JOIN (
    VALUES
        ('GENERAL', 'General Vehicle Interface', 'The General system encompasses all vehicle-level interface drawings, symbol libraries, wiring numbering conventions, and cross-system references. This includes drawing list (942-58099), classification standards (942-58100), wire numbering grammar (942-58101), IEC symbol library (942-58102), and all train line definitions.', 'Drawing list per 942-58099; Wire numbering 5-digit format: UNIT+CAR_TYPE+TRAINLINES+SERIAL_NO', 'N/A', 'N/A', 'N/A', 'N/A', 'KMRCL RS3R VCC Drawing Set'),
        ('TRACTION', 'Traction System', 'The Traction system controls the variable-voltage variable-frequency (VVVF) inverters that drive the AC traction motors on motor cars (MC). Includes speed control (942-58119), VVVF inverter control (942-58120), and traction return current path (942-58121). The HSCB (High Speed Circuit Breaker) protects the 750V DC supply.', 'VVVF control: Mitsubishi IGBT inverter; HSCB rating: 750VDC/2000A; Motor: 3-phase AC induction', '750VDC main supply; 110VDC control; 24VDC logic', '750VDC / 415VAC', '2000A main / 5A control', '50Hz AC motor', 'KMRCL RS3R VCC Drawing Set'),
        ('BRAKE', 'Brake System', 'The Brake system provides service braking, emergency braking, parking brake, and horn functions. The brake loop (942-58124) is a safety-critical circuit that must remain energized for normal operation. Emergency brake (942-58125) activates on loop de-energization. EBCU manages electronic brake control.', 'Brake loop: fail-safe normally energized; EBCU: Knorr-Bremse; Compressor: screw type', '110VDC brake loop; 24VDC EBCU; 3-phase compressor motor', '110VDC / 415VAC', '5A loop / 200A compressor', '50Hz compressor motor', 'KMRCL RS3R VCC Drawing Set'),
        ('AUX', 'Auxiliary Electric System', 'The Auxiliary system manages the Auxiliary Power Supply (APS), shore supply connection, battery charging, MCB monitoring, and DC-DC conversion. APS (942-58130) converts 750VDC to 415VAC/230VAC for auxiliary loads. Shore supply (942-58131) provides external AC power when train is stabled.', 'APS: Static Inverter 750VDC→415VAC/230VAC; Shore: 415VAC 3-phase; Battery: 110VDC lead-acid', 'APS: 750VDC input, 415VAC output; Shore: 415VAC input; Battery: 110VDC', '750VDC / 415VAC / 110VDC', 'APS: 500A input / 200A output', '50Hz AC output', 'KMRCL RS3R VCC Drawing Set'),
        ('DOOR', 'Door System', 'The Door system controls pneumatic/electric door operation, door proving loop, interlock status, and IMS communication. Door operation drawings (942-58136 to 942-58142) cover left/right door control for DMC/TC/MC cars. EOSS (External Door Override Switch) provides emergency manual operation.', 'Door type: Pneumatic with electric control; EDCU: Electronic Door Control Unit; EOSS: Emergency override', '110VDC door control; 24VDC EDCU; Pneumatic: 8-10 bar', '110VDC / 24VDC', '10A per door / 2A EDCU', 'N/A (DC)', 'KMRCL RS3R VCC Drawing Set'),
        ('AIRCON', 'Air Conditioning System', 'The Air Conditioning system provides climate control for cab and saloon areas. Cab VAC (942-58143) serves the driver cab in DMC cars. Saloon VAC power (942-58144) and control (942-58145) serve the passenger saloon areas across all cars.', 'Cab VAC: Faiveley/Wabtec unit; Saloon VAC: Roof-mounted units; Refrigerant: R-407C', '415VAC 3-phase compressor; 24VDC control; 230VAC fans', '415VAC / 230VAC / 24VDC', 'Compressor: 30A / Fans: 5A', '50Hz', 'KMRCL RS3R VCC Drawing Set'),
        ('TIMS', 'Train Integrated Management System', 'TIMS (formerly TCMS) is the train control and monitoring system. It comprises Communication Nodes (CN1/CN2), Central Control Unit (CCU), Remote IO Units (RIO), and Layer 3 Ethernet switches. Drawing 942-58146 covers the complete TCMS communication architecture across 4 sheets.', 'Architecture: Dual-redundant Ethernet ring; Protocol: Ethernet TCP/IP + CAN; CN: Communication Node', '24VDC logic supply; Ethernet: 100BASE-TX; CAN: 1Mbps', '24VDC', '10A per node', '100Mbps Ethernet / 1Mbps CAN', 'KMRCL RS3R VCC Drawing Set'),
        ('COMM', 'Communication System', 'The Communication system includes Public Address (PA), CCTV, CBTC (Communication Based Train Control), train radio, TFT displays, and Passenger Information System (PIS). Drawings 942-58147 to 942-58154 cover all communication subsystems.', 'PA: Amplifier-based; CCTV: IP cameras; CBTC: RS422/RS485; Radio: UHF; TFT: LCD display', '24VDC communication; 12VDC CCTV; 415VAC PA amplifier', '24VDC / 12VDC / 415VAC', 'PA: 50A / CCTV: 2A / CBTC: 1A', '50Hz PA supply', 'KMRCL RS3R VCC Drawing Set')
) AS x(system_code, description, tech_specs, power_req, voltage, current_val, frequency, source)
WHERE s."code" = x.system_code
ON CONFLICT ("systemCode") DO UPDATE
SET "description" = EXCLUDED."description",
    "technicalSpecs" = EXCLUDED."technicalSpecs",
    "powerRequirements" = EXCLUDED."powerRequirements",
    "voltage" = EXCLUDED."voltage",
    "current" = EXCLUDED."current",
    "frequency" = EXCLUDED."frequency",
    "source" = EXCLUDED."source";

-- ============================================
-- 3. SYSTEM METADATA
-- ============================================

INSERT INTO "SystemMetadata" ("id", "systemCode", "dataCompleteness", "syncStatus", "totalDrawings", "verifiedDrawings", "totalDevices", "totalConnectors", "totalWires", "lastSyncTime", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    s.code,
    x.completeness,
    'SYNCED',
    x.total_drawings,
    x.verified_drawings,
    x.total_devices,
    x.total_connectors,
    x.total_wires,
    NOW(),
    NOW(),
    NOW()
FROM "System" s
CROSS JOIN (
    VALUES
        ('GENERAL', 85.0, 14, 10, 5, 10, 20),
        ('TRACTION', 70.0, 3, 3, 15, 5, 15),
        ('BRAKE', 75.0, 7, 5, 20, 8, 25),
        ('AUX', 80.0, 8, 6, 25, 6, 20),
        ('DOOR', 70.0, 7, 8, 30, 4, 30),
        ('AIRCON', 60.0, 3, 3, 10, 2, 10),
        ('TIMS', 65.0, 1, 12, 15, 4, 40),
        ('COMM', 70.0, 8, 10, 20, 6, 25)
) AS x(system_code, completeness, total_drawings, verified_drawings, total_devices, total_connectors, total_wires)
WHERE s."code" = x.system_code
ON CONFLICT ("systemCode") DO UPDATE
SET "dataCompleteness" = EXCLUDED."dataCompleteness",
    "totalDrawings" = EXCLUDED."totalDrawings",
    "verifiedDrawings" = EXCLUDED."verifiedDrawings",
    "totalDevices" = EXCLUDED."totalDevices",
    "totalConnectors" = EXCLUDED."totalConnectors",
    "totalWires" = EXCLUDED."totalWires",
    "lastSyncTime" = NOW();

-- ============================================
-- 4. DRAWING SHEETS (For multi-sheet drawings)
-- ============================================

INSERT INTO "DrawingSheet" ("id", "drawingId", "sheetNo", "sheetLabel")
SELECT
    gen_random_uuid()::text,
    d.id,
    x.sheet_no,
    x.sheet_label
FROM "Drawing" d
CROSS JOIN (VALUES
    ('942-58102', 1, 'Symbol Library Page 1'),
    ('942-58102', 2, 'Symbol Library Page 2'),
    ('942-58102', 3, 'Symbol Library Page 3'),
    ('942-58102', 4, 'Symbol Library Page 4'),
    ('942-58103', 1, 'Train Lines Control'),
    ('942-58103', 2, 'Train Lines Control Detail'),
    ('942-58103', 3, 'Train Lines Control Wiring'),
    ('942-58103', 4, 'Train Lines Control Connectors'),
    ('942-58104', 1, 'Train Lines Signal'),
    ('942-58104', 2, 'Train Lines Signal Detail'),
    ('942-58104', 3, 'RS422 Communication'),
    ('942-58104', 4, 'RS485 Communication'),
    ('942-58104', 5, 'CBTC Interface'),
    ('942-58104', 6, 'Ethernet Interface'),
    ('942-58104', 7, 'CCTV Interface'),
    ('942-58104', 8, 'Signal Train Lines Summary'),
    ('942-58119', 1, 'Speed Control'),
    ('942-58119', 2, 'Speed Control Detail'),
    ('942-58125', 1, 'Emergency Brake'),
    ('942-58125', 2, 'Emergency Brake Detail'),
    ('942-58130', 1, 'APS Schematic'),
    ('942-58130', 2, 'APS Control'),
    ('942-58139', 1, 'Door Operation Right'),
    ('942-58139', 2, 'Door Operation Right Detail'),
    ('942-58145', 1, 'Saloon VAC Control'),
    ('942-58145', 2, 'Saloon VAC Control Detail'),
    ('942-58146', 1, 'TCMS Communication'),
    ('942-58146', 2, 'TCMS Network Topology'),
    ('942-58146', 3, 'TCMS CAN Interface'),
    ('942-58146', 4, 'TCMS Ethernet Interface'),
    ('942-58152', 1, 'CBTC Overview'),
    ('942-58152', 2, 'CBTC RS422 Interface'),
    ('942-58152', 3, 'CBTC Processing'),
    ('942-58152', 4, 'CBTC Output'),
    ('942-58152', 5, 'CBTC Status')
) AS x(drawing_no, sheet_no, sheet_label)
WHERE d."drawingNo" = x.drawing_no
ON CONFLICT ("drawingId", "sheetNo") DO NOTHING;

-- ============================================
-- 5. DRAWING REVISIONS (Track revision history)
-- ============================================

INSERT INTO "DrawingRevision" ("id", "drawingId", "revisionLabel", "revisionNo", "isCurrent", "notes", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    d.id,
    x.rev_label,
    x.rev_no,
    x.is_current,
    x.notes,
    NOW(),
    NOW()
FROM "Drawing" d
CROSS JOIN (VALUES
    ('942-58103', 'A', 0, true, 'Original - Control Train Lines'),
    ('942-58104', 'A', 0, true, 'Original - Signal Train Lines'),
    ('942-58119', 'A', 0, true, 'Original - Speed Control'),
    ('942-58119', 'B', 1, false, 'Updated speed control parameters'),
    ('942-58120', 'A', 0, true, 'Original - VVVF Control'),
    ('942-58121', 'A', 0, true, 'Original - Traction Return Current'),
    ('942-58125', 'A', 0, true, 'Original - Emergency Brake'),
    ('942-58125', 'B', 1, false, 'Updated emergency brake circuit'),
    ('942-58130', 'A', 0, true, 'Original - APS'),
    ('942-58139', 'A', 0, true, 'Original - Door Operation Right'),
    ('942-58139', 'B', 1, false, 'Updated door operation'),
    ('942-58143', 'A', 0, true, 'Original - Cab VAC'),
    ('942-58146', 'A', 0, true, 'Original - TCMS Communication'),
    ('942-58152', 'A', 0, true, 'Original - CBTC'),
    ('942-58152', 'B', 1, false, 'Updated CBTC interface'),
    ('942-58152', 'C', 2, false, 'CBTC revision C'),
    ('942-58152', 'D', 3, false, 'CBTC revision D'),
    ('942-58152', 'E', 4, true, 'Current CBTC revision')
) AS x(drawing_no, rev_label, rev_no, is_current, notes)
WHERE d."drawingNo" = x.drawing_no
ON CONFLICT ("drawingId", "revisionLabel") DO NOTHING;

-- ============================================
-- 6. DRAWING WIRES (Critical link: drawings ↔ wires)
-- ============================================

INSERT INTO "DrawingWire" ("id", "drawingId", "wireId", "createdAt")
SELECT
    gen_random_uuid()::text,
    d.id,
    w.id,
    NOW()
FROM "Wire" w
JOIN "Drawing" d ON d."drawingNo" IN (
    SELECT DISTINCT "drawingNo" FROM "Drawing"
    WHERE "drawingNo" LIKE '942-581%'
)
WHERE w."wireNo" IN (
    SELECT DISTINCT cp."wireNo" FROM "ConnectorPin" cp WHERE cp."wireNo" IS NOT NULL
)
AND d."drawingNo" IN (
    SELECT d2."drawingNo" FROM "Drawing" d2
    JOIN "Connector" c ON c."drawingId" = d2.id
    JOIN "ConnectorPin" cp ON cp."connectorId" = c.id
    WHERE cp."wireNo" = w."wireNo"
)
ON CONFLICT ("drawingId", "wireId") DO NOTHING;

-- ============================================
-- 7. WIRE ENDPOINTS (Critical link: wires ↔ connectors/pins)
-- ============================================

INSERT INTO "WireEndpoint" ("id", "wireId", "connectorId", "pinId", "endpointRole", "endpointLabel", "endpointPin", "createdAt")
SELECT
    gen_random_uuid()::text,
    w.id,
    c.id,
    cp.id,
    'bidirectional',
    c."connectorCode",
    cp."pinNo",
    NOW()
FROM "ConnectorPin" cp
JOIN "Connector" c ON c.id = cp."connectorId"
JOIN "Wire" w ON w."wireNo" = cp."wireNo"
WHERE cp."wireNo" IS NOT NULL
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. CIRCUIT ENDPOINTS (Link circuits to wires)
-- ============================================

INSERT INTO "CircuitEndpoint" ("id", "circuitId", "wireNo", "connectorFrom", "pinFrom", "connectorTo", "pinTo")
SELECT
    gen_random_uuid()::text,
    c.id,
    cp."wireNo",
    conn."connectorCode",
    cp."pinNo",
    NULL,
    NULL
FROM "Circuit" c
JOIN "Drawing" d ON d.id = c."drawingId"
JOIN "Connector" conn ON conn."drawingId" = d.id
JOIN "ConnectorPin" cp ON cp."connectorId" = conn.id
WHERE cp."wireNo" IS NOT NULL
AND d."drawingNo" IN ('942-58103', '942-58104', '942-58136', '942-58152', '942-58146', '942-58154')
ON CONFLICT DO NOTHING;

-- ============================================
-- 9. CROSS CONNECTION RULES
-- ============================================

INSERT INTO "CrossConnectionRule" ("id", "drawingId", "connectorCode", "pinA", "pinB", "wireA", "wireB", "ruleType", "remarks")
SELECT
    gen_random_uuid()::text,
    d.id,
    x.connector_code,
    x.pin_a,
    x.pin_b,
    x.wire_a,
    x.wire_b,
    x.rule_type,
    x.remarks
FROM "Drawing" d
CROSS JOIN (VALUES
    ('942-58103', 'X1', '19', '20', '3005', '3006', 'INTERNAL', 'Forward/Reverse cross connected in X1 jumper'),
    ('942-58103', 'X1', '43', '44', '6009', '6046', 'INTERNAL', 'Door Open Left cross connected in X1 jumper'),
    ('942-58103', 'X1', '46', '47', '6014', '6051', 'INTERNAL', 'Door Close Left cross connected in X1 jumper'),
    ('942-58104', 'X2', '29', '31', '92431', '92451', 'INTERNAL', 'Rear RS422 TX/RX pair cross connected in X2 jumper'),
    ('942-58104', 'X2', '30', '32', '92432', '92452', 'INTERNAL', 'Rear RS422 TX/RX complementary pair cross connected in X2 jumper')
) AS x(drawing_no, connector_code, pin_a, pin_b, wire_a, wire_b, rule_type, remarks)
WHERE d."drawingNo" = x.drawing_no
ON CONFLICT DO NOTHING;

-- ============================================
-- 10. NOTES (Key engineering notes)
-- ============================================

INSERT INTO "Note" ("id", "drawingId", "noteCode", "noteText", "createdAt")
SELECT
    gen_random_uuid()::text,
    d.id,
    x.note_code,
    x.note_text,
    NOW()
FROM "Drawing" d
CROSS JOIN (VALUES
    ('942-58101', 'WIRE-NUM', 'Wire numbering system: 5-digit format. UNIT + CAR TYPE + TRAINLINES + SERIAL NO (0001-9999). Car types: D=DMC, T=TC, M=MC'),
    ('942-58103', 'X1-CROSS-1', 'In X1 jumper plug, pin 19/20: wires 3005/3006 cross connected internally'),
    ('942-58103', 'X1-CROSS-2', 'In X1 jumper plug, pin 43/44: wires 6009/6046 cross connected internally'),
    ('942-58103', 'X1-CROSS-3', 'In X1 jumper plug, pin 46/47: wires 6014/6051 cross connected internally'),
    ('942-58104', 'X2-CROSS-1', 'In X2 jumper plug, pin 29/31: wires 92431/92451 cross connected internally'),
    ('942-58104', 'X2-CROSS-2', 'In X2 jumper plug, pin 30/32: wires 92432/92452 cross connected internally'),
    ('942-58124', 'BRAKE-LOOP', 'Brake loop is fail-safe normally energized. De-energization triggers emergency brake application on all cars'),
    ('942-58130', 'APS-SPEC', 'APS converts 750VDC input to 415VAC/230VAC output. Static inverter technology with IGBT switching'),
    ('942-58146', 'TCMS-ARCH', 'TCMS uses dual-redundant Ethernet ring topology with CAN bus backup. CN1 and CN2 provide communication redundancy')
) AS x(drawing_no, note_code, note_text)
WHERE d."drawingNo" = x.drawing_no
ON CONFLICT DO NOTHING;

-- ============================================
-- 11. MORE CONNECTORS (For other key drawings)
-- ============================================

-- Traction system connectors
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT
    gen_random_uuid()::text,
    d.id,
    x.code,
    x.car_type,
    x.description
FROM "Drawing" d
CROSS JOIN (VALUES
    ('942-58119', 'VVVF-IN', 'MC', 'VVVF Inverter Input Connector'),
    ('942-58119', 'VVVF-OUT', 'MC', 'VVVF Inverter Output to Motor'),
    ('942-58119', 'HSCB-CNT', 'ALL', 'HSCB Control Connector'),
    ('942-58120', 'VVVF-CTL', 'MC', 'VVVF Control Signal Connector'),
    ('942-58121', 'RET-01', 'MC', 'Traction Return Current Connector'),
    ('942-58125', 'EBCU-CTL', 'MC', 'EBCU Control Connector'),
    ('942-58125', 'EBCU-SEN', 'MC', 'EBCU Sensor Connector'),
    ('942-58130', 'APS-IN', 'ALL', 'APS 750VDC Input'),
    ('942-58130', 'APS-OUT', 'ALL', 'APS 415VAC Output'),
    ('942-58136', 'DOOR-L1', 'DMC', 'Left Door 1 Control'),
    ('942-58136', 'DOOR-R1', 'DMC', 'Right Door 1 Control'),
    ('942-58139', 'DOOR-L2', 'TC', 'Left Door 2 Control'),
    ('942-58139', 'DOOR-R2', 'TC', 'Right Door 2 Control'),
    ('942-58146', 'CN1-ETH', 'ALL', 'CN1 Ethernet Port'),
    ('942-58146', 'CN2-ETH', 'ALL', 'CN2 Ethernet Port'),
    ('942-58146', 'CCU-CAN', 'DMC', 'CCU CAN Bus Port'),
    ('942-58146', 'RIO-IO1', 'ALL', 'RIO Digital IO Port 1'),
    ('942-58146', 'RIO-IO2', 'ALL', 'RIO Digital IO Port 2'),
    ('942-58152', 'CBTC-TX', 'DMC', 'CBTC Transmit Connector'),
    ('942-58152', 'CBTC-RX', 'DMC', 'CBTC Receive Connector'),
    ('942-58152', 'CBTC-ETH', 'DMC', 'CBTC Ethernet Port'),
    ('942-58143', 'CAB-AC', 'DMC', 'Cab AC Unit Connector'),
    ('942-58144', 'SAL-PWR', 'ALL', 'Saloon AC Power'),
    ('942-58144', 'SAL-CTL', 'ALL', 'Saloon AC Control'),
    ('942-58149', 'CCU-PAPIS', 'DMC', 'CCU PAPIS Interface'),
    ('942-58149', 'CCTV-CU', 'DMC', 'CCTV Control Unit'),
    ('942-58150', 'PA-AMP1', 'DMC', 'PA Amplifier DMC'),
    ('942-58150', 'PA-AMP2', 'MC', 'PA Amplifier MC'),
    ('942-58154', 'CCTV-CAM', 'ALL', 'CCTV Camera Connector')
) AS x(drawing_no, code, car_type, description)
WHERE d."drawingNo" = x.drawing_no
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- ============================================
-- 12. CONNECTOR PINS FOR NEW CONNECTORS
-- ============================================

-- VVVF Inverter pins
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "signalName", "conductorClassCode", "note")
SELECT
    gen_random_uuid()::text,
    c.id,
    x.pin_no,
    x.signal_name,
    x.conductor_class,
    x.note
FROM "Connector" c
CROSS JOIN (VALUES
    ('VVVF-IN', '1', '750V+ Input', 'ED', 'Main 750VDC positive'),
    ('VVVF-IN', '2', '750V- Return', 'ED', 'Main 750VDC return'),
    ('VVVF-IN', '3', 'Control 110V+', 'BA', 'Control supply positive'),
    ('VVVF-IN', '4', 'Control 110V-', 'BA', 'Control supply ground'),
    ('VVVF-IN', '5', 'Enable', 'BA', 'Inverter enable signal'),
    ('VVVF-IN', '6', 'Fault', 'BA', 'Fault feedback signal'),
    ('VVVF-OUT', '1', 'U Phase', 'ED', 'Motor U phase'),
    ('VVVF-OUT', '2', 'V Phase', 'ED', 'Motor V phase'),
    ('VVVF-OUT', '3', 'W Phase', 'ED', 'Motor W phase'),
    ('VVVF-OUT', '4', 'PE Earth', 'PE', 'Protective earth')
) AS x(connector_code, pin_no, signal_name, conductor_class, note)
WHERE c."connectorCode" = x.connector_code
ON CONFLICT DO NOTHING;

-- APS pins
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "signalName", "conductorClassCode", "note")
SELECT
    gen_random_uuid()::text,
    c.id,
    x.pin_no,
    x.signal_name,
    x.conductor_class,
    x.note
FROM "Connector" c
CROSS JOIN (VALUES
    ('APS-IN', '1', '750VDC+ Input', 'ED', 'High tension input positive'),
    ('APS-IN', '2', '750VDC- Return', 'ED', 'High tension return'),
    ('APS-IN', '3', 'PE Earth', 'PE', 'Protective earth'),
    ('APS-OUT', '1', 'L1 415VAC', 'AP', '3-phase line 1'),
    ('APS-OUT', '2', 'L2 415VAC', 'AP', '3-phase line 2'),
    ('APS-OUT', '3', 'L3 415VAC', 'AP', '3-phase line 3'),
    ('APS-OUT', '4', 'N Neutral', 'AP', 'Neutral'),
    ('APS-OUT', '5', 'PE Earth', 'PE', 'Protective earth'),
    ('APS-OUT', '6', '230VAC L', 'AP', 'Single phase line'),
    ('APS-OUT', '7', '230VAC N', 'AP', 'Single phase neutral')
) AS x(connector_code, pin_no, signal_name, conductor_class, note)
WHERE c."connectorCode" = x.connector_code
ON CONFLICT DO NOTHING;

-- TCMS Communication pins
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "signalName", "conductorClassCode", "note")
SELECT
    gen_random_uuid()::text,
    c.id,
    x.pin_no,
    x.signal_name,
    x.conductor_class,
    x.note
FROM "Connector" c
CROSS JOIN (VALUES
    ('CN1-ETH', '1', 'ETH TX+', 'S', 'Ethernet transmit positive'),
    ('CN1-ETH', '2', 'ETH TX-', 'S', 'Ethernet transmit negative'),
    ('CN1-ETH', '3', 'ETH RX+', 'S', 'Ethernet receive positive'),
    ('CN1-ETH', '4', 'ETH RX-', 'S', 'Ethernet receive negative'),
    ('CN1-ETH', '5', '24VDC+', 'BA', 'Power supply positive'),
    ('CN1-ETH', '6', '24VDC-', 'BA', 'Power supply ground'),
    ('CN2-ETH', '1', 'ETH TX+', 'S', 'Ethernet transmit positive'),
    ('CN2-ETH', '2', 'ETH TX-', 'S', 'Ethernet transmit negative'),
    ('CN2-ETH', '3', 'ETH RX+', 'S', 'Ethernet receive positive'),
    ('CN2-ETH', '4', 'ETH RX-', 'S', 'Ethernet receive negative'),
    ('CN2-ETH', '5', '24VDC+', 'BA', 'Power supply positive'),
    ('CN2-ETH', '6', '24VDC-', 'BA', 'Power supply ground'),
    ('CCU-CAN', '1', 'CAN H', 'S', 'CAN bus high'),
    ('CCU-CAN', '2', 'CAN L', 'S', 'CAN bus low'),
    ('CCU-CAN', '3', 'GND', 'GD', 'Ground'),
    ('CCU-CAN', '4', '+24V', 'BA', 'Power supply'),
    ('RIO-IO1', '1', 'DI 1', 'BA', 'Digital input 1'),
    ('RIO-IO1', '2', 'DI 2', 'BA', 'Digital input 2'),
    ('RIO-IO1', '3', 'DI 3', 'BA', 'Digital input 3'),
    ('RIO-IO1', '4', 'DO 1', 'BA', 'Digital output 1'),
    ('RIO-IO1', '5', 'DO 2', 'BA', 'Digital output 2'),
    ('RIO-IO1', '6', 'GND', 'GD', 'Ground'),
    ('RIO-IO1', '7', '+24V', 'BA', 'Power supply'),
    ('RIO-IO2', '1', 'DI 4', 'BA', 'Digital input 4'),
    ('RIO-IO2', '2', 'DI 5', 'BA', 'Digital input 5'),
    ('RIO-IO2', '3', 'DI 6', 'BA', 'Digital input 6'),
    ('RIO-IO2', '4', 'DO 3', 'BA', 'Digital output 3'),
    ('RIO-IO2', '5', 'DO 4', 'BA', 'Digital output 4'),
    ('RIO-IO2', '6', 'GND', 'GD', 'Ground'),
    ('RIO-IO2', '7', '+24V', 'BA', 'Power supply')
) AS x(connector_code, pin_no, signal_name, conductor_class, note)
WHERE c."connectorCode" = x.connector_code
ON CONFLICT DO NOTHING;

-- CBTC pins
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "signalName", "conductorClassCode", "note")
SELECT
    gen_random_uuid()::text,
    c.id,
    x.pin_no,
    x.signal_name,
    x.conductor_class,
    x.note
FROM "Connector" c
CROSS JOIN (VALUES
    ('CBTC-TX', '1', 'TX+', 'S', 'CBTC transmit positive'),
    ('CBTC-TX', '2', 'TX-', 'S', 'CBTC transmit negative'),
    ('CBTC-TX', '3', 'Shield', 'PE', 'Cable shield'),
    ('CBTC-RX', '1', 'RX+', 'S', 'CBTC receive positive'),
    ('CBTC-RX', '2', 'RX-', 'S', 'CBTC receive negative'),
    ('CBTC-RX', '3', 'Shield', 'PE', 'Cable shield'),
    ('CBTC-ETH', '1', 'ETH TX+', 'S', 'Ethernet transmit positive'),
    ('CBTC-ETH', '2', 'ETH TX-', 'S', 'Ethernet transmit negative'),
    ('CBTC-ETH', '3', 'ETH RX+', 'S', 'Ethernet receive positive'),
    ('CBTC-ETH', '4', 'ETH RX-', 'S', 'Ethernet receive negative'),
    ('CBTC-ETH', '5', '24VDC+', 'BA', 'Power supply positive'),
    ('CBTC-ETH', '6', '24VDC-', 'BA', 'Power supply ground')
) AS x(connector_code, pin_no, signal_name, conductor_class, note)
WHERE c."connectorCode" = x.connector_code
ON CONFLICT DO NOTHING;

-- Door system pins
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "signalName", "conductorClassCode", "note")
SELECT
    gen_random_uuid()::text,
    c.id,
    x.pin_no,
    x.signal_name,
    x.conductor_class,
    x.note
FROM "Connector" c
CROSS JOIN (VALUES
    ('DOOR-L1', '1', 'Open Command', 'BA', 'Door open command'),
    ('DOOR-L1', '2', 'Close Command', 'BA', 'Door close command'),
    ('DOOR-L1', '3', 'Proving', 'BA', 'Door proving signal'),
    ('DOOR-L1', '4', 'Interlock', 'BA', 'Door interlock status'),
    ('DOOR-L1', '5', '+110VDC', 'ED', 'Power supply'),
    ('DOOR-L1', '6', 'GND', 'GD', 'Ground'),
    ('DOOR-R1', '1', 'Open Command', 'BA', 'Door open command'),
    ('DOOR-R1', '2', 'Close Command', 'BA', 'Door close command'),
    ('DOOR-R1', '3', 'Proving', 'BA', 'Door proving signal'),
    ('DOOR-R1', '4', 'Interlock', 'BA', 'Door interlock status'),
    ('DOOR-R1', '5', '+110VDC', 'ED', 'Power supply'),
    ('DOOR-R1', '6', 'GND', 'GD', 'Ground'),
    ('DOOR-L2', '1', 'Open Command', 'BA', 'Door open command'),
    ('DOOR-L2', '2', 'Close Command', 'BA', 'Door close command'),
    ('DOOR-L2', '3', 'Proving', 'BA', 'Door proving signal'),
    ('DOOR-L2', '4', 'Interlock', 'BA', 'Door interlock status'),
    ('DOOR-L2', '5', '+110VDC', 'ED', 'Power supply'),
    ('DOOR-L2', '6', 'GND', 'GD', 'Ground'),
    ('DOOR-R2', '1', 'Open Command', 'BA', 'Door open command'),
    ('DOOR-R2', '2', 'Close Command', 'BA', 'Door close command'),
    ('DOOR-R2', '3', 'Proving', 'BA', 'Door proving signal'),
    ('DOOR-R2', '4', 'Interlock', 'BA', 'Door interlock status'),
    ('DOOR-R2', '5', '+110VDC', 'ED', 'Power supply'),
    ('DOOR-R2', '6', 'GND', 'GD', 'Ground')
) AS x(connector_code, pin_no, signal_name, conductor_class, note)
WHERE c."connectorCode" = x.connector_code
ON CONFLICT DO NOTHING;

-- CCTV and PA pins
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "signalName", "conductorClassCode", "note")
SELECT
    gen_random_uuid()::text,
    c.id,
    x.pin_no,
    x.signal_name,
    x.conductor_class,
    x.note
FROM "Connector" c
CROSS JOIN (VALUES
    ('CCTV-CU', '1', 'Video In', 'S', 'CCTV video input'),
    ('CCTV-CU', '2', 'Audio In', 'S', 'CCTV audio input'),
    ('CCTV-CU', '3', 'Control', 'S', 'PTZ control'),
    ('CCTV-CU', '4', '+12VDC', 'BA', 'Power supply'),
    ('CCTV-CU', '5', 'GND', 'GD', 'Ground'),
    ('CCTV-CAM', '1', 'Video Out', 'S', 'Camera video output'),
    ('CCTV-CAM', '2', 'Audio Out', 'S', 'Camera audio output'),
    ('CCTV-CAM', '3', '+12VDC', 'BA', 'Power supply'),
    ('CCTV-CAM', '4', 'GND', 'GD', 'Ground'),
    ('PA-AMP1', '1', 'Audio In L', 'S', 'Audio input left'),
    ('PA-AMP1', '2', 'Audio In R', 'S', 'Audio input right'),
    ('PA-AMP1', '3', 'Speaker Out+', 'AP', 'Speaker output positive'),
    ('PA-AMP1', '4', 'Speaker Out-', 'AP', 'Speaker output negative'),
    ('PA-AMP1', '5', '+415VAC L', 'AP', 'AC power line'),
    ('PA-AMP1', '6', '+415VAC N', 'AP', 'AC power neutral'),
    ('PA-AMP2', '1', 'Audio In L', 'S', 'Audio input left'),
    ('PA-AMP2', '2', 'Audio In R', 'S', 'Audio input right'),
    ('PA-AMP2', '3', 'Speaker Out+', 'AP', 'Speaker output positive'),
    ('PA-AMP2', '4', 'Speaker Out-', 'AP', 'Speaker output negative'),
    ('PA-AMP2', '5', '+415VAC L', 'AP', 'AC power line'),
    ('PA-AMP2', '6', '+415VAC N', 'AP', 'AC power neutral')
) AS x(connector_code, pin_no, signal_name, conductor_class, note)
WHERE c."connectorCode" = x.connector_code
ON CONFLICT DO NOTHING;

-- ============================================
-- 13. MORE WIRES FOR NEW CONNECTORS
-- ============================================

INSERT INTO "Wire" ("id", "wireNo", "signalName", "conductorClassCode", "description", "wireSize", "voltageClass", "createdAt", "updatedAt")
VALUES
    -- Traction wires
    ('W-750V-01', '7501', '750VDC Input+', 'ED', 'Main 750VDC positive supply', '16mm²', '750VDC', NOW(), NOW()),
    ('W-750V-02', '7502', '750VDC Return-', 'ED', 'Main 750VDC return', '16mm²', '750VDC', NOW(), NOW()),
    ('W-MOTOR-U', '7510', 'Motor U Phase', 'ED', 'Traction motor U phase', '16mm²', '750VDC', NOW(), NOW()),
    ('W-MOTOR-V', '7511', 'Motor V Phase', 'ED', 'Traction motor V phase', '16mm²', '750VDC', NOW(), NOW()),
    ('W-MOTOR-W', '7512', 'Motor W Phase', 'ED', 'Traction motor W phase', '16mm²', '750VDC', NOW(), NOW()),
    ('W-INV-EN', '7520', 'Inverter Enable', 'BA', 'Inverter enable signal', '2.5mm²', '110VDC', NOW(), NOW()),
    ('W-INV-FLT', '7521', 'Inverter Fault', 'BA', 'Inverter fault feedback', '2.5mm²', '110VDC', NOW(), NOW()),
    ('W-HSCB-CTL', '7530', 'HSCB Control', 'BA', 'HSCB trip/close control', '2.5mm²', '110VDC', NOW(), NOW()),
    ('W-HSCB-ST', '7531', 'HSCB Status', 'BA', 'HSCB status feedback', '2.5mm²', '110VDC', NOW(), NOW()),
    
    -- APS wires
    ('W-APS-IN+', '7601', 'APS 750V+', 'ED', 'APS high tension input positive', '16mm²', '750VDC', NOW(), NOW()),
    ('W-APS-IN-', '7602', 'APS 750V-', 'ED', 'APS high tension input negative', '16mm²', '750VDC', NOW(), NOW()),
    ('W-APS-L1', '7610', 'APS 415V L1', 'AP', 'APS output phase 1', '6mm²', '415VAC', NOW(), NOW()),
    ('W-APS-L2', '7611', 'APS 415V L2', 'AP', 'APS output phase 2', '6mm²', '415VAC', NOW(), NOW()),
    ('W-APS-L3', '7612', 'APS 415V L3', 'AP', 'APS output phase 3', '6mm²', '415VAC', NOW(), NOW()),
    ('W-APS-N', '7613', 'APS 415V N', 'AP', 'APS output neutral', '6mm²', '415VAC', NOW(), NOW()),
    ('W-APS-230L', '7620', 'APS 230V L', 'AP', 'APS single phase line', '4mm²', '230VAC', NOW(), NOW()),
    ('W-APS-230N', '7621', 'APS 230V N', 'AP', 'APS single phase neutral', '4mm²', '230VAC', NOW(), NOW()),
    
    -- Door wires
    ('W-DOOR-OL1', '6100', 'Door Open Left 1', 'BA', 'Left door 1 open command', '2.5mm²', '110VDC', NOW(), NOW()),
    ('W-DOOR-CL1', '6101', 'Door Close Left 1', 'BA', 'Left door 1 close command', '2.5mm²', '110VDC', NOW(), NOW()),
    ('W-DOOR-OR1', '6110', 'Door Open Right 1', 'BA', 'Right door 1 open command', '2.5mm²', '110VDC', NOW(), NOW()),
    ('W-DOOR-CR1', '6111', 'Door Close Right 1', 'BA', 'Right door 1 close command', '2.5mm²', '110VDC', NOW(), NOW()),
    ('W-DOOR-PR1', '6120', 'Door Proving 1', 'BA', 'Door 1 proving signal', '2.5mm²', '110VDC', NOW(), NOW()),
    ('W-DOOR-IL1', '6121', 'Door Interlock 1', 'BA', 'Door 1 interlock status', '2.5mm²', '110VDC', NOW(), NOW()),
    ('W-DOOR-OL2', '6200', 'Door Open Left 2', 'BA', 'Left door 2 open command', '2.5mm²', '110VDC', NOW(), NOW()),
    ('W-DOOR-CL2', '6201', 'Door Close Left 2', 'BA', 'Left door 2 close command', '2.5mm²', '110VDC', NOW(), NOW()),
    ('W-DOOR-OR2', '6210', 'Door Open Right 2', 'BA', 'Right door 2 open command', '2.5mm²', '110VDC', NOW(), NOW()),
    ('W-DOOR-CR2', '6211', 'Door Close Right 2', 'BA', 'Right door 2 close command', '2.5mm²', '110VDC', NOW(), NOW()),
    
    -- TCMS wires
    ('W-CN1-TX+', '9601', 'CN1 ETH TX+', 'S', 'CN1 Ethernet transmit positive', '0.5mm²', '24VDC', NOW(), NOW()),
    ('W-CN1-TX-', '9602', 'CN1 ETH TX-', 'S', 'CN1 Ethernet transmit negative', '0.5mm²', '24VDC', NOW(), NOW()),
    ('W-CN1-RX+', '9603', 'CN1 ETH RX+', 'S', 'CN1 Ethernet receive positive', '0.5mm²', '24VDC', NOW(), NOW()),
    ('W-CN1-RX-', '9604', 'CN1 ETH RX-', 'S', 'CN1 Ethernet receive negative', '0.5mm²', '24VDC', NOW(), NOW()),
    ('W-CN2-TX+', '9611', 'CN2 ETH TX+', 'S', 'CN2 Ethernet transmit positive', '0.5mm²', '24VDC', NOW(), NOW()),
    ('W-CN2-TX-', '9612', 'CN2 ETH TX-', 'S', 'CN2 Ethernet transmit negative', '0.5mm²', '24VDC', NOW(), NOW()),
    ('W-CN2-RX+', '9613', 'CN2 ETH RX+', 'S', 'CN2 Ethernet receive positive', '0.5mm²', '24VDC', NOW(), NOW()),
    ('W-CN2-RX-', '9614', 'CN2 ETH RX-', 'S', 'CN2 Ethernet receive negative', '0.5mm²', '24VDC', NOW(), NOW()),
    ('W-CAN-H', '9620', 'CAN Bus High', 'S', 'CAN bus high line', '0.75mm²', '24VDC', NOW(), NOW()),
    ('W-CAN-L', '9621', 'CAN Bus Low', 'S', 'CAN bus low line', '0.75mm²', '24VDC', NOW(), NOW()),
    ('W-RIO-DI1', '9630', 'RIO DI 1', 'BA', 'RIO digital input 1', '1mm²', '24VDC', NOW(), NOW()),
    ('W-RIO-DO1', '9631', 'RIO DO 1', 'BA', 'RIO digital output 1', '1mm²', '24VDC', NOW(), NOW()),
    
    -- CBTC wires
    ('W-CBTC-TX+', '9701', 'CBTC TX+', 'S', 'CBTC transmit positive', '0.75mm²', '24VDC', NOW(), NOW()),
    ('W-CBTC-TX-', '9702', 'CBTC TX-', 'S', 'CBTC transmit negative', '0.75mm²', '24VDC', NOW(), NOW()),
    ('W-CBTC-RX+', '9703', 'CBTC RX+', 'S', 'CBTC receive positive', '0.75mm²', '24VDC', NOW(), NOW()),
    ('W-CBTC-RX-', '9704', 'CBTC RX-', 'S', 'CBTC receive negative', '0.75mm²', '24VDC', NOW(), NOW()),
    ('W-CBTC-EN', '9710', 'CBTC Enable', 'BA', 'CBTC system enable', '1mm²', '24VDC', NOW(), NOW()),
    ('W-CBTC-ST', '9711', 'CBTC Status', 'BA', 'CBTC status feedback', '1mm²', '24VDC', NOW(), NOW()),
    
    -- CCTV wires
    ('W-CCTV-VID', '9801', 'CCTV Video', 'S', 'CCTV video signal', '0.75mm²', '12VDC', NOW(), NOW()),
    ('W-CCTV-AUD', '9802', 'CCTV Audio', 'S', 'CCTV audio signal', '0.5mm²', '12VDC', NOW(), NOW()),
    ('W-CCTV-PWR', '9803', 'CCTV Power', 'BA', 'CCTV power supply', '1mm²', '12VDC', NOW(), NOW()),
    
    -- PA wires
    ('W-PA-IN-L', '9810', 'PA Audio L', 'S', 'PA audio input left', '0.5mm²', '24VDC', NOW(), NOW()),
    ('W-PA-IN-R', '9811', 'PA Audio R', 'S', 'PA audio input right', '0.5mm²', '24VDC', NOW(), NOW()),
    ('W-PA-SPK+', '9820', 'PA Speaker+', 'AP', 'PA speaker output positive', '2.5mm²', '415VAC', NOW(), NOW()),
    ('W-PA-SPK-', '9821', 'PA Speaker-', 'AP', 'PA speaker output negative', '2.5mm²', '415VAC', NOW(), NOW()),
    
    -- AC wires
    ('W-AC-CAB', '9830', 'Cab AC Supply', 'AP', 'Cab AC unit power supply', '4mm²', '415VAC', NOW(), NOW()),
    ('W-AC-SAL', '9831', 'Saloon AC Supply', 'AP', 'Saloon AC unit power supply', '6mm²', '415VAC', NOW(), NOW()),
    ('W-AC-CTL', '9832', 'AC Control', 'BA', 'AC control signal', '1mm²', '24VDC', NOW(), NOW())
ON CONFLICT ("wireNo") DO UPDATE
SET "signalName" = EXCLUDED."signalName",
    "description" = EXCLUDED."description";

-- ============================================
-- 14. DRAWING WIRE LINKS FOR NEW WIRES
-- ============================================

INSERT INTO "DrawingWire" ("id", "drawingId", "wireId", "createdAt")
SELECT
    gen_random_uuid()::text,
    d.id,
    w.id,
    NOW()
FROM "Wire" w
JOIN "Drawing" d ON d."drawingNo" = (
    CASE
        WHEN w."wireNo" LIKE '75%' THEN '942-58119'
        WHEN w."wireNo" LIKE '76%' THEN '942-58130'
        WHEN w."wireNo" LIKE '61%' OR w."wireNo" LIKE '62%' THEN '942-58136'
        WHEN w."wireNo" LIKE '96%' THEN '942-58146'
        WHEN w."wireNo" LIKE '97%' THEN '942-58152'
        WHEN w."wireNo" LIKE '980%' THEN '942-58154'
        WHEN w."wireNo" LIKE '981%' OR w."wireNo" LIKE '982%' THEN '942-58150'
        WHEN w."wireNo" LIKE '983%' THEN '942-58144'
        ELSE NULL
    END
)
WHERE d."drawingNo" IS NOT NULL
ON CONFLICT ("drawingId", "wireId") DO NOTHING;

-- ============================================
-- 15. WIRE ENDPOINTS FOR NEW CONNECTORS
-- ============================================

INSERT INTO "WireEndpoint" ("id", "wireId", "connectorId", "pinId", "endpointRole", "endpointLabel", "endpointPin", "createdAt")
SELECT
    gen_random_uuid()::text,
    w.id,
    c.id,
    cp.id,
    'bidirectional',
    c."connectorCode",
    cp."pinNo",
    NOW()
FROM "ConnectorPin" cp
JOIN "Connector" c ON c.id = cp."connectorId"
JOIN "Wire" w ON w."wireNo" = cp."wireNo"
WHERE cp."wireNo" IS NOT NULL
AND cp."wireNo" IN (
    SELECT "wireNo" FROM "Wire" WHERE "wireNo" LIKE '75%'
    UNION ALL SELECT "wireNo" FROM "Wire" WHERE "wireNo" LIKE '76%'
    UNION ALL SELECT "wireNo" FROM "Wire" WHERE "wireNo" LIKE '61%' OR "wireNo" LIKE '62%'
    UNION ALL SELECT "wireNo" FROM "Wire" WHERE "wireNo" LIKE '96%'
    UNION ALL SELECT "wireNo" FROM "Wire" WHERE "wireNo" LIKE '97%'
    UNION ALL SELECT "wireNo" FROM "Wire" WHERE "wireNo" LIKE '98%'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 16. DRAWING APPLICABILITY (Car type mapping)
-- ============================================

INSERT INTO "DrawingApplicability" ("id", "drawingId", "carType", "applicable", "remark")
SELECT
    gen_random_uuid()::text,
    d.id,
    x.car_type,
    x.applicable,
    x.remark
FROM "Drawing" d
CROSS JOIN (VALUES
    ('942-58119', 'MC', true, 'VVVF traction - motor car only'),
    ('942-58119', 'DMC', false, 'DMC does not have traction'),
    ('942-58119', 'TC', false, 'TC does not have traction'),
    ('942-58120', 'MC', true, 'VVVF control - motor car only'),
    ('942-58121', 'MC', true, 'Traction return - motor car only'),
    ('942-58125', 'ALL', true, 'Emergency brake - all cars'),
    ('942-58130', 'ALL', true, 'APS - all cars'),
    ('942-58136', 'DMC', true, 'Door operation - DMC'),
    ('942-58136', 'TC', true, 'Door operation - TC'),
    ('942-58136', 'MC', true, 'Door operation - MC'),
    ('942-58143', 'DMC', true, 'Cab AC - DMC only'),
    ('942-58143', 'TC', false, 'TC does not have cab AC'),
    ('942-58143', 'MC', false, 'MC does not have cab AC'),
    ('942-58144', 'ALL', true, 'Saloon AC power - all cars'),
    ('942-58146', 'ALL', true, 'TCMS communication - all cars'),
    ('942-58152', 'ALL', true, 'CBTC - all cars')
) AS x(drawing_no, car_type, applicable, remark)
WHERE d."drawingNo" = x.drawing_no
ON CONFLICT ("drawingId", "carType") DO NOTHING;

-- ============================================
-- 17. FINAL COUNTS
-- ============================================

SELECT 'SEED COMPLETE' as status;
SELECT 'Subsystems' as tbl, COUNT(*) as cnt FROM "Subsystem"
UNION ALL SELECT 'VCCDescriptions', COUNT(*) FROM "VCCDescription"
UNION ALL SELECT 'SystemMetadata', COUNT(*) FROM "SystemMetadata"
UNION ALL SELECT 'DrawingSheets', COUNT(*) FROM "DrawingSheet"
UNION ALL SELECT 'DrawingRevisions', COUNT(*) FROM "DrawingRevision"
UNION ALL SELECT 'DrawingWires', COUNT(*) FROM "DrawingWire"
UNION ALL SELECT 'WireEndpoints', COUNT(*) FROM "WireEndpoint"
UNION ALL SELECT 'CircuitEndpoints', COUNT(*) FROM "CircuitEndpoint"
UNION ALL SELECT 'CrossConnectionRules', COUNT(*) FROM "CrossConnectionRule"
UNION ALL SELECT 'Notes', COUNT(*) FROM "Note"
UNION ALL SELECT 'Connectors', COUNT(*) FROM "Connector"
UNION ALL SELECT 'ConnectorPins', COUNT(*) FROM "ConnectorPin"
UNION ALL SELECT 'Wires', COUNT(*) FROM "Wire"
UNION ALL SELECT 'DrawingApplicability', COUNT(*) FROM "DrawingApplicability";

COMMIT;
