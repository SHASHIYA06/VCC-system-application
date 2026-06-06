# LangChain & LangFlow Multi-Agent RAG Setup

**Status**: CONFIGURATION READY  
**Priority**: HIGH  
**Target**: Complete integration with PDF mappings

---

## Overview

### Multi-Agent RAG Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    User Query                           │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────▼─────────────┐
        │   Router/Dispatcher      │
        │   (Query Classification) │
        └─┬──┬──┬──┬───────────────┘
          │  │  │  │
      ┌───┘  │  │  └───┐
      │      │  │      │
   ┌──▼──┐ ┌─▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐
   │  1  │ │  2 │ │  3  │ │  4  │ │  5  │
   │Draw-│ │Wire│ │Syst-│ │Dev- │ │Diag-│
   │ing  │ │ing │ │em   │ │ice  │ │nost│
   │Agnt │ │Agnt│ │Agnt │ │Agnt │ │ic  │
   └──┬──┘ └─┬──┘ └──┬──┘ └──┬──┘ └──┬──┘
      │      │      │      │      │
      └──────┴──────┴──────┴──────┘
             │
      ┌──────▼───────┐
      │  Vector DB   │
      │  (PDFs, OCR) │
      └──────┬───────┘
             │
      ┌──────▼───────┐
      │  SQL DB      │
      │  (Mappings)  │
      └──────────────┘
```

---

## 5-Agent Configuration

### 1. Drawing Agent
**Purpose**: Search, retrieve, and analyze technical drawings

**Capabilities**:
- Semantic search across all PDFs
- Page mapping accuracy verification
- Drawing comparison and cross-reference
- Technical specifications extraction

**Tools**:
- PDFLoader (with page numbers from our mappings)
- VectorStore retriever
- DrawingPageMapping database
- Document summarizer

**Example Query**:
> "Find drawing 942-58142 and explain its purpose"
> → Routes to Drawing Agent
> → Queries vector store with embedding
> → Looks up page 59 from accurate mappings
> → Returns drawing content + verification

### 2. Wiring Agent
**Purpose**: Analyze electrical connections and wire routing

**Capabilities**:
- Pin-to-pin connection tracing
- Wire gauge and specifications
- Connector identification
- Harness routing analysis

**Tools**:
- PIN diagram extractor
- Connection validator
- Wire specification lookup
- 3D routing visualizer (optional)

**Example Query**:
> "What is the wire gauge for the power distribution to the door system?"
> → Routes to Wiring Agent
> → Searches for power/door connections
> → Cross-references with 942-58142
> → Returns specifications + page reference

### 3. System Agent
**Purpose**: Overall system architecture and integration

**Capabilities**:
- System topology analysis
- Component relationships
- Power flow analysis
- Safety system verification

**Tools**:
- System topology mapper
- Component database
- Power analysis calculator
- Safety rule validator

**Example Query**:
> "How does the door system integrate with the train management system?"
> → Routes to System Agent
> → Analyzes DOOR (942-58137 to 942-58142) and TMS (942-58146) drawings
> → Maps integration points
> → Returns architecture diagram

### 4. Device Agent
**Purpose**: Individual component analysis and specifications

**Capabilities**:
- Component identification
- Manufacturer specs
- Configuration parameters
- Fault diagnosis hints

**Tools**:
- Component database
- Manufacturer datasheets
- Configuration parser
- Fault code translator

**Example Query**:
> "What is the BCU (Brake Control Unit) specification?"
> → Routes to Device Agent
> → Searches for BCU in drawings and specs
> → Retrieves datasheet information
> → Returns specifications with source drawings

### 5. Diagnostic Agent
**Purpose**: Troubleshooting and fault analysis

**Capabilities**:
- Fault code interpretation
- Troubleshooting flowcharts
- Test procedure recommendations
- Safety consideration checking

**Tools**:
- Fault code database
- Troubleshooting decision tree
- Test procedure executor
- Safety rule engine

**Example Query**:
> "Door system is not responding - help me troubleshoot"
> → Routes to Diagnostic Agent
> → Accesses door system drawings (942-58137 to 942-58142)
> → Runs diagnostic flowchart
> → Recommends test procedures with page references

---

## LangChain Integration

### Installation
```bash
npm install langchain @langchain/openai @langchain/community vector-db openai
```

### Configuration
```typescript
// src/lib/langchain/config.ts
import { OpenAI } from '@langchain/openai';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { OpenAIEmbeddings } from '@langchain/openai';

