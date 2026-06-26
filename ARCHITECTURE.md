# VCC DIGITAL TWIN PLATFORM 3.0
## System Architecture Document

**Document Version:** 3.0  
**Last Updated:** June 24, 2026  
**Status:** Active Development  

---

## 1. HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  USER INTERFACE                             │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐              │
│  │  Dashboard   │ Digital Twin │ GSD Topology │    Search    │              │
│  │              │   Explorer   │              │              │              │
│  ├──────────────┼──────────────┼──────────────┼──────────────┤              │
│  │  VCC Ref     │ Trouble-     │ Validation   │     AI       │              │
│  │              │ shooting     │   Center     │   Assistant  │              │
│  │              │              │              │              │              │
│  └──────────────┴──────────────┴──────────────┴──────────────┘              │
│                                                                              │
│  Next.js Pages + React Components + Tailwind CSS + TypeScript              │
└─────────────────────────────────────────────────────────────────────────────┘
                                        ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                            API & SERVICE LAYER                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Twin Hierarchy API       /api/twin/hierarchy                       │    │
│  │  Drawing Intelligence     /api/drawings/revisions                   │    │
│  │  Wire Verification        /api/wires/verify                         │    │
│  │  Validation Metrics       /api/validation/metrics                   │    │
│  │  VCC Descriptions         /api/vcc-descriptions                     │    │
│  │  Troubleshooting          /api/troubleshooting                       │    │
│  │  Diagnostics              /api/diagnostics                          │    │
│  │  Electronics Encyclopedia /api/electronics                          │    │
│  │  AI Multi-Agent           /api/ai/query                             │    │
│  │  Audit & Logging          /api/audit/trail                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Next.js API Routes + TypeScript + Business Logic                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                        ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA ACCESS & ORM LAYER                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  Prisma Client                                                      │    │
│  │  ├─ Model: Formation, Car, System, Subsystem, Device               │    │
│  │  ├─ Model: Connector, ConnectorPin, ConnectorType                  │    │
│  │  ├─ Model: Wire, WireEndpoint, DrawingWire                         │    │
│  │  ├─ Model: Drawing, DrawingRevision, DrawingPageMapping            │    │
│  │  ├─ Model: Diagnostic, Procedure (Repair, Test, Maint, Commissioning)  │    │
│  │  ├─ Model: VCCDescription, VCCKnowledge, ElectronicComponent       │    │
│  │  ├─ Model: ValidationResult, AIKnowledgeSource, AuditLog           │    │
│  │  └─ 37 models total, 55 tables                                     │    │
│  │                                                                      │    │
│  │  Query Optimization:                                                │    │
│  │  ├─ Eager loading where appropriate                                │    │
│  │  ├─ Lazy loading for large relations                               │    │
│  │  ├─ Pagination for result sets                                     │    │
│  │  ├─ Database-level indexes                                         │    │
│  │  └─ Connection pooling (Neon)                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Prisma ORM + TypeScript Types                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                        ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATABASE LAYER                                   │
│                                                                              │
│  PostgreSQL (Neon) — 575 drawings, 1,606 connectors, 72,032 pins,         │
│  167,758 wires, 19 systems, 6 cars, 1,170 trainlines                       │
│                                                                              │
│  Indexes: drawingNo, wireNo, systemId, connectorCode, etc.                 │
│  Full-Text Search: drawing title, vcc description content                  │
│  Vector Search: embedding-based similarity (pgvector)                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                        ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL INTEGRATIONS                                │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐              │
│  │   OpenAI     │ Anthropic    │   MongoDB    │    Vercel    │              │
│  │  (GPT-4)     │  (Claude)    │  (RAG Docs)  │  (Deploy)    │              │
│  └──────────────┴──────────────┴──────────────┴──────────────┘              │
│                                                                              │
│  Optional LLM selection, RAG document storage, CI/CD pipeline              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. HIERARCHICAL DATA MODEL

