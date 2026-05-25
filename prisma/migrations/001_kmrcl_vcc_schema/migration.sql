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
  user_id uuid not null references auth.users(id) on delete cascade unique,
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
  unique(drawing_id, connector_code, page_id)
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
  unique(connector_id, pin_no, sequence_no)
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
  crossing_type text not null,
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
  signal_type text,
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
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 4. SEED DATA
-- ============================================================

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

-- 4.4 Trainlines (All 50 High Priority)
insert into public.trainlines(trainline_no, name, description, voltage_domain, is_cross_connected) values
(1032, 'RESET', 'System reset trainline', '110VDC', false),
(1040, 'AUX ON', 'Auxiliary power on command', '110VDC', false),
(1050, 'SHUT DOWN', 'System shutdown trainline', '110VDC', false),
(1205, 'LINE VOLTAGE', '750V DC line voltage', '750VDC', false),
(1207, 'VVVF FAULT', 'VVVF inverter fault indication', '110VDC', false),
(1209, 'HSCB TRIP', 'High speed circuit breaker trip indication', '110VDC', false),
(1215, 'AUX FAULT', 'Auxiliary system fault indication', '110VDC', false),
(1217, 'VAC FAULT', 'VAC system fault indication', '110VDC', false),
(1219, 'PARKING BRAKE', 'Parking brake status', '110VDC', false),
(1515, 'ATP', 'Automatic train protection', '110VDC', false),
(2043, 'SCS', 'Service continuity signal', '110VDC', false),
(3003, 'FORWARD', 'Forward propulsion command', '110VDC', false),
(3004, 'REVERSE', 'Reverse propulsion command', '110VDC', false),
(3005, 'POWERING 1', 'Powering command level 1', '110VDC', true),
(3006, 'POWERING 2', 'Powering command level 2', '110VDC', true),
(3010, 'BRAKING', 'Braking command', '110VDC', false),
(3011, 'FULL SERVICE BRAKE', 'Full service brake command', '110VDC', false),
(3013, 'RM', 'Restricted manual mode', '110VDC', false),
(3018, 'STANDBY', 'Standby mode', '110VDC', false),
(3019, 'WC', 'Wash coupling mode', '110VDC', false),
(3020, 'PROPULSION ENABLE A', 'Propulsion enable A', '110VDC', false),
(3026, 'SPEED ZERO', 'Speed zero signal', '110VDC', false),
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

-- 4.7 Source Documents
insert into public.source_documents(file_artifact_id, filename, document_group, page_count, ocr_status) values
('file:1', '942-58099_942-58106_VCC_General.pdf', 'VCC General', 8, 'parsed'),
('file:2', '942-58107_942-58111_VCC_Cab.pdf', 'VCC Cab Control', 5, 'parsed'),
('file:3', '942-58119_942-58121_VCC_Traction.pdf', 'VCC Traction', 3, 'parsed'),
('file:4', '942-58123_942-58129_VCC_Brake.pdf', 'VCC Brake', 7, 'parsed'),
('file:5', '942-58130_942-58132_VCC_AuxPower.pdf', 'VCC Auxiliary Power', 3, 'parsed'),
('file:6', '942-58137_942-58142_VCC_Doors.pdf', 'VCC Door System', 6, 'parsed'),
('file:7', '942-58143_942-58145_VCC_VAC.pdf', 'VCC HVAC', 3, 'parsed'),
('file:8', '942-58146_942-58154_VCC_TMS_Comm.pdf', 'VCC TMS & Communications', 9, 'parsed'),
('file:9', '942-38305_942-38323_DMC_Underframe.pdf', 'DMC Underframe Pin Assignments', 19, 'parsed'),
('file:10', '942-38505_942-38521_TC_Underframe.pdf', 'TC Underframe Pin Assignments', 17, 'parsed'),
('file:11', '942-38402_942-38413_TC_Ceiling.pdf', 'TC Ceiling Pin Assignments', 12, 'parsed'),
('file:12', '942-38602_942-38614_MC_Ceiling.pdf', 'MC Ceiling Pin Assignments', 13, 'parsed'),
('file:13', '942-38104_942-38117_CAB_Panels.pdf', 'Cab Panel Pin Assignments', 3, 'parsed'),
('file:14', '942-38705_942-38711_MC_Underframe.pdf', 'MC Underframe Pin Assignments', 7, 'parsed');

