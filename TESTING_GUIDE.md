# VCC Application - Testing Guide
## New Features Testing Instructions

## 🧪 FEATURE 1: Wire Variants

### What to Test
Wire search now supports alphabetic and numeric variants

### Test Cases

#### Test 1: Alphabetic Variants
```bash
# Search for base wire
curl "http://localhost:3000/api/wires/3001"

# Search for alphabetic variants
curl "http://localhost:3000/api/wires/3001a"
curl "http://localhost:3000/api/wires/3001b"
curl "http://localhost:3000/api/wires/3001c"
curl "http://localhost:3000/api/wires/3001d"
```

#### Test 2: Numeric Variants
```bash
# Search for numeric variants
curl "http://localhost:3000/api/wires/3001/1"
curl "http://localhost:3000/api/wires/3001/2"
curl "http://localhost:3000/api/wires/3001/3"
```

#### Test 3: Prefixed Variants
```bash
# Search for wires with letter prefixes
curl "http://localhost:3000/api/wires/Y4181"
curl "http://localhost:3000/api/wires/Y4181a"
```

### Expected Results
- Each variant should return wire details
- Response should include `wireNo`, `signalName`, `description`
- Should show `relatedDrawings` array with all drawings

---

## 🧪 FEATURE 2: Multiple Drawings per Wire

### What to Test
Wire API now returns ALL drawings containing the wire

### Test Cases

#### Test 1: Wire in Multiple Drawings
```bash
# Search for a common wire
curl "http://localhost:3000/api/wires/3001"
```

### Expected Results
```json
{
  "wire": {
    "wireNo": "3001",
    "signalName": "...",
    ...
  },
  "relatedDrawings": [
    {
      "id": "...",
      "drawingNo": "942-58120",
      "title": "...",
      "systemCode": "CAB",
      "type": "Wire Connection",
      "pageNo": 5,
      "sheetNo": 1
    },
    {
      "id": "...",
      "drawingNo": "942-58121",
      "title": "...",
      "systemCode": "TRL",
      "type": "Wire Connection",
      "pageNo": 12,
      "sheetNo": 2
    }
  ],
  "metadata": {
    "drawingCount": 2
  }
}
```

- `relatedDrawings` should have multiple entries
- Each drawing should have `pageNo` and `sheetNo`
- `metadata.drawingCount` should match array length

---

## 🧪 FEATURE 3: PDF Page Extraction

### What to Test
Extract specific pages from PDF files

### Test Cases

#### Test 1: Get PDF Info
```bash
curl "http://localhost:3000/api/pdf/extract-page?source_file=VCC_OCR.pdf&action=info"
```

Expected: JSON with page count and page dimensions

#### Test 2: Extract Single Page
```bash
# Extract page 42
curl "http://localhost:3000/api/pdf/extract-page?source_file=VCC_OCR.pdf&page_no=42" \
  --output page-42.pdf
```

Expected: PDF file with just page 42

#### Test 3: Extract Multiple Pages (POST)
```bash
curl -X POST "http://localhost:3000/api/pdf/extract-page" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceFile": "VCC_OCR.pdf",
    "pageNumbers": [1, 5, 10, 15]
  }'
```

Expected: JSON with paths to extracted pages

### Browser Test
Open in browser:
```
http://localhost:3000/api/pdf/extract-page?source_file=VCC_OCR.pdf&page_no=1
```

Expected: PDF displays in browser

---

## 🧪 FEATURE 4: OCR Search

### What to Test
Full-text search across all drawing pages

### Test Cases

#### Test 1: Simple Search
```bash
curl "http://localhost:3000/api/ocr/search?q=connector&limit=10"
```

Expected Results:
```json
{
  "query": "connector",
  "totalResults": 45,
  "totalMatches": 127,
  "results": [
    {
      "drawingNo": "942-58120",
      "drawingTitle": "...",
      "pageNo": 5,
      "occurrences": [
        {
          "index": 234,
          "context": "...the connector X1 is located...",
          "highlight": "connector"
        }
      ],
      "matchCount": 3
    }
  ]
}
```

#### Test 2: Search with Drawing Filter
```bash
curl "http://localhost:3000/api/ocr/search?q=pin&drawing_no=942-58120"
```

Expected: Results only from drawing 942-58120

