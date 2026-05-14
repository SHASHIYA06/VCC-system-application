-- 018_vcc_complete_seed_data.sql
-- Comprehensive VCC Data Seed - All Drawings, Trainlines, Wires, Equipment, Signals, TCMS
-- KMRCL RS3R Metro Cars - Complete VCC System Database

BEGIN;

-- ============================================
-- TRAINLINES (From 942-58103, 942-58104)
-- ============================================

-- Control Train Lines (942-58103)
INSERT INTO "TrainLine" ("id", "drawingId", "lineGroup", "itemName", "wireNo", "connectorCode", "pinNo", "carType", "sourceSheet", "note", "extra")
SELECT gen_random_uuid()::text, d.id, 'CONTROL', x.item_name, x.wire_no, x.connector, x.pin, x.car_type, '942-58103', x.note, '{}'::jsonb
FROM "Drawing" d
CROSS JOIN (VALUES
    ('Forward', '3001', 'X1', '1', 'ALL', 'Forward direction control'),
    ('Reverse', '3002', 'X1', '2', 'ALL', 'Reverse direction control'),
    ('Emergency Brake', '3003', 'X1', '3', 'ALL', 'Emergency brake request'),
    ('Service Brake', '3004', 'X1', '4', 'ALL', 'Service brake request'),
    ('Master Controller Power', '3005', 'X1', '5', 'ALL', 'Master controller enable'),
    ('Traction Enable', '3006', 'X1', '6', 'ALL', 'Traction system enable'),
    ('Door Enable', '3007', 'X1', '7', 'ALL', 'Door system enable'),
    ('Horn', '3008', 'X1', '8', 'ALL', 'Horn control'),
    ('Headlight', '3009', 'X1', '9', 'ALL', 'Headlight control'),
    ('Taillight', '3010', 'X1', '10', 'ALL', 'Taillight control'),
    ('Pantograph', '3011', 'X1', '11', 'ALL', 'Pantograph raise/lower'),
    ('Main Circuit Breaker', '3012', 'X1', '12', 'ALL', 'MCB control'),
    ('Converter', '3013', 'X1', '13', 'ALL', 'Converter enable'),
    ('Inverter', '3014', 'X1', '14', 'ALL', 'Inverter enable'),
    ('Brake Control', '3015', 'X1', '15', 'ALL', 'Brake control signal'),
    ('Speed Signal', '3016', 'X1', '16', 'ALL', 'Speed measurement signal'),
    ('Train ID', '3017', 'X1', '17', 'ALL', 'Train identification'),
    ('Cab Active', '3018', 'X1', '18', 'ALL', 'Cab active status'),
    ('Forward/Reverse Cross A', '3005', 'X1', '19', 'ALL', 'Cross connected with pin 20'),
    ('Forward/Reverse Cross B', '3006', 'X1', '20', 'ALL', 'Cross connected with pin 19'),
    ('ATP Enable', '3019', 'X1', '21', 'ALL', 'ATP system enable'),
    ('ATS Enable', '3020', 'X1', '22', 'ALL', 'ATS system enable'),
    ('Door Open Left', '3021', 'X1', '23', 'ALL', 'Left door open command'),
    ('Door Close Left', '3022', 'X1', '24', 'ALL', 'Left door close command'),
    ('Door Open Right', '3023', 'X1', '25', 'ALL', 'Right door open command'),
    ('Door Close Right', '3024', 'X1', '26', 'ALL', 'Right door close command'),
    ('Door Lock Status', '3025', 'X1', '27', 'ALL', 'Door locked confirmation'),
    ('Fire Alarm', '3026', 'X1', '28', 'ALL', 'Fire detection alarm'),
    ('TCMS Data', '3027', 'X1', '29', 'ALL', 'TCMS communication data'),
    ('Reserved 1', '3028', 'X1', '30', 'ALL', 'Reserved for future'),
    ('Reserved 2', '3029', 'X1', '31', 'ALL', 'Reserved for future'),
    ('Battery Voltage', '3030', 'X1', '32', 'ALL', 'Battery voltage monitoring'),
    ('Charger Status', '3031', 'X1', '33', 'ALL', 'Battery charger status'),
    ('Emergency Stop', '3032', 'X1', '34', 'ALL', 'Emergency stop signal'),
    ('Panto Up Status', '3033', 'X1', '35', 'ALL', 'Pantograph up status'),
    ('Panto Down Status', '3034', 'X1', '36', 'ALL', 'Pantograph down status'),
    ('MCB Closed', '3035', 'X1', '37', 'ALL', 'Main circuit breaker closed'),
    ('MCB Open', '3036', 'X1', '38', 'ALL', 'Main circuit breaker open'),
    ('Converter On', '3037', 'X1', '39', 'ALL', 'Converter operating'),
    ('Inverter On', '3038', 'X1', '40', 'ALL', 'Inverter operating'),
    ('Brake Applied', '3039', 'X1', '41', 'ALL', 'Brake applied status'),
    ('Brake Released', '3040', 'X1', '42', 'ALL', 'Brake released status'),
    ('Door Open Left Cross A', '6009', 'X1', '43', 'ALL', 'Cross connected with pin 44'),
    ('Door Open Left Cross B', '6046', 'X1', '44', 'ALL', 'Cross connected with pin 43'),
    ('Door Open Right', '6010', 'X1', '45', 'ALL', 'Right door open signal'),
    ('Door Close Left Cross A', '6014', 'X1', '46', 'ALL', 'Cross connected with pin 47'),
    ('Door Close Left Cross B', '6051', 'X1', '47', 'ALL', 'Cross connected with pin 46'),
    ('Door Close Right', '6015', 'X1', '48', 'ALL', 'Right door close signal'),
    ('Door Closed All', '6020', 'X1', '49', 'ALL', 'All doors closed confirmation'),
    ('Door Locked All', '6021', 'X1', '50', 'ALL', 'All doors locked confirmation')
) AS x(item_name, wire_no, connector, pin, car_type, note)
WHERE d."drawingNo" = '942-58103'
ON CONFLICT DO NOTHING;

