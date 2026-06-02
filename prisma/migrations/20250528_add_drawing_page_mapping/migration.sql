-- CreateTable DrawingPageMapping
CREATE TABLE "DrawingPageMapping" (
    "id" TEXT NOT NULL,
    "drawingId" TEXT NOT NULL,
    "sourceFileId" TEXT,
    "sourceFileName" TEXT NOT NULL,
    "pdfPageNo" INTEGER NOT NULL,
    "drawingNumber" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrawingPageMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for fast lookups
CREATE UNIQUE INDEX "DrawingPageMapping_drawingId_sourceFileId_key" ON "DrawingPageMapping"("drawingId", "sourceFileId");
CREATE INDEX "DrawingPageMapping_drawingNumber_key" ON "DrawingPageMapping"("drawingNumber");
CREATE INDEX "DrawingPageMapping_sourceFileName_key" ON "DrawingPageMapping"("sourceFileName");
CREATE INDEX "DrawingPageMapping_pdfPageNo_key" ON "DrawingPageMapping"("pdfPageNo");
CREATE INDEX "DrawingPageMapping_verified_key" ON "DrawingPageMapping"("verified");

-- AddForeignKey
ALTER TABLE "DrawingPageMapping" ADD CONSTRAINT "DrawingPageMapping_drawingId_fkey" FOREIGN KEY ("drawingId") REFERENCES "Drawing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;