### Digital Twin Hierarchy (13 Levels)

```
Level 1: FLEET
    │
    ├─ Level 2: TRAIN
    │   │
    │   ├─ Level 3: FORMATION
    │   │   │
    │   │   ├─ Level 4: CAR
    │   │   │   │
    │   │   │   ├─ Level 5: SYSTEM (19 systems)
    │   │   │   │   │
    │   │   │   │   ├─ Level 6: SUBSYSTEM (max 2 per system)
    │   │   │   │   │   │
    │   │   │   │   │   ├─ Level 7: EQUIPMENT
    │   │   │   │   │   │   │
    │   │   │   │   │   │   ├─ Level 8: DEVICE (1,606 devices)
    │   │   │   │   │   │   │   │
    │   │   │   │   │   │   │   ├─ Level 9: CONNECTOR (1,606 connectors)
    │   │   │   │   │   │   │   │   │
    │   │   │   │   │   │   │   │   ├─ Level 10: PIN (72,032 pins)
    │   │   │   │   │   │   │   │   │   │
    │   │   │   │   │   │   │   │   │   ├─ Level 11: WIRE (167,758 wires)
    │   │   │   │   │   │   │   │   │   │   │
    │   │   │   │   │   │   │   │   │   │   ├─ Level 12: CABLE
    │   │   │   │   │   │   │   │   │   │   │
    │   │   │   │   │   │   │   │   │   │   └─ Level 13: TRAINLINE (1,170)
    │   │   │   │   │   │   │   │   │   │
    │   │   │   │   │   │   │   │   │   └─ DRAWING (575 total)
    │   │   │   │   │   │   │   │   │       │
    │   │   │   │   │   │   │   │   │       ├─ DRAWING REVISION (A, B, C, D)
    │   │   │   │   │   │   │   │   │       │
    │   │   │   │   │   │   │   │   │       └─ DIAGNOSTIC (Faults)
    │   │   │   │   │   │   │   │   │
    │   │   │   │   │   │   │   │   └─ VCC KNOWLEDGE
    │   │   │   │   │   │   │   │
    │   │   │   │   │   │   │   └─ REPAIR / TEST / MAINT / COMM PROCEDURES
    │   │   │   │   │   │   │
    │   │   │   │   │   │   └─ ELECTRONICS ENCYCLOPEDIA
    │   │   │   │   │   │
    │   │   │   │   │   └─ VALIDATION RESULT
    │   │   │   │   │
    │   │   │   │   └─ SYSTEM METADATA (Coverage, Sync Status)
    │   │   │   │
    │   │   │   └─ CAR METADATA
    │   │   │
    │   │   └─ FORMATION METADATA
    │   │
    │   └─ TRAIN METADATA
    │
    └─ FLEET METADATA
```

### Entity Relationships

```
Formation (1)
    ↓ 1:N
Car (N) ← Current: 6 cars
    ↓ 1:N
CarSystem (N)
    ↓ N:1
System (N) ← Current: 19 systems
    ├─ 1:N → Subsystem (max 2 total)
    ├─ 1:N → Device (1,606 total)
    │   ├─ 1:N → DeviceSpecification
    │   └─ 1:N → WireEndpoint → Wire
    ├─ 1:N → Drawing (575 total)
    │   ├─ 1:N → DrawingPage
    │   ├─ 1:N → DrawingPageMapping
    │   ├─ 1:N → DrawingRevision
    │   ├─ 1:N → Connector (1,606 total)
    │   │   ├─ 1:N → ConnectorPin (72,032 total)
    │   │   │   ├─ 1:N → WireEndpoint → Wire (167,758 total)
    │   │   │   │   ├─ N:1 → Connector (both ends)
    │   │   │   │   ├─ N:1 → Device
    │   │   │   │   ├─ N:1 → DrawingWire → Drawing
    │   │   │   │   └─ 1:N → Diagnostic (Faults)
    │   │   │   └─ N:1 → ConductorClass
    │   │   └─ N:1 → ConnectorType
    │   ├─ 1:N → Circuit
    │   │   └─ 1:N → CircuitEndpoint
    │   └─ 1:N → TrainLine (1,170 total)
    ├─ 1:N → Diagnostic (Faults)
    │   ├─ N:1 → RepairProcedure
    │   ├─ N:1 → TestProcedure
    │   ├─ N:1 → MaintenanceProcedure
    │   └─ N:1 → CommissioningProcedure
    └─ 1:N → VCCDescription
        ├─ 1:N → VCCKnowledge
        └─ 1:N → ElectronicComponent
```

