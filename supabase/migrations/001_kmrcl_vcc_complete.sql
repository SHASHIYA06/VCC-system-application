-- ============================================================
-- KMRCL VCC INTELLIGENT WIRING EXPLORER
-- Complete Schema with All Systems, Subsystems, Equipment & Wiring
-- ============================================================

BEGIN;

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- 2. ENUM TYPES
-- ============================================================
CREATE TYPE app_role AS ENUM ('admin', 'engineer', 'viewer');
CREATE TYPE drawing_status AS ENUM ('active', 'superseded', 'obsolete', 'draft');
CREATE TYPE ocr_quality AS ENUM ('raw', 'reviewed', 'verified', 'failed');
CREATE TYPE car_zone AS ENUM ('UNDERFRAME', 'CEILING', 'CAB', 'BOGIE', 'INTERIOR');
CREATE TYPE connection_type AS ENUM ('FEEDS', 'CONTROLS', 'REPORTS_TO', 'RETURNS_TO', 'CROSSES_AT', 'INTERLOCKS_WITH');

-- ============================================================
-- 3. CORE TABLES
-- ============================================================

-- 3.1 User Profiles
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    full_name TEXT,
    role app_role NOT NULL DEFAULT 'viewer',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    customer_name TEXT,
    rolling_stock_type TEXT,
    formation TEXT DEFAULT 'DMC-TC-MC-MC-TC-DMC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 Car Types
CREATE TABLE car_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    position_in_formation SMALLINT,
    is_driving BOOLEAN DEFAULT false,
    has_motor BOOLEAN DEFAULT false,
    has_panto BOOLEAN DEFAULT false,
    UNIQUE(project_id, code)
);

-- 3.4 Systems (Major Groups)
CREATE TABLE systems (
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
);

-- 3.5 Subsystems
CREATE TABLE subsystems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sort_order SMALLINT,
    UNIQUE(system_id, code)
);

-- 3.6 Source Documents
CREATE TABLE source_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_artifact_id TEXT UNIQUE,
    filename TEXT NOT NULL,
    document_group TEXT,
    car_type_code TEXT,
    zone car_zone,
    page_count INTEGER,
    ocr_status TEXT DEFAULT 'parsed',
    file_size_bytes BIGINT,
    checksum TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.7 Drawings (Master Register)
CREATE TABLE drawings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_document_id UUID REFERENCES source_documents(id) ON DELETE SET NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    car_type_id UUID REFERENCES car_types(id) ON DELETE RESTRICT,
    system_id UUID NOT NULL REFERENCES systems(id) ON DELETE RESTRICT,
    subsystem_id UUID REFERENCES subsystems(id) ON DELETE SET NULL,
    drawing_no TEXT NOT NULL,
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
    zone car_zone,
    status drawing_status NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(drawing_no)
);

CREATE INDEX idx_drawings_system ON drawings(system_id);
CREATE INDEX idx_drawings_car_type ON drawings(car_type_id);
CREATE INDEX idx_drawings_drawing_no ON drawings(drawing_no);

-- 3.8 Drawing Revisions
CREATE TABLE drawing_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drawing_id UUID NOT NULL REFERENCES drawings(id) ON DELETE CASCADE,
    alt_no TEXT,
    revision_code TEXT,
    ecn_no TEXT,
    change_summary TEXT,
    revision_date DATE,
    drwn_by TEXT,
    chkd_by TEXT,
    appd_by TEXT,
    is_current BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.9 Drawing Pages
CREATE TABLE drawing_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drawing_id UUID NOT NULL REFERENCES drawings(id) ON DELETE CASCADE,
    page_no INTEGER NOT NULL,
    page_label TEXT,
    section_name TEXT,
    raw_ocr TEXT,
    ocr_quality ocr_quality DEFAULT 'raw',
    UNIQUE(drawing_id, page_no)
);

-- 3.10 Equipment / Modules
CREATE TABLE equipment (
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
);

CREATE INDEX idx_equipment_system ON equipment(system_id);
CREATE INDEX idx_equipment_car_type ON equipment(car_type_id);
CREATE INDEX idx_equipment_code ON equipment(equipment_code);

-- 3.11 Connectors
CREATE TABLE connectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drawing_id UUID NOT NULL REFERENCES drawings(id) ON DELETE CASCADE,
    page_id UUID REFERENCES drawing_pages(id) ON DELETE SET NULL,
    equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
    connector_code TEXT NOT NULL,
    connector_type TEXT,
    connector_variant TEXT,
    gender TEXT,
    pin_count INTEGER,
    view_name TEXT,
    remarks TEXT,
    UNIQUE(drawing_id, connector_code, COALESCE(page_id::TEXT, ''))
);

CREATE INDEX idx_connectors_equipment ON connectors(equipment_id);
CREATE INDEX idx_connectors_code ON connectors(connector_code);

-- 3.12 Wires
CREATE TABLE wires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wire_no TEXT NOT NULL UNIQUE,
    wire_type TEXT,
    wire_size TEXT,
    wire_color TEXT,
    shielded BOOLEAN DEFAULT false,
    voltage_class TEXT,
    description TEXT,
    conductor_class TEXT,
    remarks TEXT
);

CREATE INDEX idx_wires_no ON wires(wire_no);

