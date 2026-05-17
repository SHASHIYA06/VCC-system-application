# OCR JSON Schema - KMRCL VCC Circuit Drawings

This document defines the canonical OCR JSON export format for processing metro VCC circuit drawings.

## Schema Version
`1.0.0`

## Document Type
`beml-vcc-ocr`

## Canonical JSON Shape

```json
{
  "schemaVersion": "1.0.0",
  "documentType": "beml-vcc-ocr",
  "projectCode": "KMRCL-RS3R-VCC",
  "sourceFilename": "KMRCL VCC Drawings_OCR.pdf",
  "exportedAt": "2026-05-15T00:00:00.000Z",
  "pageCount": 127,
  "pages": [
    {
      "pageNo": 1,
      "pageMarker": "page-1",
      "drawingNo": "942-58100",
      "sheetNo": 1,
      "sheetCount": 4,
      "text": "VCC DRAWING LIST..."
    }
  ]
}
```

## Root Fields

| Field | Type | Description |
|-------|------|-------------|
| schemaVersion | string | Must be "1.0.0" |
| documentType | string | Must be "beml-vcc-ocr" |
| projectCode | string | Project identifier (e.g., "KMRCL-RS3R-VCC") |
| sourceFilename | string | Original PDF filename |
| exportedAt | datetime | ISO-8601 export timestamp |
| pageCount | integer | Total number of pages |
| pages | array | Array of canonical OCR pages |

## Page Fields

| Field | Type | Description |
|-------|------|-------------|
| pageNo | integer | Page number (1-based, unique) |
| pageMarker | string | Must match "page-{pageNo}" |
| drawingNo | string | Drawing number (format: XXX-XXXXX) |
| sheetNo | integer | Sheet number within drawing |
| sheetCount | integer | Total sheets in drawing |
| text | string | Normalized OCR text (min 80 chars) |

## Validation Rules

1. Page numbers must be contiguous starting from 1
2. pageMarker must match "page-{pageNo}"
3. drawingNo must match pattern: `^\d{3}-\d{5}[A-Z]?$`
4. sheetNo cannot exceed sheetCount
5. Text must be normalized (no \r, collapsed newlines)
6. Text must contain the declared drawing number
7. Text must contain sheet metadata

## Example Drawings in VCC Package

- 942-58100: VCC Drawing List (127 pages)
- 942-58103: Train Lines Control
- 942-58104: Train Lines Signal
- 942-58107: Controlling Cab
- 942-58119: Speed Control
- 942-58124: Brake Loop
- 942-58137: Door Supply Voltage
- 942-58143: Cab VAC
- 942-58146: TMS Interface

## Normalization Rules

The `text` field must be normalized:
- Replace `\u00A0` (non-breaking space) with regular space
- Replace em-dashes with hyphen
- Remove carriage returns
- Collapse multiple blank lines to single blank line
- Trim leading/trailing whitespace

## Business Rules

1. `pageCount` must equal `pages.length`
2. Each drawing must have all its sheets present
3. Duplicate page numbers are not allowed
4. Page text must contain recognizable drawing/sheet markers
5. Short pages (<80 chars) should be flagged for review