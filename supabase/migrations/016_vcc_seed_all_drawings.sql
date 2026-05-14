-- 003_vcc_seed_all_drawings.sql
-- Complete VCC Drawing Master from Drawing List 942-58099
-- All 50+ drawings with system classification, car applicability, and cross-references

BEGIN;

-- ============================================
-- SEED ALL VCC DRAWINGS
-- ============================================

INSERT INTO "Drawing" ("id", "projectId", "systemId", "drawingNo", "revision", "title", "totalSheets", "isReference", "remarks", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    p.id,
    s.id,
    d.drawing_no,
    d.revision,
    d.title,
    d.total_sheets,
    false,
    d.remarks,
    now(),
    now()
FROM "Project" p
CROSS JOIN "System" s
CROSS JOIN (
    VALUES
        -- GENERAL SYSTEM (1-10)
        ('942-58099', '0', 'Drawing List', 1, 'GENERAL', 'Master drawing register from VCC Description'),
        ('942-58100', '0', 'Classification', 1, 'GENERAL', 'System classification page - lists all subsystems'),
        ('942-58101', '0', 'Wiring Numbers, Description', 1, 'GENERAL', 'Wire numbering system, 5-digit format, UNIT+CARTYPE+TRAINLINES+SERIALNO'),
        ('942-58102', '0', 'Symbols', 4, 'GENERAL', 'IEC style symbols and abbreviations - multi-sheet document'),
        ('942-58103', '0', 'Train Lines, Control', 4, 'GENERAL', 'Control train lines with X1/X2 jumper connectors'),
        ('942-58104', '0', 'Train Lines, Signal', 8, 'GENERAL', 'Signal train lines with RS422/RS485 communication'),
        ('942-58105', '0', 'Train Lines, Low Tension Power', 1, 'GENERAL', 'Low tension 110V DC power distribution'),
        ('942-58106', '0', 'Train Lines, High Tension Power', 1, 'GENERAL', 'High tension 750V HV propulsion power'),
        ('942-58107', '1', 'Controlling Cab', 1, 'AUX', 'Cab equipment control - active cab designation'),
        ('942-58108', '0', 'Start-up Relay', 1, 'AUX', 'System start-up relay control circuit'),
        ('942-58109', '1', 'System Status Indication', 2, 'AUX', 'System status indicator lights - car specific sheets'),
        ('942-58110', '0', 'MCB Trip Status Monitoring', 2, 'AUX', 'Main circuit breaker trip status monitoring'),
        ('942-58111', '0', 'DC Train Line Supply Contactor', 1, 'AUX', 'DC train line power supply contactor control'),
        ('942-58112', '0', 'Head Cab Main Light', 1, 'GENERAL', 'Head cab front light circuit'),
        ('942-58113', '0', 'Tail Light, Flasher Light, Console Light', 1, 'GENERAL', 'Tail and marker lights'),
        ('942-58114', '0', 'Interior Light', 1, 'GENERAL', 'Saloon interior lighting circuit'),
        ('942-58115', '0', 'Interior Light', 1, 'GENERAL', 'Saloon interior lighting circuit continuation'),
        ('942-58116', '0', 'Windscreen Wiper', 1, 'GENERAL', 'Driver windscreen wiper circuit'),
        ('942-58117', '0', 'Coupling Uncoupling Control', 1, 'GENERAL', 'Train coupling/uncoupling control'),

        -- TRACTION SYSTEM (19-21)
        ('942-58119', '1', 'Speed Control', 2, 'TRACTION', 'Traction speed control system'),
        ('942-58120', '0', 'VVVF Control', 1, 'TRACTION', 'Variable Voltage Variable Frequency inverter control'),
        ('942-58121', '0', 'Traction Return Current', 1, 'TRACTION', 'Traction motor return current path'),

        -- BRAKE SYSTEM (23-29)
        ('942-58123', '0', 'Compressor Control', 1, 'BRAKE', 'Air brake compressor control (TC car only)'),
        ('942-58124', '0', 'Brake Loop', 1, 'BRAKE', 'Brake control loop circuit'),
        ('942-58125', '1', 'Emergency Brake', 2, 'BRAKE', 'Emergency brake circuit - multi-sheet'),
        ('942-58126', '0', 'Parking Brake', 1, 'BRAKE', 'Parking brake application circuit'),
        ('942-58127', '0', 'Horn', 1, 'BRAKE', 'Driver horn control (DMC only)'),
        ('942-58128', '0', 'Brake Control', 1, 'BRAKE', 'Brake control circuit (DMC, MC)'),
        ('942-58129', '0', 'Brake Control', 1, 'BRAKE', 'Brake control circuit (TC)'),

        -- AUXILIARY SYSTEM (30-32)
        ('942-58130', '0', 'APS', 2, 'AUX', 'Auxiliary Power Supply - multi-sheet'),
        ('942-58131', '0', 'AC 415V Shore Supply Circuit', 1, 'AUX', 'AC 415V shore supply connection circuit'),
        ('942-58132', '0', 'Battery Control', 1, 'AUX', 'Battery charging and control circuit'),

        -- DOOR SYSTEM (36-42)
        ('942-58136', '1', 'Door Operation Left', 1, 'DOOR', 'Left door operation control - DMC/TC/MC'),
        ('942-58137', '0', 'Saloon Door Supply Voltage', 1, 'DOOR', 'Saloon door power supply voltage selection'),
        ('942-58138', '1', 'Door Operation Left', 1, 'DOOR', 'Left door operation - revised'),
        ('942-58139', '1', 'Door Operation Right', 2, 'DOOR', 'Right door operation - multi-sheet'),
        ('942-58140', '0', 'Door Proving Loop', 1, 'DOOR', 'Door closed/open proving loop circuit'),
        ('942-58141', '1', 'Local Door Interlock', 1, 'DOOR', 'Local door interlock circuit'),
        ('942-58142', '0', 'Door Communication With IMS', 1, 'DOOR', 'Door system communication with IMS/TIMS'),

        -- AIR CONDITIONING SYSTEM (43-45)
        ('942-58143', '0', 'Cab VAC', 1, 'AIRCON', 'Cab air conditioning control (DMC only)'),
        ('942-58144', '0', 'Saloon VAC Power', 1, 'AIRCON', 'Saloon AC power supply circuit'),
        ('942-58145', '0', 'Saloon VAC Control', 2, 'AIRCON', 'Saloon AC control - multi-sheet'),

        -- TIMS/COMM SYSTEM (46-54)
        ('942-58146', '0', 'TCMS Communication', 4, 'TIMS', 'Train Control Monitoring System communication'),
        ('942-58147', '0', 'TFT FDI-TNI DMC', 1, 'COMM', 'TFT display for DMC car'),
        ('942-58148', '0', 'TFT TC, MC', 1, 'COMM', 'TFT display for TC and MC cars'),
        ('942-58149', '0', 'CCU, PAPIS CCTV System DMC', 1, 'COMM', 'Central Control Unit, PAPIS, CCTV for DMC'),
        ('942-58150', '0', 'PA Amplifier DMC, MC', 1, 'COMM', 'Public Address amplifier for DMC and MC'),
        ('942-58151', '0', 'PA Amplifier TC', 1, 'COMM', 'Public Address amplifier for TC'),
        ('942-58152', '4', 'CBTC', 5, 'COMM', 'Communication Based Train Control - multi-sheet'),
        ('942-58153', '0', 'Train Radio Interface', 1, 'COMM', 'Train radio communication interface'),
        ('942-58154', '0', 'CCTV', 1, 'COMM', 'Closed Circuit Television system')
) AS d(drawing_no, revision, title, total_sheets, system_code, remarks)
WHERE p."projectCode" = 'KMRCL-RS3R'
  AND s."code" = d.system_code
ON CONFLICT ("projectId", "drawingNo", "revision") DO UPDATE
SET "title" = EXCLUDED."title",
    "systemId" = EXCLUDED."systemId",
    "totalSheets" = EXCLUDED."totalSheets",
    "remarks" = EXCLUDED."remarks";

-- ============================================
-- DRAWING APPLICABILITY (DMC/TC/MC/ALL)
-- ============================================

INSERT INTO "DrawingApplicability" ("id", "drawingId", "carType", "applicable", "remark")
SELECT
    gen_random_uuid()::text,
    d.id,
    x.car_type,
    x.applicable,
    x.remark
FROM "Drawing" d
CROSS JOIN (
    VALUES
        -- Most drawings apply to ALL cars
        ('ALL', true, 'Standard VCC drawing - applies to all car types'),
        -- Traction drawings (MC motor cars only for VVVF)
        ('MC', true, 'VVVF control for motor cars'),
        -- TC specific
        ('TC', false, 'TC car does not have traction'),
        -- DMC specific (Horn)
        ('DMC', false, 'DMC specific - horn circuit')
) AS x(car_type, applicable, remark)
WHERE d."drawingNo" IN ('942-58103', '942-58104', '942-58105', '942-58106')
ON CONFLICT ("drawingId", "carType") DO NOTHING;

-- ============================================
-- DRAWING REFERENCES (Cross-links to Reference Drawings)
-- ============================================

INSERT INTO "DrawingReference" ("id", "drawingId", "referenceId", "relationType", "note")
SELECT
    gen_random_uuid()::text,
    d.id,
    r.id,
    'REFERENCE',
    'Imported from VCC drawing list 942-58099'
FROM "Drawing" d
JOIN "ReferenceDrawing" r ON r."refNo" IN (
    'H7L7956', 'H12E279', 'H7K3870', 'H39U956', 'H7K3871',
    'ED910111R14', 'TA4560311', 'FT0053014-100', 'FT0053013-100'
)
WHERE d."drawingNo" = '942-58099'
ON CONFLICT ("drawingId", "referenceId", "relationType") DO NOTHING;

-- ============================================
-- CRITICAL DRAWING NOTES (From VCC pages)
-- ============================================

INSERT INTO "DrawingNote" ("id", "drawingId", "noteType", "noteText", "sourceSheet")
SELECT
    gen_random_uuid()::text,
    d.id,
    'CROSS_CONNECTION',
    'In X1 jumper plug, at pin no. 19/20, internally cables 3005 and 3006 are cross connected',
    '942-58103'
FROM "Drawing" d
WHERE d."drawingNo" = '942-58103';

INSERT INTO "DrawingNote" ("id", "drawingId", "noteType", "noteText", "sourceSheet")
SELECT
    gen_random_uuid()::text,
    d.id,
    'CROSS_CONNECTION',
    'In X1 jumper plug, at pin no. 43/44, internally cables 6009 and 6046 are cross connected',
    '942-58103'
FROM "Drawing" d
WHERE d."drawingNo" = '942-58103';

INSERT INTO "DrawingNote" ("id", "drawingId", "noteType", "noteText", "sourceSheet")
SELECT
    gen_random_uuid()::text,
    d.id,
    'CROSS_CONNECTION',
    'In X1 jumper plug, at pin no. 46/47, internally cables 6014 and 6051 are cross connected',
    '942-58103'
FROM "Drawing" d
WHERE d."drawingNo" = '942-58103';

INSERT INTO "DrawingNote" ("id", "drawingId", "noteType", "noteText", "sourceSheet")
SELECT
    gen_random_uuid()::text,
    d.id,
    'CROSS_CONNECTION',
    'In X2 jumper plug, at pin no. 29/31, internally cables 92431 and 92451 are cross connected',
    '942-58104'
FROM "Drawing" d
WHERE d."drawingNo" = '942-58104';

INSERT INTO "DrawingNote" ("id", "drawingId", "noteType", "noteText", "sourceSheet")
SELECT
    gen_random_uuid()::text,
    d.id,
    'CROSS_CONNECTION',
    'In X2 jumper plug, at pin no. 30/32, internally cables 92432 and 92452 are cross connected',
    '942-58104'
FROM "Drawing" d
WHERE d."drawingNo" = '942-58104';

-- Wire numbering rule note
INSERT INTO "DrawingNote" ("id", "drawingId", "noteType", "noteText", "sourceSheet")
SELECT
    gen_random_uuid()::text,
    d.id,
    'WIRING_RULE',
    'Wire numbering system is composed of 5 digits: UNIT + CAR TYPE + TRAINLINES + SERIAL NO (0001 to 9999). Car types: D = DMC, T = TC, M = MC',
    '942-58101'
FROM "Drawing" d
WHERE d."drawingNo" = '942-58101';

-- ============================================
-- TRAIN LINES SEED (From 942-58103 and 942-58104)
-- ============================================

INSERT INTO "TrainLine" ("id", "drawingId", "lineGroup", "itemName", "wireNo", "connectorCode", "pinNo", "carType", "note")
SELECT
    gen_random_uuid()::text,
    d.id,
    'CONTROL',
    'Forward and Reverse cross connection',
    '3005-3006',
    'X1',
    '19/20',
    'ALL',
    'Forward and Reverse internally cross connected in X1 jumper plug'
FROM "Drawing" d
WHERE d."drawingNo" = '942-58103';

INSERT INTO "TrainLine" ("id", "drawingId", "lineGroup", "itemName", "wireNo", "connectorCode", "pinNo", "carType", "note")
SELECT
    gen_random_uuid()::text,
    d.id,
    'CONTROL',
    'Door Open Left and Door Close Left cross connection',
    '6009-6046',
    'X1',
    '43/44',
    'ALL',
    'Door open left and paired wire internally cross connected in X1 jumper plug'
FROM "Drawing" d
WHERE d."drawingNo" = '942-58103';

INSERT INTO "TrainLine" ("id", "drawingId", "lineGroup", "itemName", "wireNo", "connectorCode", "pinNo", "carType", "note")
SELECT
    gen_random_uuid()::text,
    d.id,
    'CONTROL',
    'Door Close Left and paired wire cross connection',
    '6014-6051',
    'X1',
    '46/47',
    'ALL',
    'Door close left and paired wire internally cross connected in X1 jumper plug'
FROM "Drawing" d
WHERE d."drawingNo" = '942-58103';

INSERT INTO "TrainLine" ("id", "drawingId", "lineGroup", "itemName", "wireNo", "connectorCode", "pinNo", "carType", "note")
SELECT
    gen_random_uuid()::text,
    d.id,
    'SIGNAL',
    'Rear RS422 TX/RX pair cross connection',
    '92431-92451',
    'X2',
    '29/31',
    'ALL',
    'Rear RS422 TX and RX pair internally cross connected in X2 jumper plug'
FROM "Drawing" d
WHERE d."drawingNo" = '942-58104';

INSERT INTO "TrainLine" ("id", "drawingId", "lineGroup", "itemName", "wireNo", "connectorCode", "pinNo", "carType", "note")
SELECT
    gen_random_uuid()::text,
    d.id,
    'SIGNAL',
    'Rear RS422 TX/RX complementary pair cross connection',
    '92432-92452',
    'X2',
    '30/32',
    'ALL',
    'Rear RS422 TX/RX complementary pair internally cross connected in X2 jumper plug'
FROM "Drawing" d
WHERE d."drawingNo" = '942-58104';

-- ============================================
-- CROSS CONNECTIONS (Detailed)
-- ============================================

INSERT INTO "CrossConnection" ("id", "drawingId", "connectorCode", "pinA", "pinB", "wireA", "wireB", "note")
SELECT
    gen_random_uuid()::text,
    d.id,
    'X1',
    '19',
    '20',
    '3005',
    '3006',
    'Forward and Reverse internally cross connected in X1 jumper plug - 942-58103'
FROM "Drawing" d
WHERE d."drawingNo" = '942-58103';

INSERT INTO "CrossConnection" ("id", "drawingId", "connectorCode", "pinA", "pinB", "wireA", "wireB", "note")
SELECT
    gen_random_uuid()::text,
    d.id,
    'X1',
    '43',
    '44',
    '6009',
    '6046',
    'Door open left internally cross connected in X1 jumper plug - 942-58103'
FROM "Drawing" d
WHERE d."drawingNo" = '942-58103';

INSERT INTO "CrossConnection" ("id", "drawingId", "connectorCode", "pinA", "pinB", "wireA", "wireB", "note")
SELECT
    gen_random_uuid()::text,
    d.id,
    'X1',
    '46',
    '47',
    '6014',
    '6051',
    'Door close left internally cross connected in X1 jumper plug - 942-58103'
FROM "Drawing" d
WHERE d."drawingNo" = '942-58103';

INSERT INTO "CrossConnection" ("id", "drawingId", "connectorCode", "pinA", "pinB", "wireA", "wireB", "note")
SELECT
    gen_random_uuid()::text,
    d.id,
    'X2',
    '29',
    '31',
    '92431',
    '92451',
    'Rear RS422 TX/RX pair internally cross connected in X2 jumper plug - 942-58104'
FROM "Drawing" d
WHERE d."drawingNo" = '942-58104';

INSERT INTO "CrossConnection" ("id", "drawingId", "connectorCode", "pinA", "pinB", "wireA", "wireB", "note")
SELECT
    gen_random_uuid()::text,
    d.id,
    'X2',
    '30',
    '32',
    '92432',
    '92452',
    'Rear RS422 TX/RX complementary pair internally cross connected in X2 jumper plug - 942-58104'
FROM "Drawing" d
WHERE d."drawingNo" = '942-58104';

COMMIT;