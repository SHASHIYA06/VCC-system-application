-- ============================================================================
-- VCC System - Connector Types Seed Script
-- ============================================================================
-- Purpose: Seed the ConnectorType table with all required connector types
--          to fix foreign key constraint errors in the sync script
-- 
-- Usage: psql "$DATABASE_URL" -f scripts/seed-connector-types.sql
-- 
-- Date: May 21, 2026
-- ============================================================================

-- Insert all required connector types
-- Using ON CONFLICT DO NOTHING to make this script idempotent (safe to run multiple times)

INSERT INTO "ConnectorType" (code, "nominalPins", description, "voltageClass", remarks)
VALUES
  -- 74-Pin Intercar Connector (Primary connector type)
  ('74P', 74, '74-Pin Intercar Connector', '110V', 'Standard 74-pin connector for intercar connections between train cars'),
  
  -- Standard Connector Series
  ('CN', NULL, 'Standard Connector', NULL, 'Generic connector type used across multiple systems'),
  ('CN1', NULL, 'CN1 Series Connector', NULL, 'CN1 series connector - first connector in a group'),
  ('CN2', NULL, 'CN2 Series Connector', NULL, 'CN2 series connector - second connector in a group'),
  ('CN3', NULL, 'CN3 Series Connector', NULL, 'CN3 series connector - third connector in a group'),
  ('CN4', NULL, 'CN4 Series Connector', NULL, 'CN4 series connector - fourth connector in a group'),
  ('CN5', NULL, 'CN5 Series Connector', NULL, 'CN5 series connector - fifth connector in a group'),
  
  -- X-Series Connectors (CAB connectors)
  ('X', NULL, 'X-Series Connector', NULL, 'X-series connector base type'),
  ('X1', NULL, 'X1 Connector', '110V', 'X1 connector for CAB (Cab) systems'),
  ('X2', NULL, 'X2 Connector', '110V', 'X2 connector for CAB (Cab) systems'),
  ('X3', NULL, 'X3 Connector', '110V', 'X3 connector for CAB (Cab) systems'),
  ('X4', NULL, 'X4 Connector', '110V', 'X4 connector for CAB (Cab) systems'),
  
  -- J-Series Connectors (EDB Panel connectors)
  ('J', NULL, 'J-Series Connector', NULL, 'J-series connector for EDB panels'),
  ('J1', NULL, 'J1 Connector', '110V', 'J1 connector for EDB (Emergency Door Bypass) panels'),
  ('J2', NULL, 'J2 Connector', '110V', 'J2 connector for EDB panels'),
  ('J3', NULL, 'J3 Connector', '110V', 'J3 connector for EDB panels'),
  ('J4', NULL, 'J4 Connector', '110V', 'J4 connector for EDB panels'),
  
  -- P-Series Connectors (Panel connectors)
  ('P', NULL, 'Panel Connector', NULL, 'Panel-mounted connector base type'),
  ('P1', NULL, 'P1 Panel Connector', NULL, 'P1 panel-mounted connector'),
  ('P2', NULL, 'P2 Panel Connector', NULL, 'P2 panel-mounted connector'),
  ('P3', NULL, 'P3 Panel Connector', NULL, 'P3 panel-mounted connector'),
  
  -- Additional common connector types
  ('TB', NULL, 'Terminal Block', NULL, 'Terminal block connector'),
  ('PL', NULL, 'Plug Connector', NULL, 'Plug-type connector'),
  ('SK', NULL, 'Socket Connector', NULL, 'Socket-type connector'),
  ('JP', NULL, 'Jumper Connector', NULL, 'Jumper connector for configuration'),
  ('SW', NULL, 'Switch Connector', NULL, 'Switch-type connector')

ON CONFLICT (code) DO NOTHING;

-- Verify the insert
SELECT 
  code, 
  "nominalPins", 
  description, 
  "voltageClass"
FROM "ConnectorType"
ORDER BY code;

-- Display summary
SELECT 
  COUNT(*) as total_connector_types,
  COUNT(CASE WHEN "nominalPins" IS NOT NULL THEN 1 END) as types_with_pin_count,
  COUNT(CASE WHEN "voltageClass" IS NOT NULL THEN 1 END) as types_with_voltage
FROM "ConnectorType";

-- ============================================================================
-- Expected Output:
-- - 27 connector types inserted (or already exist)
-- - All required types for sync script: 74P, CN, X, J, P, CN1-CN5, X1-X4, J1-J4, P1-P3
-- ============================================================================
