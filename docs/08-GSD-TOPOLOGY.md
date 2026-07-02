# GSD TOPOLOGY
## General System Diagram - Version 4.0

**Version**: 4.0 | **Date**: July 17, 2026

---

## 1. Topology Architecture

The GSD Topology provides a visual representation of the train's electrical architecture, showing how systems, devices, and connectors are interconnected.

### 1.1 Data Model

```
GSDNode {
  id: string
  label: string
  type: 'system' | 'device' | 'connector'
  system: string
  position: { x: number; y: number }
  metadata: Record<string, any>
  color: string
}

GSDEdge {
  id: string
  source: string
  target: string
  label: string
  type: 'power' | 'signal' | 'communication' | 'ground' | 'connection'
  wireNo: string
  color: string
  animated: boolean
}
```

### 1.2 Current State

| Metric | Count |
|--------|-------|
| Nodes | 23 |
| Edges | 118 |
| Systems | 21 |

---

## 2. Topology Views

| View | Description | Use Case |
|------|-------------|----------|
| Architecture View | System hierarchy and relationships | Understanding system structure |
| Wiring View | Wire connections between components | Tracing electrical paths |
| Connector View | Connector-pin mapping | Identifying connection points |
| Signal Flow | Signal routing through systems | Understanding control flow |
| Power Flow | Power distribution paths | Analyzing power requirements |
| Communication Flow | Data bus connections | Network architecture |
| Validation View | Data completeness indicators | Quality assurance |
| Diagnostic View | Fault code relationships | Troubleshooting |

---

## 3. API Endpoint

```
GET /api/gsd?action=topology
  → Returns nodes, edges, systems, statistics

GET /api/gsd?action=search&query=TRAC
  → Returns filtered nodes matching search
```

---

## 4. Frontend Component

The GSD Topology is displayed using:
- React Flow for interactive graph rendering
- D3-force for layout optimization
- Custom node/edge styling for engineering aesthetics
- Click handlers for navigation to system details

### 4.1 Component Location

```
src/components/gsd/GSDPiVisualization.tsx
src/app/gsd/page.tsx
src/app/gsd/explore/page.tsx
```

---

## 5. Color Scheme

| System | Color | Hex |
|--------|-------|-----|
| TRAC | Orange | #f97316 |
| BRAKE | Red | #ef4444 |
| DOOR | Amber | #f59e0b |
| VAC | Cyan | #06b6d4 |
| APS | Green | #10b981 |
| TMS | Purple | #a855f7 |
| COMMS | Emerald | #34d399 |
| CAB | Indigo | #6366f1 |
| HV | Rose | #f43f5e |
| GEN | Gray | #6b7280 |
| TRL | Blue | #3b82f6 |
