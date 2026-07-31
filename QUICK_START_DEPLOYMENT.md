# ⚡ QUICK START DEPLOYMENT (5 STEPS - 20 MIN)

**Status**: Code is ready. Just need to set 4 environment variables in Vercel.

---

## THE 4 VARIABLES TO SET IN VERCEL

```
1. DATABASE_URL = postgresql://neondb_owner:npg_KyjXIOVCDW32@ep-tiny-mode-aq7698gi-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require

2. DIRECT_URL = postgresql://neondb_owner:npg_KyjXIOVCDW32@ep-tiny-mode-aq7698gi.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require

3. ANTHROPIC_API_KEY = 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

4. TINYFISH_API_KEY = sk-tinyfish-JAI-1Lk0ZP-FkvhUYsWUaZD4AhpAxlbG
```

---

## STEP 1: GO TO VERCEL
```
https://vercel.com/dashboard/vcc-system-application
```

## STEP 2: SETTINGS → ENVIRONMENT VARIABLES
```
Click: Settings → Environment Variables
```

## STEP 3: ADD 4 VARIABLES
```
For each variable above:
  - Paste Name
  - Paste Value
  - Check: ✅ Production, ✅ Preview, ✅ Development
  - Click: Save
```

## STEP 4: REDEPLOY
```
Go to: Deployments
Click: ⋮ (three dots) on latest
Click: Redeploy
Wait: 2-5 minutes for green checkmark
```

## STEP 5: VERIFY
```bash
# Test 1: Wire count
curl "https://vcc-system-application.vercel.app/api/wires?limit=1" | jq '.pagination.total'
# Should show: 167758 ✅

# Test 2: Open chat UI
https://vcc-system-application.vercel.app/ai-chat
# Should load with dark theme ✅

# Test 3: Try chat
Type: "What is TRAC?" and hit enter
# Should get AI response ✅

# Test 4: Try voice (Chrome/Edge)
Click microphone button
Say: "What systems are on the train?"
# Should transcribe and respond ✅
```

---

## THAT'S IT! YOU'RE DONE 🚀

If all tests pass above, production is live!

---

## TROUBLESHOOTING IN 30 SECONDS

**Still showing 19 wires?**
→ Env vars not saved. Go back to Step 2 and verify all 4 are there.

**Chat API not working?**
→ ANTHROPIC_API_KEY not set. Check spelling in Step 3.

**Voice not working?**
→ Use Chrome or Edge (not Firefox). Check mic permissions.

**Page shows error?**
→ Redeploy not done yet. Wait 3 more minutes and refresh.

---

## WHAT'S NOW AVAILABLE

✅ `/ai-chat` - Voice-enabled AI chat (hands-free operation)  
✅ `/wires` - Shows real 167,758 wires from database  
✅ `/api/ai/chat` - Chat API endpoint  
✅ `/api/wires` - All wires API  
✅ Voice input/output (Chrome/Edge/Safari)  
✅ 4 chat modes (learning/diagnostics/troubleshooting/commissioning)  
✅ Confidence scoring, source tracking, follow-up suggestions  

---

## QUICK HEALTH CHECK

```bash
# Run this to verify everything works:
bash scripts/verify-production.sh
```

---

**Questions? See: PRODUCTION_SETUP_VERIFICATION.md (comprehensive guide)**