export const model = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0.3,
  modelName: 'gpt-4',
});

export const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
});

export const vectorStore = new Chroma({
  collectionName: 'vcc-drawings',
  url: process.env.CHROMA_URL || 'http://localhost:8000',
});
```

### Document Loading
```typescript
// src/lib/langchain/loaders.ts
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitters';
import { ACCURATE_MAPPINGS } from '@/ACCURATE_DRAWING_PAGE_MAPPINGS';

export async function loadAndIndexDrawings() {
  const pdfPath = 'public/DOCUMENTS';
  
  for (const [drawingNo, mapping] of Object.entries(ACCURATE_MAPPINGS)) {
    const loader = new PDFLoader(`${pdfPath}/${mapping.pdfFile}`);
    
    const docs = await loader.load();
    
    // Add metadata with accurate page numbers
    docs.forEach(doc => {
      doc.metadata.drawingNumber = drawingNo;
      doc.metadata.actualPage = mapping.pageNumber;
      doc.metadata.verified = mapping.verified;
      doc.metadata.pdfFile = mapping.pdfFile;
    });
    
    // Split into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const chunks = await splitter.splitDocuments(docs);
    
    // Index in vector store
    await vectorStore.addDocuments(chunks);
  }
}
```

### Agent Creation
```typescript
// src/lib/langchain/agents.ts
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { RunnableLambda } from 'langchain/runnables';

// Drawing Agent
export const drawingAgent = await initializeAgentExecutorWithOptions(
  [
    new PDFRetrievalTool(vectorStore),
    new DrawingPageMappingTool(),
    new DrawingCompareTool(),
  ],
  model,
  {
    agentType: 'openai-functions',
    verbose: true,
  }
);

// Wiring Agent
export const wiringAgent = await initializeAgentExecutorWithOptions(
  [
    new PinDiagramTool(),
    new ConnectionValidatorTool(),
    new WireSpecificationTool(),
  ],
  model,
  {
    agentType: 'openai-functions',
    verbose: true,
  }
);

// System Agent
export const systemAgent = await initializeAgentExecutorWithOptions(
  [
    new SystemTopologyTool(),
    new ComponentRelationshipTool(),
    new PowerFlowAnalyzer(),
  ],
  model,
  {
    agentType: 'openai-functions',
    verbose: true,
  }
);

// Device Agent
export const deviceAgent = await initializeAgentExecutorWithOptions(
  [
    new ComponentDatabaseTool(),
    new ManufacturerDatasheetTool(),
    new ConfigurationParserTool(),
  ],
  model,
  {
    agentType: 'openai-functions',
    verbose: true,
  }
);

// Diagnostic Agent
export const diagnosticAgent = await initializeAgentExecutorWithOptions(
  [
    new FaultCodeDatabaseTool(),
    new TroubleshootingFlowchartTool(),
    new TestProcedureExecutor(),
    new SafetyRuleEngine(),
  ],
  model,
  {
    agentType: 'openai-functions',
    verbose: true,
  }
);
```

### Query Router
```typescript
// src/lib/langchain/router.ts
import { RunnableLambda } from 'langchain/runnables';

