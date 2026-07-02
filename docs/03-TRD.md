# TECHNICAL REQUIREMENTS DOCUMENT (TRD)
## VCC Digital Twin Platform 4.0

**Version**: 4.0 | **Date**: July 17, 2026

---

## 1. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | Next.js | 16.2.6 | App Router, SSR/SSG |
| UI Framework | React | 19.x | Component rendering |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Animation | Framer Motion | 12.x | UI animations |
| Charts | Recharts | 3.9.x | Data visualization |
| ORM | Prisma | 6.9 | Database access |
| Database | PostgreSQL (Neon) | - | Serverless Postgres |
| AI/LLM | LangChain | 1.4.x | Multi-agent RAG |
| Testing | Playwright | 1.6x | E2E testing |
| Deployment | Vercel | - | Auto-deploy |

---

## 2. Database Schema (Prisma)

### Core Models

```prisma
model System {
  id            String    @id @default(cuid())
  code          String    @unique
  name          String
  category      String?
  description   String?
  sortOrder     Int       @default(0)
  isActive      Boolean   @default(true)
  devices       Device[]
  drawings      Drawing[]
  metadata      SystemMetadata?
  vccDescription VCCDescription?
  subsystems    Subsystem[]
  carSystems    CarSystem[]
}

model Drawing {
  id            String    @id @default(cuid())
  projectId     String
  systemId      String?
  drawingNo     String
  revision      String    @default("0")
  title         String
  totalSheets   Int       @default(1)
  status        DrawingStatus @default(ACTIVE)
  connectors    Connector[]
  devices       Device[]
  wires         DrawingWire[]
  trainLines    TrainLine[]
  signals       Signal[]
  circuits      Circuit[]
  revisions     DrawingRevision[]
  pages         DrawingPage[]
  pageMappings  DrawingPageMapping[]
}

model Connector {
  id            String    @id @default(cuid())
  drawingId     String
  connectorCode String
  description   String?
  pinCount      Int?
  pins          ConnectorPin[]
  wireEndpoints WireEndpoint[]
  drawing       Drawing    @relation(fields: [drawingId], references: [id])
}

model ConnectorPin {
  id            String    @id @default(cuid())
  connectorId   String
  pinNo         String
  signalName    String?
  wireNo        String?
  conductorClassCode String?
  voltageText   String?
  connector     Connector @relation(fields: [connectorId], references: [id], onDelete: Cascade)
}

model Wire {
  id            String    @id @default(cuid())
  wireNo        String    @unique
  signalName    String?
  wireColor     String?
  voltageClass  String?
  conductorClassCode String?
  sourceEquipment String?
  sourceConnector String?
  sourcePin     String?
  destEquipment String?
  destConnector String?
  destPin       String?
  wireStatus    WireStatus @default(UNVERIFIED)
  remarks       String?
  endpoints     WireEndpoint[]
  drawings      DrawingWire[]
}

model WireEndpoint {
  id            String    @id @default(cuid())
  wireId        String
  connectorId   String?
  pinId         String?
  endpointRole  String?
  endpointLabel String?
  wire          Wire      @relation(fields: [wireId], references: [id], onDelete: Cascade)
  connector     Connector? @relation(fields: [connectorId], references: [id])
  pin           ConnectorPin? @relation(fields: [pinId], references: [id])
}

model DrawingWire {
  id            String    @id @default(cuid())
  drawingId     String
  wireId        String
  pageNo        Int?
  sheetNo       Int?
  context       String?
  drawing       Drawing   @relation(fields: [drawingId], references: [id], onDelete: Cascade)
  wire          Wire      @relation(fields: [wireId], references: [id], onDelete: Cascade)
  @@unique([drawingId, wireId])
}

model VCCDescription {
  id            String    @id @default(cuid())
  systemCode    String    @unique
  systemName    String
  description   String?
  technicalSpecs String?
  powerRequirements String?
  voltage       String?
  safetyFeatures String?
  source        String?
  system        System   @relation(fields: [systemCode], references: [code])
}
```

---

## 3. API Architecture

### Endpoint Map

| Endpoint | Method | Purpose | Response |
|----------|--------|---------|----------|
| `/api/health` | GET | Health check | `{ status, database }` |
| `/api/stats` | GET | Dashboard stats | `{ overview, systems }` |
| `/api/drawings` | GET | Drawing list | `{ drawings, pagination }` |
| `/api/drawings/lookup` | GET | Drawing detail | `{ drawing, connectors, wires }` |
| `/api/drawings/pdf-mapping` | GET | PDF page | `{ pdfPageNo, verified }` |
| `/api/wires` | GET | Wire search | `{ wires, pagination }` |
| `/api/wires/[wireNo]` | GET | Wire detail | `{ wire, drawings, pins }` |
| `/api/connectors` | GET | Connector list | `{ connectors, filters }` |
| `/api/connectors?connector_code=X1` | GET | Direct lookup | `{ connector, pins }` |
| `/api/pins` | GET | Pin list | `{ pins, filters }` |
| `/api/trainlines` | GET | Trainline list | `{ trainlines, filters }` |
| `/api/vcc-descriptions` | GET | VCC descriptions | `{ data: VCCDescription[] }` |
| `/api/troubleshooting` | GET | Fault codes | `{ faults, statistics }` |
| `/api/gsd?action=topology` | GET | GSD topology | `{ nodes, edges, systems }` |
| `/api/systems` | GET | System list | `{ systems }` |
| `/api/data-quality` | GET | Coverage metrics | `{ coverage, entities }` |

---

## 4. Deployment Architecture

```
Developer Workflow:
    ├─ Branch: feature/xyz
    ├─ Develop locally: npm run dev
    ├─ Test: npm run build + npx playwright test
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
    ├─ Deploy to production
    └─ Domain: vcc-system-application.vercel.app

Production Verification:
    ├─ Health check: /api/health
    ├─ API tests: Sanity checks
    └─ UI manual verification
```

---

## 5. Security Architecture

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
│   ├─ Connection Pooling          │
│   └─ Role-Based Access           │
└──────────────────────────────────┘
```

---

## 6. Performance Requirements

| Metric | Target | Current |
|--------|--------|---------|
| API response time | <500ms | <200ms |
| Page load time | <2s | <1.5s |
| Database query time | <100ms | <50ms |
| Build time | <60s | <30s |
| Test execution | <60s | <30s |