-- 3.13 Pins
CREATE TABLE pins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connector_id UUID NOT NULL REFERENCES connectors(id) ON DELETE CASCADE,
    pin_no TEXT NOT NULL,
    sequence_no INTEGER,
    wire_id UUID REFERENCES wires(id) ON DELETE SET NULL,
    wire_no_raw TEXT,
    signal_name TEXT,
    wire_type_raw TEXT,
    cable_spec TEXT,
    from_ref TEXT,
    to_ref TEXT,
    remark TEXT,
    UNIQUE(connector_id, pin_no, COALESCE(sequence_no::TEXT, '0'))
);

CREATE INDEX idx_pins_connector ON pins(connector_id);
CREATE INDEX idx_pins_wire ON pins(wire_id);

-- 3.14 Pin Links (Cross-Reference Engine)
CREATE TABLE pin_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_pin_id UUID NOT NULL REFERENCES pins(id) ON DELETE CASCADE,
    target_equipment_code TEXT,
    target_connector_code TEXT,
    target_pin_no TEXT,
    target_ref TEXT,
    confidence NUMERIC(5,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.15 Trainlines
CREATE TABLE trainlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainline_no INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    system_id UUID REFERENCES systems(id) ON DELETE SET NULL,
    voltage_domain TEXT,
    is_cross_connected BOOLEAN DEFAULT false,
    cross_connect_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.16 Trainline Jumper Crossings
CREATE TABLE trainline_crossings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainline_id UUID NOT NULL REFERENCES trainlines(id) ON DELETE CASCADE,
    crossing_type TEXT NOT NULL,
    source_connector TEXT,
    source_pin TEXT,
    dest_connector TEXT,
    dest_pin TEXT,
    description TEXT,
    drawing_id UUID REFERENCES drawings(id) ON DELETE SET NULL
);

-- 3.17 TCMS / RIO Points
CREATE TABLE tcms_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    point_code TEXT NOT NULL UNIQUE,
    rio_unit TEXT,
    connector_code TEXT,
    pin_no TEXT,
    signal_type TEXT,
    signal_name TEXT,
    description TEXT,
    system_id UUID REFERENCES systems(id) ON DELETE SET NULL,
    drawing_id UUID REFERENCES drawings(id) ON DELETE SET NULL
);

CREATE INDEX idx_tcms_points_rio ON tcms_points(rio_unit);

-- 3.18 Device Contacts
CREATE TABLE device_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    device_tag TEXT NOT NULL,
    contact_type TEXT,
    contact_no TEXT,
    normally_open BOOLEAN DEFAULT true,
    description TEXT
);

-- 3.19 Wire Connections (End-to-End)
CREATE TABLE wire_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connection_key TEXT NOT NULL UNIQUE,
    connector_code TEXT NOT NULL,
    pin_no TEXT NOT NULL,
    wire_no TEXT,
    wire_type TEXT,
    endpoint_direction TEXT,
    endpoint_name TEXT,
    endpoint_pin TEXT,
    equipment TEXT,
    primary_source_file TEXT,
    first_source_page INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wire_connections_connector_pin ON wire_connections(connector_code, pin_no);
CREATE INDEX idx_wire_connections_wire ON wire_connections(wire_no);

-- 3.20 Tags
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    tag_type TEXT
);

-- 3.21 Drawing-Tag Link
CREATE TABLE drawing_tags (
    drawing_id UUID NOT NULL REFERENCES drawings(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (drawing_id, tag_id)
);

-- 3.22 Import Tracking
CREATE TABLE import_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_document_id UUID REFERENCES source_documents(id) ON DELETE SET NULL,
    run_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    rows_parsed INTEGER,
    rows_imported INTEGER,
    rows_failed INTEGER,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ
);

CREATE TABLE import_errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    import_run_id UUID NOT NULL REFERENCES import_runs(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    row_ref TEXT,
    error_message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.23 Audit Log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.24 Wire Tracing (Upstream/Downstream)
CREATE TABLE wire_traces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wire_no TEXT NOT NULL,
    trace_type TEXT NOT NULL,
    from_equipment TEXT,
    from_connector TEXT,
    from_pin TEXT,
    to_equipment TEXT,
    to_connector TEXT,
    to_pin TEXT,
    car_type_code TEXT,
    system_id UUID REFERENCES systems(id) ON DELETE SET NULL,
    description TEXT
);

CREATE INDEX idx_wire_traces_wire ON wire_traces(wire_no);

-- 3.25 System Relationships
CREATE TABLE system_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_system_id UUID REFERENCES systems(id) ON DELETE CASCADE,
    target_system_id UUID REFERENCES systems(id) ON DELETE CASCADE,
    relationship_type connection_type,
    description TEXT
);

-- ============================================================
-- 4. SEED DATA - PROJECT & CAR TYPES
-- ============================================================

INSERT INTO projects(code, name, customer_name, rolling_stock_type, formation) VALUES
('KMRCL_RS3R', 'KMRCL RS3R Metro Rolling Stock', 'Bangalore Metro Rail Corporation Ltd', 'RS3R - 6 Car Formation', 'DMC-TC-MC-MC-TC-DMC');

WITH p AS (SELECT id FROM projects WHERE code = 'KMRCL_RS3R')
INSERT INTO car_types(project_id, code, name, position_in_formation, is_driving, has_motor, has_panto)
SELECT p.id, 'DMC', 'Driving Motor Car', 1, true, true, true FROM p UNION ALL
SELECT p.id, 'TC', 'Trailer Car', 2, false, false, false FROM p UNION ALL
SELECT p.id, 'MC', 'Motor Car', 3, false, true, false FROM p;

