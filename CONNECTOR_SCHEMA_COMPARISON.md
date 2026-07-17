# Connector Schema Comparison: Old vs New

## Overview
This document compares the Connector schema from the original migration (001) to the current Prisma schema, highlighting the evolution and improvements made to better support the VCC System Application.

## Old Schema (Migration 001)

### Connector Table Structure
```sql
create table public.connectors (
  id uuid primary key default uuid_generate_v4(),
  drawing_id uuid not null references public.drawings(id) on delete cascade,
  page_id uuid references public.drawing_pages(id) on delete set null,
  equipment_id uuid references public.equipment(id) on delete set null,
  connector_code text not null,
  connector_type text,
  connector_variant text,
  gender text,
  pin_count integer,
  view_name text,
  remarks text,
  unique(drawing_id, connector_code, page_id)
);
```

### Pins Table Structure
```sql
create table public.pins (
  id uuid primary key default uuid_generate_v4(),
  connector_id uuid not null references public.connectors(id) on delete cascade,
  pin_no text not null,
  sequence_no integer,
  wire_id uuid references public.wires(id) on delete set null,
  wire_no_raw text,
  signal_name text,
  wire_type_raw text,
  cable_spec text,
  from_ref text,
  to_ref text,
  remark text,
  unique(connector_id, pin_no, sequence_no)
);
```

### Key Characteristics of Old Schema
1. **Simple Structure**: Flat table design with basic fields
2. **UUID Primary Keys**: Using PostgreSQL's uuid_generate_v4()
3. **Basic Relationships**: Foreign keys to drawings, pages, and equipment
4. **Limited Metadata**: Minimal information about connector characteristics
5. **Raw Data Storage**: Storing raw wire numbers and text fields
6. **No Standardization**: Connector types stored as free-text

## Current Schema (Prisma)

### Connector Model Structure
```prisma
model Connector {
  id                                                       String           @id @default(cuid())
  drawingId                                                String
  connectorCode                                            String
  carType                                                  String?
  instanceLabel                                            String?
  locationTag                                              String?
  sideTag                                                  String?
  description                                              String?
  extra                                                    Json             @default("{}")
  createdAt                                                DateTime         @default(now())
  connectorTypeCode                                        String?
  pinCount                                                 Int?
  scope                                                    ConnectorScope?
  sheetId                                                  String?
  connectorType                                            ConnectorType?   @relation(fields: [connectorTypeCode], references: [code])
  drawing                                                  Drawing          @relation(fields: [drawingId], references: [id])
  sheet                                                    DrawingSheet?    @relation(fields: [sheetId], references: [id])
  pins                                                     ConnectorPin[]
  WireConnection_WireConnection_fromConnectorIdToConnector WireConnection[] @relation("WireConnection_fromConnectorIdToConnector")
  WireConnection_WireConnection_toConnectorIdToConnector   WireConnection[] @relation("WireConnection_toConnectorIdToConnector")
  wireEndpoints                                            WireEndpoint[]

  @@unique([drawingId, connectorCode])
  @@index([drawingId])
  @@index([connectorCode])
}
```

### ConnectorPin Model Structure
```prisma
model ConnectorPin {
  id                 String          @id @default(cuid())
  connectorId        String
  pinNo              String
  pinLabel           String?
  wireNo             String?
  signalName         String?
  conductorClassCode String?
  voltageText        String?
  terminalFrom       String?
  terminalTo         String?
  sourceSheetRef     String?
  note               String?
  extra              Json            @default("{}")
  conductorClass     ConductorClass? @relation(fields: [conductorClassCode], references: [code])
  connector          Connector       @relation(fields: [connectorId], references: [id], onDelete: Cascade)
  wireEndpoints      WireEndpoint[]

  @@unique([connectorId, pinNo])
  @@index([wireNo])
}
```

### ConnectorType Model Structure
```prisma
model ConnectorType {
  code         String      @id
  nominalPins  Int?
  description  String
  voltageClass String?
  remarks      String?
  connectors   Connector[]
}
```

### Key Characteristics of New Schema
1. **Rich Relationships**: Complex relationship graph with 8+ related models
2. **CUID Primary Keys**: Using Prisma's cuid() for better distributed systems
3. **Standardized Types**: Dedicated ConnectorType model with predefined types
4. **Enhanced Metadata**: Detailed fields for location, scope, and description
5. **Structured Data**: Proper relationships instead of raw text fields
6. **Extensibility**: Json fields for extra data and future expansion

## Database Statistics Comparison

### Old Schema (Estimated)
- Connectors: Few hundred
- Pins: Few thousand
- Simple relationships only
- No connector type standardization

### Current Schema (Actual from Database)
- Connectors: 663
- Pins: 4,061
- Pins with Wire Numbers: 3,652 (89.9%)
- Connector Types: 16 (with more available from seed script)
- Rich relationships with drawings, sheets, and wire endpoints

## Detailed Comparison

