# VCC DIGITAL TWIN PLATFORM 3.0
## Product Requirements Document (PRD)

**Document Version:** 3.0  
**Last Updated:** June 24, 2026  
**Status:** Active Development  
**Project:** Railway Vehicle Control System Digital Twin Platform  

---

## EXECUTIVE SUMMARY

The VCC Platform is a comprehensive digital twin for the KMRCL RS(3R) Metro vehicle control system. It provides end-to-end traceability from fleet level down to individual wires, enabling technicians, engineers, and commissioning teams to visualize, diagnose, validate, and maintain complex railway electrical systems.

**Current State:**
- 575 drawings with 598 page mappings
- 1,606 connectors with 72,032 pins
- 167,758 wires (853 verified, 150,205 unverified, 16,700 deprecated)
- 19 active systems with 2 subsystems
- 6 cars in 1 formation
- 1,170 trainlines
- Database: Neon PostgreSQL with 55 tables, 37 Prisma models

**Target State:**
Complete Digital Twin platform with:
- Full hierarchy navigation (Fleet → Wire → Drawing → Diagnostic)
- Verified wire registry (0.5% → 95%+ verified)
- Drawing revision intelligence (parent-child tracking)
- Multi-level validation (architecture, wiring, electrical)
- AI-powered troubleshooting with source tracing
- Engineering accuracy dashboard (>95%)
- VCC Knowledge Center (interactive, searchable)
- Electronics Encyclopedia (components, systems, diagnostics)

---

## VISION

Create the world's most advanced Railway Vehicle Control System Digital Twin Platform enabling:

1. **Complete Visibility** — See every electrical connection in the train
2. **Full Traceability** — Follow any wire from source to destination across all systems
3. **Intelligent Diagnostics** — Connect faults to wires, components, drawings, procedures
4. **Collaborative Learning** — Share knowledge, procedures, lessons learned
5. **Production Readiness** — Commission trains with confidence and precision

---

## USER PERSONAS

### 1. Railway Technician (Operator, Maintenance)
**Goals:** Quickly troubleshoot faults, understand wire routing, follow procedures  
**Pain Points:** Current system unclear, no visual wire tracing, static documentation  
**Key Features:** Troubleshooting guide, wire trace, quick access to drawings  

### 2. Maintenance Engineer
**Goals:** Plan maintenance, track component status, manage procedures  
**Pain Points:** Incomplete data, hard to find affected systems, manual record-keeping  
**Key Features:** Hierarchy explorer, system dependencies, maintenance procedures  

### 3. Commissioning Engineer
**Goals:** Verify connections, validate against drawings, sign-off on systems  
**Pain Points:** Manual verification, no automated checks, documentation drift  
**Key Features:** Validation center, drawing comparison, audit trails  

### 4. Electrical Engineer
**Goals:** Design changes, analyze power/signal flows, verify compliance  
**Pain Points:** Drawing revisions unclear, component specs scattered, simulation limited  
**Key Features:** GSD topology, power flow view, electronics encyclopedia, drawing revisions  

### 5. System Integrator
**Goals:** Connect subsystems, integrate components, ensure compatibility  
**Pain Points:** Cross-system dependencies unclear, no impact analysis  
**Key Features:** Architecture view, dependency graph, cross-connection validation  

### 6. Project Engineer
**Goals:** Track project status, manage deliverables, control changes  
**Pain Points:** Multiple systems of record, incomplete traceability  
**Key Features:** Dashboard, status tracking, change history, audit logs  

### 7. Fleet Manager
**Goals:** Monitor fleet health, plan maintenance schedules, optimize availability  
**Pain Points:** Limited real-time data, hard to plan across multiple trains  
**Key Features:** Fleet dashboard, system health indicators, maintenance calendar  

### 8. Trainer / Student
**Goals:** Learn VCC system, understand architecture, study procedures  
**Pain Points:** Fragmented learning resources, no interactive guidance  
**Key Features:** Learning mode, interactive circuits, step-by-step procedures  

---

## CORE USER JOURNEYS

### Journey 1: Wire Troubleshooting
```
Technician reports: "Wire 3001 shows no signal"

1. Search: Enter wire 3001
2. System shows: 
   - Wire properties (voltage, color, description)
   - Source connector, pin, equipment
   - Destination connector, pin, equipment
   - Path through systems (TRAC → HV → APS)
   - Drawing references (942-58120, 942-58121)
   - Diagnostic hints
   - Test procedures
3. Technician traces: Physical location on train
4. Technician checks: Connection points, continuity
5. Technician repairs: Follows guided procedure
6. System records: Repair audit log
```

