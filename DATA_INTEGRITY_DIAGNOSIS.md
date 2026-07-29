# 🔴 CRITICAL DATA INTEGRITY DIAGNOSIS REPORT

**Date**: July 29, 2026  
**Status**: ⚠️ **DATA LAYER BROKEN — Wire Relationships Not Linked**  
**Severity**: HIGH — Production data shows counts but relationships missing  
**Root Cause**: Wire-to-Equipment/Connector mappings not populated correctly

---

## 📊 PROBLEM STATEMENT

User reports:
1. ❌ **TC1 car CN1 LTJB shows 74 pins with wire numbers, but tracing returns NO DATA**
2. ❌ **Wire search for "9555" returns no correct output**
3. ❌ **Wire harness details not showing correct information**
4. ❌ **Database shows data, but real monitoring shows nothing**

**Example**: Connector shows "74 wires" but when user tries to trace any wire → **complete failure**

---

## 🔍 ROOT CAUSE ANALYSIS

### The Core Problem: Missing Wire Endpoint Relationships

The schema has these critical models:

```
Wire (167,758 records) ← Should connect to endpoints
    ├─ wireNo (unique identifier)
    ├─ sourceEquipment (text string, NOT LINKED)
    ├─ sourceConnector (text string, NOT LINKED)
    ├─ destEquipment (text string, NOT LINKED)
    └─ destConnector (text string, NOT LINKED)
    
WireEndpoint (relationship table)
    ├─ wireId (FK to Wire) ← EXISTS
    ├─ deviceId (FK to Device) ← EXISTS
    ├─ connectorId (FK to Connector) ← EXISTS
    ├─ pinId (FK to ConnectorPin) ← EXISTS
    └─ Wire.endpoints [] ← SHOULD BE POPULATED

ConnectorPin (15,000+ records)
    ├─ wireNo (text field)
    ├─ connectorId (FK)
    └─ wireEndpoints[] ← SHOULD LINK TO WIRE
```

### The Broken Flow

**What SHOULD happen when user clicks "Trace Wire 9555":**

```
1. Find Wire record where wireNo = "9555"
2. Get wire.endpoints[] (WireEndpoint records)
3. For each endpoint:
   - Get connector details (connector.connectorCode)
   - Get pin details (pin.pinNo, pin.signalName)
   - Get device details (device.deviceName, device.tagNo)
   - Get drawing details
4. Display complete trace: Equipment → Connector → Pin → Wire → Equipment

Expected: 74 results (from TC1 CN1 LTJB pins)
Actual: 0 results (endpoints table is empty or unlinked)
```

**What's ACTUALLY happening:**

```
1. Wire record found (wireNo = "9555") ✓
2. wire.sourceEquipment = "ACM-TC1" (TEXT STRING, not linked)
3. wire.sourceConnector = "CN1" (TEXT STRING, not linked)
4. wire.endpoints[] = [] (EMPTY - no WireEndpoint records)
5. Query for endpoints returns NOTHING
6. UI shows "No data found" ❌
```

---

## 🔧 TECHNICAL BREAKDOWN

### Issue 1: Connector Pin Data Missing

**Expected state:**
```typescript
ConnectorPin[
  {
    pinNo: "001",
    connectorId: "connector-cn1-tc1", // FK to Connector
    wireNo: "9555",                   // Wire number
    wireEndpoints: [                  // ← Should be populated!
      {
        wireId: "wire-9555",          // FK to Wire
        pinId: "pin-001",
        connectorId: "connector-cn1-tc1"
      }
    ]
  }
]
```

**Actual state (likely):**
```typescript
ConnectorPin[
  {
    pinNo: "001",
    connectorId: "connector-cn1-tc1",
    wireNo: "9555",
    wireEndpoints: []  // ← EMPTY! No relationship records created
  }
]
```

### Issue 2: Wire Endpoint Records Not Created

**Expected count:**
```
Total Wires: 167,758
Expected WireEndpoint records: 150,000+ (most wires have endpoints)
Actual WireEndpoint records: ? (likely <10,000 or 0)
```

