#!/usr/bin/env python3
"""Builds the database files from the site's own data, so the database can never drift from data.js again.

    python tools/build_sql.py

Reads   assets/data.js, assets/details.js, assets/regions.js, api/regions_map.php
Writes  database/destinify.sql   fresh install (drops and recreates every table)
        database/upgrade.sql     safe for an existing database: adds missing columns/tables and upserts all places,
                                 never touches users, reviews, favorites or trips

Destination ids that already exist in the current database/destinify.sql are kept, so saved trips, favorites and reviews
keep pointing at the same places. New places get new ids after the highest existing one.

"Kept" means kept relative to the destinify.sql in this repository. A database that was built from an OLDER copy of that
file can number places differently, so upgrade.sql starts with a safety check that stops before changing anything when
the ids do not match (see README, "Upgrading an existing database").

If a place was removed or renamed in data.js, this script stops and lists it, because its id would silently disappear
(and the highest id could be handed out again). Run it with --allow-removals when that is what you want."""
import json, re, sys, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
read = lambda p: (ROOT / p).read_text(encoding="utf-8")

def backtick(js, var):
    m = re.search(r"\b%s\s*=\s*`(.*?)`" % var, js, re.S)
    return m.group(1).strip().split("\n")

def jsvalue(js, var):
    m = re.search(r"\b(?:const|var|let)\s+%s\s*=\s*" % var, js)
    return json.JSONDecoder().raw_decode(js[m.end():])[0]

raw = backtick(read("assets/data.js"), "RAW")
det = {l.split("|")[0]: l.split("|") for l in backtick(read("assets/details.js"), "DET")}
rj = read("assets/regions.js")
REGIONS, PROV, TIKTOK = jsvalue(rj, "REGIONS"), jsvalue(rj, "PROV_REGION"), set(jsvalue(rj, "TIKTOK"))
rname = {r["c"]: r["n"] for r in REGIONS}

# keep ids from the existing sql so references stay valid
old = {}
sql_path = ROOT / "database" / "destinify.sql"
if sql_path.exists():
    for m in re.finditer(r"^\((\d+),'((?:[^']|'')*)'", sql_path.read_text(encoding="utf-8"), re.M):
        old[m.group(2).replace("''", "'")] = int(m.group(1))
nxt = max(old.values(), default=0) + 1

q = lambda s: "'" + str(s).replace("\\", "\\\\").replace("'", "''") + "'"
rows, problems, names, pairs = [], [], set(), []
for line in raw:
    f = line.split("|")
    n, prov, g, la, ln, typ, bud, days, acts, pop = f[:10]
    bm = (f[10] if len(f) > 10 else "11-5").split("-")
    if n in names: problems.append("duplicate name: " + n)
    names.add(n)
    did = old.get(n)
    if did is None: did, nxt = nxt, nxt + 1
    pairs.append((did, n))
    rc = PROV.get(prov)
    if not rc: problems.append("province not in PROV_REGION: %s (%s)" % (prov, n)); rc = ""
    d = det.get(n, [n, "", "", ""]) + ["", "", ""]
    rows.append("(%d,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%d,0)" % (
        did, q(n), q(prov), q(g), la, ln, q(typ), bud, days, q(acts.replace(" ", ",")), pop, bm[0], bm[1],
        q(d[1]), q(d[2]), q(d[3]), q(rc), q(rname.get(rc, "")), "0", 1 if n in TIKTOK else 0))
if problems:
    print("\n".join(problems)); sys.exit("fix the problems above first")
dropped = sorted((i, n) for n, i in old.items() if n not in names)
if dropped and "--allow-removals" not in sys.argv:
    print("In the current database/destinify.sql but no longer in data.js (removed or renamed):")
    print("\n".join("  id %d  %s" % d for d in dropped[:40]) + ("\n  ..." if len(dropped) > 40 else ""))
    sys.exit("Their ids would disappear and could be reused. Restore the names, or re-run with --allow-removals.")

COLS = "id,name,province,region_group,lat,lng,type,budget_php,days,activities,popular,best_start,best_end,description,getting_there,tip,region_code,region_name,_x,tiktok,hidden"
COLS = COLS.replace("_x,", "")
rows = [re.sub(r",0,(\d),0\)$", r",\1,0)", r) for r in rows]   # drop the placeholder column
regions_sql = "INSERT INTO regions (code,name,short) VALUES\n" + ",\n".join(
    "(%s,%s,%s)" % (q(r["c"]), q(r["n"]), q(r.get("s", r["c"]))) for r in REGIONS) + ";\n"
