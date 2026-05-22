# KMRCL VCC Explorer - Environment Setup

## Stack
- **Next.js 16** with App Router, TypeScript, Tailwind CSS v4
- **Prisma 6.9** ORM for application reads/writes
- **Drizzle ORM** for typed SQL and schema introspection
- **PostgreSQL** via Neon (pooled for runtime, direct for migrations)
- **Neon** serverless PostgreSQL with pgbouncer pooling

## Environment Variables

Create `.env.local` (and copy to `.env` for CLI tools):

```bash
# App runtime (pooled via Neon pgbouncer)
DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-tiny-mode-aq7698gi-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require

# Direct connection for migrations / introspect (no pgbouncer)
DIRECT_URL=postgresql://neondb_owner:PASSWORD@ep-tiny-mode-aq7698gi.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require

# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Why Two URLs?
- `DATABASE_URL` (pooled) → runtime app queries (pgbouncer handles concurrency)
- `DIRECT_URL` (unpooled) → `prisma migrate`, `psql` migrations, bulk imports

## Getting Your Neon Connection String

1. Go to https://neon.tech → Dashboard → Connection Details
2. Copy the **pooled** connection string for `DATABASE_URL`
3. Copy the **non-pooled** connection string for `DIRECT_URL`
4. Append `?sslmode=require` to both if not present

## Database Setup (Run in Order)

```bash
# 1. Generate Prisma client
npm run db:generate

# 2. Push schema (creates all tables)
npx prisma db push --skip-generate --accept-data-loss

# 3. Run SQL migrations in order
npm run db:sql:full    # Creates normalized tables, seed systems + device types
npm run db:sql:backfill # Seeds device instances, drawing documents
npm run db:sql:normalize # Creates promotion functions
npm run db:sql:validate # Creates views and validation rules
npm run db:sql:catalog  # Seeds connectors
```

Or run all migrations directly with psql:
```bash
PGPASSWORD=xxx psql "DIRECT_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/008_full_backend_upgrade.sql
PGPASSWORD=xxx psql "DIRECT_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/009_backfill_reference_data.sql
PGPASSWORD=xxx psql "DIRECT_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/010_promote_to_normalized_entities.sql
PGPASSWORD=xxx psql "DIRECT_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/011_validation_rules.sql
PGPASSWORD=xxx psql "DIRECT_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/012_seed_system_catalog.sql
```

## Schema Overview

### Core Tables (Prisma-managed)
| Table | Description |
|-------|-------------|
| `DrawingDocument` | Drawing metadata (drawing_no, title, car_type, subsystem) |
| `DrawingPage` | OCR pages per document |
| `System` | Subsystem (TCMS, CCTV, DOOR, AAU, etc.) |
| `DeviceType` | Device categories (TCMS RIO, Ethernet Switch, Camera, etc.) |
| `DeviceInstance` | Specific device (TCMS RIO-1, TFT R1, etc.) |
| `Connector` | Physical connector (CN11, X1, M12-1, etc.) |
| `ConnectorPin` | Pin-level detail (pin_no, wire_no, endpoint, direction) |
| `Wire` | Wire master (wire_no, type, color, cable_spec) |
| `WireEndpoint` | Wire-to-device/connector/pin linkage |

### Staging / Raw Tables
| Table | Description |
|-------|-------------|
| `DrawingExtractionRaw` | Bulk OCR import landing zone |
| `WireConnectionSeed` | Normalized staging before promotion |
| `WireConnection` | De-duplicated canonical connections |

### Validation
| Table | Description |
|-------|-------------|
| `ValidationIssue` | Missing wires, duplicate pins, ambiguous endpoints |

## Key Views
- `vw_connector_pin_complete` → full pin detail with wire/device/drawing
- `vw_wire_trace` → wire trace with endpoint chain
- `vw_drawing_summary` → drawing counts (pages, connectors, pins)

## Key Functions
- `norm_code(text)` → normalizes connector/pin codes (uppercase, no special chars)
- `promote_raw_to_seed()` → promotes raw OCR rows to wire_connection_seed
- `promote_seed_to_normalized(limit)` → promotes seed rows to normalized entities
- `run_validation_rules()` → checks and logs data quality issues

## Prisma Commands
```bash
npm run db:generate    # npx prisma generate
npm run db:migrate     # npx prisma migrate dev
npm run db:deploy      # npx prisma migrate deploy
npm run db:push        # npx prisma db push
npm run db:studio      # npx prisma studio
```

## Data Model Hierarchy
```
DrawingDocument
  → DrawingPage (OCR raw text, JSON)
  → DeviceInstance
      → System (TCMS, CCTV, DOOR, AAU, DISPLAY, etc.)
      → DeviceType (RIO, Ethernet Switch, Camera, etc.)
      → Connector (CN11, X1, M12-1)
          → ConnectorPin (pin 1-26, wire_no, endpoint_label, direction)
              → WireEndpoint (link to Wire)
                  → Wire (wire_no, type, color, cable_spec)
```

## Cross-Connection Warnings (Critical)
- **X1 pins 19/20**: 3005 (DMC) ↔ 3006 (TC) — Propulsion system interlock
- **Jumper 43-44**: Door open circuit (6009 ↔ 6046)
- **Jumper 46-47**: Door close circuit (6014 ↔ 6051)

## Source VCC Drawing Numbers
- `942-58131/32/33` → Trainlines (DMC/TC/MC)
- `942-38342-45` → TCMS RIO CN11/CN12/CN15/CN17
- `942-38431-33` → CCTV Ethernet Switch / Camera
- `942-38531-33` → AAU / PEAU system
- `942-38631-33` → TFT Display / PIS

## Security
Rotate your Neon password if it was shared. Use `.env.local` (gitignored) for credentials.