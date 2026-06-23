-- Wire Status Migration - Add columns directly
-- This adds wireStatus tracking without relying on Prisma migrations

-- Add wireStatus column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Wire' AND column_name = 'wireStatus'
  ) THEN
    ALTER TABLE "Wire" ADD COLUMN "wireStatus" VARCHAR(20) DEFAULT 'UNVERIFIED';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Wire' AND column_name = 'verificationSource'
  ) THEN
    ALTER TABLE "Wire" ADD COLUMN "verificationSource" TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Wire' AND column_name = 'verifiedAt'
  ) THEN
    ALTER TABLE "Wire" ADD COLUMN "verifiedAt" TIMESTAMP;
  END IF;
  
  -- Create index for wireStatus if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'Wire_wireStatus_idx'
  ) THEN
    CREATE INDEX "Wire_wireStatus_idx" ON "Wire"("wireStatus");
  END IF;
END $$;

-- Create the enum type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wirestatus') THEN
    CREATE TYPE WireStatus AS ENUM ('VERIFIED', 'SYNTHETIC', 'UNVERIFIED', 'DEPRECATED');
  END IF;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Convert the column to the enum type
ALTER TABLE "Wire" ALTER COLUMN "wireStatus" TYPE VARCHAR(20) USING "wireStatus"::VARCHAR;

SELECT 'Wire status columns added successfully' as result;