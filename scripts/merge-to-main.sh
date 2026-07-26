#!/bin/bash
# ============================================================
# MERGE WIRE-INTEGRITY BRANCH DATA → MAIN BRANCH
# ============================================================
# This script:
# 1. Dumps data from wire-integrity (best data source)
# 2. Loads it into main branch (best schema)
# 3. Uses ON CONFLICT DO NOTHING to preserve existing main data
# ============================================================

set -e

SOURCE="postgresql://neondb_owner:npg_KyjXIOVCDW32@ep-young-wildflower-aqy2a92u-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require"
TARGET="postgresql://neondb_owner:npg_KyjXIOVCDW32@ep-tiny-mode-aq7698gi-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require"

echo "╔══════════════════════════════════════════════════════╗"
echo "║  MERGE: wire-integrity → main branch                ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Step 1: Check source data
echo "📊 Checking source (wire-integrity)..."
psql "$SOURCE" -t -c "SELECT 'Wires: ' || COUNT(*) FROM \"Wire\";"
psql "$SOURCE" -t -c "SELECT 'WireEndpoints: ' || COUNT(*) FROM \"WireEndpoint\";"
psql "$SOURCE" -t -c "SELECT 'Drawings: ' || COUNT(*) FROM \"Drawing\";"
psql "$SOURCE" -t -c "SELECT 'ConnectorPins: ' || COUNT(*) FROM \"ConnectorPin\";"
echo ""

# Step 2: Check target before
echo "📊 Checking target (main) BEFORE merge..."
psql "$TARGET" -t -c "SELECT 'Wires: ' || COUNT(*) FROM \"Wire\";"
psql "$TARGET" -t -c "SELECT 'WireEndpoints: ' || COUNT(*) FROM \"WireEndpoint\";"
psql "$TARGET" -t -c "SELECT 'Drawings: ' || COUNT(*) FROM \"Drawing\";"
psql "$TARGET" -t -c "SELECT 'ConnectorPins: ' || COUNT(*) FROM \"ConnectorPin\";"
echo ""

# Step 3: Get the project ID from source
echo "🔑 Getting project ID from source..."
SOURCE_PROJECT_ID=$(psql "$SOURCE" -t -c "SELECT id FROM \"Project\" LIMIT 1;" | tr -d ' ')
TARGET_PROJECT_ID=$(psql "$TARGET" -t -c "SELECT id FROM \"Project\" LIMIT 1;" | tr -d ' ')
echo "   Source project: $SOURCE_PROJECT_ID"
echo "   Target project: $TARGET_PROJECT_ID"
echo ""

# Step 4: Dump and transfer core tables
# We dump as INSERT statements with ON CONFLICT DO NOTHING
echo "📦 Transferring data (this may take a few minutes)..."

# Tables in dependency order
TABLES=(
  "System"
  "ConductorClass"
  "ConnectorType"
  "Drawing"
  "Device"
  "Connector"
  "ConnectorPin"
  "Wire"
  "WireEndpoint"
  "DrawingWire"
  "DrawingPage"
  "DrawingPageMapping"
  "Circuit"
  "CircuitEndpoint"
  "TrainLine"
  "Signal"
  "CrossConnection"
  "CrossConnectionRule"
)

for TABLE in "${TABLES[@]}"; do
  echo -n "   Transferring $TABLE..."
  
  # Dump data as COPY format, then load with conflict handling
  # Use pg_dump --data-only --inserts for safer transfer
  COUNT=$(pg_dump "$SOURCE" --data-only --inserts --no-owner --no-privileges \
    --table="\"$TABLE\"" 2>/dev/null | \
    sed "s/INSERT INTO/INSERT INTO/g" | \
    sed "s/);/) ON CONFLICT DO NOTHING;/g" | \
    psql "$TARGET" -q 2>&1 | grep -c "INSERT" || echo "0")
  
  # Get final count
  FINAL=$(psql "$TARGET" -t -c "SELECT COUNT(*) FROM \"$TABLE\";" 2>/dev/null | tr -d ' ')
  echo " done ($FINAL rows)"
done

echo ""

# Step 5: Handle Project ID mismatch
# If drawings from source have different projectId, update them
echo "🔄 Fixing project ID references..."
psql "$TARGET" -c "
  UPDATE \"Drawing\" SET \"projectId\" = '$TARGET_PROJECT_ID' 
  WHERE \"projectId\" = '$SOURCE_PROJECT_ID' 
  AND \"projectId\" != '$TARGET_PROJECT_ID';
" 2>/dev/null || true

# Step 6: Final verification
echo ""
echo "📊 Checking target (main) AFTER merge..."
psql "$TARGET" -t -c "SELECT 'Wires: ' || COUNT(*) FROM \"Wire\";"
psql "$TARGET" -t -c "SELECT 'WireEndpoints: ' || COUNT(*) FROM \"WireEndpoint\";"
psql "$TARGET" -t -c "SELECT 'Drawings: ' || COUNT(*) FROM \"Drawing\";"
psql "$TARGET" -t -c "SELECT 'ConnectorPins: ' || COUNT(*) FROM \"ConnectorPin\";"
psql "$TARGET" -t -c "SELECT 'DrawingPageMapping: ' || COUNT(*) FROM \"DrawingPageMapping\";"
psql "$TARGET" -t -c "SELECT 'Systems: ' || COUNT(*) FROM \"System\";"

echo ""
echo "✅ MERGE COMPLETE!"
echo ""
echo "Next steps:"
echo "  1. Update Vercel DATABASE_URL to main branch endpoint:"
echo "     ep-tiny-mode-aq7698gi-pooler.c-8.us-east-1.aws.neon.tech"
echo "  2. Redeploy on Vercel"
echo ""
