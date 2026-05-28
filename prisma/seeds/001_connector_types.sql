-- Seed Connector Types
-- This script creates all standard connector types used in VCC system

BEGIN;

-- Insert connector types
INSERT INTO "ConnectorType" (id, code, name, description, "pinCount", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), '74P', '74-Pin Inter-car Jumper', 'Standard 74-pin inter-car control jumper (X1, X2)', 74, NOW(), NOW()),
  (gen_random_uuid(), '11P', '11-Pin Power Jumper', '415V AC 3-phase power jumper (X3)', 11, NOW(), NOW()),
  (gen_random_uuid(), '3P', '3-Pin DC Power Jumper', '110V DC power jumper (X4)', 3, NOW(), NOW()),
  (gen_random_uuid(), 'CN', 'Standard Connector', 'Generic equipment connector', NULL, NOW(), NOW()),
  (gen_random_uuid(), 'X1', 'X1 Inter-car Jumper', '74-pin control jumper X1', 74, NOW(), NOW()),
  (gen_random_uuid(), 'X2', 'X2 Inter-car Jumper', '74-pin control+power jumper X2', 74, NOW(), NOW()),
  (gen_random_uuid(), 'X3', 'X3 Power Jumper', '11-pin 415V AC jumper', 11, NOW(), NOW()),
  (gen_random_uuid(), 'X4', 'X4 DC Power Jumper', '3-pin 110V DC jumper', 3, NOW(), NOW()),
  (gen_random_uuid(), 'J1', 'J1 Connector', 'Equipment connector J1', NULL, NOW(), NOW()),
  (gen_random_uuid(), 'J2', 'J2 Connector', 'Equipment connector J2', NULL, NOW(), NOW()),
  (gen_random_uuid(), 'J3', 'J3 Connector', 'Equipment connector J3', NULL, NOW(), NOW()),
  (gen_random_uuid(), 'J4', 'J4 Connector', 'Equipment connector J4', NULL, NOW(), NOW()),
  (gen_random_uuid(), 'P1', 'P1 Panel Connector', 'Panel connector P1', NULL, NOW(), NOW()),
  (gen_random_uuid(), 'P2', 'P2 Panel Connector', 'Panel connector P2', NULL, NOW(), NOW()),
  (gen_random_uuid(), 'P3', 'P3 Panel Connector', 'Panel connector P3', NULL, NOW(), NOW()),
  (gen_random_uuid(), 'M12', 'M12 Connector', 'M12 circular connector for Ethernet', 8, NOW(), NOW()),
  (gen_random_uuid(), 'RJ45', 'RJ45 Ethernet', 'RJ45 Ethernet connector', 8, NOW(), NOW()),
  (gen_random_uuid(), 'TB', 'Terminal Block', 'Screw terminal block', NULL, NOW(), NOW()),
  (gen_random_uuid(), 'PLUG', 'Plug Connector', 'Standard plug connector', NULL, NOW(), NOW()),
  (gen_random_uuid(), 'SOCKET', 'Socket Connector', 'Standard socket connector', NULL, NOW(), NOW()),
  (gen_random_uuid(), 'VVVF_CN1', 'VVVF CN1', 'VVVF inverter main connector CN1', 20, NOW(), NOW()),
  (gen_random_uuid(), 'VVVF_CN2', 'VVVF CN2', 'VVVF inverter secondary connector CN2', 16, NOW(), NOW()),
  (gen_random_uuid(), 'RIO_U15', 'TCMS RIO U15', 'TCMS RIO connector U15', 40, NOW(), NOW()),
  (gen_random_uuid(), 'RIO_U25', 'TCMS RIO U25', 'TCMS RIO connector U25', 40, NOW(), NOW()),
  (gen_random_uuid(), 'DCU_CN1', 'DCU CN1', 'Door Control Unit connector CN1', 16, NOW(), NOW()),
  (gen_random_uuid(), 'APS_CN1', 'APS CN1', 'Auxiliary Power Supply connector CN1', 24, NOW(), NOW()),
  (gen_random_uuid(), 'APS_CN3', 'APS CN3', 'Auxiliary Power Supply connector CN3', 12, NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  "pinCount" = COALESCE(EXCLUDED."pinCount", "ConnectorType"."pinCount"),
  "updatedAt" = NOW();

COMMIT;

-- Verification query
SELECT code, name, "pinCount", COUNT(*) as count
FROM "ConnectorType"
GROUP BY code, name, "pinCount"
ORDER BY code;
