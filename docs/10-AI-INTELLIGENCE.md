# AI INTELLIGENCE SYSTEM
## Multi-Agent RAG Architecture

**Version**: 4.0 | **Date**: July 17, 2026

---

## 1. Architecture

```
User Question
    ↓
Router Agent (Classifies intent)
    ├── if wire/connector/pin → Wiring Agent
    ├── if drawing question → Drawing Agent
    ├── if system/VCC → VCC Agent
    ├── if fault/diagnostic → Diagnostic Agent
    └── if general → General Agent
    ↓
Synthesizer (Combines responses)
    ↓
Response with:
  - Engineering evidence
  - Drawing references
  - Connector references
  - Pin references
  - Wire references
  - Confidence score (0-100%)
  - Validation status
```

## 2. AI Models

| Model | Provider | Purpose | Fallback |
|-------|----------|---------|----------|
| Claude 3.5 Sonnet | Anthropic | Primary reasoning | ✅ |
| GPT-4 | OpenAI | Secondary reasoning | ✅ |
| Gemini Flash | Google | Fast responses | ✅ |
| MiniMax M2.5 | OpenCode | Free tier fallback | ✅ |

## 3. Agent Types

| Agent | Specialization | Data Sources |
|-------|---------------|--------------|
| Wiring Agent | Wire tracing, connections | Wire, WireEndpoint, Connector, Pin |
| Drawing Agent | Drawing search, page mapping | Drawing, DrawingPage, DrawingPageMapping |
| VCC Agent | System knowledge, procedures | VCCDescription, System, Device |
| Diagnostic Agent | Fault diagnosis, repair | Troubleshooting, TrainLine, Drawing |
| General Agent | Mixed queries | DocumentChunk, all tables |

## 4. Response Format

```json
{
  "answer": "Wire 3001 connects X1 pin 17 to CN1 pin 12...",
  "sources": [
    { "type": "drawing", "reference": "942-58103" },
    { "type": "connector", "reference": "X1" },
    { "type": "wire", "reference": "3001" }
  ],
  "confidence": 0.92,
  "validationStatus": "VERIFIED"
}
```

## 5. API Endpoint

```
POST /api/rag
  Body: { query: "What is wire 3001?", taskType: "unified_search" }
  Response: { success, unifiedResponse, allData, executionTime }
```

## 6. Integration Points

- Dashboard AI search box
- Troubleshooting guided search
- VCC Reference contextual help
- Drawing viewer annotations
- Wire trace explanations