-- Signal Train Lines (942-58104)
INSERT INTO "TrainLine" ("id", "drawingId", "lineGroup", "itemName", "wireNo", "connectorCode", "pinNo", "carType", "sourceSheet", "note", "extra")
SELECT gen_random_uuid()::text, d.id, 'SIGNAL', x.item_name, x.wire_no, x.connector, x.pin, x.car_type, '942-58104', x.note, '{}'::jsonb
FROM "Drawing" d
CROSS JOIN (VALUES
    ('RS422 TX+', '9001', 'X2', '1', 'ALL', 'RS422 transmit positive'),
    ('RS422 TX-', '9002', 'X2', '2', 'ALL', 'RS422 transmit negative'),
    ('RS422 RX+', '9003', 'X2', '3', 'ALL', 'RS422 receive positive'),
    ('RS422 RX-', '9004', 'X2', '4', 'ALL', 'RS422 receive negative'),
    ('RS485 A', '9010', 'X2', '5', 'ALL', 'RS485 signal A'),
    ('RS485 B', '9011', 'X2', '6', 'ALL', 'RS485 signal B'),
    ('CAN High', '9020', 'X2', '7', 'ALL', 'CAN bus high'),
    ('CAN Low', '9021', 'X2', '8', 'ALL', 'CAN bus low'),
    ('Ethernet TX+', '9030', 'X2', '9', 'ALL', '100BASE-TX transmit positive'),
    ('Ethernet TX-', '9031', 'X2', '10', 'ALL', '100BASE-TX transmit negative'),
    ('Ethernet RX+', '9032', 'X2', '11', 'ALL', '100BASE-TX receive positive'),
    ('Ethernet RX-', '9033', 'X2', '12', 'ALL', '100BASE-TX receive negative'),
    ('Train Bus+', '9040', 'X2', '13', 'ALL', 'Train communication bus positive'),
    ('Train Bus-', '9041', 'X2', '14', 'ALL', 'Train communication bus negative'),
    ('Consist Bus+', '9050', 'X2', '15', 'ALL', 'Consist communication bus positive'),
    ('Consist Bus-', '9051', 'X2', '16', 'ALL', 'Consist communication bus negative'),
    ('Front RS422 TX', '9221', 'X2', '17', 'ALL', 'Front RS422 transmit'),
    ('Front RS422 RX', '9223', 'X2', '18', 'ALL', 'Front RS422 receive'),
    ('Rear RS422 TX Cross A', '92431', 'X2', '29', 'ALL', 'Cross connected with pin 31'),
    ('Rear RS422 RX Cross B', '92451', 'X2', '31', 'ALL', 'Cross connected with pin 29'),
    ('Rear RS422 TX Comp Cross A', '92432', 'X2', '30', 'ALL', 'Cross connected with pin 32'),
    ('Rear RS422 RX Comp Cross B', '92452', 'X2', '32', 'ALL', 'Cross connected with pin 30'),
    ('CBTC TX', '92571', 'X2', '37', 'ALL', 'CBTC transmission'),
    ('CBTC RX', '92572', 'X2', '38', 'ALL', 'CBTC reception'),
    ('CBTC Enable', '92581', 'X2', '39', 'ALL', 'CBTC system enable'),
    ('CBTC Status', '92591', 'X2', '40', 'ALL', 'CBTC operational status'),
    ('TOD TX', '92601', 'X2', '41', 'ALL', 'Target of Demo transmission'),
    ('TOD RX', '92602', 'X2', '42', 'ALL', 'Target of Demo reception')
) AS x(item_name, wire_no, connector, pin, car_type, note)
WHERE d."drawingNo" = '942-58104'
ON CONFLICT DO NOTHING;

-- Low Tension Power Lines (942-58105)
INSERT INTO "TrainLine" ("id", "drawingId", "lineGroup", "itemName", "wireNo", "connectorCode", "pinNo", "carType", "sourceSheet", "note", "extra")
SELECT gen_random_uuid()::text, d.id, 'LT_POWER', x.item_name, x.wire_no, x.connector, x.pin, x.car_type, '942-58105', x.note, '{}'::jsonb
FROM "Drawing" d
CROSS JOIN (VALUES
    ('Battery +110V', '7001', 'X4', '1', 'ALL', 'Main battery positive 110VDC'),
    ('Battery GND', '7002', 'X4', '2', 'ALL', 'Main battery ground'),
    ('Battery +110V Reserve', '7010', 'X4', '3', 'ALL', 'Reserve battery positive'),
    ('Charger Output', '7011', 'X4', '1', 'ALL', 'Battery charger output'),
    ('DC Train Line+', '7101', NULL, NULL, 'ALL', 'DC train line positive'),
    ('DC Train Line-', '7102', NULL, NULL, 'ALL', 'DC train line negative'),
    ('Emergency Light+', '7201', NULL, NULL, 'ALL', 'Emergency lighting positive'),
    ('Emergency Light-', '7202', NULL, NULL, 'ALL', 'Emergency lighting negative'),
    ('Control Power+', '7301', NULL, NULL, 'ALL', 'Control circuit positive'),
    ('Control Power-', '7302', NULL, NULL, 'ALL', 'Control circuit negative')
) AS x(item_name, wire_no, connector, pin, car_type, note)
WHERE d."drawingNo" = '942-58105'
ON CONFLICT DO NOTHING;

-- High Tension Power Lines (942-58106)
INSERT INTO "TrainLine" ("id", "drawingId", "lineGroup", "itemName", "wireNo", "connectorCode", "pinNo", "carType", "sourceSheet", "note", "extra")
SELECT gen_random_uuid()::text, d.id, 'HT_POWER', x.item_name, x.wire_no, x.connector, x.pin, x.car_type, '942-58106', x.note, '{}'::jsonb
FROM "Drawing" d
CROSS JOIN (VALUES
    ('HV+ Line', '7501', 'X6', '1', 'ALL', 'High voltage positive 750V'),
    ('HV- Line', '7502', 'X7', '1', 'ALL', 'High voltage negative/return'),
    ('Motor U', '7601', NULL, NULL, 'MC', 'Traction motor U phase'),
    ('Motor V', '7602', NULL, NULL, 'MC', 'Traction motor V phase'),
    ('Motor W', '7603', NULL, NULL, 'MC', 'Traction motor W phase'),
    ('Motor GND', '7604', NULL, NULL, 'MC', 'Traction motor ground'),
    ('Brake Resistor+', '7701', NULL, NULL, 'MC', 'Brake resistor positive'),
    ('Brake Resistor-', '7702', NULL, NULL, 'MC', 'Brake resistor negative')
) AS x(item_name, wire_no, connector, pin, car_type, note)
WHERE d."drawingNo" = '942-58106'
ON CONFLICT DO NOTHING;