#### Test 3: Advanced Search (POST)
```bash
curl -X POST "http://localhost:3000/api/ocr/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "voltage",
    "systemCodes": ["TRL", "APS"],
    "limit": 20
  }'
```

Expected: Results filtered by system codes

---

## 🧪 FEATURE 5: Multi-Agent RAG

### What to Test
AI-powered search with multiple specialized agents

### Test Cases

#### Test 1: Single Agent Query
```bash
curl -X POST "http://localhost:3000/api/rag" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Explain wire 3001",
    "taskType": "wire",
    "model": "openrouter-claude"
  }'
```

Expected: AI response about wire 3001

#### Test 2: Multi-Agent Query
```bash
curl -X POST "http://localhost:3000/api/rag" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How does the door system work?",
    "taskType": "unified_search",
    "useMultiAgent": true
  }'
```

Expected Results:
```json
{
  "query": "How does the door system work?",
  "primaryResponse": {
    "agent": "system_expert",
    "content": "The door system...",
    "confidence": 0.85
  },
  "allResponses": {
    "drawing_expert": "...",
    "wire_expert": "...",
    "system_expert": "...",
    "diagnostic_expert": "..."
  },
  "unifiedResponse": "Synthesized response from all agents...",
  "sources": [...],
  "executionTime": 3500
}
```

#### Test 3: Different Models
```bash
# Test with Deepseek
curl -X POST "http://localhost:3000/api/rag" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is connector X1?",
    "model": "deepseek-flash"
  }'

# Test with OpenAI
curl -X POST "http://localhost:3000/api/rag" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is connector X1?",
    "model": "openai-gpt"
  }'
```

---

## 🧪 INTEGRATION TESTS

### Test 1: Complete Wire Workflow
```bash
# 1. Search for wire variant
curl "http://localhost:3000/api/wires/3001a"

# 2. Get one of the related drawings
DRAWING_ID="..." # from step 1 response

# 3. Search OCR for that wire in that drawing
curl "http://localhost:3000/api/ocr/search?q=3001a&drawing_no=942-58120"

# 4. Ask AI about the wire
curl -X POST "http://localhost:3000/api/rag" \
  -H "Content-Type: application/json" \
  -d '{"query": "Explain wire 3001a", "useMultiAgent": true}'
```

### Test 2: Drawing Exploration
```bash
# 1. Search for drawing in OCR
curl "http://localhost:3000/api/ocr/search?q=942-58120"

# 2. Extract the drawing page
curl "http://localhost:3000/api/pdf/extract-page?source_file=VCC_OCR.pdf&page_no=42" \
  --output drawing.pdf

# 3. Ask AI about the drawing
curl -X POST "http://localhost:3000/api/rag" \
  -H "Content-Type: application/json" \
  -d '{"query": "What is in drawing 942-58120?", "taskType": "drawing"}'
```

---

## 🧪 DASHBOARD TESTS

### Test in Browser

#### Test 1: Wire Search
1. Open `http://localhost:3000/dashboard`
2. In "Quick Drawing Lookup", enter: `3001a`
3. Click "Find Drawing"
4. Verify: Shows wire details with multiple drawings

#### Test 2: AI Search
1. Open `http://localhost:3000/dashboard`
2. Switch to "Diagnostics & AI" tab
3. Enter query: "How does the brake system work?"
4. Click search
5. Verify: Shows AI response with sources

#### Test 3: PDF Viewing
1. Open `http://localhost:3000/dashboard`
2. Search for drawing: `942-58120`
3. Click "View PDF"
4. Verify: PDF opens to correct page

---

## 🧪 DATABASE VERIFICATION

### Check Wire Variants
```sql
-- Connect to Neon PostgreSQL
-- Count base wires
SELECT COUNT(*) FROM "Wire" WHERE "wireNo" NOT LIKE '%a' AND "wireNo" NOT LIKE '%/%';

-- Count variants
SELECT COUNT(*) FROM "Wire" WHERE "wireNo" LIKE '%a' OR "wireNo" LIKE '%/%';

-- Sample variants
SELECT "wireNo", "signalName" FROM "Wire" 
WHERE "wireNo" LIKE '3001%' 
ORDER BY "wireNo" 
LIMIT 10;
```

