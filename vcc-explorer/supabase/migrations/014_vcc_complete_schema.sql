-- 001_vcc_complete_schema.sql
-- Complete VCC (Vehicle Control Circuits) schema for KMRCL RS3R Metro Cars
-- Based on VCC Description PDF with all 137+ pages

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- PROJECT & FORMATION SETUP
-- ============================================

CREATE TABLE IF NOT EXISTS "Project" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "projectCode" TEXT NOT NULL UNIQUE,
    "projectName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Formation" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "projectId" TEXT NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
    "formationCode" TEXT NOT NULL,
    "formationName" TEXT NOT NULL,
    "carCount" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE("projectId", "formationCode")
);

CREATE TABLE IF NOT EXISTS "Car" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "formationId" TEXT NOT NULL REFERENCES "Formation"("id") ON DELETE CASCADE,
    "carPosition" INTEGER NOT NULL,
    "carCode" TEXT NOT NULL,
    "carType" TEXT NOT NULL CHECK ("carType" IN ('DMC', 'TC', 'MC')),
    "carLabel" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE("formationId", "carPosition"),
    UNIQUE("formationId", "carCode")
);

-- ============================================
-- SYSTEM MASTER
-- ============================================

CREATE TABLE IF NOT EXISTS "System" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "code" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- ============================================
-- REFERENCE DRAWINGS
-- ============================================

CREATE TABLE IF NOT EXISTS "ReferenceDrawing" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "projectId" TEXT NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
    "refNo" TEXT NOT NULL UNIQUE,
    "title" TEXT NOT NULL,
    "revision" TEXT NOT NULL DEFAULT '',
    "sourceOrg" TEXT,
    "remarks" TEXT,
    "extra" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- MAIN DRAWINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "Drawing" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "projectId" TEXT NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
    "systemId" TEXT REFERENCES "System"("id"),
    "drawingNo" TEXT NOT NULL,
    "revision" TEXT NOT NULL DEFAULT '0',
    "title" TEXT NOT NULL,
    "totalSheets" INTEGER NOT NULL DEFAULT 1,
    "sourceFileId" TEXT,
    "isReference" BOOLEAN NOT NULL DEFAULT false,
    "remarks" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE("projectId", "drawingNo", "revision")
);

CREATE INDEX IF NOT EXISTS "idx_drawing_project" ON "Drawing"("projectId");
CREATE INDEX IF NOT EXISTS "idx_drawing_system" ON "Drawing"("systemId");
CREATE INDEX IF NOT EXISTS "idx_drawing_no" ON "Drawing"("drawingNo");

-- ============================================
-- DRAWING APPLICABILITY (DMC/TC/MC)
-- ============================================

CREATE TABLE IF NOT EXISTS "DrawingApplicability" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "drawingId" TEXT NOT NULL REFERENCES "Drawing"("id") ON DELETE CASCADE,
    "carType" TEXT NOT NULL CHECK ("carType" IN ('DMC', 'TC', 'MC', 'ALL')),
    "applicable" BOOLEAN NOT NULL DEFAULT true,
    "remark" TEXT,
    UNIQUE("drawingId", "carType")
);

-- ============================================
-- DRAWING REFERENCES LINK
-- ============================================

CREATE TABLE IF NOT EXISTS "DrawingReference" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "drawingId" TEXT NOT NULL REFERENCES "Drawing"("id") ON DELETE CASCADE,
    "referenceId" TEXT NOT NULL REFERENCES "ReferenceDrawing"("id") ON DELETE CASCADE,
    "relationType" TEXT NOT NULL DEFAULT 'REFERENCE',
    "note" TEXT,
    UNIQUE("drawingId", "referenceId", "relationType")
);

-- ============================================
-- DRAWING PAGES
-- ============================================

CREATE TABLE IF NOT EXISTS "DrawingPage" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "drawingId" TEXT NOT NULL REFERENCES "Drawing"("id") ON DELETE CASCADE,
    "pageNo" INTEGER NOT NULL,
    "pageLabel" TEXT,
    "ocrText" TEXT,
    "rawText" TEXT,
    "parseStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "extra" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE("drawingId", "pageNo")
);

CREATE INDEX IF NOT EXISTS "idx_drawing_page_drawing" ON "DrawingPage"("drawingId");

-- ============================================
-- DRAWING NOTES
-- ============================================

