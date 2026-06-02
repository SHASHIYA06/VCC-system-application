# Code Changes - Complete Reference

## 1. Prisma Schema Update

### File: `prisma/schema.prisma`

**ADD** to Drawing model (after line with `pages DrawingPage[]`):
```prisma
pageMappings         DrawingPageMapping[]   @relation("DrawingPageMappings")
```

**ADD** new model at end of file:
```prisma
model DrawingPageMapping {
  id              String   @id @default(cuid())
  drawingId       String
  sourceFileId    String?
  sourceFileName  String
  pdfPageNo       Int
  drawingNumber   String
  verified        Boolean  @default(false)
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  drawing         Drawing  @relation("DrawingPageMappings", fields: [drawingId], references: [id])

  @@unique([drawingId, sourceFileId])
  @@index([drawingNumber])
  @@index([sourceFileName])
  @@index([pdfPageNo])
  @@index([verified])
}
```

---

## 2. Database Migration

### File: `prisma/migrations/20250528_add_drawing_page_mapping/migration.sql`

```sql
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
```

---

## 3. PDF Mapping Route Enhancement

### File: `src/app/api/drawings/pdf-mapping/route.ts`

Key changes:
- Added database-first lookup using `DrawingPageMapping`
- Fixed 942-38409 mapping to page 15 in CAB_PIN DRAWINGS
- Returns `{verified, source}` for transparency
- Enhanced POST endpoint for seeding

Critical mapping fix:
```typescript
// CAB PIN Drawings mapping - CORRECTED FOR 942-38409
if (sourceFile.includes('CAB_PIN DRAWINGS')) {
  const CAB_PIN_MAPPING: Record<number, number> = {
    38103: 1,
    38104: 8,
    38105: 16,
    38108: 24,
    38109: 27,
    38111: 28,
    38112: 29,
    38113: 30,
    38117: 33,
    38118: 34,
    38119: 35,
    38120: 37,
    38121: 38,
    38122: 41,
    38110: 42,
    38128: 46,
    38409: 15  // ← CORRECTED: Intercar Jumper & Connector Layout - TC Car
  };
  return CAB_PIN_MAPPING[num] || 1;
}
```

Database lookup in GET:
```typescript
// First, try to get exact page mapping from database
const drawing = await prisma.drawing.findFirst({
  where: {
    OR: [
      { drawingNo: { equals: drawingNo } },
      { drawingNo: { contains: drawingNo } }
    ]
  },
  include: {
    pageMappings: {
      where: { sourceFileName: sourceFile },
      take: 1
    }
  }
});

if (drawing?.pageMappings?.[0]) {
  const mapping = drawing.pageMappings[0];
  return NextResponse.json({ 
    pdfPageNo: mapping.pdfPageNo,
    sourceFile: mapping.sourceFileName,
    drawingNumber: mapping.drawingNumber,
    source: 'database',
    verified: mapping.verified
  });
}
```

---

## 4. GSD Topology Error Handling

### File: `src/lib/gsd/topology.ts`

Enhanced `getSystemsInfo()`:
```typescript
async function getSystemsInfo(): Promise<SystemInfo[]> {
  try {
    const systems = await prisma.system.findMany({
      include: {
        _count: {
          select: { devices: true, drawings: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    if (!systems || systems.length === 0) {
      throw new Error('No systems found in database');
    }

    return systems.map((sys) => ({
      code: sys.code,
      name: sys.name,
      devices: sys._count.devices,
      connections: sys._count.drawings * 5,
      color: SYSTEM_COLORS[sys.code] || SYSTEM_COLORS.DEFAULT,
    }));
  } catch (error) {
    console.error('Error fetching systems:', error);
    throw new Error(`Failed to fetch systems info: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

Similar error handling applied to:
- `getDeviceNodes()`
- `getConnectorNodes()`
- `getWireEdges()`
- `getConnectorEdges()`
- `calculateStatistics()`

---

## 5. GSD Viewer Error UI

### File: `src/components/gsd/GSDViewer.tsx`

Error state handling:
```typescript
if (error || !nodes || nodes.length === 0) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
      <div className="flex flex-col items-center gap-4 p-6 bg-amber-900/20 border border-amber-500/50 rounded-lg max-w-md">
        <AlertTriangle className="w-8 h-8 text-amber-400" />
        <p className="text-amber-400 font-semibold text-center">GSD Topology Unavailable</p>
        <p className="text-amber-300 text-sm text-center">
          {error || 'No topology data available. Check database connection and system configuration.'}
        </p>
        <p className="text-amber-200/70 text-xs text-center mt-2">
          Ensure systems, devices, and connections are properly configured in the database.
        </p>
      </div>
    </div>
  );
}
```

Safe node conversion:
```typescript
const xyNodes = (data.data.nodes || []).map((node: SystemNode) => ({
  id: node.id || `node-${Math.random()}`,
  data: {
    label: node.label || 'Unknown',
    type: node.type || 'device',
    metadata: node.metadata || {},
  },
  position: node.position || { x: 0, y: 0 },
  // ... rest of styling
}));
```

---

## 6. Deployment Checklist

### Prerequisites
```bash
# 1. Navigate to project
cd /Users/shashishekharmishra/VCC\ system\ application

# 2. Install dependencies (if needed)
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Apply migration
npx prisma migrate deploy

# 5. Verify migration
npx prisma db execute --stdin < prisma/migrations/20250528_add_drawing_page_mapping/migration.sql
```

### Testing
```bash
# 1. Test PDF mapping
curl "http://localhost:3000/api/drawings/pdf-mapping?drawing_no=942-38409&source_file=CAB_PIN%20DRAWINGS.pdf"

# 2. Seed mappings (optional)
curl -X POST http://localhost:3000/api/drawings/pdf-mapping \
  -H "Content-Type: application/json" \
  -d '{"action":"seedMappings"}'

# 3. Test GSD endpoint
curl "http://localhost:3000/api/gsd"

# 4. Visit dashboard
# Open http://localhost:3000/dashboard
# Navigate tabs and verify no console errors
```

---

## 7. Verification SQL

### Check DrawingPageMapping table
```sql
-- Count records
SELECT COUNT(*) as total_mappings FROM "DrawingPageMapping";

-- Find specific drawing
SELECT * FROM "DrawingPageMapping" 
WHERE "drawingNumber" = '942-38409';

-- Check indexes
SELECT * FROM "DrawingPageMapping" 
WHERE "drawingNumber" = '942-38409' 
AND "sourceFileName" LIKE '%CAB_PIN%';

-- Verify page number
SELECT "pdfPageNo" FROM "DrawingPageMapping" 
WHERE "drawingNumber" = '942-38409';
-- Should return: 15
```

---

## Summary of Changes

| File | Change Type | Impact |
|------|------------|--------|
| `prisma/schema.prisma` | ADD model + relation | Database structure |
| `prisma/migrations/...` | NEW migration | Schema creation |
| `pdf-mapping/route.ts` | ENHANCE | Database lookup + 942-38409 fix |
| `topology.ts` | ENHANCE | Proper error throwing |
| `GSDViewer.tsx` | IMPROVE | Graceful error UI |

All changes are backward compatible and non-breaking.
Production deployment ready ✅