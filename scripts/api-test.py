#!/usr/bin/env python3
"""
VCC Explorer — Full API / Data Integrity Test Suite
Tests every endpoint the frontend depends on and reports pass/fail with details.
"""
import json
import time
import urllib.parse
import urllib.request

BASE = "http://localhost:3200"
results = []


def get(path, timeout=60):
    t0 = time.time()
    try:
        with urllib.request.urlopen(BASE + path, timeout=timeout) as r:
            body = r.read().decode()
        return json.loads(body), round((time.time() - t0) * 1000)
    except Exception as e:
        return {"__error__": str(e)}, round((time.time() - t0) * 1000)


def check(name, cond, detail="", ms=None):
    icon = "PASS" if cond else "FAIL"
    results.append((name, cond))
    t = f" [{ms}ms]" if ms is not None else ""
    print(f"  [{icon}]{t} {name}")
    if detail:
        for line in str(detail).split("\n"):
            print(f"          {line}")


def section(t):
    print(f"\n{'='*72}\n  {t}\n{'='*72}")


# ── 1. HEALTH ───────────────────────────────────────────────────────────────
section("1. HEALTH / DATABASE CONNECTION")
d, ms = get("/api/health")
c = d.get("database", {}).get("counts", {})
check("Database connected", d.get("database", {}).get("connected") is True, ms=ms)
check("Wire count >= 167,758", c.get("wires", 0) >= 167758, f"got {c.get('wires')}")
check("Drawing count >= 575", c.get("drawings", 0) >= 575, f"got {c.get('drawings')}")
check("System count >= 30", c.get("systems", 0) >= 30, f"got {c.get('systems')}")
check("Connector count >= 1,606", c.get("connectors", 0) >= 1606, f"got {c.get('connectors')}")
check("Pin count >= 72,032", c.get("pins", 0) >= 72032, f"got {c.get('pins')}")

# ── 2. STATS (dashboard + sidebar counters) ─────────────────────────────────
section("2. STATS API (dashboard + sidebar counters)")
d, ms = get("/api/stats")
o = d.get("overview", {})
check("Stats returns overview", bool(o), ms=ms)
check("stats.wires correct", o.get("wires", 0) >= 167758, f"got {o.get('wires')}")
check("stats.drawings correct", o.get("drawings", 0) >= 575, f"got {o.get('drawings')}")
check("stats.systems correct", o.get("systems", 0) >= 30, f"got {o.get('systems')}")
check("stats.pins correct", o.get("pins", 0) >= 72032, f"got {o.get('pins')}")
check("stats.trainLines correct", o.get("trainLines", 0) >= 1170, f"got {o.get('trainLines')}")
check("stats.equipment correct", o.get("equipment", 0) >= 279, f"got {o.get('equipment')}")
sysl = d.get("systems", [])
check("systems array populated", len(sysl) >= 30, f"{len(sysl)} systems")

# ── 3. DRAWING TITLES ───────────────────────────────────────────────────────
section("3. DRAWING TITLES (no auto-generated 'Page N' garbage)")
KNOWN = {
    "942-58107": "Controlling Cab",
    "942-58108": "Start-up Relay",
    "942-58120": "VVVF Control",
    "942-58123": "Compressor Control",
    "942-58140": "Door Proving Loop",
    "942-58146": "TCMS Interface",
    "942-58152": "CBTC",
}
for dwg, expect in KNOWN.items():
    d, ms = get(f"/api/drawings/lookup?drawing_no={dwg}")
    dr = d.get("drawing", {})
    title = dr.get("title") or ""
    bad = ("- Page " in title) or ("Drawings_OCR" in title) or not title
    check(f"{dwg} title clean", not bad, f"title='{title}'", ms=ms)
    check(f"{dwg} title matches spec", expect.lower() in title.lower(), f"expected ~'{expect}' got '{title}'")