-- ============================================================
-- 5. SEED DATA - SYSTEMS
-- ============================================================

INSERT INTO systems(code, name, category, description, icon_name, color_hex, sort_order) VALUES
-- Foundation
('GEN', 'General & Conventions', 'Foundation', 'Drawing list, classification, wiring numbers, symbols', 'Settings', '#6B7280', 1),
-- Core Systems
('TRL', 'Trainlines', 'Core Systems', 'Train line control, signal, low/high tension power', 'Train', '#3B82F6', 2),
('CAB', 'Cab Control & Status', 'Core Systems', 'Controlling cab, startup, status indication, MCB trip', 'Monitor', '#8B5CF6', 3),
('BRAKE', 'Brake System', 'Core Systems', 'Compressor, brake loop, emergency brake, parking brake, horn', 'ShieldCheck', '#EF4444', 4),
('DOOR', 'Door System', 'Core Systems', 'Door supply, left/right operation, proving loop, interlock', 'DoorOpen', '#F59E0B', 5),
('VAC', 'VAC / HVAC', 'Core Systems', 'Cab VAC, saloon VAC power and control', 'Wind', '#06B6D4', 6),
('COMMS', 'Communication Systems', 'Core Systems', 'PIS/TIS, DVAS/PA, CBTC, train radio, CCTV', 'Radio', '#10B981', 7),
-- Propulsion
('TRAC', 'Traction & Propulsion', 'Propulsion', 'Speed control, VVVF control, traction return current', 'Zap', '#F97316', 8),
-- Power
('APS', 'Auxiliary Power Supply', 'Power', 'APS, shore supply, battery control', 'Battery', '#84CC16', 9),
('HV', 'High Voltage Equipment', 'Power', 'Collector shoe, HSCB, main switch box, HTEB', 'Zap', '#EF4444', 10),
-- Electrical Distribution
('LTEB', 'Low Tension Equipment Box', 'Electrical Distribution', 'LTEB pin assignments and wiring', 'Box', '#6366F1', 11),
('LTJB', 'Low Tension Junction Box', 'Electrical Distribution', 'LTJB pin assignments and wiring', 'Box', '#8B5CF6', 12),
('EDB', 'Electrical Distribution Box', 'Electrical Distribution', 'EDB panel assignments', 'Box', '#EC4899', 13),
-- Control
('TMS', 'Train Management System', 'Control', 'TMS interface, TCMS remote I/O, communication nodes', 'Activity', '#14B8A6', 14),
-- Auxiliary
('LIGHT', 'Lighting', 'Auxiliary', 'Head cab light, saloon lights, console light', 'Lightbulb', '#FBBF24', 15),
('COUPL', 'Gangway & Coupler', 'Auxiliary', 'Coupling and uncoupling control', 'Link', '#A78BFA', 16);

-- ============================================================
-- 6. SEED DATA - SUBSYSTEMS
-- ============================================================

-- Trainlines Subsystems
WITH sys AS (SELECT id, code FROM systems WHERE code = 'TRL')
INSERT INTO subsystems(system_id, code, name, description, sort_order)
SELECT id, 'TRL_CTRL', 'Train Line Control', 'Control signals: RESET, SHUT DOWN, AUX ON', 1 FROM sys UNION ALL
SELECT id, 'TRL_SIG', 'Train Line Signal', 'Signal wires for ATP, SCS, modes', 2 FROM sys UNION ALL
SELECT id, 'TRL_LT', 'Low Tension Power', '110VDC trainline distribution', 3 FROM sys UNION ALL
SELECT id, 'TRL_HT', 'High Tension Power', '750VDC/415VAC trainline distribution', 4 FROM sys;

-- CAB Subsystems
WITH sys AS (SELECT id FROM systems WHERE code = 'CAB')
INSERT INTO subsystems(system_id, code, name, description, sort_order)
SELECT id, 'CAB_CTRL', 'Controlling Cab', 'HCR, TCR, KOR, LCAR logic', 1 FROM sys UNION ALL
SELECT id, 'CAB_START', 'Start-up Relay', 'Startup sequence, auxiliary on', 2 FROM sys UNION ALL
SELECT id, 'CAB_STATUS', 'System Status Indication', 'VVVF fault, HSCB trip, VAC fault', 3 FROM sys UNION ALL
SELECT id, 'CAB_MCB', 'MCB Trip Status', 'MCB monitoring and TCMS interface', 4 FROM sys;

-- BRAKE Subsystems
WITH sys AS (SELECT id FROM systems WHERE code = 'BRAKE')
INSERT INTO subsystems(system_id, code, name, description, sort_order)
SELECT id, 'BRAKE_COMP', 'Compressor Control', 'Compressor motor, ADU, pressure governor', 1 FROM sys UNION ALL
SELECT id, 'BRAKE_LOOP', 'Brake Loop', 'Normal and redundant brake loops', 2 FROM sys UNION ALL
SELECT id, 'BRAKE_EM', 'Emergency Brake', 'EBLR, EBPB, EBMV, EBVR, EBSS', 3 FROM sys UNION ALL
SELECT id, 'BRAKE_PARK', 'Parking Brake', 'PBR, PBMV, PBPS, applied/released logic', 4 FROM sys UNION ALL
SELECT id, 'BRAKE_HORN', 'Horn', 'Horn control circuit', 5 FROM sys UNION ALL
SELECT id, 'BRAKE_DMC', 'Brake Control DMC/MC', 'BCU architecture for DMC/MC', 6 FROM sys UNION ALL
SELECT id, 'BRAKE_TC', 'Brake Control TC', 'BECU architecture for TC', 7 FROM sys;

