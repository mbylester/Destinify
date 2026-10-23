/* Destinify v13 launch kit: new logo styles, reliable My trip actions (route, map, calendar, print, copy, share),
   profile with photo and details, admin console, feedback, About / Privacy / Terms, first-visit tour, install button.
   Set CFG.contactEmail to receive feedback by email. */
(()=>{
const CFG={contactEmail:""};
const{LS,esc,V}=DX,API=()=>!!(window.DBAPI&&DBAPI.on),U=()=>DX.U(),ADM=()=>U()&&U().role=="admin";
const norm=s=>String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const err=t=>{const e=$("xerr");if(e)e.textContent=t};
/* ---------- toast + helpers ---------- */
document.body.insertAdjacentHTML("beforeend",'<div id="xtoast" role="status" aria-live="polite"></div>');
let tt;const toast=m=>{const e=$("xtoast");e.textContent=m;e.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>e.classList.remove("on"),2800)};
async function cp(t){try{await navigator.clipboard.writeText(t);return 1}catch(e){}
 try{const a=document.createElement("textarea");a.value=t;a.style.cssText="position:fixed;opacity:0";document.body.appendChild(a);a.select();const ok=document.execCommand("copy");a.remove();if(ok)return 1}catch(e){}
 prompt("Copy this text:",t);return 0}
const dl=(n,txt,type)=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=n;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},600)};
const csv=r=>r.map(x=>x.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
/* ---------- My trip: reliable actions ---------- */
const stopsT=()=>st.trip.map(i=>D[i]).filter(Boolean);
const _rt=renderTrip;renderTrip=()=>{_rt();const b=$("tripBody"),a=b.querySelector(".xact");
 if(a)a.innerHTML='<button class="btn btn-d" data-x10="opt">✨ Optimize route</button><button class="btn btn-c" data-x4="plan">🗓 Day planner</button><button class="btn btn-l" data-x10="map">🗺 See on map</button>';
 const ex=[...b.querySelectorAll(".xbox")].find(x=>/EXPORT/.test(x.textContent)),m=ex&&ex.querySelector(".macts");
 if(m)m.innerHTML='<button class="btn btn-d" data-x10="ics">📅 Add to calendar</button><button class="btn btn-l" data-x10="print">🖨 Print</button><button class="btn btn-l" data-x10="copy">📋 Copy itinerary</button><button class="btn btn-c" data-x10="share">🔗 Share trip</button>'};
function toMap(){const pn=$("tripPanel"),go=()=>{$("mapsection").scrollIntoView({behavior:"smooth"});try{map.invalidateSize();const T=stopsT();if(T.length)map.fitBounds(L.latLngBounds(T.map(d=>[d.la,d.ln])).pad(.25),{maxZoom:9})}catch(e){}};
 const inst=bootstrap.Offcanvas.getInstance(pn);if(inst&&pn.classList.contains("show")){pn.addEventListener("hidden.bs.offcanvas",()=>setTimeout(go,80),{once:true});inst.hide()}else go()}
function ics(){const T=stopsT();if(!T.length)return toast("Add a stop first");
 let t=new Date((($("xsd")||{}).value||new Date(Date.now()+12096e5).toISOString().slice(0,10))+"T00:00:00Z").getTime();
 const f=x=>new Date(x).toISOString().slice(0,10).replace(/-/g,""),z=s=>String(s).replace(/[\\,;]/g,m=>"\\"+m),s0=new Date().toISOString().replace(/[-:]|\.\d+/g,"");
 const L2=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Destinify//EN","CALSCALE:GREGORIAN"];
 T.forEach(d=>{const a=t,b=t+864e5*d.d;t=b;L2.push("BEGIN:VEVENT",`UID:destinify-${d.i}-${f(a)}@destinify`,"DTSTAMP:"+s0,"DTSTART;VALUE=DATE:"+f(a),"DTEND;VALUE=DATE:"+f(b),"SUMMARY:"+z(d.n),"LOCATION:"+z(d.p+", Philippines"),"DESCRIPTION:"+z(`About ${P(cost(d))} for ${st.pax} traveler(s).`),"END:VEVENT")});
 L2.push("END:VCALENDAR");dl("destinify-trip.ics",L2.join("\r\n"),"text/calendar");toast("Calendar file downloaded")}
function prn(){const T=stopsT();if(!T.length)return toast("Add a stop first");const fr=document.createElement("iframe");fr.style.cssText="position:fixed;width:0;height:0;border:0";document.body.appendChild(fr);
 const h=T.map((d,k)=>{let pl=[];try{pl=plan(d)}catch(e){}return `<h2>${k+1}. ${esc(d.n)}, ${esc(d.p)}</h2><p>${d.d} day${d.d>1?"s":""} · about ${P(cost(d))} for ${st.pax}</p>${pl.length?`<ol>${pl.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>`:""}`}).join("");
 fr.contentDocument.write(`<title>My Destinify trip</title><body style="font-family:Georgia,serif;max-width:720px;margin:24px auto;color:#222"><h1>My Destinify trip</h1><p>Total: ${T.reduce((s,d)=>s+d.d,0)} days, about ${P(T.reduce((s,d)=>s+cost(d),0))}. Estimates only: confirm fees, schedules and advisories before you go.</p>${h}`);fr.contentDocument.close();
 setTimeout(()=>{fr.contentWindow.focus();fr.contentWindow.print();setTimeout(()=>fr.remove(),2000)},250);toast("Opening print dialog")}
async function share(){const url=location.origin+location.pathname+"#trip="+st.trip.map(i=>D[i].id).join(",");
 if(navigator.share){try{await navigator.share({title:"My Destinify trip",text:tripText(),url});return}catch(e){if(e&&e.name=="AbortError")return}}
 if(await cp(url))toast("Share link copied")}
/* ---------- profile ---------- */
const PR=()=>LS("dprof")||{},dbP=()=>{const m=DBAPI.me();return m?(m.profile||(m.profile={})):{}};
const prof=u=>API()?(DBAPI.me()&&DBAPI.me().username==u.u?dbP():{}):(PR()[u.u]||{});
const setProf=(u,o)=>{if(API()){Object.assign(dbP(),o);return DBAPI.post("auth.php?action=profile",{name:u.n,profile:o}).then(r=>{if(!r.ok)toast(r.error||"Could not save to the database")})}const a=PR();a[u.u]={...a[u.u],...o};LS("dprof",a)};
const initials=n=>(n||"?").trim().split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase();
const av=(u,c="")=>{const p=prof(u);return p.avatar?`<img class="xav ${c}" src="${p.avatar}" alt="">`:`<span class="xav ${c}">${esc(initials(u.n))}</span>`};
const navAv=()=>{const b=$("xProf"),u=U();if(b&&u)b.innerHTML=`${av(u,"sm")}<span>${esc(u.n.split(" ")[0])}</span>`};
function profile(){const u=U();if(!u)return;const p=prof(u),rv=Object.values(DX.rev()).flat().filter(r=>r.u==u.n).length;
 DX.show("My profile",`<div class="xpf"><div class="xpa"><div id="xpav">${av(u,"lg")}</div><label class="btn btn-l" style="cursor:pointer">Change photo<input type="file" id="xpf" accept="image/*" hidden></label>${p.avatar?'<button class="btn btn-l" data-x10="rmav">Remove photo</button>':""}</div>
 <div><h4 class="xph">${esc(u.n)}<small>@${esc(u.u)} · ${u.role}${p.since?" · member since "+new Date(+p.since).toLocaleDateString(undefined,{month:"short",year:"numeric"}):""}</small></h4><div class="xps"><div><b>${(u.trip||[]).length}</b><span>trip stops</span></div><div><b>${(u.fav||[]).length}</b><span>favorites</span></div><div><b>${rv}</b><span>reviews</span></div></div></div></div>
 <div id="xerr" class="note" style="color:var(--coral-d)"></div><div class="xg">
 <div><label class="note">Display name</label><input id="pn" class="form-control" value="${esc(u.n)}"></div><div><label class="note">Full name</label><input id="xpfn" class="form-control" value="${esc(p.full||"")}"></div>
 <div><label class="note">Email</label><input id="xpem" type="email" class="form-control" value="${esc(p.email||"")}"></div><div><label class="note">Phone</label><input id="xpph" class="form-control" value="${esc(p.phone||"")}"></div>
 <div><label class="note">Home city</label><select id="xphc" class="form-select">${ORIGINS.map(o=>`<option${p.home==o.n?" selected":""}>${esc(o.n)}</option>`).join("")}</select></div>
 <div><label class="note">Usual budget per person: <b id="xpbv">${P(p.budget||8000)}</b></label><input id="xpbd" type="range" min="2000" max="30000" step="500" value="${p.budget||8000}" class="form-range"></div></div>
 <label class="note mt-2">About me</label><textarea id="xpbio" class="form-control" rows="2" maxlength="200" style="display:block;width:100%;min-height:0;resize:vertical" placeholder="Beach bum, mountain chaser, food hunter...">${esc(p.bio||"")}</textarea>
 <label class="note mt-2">Favorite trip types</label><div class="tags" id="xpty">${TYPES.map(t=>`<button class="chip${(p.types||[]).includes(t)?" on":""}" data-x10="pty" data-v="${t}">${t}</button>`).join("")}</div>
 <label class="note mt-2">New password (leave blank to keep)</label><input id="pw" type="password" class="form-control" autocomplete="new-password">
 <div class="macts mt-3"><button class="btn btn-c" data-x10="psave">Save profile</button><button class="btn btn-l" data-x10="papply">Use my preferences in search</button></div><button hidden data-x2="psave" id="xpsv"></button>`)}
async function psave(){const u=U(),pw=$("pw").value,n=V("pn"),em=V("xpem");
 if(!n)return err("Display name can't be empty.");if(pw&&pw.length<6)return err("Password needs 6+ characters.");if(em&&!/^\S+@\S+\.\S+$/.test(em))return err("That email doesn't look right.");
 const info={full:V("xpfn"),email:em,phone:V("xpph"),home:$("xphc").value,bio:V("xpbio"),budget:+$("xpbd").value,types:[...document.querySelectorAll("#xpty .chip.on")].map(x=>x.dataset.v)};
 if(API()){const r=await DBAPI.post("auth.php?action=profile",{name:n,password:pw,profile:info});if(!r.ok)return err(r.error||"Could not save your profile.");location.reload();return}
 setProf(u,{...info,since:prof(u).since||Date.now()});
 if(n!=u.n||pw){$("xpsv").click();setTimeout(()=>{navAv();toast("Profile saved")},500)}else{DX.nav();navAv();DX.M().hide();toast("Profile saved")}}
function papply(){const p=prof(U());DX.M().hide();$("rb").value=p.budget||8000;$("rb").dispatchEvent(new Event("input"));
 st.types=new Set((p.types||[]).filter(t=>TYPES.includes(t)));document.querySelectorAll("[data-t]").forEach(b=>b.classList.toggle("on",st.types.has(b.dataset.t)));st.shown=12;render();$("results").scrollIntoView({behavior:"smooth"});toast("Search set to your preferences")}
document.addEventListener("click",e=>{if(e.target.closest('[data-x2="prof"]')){e.stopImmediatePropagation();e.preventDefault();profile()}},true);
/* ---------- admin console ---------- */
let AT="over",DQ="",DF="all",EDIT=null,defPw=null;DX.sha("admin123").then(h=>defPw=h);
const hid=()=>DX.hid(),rev=()=>DX.rev(),users=()=>DX.users(),custom=()=>LS("dcustom")||[],ED=()=>LS("dedit")||{};
const rated=d=>{const r=rev()[d.i]||[];return r.length?r.reduce((s,x)=>s+x.r,0)/r.length:0};
const log=m=>{const a=LS("dlog")||[];a.unshift({t:Date.now(),u:U().u,m});LS("dlog",a.slice(0,80))};
DID.refresh();D.forEach(d=>{const o=ED()[d.id]||ED()[d.n];if(o)Object.assign(d,o)});
const kp=(n,l,s)=>`<div class="xkpi"><b>${n}</b><span>${l}</span>${s?`<small>${s}</small>`:""}</div>`;
const bar=r=>{const m=Math.max(1,...r.map(x=>x[1]));return r.map(([n,v])=>`<div class="xbar"><span>${esc(n)}</span><i style="width:${Math.round(v/m*100)}%"></i><b>${v}</b></div>`).join("")};
const chk=()=>{const ok=(b,t,n)=>`<li>${b?"✅":"⚠️"} ${t}${!b&&n?` <small>${n}</small>`:""}</li>`,a0=users().find(u=>u.u=="admin");
 return `<ul class="xchk">${ok(location.protocol=="https:"||location.hostname=="localhost","Served over HTTPS","Needed for install, offline mode and the copy buttons")}${ok(!!(navigator.serviceWorker&&navigator.serviceWorker.controller),"Offline cache active","Reload once after deploying")}${ok(API(),"Database connected","Static mode keeps data in each visitor's own browser")}${ok(!!CFG.contactEmail,"Feedback email set","Set CFG.contactEmail at the top of features10.js")}${API()||!a0?"":ok(a0.p!=defPw,"Demo admin password changed","Sign in as admin, open Profile, set a new password")}</ul>`};
let EDITX=null;
const mr=(s,e)=>{const a=[];for(let m=+s;;m=m%12+1){a.push(m);if(m==+e)break}return a};
const editForm=i=>{const nw=i=="new",X=EDITX,d=nw?{n:"",p:"",g:"L",t:TYPES[0],b:5000,d:2,a:[],o:0,la:12,ln:122,mo:mr(11,5)}:D[i];
 const v=X?{p:X.province,g:X.region_group,t:X.type,b:X.budget_php,d:X.days,la:X.lat,ln:X.lng,o:+X.popular,a:String(X.activities).split(",")}:d,bs=X?+X.best_start:d.mo[0],be=X?+X.best_end:d.mo[d.mo.length-1];
 const ms=(id,sel)=>`<select id="${id}" class="form-select">${MN.map((m,k)=>`<option value="${k+1}"${sel==k+1?" selected":""}>${m}</option>`).join("")}</select>`;
 return `<div class="xbox"><h4>${nw?"ADD DESTINATION":"EDIT "+esc(d.n).toUpperCase()}</h4><div id="xerr" class="note" style="color:var(--coral-d)"></div><div class="xg">
 <div><label class="note">Name</label><input id="xan" class="form-control" value="${esc(d.n)}"${nw?"":" disabled"}></div><div><label class="note">Province</label><input id="xap" class="form-control" value="${esc(v.p)}"></div>
 <div><label class="note">Island group</label><select id="xag" class="form-select">${Object.entries(G).map(([k,n])=>`<option value="${k}"${v.g==k?" selected":""}>${n}</option>`).join("")}</select></div>
 <div><label class="note">Type</label><select id="xat" class="form-select">${TYPES.map(t=>`<option${v.t==t?" selected":""}>${t}</option>`).join("")}</select></div>
 <div><label class="note">Budget per person (PHP)</label><input id="xab" type="number" class="form-control" value="${v.b}"></div><div><label class="note">Suggested days</label><input id="xad" type="number" class="form-control" value="${v.d}"></div>
 <div><label class="note">Latitude</label><input id="xala" type="number" step="any" class="form-control" value="${v.la}"></div><div><label class="note">Longitude</label><input id="xaln" type="number" step="any" class="form-control" value="${v.ln}"></div>
 <div><label class="note">Best months from</label>${ms("xabs",bs)}</div><div><label class="note">to</label>${ms("xabe",be)}</div></div>
 <label class="note mt-2">Activities</label><div class="tags" id="xaac">${Object.entries(A).map(([k,n])=>`<button class="chip${v.a.includes(k)?" on":""}" data-x10="eact" data-v="${k}">${n}</button>`).join("")}</div>
 ${API()?`<label class="note mt-2">Description</label><textarea id="xads" class="form-control" rows="2" maxlength="500" style="display:block;width:100%;min-height:0;resize:vertical">${esc(X?X.description||"":"")}</textarea><div class="xg mt-2"><div><label class="note">Getting there</label><input id="xahw" class="form-control" maxlength="500" value="${esc(X?X.getting_there||"":"")}"></div><div><label class="note">Tip</label><input id="xatp" class="form-control" maxlength="500" value="${esc(X?X.tip||"":"")}"></div></div>`:""}
 <label class="note mt-2"><input type="checkbox" id="xao"${v.o?" checked":""}> Popular destination</label>
 <div class="macts mt-2"><button class="btn btn-c" data-x10="dsave" data-v="${i}">${nw?"Add destination":"Save changes"}</button><button class="btn btn-l" data-x10="dcancel">Cancel</button></div></div>`};
const PANES={
over:()=>{const live=D.filter(d=>!hid().includes(d.n)),R=Object.values(rev()).flat(),us=users(),av2=R.length?(R.reduce((s,x)=>s+x.r,0)/R.length).toFixed(1):"–",
 fav=us.reduce((s,u)=>s+(u.fav||[]).length,0),trips=us.reduce((s,u)=>s+(u.trip||[]).length,0),ty={};live.forEach(d=>ty[d.t]=(ty[d.t]||0)+1);
 const top=D.filter(d=>(rev()[d.i]||[]).length).sort((a,b)=>rated(b)-rated(a)).slice(0,5),sv={};us.forEach(u=>[...(u.fav||[]),...(u.trip||[])].forEach(i=>sv[i]=(sv[i]||0)+1));
 const ms=Object.entries(sv).sort((a,b)=>b[1]-a[1]).slice(0,5).filter(([i])=>D[i]),lg=(LS("dlog")||[]).slice(0,6);
 return `<div class="xkpis">${kp(live.length,"live destinations",`${hid().length} hidden · ${custom().length} added`)}${kp(us.length,"users",API()?"counting…":"")}${kp(R.length,"reviews",`average ★ ${av2}`)}${kp(fav+trips,"saved places",`${fav} favorites · ${trips} trip stops`)}</div>
 <div class="xcols"><div class="xbox"><h4>BY ISLAND GROUP</h4>${bar(Object.entries(G).map(([k,n])=>[n,live.filter(d=>d.g==k).length]))}</div><div class="xbox"><h4>BY TYPE</h4>${bar(Object.entries(ty).sort((a,b)=>b[1]-a[1]).slice(0,8))}</div></div>
 <div class="xcols"><div class="xbox"><h4>TOP RATED</h4>${top.length?top.map(d=>`<div class="xrow"><span>${esc(d.n)}</span><b>★ ${rated(d).toFixed(1)} (${rev()[d.i].length})</b></div>`).join(""):'<p class="note">No reviews yet.</p>'}</div><div class="xbox"><h4>MOST SAVED</h4>${ms.length?ms.map(([i,n])=>`<div class="xrow"><span>${esc(D[i].n)}</span><b>${n}</b></div>`).join(""):'<p class="note">Nothing saved yet.</p>'}</div></div>
 <div class="xbox" id="xlogb"><h4>RECENT ADMIN ACTIVITY</h4>${lg.length?lg.map(l=>`<div class="xrow"><span>${esc(l.m)} <small>by ${esc(l.u)}</small></span><small>${new Date(l.t).toLocaleString()}</small></div>`).join(""):'<p class="note">No admin actions yet.</p>'}</div>
 <p class="note">Storage mode: ${API()?"connected to the MySQL database":"browser storage (static hosting)"}.</p>`},
dest:()=>{const q=norm(DQ),h=hid(),cu=custom().map(o=>o.n);let a=D.filter(d=>!q||norm(d.n+" "+d.p).includes(q));
 if(DF=="hidden")a=a.filter(d=>h.includes(d.n));else if(DF=="custom")a=a.filter(d=>cu.includes(d.n));else if(DF=="live")a=a.filter(d=>!h.includes(d.n));const sh=a.slice(0,40);
 return `<div class="xtool"><input id="xdq" class="form-control" placeholder="Search ${D.length} destinations" value="${esc(DQ)}"><select id="xdf" class="form-select">${[["all","All"],["live","Live"],["hidden","Hidden"],["custom","Added by admin"]].map(([k,n])=>`<option value="${k}"${DF==k?" selected":""}>${n}</option>`).join("")}</select><button class="btn btn-c" data-x10="dnew">+ Add destination</button></div>${EDIT!==null?editForm(EDIT):""}
 <div class="xtw"><table class="xt"><tr><th>Destination</th><th>Type</th><th>Budget</th><th>Days</th><th>★</th><th>Status</th><th></th></tr>${sh.map(d=>`<tr><td><b>${esc(d.n)}</b><br><small>${esc(d.p)}</small></td><td>${esc(d.t)}</td><td>${P(d.b)}</td><td>${d.d}</td><td>${rated(d)?rated(d).toFixed(1):"–"}</td><td>${h.includes(d.n)?'<span class="tag">Hidden</span>':'<span class="tag gem">Live</span>'}${cu.includes(d.n)?' <span class="tag">Added</span>':""}</td><td class="xta2"><button class="btn btn-l" data-x10="dedit" data-v="${d.i}">Edit</button><button class="btn btn-l" data-x10="dhide" data-v="${d.i}">${h.includes(d.n)?"Restore":"Hide"}</button></td></tr>`).join("")}</table></div><p class="note">Showing ${sh.length} of ${a.length}.</p>`},
rev:()=>{const all=[];Object.entries(rev()).forEach(([i,a])=>a.forEach((x,k)=>D[i]&&all.push({i:+i,k,x})));all.sort((a,b)=>(b.x.t||0)-(a.x.t||0));const f=LS("dfeed")||[];
 return `<div class="xbox"><h4>REVIEWS (${all.length})</h4>${all.slice(0,40).map(o=>`<div class="xrev2"><div><b>${esc(o.x.u)}</b> on <b>${esc(D[o.i].n)}</b> · ${"★".repeat(o.x.r)}${o.x.t?` · <small>${new Date(o.x.t).toLocaleDateString()}</small>`:""}<p>${esc(o.x.c)}</p></div><button class="btn btn-l" data-x10="rdel" data-v="${o.i}:${o.k}">Delete</button></div>`).join("")||'<p class="note">No reviews yet.</p>'}</div>
 <div class="xbox"><h4>FEEDBACK SENT FROM THIS BROWSER (${f.length})</h4>${f.slice(0,30).map((x,k)=>`<div class="xrev2"><div>${"★".repeat(x.r||0)} <small>${new Date(x.t).toLocaleString()}</small><p>${esc(x.m)}${x.c?` · ${esc(x.c)}`:""}</p></div><button class="btn btn-l" data-x10="fdel" data-v="${k}">Delete</button></div>`).join("")||'<p class="note">None. Visitors\' feedback goes to your contact email once CFG.contactEmail is set.</p>'}</div>`},
usr:()=>{if(API())return '<div class="xbox"><h4>USERS</h4><div id="xudb"><p class="note">Loading users…</p></div></div>';const us=users(),R=Object.values(rev()).flat();
 return `<div class="xbox"><h4>USERS (${us.length})</h4><div class="xtw"><table class="xt"><tr><th>User</th><th>Role</th><th>Trip</th><th>Fav</th><th>Reviews</th><th></th></tr>${us.map(u=>`<tr><td><span class="xusr">${av(u,"sm")}<span><b>${esc(u.n)}</b><br><small>@${esc(u.u)}${prof(u).email?" · "+esc(prof(u).email):""}</small></span></span></td><td>${u.role}</td><td>${(u.trip||[]).length}</td><td>${(u.fav||[]).length}</td><td>${R.filter(r=>r.u==u.n).length}</td><td class="xta2">${u.u==U().u||API()?"":`<button class="btn btn-l" data-x10="urole" data-v="${esc(u.u)}">Make ${u.role=="admin"?"traveler":"admin"}</button><button class="btn btn-l" data-x10="udel" data-v="${esc(u.u)}">Delete</button>`}</td></tr>`).join("")}</table></div>${API()?'<p class="note">Connected to the database: this list shows your own session. Manage all accounts in the users table (phpMyAdmin).</p>':'<p class="note">Accounts live in this browser only (static mode).</p>'}</div>`},
rep:()=>`<div class="xbox"><h4>EXPORT</h4><div class="macts"><button class="btn btn-d" data-x10="csvd">Destinations (CSV)</button><button class="btn btn-d" data-x10="csvr">Reviews (CSV)</button><button class="btn btn-d" data-x10="csvu">Users (CSV)</button></div></div>
 <div class="xbox"><h4>BACKUP AND RESTORE (browser data)</h4><p class="note">Saves accounts, reviews, admin edits, favorites and trips from this browser in one JSON file.</p><div class="macts"><button class="btn btn-l" data-x10="bk">Download backup</button><label class="btn btn-l" style="cursor:pointer">Restore backup<input type="file" id="xrs2" accept="application/json" hidden></label></div></div>
 <div class="xbox"><h4>DEPLOYMENT CHECKLIST</h4>${chk()}</div>`};
const dbGet=async q=>{try{return await(await fetch("api/admin.php?"+q,{credentials:"same-origin"})).json()}catch(e){return{}}};
const when=t=>new Date(String(t).replace(" ","T"));
async function loadUsers(){const r=await dbGet("action=users"),b=$("xudb");if(!b)return;if(!r.ok){b.innerHTML='<p class="note">Could not load users.</p>';return}
 b.innerHTML=`<div class="xtw"><table class="xt"><tr><th>User</th><th>Role</th><th>Trip</th><th>Fav</th><th>Reviews</th><th>Joined</th><th></th></tr>${r.users.map(u=>`<tr><td><b>${esc(u.name)}</b><br><small>@${esc(u.username)}</small></td><td>${u.role}</td><td>${u.trip}</td><td>${u.favorites}</td><td>${u.reviews}</td><td><small>${when(u.created_at).toLocaleDateString()}</small></td><td class="xta2">${u.username==U().u?"":`<button class="btn btn-l" data-x10="urole" data-id="${u.id}" data-v="${u.role=="admin"?"traveler":"admin"}">Make ${u.role=="admin"?"traveler":"admin"}</button><button class="btn btn-l" data-x10="udel" data-id="${u.id}" data-v="${esc(u.username)}">Delete</button>`}</td></tr>`).join("")}</table></div><p class="note">${r.users.length} accounts in the database.</p>`}
async function loadLog(){const r=await dbGet("action=log"),b=$("xlogb");if(!b)return;const l=r.log||[];
 b.innerHTML='<h4>RECENT ADMIN ACTIVITY</h4>'+(l.length?l.slice(0,6).map(x=>`<div class="xrow"><span>${esc(x.message)} <small>by ${esc(x.username||"?")}</small></span><small>${when(x.created_at).toLocaleString()}</small></div>`).join(""):'<p class="note">No admin actions yet.</p>')}
function admin(tab){if(!ADM())return;if(tab)AT=tab;const keep=$("xmc").scrollTop;$("xm").querySelector(".modal-dialog").classList.add("modal-xl");
 DX.show("Admin console",`<div class="xtabs">${[["over","Overview"],["dest","Destinations"],["rev","Reviews & feedback"],["usr","Users"],["rep","Reports & backup"]].map(([k,n])=>`<button class="chip${AT==k?" on":""}" data-x10="at" data-v="${k}">${n}</button>`).join("")}</div>${PANES[AT]()}`);$("xmc").scrollTop=keep;
 if(API()&&AT=="over"){dbGet("").then(j=>{const k=document.querySelectorAll(".xkpi b");if(j.ok&&k[1])k[1].textContent=j.users});loadLog()}
 if(API()&&AT=="usr")loadUsers()}
$("xm").addEventListener("hidden.bs.modal",()=>$("xm").querySelector(".modal-dialog").classList.remove("modal-xl"));
document.addEventListener("click",e=>{if(e.target.closest('[data-x="adm"]')){e.stopImmediatePropagation();e.preventDefault();admin()}},true);
async function saveD(i){const nw=i=="new",o={p:V("xap"),g:$("xag").value,t:$("xat").value,b:+V("xab"),d:+V("xad"),la:+V("xala"),ln:+V("xaln"),a:[...document.querySelectorAll("#xaac .chip.on")].map(x=>x.dataset.v),o:$("xao").checked?1:0,bs:+$("xabs").value,be:+$("xabe").value};
 if(nw){o.n=V("xan");if(!o.n||D.some(d=>d.n.toLowerCase()==o.n.toLowerCase()))return err("Use a unique name.")}
 if(!o.p||!(o.b>=500)||!(o.d>=1&&o.d<=30)||!o.a.length||!(o.la>=4&&o.la<=21.5)||!(o.ln>=116&&o.ln<=127.5))return err("Check every field: province, budget (500+), days (1 to 30), coordinates inside the Philippines, and at least one activity.");
 if(API()){const r=await DBAPI.post("admin.php",{action:nw?"add":"update",destination_id:nw?undefined:DBAPI.ids[i],name:nw?o.n:D[i].n,province:o.p,g:o.g,lat:o.la,lng:o.ln,type:o.t,budget:o.b,days:o.d,activities:o.a,popular:o.o,best_start:o.bs,best_end:o.be,description:V("xads"),getting_there:V("xahw"),tip:V("xatp")});
  if(!r.ok)return err(r.error||"Could not save to the database.");toast("Saved to the database. Reloading…");setTimeout(()=>location.reload(),800);return}
 if(nw){const c=custom();c.push({...o,desc:""});LS("dcustom",c);D.push({i:D.length,...o,mo:mr(o.bs,o.be)});log("Added destination "+o.n)}
 else{const d=D[i],e=ED();e[d.id]={p:o.p,g:o.g,la:o.la,ln:o.ln,t:o.t,b:o.b,d:o.d,a:o.a,o:o.o,mo:mr(o.bs,o.be)};delete e[d.n];LS("dedit",e);Object.assign(d,e[d.id]);log("Edited "+d.n)}
 EDIT=null;EDITX=null;if($("sN"))$("sN").textContent=D.length;try{buildInsights()}catch(x){}render();admin();toast("Saved")}
function restore(f){const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);Object.entries(o).forEach(([k,v])=>localStorage.setItem(k,JSON.stringify(v)));toast("Backup restored. Reloading…");setTimeout(()=>location.reload(),900)}catch(x){toast("That file isn't a valid backup")}};r.readAsText(f)}
/* ---------- launch kit: feedback, About, Privacy, Terms, tour, install ---------- */
const mail=()=>CFG.contactEmail?`<a href="mailto:${esc(CFG.contactEmail)}">${esc(CFG.contactEmail)}</a>`:"the site owner";
const DOCS={
about:["About Destinify",()=>`<p>Destinify scores and ranks ${D.length} Philippine destinations against your budget, travel style, trip length and month, then helps you plan: route, day-by-day plan, weather, festivals, map and a built-in assistant.</p><p><b>How the match works.</b> Each place earns up to 100 points: destination type, activities, budget, trip length and season. You can change the weights in the filter panel.</p><p><b>Where the data comes from.</b> Best months follow PAGASA's four climate types (for example the eastern seaboard has no dry season, so places there lean on March to June), coordinates were checked against GeoNames, and budgets are estimates, not official prices. Photos come from Wikipedia and Wikimedia Commons with credit, weather from Open-Meteo, and maps from OpenStreetMap contributors. Always confirm fees, schedules and advisories with official sources.</p>`],
privacy:["Privacy",()=>`<p>${API()?"Your account, trip, favorites and reviews are stored in this site's database. Passwords are hashed, never saved as plain text.":"Destinify keeps your account, trip, favorites, reviews and profile in your own browser (local storage). Nothing is sent to a Destinify server."}</p><p>To show photos, weather, maps and fonts, your browser contacts Wikipedia and Wikimedia, Open-Meteo, OpenStreetMap or CARTO tile servers, Google Fonts and public CDNs. They see your IP address as with any website. Your location is only used if you tap "Near me" or "Use my location", and it is not stored.</p><p>You can clear your saved data any time from your browser settings. Questions: ${mail()}.</p>`],
terms:["Terms of use",()=>`<p>Destinify is a planning aid, not a booking service. Prices, travel times, best months, festival dates and weather are estimates and may be wrong or out of date. Check fees, permits, transport schedules and government travel advisories before you go.</p><p>Photos belong to their authors under the licenses shown with each photo. Use the site at your own risk. Questions: ${mail()}.</p>`]};
function doc(k){DX.show(DOCS[k][0],DOCS[k][1]())}
function feedback(){DX.show("Send feedback",`<label class="note">How is Destinify working for you?</label><select id="xfr" class="form-select mb-2">${[5,4,3,2,1].map(n=>`<option value="${n}">${"★".repeat(n)}</option>`).join("")}</select><textarea id="xfm" class="form-control" rows="4" maxlength="600" style="display:block;width:100%;min-height:0;resize:vertical" placeholder="What worked, what didn't, what's missing?"></textarea><input id="xfc" class="form-control mt-2" placeholder="Email (optional, if you want a reply)"><div id="xerr" class="note" style="color:var(--coral-d)"></div><div class="macts mt-3"><button class="btn btn-c" data-x10="fbsend">Send</button></div>`)}
function fbsend(){const m=V("xfm");if(m.length<3)return err("Please write a short message.");const f=LS("dfeed")||[];f.unshift({t:Date.now(),r:+$("xfr").value,m,c:V("xfc")});LS("dfeed",f.slice(0,50));DX.M().hide();toast("Thank you for your feedback!");
 if(CFG.contactEmail)location.href=`mailto:${CFG.contactEmail}?subject=${encodeURIComponent("Destinify feedback")}&body=${encodeURIComponent(m+"\n\nRating: "+$("xfr").value+"/5"+(V("xfc")?"\nContact: "+V("xfc"):""))}`}
