/* Destinify app logic. Needs data.js (RAW), details.js (DET), Leaflet, Leaflet.markercluster and Bootstrap. */
const A={sw:"Swimming",sn:"Snorkeling",dv:"Diving",hk:"Hiking",sf:"Surfing",ih:"Island hopping",ss:"Sightseeing",cm:"Camping",fd:"Food trip",cv:"Caving",kc:"Kayaking",cw:"Culture walks",wl:"Wildlife",cy:"Canyoneering",ad:"Adventure sports",ph:"Photography",rl:"Relaxation",bk:"Cycling"};
const PACK={sw:"Swimwear",sn:"Snorkel set (or rent one)",dv:"Dive card and logbook",hk:"Trail shoes",sf:"Rash guard",ih:"Dry bag",ss:"Walking shoes",cm:"Tent and headlamp",fd:"Cash for food stalls",cv:"Headlamp",kc:"Dry bag",cw:"Modest clothes for churches",wl:"Binoculars",cy:"Water shoes",ad:"Closed shoes",ph:"Camera and power bank",rl:"Sunscreen and a book",bk:"Helmet"};
const G={L:"Luzon & Palawan",V:"Visayas",M:"Mindanao"},GC={L:"#ff6f4c",V:"#e8b750",M:"#4fd1b5"};
const TC={Beach:["#1c6e8c","#37a3b8"],Island:["#0f5c7a","#2aa198"],Mountain:["#134d46","#3f8f6f"],Waterfall:["#1b6f6a","#5cc0a8"],Heritage:["#8a4b2d","#d18a4f"],City:["#3b4a6b","#7d8fc2"],Diving:["#0b3f6b","#1f8fbf"],Surf:["#176c8f","#f0b76a"],Cave:["#2e3a3a","#6b8a80"],Lake:["#245f73","#7fc6c0"],Nature:["#2f6b3d","#9bcf6a"],Adventure:["#7a3b1d","#e07b39"]};
const STY={1:["Budget",.75],2:["Standard",1],3:["Comfort",1.6]};
const MN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const HEART='<svg viewBox="0 0 24 24"><path d="M12 21s-7-4.6-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.4-9.5 9-9.5 9z"/></svg>';
const OSM="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const $=id=>document.getElementById(id),P=n=>"₱"+n.toLocaleString(),NOW=new Date().getMonth()+1;

/* ---------- data ---------- */
const D=RAW.trim().split("\n").map((l,i)=>{const[n,p,g,la,ln,t,b,d,a,o,bm]=l.split("|");const[s,e]=(bm||"11-5").split("-").map(Number);const mo=[];for(let m=s;;m=m%12+1){mo.push(m);if(m==e)break}return{i,n,p,g,la:+la,ln:+ln,t,b:+b,d:+d,a:a.split(" "),o:+o,mo}});
if(typeof DET!=="undefined")DET.trim().split("\n").forEach(l=>{const[n,desc,go,tip]=l.split("|"),d=D.find(x=>x.n==n);if(d)Object.assign(d,{desc,go,tip})});
const TYPES=[...new Set(D.map(x=>x.t))].sort();
const st={q:"",b:8000,g:"",d:"any",mon:0,types:new Set(),acts:new Set(),tab:"all",sort:"match",shown:12,trip:[],cmp:new Set(),pax:2,sty:2,me:null,cur:null};
try{st.trip=JSON.parse(localStorage.getItem("dtrip")||"[]").filter(i=>D[i])}catch(e){}
const hm=location.hash.match(/trip=([\d,]+)/);if(hm)st.trip=hm[1].split(",").map(Number).filter(i=>D[i]);
const save=()=>{try{localStorage.setItem("dtrip",JSON.stringify(st.trip))}catch(e){}};
document.documentElement.dataset.theme=(()=>{try{return localStorage.getItem("dtheme")||"light"}catch(e){return"light"}})();

