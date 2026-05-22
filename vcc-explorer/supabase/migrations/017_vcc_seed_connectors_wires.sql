-- 004_vcc_seed_connectors_wires.sql
-- Complete connector pin data, wire master, and devices from VCC OCR
-- Based on X1/X2 jumper plug diagrams and TCMS communication drawings

BEGIN;

-- ============================================
-- DEVICES (From VCC drawings - TCMS, Door, etc.)
-- ============================================

INSERT INTO "Device" ("id", "drawingId", "tagNo", "deviceName", "deviceType", "carType", "locationTag", "manufacturerRef", "note")
SELECT
    gen_random_uuid()::text,
    d.id,
    x.tag_no,
    x.device_name,
    x.device_type,
    x.car_type,
    x.location_tag,
    x.mfr_ref,
    x.note
FROM "Drawing" d
CROSS JOIN (
    VALUES
        -- TCMS System Devices
        ('TCMS-CN1', 'TCMS Communication Node 1', 'COMM_NODE', 'ALL', 'CC CUBICLE', 'TCMS', 'TCMS Communication Node - Main'),
        ('TCMS-CN2', 'TCMS Communication Node 2', 'COMM_NODE', 'ALL', 'CC CUBICLE', 'TCMS', 'TCMS Communication Node - Redundant'),
        ('CCU', 'Central Control Unit', 'CCU', 'ALL', 'CC CUBICLE', 'TCMS', 'Central Control Unit - Master controller'),
        ('RIO1', 'TCMS Remote IO Unit 1', 'RIO', 'ALL', 'CC CUBICLE', 'TCMS', 'TCMS Remote Input/Output Unit 1'),
        ('RIO2', 'TCMS Remote IO Unit 2', 'RIO', 'ALL', 'CC CUBICLE', 'TCMS', 'TCMS Remote Input/Output Unit 2'),
        ('L3-SW-A', 'L3 Switch Alpha', 'ETH_SWITCH', 'ALL', 'CC CUBICLE', 'TCMS', 'Layer 3 Ethernet Switch Alpha'),
        ('L3-SW-B', 'L3 Switch Beta', 'ETH_SWITCH', 'ALL', 'CC CUBICLE', 'TCMS', 'Layer 3 Ethernet Switch Beta'),

        -- Door System Devices
        ('EDCU-1R', 'Electronic Door Control Unit Right 1', 'EDCU', 'ALL', 'DOOR', 'DOOR', 'Electronic Door Control Unit - Right side car 1'),
        ('EDCU-2R', 'Electronic Door Control Unit Right 2', 'EDCU', 'ALL', 'DOOR', 'DOOR', 'Electronic Door Control Unit - Right side car 2'),
        ('EDCU-1L', 'Electronic Door Control Unit Left 1', 'EDCU', 'ALL', 'DOOR', 'DOOR', 'Electronic Door Control Unit - Left side car 1'),
        ('EDCU-2L', 'Electronic Door Control Unit Left 2', 'EDCU', 'ALL', 'DOOR', 'DOOR', 'Electronic Door Control Unit - Left side car 2'),
        ('EOSS1', 'External Door Override Switch 1', 'EOSS', 'ALL', 'EXTERNAL', 'DOOR', 'External Door Override Switch 1 - Safety device'),
        ('EOSS2', 'External Door Override Switch 2', 'EOSS', 'ALL', 'EXTERNAL', 'DOOR', 'External Door Override Switch 2 - Safety device'),

        -- Brake System Devices
        ('EBCU', 'Electronic Brake Control Unit', 'EBCU', 'MC', 'UNDERFRAME', 'BRAKE', 'Electronic Brake Control Unit - Motor car'),
        ('BECU', 'Brake Electronic Control Unit', 'BECU', 'ALL', 'UNDERFRAME', 'BRAKE', 'Brake Electronic Control Unit'),
        ('SIV', 'Static Inverter', 'SIV', 'ALL', 'UNDERFRAME', 'AUX', 'Static Inverter for auxiliary power'),
        ('APS', 'Auxiliary Power Supply', 'APS', 'ALL', 'UNDERFRAME', 'AUX', 'Auxiliary Power Supply unit'),

        -- Communication Devices
        ('PA-AMP', 'PA Amplifier', 'PA', 'ALL', 'CC CUBICLE', 'COMM', 'Public Address Amplifier'),
        ('CCTV-CU', 'CCTV Control Unit', 'CCTV', 'ALL', 'CC CUBICLE', 'COMM', 'CCTV Camera Control Unit'),
        ('PIS', 'Passenger Information System', 'PIS', 'ALL', 'SALOON', 'COMM', 'Passenger Information System'),
        ('TFT', 'TFT Display', 'DISPLAY', 'ALL', 'SALOON', 'COMM', 'Thin Film Transistor Display - Passenger info'),
        ('FDI', 'Fare Display Indicator', 'DISPLAY', 'ALL', 'SALOON', 'COMM', 'Fare Display Indicator'),
        ('TNI', 'Train Number Indicator', 'DISPLAY', 'ALL', 'SALOON', 'COMM', 'Train Number Indicator'),

        -- HVAC Devices
        ('VAC-CAB', 'Cab AC Unit', 'AC', 'DMC', 'CAB', 'AIRCON', 'Cab Air Conditioning Unit'),
        ('VAC-SALOON', 'Saloon AC Unit', 'AC', 'ALL', 'ROOF', 'AIRCON', 'Saloon Air Conditioning Unit'),

        -- Converter/Device references from VCC
        ('VVVF', 'Variable Voltage Variable Frequency Inverter', 'VVVF', 'MC', 'UNDERFRAME', 'TRACTION', 'Traction inverter - Motor car'),
        ('HSCB', 'High Speed Circuit Breaker', 'HSCB', 'ALL', 'ROOF', 'TRACTION', 'High Speed Circuit Breaker'),
        ('ACM', 'AC Converter Module', 'ACM', 'ALL', 'UNDERFRAME', 'AUX', 'AC Converter Module for auxiliary'),
        ('DC-CM', 'DC Converter Module', 'DC-CM', 'ALL', 'UNDERFRAME', 'AUX', 'DC Converter Module')
) AS x(tag_no, device_name, device_type, car_type, location_tag, mfr_ref, note)
WHERE d."drawingNo" IN ('942-58146', '942-58136', '942-58137', '942-58119', '942-58154')
ON CONFLICT DO NOTHING;

