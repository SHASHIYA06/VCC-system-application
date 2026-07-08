-- 023_complete_vcc_setup.sql
-- Complete VCC setup: missing drawings, components, wire connections
-- Based on VCC_OCR (127 pages) and VCC DESCRIPTION document

BEGIN;

-- ============================================
-- 1. ADD MISSING DRAWINGS
-- ============================================

INSERT INTO "Drawing" ("id", "projectId", "systemId", "drawingNo", "revision", "title", "totalSheets", "status", "remarks", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, p.id, s.id, x.drawing_no, '0', x.title, x.sheets, 'ACTIVE', x.remarks, NOW(), NOW()
FROM "Project" p
CROSS JOIN (VALUES
  ('942-58099', 'GENERAL', 'Drawing List', 1, 'Master drawing register'),
  ('942-58118', 'GENERAL', 'Windscreen Wiper (revised)', 1, 'Wiper control revised'),
  ('942-58122', 'TRACTION', 'Traction Control Circuit', 1, 'Traction control interface'),
  ('942-58127', 'BRAKE', 'Horn', 1, 'Driver horn control'),
  ('942-58133', 'AUX', 'DC-DC Converter', 1, 'DC converter module'),
  ('942-58134', 'AUX', 'AC Converter Module', 1, 'AC converter module'),
  ('942-58135', 'AUX', 'Power Distribution Box', 1, 'Power distribution')
) AS x(drawing_no, system_code, title, sheets, remarks)
JOIN "System" s ON s."code" = x.system_code
WHERE p."projectCode" = 'KMRCL-RS3R'
AND NOT EXISTS (SELECT 1 FROM "Drawing" d WHERE d."drawingNo" = x.drawing_no);
SELECT 'Missing drawings added' as status;

-- ============================================
-- 2. ADD COMPONENT TYPES (Relays, MCBs, etc.)
-- ============================================

-- Create a ComponentType table if not exists
CREATE TABLE IF NOT EXISTS "ComponentType" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "code" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT,
  "description" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

INSERT INTO "ComponentType" ("code", "name", "category", "description")
VALUES
  ('RELAY', 'Relay', 'CONTROL', 'Electromechanical relay for switching circuits'),
  ('MCB', 'Miniature Circuit Breaker', 'PROTECTION', 'Overcurrent protection device'),
  ('MPCB', 'Motor Protection Circuit Breaker', 'PROTECTION', 'Motor overload and short circuit protection'),
  ('FUSE', 'Fuse', 'PROTECTION', 'Overcurrent protection device'),
  ('THYRISTOR', 'Thyristor', 'POWER', 'Semiconductor switching device'),
  ('DIODE', 'Diode', 'POWER', 'Semiconductor rectifier device'),
  ('RESISTOR', 'Resistor', 'PASSIVE', 'Current limiting device'),
  ('CAPACITOR', 'Capacitor', 'PASSIVE', 'Energy storage device'),
  ('INDUCTOR', 'Inductor', 'PASSIVE', 'Energy storage device'),
  ('TRANSFORMER', 'Transformer', 'POWER', 'Voltage transformation device'),
  ('CONTACTOR', 'Contactor', 'CONTROL', 'High current switching device'),
  ('MOTOR', 'Motor', 'ACTUATOR', 'Electric motor'),
  ('SOLENOID', 'Solenoid', 'ACTUATOR', 'Electromagnetic actuator'),
  ('SENSOR', 'Sensor', 'INSTRUMENT', 'Measurement device'),
  ('BUZZER', 'Buzzer', 'OUTPUT', 'Audio output device'),
  ('LAMP', 'Lamp', 'OUTPUT', 'Visual output device'),
  ('SWITCH', 'Switch', 'CONTROL', 'Manual switching device'),
  ('PUSHBUTTON', 'Pushbutton', 'CONTROL', 'Manual push switching device'),
  ('CAMSWITCH', 'Cam Switch', 'CONTROL', 'Rotary cam switching device'),
  ('INTERLOCK', 'Interlock', 'SAFETY', 'Safety interlocking device'),
  ('EOSS', 'External Override Switch', 'SAFETY', 'External door override switch'),
  ('EDCU', 'Electronic Door Control Unit', 'CONTROL', 'Door control electronics'),
  ('EBCU', 'Electronic Brake Control Unit', 'CONTROL', 'Brake control electronics'),
  ('BECU', 'Brake Electronic Control Unit', 'CONTROL', 'Brake electronics'),
  ('CCU', 'Central Control Unit', 'CONTROL', 'Central processing unit'),
  ('RIO', 'Remote IO Unit', 'CONTROL', 'Remote input/output unit'),
  ('SIV', 'Static Inverter', 'POWER', 'Static frequency converter'),
  ('APS', 'Auxiliary Power Supply', 'POWER', 'Auxiliary power conversion'),
  ('VVVF', 'Variable Voltage Variable Frequency', 'POWER', 'Traction inverter'),
  ('HSCB', 'High Speed Circuit Breaker', 'PROTECTION', 'High speed circuit protection'),
  ('PA', 'Public Address', 'COMM', 'Public address system'),
  ('CCTV', 'Closed Circuit Television', 'COMM', 'CCTV system'),
  ('TFT', 'Thin Film Transistor', 'COMM', 'TFT display unit'),
  ('PIS', 'Passenger Information System', 'COMM', 'Passenger info system'),
  ('CBTC', 'Communication Based Train Control', 'SAFETY', 'Train control system'),
  ('RADIO', 'Train Radio', 'COMM', 'Train radio communication'),
  ('AC', 'Air Conditioning', 'COMFORT', 'Air conditioning unit'),
  ('BATTERY', 'Battery', 'POWER', 'Energy storage device'),
  ('CHARGER', 'Battery Charger', 'POWER', 'Battery charging device'),
  ('CONVERTER', 'Converter', 'POWER', 'Power conversion device'),
  ('INVERTER', 'Inverter', 'POWER', 'Power inversion device')
ON CONFLICT ("code") DO NOTHING;

SELECT 'Component types created' as status;

-- ============================================
-- 3. ADD COMPONENTS FOR EACH DRAWING
-- ============================================

-- 942-58107 (Controlling Cab) components
INSERT INTO "ComponentType" ("code", "name", "category", "description")
VALUES ('MASTER-CTL', 'Master Controller', 'CONTROL', 'Driver master controller')
ON CONFLICT ("code") DO NOTHING;

-- 942-58108 (Start-up Relay) components
INSERT INTO "ComponentType" ("code", "name", "category", "description")
VALUES
  ('STARTUP-RELAY', 'Start-up Relay', 'CONTROL', 'System start-up relay'),
  ('SHUTDOWN-RELAY', 'Shut-down Relay', 'CONTROL', 'System shut-down relay')
ON CONFLICT ("code") DO NOTHING;

-- 942-58110 (MCB Status) components
INSERT INTO "ComponentType" ("code", "name", "category", "description")
VALUES ('MCB-SENSOR', 'MCB Status Sensor', 'INSTRUMENT', 'MCB trip status sensor')
ON CONFLICT ("code") DO NOTHING;

-- 942-58119 (Speed Control) components
INSERT INTO "ComponentType" ("code", "name", "category", "description")
VALUES
  ('VVVF-INV', 'VVVF Inverter', 'POWER', 'Variable voltage variable frequency inverter'),
  ('TRACTION-MOTOR', 'Traction Motor', 'ACTUATOR', 'AC traction motor'),
  ('HSCB-SWITCH', 'HSCB Switch', 'PROTECTION', 'High speed circuit breaker switch')
ON CONFLICT ("code") DO NOTHING;

-- 942-58120 (VVVF Control) components
INSERT INTO "ComponentType" ("code", "name", "category", "description")
VALUES ('VVVF-CTRL', 'VVVF Controller', 'CONTROL', 'VVVF inverter controller')
ON CONFLICT ("code") DO NOTHING;

-- 942-58123 (Compressor) components
INSERT INTO "ComponentType" ("code", "name", "category", "description")
VALUES ('COMPRESSOR', 'Compressor Motor', 'ACTUATOR', 'Air compressor motor')
ON CONFLICT ("code") DO NOTHING;

-- 942-58125 (Emergency Brake) components
INSERT INTO "ComponentType" ("code", "name", "category", "description")
VALUES
  ('EBCU-UNIT', 'EBCU Unit', 'CONTROL', 'Electronic Brake Control Unit'),
  ('BECU-UNIT', 'BECU Unit', 'CONTROL', 'Brake Electronic Control Unit'),
  ('BRAKE-VALVE', 'Brake Valve', 'ACTUATOR', 'Pneumatic brake valve')
ON CONFLICT ("code") DO NOTHING;

-- 942-58127 (Horn) components
INSERT INTO "ComponentType" ("code", "name", "category", "description")
VALUES ('HORN-RELAY', 'Horn Relay', 'CONTROL', 'Horn relay switch')
ON CONFLICT ("code") DO NOTHING;

-- 942-58130 (APS) components
INSERT INTO "ComponentType" ("code", "name", "category", "description")
VALUES
  ('APS-UNIT', 'APS Unit', 'POWER', 'Auxiliary Power Supply unit'),
  ('SIV-UNIT', 'SIV Unit', 'POWER', 'Static Inverter unit')
ON CONFLICT ("code") DO NOTHING;

-- 942-58132 (Battery) components
INSERT INTO "ComponentType" ("code", "name", "category", "description")
VALUES
  ('BATT-PACK', 'Battery Pack', 'POWER', '110VDC battery pack'),
  ('CHARGER-UNIT', 'Charger Unit', 'POWER', 'Battery charger unit')
ON CONFLICT ("code") DO NOTHING;

-- 942-58136/58139 (Door) components
INSERT INTO "ComponentType" ("code", "name", "category", "description")
VALUES
  ('EDCU-UNIT', 'EDCU Unit', 'CONTROL', 'Electronic Door Control Unit'),
  ('DOOR-MOTOR', 'Door Motor', 'ACTUATOR', 'Door operating motor'),
  ('DOOR-INTERLOCK', 'Door Interlock', 'SAFETY', 'Door interlock switch')
ON CONFLICT ("code") DO NOTHING;

-- 942-58143/58144 (Aircon) components
INSERT INTO "ComponentType" ("code", "name", "category", "description")
VALUES
  ('AC-COMPRESSOR', 'AC Compressor', 'ACTUATOR', 'Air conditioning compressor'),
  ('AC-FAN', 'AC Fan', 'ACTUATOR', 'Air conditioning fan')
ON CONFLICT ("code") DO NOTHING;

-- 942-58146 (TCMS) components
INSERT INTO "ComponentType" ("code", "name", "category", "description")
VALUES
  ('ETH-SWITCH', 'Ethernet Switch', 'COMM', 'Industrial Ethernet switch'),
  ('CAN-BUS', 'CAN Bus Interface', 'COMM', 'CAN bus interface')
ON CONFLICT ("code") DO NOTHING;

-- 942-58149 (CCU/PAPIS) components
INSERT INTO "ComponentType" ("code", "name", "category", "description")
VALUES
  ('PAPIS-UNIT', 'PAPIS Unit', 'COMM', 'Passenger Address and Public Information System')
ON CONFLICT ("code") DO NOTHING;

-- 942-58150 (PA) components
INSERT INTO "ComponentType" ("code", "name", "category", "description")
VALUES
  ('PA-AMP', 'PA Amplifier', 'COMM', 'Public Address amplifier'),
  ('PA-SPKR', 'PA Speaker', 'OUTPUT', 'Public Address speaker')
ON CONFLICT ("code") DO NOTHING;

-- 942-58152 (CBTC) components
INSERT INTO "ComponentType" ("code", "name", "category", "description")
VALUES
  ('CBTC-CU', 'CBTC Control Unit', 'SAFETY', 'Communication Based Train Control unit'),
  ('CBTC-ANT', 'CBTC Antenna', 'COMM', 'CBTC communication antenna')
ON CONFLICT ("code") DO NOTHING;

-- 942-58154 (CCTV) components
INSERT INTO "ComponentType" ("code", "name", "category", "description")
VALUES
  ('CCTV-CAM', 'CCTV Camera', 'COMM', 'CCTV camera unit'),
  ('CCTV-DVR', 'CCTV DVR', 'COMM', 'CCTV digital video recorder')
ON CONFLICT ("code") DO NOTHING;

SELECT 'Component types complete' as status;

-- ============================================
-- 4. ADD WIRE CONNECTIONS BETWEEN CONNECTORS
-- ============================================

-- Create WireConnection table for direct wire routing
CREATE TABLE IF NOT EXISTS "WireConnection" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "wireId" TEXT NOT NULL,
  "fromConnectorId" TEXT NOT NULL,
  "fromPinNo" TEXT NOT NULL,
  "toConnectorId" TEXT NOT NULL,
  "toPinNo" TEXT NOT NULL,
  "routeNote" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("wireId") REFERENCES "Wire"("id"),
  FOREIGN KEY ("fromConnectorId") REFERENCES "Connector"("id"),
  FOREIGN KEY ("toConnectorId") REFERENCES "Connector"("id")
);

