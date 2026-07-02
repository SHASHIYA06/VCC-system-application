-- VCC COMPLETE SEED DATA
-- Generated from comprehensive PDF analysis of all 127 pages
-- KMRCL VCC Drawings_OCR.pdf + all PIN drawing PDFs
-- Run: psql "$DIRECT_URL" -f supabase/migrations/019_complete_seed_data.sql

BEGIN;

-- ============================================
-- 1. DRAWING PAGE MAPPINGS (Verified via pdftotext)
-- ============================================

-- KMRCL VCC Drawings_OCR.pdf mappings (40 drawings)
INSERT INTO "DrawingPageMapping" ("id", "drawingId", "sourceFileName", "pdfPageNo", "drawingNumber", "verified", "confidence", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, d.id, 'KMRCL VCC Drawings_OCR.pdf', m.page_no, m.drawing_no, true, 1.0, NOW(), NOW()
FROM (VALUES
  ('942-58099', 2), ('942-58100', 3), ('942-58101', 4), ('942-58102', 5),
  ('942-58103', 9), ('942-58104', 13), ('942-58105', 21), ('942-58106', 22),
  ('942-58108', 24), ('942-58109', 26), ('942-58110', 27), ('942-58111', 29),
  ('942-58112', 30), ('942-58113', 31), ('942-58114', 32), ('942-58115', 33),
  ('942-58116', 34), ('942-58119', 36), ('942-58120', 38), ('942-58121', 39),
  ('942-58123', 40), ('942-58125', 43), ('942-58126', 44), ('942-58128', 46),
  ('942-58130', 48), ('942-58131', 50), ('942-58132', 51), ('942-58138', 54),
  ('942-58139', 55), ('942-58140', 57), ('942-58141', 58), ('942-58143', 60),
  ('942-58144', 61), ('942-58146', 64), ('942-58148', 69), ('942-58149', 70),
  ('942-58150', 71), ('942-58151', 72), ('942-58152', 73), ('942-58154', 79)
) AS m(drawing_no, page_no)
JOIN "Drawing" d ON d."drawingNo" = m.drawing_no
ON CONFLICT DO NOTHING;

-- CAB_PIN DRAWINGS 2.pdf mappings (5 drawings)
INSERT INTO "DrawingPageMapping" ("id", "drawingId", "sourceFileName", "pdfPageNo", "drawingNumber", "verified", "confidence", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, d.id, 'CAB_PIN DRAWINGS 2.pdf', m.page_no, m.drawing_no, true, 1.0, NOW(), NOW()
FROM (VALUES
  ('942-38104', 9), ('942-38105', 16), ('942-38108', 24), ('942-38109', 27), ('942-38119', 35)
) AS m(drawing_no, page_no)
JOIN "Drawing" d ON d."drawingNo" = m.drawing_no
ON CONFLICT DO NOTHING;

-- DMC UF_PIN DRAWINGS.pdf mappings (3 drawings)
INSERT INTO "DrawingPageMapping" ("id", "drawingId", "sourceFileName", "pdfPageNo", "drawingNumber", "verified", "confidence", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, d.id, 'DMC UF_PIN DRAWINGS.pdf', m.page_no, m.drawing_no, true, 1.0, NOW(), NOW()
FROM (VALUES
  ('942-38310', 8), ('942-38312', 11), ('942-38314', 15)
) AS m(drawing_no, page_no)
JOIN "Drawing" d ON d."drawingNo" = m.drawing_no
ON CONFLICT DO NOTHING;

-- DMC_CEILING.pdf mappings (4 drawings)
INSERT INTO "DrawingPageMapping" ("id", "drawingId", "sourceFileName", "pdfPageNo", "drawingNumber", "verified", "confidence", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, d.id, 'DMC_CEILING.pdf', m.page_no, m.drawing_no, true, 1.0, NOW(), NOW()
FROM (VALUES
  ('942-38209', 14), ('942-38212', 22), ('942-38214', 24), ('942-38217', 28)
) AS m(drawing_no, page_no)
JOIN "Drawing" d ON d."drawingNo" = m.drawing_no
ON CONFLICT DO NOTHING;

-- TC _UF PIN DRAWINGS.pdf mappings (3 drawings)
INSERT INTO "DrawingPageMapping" ("id", "drawingId", "sourceFileName", "pdfPageNo", "drawingNumber", "verified", "confidence", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, d.id, 'TC _UF PIN DRAWINGS.pdf', m.page_no, m.drawing_no, true, 1.0, NOW(), NOW()
FROM (VALUES
  ('942-38506', 3), ('942-38518', 18), ('942-38519', 19)
) AS m(drawing_no, page_no)
JOIN "Drawing" d ON d."drawingNo" = m.drawing_no
ON CONFLICT DO NOTHING;

-- MC_UF.pdf mappings (14 drawings)
INSERT INTO "DrawingPageMapping" ("id", "drawingId", "sourceFileName", "pdfPageNo", "drawingNumber", "verified", "confidence", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, d.id, 'MC_UF.pdf', m.page_no, m.drawing_no, true, 1.0, NOW(), NOW()
FROM (VALUES
  ('942-38105', 1), ('942-38106', 3), ('942-38101', 6), ('942-38109', 7),
  ('942-38110', 8), ('942-38111', 9), ('942-38112', 10), ('942-38114', 13),
  ('942-38115', 14), ('942-38116', 15), ('942-38118', 18), ('942-38119', 19),
  ('942-38120', 20), ('942-38121', 22)
) AS m(drawing_no, page_no)
JOIN "Drawing" d ON d."drawingNo" = m.drawing_no
ON CONFLICT DO NOTHING;

-- MC_CEILING_PIN DRAWINGS.pdf mappings (3 drawings)
INSERT INTO "DrawingPageMapping" ("id", "drawingId", "sourceFileName", "pdfPageNo", "drawingNumber", "verified", "confidence", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, d.id, 'MC_CEILING_PIN DRAWINGS.pdf', m.page_no, m.drawing_no, true, 1.0, NOW(), NOW()
FROM (VALUES
  ('942-38604', 3), ('942-38609', 16), ('942-38610', 20)
) AS m(drawing_no, page_no)
JOIN "Drawing" d ON d."drawingNo" = m.drawing_no
ON CONFLICT DO NOTHING;

-- TC_CEILING PIN DRAWINGS.pdf mappings (1 drawing)
INSERT INTO "DrawingPageMapping" ("id", "drawingId", "sourceFileName", "pdfPageNo", "drawingNumber", "verified", "confidence", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, d.id, 'TC_CEILING PIN DRAWINGS.pdf', m.page_no, m.drawing_no, true, 1.0, NOW(), NOW()
FROM (VALUES
  ('942-38408', 16)
) AS m(drawing_no, page_no)
JOIN "Drawing" d ON d."drawingNo" = m.drawing_no
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. VERIFIED DRAWING-WIRE LINKS (WireEndpoint chain)
-- ============================================

-- Create DrawingWire links from WireEndpoint→Connector→Drawing chain
INSERT INTO "DrawingWire" ("id", "drawingId", "wireId", "createdAt")
SELECT DISTINCT ON (dw."drawingId", dw."wireId")
  gen_random_uuid()::text, dw."drawingId", dw."wireId", NOW()
FROM (
  SELECT DISTINCT ON (we."wireId", c."drawingId")
    we."wireId", c."drawingId"
  FROM "WireEndpoint" we
  JOIN "Connector" c ON c.id = we."connectorId"
  WHERE c."drawingId" IS NOT NULL
) dw
ON CONFLICT ("drawingId", "wireId") DO NOTHING;

-- ============================================
-- 3. CIRCUIT ENDPOINTS (from WireEndpoint chain)
-- ============================================

-- Create CircuitEndpoint records for circuits that use wires with endpoints
INSERT INTO "CircuitEndpoint" ("id", "circuitId", "wireNo", "connectorFrom", "pinFrom", "connectorTo", "pinTo")
SELECT DISTINCT ON (ce."circuitId", ce."wireNo")
  gen_random_uuid()::text, ce."circuitId", ce."wireNo", ce."connectorFrom", ce."pinFrom", ce."connectorTo", ce."pinTo"
FROM (
  SELECT DISTINCT ON (c.id, we."wireNo")
    c.id as "circuitId",
    w."wireNo",
    cFrom."connectorCode" as "connectorFrom",
    cpFrom."pinNo" as "pinFrom",
    cTo."connectorCode" as "connectorTo",
    cpTo."pinNo" as "pinTo"
  FROM "Circuit" c
  JOIN "DrawingWire" dw ON dw."drawingId" = c."drawingId"
  JOIN "Wire" w ON w.id = dw."wireId"
  LEFT JOIN "WireEndpoint" we ON we."wireId" = w.id AND we."endpointRole" = 'source'
  LEFT JOIN "Connector" cFrom ON cFrom.id = we."connectorId"
  LEFT JOIN "ConnectorPin" cpFrom ON cpFrom.id = we."pinId"
  LEFT JOIN "WireEndpoint" weTo ON weTo."wireId" = w.id AND weTo."endpointRole" = 'destination'
  LEFT JOIN "Connector" cTo ON cTo.id = weTo."connectorId"
  LEFT JOIN "ConnectorPin" cpTo ON cpTo.id = weTo."pinId"
  WHERE we."wireNo" IS NOT NULL
) ce
ON CONFLICT DO NOTHING;

COMMIT;

-- ============================================
-- 4. VERIFICATION QUERIES
-- ============================================

-- Verify page mappings
SELECT COUNT(*) as total_mappings FROM "DrawingPageMapping" WHERE "verified" = true;

-- Verify DrawingWire links
SELECT COUNT(*) as total_drawing_wires FROM "DrawingWire";

-- Verify CircuitEndpoints
SELECT COUNT(*) as total_circuit_endpoints FROM "CircuitEndpoint";

-- Verify VCC Descriptions
SELECT COUNT(*) as total_vcc_descriptions FROM "VCCDescription";