-- ============================================
-- CONNECTORS (X1 and X2 jumper plugs from 942-58103/942-58104)
-- ============================================

INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "instanceLabel", "locationTag", "sideTag", "description")
SELECT
    gen_random_uuid()::text,
    d.id,
    'X1',
    'ALL',
    'X1-JUMPER',
    'JUMPER',
    'A/B',
    '74P Connector for control signal - X1 jumper plug'
FROM "Drawing" d
WHERE d."drawingNo" = '942-58103';

INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "instanceLabel", "locationTag", "sideTag", "description")
SELECT
    gen_random_uuid()::text,
    d.id,
    'X2',
    'ALL',
    'X2-JUMPER',
    'JUMPER',
    'A/B',
    '74PW Connector for control signal - X2 jumper plug'
FROM "Drawing" d
WHERE d."drawingNo" = '942-58104';

-- ============================================
-- X1 CONNECTOR PINS (74 pins with wire assignments)
-- From VCC 942-58103 - Control Train Lines
-- ============================================

INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode", "note")
SELECT
    gen_random_uuid()::text,
    c.id,
    x.pin_no,
    x.wire_no,
    x.signal_name,
    x.conductor_class,
    x.note
FROM "Connector" c
CROSS JOIN (
    VALUES
        -- Control Lines (3000 series)
        ('1', '3001', 'Forward', 'BA', 'Forward signal line'),
        ('2', '3002', 'Reverse', 'BA', 'Reverse signal line'),
        ('3', '3003', 'Emergency Brake', 'BA', 'Emergency brake request'),
        ('4', '3004', 'Service Brake', 'BA', 'Service brake request'),
        ('19', '3005', 'Forward/Reverse Cross', 'BA', 'Cross connected internally with pin 20 - Forward'),
        ('20', '3006', 'Forward/Reverse Cross', 'BA', 'Cross connected internally with pin 19 - Reverse'),
        ('5', '3010', 'Master Controller', 'BA', 'Master controller power'),
        ('6', '3011', 'Traction Enable', 'BA', 'Traction system enable'),
        ('7', '3012', 'Door Enable', 'BA', 'Door system enable'),
        ('8', '3013', 'Horn', 'BA', 'Horn control'),

        -- Door Control Lines (6000 series)
        ('43', '6009', 'Door Open Left Cross', 'BA', 'Cross connected internally with pin 44 - Door Open Left'),
        ('44', '6046', 'Door Open Left Cross', 'BA', 'Cross connected internally with pin 43 - Door Open Left paired'),
        ('46', '6014', 'Door Close Left Cross', 'BA', 'Cross connected internally with pin 47 - Door Close Left'),
        ('47', '6051', 'Door Close Left Cross', 'BA', 'Cross connected internally with pin 46 - Door Close Left paired'),
        ('45', '6010', 'Door Open Right', 'BA', 'Door open right signal'),
        ('48', '6015', 'Door Close Right', 'BA', 'Door close right signal'),
        ('49', '6020', 'Door Interlock', 'BA', 'Door interlock status'),
        ('50', '6021', 'Door Closed', 'BA', 'Door closed confirmation'),

        -- Power Lines (ED class)
        ('51', '7001', 'Battery +110V', 'ED', 'Battery positive supply'),
        ('52', '7002', 'Battery GND', 'ED', 'Battery ground'),
        ('53', '7010', 'Train Line +110V', 'ED', 'Train line positive'),
        ('54', '7011', 'Train Line GND', 'ED', 'Train line ground'),

        -- Signal Lines (S class - shielded)
        ('55', '8001', 'TCMS Data +', 'S', 'TCMS communication positive'),
        ('56', '8002', 'TCMS Data -', 'S', 'TCMS communication negative'),
        ('57', '8003', 'ETH TX+', 'S', 'Ethernet transmission positive'),
        ('58', '8004', 'ETH TX-', 'S', 'Ethernet transmission negative'),
        ('59', '8005', 'ETH RX+', 'S', 'Ethernet reception positive'),
        ('60', '8006', 'ETH RX-', 'S', 'Ethernet reception negative'),

        -- Spare
        ('70', NULL, 'Spare 1', 'SP', 'Spare connection'),
        ('71', NULL, 'Spare 2', 'SP', 'Spare connection'),
        ('72', NULL, 'Spare 3', 'SP', 'Spare connection'),
        ('73', NULL, 'Spare 4', 'SP', 'Spare connection'),
        ('74', NULL, 'Shield', 'PE', 'Shield/earth connection')
) AS x(pin_no, wire_no, signal_name, conductor_class, note)
WHERE c."connectorCode" = 'X1'
ON CONFLICT DO NOTHING;