/* ---------- helpers ---------- */
const hav=(a,b)=>{const r=x=>x*Math.PI/180,h=Math.sin(r(b.la-a.la)/2)**2+Math.cos(r(a.la))*Math.cos(r(b.la))*Math.sin(r(b.ln-a.ln)/2)**2;return 12742*Math.asin(Math.sqrt(h))};
const monthsText=d=>d.mo.length==12?"Year-round":d.mo.length==1?MN[d.mo[0]-1]:MN[d.mo[0]-1]+" to "+MN[d.mo[d.mo.length-1]-1];
const level=d=>d.t=="Mountain"?"Moderate to hard":["Adventure","Cave","Diving","Surf"].includes(d.t)?"Moderate":d.t=="Waterfall"?"Easy to moderate":"Easy";
const crowd=d=>d.o?"Busy in peak months":"Usually quiet";
const cost=d=>Math.round(d.b*st.pax*STY[st.sty][1]/100)*100;
const near=d=>D.filter(x=>x!=d).map(x=>({x,k:hav(d,x)})).filter(o=>o.k<=150).sort((a,b)=>a.k-b.k).slice(0,4);
const similar=d=>D.filter(x=>x!=d&&x.t==d.t).map(x=>({x,s:x.a.filter(a=>d.a.includes(a)).length})).sort((a,b)=>b.s-a.s).slice(0,3).map(o=>o.x);
function plan(d){const a=d.a.map(x=>A[x].toLowerCase()),o=[];
 if(d.d==1)return["Start early and focus on "+a.slice(0,3).join(", ")+", then head back by late afternoon."];
 for(let k=1;k<=d.d;k++)o.push(k==1?`Arrive, check in, and ease in with ${a[0]} or a local walk.`:k==d.d?`Morning ${a[1%a.length]}, last food or souvenir stops, then travel home.`:`Full day for ${a[(k-1)%a.length]}${a[k%a.length]&&a.length>1?" and "+a[k%a.length]:""}.`);
 return o}
const pack=d=>[...new Set(d.a.map(x=>PACK[x]).concat(["Reusable bottle","Cash in small bills","Sunscreen","Rain jacket"]))].slice(0,8);
function ctl(){return `<div class="ctl"><label>Travelers <select data-pax>${[1,2,3,4,5,6,8,10].map(n=>`<option ${n==st.pax?"selected":""}>${n}</option>`).join("")}</select></label><label>Style <select data-sty>${Object.entries(STY).map(([k,v])=>`<option value="${k}" ${k==st.sty?"selected":""}>${v[0]}</option>`).join("")}</select></label></div>`}
function copy(txt,btn,label){(navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>{btn.textContent="Copied!";setTimeout(()=>btn.textContent=label,1800)},()=>{btn.textContent="Copy not available"})}

/* ---------- matching ---------- */
function parts(d){const p=st;
 const t=p.types.size?(p.types.has(d.t)?30:0):30;
 const a=p.acts.size?25*[...p.acts].filter(x=>d.a.includes(x)).length/p.acts.size:25;
 const b=d.b<=p.b?20:Math.max(0,20*(1-(d.b-p.b)/p.b));
 let du=10;if(p.d!="any"){const[x,y]=p.d.split("-").map(Number);du=d.d>=x&&d.d<=y?10:Math.abs(d.d-(d.d<x?x:y))==1?5:0}
 const s=p.mon?(d.mo.includes(p.mon)?15:0):15;
 return{t,a,b,du,s}}
const score=d=>{const x=parts(d);return Math.round(x.t+x.a+x.b+x.du+x.s)};
function list(){D.forEach(d=>{d.s=score(d);d.km=st.me?hav(st.me,d):null});
 const S={match:(a,b)=>b.s-a.s||b.o-a.o,cheap:(a,b)=>a.b-b.b,short:(a,b)=>a.d-b.d||a.b-b.b,az:(a,b)=>a.n.localeCompare(b.n),near:(a,b)=>a.km-b.km};
 return D.filter(d=>(!st.q||(d.n+" "+d.p+" "+d.t).toLowerCase().includes(st.q))&&(!st.g||d.g==st.g)&&(st.tab=="pop"?d.o:st.tab=="gem"?!d.o:st.tab=="now"?d.mo.includes(NOW):st.tab=="trip"?st.trip.includes(d.i):true)).sort(S[st.sort])}

