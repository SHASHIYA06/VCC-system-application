-- ============================================================
-- KMRCL VCC Intelligent Wiring Explorer - Complete Schema
-- Migration 001: Schema, RLS, Seed Data
-- ============================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- 2. ENUMS
create type public.app_role as enum ('admin', 'engineer', 'viewer');
create type public.drawing_status as enum ('active', 'superseded', 'obsolete', 'draft');
create type public.ocr_quality as enum ('raw', 'reviewed', 'verified', 'failed');

-- 3. CORE TABLES

-- 3.1 User Profiles
create table public.user_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique,
  full_name text,
  role public.app_role not null default 'viewer',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3.2 Projects
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  name text not null,
  customer_name text,
  rolling_stock_type text,
  created_at timestamptz not null default now()
);

-- 3.3 Car Types
create table public.car_types (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  code text not null,
  name text not null,
  position_in_formation smallint,
  unique(project_id, code)
);

-- 3.4 Systems
create table public.systems (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  name text not null,
  category text,
  description text,
  icon_name text,
  sort_order smallint,
  created_at timestamptz not null default now()
);

-- 3.5 Source Documents
create table public.source_documents (
  id uuid primary key default uuid_generate_v4(),
  file_artifact_id text not null unique,
  filename text not null,
  document_group text,
  page_count integer,
  ocr_status text default 'parsed',
  file_size_bytes bigint,
  checksum text,
  created_at timestamptz not null default now()
);

-- 3.6 Drawings (Master Register)
create table public.drawings (
  id uuid primary key default uuid_generate_v4(),
  source_document_id uuid references public.source_documents(id) on delete set null,
  project_id uuid not null references public.projects(id) on delete restrict,
  car_type_id uuid not null references public.car_types(id) on delete restrict,
  system_id uuid not null references public.systems(id) on delete restrict,
  drawing_no text not null,
  title text not null,
  drawing_type text default 'PIN_ASSIGNMENT',
  sheet_count integer,
  current_alt text,
  current_revision text,
  drawing_date date,
  drwn_by text,
  chkd_by text,
  revd_by text,
  appd_by text,
  status public.drawing_status not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(drawing_no)
);

