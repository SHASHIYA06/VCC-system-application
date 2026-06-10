-- ========================= ALTER System Table =========================
ALTER TABLE "System" ADD COLUMN IF NOT EXISTS "dataStatus" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "System" ADD COLUMN IF NOT EXISTS "uiMenuDisplayName" TEXT;
ALTER TABLE "System" ADD COLUMN IF NOT EXISTS "iconName" TEXT;
ALTER TABLE "System" ADD COLUMN IF NOT EXISTS "colorTheme" TEXT;
ALTER TABLE "System" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Create indexes for System
CREATE INDEX IF NOT EXISTS "System_dataStatus_idx" ON "System"("dataStatus");
CREATE INDEX IF NOT EXISTS "System_isActive_idx" ON "System"("isActive");

-- ========================= ALTER Drawing Table =========================
ALTER TABLE "Drawing" ADD COLUMN IF NOT EXISTS "isSynced" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Drawing" ADD COLUMN IF NOT EXISTS "syncedAt" TIMESTAMP(3);

-- Create indexes for Drawing
CREATE INDEX IF NOT EXISTS "Drawing_isSynced_idx" ON "Drawing"("isSynced");

-- ========================= ALTER Device Table =========================
ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);

-- Create index for Device
CREATE INDEX IF NOT EXISTS "Device_isVerified_idx" ON "Device"("isVerified");

-- ========================= Create DrawingVerificationStatus Table =========================
CREATE TABLE IF NOT EXISTS "DrawingVerificationStatus" (
    "id" TEXT NOT NULL,
    "drawingId" TEXT NOT NULL,
    "drawingNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "verificationDate" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "notes" TEXT,
    "pagesVerified" INTEGER NOT NULL DEFAULT 0,
    "totalPages" INTEGER NOT NULL DEFAULT 0,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "extra" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrawingVerificationStatus_pkey" PRIMARY KEY ("id")
);

-- Create indexes for DrawingVerificationStatus
CREATE UNIQUE INDEX IF NOT EXISTS "DrawingVerificationStatus_drawingId_unique" ON "DrawingVerificationStatus"("drawingId");
CREATE INDEX IF NOT EXISTS "DrawingVerificationStatus_drawingNumber_idx" ON "DrawingVerificationStatus"("drawingNumber");
CREATE INDEX IF NOT EXISTS "DrawingVerificationStatus_status_idx" ON "DrawingVerificationStatus"("status");

-- Add foreign key for DrawingVerificationStatus
ALTER TABLE "DrawingVerificationStatus" ADD CONSTRAINT "DrawingVerificationStatus_drawingId_fkey" 
    FOREIGN KEY ("drawingId") REFERENCES "Drawing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ========================= Create DeviceSpecification Table =========================
CREATE TABLE IF NOT EXISTS "DeviceSpecification" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "specCode" TEXT NOT NULL,
    "specName" TEXT NOT NULL,
    "specValue" TEXT,
    "unit" TEXT,
    "category" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "extra" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceSpecification_pkey" PRIMARY KEY ("id")
);

-- Create indexes for DeviceSpecification
CREATE UNIQUE INDEX IF NOT EXISTS "DeviceSpecification_deviceId_specCode_unique" ON "DeviceSpecification"("deviceId", "specCode");
CREATE INDEX IF NOT EXISTS "DeviceSpecification_deviceId_idx" ON "DeviceSpecification"("deviceId");
CREATE INDEX IF NOT EXISTS "DeviceSpecification_category_idx" ON "DeviceSpecification"("category");

-- Add foreign key for DeviceSpecification
ALTER TABLE "DeviceSpecification" ADD CONSTRAINT "DeviceSpecification_deviceId_fkey" 
    FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ========================= Update DrawingPageMapping if exists =========================
ALTER TABLE "DrawingPageMapping" ADD COLUMN IF NOT EXISTS "verificationDate" TIMESTAMP(3);
ALTER TABLE "DrawingPageMapping" ADD COLUMN IF NOT EXISTS "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- Create or update indexes
CREATE INDEX IF NOT EXISTS "DrawingPageMapping_verified_idx" ON "DrawingPageMapping"("verified");

-- ========================= Confirm migration =========================
SELECT 'Migration completed successfully' as status;
