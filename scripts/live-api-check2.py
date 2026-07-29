#!/usr/bin/env python3
"""
Live HTTP assertions for the endpoints changed in this pass.

Each check states what it verifies and why, so a failure names the regression
rather than just a status code.

Run: python3 scripts/live-api-check2.py [base_url]
"""
import json
import sys
import time
import urllib.error
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3400"

passed = 0
failed = 0
failures = []


def check(label, condition, detail=""):
    global passed, failed
    if condition:
        passed += 1
        print(f"  [PASS] {label}" + (f"  — {detail}" if detail else ""))
    else:
        failed += 1
        failures.append(label)
        print(f"  [FAIL] {label}" + (f"  — {detail}" if detail else ""))


def get(path, timeout=60):
    t0 = time.time()
    try:
        with urllib.request.urlopen(f"{BASE}{path}", timeout=timeout) as r:
            body = json.loads(r.read().decode())
            return r.status, body, int((time.time() - t0) * 1000)
    except urllib.error.HTTPError as e:
        return e.code, None, int((time.time() - t0) * 1000)
    except Exception as e:  # noqa: BLE001
        print(f"        request error: {e}")
        return 0, None, int((time.time() - t0) * 1000)


def section(title):
    print(f"\n{'-' * 72}\n{title}\n{'-' * 72}")


# ── /api/stats ──────────────────────────────────────────────────────────────
section("/api/stats — per-car wire counts must be real, not a connector proxy")
status, body, ms = get("/api/stats")
check("stats responds 200", status == 200, f"{ms}ms")
if body:
    ov = body.get("overview", {})
    check("overview.wires is the full wire population", ov.get("wires", 0) > 100000,
          f"wires={ov.get('wires')}")
    check("overview.drawings == 575", ov.get("drawings") == 575, f"drawings={ov.get('drawings')}")
    check("overview.trainLines > 0", ov.get("trainLines", 0) > 0, f"trainLines={ov.get('trainLines')}")
    check("overview.equipment > 0", ov.get("equipment", 0) > 0, f"equipment={ov.get('equipment')}")
    by_car = body.get("byCarType", {})
    conn_by_car = body.get("connectorsByCarType", {})
    check("byCarType is present and non-empty", bool(by_car), f"{by_car}")
    check("connectorsByCarType exposed separately", isinstance(conn_by_car, dict),
          f"{conn_by_car}")
    # The whole point of the change: these two must no longer be the same numbers.
    check("byCarType is NOT the connector counts", by_car != conn_by_car,
          f"wires={by_car} connectors={conn_by_car}")
    check("no invented dashboard fallbacks present in byCarType",
          7800 not in by_car.values() and 5616 not in by_car.values(),
          f"{by_car}")

# ── /api/drawings ───────────────────────────────────────────────────────────
section("/api/drawings — title provenance + unfiltered system facets")
status, body, ms = get("/api/drawings?limit=1000")
check("drawings responds 200", status == 200, f"{ms}ms")
if body:
    dws = body.get("drawings", [])
    check("returns all 575 drawings", body.get("pagination", {}).get("total") == 575,
          f"total={body.get('pagination', {}).get('total')}")
    check("every drawing carries titleSource",
          all("titleSource" in d for d in dws), f"{len(dws)} rows")
    check("every drawing carries titleVerified",
          all("titleVerified" in d for d in dws))
    placeholders = [d for d in dws if d.get("titleVerified") is False]
    check("307 drawings flagged as unverified titles", len(placeholders) == 307,
          f"{len(placeholders)} unverified")
    verified = [d for d in dws if d.get("titleVerified") is True]
    check("268 drawings have verified titles", len(verified) == 268,
          f"{len(verified)} verified")
    refs = [d for d in dws if d.get("isReference")]
    check("54 VCC-REF entries flagged isReference", len(refs) == 54, f"{len(refs)} refs")
    facets = body.get("meta", {}).get("systems", [])
    check("meta.systems lists every system (30)", len(facets) == 30, f"{len(facets)} facets")
    check("facets carry drawingCount", all("drawingCount" in s for s in facets))

section("/api/drawings?system_code=DOOR — facets stay complete while filtered")
status, body, ms = get("/api/drawings?system_code=DOOR&limit=1000")
check("filtered drawings responds 200", status == 200, f"{ms}ms")
if body:
    check("DOOR returns 18 drawings", body.get("pagination", {}).get("total") == 18,
          f"total={body.get('pagination', {}).get('total')}")
    # The bug this guards: facets used to be derived from the filtered page, which
    # collapsed the dropdown to the single selected system.
    check("system facets still list all 30 while filtered",
          len(body.get("meta", {}).get("systems", [])) == 30,
          f"{len(body.get('meta', {}).get('systems', []))} facets")