/* ---------- cards ---------- */
function cardH(d){const c=TC[d.t]||TC.Nature,on=st.trip.includes(d.i);
 return `<article class="dcard"><div class="vis" style="background:linear-gradient(135deg,${c[0]},${c[1]})"><span class="type">${d.t}</span>
 <button class="heart${on?" on":""}" data-f="${d.i}" aria-label="${on?"Remove from":"Add to"} my trip">${HEART}</button>
 <span class="score"><i></i>${d.s}% match</span>
 <label class="cmp"><input type="checkbox" data-c="${d.i}" ${st.cmp.has(d.i)?"checked":""}> Compare</label></div>
 <div class="body"><div class="name">${d.n}</div><div class="where">${d.p} · ${G[d.g]}${d.km!=null?` · ${Math.round(d.km).toLocaleString()} km away`:""}</div>
 ${d.desc?`<p class="blurb">${d.desc}</p>`:""}
 <div class="tags"><span class="tag ${d.o?"pop":"gem"}">${d.o?"Popular":"Hidden gem"}</span>${d.mo.includes(NOW)?'<span class="tag now">In season</span>':""}${d.a.slice(0,2).map(x=>`<span class="tag">${A[x]}</span>`).join("")}</div>
 <div class="foot"><div><b>${P(d.b)}</b> <span>/ ${d.d} day${d.d>1?"s":""}</span></div><div class="act"><button data-m="${d.i}">Map</button><button data-d="${d.i}">Details</button></div></div></div></article>`}

/* ---------- map ---------- */
const osm=L.tileLayer(OSM,{maxZoom:18,attribution:"© OpenStreetMap contributors"});
const topo=L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",{maxZoom:17,attribution:"© OpenTopoMap, © OpenStreetMap contributors"});
const sat=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:18,attribution:"Tiles © Esri"});
const map=L.map("map",{layers:[osm],scrollWheelZoom:false}).setView([12.2,122.3],6);
L.control.layers({Street:osm,Terrain:topo,Satellite:sat}).addTo(map);
map.on("click",()=>map.scrollWheelZoom.enable());map.on("mouseout",()=>map.scrollWheelZoom.disable());
const cluster=L.markerClusterGroup({maxClusterRadius:45,showCoverageOnHover:false}).addTo(map);
let mk={},route,meMk;
const popup=d=>`<b>${d.n}</b><br>${d.p} · ${d.t}<br>${P(d.b)} · ${d.d} day${d.d>1?"s":""}<br><b style="font-size:14px">${d.s}% match</b><br><a href="#" onclick="openDetail(${d.i});return false">View details</a>`;
function drawMap(arr){cluster.clearLayers();mk={};
 arr.forEach(d=>{const m=L.circleMarker([d.la,d.ln],{radius:d.o?9:6,color:"#0a2622",weight:st.trip.includes(d.i)?4:1.5,fillColor:GC[d.g],fillOpacity:.35+.6*d.s/100}).bindPopup(popup(d));mk[d.i]=m;cluster.addLayer(m)});
 if(route)map.removeLayer(route);
 const pts=st.trip.map(i=>[D[i].la,D[i].ln]);
 if(pts.length>1)route=L.polyline(pts,{color:"#e8b750",weight:3,dashArray:"8 8"}).addTo(map);
 if(st.me){if(meMk)map.removeLayer(meMk);meMk=L.circleMarker([st.me.la,st.me.ln],{radius:7,color:"#fff",weight:2,fillColor:"#2b7fff",fillOpacity:1}).addTo(map).bindTooltip("You are here")}}
function focusMap(i){const inst=bootstrap.Modal.getInstance($("dm"));if(inst)inst.hide();
 $("mapsection").scrollIntoView();
 if(mk[i])setTimeout(()=>cluster.zoomToShowLayer(mk[i],()=>mk[i].openPopup()),600);
 else map.flyTo([D[i].la,D[i].ln],10)}

