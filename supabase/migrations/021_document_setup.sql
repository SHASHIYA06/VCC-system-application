-- 021_document_setup.sql
-- Complete document and drawing setup from all PDF files
-- Run: psql "$DIRECT_URL" -f supabase/migrations/021_document_setup.sql

BEGIN;

-- ============================================
-- 1. SOURCE FILES (All PDF documents)
-- ============================================

INSERT INTO "SourceFile" ("id", "projectId", "filename", "fileType", "mimeType", "status", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    p.id,
    x.filename,
    'application/pdf',
    'application/pdf',
    'PROCESSED',
    NOW(),
    NOW()
FROM "Project" p
CROSS JOIN (VALUES
    ('KMRCL VCC Drawings_OCR.pdf'),
    ('CAB_PIN DRAWINGS 2.pdf'),
    ('CAB_PIN DRAWINGS.pdf'),
    ('DMC UF_PIN DRAWINGS.pdf'),
    ('DMC_CEILING.pdf'),
    ('TC _UF PIN DRAWINGS.pdf'),
    ('TC_CEILING PIN DRAWINGS.pdf'),
    ('MC_UF.pdf'),
    ('MC_CEILING_PIN DRAWINGS.pdf'),
    ('VCC DESCRIPTION 13.12.2017.pdf')
) AS x(filename)
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. NEW SYSTEMS (CAB, LTEB, LIGHT, LTJB)
-- ============================================

INSERT INTO "System" ("id", "code", "name", "category", "description", "sortOrder", "isActive")
VALUES
    (gen_random_uuid()::text, 'CAB', 'Cabin', 'VEHICLE', 'Driver cabin systems and controls', 15, true),
    (gen_random_uuid()::text, 'LTEB', 'Low Tension Equipment Box', 'POWER', 'LTEB junction boxes and equipment', 25, true),
    (gen_random_uuid()::text, 'LIGHT', 'Lighting', 'VEHICLE', 'Interior and exterior lighting systems', 35, true),
    (gen_random_uuid()::text, 'LTJB', 'Low Tension Junction Box', 'POWER', 'LTJB junction boxes', 45, true)
ON CONFLICT ("code") DO NOTHING;

-- ============================================
-- 3. MISSING DRAWINGS (PIN drawings 942-38xxx)
-- ============================================

INSERT INTO "Drawing" ("id", "projectId", "systemId", "drawingNo", "revision", "title", "totalSheets", "status", "remarks", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    p.id,
    s.id,
    x.drawing_no,
    '0',
    x.title,
    1,
    'ACTIVE',
    x.description,
    NOW(),
    NOW()
FROM "Project" p
CROSS JOIN (VALUES
    -- CAB PIN DRAWINGS 2.pdf
    ('942-38104', 'CAB', 'CAB PIN Assignment', 'CAB connector pin assignment'),
    ('942-38105', 'CAB', 'CAB PIN Assignment (continued)', 'CAB connector pin assignment continuation'),
    ('942-38108', 'CAB', 'CAB PIN Assignment', 'CAB connector pin assignment'),
    ('942-38109', 'CAB', 'CAB PIN Assignment', 'CAB connector pin assignment'),
    ('942-38119', 'CAB', 'CAB PIN Assignment', 'CAB connector pin assignment'),
    
    -- DMC UF PIN DRAWINGS.pdf
    ('942-38310', 'LTEB', 'DMC UF PIN Assignment', 'DMC underframe connector pin assignment'),
    ('942-38312', 'LTEB', 'DMC UF PIN Assignment', 'DMC underframe connector pin assignment'),
    ('942-38314', 'LTEB', 'DMC UF PIN Assignment', 'DMC underframe connector pin assignment'),
    
    -- DMC_CEILING.pdf
    ('942-38209', 'LIGHT', 'DMC Ceiling PIN Assignment', 'DMC ceiling connector pin assignment'),
    ('942-38212', 'LIGHT', 'DMC Ceiling PIN Assignment', 'DMC ceiling connector pin assignment'),
    ('942-38214', 'LIGHT', 'DMC Ceiling PIN Assignment', 'DMC ceiling connector pin assignment'),
    ('942-38217', 'LIGHT', 'DMC Ceiling PIN Assignment', 'DMC ceiling connector pin assignment'),
    
    -- TC _UF PIN DRAWINGS.pdf
    ('942-38506', 'LTEB', 'TC UF PIN Assignment', 'TC underframe connector pin assignment'),
    ('942-38518', 'LTEB', 'TC UF PIN Assignment', 'TC underframe connector pin assignment'),
    ('942-38519', 'LTEB', 'TC UF PIN Assignment', 'TC underframe connector pin assignment'),
    
    -- TC_CEILING PIN DRAWINGS.pdf
    ('942-38408', 'LIGHT', 'TC Ceiling PIN Assignment', 'TC ceiling connector pin assignment'),
    
    -- MC_UF.pdf
    ('942-38101', 'LTJB', 'MC UF PIN Assignment', 'MC underframe connector pin assignment'),
    ('942-38106', 'LTJB', 'MC UF PIN Assignment', 'MC underframe connector pin assignment'),
    ('942-38110', 'LTJB', 'MC UF PIN Assignment', 'MC underframe connector pin assignment'),
    ('942-38111', 'LTJB', 'MC UF PIN Assignment', 'MC underframe connector pin assignment'),
    ('942-38112', 'LTJB', 'MC UF PIN Assignment', 'MC underframe connector pin assignment'),
    ('942-38114', 'LTJB', 'MC UF PIN Assignment', 'MC underframe connector pin assignment'),
    ('942-38115', 'LTJB', 'MC UF PIN Assignment', 'MC underframe connector pin assignment'),
    ('942-38116', 'LTJB', 'MC UF PIN Assignment', 'MC underframe connector pin assignment'),
    ('942-38118', 'LTJB', 'MC UF PIN Assignment', 'MC underframe connector pin assignment'),
    ('942-38120', 'LTJB', 'MC UF PIN Assignment', 'MC underframe connector pin assignment'),
    ('942-38121', 'LTJB', 'MC UF PIN Assignment', 'MC underframe connector pin assignment'),
    
    -- MC_CEILING_PIN DRAWINGS.pdf
    ('942-38604', 'LIGHT', 'MC Ceiling PIN Assignment', 'MC ceiling connector pin assignment'),
    ('942-38609', 'LIGHT', 'MC Ceiling PIN Assignment', 'MC ceiling connector pin assignment'),
    ('942-38610', 'LIGHT', 'MC Ceiling PIN Assignment', 'MC ceiling connector pin assignment')
) AS x(drawing_no, system_code, title, description)
JOIN "System" s ON s."code" = x.system_code
WHERE p."projectCode" = 'KMRCL-RS3R'
AND NOT EXISTS (
    SELECT 1 FROM "Drawing" d2 WHERE d2."projectId" = p.id AND d2."drawingNo" = x.drawing_no AND d2.revision = '0'
);

-- ============================================
-- 4. DRAWING PAGE MAPPINGS - KMRCL VCC Drawings_OCR.pdf (40 drawings)
-- ============================================

INSERT INTO "DrawingPageMapping" ("id", "drawingId", "sourceFileName", "pdfPageNo", "drawingNumber", "verified", "confidence", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    d.id,
    'KMRCL VCC Drawings_OCR.pdf',
    m.pdf_page,
    m.drawing_no,
    true,
    1.0,
    NOW(),
    NOW()
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
) AS m(drawing_no, pdf_page)
JOIN "Drawing" d ON d."drawingNo" = m.drawing_no AND d.revision = '0'
ON CONFLICT ("drawingId", "sourceFileName") DO NOTHING;

-- ============================================
-- 5. DRAWING PAGE MAPPINGS - CAB_PIN DRAWINGS 2.pdf (5 drawings)
-- ============================================

INSERT INTO "DrawingPageMapping" ("id", "drawingId", "sourceFileName", "pdfPageNo", "drawingNumber", "verified", "confidence", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    d.id,
    'CAB_PIN DRAWINGS 2.pdf',
    m.pdf_page,
    m.drawing_no,
    true,
    1.0,
    NOW(),
    NOW()
FROM (VALUES
    ('942-38104', 9), ('942-38105', 16), ('942-38108', 24), ('942-38109', 27), ('942-38119', 35)
) AS m(drawing_no, pdf_page)
JOIN "Drawing" d ON d."drawingNo" = m.drawing_no AND d.revision = '0'
ON CONFLICT ("drawingId", "sourceFileName") DO NOTHING;

-- ============================================
-- 6. DRAWING PAGE MAPPINGS - DMC UF_PIN DRAWINGS.pdf (3 drawings)
-- ============================================

INSERT INTO "DrawingPageMapping" ("id", "drawingId", "sourceFileName", "pdfPageNo", "drawingNumber", "verified", "confidence", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    d.id,
    'DMC UF_PIN DRAWINGS.pdf',
    m.pdf_page,
    m.drawing_no,
    true,
    1.0,
    NOW(),
    NOW()
FROM (VALUES
    ('942-38310', 8), ('942-38312', 11), ('942-38314', 15)
) AS m(drawing_no, pdf_page)
JOIN "Drawing" d ON d."drawingNo" = m.drawing_no AND d.revision = '0'
ON CONFLICT ("drawingId", "sourceFileName") DO NOTHING;

-- ============================================
-- 7. DRAWING PAGE MAPPINGS - DMC_CEILING.pdf (4 drawings)
-- ============================================

INSERT INTO "DrawingPageMapping" ("id", "drawingId", "sourceFileName", "pdfPageNo", "drawingNumber", "verified", "confidence", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    d.id,
    'DMC_CEILING.pdf',
    m.pdf_page,
    m.drawing_no,
    true,
    1.0,
    NOW(),
    NOW()
FROM (VALUES
    ('942-38209', 14), ('942-38212', 22), ('942-38214', 24), ('942-38217', 28)
) AS m(drawing_no, pdf_page)
JOIN "Drawing" d ON d."drawingNo" = m.drawing_no AND d.revision = '0'
ON CONFLICT ("drawingId", "sourceFileName") DO NOTHING;

-- ============================================
-- 8. DRAWING PAGE MAPPINGS - TC _UF PIN DRAWINGS.pdf (3 drawings)
-- ============================================

INSERT INTO "DrawingPageMapping" ("id", "drawingId", "sourceFileName", "pdfPageNo", "drawingNumber", "verified", "confidence", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    d.id,
    'TC _UF PIN DRAWINGS.pdf',
    m.pdf_page,
    m.drawing_no,
    true,
    1.0,
    NOW(),
    NOW()
FROM (VALUES
    ('942-38506', 3), ('942-38518', 18), ('942-38519', 19)
) AS m(drawing_no, pdf_page)
JOIN "Drawing" d ON d."drawingNo" = m.drawing_no AND d.revision = '0'
ON CONFLICT ("drawingId", "sourceFileName") DO NOTHING;

-- ============================================
-- 9. DRAWING PAGE MAPPINGS - TC_CEILING PIN DRAWINGS.pdf (1 drawing)
-- ============================================

INSERT INTO "DrawingPageMapping" ("id", "drawingId", "sourceFileName", "pdfPageNo", "drawingNumber", "verified", "confidence", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    d.id,
    'TC_CEILING PIN DRAWINGS.pdf',
    m.pdf_page,
    m.drawing_no,
    true,
    1.0,
    NOW(),
    NOW()
FROM (VALUES
    ('942-38408', 16)
) AS m(drawing_no, pdf_page)
JOIN "Drawing" d ON d."drawingNo" = m.drawing_no AND d.revision = '0'
ON CONFLICT ("drawingId", "sourceFileName") DO NOTHING;

-- ============================================
-- 10. DRAWING PAGE MAPPINGS - MC_UF.pdf (14 drawings)
-- ============================================

INSERT INTO "DrawingPageMapping" ("id", "drawingId", "sourceFileName", "pdfPageNo", "drawingNumber", "verified", "confidence", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    d.id,
    'MC_UF.pdf',
    m.pdf_page,
    m.drawing_no,
    true,
    1.0,
    NOW(),
    NOW()
FROM (VALUES
    ('942-38101', 6), ('942-38105', 1), ('942-38106', 3), ('942-38109', 7),
    ('942-38110', 8), ('942-38111', 9), ('942-38112', 10), ('942-38114', 13),
    ('942-38115', 14), ('942-38116', 15), ('942-38118', 18), ('942-38119', 19),
    ('942-38120', 20), ('942-38121', 22)
) AS m(drawing_no, pdf_page)
JOIN "Drawing" d ON d."drawingNo" = m.drawing_no AND d.revision = '0'
ON CONFLICT ("drawingId", "sourceFileName") DO NOTHING;

-- ============================================
-- 11. DRAWING PAGE MAPPINGS - MC_CEILING_PIN DRAWINGS.pdf (3 drawings)
-- ============================================

INSERT INTO "DrawingPageMapping" ("id", "drawingId", "sourceFileName", "pdfPageNo", "drawingNumber", "verified", "confidence", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    d.id,
    'MC_CEILING_PIN DRAWINGS.pdf',
    m.pdf_page,
    m.drawing_no,
    true,
    1.0,
    NOW(),
    NOW()
FROM (VALUES
    ('942-38604', 3), ('942-38609', 16), ('942-38610', 20)
) AS m(drawing_no, pdf_page)
JOIN "Drawing" d ON d."drawingNo" = m.drawing_no AND d.revision = '0'
ON CONFLICT ("drawingId", "sourceFileName") DO NOTHING;

-- ============================================
-- 12. DRAWING REVISIONS (All drawings get Rev 0)
-- ============================================

INSERT INTO "DrawingRevision" ("id", "drawingId", "revisionLabel", "revisionNo", "isCurrent", "notes", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    d.id,
    '0',
    0,
    true,
    'Initial revision',
    NOW(),
    NOW()
FROM "Drawing" d
WHERE NOT EXISTS (
    SELECT 1 FROM "DrawingRevision" dr WHERE dr."drawingId" = d.id
);

-- ============================================
-- 13. DRAWING SHEETS (For multi-sheet drawings)
-- ============================================

INSERT INTO "DrawingSheet" ("id", "drawingId", "sheetNo", "sheetLabel", "createdAt")
SELECT
    gen_random_uuid()::text,
    d.id,
    s.sheet_no,
    'Sheet ' || s.sheet_no || ' of ' || d."totalSheets",
    NOW()
FROM "Drawing" d
CROSS JOIN LATERAL generate_series(1, d."totalSheets") AS s(sheet_no)
WHERE d."totalSheets" > 1
AND NOT EXISTS (
    SELECT 1 FROM "DrawingSheet" ds WHERE ds."drawingId" = d.id AND ds."sheetNo" = s.sheet_no
);

-- ============================================
-- 14. FINAL COUNTS
-- ============================================

SELECT '=== DOCUMENT SETUP COMPLETE ===' as status;

SELECT 'Drawings' as tbl, COUNT(*) as cnt FROM "Drawing"
UNION ALL SELECT 'SourceFiles', COUNT(*) FROM "SourceFile"
UNION ALL SELECT 'PageMappings', COUNT(*) FROM "DrawingPageMapping"
UNION ALL SELECT 'DrawingRevisions', COUNT(*) FROM "DrawingRevision"
UNION ALL SELECT 'DrawingSheets', COUNT(*) FROM "DrawingSheet"
UNION ALL SELECT 'Systems', COUNT(*) FROM "System"
ORDER BY 1;

-- Per-PDF mapping summary
SELECT '=== MAPPINGS PER PDF ===' as status;
SELECT "sourceFileName", COUNT(*) as mappings
FROM "DrawingPageMapping"
GROUP BY "sourceFileName"
ORDER BY "sourceFileName";

-- Drawings per system
SELECT '=== DRAWINGS PER SYSTEM ===' as status;
SELECT s.code, s.name, COUNT(d.id) as drawing_count
FROM "System" s
LEFT JOIN "Drawing" d ON d."systemId" = s.id
GROUP BY s.code, s.name
ORDER BY drawing_count DESC;

COMMIT;
