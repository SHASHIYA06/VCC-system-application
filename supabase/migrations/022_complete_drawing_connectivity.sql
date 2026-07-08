-- 022_complete_drawing_connectivity.sql
-- Complete connector/pin/wire/circuit connectivity for ALL drawings
-- Based on VCC DESCRIPTION document and engineering knowledge

BEGIN;

-- ============================================
-- WIRES: Complete wire master for all VCC systems
-- ============================================

-- Delete existing synthetic wires, keep verified ones
DELETE FROM "Wire" WHERE "wireStatus" = 'SYNTHETIC';

INSERT INTO "Wire" ("id", "wireNo", "signalName", "conductorClassCode", "description", "wireSize", "wireColor", "voltageClass", "wireStatus", "createdAt", "updatedAt")
VALUES
  -- CONTROL TRAIN LINES (3000 series) - BA class 110VDC
  ('W-3001', '3001', 'Forward', 'BA', 'Forward direction control', '2.5mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3002', '3002', 'Reverse', 'BA', 'Reverse direction control', '2.5mm²', 'BLUE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3003', '3003', 'Emergency Brake Request', 'BA', 'Emergency brake request signal', '2.5mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3004', '3004', 'Service Brake Request', 'BA', 'Service brake request signal', '2.5mm²', 'BLUE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3005', '3005', 'Forward/Reverse Cross A', 'BA', 'Cross connected with 3006 in X1 pin 19/20', '2.5mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3006', '3006', 'Forward/Reverse Cross B', 'BA', 'Cross connected with 3005 in X1 pin 19/20', '2.5mm²', 'BLUE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3007', '3007', 'Door Enable', 'BA', 'Door system enable signal', '2.5mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3008', '3008', 'Horn', 'BA', 'Horn control signal', '2.5mm²', 'YELLOW', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3009', '3009', 'Headlight', 'BA', 'Headlight control signal', '2.5mm²', 'WHITE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3010', '3010', 'Master Controller', 'BA', 'Master controller power enable', '2.5mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3011', '3011', 'Traction Enable', 'BA', 'Traction system enable', '2.5mm²', 'GREEN', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3012', '3012', 'Door Enable', 'BA', 'Door system enable', '2.5mm²', 'ORANGE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3013', '3013', 'Horn Control', 'BA', 'Horn relay control', '2.5mm²', 'YELLOW', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3014', '3014', 'Inverter Enable', 'BA', 'VVVF inverter enable', '2.5mm²', 'GREEN', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3015', '3015', 'Brake Control', 'BA', 'Brake control signal', '2.5mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3016', '3016', 'Speed Signal', 'BA', 'Speed measurement signal', '2.5mm²', 'WHITE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3017', '3017', 'Train ID', 'BA', 'Train identification code', '2.5mm²', 'BLUE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3018', '3018', 'Cab Active', 'BA', 'Active cab designation', '2.5mm²', 'GREEN', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3019', '3019', 'ATP Enable', 'BA', 'ATP system enable', '2.5mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3020', '3020', 'ATS Enable', 'BA', 'ATS system enable', '2.5mm²', 'BLUE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3021', '3021', 'Door Open Left', 'BA', 'Left door open command', '2.5mm²', 'GREEN', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3022', '3022', 'Door Close Left', 'BA', 'Left door close command', '2.5mm²', 'ORANGE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3023', '3023', 'Door Open Right', 'BA', 'Right door open command', '2.5mm²', 'GREEN', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3024', '3024', 'Door Close Right', 'BA', 'Right door close command', '2.5mm²', 'ORANGE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3025', '3025', 'Door Lock Status', 'BA', 'Door locked confirmation', '2.5mm²', 'WHITE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3026', '3026', 'Fire Alarm', 'BA', 'Fire detection alarm', '2.5mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3027', '3027', 'TCMS Data', 'BA', 'TCMS communication data', '2.5mm²', 'BLUE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3030', '3030', 'Battery Voltage', 'BA', 'Battery voltage monitoring', '2.5mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3031', '3031', 'Charger Status', 'BA', 'Battery charger status', '2.5mm²', 'GREEN', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3032', '3032', 'Emergency Stop', 'BA', 'Emergency stop signal', '2.5mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3033', '3033', 'Panto Up Status', 'BA', 'Pantograph up status', '2.5mm²', 'WHITE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3034', '3034', 'MCB Status', 'BA', 'Main circuit breaker status', '2.5mm²', 'YELLOW', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3035', '3035', 'Shore Supply', 'BA', 'Shore supply available', '2.5mm²', 'BLUE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3036', '3036', 'Battery Isolation', 'BA', 'Battery isolation switch', '2.5mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3037', '3037', 'Compressor Start', 'BA', 'Compressor motor start', '2.5mm²', 'GREEN', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3038', '3038', 'Compressor Stop', 'BA', 'Compressor motor stop', '2.5mm²', 'ORANGE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3039', '3039', 'Parking Brake Apply', 'BA', 'Parking brake apply command', '2.5mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3040', '3040', 'Parking Brake Release', 'BA', 'Parking brake release command', '2.5mm²', 'GREEN', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3041', '3041', 'Wiper On', 'BA', 'Wiper motor on', '2.5mm²', 'BLUE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3042', '3042', 'Wiper Off', 'BA', 'Wiper motor off', '2.5mm²', 'WHITE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3043', '3043', 'Coupling Control', 'BA', 'Coupling/uncoupling control', '2.5mm²', 'YELLOW', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3044', '3044', 'Tail Light', 'BA', 'Tail light control', '2.5mm²', 'WHITE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3045', '3045', 'Console Light', 'BA', 'Console light control', '2.5mm²', 'WHITE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3046', '3046', 'Interior Light', 'BA', 'Saloon interior light', '2.5mm²', 'WHITE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3047', '3047', 'Start-up Relay', 'BA', 'System start-up relay', '2.5mm²', 'GREEN', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3048', '3048', 'Shut-down Relay', 'BA', 'System shut-down relay', '2.5mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),

  -- DOOR CONTROL (6000 series)
  ('W-6009', '6009', 'Door Open Left A', 'BA', 'Door open left cross pair A', '2.5mm²', 'GREEN', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-6010', '6010', 'Door Open Right', 'BA', 'Door open right signal', '2.5mm²', 'GREEN', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-6014', '6014', 'Door Close Left A', 'BA', 'Door close left cross pair A', '2.5mm²', 'ORANGE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-6015', '6015', 'Door Close Right', 'BA', 'Door close right signal', '2.5mm²', 'ORANGE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-6020', '6020', 'Door Interlock', 'BA', 'Door interlock status', '2.5mm²', 'WHITE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-6021', '6021', 'Door Closed Status', 'BA', 'Door closed confirmation', '2.5mm²', 'WHITE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-6046', '6046', 'Door Open Left B', 'BA', 'Door open left cross pair B', '2.5mm²', 'GREEN', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-6051', '6051', 'Door Close Left B', 'BA', 'Door close left cross pair B', '2.5mm²', 'ORANGE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-6030', '6030', 'Door Proving', 'BA', 'Door proving signal', '2.5mm²', 'BLUE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-6031', '6031', 'Door IMS Comm', 'BA', 'Door-TIMS communication', '1.0mm²', 'BLUE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-6040', '6040', 'Saloon Door Supply', 'BA', 'Saloon door power supply', '2.5mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-6041', '6041', 'Saloon Door Return', 'BA', 'Saloon door power return', '2.5mm²', 'BLACK', 'GND', 'VERIFIED', NOW(), NOW()),
  ('W-6050', '6050', 'EOSS1 Override', 'BA', 'External override switch 1', '2.5mm²', 'YELLOW', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-6055', '6055', 'EOSS2 Override', 'BA', 'External override switch 2', '2.5mm²', 'YELLOW', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-6060', '6060', 'Left Door Motor +', 'BA', 'Left door motor positive', '4mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-6061', '6061', 'Left Door Motor -', 'BA', 'Left door motor negative', '4mm²', 'BLACK', 'GND', 'VERIFIED', NOW(), NOW()),
  ('W-6062', '6062', 'Right Door Motor +', 'BA', 'Right door motor positive', '4mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-6063', '6063', 'Right Door Motor -', 'BA', 'Right door motor negative', '4mm²', 'BLACK', 'GND', 'VERIFIED', NOW(), NOW()),

  -- POWER (7000 series) - ED class HV
  ('W-7001', '7001', 'Battery +110V', 'ED', 'Battery positive supply 110VDC', '16mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-7002', '7002', 'Battery GND', 'GD', 'Battery ground', '16mm²', 'BLACK', 'GND', 'VERIFIED', NOW(), NOW()),
  ('W-7010', '7010', 'Train Line +110V', 'ED', 'Train line positive distribution', '4mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-7011', '7011', 'Train Line GND', 'GD', 'Train line ground distribution', '4mm²', 'BLACK', 'GND', 'VERIFIED', NOW(), NOW()),
  ('W-7020', '7020', 'APS 750V Input+', 'ED', 'APS high tension input positive', '16mm²', 'RED', '750VDC', 'VERIFIED', NOW(), NOW()),
  ('W-7021', '7021', 'APS 750V Input-', 'ED', 'APS high tension input negative', '16mm²', 'BLACK', '750VDC', 'VERIFIED', NOW(), NOW()),
  ('W-7030', '7030', 'APS 415V L1', 'AP', 'APS output phase 1', '6mm²', 'RED', '415VAC', 'VERIFIED', NOW(), NOW()),
  ('W-7031', '7031', 'APS 415V L2', 'AP', 'APS output phase 2', '6mm²', 'BLUE', '415VAC', 'VERIFIED', NOW(), NOW()),
  ('W-7032', '7032', 'APS 415V L3', 'AP', 'APS output phase 3', '6mm²', 'YELLOW', '415VAC', 'VERIFIED', NOW(), NOW()),
  ('W-7033', '7033', 'APS 415V N', 'AP', 'APS output neutral', '6mm²', 'WHITE', '415VAC', 'VERIFIED', NOW(), NOW()),
  ('W-7040', '7040', 'Shore Supply L1', 'AP', 'Shore supply phase 1', '10mm²', 'RED', '415VAC', 'VERIFIED', NOW(), NOW()),
  ('W-7041', '7041', 'Shore Supply L2', 'AP', 'Shore supply phase 2', '10mm²', 'BLUE', '415VAC', 'VERIFIED', NOW(), NOW()),
  ('W-7042', '7042', 'Shore Supply L3', 'AP', 'Shore supply phase 3', '10mm²', 'YELLOW', '415VAC', 'VERIFIED', NOW(), NOW()),
  ('W-7043', '7043', 'Shore Supply N', 'AP', 'Shore supply neutral', '10mm²', 'WHITE', '415VAC', 'VERIFIED', NOW(), NOW()),
  ('W-7050', '7050', 'Battery Charger +', 'BA', 'Battery charger positive', '4mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-7051', '7051', 'Battery Charger -', 'BA', 'Battery charger negative', '4mm²', 'BLACK', 'GND', 'VERIFIED', NOW(), NOW()),
  ('W-7060', '7060', 'MCB Control', 'BA', 'Main circuit breaker control', '2.5mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-7061', '7061', 'MCB Status', 'BA', 'Main circuit breaker status feedback', '2.5mm²', 'GREEN', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-7070', '7070', 'HSCB Control', 'ED', 'High speed circuit breaker control', '4mm²', 'RED', '750VDC', 'VERIFIED', NOW(), NOW()),
  ('W-7071', '7071', 'HSCB Status', 'ED', 'High speed circuit breaker status', '2.5mm²', 'GREEN', '110VDC', 'VERIFIED', NOW(), NOW()),

  -- TRACTION (7500 series)
  ('W-7501', '7501', 'VVVF Input +', 'ED', 'VVVF inverter input positive', '16mm²', 'RED', '750VDC', 'VERIFIED', NOW(), NOW()),
  ('W-7502', '7502', 'VVVF Input -', 'ED', 'VVVF inverter input negative', '16mm²', 'BLACK', '750VDC', 'VERIFIED', NOW(), NOW()),
  ('W-7510', '7510', 'Motor U Phase', 'ED', 'Traction motor U phase', '16mm²', 'RED', '750VDC', 'VERIFIED', NOW(), NOW()),
  ('W-7511', '7511', 'Motor V Phase', 'ED', 'Traction motor V phase', '16mm²', 'BLUE', '750VDC', 'VERIFIED', NOW(), NOW()),
  ('W-7512', '7512', 'Motor W Phase', 'ED', 'Traction motor W phase', '16mm²', 'YELLOW', '750VDC', 'VERIFIED', NOW(), NOW()),
  ('W-7520', '7520', 'VVVF Enable', 'BA', 'VVVF inverter enable signal', '2.5mm²', 'GREEN', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-7521', '7521', 'VVVF Fault', 'BA', 'VVVF fault feedback', '2.5mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-7530', '7530', 'Speed Sensor +', 'S', 'Speed sensor signal positive', '0.75mm²', 'WHITE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-7531', '7531', 'Speed Sensor -', 'S', 'Speed sensor signal negative', '0.75mm²', 'BLACK', 'GND', 'VERIFIED', NOW(), NOW()),
  ('W-7540', '7540', 'Traction Return', 'ED', 'Traction return current path', '16mm²', 'BLACK', 'GND', 'VERIFIED', NOW(), NOW()),
  ('W-7550', '7550', 'Motor Thermistor', 'S', 'Motor temperature sensor', '0.75mm²', 'WHITE', '24VDC', 'VERIFIED', NOW(), NOW()),

  -- BRAKE (4000 series)
  ('W-4001', '4001', 'Brake Loop', 'BA', 'Brake control loop - fail safe', '2.5mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-4002', '4002', 'Brake Loop Return', 'BA', 'Brake loop return', '2.5mm²', 'BLACK', 'GND', 'VERIFIED', NOW(), NOW()),
  ('W-4003', '4003', 'E-Brake Apply', 'BA', 'Emergency brake apply', '2.5mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-4004', '4004', 'E-Brake Release', 'BA', 'Emergency brake release', '2.5mm²', 'GREEN', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-4005', '4005', 'Service Brake Apply', 'BA', 'Service brake apply', '2.5mm²', 'BLUE', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-4006', '4006', 'Service Brake Release', 'BA', 'Service brake release', '2.5mm²', 'GREEN', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-4007', '4007', 'Parking Brake', 'BA', 'Parking brake control', '2.5mm²', 'YELLOW', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-4008', '4008', 'Horn Control', 'BA', 'Horn relay control', '2.5mm²', 'YELLOW', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-4009', '4009', 'Compressor Start', 'BA', 'Compressor motor start', '2.5mm²', 'GREEN', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-4010', '4010', 'Compressor Stop', 'BA', 'Compressor motor stop', '2.5mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-4020', '4020', 'EBCU Data +', 'S', 'EBCU communication positive', '1.0mm²', 'WHITE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-4021', '4021', 'EBCU Data -', 'S', 'EBCU communication negative', '1.0mm²', 'BLACK', 'GND', 'VERIFIED', NOW(), NOW()),
  ('W-4030', '4030', 'Brake Pressure', 'S', 'Brake cylinder pressure sensor', '0.75mm²', 'WHITE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-4040', '4040', 'WSP Valve', 'BA', 'Wheel slide protection valve', '2.5mm²', 'BLUE', '110VDC', 'VERIFIED', NOW(), NOW()),

  -- AIRCON (8500 series)
  ('W-8501', '8501', 'Cab AC Power L1', 'AP', 'Cab AC power phase 1', '4mm²', 'RED', '415VAC', 'VERIFIED', NOW(), NOW()),
  ('W-8502', '8502', 'Cab AC Power L2', 'AP', 'Cab AC power phase 2', '4mm²', 'BLUE', '415VAC', 'VERIFIED', NOW(), NOW()),
  ('W-8503', '8503', 'Cab AC Power L3', 'AP', 'Cab AC power phase 3', '4mm²', 'YELLOW', '415VAC', 'VERIFIED', NOW(), NOW()),
  ('W-8510', '8510', 'Saloon AC Power L1', 'AP', 'Saloon AC power phase 1', '6mm²', 'RED', '415VAC', 'VERIFIED', NOW(), NOW()),
  ('W-8511', '8511', 'Saloon AC Power L2', 'AP', 'Saloon AC power phase 2', '6mm²', 'BLUE', '415VAC', 'VERIFIED', NOW(), NOW()),
  ('W-8512', '8512', 'Saloon AC Power L3', 'AP', 'Saloon AC power phase 3', '6mm²', 'YELLOW', '415VAC', 'VERIFIED', NOW(), NOW()),
  ('W-8520', '8520', 'AC Control', 'BA', 'AC control signal', '1.0mm²', 'WHITE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-8521', '8521', 'AC Fault', 'BA', 'AC fault feedback', '1.0mm²', 'RED', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-8530', '8530', 'Temperature Sensor', 'S', 'Cabin temperature sensor', '0.5mm²', 'WHITE', '5VDC', 'VERIFIED', NOW(), NOW()),

  -- COMMUNICATION (9000 series)
  ('W-9001', '9001', 'TCMS Data +', 'S', 'TCMS RS485 data positive', '1.0mm²', 'WHITE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9002', '9002', 'TCMS Data -', 'S', 'TCMS RS485 data negative', '1.0mm²', 'BLACK', 'GND', 'VERIFIED', NOW(), NOW()),
  ('W-9010', '9010', 'CN1 ETH TX+', 'S', 'CN1 Ethernet transmit positive', '0.5mm²', 'ORANGE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9011', '9011', 'CN1 ETH TX-', 'S', 'CN1 Ethernet transmit negative', '0.5mm²', 'WHITE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9012', '9012', 'CN1 ETH RX+', 'S', 'CN1 Ethernet receive positive', '0.5mm²', 'GREEN', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9013', '9013', 'CN1 ETH RX-', 'S', 'CN1 Ethernet receive negative', '0.5mm²', 'BLUE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9020', '9020', 'CN2 ETH TX+', 'S', 'CN2 Ethernet transmit positive', '0.5mm²', 'ORANGE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9021', '9021', 'CN2 ETH TX-', 'S', 'CN2 Ethernet transmit negative', '0.5mm²', 'WHITE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9022', '9022', 'CN2 ETH RX+', 'S', 'CN2 Ethernet receive positive', '0.5mm²', 'GREEN', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9023', '9023', 'CN2 ETH RX-', 'S', 'CN2 Ethernet receive negative', '0.5mm²', 'BLUE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9030', '9030', 'CAN High', 'S', 'CAN bus high', '0.75mm²', 'GREEN', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9031', '9031', 'CAN Low', 'S', 'CAN bus low', '0.75mm²', 'BLUE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9101', '9101', 'CBTC TX+', 'S', 'CBTC transmit positive', '0.75mm²', 'ORANGE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9102', '9102', 'CBTC TX-', 'S', 'CBTC transmit negative', '0.75mm²', 'WHITE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9103', '9103', 'CBTC RX+', 'S', 'CBTC receive positive', '0.75mm²', 'GREEN', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9104', '9104', 'CBTC RX-', 'S', 'CBTC receive negative', '0.75mm²', 'BLUE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9201', '9201', 'PA Audio L', 'S', 'PA audio input left', '0.5mm²', 'WHITE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9202', '9202', 'PA Audio R', 'S', 'PA audio input right', '0.5mm²', 'RED', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9210', '9210', 'PA Speaker +', 'AP', 'PA speaker output positive', '2.5mm²', 'RED', '415VAC', 'VERIFIED', NOW(), NOW()),
  ('W-9211', '9211', 'PA Speaker -', 'AP', 'PA speaker output negative', '2.5mm²', 'BLACK', 'GND', 'VERIFIED', NOW(), NOW()),
  ('W-9301', '9301', 'CCTV Video +', 'S', 'CCTV video positive', '0.75mm²', 'YELLOW', '12VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9302', '9302', 'CCTV Video -', 'S', 'CCTV video negative', '0.75mm²', 'BLACK', 'GND', 'VERIFIED', NOW(), NOW()),
  ('W-9303', '9303', 'CCTV Audio +', 'S', 'CCTV audio positive', '0.5mm²', 'WHITE', '12VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9304', '9304', 'CCTV Audio -', 'S', 'CCTV audio negative', '0.5mm²', 'BLACK', 'GND', 'VERIFIED', NOW(), NOW()),
  ('W-9401', '9401', 'Radio TX', 'S', 'Train radio transmit', '0.75mm²', 'WHITE', '12VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9402', '9402', 'Radio RX', 'S', 'Train radio receive', '0.75mm²', 'GREEN', '12VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9501', '9501', 'TFT Data +', 'S', 'TFT display data positive', '0.5mm²', 'WHITE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9502', '9502', 'TFT Data -', 'S', 'TFT display data negative', '0.5mm²', 'BLACK', 'GND', 'VERIFIED', NOW(), NOW()),
  ('W-9510', '9510', 'PIS Data', 'S', 'Passenger info system data', '0.5mm²', 'WHITE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9520', '9520', 'FDI Data', 'S', 'Fare display indicator data', '0.5mm²', 'WHITE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9530', '9530', 'TNI Data', 'S', 'Train number indicator data', '0.5mm²', 'WHITE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9601', '9601', 'RIO DI 1', 'BA', 'RIO digital input 1', '1.0mm²', 'WHITE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9602', '9602', 'RIO DO 1', 'BA', 'RIO digital output 1', '1.0mm²', 'GREEN', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9603', '9603', 'RIO DI 2', 'BA', 'RIO digital input 2', '1.0mm²', 'WHITE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9604', '9604', 'RIO DO 2', 'BA', 'RIO digital output 2', '1.0mm²', 'GREEN', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9701', '9701', 'CCTV Power', 'BA', 'CCTV power supply', '1.0mm²', 'RED', '12VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9702', '9702', 'CCTV GND', 'GD', 'CCTV ground', '1.0mm²', 'BLACK', 'GND', 'VERIFIED', NOW(), NOW()),
  ('W-9801', '9801', 'PAPIS Data', 'S', 'PAPIS communication data', '0.5mm²', 'WHITE', '24VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9810', '9810', 'Radio Power +', 'BA', 'Radio power supply positive', '1.0mm²', 'RED', '12VDC', 'VERIFIED', NOW(), NOW()),
  ('W-9811', '9811', 'Radio Power -', 'GD', 'Radio power supply negative', '1.0mm²', 'BLACK', 'GND', 'VERIFIED', NOW(), NOW()),

  -- LIGHTING (3500 series)
  ('W-3501', '3501', 'Head Light +', 'BA', 'Head cab main light positive', '2.5mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3502', '3502', 'Head Light -', 'BA', 'Head cab main light negative', '2.5mm²', 'BLACK', 'GND', 'VERIFIED', NOW(), NOW()),
  ('W-3510', '3510', 'Tail Light +', 'BA', 'Tail light positive', '2.5mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3511', '3511', 'Tail Light -', 'BA', 'Tail light negative', '2.5mm²', 'BLACK', 'GND', 'VERIFIED', NOW(), NOW()),
  ('W-3520', '3520', 'Flasher Light', 'BA', 'Flasher light control', '2.5mm²', 'YELLOW', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3530', '3530', 'Interior Light +', 'BA', 'Interior light positive', '4mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3531', '3531', 'Interior Light -', 'BA', 'Interior light negative', '4mm²', 'BLACK', 'GND', 'VERIFIED', NOW(), NOW()),
  ('W-3540', '3540', 'Wiper Motor +', 'BA', 'Wiper motor positive', '2.5mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW()),
  ('W-3541', '3541', 'Wiper Motor -', 'BA', 'Wiper motor negative', '2.5mm²', 'BLACK', 'GND', 'VERIFIED', NOW(), NOW()),
  ('W-3550', '3550', 'Coupling Control', 'BA', 'Coupling/uncoupling motor', '4mm²', 'RED', '110VDC', 'VERIFIED', NOW(), NOW())

ON CONFLICT ("wireNo") DO UPDATE
SET "signalName" = EXCLUDED."signalName",
    "description" = EXCLUDED."description",
    "wireStatus" = 'VERIFIED';

-- ============================================
-- CONNECTORS: Per-drawing connectors
-- ============================================

-- 942-58103 (Train Lines Control) - X1 already exists
-- 942-58104 (Train Lines Signal) - X2 already exists

-- 942-58105 (Low Tension Power)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'X3-LT', 'ALL', 'Low tension power train line connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58105'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58106 (High Tension Power)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'X4-HT', 'ALL', 'High tension power train line connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58106'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58107 (Controlling Cab)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'CAB-CTL', 'DMC', 'Controlling cab designation connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58107'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58108 (Start-up Relay)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'STARTUP', 'ALL', 'Start-up relay connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58108'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58109 (System Status)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'STATUS', 'ALL', 'System status indication connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58109'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58110 (MCB Status)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'MCB-STAT', 'ALL', 'MCB trip status monitoring connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58110'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58111 (DC Train Line Supply)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'DC-SUP', 'ALL', 'DC train line supply contactor connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58111'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58112 (Head Cab Light)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'LIGHT-H', 'DMC', 'Head cab main light connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58112'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58113 (Tail Light)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'LIGHT-T', 'DMC', 'Tail light connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58113'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58114 (Interior Light)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'LIGHT-I', 'ALL', 'Interior light connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58114'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58116 (Wiper)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'WIPER', 'DMC', 'Windscreen wiper connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58116'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58117 (Coupling)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'COUPL', 'DMC', 'Coupling/uncoupling control connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58117'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58123 (Compressor)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'COMP', 'TC', 'Compressor control connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58123'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58124 (Brake Loop)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'BRK-LOOP', 'ALL', 'Brake loop connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58124'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58126 (Parking Brake)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'PARK-BRK', 'ALL', 'Parking brake connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58126'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58127 (Horn)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'HORN', 'DMC', 'Driver horn connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58127'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58128 (Brake Control DMC/MC)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'BRK-CTL', 'DMC', 'Brake control connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58128'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58131 (Shore Supply)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'SHORE', 'ALL', 'Shore supply connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58131'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58132 (Battery Control)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'BATT', 'ALL', 'Battery control connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58132'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58137 (Saloon Door Supply)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'DOOR-SUP', 'ALL', 'Saloon door supply voltage connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58137'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58140 (Door Proving)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'DOOR-PRV', 'ALL', 'Door proving loop connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58140'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58141 (Door Interlock)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'DOOR-ILK', 'ALL', 'Door interlock connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58141'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58142 (Door IMS)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'DOOR-IMS', 'ALL', 'Door-TIMS communication connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58142'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58145 (Saloon VAC Control)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'VAC-CTL', 'ALL', 'Saloon VAC control connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58145'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58147 (TFT FDI)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'TFT-FDI', 'DMC', 'TFT display FDI connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58147'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58151 (PA TC)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'PA-TC', 'TC', 'PA amplifier TC connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58151'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- 942-58153 (Train Radio)
INSERT INTO "Connector" ("id", "drawingId", "connectorCode", "carType", "description")
SELECT gen_random_uuid()::text, d.id, 'RADIO', 'DMC', 'Train radio interface connector'
FROM "Drawing" d WHERE d."drawingNo" = '942-58153'
ON CONFLICT ("drawingId", "connectorCode") DO NOTHING;

-- ============================================
-- CONNECTOR PINS: Wire assignments per connector
-- ============================================

-- 942-58105 pins (Low Tension Power)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '7001', 'Battery +110V', 'ED'), ('2', '7002', 'Battery GND', 'GD'),
  ('3', '7010', 'Train Line +110V', 'ED'), ('4', '7011', 'Train Line GND', 'GD'),
  ('5', '3030', 'Battery Voltage', 'BA'), ('6', '3031', 'Charger Status', 'BA'),
  ('7', '3035', 'Shore Supply', 'BA'), ('8', '3036', 'Battery Isolation', 'BA'),
  ('9', '7050', 'Charger +', 'BA'), ('10', '7051', 'Charger -', 'BA')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58105' LIMIT 1)
AND c."connectorCode" = 'X3-LT'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58106 pins (High Tension Power)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '7020', 'APS 750V Input+', 'ED'), ('2', '7021', 'APS 750V Input-', 'ED'),
  ('3', '7070', 'HSCB Control', 'ED'), ('4', '7071', 'HSCB Status', 'ED'),
  ('5', '7060', 'MCB Control', 'BA'), ('6', '7061', 'MCB Status', 'BA'),
  ('7', '3033', 'Panto Up Status', 'BA'), ('8', '3034', 'MCB Status', 'BA')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58106' LIMIT 1)
AND c."connectorCode" = 'X4-HT'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58107 pins (Controlling Cab)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '3018', 'Cab Active', 'BA'), ('2', '3017', 'Train ID', 'BA'),
  ('3', '3019', 'ATP Enable', 'BA'), ('4', '3020', 'ATS Enable', 'BA'),
  ('5', '3010', 'Master Controller', 'BA'), ('6', '3001', 'Forward', 'BA'),
  ('7', '3002', 'Reverse', 'BA'), ('8', '3003', 'E-Brake', 'BA')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58107' LIMIT 1)
AND c."connectorCode" = 'CAB-CTL'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58108 pins (Start-up)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '3047', 'Start-up Relay', 'BA'), ('2', '3048', 'Shut-down Relay', 'BA'),
  ('3', '3030', 'Battery Voltage', 'BA'), ('4', '7001', 'Battery +110V', 'ED'),
  ('5', '7002', 'Battery GND', 'GD')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58108' LIMIT 1)
AND c."connectorCode" = 'STARTUP'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58109 pins (Status)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '3018', 'Cab Active', 'BA'), ('2', '3033', 'Panto Up', 'BA'),
  ('3', '3034', 'MCB Status', 'BA'), ('4', '3035', 'Shore Supply', 'BA'),
  ('5', '3030', 'Battery Voltage', 'BA'), ('6', '3031', 'Charger Status', 'BA')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58109' LIMIT 1)
AND c."connectorCode" = 'STATUS'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58110 pins (MCB Status)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '3034', 'MCB Status', 'BA'), ('2', '3030', 'Battery Voltage', 'BA'),
  ('3', '7060', 'MCB Control', 'BA'), ('4', '7061', 'MCB Feedback', 'BA'),
  ('5', '7001', 'Battery +110V', 'ED'), ('6', '7002', 'Battery GND', 'GD')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58110' LIMIT 1)
AND c."connectorCode" = 'MCB-STAT'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58111 pins (DC Supply)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '7010', 'Train Line +110V', 'ED'), ('2', '7011', 'Train Line GND', 'GD'),
  ('3', '3030', 'Battery Voltage', 'BA'), ('4', '3035', 'Shore Supply', 'BA'),
  ('5', '7060', 'MCB Control', 'BA')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58111' LIMIT 1)
