-- CreateTable VCCDescription
CREATE TABLE "VCCDescription" (
    "id" TEXT NOT NULL,
    "systemCode" TEXT NOT NULL,
    "systemName" TEXT NOT NULL,
    "description" TEXT,
    "technicalSpecs" TEXT,
    "powerRequirements" TEXT,
    "voltage" TEXT,
    "current" TEXT,
    "frequency" TEXT,
    "environmentalConditions" TEXT,
    "safetyFeatures" TEXT,
    "maintenanceSchedule" TEXT,
    "sparePartsInfo" TEXT,
    "documentVersion" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT,
    "extra" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VCCDescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable SystemMetadata
CREATE TABLE "SystemMetadata" (
    "id" TEXT NOT NULL,
    "systemCode" TEXT NOT NULL,
    "dataCompleteness" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lastSyncTime" TIMESTAMP(3),
    "syncStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "syncErrors" TEXT,
    "totalDrawings" INTEGER NOT NULL DEFAULT 0,
    "verifiedDrawings" INTEGER NOT NULL DEFAULT 0,
    "extra" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VCCDescription_systemCode_key" ON "VCCDescription"("systemCode");

-- CreateIndex
CREATE INDEX "VCCDescription_systemCode_idx" ON "VCCDescription"("systemCode");

-- CreateIndex
CREATE INDEX "VCCDescription_source_idx" ON "VCCDescription"("source");

-- CreateIndex
CREATE INDEX "VCCDescription_lastUpdated_idx" ON "VCCDescription"("lastUpdated");

-- CreateIndex
CREATE UNIQUE INDEX "SystemMetadata_systemCode_key" ON "SystemMetadata"("systemCode");

-- CreateIndex
CREATE INDEX "SystemMetadata_systemCode_idx" ON "SystemMetadata"("systemCode");

-- CreateIndex
CREATE INDEX "SystemMetadata_syncStatus_idx" ON "SystemMetadata"("syncStatus");

-- CreateIndex
CREATE INDEX "SystemMetadata_dataCompleteness_idx" ON "SystemMetadata"("dataCompleteness");

-- AddForeignKey
ALTER TABLE "VCCDescription" ADD CONSTRAINT "VCCDescription_systemCode_fkey" FOREIGN KEY ("systemCode") REFERENCES "System"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemMetadata" ADD CONSTRAINT "SystemMetadata_systemCode_fkey" FOREIGN KEY ("systemCode") REFERENCES "System"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