-- DOOR Subsystems
WITH sys AS (SELECT id FROM systems WHERE code = 'DOOR')
INSERT INTO subsystems(system_id, code, name, description, sort_order)
SELECT id, 'DOOR_SUPPLY', 'Door Supply Voltage', 'Door power supply, status meaning', 1 FROM sys UNION ALL
SELECT id, 'DOOR_L', 'Left Door Operation', 'Door open 6009, close 6014, proving 6073', 2 FROM sys UNION ALL
SELECT id, 'DOOR_R', 'Right Door Operation', 'Door open 6046, close 6051, proving 6076', 3 FROM sys UNION ALL
SELECT id, 'DOOR_PROVE', 'Door Proving Loop', 'Proving logic, TCMS feedback', 4 FROM sys UNION ALL
SELECT id, 'DOOR_INTER', 'Local Door Interlock', 'Local interlock, emergency release', 5 FROM sys UNION ALL
SELECT id, 'DOOR_TMS', 'Door TMS Communication', 'TCMS RIO interface', 6 FROM sys;

-- VAC Subsystems
WITH sys AS (SELECT id FROM systems WHERE code = 'VAC')
INSERT INTO subsystems(system_id, code, name, description, sort_order)
SELECT id, 'VAC_CAB', 'Cab VAC', 'Cab air conditioning, fault 7001', 1 FROM sys UNION ALL
SELECT id, 'VAC_SAL_PWR', 'Saloon VAC Power', 'VAC1 7050, VAC2 7060 power', 2 FROM sys UNION ALL
SELECT id, 'VAC_SAL_CTRL', 'Saloon VAC Control', 'Control logic, smoke 7070, damper 7071', 3 FROM sys;

-- TRAC Subsystems
WITH sys AS (SELECT id FROM systems WHERE code = 'TRAC')
INSERT INTO subsystems(system_id, code, name, description, sort_order)
SELECT id, 'TRAC_SPD', 'Speed Control', 'Forward, reverse, powering, braking commands', 1 FROM sys UNION ALL
SELECT id, 'TRAC_VVVF', 'VVVF Control', 'VVVF inverter interface, CN1/CN2', 2 FROM sys UNION ALL
SELECT id, 'TRAC_RET', 'Traction Return', 'Return current path, earth brush', 3 FROM sys;

-- APS Subsystems
WITH sys AS (SELECT id FROM systems WHERE code = 'APS')
INSERT INTO subsystems(system_id, code, name, description, sort_order)
SELECT id, 'APS_MAIN', 'APS - Auxiliary Power Supply', 'APS unit, SIV contacts 5030/5031', 1 FROM sys UNION ALL
SELECT id, 'APS_SHORE', 'Shore Supply', '415V shore supply, SSK box', 2 FROM sys UNION ALL
SELECT id, 'APS_BATT', 'Battery Control', 'Battery monitoring 5064', 3 FROM sys;

-- TMS Subsystems
WITH sys AS (SELECT id FROM systems WHERE code = 'TMS')
INSERT INTO subsystems(system_id, code, name, description, sort_order)
SELECT id, 'TMS_RIO', 'TCMS Remote IO', 'Remote IO modules and their PWA/PWB interfaces', 1 FROM sys UNION ALL
SELECT id, 'TMS_TB', 'TCMS Terminal Block', 'Terminal block mapping', 2 FROM sys UNION ALL
SELECT id, 'TMS_CN', 'TCMS Communication Node', 'Communication node and TRC/PWA interfaces', 3 FROM sys;

-- COMMS Subsystems
WITH sys AS (SELECT id FROM systems WHERE code = 'COMMS')
INSERT INTO subsystems(system_id, code, name, description, sort_order)
SELECT id, 'COMMS_PIS', 'PIS/TIS', 'Passenger information system', 1 FROM sys UNION ALL
SELECT id, 'COMMS_DVAS', 'DVAS/PA', 'Digital voice announcement, PA', 2 FROM sys UNION ALL
SELECT id, 'COMMS_PA_AMP', 'PA Amplifier', 'PA amplifier unit', 3 FROM sys UNION ALL
SELECT id, 'COMMS_CBTC', 'CBTC', 'Communication based train control', 4 FROM sys UNION ALL
SELECT id, 'COMMS_RADIO', 'Train Radio', 'Train radio interface', 5 FROM sys UNION ALL
SELECT id, 'COMMS_CCTV', 'CCTV', 'Closed circuit television', 6 FROM sys;

-- ============================================================
-- 7. SEED DATA - TRAINLINES (All Critical Wires)
-- ============================================================

