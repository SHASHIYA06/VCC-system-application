-- 002_vcc_seed_master_data.sql
-- Seed master data for KMRCL RS3R VCC system
-- Project, Formation, Car Types, Systems, Conductor Classes, Connector Types, Reference Drawings

BEGIN;

-- ============================================
-- PROJECT
-- ============================================

INSERT INTO "Project" ("id", "projectCode", "projectName", "description", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid()::text,
    'KMRCL-RS3R',
    'KMRCL RS3R METRO CARS',
    'Vehicle Control Circuits (VCC) for KMRCL RS3R Metro Cars - 6-car formation DMC-TC-MC-MC-TC-DMC',
    now(),
    now()
)
ON CONFLICT ("projectCode") DO UPDATE
SET "projectName" = EXCLUDED."projectName",
    "description" = EXCLUDED."description",
    "updatedAt" = now();

-- ============================================
-- FORMATION (6-CAR)
-- ============================================

INSERT INTO "Formation" ("id", "projectId", "formationCode", "formationName", "carCount", "description")
SELECT
    gen_random_uuid()::text,
    p.id,
    '6CAR',
    '6-CAR FORMATION',
    6,
    'DMC-TC-MC-MC-TC-DMC - Standard 6-car metro formation'
FROM "Project" p
WHERE p."projectCode" = 'KMRCL-RS3R'
ON CONFLICT ("projectId", "formationCode") DO UPDATE
SET "formationName" = EXCLUDED."formationName",
    "carCount" = EXCLUDED."carCount",
    "description" = EXCLUDED."description";

-- ============================================
-- CARS
-- ============================================

INSERT INTO "Car" ("id", "formationId", "carPosition", "carCode", "carType", "carLabel")
SELECT
    gen_random_uuid()::text,
    f.id,
    x.pos,
    x.code,
    x.car_type,
    x.label
FROM "Formation" f
CROSS JOIN (
    VALUES
        (1, 'CAR1', 'DMC', 'DMC CAR 1 (Leading)'),
        (2, 'CAR2', 'TC',  'TC CAR 1 (Trailer)'),
        (3, 'CAR3', 'MC',  'MC CAR 1 (Motor)'),
        (4, 'CAR4', 'MC',  'MC CAR 2 (Motor)'),
        (5, 'CAR5', 'TC',  'TC CAR 2 (Trailer)'),
        (6, 'CAR6', 'DMC', 'DMC CAR 2 (Trailing)')
) AS x(pos, code, car_type, label)
WHERE f."formationCode" = '6CAR'
ON CONFLICT ("formationId", "carPosition") DO NOTHING;

-- ============================================
-- SYSTEMS (8 Main Systems)
-- ============================================

INSERT INTO "System" ("id", "code", "name", "category", "description", "sortOrder") VALUES
(gen_random_uuid()::text, 'GENERAL', 'General', 'BASE', 'General vehicle interface drawings, symbols, wiring rules', 10),
(gen_random_uuid()::text, 'TRACTION', 'Traction System', 'POWER', 'Traction and speed control, VVVF control, traction return', 20),
(gen_random_uuid()::text, 'BRAKE', 'Brake System', 'SAFETY', 'Brake loop, emergency brake, parking brake, horn', 30),
(gen_random_uuid()::text, 'AUX', 'Auxiliary Electric System', 'POWER', 'APS, shore supply, battery, auxiliary control, MCB monitoring', 40),
(gen_random_uuid()::text, 'DOOR', 'Door System', 'PASSENGER', 'Door operation, proving loop, interlock, IMS communication', 50),
(gen_random_uuid()::text, 'AIRCON', 'Air Conditioning System', 'COMFORT', 'Cab VAC, saloon VAC power and control', 60),
(gen_random_uuid()::text, 'TIMS', 'Train Integrated Management System', 'CONTROL', 'TCMS communication, RIO units, communication nodes', 70),
(gen_random_uuid()::text, 'COMM', 'Communication System', 'COMM', 'PIB, TFT, PA, CCTV, CBTC, train radio', 80)
ON CONFLICT ("code") DO UPDATE
SET "name" = EXCLUDED."name",
    "category" = EXCLUDED."category",
    "description" = EXCLUDED."description",
    "sortOrder" = EXCLUDED."sortOrder";

-- ============================================
-- CONDUCTOR CLASSES (From VCC Drawing 942-58101)
-- ============================================

