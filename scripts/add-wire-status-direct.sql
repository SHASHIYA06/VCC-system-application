-- Add WireStatus enum directly to database
DO $$ 
BEGIN
    -- Create the enum type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WireStatus') THEN
        CREATE TYPE "WireStatus" AS ENUM ('VERIFIED', 'SYNTHETIC', 'UNVERIFIED', 'DEPRECATED');
    END IF;
    
    -- Add wireStatus column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Wire' AND column_name = 'wireStatus') THEN
        ALTER TABLE "Wire" ADD COLUMN "wireStatus" "WireStatus" DEFAULT 'UNVERIFIED';
    END IF;
    
    -- Add verificationSource column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Wire' AND column_name = 'verificationSource') THEN
        ALTER TABLE "Wire" ADD COLUMN "verificationSource" TEXT;
    END IF;
    
    -- Add verifiedAt column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Wire' AND column_name = 'verifiedAt') THEN
        ALTER TABLE "Wire" ADD COLUMN "verifiedAt" TIMESTAMP;
    END IF;
    
    -- Add index on wireStatus for faster filtering
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Wire_wireStatus_idx') THEN
        CREATE INDEX "Wire_wireStatus_idx" ON "Wire"("wireStatus");
    END IF;
END $$;

SELECT 'WireStatus columns added successfully' as result;