# VCC DESCRIPTION SETUP
## Complete System Documentation

**Version**: 4.0 | **Date**: July 17, 2026

---

## 1. System Overview (21/21 Systems)

| System | Name | Description Length | Key Topics |
|--------|------|-------------------|------------|
| TRAC | Traction Control | 1,701 chars | VVVF, motor control, return current |
| BRAKE | Brake System | 1,763 chars | Emergency/service/parking brake |
| DOOR | Door System | 1,577 chars | DCU, safety edge, proving loop |
| CAB | Controlling Cab | 1,472 chars | Master controller, dead man switch |
| TRL | Trainlines | 1,388 chars | X1-X4 connectors, cross-connections |
| TMS | TCMS | 1,336 chars | RIO units, Ethernet backbone |
| VAC | VAC / HVAC | 1,339 chars | HVAC, compressor, damper |
| APS | Auxiliary Power | 1,326 chars | SIV, battery charger, shore supply |
| HV | High Tension | 1,285 chars | Pantograph, HSCB, DC bus |
| LIGHT | Interior Lighting | 1,201 chars | LED, headlights, emergency |
| GEN | General | 739 chars | Drawing standards, symbols |
| PIS | PIS | 802 chars | CCU, ICOM, PA system |
| COUPLING | Coupling | 575 chars | Coupler control |
| LTEB | Low Tension Eq Box | 547 chars | Low tension equipment |
| EDB | Electrical Dist Box | 420 chars | Distribution box |
| BOGIE | Bogie | 388 chars | Speed sensors, brake actuators |
| LTJB | Low Tension Jct Box | 349 chars | Junction boxes |
| AUX | Auxiliary Electric | 334 chars | Battery management |
| COUPL | Coupler Control | 398 chars | Coupler control |
| DISPLAY | Display | 390 chars | Driver console displays |

---

## 2. VCC Description Content Structure

Each system description includes:

### 2.1 Overview
- System purpose and function
- Position in train architecture
- Key components and their roles

### 2.2 Architecture
- Component layout and connections
- Power distribution paths
- Signal flow diagrams

### 2.3 Key Components
- Detailed component list
- Specifications and ratings
- Interconnection points

### 2.4 Key Drawings
- Drawing references for each system
- Page numbers in PDF documents
- Cross-references to related drawings

### 2.5 Diagnostics
- Fault codes and their meanings
- Trainline references for faults
- Troubleshooting procedures

### 2.6 Test Procedures
- Step-by-step verification
- Expected results
- Pass/fail criteria

### 2.7 Safety Features
- Protection mechanisms
- Interlock systems
- Emergency procedures

### 2.8 Maintenance
- Inspection intervals
- Replacement schedules
- Spare parts lists

---

## 3. Database Schema

```sql
CREATE TABLE VCCDescription (
  id UUID PRIMARY KEY,
  systemCode VARCHAR UNIQUE NOT NULL,
  systemName VARCHAR NOT NULL,
  description TEXT,
  technicalSpecs TEXT,
  powerRequirements TEXT,
  voltage VARCHAR,
  safetyFeatures TEXT,
  maintenanceSchedule TEXT,
  sparePartsInfo TEXT,
  documentVersion VARCHAR,
  lastUpdated TIMESTAMP DEFAULT NOW(),
  source VARCHAR,
  extra JSONB DEFAULT '{}',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

---

## 4. API Endpoint

```
GET /api/vcc-descriptions
  → Returns all 21 system descriptions

GET /api/vcc-descriptions?systemCode=TRAC
  → Returns specific system with drawings and devices
```

---

## 5. Frontend Integration

The VCC Reference page (`/vcc-reference`) displays:
- System list with descriptions
- Technical specifications
- Power requirements
- Safety features
- Related drawings and devices
- Navigation to system detail pages