-- Create WireSegment table for wire segments
CREATE TABLE IF NOT EXISTS "WireSegment" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "wireId" TEXT NOT NULL,
  "segmentNo" INTEGER,
  "fromConnectorCode" TEXT,
  "fromPinNo" TEXT,
  "toConnectorCode" TEXT,
  "toPinNo" TEXT,
  "length" TEXT,
  "route" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("wireId") REFERENCES "Wire"("id")
);

-- Generate wire connections from pin data
INSERT INTO "WireConnection" ("id", "wireId", "fromConnectorId", "fromPinNo", "toConnectorId", "toPinNo", "routeNote")
SELECT DISTINCT ON (w.id, cp1."connectorId", cp2."connectorId")
  gen_random_uuid()::text,
  w.id,
  cp1."connectorId",
  cp1."pinNo",
  cp2."connectorId",
  cp2."pinNo",
  'Via ' || w."wireNo" || ' (' || w."signalName" || ')'
FROM "ConnectorPin" cp1
JOIN "ConnectorPin" cp2 ON cp1."wireNo" = cp2."wireNo" AND cp1."connectorId" != cp2."connectorId"
JOIN "Wire" w ON w."wireNo" = cp1."wireNo"
WHERE cp1."wireNo" IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM "WireConnection" wc
  WHERE wc."wireId" = w.id
  AND wc."fromConnectorId" = cp1."connectorId"
  AND wc."toConnectorId" = cp2."connectorId"
);