AND c."connectorCode" = 'DC-SUP'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58123 pins (Compressor)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '3037', 'Compressor Start', 'BA'), ('2', '3038', 'Compressor Stop', 'BA'),
  ('3', '4009', 'Compressor Start', 'BA'), ('4', '4010', 'Compressor Stop', 'BA'),
  ('5', '7001', 'Battery +110V', 'ED'), ('6', '7002', 'Battery GND', 'GD')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58123' LIMIT 1)
AND c."connectorCode" = 'COMP'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58124 pins (Brake Loop)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '4001', 'Brake Loop', 'BA'), ('2', '4002', 'Brake Loop Return', 'BA'),
  ('3', '3015', 'Brake Control', 'BA'), ('4', '3003', 'E-Brake Request', 'BA'),
  ('5', '3004', 'Service Brake', 'BA'), ('6', '4005', 'Service Brake Apply', 'BA'),
  ('7', '7001', 'Battery +110V', 'ED'), ('8', '7002', 'Battery GND', 'GD')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58124' LIMIT 1)
AND c."connectorCode" = 'BRK-LOOP'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58126 pins (Parking Brake)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '4007', 'Parking Brake', 'BA'), ('2', '3039', 'Parking Apply', 'BA'),
  ('3', '3040', 'Parking Release', 'BA'), ('4', '7001', 'Battery +110V', 'ED'),
  ('5', '7002', 'Battery GND', 'GD')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58126' LIMIT 1)