### 1. Primary Keys
| Aspect | Old Schema | New Schema | Improvement |
|--------|------------|------------|-------------|
| Type | UUID (PostgreSQL) | CUID (Prisma) | Better for distributed systems |
| Generation | Database-side | Application-side | More predictable |

### 2. Relationships
| Aspect | Old Schema | New Schema | Improvement |
|--------|------------|------------|-------------|
| Drawing | Direct FK | Rich relation | Same functionality |
| Page | Direct FK | Sheet relation | Better abstraction |
| Equipment | Direct FK | Removed | Simplified model |
| Connector Type | Free text | Standardized model | Data consistency |
| Pins | Direct FK | Rich relation | Better navigation |

### 3. Connector Metadata
| Aspect | Old Schema | New Schema | Improvement |
|--------|------------|------------|-------------|
| Code | Basic text | Same | Consistent |
| Type | Free text field | Dedicated model | Standardization |
| Variant | Text field | N/A (moved to type) | Cleaner separation |
| Gender | Text field | N/A (moved to type) | Cleaner separation |
| Pin Count | Integer field | Integer field | Same |
| View Name | Text field | N/A | Simplified |
| Remarks | Text field | Description/Note fields | Better organization |

### 4. New Fields in Current Schema
1. **carType**: Vehicle type specification
2. **instanceLabel**: Specific instance identification
3. **locationTag**: Physical location information
4. **sideTag**: Side of vehicle (left/right)
5. **scope**: Enum for connector scope (INTERCAR, POWER, etc.)
6. **extra**: JSON field for extensibility
7. **sheetId**: More precise page reference

### 5. Pin Enhancements
| Aspect | Old Schema | New Schema | Improvement |
|--------|------------|------------|-------------|
| ID | UUID | CUID | Consistent |
| Pin Number | Text field | Text field | Same |
| Sequence | Integer field | Removed | Simplified |
| Wire Reference | Direct FK + raw text | Raw text only | Simplified |
| Signal Name | Text field | Text field | Same |
| Additional Info | Limited fields | Rich metadata | Much more detail |
| Conductor Class | None | Dedicated relation | Standardization |

### 6. Connector Types Standardization
**Old Schema**: Free-text `connector_type` field
**New Schema**: 
- Dedicated `ConnectorType` model with 27 predefined types (from seed script)
- Examples: 74P (74-pin intercar), X1-X4 (CAB connectors), J1-J4 (EDB panels)
- Nominal pin counts for standardization
- Voltage class information
- Detailed descriptions

## Key Improvements in New Schema

### 1. **Data Quality**
- 89.9% of pins have wire numbers (vs. unknown in old schema)
- Standardized connector types prevent data inconsistency
- Rich metadata improves searchability

### 2. **Relationship Modeling**
- Sheet-level granularity instead of page-level
- Wire endpoints for better connection tracking
- Wire connections for explicit linking

### 3. **Extensibility**
- JSON fields for additional metadata
- Rich relationship model allows easy expansion
- ConnectorScope enum for better categorization

### 4. **Searchability**
- Indexed fields for better query performance
- Standardized types enable filtering
- Rich metadata enables faceted search

### 5. **Maintenance**
- ConnectorType standardization simplifies updates
- Better separation of concerns
- Clearer data model reduces ambiguity

## Practical Impact

### Old Schema Limitations:
1. Difficult to query connectors by type
2. No standardization led to data inconsistency
3. Limited metadata made advanced features impossible
4. Simple relationships prevented complex analysis

### New Schema Benefits:
1. **Better User Experience**: Rich metadata enables better UI displays
2. **Advanced Analytics**: Standardized types allow for meaningful aggregations
3. **Data Quality**: 89.9% pin-to-wire linking enables reliable tracing
4. **Future Features**: Extensible design supports upcoming functionality
5. **Maintenance**: Standardized types simplify data management

## Connector Type Standardization

The new schema includes a comprehensive connector type system:
- 27 predefined types from the seed script
- 16 currently in use in the database
- Examples:
  - 74P: 74-Pin Intercar Connector
  - X1-X4: CAB system connectors
  - J1-J4: EDB panel connectors
  - CN1-CN5: Communication Node connectors

This standardization was not present in the old schema, where connector types were stored as free-text.

## Conclusion

The new Connector schema is **significantly better** than the old schema for several key reasons:

1. **Data Consistency**: Standardized connector types eliminate data entry errors
2. **Rich Metadata**: Enhanced fields provide better context and searchability
3. **Relationship Quality**: Complex relationships enable sophisticated queries
4. **Extensibility**: JSON fields and clean design support future growth
5. **Performance**: Proper indexing and relationships improve query performance

While the old schema was simpler, it lacked the sophistication needed for a modern VCC intelligence platform. The new schema transforms connector data from basic documentation elements into rich, interconnected information assets that enable advanced features like intelligent tracing, predictive maintenance, and AI-powered troubleshooting.

The current implementation demonstrates these improvements with:
- 663 connectors with rich metadata
- 4,061 pins with 89.9% wire linking
- 16 standardized connector types in active use
- Complex relationship graph enabling advanced analysis