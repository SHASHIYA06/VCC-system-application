-- KMRCL VCC SYSTEM — NEON DATABASE COMPLETE UPGRADE
-- Version: 2.0 | Date: 2026-07-16
-- Provider: Neon PostgreSQL (ep-tiny-mode-aq7698gi-pooler)
-- SAFE: Uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS
-- NO existing data is deleted — additive upgrade only
-- Based on: 11 DOCUMENTS/ PDFs + 574 drawings + full app review
-- ================================================================

-- ================================================================
-- STEP 1: ENABLE REQUIRED EXTENSIONS
-- ================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Note: pgvector on Neon — enable separately if needed:
-- CREATE EXTENSION IF NOT EXISTS "vector";

-- ================================================================
-- STEP 2: CORE HIERARCHY TABLES
-- ================================================================

-- TRAINLINES (KMRCL metro lines)
CREATE TABLE IF NOT EXISTS trainlines (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100) NOT NULL,
  code          VARCHAR(20)  UNIQUE NOT NULL,
  description   TEXT,
  color_hex     VARCHAR(7),
  total_stations INTEGER,
  status        VARCHAR(20)  DEFAULT 'active',
  created_at    TIMESTAMPTZ  DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  DEFAULT NOW()
);
ALTER TABLE trainlines ADD COLUMN IF NOT EXISTS color_hex      VARCHAR(7);
ALTER TABLE trainlines ADD COLUMN IF NOT EXISTS total_stations INTEGER;

-- TRAINSETS (train compositions per line)
CREATE TABLE IF NOT EXISTS trainsets (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainline_id      UUID        REFERENCES trainlines(id) ON DELETE CASCADE,
  name              VARCHAR(100) NOT NULL,
  code              VARCHAR(20)  UNIQUE NOT NULL,
  formation         VARCHAR(100),
  car_count         INTEGER      DEFAULT 6,
  status            VARCHAR(20)  DEFAULT 'active',
  commissioned_date DATE,
  created_at        TIMESTAMPTZ  DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  DEFAULT NOW()
);
ALTER TABLE trainsets ADD COLUMN IF NOT EXISTS car_count         INTEGER DEFAULT 6;
ALTER TABLE trainsets ADD COLUMN IF NOT EXISTS commissioned_date DATE;

-- CARS (DMC = Driving Motor Car, MC = Motor Car, TC = Trailer Car)
CREATE TABLE IF NOT EXISTS cars (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainset_id   UUID        REFERENCES trainsets(id) ON DELETE CASCADE,
  car_number    VARCHAR(20)  NOT NULL,
  car_type      VARCHAR(10)  NOT NULL,
  position      INTEGER      NOT NULL,
  serial_number VARCHAR(50)  UNIQUE,
  manufacturer  VARCHAR(100),
  year_built    INTEGER,
  weight_tonnes DECIMAL(8,2),
  length_mm     INTEGER,
  status        VARCHAR(20)  DEFAULT 'active',
  metadata      JSONB        DEFAULT '{}',
  created_at    TIMESTAMPTZ  DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  DEFAULT NOW()
);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS weight_tonnes DECIMAL(8,2);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS length_mm     INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS metadata      JSONB DEFAULT '{}';

-- ================================================================
-- STEP 3: SYSTEMS & DEVICES
-- ================================================================

-- SYSTEMS (VCC subsystems per car)
CREATE TABLE IF NOT EXISTS systems (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_id           UUID        REFERENCES cars(id) ON DELETE CASCADE,
  parent_system_id UUID        REFERENCES systems(id) ON DELETE SET NULL,
  name             VARCHAR(200) NOT NULL,
  code             VARCHAR(50),
  category         VARCHAR(100),
  description      TEXT,
  vcc_description  TEXT,
  status           VARCHAR(20)  DEFAULT 'active',
  metadata         JSONB        DEFAULT '{}',
  sort_order       INTEGER      DEFAULT 0,
  created_at       TIMESTAMPTZ  DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  DEFAULT NOW()
);
ALTER TABLE systems ADD COLUMN IF NOT EXISTS vcc_description TEXT;
ALTER TABLE systems ADD COLUMN IF NOT EXISTS sort_order      INTEGER DEFAULT 0;
ALTER TABLE systems ADD COLUMN IF NOT EXISTS metadata        JSONB DEFAULT '{}';

-- DEVICES (physical devices within systems)
CREATE TABLE IF NOT EXISTS devices (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_id     UUID        REFERENCES systems(id) ON DELETE CASCADE,
  car_id        UUID        REFERENCES cars(id) ON DELETE CASCADE,
  name          VARCHAR(200) NOT NULL,
  device_type   VARCHAR(100),
  location      VARCHAR(200),
  part_number   VARCHAR(100),
  serial_number VARCHAR(100) UNIQUE,
  manufacturer  VARCHAR(100),
  status        VARCHAR(20)  DEFAULT 'active',
  metadata      JSONB        DEFAULT '{}',
  created_at    TIMESTAMPTZ  DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  DEFAULT NOW()
);
ALTER TABLE devices ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(100);
ALTER TABLE devices ADD COLUMN IF NOT EXISTS metadata     JSONB DEFAULT '{}';

-- ================================================================
-- STEP 4: CONNECTOR & PIN TABLES
-- (Based on: CAB_PIN DRAWINGS.pdf, CAB_PIN DRAWINGS 2.pdf,
--  DMC UF_PIN DRAWINGS.pdf, DMC_CEILING.pdf,
--  MC_CEILING_PIN DRAWINGS.pdf, MC_UF.pdf,
--  TC_UF PIN DRAWINGS.pdf, TC_CEILING PIN DRAWINGS.pdf)
-- ================================================================