-- ============================================
-- ADDITIONAL WIRES (Complete wire range)
-- ============================================

INSERT INTO "Wire" ("id", "wireNo", "signalName", "conductorClassCode", "description", "wireSize", "voltageClass", "remarks", "createdAt", "updatedAt")
VALUES
-- Forward/Reverse Control
('3016-W', '3016', 'Speed Signal', 'BA', 'Speed measurement signal from speed sensor', '2.5mm²', '110VDC', 'Train line control', now(), now()),
('3017-W', '3017', 'Train ID', 'BA', 'Train identification number signal', '2.5mm²', '110VDC', 'Train line control', now(), now()),
('3018-W', '3018', 'Cab Active', 'BA', 'Active cab designation signal', '2.5mm²', '110VDC', 'Train line control', now(), now()),
('3019-W', '3019', 'ATP Enable', 'BA', 'Automatic Train Protection enable', '2.5mm²', '110VDC', 'Safety system', now(), now()),
('3020-W', '3020', 'ATS Enable', 'BA', 'Automatic Train Supervision enable', '2.5mm²', '110VDC', 'Safety system', now(), now()),
('3021-W', '3021', 'Door Open Left', 'BA', 'Left door open command', '2.5mm²', '110VDC', 'Door control', now(), now()),
('3022-W', '3022', 'Door Close Left', 'BA', 'Left door close command', '2.5mm²', '110VDC', 'Door control', now(), now()),
('3023-W', '3023', 'Door Open Right', 'BA', 'Right door open command', '2.5mm²', '110VDC', 'Door control', now(), now()),
('3024-W', '3024', 'Door Close Right', 'BA', 'Right door close command', '2.5mm²', '110VDC', 'Door control', now(), now()),
('3025-W', '3025', 'Door Lock Status', 'BA', 'Door locked confirmation', '2.5mm²', '110VDC', 'Door safety', now(), now()),
('3026-W', '3026', 'Fire Alarm', 'BA', 'Fire detection alarm signal', '2.5mm²', '110VDC', 'Fire detection', now(), now()),
('3027-W', '3027', 'TCMS Data', 'S', 'TCMS communication data', '1mm²', '24VDC', 'Communication', now(), now()),
('3028-W', '3028', 'Reserved 1', 'SP', 'Reserved for future use', '2.5mm²', '110VDC', 'Reserved', now(), now()),
('3029-W', '3029', 'Reserved 2', 'SP', 'Reserved for future use', '2.5mm²', '110VDC', 'Reserved', now(), now()),
('3030-W', '3030', 'Battery Voltage', 'BA', 'Battery voltage monitoring', '2.5mm²', '110VDC', 'Battery monitoring', now(), now()),
('3031-W', '3031', 'Charger Status', 'BA', 'Battery charger status', '2.5mm²', '110VDC', 'Battery system', now(), now()),
('3032-W', '3032', 'Emergency Stop', 'BA', 'Emergency stop signal', '2.5mm²', '110VDC', 'Safety critical', now(), now()),
('3033-W', '3033', 'Panto Up Status', 'BA', 'Pantograph up status', '2.5mm²', '110VDC', 'Pantograph status', now(), now()),
('3034-W', '3034', 'Panto Down Status', 'BA', 'Pantograph down status', '2.5mm²', '110VDC', 'Pantograph status', now(), now()),
('3035-W', '3035', 'MCB Closed', 'BA', 'Main circuit breaker closed status', '2.5mm²', '110VDC', 'Power system', now(), now()),
('3036-W', '3036', 'MCB Open', 'BA', 'Main circuit breaker open status', '2.5mm²', '110VDC', 'Power system', now(), now()),
('3037-W', '3037', 'Converter On', 'BA', 'Converter operating status', '2.5mm²', '110VDC', 'Auxiliary power', now(), now()),
('3038-W', '3038', 'Inverter On', 'BA', 'Inverter operating status', '2.5mm²', '110VDC', 'Traction system', now(), now()),
('3039-W', '3039', 'Brake Applied', 'BA', 'Brake applied status', '2.5mm²', '110VDC', 'Brake system', now(), now()),
('3040-W', '3040', 'Brake Released', 'BA', 'Brake released status', '2.5mm²', '110VDC', 'Brake system', now(), now()),

-- Additional Door Control Wires
('6022-W', '6022', 'EOSS1 Signal', 'BA', 'External door override switch 1 signal', '2.5mm²', '110VDC', 'Door safety', now(), now()),
('6023-W', '6023', 'EOSS2 Signal', 'BA', 'External door override switch 2 signal', '2.5mm²', '110VDC', 'Door safety', now(), now()),
('6024-W', '6024', 'EDCU Power', 'BA', 'Electronic door control unit power', '4mm²', '110VDC', 'Door system', now(), now()),
('6025-W', '6025', 'EDCU GND', 'GD', 'Electronic door control unit ground', '4mm²', 'GND', 'Door system', now(), now()),

