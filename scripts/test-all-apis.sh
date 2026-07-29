#!/bin/bash
# Comprehensive API test suite for VCC Explorer
BASE="http://localhost:3000"
PASS=0
FAIL=0

section() { echo ""; echo "═══ $1 ═══"; }
ok()   { echo "  ✅ $1"; PASS=$((PASS+1)); }
bad()  { echo "  ❌ $1"; FAIL=$((FAIL+1)); }

section "1. HEALTH & STATS"
curl -s "$BASE/api/health" -o /tmp/h.json
python3 -c "
import json; d=json.load(open('/tmp/h.json'))
c=d.get('database',{}).get('counts',{})
print(f\"  systems={c.get('systems')} drawings={c.get('drawings')} wires={c.get('wires')} connectors={c.get('connectors')} pins={c.get('pins')}\")
assert c.get('wires',0) > 100000, 'wire count too low'
assert c.get('drawings',0) >= 575, 'drawing count too low'
print('  ✅ health OK')
" && PASS=$((PASS+1)) || FAIL=$((FAIL+1))

section "2. DRAWING TITLES (must not contain 'Page N')"
for dwg in 942-58107 942-58108 942-58120 942-58123 942-58140 942-38409 942-38306; do
  curl -s "$BASE/api/drawings/lookup?drawing_no=$dwg" -o /tmp/d.json
  python3 -c "
import json,sys
d=json.load(open('/tmp/d.json')).get('drawing',{})
t=d.get('title','') or ''
sf=d.get('sourceFile','') or ''
bad = ('- Page ' in t) or ('Drawings_OCR' in t) or not t
print(('  ❌ ' if bad else '  ✅ ') + f\"{d.get('drawingNo')} | {t} | {sf}\")
sys.exit(1 if bad else 0)
" && PASS=$((PASS+1)) || FAIL=$((FAIL+1))
done

section "3. PDF MAPPING (page must belong to the drawing's own PDF)"
for dwg in 942-58107 942-58108 942-58120 942-58123 942-58140; do
  curl -s "$BASE/api/drawings/lookup?drawing_no=$dwg" -o /tmp/d.json
  SF=$(python3 -c "import json;print(json.load(open('/tmp/d.json')).get('drawing',{}).get('sourceFile',''))")
  ENC=$(python3 -c "import urllib.parse;print(urllib.parse.quote('''$SF'''))")
  curl -s "$BASE/api/drawings/pdf-mapping?drawing_no=$dwg&source_file=$ENC" -o /tmp/m.json
  python3 -c "
import json,sys
m=json.load(open('/tmp/m.json'))
want='''$SF'''
got=m.get('sourceFile') or ''
match = (got == want)
print(('  ✅ ' if match else '  ❌ ') + f\"$dwg → page {m.get('pdfPageNo')} of {got}\" + ('' if match else f' (EXPECTED {want})'))
sys.exit(0 if match else 1)
" && PASS=$((PASS+1)) || FAIL=$((FAIL+1))
done

section "4. WIRE SEARCH"
for q in 3001 5101 1001; do
  curl -s "$BASE/api/wires?search=$q&limit=3" -o /tmp/w.json
  python3 -c "
import json,sys
d=json.load(open('/tmp/w.json'))
n=d.get('pagination',{}).get('total',0)
ws=d.get('wires',[])
first=ws[0] if ws else {}
print(('  ✅ ' if n>0 else '  ❌ ') + f\"search '$q' → {n} matches, first={first.get('wireNo')} sig={first.get('signalName')} ep={len(first.get('endpoints',[]))}\")
sys.exit(0 if n>0 else 1)
" && PASS=$((PASS+1)) || FAIL=$((FAIL+1))
done

section "5. CONNECTOR SEARCH"
for q in X1 APS BCU; do
  curl -s "$BASE/api/connectors?search=$q&limit=3" -o /tmp/c.json
  python3 -c "
import json,sys
d=json.load(open('/tmp/c.json'))
items=d.get('connectors',[])
n=d.get('pagination',{}).get('total',len(items))
first=items[0] if items else {}
print(('  ✅ ' if n>0 else '  ❌ ') + f\"search '$q' → {n} matches, first={first.get('connectorCode')} pins={first.get('pinCount')} dwg={first.get('drawingNo')}\")
sys.exit(0 if n>0 else 1)
" && PASS=$((PASS+1)) || FAIL=$((FAIL+1))
done

section "6. PIN SEARCH"
curl -s "$BASE/api/pins?limit=3" -o /tmp/p.json
python3 -c "
import json,sys
d=json.load(open('/tmp/p.json'))
items=d.get('pins',[])
n=d.get('pagination',{}).get('total',0)
first=items[0] if items else {}
hasdata = bool(first.get('pin_no')) and bool(first.get('connector_code'))
print(('  ✅ ' if hasdata else '  ❌ ') + f\"{n} pins, first: conn={first.get('connector_code')} pin={first.get('pin_no')} wire={first.get('wire')} sig={first.get('signal_name')}\")
sys.exit(0 if hasdata else 1)
" && PASS=$((PASS+1)) || FAIL=$((FAIL+1))

section "7. SYSTEMS"
curl -s "$BASE/api/systems" -o /tmp/s.json
python3 -c "
import json,sys
d=json.load(open('/tmp/s.json'))
ss=d.get('systems',[])
withdw=[s for s in ss if (s.get('drawingCount') or 0)>0]
print(('  ✅ ' if len(ss)>=20 else '  ❌ ') + f\"{len(ss)} systems, {len(withdw)} have drawings\")
for s in ss[:5]: print(f\"      {s.get('code')}: {s.get('drawingCount')} drawings\")
sys.exit(0 if len(ss)>=20 else 1)
" && PASS=$((PASS+1)) || FAIL=$((FAIL+1))

section "8. TRAINLINES"
curl -s "$BASE/api/trainlines?limit=3" -o /tmp/t.json
python3 -c "
import json,sys
d=json.load(open('/tmp/t.json'))
items=d.get('trainlines') or d.get('trainLines') or d.get('data') or []
n=d.get('pagination',{}).get('total',len(items))
first=items[0] if items else {}
print(('  ✅ ' if n>0 else '  ❌ ') + f\"{n} trainlines, first={first.get('wireNo')} {first.get('itemName')}\")
sys.exit(0 if n>0 else 1)
" && PASS=$((PASS+1)) || FAIL=$((FAIL+1))

section "9. EQUIPMENT"
curl -s "$BASE/api/equipment?limit=3" -o /tmp/e.json
python3 -c "
import json,sys
d=json.load(open('/tmp/e.json'))
items=d.get('equipment') or d.get('devices') or d.get('data') or []
n=d.get('pagination',{}).get('total',len(items))
first=items[0] if items else {}
print(('  ✅ ' if n>0 else '  ❌ ') + f\"{n} equipment, first={first.get('tagNo') or first.get('code')} {first.get('deviceName') or first.get('name')}\")
sys.exit(0 if n>0 else 1)
" && PASS=$((PASS+1)) || FAIL=$((FAIL+1))

section "10. GSD TOPOLOGY"
curl -s "$BASE/api/gsd?action=topology" -o /tmp/g.json
python3 -c "
import json,sys
d=json.load(open('/tmp/g.json'))
okflag=d.get('success')
data=d.get('data',{})
n=len(data.get('nodes',[])); e=len(data.get('edges',[])); s=len(data.get('systems',[]))
print(('  ✅ ' if okflag else '  ❌ ') + f\"success={okflag} nodes={n} edges={e} systems={s}\")
if not okflag: print('      error:', d.get('details') or d.get('error'))
sys.exit(0 if okflag and n>0 else 1)
" && PASS=$((PASS+1)) || FAIL=$((FAIL+1))

section "11. GLOBAL SEARCH"
curl -s "$BASE/api/search?q=3001" -o /tmp/gs.json
python3 -c "
import json,sys
d=json.load(open('/tmp/gs.json'))
print('  keys:', list(d.keys())[:8])
tot = d.get('total') or sum(len(v) for v in d.values() if isinstance(v,list))
print(('  ✅ ' if tot else '  ❌ ') + f\"results={tot}\")
sys.exit(0 if tot else 1)
" && PASS=$((PASS+1)) || FAIL=$((FAIL+1))

section "12. VCC DESCRIPTIONS"
curl -s "$BASE/api/vcc-descriptions" -o /tmp/v.json
python3 -c "
import json,sys
d=json.load(open('/tmp/v.json'))
items=d.get('descriptions') or d.get('systems') or d.get('data') or []
print(('  ✅ ' if len(items)>0 else '  ❌ ') + f\"{len(items)} VCC descriptions\")
sys.exit(0 if len(items)>0 else 1)
" && PASS=$((PASS+1)) || FAIL=$((FAIL+1))

echo ""
echo "═══════════════════════════════════"
echo "  PASSED: $PASS    FAILED: $FAIL"
echo "═══════════════════════════════════"