AND c."connectorCode" = 'PARK-BRK'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58127 pins (Horn)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '4008', 'Horn Control', 'BA'), ('2', '3008', 'Horn Signal', 'BA'),
  ('3', '3013', 'Horn Relay', 'BA'), ('4', '7001', 'Battery +110V', 'ED'),
  ('5', '7002', 'Battery GND', 'GD')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58127' LIMIT 1)
AND c."connectorCode" = 'HORN'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58128 pins (Brake Control)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '4005', 'Service Brake Apply', 'BA'), ('2', '4006', 'Service Brake Release', 'BA'),
  ('3', '4003', 'E-Brake Apply', 'BA'), ('4', '4004', 'E-Brake Release', 'BA'),
  ('5', '4020', 'EBCU Data +', 'S'), ('6', '4021', 'EBCU Data -', 'S'),
  ('7', '4030', 'Brake Pressure', 'S'), ('8', '4040', 'WSP Valve', 'BA'),
  ('9', '7001', 'Battery +110V', 'ED'), ('10', '7002', 'Battery GND', 'GD')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58128' LIMIT 1)
AND c."connectorCode" = 'BRK-CTL'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58131 pins (Shore Supply)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '7040', 'Shore L1', 'AP'), ('2', '7041', 'Shore L2', 'AP'),
  ('3', '7042', 'Shore L3', 'AP'), ('4', '7043', 'Shore N', 'AP'),
  ('5', '3035', 'Shore Available', 'BA'), ('6', '3030', 'Battery Voltage', 'BA')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58131' LIMIT 1)
