# ENTITY-RELATIONSHIP DIAGRAM (ERD)
## VCC Digital Twin Platform 4.0

**Version**: 4.0 | **Date**: July 17, 2026

---

## Complete ERD

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          ENTITY-RELATIONSHIP DIAGRAM                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐      ┌──────────────┐      ┌──────────┐                 │
│  │ Project  │──1:N─│  Formation   │──1:N─│   Car    │                 │
│  └──────────┘      └──────────────┘      └──────────┘                 │
│                                               │                        │
│                                              1:N                       │
│                                               │                        │
│                                         ┌─────┴─────┐                 │
│                                         │ CarSystem  │                 │
│                                         └─────┬─────┘                 │
│                                              N:1                       │
│                                               │                        │
│                                         ┌─────┴─────┐                 │
│                                         │   System   │──1:1──VCCDesc  │
│                                         └─────┬─────┘                 │
│                                               │                        │
│                              ┌────────────────┼────────────────┐       │
│                             1:N              1:N              1:N      │
│                              │                │                │       │
│                     ┌────────┴───┐    ┌───────┴──────┐  ┌────┴────┐  │
│                     │  Drawing   │    │    Device    │  │Subsystem│  │
│                     └────────┬───┘    └───────┬──────┘  └─────────┘  │
│                              │                │                       │
│              ┌───────────────┼───────────────┐│                       │
│             1:N            1:N             1:N│                       │
│              │              │                │                       │
│     ┌────────┴───┐  ┌──────┴──────┐  ┌──────┴──────┐               │
│     │ Connector  │  │    Wire     │  │  TrainLine  │               │
│     └────────┬───┘  └──────┬──────┘  └─────────────┘               │
│              │              │                                        │
│             1:N           N:M (via DrawingWire)                     │
│              │              │                                        │
│     ┌────────┴───┐  ┌──────┴──────┐                                 │
│     │ConnectorPin│  │DrawingWire  │                                 │
│     └────────┬───┘  └─────────────┘                                 │
│              │                                                       │
│             1:N                                                      │
│              │                                                       │
│     ┌────────┴───┐                                                   │
│     │WireEndpoint│                                                   │
│     └────────────┘                                                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Relationships

| From | To | Type | Description |
|------|-----|------|-------------|
| Project | Formation | 1:N | Project contains formations |
| Formation | Car | 1:N | Formation contains cars |
| Car | CarSystem | 1:N | Car has system mappings |
| System | Drawing | 1:N | System has drawings |
| System | Device | 1:N | System has devices |
| System | VCCDescription | 1:1 | System has VCC description |
| Drawing | Connector | 1:N | Drawing has connectors |
| Drawing | Wire (via DrawingWire) | M:N | Drawing references wires |
| Drawing | TrainLine | 1:N | Drawing has trainlines |
| Connector | ConnectorPin | 1:N | Connector has pins |
| Wire | WireEndpoint | 1:N | Wire has endpoints |
| WireEndpoint | Connector | N:1 | Endpoint links to connector |
| WireEndpoint | ConnectorPin | N:1 | Endpoint links to pin |
| DrawingWire | Drawing | N:1 | Junction table |
| DrawingWire | Wire | N:1 | Junction table |

## UUID Primary Keys

All entities use UUIDs for global uniqueness:
- `id String @id @default(cuid())`
- CUIDs are time-ordered, collision-resistant
- Support distributed systems and offline generation

## Audit Trail

Every entity supports:
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`
- `AuditLog` table tracks all changes
- `QueryPerformance` table tracks query metrics