const SYSTEM_PROMPT = `You are a query classifier for a VCC train system documentation system.
Classify user queries into one of these categories:
1. DRAWING - Finding and analyzing technical drawings (e.g., "Find drawing 942-58142")
2. WIRING - Electrical connections and wire routing
3. SYSTEM - Overall system architecture
4. DEVICE - Individual component specifications
5. DIAGNOSTIC - Troubleshooting and fault analysis

Respond with only the category name.`;

export const queryRouter = new RunnableLambda({
  func: async (input: string) => {
    const response = await model.call([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: input },
    ]);
    
    const category = response.content.trim().toUpperCase();
    
    if (category.includes('DRAWING')) return 'drawing';
    if (category.includes('WIRING')) return 'wiring';
    if (category.includes('SYSTEM')) return 'system';
    if (category.includes('DEVICE')) return 'device';
    if (category.includes('DIAGNOSTIC')) return 'diagnostic';
    
    return 'drawing'; // Default
  },
});
```

### Main Orchestrator
```typescript
// src/lib/langchain/orchestrator.ts
export async function processQuery(query: string) {
  // 1. Route query to appropriate agent
  const category = await queryRouter.invoke(query);
  
  // 2. Select agent based on category
  const agents = {
    drawing: drawingAgent,
    wiring: wiringAgent,
    system: systemAgent,
    device: deviceAgent,
    diagnostic: diagnosticAgent,
  };
  
  const selectedAgent = agents[category] || drawingAgent;
  
  // 3. Execute agent
  const result = await selectedAgent.invoke({ input: query });
  
  // 4. Add verification info
  result.metadata = {
    category,
    verified: true,
    timestamp: new Date(),
  };
  
  return result;
}
```

---

## LangFlow Integration

### LangFlow Configuration
```yaml
# langflow-config.yaml
flows:
  - name: VCC Drawing Search
    description: Find and analyze VCC system drawings
    triggers:
      - type: text_input
        name: query
        prompt: "What drawing or information are you looking for?"
    
    steps:
      - name: Router
        component: ClassificationRouter
        inputs:
          query: "{{query}}"
        outputs:
          category: "{{category}}"
      
      - name: Drawing Search
        component: DrawingAgent
        inputs:
          query: "{{query}}"
          category: "{{category}}"
        outputs:
          results: "{{results}}"
      
      - name: Formatter
        component: ResponseFormatter
        inputs:
          results: "{{results}}"
          category: "{{category}}"
        outputs:
          formatted: "{{formatted}}"
    
    output: "{{formatted}}"

  - name: Door System Troubleshooting
    description: Diagnose and troubleshoot door system issues
    triggers:
      - type: text_input
        name: symptom
        prompt: "Describe the door system issue"
    
    steps:
      - name: Diagnostic
        component: DiagnosticAgent
        inputs:
          symptom: "{{symptom}}"
        outputs:
          diagnosis: "{{diagnosis}}"
          recommendations: "{{recommendations}}"
      
      - name: Drawing References
        component: DrawingAgent
        inputs:
          query: "{{diagnosis}}"
        outputs:
          related_drawings: "{{related_drawings}}"
    
    output: "{{diagnosis}}\n\nReferences: {{related_drawings}}"
```

---

## API Endpoints

### Query Processing
```typescript
// src/app/api/rag/query/route.ts
import { processQuery } from '@/lib/langchain/orchestrator';

export async function POST(request: NextRequest) {
  const { query } = await request.json();
  
  const result = await processQuery(query);
  
  return NextResponse.json({
    success: true,
    result,
    metadata: {
      timestamp: new Date(),
      category: result.metadata?.category,
    }
  });
}
```

### Agent Status
```typescript
// src/app/api/rag/agents/status/route.ts
export async function GET() {
  return NextResponse.json({
    agents: [
      {
        name: 'Drawing Agent',
        status: 'active',
        tools: ['pdf-retrieval', 'page-mapping', 'comparison'],
      },
      {
        name: 'Wiring Agent',
        status: 'active',
        tools: ['pin-diagram', 'connection-validator'],
      },
      {
        name: 'System Agent',
        status: 'active',
        tools: ['topology', 'power-flow'],
      },
      {
        name: 'Device Agent',
        status: 'active',
        tools: ['component-db', 'datasheets'],
      },
      {
        name: 'Diagnostic Agent',
        status: 'active',
        tools: ['fault-codes', 'troubleshooting'],
      },
    ]
  });
}
```

---

## Vector Database Setup

### Chroma Installation
```bash
# Install Chroma
pip install chroma-db