CREATE TABLE IF NOT EXISTS "DrawingNote" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "drawingId" TEXT NOT NULL REFERENCES "Drawing"("id") ON DELETE CASCADE,
    "noteType" TEXT NOT NULL,
    "noteText" TEXT NOT NULL,
    "sourceSheet" TEXT,
    "extra" JSONB NOT NULL DEFAULT '{}'
);

-- ============================================
-- CONDUCTOR CLASSES (ED, AP, BA, S, PE, GD, SP)
-- ============================================

CREATE TABLE IF NOT EXISTS "ConductorClass" (
    "code" TEXT PRIMARY KEY,
    "description" TEXT NOT NULL,
    "voltageDomain" TEXT
);

-- ============================================
-- CONNECTOR TYPES (X1, X2, X3, X4, X5, X6, X7, X8, X9, X10)
-- ============================================

CREATE TABLE IF NOT EXISTS "ConnectorType" (
    "code" TEXT PRIMARY KEY,
    "nominalPins" INTEGER,
    "description" TEXT NOT NULL,
    "voltageClass" TEXT,
    "remarks" TEXT
);

-- ============================================
-- CONNECTOR INSTANCES
-- ============================================

CREATE TABLE IF NOT EXISTS "Connector" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "drawingId" TEXT NOT NULL REFERENCES "Drawing"("id") ON DELETE CASCADE,
    "connectorCode" TEXT NOT NULL REFERENCES "ConnectorType"("code"),
    "carType" TEXT CHECK ("carType" IN ('DMC', 'TC', 'MC')),
    "instanceLabel" TEXT,
    "locationTag" TEXT,
    "sideTag" TEXT,
    "description" TEXT,
    "extra" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_connector_drawing" ON "Connector"("drawingId");
CREATE INDEX IF NOT EXISTS "idx_connector_code" ON "Connector"("connectorCode");

-- ============================================
-- CONNECTOR PINS
-- ============================================

CREATE TABLE IF NOT EXISTS "ConnectorPin" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "connectorId" TEXT NOT NULL REFERENCES "Connector"("id") ON DELETE CASCADE,
    "pinNo" TEXT NOT NULL,
    "pinLabel" TEXT,
    "wireNo" TEXT,
    "signalName" TEXT,
    "conductorClassCode" TEXT REFERENCES "ConductorClass"("code"),
    "voltageText" TEXT,
    "terminalFrom" TEXT,
    "terminalTo" TEXT,
    "sourceSheetRef" TEXT,
    "note" TEXT,
    "extra" JSONB NOT NULL DEFAULT '{}',
    UNIQUE("connectorId", "pinNo")
);

CREATE INDEX IF NOT EXISTS "idx_connector_pin_wire" ON "ConnectorPin"("wireNo");
CREATE INDEX IF NOT EXISTS "idx_connector_pin_signal" ON "ConnectorPin"("signalName");

-- ============================================
-- DEVICES
-- ============================================

CREATE TABLE IF NOT EXISTS "Device" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "drawingId" TEXT NOT NULL REFERENCES "Drawing"("id") ON DELETE CASCADE,
    "tagNo" TEXT,
    "deviceName" TEXT NOT NULL,
    "deviceType" TEXT,
    "carType" TEXT CHECK ("carType" IN ('DMC', 'TC', 'MC')),
    "locationTag" TEXT,
    "manufacturerRef" TEXT,
    "note" TEXT,
    "extra" JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS "idx_device_drawing" ON "Device"("drawingId");
CREATE INDEX IF NOT EXISTS "idx_device_tag" ON "Device"("tagNo");
CREATE INDEX IF NOT EXISTS "idx_device_name" ON "Device"("deviceName");

-- ============================================
-- CIRCUITS
-- ============================================

CREATE TABLE IF NOT EXISTS "Circuit" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "drawingId" TEXT NOT NULL REFERENCES "Drawing"("id") ON DELETE CASCADE,
    "circuitCode" TEXT,
    "circuitName" TEXT NOT NULL,
    "category" TEXT,
    "voltageText" TEXT,
    "protocolText" TEXT,
    "carScope" TEXT,
    "note" TEXT,
    "extra" JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS "idx_circuit_drawing" ON "Circuit"("drawingId");

-- ============================================
-- CIRCUIT ENDPOINTS
-- ============================================