# ── /api/equipment ──────────────────────────────────────────────────────────
section("/api/equipment — field names the page actually renders")
status, body, ms = get("/api/equipment?limit=60")
check("equipment responds 200", status == 200, f"{ms}ms")
if body:
    eq = body.get("equipment", [])
    check("returns rows", len(eq) > 0, f"{len(eq)} rows")
    if eq:
        first = eq[0]
        for field in ("deviceName", "tagNo", "deviceType", "carType",
                      "locationTag", "note", "systemCode", "drawingNo", "wireCount"):
            check(f"equipment row exposes '{field}'", field in first)
    check("pagination.total is the device count", body.get("pagination", {}).get("total", 0) > 0,
          f"total={body.get('pagination', {}).get('total')}")
    check("filters.systems present for the dropdown",
          len(body.get("filters", {}).get("systems", [])) > 0)

section("/api/equipment?system_code=DOOR — code filter must not compare to an id")
status, body, ms = get("/api/equipment?system_code=DOOR&limit=100")
check("filtered equipment responds 200", status == 200, f"{ms}ms")
if body:
    total = body.get("pagination", {}).get("total", 0)
    # Previously `where.systemId = 'DOOR'` matched nothing, always returning 0.
    check("DOOR equipment filter returns rows (was always 0)", total > 0, f"total={total}")
    rows = body.get("equipment", [])
    check("every returned device really is in DOOR",
          all(r.get("systemCode") == "DOOR" for r in rows), f"{len(rows)} rows")

# ── /api/trainlines ─────────────────────────────────────────────────────────
section("/api/trainlines — pagination and no duplicated payload")
status, body, ms = get("/api/trainlines?limit=100&offset=0")
check("trainlines responds 200", status == 200, f"{ms}ms")
if body:
    check("data array returned", len(body.get("data", [])) > 0, f"{len(body.get('data', []))} rows")
    check("duplicate 'trainlines' key removed", "trainlines" not in body)
    total = body.get("pagination", {}).get("total", 0)
    check("pagination.total exceeds one page", total > 100, f"total={total}")
    check("filters.systems present", len(body.get("filters", {}).get("systems", [])) > 0)
    first = body.get("data", [{}])[0]
    for field in ("wireNo", "itemName", "note", "voltageText", "carType",
                  "systemCode", "drawingNo"):
        check(f"trainline row exposes '{field}'", field in first)

section("/api/trainlines offset paging returns different rows")
_, p0, _ = get("/api/trainlines?limit=10&offset=0")
_, p1, _ = get("/api/trainlines?limit=10&offset=10")
if p0 and p1:
    ids0 = {r["id"] for r in p0.get("data", [])}
    ids1 = {r["id"] for r in p1.get("data", [])}
    check("offset=10 returns a different page", ids0.isdisjoint(ids1),
          f"{len(ids0)} vs {len(ids1)} rows, overlap={len(ids0 & ids1)}")

# ── /api/wires ──────────────────────────────────────────────────────────────
section("/api/wires — conductor class facet + honest search pagination")
status, body, ms = get("/api/wires?limit=50")
check("wires responds 200", status == 200, f"{ms}ms")
if body:
    check("returns wires", len(body.get("wires", [])) > 0, f"{len(body.get('wires', []))} rows")
    check("total is the full population",
          body.get("pagination", {}).get("total", 0) > 100000,
          f"total={body.get('pagination', {}).get('total')}")
    filters = body.get("filters", {})
    check("filters.conductorClasses exposed (Type dropdown source)",
          "conductorClasses" in filters,
          f"{len(filters.get('conductorClasses', []))} classes")
    check("filters.statuses exposed (VERIFIED/UNVERIFIED/DEPRECATED)",
          "statuses" in filters, f"{filters.get('statuses')}")
    w = body.get("wires", [{}])[0]
    check("wire row exposes conductorClassCode (page's 'Type')", "conductorClassCode" in w)
    check("wire row exposes wireStatus", "wireStatus" in w)

section("/api/wires search — hasMore must not stay true past reachable depth")
status, body, ms = get("/api/wires?search=300&limit=200&offset=0")
check("wire search responds 200", status == 200, f"{ms}ms")
if body:
    pg = body.get("pagination", {})
    check("search exposes 'reachable' depth", "reachable" in pg, f"reachable={pg.get('reachable')}")
    check("reachable never exceeds the 1000-row ranked window",
          pg.get("reachable", 0) <= 1000, f"reachable={pg.get('reachable')}")
    # The regression: limit=1000 + offset=1000 used to return [] with hasMore=true.
    _, deep, _ = get("/api/wires?search=300&limit=1000&offset=1000")
    if deep:
        dpg = deep.get("pagination", {})
        rows = len(deep.get("wires", []))
        check("deep search page does not claim more when it returns nothing",
              rows > 0 or dpg.get("hasMore") is False,
              f"rows={rows} hasMore={dpg.get('hasMore')}")

