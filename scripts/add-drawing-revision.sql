-- Create DrawingRevision table for Task 3: Drawing Revision Intelligence
-- Note: Drawing.id is TEXT, not UUID
CREATE TABLE IF NOT EXISTS "DrawingRevision" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "drawingId" TEXT NOT NULL,
    "parentDrawingId" TEXT,
    "revisionLabel" VARCHAR(10) NOT NULL,
    "revisionNo" INTEGER DEFAULT 0,
    "isCurrent" BOOLEAN DEFAULT false,
    "effectiveFrom" TIMESTAMP,
    "effectiveTo" TIMESTAMP,
    notes TEXT,
    extra JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    UNIQUE("drawingId", "revisionLabel")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "DrawingRevision_drawingId_idx" ON "DrawingRevision"("drawingId");
CREATE INDEX IF NOT EXISTS "DrawingRevision_parentDrawingId_idx" ON "DrawingRevision"("parentDrawingId");
CREATE INDEX IF NOT EXISTS "DrawingRevision_isCurrent_idx" ON "DrawingRevision"("isCurrent");

SELECT 'DrawingRevision table created successfully' as result;