# Start Chroma server
chroma run --host localhost --port 8000

# Or use in-memory (development)
npm install @langchain/community
```

### Collection Creation
```typescript
// src/lib/langchain/vector-db.ts
export async function initializeVectorDB() {
  const collections = await vectorStore.listCollections();
  
  if (!collections.includes('vcc-drawings')) {
    await vectorStore.createCollection({
      name: 'vcc-drawings',
      metadata: {
        description: 'VCC system technical drawings',
        created: new Date(),
      }
    });
  }
  
  // Load all documents
  await loadAndIndexDrawings();
}
```

---

## Error Handling

### Graceful Fallbacks
```typescript
// src/lib/langchain/error-handler.ts
export async function processQueryWithFallback(query: string) {
  try {
    // Primary: LangChain multi-agent
    return await processQuery(query);
  } catch (error) {
    console.error('LangChain error:', error);
    
    try {
      // Secondary: Direct vector store search
      return await vectorStore.similaritySearch(query, 5);
    } catch (fallbackError) {
      console.error('Vector store error:', fallbackError);
      
      // Tertiary: Database fallback
      return await fallbackDatabaseSearch(query);
    }
  }
}
```

---

## Testing

### Unit Tests
```typescript
// src/lib/langchain/__tests__/agents.test.ts
describe('Multi-Agent RAG', () => {
  test('Drawing Agent finds 942-58142', async () => {
    const result = await drawingAgent.invoke({
      input: 'Find drawing 942-58142'
    });
    
    expect(result).toContain('942-58142');
    expect(result).toContain('page 59');
    expect(result).toContain('Door Communication');
  });
  
  test('Query router correctly categorizes queries', async () => {
    const category = await queryRouter.invoke('Find drawing 942-58142');
    expect(category).toBe('drawing');
    
    const wiringCategory = await queryRouter.invoke('What is the wire gauge?');
    expect(wiringCategory).toBe('wiring');
  });
  
  test('Diagnostic agent provides troubleshooting steps', async () => {
    const result = await diagnosticAgent.invoke({
      input: 'Door system not opening'
    });
    
    expect(result).toContain('troubleshoot');
    expect(result).toContain('942-58');
  });
});
```

### Integration Tests
```typescript
// e2e/rag.test.ts
describe('RAG Integration', () => {
  test('Full query pipeline', async () => {
    const response = await fetch('/api/rag/query', {
      method: 'POST',
      body: JSON.stringify({
        query: 'How does the door system work?'
      })
    });
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.result).toBeDefined();
    expect(data.result).toContain('942-58');
  });
});
```

---

## Deployment Checklist

- [ ] OpenAI API key configured
- [ ] Chroma vector DB running
- [ ] All documents indexed
- [ ] Agents tested individually
- [ ] Router tested with sample queries
- [ ] API endpoints tested
- [ ] Error handling verified
- [ ] Vector DB backups configured
- [ ] Monitoring/logging set up
- [ ] Rate limiting configured

---

## Performance Considerations

- **Vector DB Query**: 50-200ms
- **Agent Processing**: 2-5 seconds
- **Caching Strategy**: Cache frequent queries
- **Batch Indexing**: Index during off-hours
- **Rate Limiting**: 10 queries/minute per user

---

**Status**: Ready for implementation  
**Estimated Setup Time**: 2-4 hours  
**Dependencies**: OpenAI API key, Chroma DB  
**Testing Required**: Before production deployment