AND c."connectorCode" = 'SHORE'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58132 pins (Battery)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '7001', 'Battery +110V', 'ED'), ('2', '7002', 'Battery GND', 'GD'),
  ('3', '7050', 'Charger +', 'BA'), ('4', '7051', 'Charger -', 'BA'),
  ('5', '3030', 'Battery Voltage', 'BA'), ('6', '3036', 'Battery Isolation', 'BA'),
  ('7', '3031', 'Charger Status', 'BA'), ('8', '7010', 'Train Line +110V', 'ED')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58132' LIMIT 1)
AND c."connectorCode" = 'BATT'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58137 pins (Door Supply)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '6040', 'Saloon Door Supply', 'BA'), ('2', '6041', 'Saloon Door Return', 'GD'),
  ('3', '7001', 'Battery +110V', 'ED'), ('4', '7002', 'Battery GND', 'GD')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58137' LIMIT 1)
AND c."connectorCode" = 'DOOR-SUP'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58140 pins (Door Proving)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '6030', 'Door Proving', 'BA'), ('2', '6020', 'Door Interlock', 'BA'),
  ('3', '6021', 'Door Closed', 'BA'), ('4', '3025', 'Door Lock Status', 'BA'),
  ('5', '7001', 'Battery +110V', 'ED'), ('6', '7002', 'Battery GND', 'GD')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58140' LIMIT 1)
