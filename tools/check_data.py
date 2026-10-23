#!/usr/bin/env python3
"""Data checks for assets/data.js. Run:  python tools/check_data.py   (optional: pip install reverse_geocoder)

1. Structure: unique names, valid fields, coordinates inside the Philippines, months 1-12, known province.
2. Coordinates vs GeoNames (offline): the nearest GeoNames place must be in the same region as the province says,
   and a destination named after a GeoNames town must sit within a few km of that town.
3. Budget sanity: per-day budget outliers by type.
Flags are things to look at, not proof of an error (border places and islands trip the region check)."""
import json, re, sys, math, statistics, collections
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
raw = (ROOT / "assets/data.js").read_text(encoding="utf-8")
rows = [l.split("|") for l in raw[raw.index("`") + 1:raw.rindex("`")].strip().split("\n")]
rj = (ROOT / "assets/regions.js").read_text(encoding="utf-8")
m = re.search(r"\bPROV_REGION\s*=\s*", rj); PROV = json.JSONDecoder().raw_decode(rj[m.end():])[0]
bad = []
seen = set()
for r in rows:
    n, prov, g, la, ln, typ, bud, days, acts, pop = r[:10]
    bm = (r[10] if len(r) > 10 else "11-5").split("-")
    if n in seen: bad.append(f"{n}: duplicate name")
    seen.add(n)
    if prov not in PROV: bad.append(f"{n}: province '{prov}' not in PROV_REGION")
    if not (4.5 <= float(la) <= 21.5 and 116 <= float(ln) <= 127): bad.append(f"{n}: coordinates {la},{ln} outside the Philippines")
    if not all(b.isdigit() and 1 <= int(b) <= 12 for b in bm): bad.append(f"{n}: best months {bm}")
    if not (500 <= int(bud) <= 200000 and 1 <= int(days) <= 30): bad.append(f"{n}: budget/days {bud}/{days}")
print(f"{len(rows)} destinations. Structure problems: {len(bad)}"); [print("  ", b) for b in bad]

try:
    import reverse_geocoder as rg, csv, os
except ImportError:
    sys.exit("Install reverse_geocoder to run the coordinate check:  pip install reverse_geocoder")
REGMAP = {"NCR": ["Metro Manila", "Metropolitan Manila", "Calabarzon", "Central Luzon"], "CAR": ["Cordillera", "Ilocos", "Cagayan Valley"],
 "R1": ["Ilocos", "Cordillera", "Central Luzon"], "R2": ["Cagayan Valley", "Cordillera", "Central Luzon"], "R3": ["Central Luzon", "Calabarzon", "Metro Manila", "Cagayan Valley"],
 "R4A": ["Calabarzon", "Central Luzon", "Metro Manila", "Bicol"], "R4B": ["Mimaropa", "Calabarzon", "Western Visayas"], "R5": ["Bicol", "Calabarzon", "Eastern Visayas"],
 "R6": ["Western Visayas", "Negros Island", "Central Visayas"], "R7": ["Central Visayas", "Negros Island", "Western Visayas"], "R8": ["Eastern Visayas", "Central Visayas", "Caraga"],
 "R9": ["Zamboanga Peninsula", "Northern Mindanao"], "R10": ["Northern Mindanao", "Zamboanga Peninsula", "Caraga", "Davao", "Autonomous Region in Muslim Mindanao"],
 "R11": ["Davao", "Soccsksargen", "Caraga", "Northern Mindanao"], "R12": ["Soccsksargen", "Davao", "Autonomous Region in Muslim Mindanao"],
 "R13": ["Caraga", "Northern Mindanao", "Davao", "Eastern Visayas"], "BARMM": ["Autonomous Region in Muslim Mindanao", "Bangsamoro", "Soccsksargen", "Zamboanga Peninsula", "Davao"],
 "NIR": ["Negros Island", "Western Visayas", "Central Visayas"]}
# GeoNames' region labels are old and sometimes odd (parts of Metro Manila labelled Calabarzon, Region XII labelled Davao),
# so the tolerance lists above are deliberately wide: a flag below means "look at this", not "this is wrong".
pts = [(float(r[3]), float(r[4])) for r in rows]
hits = rg.search(pts, mode=1)
hav = lambda a, b, c, d: 12742 * math.asin(math.sqrt(math.sin(math.radians(c - a) / 2) ** 2 + math.cos(math.radians(a)) * math.cos(math.radians(c)) * math.sin(math.radians(d - b) / 2) ** 2))
norm = lambda s: re.sub(r"[^a-z]", "", s.lower().replace("city of ", "").replace(" city", ""))
csvp = os.path.join(os.path.dirname(rg.__file__), "rg_cities1000.csv")
towns = collections.defaultdict(list)
for row in csv.DictReader(open(csvp, encoding="utf-8")):
    if row["cc"] == "PH": towns[norm(row["name"])].append((float(row["lat"]), float(row["lon"]), row["admin1"], row["admin2"]))
flags, remote = [], []
for r, h in zip(rows, hits):
    n, prov = r[0], r[1]; la, ln = float(r[3]), float(r[4]); rc = PROV.get(prov)
    ok = [x.lower() for x in REGMAP.get(rc, [])]
    d = hav(la, ln, float(h["lat"]), float(h["lon"]))
    if ok and not any(o in h["admin1"].lower() or h["admin1"].lower() in o for o in ok):
        flags.append((n, f"{prov} ({rc}) but nearest town {h['name']} is in {h['admin1']}, {d:.0f} km away"))
    if d > 40:
        remote.append((n, f"{d:.0f} km from the nearest GeoNames town ({h['name']})"))
    same = [t for t in towns.get(norm(re.sub(r",.*", "", n)), []) if norm(prov) in norm(t[3])]   # same-named town in the same province
    if same:
        t = min(same, key=lambda t: hav(la, ln, t[0], t[1])); dd = hav(la, ln, t[0], t[1])
        if dd > 12: flags.append((n, f"GeoNames has a town of this name in {prov}, but it is {dd:.0f} km away ({t[0]:.3f},{t[1]:.3f})"))
print(f"\nCoordinate flags: {len(flags)}"); [print("  ", n, "-", w) for n, w in flags]
print(f"\nRemote places (fine for islands and reefs, but check the pin is on land or the right waters): {len(remote)}"); [print("  ", n, "-", w) for n, w in remote]

by = collections.defaultdict(list)
for r in rows: by[r[5]].append(int(r[6]) / int(r[7]))
print("\nBudget per day by type (median, flags are beyond 2.5x median):")
out = []
for r in rows:
    med = statistics.median(by[r[5]]); pd = int(r[6]) / int(r[7])
    if pd > 2.5 * med or pd < med / 2.5: out.append((r[0], r[5], int(r[6]), int(r[7]), round(pd), round(med)))
print(f"  {len(out)} outliers"); [print("  ", *o) for o in out[:40]]
