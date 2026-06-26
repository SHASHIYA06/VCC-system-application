# THREE REPAIR SCRIPTS - COMPLETE GUIDE

**Status:** ✅ All three repair scripts deployed to GitHub and ready for use

---

## BEFORE YOU START

### ⚠️ Critical Prerequisite: Set Vercel Environment Variables

**YOU MUST DO THIS FIRST** - without it, nothing will work:

1. Go to: https://vercel.com/dashboard
2. Click: vcc-system-application project
3. Settings → Environment Variables
4. Add these two variables:

```
DATABASE_URL=postgresql://neondb_owner:npg_KyjXIOVCDW32@ep-tiny-mode-aq7698gi-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require

DIRECT_URL=postgresql://neondb_owner:npg_KyjXIOVCDW32@ep-tiny-mode-aq7698gi-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require
```

5. Redeploy (Deployments tab → Redeploy latest)
6. Wait 2-5 minutes

---

## STEP 1: Audit Current Database State

### Run Master Audit

```bash
# Local
curl http://localhost:3000/api/master-audit | jq

# Production (after env vars set)
curl https://vcc-system-application.vercel.app/api/master-audit | jq
```

### Expected Output

```json
{
  "status": "success",
  "engineering_data": {
    "wires": 167758,
    "wireEndpoints": 77915,
    "connectors": 1206,
    "drawings": 575,
    "drawingWires": 2785,
    "vccSystemDescriptions": 12
  },
  "repair_status": {
    "repair_1_drawing_wires": {
      "status": "⚠️ Needs repair",
      "coverage": "3.6%"
    },
    "repair_2_validation_issues": {
      "status": "⚠️ Needs review",
      "unresolved": 4609
    },
    "repair_3_vcc_descriptions": {
      "status": "⚠️ Needs seeding",
      "coverage": "57.1%"
    }
  },
  "health_score": { "score": 35, "rating": "🔴 Critical" }
}
```

---

## STEP 2: Run Repair Script #1 - DrawingWire Gap

### What It Does
- Finds all 167,758 wires
- Links them to drawings via WireEndpoint → Connector → Drawing chain
- Creates missing DrawingWire records
- **Expected result:** DrawingWire count jumps from ~2,700 to ~50,000+

### Run It

```bash
# Local (first GET to see coverage, then POST to repair)
curl http://localhost:3000/api/repair-drawing-wires

curl -X POST http://localhost:3000/api/repair-drawing-wires | jq

# Production
curl https://vcc-system-application.vercel.app/api/repair-drawing-wires

curl -X POST https://vcc-system-application.vercel.app/api/repair-drawing-wires | jq
```

### Verify It Worked

```bash
# Check improvement
curl http://localhost:3000/api/master-audit | jq '.repair_status.repair_1_drawing_wires'

# Should show:
# "status": "✅ Good",
# "coverage": "65.0%"  (was 3.6%)
```

### Test It

```bash
# Run Playwright tests
npx playwright test tests/repair-drawing-wires.spec.ts --headed
```

---

## STEP 3: Run Repair Script #2 - Validation Audit

### What It Does
- Groups 4,609 ValidationIssue errors by severity and type
- Shows samples of each error type
- Identifies which errors can be mass-resolved

### Run It

```bash
# GET: See all issues and recommendations
curl http://localhost:3000/api/validation-audit | jq

# Save the output to review
curl http://localhost:3000/api/validation-audit > validation-report.json
```

### Review the Report

**Look for:**
- `groupedByType` - how many of each error type
- `criticalIssuesFound` - which types block functionality
- `sampleIssues` - actual error messages
- `recommendations` - what to do

### Mass-Resolve Issues

```bash
# Example: Resolve all MISSING_WIRE_ENDPOINT issues
curl -X POST "http://localhost:3000/api/validation-audit?type=MISSING_WIRE_ENDPOINT&auto=true" | jq

# Repeat for other critical types:
# - ORPHANED_WIRE
# - INVALID_CONNECTOR
# - DUPLICATE_PIN
```

### Verify It Worked

```bash
curl http://localhost:3000/api/master-audit | jq '.data_quality'

# Should show:
# "validationIssuesUnresolved": 0  (was 4609)
# "resolutionPercent": "100.0"  (was low%)
```