-- 3.7 Drawing Revisions
create table public.drawing_revisions (
  id uuid primary key default uuid_generate_v4(),
  drawing_id uuid not null references public.drawings(id) on delete cascade,
  alt_no text,
  revision_code text,
  ecn_no text,
  change_summary text,
  revision_date date,
  drwn_by text,
  chkd_by text,
  appd_by text,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3.8 Drawing Pages
create table public.drawing_pages (
  id uuid primary key default uuid_generate_v4(),
  drawing_id uuid not null references public.drawings(id) on delete cascade,
  page_no integer not null,
  page_label text,
  section_name text,
  raw_ocr text,
  ocr_quality public.ocr_quality default 'raw',
  unique(drawing_id, page_no)
);

-- 3.9 Equipment / Modules
create table public.equipment (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  car_type_id uuid references public.car_types(id) on delete set null,
  system_id uuid references public.systems(id) on delete set null,
  equipment_code text not null,
  equipment_name text not null,
  equipment_type text,
  manufacturer text,
  part_number text,
  location_hint text,
  unique(project_id, equipment_code)
);

-- 3.10 Connectors
create table public.connectors (
  id uuid primary key default uuid_generate_v4(),
  drawing_id uuid not null references public.drawings(id) on delete cascade,
  page_id uuid references public.drawing_pages(id) on delete set null,
  equipment_id uuid references public.equipment(id) on delete set null,
  connector_code text not null,
  connector_type text,
  connector_variant text,
  gender text,
  pin_count integer,
  view_name text,
  remarks text,
  unique(drawing_id, connector_code, coalesce(page_id::text, ''))
);

-- 3.11 Wires
create table public.wires (
  id uuid primary key default uuid_generate_v4(),
  wire_no text not null unique,
  wire_type text,
  wire_size text,
  wire_color text,
  shielded boolean default false,
  voltage_class text,
  description text,
  remarks text
);

-- 3.12 Pins
create table public.pins (
  id uuid primary key default uuid_generate_v4(),
  connector_id uuid not null references public.connectors(id) on delete cascade,
  pin_no text not null,
  sequence_no integer,
  wire_id uuid references public.wires(id) on delete set null,
  wire_no_raw text,
  signal_name text,
  wire_type_raw text,
  cable_spec text,
  from_ref text,
  to_ref text,
  remark text,
  unique(connector_id, pin_no, coalesce(sequence_no::text, '0'))
);

-- 3.13 Pin Links (cross-reference engine)
create table public.pin_links (
  id uuid primary key default uuid_generate_v4(),
  source_pin_id uuid not null references public.pins(id) on delete cascade,
  target_equipment_code text,
  target_connector_code text,
  target_pin_no text,
  target_ref text,
  confidence numeric(5,2),
  created_at timestamptz not null default now()
);

-- 3.14 Trainlines
create table public.trainlines (
  id uuid primary key default uuid_generate_v4(),
  trainline_no integer not null unique,
  name text not null,
  description text,
  system_id uuid references public.systems(id) on delete set null,
  voltage_domain text,
  is_cross_connected boolean default false,
  cross_connect_notes text,
  created_at timestamptz not null default now()
);

-- 3.15 Trainline Jumper Crossings
create table public.trainline_crossings (
  id uuid primary key default uuid_generate_v4(),
  trainline_id uuid not null references public.trainlines(id) on delete cascade,
  crossing_type text not null, -- 'jumper', 'pin_cross', 'internal_wire'
  source_connector text,
  source_pin text,
  dest_connector text,
  dest_pin text,
  description text,
  drawing_id uuid references public.drawings(id) on delete set null
);

-- 3.16 TCMS / RIO Points
create table public.tcms_points (
  id uuid primary key default uuid_generate_v4(),
  point_code text not null unique,
  rio_unit text,
  connector_code text,
  pin_no text,
  signal_type text, -- 'DI', 'DO', 'AI', 'AO'
  signal_name text,
  description text,
  system_id uuid references public.systems(id) on delete set null,
  drawing_id uuid references public.drawings(id) on delete set null
);

-- 3.17 Tags
create table public.tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  tag_type text
);

