/* Destinify site content store (SC). Holds everything the admin can edit without touching the code:
   festivals, the Travel tips cards, section headings, photo overrides for destinations, the default match weights and
   default budget, and the feedback email. It loads after api-bridge.js and before app.js, so the other scripts can read it.

   Where it is saved:
   - with the PHP + MySQL backend: in the site_settings table (the admin console saves it through api/admin.php)
   - on static hosting: in this browser only (localStorage keys "dcontent" and "dcontact"), so it only affects the person
     who edited it. To change what every visitor sees on static hosting, edit the files instead (see README).

   Shape of SC.data (every key is optional; a missing key means "use the built-in default"):
     fest   [{n,d,m:[months],w,x}]       festivals and events
     tips   {time|weather|money|go|pack|safe|culture|regions: {cards:[{t,k,l,n,w}]}}
     text   {fstT,fstS,insT,insS,tipsT,tipsS}   section headings
     img    {"Destination name": "https://…"}   photo overrides
     w      {t,a,b,du,s}                 default match weights
     b      number                       default budget per person */
(function () {
  "use strict";
  var DB = !!(window.DBAPI && window.DBAPI.on);
  var R = window.SITE_REMOTE || {};
  var rd = function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  var isObj = function (o) { return o && typeof o === "object" && !Array.isArray(o); };

  var data = DB ? R.content : rd("dcontent");
  if (!isObj(data)) data = {};
  var contact = DB ? String(R.contact || "") : String(rd("dcontact") || "");
  var subs = [];

  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  var SC = {
    data: data,
    db: DB,
    contact: function () { return contact; },
    on: function (f) { subs.push(f); },
    emit: function () { subs.forEach(function (f) { try { f(); } catch (e) { console.warn("Destinify content:", e); } }); },

    /* Saves the whole content object. Resolves to {ok, error?}. */
    save: function () {
      var json = JSON.stringify(data);
      if (DB) return window.DBAPI.post("admin.php", { action: "setting", key: "content", value: json });
      try { localStorage.setItem("dcontent", json); return Promise.resolve({ ok: true }); }
      catch (e) { return Promise.resolve({ ok: false, error: "This browser has no room left to save that." }); }
    },
    /* Saves the feedback email. */
    saveContact: function (v) {
      v = String(v || "").trim();
      if (v && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v)) return Promise.resolve({ ok: false, error: "That email address does not look right." });
      var done = function (r) { if (r.ok) { contact = v; SC.emit(); } return r; };
      if (DB) return window.DBAPI.post("admin.php", { action: "setting", key: "contact_email", value: v }).then(done);
      try { localStorage.setItem("dcontact", JSON.stringify(v)); return Promise.resolve(done({ ok: true })); }
      catch (e) { return Promise.resolve({ ok: false, error: "This browser has no room left to save that." }); }
    },
    /* A heading or paragraph the admin may have replaced. */
    txt: function (k, def) { var t = data.text && data.text[k]; return typeof t === "string" && t.trim() ? t.trim() : def; },
    /* Text to HTML: everything is escaped first, then **bold** and [label](https://link) are allowed. */
    rich: function (s) {
      var h = esc(s);
      h = h.replace(/\[([^\]]{1,80})\]\((https?:\/\/[^\s)"'<>]{1,300})\)/g, function (m, t, u) { return '<a href="' + u + '" target="_blank" rel="noopener">' + t + "</a>"; });
      return h.replace(/\*\*([^*]{1,200})\*\*/g, "<b>$1</b>");
    },
    /* Photo overrides: only https image links are used. */
    applyImg: function (name) {
      if (typeof IMG_URL === "undefined") return;
      var m = data.img || {};
      Object.keys(m).forEach(function (n) { if (!name || n === name) { if (/^https:\/\//.test(m[n])) IMG_URL[n] = m[n]; else delete IMG_URL[n]; } });
    }
  };
  window.SC = SC;

  SC.applyImg();
  /* default budget on the filter panel (the weights are read in app.js) */
  var rb = document.getElementById("rb");
  if (rb && +data.b >= 1000 && +data.b <= 30000) rb.value = +data.b;
})();