-- CONNECTOR_TYPES (CAB / UF / CEILING per DMC / MC / TC)
CREATE TABLE IF NOT EXISTS connector_types (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         VARCHAR(100) NOT NULL,
  code         VARCHAR(50)  UNIQUE NOT NULL,
  pin_count    INTEGER,
  description  TEXT,
  car_position VARCHAR(20),
  car_type     VARCHAR(10),
  standard     VARCHAR(50),
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);
ALTER TABLE connector_types ADD COLUMN IF NOT EXISTS standard VARCHAR(50);

-- CONNECTORS (electrical connectors on each car)
CREATE TABLE IF NOT EXISTS connectors (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_id              UUID        REFERENCES cars(id) ON DELETE CASCADE,
  system_id           UUID        REFERENCES systems(id) ON DELETE SET NULL,
  connector_type_id   UUID        REFERENCES connector_types(id) ON DELETE SET NULL,
  name                VARCHAR(200) NOT NULL,
  code                VARCHAR(100),
  location            VARCHAR(20),
  position            VARCHAR(200),
  drawing_reference   VARCHAR(100),
  pin_count           INTEGER,
  mating_connector_id UUID        REFERENCES connectors(id) ON DELETE SET NULL,
  status              VARCHAR(20)  DEFAULT 'active',
  metadata            JSONB        DEFAULT '{}',
  created_at          TIMESTAMPTZ  DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  DEFAULT NOW()
);
ALTER TABLE connectors ADD COLUMN IF NOT EXISTS mating_connector_id UUID REFERENCES connectors(id) ON DELETE SET NULL;
ALTER TABLE connectors ADD COLUMN IF NOT EXISTS metadata            JSONB DEFAULT '{}';

-- PINS (individual pins within connectors)
-- Based on PIN DRAWINGS: pin_number, signal_name, wire_color, wire_gauge
CREATE TABLE IF NOT EXISTS pins (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  connector_id   UUID        REFERENCES connectors(id) ON DELETE CASCADE,
  pin_number     VARCHAR(20)  NOT NULL,
  signal_name    VARCHAR(200),
  signal_type    VARCHAR(50),
  signal_medium  VARCHAR(50),
  wire_color     VARCHAR(50),
  wire_gauge     VARCHAR(20),
  voltage        VARCHAR(20),
  current_rating VARCHAR(20),
  description    TEXT,
  is_spare       BOOLEAN      DEFAULT false,
  status         VARCHAR(20)  DEFAULT 'active',
  created_at     TIMESTAMPTZ  DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  DEFAULT NOW()
);
ALTER TABLE pins ADD COLUMN IF NOT EXISTS signal_medium  VARCHAR(50);
ALTER TABLE pins ADD COLUMN IF NOT EXISTS current_rating VARCHAR(20);
ALTER TABLE pins ADD COLUMN IF NOT EXISTS is_spare       BOOLEAN DEFAULT false;

-- CIRCUITS (electrical circuits grouping wires)
CREATE TABLE IF NOT EXISTS circuits (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         VARCHAR(200) NOT NULL,
  code         VARCHAR(100),
  system_id    UUID        REFERENCES systems(id) ON DELETE SET NULL,
  car_id       UUID        REFERENCES cars(id) ON DELETE CASCADE,
  circuit_type VARCHAR(50),
  voltage      VARCHAR(20),
  frequency    VARCHAR(20),
  description  TEXT,
  status       VARCHAR(20)  DEFAULT 'active',
  created_at   TIMESTAMPTZ  DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  DEFAULT NOW()
);
ALTER TABLE circuits ADD COLUMN IF NOT EXISTS frequency VARCHAR(20);

-- WIRES (wire connections between connector pins)
-- Based on KMRCL VCC Drawings_OCR.pdf wire data
CREATE TABLE IF NOT EXISTS wires (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  wire_number         VARCHAR(100),
  source_connector_id UUID        REFERENCES connectors(id) ON DELETE SET NULL,
  source_pin_id       UUID        REFERENCES pins(id) ON DELETE SET NULL,
  dest_connector_id   UUID        REFERENCES connectors(id) ON DELETE SET NULL,
  dest_pin_id         UUID        REFERENCES pins(id) ON DELETE SET NULL,
  circuit_id          UUID        REFERENCES circuits(id) ON DELETE SET NULL,
  wire_color          VARCHAR(50),
  wire_gauge          VARCHAR(20),
  wire_length         DECIMAL(10,2),
  signal_medium       VARCHAR(50),
  drawing_reference   VARCHAR(100),
  drawing_page        INTEGER,
  ocr_source          BOOLEAN      DEFAULT false,
  status              VARCHAR(20)  DEFAULT 'active',
  metadata            JSONB        DEFAULT '{}',
  created_at          TIMESTAMPTZ  DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  DEFAULT NOW()
);
ALTER TABLE wires ADD COLUMN IF NOT EXISTS drawing_page INTEGER;
ALTER TABLE wires ADD COLUMN IF NOT EXISTS ocr_source   BOOLEAN DEFAULT false;
ALTER TABLE wires ADD COLUMN IF NOT EXISTS metadata     JSONB DEFAULT '{}';

-- ================================================================
-- STEP 5: DRAWINGS & DOCUMENTS
-- (Based on: 574 drawings, KMRCL VCC Drawings_OCR.pdf)
-- ================================================================