Expected:
- Base wires: ~20,992
- Variants: ~126,944
- Total: ~147,936

### Check Drawing-Wire Relationships
```sql
-- Count relationships
SELECT COUNT(*) FROM "DrawingWire";

-- Top wires by drawing count
SELECT w."wireNo", COUNT(dw."drawingId") as drawing_count
FROM "Wire" w
JOIN "DrawingWire" dw ON w."id" = dw."wireId"
GROUP BY w."wireNo"
ORDER BY drawing_count DESC
LIMIT 10;
```

Expected:
- Relationships: 1,000+
- Common wires should appear in 5-10+ drawings

---

## 🧪 PERFORMANCE TESTS

### Test 1: Wire Search Speed
```bash
time curl "http://localhost:3000/api/wires/3001"
```
Expected: < 500ms

### Test 2: OCR Search Speed
```bash
time curl "http://localhost:3000/api/ocr/search?q=connector&limit=50"
```
Expected: < 500ms

### Test 3: PDF Extraction Speed
```bash
time curl "http://localhost:3000/api/pdf/extract-page?source_file=VCC_OCR.pdf&page_no=42" \
  --output /dev/null
```
Expected: < 2 seconds

### Test 4: AI Query Speed
```bash
time curl -X POST "http://localhost:3000/api/rag" \
  -H "Content-Type: application/json" \
  -d '{"query": "What is wire 3001?"}'
```
Expected: 2-5 seconds

---

## 🧪 ERROR HANDLING TESTS

### Test 1: Invalid Wire Number
```bash
curl "http://localhost:3000/api/wires/INVALID999"
```
Expected: 404 with error message

### Test 2: Invalid PDF Page
```bash
curl "http://localhost:3000/api/pdf/extract-page?source_file=VCC_OCR.pdf&page_no=99999"
```
Expected: 400 with error message

### Test 3: Empty OCR Search
```bash
curl "http://localhost:3000/api/ocr/search?q="
```
Expected: 400 with error message

### Test 4: Invalid AI Model
```bash
curl -X POST "http://localhost:3000/api/rag" \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "model": "invalid-model"}'
```
Expected: 500 with error message (should fallback)

---

## 📊 SUCCESS CRITERIA

### Wire Variants
- ✅ Base wires searchable
- ✅ Alphabetic variants (a,b,c,d) searchable
- ✅ Numeric variants (/1,/2,/3) searchable
- ✅ Prefixed variants (Y4181a) searchable

### Multiple Drawings
- ✅ Wire API returns array of drawings
- ✅ Each drawing has page/sheet numbers
- ✅ Drawing count matches array length

### PDF Extraction
- ✅ Can get PDF info
- ✅ Can extract single page
- ✅ Can extract multiple pages
- ✅ PDF displays in browser

### OCR Search
- ✅ Returns matches with context
- ✅ Supports filtering
- ✅ Shows occurrence count
- ✅ Fast response time

### Multi-Agent RAG
- ✅ Single agent queries work
- ✅ Multi-agent queries work
- ✅ Different models work
- ✅ Returns synthesized response

---

## 🐛 KNOWN ISSUES

1. **Wire Variants Script**: Still running, may not be complete
2. **Drawing-Wire Sync**: Still running, relationships growing
3. **PDF Viewer UI**: Not yet created (API works)
4. **Connector Pins**: May show 0 (needs sync)

---

## 📝 TESTING CHECKLIST

### Before Testing
- [ ] Ensure dev server is running: `npm run dev`
- [ ] Check database connection
- [ ] Verify API keys in .env.local
- [ ] Wait for background scripts to complete

### Core Features
- [ ] Wire variants search
- [ ] Multiple drawings per wire
- [ ] PDF page extraction
- [ ] OCR search
- [ ] Multi-agent RAG

### Integration
- [ ] Complete wire workflow
- [ ] Drawing exploration
- [ ] Dashboard features

### Performance
- [ ] Wire search < 500ms
- [ ] OCR search < 500ms
- [ ] PDF extraction < 2s
- [ ] AI query 2-5s

### Error Handling
- [ ] Invalid inputs handled
- [ ] Proper error messages
- [ ] Fallback mechanisms work

---

**Last Updated**: May 28, 2026
**Status**: Ready for Testing
**Next**: Create PDF viewer UI component

