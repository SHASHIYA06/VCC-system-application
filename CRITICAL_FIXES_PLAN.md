# VCC Application - Critical Fixes Plan

## 🔴 **CRITICAL ISSUES IDENTIFIED**

### **1. Wire Trace - API Integration Issue**
**Problem:** `/wires/trace` uses `/api/search` instead of `/api/wire-trace`
**Impact:** Incomplete wire connection data, missing wire endpoints
**Fix:** Update to use correct API endpoint

### **2. COMMS System - Hardcoded Data**
**Problem:** `/systems/COMMS` shows only 14 wires from hardcoded array
**Impact:** Missing all database wire details, incomplete system view
**Fix:** Query database for all COMMS wires

### **3. System Tree - Missing Connector Data**
**Problem:** `system.children.connectors` array is always empty
**Impact:** No connector hierarchy displayed in tree
**Fix:** Populate connectors from database

### **4. Cross-Connection Detection - Hardcoded**
**Problem:** Uses hardcoded `CROSS_CONNECTED` mapping
**Impact:** Only 6 wire pairs detected, not dynamic
**Fix:** Implement database-driven detection

### **5. PDF Page Mapping - Unreliable**
**Problem:** Relies on `inferPageFromDrawingNumber()` heuristic
**Impact:** PDFs open to wrong page
**Fix:** Complete PDF page mapping database

### **6. Multi-Agent RAG - Incomplete Integration**
**Problem:** LangGraph workflows not defined, MCP not integrated
**Impact:** Limited AI capabilities
**Fix:** Complete LangGraph integration, MCP setup

---

## 🚀 **FIX IMPLEMENTATION PLAN**

### **Phase 1: Wire Trace Fix (HIGH PRIORITY)**
**Goal:** Connect wire trace to correct API endpoint

#### Tasks:
1. ✅ Create `/api/wire-trace/route.ts` if not exists
2. ✅ Update `/wires/trace/page.tsx` to use `/api/wire-trace`
3. ✅ Implement dynamic cross-connection detection
4. ✅ Add wire-to-equipment relationship tracking
5. ✅ Test with multiple wire numbers

#### Files to Modify:
- `src/app/wires/trace/page.tsx` - Update API call
- `src/app/api/wire-trace/route.ts` - Create/Update
- `src/lib/rag/multiagent.ts` - Add cross-connection agent

---

### **Phase 2: COMMS System Fix (HIGH PRIORITY)**
**Goal:** Replace hardcoded data with database query

#### Tasks:
1. ✅ Query database for all COMMS wires
2. ✅ Include voltage, color, source/dest equipment
3. ✅ Add drawing links to correct drawings
4. ✅ Implement search functionality
5. ✅ Add pagination for large wire lists

#### Files to Modify:
- `src/app/systems/COMMS/page.tsx` - Replace hardcoded data
- `src/app/api/wires/route.ts` - Add COMMS filter
- `src/app/api/search/route.ts` - Add COMMS search

---

### **Phase 3: System Tree Connector Fix (MEDIUM PRIORITY)**
**Goal:** Populate connector hierarchy in system tree

#### Tasks:
1. ✅ Query all connectors for each system
2. ✅ Include pin counts and wiring status
3. ✅ Add connector-to-drawing relationships
4. ✅ Implement expandable connector nodes
5. ✅ Add connector search functionality

#### Files to Modify:
- `src/app/api/system-tree/route.ts` - Add connectors query
- `src/app/systems/tree/page.tsx` - Display connectors
- `src/lib/rag/multiagent.ts` - Add connector search agent

---

### **Phase 4: Cross-Connection Detection (MEDIUM PRIORITY)**
**Goal:** Implement dynamic cross-connection detection

#### Tasks:
1. ✅ Analyze wire patterns in database
2. ✅ Implement signal name matching
3. ✅ Add connector-based detection
4. ✅ Create cross-connection API
5. ✅ Update wire trace to use dynamic detection

#### Files to Modify:
- `src/app/api/wire-trace/route.ts` - Add cross-connection logic
- `src/lib/rag/multiagent.ts` - Add cross-connection agent
- `src/app/wires/trace/page.tsx` - Display dynamic cross-connections

---

### **Phase 5: PDF Page Mapping (MEDIUM PRIORITY)**
**Goal:** Complete PDF page mapping database

#### Tasks:
1. ✅ Scan all PDF files
2. ✅ Extract drawing numbers from each page
3. ✅ Create complete mapping database
4. ✅ Implement auto-mapping for new PDFs
5. ✅ Add manual override capability

#### Files to Modify:
- `src/app/api/drawings/pdf-mapping/route.ts` - Complete mapping
- `src/scripts/populate-pdf-page-mappings.ts` - Run script
- `src/app/drawings/[id]/page.tsx` - Use accurate page numbers

---

### **Phase 6: Multi-Agent RAG Enhancement (LOW PRIORITY)**
**Goal:** Complete LangGraph integration, MCP setup

#### Tasks:
1. ✅ Define LangGraph workflows
2. ✅ Implement conversation memory
3. ✅ Add MCP server integration
4. ✅ Create specialized chains for:
   - Wire tracing with reasoning
   - System analysis
   - Drawing interpretation
   - Troubleshooting assistance