---

## 3. API LAYER ARCHITECTURE

### Endpoint Categories

**1. Hierarchy Navigation**
- GET `/api/twin/hierarchy?level=formation` → Fleet structure
- GET `/api/twin/hierarchy?level=system&parentId=X` → System details
- GET `/api/twin/hierarchy?level=device&systemId=X` → Devices in system
- GET `/api/twin/hierarchy?level=connector&parentId=X` → Connector with pins

**2. Drawing Intelligence**
- GET `/api/drawings` → All drawings with metadata
- GET `/api/drawings/[id]/revisions` → Revision chain (A→B→C→D)
- GET `/api/drawings/[id]/cross-references` → Related drawings
- POST `/api/drawings/[id]/validate` → Verify completeness

**3. Wire Verification**
- GET `/api/wires/verified` → Only VERIFIED wires (853 total)
- GET `/api/wires/status` → Status summary (verified, unverified, synthetic, deprecated)
- POST `/api/wires/[id]/verify` → Mark as VERIFIED with evidence
- GET `/api/wires/[id]/trace` → Full source → destination trace

**4. Validation Metrics**
- GET `/api/validation/metrics` → All coverage percentages
- GET `/api/validation/accuracy` → Engineering accuracy score (target >95%)
- GET `/api/validation/gaps` → List missing/incomplete items
- GET `/api/validation/report` → Comprehensive report

**5. Diagnostics**
- GET `/api/diagnostics` → All fault records
- GET `/api/diagnostics/[code]` → Specific fault with procedures
- POST `/api/diagnostics/[code]/resolve` → Resolve with audit trail
- GET `/api/diagnostics/[code]/procedures` → Related repair/test procedures

**6. VCC Knowledge**
- GET `/api/vcc-descriptions` → All systems with descriptions
- GET `/api/vcc-descriptions?systemCode=TRAC` → System details + drawings + procedures
- GET `/api/vcc-knowledge?systemCode=TRAC` → Learning content
- GET `/api/electronics` → Component encyclopedia

**7. AI & Multi-Agent**
- POST `/api/ai/query` → General question (coordinator agent)
- POST `/api/ai/agents/[name]/query` → Specific agent question
- POST `/api/ai/trace` → Get source evidence for an answer
- GET `/api/ai/agents` → Available agents + capabilities

**8. Audit & Activity**
- GET `/api/audit/trail/[entityType]/[entityId]` → Change history
- POST `/api/audit/log` → Log user action
- GET `/api/users/activity` → User activity stream

---

## 4. DATA FLOW EXAMPLES

### Example 1: Wire Troubleshooting Flow

