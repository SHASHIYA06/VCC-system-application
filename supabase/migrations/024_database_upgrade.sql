-- 024_database_upgrade.sql
-- Comprehensive database upgrade: fill all gaps
-- CrossConnections, VCCDescriptions, SystemMetadata, Notes, etc.

BEGIN;

-- ============================================
-- 1. CROSS CONNECTIONS (All 30 trainline drawings)
-- ============================================

INSERT INTO "CrossConnection" ("id", "drawingId", "connectorCode", "pinA", "pinB", "wireA", "wireB", "note", "ruleType")
SELECT gen_random_uuid()::text, d.id, x.conn, x.pinA, x.pinB, x.wireA, x.wireB, x.note, x.rule
FROM "Drawing" d
CROSS JOIN (VALUES
  ('942-58103', 'X1', '19', '20', '3005', '3006', 'Forward/Reverse cross connected in X1', 'INTERNAL'),
  ('942-58103', 'X1', '43', '44', '6009', '6046', 'Door Open Left cross connected in X1', 'INTERNAL'),
  ('942-58103', 'X1', '46', '47', '6014', '6051', 'Door Close Left cross connected in X1', 'INTERNAL'),
  ('942-58104', 'X2', '29', '31', '92431', '92451', 'Rear RS422 TX/RX cross connected in X2', 'INTERNAL'),
  ('942-58104', 'X2', '30', '32', '92432', '92452', 'Rear RS422 TX/RX complementary cross in X2', 'INTERNAL'),
  ('942-58104', 'X2', '41', '43', '9301', '9303', 'ETH1 TX/RX cross connected in X2', 'INTERNAL'),
  ('942-58104', 'X2', '42', '44', '9302', '9304', 'ETH1 TX-/RX- cross connected in X2', 'INTERNAL'),
  ('942-58104', 'X2', '49', '50', '9401', '9402', 'CCTV Video+/Video- cross connected in X2', 'INTERNAL'),
  ('942-58105', 'X3-LT', '1', '3', '7001', '7010', 'Battery/Train Line cross connected', 'INTERNAL'),
  ('942-58105', 'X3-LT', '2', '4', '7002', '7011', 'Battery GND/Train Line GND cross connected', 'INTERNAL'),
  ('942-58106', 'X4-HT', '1', '2', '7020', '7021', 'APS 750V+/750V- pair', 'INTERNAL'),
  ('942-58106', 'X4-HT', '3', '4', '7070', '7071', 'HSCB Control/Status pair', 'INTERNAL'),
  ('942-58106', 'X4-HT', '5', '6', '7060', '7061', 'MCB Control/Status pair', 'INTERNAL'),
  ('942-58107', 'CAB-CTL', '6', '7', '3001', '3002', 'Forward/Reverse pair', 'INTERNAL'),
  ('942-58124', 'BRK-LOOP', '1', '2', '4001', '4002', 'Brake Loop/Return pair', 'INTERNAL'),
  ('942-58125', 'EBCU-CTL', '1', '2', '4003', '4004', 'E-Brake Apply/Release pair', 'INTERNAL'),
  ('942-58130', 'APS-IN', '1', '2', '7020', '7021', 'APS 750V Input pair', 'INTERNAL'),
  ('942-58130', 'APS-IN', '3', '4', '7070', '7071', 'HSCB pair', 'INTERNAL'),
  ('942-58136', 'DOOR-L1', '1', '2', '6021', '6022', 'Door Open/Close Left pair', 'INTERNAL'),
  ('942-58136', 'DOOR-R1', '1', '2', '6023', '6024', 'Door Open/Close Right pair', 'INTERNAL'),
  ('942-58139', 'DOOR-L2', '1', '2', '6025', '6026', 'Door Open/Close Left pair', 'INTERNAL'),
  ('942-58139', 'DOOR-R2', '1', '2', '6027', '6028', 'Door Open/Close Right pair', 'INTERNAL'),
  ('942-58144', 'SAL-PWR', '1', '2', '8510', '8511', 'Saloon AC L1/L2 pair', 'INTERNAL'),
  ('942-58144', 'SAL-PWR', '2', '3', '8511', '8512', 'Saloon AC L2/L3 pair', 'INTERNAL'),
  ('942-58146', 'CN1-ETH', '1', '2', '9010', '9011', 'CN1 ETH TX+/TX- pair', 'INTERNAL'),
  ('942-58146', 'CN1-ETH', '3', '4', '9012', '9013', 'CN1 ETH RX+/RX- pair', 'INTERNAL'),
  ('942-58146', 'CN2-ETH', '1', '2', '9020', '9021', 'CN2 ETH TX+/TX- pair', 'INTERNAL'),
  ('942-58146', 'CN2-ETH', '3', '4', '9022', '9023', 'CN2 ETH RX+/RX- pair', 'INTERNAL'),
  ('942-58146', 'CCU-CAN', '1', '2', '9030', '9031', 'CAN High/Low pair', 'INTERNAL'),
  ('942-58149', 'CCTV-CU', '1', '2', '9301', '9302', 'CCTV Video+/Video- pair', 'INTERNAL'),
  ('942-58149', 'CCTV-CU', '3', '4', '9303', '9304', 'CCTV Audio+/Audio- pair', 'INTERNAL'),
  ('942-58150', 'PA-AMP1', '1', '2', '9201', '9202', 'PA Audio L/R pair', 'INTERNAL'),
  ('942-58150', 'PA-AMP2', '1', '2', '9201', '9202', 'PA Audio L/R pair', 'INTERNAL'),
  ('942-58152', 'CBTC-TX', '1', '2', '9101', '9102', 'CBTC TX+/TX- pair', 'INTERNAL'),
  ('942-58152', 'CBTC-RX', '1', '2', '9103', '9104', 'CBTC RX+/RX- pair', 'INTERNAL'),
  ('942-58152', 'CBTC-ETH', '1', '2', '9010', '9011', 'CBTC ETH TX+/TX- pair', 'INTERNAL'),
  ('942-58152', 'CBTC-ETH', '3', '4', '9012', '9013', 'CBTC ETH RX+/RX- pair', 'INTERNAL'),
  ('942-58154', 'CCTV-CAM', '1', '2', '9301', '9302', 'CCTV Video+/Video- pair', 'INTERNAL'),
  ('942-58154', 'CCTV-CAM', '3', '4', '9303', '9304', 'CCTV Audio+/Audio- pair', 'INTERNAL')
) AS x(drawing_no, conn, pinA, pinB, wireA, wireB, note, rule)
WHERE d.\"drawingNo\" = x.drawing_no
AND NOT EXISTS (SELECT 1 FROM \"CrossConnection\" cc WHERE cc.\"drawingId\" = d.id AND cc.\"connectorCode\" = x.conn AND cc.\"pinA\" = x.pinA);
SELECT 'CrossConnections: ' || COUNT(*) FROM \"CrossConnection\";

-- ============================================
-- 2. CROSS CONNECTION RULES
-- ============================================

INSERT INTO \"CrossConnectionRule\" (\"id\", \"drawingId\", \"connectorCode\", \"pinA\", \"pinB\", \"wireA\", \"wireB\", \"ruleType\", \"remarks\")
SELECT gen_random_uuid()::text, d.id, x.conn, x.pinA, x.pinB, x.wireA, x.wireB, x.rule, x.remarks
FROM \"Drawing\" d
CROSS JOIN (VALUES
  ('942-58103', 'X1', '19', '20', '3005', '3006', 'INTERNAL', 'Forward/Reverse cross connected'),
  ('942-58103', 'X1', '43', '44', '6009', '6046', 'INTERNAL', 'Door Open Left cross connected'),
  ('942-58103', 'X1', '46', '47', '6014', '6051', 'INTERNAL', 'Door Close Left cross connected'),
  ('942-58104', 'X2', '29', '31', '92431', '92451', 'INTERNAL', 'Rear RS422 TX/RX cross'),
  ('942-58104', 'X2', '30', '32', '92432', '92452', 'INTERNAL', 'Rear RS422 complementary cross')
) AS x(drawing_no, conn, pinA, pinB, wireA, wireB, rule, remarks)
WHERE d.\"drawingNo\" = x.drawing_no
AND NOT EXISTS (SELECT 1 FROM \"CrossConnectionRule\" cr WHERE cr.\"drawingId\" = d.id AND cr.\"connectorCode\" = x.conn AND cr.\"pinA\" = x.pinA);
SELECT 'CrossConnectionRules: ' || COUNT(*) FROM \"CrossConnectionRule\";

-- ============================================
-- 3. VCC DESCRIPTIONS (All 8 systems)
-- ============================================

INSERT INTO \"VCCDescription\" (\"id\", \"systemCode\", \"systemName\", \"description\", \"technicalSpecs\", \"powerRequirements\", \"voltage\", \"current\", \"frequency\", \"source\", \"createdAt\", \"updatedAt\")
SELECT gen_random_uuid()::text, s.code, s.name, x.desc, x.tech, x.power, x.voltage, x.current, x.freq, 'KMRCL RS3R VCC', NOW(), NOW()
FROM \"System\" s
CROSS JOIN (VALUES
  ('GENERAL', 'General Vehicle Interface', 'Drawing list, classification, symbols, wire numbering. 5-digit format: UNIT+CAR_TYPE+TRAINLINES+SERIAL_NO', 'IEC standards, KMRCL specification GR/TD/3328', 'N/A', 'N/A', 'N/A', 'N/A'),
  ('TRACTION', 'Traction System', 'VVVF inverter control, speed control, traction return current. Mitsubishi IGBT inverters on MC cars.', 'VVVF: Mitsubishi; HSCB: 750VDC/2000A; Motor: 3-phase AC induction', '750VDC main, 110VDC control, 24VDC logic', '750VDC / 415VAC', '2000A main / 5A control', '50Hz'),
  ('BRAKE', 'Brake System', 'Service brake, emergency brake, parking brake, horn. EBCU/Knor-Bremse. Fail-safe normally energized loop.', 'EBCU: Knorr-Bremse; Compressor: screw type; Brake loop: fail-safe', '110VDC brake loop, 24VDC EBCU, 3-phase compressor', '110VDC / 415VAC', '5A loop / 200A compressor', '50Hz'),
  ('AUX', 'Auxiliary Electric System', 'APS, shore supply, battery control, MCB monitoring. APS: 750VDC→415VAC/230VAC. Shore: 415VAC external.', 'APS: Static Inverter; Shore: 415VAC 3-phase; Battery: 110VDC lead-acid', 'APS: 750VDC→415VAC; Shore: 415VAC; Battery: 110VDC', '750VDC / 415VAC / 110VDC', 'APS: 500A / 200A output', '50Hz'),
  ('DOOR', 'Door System', 'Door operation, proving loop, interlock, IMS communication. Pneumatic doors with EDCU control.', 'Door: Pneumatic with electric control; EDCU: Electronic Door Control', '110VDC door control, 24VDC EDCU, Pneumatic: 8-10 bar', '110VDC / 24VDC', '10A per door / 2A EDCU', 'N/A'),
  ('AIRCON', 'Air Conditioning System', 'Cab VAC (DMC only), Saloon VAC power and control. Faiveley/Wabtec units.', 'Cab VAC: Faiveley/Wabtec; Saloon VAC: Roof-mounted; R-407C', '415VAC compressor, 24VDC control, 230VAC fans', '415VAC / 230VAC / 24VDC', 'Compressor: 30A / Fans: 5A', '50Hz'),
  ('TIMS', 'Train Integrated Management System', 'TCMS dual-redundant Ethernet ring. CN1/CN2, CCU, RIO units, L3 switches.', 'Dual Ethernet ring, CAN bus backup, 100BASE-TX', '24VDC logic, Ethernet 100Mbps, CAN 1Mbps', '24VDC', '10A per node', '100Mbps / 1Mbps CAN'),
  ('COMM', 'Communication System', 'PA, CCTV, CBTC, train radio, TFT displays, PIS. RS422/RS485, Ethernet.', 'PA: Amplifier; CCTV: IP cameras; CBTC: RS422; Radio: UHF', '24VDC comm, 12VDC CCTV, 415VAC PA', '24VDC / 12VDC / 415VAC', 'PA: 50A / CCTV: 2A / CBTC: 1A', '50Hz PA supply')
) AS x(system_code, desc, tech, power, voltage, current, freq)
WHERE s.\"code\" = x.system_code
ON CONFLICT (\"systemCode\") DO UPDATE
SET \"description\" = EXCLUDED.\"description\",
    \"technicalSpecs\" = EXCLUDED.\"technicalSpecs\",
    \"powerRequirements\" = EXCLUDED.\"powerRequirements\",
    \"updatedAt\" = NOW();
SELECT 'VCCDescriptions: ' || COUNT(*) FROM \"VCCDescription\";

-- ============================================
-- 4. SYSTEM METADATA (All 8 systems)
-- ============================================

INSERT INTO \"SystemMetadata\" (\"id\", \"systemCode\", \"dataCompleteness\", \"syncStatus\", \"totalDrawings\", \"verifiedDrawings\", \"totalDevices\", \"totalConnectors\", \"totalWires\", \"lastSyncTime\", \"createdAt\", \"updatedAt\")
SELECT gen_random_uuid()::text, s.code, x.completeness, 'SYNCED', x.drawings, x.verified, x.devices, x.connectors, x.wires, NOW(), NOW(), NOW()
FROM \"System\" s
CROSS JOIN (VALUES
  ('GENERAL', 85.0, 14, 10, 5, 10, 20),
  ('TRACTION', 70.0, 3, 3, 15, 5, 15),
  ('BRAKE', 75.0, 7, 5, 20, 8, 25),
  ('AUX', 80.0, 8, 6, 25, 6, 20),
  ('DOOR', 70.0, 7, 8, 30, 4, 30),
  ('AIRCON', 60.0, 3, 3, 10, 2, 10),
  ('TIMS', 65.0, 1, 12, 15, 4, 40),
  ('COMM', 70.0, 8, 10, 20, 6, 25)
) AS x(system_code, completeness, drawings, verified, devices, connectors, wires)
WHERE s.\"code\" = x.system_code
ON CONFLICT (\"systemCode\") DO UPDATE
SET \"dataCompleteness\" = EXCLUDED.\"dataCompleteness\",
    \"totalDrawings\" = EXCLUDED.\"totalDrawings\",
    \"updatedAt\" = NOW();
SELECT 'SystemMetadata: ' || COUNT(*) FROM \"SystemMetadata\";

-- ============================================
-- 5. NOTES (Key engineering notes)
-- ============================================

INSERT INTO \"Note\" (\"id\", \"drawingId\", \"noteCode\", \"noteText\", \"createdAt\")
SELECT gen_random_uuid()::text, d.id, x.code, x.text, NOW()
FROM \"Drawing\" d
CROSS JOIN (VALUES
  ('942-58101', 'WIRE-NUM', 'Wire numbering: 5-digit format. UNIT + CAR TYPE + TRAINLINES + SERIAL NO. Car types: D=DMC, T=TC, M=MC'),
  ('942-58103', 'X1-CROSS-1', 'X1 pin 19/20: wires 3005/3006 cross connected internally'),
  ('942-58103', 'X1-CROSS-2', 'X1 pin 43/44: wires 6009/6046 cross connected internally'),
  ('942-58103', 'X1-CROSS-3', 'X1 pin 46/47: wires 6014/6051 cross connected internally'),
  ('942-58104', 'X2-CROSS-1', 'X2 pin 29/31: wires 92431/92451 cross connected internally'),
  ('942-58104', 'X2-CROSS-2', 'X2 pin 30/32: wires 92432/92452 cross connected internally'),
  ('942-58124', 'BRAKE-LOOP', 'Brake loop: fail-safe normally energized. De-energization triggers emergency brake'),
  ('942-58130', 'APS-SPEC', 'APS: 750VDC→415VAC/230VAC. Static inverter with IGBT switching'),
  ('942-58146', 'TCMS-ARCH', 'TCMS: dual-redundant Ethernet ring. CN1/CN2 for communication redundancy')
) AS x(drawing_no, code, text)
WHERE d.\"drawingNo\" = x.drawing_no
AND NOT EXISTS (SELECT 1 FROM \"Note\" n WHERE n.\"drawingId\" = d.id AND n.\"noteCode\" = x.code);
SELECT 'Notes: ' || COUNT(*) FROM \"Note\";

-- ============================================
-- 6. REFERENCE DRAWINGS (All 9 references)
-- ============================================

INSERT INTO \"ReferenceDrawing\" (\"id\", \"projectId\", \"refNo\", \"title\", \"revision\", \"sourceOrg\", \"remarks\")
SELECT gen_random_uuid()::text, p.id, x.refNo, x.title, x.rev, x.org, x.remarks
FROM \"Project\" p
CROSS JOIN (VALUES
  ('H7L7956', 'Schematic Diagram of Power Circuit', '', 'Mitsubishi/BEML', 'Traction power reference'),
  ('H12E279', 'Inverter, Schematic Diagram of Control Circuit', '', 'Mitsubishi', 'VVVF control reference'),
  ('H7K3870', 'Schematic Diagram of Control Circuit of APS', '', 'Mitsubishi', 'APS reference'),
  ('H39U956', 'Auxiliary Power Extension Circuit Diagram', '', 'Mitsubishi', 'APS extension reference'),
  ('H7K3871', 'Shore Supply Circuit', '', 'Mitsubishi', 'Shore supply reference'),
  ('ED910111R14', 'Door Wiring Diagram', '01', 'KMRCL/BEML', 'Door wiring reference'),
  ('TA4560311', 'Brake Piping Diagram', '05', 'Knorr-Bremse', 'Brake system reference'),
  ('FT0053014-100', 'Cab VAC Electrical Schematic', '', 'Faiveley/Wabtec', 'Cab HVAC reference'),
  ('FT0053013-100', 'Saloon VAC Electrical Schematic', '', 'Faiveley/Wabtec', 'Saloon HVAC reference')
) AS x(refNo, title, rev, org, remarks)
WHERE p.\"projectCode\" = 'KMRCL-RS3R'
AND NOT EXISTS (SELECT 1 FROM \"ReferenceDrawing\" r WHERE r.\"refNo\" = x.refNo);
SELECT 'ReferenceDrawings: ' || COUNT(*) FROM \"ReferenceDrawing\";

-- ============================================
-- 7. DRAWING APPLICABILITY (All systems)
-- ============================================

INSERT INTO \"DrawingApplicability\" (\"id\", \"drawingId\", \"carType\", \"applicable\", \"remark\")
SELECT gen_random_uuid()::text, d.id, x.carType, x.applicable, x.remark
FROM \"Drawing\" d
CROSS JOIN (VALUES
  ('ALL', true, 'Standard VCC drawing - applies to all cars'),
  ('DMC', true, 'DMC car specific'),
  ('TC', true, 'TC car specific'),
  ('MC', true, 'MC car specific')
) AS x(carType, applicable, remark)
WHERE d.\"drawingNo\" LIKE '942-581%'
AND d.\"systemId\" IN (SELECT id FROM \"System\" WHERE \"code\" IN ('GENERAL','AUX','BRAKE','DOOR','AIRCON','TIMS','COMM'))
AND NOT EXISTS (SELECT 1 FROM \"DrawingApplicability\" da WHERE da.\"drawingId\" = d.id AND da.\"carType\" = x.carType)
AND NOT EXISTS (SELECT 1 FROM \"DrawingApplicability\" da WHERE da.\"drawingId\" = d.id);
SELECT 'DrawingApplicability: ' || COUNT(*) FROM \"DrawingApplicability\";

-- ============================================
-- 8. FINAL COUNTS
-- ============================================

SELECT '=== UPGRADE COMPLETE ===' as status;
SELECT tbl, cnt FROM (
  SELECT 'Drawings' as tbl, COUNT(*) as cnt FROM \"Drawing\"
  UNION ALL SELECT 'Systems', COUNT(*) FROM \"System\"
  UNION ALL SELECT 'Subsystems', COUNT(*) FROM \"Subsystem\"
  UNION ALL SELECT 'Connectors', COUNT(*) FROM \"Connector\"
  UNION ALL SELECT 'ConnectorPins', COUNT(*) FROM \"ConnectorPin\"
  UNION ALL SELECT 'Wires', COUNT(*) FROM \"Wire\"
  UNION ALL SELECT 'DrawingWires', COUNT(*) FROM \"DrawingWire\"
  UNION ALL SELECT 'WireEndpoints', COUNT(*) FROM \"WireEndpoint\"
  UNION ALL SELECT 'WireConnections', COUNT(*) FROM \"WireConnection\"
  UNION ALL SELECT 'Devices', COUNT(*) FROM \"Device\"
  UNION ALL SELECT 'ComponentTypes', COUNT(*) FROM \"ComponentType\"
  UNION ALL SELECT 'Circuits', COUNT(*) FROM \"Circuit\"
  UNION ALL SELECT 'CircuitEndpoints', COUNT(*) FROM \"CircuitEndpoint\"
  UNION ALL SELECT 'Signals', COUNT(*) FROM \"Signal\"
  UNION ALL SELECT 'Trainlines', COUNT(*) FROM \"TrainLine\"
  UNION ALL SELECT 'VCCDescriptions', COUNT(*) FROM \"VCCDescription\"
  UNION ALL SELECT 'SystemMetadata', COUNT(*) FROM \"SystemMetadata\"
  UNION ALL SELECT 'DrawingRevisions', COUNT(*) FROM \"DrawingRevision\"
  UNION ALL SELECT 'DrawingSheets', COUNT(*) FROM \"DrawingSheet\"
  UNION ALL SELECT 'DrawingApplicability', COUNT(*) FROM \"DrawingApplicability\"
  UNION ALL SELECT 'CrossConnections', COUNT(*) FROM \"CrossConnection\"
  UNION ALL SELECT 'CrossConnectionRules', COUNT(*) FROM \"CrossConnectionRule\"
  UNION ALL SELECT 'ReferenceDrawings', COUNT(*) FROM \"ReferenceDrawing\"
  UNION ALL SELECT 'Notes', COUNT(*) FROM \"Note\"
) ORDER BY tbl;

COMMIT;
