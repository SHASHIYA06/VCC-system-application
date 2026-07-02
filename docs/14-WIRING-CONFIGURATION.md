# WIRING CONFIGURATION
## Complete Wire Setup & Management

**Version**: 4.0 | **Date**: July 17, 2026

---

## 1. Wire Data Model

```
Wire {
  id: UUID
  wireNo: String (unique)
  signalName: String?
  wireColor: String?
  voltageClass: String?
  conductorClassCode: String?
  wireSize: String?
  cableSpec: String?
  sourceEquipment: String?
  sourceConnector: String?
  sourcePin: String?
  destEquipment: String?
  destConnector: String?
  destPin: String?
  wireStatus: VERIFIED | SYNTHETIC | UNVERIFIED | DEPRECATED
  remarks: String?
}
```

## 2. Wire Coverage

| Metric | Count | Coverage |
|--------|-------|----------|
| Total Wires | 167,787 | 100% |
| Wire Endpoints | 167,641 | 100% |
| Drawing-Wire Links | 109,667 | 64.7% |
| Verified Wires | 853 | 0.5% |
| Unverified Wires | 150,205 | 89.5% |
| Deprecated Wires | 16,700 | 10.0% |

## 3. Wire Number Format

```
XXXX XX (5-digit format)
- Digits 1-2: Unit identification
- Digit 3: Car position
- Digit 4: Trainline number
- Digit 5: Serial number

Examples:
- 3001: Forward direction control
- 6009: Left door open command
- 9001: RS422 TX+
```

## 4. Wire Variants

| Base Wire | Variants | Description |
|-----------|----------|-------------|
| 3001 | 3001a, 3001b, 3001c, 3001/1, 3001/2 | Forward command variants |
| 6009 | 6009a, 6009/1 | Door open left variants |
| 8001 | 8001a, 8001b, 8001c, 8001/1, 8001/2 | VVVF run variants |

## 5. Wire Status Classification

| Status | Count | Description |
|--------|-------|-------------|
| UNVERIFIED | 150,205 | Not yet checked |
| DEPRECATED | 16,700 | Marked for removal |
| VERIFIED | 853 | Confirmed correct |
| SYNTHETIC | 0 | Auto-generated |

## 6. API Endpoints

```
GET /api/wires
  → Wire search with filters

GET /api/wires?search=3001
  → Wire search with variants

GET /api/wires/3001
  → Wire detail with all drawings
```

## 7. Wire Trace Flow

```
Wire 3001
├── Source: X1 pin 17
│   └── Connector X1 on drawing 942-58103
├── Destination: CN1 pin 12
│   └── Connector CN1 on drawing 942-58120
├── Related Drawings: 35 drawings
├── Related Pins: 40 pins
└── Voltage: 110VDC
```