/* ---------- render ---------- */
function render(){const arr=list();
 $("rc").textContent=`${arr.length} destination${arr.length==1?"":"s"}, ranked by how well they match your preferences.`;
 $("rt").textContent=st.tab=="trip"?"Your trip":st.tab=="gem"?"Hidden gems worth the trip":st.tab=="now"?"In season this month ("+MN[NOW-1]+")":"Your best matches";
 $("grid").innerHTML=arr.slice(0,st.shown).map(cardH).join("")||`<div class="empty">${st.tab=="trip"?"Tap the heart on a destination to add it to your trip.":"No destinations match these filters. Try a higher budget or fewer activities."}</div>`;
 $("more").innerHTML=arr.length>st.shown?`<button class="btn btn-d" id="moreBtn">Show more (${arr.length-st.shown} left)</button>`:"";
 $("tripN").textContent=st.trip.length;
 $("cbar").classList.toggle("show",st.cmp.size>0);$("cn").textContent=st.cmp.size;
 $("rv").textContent=P(st.b)+(st.b>=30000?"+":"");
 drawMap(arr);renderTrip()}

/* ---------- trip planner ---------- */
const tripKm=()=>st.trip.slice(1).reduce((s,i,k)=>s+hav(D[st.trip[k]],D[i]),0);
function renderTrip(){const T=st.trip.map(i=>D[i]);
 if(!T.length){$("tripBody").innerHTML='<p style="color:var(--soft)">Nothing here yet. Tap the heart on any destination to start planning.</p>';return}
 const days=T.reduce((s,d)=>s+d.d,0),tot=T.reduce((s,d)=>s+cost(d),0);
 $("tripBody").innerHTML=`${ctl()}<div class="trip-sum"><div><b>${T.length}</b><span>stops</span></div><div><b>${days}</b><span>days</span></div><div><b>${P(tot)}</b><span>est. total for ${st.pax}</span></div></div>
 <p style="font-size:13px;color:var(--soft)">Straight-line route ≈ ${Math.round(tripKm()).toLocaleString()} km, not counting transfers. The gold line on the map follows your order. Estimates exclude flights to the Philippines.</p>
 ${T.map((d,k)=>`<div class="stop"><span class="n">${k+1}</span><div class="t"><b>${d.n}</b><span>${d.p} · ${d.d}d · ${P(cost(d))}</span></div><button data-up="${k}" aria-label="Move up">↑</button><button data-dn="${k}" aria-label="Move down">↓</button><button data-rm="${d.i}" aria-label="Remove">✕</button></div>`).join("")}
 <div class="macts" style="margin-top:18px"><button class="btn btn-d" id="optBtn">Optimize route</button><button class="btn btn-l" id="copyBtn">Copy itinerary</button><button class="btn btn-l" id="shareBtn">Copy share link</button><button class="btn btn-l" id="clrBtn">Clear</button></div>`}
function optimize(){if(st.trip.length<3)return;const left=[...st.trip],out=[left.shift()];
 while(left.length){const c=D[out[out.length-1]];let bi=0,bd=1e9;left.forEach((j,k)=>{const x=hav(c,D[j]);if(x<bd){bd=x;bi=k}});out.push(left.splice(bi,1)[0])}
 st.trip=out;save();render()}
function tripText(){const T=st.trip.map(i=>D[i]);return "My Destinify trip\n"+T.map((d,k)=>`${k+1}. ${d.n}, ${d.p} (${d.d} days, about ${P(cost(d))} for ${st.pax})`).join("\n")+`\nTotal: ${T.reduce((s,d)=>s+d.d,0)} days, about ${P(T.reduce((s,d)=>s+cost(d),0))}`}
function toggleTrip(i){const k=st.trip.indexOf(i);k>-1?st.trip.splice(k,1):st.trip.push(i);save();render()}
function refreshCost(){renderTrip();if($("mcost")&&st.cur!=null)$("mcost").innerHTML=costH(D[st.cur])}
const costH=d=>`<b>${P(cost(d))}</b> for ${st.pax} traveler${st.pax>1?"s":""} (${STY[st.sty][0].toLowerCase()} style, ${d.d} day${d.d>1?"s":""}). Base estimate is ${P(d.b)} per person and excludes flights to the Philippines.`;