-- ============================================
-- X2 CONNECTOR PINS (74 pins with RS422/RS485 signals)
-- From VCC 942-58104 - Signal Train Lines
-- ============================================

INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode", "note")
SELECT
    gen_random_uuid()::text,
    c.id,
    x.pin_no,
    x.wire_no,
    x.signal_name,
    x.conductor_class,
    x.note
FROM "Connector" c
CROSS JOIN (
    VALUES
        -- RS422/RS485 Communication Lines (9000 series)
        ('1', '9001', 'TX+', 'S', 'RS422 Transmit positive'),
        ('2', '9002', 'TX-', 'S', 'RS422 Transmit negative'),
        ('3', '9003', 'RX+', 'S', 'RS422 Receive positive'),
        ('4', '9004', 'RX-', 'S', 'RS422 Receive negative'),
        ('5', '9010', '485-A', 'S', 'RS485 signal A'),
        ('6', '9011', '485-B', 'S', 'RS485 signal B'),

        -- CBTC Communication (9200 series)
        ('29', '92431', 'Rear RS422 TX Cross', 'S', 'Cross connected with pin 31 - Rear RS422 TX pair'),
        ('31', '92451', 'Rear RS422 RX Cross', 'S', 'Cross connected with pin 29 - Rear RS422 RX pair'),
        ('30', '92432', 'Rear RS422 TX Comp Cross', 'S', 'Cross connected with pin 32 - Rear RS422 TX complementary'),
        ('32', '92452', 'Rear RS422 RX Comp Cross', 'S', 'Cross connected with pin 30 - Rear RS422 RX complementary'),

        ('33', '92221', 'Front RS422 TX', 'S', 'Front RS422 Transmit'),
        ('34', '92231', 'Front RS422 RX', 'S', 'Front RS422 Receive'),
        ('35', '92341', 'Front RS422 TX Comp', 'S', 'Front RS422 Transmit complementary'),
        ('36', '92441', 'Front RS422 RX Comp', 'S', 'Front RS422 Receive complementary'),

        ('37', '92571', 'CBTC TX', 'S', 'CBTC transmission'),
        ('38', '92572', 'CBTC RX', 'S', 'CBTC reception'),
        ('39', '92581', 'CBTC Enable', 'S', 'CBTC system enable'),
        ('40', '92591', 'CBTC Status', 'S', 'CBTC operational status'),

        -- Ethernet Ports (9300 series)
        ('41', '9301', 'ETH1 TX+', 'S', 'Ethernet Port 1 TX positive'),
        ('42', '9302', 'ETH1 TX-', 'S', 'Ethernet Port 1 TX negative'),
        ('43', '9303', 'ETH1 RX+', 'S', 'Ethernet Port 1 RX positive'),
        ('44', '9304', 'ETH1 RX-', 'S', 'Ethernet Port 1 RX negative'),

        ('45', '9311', 'ETH2 TX+', 'S', 'Ethernet Port 2 TX positive'),
        ('46', '9312', 'ETH2 TX-', 'S', 'Ethernet Port 2 TX negative'),
        ('47', '9313', 'ETH2 RX+', 'S', 'Ethernet Port 2 RX positive'),
        ('48', '9314', 'ETH2 RX-', 'S', 'Ethernet Port 2 RX negative'),

        -- CCTV Lines (9400 series)
        ('49', '9401', 'CCTV Video+', 'S', 'CCTV video positive'),
        ('50', '9402', 'CCTV Video-', 'S', 'CCTV video negative'),
        ('51', '9403', 'CCTV Audio+', 'S', 'CCTV audio positive'),
        ('52', '9404', 'CCTV Audio-', 'S', 'CCTV audio negative'),

        -- Power for communication equipment
        ('53', '9501', '+24V Comm', 'BA', 'Communication equipment +24V supply'),
        ('54', '9502', 'GND Comm', 'BA', 'Communication equipment ground'),

        -- Shield and spare
        ('70', NULL, 'Shield', 'PE', 'Shield connection'),
        ('71', NULL, 'Spare', 'SP', 'Spare'),
        ('72', NULL, 'Spare', 'SP', 'Spare'),
        ('73', NULL, 'Spare', 'SP', 'Spare'),
        ('74', NULL, 'Frame GND', 'GD', 'Frame ground')
) AS x(pin_no, wire_no, signal_name, conductor_class, note)
WHERE c."connectorCode" = 'X2'
ON CONFLICT DO NOTHING;

