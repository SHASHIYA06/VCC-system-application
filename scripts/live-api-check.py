#!/usr/bin/env python3
"""Live API check — sequential, generous timeouts, resilient to server hiccups."""
import json, time, urllib.request, urllib.error

BASE = "http://localhost:3300"
ok = fail = 0
fails = []

def get(path, timeout=90):
    t0 = time.time()
    try:
        with urllib.request.urlopen(BASE + path, timeout=timeout) as r:
            return json.loads(r.read().decode()), round((time.time()-t0)*1000), None
    except Exception as e:
        return None, round((time.time()-t0)*1000), str(e)

def check(name, cond, detail="", ms=None):
    global ok, fail
    t = f" [{ms}ms]" if ms is not None else ""
    if cond:
        ok += 1; print(f"  PASS{t}  {name}" + (f"  — {detail}" if detail else ""))
    else:
        fail += 1; fails.append(name); print(f"  FAIL{t}  {name}" + (f"  — {detail}" if detail else ""))

def sec(t): print(f"\n{'-'*70}\n  {t}\n{'-'*70}")

# warm up
print("Warming up server...")
for _ in range(3):
    d, ms, err = get("/api/health", 120)
    if d: break
    time.sleep(5)

sec("HEALTH")
d, ms, err = get("/api/health")
if err: check("health", False, err, ms)
else:
    c = d.get("database", {}).get("counts", {})
    check("health connected", d.get("database", {}).get("connected") is True, str(c), ms)

sec("STATS (sidebar counters)")
d, ms, err = get("/api/stats")
if err: check("stats", False, err, ms)
else:
    o = d.get("overview", {})
    check("systems=30", o.get("systems") == 30, str(o.get("systems")), ms)
    check("drawings=575", o.get("drawings") == 575, str(o.get("drawings")))
    check("wires=167758", o.get("wires") == 167758, str(o.get("wires")))
    check("pins=72032", o.get("pins") == 72032, str(o.get("pins")))
    check("connectors=1606", o.get("connectors") == 1606, str(o.get("connectors")))
    check("equipment=279", o.get("equipment") == 279, str(o.get("equipment")))
    check("trainLines=1170", o.get("trainLines") == 1170, str(o.get("trainLines")))

sec("DRAWING LOOKUP (title + PDF + page must agree)")
EXPECT = {
    "942-58107": ("Controlling Cab", "KMRCL VCC Drawings_OCR.pdf"),
    "942-58120": ("VVVF Control", "KMRCL VCC Drawings_OCR.pdf"),
    "942-58123": ("Compressor Control", None),
    "942-38306": ("VVVF Inverter Pin Assignment", None),
}
for dwg, (want_title, want_pdf) in EXPECT.items():
    d, ms, err = get(f"/api/drawings/lookup?drawing_no={dwg}")
    if err:
        check(f"{dwg} lookup", False, err, ms); continue
    dr = d.get("drawing", {})
    title = dr.get("title") or ""
    pdf = dr.get("sourceFile") or ""
    page = dr.get("pdfPageNo")
    check(f"{dwg} title", want_title.lower() in title.lower(), f"'{title}'", ms)
    check(f"{dwg} has pdf+page", bool(pdf) and page is not None, f"{pdf} p{page}")
    if want_pdf:
        check(f"{dwg} correct pdf", pdf == want_pdf, f"got '{pdf}'")
    check(f"{dwg} no 'Page N' garbage", "- Page " not in title, f"'{title}'")

sec("PDF MAPPING endpoint agrees with lookup")
for dwg in ["942-58107", "942-58120", "942-38306"]:
    d1, _, e1 = get(f"/api/drawings/lookup?drawing_no={dwg}")
    if e1: check(f"{dwg} mapping", False, e1); continue
    sf = d1.get("drawing", {}).get("sourceFile") or ""
    pg = d1.get("drawing", {}).get("pdfPageNo")
    d2, ms, e2 = get(f"/api/drawings/pdf-mapping?drawing_no={dwg}&source_file={urllib.request.quote(sf)}")
    if e2: check(f"{dwg} mapping", False, e2, ms); continue
    check(f"{dwg} mapping file matches", d2.get("sourceFile") == sf, f"{d2.get('sourceFile')} vs {sf}", ms)
    check(f"{dwg} mapping page matches", d2.get("pdfPageNo") == pg, f"p{d2.get('pdfPageNo')} vs p{pg}")