-- 3.18 Drawing-Tag Link
create table public.drawing_tags (
  drawing_id uuid not null references public.drawings(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (drawing_id, tag_id)
);

-- 3.19 Import Tracking
create table public.import_runs (
  id uuid primary key default uuid_generate_v4(),
  source_document_id uuid references public.source_documents(id) on delete set null,
  run_type text not null,
  status text not null default 'pending',
  rows_parsed integer,
  rows_imported integer,
  rows_failed integer,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table public.import_errors (
  id uuid primary key default uuid_generate_v4(),
  import_run_id uuid not null references public.import_runs(id) on delete cascade,
  table_name text not null,
  row_ref text,
  error_message text not null,
  created_at timestamptz not null default now()
);

-- 3.20 Audit Log
create table public.audit_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  action text not null,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

-- 4. SEED DATA

-- 4.1 Project
insert into public.projects(code, name, customer_name, rolling_stock_type) values
('KMRCL_RS3R', 'KMRCL RS3R Metro Rolling Stock', 'Bangalore Metro Rail Corporation Ltd', 'RS3R - 6 Car Formation (DMC-TC-MC-MC-TC-DMC)');

-- 4.2 Car Types
with p as (select id from public.projects where code = 'KMRCL_RS3R')
insert into public.car_types(project_id, code, name, position_in_formation)
select p.id, 'DMC', 'Driving Motor Car', 1 from p union all
select p.id, 'TC', 'Trailer Car', 2 from p union all
select p.id, 'MC', 'Motor Car', 3 from p union all
select p.id, 'MC2', 'Motor Car (Position 4)', 4 from p union all
select p.id, 'TC2', 'Trailer Car (Position 5)', 5 from p union all
select p.id, 'DMC2', 'Driving Motor Car (Position 6)', 6 from p union all
select p.id, 'CAB', 'Cab / Driver Desk', null from p;

-- 4.3 Systems
insert into public.systems(code, name, category, description, sort_order) values
('GEN', 'General & Conventions', 'Foundation', 'Drawing list, classification, wiring numbers, symbols', 1),
('TRL', 'Trainlines', 'Core Systems', 'Train line control, signal, low/high tension power', 2),
('CAB', 'Cab Control & Status', 'Core Systems', 'Controlling cab, startup, status indication, MCB trip', 3),
('TRAC', 'Traction & Propulsion', 'Propulsion', 'Speed control, VVVF control, traction return current', 4),
('BRAKE', 'Brake System', 'Core Systems', 'Compressor, brake loop, emergency brake, parking brake, horn', 5),
('APS', 'Auxiliary Power Supply', 'Power', 'APS, shore supply, battery control', 6),
('DOOR', 'Door System', 'Core Systems', 'Door supply, left/right operation, proving loop, interlock', 7),
('VAC', 'VAC / HVAC', 'Core Systems', 'Cab VAC, saloon VAC power and control', 8),
('TMS', 'Train Management System', 'Control', 'TMS interface, TCMS remote I/O, communication nodes', 9),
('COMMS', 'Communication Systems', 'Core Systems', 'PIS/TIS, DVAS/PA, CBTC, train radio, CCTV', 10),
('LIGHT', 'Lighting', 'Auxiliary', 'Head cab light, saloon lights, console light', 11),
('COUPL', 'Gangway & Coupler', 'Auxiliary', 'Coupling and uncoupling control', 12),
('LTEB', 'Low Tension Equipment Box', 'Electrical Distribution', 'LTEB pin assignments and wiring', 13),
('LTJB', 'Low Tension Junction Box', 'Electrical Distribution', 'LTJB pin assignments and wiring', 14),
('EDB', 'Electrical Distribution Box', 'Electrical Distribution', 'EDB panel assignments', 15),
('HV', 'High Voltage Equipment', 'Power', 'Collector shoe, HSCB, main switch box, HTEB', 16);

-- 4.4 Trainlines (High Priority)
insert into public.trainlines(trainline_no, name, description, voltage_domain, is_cross_connected) values
(1032, 'RESET', 'System reset trainline', '110VDC', false),
(1050, 'SHUT DOWN', 'System shutdown trainline', '110VDC', false),
(1040, 'AUX ON', 'Auxiliary power on command', '110VDC', false),
(1207, 'VVVF FAULT', 'VVVF inverter fault indication', '110VDC', false),
(1209, 'HSCB TRIP', 'High speed circuit breaker trip indication', '110VDC', false),
(1215, 'AUX FAULT', 'Auxiliary system fault indication', '110VDC', false),
(1217, 'VAC FAULT', 'VAC system fault indication', '110VDC', false),
(1219, 'PARKING BRAKE', 'Parking brake status', '110VDC', false),
(2043, 'SCS', 'Service continuity signal', '110VDC', false),
(1515, 'ATP', 'Automatic train protection', '110VDC', false),
(3003, 'FORWARD', 'Forward propulsion command', '110VDC', false),
(3004, 'REVERSE', 'Reverse propulsion command', '110VDC', false),
(3005, 'POWERING 1', 'Powering command level 1', '110VDC', true),
(3006, 'POWERING 2', 'Powering command level 2', '110VDC', true),
(3010, 'BRAKING', 'Braking command', '110VDC', false),
(3011, 'FULL SERVICE BRAKE', 'Full service brake command', '110VDC', false),
(3013, 'RM', 'Restricted manual mode', '110VDC', false),
(3018, 'STANDBY', 'Standby mode', '110VDC', false),
(3019, 'WC', 'Wash coupling mode', '110VDC', false),
(3060, 'ATO', 'Automatic train operation', '110VDC', false),
(4024, 'BRAKE LOOP', 'Brake loop normal', '110VDC', false),
(4028, 'BRAKE LOOP RETURN', 'Brake loop return', '110VDC', false),
(4062, 'EM BRAKE LOOP NORMAL', 'Emergency brake loop normal path', '110VDC', false),
(4070, 'EM BRAKE LOOP NORMAL RTN', 'Emergency brake loop normal return', '110VDC', false),
(4103, 'EM BRAKE LOOP REDUNDANT', 'Emergency brake loop redundant path', '110VDC', false),
(4110, 'EM BRAKE LOOP REDUNDANT RTN', 'Emergency brake loop redundant return', '110VDC', false),
(4122, 'PARKING BRAKE APPLIED', 'Parking brake applied indication', '110VDC', false),
(4123, 'HOLDING BRAKE', 'Holding brake command', '110VDC', false),
(4153, 'PARKING BRAKE RELEASED', 'Parking brake released indication', '110VDC', false),
(4155, 'PARKING BRAKE PRESSURE SW', 'Parking brake pressure switch signal', '110VDC', false),
(4600, 'ATO BRAKE CUT-OUT', 'ATO brake cut-out command', '110VDC', false),
(5000, 'SHORE SUPPLY CONTACT', 'Shore supply contactor status', '415VAC', false),
(5030, 'SIV CONTACT 1', 'Static inverter contact 1', '415VAC', false),
(5031, 'SIV CONTACT 2', 'Static inverter contact 2', '415VAC', false),
(5064, 'BATTERY UNDER-VOLTAGE', 'Battery under-voltage monitoring', '110VDC', false),
(6009, 'DOOR OPEN LEFT', 'Left side door open command', '110VDC', false),
(6014, 'DOOR CLOSE LEFT', 'Left side door close command', '110VDC', false),
(6034, 'DOOR CLOSE ANNOUNCEMENT', 'Door close announcement signal', '110VDC', false),
(6046, 'DOOR OPEN RIGHT', 'Right side door open command', '110VDC', false),
(6051, 'DOOR CLOSE RIGHT', 'Right side door close command', '110VDC', false),
(6073, 'DOOR PROVING LOOP 1', 'Door proving loop signal 1', '110VDC', false),
(6076, 'DOOR PROVING LOOP 2', 'Door proving loop signal 2', '110VDC', false),
(6112, 'ZERO SPEED', 'Zero speed signal', '110VDC', false),
(7001, 'CAB VAC IN SSK', 'Cab VAC in SSK signal', '110VDC', false),
(7050, 'SALOON VAC 1 IN SSK', 'Saloon VAC 1 in SSK signal', '110VDC', false),
(7060, 'SALOON VAC 2 IN SSK', 'Saloon VAC 2 in SSK signal', '110VDC', false),
(7070, 'SMOKE DETECTION', 'Smoke detection alarm', '110VDC', false),
(7071, 'DAMPER OPERATION', 'Damper operation signal', '110VDC', false),
(9214, 'ATP MODE', 'ATP mode active', '110VDC', false),
(9215, 'FWD MODE', 'Forward mode active', '110VDC', false),
(9216, 'REV MODE', 'Reverse mode active', '110VDC', false);

-- 4.5 Trainline Crossings
insert into public.trainline_crossings(trainline_id, crossing_type, source_connector, source_pin, dest_connector, dest_pin, description)
select id, 'jumper', 'X1', '19', 'X1', '20', 'Powering 1 and Powering 2 crossed at inter-car jumper X1 pins 19/20'
from public.trainlines where trainline_no in (3005, 3006);

insert into public.trainline_crossings(trainline_id, crossing_type, source_connector, source_pin, dest_connector, dest_pin, description)
select id, 'jumper', 'Jumper Plug', '43/44', 'Jumper Plug', '46/47', 'Door open left/right and close left/right crossed at jumper positions'
from public.trainlines where trainline_no in (6009, 6046, 6014, 6051);

-- 4.6 Tags
insert into public.tags(name, tag_type) values
('RIO', 'TCMS'), ('VVVF', 'Traction'), ('APS', 'Power'), ('BCU', 'Brake'),
('BECU', 'Brake'), ('EDB', 'Electrical'), ('LTJB', 'Electrical'), ('LTEB', 'Electrical'),
('HSCB', 'HV'), ('CCTV', 'Communications'), ('CBTC', 'Communications'),
('PIS', 'Communications'), ('PA', 'Communications'), ('TCMS', 'Control'),
('Door L', 'Door'), ('Door R', 'Door'), ('DMC', 'Car Type'), ('TC', 'Car Type'),
('MC', 'Car Type'), ('CAB', 'Car Type');