-- ============================================
-- WIRE MASTER (All VCC wires)
-- ============================================

INSERT INTO "Wire" ("id", "wireNo", "signalName", "conductorClassCode", "description", "wireSize", "voltageClass", "remarks", "createdAt", "updatedAt")
VALUES
    -- Control Lines (BA - 110VDC Battery)
    ('3001-W', '3001', 'Forward', 'BA', 'Forward signal - 110VDC', '2.5mm²', '110VDC', 'Train line control', now(), now()),
    ('3002-W', '3002', 'Reverse', 'BA', 'Reverse signal - 110VDC', '2.5mm²', '110VDC', 'Train line control', now(), now()),
    ('3003-W', '3003', 'Emergency Brake Request', 'BA', 'Emergency brake - 110VDC', '2.5mm²', '110VDC', 'Safety critical', now(), now()),
    ('3004-W', '3004', 'Service Brake Request', 'BA', 'Service brake - 110VDC', '2.5mm²', '110VDC', 'Train line control', now(), now()),
    ('3005-W', '3005', 'Forward/Reverse Cross A', 'BA', 'Cross connected with 3006 - Forward', '2.5mm²', '110VDC', 'X1 jumper pin 19/20', now(), now()),
    ('3006-W', '3006', 'Forward/Reverse Cross B', 'BA', 'Cross connected with 3005 - Reverse', '2.5mm²', '110VDC', 'X1 jumper pin 19/20', now(), now()),

    -- Door Control Lines (BA - 110VDC)
    ('6009-W', '6009', 'Door Open Left A', 'BA', 'Door open left cross pair', '2.5mm²', '110VDC', 'X1 jumper pin 43/44', now(), now()),
    ('6046-W', '6046', 'Door Open Left B', 'BA', 'Door open left paired wire', '2.5mm²', '110VDC', 'X1 jumper pin 43/44', now(), now()),
    ('6014-W', '6014', 'Door Close Left A', 'BA', 'Door close left cross pair', '2.5mm²', '110VDC', 'X1 jumper pin 46/47', now(), now()),
    ('6051-W', '6051', 'Door Close Left B', 'BA', 'Door close left paired wire', '2.5mm²', '110VDC', 'X1 jumper pin 46/47', now(), now()),
    ('6010-W', '6010', 'Door Open Right', 'BA', 'Door open right signal', '2.5mm²', '110VDC', 'Door control', now(), now()),
    ('6015-W', '6015', 'Door Close Right', 'BA', 'Door close right signal', '2.5mm²', '110VDC', 'Door control', now(), now()),
    ('6020-W', '6020', 'Door Interlock', 'BA', 'Door interlock status', '2.5mm²', '110VDC', 'Door safety', now(), now()),
    ('6021-W', '6021', 'Door Closed Status', 'BA', 'Door closed confirmation', '2.5mm²', '110VDC', 'Door safety', now(), now()),

    -- Power Lines (ED - 750V HV)
    ('7001-W', '7001', 'Battery +110V', 'ED', 'Battery positive 110VDC', '16mm²', '110VDC', 'Main battery', now(), now()),
    ('7002-W', '7002', 'Battery GND', 'GD', 'Battery ground', '16mm²', 'GND', 'Battery ground', now(), now()),
    ('7010-W', '7010', 'Train Line +110V', 'ED', 'Train line positive', '4mm²', '110VDC', 'Train distribution', now(), now()),
    ('7011-W', '7011', 'Train Line GND', 'GD', 'Train line ground', '4mm²', 'GND', 'Train distribution', now(), now()),

    -- Communication Lines (S - Shielded)
    ('8001-W', '8001', 'TCMS Data+', 'S', 'TCMS data positive - shielded', '1mm²', '24VDC', 'RS485 shielded', now(), now()),
    ('8002-W', '8002', 'TCMS Data-', 'S', 'TCMS data negative - shielded', '1mm²', '24VDC', 'RS485 shielded', now(), now()),
    ('8003-W', '8003', 'ETH TX+', 'S', 'Ethernet TX positive', '1mm²', '24VDC', 'CAT5e shielded', now(), now()),
    ('8004-W', '8004', 'ETH TX-', 'S', 'Ethernet TX negative', '1mm²', '24VDC', 'CAT5e shielded', now(), now()),
    ('8005-W', '8005', 'ETH RX+', 'S', 'Ethernet RX positive', '1mm²', '24VDC', 'CAT5e shielded', now(), now()),
    ('8006-W', '8006', 'ETH RX-', 'S', 'Ethernet RX negative', '1mm²', '24VDC', 'CAT5e shielded', now(), now()),

    -- RS422/RS485 Lines (S - Shielded)
    ('9001-W', '9001', 'TX+', 'S', 'RS422 Transmit positive', '0.75mm²', '5VDC', 'Shielded twisted pair', now(), now()),
    ('9002-W', '9002', 'TX-', 'S', 'RS422 Transmit negative', '0.75mm²', '5VDC', 'Shielded twisted pair', now(), now()),
    ('9003-W', '9003', 'RX+', 'S', 'RS422 Receive positive', '0.75mm²', '5VDC', 'Shielded twisted pair', now(), now()),
    ('9004-W', '9004', 'RX-', 'S', 'RS422 Receive negative', '0.75mm²', '5VDC', 'Shielded twisted pair', now(), now()),
    ('9010-W', '9010', '485-A', 'S', 'RS485 signal A', '0.75mm²', '5VDC', 'Shielded', now(), now()),
    ('9011-W', '9011', '485-B', 'S', 'RS485 signal B', '0.75mm²', '5VDC', 'Shielded', now(), now()),

    -- CBTC Lines (S - Shielded)
    ('92221-W', '92221', 'Front RS422 TX', 'S', 'Front RS422 TX - X2 jumper', '0.75mm²', '5VDC', 'CBTC communication', now(), now()),
    ('92231-W', '92231', 'Front RS422 RX', 'S', 'Front RS422 RX', '0.75mm²', '5VDC', 'CBTC communication', now(), now()),
    ('92341-W', '92341', 'Front RS422 TX Comp', 'S', 'Front RS422 TX complementary', '0.75mm²', '5VDC', 'CBTC communication', now(), now()),
    ('92431-W', '92431', 'Rear RS422 TX Cross', 'S', 'Rear RS422 TX cross - X2 pin 29/31', '0.75mm²', '5VDC', 'CBTC cross connection', now(), now()),
    ('92441-W', '92441', 'Front RS422 RX Comp', 'S', 'Front RS422 RX complementary', '0.75mm²', '5VDC', 'CBTC communication', now(), now()),
    ('92451-W', '92451', 'Rear RS422 RX Cross', 'S', 'Rear RS422 RX cross - X2 pin 29/31', '0.75mm²', '5VDC', 'CBTC cross connection', now(), now()),
    ('92432-W', '92432', 'Rear RS422 TX Comp Cross', 'S', 'Rear RS422 TX Comp cross - X2 pin 30/32', '0.75mm²', '5VDC', 'CBTC cross connection', now(), now()),
    ('92452-W', '92452', 'Rear RS422 RX Comp Cross', 'S', 'Rear RS422 RX Comp cross - X2 pin 30/32', '0.75mm²', '5VDC', 'CBTC cross connection', now(), now()),
    ('92571-W', '92571', 'CBTC TX', 'S', 'CBTC transmission', '0.75mm²', '5VDC', 'Train control', now(), now()),
    ('92572-W', '92572', 'CBTC RX', 'S', 'CBTC reception', '0.75mm²', '5VDC', 'Train control', now(), now()),
    ('92581-W', '92581', 'CBTC Enable', 'S', 'CBTC system enable', '0.75mm²', '24VDC', 'Train control', now(), now()),
    ('92591-W', '92591', 'CBTC Status', 'S', 'CBTC operational status', '0.75mm²', '24VDC', 'Train control', now(), now()),

    -- Ethernet Ports
    ('9301-W', '9301', 'ETH1 TX+', 'S', 'Ethernet Port 1 TX+', '0.5mm²', '24VDC', 'M12 connector', now(), now()),
    ('9302-W', '9302', 'ETH1 TX-', 'S', 'Ethernet Port 1 TX-', '0.5mm²', '24VDC', 'M12 connector', now(), now()),
    ('9303-W', '9303', 'ETH1 RX+', 'S', 'Ethernet Port 1 RX+', '0.5mm²', '24VDC', 'M12 connector', now(), now()),
    ('9304-W', '9304', 'ETH1 RX-', 'S', 'Ethernet Port 1 RX-', '0.5mm²', '24VDC', 'M12 connector', now(), now()),
    ('9311-W', '9311', 'ETH2 TX+', 'S', 'Ethernet Port 2 TX+', '0.5mm²', '24VDC', 'M12 connector', now(), now()),
    ('9312-W', '9312', 'ETH2 TX-', 'S', 'Ethernet Port 2 TX-', '0.5mm²', '24VDC', 'M12 connector', now(), now()),
    ('9313-W', '9313', 'ETH2 RX+', 'S', 'Ethernet Port 2 RX+', '0.5mm²', '24VDC', 'M12 connector', now(), now()),
    ('9314-W', '9314', 'ETH2 RX-', 'S', 'Ethernet Port 2 RX-', '0.5mm²', '24VDC', 'M12 connector', now(), now()),

    -- CCTV Lines
    ('9401-W', '9401', 'CCTV Video+', 'S', 'CCTV video positive', '0.75mm²', '12VDC', 'Coax shielded', now(), now()),
    ('9402-W', '9402', 'CCTV Video-', 'S', 'CCTV video negative', '0.75mm²', '12VDC', 'Coax shielded', now(), now()),
    ('9403-W', '9403', 'CCTV Audio+', 'S', 'CCTV audio positive', '0.5mm²', '12VDC', 'Shielded', now(), now()),
    ('9404-W', '9404', 'CCTV Audio-', 'S', 'CCTV audio negative', '0.5mm²', '12VDC', 'Shielded', now(), now()),

    -- Communication Power
    ('9501-W', '9501', '+24V Comm', 'BA', 'Communication equipment +24V', '2.5mm²', '24VDC', 'Power supply', now(), now()),
    ('9502-W', '9502', 'GND Comm', 'GD', 'Communication equipment ground', '2.5mm²', 'GND', 'Ground', now(), now())
