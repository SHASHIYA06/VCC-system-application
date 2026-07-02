# TROUBLESHOOTING SYSTEM
## VCC Digital Twin Platform 4.0

**Version**: 4.0 | **Date**: July 17, 2026

---

## 1. Fault Code Database

### 1.1 Traction System (TRAC)

| Code | Description | Severity | Trainlines | Drawings |
|------|-------------|----------|------------|----------|
| VVVF_FAULT | VVVF Inverter Fault | CRITICAL | 1207 | 942-58120, 942-58121 |
| HSCB_TRIP | High Speed Circuit Breaker Trip | CRITICAL | 1209 | 942-38103, 942-58106 |
| MOTOR_OVERTEMP | Traction Motor Overtemperature | WARNING | 1245 | 942-58120, 942-58121 |
| PANTOGRAPH_FAULT | Pantograph Raising/Lowering Fault | CRITICAL | 1003, 1004 | 942-58119 |

### 1.2 Brake System (BRAKE)

| Code | Description | Severity | Trainlines | Drawings |
|------|-------------|----------|------------|----------|
| EM_BRAKE_FAULT | Emergency Brake Application Fault | CRITICAL | 4062, 4103 | 942-58125, 942-58128 |
| PARKING_BRAKE | Parking Brake Fault | WARNING | 4122, 4153 | 942-58126 |
| COMPRESSOR_FAULT | Air Compressor Failure | CRITICAL | 4001 | 942-58123 |
| BRAKE_CYLINDER_LEAK | Brake Cylinder Air Leak | WARNING | 4103 | 942-58125, 942-58128 |

### 1.3 Door System (DOOR)

| Code | Description | Severity | Trainlines | Drawings |
|------|-------------|----------|------------|----------|
| DOOR_FAULT | Door System Fault | WARNING | 6073, 6076, 6112 | 942-58137-58140 |
| DOOR_CROSS_FAULT | Door Cross Connection Fault | WARNING | 6009, 6014, 6046, 6051 | 942-58138, 942-58139 |
| DOOR_MOTOR_FAULT | Door Motor Failure | CRITICAL | 6073, 6076 | 942-58137, 942-58140 |

### 1.4 VAC/HVAC System

| Code | Description | Severity | Trainlines | Drawings |
|------|-------------|----------|------------|----------|
| CAB_VAC_FAULT | Cab VAC Fault | WARNING | 7001 | 942-58143 |
| SALOON_VAC_FAULT | Saloon VAC Fault | WARNING | 7050, 7060, 7070 | 942-58144, 942-58145 |

### 1.5 Auxiliary Power (APS)

| Code | Description | Severity | Trainlines | Drawings |
|------|-------------|----------|------------|----------|
| AUX_FAULT | Auxiliary System Fault | WARNING | 1215 | 942-58130, 942-58131 |
| BATTERY_FAULT | Battery Under Voltage | WARNING | 5064 | 942-58132 |

### 1.6 TCMS

| Code | Description | Severity | Trainlines | Drawings |
|------|-------------|----------|------------|----------|
| TCMS_COMM_FAULT | TCMS Communication Fault | CRITICAL | — | 942-58146 |

### 1.7 Lighting

| Code | Description | Severity | Trainlines | Drawings |
|------|-------------|----------|------------|----------|
| HEADLIGHT_FAULT | Headlight Not Working | WARNING | 5110, 5111 | 942-58112 |
| SALOON_LIGHT_FAULT | Saloon Lights Not Working | WARNING | 5201-5204 | 942-58115 |
| EMERGENCY_LIGHT | Emergency Lighting Not Activating | CRITICAL | 5064 | 942-58132 |

---

## 2. Troubleshooting Flow

```
User reports fault
    ↓
Search fault code in database
    ↓
Display: Fault description, severity, related trainlines
    ↓
Show: Related drawings and connectors
    ↓
Provide: Step-by-step repair procedure
    ↓
Guide: Test procedure to verify fix
    ↓
Record: Repair audit log
```

---

## 3. API Endpoint

```
GET /api/troubleshooting
  → Returns all 15 fault codes with database links

GET /api/troubleshooting?systemCode=BRAKE
  → Returns fault codes for specific system

GET /api/troubleshooting?search=door
  → Returns fault codes matching search term
```