# ── 4. DRAWING ↔ PDF ALIGNMENT ─────────────────────────────────────────────
section("4. DRAWING <-> PDF PAGE ALIGNMENT (page must belong to same PDF)")
for dwg in ["942-58107", "942-58108", "942-58120", "942-58123", "942-58140", "942-38306", "942-38409"]:
    d, _ = get(f"/api/drawings/lookup?drawing_no={dwg}")
    sf = d.get("drawing", {}).get("sourceFile") or ""
    if not sf:
        check(f"{dwg} has sourceFile", False, "sourceFile empty")
        continue
    m, ms = get(f"/api/drawings/pdf-mapping?drawing_no={dwg}&source_file={urllib.parse.quote(sf)}")
    got = m.get("sourceFile") or ""
    page = m.get("pdfPageNo")
    check(f"{dwg} PDF matches", got == sf, f"lookup='{sf}'  mapping='{got}'  page={page}", ms=ms)

# ── 5. WIRE SEARCH ──────────────────────────────────────────────────────────
section("5. WIRE SEARCH")
for q in ["3001", "5101", "1001", "3003"]:
    d, ms = get(f"/api/wires?search={q}&limit=5")
    tot = d.get("pagination", {}).get("total", 0)
    ws = d.get("wires", [])
    first = ws[0] if ws else {}
    check(f"wire search '{q}' finds results", tot > 0, f"{tot} matches", ms=ms)
    if ws:
        check(f"wire search '{q}' top hit is exact", first.get("wireNo") == q,
              f"top={first.get('wireNo')} sig={first.get('signalName')} endpoints={len(first.get('endpoints',[]))}")

# wire detail
d, ms = get("/api/wires?search=3001&limit=1")
w = (d.get("wires") or [{}])[0]
eps = w.get("endpoints", [])
check("wire 3001 has endpoints", len(eps) > 0, f"{len(eps)} endpoints", ms=ms)
if eps:
    conns = [e.get("connector", {}).get("connectorCode") for e in eps[:5] if e.get("connector")]
    check("wire 3001 endpoints resolve to connectors", any(conns), f"connectors: {conns}")

# ── 6. CONNECTOR SEARCH ─────────────────────────────────────────────────────
section("6. CONNECTOR SEARCH")
d, ms = get("/api/connectors?limit=5")
items = d.get("connectors", [])
tot = d.get("pagination", {}).get("total", 0)
check("connector list returns data", tot >= 1606, f"{tot} total", ms=ms)
check("connectors have codes", all(x.get("connectorCode") for x in items), f"sample: {[x.get('connectorCode') for x in items]}")
withpins = [x for x in items if (x.get("pinCount") or 0) > 0]
check("connectors report pin counts", len(withpins) > 0, f"{len(withpins)}/{len(items)} have pins>0")

for q in ["X1", "APS", "BCU", "VVVF"]:
    d, ms = get(f"/api/connectors?search={q}&limit=3")
    tot = d.get("pagination", {}).get("total", 0)
    it = d.get("connectors", [])
    check(f"connector search '{q}'", tot > 0, f"{tot} matches, e.g. {[x.get('connectorCode') for x in it]}", ms=ms)

# ── 7. PIN SEARCH ───────────────────────────────────────────────────────────
section("7. PIN SEARCH")
d, ms = get("/api/pins?limit=5")
pins = d.get("pins", [])
tot = d.get("pagination", {}).get("total", 0)
check("pin list returns data", tot >= 72032, f"{tot} total", ms=ms)
if pins:
    p = pins[0]
    check("pin has connector_code", bool(p.get("connector_code")), f"conn={p.get('connector_code')}")
    check("pin has pin_no", bool(p.get("pin_no")), f"pin={p.get('pin_no')}")
    check("pin has wire", bool(p.get("wire")), f"wire={p.get('wire')}")
    check("pin has signal_name", bool(p.get("signal_name")), f"sig={p.get('signal_name')}")
    check("pin has system_code", bool(p.get("system_code")), f"sys={p.get('system_code')}")

# ── 8. SYSTEMS ──────────────────────────────────────────────────────────────
section("8. SYSTEMS API")
d, ms = get("/api/systems")
ss = d.get("systems", [])
check("systems returns >= 30", len(ss) >= 30, f"{len(ss)} systems", ms=ms)
withdw = [s for s in ss if (s.get("drawingCount") or 0) > 0]
check("systems have drawing counts", len(withdw) >= 10, f"{len(withdw)} systems have drawings")
top = sorted(ss, key=lambda s: -(s.get("drawingCount") or 0))[:5]
check("top systems listed", True, "\n".join(f"{s.get('code')}: {s.get('drawingCount')} drawings" for s in top))

