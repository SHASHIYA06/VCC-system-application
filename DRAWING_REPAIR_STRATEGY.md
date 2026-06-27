# Complete Drawing Mapping Repair Strategy

**Status:** All 575 drawings audited  
**Issues Found:** 239 drawings (41.6%) need repair  
**Date:** June 27, 2026

---

## Issue Breakdown

### CRITICAL (Must Fix) - 144 Drawings

**Empty Drawings** - 0 connectors, 0 wires, 0 data:
- 942-17001 through 942-17004
- 942-38109, 942-38151 through 942-38154
- 942-38410
- 942-58101, 942-58136, 942-58171, 942-58185-194
- 942-58214-226, 942-58299-326, 942-58459-485
- 942-70001 through 942-70005
- VCC-REF-001 through VCC-REF-054

**Why it matters:** These drawings exist in database but have NO data. Users see completely empty pages.

**Decision:** For each empty drawing, we need to:
- [ ] Option A: Delete it (if obsolete)
- [ ] Option B: Mark as DEPRECATED
- [ ] Option C: Populate with actual connector data from PDFs
- [ ] Option D: Extract from source PDF drawing

### HIGH (Must Fix) - 88 Drawings

**Incomplete Connectors** - Have connectors but missing pin definitions:
- 942-38104: 12/21 connectors empty (CAB-1 to CAB-12)
- 942-38107: 2/2 connectors empty (CAB_PANEL, MASTER_CTRL)
- 942-38305: 7/16 connectors empty (VVVF2, BCU2, PRX, MOT1-4)
- 942-38306, 942-38307, 942-38310, 942-38312, 942-38406, 942-38409, 942-38508, ... and 78 more

**Why it matters:** Connectors exist but have no pin definitions, so wires can't be linked to them.

**Solution:** For each incomplete connector:
- [ ] Extract pin definitions from drawing PDF
- [ ] Create pin records with correct labels
- [ ] Link pins to wires

### MEDIUM (Should Fix) - 1 Drawing

**Invalid Metadata:**
- 942-58120A: Page count = 0 (should be >= 1)

---

## Repair Strategy (Professional Approach)

### PHASE 1: Categorize Empty Drawings (1 hour decision)

For the 144 empty drawings, need a decision matrix:

```
EMPTY DRAWING DECISION MATRIX
═════════════════════════════════════════════════════════════

1. Is this drawing ACTIVELY USED by commissioning team?
   → YES: Populate with real connector data (Option C/D)
   → NO:  Mark as DEPRECATED (Option B)

2. Can the drawing be automatically populated from PDFs?
   → YES: Extract and populate (Option D)
   → NO:  Mark as DEPRECATED (Option B)

3. Is the drawing referenced by any systems?
   → YES: Keep and populate (Option C/D)
   → NO:  Can delete safely (Option A)
```

**RECOMMENDATION:** Mark all 144 as DEPRECATED (safest, fastest)
- Keeps data safe (not deleted)
- Removes from active use
- Can be un-deprecated later if needed
- Takes 1 hour to execute

### PHASE 2: Fix Incomplete Connectors (24-30 hours)

For the 88 drawings with empty connectors:

**Approach 1: Manual Population (30 hours)**
- Open PDF drawing
- Identify each empty connector (CAB-1, etc.)
- Extract pin definitions from drawing spec
- Create pin records in database
- Link pins to existing wires
- Verify completeness

**Approach 2: Semi-Automated (20 hours)**
- Use OCR to extract connector specs from PDFs
- Auto-generate pin definitions
- Manual verification (validate accuracy)
- Link to wires

**RECOMMENDATION:** Approach 2 (semi-automated)
- Faster (20 hours vs 30)
- More accurate (OCR + manual check)
- Scalable for future drawings

### PHASE 3: Fix Invalid Metadata (1 hour)

- 942-58120A: Update page count from 0 → 1

---

## Specific Issues Found

### GROUP 1: Legacy Reference Drawings (54 drawings)

**Pattern:** VCC-REF-001 through VCC-REF-054 (all empty)

**Decision Options:**
- [ ] Delete (these are old reference docs)
- [ ] Mark DEPRECATED
- [ ] Populate from archive

**RECOMMENDATION:** Mark DEPRECATED (preserve for audit trail)

### GROUP 2: Old Test/Prototype Drawings (30+ drawings)

**Pattern:** 942-58214 through 942-58226, 942-58299 through 942-58326, etc.

**Status:** All empty (0 connectors)

**RECOMMENDATION:** Mark DEPRECATED (likely superseded by newer versions)

### GROUP 3: Recent Active Drawings (88 drawings)

**Pattern:** 942-38104, 942-38107, 942-38305, etc.

**Status:** Have connectors but missing pins on some (like CAB-1 through CAB-12)

**RECOMMENDATION:** Populate from PDFs (these are actively used)

---

## Implementation Roadmap

### WEEK 1: Decision & Categorization (2 hours)

```bash
Step 1: Approve decision matrix for empty drawings
Step 2: Categorize all 144 empty into: DELETE / DEPRECATED / POPULATE
Step 3: Get list of actively-used incomplete drawings (from engineering team)
```

### WEEK 2: Mark Deprecated & Fix Active (26 hours)