# ── /api/gsd ────────────────────────────────────────────────────────────────
section("/api/gsd — topology, system filter, and search action")
status, body, ms = get("/api/gsd?action=topology", timeout=120)
check("gsd topology responds 200", status == 200, f"{ms}ms")
check("gsd topology under 10s (Vercel limit)", ms < 10000, f"{ms}ms")
if body and body.get("success"):
    d = body["data"]
    check("topology returns nodes", len(d.get("nodes", [])) > 0, f"{len(d.get('nodes', []))} nodes")
    check("topology returns edges", len(d.get("edges", [])) > 0, f"{len(d.get('edges', []))} edges")
    check("topology returns all 30 systems", len(d.get("systems", [])) == 30,
          f"{len(d.get('systems', []))} systems")
    st = d.get("statistics", {})
    check("statistics.totalWires is real", st.get("totalWires", 0) > 100000,
          f"totalWires={st.get('totalWires')}")
    check("statistics.connectorCount is real", st.get("connectorCount", 0) > 0,
          f"connectorCount={st.get('connectorCount')}")
    ids = {n["id"] for n in d.get("nodes", [])}
    dangling = [e for e in d.get("edges", [])
                if e["source"] not in ids or e["target"] not in ids]
    check("no dangling edges", len(dangling) == 0, f"{len(dangling)} dangling")

section("/api/gsd?system=DOOR — SQL-side filter (used to return an empty graph)")
status, body, ms = get("/api/gsd?action=topology&system=DOOR", timeout=120)
check("DOOR topology responds 200", status == 200, f"{ms}ms")
if body and body.get("success"):
    d = body["data"]
    check("DOOR yields nodes (previously 0)", len(d.get("nodes", [])) > 0,
          f"{len(d.get('nodes', []))} nodes")
    check("DOOR yields edges (previously 0)", len(d.get("edges", [])) > 0,
          f"{len(d.get('edges', []))} edges")

section("/api/gsd?action=search — search must return matches, not the whole graph")
status, body, ms = get("/api/gsd?action=search&search=X1", timeout=120)
check("gsd search responds 200", status == 200, f"{ms}ms")
if body and body.get("success"):
    check("search returns a nodes array", isinstance(body["data"].get("nodes"), list),
          f"{len(body['data'].get('nodes', []))} matches")

# ── /api/drawings/lookup ────────────────────────────────────────────────────
section("/api/drawings/lookup — provenance + PDF page alignment + speed")
for dwg, expect_verified in (("942-58120", True), ("942-58161", False)):
    status, body, ms = get(f"/api/drawings/lookup?drawing_no={dwg}", timeout=60)
    check(f"lookup {dwg} responds 200", status == 200, f"{ms}ms")
    check(f"lookup {dwg} under 3000ms", ms < 3000, f"{ms}ms")
    if body and body.get("drawing"):
        d = body["drawing"]
        check(f"lookup {dwg} exposes titleVerified", "titleVerified" in d)
        check(f"lookup {dwg} titleVerified == {expect_verified}",
              d.get("titleVerified") is expect_verified,
              f"title={d.get('title')!r} source={d.get('titleSource')}")
        check(f"lookup {dwg} resolves a source PDF", bool(d.get("sourceFile")),
              f"{d.get('sourceFile')}")
        check(f"lookup {dwg} resolves a PDF page", d.get("pdfPageNo") is not None,
              f"page={d.get('pdfPageNo')} verified={d.get('pageVerified')}")

# ── /api/pins & /api/connectors regression guard ────────────────────────────
section("/api/pins & /api/connectors — still intact")
status, body, ms = get("/api/pins?limit=50", timeout=60)
check("pins responds 200", status == 200, f"{ms}ms")
if body:
    pins = body.get("pins", body.get("data", []))
    check("pins returns rows", len(pins) > 0, f"{len(pins)} rows")
    if pins:
        check("pin rows carry drawing_no (traceability chain)",
              "drawing_no" in pins[0], f"keys={sorted(pins[0].keys())[:8]}")
        check("pin rows carry a resolved equipment_code",
              "equipment_code" in pins[0])

status, body, ms = get("/api/connectors?limit=100&offset=0", timeout=60)
check("connectors responds 200", status == 200, f"{ms}ms")
if body:
    check("connectors returns rows", len(body.get("connectors", [])) > 0,
          f"{len(body.get('connectors', []))} rows")
    check("connectors exposes filters.systems for the dropdown",
          len(body.get("filters", {}).get("systems", [])) > 0)
    check("connectors exposes filters.cars for the dropdown",
          len(body.get("filters", {}).get("cars", [])) > 0)
    check("connectors pagination.total present",
          body.get("pagination", {}).get("total", 0) > 0,
          f"total={body.get('pagination', {}).get('total')}")

# ── summary ─────────────────────────────────────────────────────────────────
print(f"\n{'=' * 72}")
print(f"TOTAL: {passed + failed}    PASSED: {passed}    FAILED: {failed}")
print("=" * 72)
if failures:
    print("\nFailed checks:")
    for f in failures:
        print(f"  - {f}")
    sys.exit(1)
print("\n  All live API checks passed.")