/* ---------- detail + compare ---------- */
let mini;
function chipsFor(arr){return arr.map(x=>`<button class="chip" data-d="${x.i}">${x.n}</button>`).join("")}
function openDetail(i){const d=D[i],c=TC[d.t]||TC.Nature,x=parts(d);d.s=score(d);st.cur=i;
 if(mini){mini.remove();mini=null}
 const br=["Diving","Adventure","Surf"].includes(d.t)?[.25,.25,.15,.35]:["City","Heritage"].includes(d.t)?[.3,.35,.25,.1]:[.3,.3,.2,.2];
 const bn=["Transport","Stay","Food","Activities"],bc=["#1c6e8c","#e8b750","#ff6f4c","#4fd1b5"];
 const rows=[["Destination type",x.t,30],["Activities",x.a,25],["Budget",x.b,20],["Trip length",x.du,10],["Season",x.s,15]];
 const nb=near(d),sm=similar(d);
 const facts=[["Type",d.t],["Region",G[d.g]],["Suggested stay",d.d+" day"+(d.d>1?"s":"")],["Budget",P(d.b)+" per person"],["Activity level",level(d)],["Crowds",crowd(d)],["Best months",monthsText(d)],["Right now",d.mo.includes(NOW)?"In season":"Off-peak"]];
 $("dmc").innerHTML=`<div class="mh" style="background:linear-gradient(135deg,${c[0]},${c[1]})"><button class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button><h3>${d.n}</h3><p>${d.p} · ${G[d.g]} · ${d.o?"Popular":"Hidden gem"}</p></div>
 <div class="dsc">${d.desc?`<p class="lead2">${d.desc}</p>`:""}<div class="facts">${facts.map(f=>`<div><span>${f[0]}</span><b>${f[1]}</b></div>`).join("")}</div>
 ${d.go?`<div class="info"><h4>GETTING THERE</h4><p>${d.go}</p></div>`:""}${d.tip?`<div class="info"><h4>LOCAL TIP</h4><p>${d.tip}</p></div>`:""}</div>
 <div class="mb"><div><h4>WHY IT SCORES ${d.s}%</h4>${rows.map(r=>`<div class="bar"><span>${r[0]}</span><div><i style="width:${r[1]/r[2]*100}%"></i></div><b>${Math.round(r[1])}/${r[2]}</b></div>`).join("")}
 <h4 style="margin-top:20px">BEST MONTHS</h4><div class="months">${MN.map((m,k)=>`<span class="${d.mo.includes(k+1)?"on":""}">${m[0]}</span>`).join("")}</div>
 <p class="note">Typhoon season runs roughly June to November, so check forecasts and keep bookings flexible.</p>
 <h4>COST CALCULATOR</h4>${ctl()}<p id="mcost" class="note">${costH(d)}</p>
 <div class="split">${br.map((v,k)=>`<i style="width:${v*100}%;background:${bc[k]}"></i>`).join("")}</div>
 <div class="bl">${br.map((v,k)=>`<span><i style="background:${bc[k]}"></i>${bn[k]} ${P(Math.round(d.b*v/50)*50)}</span>`).join("")}</div></div>
 <div><div id="mini"></div><h4>THINGS TO DO</h4><div class="tags">${d.a.map(a=>`<span class="tag">${A[a]}</span>`).join("")}</div>
 <h4>SAMPLE PLAN</h4><ol class="plan">${plan(d).map(p=>`<li>${p}</li>`).join("")}</ol>
 <h4>WHAT TO PACK</h4><div class="tags">${pack(d).map(p=>`<span class="tag">${p}</span>`).join("")}</div>
 <div class="macts"><button class="btn btn-c" data-f="${d.i}">${st.trip.includes(d.i)?"Remove from trip":"Add to my trip"}</button><button class="btn btn-l" data-m="${d.i}">Show on map</button></div></div></div>
 <div class="dsc" style="padding-top:0">${nb.length?`<h4>NEARBY (WITHIN 150 KM)</h4><div class="tags">${nb.map(o=>`<button class="chip" data-d="${o.x.i}">${o.x.n} · ${Math.round(o.k)} km</button>`).join("")}</div>`:""}
 ${sm.length?`<h4 style="margin-top:14px">SIMILAR PLACES</h4><div class="tags">${chipsFor(sm)}</div>`:""}
 <p class="note" style="margin-top:14px">Details are general guidance. Confirm fees, schedules, permits, and travel advisories with official sources before you go.</p></div>`;
 bootstrap.Modal.getOrCreateInstance($("dm")).show()}
