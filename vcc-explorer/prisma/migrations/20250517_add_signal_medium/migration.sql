-- Add medium column to Signal table
ALTER TABLE "Signal" ADD COLUMN IF NOT EXISTS "medium" TEXT;