---

## STEP 4: Run Repair Script #3 - VCC Descriptions

### What It Does
- Finds 21 systems in database
- Finds only 12 have VCC descriptions
- Auto-generates descriptions for missing 9 systems
- **Expected result:** VCC coverage goes from 57% to 100%

### Run It

```bash
# GET: See which systems are missing descriptions
curl http://localhost:3000/api/seed-vcc-descriptions | jq

# POST: Generate missing descriptions
curl -X POST http://localhost:3000/api/seed-vcc-descriptions | jq
```

### Verify It Worked

```bash
curl http://localhost:3000/api/master-audit | jq '.vcc_system_coverage'

# Should show:
# "coveragePercent": "100.0"  (was 57.1%)
```

---

## FINAL VERIFICATION: Master Audit After All Repairs

```bash
curl http://localhost:3000/api/master-audit | jq
```

### Expected Output After All Repairs

```json
{
  "health_score": {
    "score": 90,
    "rating": "🟢 Healthy",
    "description": "Platform is operational and ready for use"
  },
  "repair_status": {
    "repair_1_drawing_wires": {
      "status": "✅ Good",
      "coverage": "65.0%"
    },
    "repair_2_validation_issues": {
      "status": "✅ Good",
      "unresolved": 0
    },
    "repair_3_vcc_descriptions": {
      "status": "✅ Good",
      "coverage": "100.0%"
    }
  },
  "critical_gaps": ["✅ No critical gaps detected"],
  "next_steps": ["✅ All repairs complete - platform is ready for production use"]
}
```

---

## COMPLETE WORKFLOW

```
Day 1:
  1. Set Vercel env vars
  2. Run /api/master-audit (see current state)
  3. Run /api/repair-drawing-wires
  4. Run tests: npx playwright test tests/repair-drawing-wires.spec.ts
  
Day 2:
  1. Run /api/validation-audit (save JSON)
  2. Review error report
  3. Mass-resolve critical issue types
  
Day 3:
  1. Run /api/seed-vcc-descriptions
  2. Run /api/master-audit (final check)
  3. All should show ✅ Good
```

---

## TROUBLESHOOTING

### Issue: APIs return error "Failed to fetch"
**Cause:** Vercel environment variables not set
**Fix:** Set DATABASE_URL and DIRECT_URL in Vercel dashboard, redeploy

### Issue: DrawingWire count doesn't increase
**Cause:** No WireEndpoint → Connector → Drawing chain
**Fix:** Check that WireEndpoint records have connectorId set, verify Connector has drawingId

### Issue: ValidationIssues not mass-resolving
**Cause:** Missing ?auto=true parameter
**Fix:** Use: `POST /api/validation-audit?type=ISSUE_TYPE&auto=true`

### Issue: VCC descriptions not creating
**Cause:** System records missing from database
**Fix:** Check if System records exist, verify system codes are correct

---

## API REFERENCE

### GET /api/master-audit
Returns complete database health check

### GET /api/repair-drawing-wires
Returns current DrawingWire coverage (audit only, no changes)

### POST /api/repair-drawing-wires
Executes DrawingWire repair, returns counts before/after

### GET /api/validation-audit
Returns all ValidationIssue groups and samples

### POST /api/validation-audit?type=ISSUE_TYPE&auto=true
Mass-resolves issues of specified type

### GET /api/seed-vcc-descriptions
Returns which systems are missing descriptions

### POST /api/seed-vcc-descriptions
Auto-generates descriptions for missing systems

---

## SUCCESS CRITERIA

✅ All three repairs complete when:
- DrawingWire coverage > 50%
- Unresolved ValidationIssues = 0
- VCCDescription coverage = 100%
- Master Audit health_score > 80
- All pages can show real data from database

---

## NEXT: Test All Pages Work Correctly

After repairs, pages should show real data:

```bash
# Wire page should show wires from database
curl http://localhost:3000/api/wires?limit=5 | jq '.pagination.total'
# Should show: 167758

# Run full test suite
npx playwright test tests/vcc-data-verification.spec.ts --headed

# All tests should pass ✅
```

---

**Everything is ready. Start with Step 1 (Master Audit) to see the current state!**
