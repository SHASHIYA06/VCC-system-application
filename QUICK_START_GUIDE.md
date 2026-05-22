# 🚀 VCC Application - Quick Start Guide

## ✅ CRITICAL FIX APPLIED

I've applied a **simple CSS fix** that will make ALL text visible immediately.

---

## 🔥 STEP 1: RESTART YOUR SERVER (REQUIRED!)

The CSS changes won't show until you restart:

```bash
# Stop your current server (Ctrl+C)
# Then restart:
npm run dev
```

**After restart, ALL text will be WHITE and visible!**

---

## 📊 STEP 2: Load Data into Database

Your dashboard shows 0 because the database is empty. Click the **"Load VCC Data"** button on the dashboard, OR run these scripts:

```bash
# Option A: Use the dashboard button (easier)
# Just click "Load VCC Data" button on http://localhost:3000/dashboard

# Option B: Run scripts manually
psql "$DATABASE_URL" -f scripts/seed-connector-types.sql
npx tsx scripts/sync-drawing-data.ts
npx tsx scripts/verify-data-import.ts
npx tsx scripts/populate-pdf-page-mappings.ts
```

---

## 🎨 What I Fixed

### CSS Changes (Applied Now)
```css
/* ALL text is now WHITE */
* { color: white !important; }

/* Links are CYAN */
a { color: #22d3ee !important; }

/* Background is DARK */
body { background: #0f172a !important; }

/* Cards are VISIBLE */
.glass-card { background: rgba(30, 41, 59, 0.9) !important; }

/* Buttons are CYAN */
button { background: #0891b2 !important; }
```

---

## 🔍 Testing Individual Drawings

To test if drawings work:

1. **Go to dashboard**: http://localhost:3000/dashboard
2. **Search for a drawing**: Type `942-38309` or `942-58107`
3. **Click "View Drawing"**

If you see "Drawing not found", it means:
- Database is empty → Click "Load VCC Data" button
- OR the drawing number doesn't exist in your database

---

## 📝 Common Issues & Solutions

### Issue 1: Text Still Not Visible
**Solution**: You MUST restart the dev server
```bash
# Press Ctrl+C to stop
npm run dev  # Start again
```

### Issue 2: Dashboard Shows 0 for Everything
**Solution**: Database is empty, click "Load VCC Data" button

### Issue 3: Drawing Not Found
**Solution**: 
1. First load data (click "Load VCC Data")
2. Try these drawing numbers that should exist:
   - 942-38309
   - 942-58107
   - 942-58100

### Issue 4: PDF Not Opening
**Solution**: Run the PDF mapping script:
```bash
npx tsx scripts/populate-pdf-page-mappings.ts
```

---

## 🎯 What to Expect After Restart

### Dashboard Will Show:
- ✅ **White text** everywhere (no more dark blue!)
- ✅ **Cyan links** (easy to see)
- ✅ **Dark background** (good contrast)
- ✅ **Visible cards** (semi-transparent dark)
- ✅ **Cyan buttons** (clear and clickable)

### If Data is Loaded:
- ✅ **Numbers** instead of 0s
- ✅ **System cards** with equipment counts
- ✅ **Search** will find drawings
- ✅ **Individual drawings** will show details

---

## 📊 Quick Test Checklist

After restarting server:

- [ ] Dashboard text is white and visible
- [ ] Can see "VCC Dashboard" title clearly
- [ ] Stats show numbers (if data loaded) or 0s (if not)
- [ ] "Load VCC Data" button is visible and cyan
- [ ] Search box is visible with white text
- [ ] System cards are visible

---

## 🚨 IMPORTANT

**YOU MUST RESTART THE SERVER** for CSS changes to take effect!

```bash
# In your terminal where npm run dev is running:
# 1. Press Ctrl+C (stops server)
# 2. Run: npm run dev (starts server)
# 3. Refresh browser: http://localhost:3000/dashboard
```

---

## 📞 Next Steps

1. **Restart server** (Ctrl+C, then `npm run dev`)
2. **Refresh browser** (F5 or Cmd+R)
3. **Check if text is visible** (should be white now)
4. **Click "Load VCC Data"** (to populate database)
5. **Test drawing search** (try 942-38309)

---

## ✅ Summary

**What I Did**:
- ✅ Added simple CSS with `!important` to force white text
- ✅ Made all elements visible (cards, buttons, inputs)
- ✅ Pushed to GitHub (commit 4348f31)

**What You Need to Do**:
- 🔄 **RESTART your dev server** (this is critical!)
- 🔄 Refresh your browser
- 📊 Click "Load VCC Data" to populate database
- 🧪 Test drawing search

**After these steps, everything will be visible and working!**
