# 🚨 VERCEL DATABASE UPDATE REQUIRED

## What Changed

The application is now configured to use the **wire-integrity branch** of the Neon database, which has:
- **77,915 WireEndpoints** (was 1,990 — 39x more data!)
- **167,758 Wires** (was 167,081)
- **2,221 Circuits** (was 1,141)
- **598 DrawingPageMappings** (correctly configured)
- **30 Subsystems** (full system hierarchy)
- **12 VCCDescriptions** (system documentation)
- Complete schema with all tables

## Action Required: Update Vercel Environment Variables

### Go to Vercel Dashboard → Settings → Environment Variables

### Update DATABASE_URL:
```
OLD: postgresql://neondb_owner:npg_KyjXIOVCDW32@ep-empty-shadow-aq54fjtz-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&pgbouncer=true

NEW: postgresql://neondb_owner:npg_KyjXIOVCDW32@ep-young-wildflower-aqy2a92u-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&pgbouncer=true
```

### Update DIRECT_URL:
```
OLD: postgresql://neondb_owner:npg_KyjXIOVCDW32@ep-empty-shadow-aq54fjtz.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

NEW: postgresql://neondb_owner:npg_KyjXIOVCDW32@ep-young-wildflower-aqy2a92u.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Then: Redeploy
1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait 2-5 minutes

## Why This Matters

The old database branch had only 1,990 WireEndpoints - that's why wire tracing wasn't working and drawings weren't properly connected. The wire-integrity branch has 77,915 WireEndpoints which provides full connectivity between:
- Wires ↔ Connectors
- Wires ↔ Pins
- Wires ↔ Devices
- All drawing page mappings

## Verification After Update

```bash
curl "https://vcc-system-application.vercel.app/api/data-diagnostic" | jq
```

Should show:
- Wire count: 167,758
- WireEndpoint count: 77,915
- DrawingPageMapping count: 598