SELECT 'Wire connections created: ' || COUNT(*) FROM "WireConnection";

-- Generate wire segments from pin data
INSERT INTO "WireSegment" ("id", "wireId", "segmentNo", "fromConnectorCode", "fromPinNo", "toConnectorCode", "toPinNo", "route")
SELECT
  gen_random_uuid()::text,
  w.id,
  ROW_NUMBER() OVER (PARTITION BY w.id ORDER BY c1."connectorCode", cp1."pinNo"),
  c1."connectorCode",
  cp1."pinNo",
  c2."connectorCode",
  cp2."pinNo",
  w."signalName" || ' via ' || w."wireNo"
FROM "ConnectorPin" cp1
JOIN "ConnectorPin" cp2 ON cp1."wireNo" = cp2."wireNo" AND cp1."connectorId" != cp2."connectorId"
JOIN "Connector" c1 ON c1.id = cp1."connectorId"
JOIN "Connector" c2 ON c2.id = cp2."connectorId"
JOIN "Wire" w ON w."wireNo" = cp1."wireNo"
WHERE cp1."wireNo" IS NOT NULL;

SELECT 'Wire segments created: ' || COUNT(*) FROM "WireSegment";

-- ============================================
-- 5. FINAL COUNTS
-- ============================================

SELECT '=== COMPLETE DATABASE STATE ===' as status;
SELECT tbl, cnt FROM (
  SELECT 'Drawings' as tbl, COUNT(*) as cnt FROM "Drawing"
  UNION ALL SELECT 'Systems', COUNT(*) FROM "System"
  UNION ALL SELECT 'Subsystems', COUNT(*) FROM "Subsystem"
  UNION ALL SELECT 'Connectors', COUNT(*) FROM "Connector"
  UNION ALL SELECT 'ConnectorPins', COUNT(*) FROM "ConnectorPin"
  UNION ALL SELECT 'Wires', COUNT(*) FROM "Wire"
  UNION ALL SELECT 'DrawingWires', COUNT(*) FROM "DrawingWire"
  UNION ALL SELECT 'WireEndpoints', COUNT(*) FROM "WireEndpoint"
  UNION ALL SELECT 'WireConnections', COUNT(*) FROM "WireConnection"
  UNION ALL SELECT 'WireSegments', COUNT(*) FROM "WireSegment"
  UNION ALL SELECT 'Devices', COUNT(*) FROM "Device"
  UNION ALL SELECT 'Circuits', COUNT(*) FROM "Circuit"
  UNION ALL SELECT 'CircuitEndpoints', COUNT(*) FROM "CircuitEndpoint"
  UNION ALL SELECT 'Signals', COUNT(*) FROM "Signal"
  UNION ALL SELECT 'Trainlines', COUNT(*) FROM "TrainLine"
  UNION ALL SELECT 'ComponentTypes', COUNT(*) FROM "ComponentType"
  UNION ALL SELECT 'PageMappings', COUNT(*) FROM "DrawingPageMapping"
  UNION ALL SELECT 'SourceFiles', COUNT(*) FROM "SourceFile"
) ORDER BY tbl;

COMMIT;