$("dm").addEventListener("shown.bs.modal",()=>{const d=D[st.cur];if(!d||!$("mini"))return;if(mini)mini.remove();
 mini=L.map("mini",{scrollWheelZoom:false}).setView([d.la,d.ln],9);L.tileLayer(OSM,{maxZoom:18,attribution:"© OpenStreetMap"}).addTo(mini);
 L.circleMarker([d.la,d.ln],{radius:9,color:"#0a2622",fillColor:GC[d.g],fillOpacity:.95}).addTo(mini)});
function openCompare(){const T=[...st.cmp].map(i=>D[i]);T.forEach(d=>d.s=score(d));
 const R=[["Type",d=>d.t],["Region",d=>G[d.g]],["Province",d=>d.p],["Budget",d=>P(d.b)],["Suggested stay",d=>d.d+" days"],["Best months",monthsText],["Activity level",level],["Crowds",crowd],["Activities",d=>d.a.map(a=>A[a]).join(", ")],["Getting there",d=>d.go||"-"],["Local tip",d=>d.tip||"-"],["Match",d=>d.s+"%"]];
 $("cmc").innerHTML=`<div class="mh" style="background:var(--t900)"><button class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button><h3>Compare destinations</h3></div><div style="padding:10px 20px 24px;overflow-x:auto"><table class="cmpt"><tr><th></th>${T.map(d=>`<td><b style="font:600 17px Fraunces,serif">${d.n}</b></td>`).join("")}</tr>${R.map(r=>`<tr><th>${r[0]}</th>${T.map(d=>`<td>${r[1](d)}</td>`).join("")}</tr>`).join("")}</table></div>`;
 bootstrap.Modal.getOrCreateInstance($("cm")).show()}

/* ---------- insights ---------- */
function buildInsights(){const avg=a=>Math.round(a.reduce((s,d)=>s+d.b,0)/a.length/100)*100;
 const types=TYPES.map(t=>[t,D.filter(d=>d.t==t).length]).sort((a,b)=>b[1]-a[1]),mx=types[0][1];
 const mon=MN.map((m,k)=>[m,D.filter(d=>d.mo.includes(k+1)).length]),mm=Math.max(...mon.map(x=>x[1]));
 const cheap=[...D].sort((a,b)=>a.b-b.b).slice(0,5);
 $("ins").innerHTML=`<div class="icards">${Object.keys(G).map(g=>{const a=D.filter(d=>d.g==g);return `<div class="ic"><span class="dot" style="background:${GC[g]}"></span><h3>${G[g]}</h3><b>${a.length}</b><p>${Math.round(a.filter(d=>!d.o).length/a.length*100)}% hidden gems · average budget ${P(avg(a))}</p></div>`}).join("")}</div>
 <div class="two"><div class="ibox"><h4>DESTINATIONS BY TYPE</h4>${types.map(t=>`<div class="hb"><span>${t[0]}</span><div><i style="width:${t[1]/mx*100}%"></i></div><b>${t[1]}</b></div>`).join("")}</div>
 <div class="ibox"><h4>HOW MANY ARE IN SEASON EACH MONTH</h4><div class="vbars">${mon.map(m=>`<div class="${m[0]==MN[NOW-1]?"cur":""}"><i style="height:${m[1]/mm*100}%"></i><span>${m[0]}</span><b>${m[1]}</b></div>`).join("")}</div>
 <h4 style="margin-top:22px">FIVE MOST AFFORDABLE</h4>${cheap.map(d=>`<div class="hb2"><button data-d="${d.i}">${d.n}</button><span>${P(d.b)} · ${d.d} day${d.d>1?"s":""}</span></div>`).join("")}</div></div>`}

/* ---------- controls ---------- */
$("sN").textContent=D.length;$("sA").textContent=Object.keys(A).length;$("sT").textContent=TYPES.length;
$("tc").innerHTML=TYPES.map(t=>`<button class="chip" data-t="${t}">${t}</button>`).join("");
$("ac").innerHTML=Object.entries(A).map(([k,v])=>`<button class="chip" data-a="${k}">${v}</button>`).join("");
$("pm").innerHTML='<option value="0">Any month</option>'+MN.map((m,i)=>`<option value="${i+1}">${m}</option>`).join("");
const tog=(set,v,btn)=>{set.has(v)?set.delete(v):set.add(v);btn.classList.toggle("on");st.shown=12;render()};
function reset(){Object.assign(st,{q:"",b:8000,g:"",d:"any",mon:0,shown:12});st.types.clear();st.acts.clear();
 $("q").value="";$("rb").value=8000;$("pg").value="";$("pd").value="any";$("pm").value="0";
 document.querySelectorAll("[data-t].on,[data-a].on").forEach(x=>x.classList.remove("on"));render()}