CREATE TABLE IF NOT EXISTS "CircuitEndpoint" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "circuitId" TEXT NOT NULL REFERENCES "Circuit"("id") ON DELETE CASCADE,
    "fromDeviceId" TEXT REFERENCES "Device"("id") ON DELETE SET NULL,
    "toDeviceId" TEXT REFERENCES "Device"("id") ON DELETE SET NULL,
    "fromLabel" TEXT,
    "toLabel" TEXT,
    "connectorFrom" TEXT,
    "pinFrom" TEXT,
    "connectorTo" TEXT,
    "pinTo" TEXT,
    "wireNo" TEXT,
    "conductorClassCode" TEXT REFERENCES "ConductorClass"("code"),
    "note" TEXT,
    "extra" JSONB NOT NULL DEFAULT '{}'
);

-- ============================================
-- TRAIN LINES (CONTROL, SIGNAL, POWER)
-- ============================================

CREATE TABLE IF NOT EXISTS "TrainLine" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "drawingId" TEXT NOT NULL REFERENCES "Drawing"("id") ON DELETE CASCADE,
    "lineGroup" TEXT NOT NULL CHECK ("lineGroup" IN ('CONTROL', 'SIGNAL', 'LT_POWER', 'HT_POWER', 'COMM', 'OTHER')),
    "itemName" TEXT NOT NULL,
    "wireNo" TEXT,
    "connectorCode" TEXT,
    "pinNo" TEXT,
    "carType" TEXT CHECK ("carType" IN ('DMC', 'TC', 'MC')),
    "sourceSheet" TEXT,
    "note" TEXT,
    "extra" JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS "idx_train_line_drawing" ON "TrainLine"("drawingId");
CREATE INDEX IF NOT EXISTS "idx_train_line_wire" ON "TrainLine"("wireNo");

-- ============================================
-- SIGNALS
-- ============================================

CREATE TABLE IF NOT EXISTS "Signal" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "drawingId" TEXT NOT NULL REFERENCES "Drawing"("id") ON DELETE CASCADE,
    "signalName" TEXT NOT NULL,
    "signalCode" TEXT,
    "protocol" TEXT,
    "voltageText" TEXT,
    "direction" TEXT,
    "sourceSheet" TEXT,
    "note" TEXT,
    "extra" JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS "idx_signal_drawing" ON "Signal"("drawingId");

-- ============================================
-- CROSS CONNECTIONS (X1/X2 jumper internal cross)
-- ============================================

CREATE TABLE IF NOT EXISTS "CrossConnection" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "drawingId" TEXT NOT NULL REFERENCES "Drawing"("id") ON DELETE CASCADE,
    "connectorCode" TEXT,
    "pinA" TEXT,
    "pinB" TEXT,
    "wireA" TEXT,
    "wireB" TEXT,
    "note" TEXT NOT NULL,
    "extra" JSONB NOT NULL DEFAULT '{}'
);

-- ============================================
-- WIRES MASTER
-- ============================================

CREATE TABLE IF NOT EXISTS "Wire" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "wireNo" TEXT NOT NULL UNIQUE,
    "signalName" TEXT,
    "conductorClassCode" TEXT REFERENCES "ConductorClass"("code"),
    "description" TEXT,
    "wireSize" TEXT,
    "wireColor" TEXT,
    "cableSpec" TEXT,
    "shielded" BOOLEAN,
    "voltageClass" TEXT,
    "sourceEquipment" TEXT,
    "sourceConnector" TEXT,
    "sourcePin" TEXT,
    "destEquipment" TEXT,
    "destConnector" TEXT,
    "destPin" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_wire_no" ON "Wire"("wireNo");
CREATE INDEX IF NOT EXISTS "idx_wire_signal" ON "Wire"("signalName");

-- ============================================
-- WIRE ENDPOINTS
-- ============================================

CREATE TABLE IF NOT EXISTS "WireEndpoint" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "wireId" TEXT NOT NULL REFERENCES "Wire"("id") ON DELETE CASCADE,
    "deviceId" TEXT,
    "connectorId" TEXT,
    "pinId" TEXT,
    "endpointRole" TEXT,
    "endpointLabel" TEXT,
    "endpointPin" TEXT,
    "sourceFile" TEXT,
    "sourcePage" INTEGER,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_wire_endpoint_wire" ON "WireEndpoint"("wireId");
CREATE INDEX IF NOT EXISTS "idx_wire_endpoint_label" ON "WireEndpoint"("endpointLabel");