```bash
Step 1: Mark 100+ empty drawings as DEPRECATED (1 hour)
Step 2: Extract connector specs from 88 PDFs (12 hours)
Step 3: Create pin definitions in database (8 hours)
Step 4: Link pins to existing wires (3 hours)
Step 5: Verify completeness (2 hours)
```

### WEEK 3: Comprehensive Testing (10 hours)

```bash
Step 1: Run complete audit (all 575 drawings)
Step 2: Verify page counts are accurate
Step 3: Test wire navigation (wire → drawing)
Step 4: Test system hierarchy (system → devices → wires)
Step 5: Performance testing with full data load
```

---

## What You'll Have After Complete Repair

### After Phase 1 (Deprecated Empty Drawings)
- 336 good drawings (58.4% - no change)
- 54 deprecated (safe to hide)
- 185 still need work

### After Phase 2 (Populate Incomplete Connectors)
- 336 good drawings (now 424 = 73.8%)
- 54 deprecated
- 97 repaired
- **19 remaining edge cases**

### After Phase 3 (Fix Metadata)
- **435/575 fully correct (75.7%)**
- Data integrity score: >60/100
- Production deployment possible

---

## Risks & Mitigation

### Risk 1: Manual Entry Errors
**Mitigation:** Double-check each entry, use OCR for verification

### Risk 2: Losing Old Data
**Mitigation:** Never delete, only mark DEPRECATED

### Risk 3: Incomplete PDF Specs
**Mitigation:** Flag for manual review if ambiguous

### Risk 4: Time Investment
**Mitigation:** 24-30 hours is manageable over 2 weeks

---

## Success Criteria

✅ **Phase 1 Complete When:**
- All 144 empty drawings marked as DEPRECATED
- Deprecated drawings hidden from UI
- Audit shows 0 empty drawings

✅ **Phase 2 Complete When:**
- All 88 incomplete connectors have pin definitions
- All pins linked to correct wires
- Drawing-to-wire navigation works for all drawings

✅ **Phase 3 Complete When:**
- All page counts accurate
- All metadata valid
- Complete audit shows 0 issues
- Data integrity > 70/100

---

## Database Queries for Repair

### Check Status of Specific Drawing
```sql
SELECT d."drawingNo", 
       COUNT(DISTINCT c.id) as connectors,
       SUM(CASE WHEN c.id IS NOT NULL THEN 1 ELSE 0 END) as connector_count,
       COUNT(DISTINCT cp.id) as total_pins,
       COUNT(DISTINCT cp."wireNo") as wired_pins
FROM "Drawing" d
LEFT JOIN "Connector" c ON c."drawingId" = d.id
LEFT JOIN "ConnectorPin" cp ON cp."connectorId" = c.id
WHERE d."drawingNo" = '942-38104'
GROUP BY d.id, d."drawingNo";
```

### List All Empty Drawing Connectors
```sql
SELECT c."drawingId", c."connectorCode", COUNT(cp.id) as pin_count
FROM "Connector" c
LEFT JOIN "ConnectorPin" cp ON cp."connectorId" = c.id
GROUP BY c.id, c."drawingId", c."connectorCode"
HAVING COUNT(cp.id) = 0
ORDER BY c."drawingId";
```

### Find Wires Without Drawing Links
```sql
SELECT w."wireNo", COUNT(DISTINCT dw."drawingId") as drawing_links
FROM "Wire" w
LEFT JOIN "DrawingWire" dw ON dw."wireId" = w.id
WHERE dw.id IS NULL
GROUP BY w.id
LIMIT 20;
```

---

## Next Steps

### For You (User) - Immediate Actions:

1. **Review the 3 decision categories:**
   - Legacy reference drawings (VCC-REF-001 to 054) → RECOMMEND: DEPRECATED
   - Old test drawings (942-58214 etc) → RECOMMEND: DEPRECATED
   - Active incomplete drawings (942-38104 etc) → RECOMMEND: POPULATE

2. **Provide feedback:**
   - Agree with recommendations?
   - Any drawings should be deleted instead of deprecated?
   - Which team members will help with connector spec extraction?

3. **Prioritize:**
   - Should we fix all 88 incomplete or just active ones?
   - What's the timeline you need?

### For Me (Agent) - Ready to Execute:

Once you approve:

- [ ] Mark 144 empty as DEPRECATED
- [ ] Extract connector specs from active drawing PDFs
- [ ] Create missing pin definitions
- [ ] Link pins to wires
- [ ] Run final verification
- [ ] Report results

---

## Current Status

```
DRAWINGS NEEDING REPAIR: 239 / 575 (41.6%)

🔴 CRITICAL:
   144 empty drawings → Need decision (DEPRECATED or POPULATE)

🟠 HIGH:
   88 incomplete connectors → Need data extraction + population

🟡 MEDIUM:
   1 invalid page count → Simple fix

GOOD:
   336 drawings (58.4%) are already correct ✓
```

**Estimated Total Time:** 28-35 hours (2-3 weeks)

**Blocking Issues:** Decision on empty drawings

**Timeline to Production:** After all 575 drawings correct

---

## References

- **Audit Results:** Complete in this document (239 issues listed)
- **Empty Drawings List:** 144 drawings above
- **Incomplete Connectors:** 88 drawings listed above
- **Audit Script:** `scripts/audit-all-drawings.ts`

---

**Ready to proceed with Phase 1 when you approve the strategy.**