-- 4.8 Drawings (Master Register)
with 
p as (select id, code from public.projects where code = 'KMRCL_RS3R'),
ct as (select id, code from public.car_types),
sys as (select id, code from public.systems)
insert into public.drawings(project_id, car_type_id, system_id, drawing_no, title, drawing_type, sheet_count, current_alt, current_revision, drawing_date, drwn_by, chkd_by, revd_by, appd_by, status, notes)
select 
  p.id, ct.id, sys.id, d.drawing_no, d.title, d.drawing_type, d.sheet_count, d.current_alt, d.current_revision, d.drawing_date, d.drwn_by, d.chkd_by, d.revd_by, d.appd_by, d.status, d.notes
from (
  values
  ('942-58099', 'Drawing List - KMRCL RS3R VCC', 'DMC', 'GEN', 'DRAWING_LIST', 1, null, null, null, null, null, null, null, null, 'active', 'Master drawing index'),
  ('942-58100', 'Classification', 'DMC', 'GEN', 'CLASSIFICATION', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58101', 'Wiring Numbers and Description', 'DMC', 'GEN', 'WIRING_NUMBER_DEF', 1, null, null, null, null, null, null, null, null, 'active', 'Wire number grammar definition'),
  ('942-58102', 'Symbols', 'DMC', 'GEN', 'SYMBOL_LIBRARY', 1, null, null, null, null, null, null, null, null, 'active', 'IEC-style symbol library'),
  ('942-58103', 'Train Lines Control', 'DMC', 'TRL', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', 'Trainline control signals'),
  ('942-58104', 'Train Lines Signal', 'DMC', 'TRL', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', 'Trainline signal wires'),
  ('942-58105', 'Low Tension Power Train Line', 'DMC', 'TRL', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', '110VDC trainline'),
  ('942-58106', 'High Tension Power Train Line', 'DMC', 'TRL', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', '750VDC/415VAC trainline'),
  ('942-58107', 'Controlling Cab', 'DMC', 'CAB', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58108', 'Start-up Relay', 'DMC', 'CAB', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58109', 'System Status Indication', 'DMC', 'CAB', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58110', 'MCB Trip Status', 'DMC', 'CAB', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58111', 'DC Train Line Supply Contactor', 'DMC', 'CAB', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58119', 'Speed Control', 'DMC', 'TRAC', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', 'Traction speed command logic'),
  ('942-58120', 'VVVF Control', 'DMC', 'TRAC', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', 'VVVF inverter interface'),
  ('942-58121', 'Traction Return Current', 'DMC', 'TRAC', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58123', 'Compressor Control', 'DMC', 'BRAKE', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58124', 'Brake Loop', 'DMC', 'BRAKE', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58125', 'Emergency Brake', 'DMC', 'BRAKE', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58126', 'Parking Brake', 'DMC', 'BRAKE', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58127', 'Horn', 'DMC', 'BRAKE', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58128', 'Brake Control - DMC/MC', 'DMC', 'BRAKE', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58129', 'Brake Control - TC', 'TC', 'BRAKE', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58130', 'APS - Auxiliary Power Supply', 'TC', 'APS', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58131', 'AC 415V Shore Supply', 'TC', 'APS', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58132', 'Battery Control', 'TC', 'APS', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58137', 'Saloon Door Supply Voltage', 'MC', 'DOOR', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58138', 'Left Door Operation', 'MC', 'DOOR', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58139', 'Right Door Operation', 'MC', 'DOOR', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58140', 'Door Proving Loop', 'MC', 'DOOR', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58141', 'Local Door Interlock', 'MC', 'DOOR', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58142', 'Door Communication with TMS', 'MC', 'DOOR', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58143', 'Cab VAC - Air Conditioning', 'CAB', 'VAC', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58144', 'Saloon VAC Power', 'MC', 'VAC', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58145', 'Saloon VAC Control', 'MC', 'VAC', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58146', 'TMS Interface 1 to 4', 'MC', 'TMS', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58147', 'PIS/TIS - Passenger Information System', 'MC', 'COMMS', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58148', 'PIS/TIS - Sheet 2', 'MC', 'COMMS', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58149', 'DVAS/PA - Digital Voice Announcement', 'MC', 'COMMS', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58150', 'PA Amplifier', 'MC', 'COMMS', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58152', 'CBTC - Communication Based Train Control', 'MC', 'COMMS', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58153', 'Train Radio Interface', 'MC', 'COMMS', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-58154', 'CCTV - Closed Circuit Television', 'MC', 'COMMS', 'SCHEMATIC', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38104', 'Operating Panel Pin Assignment', 'CAB', 'CAB', 'PIN_ASSIGNMENT', 2, '0', '0', '2018-02-16', 'SUSHILA PATIL', 'SARANYA V', 'SADHASIVAM M', 'KC SHASHIKANTH', 'active', 'Cab desk TB wire mappings'),
  ('942-38105', 'MCB Panel Pin Assignment', 'CAB', 'CAB', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38117', 'Cab VAC Pin Assignment', 'CAB', 'VAC', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38305', 'LTEB Pin Assignment - DMC', 'DMC', 'LTEB', 'PIN_ASSIGNMENT', 2, '0', '0', '2018-02-21', 'SUSHILA PATIL', 'SARANYA V', 'SADHASIVAM M', 'KC SHASHIKANTH', 'active', ''),
  ('942-38306', 'VVVF Inverter Pin Assignment - DMC', 'DMC', 'TRAC', 'PIN_ASSIGNMENT', 2, '3', '3', '2018-03-08', 'V SARANYA', 'V SARANYA', null, 'KCS', 'active', ''),
  ('942-38307', 'Collector Shoe Junction Box - DMC', 'DMC', 'HV', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38308', 'Stinger Box Pin Assignment - DMC', 'DMC', 'HV', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38309', 'Pressure Switch Box - DMC', 'DMC', 'BRAKE', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38310', 'BCU Pin Assignment - DM Car', 'DMC', 'BRAKE', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38312', 'LTJB Pin Assignment - DM Car', 'DMC', 'LTJB', 'PIN_ASSIGNMENT', 3, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38319', 'HSCB Pin Assignment - DMC', 'DMC', 'HV', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38320', 'TM Connector Pin Assignment - DMC', 'DMC', 'TRAC', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38402', 'EDB Panel Pin Assignment - TC', 'TC', 'EDB', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38403', 'Passenger Door Pin Assignment - TC', 'TC', 'DOOR', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38404', 'Saloon Lights Pin Assignment - TC', 'TC', 'LIGHT', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38405', 'AAU Passenger Alarm - TC', 'TC', 'COMMS', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38406', 'Ethernet Switch CCTV - TC', 'TC', 'COMMS', 'PIN_ASSIGNMENT', 1, '1', '1', '2018-04-04', 'ARJUN', 'SARANYA V', null, 'KC SHASHIKANTH', 'active', 'M12-X Port G3 G4 updated'),
  ('942-38407', 'Saloon VAC Pin Assignment - TC', 'TC', 'VAC', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38409', 'TCMS RIO Pin Assignment - TC', 'TC', 'TMS', 'PIN_ASSIGNMENT', 4, '2', '2', '2018-02-16', 'SUSHILA PATIL', 'SARANYA V', 'SADHASIVAM M', 'KC SHASHIKANTH', 'active', 'Updated as per MELCO'),
  ('942-38411', 'Socket Outlet Pin Assignment - TC', 'TC', 'APS', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38413', 'Door Indicator Pin Assignment - TC', 'TC', 'DOOR', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38512', 'APS Pin Assignment - T Car', 'TC', 'APS', 'PIN_ASSIGNMENT', 2, '0', '0', '2018-02-13', 'AMBIKA HS', 'V SARANYA', 'SADHASIVAM M', 'KC SHASHIKANTH', 'active', ''),
  ('942-38514', 'Shore Supply Box - T Car', 'TC', 'APS', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38516', 'Battery Box Pin Assignment - T Car', 'TC', 'APS', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38519', 'BCU Pin Assignment - T Car', 'TC', 'BRAKE', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38602', 'Saloon VAC Pin Assignment - M Car', 'MC', 'VAC', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38603', 'Passenger Door Pin Assignment - M Car', 'MC', 'DOOR', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38604', 'Saloon Lights Pin Assignment - M Car', 'MC', 'LIGHT', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38605', 'BECU Pin Assignment - M Car', 'MC', 'BRAKE', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38606', 'TCMS RIO Pin Assignment - M Car', 'MC', 'TMS', 'PIN_ASSIGNMENT', 4, '2', '2', '2018-02-16', 'SUSHILA PATIL', 'SARANYA V', 'SADHASIVAM M', 'KC SHASHIKANTH', 'active', 'Updated as per MELCO'),
  ('942-38607', 'TCMS Terminal Block - M Car', 'MC', 'TMS', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38608', 'CCTV Ethernet Switch - M Car', 'MC', 'COMMS', 'PIN_ASSIGNMENT', 1, '1', '1', '2018-04-04', 'ARJUN', 'SARANYA V', null, 'KC SHASHIKANTH', 'active', 'M12-X Port G3 G4'),
  ('942-38609', 'AAU Pin Assignment - M Car', 'MC', 'COMMS', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38610', 'EDB Panel Pin Assignment - M Car', 'MC', 'EDB', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38612', 'TCMS Communication Node-1 - M Car', 'MC', 'TMS', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', ''),
  ('942-38614', 'Door Indicator Pin Assignment - M Car', 'MC', 'DOOR', 'PIN_ASSIGNMENT', 1, null, null, null, null, null, null, null, null, 'active', '')
) d(drawing_no, title, car_code, system_code, drawing_type, sheet_count, current_alt, current_revision, drawing_date, drwn_by, chkd_by, revd_by, appd_by, status, notes)
join p on p.code = 'KMRCL_RS3R'
join ct on ct.code = d.car_code
join sys on sys.code = d.system_code;

-- 4.9 Equipment (High Priority)
with p as (select id from public.projects where code = 'KMRCL_RS3R')
insert into public.equipment(project_id, car_type_id, system_id, equipment_code, equipment_name, equipment_type, manufacturer, location_hint)
select p.id, ct.id, sys.id, e.equipment_code, e.equipment_name, e.equipment_type, e.manufacturer, e.location_hint
from (
  values
  ('DMC', 'LTEB', 'LTEB1', 'Low Tension Equipment Box 1', 'PANEL', null, 'Underframe'),
  ('TC', 'LTEB', 'LTEB2', 'Low Tension Equipment Box 2', 'PANEL', null, 'Underframe'),
  ('MC', 'LTEB', 'LTEB3', 'Low Tension Equipment Box 3', 'PANEL', null, 'Underframe'),
  ('DMC', 'LTJB', 'LTJB1', 'Low Tension Junction Box 1', 'JUNCTION_BOX', null, 'Underframe'),
  ('TC', 'LTJB', 'LTJB1', 'Low Tension Junction Box 1', 'JUNCTION_BOX', null, 'Underframe'),
  ('MC', 'LTJB', 'LTJB1', 'Low Tension Junction Box 1', 'JUNCTION_BOX', null, 'Underframe'),
  ('DMC', 'TRAC', 'V1', 'VVVF Inverter 1', 'INVERTER', 'MELCO', 'Underframe'),
  ('MC', 'TRAC', 'V2', 'VVVF Inverter 2', 'INVERTER', 'MELCO', 'Underframe'),
  ('DMC', 'HV', 'CSJB1', 'Collector Shoe Junction Box 1', 'JUNCTION_BOX', null, 'Underframe'),
  ('DMC', 'BRAKE', 'PSB1', 'Pressure Switch Box 1', 'VALVE_BOX', null, 'Underframe/Bogie'),
  ('TC', 'BRAKE', 'PSB1', 'Pressure Switch Box 1', 'VALVE_BOX', null, 'Underframe/Bogie'),
  ('MC', 'BRAKE', 'PSB1', 'Pressure Switch Box 1', 'VALVE_BOX', null, 'Underframe/Bogie'),
  ('DMC', 'BRAKE', 'BCU1', 'Brake Control Unit 1', 'CONTROL_UNIT', 'KNORR', 'Underframe'),
  ('TC', 'BRAKE', 'BCU1', 'Brake Control Unit 1', 'CONTROL_UNIT', 'KNORR', 'Underframe'),
  ('MC', 'BRAKE', 'BECU1', 'Brake Electronic Control Unit 1', 'CONTROL_UNIT', 'KNORR', 'Underframe'),
  ('MC', 'EDB', 'EDB1', 'Electrical Distribution Box 1', 'PANEL', null, 'Ceiling'),
  ('TC', 'EDB', 'EDB1', 'Electrical Distribution Box 1', 'PANEL', null, 'Ceiling'),
  ('TC', 'APS', 'APS1', 'Auxiliary Power Supply 1', 'POWER_UNIT', null, 'Underframe'),
  ('TC', 'APS', 'SSB1', 'Shore Supply Box 1', 'POWER_UNIT', null, 'Underframe'),
  ('TC', 'APS', 'BATT1', 'Battery Box 1', 'BATTERY', null, 'Underframe'),
  ('DMC', 'HV', 'HSCB1', 'High Speed Circuit Breaker 1', 'BREAKER', null, 'Underframe'),
  ('MC', 'HV', 'HSCB1', 'High Speed Circuit Breaker 1', 'BREAKER', null, 'Underframe'),
  ('DMC', 'HV', 'MSB1', 'Main Switch Box 1', 'SWITCH_BOX', null, 'Underframe'),
  ('DMC', 'HV', 'HTEB1', 'High Tension Equipment Box 1', 'PANEL', null, 'Underframe'),
  ('DMC', 'HV', 'HTJB1', 'High Tension Junction Box 1', 'JUNCTION_BOX', null, 'Underframe'),
  ('TC', 'HV', 'HTEB1', 'High Tension Equipment Box 1', 'PANEL', null, 'Underframe'),
  ('TC', 'HV', 'HTJB1', 'High Tension Junction Box 1', 'JUNCTION_BOX', null, 'Underframe'),
  ('MC', 'TMS', 'TCMS_RIO1', 'TCMS Remote IO Unit 1', 'RIO', 'MELCO', 'Ceiling'),
  ('TC', 'TMS', 'TCMS_RIO1', 'TCMS Remote IO Unit 1', 'RIO', 'MELCO', 'Ceiling'),
  ('MC', 'TMS', 'TCMS_TB1', 'TCMS Terminal Block 1', 'TERMINAL_BLOCK', null, 'Ceiling'),
  ('MC', 'TMS', 'TCMS_CN1', 'TCMS Communication Node 1', 'COMMS_NODE', null, 'Ceiling'),
  ('MC', 'COMMS', 'ETH_SW1', 'Ethernet Switch CCTV 1', 'NETWORK_SWITCH', null, 'Ceiling'),
  ('TC', 'COMMS', 'ETH_SW1', 'Ethernet Switch CCTV 1', 'NETWORK_SWITCH', null, 'Ceiling'),
  ('MC', 'COMMS', 'AAU1', 'Audio Alarm Unit 1', 'AMPLIFIER', null, 'Ceiling'),
  ('TC', 'COMMS', 'AAU1', 'Audio Alarm Unit 1', 'AMPLIFIER', null, 'Ceiling'),
  ('MC', 'VAC', 'VAC1', 'Saloon VAC Unit 1', 'HVAC_UNIT', null, 'Ceiling'),
  ('TC', 'VAC', 'VAC1', 'Saloon VAC Unit 1', 'HVAC_UNIT', null, 'Ceiling'),
  ('CAB', 'VAC', 'CAB_VAC1', 'Cab VAC Unit 1', 'HVAC_UNIT', null, 'Cab'),
  ('CAB', 'CAB', 'OP_PNL1', 'Operating Panel 1', 'PANEL', null, 'Cab Desk'),
  ('CAB', 'CAB', 'IND_PNL1', 'Indicator Panel 1', 'PANEL', null, 'Cab Desk'),
  ('CAB', 'CAB', 'MCB_PNL1', 'MCB Panel 1', 'PANEL', null, 'Cab'),
  ('MC', 'DOOR', 'DCU1', 'Door Control Unit 1', 'CONTROL_UNIT', null, 'Ceiling'),
  ('TC', 'DOOR', 'DCU1', 'Door Control Unit 1', 'CONTROL_UNIT', null, 'Ceiling'),
  ('DMC', 'HV', 'STINGER1', 'Stinger Box 1', 'CONNECTOR_BOX', null, 'Underframe'),
  ('DMC', 'TRAC', 'TM1', 'Traction Motor Connector 1', 'CONNECTOR', null, 'Underframe/Bogie'),
  ('DMC', 'TRAC', 'FILT_REACT1', 'Filter Reactor 1', 'REACTOR', null, 'Underframe'),
  ('DMC', 'TRAC', 'BRAKE_RES1', 'Brake Resistor 1', 'RESISTOR', null, 'Underframe'),
  ('TC', 'BRAKE', 'COMP1', 'Compressor Motor 1', 'MOTOR_COMPRESSOR', null, 'Underframe'),
  ('MC', 'BRAKE', 'PBMV1', 'Parking Brake Magnetic Valve 1', 'VALVE', null, 'Underframe'),
  ('MC', 'BRAKE', 'BIC1', 'Brake Interface Controller 1', 'CONTROLLER', null, 'Underframe')
) e(car_code, system_code, equipment_code, equipment_name, equipment_type, manufacturer, location_hint)
join p on true
join public.car_types ct on ct.code = e.car_code and ct.project_id = p.id
join public.systems sys on sys.code = e.system_code;

-- 4.10 Wires (High Priority)
insert into public.wires(wire_no, wire_type, wire_size, wire_color, shielded, voltage_class, description) values
('1032', 'GKW', '3x1.0', 'BLUE', false, '110VDC', 'RESET - System reset'),
('1040', 'GKW', '3x1.0', 'GREEN', false, '110VDC', 'AUX ON - Auxiliary power on'),
('1050', 'GKW', '3x1.0', 'RED', false, '110VDC', 'SHUT DOWN - System shutdown'),
('1205', 'GKW', '3x2.5', 'RED', false, '750VDC', 'LINE VOLTAGE - 750V DC'),
('1207', 'GKW', '3x1.0', 'YELLOW', false, '110VDC', 'VVVF FAULT - VVVF fault indication'),
('1209', 'GKW', '3x1.0', 'ORANGE', false, '110VDC', 'HSCB TRIP - HSCB trip'),
('1515', 'GKW', '3x1.0', 'WHITE', false, '110VDC', 'ATP - Automatic train protection'),
('2043', 'GKW', '3x1.0', 'BROWN', false, '110VDC', 'SCS - Service continuity signal'),
('3003', 'GKW', '3x1.0', 'BLUE', false, '110VDC', 'FORWARD - Forward command'),
('3004', 'GKW', '3x1.0', 'BLUE', false, '110VDC', 'REVERSE - Reverse command'),
('3005', 'GKW', '3x1.0', 'BLUE', false, '110VDC', 'POWERING1 - Propulsion enable 1'),
('3006', 'GKW', '3x1.0', 'BLUE', false, '110VDC', 'POWERING2 - Propulsion enable 2'),
('3010', 'GKW', '3x1.0', 'BLUE', false, '110VDC', 'BRAKING - Braking command'),
('3011', 'GKW', '3x1.0', 'RED', false, '110VDC', 'FULL SERVICE BRAKE'),
('3013', 'GKW', '3x1.0', 'YELLOW', false, '110VDC', 'RM - Restricted manual'),
('3018', 'GKW', '3x1.0', 'GREEN', false, '110VDC', 'STANDBY - Standby mode'),
('3019', 'GKW', '3x1.0', 'WHITE', false, '110VDC', 'WC - Wash coupling'),
('4024', 'GKW', '3x1.0', 'BLUE', false, '110VDC', 'BRAKE LOOP - Normal'),
('4062', 'GKW', '3x1.0', 'BLUE', false, '110VDC', 'EM BRAKE LOOP NORMAL'),
('4070', 'GKW', '3x1.0', 'BLUE', false, '110VDC', 'EM BRAKE LOOP NORMAL RETURN'),
('4103', 'GKW', '3x1.0', 'RED', false, '110VDC', 'EM BRAKE LOOP REDUNDANT'),
('4110', 'GKW', '3x1.0', 'RED', false, '110VDC', 'EM BRAKE LOOP REDUNDANT RETURN'),
('4122', 'GKW', '3x1.0', 'YELLOW', false, '110VDC', 'PARKING BRAKE APPLIED'),
('4153', 'GKW', '3x1.0', 'GREEN', false, '110VDC', 'PARKING BRAKE RELEASED'),
('4155', 'GKW', '3x1.0', 'WHITE', false, '110VDC', 'PARKING BRAKE PRESSURE SW'),
('5000', 'GKW', '3x2.5', 'BLACK', false, '415VAC', 'SHORE SUPPLY CONTACT'),
('5030', 'GKW', '3x2.5', 'BLACK', false, '415VAC', 'SIV CONTACT 1'),
('5031', 'GKW', '3x2.5', 'BLACK', false, '415VAC', 'SIV CONTACT 2'),
('5064', 'GKW', '3x1.0', 'RED', false, '110VDC', 'BATTERY UNDER-VOLTAGE'),
('6009', 'GKW', '3x1.0', 'BLUE', false, '110VDC', 'DOOR OPEN LEFT'),
('6014', 'GKW', '3x1.0', 'GREEN', false, '110VDC', 'DOOR CLOSE LEFT'),
('6034', 'GKW', '3x1.0', 'YELLOW', false, '110VDC', 'DOOR CLOSE ANNOUNCEMENT'),
('6046', 'GKW', '3x1.0', 'BLUE', false, '110VDC', 'DOOR OPEN RIGHT'),
('6051', 'GKW', '3x1.0', 'GREEN', false, '110VDC', 'DOOR CLOSE RIGHT'),
('6073', 'GKW', '3x1.0', 'WHITE', false, '110VDC', 'DOOR PROVING LOOP 1'),
('6076', 'GKW', '3x1.0', 'WHITE', false, '110VDC', 'DOOR PROVING LOOP 2'),
('6112', 'GKW', '3x1.0', 'BROWN', false, '110VDC', 'ZERO SPEED'),
('7001', 'GKW', '3x1.0', 'RED', false, '110VDC', 'CAB VAC IN SSK'),
('7050', 'GKW', '3x1.0', 'ORANGE', false, '110VDC', 'SALOON VAC 1 IN SSK'),
('7060', 'GKW', '3x1.0', 'ORANGE', false, '110VDC', 'SALOON VAC 2 IN SSK'),
('7070', 'GKW', '3x1.0', 'RED', false, '110VDC', 'SMOKE DETECTION'),
('7071', 'GKW', '3x1.0', 'YELLOW', false, '110VDC', 'DAMPER OPERATION'),
('9214', 'GKW', '3x1.0', 'BLUE', false, '110VDC', 'ATP MODE'),
('9215', 'GKW', '3x1.0', 'GREEN', false, '110VDC', 'FWD MODE'),
('9216', 'GKW', '3x1.0', 'RED', false, '110VDC', 'REV MODE');

-- ============================================================
-- END OF MIGRATION 001
-- ============================================================