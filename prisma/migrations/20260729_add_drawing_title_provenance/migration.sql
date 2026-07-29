-- Drawing title provenance.
--
-- 307 of the 575 Drawing rows carry an auto-generated title that was never in
-- any source document ("GEN Circuit 942-58161", "VCC Reference Document
-- VCC-REF-07"). The rows themselves are legitimate — they have extracted pages
-- and connectors — but presenting a synthetic string as the engineering title is
-- what made drawing lookups look "totally different" from the real drawing.
--
-- Rather than fabricate better-sounding titles, record where each title came
-- from so the API and UI can label unverified ones honestly.
--
-- Additive and reversible: one nullable column with a default, no data removed.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TitleSource') THEN
    CREATE TYPE "TitleSource" AS ENUM ('SOURCE_DOCUMENT', 'DERIVED', 'PLACEHOLDER');
  END IF;
END $$;

ALTER TABLE "Drawing"
  ADD COLUMN IF NOT EXISTS "titleSource" "TitleSource" NOT NULL DEFAULT 'DERIVED';

-- Auto-generated titles: not authoritative, must be shown as unverified.
UPDATE "Drawing"
   SET "titleSource" = 'PLACEHOLDER'
 WHERE "title" ~ '^GEN Circuit 942-'
    OR "title" ~ '^VCC Reference Document VCC-REF'
    OR "title" ~ 'Page [0-9]+$'
    OR "title" IS NULL
    OR btrim("title") = '';

-- The VCC-REF-xx entries are supporting reference documents, not schematics.
UPDATE "Drawing"
   SET "isReference" = true
 WHERE "drawingNo" LIKE 'VCC-REF-%';

CREATE INDEX IF NOT EXISTS "Drawing_titleSource_idx" ON "Drawing" ("titleSource");
