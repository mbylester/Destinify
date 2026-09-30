/* Destinify app logic. Needs data.js (RAW), Leaflet, Leaflet.markercluster and Bootstrap. */
const A={sw:"Swimming",sn:"Snorkeling",dv:"Diving",hk:"Hiking",sf:"Surfing",ih:"Island hopping",ss:"Sightseeing",cm:"Camping",fd:"Food trip",cv:"Caving",kc:"Kayaking",cw:"Culture walks",wl:"Wildlife",cy:"Canyoneering",ad:"Adventure sports",ph:"Photography",rl:"Relaxation",bk:"Cycling"};
const G={L:"Luzon & Palawan",V:"Visayas",M:"Mindanao"},GC={L:"#ff6f4c",V:"#e8b750",M:"#4fd1b5"};
const TC={Beach:["#1c6e8c","#37a3b8"],Island:["#0f5c7a","#2aa198"],Mountain:["#134d46","#3f8f6f"],Waterfall:["#1b6f6a","#5cc0a8"],Heritage:["#8a4b2d","#d18a4f"],City:["#3b4a6b","#7d8fc2"],Diving:["#0b3f6b","#1f8fbf"],Surf:["#176c8f","#f0b76a"],Cave:["#2e3a3a","#6b8a80"],Lake:["#245f73","#7fc6c0"],Nature:["#2f6b3d","#9bcf6a"],Adventure:["#7a3b1d","#e07b39"]};
const MN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const HEART='<svg viewBox="0 0 24 24"><path d="M12 21s-7-4.6-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.4-9.5 9-9.5 9z"/></svg>';
const OSM="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const $=id=>document.getElementById(id),P=n=>"₱"+n.toLocaleString();

const D=RAW.trim().split("\n").map((l,i)=>{const[n,p,g,la,ln,t,b,d,a,o,bm]=l.split("|");const[s,e]=(bm||"11-5").split("-").map(Number);const mo=[];for(let m=s;;m=m%12+1){mo.push(m);if(m==e)break}return{i,n,p,g,la:+la,ln:+ln,t,b:+b,d:+d,a:a.split(" "),o:+o,mo}});
const TYPES=[...new Set(D.map(x=>x.t))].sort();
const st={q:"",b:8000,g:"",d:"any",mon:0,types:new Set(),acts:new Set(),tab:"all",sort:"match",shown:12,trip:[],cmp:new Set()};
try{st.trip=JSON.parse(localStorage.getItem("dtrip")||"[]").filter(i=>D[i])}catch(e){}
const save=()=>{try{localStorage.setItem("dtrip",JSON.stringify(st.trip))}catch(e){}};
document.documentElement.dataset.theme=(()=>{try{return localStorage.getItem("dtheme")||"light"}catch(e){return"light"}})();

/* ---------- matching ---------- */
function parts(d){const p=st;
 const t=p.types.size?(p.types.has(d.t)?30:0):30;
 const a=p.acts.size?25*[...p.acts].filter(x=>d.a.includes(x)).length/p.acts.size:25;
 const b=d.b<=p.b?20:Math.max(0,20*(1-(d.b-p.b)/p.b));
 let du=10;if(p.d!="any"){const[x,y]=p.d.split("-").map(Number);du=d.d>=x&&d.d<=y?10:Math.abs(d.d-(d.d<x?x:y))==1?5:0}
 const s=p.mon?(d.mo.includes(p.mon)?15:0):15;
 return{t,a,b,du,s}}
const score=d=>{const x=parts(d);return Math.round(x.t+x.a+x.b+x.du+x.s)};
function list(){D.forEach(d=>d.s=score(d));
 const S={match:(a,b)=>b.s-a.s||b.o-a.o,cheap:(a,b)=>a.b-b.b,short:(a,b)=>a.d-b.d||a.b-b.b,az:(a,b)=>a.n.localeCompare(b.n)};
 return D.filter(d=>(!st.q||(d.n+" "+d.p).toLowerCase().includes(st.q))&&(!st.g||d.g==st.g)&&(st.tab=="pop"?d.o:st.tab=="gem"?!d.o:st.tab=="trip"?st.trip.includes(d.i):true)).sort(S[st.sort])}

