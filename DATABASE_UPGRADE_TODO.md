# 🎯 DATABASE UPGRADE TODO LIST

## Branch Analysis Summary

| Branch | Name | Size | Status |
|--------|------|------|--------|
| br-lucky-rain (DEFAULT) | preview/feature/ui-ux-phase-2 | 125MB | Active - Vercel uses this |
| br-still-thunder | preview/feature/phase2-wire-integrity | 159MB | Has 77K WireEndpoints! |
| br-lingering-silence | main | 46MB | Original main (inactive) |
| 3 archived branches | main_old_* | 34MB each | Can be deleted |

## Key Data Differences

| Table | Default Branch | Wire-Integrity | Action |
|-------|---------------|---------------|--------|
| WireEndpoint | 1,990 | **77,915** | MERGE from wire-integrity |
| Circuit | 1,141 | **2,221** | MERGE from wire-integrity |
| TrainLine | 978 | **1,170** | MERGE from wire-integrity |
| Wire | 167,081 | **167,758** | MERGE from wire-integrity |
| Device | 264 | **274** | MERGE from wire-integrity |
| DrawingPageMapping | 574 | **598** | Already fixed |

---

## TODO EXECUTION ORDER

### ✅ PHASE 1: Schema Sync (DONE)
- [x] Create missing tables (Subsystem, Equipment, Cable, etc.)
- [x] Seed Subsystems (30 records)
- [x] Seed VCCDescription (10 systems)
- [x] Seed SystemMetadata (21 systems)
- [x] Seed Fleet/Train
- [x] Seed CarSystem
- [x] Fix DrawingPageMapping (1 → 574)

### ⏳ PHASE 2: Data Merge from Wire-Integrity Branch
- [ ] Merge 75,925 missing WireEndpoints
- [ ] Merge 1,080 missing Circuits + CircuitEndpoints
- [ ] Merge 677 missing Wires
- [ ] Merge 192 missing TrainLines
- [ ] Merge 10 missing Devices
- [ ] Merge DrawingVerificationStatus records
- [ ] Merge DeviceSpecification records

### ⏳ PHASE 3: Enhanced Schema & Features
- [ ] Add RAG/Vector search tables
- [ ] Add AI analysis results table
- [ ] Add Voice agent transcripts table
- [ ] Add multiagent workflow tracking
- [ ] Setup LangChain integration endpoints
- [ ] Configure TinyFish/Playwright testing

### ⏳ PHASE 4: Frontend-Backend Sync
- [ ] Verify all API endpoints return correct data
- [ ] Test PDF viewer page navigation
- [ ] Test wire tracing end-to-end
- [ ] Test system/subsystem navigation
- [ ] Deploy and verify on production

### ⏳ PHASE 5: Cleanup
- [ ] Delete 3 archived branches
- [ ] Set main branch as default (after merge)
- [ ] Update Vercel environment variables
- [ ] Final validation

---

## RECOMMENDED APPROACH

**Best option:** Switch the default branch to `phase2-wire-integrity` since it already has:
- All the schema tables
- 77,915 WireEndpoints (vs 1,990)
- 167,758 Wires (vs 167,081)
- 2,221 Circuits (vs 1,141)
- Better data overall

**Then:** Apply our recent fixes (DrawingPageMapping, Subsystem seeds) to that branch too.

This avoids complex data merging and gives us the best data immediately.
