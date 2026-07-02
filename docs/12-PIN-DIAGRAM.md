# PIN DIAGRAM SYSTEM
## Connector Pin Mapping & Configuration

**Version**: 4.0 | **Date**: July 17, 2026

---

## 1. Pin Data Model

```
ConnectorPin {
  id: UUID
  connectorId: UUID (FK → Connector)
  pinNo: String
  pinLabel: String?
  wireNo: String?
  signalName: String?
  conductorClassCode: String?
  voltageText: String?
  terminalFrom: String?
  terminalTo: String?
  note: String?
}
```

## 2. PIN Drawing Files

| PDF File | Pages | Content |
|----------|-------|---------|
| CAB_PIN DRAWINGS.pdf | 48 | CAB pin assignments (942-38103) |
| CAB_PIN DRAWINGS 2.pdf | 48 | CAB pins (942-38104, 38105, 38108, 38109, 38119) |
| DMC UF_PIN DRAWINGS.pdf | 26 | DMC underframe pins |
| DMC_CEILING.pdf | 28 | DMC ceiling pins |
| TC _UF PIN DRAWINGS.pdf | 21 | TC underframe pins |
| TC_CEILING PIN DRAWINGS.pdf | 27 | TC ceiling pins |
| MC_UF.pdf | 27 | MC underframe pins |
| MC_CEILING_PIN DRAWINGS.pdf | 58 | MC ceiling pins |

## 3. Pin Coverage

| Metric | Count | Coverage |
|--------|-------|----------|
| Total Pins | 56,342 | 100% |
| Pins with Wire Numbers | 47,125 | 74.9% |
| Connectors with Pins | 1,073 | 95.8% |

## 4. API Endpoints

```
GET /api/pins
  → Returns pin list with filters

GET /api/pins?connector_code=X1
  → Returns pins for specific connector

GET /api/connectors?connector_code=X1&limit=1
  → Returns connector with all pins
```

## 5. Pin Assignment Structure

```
Connector X1 (74-pin)
├── Pin 1: Signal A (Wire 3001)
├── Pin 2: Signal B (Wire 3002)
├── Pin 3: Signal C (Wire 3003)
├── ...
└── Pin 74: Signal BR (Wire 3040)
```

## 6. Cross-Connection Detection

| Connection | Pins | Wires | Status |
|------------|------|-------|--------|
| X1 Pins 19/20 | Powering 1 & 2 | 3005/3006 | CROSSED |
| X1 Pins 43/44 | Door Open Left | 6009/6046 | CROSSED |
| X1 Pins 46/47 | Door Close Left | 6014/6051 | CROSSED |