-- Signal Communication Wires
('9020-W', '9020', 'CAN High', 'S', 'CAN bus high line', '0.75mm²', '5VDC', 'CAN bus shielded', now(), now()),
('9021-W', '9021', 'CAN Low', 'S', 'CAN bus low line', '0.75mm²', '5VDC', 'CAN bus shielded', now(), now()),
('9030-W', '9030', 'Ethernet TX+', 'S', '100BASE-TX transmit positive', '1mm²', '24VDC', 'CAT5e shielded', now(), now()),
('9031-W', '9031', 'Ethernet TX-', 'S', '100BASE-TX transmit negative', '1mm²', '24VDC', 'CAT5e shielded', now(), now()),
('9032-W', '9032', 'Ethernet RX+', 'S', '100BASE-TX receive positive', '1mm²', '24VDC', 'CAT5e shielded', now(), now()),
('9033-W', '9033', 'Ethernet RX-', 'S', '100BASE-TX receive negative', '1mm²', '24VDC', 'CAT5e shielded', now(), now()),
('9040-W', '9040', 'Train Bus+', 'S', 'Train communication bus positive', '0.75mm²', '5VDC', 'Train network', now(), now()),
('9041-W', '9041', 'Train Bus-', 'S', 'Train communication bus negative', '0.75mm²', '5VDC', 'Train network', now(), now()),
('9050-W', '9050', 'Consist Bus+', 'S', 'Consist communication bus positive', '0.75mm²', '5VDC', 'Consist network', now(), now()),
('9051-W', '9051', 'Consist Bus-', 'S', 'Consist communication bus negative', '0.75mm²', '5VDC', 'Consist network', now(), now()),

-- Power Distribution Wires
('7101-W', '7101', 'DC Train Line+', 'ED', 'DC train line positive', '16mm²', '110VDC', 'Train distribution', now(), now()),
('7102-W', '7102', 'DC Train Line-', 'GD', 'DC train line negative', '16mm²', 'GND', 'Train distribution', now(), now()),
('7201-W', '7201', 'Emergency Light+', 'ED', 'Emergency lighting positive', '4mm²', '110VDC', 'Emergency lighting', now(), now()),
('7202-W', '7202', 'Emergency Light-', 'GD', 'Emergency lighting negative', '4mm²', 'GND', 'Emergency lighting', now(), now()),
('7301-W', '7301', 'Control Power+', 'ED', 'Control circuit positive', '4mm²', '110VDC', 'Control power', now(), now()),
('7302-W', '7302', 'Control Power-', 'GD', 'Control circuit negative', '4mm²', 'GND', 'Control power', now(), now()),
('7010-W', '7010', 'Battery +110V Reserve', 'ED', 'Reserve battery positive', '16mm²', '110VDC', 'Battery system', now(), now()),
('7011-W', '7011', 'Charger Output', 'ED', 'Battery charger output', '16mm²', '110VDC', 'Battery charging', now(), now()),

-- Traction Power Wires
('7501-W', '7501', 'HV+ Line', 'ED', 'High voltage positive 750V', '120mm²', '750VDC', 'HV propulsion', now(), now()),
('7502-W', '7502', 'HV- Line', 'GD', 'High voltage negative/return', '120mm²', 'GND', 'HV return', now(), now()),
('7601-W', '7601', 'Motor U', 'ED', 'Traction motor U phase', '50mm²', '750VAC', 'Traction motor', now(), now()),
('7602-W', '7602', 'Motor V', 'ED', 'Traction motor V phase', '50mm²', '750VAC', 'Traction motor', now(), now()),
('7603-W', '7603', 'Motor W', 'ED', 'Traction motor W phase', '50mm²', '750VAC', 'Traction motor', now(), now()),
('7604-W', '7604', 'Motor GND', 'GD', 'Traction motor ground', '50mm²', 'GND', 'Traction motor', now(), now()),
('7701-W', '7701', 'Brake Resistor+', 'ED', 'Brake resistor positive', '35mm²', '750VDC', 'Dynamic braking', now(), now()),
('7702-W', '7702', 'Brake Resistor-', 'GD', 'Brake resistor negative', '35mm²', 'GND', 'Dynamic braking', now(), now()),

-- CBTC Wires
('92601-W', '92601', 'TOD TX', 'S', 'Target of Demo transmission', '0.75mm²', '5VDC', 'CBTC system', now(), now()),
('92602-W', '92602', 'TOD RX', 'S', 'Target of Demo reception', '0.75mm²', '5VDC', 'CBTC system', now(), now()),
('92610-W', '92610', 'CBTC Vital Signal', 'S', 'CBTC vital safety signal', '0.75mm²', '24VDC', 'CBTC safety', now(), now()),
('92611-W', '92611', 'CBTC Non-Vital', 'S', 'CBTC non-vital signal', '0.75mm²', '24VDC', 'CBTC system', now(), now()),

-- CCTV Wires
('9405-W', '9405', 'CCTV Video Shield', 'PE', 'CCTV video shield ground', '0.75mm²', 'GND', 'CCTV shielding', now(), now()),
('9406-W', '9406', 'CCTV Power+', 'BA', 'CCTV camera power positive', '2.5mm²', '12VDC', 'CCTV power', now(), now()),
('9407-W', '9407', 'CCTV Power-', 'GD', 'CCTV camera power negative', '2.5mm²', 'GND', 'CCTV power', now(), now()),
('9408-W', '9408', 'CCTV PTZ Control', 'S', 'CCTV pan/tilt/zoom control', '0.5mm²', '12VDC', 'CCTV control', now(), now()),

-- PA System Wires
('9601-W', '9601', 'PA Audio+', 'S', 'Public address audio positive', '0.75mm²', 'LOWV', 'PA system', now(), now()),
('9602-W', '9602', 'PA Audio-', 'S', 'Public address audio negative', '0.75mm²', 'LOWV', 'PA system', now(), now()),
('9603-W', '9603', 'PA Mute', 'BA', 'PA mute control', '0.5mm²', '24VDC', 'PA control', now(), now()),
('9604-W', '9604', 'PA Priority', 'BA', 'PA priority override', '0.5mm²', '24VDC', 'PA control', now(), now()),