INSERT INTO trainlines(trainline_no, name, description, voltage_domain, is_cross_connected, cross_connect_notes) VALUES
-- Control Trainlines
(1032, 'RESET', 'System reset trainline', '110VDC', false, NULL),
(1050, 'SHUT DOWN', 'System shutdown trainline', '110VDC', false, NULL),
(1040, 'AUX ON', 'Auxiliary power on command', '110VDC', false, NULL),
(1207, 'VVVF FAULT', 'VVVF inverter fault indication', '110VDC', false, NULL),
(1209, 'HSCB TRIP', 'High speed circuit breaker trip indication', '110VDC', false, NULL),
(1215, 'AUX FAULT', 'Auxiliary system fault indication', '110VDC', false, NULL),
(1217, 'VAC FAULT', 'VAC system fault indication', '110VDC', false, NULL),
(1219, 'PARKING BRAKE', 'Parking brake status', '110VDC', false, NULL),
(2043, 'SCS', 'Service continuity signal', '110VDC', false, NULL),
(1515, 'ATP', 'Automatic train protection', '110VDC', false, NULL),
-- Propulsion Trainlines
(3003, 'FORWARD', 'Forward propulsion command', '110VDC', false, NULL),
(3004, 'REVERSE', 'Reverse propulsion command', '110VDC', false, NULL),
(3005, 'POWERING 1', 'Powering command level 1', '110VDC', true, 'Crossed with 3006 at X1 pins 19/20'),
(3006, 'POWERING 2', 'Powering command level 2', '110VDC', true, 'Crossed with 3005 at X1 pins 19/20'),
(3010, 'BRAKING', 'Braking command', '110VDC', false, NULL),
(3011, 'FULL SERVICE BRAKE', 'Full service brake command', '110VDC', false, NULL),
(3013, 'RM', 'Restricted manual mode', '110VDC', false, NULL),
(3018, 'STANDBY', 'Standby mode', '110VDC', false, NULL),
(3019, 'WC', 'Wash coupling mode', '110VDC', false, NULL),
(3060, 'ATO', 'Automatic train operation', '110VDC', false, NULL),
-- Brake Trainlines
(4024, 'BRAKE LOOP', 'Brake loop normal', '110VDC', false, NULL),
(4028, 'BRAKE LOOP RETURN', 'Brake loop return', '110VDC', false, NULL),
(4062, 'EM BRAKE LOOP NORMAL', 'Emergency brake loop normal path', '110VDC', false, NULL),
(4070, 'EM BRAKE LOOP NORMAL RTN', 'Emergency brake loop normal return', '110VDC', false, NULL),
(4103, 'EM BRAKE LOOP REDUNDANT', 'Emergency brake loop redundant path', '110VDC', false, NULL),
(4110, 'EM BRAKE LOOP REDUNDANT RTN', 'Emergency brake loop redundant return', '110VDC', false, NULL),
(4122, 'PARKING BRAKE APPLIED', 'Parking brake applied indication', '110VDC', false, NULL),
(4123, 'HOLDING BRAKE', 'Holding brake command', '110VDC', false, NULL),
(4153, 'PARKING BRAKE RELEASED', 'Parking brake released indication', '110VDC', false, NULL),
(4155, 'PARKING BRAKE PRESSURE SW', 'Parking brake pressure switch signal', '110VDC', false, NULL),
(4600, 'ATO BRAKE CUT-OUT', 'ATO brake cut-out command', '110VDC', false, NULL),
-- Auxiliary Trainlines
(5000, 'SHORE SUPPLY CONTACT', 'Shore supply contactor status', '415VAC', false, NULL),
(5030, 'SIV CONTACT 1', 'Static inverter contact 1', '415VAC', false, NULL),
(5031, 'SIV CONTACT 2', 'Static inverter contact 2', '415VAC', false, NULL),
(5064, 'BATTERY UNDER-VOLTAGE', 'Battery under-voltage monitoring', '110VDC', false, NULL),
-- Door Trainlines
(6009, 'DOOR OPEN LEFT', 'Left side door open command', '110VDC', true, 'Crossed at jumper positions 43/44'),
(6014, 'DOOR CLOSE LEFT', 'Left side door close command', '110VDC', true, 'Crossed at jumper positions 46/47'),
(6034, 'DOOR CLOSE ANNOUNCEMENT', 'Door close announcement signal', '110VDC', false, NULL),
(6046, 'DOOR OPEN RIGHT', 'Right side door open command', '110VDC', true, 'Crossed at jumper positions 43/44'),
(6051, 'DOOR CLOSE RIGHT', 'Right side door close command', '110VDC', true, 'Crossed at jumper positions 46/47'),
(6073, 'DOOR PROVING LOOP 1', 'Door proving loop signal 1', '110VDC', false, NULL),
(6076, 'DOOR PROVING LOOP 2', 'Door proving loop signal 2', '110VDC', false, NULL),
(6112, 'ZERO SPEED', 'Zero speed signal', '110VDC', false, NULL),
-- VAC Trainlines
(7001, 'CAB VAC IN SSK', 'Cab VAC in SSK signal', '110VDC', false, NULL),
(7050, 'SALOON VAC 1 IN SSK', 'Saloon VAC 1 in SSK signal', '110VDC', false, NULL),
(7060, 'SALOON VAC 2 IN SSK', 'Saloon VAC 2 in SSK signal', '110VDC', false, NULL),
(7070, 'SMOKE DETECTION', 'Smoke detection alarm', '110VDC', false, NULL),
(7071, 'DAMPER OPERATION', 'Damper operation signal', '110VDC', false, NULL),
-- ATP/Mode Trainlines
(9214, 'ATP MODE', 'ATP mode active', '110VDC', false, NULL),
(9215, 'FWD MODE', 'Forward mode active', '110VDC', false, NULL),
(9216, 'REV MODE', 'Reverse mode active', '110VDC', false, NULL);

-- ============================================================
-- 8. SEED DATA - TRAINLINE CROSSINGS
-- ============================================================

