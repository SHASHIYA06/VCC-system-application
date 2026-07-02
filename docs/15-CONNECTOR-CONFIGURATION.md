# CONNECTOR CONFIGURATION
## Complete Connector Setup & Management

**Version**: 4.0 | **Date**: July 17, 2026

---

## 1. Connector Data Model

```
Connector {
  id: UUID
  drawingId: UUID (FK → Drawing)
  connectorCode: String
  description: String?
  connectorTypeCode: String?
  pinCount: Int?
  carType: String?
  scope: INTERCAR | POWER | COMMUNICATION | DEVICE | DIAGNOSTIC
}
```

## 2. Connector Types

| Type | Description | Pin Count | Usage |
|------|-------------|-----------|-------|
| X1 | 74-pin control signal | 74 | Inter-car control |
| X2 | 74-pin RS422/CAN | 74 | Communication |
| X3 | 11-pin 415VAC | 11 | AC power |
| X4 | 3-pin 110VDC | 3 | DC power |
| CN1-CN10 | Standard connectors | Variable | Device connections |
| J1-J4 | Jumper connectors | Variable | Cross-car jumps |

## 3. Connector Coverage

| Metric | Count | Coverage |
|--------|-------|----------|
| Total Connectors | 1,120 | 100% |
| Connectors with Pins | 1,073 | 95.8% |
| Total Pins | 56,342 | 100% |

## 4. API Endpoints

```
GET /api/connectors
  → Connector list with filters

GET /api/connectors?connector_code=X1
  → Direct connector lookup with pins

GET /api/connectors?system_code=TRAC
  → Connectors for specific system
```

## 5. Connector-Pin Structure

```
Connector X1 (74-pin)
├── Pin 1: Emergency Brake (Wire 3001)
├── Pin 2: Forward Command (Wire 3002)
├── Pin 3: Reverse Command (Wire 3003)
├── ...
└── Pin 74: Brake Released (Wire 3040)
```