ON CONFLICT ("wireNo") DO UPDATE
SET "signalName" = EXCLUDED."signalName",
    "description" = EXCLUDED."description",
    "remarks" = EXCLUDED."remarks";

-- ============================================
-- SIGNALS (From CBTC and TCMS drawings)
-- ============================================

INSERT INTO "Signal" ("id", "drawingId", "signalName", "signalCode", "protocol", "voltageText", "direction", "note")
SELECT
    gen_random_uuid()::text,
    d.id,
    x.signal_name,
    x.signal_code,
    x.protocol,
    x.voltage,
    x.direction,
    x.note
FROM "Drawing" d
CROSS JOIN (
    VALUES
        ('RS422 TX', 'TX+', 'RS422', '5VDC', 'OUT', 'RS422 Transmit from TCMS'),
        ('RS422 RX', 'RX+', 'RS422', '5VDC', 'IN', 'RS422 Receive to TCMS'),
        ('RS485 Data', '485-A', 'RS485', '5VDC', 'BIDIR', 'RS485 bidirectional data'),
        ('CBTC TX', 'CBTC-TX', 'CBTC', '24VDC', 'OUT', 'CBTC transmission'),
        ('CBTC RX', 'CBTC-RX', 'CBTC', '24VDC', 'IN', 'CBTC reception'),
        ('Ethernet 100TX', 'ETH', '100BASE-TX', '24VDC', 'BIDIR', '100Mbps Ethernet'),
        ('TCMS CAN', 'TCMS-CAN', 'CAN', '24VDC', 'BIDIR', 'TCMS Controller Area Network')
) AS x(signal_name, signal_code, protocol, voltage, direction, note)
WHERE d."drawingNo" = '942-58152'
ON CONFLICT DO NOTHING;

