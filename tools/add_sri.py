#!/usr/bin/env python3
"""Add Subresource Integrity (integrity + crossorigin) to the CDN <script> and <link> tags in index.html.

Run it on a computer with internet access, from the project folder:

    python tools/add_sri.py            # edits index.html in place
    python tools/add_sri.py --check    # only reports, changes nothing

It downloads each CDN file, computes its SHA-384 hash and writes it into the tag, so the browser refuses a
file that was changed on the CDN. Safe to run again after you change a library version: old hashes are replaced.
Google Fonts CSS is skipped on purpose (Google serves different CSS per browser, so it cannot be pinned).
"""
import base64, hashlib, re, sys, urllib.request

PAGES = ["index.html"]
SKIP_HOSTS = ("fonts.googleapis.com", "fonts.gstatic.com")
TAG = re.compile(r'<(script|link)\b[^>]*>', re.I)

def attr(tag, name):
    m = re.search(r'\b%s\s*=\s*"([^"]*)"' % name, tag, re.I)
    return m.group(1) if m else None

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "destinify-sri/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()

def sri(data):
    return "sha384-" + base64.b64encode(hashlib.sha384(data).digest()).decode()

def strip_attr(tag, name):
    return re.sub(r'\s+%s\s*=\s*"[^"]*"' % name, "", tag, flags=re.I)

def process(path, check_only):
    html = open(path, encoding="utf-8").read()
    changed = 0
    def repl(m):
        nonlocal changed
        tag = m.group(0)
        kind = m.group(1).lower()
        url = attr(tag, "src" if kind == "script" else "href")
        if not url or not re.match(r"https?://", url):
            return tag
        if kind == "link" and (attr(tag, "rel") or "").lower() != "stylesheet":
            return tag
        if any(h in url for h in SKIP_HOSTS):
            return tag
        want = sri(fetch(url))
        have = attr(tag, "integrity")
        status = "ok     " if have == want else ("UPDATE " if have else "ADD    ")
        print(status, want[:22] + "...", url)
        if have == want and attr(tag, "crossorigin") == "anonymous":
            return tag
        changed += 1
        new = strip_attr(strip_attr(tag, "integrity"), "crossorigin")
        return new[:-1].rstrip() + ' integrity="%s" crossorigin="anonymous">' % want
    out = TAG.sub(repl, html)
    if changed and not check_only:
        open(path, "w", encoding="utf-8", newline="").write(out)
    return changed

if __name__ == "__main__":
    check = "--check" in sys.argv
    total = sum(process(p, check) for p in PAGES)
    print("\n%d tag(s) %s." % (total, "need changes" if check else "updated") if total else "\nNothing to change.")