# ── 9. TRAINLINES ───────────────────────────────────────────────────────────
section("9. TRAINLINES API")
d, ms = get("/api/trainlines?limit=5")
tl = d.get("trainlines") or d.get("trainLines") or d.get("data") or []
tot = d.get("pagination", {}).get("total", len(tl))
check("trainlines returns data", tot > 0, f"{tot} total, keys={list(d.keys())[:6]}", ms=ms)
if tl:
    check("trainline has wireNo/itemName", bool(tl[0].get("wireNo") or tl[0].get("itemName")),
          f"first={ {k: tl[0].get(k) for k in list(tl[0].keys())[:5]} }")

# ── 10. EQUIPMENT ───────────────────────────────────────────────────────────
section("10. EQUIPMENT API")
d, ms = get("/api/equipment?limit=5")
eq = d.get("equipment") or d.get("devices") or d.get("data") or []
tot = d.get("pagination", {}).get("total", len(eq))
check("equipment returns data", tot > 0, f"{tot} total, keys={list(d.keys())[:6]}", ms=ms)
if eq:
    check("equipment has tag/name", bool(eq[0].get("tagNo") or eq[0].get("code") or eq[0].get("name")),
          f"first={ {k: eq[0].get(k) for k in list(eq[0].keys())[:5]} }")

# ── 11. GSD TOPOLOGY ────────────────────────────────────────────────────────
section("11. GSD TOPOLOGY API")
d, ms = get("/api/gsd?action=topology", timeout=90)
okflag = d.get("success") is True
data = d.get("data", {})
n, e, s = len(data.get("nodes", [])), len(data.get("edges", [])), len(data.get("systems", []))
check("GSD returns success", okflag, d.get("details") or d.get("error") or "", ms=ms)
check("GSD has nodes", n > 0, f"nodes={n} edges={e} systems={s}")
st = data.get("statistics", {})
check("GSD statistics present", bool(st), f"devices={st.get('totalDevices')} wires={st.get('totalWires')}")

# ── 12. GLOBAL SEARCH ───────────────────────────────────────────────────────
section("12. GLOBAL SEARCH API")
d, ms = get("/api/search?q=3001")
keys = [k for k in d.keys() if isinstance(d.get(k), list)]
tot = d.get("total") or sum(len(d[k]) for k in keys)
check("global search returns results", tot > 0, f"total={tot} listKeys={keys}", ms=ms)

# ── 13. VCC DESCRIPTIONS ───────────────────────────────────────────────────
section("13. VCC DESCRIPTIONS API")
d, ms = get("/api/vcc-descriptions")
items = d.get("descriptions") or d.get("systems") or d.get("data") or []
check("vcc-descriptions returns data", len(items) > 0, f"{len(items)} entries, keys={list(d.keys())[:6]}", ms=ms)

# ── 14. DRAWINGS LIST ──────────────────────────────────────────────────────
section("14. DRAWINGS LIST API")
d, ms = get("/api/drawings?limit=5")
dws = d.get("drawings") or d.get("data") or []
tot = d.get("pagination", {}).get("total", len(dws))
check("drawings list returns data", tot >= 575, f"{tot} total", ms=ms)
badtitles = [x for x in dws if "- Page " in (x.get("title") or "")]
check("no garbage titles in list", len(badtitles) == 0, f"{len(badtitles)} bad of {len(dws)}")

# ── SUMMARY ────────────────────────────────────────────────────────────────
passed = sum(1 for _, ok in results if ok)
failed = len(results) - passed
print(f"\n{'='*72}")
print(f"  TOTAL: {len(results)}   PASSED: {passed}   FAILED: {failed}")
print(f"{'='*72}")
if failed:
    print("\n  FAILURES:")
    for name, ok in results:
        if not ok:
            print(f"    - {name}")
print()