const TOUR=[["🌴","Welcome to Destinify","Find the Philippine place that fits your budget, style and travel month. This 30-second tour shows the essentials."],["🎯","Get matched","Set your budget, type, activities and month, or take the quiz. Every place gets a match score, and the weight sliders let you decide what matters most."],["♥","Save and compare","Tap the heart to save favorites. Tap + Trip to add a place to your trip, and tick Compare to see up to 4 side by side."],["🧭","Plan the trip","Open My trip to reorder stops, optimize the route, split days, check the weather and export to your calendar or print."],["🗺","Explore more","The map shows your route and travel times, the festivals calendar shows what's on, and the chat button answers travel questions."]];
let ti=0;function tour(i){ti=i;const s=TOUR[i];DX.show("",`<div class="xtour"><div class="xemoji">${s[0]}</div><h4 style="font-family:Fraunces,serif">${s[1]}</h4><p>${s[2]}</p><div class="xdots">${TOUR.map((_,k)=>`<i class="${k==i?"on":""}"></i>`).join("")}</div><div class="macts" style="justify-content:center">${i?'<button class="btn btn-l" data-x10="tback">Back</button>':'<button class="btn btn-l" data-x10="tskip">Skip</button>'}<button class="btn btn-c" data-x10="${i==TOUR.length-1?"tskip":"tnext"}">${i==TOUR.length-1?"Start exploring":"Next"}</button></div></div>`)}
if(!LS("dtour")&&!location.search&&!/#trip=/.test(location.hash))setTimeout(()=>{if(!document.querySelector(".modal.show,.offcanvas.show"))tour(0)},1500);
$("xm").addEventListener("hidden.bs.modal",()=>LS("dtour",1));
document.querySelector("footer .wrap").insertAdjacentHTML("beforeend",'<span class="xfl"><a href="#" data-x10="about">About</a> · <a href="#" data-x10="privacy">Privacy</a> · <a href="#" data-x10="terms">Terms</a> · <a href="#" data-x10="feedback">Send feedback</a> · <a href="#" data-x10="tour">Take the tour</a><span id="xinst" hidden> · <a href="#" data-x10="install">Install app</a></span></span>');
let ip=null;addEventListener("beforeinstallprompt",e=>{e.preventDefault();ip=e;$("xinst").hidden=false});addEventListener("appinstalled",()=>{$("xinst").hidden=true;toast("Destinify installed")});
/* ---------- render + events ---------- */
const _r=render;render=()=>{_r();navAv()};
document.addEventListener("click",async e=>{const t=e.target.closest("[data-x10]");if(!t)return;if(t.tagName=="A")e.preventDefault();const x=t.dataset.x10,v=t.dataset.v;
 switch(x){
 case"opt":{if(st.trip.length<3)return toast("Add at least 3 stops to optimize the route");const k0=tripKm();optimize();const s=Math.round(k0-tripKm());toast(s>0?`Route optimized: about ${s} km shorter`:"Your route is already about as short as it gets");break}
 case"map":toMap();break;case"ics":ics();break;case"print":prn();break;
 case"copy":if(!st.trip.length)return toast("Add a stop first");if(await cp(tripText()))toast("Itinerary copied");break;
 case"share":if(!st.trip.length)return toast("Add a stop first");share();break;
 case"pty":case"eact":t.classList.toggle("on");break;
 case"rmav":setProf(U(),{avatar:""});profile();navAv();toast("Photo removed");break;
 case"psave":psave();break;case"papply":papply();break;
 case"at":AT=v;admin();break;
 case"dnew":EDITX=null;EDIT="new";admin("dest");break;case"dcancel":EDIT=null;EDITX=null;admin();break;
 case"dedit":{EDITX=null;if(API()){const r=await dbGet("action=destination&id="+DBAPI.ids[+v]);if(!r.ok)return toast("Could not load that destination");EDITX=r.destination}EDIT=+v;admin("dest");break}
 case"dsave":saveD(v);break;
 case"dhide":{if(!ADM())return;const d=D[+v],h=hid(),k=h.indexOf(d.n);k>-1?h.splice(k,1):h.push(d.n);LS("dhide",h);log((k>-1?"Restored ":"Hid ")+d.n);render();admin();break}
 case"rdel":{const[i,k]=v.split(":").map(Number),x0=rev()[i]&&rev()[i][k];if(!x0)return;
  if(API()){if(!x0.id)return toast("Reload the page, then delete it");const r=await DBAPI.post("reviews.php",{action:"delete",id:x0.id});if(!r.ok)return toast(r.error||"Could not delete the review")}
  rev()[i].splice(k,1);LS("drev",rev());log("Deleted a review on "+D[i].n);render();admin();toast("Review deleted");break}
 case"fdel":{const f=LS("dfeed")||[];f.splice(+v,1);LS("dfeed",f);admin();break}
 case"urole":{if(API()){const r=await DBAPI.post("admin.php",{action:"set_role",user_id:+t.dataset.id,role:v});if(!r.ok)return toast(r.error||"Could not change the role");toast("Role changed");loadUsers();return}
  const u=users().find(a=>a.u==v);if(!u)return;if(u.role=="admin"&&users().filter(a=>a.role=="admin").length<2)return toast("Keep at least one admin");u.role=u.role=="admin"?"traveler":"admin";DX.saveUsers();log(`Made ${u.u} ${u.role}`);admin();break}
 case"udel":{if(API()){if(!confirm("Delete account @"+v+" and everything they saved?"))return;const r=await DBAPI.post("admin.php",{action:"delete_user",user_id:+t.dataset.id});if(!r.ok)return toast(r.error||"Could not delete the user");toast("User deleted");loadUsers();return}
  const k=users().findIndex(a=>a.u==v),u=users()[k];if(k<0||(u.role=="admin"&&users().filter(a=>a.role=="admin").length<2))return toast("Keep at least one admin");if(!confirm("Delete account @"+v+"?"))return;users().splice(k,1);DX.saveUsers();log("Deleted user "+v);admin();break}
 case"csvd":dl("destinify-destinations.csv",csv([["Name","Province","Type","Budget","Days","Popular","Avg rating","Reviews","Status"],...D.map(d=>[d.n,d.p,d.t,d.b,d.d,d.o?"yes":"no",rated(d).toFixed(1),(rev()[d.i]||[]).length,hid().includes(d.n)?"hidden":"live"])]),"text/csv");break;
 case"csvr":dl("destinify-reviews.csv",csv([["Destination","User","Rating","Comment","Date"],...Object.entries(rev()).flatMap(([i,a])=>D[i]?a.map(x=>[D[i].n,x.u,x.r,x.c,x.t?new Date(x.t).toISOString():""]):[])]),"text/csv");break;
 case"csvu":dl("destinify-users.csv",csv([["Username","Name","Role","Trip stops","Favorites","Email"],...users().map(u=>[u.u,u.n,u.role,(u.trip||[]).length,(u.fav||[]).length,prof(u).email||""])]),"text/csv");break;
 case"bk":{const o={};["dusers","drev","dcustom","dhide","dedit","dprof","dfav","dtrip","dlog","dfeed"].forEach(k=>{const a=LS(k);if(a!=null)o[k]=a});dl("destinify-backup.json",JSON.stringify(o),"application/json");break}
 case"about":case"privacy":case"terms":doc(x);break;case"feedback":feedback();break;case"fbsend":fbsend();break;
 case"tour":tour(0);break;case"tnext":tour(ti+1);break;case"tback":tour(ti-1);break;case"tskip":LS("dtour",1);DX.M().hide();break;
 case"install":if(ip){ip.prompt();ip=null}break}});
document.addEventListener("change",e=>{const f=e.target;
 if(f.id=="xpf"&&f.files[0]){const file=f.files[0];if(!/^image\//.test(file.type))return toast("Please choose an image file");const r=new FileReader(),img=new Image();
  r.onload=()=>{img.onload=()=>{const c=document.createElement("canvas");c.width=c.height=192;const s=Math.min(img.width,img.height);c.getContext("2d").drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,192,192);setProf(U(),{avatar:c.toDataURL("image/jpeg",.85)});$("xpav").innerHTML=av(U(),"lg");navAv();toast("Photo updated")};img.src=r.result};r.readAsDataURL(file)}
 else if(f.id=="xrs2"&&f.files[0])restore(f.files[0]);else if(f.id=="xdf"){DF=f.value;admin()}});
document.addEventListener("input",e=>{if(e.target.id=="xdq"){DQ=e.target.value;admin();const q=$("xdq");q.focus();q.setSelectionRange(DQ.length,DQ.length)}else if(e.target.id=="xpbd")$("xpbv").textContent=P(+e.target.value)});
render();
})();