upd = ",".join("%s=VALUES(%s)" % (c, c) for c in COLS.split(",")[1:] if c != "hidden")
def inserts(upsert):
    out = []
    for i in range(0, len(rows), 100):
        s = "INSERT INTO destinations (%s) VALUES\n%s" % (COLS, ",\n".join(rows[i:i + 100]))
        out.append(s + ("\nON DUPLICATE KEY UPDATE " + upd if upsert else "") + ";\n")
    return "\n".join(out)

TABLES = """CREATE TABLE regions (
  code VARCHAR(10) PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  short VARCHAR(20) NOT NULL
) ENGINE=InnoDB;
CREATE TABLE destinations (
  id INT UNSIGNED PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  province VARCHAR(80) NOT NULL,
  region_group CHAR(1) NOT NULL COMMENT 'L Luzon and Palawan, V Visayas, M Mindanao',
  lat DECIMAL(8,5) NOT NULL,
  lng DECIMAL(8,5) NOT NULL,
  type VARCHAR(20) NOT NULL,
  budget_php INT UNSIGNED NOT NULL COMMENT 'approx per person for the suggested stay',
  days TINYINT UNSIGNED NOT NULL,
  activities VARCHAR(60) NOT NULL COMMENT 'comma-separated codes, e.g. hk,cv,cm',
  popular TINYINT(1) NOT NULL DEFAULT 0,
  best_start TINYINT UNSIGNED NOT NULL DEFAULT 11,
  best_end TINYINT UNSIGNED NOT NULL DEFAULT 5,
  description TEXT,
  getting_there TEXT,
  tip TEXT,
  region_code VARCHAR(10) NOT NULL DEFAULT '',
  region_name VARCHAR(80) NOT NULL DEFAULT '',
  tiktok TINYINT(1) NOT NULL DEFAULT 0,
  hidden TINYINT(1) NOT NULL DEFAULT 0,
  KEY idx_group (region_group),
  KEY idx_type (type),
  KEY idx_region (region_code)
) ENGINE=InnoDB;
CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(40) NOT NULL UNIQUE,
  display_name VARCHAR(60) NOT NULL,
  role ENUM('traveler','admin') NOT NULL DEFAULT 'traveler',
  password_hash VARCHAR(255) NOT NULL COMMENT 'PHP password_hash(), never plain text',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE reviews (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  destination_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment VARCHAR(300) NOT NULL,
  photo MEDIUMTEXT NULL COMMENT 'optional photo, a resized image as a data URL',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  edited_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE favorites (
  user_id INT UNSIGNED NOT NULL,
  destination_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, destination_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE trip_stops (
  user_id INT UNSIGNED NOT NULL,
  position SMALLINT UNSIGNED NOT NULL,
  destination_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, position),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE user_profiles (
  user_id INT UNSIGNED NOT NULL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL DEFAULT '',
  email VARCHAR(150) NOT NULL DEFAULT '',
  phone VARCHAR(30) NOT NULL DEFAULT '',
  home_city VARCHAR(80) NOT NULL DEFAULT '',
  bio VARCHAR(200) NOT NULL DEFAULT '',
  budget INT UNSIGNED NOT NULL DEFAULT 8000,
  fav_types VARCHAR(300) NOT NULL DEFAULT '',
  avatar MEDIUMTEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE admin_log (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  message VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE rate_limits (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bucket VARCHAR(80) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_bucket_time (bucket, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE site_settings (
  k VARCHAR(40) NOT NULL PRIMARY KEY COMMENT 'contact_email, content',
  v MEDIUMTEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE password_resets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NULL COMMENT 'NULL while it is only a request waiting for an admin',
  via VARCHAR(10) NOT NULL DEFAULT 'user',
  requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NULL,
  used_at DATETIME NULL,
  INDEX idx_token (token_hash),
  INDEX idx_user (user_id),
  CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE site_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kind VARCHAR(10) NOT NULL COMMENT 'view or search',
  ref VARCHAR(120) NOT NULL COMMENT 'destination id, or the search words',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_kind_time (kind, created_at),
  INDEX idx_kind_ref (kind, ref)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
"""
head = "-- Destinify database (%d destinations). Generated by tools/build_sql.py from assets/data.js. Do not edit by hand.\n" % len(rows)
fresh = (head + "-- Fresh install. In phpMyAdmin: Import tab, choose this file, Import. This DROPS and recreates every table.\n"
  "CREATE DATABASE IF NOT EXISTS destinify_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\nUSE destinify_app;\nSET NAMES utf8mb4;\n\n"
  "SET FOREIGN_KEY_CHECKS=0;\nDROP TABLE IF EXISTS site_events, password_resets, site_settings, rate_limits, admin_log, user_profiles, trip_stops, favorites, reviews, users, destinations, regions;\nSET FOREIGN_KEY_CHECKS=1;\n\n"
  + TABLES + "\n" + regions_sql + "\n" + inserts(False))