### Journey 2: Fault Diagnosis
```
System shows: "Brake fault on Car 3"

1. AI Assistant analyzes: Which subsystems affected?
2. Shows: 
   - Fault code and severity
   - Related trainlines (4062, 4103, 4122, etc.)
   - Connected drawings (942-58125, 942-58128, 942-58126)
   - Root cause analysis (EMV failure, air pressure, wiring)
   - Repair procedure with step-by-step guide
   - Test procedure to verify fix
3. Technician executes: Repairs system
4. System validates: Tests pass
5. System records: Commissioning sign-off
```

### Journey 3: System Learning
```
Engineer wants: Understand TRAC (Traction) system

1. Navigate: TRAC system in VCC Knowledge Center
2. Learn:
   - Overview: What does it do?
   - Architecture: How are components arranged?
   - Power Flow: Where does power come from?
   - Signal Flow: How are signals routed?
   - Key Drawings: 942-58120, 942-58121
   - Key Connectors: CN1, CN2, CN3
   - Key Wires: 3001-3050
   - Related Diagnostics: VVVF_FAULT, HSCB_TRIP
   - Testing Procedure: Voltage, continuity, etc.
   - Commissioning Checklist: Steps to bring online
3. Access: Interactive circuit viewer
4. Simulate: What if a wire fails?
5. Study: Lessons learned from past issues
```

### Journey 4: Commissioning
```
Project Team: Ready to commission Car 3

1. System shows: Pre-commissioning checklist
2. System validates:
   - All drawings present? (575 drawings, all accessible)
   - All connectors mapped? (1,606 connectors, 100% mapped)
   - All pins verified? (72,032 pins, X% verified)
   - All wires traceable? (167,758 wires, X% verified)
   - All diagnostics connected? (X% of faults mapped)
3. Team executes: Electrical tests per procedure
4. System verifies: All tests pass
5. System records: Commissioning audit trail
6. Team signs off: Car 3 ready for service
```

---

## CORE FEATURES

### 1. Digital Twin Explorer
**Purpose:** Navigate the complete train hierarchy  
**Scope:** Fleet → Train → Formation → Car → System → Subsystem → Equipment → Device → Connector → Pin → Wire  
**Interactions:**
- Expand any level to drill down
- Click any node to see details
- View connected drawings, procedures, diagnostics
- Search across hierarchy

### 2. Hierarchy-Based Navigation
**Purpose:** Understand relationships between all system components  
**Scope:** Every object linked to parent and children  
**Interactions:**
- Navigate up/down hierarchy
- See sibling objects
- Breadcrumb trail showing path
- Quick links to related objects

### 3. GSD Topology Views
**Purpose:** Visualize system architecture in multiple ways  
**Views:**
- Tree View (expandable hierarchy)
- Circuit View (schematic layout)
- Power Flow View (power distribution)
- Signal Flow View (signal routing)
- Dependency View (component relationships)
- Failure Impact View (what breaks if this fails?)
- Validation View (completeness indicators)

### 4. Drawing Intelligence
**Purpose:** Connect drawings to every system object  
**Features:**
- Drawing search (by number, system, component)
- Page mapping (PDF page → drawing element)
- Revision tracking (parent, superseded, active)
- Cross-references (which drawings relate to this wire?)
- Annotation (notes, modifications)

### 5. Wire Verification Registry
**Purpose:** Track which wires are verified vs. synthetic  
**Features:**
- Wire status (VERIFIED, UNVERIFIED, SYNTHETIC, DEPRECATED)
- Source tracking (where was this wire defined?)
- Endpoint verification (both ends confirmed?)
- Certificate of compliance (audit trail)
- No synthetic wires in production features

### 6. Validation Center
**Purpose:** Measure data completeness and accuracy  
**Metrics:**
- Drawing coverage (%)
- Connector coverage (%)
- Pin coverage (%)
- Wire coverage (%)
- Trainline coverage (%)
- Diagnostic coverage (%)
- VCC documentation coverage (%)
- Revision coverage (%)
- Engineering Accuracy Score (composite)