```
User Input: "Trace wire 3001"
    ↓
API: GET /api/twin/hierarchy?level=wire&parentId=3001
    ↓
Database Query:
  SELECT * FROM Wire WHERE wireNo = '3001'
  JOIN WireEndpoint WHERE wireId = Wire.id
  JOIN Connector WHERE connectorId IN (WireEndpoint.connectorId)
  JOIN ConnectorPin WHERE connectorId = Connector.id
  JOIN Device WHERE deviceId = WireEndpoint.deviceId
  JOIN System WHERE systemId = Device.systemId
  JOIN Drawing WHERE systemId = System.id
    ↓
Return:
{
  wire: { wireNo: '3001', signalName: '...', status: 'VERIFIED' },
  endpoints: [
    {
      role: 'SOURCE',
      connector: { code: 'CN1', description: '...' },
      pin: { pinNo: '7', signalName: '...' },
      device: { name: 'VVVF1', system: 'TRAC' },
      drawing: { drawingNo: '942-58120', title: '...' }
    },
    {
      role: 'DESTINATION',
      connector: { code: 'CN3', ... },
      pin: { pinNo: '14', ... },
      device: { name: 'MCU1', system: 'TMS' },
      drawing: { drawingNo: '942-58146', ... }
    }
  ]
}
    ↓
UI: Display wire trace with clickable links to drawings, procedures, diagnostics
```

### Example 2: Troubleshooting Fault Flow

```
User Input: "VVVF_FAULT occurred"
    ↓
API: GET /api/troubleshooting/VVVF_FAULT
    ↓
Database Query:
  SELECT * FROM Diagnostic WHERE faultCode = 'VVVF_FAULT'
  JOIN RepairProcedure ON diagnostic.repairProcedureId = repairProcedure.id
  JOIN TestProcedure ON diagnostic.testProcedureId = testProcedure.id
  SELECT * FROM Wire WHERE system = 'TRAC' AND signal LIKE '%VVVF%'
  SELECT * FROM Drawing WHERE system = 'TRAC'
  SELECT * FROM TrainLine WHERE signal LIKE '%VVVF%'
    ↓
Return:
{
  fault: {
    code: 'VVVF_FAULT',
    description: 'VVVF Inverter Fault',
    severity: 'CRITICAL',
    system: 'TRAC',
    trainlines: ['1207', '1032'],
    relatedWires: ['3001', '3002', ...],
    relatedDrawings: ['942-58120', '942-58121'],
    symptoms: ['Train fails to accelerate', 'VVVF fault indicator lit'],
    rootCauses: ['Overcurrent', 'Motor overload', 'Cooling failure'],
    repairProcedure: { steps: [...], duration: '30 minutes' },
    testProcedure: { steps: [...], expectedResults: {...} }
  }
}
    ↓
UI: Step-by-step troubleshooting guide with links to related components
```

### Example 3: System Learning Flow

```
User Input: "Explain the TRAC (Traction) system"
    ↓
API: GET /api/vcc-descriptions?systemCode=TRAC
    ↓
Database Query:
  SELECT * FROM System WHERE code = 'TRAC'
  SELECT * FROM VCCDescription WHERE systemCode = 'TRAC'
  SELECT * FROM Drawing WHERE systemId = (SELECT id FROM System WHERE code = 'TRAC')
  SELECT * FROM Device WHERE systemId = (SELECT id FROM System WHERE code = 'TRAC')
  SELECT * FROM Connector WHERE drawing.systemId = (SELECT id FROM System...)
  SELECT * FROM TrainLine WHERE drawing.systemId = (SELECT id FROM System...)
  SELECT * FROM Diagnostic WHERE system = 'TRAC'
  SELECT * FROM VCCKnowledge WHERE systemCode = 'TRAC'
    ↓
Return:
{
  system: {
    code: 'TRAC',
    name: 'Traction',
    description: '...',
    vccDescription: {
      overview: '...',
      architecture: '...',
      powerFlow: '...',
      signalFlow: '...',
      safetyFeatures: '...'
    },
    drawings: [{ drawingNo: '942-58120', title: '...', pages: 5 }, ...],
    connectors: [{ code: 'CN1', pins: 50 }, ...],
    wires: [{ wireNo: '3001', status: 'VERIFIED' }, ...],
    trainlines: [{ lineNo: '1207', purpose: '...' }, ...],
    diagnostics: [{ code: 'VVVF_FAULT', description: '...', severity: 'CRITICAL' }, ...],
    procedures: {
      repair: [{ title: 'VVVF Recovery', steps: [...] }, ...],
      test: [{ title: 'Voltage Measurement', steps: [...] }, ...],
      maintenance: [{ title: 'Oil Change', frequency: 'monthly' }, ...],
      commissioning: [{ title: 'Initial Sync', steps: [...] }, ...]
    }
  }
}
    ↓
UI: Interactive system dashboard with tabs for Overview, Drawings, Procedures, Diagnostics
```