-- PIS Wires
('9701-W', '9701', 'PIS Data+', 'S', 'Passenger info system data positive', '0.75mm²', '24VDC', 'PIS communication', now(), now()),
('9702-W', '9702', 'PIS Data-', 'S', 'Passenger info system data negative', '0.75mm²', '24VDC', 'PIS communication', now(), now()),
('9703-W', '9703', 'Next Station', 'BA', 'Next station announcement', '0.5mm²', '24VDC', 'PIS control', now(), now()),
('9704-W', '9704', 'Destination', 'BA', 'Destination display control', '0.5mm²', '24VDC', 'PIS control', now(), now()),

-- VAC System Wires
('9801-W', '9801', 'VAC Comp On', 'BA', 'AC compressor on signal', '2.5mm²', '110VDC', 'VAC control', now(), now()),
('9802-W', '9802', 'VAC Fan Hi', 'BA', 'AC fan high speed', '2.5mm²', '110VDC', 'VAC control', now(), now()),
('9803-W', '9803', 'VAC Fan Lo', 'BA', 'AC fan low speed', '2.5mm²', '110VDC', 'VAC control', now(), now()),
('9804-W', '9804', 'VAC Temp', 'S', 'AC temperature sensor', '0.5mm²', '24VDC', 'VAC sensor', now(), now()),
('9805-W', '9805', 'VAC Power+', 'AP', 'AC unit power positive 415V', '4mm²', '415VAC', 'VAC power', now(), now()),
('9806-W', '9806', 'VAC Power-', 'AP', 'AC unit power negative', '4mm²', '415VAC', 'VAC power', now(), now()),

-- TMS/TCMS Wires
('9901-W', '9901', 'RIO1 Data', 'S', 'Remote IO 1 data communication', '1mm²', '24VDC', 'TCMS RIO', now(), now()),
('9902-W', '9902', 'RIO2 Data', 'S', 'Remote IO 2 data communication', '1mm²', '24VDC', 'TCMS RIO', now(), now()),
('9903-W', '9903', 'CCU Status', 'BA', 'Central control unit status', '2.5mm²', '110VDC', 'TCMS CCU', now(), now()),
('9904-W', '9904', 'CN1 Eth+', 'S', 'Communication node 1 Ethernet positive', '1mm²', '24VDC', 'TCMS CN1', now(), now()),
('9905-W', '9905', 'CN1 Eth-', 'S', 'Communication node 1 Ethernet negative', '1mm²', '24VDC', 'TCMS CN1', now(), now()),
('9906-W', '9906', 'CN2 Eth+', 'S', 'Communication node 2 Ethernet positive', '1mm²', '24VDC', 'TCMS CN2', now(), now()),
('9907-W', '9907', 'CN2 Eth-', 'S', 'Communication node 2 Ethernet negative', '1mm²', '24VDC', 'TCMS CN2', now(), now()),

-- Brake System Wires
('4010-W', '4010', 'Brake Demand', 'BA', 'Brake demand signal', '2.5mm²', '110VDC', 'Brake control', now(), now()),
('4011-W', '4011', 'Brake Pressure', 'S', 'Brake cylinder pressure', '0.5mm²', '24VDC', 'Brake monitoring', now(), now()),
('4012-W', '4012', 'WSP Signal', 'S', 'Wheel slide protection signal', '0.5mm²', '24VDC', 'Brake safety', now(), now()),
('4013-W', '4013', 'EBCU Status', 'BA', 'Electronic brake control unit status', '2.5mm²', '110VDC', 'Brake control', now(), now()),
('4014-W', '4014', 'Park Brake Apply', 'BA', 'Parking brake apply command', '2.5mm²', '110VDC', 'Parking brake', now(), now()),
('4015-W', '4015', 'Park Brake Release', 'BA', 'Parking brake release command', '2.5mm²', '110VDC', 'Parking brake', now(), now()),
('4016-W', '4016', 'Brake OK', 'BA', 'Brake system OK status', '2.5mm²', '110VDC', 'Brake safety', now(), now())
ON CONFLICT ("wireNo") DO NOTHING;

-- ============================================
-- SIGNALS (From all VCC drawings)
-- ============================================