### 7. AI-Powered Troubleshooting
**Purpose:** Guide technicians through fault diagnosis  
**Features:**
- Multi-agent system (Drawing, Wiring, Pin, Connector, System, Diagnostic, VCC, Validation agents)
- Source tracing (show which drawing/wire/component led to this conclusion)
- Confidence scoring (how confident is this analysis?)
- Step-by-step procedure guidance
- Test procedures to verify fix
- Repair audit trail

### 8. VCC Knowledge Center
**Purpose:** Comprehensive system documentation for learning and reference  
**Content Per System:**
- Overview (what does this system do?)
- Architecture (how are components arranged?)
- Functional Logic (how does it work?)
- Power Flow (power distribution)
- Signal Flow (signal routing)
- Key Drawings (essential schematics)
- Key Connectors (main connection points)
- Key Wires (critical signal/power wires)
- Key Trainlines (control/monitoring trainlines)
- Diagnostics (faults, codes, meanings)
- Testing Procedures (voltage, continuity, signal tests)
- Commissioning Procedures (activation, verification)
- Maintenance Procedures (regular maintenance)
- Lessons Learned (past issues, resolutions)
- Engineering Notes (design decisions, constraints)

### 9. Electronics Encyclopedia
**Purpose:** Reference library for components and their behaviors  
**Components:**
- Relays (electromagnetic, solid-state)
- MCB / MCCB (circuit protection)
- Fuses (current protection)
- Contactors (switching)
- Resistors / Capacitors / Inductors / Transformers (passive components)
- Diodes / SCR / TRIAC / MOSFET / IGBT (semiconductor devices)
- Encoders / Sensors (input devices)
- Motors / Actuators / Valves (output devices)

**For Each Component:**
- Function (what does it do?)
- Circuit Symbol (standard IEC symbol)
- Working Principle (how does it work?)
- Testing Methods (how to verify it works?)
- Failure Modes (how does it fail?)
- Measurements (voltage, current, resistance)
- Related Systems (which systems use this?)
- Related Drawings (where is it shown?)

### 10. Maintenance & Commissioning
**Purpose:** Guide technicians through system lifecycle procedures  
**Features:**
- Step-by-step procedures (text, diagrams, videos)
- Checklists with sign-off
- Parts and tools requirements
- Expected test results
- Troubleshooting if tests fail
- Audit trail (who did what, when, why)

### 11. Dashboard
**Purpose:** Executive and operational visibility  
**Metrics:**
- Fleet overview (trains, status)
- System health indicators (functioning, fault, unknown)
- Data completeness (coverage %)
- Recent activities (repairs, maintenance, updates)
- Upcoming maintenance (schedule)
- Critical alerts (faults, missing data)
- User activity (log of changes)

---

## SUCCESS CRITERIA

### Phase 1: Foundation (Current)
- [x] Database schema (37 models, 55 tables)
- [x] Hierarchy API (lazy-loading endpoints)
- [x] GSD Topology Explorer (expandable tree)
- [x] VCC Reference from database (not static)
- [ ] Deployed to Vercel and accessible

### Phase 2: Drawing Intelligence (Next 2 weeks)
- [ ] Drawing revision engine (parent-child tracking)
- [ ] Drawing validation (accuracy scores)
- [ ] Page mapping verification (fixed and working)
- [ ] Drawing cross-references (related drawings)
- [ ] Deployed to production

### Phase 3: Wire Verification (Next 3 weeks)
- [ ] Wire status classification (VERIFIED / UNVERIFIED / SYNTHETIC)
- [ ] Verified wire registry (853 → 50%+ verified)
- [ ] Remove synthetic wire dependency from production
- [ ] Wire trace improvements (full path visualization)
- [ ] Deployed to production

### Phase 4: Validation Engine (Next 2 weeks)
- [ ] Calculate coverage metrics (drawing, connector, pin, wire, trainline)
- [ ] Calculate Engineering Accuracy Score
- [ ] Validation dashboard (drill into data gaps)
- [ ] Generate audit reports
- [ ] Deployed to production

### Phase 5: Troubleshooting 2.0 (Next 3 weeks)
- [ ] Connect troubleshooting to database (not static data)
- [ ] Link faults to wires, connectors, drawings
- [ ] Repair procedures (step-by-step)
- [ ] Test procedures (verify fix)
- [ ] Deployed to production

