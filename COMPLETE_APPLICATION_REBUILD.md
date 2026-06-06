# COMPLETE APPLICATION REBUILD - COMPREHENSIVE FIX GUIDE

**Status**: UNDER IMPLEMENTATION  
**Date**: June 6, 2026  
**Scope**: Complete application rewrite to fix all critical issues  
**Timeline**: 4-6 hours  

---

## CRITICAL ISSUES IDENTIFIED

### 🔴 CRITICAL (Must Fix First)
1. **Drawing Synchronization**: 574 drawings not synced with PDFs
2. **Multi-Agent RAG**: Missing modules and broken implementations  
3. **Database Migration**: DrawingPageMapping schema defined but NOT applied
4. **API Endpoints**: Stub implementations and missing files
5. **PDF Mapping**: Using inference fallback instead of verified database

### 🟠 HIGH PRIORITY (Fix After Critical)
6. **Dashboard**: Uses mockup data instead of real database
7. **Error Handling**: Silent failures throughout codebase
8. **Database Orphans**: 40% connectors without pins, 30% incomplete wires
9. **GSD Topology**: Silent failures, performance issues
10. **UI/UX**: Inconsistent error handling, layout problems

---

## PHASE 1: DATABASE & SCHEMA FIX

### Step 1.1: Apply Pending Migration
```bash
# Check migration status
npx prisma migrate status

# Deploy migration
npx prisma migrate deploy

# Verify tables created
npx prisma db push
```

### Step 1.2: Create Drawing Sync Script
**File**: `scripts/sync-all-drawings.ts`
- Scan all PDFs in `/public/DOCUMENTS/`
- Extract correct page mappings for all 574 drawings
- Populate `DrawingPageMapping` table
- Mark verified mappings
- Create sync report

### Step 1.3: Database Cleanup
**File**: `scripts/cleanup-orphaned-data.ts`
- Identify and remove orphaned connectors
- Fix incomplete wire connections
- Validate referential integrity
- Generate validation report

---

## PHASE 2: MULTI-AGENT RAG RESTORATION

### Step 2.1: Fix Missing Modules
**Issue**: `/lib/rag/multiagent` file doesn't exist  
**Fix**: Create missing implementation file

**File**: `src/lib/rag/multiagent.ts`
```typescript
// Export proper multi-agent RAG implementation
export async function multiAgentRAG(query: string) {
  // Use 5 specialized agents
  // Return unified response
}
```

### Step 2.2: Implement Agent Prompts
**File**: `src/lib/ai/langchain-setup.ts` (complete implementation)
- Create all 5 agent prompts
- Drawing Expert prompt
- Wire Expert prompt
- System Expert prompt
- Device Expert prompt
- Diagnostic Expert prompt

### Step 2.3: Add Error Handling & Timeouts
- Circuit breaker for OpenAI API
- Request timeouts (30 seconds default)
- Fallback model support
- Graceful degradation

### Step 2.4: Optimize Database Queries
- Add query caching (Redis or in-memory)
- Implement connection pooling
- Fix N+1 query problems
- Add query logging

---

## PHASE 3: API ENDPOINTS RESTORATION

### Step 3.1: Create Missing Endpoints
**Missing Endpoints**:
- `/api/drawings/sync` - Trigger full drawing sync
- `/api/analysis/` - System analysis endpoints
- `/api/diagnostics/` - Diagnostic endpoints

**File**: `src/app/api/drawings/sync/route.ts`
```typescript
export async function POST() {
  // Run drawing synchronization
  // Return sync results
  // Update all 574 drawings
}
```

### Step 3.2: Fix Stub Implementations
- Fix `/api/fix/sync-pins` (remove stub message)
- Fix `/api/gsd/route.ts` (implement GSD properly)
- Fix `/api/rag/route.ts` (proper imports)
- Fix `/api/ai/multi-agent/route.ts` (error handling)

### Step 3.3: Add Comprehensive Error Handling
- Structured error responses (not 500)
- Request validation (input sanitization)
- Rate limiting
- Logging (request ID, timestamp, user)

### Step 3.4: Add Retry Logic & Circuit Breakers
- Retry failed requests (exponential backoff)
- Circuit breaker for external APIs
- Timeout handling
- Graceful degradation

---

## PHASE 4: DASHBOARD RESTORATION

### Step 4.1: Remove Mockup Data
**Issue**: Dashboard uses hardcoded mockup for 942-38409  
**Fix**: Remove all mockup, always fetch real data

**File**: `src/app/dashboard/page.tsx` (rewrite data fetching)
```typescript
// Remove all hardcoded mockup data
// Always fetch from database
// Handle loading states properly
// Implement error boundaries
```

### Step 4.2: Fix Data Loading Functions
- `fetchDrawings()` - Proper error handling, retry logic
- `fetchGsd()` - Error boundary, timeout, fallback UI
- `fetchAnalysis()` - Input validation, error handling
- `fetchAiSearch()` - Model selection, timeout

### Step 4.3: Implement Error Boundaries
- Try/catch blocks properly structured
- Error boundaries for React components
- User-friendly error messages
- Fallback UI for failed states

### Step 4.4: Add Loading States & Skeleton UI
- Skeleton loaders for each section
- Smooth state transitions
- Cancel button for long-running operations
- Progress indicators

---

## PHASE 5: GSD TOPOLOGY FIX

### Step 5.1: Fix Topology Data Generation
**File**: `src/lib/gsd/topology.ts` (rewrite)
```typescript
// Proper error handling (throw, not warn)
// Accurate statistics calculation
// Pagination for large datasets
// Query optimization
// Clustering for dense graphs
```