/* ---------- cards ---------- */
function cardH(d){const c=TC[d.t]||TC.Nature,on=st.trip.includes(d.i);
 return `<article class="dcard"><div class="vis" style="background:linear-gradient(135deg,${c[0]},${c[1]})"><span class="type">${d.t}</span>
 <button class="heart${on?" on":""}" data-f="${d.i}" aria-label="${on?"Remove from":"Add to"} my trip">${HEART}</button>
 <span class="score"><i></i>${d.s}% match</span>
 <label class="cmp"><input type="checkbox" data-c="${d.i}" ${st.cmp.has(d.i)?"checked":""}> Compare</label></div>
 <div class="body"><div class="name">${d.n}</div><div class="where">${d.p} · ${G[d.g]}</div>
 <div class="tags"><span class="tag ${d.o?"pop":"gem"}">${d.o?"Popular":"Hidden gem"}</span>${d.a.slice(0,3).map(x=>`<span class="tag">${A[x]}</span>`).join("")}</div>
 <div class="foot"><div><b>${P(d.b)}</b> <span>/ ${d.d} day${d.d>1?"s":""}</span></div><div class="act"><button data-m="${d.i}">Map</button><button data-d="${d.i}">Details</button></div></div></div></article>`}

/* ---------- map ---------- */
const osm=L.tileLayer(OSM,{maxZoom:18,attribution:"© OpenStreetMap contributors"});
const topo=L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",{maxZoom:17,attribution:"© OpenTopoMap, © OpenStreetMap contributors"});
const sat=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:18,attribution:"Tiles © Esri"});
const map=L.map("map",{layers:[osm],scrollWheelZoom:false}).setView([12.2,122.3],6);
L.control.layers({Street:osm,Terrain:topo,Satellite:sat}).addTo(map);
map.on("click",()=>map.scrollWheelZoom.enable());map.on("mouseout",()=>map.scrollWheelZoom.disable());
const cluster=L.markerClusterGroup({maxClusterRadius:45,showCoverageOnHover:false}).addTo(map);
let mk={},route;
const popup=d=>`<b>${d.n}</b><br>${d.p} · ${d.t}<br>${P(d.b)} · ${d.d} day${d.d>1?"s":""}<br><b style="font-size:14px">${d.s}% match</b><br><a href="#" onclick="openDetail(${d.i});return false">View details</a>`;
function drawMap(arr){cluster.clearLayers();mk={};
 arr.forEach(d=>{const m=L.circleMarker([d.la,d.ln],{radius:d.o?9:6,color:"#0a2622",weight:1.5,fillColor:GC[d.g],fillOpacity:.35+.6*d.s/100}).bindPopup(popup(d));mk[d.i]=m;cluster.addLayer(m)});
 if(route)map.removeLayer(route);
 const pts=st.trip.map(i=>[D[i].la,D[i].ln]);
 if(pts.length>1)route=L.polyline(pts,{color:"#e8b750",weight:3,dashArray:"8 8"}).addTo(map)}
function focusMap(i){const m=$("dm");const inst=bootstrap.Modal.getInstance(m);if(inst)inst.hide();
 $("mapsection").scrollIntoView();
 if(mk[i])setTimeout(()=>cluster.zoomToShowLayer(mk[i],()=>mk[i].openPopup()),600);
 else map.flyTo([D[i].la,D[i].ln],10)}