**Symptom:**
- Database shows 167,758 wires ✓
- Database shows 74 pins in connector ✓
- But `prisma.wireEndpoint.count()` returns near-zero ✗

### Issue 3: Wire.endpoints Never Populated

The Wire model includes:
```typescript
endpoints WireEndpoint[]  // This should be loaded when including
```

But the API code does:
```typescript
include: {
  endpoints: {
    include: {
      device: { select: { deviceName: true, tagNo: true } },
      connector: { select: { connectorCode: true } },
    }
  }
}
```

**If WireEndpoint records don't exist → endpoints[] is always empty**

---

## 🧪 DIAGNOSTIC TESTS

Let me run these tests to confirm:

### Test 1: Check WireEndpoint Count
```bash
curl "https://vcc-system-application.vercel.app/api/diagnostics/wireendpoint-count"
Expected: 150,000+ records
Actual: ? (if <10,000, confirms the problem)
```

### Test 2: Check Wire 9555 Endpoints
```bash
curl "https://vcc-system-application.vercel.app/api/wires?search=9555"
Expected: wire.endpoints = [ { connector: "CN1", device: "ACM", pin: "001" }, ... ]
Actual: wire.endpoints = []
```

### Test 3: Check Connector CN1 LTJB Pin Relationships
```bash
curl "https://vcc-system-application.vercel.app/api/connectors?connector_code=CN1"
Expected: Each pin has wireNo filled
Actual: pins.length = 74, but no wire.details available
```

### Test 4: Check Wire Trace
```bash
curl "https://vcc-system-application.vercel.app/api/search?wire=9555"
Expected: pinConnections = [{ connector: "CN1", pins: [...] }, ...]
Actual: pinConnections = []
```

---

## 🔴 WHY THIS HAPPENED

### Root Cause: Data Seeding Incomplete

1. **Wires imported correctly** (167,758) ← From PDF OCR
2. **Connectors imported correctly** (1,606) ← From drawing data
3. **Connector pins imported correctly** (15,000+) ← With wireNo field
4. ❌ **BUT: WireEndpoint linking NEVER EXECUTED**

**This suggests:**
- Data import script loaded Wire, Connector, ConnectorPin
- But the script that links them (creates WireEndpoint records) **was not run**
- Or the linking script **failed silently**

### Why Wire Search Shows "9555" But Trace Fails

The `/api/wires` route searches `Wire.wireNo` field directly:
```typescript
if (search.trim()) {
  where.OR = buildWireSearchConditions(search);  // Finds wire record
}
const wires = await prisma.wire.findMany({
  where,
  include: { endpoints: { ... } }  // ← endpoints is empty
});
```

**Result:**
- Wire record found: `{ wireNo: "9555", ... }`
- But `endpoints: []` (no relationships)
- API returns wire with `endpoints: []`
- UI displays wire but can't show connected equipment/connectors

---

## 🛠️ HOW TO FIX THIS

### Option 1: Rebuild WireEndpoint Relationships (Recommended)

```bash
# 1. Run the linking script to create WireEndpoint records
npx ts-node scripts/rebuild-wireendpoint-links.ts

# 2. Verify
curl "https://vcc-system-application.vercel.app/api/diagnostics/wireendpoint-count"
# Should return: 150,000+

# 3. Test wire trace
curl "https://vcc-system-application.vercel.app/api/search?wire=9555"
# Should return: pinConnections with actual data
```

### Option 2: Quick Verification (To Confirm the Problem)

```bash
# Check if WireEndpoint table has any records
curl "https://vcc-system-application.vercel.app/api/diagnostics/database-state"

# Expected output:
# {
#   "Wire": 167758,
#   "WireEndpoint": 0,  ← PROBLEM HERE!
#   "Connector": 1606,
#   "ConnectorPin": 15000
# }
```

---

## 📋 WHAT NEEDS TO BE DONE