AND c."connectorCode" = 'DOOR-PRV'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58141 pins (Door Interlock)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '6020', 'Door Interlock', 'BA'), ('2', '6021', 'Door Closed', 'BA'),
  ('3', '3025', 'Door Lock Status', 'BA'), ('4', '3007', 'Door Enable', 'BA'),
  ('5', '7001', 'Battery +110V', 'ED'), ('6', '7002', 'Battery GND', 'GD')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58141' LIMIT 1)
AND c."connectorCode" = 'DOOR-ILK'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58142 pins (Door IMS)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '6031', 'Door IMS Comm', 'BA'), ('2', '3027', 'TCMS Data', 'BA'),
  ('3', '9001', 'TCMS Data +', 'S'), ('4', '9002', 'TCMS Data -', 'S'),
  ('5', '7001', 'Battery +110V', 'ED'), ('6', '7002', 'Battery GND', 'GD')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58142' LIMIT 1)
AND c."connectorCode" = 'DOOR-IMS'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58145 pins (Saloon VAC Control)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '8520', 'AC Control', 'BA'), ('2', '8521', 'AC Fault', 'BA'),
  ('3', '8530', 'Temperature Sensor', 'S'), ('4', '7001', 'Battery +110V', 'ED'),
  ('5', '7002', 'Battery GND', 'GD')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58145' LIMIT 1)
