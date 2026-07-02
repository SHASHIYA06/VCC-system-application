# ENGINEERING BLUEPRINT
## VCC Digital Twin Platform 4.0

**Version**: 4.0 | **Date**: July 17, 2026

---

## 1. Entity–Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────┐
│                        PROJECT HIERARCHY                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Project                                                         │
│  └── Formation (DMC-TC-MC-MC-TC-DMC)                           │
│      └── Car (6 cars per formation)                             │
│          ├── CarSystem (junction table)                         │
│          └── System (21 systems)                                │
│              ├── Subsystem                                       │
│              ├── VCCDescription                                  │
│              ├── SystemMetadata                                  │
│              └── Drawing (297 drawings)                          │
│                  ├── DrawingPage                                 │
│                  ├── DrawingSheet (673)                          │
│                  ├── DrawingPageMapping (288 verified)           │
│                  ├── DrawingRevision (291)                       │
│                  ├── Connector (1,120)                           │
│                  │   └── ConnectorPin (56,342)                  │
│                  ├── Device (254)                                │
│                  │   └── DeviceSpecification (675)              │
│                  ├── Wire (167,787)                              │
│                  │   └── WireEndpoint (167,641)                 │
│                  ├── DrawingWire (109,667)                       │
│                  ├── TrainLine (1,170)                           │
│                  ├── Signal (1,822)                              │
│                  ├── Circuit (2,042)                             │
│                  │   └── CircuitEndpoint (1,585)                │
│                  └── CrossConnection (5)                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Data Flow

```
PDF Documents (9 files)
    ↓ OCR Extraction
Neon PostgreSQL Database
    ↓ Prisma ORM
Next.js API Routes
    ↓ fetch()
React Frontend
    ↓ User Interaction
Engineering Workflows
```

## 3. Symbol Mapping

| Symbol | Type | Ref Designator | Attributes |
|--------|------|----------------|------------|
| Relay | Coil + contacts | K\d+ | Coil voltage, NO/NC contacts |
| MCB | Circuit breaker | QF\d+ | Rated current, trip curve |
| Diode | Semiconductor | D\d+ | Polarity, part_no |
| Thyristor | SCR | T\d+ | Gate pin, part_no |
| Resistor | Passive | R\d+ | Resistance, wattage |
| Capacitor | Passive | C\d+ | Capacitance, voltage rating |
| Connector | Block | J\d+, CN\d+, X\d+ | Pin count, pin table |

## 4. Extraction Pipeline

```
1. INGEST: Convert PDF to vector (SVG/DXF) or rasterize at 600-1200 DPI
2. OCR: Two-stage OCR (Tesseract + fallback)
3. SYMBOL DETECTION: CNN classifier + template matching
4. WIRE TRACING: Skeletonization + vector path tracing
5. NETLIST BUILDING: Group connected pins into nets
6. CONNECTOR MAPPING: Parse pin tables, reconcile with callouts
7. BOM LINKING: Extract part numbers, enrich with datasheets
8. QA & HUMAN-IN-LOOP: Flag low-confidence items for correction
9. LOAD: Normalize and insert into PostgreSQL
```

## 5. Wire Coverage Strategy

| Chain | Method | Coverage |
|-------|--------|----------|
| WireEndpoint → Connector → Drawing | Direct DB links | 100% |
| ConnectorPin.wireNo → Wire | Pin-to-wire mapping | 74.9% |
| OCR Remarks → PDF filename | Text extraction | 2,679 links |
| TrainLine → Drawing | Trainline references | 1,170 links |
| **Total** | **Combined** | **64.7%** |
