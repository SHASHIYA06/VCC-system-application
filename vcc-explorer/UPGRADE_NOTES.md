# VCC Application - Critical Fixes and Upgrades

## Overview
This document describes the critical fixes implemented to resolve the application issues.

## Issues Fixed

### 1. Wire Search - Multi-Drawing Support ✅
**Problem**: Wire search only returned one drawing even when the wire appeared in multiple drawings.

**Solution**: 
- Created `/api/wire-trace` endpoint that traces wires across ALL drawings
- Updated `/api/drawings` to support `wire_no` parameter that returns ALL related drawings
- Implemented proper wire-to-drawing relationship tracking

**Usage**:
```
GET /api/wire-trace?wire_no=3003
GET /api/drawings?wire_no=3003
```

### 2. Connector Pin Counts ✅
**Problem**: Connector pin counts were showing 0 or incorrect values.

**Solution**:
- Updated `/api/connectors` to properly count and include pins
- Added pin details with wire connections
- Included wireEndpoints for complete pin-to-wire mapping

**Usage**:
```
GET /api/connectors?drawing_id={id}
GET /api/connectors?wire_no=3003
```

### 3. Pin Details Display ✅
**Problem**: Pin details were not showing correctly.

**Solution**:
- Updated `/api/pins` to include all pin attributes
- Added voltageText, terminalFrom, terminalTo, sourceSheetRef, note
- Properly linked pins to connectors and drawings

**Usage**:
```
GET /api/pins?connector_code=J1
GET /api/pins?search=3003
```

### 4. PDF Document Serving ✅
**Problem**: PDF documents were not properly connected to drawings.

**Solution**:
- Created `/api/documents/serve` endpoint with proper PDF mapping
- Maps drawing numbers to actual PDF filenames
- Supports direct PDF serving with proper headers

**Usage**:
```
GET /api/documents/serve?drawing_no=942-38104
GET /api/documents/serve?drawing_id={id}
```

### 5. Multi-Model RAG System ✅
**Problem**: No RAG system for intelligent search.

**Solution**:
- Implemented multi-agent RAG system with:
  - Coordinator Agent
  - Retriever Agent
  - Analyzer Agent
  - Synthesizer Agent
- Supports multiple AI providers (OpenAI, Anthropic, Deepseek, NVIDIA, Gemini)
- Vector search with MongoDB Atlas

**Usage**:
```
POST /api/ai-assistant
{
  "query": "Explain wire 3003",
  "mode": "expert"
}
```

## New API Endpoints

### Wire Trace API
```
GET /api/wire-trace?wire_no={wire_number}
```
Returns:
- Wire details
- Summary (total drawings, endpoints, trainlines, pins)
- All drawings containing the wire
- Trainlines using the wire
- Connector pins using the wire

### Documents Serve API
```
GET /api/documents/serve?drawing_no={drawing_number}
GET /api/documents/serve?drawing_id={id}
```
Returns:
- PDF file with proper headers
- Drawing metadata

### Drawings API (Enhanced)
```
GET /api/drawings?wire_no={wire_number}
```
Returns:
- All drawings containing the specified wire
- Grouped by system
- Pagination support

### Connectors API (Enhanced)
```
GET /api/connectors?wire_no={wire_number}
```
Returns:
- Connectors with complete pin details
- Wire connections for each pin
- Proper pin counts

### Pins API (Enhanced)
```
GET /api/pins?connector_code={code}
GET /api/pins?search={wire_number}
```
Returns:
- Complete pin details
- Voltage, terminal info
- Source sheet references

## Database Schema Updates

### Key Relationships
1. **Wire → WireEndpoint → Connector/Pin/Device**
2. **TrainLine → Drawing**
3. **ConnectorPin → WireEndpoint**
4. **Drawing → System**

### New Views
- `vw_wire_trace` - Complete wire path with all endpoints
- `vw_connector_pin_complete` - Full pin details with wire/device/drawing
- `vw_drawing_summary` - Drawing counts and statistics

## Running the Seed Script

```bash
# Generate Prisma client
npm run db:generate

# Run the complete seed
npx tsx scripts/seed-complete-v2.ts

# Verify the data
npm run db:studio
```

## Testing the Fixes

### Test Wire Search
```bash
# Should return ALL drawings containing wire 3003
curl "http://localhost:3000/api/wire-trace?wire_no=3003"
curl "http://localhost:3000/api/drawings?wire_no=3003"
```

### Test Connector Pins
```bash
# Should show complete pin details
curl "http://localhost:3000/api/connectors?drawing_id={id}"
curl "http://localhost:3000/api/pins?connector_code=J1"
```

### Test PDF Serving
```bash
# Should serve the PDF file
curl "http://localhost:3000/api/documents/serve?drawing_no=942-38104" -o drawing.pdf
```

### Test AI Assistant
```bash
curl -X POST http://localhost:3000/api/ai-assistant \
  -H "Content-Type: application/json" \
  -d '{"query": "Explain wire 3003", "mode": "expert"}'
```

## Configuration

### Environment Variables
Ensure these are set in `.env.local`:

```bash
# MongoDB for RAG
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vcc_documents
MONGODB_DB=vcc_documents

# AI Providers (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
DEEPSEEK_API_KEY=sk-...
NVIDIA_API_KEY=nvapi-...
GEMINI_API_KEY=AIza...
```

### MCP Configuration
Create `.mcp.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "playwright": {
      "type": "local",
      "command": ["npx", "@playwright/mcp@latest"],
      "enabled": true
    }
  }
}
```

## Next Steps

1. **Run the seed script** to populate the database with proper relationships
2. **Configure AI API keys** for RAG functionality
3. **Test all endpoints** to verify fixes
4. **Update frontend** to use new API endpoints
5. **Deploy to production** after testing

## Files Created/Modified

### New Files
- `src/app/api/wire-trace/route.ts` - Wire tracing API
- `src/app/api/documents/serve/route.ts` - PDF serving API
- `src/lib/rag.ts` - RAG service
- `scripts/seed-complete-v2.ts` - Complete seed script

### Modified Files
- `src/app/api/drawings/route.ts` - Added wire_no filtering
- `src/app/api/connectors/route.ts` - Fixed pin counts
- `src/app/api/pins/route.ts` - Added complete pin details
- `src/app/api/ai-assistant/route.ts` - Multi-agent RAG integration

## Support

For issues or questions:
1. Check the logs: `npm run dev`
2. Verify database: `npm run db:studio`
3. Test API endpoints directly
4. Review this document for troubleshooting

---
*Last Updated: 2026-05-20*
*Version: 2.0.0*