INSERT INTO trainline_crossings(trainline_id, crossing_type, source_connector, source_pin, dest_connector, dest_pin, description)
SELECT id, 'jumper', 'X1', '19', 'X1', '20', 'Powering 1 and Powering 2 crossed at inter-car jumper X1 pins 19/20' FROM trainlines WHERE trainline_no = 3005;

INSERT INTO trainline_crossings(trainline_id, crossing_type, source_connector, source_pin, dest_connector, dest_pin, description)
SELECT id, 'jumper', 'Jumper Plug', '43/44', 'Jumper Plug', '46/47', 'Door open left/right and close left/right crossed at jumper positions' FROM trainlines WHERE trainline_no IN (6009, 6046);

-- ============================================================
-- 9. SEED DATA - EQUIPMENT
-- ============================================================

WITH p AS (SELECT id FROM projects WHERE code = 'KMRCL_RS3R'),
     sys AS (SELECT id, code FROM systems)
INSERT INTO equipment(project_id, system_id, equipment_code, equipment_name, equipment_type, manufacturer, location_hint, zone)
SELECT p.id, s.id, 'LTEB1', 'Low Tension Equipment Box 1', 'PANEL', NULL, 'Underframe', 'UNDERFRAME' FROM p JOIN sys s ON s.code = 'LTEB' UNION ALL
SELECT p.id, s.id, 'LTEB2', 'Low Tension Equipment Box 2', 'PANEL', NULL, 'Underframe', 'UNDERFRAME' FROM p JOIN sys s ON s.code = 'LTEB' UNION ALL
SELECT p.id, s.id, 'LTEB3', 'Low Tension Equipment Box 3', 'PANEL', NULL, 'Underframe', 'UNDERFRAME' FROM p JOIN sys s ON s.code = 'LTEB' UNION ALL
SELECT p.id, s.id, 'LTJB1', 'Low Tension Junction Box 1', 'JUNCTION_BOX', NULL, 'Underframe', 'UNDERFRAME' FROM p JOIN sys s ON s.code = 'LTJB' UNION ALL
SELECT p.id, s.id, 'LTJB2', 'Low Tension Junction Box 2', 'JUNCTION_BOX', NULL, 'Underframe', 'UNDERFRAME' FROM p JOIN sys s ON s.code = 'LTJB' UNION ALL
SELECT p.id, s.id, 'LTJB3', 'Low Tension Junction Box 3', 'JUNCTION_BOX', NULL, 'Underframe', 'UNDERFRAME' FROM p JOIN sys s ON s.code = 'LTJB' UNION ALL
SELECT p.id, s.id, 'VVVF1', 'VVVF Inverter 1', 'INVERTER', 'MELCO', 'Underframe', 'UNDERFRAME' FROM p JOIN sys s ON s.code = 'TRAC' UNION ALL
SELECT p.id, s.id, 'VVVF2', 'VVVF Inverter 2', 'INVERTER', 'MELCO', 'Underframe', 'UNDERFRAME' FROM p JOIN sys s ON s.code = 'TRAC' UNION ALL
SELECT p.id, s.id, 'BCU1', 'Brake Control Unit 1', 'CONTROL_UNIT', 'KNORR', 'Underframe', 'UNDERFRAME' FROM p JOIN sys s ON s.code = 'BRAKE' UNION ALL
SELECT p.id, s.id, 'BCU2', 'Brake Control Unit 2', 'CONTROL_UNIT', 'KNORR', 'Underframe', 'UNDERFRAME' FROM p JOIN sys s ON s.code = 'BRAKE' UNION ALL
SELECT p.id, s.id, 'BECU1', 'Brake Electronic Control Unit 1', 'CONTROL_UNIT', 'KNORR', 'Underframe', 'UNDERFRAME' FROM p JOIN sys s ON s.code = 'BRAKE' UNION ALL
SELECT p.id, s.id, 'APS1', 'Auxiliary Power Supply 1', 'POWER_UNIT', NULL, 'Underframe', 'UNDERFRAME' FROM p JOIN sys s ON s.code = 'APS' UNION ALL
SELECT p.id, s.id, 'SSB1', 'Shore Supply Box 1', 'POWER_UNIT', NULL, 'Underframe', 'UNDERFRAME' FROM p JOIN sys s ON s.code = 'APS' UNION ALL
SELECT p.id, s.id, 'BATT1', 'Battery Box 1', 'BATTERY', NULL, 'Underframe', 'UNDERFRAME' FROM p JOIN sys s ON s.code = 'APS' UNION ALL
SELECT p.id, s.id, 'TCMS_RIO1', 'TCMS Remote IO Unit 1', 'RIO', 'MELCO', 'Ceiling', 'CEILING' FROM p JOIN sys s ON s.code = 'TMS' UNION ALL
SELECT p.id, s.id, 'TCMS_RIO2', 'TCMS Remote IO Unit 2', 'RIO', 'MELCO', 'Ceiling', 'CEILING' FROM p JOIN sys s ON s.code = 'TMS' UNION ALL
SELECT p.id, s.id, 'DCU1', 'Door Control Unit 1', 'CONTROL_UNIT', NULL, 'Ceiling', 'CEILING' FROM p JOIN sys s ON s.code = 'DOOR' UNION ALL
SELECT p.id, s.id, 'DCU2', 'Door Control Unit 2', 'CONTROL_UNIT', NULL, 'Ceiling', 'CEILING' FROM p JOIN sys s ON s.code = 'DOOR' UNION ALL
SELECT p.id, s.id, 'VAC1', 'Saloon VAC Unit 1', 'HVAC_UNIT', NULL, 'Ceiling', 'CEILING' FROM p JOIN sys s ON s.code = 'VAC' UNION ALL
SELECT p.id, s.id, 'VAC2', 'Saloon VAC Unit 2', 'HVAC_UNIT', NULL, 'Ceiling', 'CEILING' FROM p JOIN sys s ON s.code = 'VAC' UNION ALL
SELECT p.id, s.id, 'CAB_VAC1', 'Cab VAC Unit 1', 'HVAC_UNIT', NULL, 'Cab', 'CAB' FROM p JOIN sys s ON s.code = 'VAC' UNION ALL
SELECT p.id, s.id, 'ETH_SW1', 'Ethernet Switch CCTV 1', 'NETWORK_SWITCH', NULL, 'Ceiling', 'CEILING' FROM p JOIN sys s ON s.code = 'COMMS' UNION ALL
SELECT p.id, s.id, 'AAU1', 'Audio Alarm Unit 1', 'AMPLIFIER', NULL, 'Ceiling', 'CEILING' FROM p JOIN sys s ON s.code = 'COMMS' UNION ALL
SELECT p.id, s.id, 'HSCB1', 'High Speed Circuit Breaker 1', 'BREAKER', NULL, 'Underframe', 'UNDERFRAME' FROM p JOIN sys s ON s.code = 'HV' UNION ALL
SELECT p.id, s.id, 'HSCB2', 'High Speed Circuit Breaker 2', 'BREAKER', NULL, 'Underframe', 'UNDERFRAME' FROM p JOIN sys s ON s.code = 'HV' UNION ALL
SELECT p.id, s.id, 'CSJB1', 'Collector Shoe Junction Box', 'JUNCTION_BOX', NULL, 'Underframe', 'UNDERFRAME' FROM p JOIN sys s ON s.code = 'HV' UNION ALL
SELECT p.id, s.id, 'HTEB1', 'High Tension Equipment Box 1', 'PANEL', NULL, 'Underframe', 'UNDERFRAME' FROM p JOIN sys s ON s.code = 'HV';

