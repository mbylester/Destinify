/* Destinify API bridge. Connects the site to the PHP + MySQL backend in /api when it is available.
   It runs before app.js. If the backend is not reachable (for example on GitHub Pages), it does nothing and
   the site keeps using data.js and the browser's own storage, exactly as before.

   When the backend is reachable it:
   - loads every destination from MySQL instead of data.js and details.js
   - replaces the demo sign-in with real accounts (passwords are hashed on the server)
   - saves each user's trip and favorites to the database, and stores reviews there
   - sends admin actions (add destination, hide or restore) to the database */
(function () {
  "use strict";
  var API = "api/";
  var rawSet = Storage.prototype.setItem;
  var get = function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  var put = function (k, v) { rawSet.call(localStorage, k, JSON.stringify(v)); };

  // synchronous call, used once at start-up so app.js can build its list from the database
  function call(method, url) {
    var x = new XMLHttpRequest();
    try {
      x.open(method, API + url, false);
      x.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      x.send(null);
    } catch (e) { return null; }
    if (x.status !== 200) return null;
    try { var j = JSON.parse(x.responseText); return j && j.ok ? j : null; } catch (e) { return null; }
  }
  function post(url, body) {
    return fetch(API + url, {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
      body: JSON.stringify(body || {})
    }).then(function (r) { return r.json().catch(function () { return { ok: false, error: "Server error" }; }); })
      .catch(function () { return { ok: false, error: "Could not reach the server." }; });
  }

  var d = call("GET", "destinations.php");
  if (!d || typeof RAW === "undefined") return;           // static mode: nothing changes

  /* ---------- 1. destinations from the database ---------- */
  RAW = d.raw; DET = d.det;
  var IDS = d.ids.slice(), idx = {};
  IDS.forEach(function (id, i) { idx[id] = i; });
  if (typeof TIKTOK !== "undefined" && d.tiktok) { TIKTOK.length = 0; Array.prototype.push.apply(TIKTOK, d.tiktok); }
  window.DB_MODE = true; window.DB_IDS = IDS;
  put("dhide", d.hidden || []);                            // hidden destinations come from the server
  localStorage.removeItem("dcustom");                      // admin-added places now live in the database

  /* ---------- 2. session, trip, favorites, reviews ---------- */
  var m = call("GET", "auth.php?action=me"), ME = m && m.user ? m.user : null;
  var toIdx = function (a) { return (a || []).map(function (id) { return idx[id]; }).filter(function (i) { return i !== undefined; }); };
  var lastState = "";
  if (ME) {
    var shadow = { u: ME.username, n: ME.name, role: ME.role, p: "", trip: toIdx(m.state.trip), fav: toIdx(m.state.fav) };
    put("dusers", [shadow]); put("dsess", ME.username);
    lastState = JSON.stringify({ trip: m.state.trip, fav: m.state.fav });
  } else { put("dusers", []); put("dsess", ""); }

  var rv = call("GET", "reviews.php?all=1"), drev = {};
  if (rv) Object.keys(rv.byDest).forEach(function (id) { if (idx[id] !== undefined) drev[idx[id]] = rv.byDest[id]; });
  put("drev", drev);
  var revCount = {};
  Object.keys(drev).forEach(function (i) { revCount[i] = drev[i].length; });
  var serverHidden = {};
  (d.hidden || []).forEach(function (n) { serverHidden[n] = 1; });
  var pushedCustom = {};

  /* ---------- 3. keep the database in step with what the page saves ---------- */
  var timers = {};
  function later(k, f) { clearTimeout(timers[k]); timers[k] = setTimeout(f, 350); }

  function pushState() {
    if (!ME) return;
    var us = get("dusers") || [], u = us.filter(function (x) { return x.u === get("dsess"); })[0];
    if (!u || u.u !== ME.username) return;
    var ids = function (a) { return (a || []).map(function (i) { return IDS[i]; }).filter(Boolean); };
    var payload = { trip: ids(u.trip), fav: ids(u.fav) }, j = JSON.stringify(payload);
    if (j === lastState) return;
    lastState = j; post("state.php", payload);
  }
  function pushReviews() {
    if (!ME) return;
    var r = get("drev") || {};
    Object.keys(r).forEach(function (i) {
      var before = revCount[i] || 0, list = r[i] || [];
      if (list.length <= before) return;
      list.slice(before).forEach(function (x) {
        if (x.u === ME.name && IDS[i]) post("reviews.php", { destination_id: IDS[i], rating: x.r, comment: x.c });
      });
      revCount[i] = list.length;
    });
  }
  function pushCustom() {
    var c = get("dcustom") || [];
    if (!c.length || !ME || ME.role !== "admin") return;
    c.forEach(function (o) {
      if (pushedCustom[o.n]) return; pushedCustom[o.n] = 1;
      post("admin.php", { action: "add", name: o.n, province: o.p, g: o.g, lat: o.la, lng: o.ln, type: o.t, budget: o.b, days: o.d, activities: o.a, popular: o.o, description: o.desc })
        .then(function (r) {
          put("dcustom", (get("dcustom") || []).filter(function (x) { return x.n !== o.n; }));   // the database is the source of truth
          if (r.ok) { var i = D.findIndex(function (x) { return x.n === o.n; }); if (i >= 0) IDS[i] = r.id; }
          else alert("Could not save " + o.n + " to the database: " + (r.error || "unknown error"));
        });
    });
  }
  function pushHide() {
    if (!ME || ME.role !== "admin") return;
    var h = get("dhide") || [], now = {};
    h.forEach(function (n) { now[n] = 1; });
    var names = Object.keys(now).concat(Object.keys(serverHidden)).filter(function (n, k, a) { return a.indexOf(n) === k; });
    names.forEach(function (n) {
      if (!!now[n] === !!serverHidden[n]) return;
      var i = D.findIndex(function (x) { return x.n === n; });
      if (i < 0 || !IDS[i]) return;
      if (now[n]) serverHidden[n] = 1; else delete serverHidden[n];
      post("admin.php", { action: "hide", destination_id: IDS[i], hidden: now[n] ? 1 : 0 });
    });
  }
  Storage.prototype.setItem = function (k) {
    rawSet.apply(this, arguments);
    if (this !== localStorage) return;
    if (k === "dusers") later(k, pushState);
    else if (k === "drev") later(k, pushReviews);
    else if (k === "dcustom") later(k, pushCustom);
    else if (k === "dhide") later(k, pushHide);
  };

  /* ---------- 4. real sign-in and sign-up ---------- */
  function authModal(mode) {
    var up = mode === "up";
    DX.show(up ? "Create account" : "Sign in",
      '<div id="xerr" class="note" style="color:var(--coral-d)"></div>' +
      (up ? '<input id="bn" class="form-control mb-2" placeholder="Display name">' : "") +
      '<input id="bu" class="form-control mb-2" placeholder="Username" autocomplete="username">' +
      '<input id="bp" type="password" class="form-control mb-3" placeholder="Password (6+ characters)" autocomplete="' + (up ? "new-password" : "current-password") + '">' +
      '<button class="btn btn-c" data-xb="' + (up ? "up" : "in") + '">' + (up ? "Sign up" : "Sign in") + '</button> ' +
      '<button class="btn btn-l" data-xb="' + (up ? "swi" : "swu") + '">' + (up ? "I have an account" : "Create account") + '</button>' +
      '<p class="note mt-3">Your account is stored in the Destinify database. Passwords are hashed, never saved as plain text.</p>');
  }
  var err = function (t) { var e = document.getElementById("xerr"); if (e) e.textContent = t; };
  function authAction(a) {
    if (a === "swu") return authModal("up");
    if (a === "swi") return authModal("in");
    var u = document.getElementById("bu").value.trim(), p = document.getElementById("bp").value, n = (document.getElementById("bn") || {}).value || "";
    if (!u || p.length < 6) return err("Enter a username and a password of 6+ characters.");
    var guest = { trip: get("dtrip") || [], fav: get("dfav") || [] };
    post("auth.php?action=" + (a === "up" ? "register" : "login"), { username: u, password: p, name: n }).then(function (r) {
      if (!r.ok) return err(r.error || "Something went wrong.");
      // a new account keeps what the visitor already saved as a guest
      var ids = function (arr) { return (arr || []).map(function (i) { return IDS[i]; }).filter(Boolean); };
      var carry = a === "up" ? post("state.php", { trip: ids(guest.trip), fav: ids(guest.fav) }) : Promise.resolve();
      carry.then(function () { location.reload(); });
    });
  }
  function saveProfile() {
    var n = (document.getElementById("pn") || {}).value || "", p = (document.getElementById("pw") || {}).value || "";
    post("auth.php?action=profile", { name: n, password: p }).then(function (r) { if (r.ok) location.reload(); else err(r.error || "Could not save."); });
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target : null; if (!t) return;
    if (t.closest('[data-x="auth"]')) {
      e.stopImmediatePropagation(); e.preventDefault();
      if (ME) post("auth.php?action=logout").then(function () { put("dsess", ""); location.reload(); }); else authModal("in");
      return;
    }
    if (t.closest('[data-x2="psave"]')) { e.stopImmediatePropagation(); e.preventDefault(); saveProfile(); return; }
    var b = t.closest("[data-xb]");
    if (b) { e.stopImmediatePropagation(); e.preventDefault(); authAction(b.dataset.xb); }
  }, true);

  document.addEventListener("DOMContentLoaded", function () {
    var f = document.querySelector("footer .wrap");
    if (f) f.insertAdjacentHTML("beforeend", '<span style="opacity:.75">Database: connected (' + IDS.length + ' places)</span>');
  });
  window.DBAPI = { on: true, ids: IDS, me: function () { return ME; }, post: post };
})();