INSERT INTO "ConductorClass" ("code", "description", "voltageDomain") VALUES
('ED', 'Main circuit - 750V HV propulsion circuits and supply of AC traction motors', 'HV'),
('AP', 'Auxiliary power circuits - 415V/230V 50Hz', 'AC'),
('BA', 'Conductors directly supplied by the battery control - 110VDC', 'DC'),
('S',  'Measuring and analog voltage signals - shielded cables', 'SIGNAL'),
('PE', 'Protecting earthing', 'EARTH'),
('GD', 'Grounding', 'GROUND'),
('SP', 'Spare', 'SPARE')
ON CONFLICT ("code") DO UPDATE
SET "description" = EXCLUDED."description",
    "voltageDomain" = EXCLUDED."voltageDomain";

-- ============================================
-- CONNECTOR TYPES (X1 to X10 from VCC)
-- ============================================

INSERT INTO "ConnectorType" ("code", "nominalPins", "description", "voltageClass", "remarks") VALUES
('X1', 74, 'Connector for control signal - 74P jumper plug', 'CONTROL', 'Train line control jumper connector'),
('X2', 74, 'Connector for control signal - 74PW jumper plug', 'CONTROL', 'Train line signal jumper connector'),
('X3', 11, 'Connector for 415V AC / 230V AC', 'AC', 'Power connector'),
('X4', 3,  'Connector for 110V DC', 'DC', 'DC power connector'),
('X5', NULL, 'Connector for CCTV, TCMS, EBCU', 'COMM', 'Communication/data connector'),
('X6', 1,  'Connector for high tension power', 'HT', 'HV power connector'),
('X7', 1,  'Connector for high tension earth', 'HT', 'HV earth connector'),
('X8', NULL, 'Connector for EOSS1 (External Door Override Switch)', 'SIGNAL', 'Door safety system'),
('X9', NULL, 'Connector for EOSS2 (External Door Override Switch)', 'SIGNAL', 'Door safety system'),
('X10', NULL, 'Connector for CBTC (Communication Based Train Control)', 'COMM', 'Train control system');

-- Additional connector types from detailed drawings
INSERT INTO "ConnectorType" ("code", "nominalPins", "description", "voltageClass", "remarks")
VALUES
('X01', NULL, 'Interface connector for VAC systems', 'AC', 'From FT0053014-100'),
('X02', NULL, 'Interface connector for I/O modules', 'DC', 'From FT0053013-100'),
('X03', NULL, 'Interface connector for control circuits', 'CONTROL', 'From FT0053013-100'),
('CN1', NULL, 'Communication Node 1 connector', 'COMM', 'TCMS CN1'),
('CN2', NULL, 'Communication Node 2 connector', 'COMM', 'TCMS CN2'),
('M12', NULL, 'M12 Ethernet connector port', 'COMM', 'Industrial Ethernet connector')
ON CONFLICT ("code") DO NOTHING;

-- ============================================
-- REFERENCE DRAWINGS (From VCC Drawing List 942-58099)
-- ============================================

INSERT INTO "ReferenceDrawing" ("id", "projectId", "refNo", "title", "revision", "sourceOrg", "remarks")
SELECT
    gen_random_uuid()::text,
    p.id,
    r.ref_no,
    r.title,
    r.revision,
    r.source_org,
    r.remarks
FROM "Project" p
CROSS JOIN (
    VALUES
        ('H7L7956', 'Schematic Diagram of Power Circuit', '', 'Mitsubishi/BEML', 'Traction power reference'),
        ('H12E279', 'Inverter, Schematic Diagram of Control Circuit', '', 'Mitsubishi', 'VVVF control reference'),
        ('H7K3870', 'Schematic Diagram of Control Circuit of APS', '', 'Mitsubishi', 'Auxiliary power supply reference'),
        ('H39U956', 'Auxiliary Power Extension Circuit Diagram', '', 'Mitsubishi', 'APS extension reference'),
        ('H7K3871', 'Shore Supply Circuit', '', 'Mitsubishi', 'AC 415V shore supply reference'),
        ('ED910111R14', 'Door Wiring Diagram', '01', 'KMRCL/BEML', 'Saloon door wiring reference'),
        ('TA4560311', 'Brake Piping Diagram', '05', 'Knorr-Bremse', 'Brake system reference'),
        ('FT0053014-100', 'Cab VAC Electrical Schematic', '', 'Faiveley/Wabtec', 'Cab HVAC electrical reference'),
        ('FT0053013-100', 'Saloon VAC Electrical Schematic', '', 'Faiveley/Wabtec', 'Saloon HVAC electrical reference')
) AS r(ref_no, title, revision, source_org, remarks)
WHERE p."projectCode" = 'KMRCL-RS3R'
ON CONFLICT ("refNo") DO UPDATE
SET "title" = EXCLUDED."title",
    "sourceOrg" = EXCLUDED."sourceOrg",
    "remarks" = EXCLUDED."remarks";

COMMIT;