/* ---------- render ---------- */
function render(){const arr=list();
 $("rc").textContent=`${arr.length} destination${arr.length==1?"":"s"}, ranked by how well they match your preferences.`;
 $("rt").textContent=st.tab=="trip"?"Your trip":st.tab=="gem"?"Hidden gems worth the trip":"Your best matches";
 $("grid").innerHTML=arr.slice(0,st.shown).map(cardH).join("")||`<div class="empty">${st.tab=="trip"?"Tap the heart on a destination to add it to your trip.":"No destinations match these filters. Try a higher budget or fewer activities."}</div>`;
 $("more").innerHTML=arr.length>st.shown?`<button class="btn btn-d" id="moreBtn">Show more (${arr.length-st.shown} left)</button>`:"";
 $("tripN").textContent=st.trip.length;
 $("cbar").classList.toggle("show",st.cmp.size>0);$("cn").textContent=st.cmp.size;
 $("rv").textContent=P(st.b)+(st.b>=30000?"+":"");
 drawMap(arr);renderTrip()}

/* ---------- trip planner ---------- */
const hav=(a,b)=>{const r=x=>x*Math.PI/180,h=Math.sin(r(b.la-a.la)/2)**2+Math.cos(r(a.la))*Math.cos(r(b.la))*Math.sin(r(b.ln-a.ln)/2)**2;return 12742*Math.asin(Math.sqrt(h))};
const tripKm=()=>st.trip.slice(1).reduce((s,i,k)=>s+hav(D[st.trip[k]],D[i]),0);
function renderTrip(){const T=st.trip.map(i=>D[i]);
 if(!T.length){$("tripBody").innerHTML='<p style="color:var(--soft)">Nothing here yet. Tap the heart on any destination to start planning.</p>';return}
 $("tripBody").innerHTML=`<div class="trip-sum"><div><b>${T.length}</b><span>stops</span></div><div><b>${T.reduce((s,d)=>s+d.d,0)}</b><span>days</span></div><div><b>${P(T.reduce((s,d)=>s+d.b,0))}</b><span>est. budget</span></div></div>
 <p style="font-size:13px;color:var(--soft)">Straight-line route ≈ ${Math.round(tripKm()).toLocaleString()} km. The gold line on the map follows your order.</p>
 ${T.map((d,k)=>`<div class="stop"><span class="n">${k+1}</span><div class="t"><b>${d.n}</b><span>${d.p} · ${d.d}d · ${P(d.b)}</span></div><button data-up="${k}" aria-label="Move up">↑</button><button data-dn="${k}" aria-label="Move down">↓</button><button data-rm="${d.i}" aria-label="Remove">✕</button></div>`).join("")}
 <div class="macts" style="margin-top:18px"><button class="btn btn-d" id="optBtn">Optimize route</button><button class="btn btn-l" id="copyBtn">Copy itinerary</button><button class="btn btn-l" id="clrBtn">Clear</button></div>`}
function optimize(){if(st.trip.length<3)return;const left=[...st.trip],out=[left.shift()];
 while(left.length){const c=D[out[out.length-1]];let bi=0,bd=1e9;left.forEach((j,k)=>{const x=hav(c,D[j]);if(x<bd){bd=x;bi=k}});out.push(left.splice(bi,1)[0])}
 st.trip=out;save();render()}
function copyTrip(btn){const T=st.trip.map(i=>D[i]);
 const txt="My Destinify trip\n"+T.map((d,k)=>`${k+1}. ${d.n}, ${d.p} (${d.d} days, ${P(d.b)})`).join("\n")+`\nTotal: ${T.reduce((s,d)=>s+d.d,0)} days, ${P(T.reduce((s,d)=>s+d.b,0))}`;
 (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>{btn.textContent="Copied!"},()=>{btn.textContent="Copy not available"})}
function toggleTrip(i){const k=st.trip.indexOf(i);k>-1?st.trip.splice(k,1):st.trip.push(i);save();render()}