sec("WIRE SEARCH")
for q in ["3001", "5101", "3003"]:
    d, ms, err = get(f"/api/wires?search={q}&limit=5")
    if err: check(f"wire '{q}'", False, err, ms); continue
    tot = d.get("pagination", {}).get("total", 0)
    ws = d.get("wires", [])
    check(f"wire '{q}' hits", tot > 0, f"{tot} matches", ms)
    if ws: check(f"wire '{q}' exact first", ws[0].get("wireNo") == q, f"top={ws[0].get('wireNo')} sig={ws[0].get('signalName')}")

sec("CONNECTOR SEARCH")
for q in ["X1", "APS", "VVVF"]:
    d, ms, err = get(f"/api/connectors?search={q}&limit=5")
    if err: check(f"connector '{q}'", False, err, ms); continue
    tot = d.get("pagination", {}).get("total", 0)
    it = d.get("connectors", [])
    check(f"connector '{q}' hits", tot > 0, f"{tot}, e.g. {[x.get('connectorCode') for x in it[:3]]}", ms)
    if it: check(f"connector '{q}' has drawing", bool(it[0].get("drawingNo")), f"dwg={it[0].get('drawingNo')} pins={it[0].get('pinCount')}")

sec("PIN SEARCH (traceability fields)")
d, ms, err = get("/api/pins?limit=5")
if err: check("pins", False, err, ms)
else:
    ps = d.get("pins", [])
    tot = d.get("pagination", {}).get("total", 0)
    check("pins total", tot == 72032, str(tot), ms)
    if ps:
        p = ps[0]
        check("pin.connector_code", bool(p.get("connector_code")), p.get("connector_code"))
        check("pin.pin_no", bool(p.get("pin_no")), p.get("pin_no"))
        check("pin.wire", bool(p.get("wire")), p.get("wire"))
        check("pin.signal_name", bool(p.get("signal_name")), p.get("signal_name"))
        check("pin.system_code", bool(p.get("system_code")), p.get("system_code"))
        check("pin.drawing_no (NEW)", bool(p.get("drawing_no")), p.get("drawing_no"))
        check("pin.equipment_code (was empty)", bool(p.get("equipment_code")), repr(p.get("equipment_code")))

sec("PIN FILTER COMBINATION (was silently dropping connector_code)")
d, ms, err = get("/api/pins?connector_code=X1&limit=5")
if err: check("pin filter", False, err, ms)
else:
    ps = d.get("pins", [])
    allX1 = all(p.get("connector_code") == "X1" for p in ps) if ps else False
    check("connector_code=X1 respected", allX1, f"{len(ps)} rows, codes={[p.get('connector_code') for p in ps[:5]]}", ms)

sec("SYSTEMS")
d, ms, err = get("/api/systems")
if err: check("systems", False, err, ms)
else:
    ss = d.get("systems", [])
    check("systems>=30", len(ss) >= 30, str(len(ss)), ms)
    wd = [s for s in ss if (s.get("drawingCount") or 0) > 0]
    check("systems with drawings>=15", len(wd) >= 15, str(len(wd)))

sec("TRAINLINES / EQUIPMENT / DRAWINGS LIST")
for path, key, minimum in [
    ("/api/trainlines?limit=5", "trainlines", 1),
    ("/api/equipment?limit=5", "equipment", 1),
    ("/api/drawings?limit=5", "drawings", 575),
]:
    d, ms, err = get(path)
    if err: check(path, False, err, ms); continue
    items = d.get(key) or d.get("data") or d.get("devices") or d.get("trainLines") or []
    tot = d.get("pagination", {}).get("total", len(items))
    check(f"{key} returns data", tot >= minimum, f"{tot} total", ms)

sec("GSD TOPOLOGY")
d, ms, err = get("/api/gsd?action=topology", 180)
if err: check("gsd", False, err, ms)
else:
    data = d.get("data", {})
    n, e = len(data.get("nodes", [])), len(data.get("edges", []))
    check("gsd success", d.get("success") is True, d.get("details") or "", ms)
    check("gsd nodes>0", n > 0, f"nodes={n} edges={e}")

sec("VCC DESCRIPTIONS")
d, ms, err = get("/api/vcc-descriptions")
if err: check("vcc", False, err, ms)
else:
    items = d.get("descriptions") or d.get("systems") or d.get("data") or []
    check("vcc descriptions>=20", len(items) >= 20, str(len(items)), ms)

print(f"\n{'='*70}\n  TOTAL {ok+fail}   PASSED {ok}   FAILED {fail}\n{'='*70}")
if fails:
    print("\n  FAILURES:")
    for f in fails: print(f"    - {f}")
print()