---

## 5. DATABASE SCHEMA HIGHLIGHTS

### Wire Table (Core)
```sql
CREATE TABLE Wire (
  id CUID PRIMARY KEY,
  wireNo STRING UNIQUE,
  signalName STRING,
  conductorClassCode STRING,
  wireStatus ENUM('VERIFIED', 'UNVERIFIED', 'SYNTHETIC', 'DEPRECATED'),
  verificationSource STRING,    -- Where was this verified? (e.g., "942-58120")
  verifiedAt TIMESTAMP,
  wireColor STRING,
  wireSize STRING,
  cableSpec STRING,
  sourceConnector STRING,
  sourcePin STRING,
  destConnector STRING,
  destPin STRING,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP @updatedAt
);

-- Indexes
CREATE INDEX idx_wire_no ON Wire(wireNo);
CREATE INDEX idx_wire_status ON Wire(wireStatus);
CREATE INDEX idx_wire_signal_name ON Wire(signalName);
```

### Drawing Table (Drawing Intelligence)
```sql
CREATE TABLE Drawing (
  id CUID PRIMARY KEY,
  projectId CUID,
  systemId CUID,
  drawingNo STRING,
  revision STRING,
  title STRING,
  totalSheets INT,
  status ENUM('ACTIVE', 'ARCHIVED', 'DRAFT', 'DEPRECATED'),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP @updatedAt
);

CREATE TABLE DrawingRevision (
  id CUID PRIMARY KEY,
  drawingId CUID FOREIGN KEY,
  parentDrawingId CUID FOREIGN KEY,   -- e.g., 942-38409 links to 942-38409A
  revisionLabel STRING,                -- A, B, C, D
  status ENUM('DRAFT', 'APPROVED', 'RELEASED', 'SUPERSEDED', 'ACTIVE'),
  effectiveFrom TIMESTAMP,
  effectiveTo TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_drawing_no ON Drawing(drawingNo);
CREATE INDEX idx_drawing_revision_parent ON DrawingRevision(parentDrawingId);
CREATE INDEX idx_drawing_revision_active ON DrawingRevision(status);
```

### Connector Table
```sql
CREATE TABLE Connector (
  id CUID PRIMARY KEY,
  drawingId CUID FOREIGN KEY,
  connectorCode STRING,
  connectorTypeCode STRING FOREIGN KEY,
  pinCount INT,
  scope ENUM('INTERCAR', 'POWER', 'COMMUNICATION', 'DEVICE', 'DIAGNOSTIC'),
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ConnectorPin (
  id CUID PRIMARY KEY,
  connectorId CUID FOREIGN KEY,
  pinNo STRING,
  pinLabel STRING,
  wireNo STRING,                -- Link to actual wire
  signalName STRING,
  conductorClassCode STRING,
  voltageText STRING,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_connector_code ON Connector(connectorCode);
CREATE INDEX idx_pin_wire_no ON ConnectorPin(wireNo);
CREATE INDEX idx_pin_signal_name ON ConnectorPin(signalName);
```

---

## 6. DEPLOYMENT PIPELINE