### Step 5.2: Implement Data Validation
- Verify all systems exist
- Validate device references
- Check connector pin counts
- Validate wire connections

### Step 5.3: Add Performance Optimization
- Pagination (load 100 nodes at a time)
- Query optimization (use indexes)
- Response caching
- Lazy loading for large graphs

### Step 5.4: Fix GSD Viewer Component
**File**: `src/components/gsd/GSDViewer.tsx` (rewrite)
```typescript
// Proper error UI (not hidden)
// Retry button for failed loads
// Empty state handling
// Performance monitoring
```

---

## PHASE 6: PDF MAPPING & VIEWING FIX

### Step 6.1: Populate PDF Mappings
- Extract all PDF files page counts
- Map all 574 drawings to correct pages
- Verify drawing 942-38409 → page 15
- Store verified mappings in database

### Step 6.2: Fix PDF Viewer Integration
**File**: `src/components/pdf/EnhancedPdfViewer.tsx`
```typescript
// Load correct page from database mapping
// Handle multi-page drawings
// Fallback to inference if needed
// Error handling for missing PDFs
```

### Step 6.3: Add PDF Serving Fixes
**File**: `src/app/api/documents/serve/route.ts`
```typescript
// Verify drawing exists
// Check file permissions
// Handle range requests (for large PDFs)
// Add caching headers
```

---

## PHASE 7: UI/UX ENHANCEMENT

### Step 7.1: Fix Tailwind Styling
- Consistent spacing and sizing
- Proper responsive breakpoints
- Accessible color contrasts
- Smooth transitions and animations

### Step 7.2: Implement Consistent Error UI
- Standard error card component
- Retry button pattern
- Error logging
- User-friendly messages

### Step 7.3: Add Loading UI Patterns
- Skeleton screens
- Progress indicators
- Smooth spinners
- Cancel buttons

### Step 7.4: Improve Layout
- Responsive grid system
- Proper overflow handling
- Mobile-first design
- Accessibility fixes

---

## PHASE 8: TESTING & VALIDATION

### Step 8.1: API Testing
```bash
# Test all endpoints
curl -s http://localhost:3000/api/health
curl -s http://localhost:3000/api/systems
curl -s "http://localhost:3000/api/drawings/pdf-mapping?drawing_no=942-38409"
```

### Step 8.2: Database Validation
```bash
# Check drawing count
select count(*) from "Drawing";

# Check mapping coverage
select count(*) from "DrawingPageMapping";

# Check orphaned records
select count(*) from "Connector" where "pins" is null;
```

### Step 8.3: Dashboard Testing
- Load dashboard
- Test each tab (Explorer, GSD, AI)
- Test drawing search
- Test PDF viewing
- Test error states

### Step 8.4: Build Verification
```bash
npm run build
npm run type-check
npm test
```

---

## PRIORITY ORDER FOR FIXES

### TODAY (Hours 0-2)
1. ✅ Apply Prisma migration
2. ✅ Fix multi-agent RAG missing modules
3. ✅ Create drawing sync script
4. ✅ Run database cleanup

### TODAY (Hours 2-4)
5. ✅ Fix API endpoint stubs
6. ✅ Remove dashboard mockup data
7. ✅ Implement error handling
8. ✅ Fix GSD topology

### TODAY (Hours 4-6)
9. ✅ Complete PDF mapping
10. ✅ UI/UX fixes
11. ✅ Testing and validation
12. ✅ Push to GitHub

---

## CRITICAL FILES TO UPDATE

| File | Issue | Fix |
|------|-------|-----|
| `prisma/schema.prisma` | Migration not applied | Deploy migration |
| `src/lib/rag/multiagent.ts` | Missing file | Create implementation |
| `src/app/dashboard/page.tsx` | Uses mockup data | Remove mockup, fetch real data |
| `src/lib/gsd/topology.ts` | Silent failures | Fix error handling |
| `src/app/api/drawings/pdf-mapping/route.ts` | Using inference | Use database first |
| `src/lib/ai/langchain-setup.ts` | Incomplete | Complete all agents |
| `src/app/api/ai/multi-agent/route.ts` | No error handling | Add comprehensive errors |
| `src/components/pdf/EnhancedPdfViewer.tsx` | Wrong page loading | Use database mapping |

---

## SUCCESS CRITERIA

- [ ] Build passes with 0 errors
- [ ] All 105 routes compile
- [ ] All migrations applied
- [ ] 574 drawings synchronized
- [ ] Drawing 942-38409 shows correct PDF (page 15)
- [ ] Dashboard loads without mockup data
- [ ] GSD topology renders with real data
- [ ] AI search works with all 5 agents
- [ ] PDF viewing shows correct pages
- [ ] All API endpoints working
- [ ] Error handling proper (no silent failures)
- [ ] No console warnings/errors
- [ ] Responsive on mobile
- [ ] Tests passing

---

## NEXT STEPS

1. **Immediately**: Read PHASE 1 & implement database fixes
2. **Next**: Read PHASE 2-4 & implement critical restores
3. **Then**: Read PHASE 5-7 & implement UI fixes
4. **Finally**: Run PHASE 8 validation & push to GitHub

---

**Status**: READY FOR IMPLEMENTATION  
**Estimated Time**: 4-6 hours  
**Impact**: Complete application restoration  
**Risk**: LOW (all fixes are targeted, well-understood)  
**Rollback**: Previous commit available if needed  

This is a comprehensive reconstruction of the application from its current broken state to a fully functional production system. Every phase builds on the previous one, and success criteria are clear.

Let me know when you're ready to start the actual implementation!