5. ✅ Add tool calling capabilities

#### Files to Modify:
- `src/lib/rag/langchain-tree.ts` - Complete implementation
- `src/lib/rag/multiagent.ts` - Add LangGraph workflows
- `src/app/api/rag/route.ts` - Add MCP integration
- `.kiro/settings/mcp.json` - Configure MCP servers

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Wire Trace:**
- [ ] Update API endpoint to `/api/wire-trace`
- [ ] Implement dynamic cross-connection detection
- [ ] Add wire-to-equipment tracking
- [ ] Test with multiple wire numbers
- [ ] Verify drawing navigation

### **COMMS System:**
- [ ] Query database for all COMMS wires
- [ ] Include voltage, color, source/dest
- [ ] Add drawing links
- [ ] Implement search
- [ ] Add pagination

### **System Tree:**
- [ ] Populate connector hierarchy
- [ ] Add pin counts
- [ ] Implement expandable nodes
- [ ] Add connector search

### **Cross-Connection:**
- [ ] Analyze wire patterns
- [ ] Implement signal matching
- [ ] Add connector detection
- [ ] Update wire trace

### **PDF Mapping:**
- [ ] Scan all PDFs
- [ ] Extract drawing numbers
- [ ] Create mapping database
- [ ] Auto-mapping for new PDFs

### **Multi-Agent RAG:**
- [ ] Define LangGraph workflows
- [ ] Add conversation memory
- [ ] MCP integration
- [ ] Specialized chains
- [ ] Tool calling

---

## 🎯 **SUCCESS CRITERIA**

### **Wire Trace:**
- ✅ Shows all wire connections from database
- ✅ Dynamic cross-connection detection
- ✅ Correct drawing navigation
- ✅ Wire-to-equipment relationships

### **COMMS System:**
- ✅ Shows all COMMS wires from database
- ✅ Includes voltage, color, source/dest
- ✅ Links to correct drawings
- ✅ Search functionality works

### **System Tree:**
- ✅ Shows all connectors per system
- ✅ Includes pin counts
- ✅ Expandable nodes
- ✅ Connector search works

### **Cross-Connection:**
- ✅ Detects all cross-connections dynamically
- ✅ Updates in real-time
- ✅ No hardcoded mappings

### **PDF Mapping:**
- ✅ Opens to correct page
- ✅ Search works within PDF
- ✅ Auto-mapping for new PDFs

### **Multi-Agent RAG:**
- ✅ LangGraph workflows defined
- ✅ MCP servers configured
- ✅ Conversation memory working
- ✅ Tool calling functional

---

## 📊 **ESTIMATED EFFORT**

| Task | Priority | Time |
|------|----------|------|
| Wire Trace Fix | HIGH | 2 hours |
| COMMS System Fix | HIGH | 1 hour |
| System Tree Connector | MEDIUM | 2 hours |
| Cross-Connection Detection | MEDIUM | 2 hours |
| PDF Page Mapping | MEDIUM | 3 hours |
| Multi-Agent RAG Enhancement | LOW | 4 hours |
| **Total** | | **14 hours** |

---

## 🔧 **TECHNICAL REQUIREMENTS**

### **Database Queries:**
```sql
-- COMMS wires
SELECT * FROM wires 
WHERE wireNo LIKE 'COMMS%' 
OR signalName LIKE '%communication%'
OR description LIKE '%communication%';

-- System connectors
SELECT c.*, COUNT(p.id) as pinCount
FROM connectors c
LEFT JOIN connector_pins p ON c.id = p.connectorId
WHERE c.drawingId IN (
  SELECT id FROM drawings WHERE systemId = ?
)
GROUP BY c.id;

-- Cross-connections
SELECT w1.wireNo as wire1, w2.wireNo as wire2
FROM wire_endpoints we1
JOIN wire_endpoints we2 ON we1.pinId = we2.pinId
JOIN wires w1 ON we1.wireId = w1.id
JOIN wires w2 ON we2.wireId = w2.id
WHERE w1.wireNo < w2.wireNo;
```

### **API Endpoints:**
- `GET /api/wire-trace?wire={wireNo}` - Wire trace data
- `GET /api/wires?system=COMMS` - COMMS wires
- `GET /api/system-tree` - System hierarchy
- `POST /api/rag` - Multi-agent search

### **Dependencies:**
- `@langchain/langgraph` - LangGraph workflows
- `@langchain/core` - LangChain core
- `langchain` - LangChain integration
- `mongodb` - Vector storage (optional)

---

## 📝 **NOTES**

### **Known Limitations:**
1. PDF OCR requires external service (Tesseract, AWS Textract)
2. Cross-connection detection may have false positives
3. LangGraph workflows require significant setup
4. MCP integration needs server configuration

### **Risks:**
1. Large wire lists may impact performance
2. Complex queries may timeout
3. PDF scanning may be slow
4. LangGraph setup may be complex

### **Mitigations:**
1. Implement pagination for large lists
2. Add query timeouts
3. Cache PDF mappings
4. Use LangChain simpler chains first

---

**Status**: Ready to implement
**Priority**: High
**Timeline**: 2-3 days
**Resources**: 1 senior developer