-- ============================================
-- CIRCUITS (From VCC drawings)
-- ============================================

INSERT INTO "Circuit" ("id", "drawingId", "circuitCode", "circuitName", "category", "voltageText", "protocolText", "carScope", "note")
SELECT
    gen_random_uuid()::text,
    d.id,
    x.circuit_code,
    x.circuit_name,
    x.category,
    x.voltage,
    x.protocol,
    x.car_scope,
    x.note
FROM "Drawing" d
CROSS JOIN (
    VALUES
        ('TRAIN-LINE-CTL', 'Train Line Control', 'CONTROL', '110VDC', NULL, 'ALL', 'Control train lines from X1'),
        ('TRAIN-LINE-SIG', 'Train Line Signal', 'COMM', '5VDC', 'RS422', 'ALL', 'Signal train lines from X2'),
        ('DOOR-CTL', 'Door Control Circuit', 'CONTROL', '110VDC', NULL, 'ALL', 'Door open/close control'),
        ('BRAKE-CTL', 'Brake Control Circuit', 'SAFETY', '110VDC', NULL, 'ALL', 'Service/emergency brake control'),
        ('TRACTION-CTL', 'Traction Control Circuit', 'TRACTION', '750V', NULL, 'MC', 'Traction VVVF control'),
        ('TCMS-COMM', 'TCMS Communication Circuit', 'COMM', '24VDC', 'Ethernet', 'ALL', 'TCMS CN1/CN2 communication'),
        ('CCTV-SYS', 'CCTV System Circuit', 'COMM', '12VDC', 'Analog', 'ALL', 'CCTV camera circuit'),
        ('CBTC-SYS', 'CBTC System Circuit', 'COMM', '24VDC', 'RS422', 'ALL', 'Communication Based Train Control')
) AS x(circuit_code, circuit_name, category, voltage, protocol, car_scope, note)
WHERE d."drawingNo" IN ('942-58103', '942-58104', '942-58136', '942-58152', '942-58146', '942-58154')
ON CONFLICT DO NOTHING;

COMMIT;