/* ---------- detail + compare ---------- */
let mini;
function openDetail(i){const d=D[i],c=TC[d.t]||TC.Nature,x=parts(d);d.s=score(d);st.cur=i;
 if(mini){mini.remove();mini=null}
 const br=["Diving","Adventure","Surf"].includes(d.t)?[.25,.25,.15,.35]:["City","Heritage"].includes(d.t)?[.3,.35,.25,.1]:[.3,.3,.2,.2];
 const bn=["Transport","Stay","Food","Activities"],bc=["#1c6e8c","#e8b750","#ff6f4c","#4fd1b5"];
 const rows=[["Destination type",x.t,30],["Activities",x.a,25],["Budget",x.b,20],["Trip length",x.du,10],["Season",x.s,15]];
 $("dmc").innerHTML=`<div class="mh" style="background:linear-gradient(135deg,${c[0]},${c[1]})"><button class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button><h3>${d.n}</h3><p>${d.p} · ${G[d.g]} · ${d.t} · ${d.o?"Popular":"Hidden gem"}</p></div>
 <div class="mb"><div><h4>WHY IT SCORES ${d.s}%</h4>${rows.map(r=>`<div class="bar"><span>${r[0]}</span><div><i style="width:${r[1]/r[2]*100}%"></i></div><b>${Math.round(r[1])}/${r[2]}</b></div>`).join("")}
 <h4 style="margin-top:20px">BEST MONTHS</h4><div class="months">${MN.map((m,k)=>`<span class="${d.mo.includes(k+1)?"on":""}">${m[0]}</span>`).join("")}</div>
 <h4>ESTIMATED BUDGET · ${P(d.b)} for ${d.d} day${d.d>1?"s":""}</h4><div class="split">${br.map((v,k)=>`<i style="width:${v*100}%;background:${bc[k]}"></i>`).join("")}</div>
 <div class="bl">${br.map((v,k)=>`<span><i style="background:${bc[k]}"></i>${bn[k]} ${P(Math.round(d.b*v/50)*50)}</span>`).join("")}</div></div>
 <div><div id="mini"></div><h4>THINGS TO DO</h4><div class="tags">${d.a.map(a=>`<span class="tag">${A[a]}</span>`).join("")}</div>
 <div class="macts"><button class="btn btn-c" data-f="${d.i}">${st.trip.includes(d.i)?"Remove from trip":"Add to my trip"}</button><button class="btn btn-l" data-m="${d.i}">Show on map</button></div></div></div>`;
 bootstrap.Modal.getOrCreateInstance($("dm")).show()}
$("dm").addEventListener("shown.bs.modal",()=>{const d=D[st.cur];if(!d||!$("mini"))return;if(mini)mini.remove();
 mini=L.map("mini",{scrollWheelZoom:false}).setView([d.la,d.ln],9);L.tileLayer(OSM,{maxZoom:18,attribution:"© OpenStreetMap"}).addTo(mini);
 L.circleMarker([d.la,d.ln],{radius:9,color:"#0a2622",fillColor:GC[d.g],fillOpacity:.95}).addTo(mini)});
function openCompare(){const T=[...st.cmp].map(i=>D[i]);T.forEach(d=>d.s=score(d));
 const R=[["Type",d=>d.t],["Region",d=>G[d.g]],["Province",d=>d.p],["Budget",d=>P(d.b)],["Trip length",d=>d.d+" days"],["Best months",d=>d.mo.length==12?"All year":MN[d.mo[0]-1]+" – "+MN[d.mo[d.mo.length-1]-1]],["Activities",d=>d.a.map(a=>A[a]).join(", ")],["Match",d=>d.s+"%"]];
 $("cmc").innerHTML=`<div class="mh" style="background:var(--t900)"><button class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button><h3>Compare destinations</h3></div><div style="padding:10px 20px 24px;overflow-x:auto"><table class="cmpt"><tr><th></th>${T.map(d=>`<td><b style="font:600 17px Fraunces,serif">${d.n}</b></td>`).join("")}</tr>${R.map(r=>`<tr><th>${r[0]}</th>${T.map(d=>`<td>${r[1](d)}</td>`).join("")}</tr>`).join("")}</table></div>`;
 bootstrap.Modal.getOrCreateInstance($("cm")).show()}