### Phase 6: VCC Knowledge 2.0 (Next 4 weeks)
- [ ] Content for all 19 systems
- [ ] Power flow diagrams
- [ ] Signal flow diagrams
- [ ] Interactive circuit viewer
- [ ] Deployed to production

### Phase 7: Electronics Encyclopedia (Next 3 weeks)
- [ ] 20+ component types
- [ ] Specifications and test procedures
- [ ] Link to systems and drawings
- [ ] Searchable and filterable
- [ ] Deployed to production

### Phase 8: Multi-Agent AI (Next 4 weeks)
- [ ] 10 specialized agents
- [ ] Source tracing (show where answers come from)
- [ ] Confidence scoring
- [ ] Integration with all platform features
- [ ] Deployed to production

### Phase 9: UI/UX Enterprise Redesign (Next 2 weeks)
- [ ] Updated sidebar navigation
- [ ] Consistent design system
- [ ] Dark mode (maintained)
- [ ] Mobile responsiveness (maintained)
- [ ] Deployed to production

### Phase 10: Verification & Sign-Off (Final week)
- [ ] All features operational
- [ ] All metrics >95%
- [ ] All user journeys tested
- [ ] Production deployment
- [ ] Documentation complete

---

## DELIVERY TIMELINE

| Phase | Feature | Start | Duration | End | Status |
|-------|---------|-------|----------|-----|--------|
| 1 | Foundation | Jun 24 | 1 day | Jun 24 | In Progress |
| 2 | Drawing Intelligence | Jun 25 | 2 weeks | Jul 9 | Planned |
| 3 | Wire Verification | Jul 10 | 3 weeks | Jul 31 | Planned |
| 4 | Validation Engine | Aug 1 | 2 weeks | Aug 15 | Planned |
| 5 | Troubleshooting 2.0 | Aug 16 | 3 weeks | Sep 6 | Planned |
| 6 | VCC Knowledge 2.0 | Sep 7 | 4 weeks | Oct 5 | Planned |
| 7 | Electronics Encyclopedia | Oct 6 | 3 weeks | Oct 27 | Planned |
| 8 | Multi-Agent AI | Oct 28 | 4 weeks | Nov 25 | Planned |
| 9 | UI/UX Redesign | Nov 26 | 2 weeks | Dec 10 | Planned |
| 10 | Verification & Sign-Off | Dec 11 | 1 week | Dec 18 | Planned |

**Total Duration:** ~24 weeks (6 months)

---

## DEPENDENCIES & BLOCKERS

### Current Blockers
None. Platform ready for active development.

### Key Dependencies
- Neon PostgreSQL availability (critical)
- Vercel deployment pipeline (critical)
- Drawing PDF access (for page mapping)
- VCC documentation source (for Knowledge Center content)
- Engineering team for content review (Knowledge Center, Electronics Encyclopedia)

### Technology Stack
- **Frontend:** Next.js 16.2.6, React 19, Tailwind CSS, TypeScript
- **Backend:** Next.js API routes, TypeScript
- **Database:** Neon PostgreSQL
- **ORM:** Prisma 6.9.0
- **Deployment:** Vercel
- **AI/LLM:** OpenAI or Anthropic (configured via env vars)

---

## GLOSSARY

- **Digital Twin:** Virtual representation of the physical train and its systems
- **Hierarchy:** Fleet → Train → Formation → Car → System → Device → Connector → Pin → Wire
- **GSD:** General System Diagram (topology view)
- **VCC:** Vehicle Control Circuits (domain)
- **Drawing:** Engineering schematic (PDF, scanned)
- **Trainline:** Signal or power distribution path
- **Wire:** Individual electrical conductor
- **Connector:** Physical connection point (plug, terminal block, etc.)
- **Pin:** Individual terminal within a connector
- **Device:** Equipment/component (motor, relay, sensor, etc.)
- **System:** Logical grouping (TRAC, BRAKE, DOOR, VAC, etc.)
- **Verified Wire:** Wire traced end-to-end and confirmed in drawings
- **Synthetic Wire:** Auto-generated wire not from actual engineering data
- **Drawing Revision:** Version of a drawing (A, B, C, D, etc.)
- **Page Mapping:** Relationship between PDF page and drawing number

---

## DOCUMENT APPROVAL

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Manager | — | — | — |
| Engineering Lead | — | — | — |
| Project Manager | — | — | — |
| QA Lead | — | — | — |

---

**End of PRD**
