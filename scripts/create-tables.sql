-- Create essential tables for the new schema

-- Systems table
CREATE TABLE IF NOT EXISTS "systems" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT UNIQUE NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "sort_order" INTEGER DEFAULT 0,
    "status" TEXT DEFAULT 'active',
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drawings table
CREATE TABLE IF NOT EXISTS "drawings" (
    "id" TEXT PRIMARY KEY,
    "drawing_number" TEXT UNIQUE NOT NULL,
    "title" TEXT NOT NULL,
    "drawing_type" TEXT DEFAULT 'electrical',
    "car_type" TEXT,
    "revision" TEXT DEFAULT '0',
    "status" TEXT DEFAULT 'active',
    "pdf_url" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Connectors table
CREATE TABLE IF NOT EXISTS "connectors" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "location" TEXT,
    "drawing_reference" TEXT,
    "pin_count" INTEGER,
    "status" TEXT DEFAULT 'active',
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wires table
CREATE TABLE IF NOT EXISTS "wires" (
    "id" TEXT PRIMARY KEY,
    "wire_number" TEXT NOT NULL,
    "wire_color" TEXT,
    "wire_gauge" TEXT,
    "signal_medium" TEXT,
    "drawing_reference" TEXT,
    "status" TEXT DEFAULT 'unverified',
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment table
CREATE TABLE IF NOT EXISTS "equipment" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT UNIQUE NOT NULL,
    "subsystemId" TEXT,
    "manufacturer" TEXT,
    "model" TEXT,
    "partNumber" TEXT,
    "description" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Devices table
CREATE TABLE IF NOT EXISTS "devices" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "device_type" TEXT,
    "location" TEXT,
    "part_number" TEXT,
    "manufacturer" TEXT,
    "status" TEXT DEFAULT 'pending',
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Connector Types table
CREATE TABLE IF NOT EXISTS "ConnectorType" (
    "code" TEXT PRIMARY KEY,
    "nominalPins" INTEGER,
    "description" TEXT,
    "voltageClass" TEXT,
    "remarks" TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_systems_code" ON "systems" ("code");
CREATE INDEX IF NOT EXISTS "idx_drawings_number" ON "drawings" ("drawing_number");
CREATE INDEX IF NOT EXISTS "idx_connectors_code" ON "connectors" ("code");
CREATE INDEX IF NOT EXISTS "idx_wires_number" ON "wires" ("wire_number");
CREATE INDEX IF NOT EXISTS "idx_equipment_code" ON "equipment" ("code");