/* ---------- controls ---------- */
$("sN").textContent=D.length;$("sA").textContent=Object.keys(A).length;$("sT").textContent=TYPES.length;
$("tc").innerHTML=TYPES.map(t=>`<button class="chip" data-t="${t}">${t}</button>`).join("");
$("ac").innerHTML=Object.entries(A).map(([k,v])=>`<button class="chip" data-a="${k}">${v}</button>`).join("");
$("pm").innerHTML='<option value="0">Any month</option>'+MN.map((m,i)=>`<option value="${i+1}">${m}</option>`).join("");
const tog=(set,v,btn)=>{set.has(v)?set.delete(v):set.add(v);btn.classList.toggle("on");st.shown=12;render()};
function reset(){Object.assign(st,{q:"",b:8000,g:"",d:"any",mon:0,shown:12});st.types.clear();st.acts.clear();
 $("q").value="";$("rb").value=8000;$("pg").value="";$("pd").value="any";$("pm").value="0";
 document.querySelectorAll("[data-t].on,[data-a].on").forEach(x=>x.classList.remove("on"));render()}
document.addEventListener("click",e=>{const t=e.target.closest("button");if(!t)return;const s=t.dataset;
 if(s.t)tog(st.types,s.t,t);else if(s.a)tog(st.acts,s.a,t);
 else if(s.tab){st.tab=s.tab;st.shown=12;document.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("on",x==t));render()}
 else if(s.f!==undefined){toggleTrip(+s.f);const inst=bootstrap.Modal.getInstance($("dm"));if(inst&&$("dm").classList.contains("show")&&st.cur==+s.f)t.textContent=st.trip.includes(+s.f)?"Remove from trip":"Add to my trip"}
 else if(s.d!==undefined)openDetail(+s.d);
 else if(s.m!==undefined)focusMap(+s.m);
 else if(s.up!==undefined){const k=+s.up;if(k>0){[st.trip[k-1],st.trip[k]]=[st.trip[k],st.trip[k-1]];save();render()}}
 else if(s.dn!==undefined){const k=+s.dn;if(k<st.trip.length-1){[st.trip[k+1],st.trip[k]]=[st.trip[k],st.trip[k+1]];save();render()}}
 else if(s.rm!==undefined)toggleTrip(+s.rm);
 else if(t.id=="moreBtn"){st.shown+=12;render()}
 else if(t.id=="resetBtn")reset();
 else if(t.id=="optBtn")optimize();
 else if(t.id=="copyBtn")copyTrip(t);
 else if(t.id=="clrBtn"){st.trip=[];save();render()}
 else if(t.id=="cmpOpen")openCompare();
 else if(t.id=="cmpClr"){st.cmp.clear();render()}
 else if(t.id=="surprise"){const g=D.filter(d=>!d.o);openDetail(g[Math.floor(Math.random()*g.length)].i)}
 else if(t.id=="findBtn"){st.shown=12;render();$("results").scrollIntoView()}
 else if(t.id=="themeBtn"){const n=document.documentElement.dataset.theme=="dark"?"light":"dark";document.documentElement.dataset.theme=n;try{localStorage.setItem("dtheme",n)}catch(e){}}});
document.addEventListener("change",e=>{const c=e.target.dataset.c;
 if(c!==undefined){const i=+c;if(e.target.checked){if(st.cmp.size>=3){e.target.checked=false;return}st.cmp.add(i)}else st.cmp.delete(i);render()}});
$("q").addEventListener("input",e=>{st.q=e.target.value.trim().toLowerCase();st.shown=12;render()});
$("rb").addEventListener("input",e=>{st.b=+e.target.value;st.shown=12;render()});
$("pg").addEventListener("change",e=>{st.g=e.target.value;st.shown=12;render()});
$("pd").addEventListener("change",e=>{st.d=e.target.value;render()});
$("pm").addEventListener("change",e=>{st.mon=+e.target.value;render()});
$("ps").addEventListener("change",e=>{st.sort=e.target.value;render()});
render();