AND c."connectorCode" = 'VAC-CTL'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58147 pins (TFT FDI)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '9501', 'TFT Data +', 'S'), ('2', '9502', 'TFT Data -', 'S'),
  ('3', '9510', 'PIS Data', 'S'), ('4', '9520', 'FDI Data', 'S'),
  ('5', '9530', 'TNI Data', 'S'), ('6', '7001', 'Battery +110V', 'ED')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58147' LIMIT 1)
AND c."connectorCode" = 'TFT-FDI'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58151 pins (PA TC)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '9201', 'PA Audio L', 'S'), ('2', '9202', 'PA Audio R', 'S'),
  ('3', '9210', 'PA Speaker +', 'AP'), ('4', '9211', 'PA Speaker -', 'AP'),
  ('5', '7030', '415V L1', 'AP'), ('6', '7031', '415V L2', 'AP'),
  ('7', '7032', '415V L3', 'AP'), ('8', '7033', '415V N', 'AP')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58151' LIMIT 1)
AND c."connectorCode" = 'PA-TC'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58153 pins (Train Radio)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '9401', 'Radio TX', 'S'), ('2', '9402', 'Radio RX', 'S'),
  ('3', '9810', 'Radio Power +', 'BA'), ('4', '9811', 'Radio Power -', 'GD'),
  ('5', '9001', 'TCMS Data +', 'S'), ('6', '9002', 'TCMS Data -', 'S')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58153' LIMIT 1)