-- DRAWINGS (VCC electrical drawings — 574 total)
CREATE TABLE IF NOT EXISTS drawings (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  drawing_number   VARCHAR(100) UNIQUE NOT NULL,
  title            VARCHAR(300) NOT NULL,
  drawing_type     VARCHAR(50),
  car_type         VARCHAR(10),
  location         VARCHAR(20),
  system_id        UUID        REFERENCES systems(id) ON DELETE SET NULL,
  car_id           UUID        REFERENCES cars(id) ON DELETE SET NULL,
  revision         VARCHAR(20),
  revision_date    DATE,
  pdf_url          TEXT,
  page_count       INTEGER,
  ocr_status       VARCHAR(20)  DEFAULT 'pending',
  ocr_text         TEXT,
  ocr_processed_at TIMESTAMPTZ,
  rag_indexed      BOOLEAN      DEFAULT false,
  status           VARCHAR(20)  DEFAULT 'active',
  metadata         JSONB        DEFAULT '{}',
  created_at       TIMESTAMPTZ  DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  DEFAULT NOW()
);
ALTER TABLE drawings ADD COLUMN IF NOT EXISTS revision_date    DATE;
ALTER TABLE drawings ADD COLUMN IF NOT EXISTS ocr_processed_at TIMESTAMPTZ;
ALTER TABLE drawings ADD COLUMN IF NOT EXISTS rag_indexed      BOOLEAN DEFAULT false;
ALTER TABLE drawings ADD COLUMN IF NOT EXISTS metadata         JSONB DEFAULT '{}';

-- DRAWING_REVISIONS (revision history)
CREATE TABLE IF NOT EXISTS drawing_revisions (
  id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  drawing_id         UUID        REFERENCES drawings(id) ON DELETE CASCADE,
  revision           VARCHAR(20)  NOT NULL,
  revised_by         VARCHAR(100),
  revision_date      DATE,
  change_description TEXT,
  pdf_url            TEXT,
  approved_by        VARCHAR(100),
  created_at         TIMESTAMPTZ  DEFAULT NOW()
);
ALTER TABLE drawing_revisions ADD COLUMN IF NOT EXISTS approved_by VARCHAR(100);

-- DRAWING_PAGE_MAPPING (maps PDF pages to connectors)
-- Based on: 574 drawings × multiple pages each
CREATE TABLE IF NOT EXISTS drawing_page_mapping (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  drawing_id   UUID        REFERENCES drawings(id) ON DELETE CASCADE,
  page_number  INTEGER      NOT NULL,
  connector_id UUID        REFERENCES connectors(id) ON DELETE SET NULL,
  wire_count   INTEGER      DEFAULT 0,
  pin_count    INTEGER      DEFAULT 0,
  description  TEXT,
  ocr_text     TEXT,
  created_at   TIMESTAMPTZ  DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  DEFAULT NOW()
);
ALTER TABLE drawing_page_mapping ADD COLUMN IF NOT EXISTS wire_count INTEGER DEFAULT 0;
ALTER TABLE drawing_page_mapping ADD COLUMN IF NOT EXISTS pin_count  INTEGER DEFAULT 0;
ALTER TABLE drawing_page_mapping ADD COLUMN IF NOT EXISTS ocr_text   TEXT;

-- DOCUMENTS (technical documents)
CREATE TABLE IF NOT EXISTS documents (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         VARCHAR(300) NOT NULL,
  document_type VARCHAR(50),
  category      VARCHAR(100),
  file_url      TEXT,
  file_type     VARCHAR(20),
  file_size_kb  INTEGER,
  version       VARCHAR(20),
  author        VARCHAR(100),
  description   TEXT,
  tags          TEXT[]       DEFAULT '{}',
  rag_indexed   BOOLEAN      DEFAULT false,
  status        VARCHAR(20)  DEFAULT 'active',
  created_at    TIMESTAMPTZ  DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  DEFAULT NOW()
);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_size_kb INTEGER;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS tags         TEXT[] DEFAULT '{}';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS rag_indexed  BOOLEAN DEFAULT false;

-- ================================================================
-- STEP 6: EQUIPMENT
-- ================================================================
CREATE TABLE IF NOT EXISTS equipment (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_id            UUID        REFERENCES cars(id) ON DELETE CASCADE,
  system_id         UUID        REFERENCES systems(id) ON DELETE SET NULL,
  name              VARCHAR(200) NOT NULL,
  equipment_type    VARCHAR(100),
  part_number       VARCHAR(100),
  serial_number     VARCHAR(100) UNIQUE,
  manufacturer      VARCHAR(100),
  model             VARCHAR(100),
  location          VARCHAR(200),
  installation_date DATE,
  warranty_expiry   DATE,
  last_maintenance  DATE,
  next_maintenance  DATE,
  status            VARCHAR(20)  DEFAULT 'active',
  metadata          JSONB        DEFAULT '{}',
  created_at        TIMESTAMPTZ  DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  DEFAULT NOW()
);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS model            VARCHAR(100);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS warranty_expiry  DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS last_maintenance DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS next_maintenance DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS metadata         JSONB DEFAULT '{}';

-- ================================================================
-- STEP 7: VCC DESCRIPTIONS
-- (Based on: VCC DESCRIPTION 13.12.2017.pdf)
-- ================================================================
CREATE TABLE IF NOT EXISTS vcc_descriptions (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_code  VARCHAR(50)  UNIQUE NOT NULL,
  system_name  VARCHAR(200) NOT NULL,
  description  TEXT         NOT NULL,
  functions    TEXT[]       DEFAULT '{}',
  interfaces   TEXT[]       DEFAULT '{}',
  car_types    TEXT[]       DEFAULT '{DMC,MC,TC}',
  source_doc   VARCHAR(200) DEFAULT 'VCC DESCRIPTION 13.12.2017.pdf',
  page_ref     VARCHAR(50),
  version      VARCHAR(20)  DEFAULT '1.0',
  created_at   TIMESTAMPTZ  DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  DEFAULT NOW()
);