function locate(btn){if(!navigator.geolocation){btn.textContent="Location not available";return}
 btn.textContent="Locating...";
 navigator.geolocation.getCurrentPosition(p=>{st.me={la:p.coords.latitude,ln:p.coords.longitude};
  if(![...$("ps").options].some(o=>o.value=="near"))$("ps").add(new Option("Nearest to me","near"));
  $("ps").value="near";st.sort="near";btn.textContent="Near me ✓";render()},()=>{btn.textContent="Location blocked"})}
document.addEventListener("click",e=>{const t=e.target.closest("button");if(!t)return;const s=t.dataset;
 if(s.t)tog(st.types,s.t,t);else if(s.a)tog(st.acts,s.a,t);
 else if(s.tab){st.tab=s.tab;st.shown=12;document.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("on",x==t));render()}
 else if(s.f!==undefined){toggleTrip(+s.f);if($("dm").classList.contains("show")&&st.cur==+s.f)t.textContent=st.trip.includes(+s.f)?"Remove from trip":"Add to my trip"}
 else if(s.d!==undefined)openDetail(+s.d);
 else if(s.m!==undefined)focusMap(+s.m);
 else if(s.up!==undefined){const k=+s.up;if(k>0){[st.trip[k-1],st.trip[k]]=[st.trip[k],st.trip[k-1]];save();render()}}
 else if(s.dn!==undefined){const k=+s.dn;if(k<st.trip.length-1){[st.trip[k+1],st.trip[k]]=[st.trip[k],st.trip[k+1]];save();render()}}
 else if(s.rm!==undefined)toggleTrip(+s.rm);
 else if(t.id=="moreBtn"){st.shown+=12;render()}
 else if(t.id=="resetBtn")reset();
 else if(t.id=="optBtn")optimize();
 else if(t.id=="copyBtn")copy(tripText(),t,"Copy itinerary");
 else if(t.id=="shareBtn")copy(location.origin+location.pathname+"#trip="+st.trip.join(","),t,"Copy share link");
 else if(t.id=="clrBtn"){st.trip=[];save();render()}
 else if(t.id=="cmpOpen")openCompare();
 else if(t.id=="cmpClr"){st.cmp.clear();render()}
 else if(t.id=="nearBtn")locate(t);
 else if(t.id=="surprise"){const g=D.filter(d=>!d.o);openDetail(g[Math.floor(Math.random()*g.length)].i)}
 else if(t.id=="findBtn"){st.shown=12;render();$("results").scrollIntoView()}
 else if(t.id=="themeBtn"){const n=document.documentElement.dataset.theme=="dark"?"light":"dark";document.documentElement.dataset.theme=n;try{localStorage.setItem("dtheme",n)}catch(e){}}});
document.addEventListener("change",e=>{const el=e.target;
 if(el.dataset.c!==undefined){const i=+el.dataset.c;if(el.checked){if(st.cmp.size>=3){el.checked=false;return}st.cmp.add(i)}else st.cmp.delete(i);render()}
 else if(el.dataset.pax!==undefined){st.pax=+el.value;refreshCost()}
 else if(el.dataset.sty!==undefined){st.sty=+el.value;refreshCost()}});
$("q").addEventListener("input",e=>{st.q=e.target.value.trim().toLowerCase();st.shown=12;render()});
$("rb").addEventListener("input",e=>{st.b=+e.target.value;st.shown=12;render()});
$("pg").addEventListener("change",e=>{st.g=e.target.value;st.shown=12;render()});
$("pd").addEventListener("change",e=>{st.d=e.target.value;render()});
$("pm").addEventListener("change",e=>{st.mon=+e.target.value;render()});
$("ps").addEventListener("change",e=>{st.sort=e.target.value;render()});
buildInsights();render();