INSERT INTO "Signal" ("id", "drawingId", "signalName", "signalCode", "protocol", "voltageText", "direction", "sourceSheet", "note", "extra")
SELECT gen_random_uuid()::text, d.id, x.signal_name, x.signal_code, x.protocol, x.voltage, x.direction, x.source, x.note, '{}'::jsonb
FROM "Drawing" d
CROSS JOIN (VALUES
    -- Control Signals
    ('Forward Direction', 'FWD', 'Digital', '110VDC', 'OUT', '942-58103', 'Forward direction command'),
    ('Reverse Direction', 'REV', 'Digital', '110VDC', 'OUT', '942-58103', 'Reverse direction command'),
    ('Emergency Brake', 'EB', 'Digital', '110VDC', 'OUT', '942-58103', 'Emergency brake application'),
    ('Service Brake', 'SB', 'Digital', '110VDC', 'OUT', '942-58103', 'Service brake application'),
    ('Traction Enable', 'TRAC_EN', 'Digital', '110VDC', 'OUT', '942-58103', 'Traction system enable'),
    ('Horn', 'HORN', 'Digital', '110VDC', 'OUT', '942-58103', 'Horn activation'),
    ('Headlight', 'HL', 'Digital', '110VDC', 'OUT', '942-58103', 'Headlight on/off'),
    ('Taillight', 'TL', 'Digital', '110VDC', 'OUT', '942-58103', 'Taillight on/off'),
    ('Pantograph', 'PANT', 'Digital', '110VDC', 'BIDIR', '942-58103', 'Pantograph raise/lower'),
    ('MCB Control', 'MCB', 'Digital', '110VDC', 'OUT', '942-58103', 'Main circuit breaker control'),
    ('Door Open Command', 'DO', 'Digital', '110VDC', 'OUT', '942-58103', 'Door open command'),
    ('Door Close Command', 'DC', 'Digital', '110VDC', 'OUT', '942-58103', 'Door close command'),
    ('Door Locked Status', 'DL', 'Digital', '110VDC', 'IN', '942-58103', 'Door locked confirmation'),
    ('Fire Alarm', 'FIRE', 'Digital', '110VDC', 'IN', '942-58103', 'Fire detection'),
    ('Emergency Stop', 'ESTOP', 'Digital', '110VDC', 'IN', '942-58103', 'Emergency stop activation'),
    ('ATP Enable', 'ATP', 'Digital', '110VDC', 'OUT', '942-58103', 'Automatic Train Protection'),
    ('ATS Enable', 'ATS', 'Digital', '110VDC', 'OUT', '942-58103', 'Automatic Train Supervision'),
    ('TCMS Data', 'TCMS', 'Ethernet', '24VDC', 'BIDIR', '942-58103', 'TCMS communication'),

    -- Communication Signals
    ('RS422 TX', 'TX', 'RS422', '5VDC', 'OUT', '942-58104', 'Serial transmission'),
    ('RS422 RX', 'RX', 'RS422', '5VDC', 'IN', '942-58104', 'Serial reception'),
    ('RS485 Data', '485', 'RS485', '5VDC', 'BIDIR', '942-58104', 'RS485 bus'),
    ('CAN Bus', 'CAN', 'CAN', '5VDC', 'BIDIR', '942-58104', 'Controller Area Network'),
    ('Ethernet', 'ETH', '100BASE-TX', '24VDC', 'BIDIR', '942-58104', '100Mbps Ethernet'),
    ('Train Bus', 'TBUS', 'MVB', '24VDC', 'BIDIR', '942-58104', 'Train communication bus'),
    ('Consist Bus', 'CBUS', 'MVB', '24VDC', 'BIDIR', '942-58104', 'Consist communication bus'),

    -- CBTC Signals
    ('CBTC TX', 'CBTC-TX', 'CBTC', '24VDC', 'OUT', '942-58152', 'CBTC transmission'),
    ('CBTC RX', 'CBTC-RX', 'CBTC', '24VDC', 'IN', '942-58152', 'CBTC reception'),
    ('CBTC Enable', 'CBTC-EN', 'Digital', '24VDC', 'IN', '942-58152', 'CBTC enable'),
    ('CBTC Status', 'CBTC-STS', 'Digital', '24VDC', 'OUT', '942-58152', 'CBTC status'),
    ('TOD TX', 'TOD-TX', 'TOD', '5VDC', 'OUT', '942-58152', 'Target of Demo TX'),
    ('TOD RX', 'TOD-RX', 'TOD', '5VDC', 'IN', '942-58152', 'Target of Demo RX'),

    -- CCTV Signals
    ('CCTV Video', 'CCTV-VID', 'Analog', '1Vp-p', 'OUT', '942-58154', 'CCTV video signal'),
    ('CCTV Audio', 'CCTV-AUD', 'Analog', '1Vp-p', 'BIDIR', '942-58154', 'CCTV audio signal'),
    ('CCTV Control', 'CCTV-CTL', 'Digital', '12VDC', 'OUT', '942-58154', 'CCTV camera control'),

    -- PA Signals
    ('PA Audio', 'PA-AUD', 'Analog', 'LOWV', 'OUT', '942-58150', 'Public address audio'),
    ('PA Mute', 'PA-MUTE', 'Digital', '24VDC', 'OUT', '942-58150', 'PA mute control'),
    ('PA Priority', 'PA-PRIO', 'Digital', '24VDC', 'OUT', '942-58150', 'Priority override'),

    -- PIS Signals
    ('PIS Data', 'PIS-DATA', 'Ethernet', '24VDC', 'BIDIR', '942-58147', 'Passenger info data'),
    ('Next Station', 'NEXT-STA', 'Digital', '24VDC', 'OUT', '942-58147', 'Station announcement'),
    ('Destination', 'DEST', 'Digital', '24VDC', 'OUT', '942-58147', 'Destination display'),

    -- VAC Signals
    ('VAC On/Off', 'VAC-ON', 'Digital', '110VDC', 'OUT', '942-58145', 'AC unit control'),
    ('VAC Fan', 'VAC-FAN', 'PWM', '110VDC', 'OUT', '942-58145', 'Fan speed control'),
    ('VAC Temp', 'VAC-TEMP', 'Analog', '24VDC', 'IN', '942-58145', 'Temperature sensor'),

    -- TCMS Signals
    ('RIO Data', 'RIO-DATA', 'Ethernet', '24VDC', 'BIDIR', '942-58146', 'Remote IO communication'),
    ('CCU Status', 'CCU-STS', 'Digital', '110VDC', 'OUT', '942-58146', 'CCU status signal'),
    ('CN1 Ethernet', 'CN1-ETH', 'Ethernet', '24VDC', 'BIDIR', '942-58146', 'Communication node 1'),
    ('CN2 Ethernet', 'CN2-ETH', 'Ethernet', '24VDC', 'BIDIR', '942-58146', 'Communication node 2'),

    -- Brake Signals
    ('Brake Demand', 'BRAKE-DEM', 'Analog', '110VDC', 'OUT', '942-58124', 'Brake application demand'),
    ('Brake Pressure', 'BRAKE-P', 'Analog', '24VDC', 'IN', '942-58124', 'Brake cylinder pressure'),
    ('WSP', 'WSP', 'Digital', '24VDC', 'IN', '942-58124', 'Wheel slide protection'),
    ('EBCU Status', 'EBCU-STS', 'Digital', '110VDC', 'OUT', '942-58128', 'Electronic brake control status'),
    ('Parking Brake', 'PARK-BRK', 'Digital', '110VDC', 'OUT', '942-58126', 'Parking brake command'),

    -- TMS Signals
    ('Speed Signal', 'SPEED', 'Analog', '24VDC', 'OUT', '942-58119', 'Speed measurement'),
    ('Train ID', 'TRAIN-ID', 'Digital', '110VDC', 'OUT', '942-58119', 'Train identification'),
    ('Cab Active', 'CAB-ACT', 'Digital', '110VDC', 'IN', '942-58107', 'Active cab signal')
) AS x(signal_name, signal_code, protocol, voltage, direction, source, note)
WHERE d."drawingNo" IN ('942-58103', '942-58104', '942-58119', '942-58124', '942-58126', '942-58128', '942-58146', '942-58147', '942-58150', '942-58152', '942-58154')
ON CONFLICT DO NOTHING;