-- ============================================
-- OCR PAGES & ROWS
-- ============================================

CREATE TABLE IF NOT EXISTS "OcrPage" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "sourceFileId" TEXT NOT NULL,
    "pageNo" INTEGER NOT NULL,
    "sourcePageLabel" TEXT,
    "rawText" TEXT NOT NULL,
    "cleanedText" TEXT,
    "parseStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "extra" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE("sourceFileId", "pageNo")
);

CREATE TABLE IF NOT EXISTS "OcrRow" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "ocrPageId" TEXT NOT NULL REFERENCES "OcrPage"("id") ON DELETE CASCADE,
    "rowType" TEXT NOT NULL,
    "rowKey" TEXT,
    "rowText" TEXT NOT NULL,
    "extractedJson" JSONB NOT NULL DEFAULT '{}',
    "normalized" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_ocr_row_page" ON "OcrRow"("ocrPageId");

-- ============================================
-- IMPORT BATCHES
-- ============================================

CREATE TABLE IF NOT EXISTS "ImportBatch" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "sourceFileId" TEXT NOT NULL,
    "batchName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "note" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- VALIDATION ISSUES
-- ============================================

CREATE TABLE IF NOT EXISTS "ValidationIssue" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "severity" TEXT NOT NULL,
    "issueType" TEXT NOT NULL,
    "sourceTable" TEXT,
    "sourceId" TEXT,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_validation_severity" ON "ValidationIssue"("severity", "resolved");

-- ============================================
-- SEED DATA TABLES (Alternative raw import)
-- ============================================

CREATE TABLE IF NOT EXISTS "DrawingExtractionRaw" (
    "id" BIGSERIAL PRIMARY KEY,
    "sourceFile" TEXT,
    "sourcePage" INTEGER,
    "drawingNo" TEXT,
    "title" TEXT,
    "equipment" TEXT,
    "connectorCode" TEXT,
    "pinNo" TEXT,
    "wireNo" TEXT,
    "wireType" TEXT,
    "wireColor" TEXT,
    "endpointDirection" TEXT,
    "endpointName" TEXT,
    "endpointPin" TEXT,
    "remark" TEXT,
    "rawJson" JSONB,
    "promotedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_extraction_raw_source" ON "DrawingExtractionRaw"("sourceFile", "sourcePage");
CREATE INDEX IF NOT EXISTS "idx_extraction_raw_wire" ON "DrawingExtractionRaw"("wireNo");
CREATE INDEX IF NOT EXISTS "idx_extraction_raw_connector" ON "DrawingExtractionRaw"("connectorCode", "pinNo");

CREATE TABLE IF NOT EXISTS "WireConnectionSeed" (
    "id" BIGSERIAL PRIMARY KEY,
    "rawRowId" BIGINT,
    "sourceFile" TEXT,
    "sourcePage" INTEGER,
    "drawingNo" TEXT,
    "sheetNo" TEXT,
    "equipment" TEXT,
    "connectorCode" TEXT NOT NULL,
    "pinNo" TEXT NOT NULL,
    "wireNo" TEXT,
    "wireType" TEXT,
    "endpointDirection" TEXT,
    "endpointName" TEXT,
    "endpointPin" TEXT,
    "remark" TEXT,
    "normConnectorCode" TEXT NOT NULL,
    "normPinNo" TEXT NOT NULL,
    "normWireNo" TEXT,
    "connectionKey" TEXT UNIQUE NOT NULL,
    "promotedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_seed_promoted" ON "WireConnectionSeed"("promotedAt");

CREATE TABLE IF NOT EXISTS "WireConnection" (
    "id" BIGSERIAL PRIMARY KEY,
    "connectionKey" TEXT UNIQUE NOT NULL,
    "connectorCode" TEXT NOT NULL,
    "pinNo" TEXT NOT NULL,
    "wireNo" TEXT,
    "wireType" TEXT,
    "endpointDirection" TEXT,
    "endpointName" TEXT,
    "endpointPin" TEXT,
    "equipment" TEXT,
    "primarySourceFile" TEXT,
    "firstSourcePage" INTEGER,
    "firstSeenAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "lastSeenAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "sourceCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_connection_connector" ON "WireConnection"("connectorCode", "pinNo");
CREATE INDEX IF NOT EXISTS "idx_connection_wire" ON "WireConnection"("wireNo");

COMMIT;