```
Developer Workflow:
    ├─ Branch: feature/xyz
    ├─ Develop locally: npm run dev
    ├─ Test: npm run build + npm run test
    └─ Commit: git push origin feature/xyz

Code Review:
    ├─ Pull Request on GitHub
    ├─ Automated checks (build, lint, test)
    └─ Team review + approval

Merge to Main:
    ├─ GitHub: Merge PR
    └─ git push origin main

Vercel Auto-Deploy:
    ├─ Webhook: GitHub → Vercel
    ├─ Build: npm run build
    ├─ Test (if configured)
    ├─ Deploy to production
    └─ Domain: vcc-system-application.vercel.app

Production Verification:
    ├─ Health check: /api/health
    ├─ API tests: Sanity checks
    └─ UI manual verification

Rollback (if needed):
    ├─ Revert commit on GitHub
    └─ Vercel auto-redeploys previous version
```

---

## 7. SCALABILITY CONSIDERATIONS

### Current Capacity
- 575 drawings
- 1,606 connectors
- 72,032 pins
- 167,758 wires
- 1,170 trainlines
- 19 systems
- 6 cars

### Scaling Limits (Next 5 Years)
- 10x drawings: 5,750 (manageable with indexing)
- 10x wires: 1.6M wires (pagination required, bulk operations optimized)
- Multi-fleet support (separate database instances or shared with fleet isolation)

### Optimization Strategies
1. **Database**: Neon autoscaling + read replicas for heavy queries
2. **Caching**: Redis for frequently accessed (system descriptions, drawings list)
3. **Search**: Full-text search + pgvector for semantic search
4. **Pagination**: Lazy-load hierarchy + paginate large result sets
5. **CDN**: Static assets (PDFs, images) via Vercel CDN

---

## 8. SECURITY ARCHITECTURE

```
┌──────────────────────────────────┐
│   Internet / Vercel Edge         │
│   ├─ DDoS Protection             │
│   ├─ Rate Limiting               │
│   └─ HTTPS/TLS                   │
└──────────────────────────────────┘
            ↓
┌──────────────────────────────────┐
│   Next.js API Routes             │
│   ├─ Input Validation (Zod)      │
│   ├─ Authentication Check        │
│   ├─ Authorization Check         │
│   └─ Audit Logging               │
└──────────────────────────────────┘
            ↓
┌──────────────────────────────────┐
│   Prisma ORM                     │
│   ├─ SQL Injection Prevention    │
│   ├─ Query Parameterization      │
│   └─ Prepared Statements         │
└──────────────────────────────────┘
            ↓
┌──────────────────────────────────┐
│   Neon PostgreSQL                │
│   ├─ SSL/TLS Encryption          │
│   ├─ Password Hashing (bcrypt)   │
│   ├─ Role-Based Access           │
│   └─ Connection Pooling          │
└──────────────────────────────────┘
```

---

## 9. MONITORING & OBSERVABILITY

### Metrics to Track
- API response times (target <500ms for 95th percentile)
- Database query performance (slow queries >1s)
- Error rates (target <0.1%)
- Cache hit rates (target >80%)
- User activity volume

### Logging
- Application logs: INFO, WARNING, ERROR
- API request/response logs (with request ID)
- Database query logs (slow queries)
- User audit logs (all changes)

### Alerts
- Build failures
- API errors (5xx)
- Database connection issues
- Performance degradation
- Deployment failures

---

## 10. TECHNOLOGY DECISIONS

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 16 | Modern, full-stack, Vercel optimized |
| Language | TypeScript | Type safety, tooling, maintainability |
| Styling | Tailwind CSS | Utility-first, responsive, fast |
| State | React | Component-based, hooks, ecosystem |
| ORM | Prisma | Type-safe, migrations, developer experience |
| Database | Neon PostgreSQL | Serverless, PostgreSQL, auto-scaling, branching |
| Deployment | Vercel | Next.js native, auto-scaling, edge functions |
| AI | OpenAI/Anthropic | State-of-the-art LLMs, configurable |
| RAG | MongoDB | Document storage, embeddings, flexibility |
| VCS | GitHub | Industry standard, integrations, CI/CD |

---

**End of Architecture Document**