-- Note: TcmsIoPoint table not in current schema, skipping that section

-- ============================================
-- DRAWING SHEETS (Create sheets for multi-sheet drawings)
-- ============================================

INSERT INTO "DrawingPage" ("id", "drawingId", "pageNo", "pageLabel", "parseStatus", "extra", "createdAt")
SELECT gen_random_uuid()::text, d.id, x.page_no, x.page_label, 'PARSE_COMPLETE', '{}'::jsonb, now()
FROM "Drawing" d
CROSS JOIN (VALUES
    -- General drawings (1 sheet each typically)
    ('942-58099', 1, 'Drawing List Page 1'),
    ('942-58100', 1, 'Classification Page 1'),
    ('942-58101', 1, 'Wiring Numbers Page 1'),
    ('942-58102', 1, 'Symbols Sheet 1'),
    ('942-58102', 2, 'Symbols Sheet 2'),
    ('942-58102', 3, 'Symbols Sheet 3'),
    ('942-58102', 4, 'Symbols Sheet 4'),
    ('942-58103', 1, 'Train Lines Control Sheet 1'),
    ('942-58103', 2, 'Train Lines Control Sheet 2'),
    ('942-58103', 3, 'Train Lines Control Sheet 3'),
    ('942-58103', 4, 'Train Lines Control Sheet 4'),
    ('942-58104', 1, 'Train Lines Signal Sheet 1'),
    ('942-58104', 2, 'Train Lines Signal Sheet 2'),
    ('942-58104', 3, 'Train Lines Signal Sheet 3'),
    ('942-58104', 4, 'Train Lines Signal Sheet 4'),
    ('942-58104', 5, 'Train Lines Signal Sheet 5'),
    ('942-58104', 6, 'Train Lines Signal Sheet 6'),
    ('942-58104', 7, 'Train Lines Signal Sheet 7'),
    ('942-58104', 8, 'Train Lines Signal Sheet 8'),
    ('942-58105', 1, 'LT Power Sheet 1'),
    ('942-58106', 1, 'HT Power Sheet 1'),
    ('942-58107', 1, 'Controlling Cab Sheet 1'),
    ('942-58108', 1, 'Startup Relay Sheet 1'),
    ('942-58109', 1, 'System Status Sheet 1'),
    ('942-58109', 2, 'System Status Sheet 2'),
    ('942-58110', 1, 'MCB Trip Sheet 1'),
    ('942-58110', 2, 'MCB Trip Sheet 2'),
    ('942-58111', 1, 'DC Contactor Sheet 1'),
    ('942-58112', 1, 'Headlight Sheet 1'),
    ('942-58113', 1, 'Taillight Sheet 1'),
    ('942-58114', 1, 'Interior Light Sheet 1'),
    ('942-58115', 1, 'Interior Light Sheet 2'),
    ('942-58116', 1, 'Wiper Sheet 1'),
    ('942-58117', 1, 'Coupling Control Sheet 1'),
    -- Traction
    ('942-58119', 1, 'Speed Control Sheet 1'),
    ('942-58119', 2, 'Speed Control Sheet 2'),
    ('942-58120', 1, 'VVVF Control Sheet 1'),
    ('942-58121', 1, 'Traction Return Sheet 1'),
    -- Brake
    ('942-58123', 1, 'Compressor Sheet 1'),
    ('942-58124', 1, 'Brake Loop Sheet 1'),
    ('942-58125', 1, 'Emergency Brake Sheet 1'),
    ('942-58125', 2, 'Emergency Brake Sheet 2'),
    ('942-58126', 1, 'Parking Brake Sheet 1'),
    ('942-58127', 1, 'Horn Sheet 1'),
    ('942-58128', 1, 'Brake Control Sheet 1'),
    ('942-58129', 1, 'Brake Control TC Sheet 1'),
    -- Aux
    ('942-58130', 1, 'APS Sheet 1'),
    ('942-58130', 2, 'APS Sheet 2'),
    ('942-58131', 1, 'Shore Supply Sheet 1'),
    ('942-58132', 1, 'Battery Control Sheet 1'),
    -- Door
    ('942-58136', 1, 'Door Supply Sheet 1'),
    ('942-58137', 1, 'Door Supply Voltage Sheet 1'),
    ('942-58138', 1, 'Door Operation L Sheet 1'),
    ('942-58139', 1, 'Door Operation R Sheet 1'),
    ('942-58139', 2, 'Door Operation R Sheet 2'),
    ('942-58140', 1, 'Door Proving Loop Sheet 1'),
    ('942-58141', 1, 'Local Door Interlock Sheet 1'),
    ('942-58142', 1, 'Door IMS Communication Sheet 1'),
    -- VAC
    ('942-58143', 1, 'Cab VAC Sheet 1'),
    ('942-58144', 1, 'Saloon VAC Power Sheet 1'),
    ('942-58145', 1, 'Saloon VAC Control Sheet 1'),
    ('942-58145', 2, 'Saloon VAC Control Sheet 2'),
    -- TIMS/COMM
    ('942-58146', 1, 'TCMS Communication Sheet 1'),
    ('942-58146', 2, 'TCMS Communication Sheet 2'),
    ('942-58146', 3, 'TCMS Communication Sheet 3'),
    ('942-58146', 4, 'TCMS Communication Sheet 4'),
    ('942-58147', 1, 'TFT FDI Sheet 1'),
    ('942-58148', 1, 'TFT TC MC Sheet 1'),
    ('942-58149', 1, 'CCU CCTV DMC Sheet 1'),
    ('942-58150', 1, 'PA Amplifier DMC MC Sheet 1'),
    ('942-58151', 1, 'PA Amplifier TC Sheet 1'),
    ('942-58152', 1, 'CBTC Sheet 1'),
    ('942-58152', 2, 'CBTC Sheet 2'),
    ('942-58152', 3, 'CBTC Sheet 3'),
    ('942-58152', 4, 'CBTC Sheet 4'),
    ('942-58152', 5, 'CBTC Sheet 5'),
    ('942-58153', 1, 'Train Radio Sheet 1'),
    ('942-58154', 1, 'CCTV Sheet 1')
) AS x(drawing_no, page_no, page_label)
WHERE d."drawingNo" = x.drawing_no
ON CONFLICT DO NOTHING;