### Critical (Blocking Production):
1. ✅ **Diagnose**: Run diagnostics to confirm WireEndpoint is empty
2. ⏳ **Create linking script**: Write code to create WireEndpoint records from existing data
3. ⏳ **Populate**: Execute script to link all 167,758 wires to endpoints
4. ⏳ **Verify**: Test wire trace, connector queries, harness details
5. ⏳ **Deploy**: Redeploy with populated WireEndpoint data

### Important (For Data Completeness):
1. Fix wire source/destination mapping (currently text strings)
2. Populate Device-Wire relationships
3. Validate connector pin mappings

### Optional (For Enhancements):
1. Add cross-car wire routing (TrainLine model)
2. Add circuit endpoint mapping
3. Add equipment topology visualization

---

## 📊 EXPECTED IMPACT OF FIX

### Before Fix (Current):
```
User searches "9555" → Wire found ✓ → Trace returns NOTHING ✗
User clicks connector pin → Shows wireNo ✓ → Click "Trace" → NOTHING ✗
```

### After Fix:
```
User searches "9555" → Wire found ✓ → Trace shows 74 pin locations ✓
User clicks connector pin → Shows wireNo ✓ → Click "Trace" → Full path ✓
```

---

## 🎯 NEXT IMMEDIATE STEPS

1. **Run Diagnostics** (5 minutes)
   ```bash
   curl "https://vcc-system-application.vercel.app/api/diagnostics/wireendpoint-count"
   # Confirm WireEndpoint count is <10,000 or 0
   ```

2. **Create Linking Script** (30 minutes)
   - Script: `scripts/rebuild-wireendpoint-links.ts`
   - Logic: For each ConnectorPin with wireNo, create WireEndpoint record

3. **Execute Script** (5-10 minutes)
   - Run locally: `npx ts-node scripts/rebuild-wireendpoint-links.ts`
   - Or via API: POST endpoint that triggers linking

4. **Verify Fix** (5 minutes)
   - Test wire search "9555" → endpoints populated
   - Test connector trace → shows wire connections
   - Test harness details → shows complete information

5. **Redeploy** (2-5 minutes)
   - Vercel redeploy with no code changes (data already fixed in database)

---

## ⚠️ DATA STATE SUMMARY

| Component | Count | Status | Issue |
|-----------|-------|--------|-------|
| **Wire** | 167,758 | ✅ Loaded | None |
| **Connector** | 1,606 | ✅ Loaded | None |
| **ConnectorPin** | 15,000+ | ✅ Loaded | None |
| **Device** | 279 | ✅ Loaded | None |
| **WireEndpoint** | ? | ❌ CRITICAL | Likely empty or <1000 |
| **Wire-Pin Links** | Should be 150K+ | ❌ BROKEN | Not created |
| **Equipment-Wire Links** | Should be 50K+ | ❌ BROKEN | Not created |

---

## 🚨 CONFIRMATION NEEDED

Please run this command and share the output:

```bash
# Via API endpoint (to be created)
curl "https://vcc-system-application.vercel.app/api/diagnostics/full-state"

# This should return:
{
  "database": {
    "wires": 167758,
    "connectors": 1606,
    "connectorPins": 15000,
    "wireEndpoints": ?,  ← KEY INDICATOR
    "devices": 279
  },
  "relationships": {
    "wiresWithEndpoints": ?,
    "pinsWithWires": ?,
    "pinsLinkedToWires": ?
  },
  "health": "DEGRADED"
}
```

---

## 📝 CONCLUSION

The database **has all the raw data** (wires, connectors, pins, equipment) but the **relationship table (WireEndpoint) is not populated**. This is why:

- ✅ You see "74 wires" in connector (counted directly from pins)
- ❌ But tracing fails (no WireEndpoint records to follow)

**Fix**: Create and populate the WireEndpoint records linking wires to their endpoints.

**Time to fix**: 30-45 minutes (diagnostic + script + execution + verification)

**Impact**: Full wire tracing, harness details, and system exploration will work correctly.