-- ============================================================
-- 10. SEED DATA - TAGS
-- ============================================================

INSERT INTO tags(name, tag_type) VALUES
('RIO', 'TCMS'), ('VVVF', 'Traction'), ('APS', 'Power'), ('BCU', 'Brake'),
('BECU', 'Brake'), ('EDB', 'Electrical'), ('LTJB', 'Electrical'), ('LTEB', 'Electrical'),
('HSCB', 'HV'), ('CCTV', 'Communications'), ('CBTC', 'Communications'),
('PIS', 'Communications'), ('PA', 'Communications'), ('TCMS', 'Control'),
('Door L', 'Door'), ('Door R', 'Door'), ('DMC', 'Car Type'), ('TC', 'Car Type'),
('MC', 'Car Type'), ('CAB', 'Car Type');

-- ============================================================
-- 11. FUNCTIONS
-- ============================================================

-- Wire Number Decoder
CREATE OR REPLACE FUNCTION decode_wire_number(wire_no TEXT)
RETURNS TABLE(
    unit_code TEXT,
    car_type_code TEXT,
    trainline_code TEXT,
    serial_code TEXT,
    full_decoding TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        SUBSTRING(wire_no, 1, 1)::TEXT AS unit_code,
        SUBSTRING(wire_no, 2, 1)::TEXT AS car_type_code,
        SUBSTRING(wire_no, 3, 2)::TEXT AS trainline_code,
        SUBSTRING(wire_no, 5, 1)::TEXT AS serial_code,
        FORMAT('Unit: %s, Car Type: %s, Trainline: %s, Serial: %s',
            SUBSTRING(wire_no, 1, 1),
            SUBSTRING(wire_no, 2, 1),
            SUBSTRING(wire_no, 3, 2),
            SUBSTRING(wire_no, 5, 1))::TEXT AS full_decoding;
END;
$$ LANGUAGE plpgsql;

-- Search Across All Entities
CREATE OR REPLACE FUNCTION global_search(search_term TEXT)
RETURNS TABLE(
    result_type TEXT,
    id UUID,
    code TEXT,
    name TEXT,
    description TEXT,
    system_code TEXT,
    car_type TEXT,
    drawing_no TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Search Drawings
    SELECT 
        'drawing'::TEXT, d.id, d.drawing_no::TEXT, d.title::TEXT, d.notes::TEXT,
        s.code::TEXT, ct.code::TEXT, d.drawing_no::TEXT
    FROM drawings d
    JOIN systems s ON s.id = d.system_id
    LEFT JOIN car_types ct ON ct.id = d.car_type_id
    WHERE d.drawing_no ILIKE '%' || search_term || '%'
       OR d.title ILIKE '%' || search_term || '%';

    RETURN QUERY
    -- Search Trainlines
    SELECT 
        'trainline'::TEXT, t.id, t.trainline_no::TEXT, t.name::TEXT, t.description::TEXT,
        COALESCE(s.code, '')::TEXT, ''::TEXT, ''::TEXT
    FROM trainlines t
    LEFT JOIN systems s ON s.id = t.system_id
    WHERE t.trainline_no::TEXT ILIKE '%' || search_term || '%'
       OR t.name ILIKE '%' || search_term || '%';

    RETURN QUERY
    -- Search Equipment
    SELECT 
        'equipment'::TEXT, e.id, e.equipment_code::TEXT, e.equipment_name::TEXT, e.description::TEXT,
        s.code::TEXT, ct.code::TEXT, ''::TEXT
    FROM equipment e
    JOIN systems s ON s.id = e.system_id
    LEFT JOIN car_types ct ON ct.id = e.car_type_id
    WHERE e.equipment_code ILIKE '%' || search_term || '%'
       OR e.equipment_name ILIKE '%' || search_term || '%';

    RETURN QUERY
    -- Search Wires
    SELECT 
        'wire'::TEXT, w.id, w.wire_no::TEXT, w.description::TEXT, w.description::TEXT,
        ''::TEXT, ''::TEXT, ''::TEXT
    FROM wires w
    WHERE w.wire_no ILIKE '%' || search_term || '%';

    RETURN QUERY
    -- Search TCMS Points
    SELECT 
        'tcms'::TEXT, tp.id, tp.point_code::TEXT, tp.signal_name::TEXT, tp.description::TEXT,
        COALESCE(s.code, '')::TEXT, ''::TEXT, ''::TEXT
    FROM tcms_points tp
    LEFT JOIN systems s ON s.id = tp.system_id
    WHERE tp.point_code ILIKE '%' || search_term || '%'
       OR tp.signal_name ILIKE '%' || search_term || '%';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 12. VIEWS
-- ============================================================

-- System Overview with Counts
CREATE OR REPLACE VIEW v_system_overview AS
SELECT 
    s.id, s.code, s.name, s.category, s.description, s.icon_name, s.color_hex, s.sort_order,
    COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'active') AS active_drawings,
    COUNT(DISTINCT e.id) AS equipment_count,
    COUNT(DISTINCT sub.id) AS subsystem_count
FROM systems s
LEFT JOIN subsystems sub ON sub.system_id = s.id
LEFT JOIN drawings d ON d.system_id = s.id
LEFT JOIN equipment e ON e.system_id = s.id
GROUP BY s.id, s.code, s.name, s.category, s.description, s.icon_name, s.color_hex, s.sort_order
ORDER BY s.sort_order;

-- Wire Full Details View
CREATE OR REPLACE VIEW v_wire_full_details AS
SELECT 
    w.wire_no,
    w.description,
    w.wire_type,
    w.voltage_class,
    t.trainline_no,
    t.name AS trainline_name,
    t.is_cross_connected,
    s.code AS system_code,
    sub.name AS subsystem_name,
    wc.connector_code,
    wc.pin_no,
    wc.endpoint_name,
    wc.from_ref,
    wc.to_ref
FROM wires w
LEFT JOIN trainlines t ON t.trainline_no = w.wire_no::INTEGER
LEFT JOIN systems s ON s.id = t.system_id
LEFT JOIN subsystems sub ON sub.id = t.system_id
LEFT JOIN wire_connections wc ON wc.wire_no = w.wire_no
ORDER BY w.wire_no::INTEGER;

-- Drawing Catalog with System Hierarchy
CREATE OR REPLACE VIEW v_drawing_catalog AS
SELECT 
    d.drawing_no,
    d.title,
    d.drawing_type,
    d.current_revision,
    d.zone,
    d.status,
    s.code AS system_code,
    s.name AS system_name,
    sub.code AS subsystem_code,
    sub.name AS subsystem_name,
    ct.code AS car_type_code,
    ct.name AS car_type_name,
    d.notes,
    d.drawing_date,
    d.drwn_by,
    d.chkd_by
FROM drawings d
JOIN systems s ON s.id = d.system_id
LEFT JOIN subsystems sub ON sub.id = d.subsystem_id
LEFT JOIN car_types ct ON ct.id = d.car_type_id
ORDER BY s.sort_order, d.drawing_no;

-- Equipment with Connectors
CREATE OR REPLACE VIEW v_equipment_connectors AS
SELECT 
    e.equipment_code,
    e.equipment_name,
    e.equipment_type,
    e.location_hint,
    e.zone,
    s.code AS system_code,
    sub.name AS subsystem_name,
    ct.code AS car_type_code,
    c.connector_code,
    c.connector_type,
    c.pin_count,
    COUNT(p.id) AS pin_count_actual
FROM equipment e
JOIN systems s ON s.id = e.system_id
LEFT JOIN subsystems sub ON sub.id = e.subsystem_id
LEFT JOIN car_types ct ON ct.id = e.car_type_id
LEFT JOIN connectors c ON c.equipment_id = e.id
LEFT JOIN pins p ON p.connector_id = c.id
GROUP BY e.equipment_code, e.equipment_name, e.equipment_type, e.location_hint, e.zone,
         s.code, sub.name, ct.code, c.connector_code, c.connector_type, c.pin_count
ORDER BY e.equipment_code, c.connector_code;

-- Car Formation View
CREATE OR REPLACE VIEW v_car_formation AS
SELECT 
    ct.position_in_formation,
    ct.code AS car_type_code,
    ct.name AS car_type_name,
    ct.is_driving,
    ct.has_motor,
    ct.has_panto,
    COUNT(DISTINCT e.id) AS equipment_count,
    COUNT(DISTINCT c.id) AS connector_count
FROM car_types ct
LEFT JOIN equipment e ON e.car_type_id = ct.id
LEFT JOIN connectors c ON c.equipment_id = e.id
GROUP BY ct.position_in_formation, ct.code, ct.name, ct.is_driving, ct.has_motor, ct.has_panto
ORDER BY ct.position_in_formation;

COMMIT;