-- ============================================
-- CIRCUIT DATA (From various VCC sheets)
-- ============================================

INSERT INTO "Circuit" ("id", "drawingId", "circuitCode", "circuitName", "category", "voltageText", "protocolText", "carScope", "note", "extra")
SELECT gen_random_uuid()::text, d.id, x.circuit_code, x.circuit_name, x.category, x.voltage, x.protocol, x.car_scope, x.note, '{}'::jsonb
FROM "Drawing" d
CROSS JOIN (VALUES
    -- Train Line Circuits
    ('TRL-CTL', 'Train Line Control Circuit', 'CONTROL', '110VDC', NULL, 'ALL', 'Control train lines from X1 jumper'),
    ('TRL-SIG', 'Train Line Signal Circuit', 'COMM', '5VDC', 'RS422', 'ALL', 'Signal train lines from X2 jumper'),
    ('TRL-LT', 'Train Line Low Tension Circuit', 'POWER', '110VDC', NULL, 'ALL', 'Low tension power distribution'),
    ('TRL-HT', 'Train Line High Tension Circuit', 'POWER', '750VDC', NULL, 'MC', 'High tension propulsion power'),

    -- Door Circuits
    ('DOOR-OP', 'Door Operation Circuit', 'CONTROL', '110VDC', NULL, 'ALL', 'Door open/close control'),
    ('DOOR-LOCK', 'Door Lock Interlock Circuit', 'SAFETY', '110VDC', NULL, 'ALL', 'Door closed/locked confirmation'),
    ('DOOR-EOSS', 'External Door Override Circuit', 'SAFETY', '110VDC', NULL, 'ALL', 'EOSS safety override'),
    ('DOOR-IMS', 'Door IMS Communication', 'COMM', '24VDC', 'CAN', 'ALL', 'Door to TCMS communication'),

    -- Brake Circuits
    ('BRAKE-SVC', 'Service Brake Circuit', 'SAFETY', '110VDC', NULL, 'ALL', 'Service brake application'),
    ('BRAKE-EMG', 'Emergency Brake Circuit', 'SAFETY', '110VDC', NULL, 'ALL', 'Emergency brake application'),
    ('BRAKE-PRK', 'Parking Brake Circuit', 'SAFETY', '110VDC', NULL, 'ALL', 'Parking brake apply/release'),
    ('BRAKE-EBC', 'Electronic Brake Control Circuit', 'CONTROL', '110VDC', NULL, 'ALL', 'EBCU/EBCU control'),
    ('BRAKE-WSP', 'Wheel Slide Protection Circuit', 'SAFETY', '24VDC', NULL, 'ALL', 'WSP monitoring'),

    -- Traction Circuits
    ('TRAC-SPD', 'Speed Control Circuit', 'TRACTION', '110VDC', NULL, 'MC', 'Speed reference control'),
    ('TRAC-VVVF', 'VVVF Control Circuit', 'TRACTION', '750VDC', NULL, 'MC', 'Inverter control'),
    ('TRAC-RET', 'Traction Return Circuit', 'TRACTION', '750VDC', NULL, 'MC', 'Return current path'),

    -- Auxiliary Circuits
    ('AUX-APS', 'Auxiliary Power Supply Circuit', 'POWER', '415VAC', NULL, 'ALL', 'APS control'),
    ('AUX-BAT', 'Battery Control Circuit', 'POWER', '110VDC', NULL, 'ALL', 'Battery charging/monitoring'),
    ('AUX-SHORE', 'Shore Supply Circuit', 'POWER', '415VAC', NULL, 'ALL', 'AC shore connection'),

    -- Communication Circuits
    ('COMM-TCMS', 'TCMS Communication Circuit', 'COMM', '24VDC', 'Ethernet', 'ALL', 'TCMS CN1/CN2 network'),
    ('COMM-CBTC', 'CBTC Circuit', 'COMM', '24VDC', 'RS422', 'ALL', 'Train control communication'),
    ('COMM-CCTV', 'CCTV Circuit', 'COMM', '12VDC', 'Analog', 'ALL', 'Video surveillance'),
    ('COMM-PA', 'PA System Circuit', 'COMM', 'LOWV', 'Analog', 'ALL', 'Public address'),
    ('COMM-PIS', 'PIS Circuit', 'COMM', '24VDC', 'Ethernet', 'ALL', 'Passenger information'),
    ('COMM-RADIO', 'Train Radio Circuit', 'COMM', '24VDC', 'Ethernet', 'ALL', 'Radio communication'),

    -- VAC Circuits
    ('VAC-CAB', 'Cab AC Circuit', 'COMFORT', '415VAC', NULL, 'DMC', 'Cab air conditioning'),
    ('VAC-SALOON', 'Saloon AC Circuit', 'COMFORT', '415VAC', NULL, 'ALL', 'Saloon air conditioning'),

    -- Lighting Circuits
    ('LIGHT-HEAD', 'Headlight Circuit', 'LIGHTING', '110VDC', NULL, 'ALL', 'Head and taillights'),
    ('LIGHT-INT', 'Interior Light Circuit', 'LIGHTING', '110VDC', NULL, 'ALL', 'Saloon interior lighting'),
    ('LIGHT-EMG', 'Emergency Light Circuit', 'LIGHTING', '110VDC', NULL, 'ALL', 'Emergency lighting')
) AS x(circuit_code, circuit_name, category, voltage, protocol, car_scope, note)
WHERE d."drawingNo" IN ('942-58103', '942-58104', '942-58105', '942-58106', '942-58119', '942-58124', '942-58126', '942-58128', '942-58130', '942-58132', '942-58136', '942-58140', '942-58143', '942-58146', '942-58147', '942-58150', '942-58152', '942-58154')
ON CONFLICT DO NOTHING;

COMMIT;