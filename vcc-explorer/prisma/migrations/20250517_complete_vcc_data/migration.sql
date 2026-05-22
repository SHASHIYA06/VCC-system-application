-- Complete VCC Data Migration
-- This migration adds comprehensive circuit, wire, trainline, and equipment data from the VCC documents

-- Ensure Signal table has the medium column (was missing)
-- ALTER TABLE "Signal" ADD COLUMN IF NOT EXISTS "medium" TEXT;

-- Add missing indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_circuit_wire_no ON "Circuit"(wireNo);
CREATE INDEX IF NOT EXISTS idx_circuit_system ON "Circuit"(systemCode);
CREATE INDEX IF NOT EXISTS idx_circuit_car_type ON "Circuit"(carType);
CREATE INDEX IF NOT EXISTS idx_circuit_drawing ON "Circuit"(drawingId);

CREATE INDEX IF NOT EXISTS idx_wire_wire_no ON "Wire"(wireNo);
CREATE INDEX IF NOT EXISTS idx_wire_signal ON "Wire"(signalName);
CREATE INDEX IF NOT EXISTS idx_wire_voltage ON "Wire"(voltageClass);

CREATE INDEX IF NOT EXISTS idx_trainline_wire ON "TrainLine"(wireNo);
CREATE INDEX IF NOT EXISTS idx_trainline_car ON "TrainLine"(carType);
CREATE INDEX IF NOT EXISTS idx_trainline_group ON "TrainLine"(lineGroup);

CREATE INDEX IF NOT EXISTS idx_connector_code ON "Connector"(connectorCode);
CREATE INDEX IF NOT EXISTS idx_connector_drawing ON "Connector"(drawingId);

CREATE INDEX IF NOT EXISTS idx_pin_connector ON "ConnectorPin"(connectorId);
CREATE INDEX IF NOT EXISTS idx_pin_wire ON "ConnectorPin"(wireNo);

CREATE INDEX IF NOT EXISTS idx_device_tag ON "Device"(tagNo);
CREATE INDEX IF NOT EXISTS idx_device_system ON "Device"(systemId);

-- Create cross-connection table if not exists
CREATE TABLE IF NOT EXISTS "CrossConnection" (
    id            TEXT   PRIMARY KEY DEFAULT gen_random_uuid(),
    drawingId     TEXT   NOT NULL,
    connectorCode TEXT,
    pinA          TEXT,
    pinB          TEXT,
    wireA         TEXT,
    wireB         TEXT,
    note          TEXT   NOT NULL,
    ruleType      TEXT,
    extra         JSONB  DEFAULT '{}'
);

-- Ensure ValidationIssue table exists
CREATE TABLE IF NOT EXISTS "ValidationIssue" (
    id            TEXT   PRIMARY KEY DEFAULT gen_random_uuid(),
    entityType    TEXT   NOT NULL,
    entityId      TEXT,
    severity     TEXT   NOT NULL DEFAULT 'warning',
    message       TEXT   NOT NULL,
    details       JSONB,
    resolved      BOOLEAN DEFAULT false,
    createdAt     TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure WireEndpoint table exists
CREATE TABLE IF NOT EXISTS "WireEndpoint" (
    id            TEXT   PRIMARY KEY DEFAULT gen_random_uuid(),
    wireId        TEXT   NOT NULL,
    endpointType  TEXT   NOT NULL,
    endpointLabel TEXT,
    equipmentCode TEXT,
    connectorCode TEXT,
    pinNo         TEXT,
    carType       TEXT,
    createdAt     TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated system codes based on VCC document structure
INSERT INTO "System" (id, code, name, category, description, sortOrder) VALUES 
    (gen_random_uuid(), 'GEN', 'General', 'Foundation', 'General documentation and standards', 1),
    (gen_random_uuid(), 'TRL', 'Train Line', 'Core Systems', 'Trainline control and signal wiring', 2),
    (gen_random_uuid(), 'CAB', 'Cab Equipment', 'Core Systems', 'Cab controls, startup, status indication', 3),
    (gen_random_uuid(), 'TRAC', 'Traction', 'Core Systems', 'Speed control, VVVF, propulsion', 4),
    (gen_random_uuid(), 'BRAKE', 'Brake System', 'Core Systems', 'Brake loop, emergency brake, parking brake', 5),
    (gen_random_uuid(), 'AUX', 'Auxiliary Electric', 'Power', 'APS, shore supply, battery control', 6),
    (gen_random_uuid(), 'DOOR', 'Door System', 'Passenger Systems', 'Door operation, proving loop, interlock', 7),
    (gen_random_uuid(), 'VAC', 'VAC/HVAC', 'Passenger Systems', 'Cab VAC, saloon VAC, ventilation', 8),
    (gen_random_uuid(), 'TMS', 'TMS/TCMS', 'Communication', 'Train management system, remote I/O', 9),
    (gen_random_uuid(), 'COMMS', 'Communication', 'Communication', 'PIS, PA, CBTC, radio, CCTV', 10),
    (gen_random_uuid(), 'HV', 'High Voltage', 'Power', 'HV collection, pantograph, main circuit', 11),
    (gen_random_uuid(), 'BOGIE', 'Bogie', 'Mechanical', 'Bogies, wheels, suspension', 12),
    (gen_random_uuid(), 'LIGHT', 'Lighting', 'Auxiliary', 'Interior, exterior, emergency lighting', 13)
ON CONFLICT (code) DO NOTHING;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "System" WHERE code = 'CAB') THEN
        INSERT INTO "System" (code, name, category, description, sortOrder) VALUES 
            ('CAB', 'Cab Equipment', 'Core Systems', 'Cab controls, operating panel, MCB panel', 3),
            ('TRAC', 'Traction', 'Core Systems', 'Speed control, VVVF control, traction motor', 4),
            ('BRAKE', 'Brake System', 'Core Systems', 'Brake control, emergency brake, parking brake', 5),
            ('AUX', 'Auxiliary Electric', 'Power', 'APS, shore supply, battery, 110V/415V', 6),
            ('DOOR', 'Door System', 'Passenger Systems', 'Door operation, proving, TMS comm', 7),
            ('VAC', 'VAC/HVAC', 'Passenger Systems', 'Cab/saloon air conditioning', 8),
            ('TMS', 'TMS/TCMS', 'Communication', 'Train management system, RIO points', 9),
            ('COMMS', 'Communication', 'Communication', 'PIS/TIS, PA, CBTC, radio, CCTV', 10),
            ('HV', 'High Voltage', 'Power', 'Pantograph, collector shoe, 750V main', 11),
            ('BOGIE', 'Bogie', 'Mechanical', 'Bogie equipment, speed sensors', 12),
            ('LIGHT', 'Lighting', 'Auxiliary', 'Interior and exterior lighting', 13);
    END IF;
END $$;