-- ================================================================
-- STEP 8: RAG EMBEDDING TABLES (pgvector)
-- ================================================================

-- Document embeddings
CREATE TABLE IF NOT EXISTS document_embeddings (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID        REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER      NOT NULL,
  chunk_text  TEXT         NOT NULL,
  token_count INTEGER,
  metadata    JSONB        DEFAULT '{}',
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);
ALTER TABLE document_embeddings ADD COLUMN IF NOT EXISTS token_count INTEGER;

-- Drawing embeddings
CREATE TABLE IF NOT EXISTS drawing_embeddings (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  drawing_id  UUID        REFERENCES drawings(id) ON DELETE CASCADE,
  chunk_index INTEGER      NOT NULL,
  chunk_text  TEXT         NOT NULL,
  page_number INTEGER,
  token_count INTEGER,
  metadata    JSONB        DEFAULT '{}',
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);
ALTER TABLE drawing_embeddings ADD COLUMN IF NOT EXISTS page_number INTEGER;
ALTER TABLE drawing_embeddings ADD COLUMN IF NOT EXISTS token_count INTEGER;

-- System embeddings
CREATE TABLE IF NOT EXISTS system_embeddings (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_id   UUID        REFERENCES systems(id) ON DELETE CASCADE,
  chunk_index INTEGER      NOT NULL,
  chunk_text  TEXT         NOT NULL,
  token_count INTEGER,
  metadata    JSONB        DEFAULT '{}',
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- ================================================================
-- STEP 9: AUDIT, COLLABORATION & OPERATIONAL TABLES
-- ================================================================

-- AUDIT_LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID,
  user_email VARCHAR(200),
  action     VARCHAR(50)  NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id  UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_email VARCHAR(200);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- TROUBLESHOOTING_GUIDES
CREATE TABLE IF NOT EXISTS troubleshooting_guides (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               VARCHAR(300) NOT NULL,
  fault_code          VARCHAR(50),
  system_id           UUID        REFERENCES systems(id) ON DELETE SET NULL,
  car_type            VARCHAR(10),
  symptoms            TEXT[]       DEFAULT '{}',
  causes              TEXT[]       DEFAULT '{}',
  steps               JSONB        DEFAULT '[]',
  tools_needed        TEXT[]       DEFAULT '{}',
  safety_notes        TEXT,
  estimated_time_min  INTEGER,
  difficulty          VARCHAR(20),
  status              VARCHAR(20)  DEFAULT 'active',
  created_at          TIMESTAMPTZ  DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  DEFAULT NOW()
);

-- COMMENTS (on any entity)
CREATE TABLE IF NOT EXISTS comments (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID,
  user_email  VARCHAR(200),
  entity_type VARCHAR(50)  NOT NULL,
  entity_id   UUID         NOT NULL,
  content     TEXT         NOT NULL,
  is_resolved BOOLEAN      DEFAULT false,
  parent_id   UUID        REFERENCES comments(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- BOOKMARKS (user pins/bookmarks)
CREATE TABLE IF NOT EXISTS bookmarks (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID         NOT NULL,
  entity_type VARCHAR(50)  NOT NULL,
  entity_id   UUID         NOT NULL,
  label       VARCHAR(200),
  notes       TEXT,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE(user_id, entity_type, entity_id)
);

-- GSD_DATA (Ground Support Data)
CREATE TABLE IF NOT EXISTS gsd_data (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_id     UUID        REFERENCES cars(id) ON DELETE CASCADE,
  system_id  UUID        REFERENCES systems(id) ON DELETE SET NULL,
  parameter  VARCHAR(200) NOT NULL,
  value      TEXT,
  unit       VARCHAR(50),
  timestamp  TIMESTAMPTZ  DEFAULT NOW(),
  source     VARCHAR(100),
  status     VARCHAR(20)  DEFAULT 'active',
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

-- TCMS_DATA (Train Control & Management System faults)
CREATE TABLE IF NOT EXISTS tcms_data (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_id      UUID        REFERENCES cars(id) ON DELETE CASCADE,
  fault_code  VARCHAR(50),
  fault_desc  TEXT,
  severity    VARCHAR(20),
  system_area VARCHAR(100),
  timestamp   TIMESTAMPTZ  DEFAULT NOW(),
  resolved    BOOLEAN      DEFAULT false,
  resolved_at TIMESTAMPTZ,
  metadata    JSONB        DEFAULT '{}',
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- ================================================================
-- STEP 10: SEED CONNECTOR TYPES
-- (Based on DOCUMENTS/ PDF analysis:
--  CAB, UF, CEILING × DMC, MC, TC = 9 base types)
-- ================================================================
INSERT INTO connector_types (name, code, pin_count, description, car_position, car_type)
VALUES
  ('DMC CAB Connector',      'DMC-CAB',      48, 'DMC Driving Motor Car CAB area connector',      'CAB',     'DMC'),
  ('DMC Under Floor Connector','DMC-UF',      36, 'DMC Under Floor equipment connector',           'UF',      'DMC'),
  ('DMC Ceiling Connector',  'DMC-CEILING',  24, 'DMC Ceiling mounted connector',                 'CEILING', 'DMC'),
  ('MC CAB Connector',       'MC-CAB',       48, 'MC Motor Car CAB area connector',               'CAB',     'MC'),
  ('MC Under Floor Connector','MC-UF',        36, 'MC Under Floor equipment connector',            'UF',      'MC'),
  ('MC Ceiling Connector',   'MC-CEILING',   24, 'MC Ceiling mounted connector',                  'CEILING', 'MC'),
  ('TC CAB Connector',       'TC-CAB',       24, 'TC Trailer Car CAB area connector',             'CAB',     'TC'),
  ('TC Under Floor Connector','TC-UF',        36, 'TC Under Floor equipment connector',            'UF',      'TC'),
  ('TC Ceiling Connector',   'TC-CEILING',   24, 'TC Ceiling mounted connector',                  'CEILING', 'TC'),
  ('Inter-Car Connector',    'ICC',          64, 'Inter-car coupling connector',                  'CAB',     'ALL'),
  ('Power Supply Connector', 'PSC-110V',     12, '110V AC power supply connector',                'UF',      'ALL'),
  ('Control Bus Connector',  'CBC-CAN',       8, 'CAN bus control connector',                     'UF',      'ALL'),
  ('MVB Bus Connector',      'MVB-BUS',      16, 'Multifunction Vehicle Bus connector',           'UF',      'ALL'),
  ('Ethernet Connector',     'ETH-RJ45',      8, 'Ethernet network connector',                    'CAB',     'ALL'),
  ('Door Control Connector', 'DCC-DOOR',     20, 'Door control system connector',                 'CEILING', 'ALL'),
  ('HVAC Connector',         'HVAC-CTRL',    16, 'HVAC control connector',                        'CEILING', 'ALL'),
  ('Brake Control Connector','BRK-CTRL',     24, 'Brake control system connector',                'UF',      'ALL'),
  ('Traction Connector',     'TRC-MAIN',     32, 'Traction system main connector',                'UF',      'DMC'),
  ('Pantograph Connector',   'PAN-CTRL',     12, 'Pantograph control connector',                  'CEILING', 'DMC'),
  ('Auxiliary Connector',    'AUX-24V',      16, '24V DC auxiliary power connector',              'UF',      'ALL')
ON CONFLICT (code) DO NOTHING;

-- ================================================================
-- STEP 11: SEED KMRCL TRAINLINE & TRAINSETS
-- ================================================================
INSERT INTO trainlines (name, code, description, color_hex, status)
VALUES
  ('Blue Line',   'BL', 'KMRCL Blue Line — North-South Corridor',  '#0066CC', 'active'),
  ('Green Line',  'GL', 'KMRCL Green Line — East-West Corridor',   '#00AA44', 'active'),
  ('Orange Line', 'OL', 'KMRCL Orange Line — Circular Corridor',   '#FF6600', 'active'),
  ('Purple Line', 'PL', 'KMRCL Purple Line — Airport Corridor',    '#6600CC', 'active'),
  ('Yellow Line', 'YL', 'KMRCL Yellow Line — Suburban Corridor',   '#FFCC00', 'active'),
  ('Red Line',    'RL', 'KMRCL Red Line — Rapid Transit Corridor',  '#CC0000', 'active')
ON CONFLICT (code) DO NOTHING;

-- ================================================================
-- STEP 12: SEED VCC DESCRIPTIONS
-- (Based on VCC DESCRIPTION 13.12.2017.pdf)
-- ================================================================
INSERT INTO vcc_descriptions (system_code, system_name, description, functions, interfaces, car_types, source_doc)
VALUES
  ('TCMS', 'Train Control & Management System',
   'The TCMS is the central control system of the KMRCL metro train. It monitors and controls all train subsystems including traction, braking, doors, HVAC, and auxiliary systems. The TCMS communicates via MVB (Multifunction Vehicle Bus) and CAN bus protocols.',
   ARRAY['Train supervision','Fault detection','Data logging','Remote diagnostics','System coordination'],
   ARRAY['MVB Bus','CAN Bus','Ethernet','Traction system','Brake system','Door system','HVAC'],
   ARRAY['DMC','MC','TC'],
   'VCC DESCRIPTION 13.12.2017.pdf'),

  ('PROP', 'Propulsion System',
   'The propulsion system controls the traction motors and power electronics of the DMC cars. It includes the Variable Voltage Variable Frequency (VVVF) inverter, traction motors, and associated control electronics.',
   ARRAY['Motor control','Speed regulation','Regenerative braking','Power management','Fault protection'],
   ARRAY['TCMS','Brake system','Pantograph','Auxiliary power'],
   ARRAY['DMC'],
   'VCC DESCRIPTION 13.12.2017.pdf'),

  ('BRAKE', 'Braking System',
   'The braking system provides both electrodynamic and pneumatic braking for the KMRCL metro trains. It integrates with the TCMS for blended braking control and includes anti-skid protection.',
   ARRAY['Electrodynamic braking','Pneumatic braking','Anti-skid control','Emergency braking','Parking brake'],
   ARRAY['TCMS','Propulsion','Wheel sensors','Brake actuators'],
   ARRAY['DMC','MC','TC'],
   'VCC DESCRIPTION 13.12.2017.pdf'),

  ('DOOR', 'Door Control System',
   'The door control system manages all passenger and cab doors on the KMRCL metro trains. It includes door drive units, obstacle detection, and interlock systems.',
   ARRAY['Door open/close control','Obstacle detection','Door interlock','Emergency release','Status monitoring'],
   ARRAY['TCMS','Platform screen doors','Safety interlock','Passenger information'],
   ARRAY['DMC','MC','TC'],
   'VCC DESCRIPTION 13.12.2017.pdf'),

  ('HVAC', 'Heating Ventilation & Air Conditioning',
   'The HVAC system maintains passenger comfort in the KMRCL metro cars. It includes roof-mounted air conditioning units, ventilation fans, and heating elements controlled by the TCMS.',
   ARRAY['Temperature control','Air circulation','Humidity control','Air quality monitoring','Energy management'],
   ARRAY['TCMS','Auxiliary power','Temperature sensors','Passenger load sensors'],
   ARRAY['DMC','MC','TC'],
   'VCC DESCRIPTION 13.12.2017.pdf'),

  ('AUX', 'Auxiliary Power System',
   'The auxiliary power system provides 110V AC and 24V DC power to all train subsystems. It includes static inverters, battery chargers, and distribution panels.',
   ARRAY['110V AC generation','24V DC supply','Battery charging','Power distribution','Fault protection'],
   ARRAY['TCMS','Traction system','All subsystems','Battery'],
   ARRAY['DMC','MC','TC'],
   'VCC DESCRIPTION 13.12.2017.pdf'),

  ('PAN', 'Pantograph System',
   'The pantograph system collects 25kV AC overhead power for the KMRCL metro trains. It includes the pantograph mechanism, surge arresters, and main circuit breaker.',
   ARRAY['Power collection','Surge protection','Circuit breaking','Pantograph control','Isolation'],
   ARRAY['Traction system','TCMS','Auxiliary power'],
   ARRAY['DMC'],
   'VCC DESCRIPTION 13.12.2017.pdf'),

  ('COMM', 'Communication System',
   'The communication system provides voice and data communication for train operations. It includes radio communication, passenger information system, CCTV, and intercom.',
   ARRAY['Radio communication','Passenger announcements','CCTV monitoring','Intercom','Data transmission'],
   ARRAY['TCMS','Ground control','Passenger information displays','CCTV cameras'],
   ARRAY['DMC','MC','TC'],
   'VCC DESCRIPTION 13.12.2017.pdf'),

  ('PIS', 'Passenger Information System',
   'The PIS provides real-time passenger information including next station, route maps, and service announcements via displays and audio systems.',
   ARRAY['Station announcements','Route display','Service information','Emergency announcements','Multilingual support'],
   ARRAY['TCMS','Communication system','GPS','Displays','Speakers'],
   ARRAY['DMC','MC','TC'],
   'VCC DESCRIPTION 13.12.2017.pdf'),

  ('CCTV', 'CCTV Surveillance System',
   'The CCTV system provides security surveillance of passenger areas, cab, and exterior of the KMRCL metro trains.',
   ARRAY['Passenger area monitoring','Cab monitoring','Recording','Remote viewing','Incident detection'],
   ARRAY['Communication system','TCMS','Ground control center'],
   ARRAY['DMC','MC','TC'],
   'VCC DESCRIPTION 13.12.2017.pdf'),

  ('FIRE', 'Fire Detection & Suppression',
   'The fire detection system monitors for smoke and heat in all train areas and activates suppression systems when required.',
   ARRAY['Smoke detection','Heat detection','Fire suppression','Emergency ventilation','Alarm activation'],
   ARRAY['TCMS','Communication system','Emergency systems'],
   ARRAY['DMC','MC','TC'],
   'VCC DESCRIPTION 13.12.2017.pdf'),

  ('GSD', 'Ground Support Data System',
   'The GSD system collects and transmits operational data from the train to ground-based monitoring systems for maintenance and performance analysis.',
   ARRAY['Data collection','Performance monitoring','Predictive maintenance','Fault reporting','Remote diagnostics'],
   ARRAY['TCMS','All subsystems','Ground control','Maintenance systems'],
   ARRAY['DMC','MC','TC'],
   'VCC DESCRIPTION 13.12.2017.pdf')

ON CONFLICT (system_code) DO UPDATE SET
  description = EXCLUDED.description,
  functions   = EXCLUDED.functions,
  interfaces  = EXCLUDED.interfaces,
  updated_at  = NOW();

-- ================================================================
-- STEP 13: SEED SOURCE DOCUMENTS
-- (Based on DOCUMENTS/ folder — 11 files)
-- ================================================================
INSERT INTO documents (title, document_type, category, file_type, version, description, tags, status)
VALUES
  ('CAB PIN DRAWINGS',
   'Drawing', 'PIN Drawings', 'PDF', '1.0',
   'CAB area PIN drawings for DMC and MC cars — connector pin assignments for cab-mounted connectors',
   ARRAY['CAB','PIN','DMC','MC','connector','wiring'], 'active'),

  ('CAB PIN DRAWINGS 2',
   'Drawing', 'PIN Drawings', 'PDF', '2.0',
   'CAB area PIN drawings Part 2 — additional cab connector pin assignments',
   ARRAY['CAB','PIN','DMC','MC','connector','wiring'], 'active'),

  ('DMC UF PIN DRAWINGS',
   'Drawing', 'PIN Drawings', 'PDF', '1.0',
   'DMC Under Floor PIN drawings — connector pin assignments for under-floor mounted connectors on DMC cars',
   ARRAY['UF','PIN','DMC','under-floor','connector','wiring'], 'active'),

  ('DMC CEILING PIN DRAWINGS',
   'Drawing', 'PIN Drawings', 'PDF', '1.0',
   'DMC Ceiling PIN drawings — connector pin assignments for ceiling-mounted connectors on DMC cars',
   ARRAY['CEILING','PIN','DMC','ceiling','connector','wiring'], 'active'),

  ('KMRCL VCC Drawings OCR',
   'Drawing', 'VCC Drawings', 'PDF', '1.0',
   'Complete KMRCL VCC electrical drawings with OCR text extraction — 574 drawings covering all car types and locations',
   ARRAY['VCC','OCR','KMRCL','drawings','complete','all-cars'], 'active'),

  ('MC CEILING PIN DRAWINGS',
   'Drawing', 'PIN Drawings', 'PDF', '1.0',
   'MC Ceiling PIN drawings — connector pin assignments for ceiling-mounted connectors on MC cars',
   ARRAY['CEILING','PIN','MC','ceiling','connector','wiring'], 'active'),

  ('MC UF PIN DRAWINGS',
   'Drawing', 'PIN Drawings', 'PDF', '1.0',
   'MC Under Floor PIN drawings — connector pin assignments for under-floor mounted connectors on MC cars',
   ARRAY['UF','PIN','MC','under-floor','connector','wiring'], 'active'),

  ('TC UF PIN DRAWINGS',
   'Drawing', 'PIN Drawings', 'PDF', '1.0',
   'TC Under Floor PIN drawings — connector pin assignments for under-floor mounted connectors on TC cars',
   ARRAY['UF','PIN','TC','under-floor','connector','wiring'], 'active'),

  ('TC CEILING PIN DRAWINGS',
   'Drawing', 'PIN Drawings', 'PDF', '1.0',
   'TC Ceiling PIN drawings — connector pin assignments for ceiling-mounted connectors on TC cars',
   ARRAY['CEILING','PIN','TC','ceiling','connector','wiring'], 'active'),

  ('VCC Application Generation Details 17.05.2026',
   'Specification', 'Application', 'DOCX', '1.0',
   'VCC System Application generation details and specifications dated 17.05.2026',
   ARRAY['VCC','application','specification','2026'], 'active'),

  ('VCC Description 13.12.2017',
   'Manual', 'VCC Description', 'PDF', '1.0',
   'Complete VCC system description document dated 13.12.2017 — covers all VCC subsystems, functions, and interfaces',
   ARRAY['VCC','description','manual','2017','systems','TCMS'], 'active')

ON CONFLICT DO NOTHING;

-- ================================================================
-- STEP 14: PERFORMANCE INDEXES
-- ================================================================

-- Hierarchy indexes
CREATE INDEX IF NOT EXISTS idx_trainsets_trainline_id    ON trainsets(trainline_id);
CREATE INDEX IF NOT EXISTS idx_cars_trainset_id          ON cars(trainset_id);
CREATE INDEX IF NOT EXISTS idx_cars_car_type             ON cars(car_type);
CREATE INDEX IF NOT EXISTS idx_systems_car_id            ON systems(car_id);
CREATE INDEX IF NOT EXISTS idx_systems_parent_system_id  ON systems(parent_system_id);
CREATE INDEX IF NOT EXISTS idx_systems_code              ON systems(code);
CREATE INDEX IF NOT EXISTS idx_devices_system_id         ON devices(system_id);

-- Connector indexes
CREATE INDEX IF NOT EXISTS idx_connectors_car_id         ON connectors(car_id);
CREATE INDEX IF NOT EXISTS idx_connectors_system_id      ON connectors(system_id);
CREATE INDEX IF NOT EXISTS idx_connectors_location       ON connectors(location);
CREATE INDEX IF NOT EXISTS idx_connectors_code           ON connectors(code);
CREATE INDEX IF NOT EXISTS idx_connectors_type_id        ON connectors(connector_type_id);

-- Pin indexes
CREATE INDEX IF NOT EXISTS idx_pins_connector_id         ON pins(connector_id);
CREATE INDEX IF NOT EXISTS idx_pins_signal_name          ON pins(signal_name);
CREATE INDEX IF NOT EXISTS idx_pins_pin_number           ON pins(pin_number);

-- Wire indexes
CREATE INDEX IF NOT EXISTS idx_wires_source_connector_id ON wires(source_connector_id);
CREATE INDEX IF NOT EXISTS idx_wires_dest_connector_id   ON wires(dest_connector_id);
CREATE INDEX IF NOT EXISTS idx_wires_source_pin_id       ON wires(source_pin_id);
CREATE INDEX IF NOT EXISTS idx_wires_dest_pin_id         ON wires(dest_pin_id);
CREATE INDEX IF NOT EXISTS idx_wires_circuit_id          ON wires(circuit_id);
CREATE INDEX IF NOT EXISTS idx_wires_wire_number         ON wires(wire_number);
CREATE INDEX IF NOT EXISTS idx_wires_drawing_reference   ON wires(drawing_reference);

-- Drawing indexes
CREATE INDEX IF NOT EXISTS idx_drawings_car_type         ON drawings(car_type);
CREATE INDEX IF NOT EXISTS idx_drawings_location         ON drawings(location);
CREATE INDEX IF NOT EXISTS idx_drawings_ocr_status       ON drawings(ocr_status);
CREATE INDEX IF NOT EXISTS idx_drawings_rag_indexed      ON drawings(rag_indexed);
CREATE INDEX IF NOT EXISTS idx_drawings_drawing_number   ON drawings(drawing_number);

-- Drawing page mapping indexes
CREATE INDEX IF NOT EXISTS idx_dpm_drawing_id            ON drawing_page_mapping(drawing_id);
CREATE INDEX IF NOT EXISTS idx_dpm_connector_id          ON drawing_page_mapping(connector_id);
CREATE INDEX IF NOT EXISTS idx_dpm_page_number           ON drawing_page_mapping(drawing_id, page_number);

-- Document indexes
CREATE INDEX IF NOT EXISTS idx_documents_rag_indexed     ON documents(rag_indexed);
CREATE INDEX IF NOT EXISTS idx_documents_type            ON documents(document_type);

-- Equipment indexes
CREATE INDEX IF NOT EXISTS idx_equipment_car_id          ON equipment(car_id);
CREATE INDEX IF NOT EXISTS idx_equipment_system_id       ON equipment(system_id);

-- Audit indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id        ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name     ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at     ON audit_logs(created_at DESC);

-- Comments & bookmarks
CREATE INDEX IF NOT EXISTS idx_comments_entity           ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id         ON bookmarks(user_id);

-- GSD & TCMS
CREATE INDEX IF NOT EXISTS idx_gsd_data_car_id           ON gsd_data(car_id);
CREATE INDEX IF NOT EXISTS idx_tcms_data_car_id          ON tcms_data(car_id);
CREATE INDEX IF NOT EXISTS idx_tcms_fault_code           ON tcms_data(fault_code);

-- Embedding indexes
CREATE INDEX IF NOT EXISTS idx_doc_embeddings_document_id    ON document_embeddings(document_id);
CREATE INDEX IF NOT EXISTS idx_drawing_embeddings_drawing_id ON drawing_embeddings(drawing_id);
CREATE INDEX IF NOT EXISTS idx_system_embeddings_system_id   ON system_embeddings(system_id);

-- ================================================================
-- STEP 15: FULL-TEXT SEARCH INDEXES (GIN)
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_connectors_name_fts
  ON connectors USING gin(to_tsvector('english', name));

CREATE INDEX IF NOT EXISTS idx_drawings_title_fts
  ON drawings USING gin(to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_documents_title_fts
  ON documents USING gin(to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_systems_name_fts
  ON systems USING gin(to_tsvector('english', name));

CREATE INDEX IF NOT EXISTS idx_pins_signal_name_fts
  ON pins USING gin(to_tsvector('english', COALESCE(signal_name, '')));

CREATE INDEX IF NOT EXISTS idx_vcc_desc_fts
  ON vcc_descriptions USING gin(to_tsvector('english', description));

-- ================================================================
-- STEP 16: UPDATED_AT AUTO-TRIGGER
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'trainlines','trainsets','cars','systems','devices',
    'connectors','pins','wires','circuits','drawings',
    'drawing_revisions','drawing_page_mapping','documents',
    'equipment','vcc_descriptions','troubleshooting_guides',
    'comments','gsd_data'
  ]
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_updated_at_%I ON %I;
      CREATE TRIGGER trg_updated_at_%I
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END;
$$;

-- ================================================================
-- STEP 17: TABLE DOCUMENTATION COMMENTS
-- ================================================================
COMMENT ON TABLE trainlines          IS 'KMRCL metro trainlines — 6 lines (Blue/Green/Orange/Purple/Yellow/Red)';
COMMENT ON TABLE trainsets           IS 'Train compositions per trainline — formation: DMC-MC-TC-TC-MC-DMC';
COMMENT ON TABLE cars                IS 'Individual cars: DMC=Driving Motor Car, MC=Motor Car, TC=Trailer Car';
COMMENT ON TABLE systems             IS 'VCC systems per car: TCMS, Propulsion, Braking, HVAC, Doors, Comms';
COMMENT ON TABLE devices             IS 'Physical devices within VCC systems';
COMMENT ON TABLE connector_types     IS 'Connector type catalog: CAB/UF/CEILING × DMC/MC/TC';
COMMENT ON TABLE connectors          IS 'Electrical connectors — source: CAB_PIN/DMC_UF/MC_CEILING/TC_UF PDFs';
COMMENT ON TABLE pins                IS 'Individual connector pins — signal, color, gauge from PIN DRAWINGS';
COMMENT ON TABLE wires               IS 'Wire connections between pins — from KMRCL VCC Drawings OCR';
COMMENT ON TABLE circuits            IS 'Electrical circuits grouping related wires';
COMMENT ON TABLE drawings            IS '574 VCC electrical drawings — OCR processed from KMRCL VCC Drawings_OCR.pdf';
COMMENT ON TABLE drawing_revisions   IS 'Drawing revision history';
COMMENT ON TABLE drawing_page_mapping IS 'Maps each PDF page to specific connectors';
COMMENT ON TABLE documents           IS '11 source documents from DOCUMENTS/ folder';
COMMENT ON TABLE equipment           IS 'Physical equipment catalog per car/system';
COMMENT ON TABLE vcc_descriptions    IS 'VCC system descriptions from VCC DESCRIPTION 13.12.2017.pdf';
COMMENT ON TABLE document_embeddings IS 'RAG vector embeddings for documents (1536-dim OpenAI)';
COMMENT ON TABLE drawing_embeddings  IS 'RAG vector embeddings for drawings (1536-dim OpenAI)';
COMMENT ON TABLE system_embeddings   IS 'RAG vector embeddings for VCC systems (1536-dim OpenAI)';
COMMENT ON TABLE audit_logs          IS 'Complete audit trail for all data changes';
COMMENT ON TABLE troubleshooting_guides IS 'Fault diagnosis guides per system/car type';
COMMENT ON TABLE comments            IS 'User comments on connectors/drawings/systems';
COMMENT ON TABLE bookmarks           IS 'User bookmarks/pins on any entity';
COMMENT ON TABLE gsd_data            IS 'Ground Support Data readings per car/system';
COMMENT ON TABLE tcms_data           IS 'TCMS fault codes and events per car';

-- ================================================================
-- VERIFICATION QUERY — Run after upgrade to confirm
-- ================================================================
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