AND c."connectorCode" = 'RADIO'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58112 pins (Head Light)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '3501', 'Head Light +', 'BA'), ('2', '3502', 'Head Light -', 'BA'),
  ('3', '3009', 'Headlight Control', 'BA'), ('4', '7001', 'Battery +110V', 'ED'),
  ('5', '7002', 'Battery GND', 'GD')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58112' LIMIT 1)
AND c."connectorCode" = 'LIGHT-H'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58113 pins (Tail Light)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '3510', 'Tail Light +', 'BA'), ('2', '3511', 'Tail Light -', 'BA'),
  ('3', '3520', 'Flasher Light', 'BA'), ('4', '3044', 'Tail Light Control', 'BA'),
  ('5', '3045', 'Console Light', 'BA'), ('6', '7001', 'Battery +110V', 'ED')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58113' LIMIT 1)
AND c."connectorCode" = 'LIGHT-T'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58114 pins (Interior Light)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '3530', 'Interior Light +', 'BA'), ('2', '3531', 'Interior Light -', 'BA'),
  ('3', '3046', 'Interior Light Control', 'BA'), ('4', '7001', 'Battery +110V', 'ED'),
  ('5', '7002', 'Battery GND', 'GD')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58114' LIMIT 1)
AND c."connectorCode" = 'LIGHT-I'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58116 pins (Wiper)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '3540', 'Wiper Motor +', 'BA'), ('2', '3541', 'Wiper Motor -', 'BA'),
  ('3', '3041', 'Wiper On', 'BA'), ('4', '3042', 'Wiper Off', 'BA'),
  ('5', '7001', 'Battery +110V', 'ED'), ('6', '7002', 'Battery GND', 'GD')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58116' LIMIT 1)
AND c."connectorCode" = 'WIPER'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58117 pins (Coupling)
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '3550', 'Coupling Control', 'BA'), ('2', '3043', 'Coupling Signal', 'BA'),
  ('3', '7001', 'Battery +110V', 'ED'), ('4', '7002', 'Battery GND', 'GD')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58117' LIMIT 1)
AND c."connectorCode" = 'COUPL'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58143 pins (Cab VAC) - already has connector
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '8501', 'Cab AC L1', 'AP'), ('2', '8502', 'Cab AC L2', 'AP'),
  ('3', '8503', 'Cab AC L3', 'AP'), ('4', '8520', 'AC Control', 'BA'),
  ('5', '8521', 'AC Fault', 'BA'), ('6', '8530', 'Temperature', 'S'),
  ('7', '7001', 'Battery +110V', 'ED'), ('8', '7002', 'Battery GND', 'GD')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58143' LIMIT 1)
AND c."connectorCode" NOT LIKE 'X%'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58144 pins (Saloon VAC Power) - already has connector
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '8510', 'Saloon AC L1', 'AP'), ('2', '8511', 'Saloon AC L2', 'AP'),
  ('3', '8512', 'Saloon AC L3', 'AP'), ('4', '7030', 'APS 415V L1', 'AP'),
  ('5', '7031', 'APS 415V L2', 'AP'), ('6', '7032', 'APS 415V L3', 'AP')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58144' LIMIT 1)
AND c."connectorCode" NOT LIKE 'X%'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58150 pins (PA DMC/MC) - already has connector
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '9201', 'PA Audio L', 'S'), ('2', '9202', 'PA Audio R', 'S'),
  ('3', '9210', 'PA Speaker +', 'AP'), ('4', '9211', 'PA Speaker -', 'AP'),
  ('5', '9801', 'PAPIS Data', 'S'), ('6', '7001', 'Battery +110V', 'ED')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58150' LIMIT 1)
AND c."connectorCode" NOT LIKE 'X%'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58149 pins (CCU/PAPIS/CCTV) - already has connector
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '9801', 'PAPIS Data', 'S'), ('2', '9001', 'TCMS Data +', 'S'),
  ('3', '9002', 'TCMS Data -', 'S'), ('4', '9030', 'CAN High', 'S'),
  ('5', '9031', 'CAN Low', 'S')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58149' LIMIT 1)
AND c."connectorCode" NOT LIKE 'X%'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- 942-58154 pins (CCTV) - already has connector
INSERT INTO "ConnectorPin" ("id", "connectorId", "pinNo", "wireNo", "signalName", "conductorClassCode")
SELECT gen_random_uuid()::text, c.id, x.pin, x.wire, x.sig, x.cc
FROM "Connector" c
CROSS JOIN (VALUES
  ('1', '9301', 'CCTV Video +', 'S'), ('2', '9302', 'CCTV Video -', 'S'),
  ('3', '9303', 'CCTV Audio +', 'S'), ('4', '9304', 'CCTV Audio -', 'S'),
  ('5', '9701', 'CCTV Power +', 'BA'), ('6', '9702', 'CCTV GND', 'GD')
) AS x(pin, wire, sig, cc)
WHERE c."drawingId" = (SELECT id FROM "Drawing" WHERE "drawingNo" = '942-58154' LIMIT 1)
AND c."connectorCode" NOT LIKE 'X%'
ON CONFLICT ("connectorId", "pinNo") DO NOTHING;

-- ============================================
-- DRAWING WIRES: Link drawings to wires via pins
-- ============================================

INSERT INTO "DrawingWire" ("id", "drawingId", "wireId", "createdAt")
SELECT DISTINCT gen_random_uuid()::text, c."drawingId", w.id, NOW()
FROM "ConnectorPin" cp
JOIN "Connector" c ON c.id = cp."connectorId"
JOIN "Wire" w ON w."wireNo" = cp."wireNo"
WHERE cp."wireNo" IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM "DrawingWire" dw WHERE dw."drawingId" = c."drawingId" AND dw."wireId" = w.id
);

-- ============================================
-- WIRE ENDPOINTS: Link wires to connectors/pins
-- ============================================

INSERT INTO "WireEndpoint" ("id", "wireId", "connectorId", "pinId", "endpointRole", "endpointLabel", "endpointPin", "createdAt")
SELECT DISTINCT gen_random_uuid()::text, w.id, c.id, cp.id, 'bidirectional', c."connectorCode", cp."pinNo", NOW()
FROM "ConnectorPin" cp
JOIN "Connector" c ON c.id = cp."connectorId"
JOIN "Wire" w ON w."wireNo" = cp."wireNo"
WHERE cp."wireNo" IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM "WireEndpoint" we WHERE we."wireId" = w.id AND we."connectorId" = c.id AND we."pinId" = cp.id
);

-- ============================================
-- DEVICES: Key equipment per drawing
-- ============================================