(ROOT / "database" / "destinify.sql").write_text(fresh, encoding="utf-8")

alter = ("ALTER TABLE destinations\n  ADD COLUMN IF NOT EXISTS region_code VARCHAR(10) NOT NULL DEFAULT '',\n"
  "  ADD COLUMN IF NOT EXISTS region_name VARCHAR(80) NOT NULL DEFAULT '',\n  ADD COLUMN IF NOT EXISTS tiktok TINYINT(1) NOT NULL DEFAULT 0;\n"
  "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS photo MEDIUMTEXT NULL COMMENT 'optional photo, a resized image as a data URL';\n"
  "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP NULL DEFAULT NULL;\n")
extra = TABLES[TABLES.index("CREATE TABLE user_profiles"):].replace("CREATE TABLE ", "CREATE TABLE IF NOT EXISTS ")
reg = TABLES[:TABLES.index("CREATE TABLE destinations")].replace("CREATE TABLE ", "CREATE TABLE IF NOT EXISTS ")
CS = "CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci"
guard = ("-- SAFETY CHECK: stop before changing anything if this database numbers its places differently from this file.\n"
  "-- Saved trips, favorites and reviews point at ids, so writing by id would attach them to the wrong places.\n"
  "-- If it stops with an error mentioning STOP_ids_differ_see_README_Upgrading, nothing was changed by this check:\n"
  "-- read README > Upgrading an existing database.\n"
  "CREATE TEMPORARY TABLE _new_ids (id INT UNSIGNED NOT NULL, name VARCHAR(120) NOT NULL) %s;\n" % CS
  + "INSERT INTO _new_ids (id,name) VALUES\n" + ",\n".join("(%d,%s)" % (i, q(n)) for i, n in pairs) + ";\n"
  "CREATE TEMPORARY TABLE _id_guard (v TINYINT NOT NULL, UNIQUE KEY STOP_ids_differ_see_README_Upgrading (v));\n"
  "INSERT INTO _id_guard (v)\n  SELECT 1 FROM destinations d JOIN _new_ids n\n"
  "    ON (n.name COLLATE utf8mb4_unicode_ci = d.name COLLATE utf8mb4_unicode_ci AND n.id <> d.id)\n"
  "    OR (n.id = d.id AND n.name COLLATE utf8mb4_unicode_ci <> d.name COLLATE utf8mb4_unicode_ci)\n"
  "  CROSS JOIN (SELECT 1 AS k UNION ALL SELECT 2) x;\n"
  "DROP TEMPORARY TABLE _id_guard;\nDROP TEMPORARY TABLE _new_ids;\n\n")
upgrade = (head + "-- Upgrade for an existing database. Safe to run more than once. Keeps users, reviews, favorites and trips.\n"
  "-- Adds the missing columns and tables, then adds or refreshes every destination (hidden flags are kept).\n"
  "-- Only for a database created from the destinify.sql that is in this repository (same destination ids).\n"
  "-- It checks that first and stops with a clear error if the ids differ. Otherwise see README > Upgrading.\n"
  "USE destinify_app;\nSET NAMES utf8mb4;\n\n" + guard + reg + alter + extra + "\n"
  "INSERT INTO regions (code,name,short) VALUES\n" + ",\n".join("(%s,%s,%s)" % (q(r["c"]), q(r["n"]), q(r.get("s", r["c"]))) for r in REGIONS)
  + "\nON DUPLICATE KEY UPDATE name=VALUES(name), short=VALUES(short);\n\n" + inserts(True)
  + "\n-- A place that is no longer in data.js is hidden, not deleted, so its reviews are kept.\nUPDATE destinations SET hidden=1 WHERE region_code='';\n")
(ROOT / "database" / "upgrade.sql").write_text(upgrade, encoding="utf-8")
print("%d destinations (%d new ids), %d regions" % (len(rows), sum(1 for n in names if n not in old), len(REGIONS)))
