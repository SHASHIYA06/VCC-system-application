# DRAWING CONFIGURATION
## Complete Drawing Mapping & Setup

**Version**: 4.0 | **Date**: July 17, 2026

---

## 1. Drawing Inventory

| Category | Count | Status |
|----------|-------|--------|
| OCR Schematic (942-58xxx) | 215 | ✅ All mapped |
| PIN Drawings (942-38xxx) | 73 | ✅ All mapped |
| Other drawings | 9 | ✅ |
| **Total** | **297** | **✅ 97% mapped** |

## 2. PDF Files & Content

| PDF File | Pages | Drawings | Content |
|----------|-------|----------|---------|
| KMRCL VCC Drawings_OCR.pdf | 127 | 56 | Main VCC schematics |
| CAB_PIN DRAWINGS.pdf | 48 | 18 | CAB PIN assignments |
| CAB_PIN DRAWINGS 2.pdf | 48 | 15 | CAB PIN assignments (cont.) |
| DMC UF_PIN DRAWINGS.pdf | 26 | 35 | DMC underframe PINs |
| DMC_CEILING.pdf | 28 | 8 | DMC ceiling PINs |
| TC _UF PIN DRAWINGS.pdf | 21 | 33 | TC underframe PINs |
| TC_CEILING PIN DRAWINGS.pdf | 27 | 40 | TC ceiling PINs |
| MC_UF.pdf | 27 | 29 | MC underframe PINs |
| MC_CEILING_PIN DRAWINGS.pdf | 58 | 62 | MC ceiling PINs |

## 3. Verified Page Mappings

| Drawing | PDF File | Page | Verified |
|---------|----------|------|----------|
| 942-58120 | KMRCL VCC Drawings_OCR.pdf | 38 | ✅ |
| 942-58121 | KMRCL VCC Drawings_OCR.pdf | 39 | ✅ |
| 942-58138 | KMRCL VCC Drawings_OCR.pdf | 54 | ✅ |
| 942-38109 | CAB_PIN DRAWINGS 2.pdf | 27 | ✅ |
| 942-38409 | TC_CEILING PIN DRAWINGS.pdf | 1 | ✅ |

## 4. Drawing-to-System Mapping

| System | Drawings | Description |
|--------|----------|-------------|
| GEN | 146 | General documentation |
| CAB | 27 | Controlling cab |
| BRAKE | 18 | Brake system |
| COMMS | 18 | Communications |
| TRAC | 11 | Traction |
| HV | 11 | High tension |
| DOOR | 12 | Door system |
| LIGHT | 8 | Interior lighting |
| APS | 7 | Auxiliary power |
| TMS | 6 | TCMS |
| VAC | 6 | VAC/HVAC |
| TRL | 4 | Trainlines |
| COUPLING | 5 | Coupling |
| LTEB | 5 | Low tension eq box |
| BOGIE | 5 | Bogie |
| LTJB | 3 | Low tension jct box |
| PIS | 3 | PIS |
| AUX | 2 | Auxiliary electric |
| EDB | 1 | Electrical dist box |

## 5. API Endpoints

```
GET /api/drawings
  → Drawing list with filters

GET /api/drawings/lookup?drawing_no=942-58120
  → Drawing detail with connectors/wires

GET /api/drawings/pdf-mapping?drawing_no=942-58120
  → PDF page mapping
```