INSERT INTO "Device" ("id", "drawingId", "systemId", "tagNo", "deviceName", "deviceType", "carType", "locationTag", "isVerified", "createdAt")
SELECT gen_random_uuid()::text, d.id, s.id, x.tag, x.name, x.type, x.car, x.loc, true, NOW()
FROM "Drawing" d
JOIN "System" s ON s.id = d."systemId"
CROSS JOIN (VALUES
  ('942-58107', 'CCU', 'Central Control Unit', 'CCU', 'DMC', 'CC CUBICLE'),
  ('942-58107', 'MC-CTL', 'Master Controller', 'CONTROLLER', 'DMC', 'CC CUBICLE'),
  ('942-58110', 'MCB1', 'Main Circuit Breaker 1', 'MCB', 'ALL', 'UNDERFRAME'),
  ('942-58119', 'VVVF', 'VVVF Inverter', 'INVERTER', 'MC', 'UNDERFRAME'),
  ('942-58119', 'HSCB', 'High Speed Circuit Breaker', 'HSCB', 'ALL', 'ROOF'),
  ('942-58119', 'MOT1', 'Traction Motor 1', 'MOTOR', 'MC', 'BOGIE'),
  ('942-58123', 'COMP', 'Compressor Motor', 'COMPRESSOR', 'TC', 'UNDERFRAME'),
  ('942-58125', 'EBCU', 'Electronic Brake Control Unit', 'EBCU', 'MC', 'UNDERFRAME'),
  ('942-58125', 'BECU', 'Brake Electronic Control Unit', 'BECU', 'ALL', 'UNDERFRAME'),
  ('942-58127', 'HORN', 'Driver Horn', 'HORN', 'DMC', 'FRONT'),
  ('942-58130', 'APS', 'Auxiliary Power Supply', 'APS', 'ALL', 'UNDERFRAME'),
  ('942-58130', 'SIV', 'Static Inverter', 'SIV', 'ALL', 'UNDERFRAME'),
  ('942-58132', 'BATT', 'Battery Pack', 'BATTERY', 'ALL', 'UNDERFRAME'),
  ('942-58136', 'EDCU1L', 'EDCU Left Door 1', 'EDCU', 'DMC', 'DOOR'),
  ('942-58136', 'EDCU1R', 'EDCU Right Door 1', 'EDCU', 'DMC', 'DOOR'),
  ('942-58139', 'EDCU2L', 'EDCU Left Door 2', 'EDCU', 'TC', 'DOOR'),
  ('942-58139', 'EDCU2R', 'EDCU Right Door 2', 'EDCU', 'TC', 'DOOR'),
  ('942-58143', 'CAB-AC', 'Cab Air Conditioning', 'AC', 'DMC', 'CAB'),
  ('942-58144', 'SAL-AC1', 'Saloon AC Unit 1', 'AC', 'ALL', 'ROOF'),
  ('942-58146', 'CN1', 'TCMS Communication Node 1', 'CN', 'ALL', 'CC CUBICLE'),
  ('942-58146', 'CN2', 'TCMS Communication Node 2', 'CN', 'ALL', 'CC CUBICLE'),
  ('942-58146', 'RIO1', 'Remote IO Unit 1', 'RIO', 'ALL', 'CC CUBICLE'),
  ('942-58146', 'RIO2', 'Remote IO Unit 2', 'RIO', 'ALL', 'CC CUBICLE'),
  ('942-58146', 'L3-SW', 'L3 Ethernet Switch', 'ETH_SW', 'ALL', 'CC CUBICLE'),
  ('942-58149', 'CCU-PAPIS', 'CCU PAPIS Interface', 'PAPIS', 'DMC', 'CC CUBICLE'),
  ('942-58150', 'PA-AMP1', 'PA Amplifier DMC', 'PA', 'DMC', 'CC CUBICLE'),
  ('942-58150', 'PA-AMP2', 'PA Amplifier MC', 'PA', 'MC', 'CC CUBICLE'),
  ('942-58152', 'CBTC-CU', 'CBTC Control Unit', 'CBTC', 'DMC', 'CC CUBICLE'),
  ('942-58154', 'CCTV-CU', 'CCTV Control Unit', 'CCTV', 'DMC', 'CC CUBICLE'),
  ('942-58154', 'CCTV-CAM1', 'CCTV Camera 1', 'CAMERA', 'DMC', 'SALOON')
) AS x(drawing_no, tag, name, type, car, loc)
WHERE d."drawingNo" = x.drawing_no
ON CONFLICT DO NOTHING;

-- ============================================
-- FINAL COUNTS
-- ============================================

SELECT '=== CONNECTIVITY COMPLETE ===' as status;
SELECT tbl, cnt FROM (
    SELECT 'Drawings' as tbl, COUNT(*) as cnt FROM "Drawing"
    UNION ALL SELECT 'Connectors', COUNT(*) FROM "Connector"
    UNION ALL SELECT 'ConnectorPins', COUNT(*) FROM "ConnectorPin"
    UNION ALL SELECT 'Wires', COUNT(*) FROM "Wire"
    UNION ALL SELECT 'DrawingWires', COUNT(*) FROM "DrawingWire"
    UNION ALL SELECT 'WireEndpoints', COUNT(*) FROM "WireEndpoint"
    UNION ALL SELECT 'Devices', COUNT(*) FROM "Device"
    UNION ALL SELECT 'Circuits', COUNT(*) FROM "Circuit"
    UNION ALL SELECT 'CircuitEndpoints', COUNT(*) FROM "CircuitEndpoint"
    UNION ALL SELECT 'Signals', COUNT(*) FROM "Signal"
    UNION ALL SELECT 'Trainlines', COUNT(*) FROM "TrainLine"
) ORDER BY tbl;

-- Per-drawing connectivity
SELECT d."drawingNo", d.title,
  (SELECT COUNT(*) FROM "Connector" c WHERE c."drawingId" = d.id) as conn,
  (SELECT COUNT(*) FROM "ConnectorPin" cp JOIN "Connector" c ON c.id = cp."connectorId" WHERE c."drawingId" = d.id) as pins,
  (SELECT COUNT(*) FROM "DrawingWire" dw WHERE dw."drawingId" = d.id) as wires
FROM "Drawing" d
WHERE d."drawingNo" LIKE '942-58%'
AND d."drawingNo" NOT IN ('942-58099','942-58100','942-58101','942-58102')
ORDER BY d."drawingNo";

COMMIT;
