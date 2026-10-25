/* Destinify v12 add-on: a redesigned My trip panel, a redesigned Favorites panel, and a full Travel tips section.
   My trip replaces renderTrip, and keeps the ids and data attributes that earlier add-ons rely on
   (drag and drop, day planner, calendar export, trip builder). Shared data is in regions.js (FOOD, TRIP_PACK). */
(()=>{
const{LS,esc}=DX;
const R=Object.fromEntries(REGIONS.map(r=>[r.c,r]));
const rgOf=d=>d.r!==undefined?d.r:(PROV_REGION[d.p]||"");
const rname=d=>(R[rgOf(d)]||{}).s||"";
const favs=()=>{const u=DX.U();return u?(u.fav||[]):(LS("dfav")||[])};
const isF=i=>favs().includes(i);
const grad=d=>{const c=(typeof TC!="undefined"&&TC[d.t])||["#134d46","#3f8f6f"];return `linear-gradient(135deg,${c[0]},${c[1]})`};
const thumb=(d,cls)=>`<span class="xthumb ${cls||""}" data-pic="${d.i}" style="background:${grad(d)}">${d.img?`<img src="${d.img}" alt="" loading="lazy">`:""}</span>`;
function hydrate(root){root.querySelectorAll("[data-pic]").forEach(el=>{const d=D[+el.dataset.pic];if(!d||el.querySelector("img"))return;getImg(d).then(u=>{if(u&&!el.querySelector("img"))el.insertAdjacentHTML("afterbegin",`<img src="${u}" alt="" loading="lazy">`)}).catch(()=>{})})}
const HRS=h=>{if(h<1)return Math.max(10,Math.round(h*12)*5)+" min";const r=Math.round(h*2)/2;return r+(r==1?" hr":" hrs")};
function est(a,b){const km=hav(a,b);if(km<=25){const h=km/25+.2;return{km,h,l:`about ${HRS(h)} by road`}}
 if(km>350||a.g!=b.g)return{km,h:4,l:"about 4 hrs by flight, with airport time"};
 const sea=a.t=="Island"||b.t=="Island"||a.g=="V",h=km/40*1.25+(sea?1.5:0);return{km,h,l:`about ${HRS(h)} by ${sea?"bus or van and ferry":"bus or van"}`}}
const WC=c=>c==0?"☀️":c<=2?"🌤️":c==3?"☁️":c<=48?"🌫️":c<=57?"🌦️":c<=82?"🌧️":"⛈️";
const dirs=(a,b)=>`https://www.google.com/maps/dir/?api=1${a?`&origin=${a.la},${a.ln}`:""}&destination=${b.la},${b.ln}`;
const need=T=>{const s=new Set(TRIP_PACK.all);T.forEach(d=>(TRIP_PACK[d.t]||[]).forEach(x=>s.add(x)));return[...s]};

/* ================= MY TRIP ================= */
function emptyTrip(){const pool=D.filter(d=>d.tt&&d.o),k=(new Date().getDate()*7)%Math.max(1,pool.length),pick=[...pool.slice(k),...pool.slice(0,k)].slice(0,6);
 return `<div class="xempty"><div class="xemoji">🧳</div><h4>Your trip starts here</h4><p>Tap <b>+ Trip</b> on any destination. Then drag stops to reorder, see travel time between them, check the weather, and export to your calendar.</p>
 <div class="xchips">${pick.map(d=>`<button class="chip" data-x5="trip" data-id="${d.i}">+ ${esc(d.n)}</button>`).join("")}</div>
 <div class="macts" style="justify-content:center"><button class="btn btn-c" data-tab="tt" data-bs-dismiss="offcanvas" data-scroll="results">🔥 Browse TikTok spots</button><button class="btn btn-l" data-x2="quiz" data-bs-dismiss="offcanvas">Take the quiz</button></div></div>${buildBox()}`}
const buildBox=()=>`<div class="xbox"><h4>BUILD A TRIP FOR ME</h4><div class="xg"><input id="xdy" type="number" min="1" max="30" value="7" class="form-control" aria-label="Days"><input id="xbd" type="number" min="1000" step="500" value="${st.b*3}" class="form-control" aria-label="Total budget per person"></div><p class="note">Days, then total budget per person (PHP). Picks nearby high-scoring places.</p><button class="btn btn-d" data-x="build">Build trip</button></div>`;
const renderTripX=()=>{const body=$("tripBody"),T=st.trip.map(i=>D[i]).filter(Boolean);
 if(!T.length){body.innerHTML=emptyTrip();hydrate(body);return}
 const days=T.reduce((s,d)=>s+d.d,0),tot=T.reduce((s,d)=>s+cost(d),0),pp=tot/st.pax,km=tripKm(),regs=[...new Set(T.map(rname).filter(Boolean))],tt=T.filter(d=>d.tt).length;
 const saved=+LS("dtripb"),tb=saved||Math.max(5000,Math.ceil(pp*1.15/1000)*1000),pct=Math.min(100,Math.round(pp/tb*100)),over=pp>tb;
 const stops=T.map((d,k)=>{const prev=k?T[k-1]:null,e=prev?est(prev,d):null;
  return (e?`<div class="xtc"><i></i><span>↓ ${e.l} · ${Math.round(e.km)} km <em>(estimate)</em></span></div>`:"")+
  `<div class="xts xdrag" draggable="true" data-k="${k}"><span class="xgrip" title="Drag to reorder">⋮⋮</span>${thumb(d)}<div class="xtb"><div class="xtt"><span class="xnum">${k+1}</span><button class="xlink" data-d="${d.i}">${esc(d.n)}</button></div><div class="xtm">${esc(d.p)}${rname(d)?" · "+esc(rname(d)):""} · ${d.d}d · <b>${P(cost(d))}</b></div><div class="xtg"><span class="tag">${esc(d.t)}</span>${d.tt?'<span class="tag tt">🔥 TikTok</span>':""}<span class="tag xwx" data-wx="${d.i}">weather…</span></div></div><div class="xta"><button data-up="${k}" aria-label="Move up">↑</button><button data-dn="${k}" aria-label="Move down">↓</button><button class="${isF(d.i)?"on":""}" data-x5="fav" data-id="${d.i}" aria-label="Favorite">♥</button><a href="${dirs(prev,d)}" target="_blank" rel="noopener" aria-label="Directions" title="Directions">➤</a><button data-rm="${d.i}" aria-label="Remove">✕</button></div></div>`}).join("");
 const pk=need(T).slice(0,12);
 body.innerHTML=`<div class="xth"><div class="xthh"><b>Your trip</b><span>${regs.slice(0,4).map(esc).join(" · ")}${regs.length>4?" +"+(regs.length-4):""}</span></div>
 <div class="xtm5"><div><b>${T.length}</b><span>stops</span></div><div><b>${days}</b><span>days</span></div><div><b>${P(tot)}</b><span>total for ${st.pax}</span></div><div><b>${P(Math.round(pp))}</b><span>per person</span></div><div><b>${Math.round(km).toLocaleString()}</b><span>km route</span></div></div></div>
 ${ctl()}
 <div class="xbud"><div class="xbudh"><label for="xtb">Trip budget per person</label><input id="xtb" type="number" min="1000" step="500" value="${tb}" class="form-control"></div><div class="xmeter${over?" over":""}"><i style="width:${pct}%"></i></div><p class="note">${over?`About <b>${P(Math.round(pp-tb))}</b> over your budget. Try a cheaper style, fewer stops, or a closer starting point.`:`About <b>${P(Math.round(tb-pp))}</b> left in your budget (${pct}% used).`}${tt?` · ${tt} TikTok spot${tt>1?"s":""} included.`:""}</p></div>
 <div class="xlist">${stops}</div>
 <p class="note">Drag the ⋮⋮ handle to reorder. The gold line on the map follows your order. Estimates exclude flights to the Philippines.</p>
 <div class="xact"><button class="btn btn-d" id="optBtn">✨ Optimize route</button><button class="btn btn-c" data-x4="plan">🗓 Day planner</button><a class="btn btn-l" href="#mapsection" data-bs-dismiss="offcanvas">🗺 See on map</a></div>
 <div class="xbox"><h4>EXPORT AND SHARE</h4><label class="note">Trip start date</label><input id="xsd" type="date" class="form-control" value="${new Date(Date.now()+12096e5).toISOString().slice(0,10)}"><div class="macts mt-2"><button class="btn btn-d" data-x2="ics">Add to calendar (.ics)</button><button class="btn btn-l" data-x2="print">Print itinerary</button><button class="btn btn-l" id="copyBtn">Copy itinerary</button><button class="btn btn-l" id="shareBtn">Copy share link</button></div></div>
 <div class="xbox"><h4>TRIP_PACK FOR THIS TRIP</h4><div class="tags">${pk.map(x=>`<span class="tag">${esc(x)}</span>`).join("")}</div><p class="note mt-2"><a href="#faq" data-bs-dismiss="offcanvas" data-tp="pack">Open the full packing checklist</a></p></div>
 ${buildBox()}<div class="macts" style="margin-top:14px"><button class="btn btn-l" id="clrBtn">Clear trip</button></div>`;
 hydrate(body);
 if(DX.wx)T.slice(0,12).forEach(d=>DX.wx(d).then(j=>{const el=body.querySelector(`[data-wx="${d.i}"]`);if(el)el.textContent=`${WC(j.current.weather_code)} ${Math.round(j.current.temperature_2m)}°C now`}).catch(()=>{const el=body.querySelector(`[data-wx="${d.i}"]`);if(el)el.remove()}));
 else body.querySelectorAll(".xwx").forEach(e=>e.remove())};
const _rt0=renderTrip;renderTrip=()=>{try{renderTripX()}catch(e){console.warn("Destinify v12 (trip):",e);_rt0()}};
document.addEventListener("change",e=>{if(e.target.id=="xtb"){const v=+e.target.value;if(v>=1000){LS("dtripb",v);renderTrip()}}});

/* ================= FAVORITES ================= */
let fvf="all",fvs="added";
const FLT={all:()=>1,tt:d=>d.tt,sea:d=>["Beach","Island","Diving","Surf"].includes(d.t),nature:d=>["Nature","Waterfall","Mountain","Lake","Cave","Adventure"].includes(d.t),culture:d=>["Heritage","City"].includes(d.t)};
function myFav(){const el=$("favBody");if(!el)return;const a=favs().filter(i=>D[i]).map(i=>D[i]);$("favN").textContent=a.length;
 if(!a.length){el.innerHTML=`<div class="xempty"><div class="xemoji">💗</div><h4>No favorites yet</h4><p>Tap the heart on any destination to save it here. Then compare, sort and move your picks into a trip.</p><div class="macts" style="justify-content:center"><button class="btn btn-c" data-bs-dismiss="offcanvas" data-scroll="results">Browse destinations</button></div></div>`;return}
 let l=a.filter(FLT[fvf]||FLT.all);if(fvs=="price")l.sort((x,y)=>x.b-y.b);else if(fvs=="az")l.sort((x,y)=>x.n.localeCompare(y.n));
 const avg=Math.round(a.reduce((s,d)=>s+d.b,0)/a.length/100)*100,regs=new Set(a.map(rname).filter(Boolean)).size,ttn=a.filter(d=>d.tt).length;
 const chip=(k,t)=>`<button class="chip${fvf==k?" on":""}" data-fvf="${k}">${t}</button>`;
 el.innerHTML=`<div class="xfh2"><div><b>${a.length}</b><span>saved</span></div><div><b>${regs}</b><span>regions</span></div><div><b>${P(avg)}</b><span>avg per person</span></div><div><b>${ttn}</b><span>TikTok</span></div></div>
 <div class="xfbar"><div class="xchips">${chip("all","All")}${chip("tt","🔥 TikTok")}${chip("sea","🏝 Beach & sea")}${chip("nature","🌿 Nature")}${chip("culture","🏛 Culture & city")}</div><select data-fvs aria-label="Sort favorites"><option value="added"${fvs=="added"?" selected":""}>Recently added</option><option value="price"${fvs=="price"?" selected":""}>Lowest budget</option><option value="az"${fvs=="az"?" selected":""}>A to Z</option></select></div>
 <div class="xfg">${l.map(d=>`<div class="xfc"><button class="xfp" data-d="${d.i}" aria-label="Open ${esc(d.n)}">${thumb(d,"big")}</button><button class="xfx" data-x5="fav" data-id="${d.i}" aria-label="Remove from favorites">♥</button><div class="xfb"><button class="xlink" data-d="${d.i}">${esc(d.n)}</button><small>${esc(d.p)}${rname(d)?" · "+esc(rname(d)):""}</small><div class="xtg"><span class="tag">${esc(d.t)}</span>${d.tt?'<span class="tag tt">🔥</span>':""}<span class="tag">${P(d.b)}</span><span class="tag">${d.d}d</span></div></div><button class="btn ${st.trip.includes(d.i)?"btn-l":"btn-c"} xfa" data-x5="trip" data-id="${d.i}">${st.trip.includes(d.i)?"In trip ✓":"+ Trip"}</button></div>`).join("")||'<p class="note">No favorites in this group yet.</p>'}</div>
 <div class="macts" style="margin-top:16px"><button class="btn btn-c" data-x5="allfav">Add all to my trip</button><button class="btn btn-l" data-x9="copyfav">Copy list</button><button class="btn btn-l" data-x5="clrfav">Clear</button></div>`;hydrate(el)}
const _r=render;render=()=>{_r();try{myFav()}catch(e){console.warn("Destinify v12 (favorites):",e)}};
document.addEventListener("click",e=>{const f=e.target.closest("[data-fvf]");if(f){fvf=f.dataset.fvf;return myFav()}
 const c=e.target.closest('[data-x9="copyfav"]');if(c){const t="My Destinify favorites\n"+favs().filter(i=>D[i]).map(i=>`• ${D[i].n}, ${D[i].p}`).join("\n");(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>{c.textContent="Copied!";setTimeout(()=>c.textContent="Copy list",1500)}).catch(()=>{})}});
document.addEventListener("change",e=>{if(e.target.matches("[data-fvs]")){fvs=e.target.value;myFav()}});

/* ================= TRAVEL TIPS =================
   Every tab is a list of cards, so the admin can edit them in Admin console > Site content (they are saved as SC.data.tips).
   A card is {t: title, k: kind, l: lines, n: note, w: wide}. Kinds:
     list    a bulleted list, one line per bullet (**bold** and [label](https://link) work)
     table   two columns, one line per row as  left | right
     check   a tick-off checklist
     months  best-months rows as  label | 11,12,1,2   (month numbers)
     seasons, picks, regions   built from the catalog, so only the title and note can be changed */
const TP=[["time","📅 Best time"],["weather","⛈ Weather"],["money","💰 Money"],["go","🚌 Getting around"],["pack","🎒 Packing"],["safe","🛟 Safety & health"],["culture","🍲 Culture & food"],["regions","🗺 Regions"]];
let tpk="time";
const ul=a=>"<ul>"+a.map(x=>`<li>${x}</li>`).join("")+"</ul>";
const RH=t=>window.SC?SC.rich(t):esc(t);
const uniq=a=>[...new Set(a)];
const TD=()=>({
time:{cards:[
 {k:"seasons",t:"Seasons at a glance",w:1,n:"Cool and dry: Nov–Feb · Hot and dry: Mar–May · Rainy: Jun–Oct. Typhoons peak around Jul–Oct but can happen from Jun to Dec. The outlined month is this month."},
 {k:"months",t:"What is best, and when",w:1,l:["Beaches and island hopping | 11,12,1,2,3,4,5","Mountains and sea of clouds | 11,12,1,2","Waterfalls at their fullest | 6,7,8,9,10,11","Surf: Siargao | 8,9,10,11","Surf: Baler | 10,11,12,1,2","Surf: La Union | 11,12,1,2,3,4","Whale sharks in Donsol | 11,12,1,2,3,4,5,6","Diving and Tubbataha | 3,4,5,6","Festival season | 1,2,3,4,5,8,10"],n:"Filled squares are the usual best months. Conditions vary by year, so check forecasts before you book."},
 {k:"picks",t:"Good picks this month ({month})",w:1}]},
weather:{cards:[
 {k:"list",t:"Typhoon season",l:["Roughly June to November, with the highest risk from July to October.","Boats and flights can be cancelled at short notice, and sea trips are often suspended when storm signals are raised.","Keep your schedule flexible and buffer a day before your flight home.","Mornings are often clearer than afternoons in the rainy months."]},
 {k:"list",t:"Check before you go",l:["[PAGASA](https://www.pagasa.dost.gov.ph/) for forecasts and storm signals","[Phivolcs](https://www.phivolcs.dost.gov.ph/) for volcano and earthquake alerts","Your ferry or airline for cancellations","Each destination page for a 5-day forecast and a this-week verdict"]},
 {k:"list",t:"If a storm is coming",l:["Move your trip earlier or later, or choose a place in a different region.","Check cancellation rules before paying for tours.","Keep phones charged and carry a power bank and some cash.","Travel insurance that covers delays is worth having."]},
 {k:"list",t:"Dry-season notes",l:["Mar–May is hot, so start hikes early and carry plenty of water.","Seas are calmer, which is better for island hopping and diving.","Waterfalls can run lower, and some trails are dusty."]}]},
money:{cards:[
 {k:"table",t:"Typical costs (rough, in PHP)",w:1,l:["Meal at a carinderia | 80–150","Restaurant meal | 250–600","Tricycle in town | 20–100","Jeepney ride | 13–25","Bus (per 100 km) | 100–250","Inter-island ferry | 300–2,500","Island-hopping tour | 1,000–2,500","Hostel bed or basic room | 500–1,200","Mid-range room | 1,500–3,500","Resort | 4,000+","Entrance and environmental fees | 50–600"],n:"Prices change by season and place, and peak weeks cost more."},
 {k:"list",t:"Daily budget by style",l:["Budget: about ₱1,500–2,500 a day","Standard: about ₱3,000–5,000 a day","Comfort: about ₱6,000+ a day","Use the Travelers and Style settings in My trip for a cost estimate."]},
 {k:"list",t:"Cash and cards",l:["Cities have ATMs and cards, but small islands and remote towns often have neither.","Withdraw cash before you go and carry small bills.","Foreign cards often pay an ATM fee per withdrawal.","GCash and Maya work in many shops, but not everywhere."]},
 {k:"list",t:"Tipping and bargaining",l:["Many restaurants add a 10% service charge. If not, 10% is common.","Guides and boatmen appreciate ₱100–300 per guest for good service.","Bargaining is normal in markets. Keep it friendly."]}]},
go:{cards:[
 {k:"list",t:"Flights",l:["Domestic carriers such as Philippine Airlines and Cebu Pacific fly to most regions.","Small island flights have strict baggage limits.","Book 3 to 8 weeks ahead, and earlier for Holy Week, Christmas and long weekends."]},
 {k:"list",t:"Ferries and boats",l:["Operators such as 2GO, OceanJet, Montenegro Lines and FastCat run common routes.","Schedules change with weather, so confirm the day before.","Use accredited operators for island hopping and wear a life jacket."]},
 {k:"list",t:"Buses and vans",l:["Overnight buses connect Manila to Baguio, Sagada and Banaue.","Vans are quicker but fill up, so go early.","Typical times: Manila–Baguio about 5–6 hrs, Manila–Batangas Port about 2–3 hrs."]},
 {k:"list",t:"Getting around town",l:["Jeepneys and tricycles for short rides, and habal-habal motorbike taxis on islands.","Grab and other ride-hail apps work in major cities.","Agree on a price before you ride when there is no meter."]},
 {k:"list",t:"Renting a motorbike",l:["Common on Siargao and Siquijor.","Bring a valid license, wear a helmet, and photograph the bike before you ride."]},
 {k:"list",t:"Useful apps",l:["Google Maps with offline maps downloaded","GCash or Maya for payments","Windy or PAGASA for weather","Your ferry or airline app"]}]},
pack:{cards:[
 {k:"check",t:"Essentials",l:uniq(TRIP_PACK.all)},
 {k:"check",t:"Beach and islands",l:uniq([...TRIP_PACK.Beach,...TRIP_PACK.Island])},
 {k:"check",t:"Mountains and waterfalls",l:uniq([...TRIP_PACK.Mountain,...TRIP_PACK.Waterfall])},
 {k:"check",t:"City and culture",l:uniq([...TRIP_PACK.Heritage,...TRIP_PACK.City])},
 {k:"check",t:"Caves and adventure",l:uniq([...TRIP_PACK.Cave,...TRIP_PACK.Adventure])},
 {k:"check",t:"Diving and surf",l:uniq([...TRIP_PACK.Diving,...TRIP_PACK.Surf])}]},
safe:{cards:[
 {k:"list",t:"Emergency numbers",l:["**911**: national emergency hotline","**143**: Philippine Red Cross","**1386**: DOT tourist assistance (confirm before relying on it)","Save your embassy's number too."]},
 {k:"list",t:"Advisories",l:["Conditions vary, especially in parts of Mindanao and the Sulu archipelago.","Check your government's travel advisory and ask local operators before booking.","Permits are needed for some places, such as Mt. Pulag, Mt. Apo and the Underground River."]},
 {k:"list",t:"Health",l:["Drink bottled or filtered water.","Use mosquito repellent, since dengue occurs in the Philippines.","Ask a travel clinic about vaccines and malaria risk for rural areas such as parts of Palawan.","Bring basic medicines, sunscreen and oral rehydration salts."]},
 {k:"list",t:"In the water",l:["Wear a life jacket on boats and in strong currents.","Do not touch or stand on coral, and do not feed wildlife.","Heed flags and local warnings about rip currents and jellyfish."]},
 {k:"list",t:"Hiking and caves",l:["Register with the local tourism office and hire a guide where required.","Start early, carry a headlamp, and check the weather.","Do not hike or enter caves alone, or after heavy rain."]},
 {k:"list",t:"Stay safe",l:["Agree on prices before you book, and use accredited guides.","Do not hand over your passport as a deposit.","Share your itinerary and keep copies of your documents."]},
 {k:"list",t:"Travel insurance",l:["Worth having for storm delays, medical care, evacuation, and activities like diving and trekking."]}]},
culture:{cards:[
 {k:"list",t:"Etiquette",l:["Smile and be polite. Use 'po' and 'opo' with elders.","Dress modestly in churches and mosques.","Remove shoes when entering a home.","Ask before photographing people."]},
 {k:"table",t:"Handy phrases",l:["Salamat | Thank you","Magkano? | How much?","Masarap! | Delicious!","Saan ang… | Where is…?","Pwede ba? | Is it okay?","Salamat kaayo | Thank you very much (Bisaya)","Tagpila ni? | How much is this? (Bisaya)"],n:"English is widely spoken in tourist areas."},
 {k:"table",t:"What to eat, by region",w:1,l:REGIONS.filter(r=>FOOD[r.c]).map(r=>r.s+" | "+FOOD[r.c])},
 {k:"list",t:"Pasalubong ideas",l:["Dried mango, pili nuts and ube treats","Kapeng barako (Batangas coffee)","Local weaves, wood carvings and crafts"]},
 {k:"list",t:"Responsible travel",l:["Do not touch or stand on coral.","Carry your trash out.","Hire local guides and boatmen.","Choose operators that follow marine and wildlife guidelines."]}]},
regions:{cards:[
 {k:"regions",t:"Regional cheat sheet",w:1,n:"Built from the catalog. Budgets are rough per-person estimates from Metro Manila. Negros Occidental, Negros Oriental and Siquijor are grouped under the Negros Island Region (NIR)."}]}});
const tipSec=k=>{const o=window.SC&&SC.data.tips&&SC.data.tips[k];return o&&Array.isArray(o.cards)?o:TD()[k]};
const rows2=c=>(c.l||[]).map(String).filter(r=>r.trim());
const wide=c=>c.w?" wide":"",note=c=>c.n?`<p class="tpn">${RH(c.n)}</p>`:"";
const monthsOf=s=>uniq(String(s).split(/[,\s]+/).map(Number).filter(m=>m>=1&&m<=12));
const rowsM=(a)=>MN.map((m,k)=>`<i class="${a.includes(k+1)?"on":""}${k+1==NOW?" now":""}" title="${m}"></i>`).join("");
const KIND={
list:c=>`<div class="tpc${wide(c)}"><h4>${esc(c.t||"")}</h4>${ul(rows2(c).map(RH))}${note(c)}</div>`,
table:c=>`<div class="tpc${wide(c)}"><h4>${esc(c.t||"")}</h4><table class="tpt">${rows2(c).map(r=>{const k=r.indexOf("|"),a=k<0?r:r.slice(0,k),b=k<0?"":r.slice(k+1);return `<tr><td>${esc(a.trim())}</td><td>${esc(b.trim())}</td></tr>`}).join("")}</table>${note(c)}</div>`,
months:c=>`<div class="tpc${wide(c)}"><h4>${esc(c.t||"")}</h4>${rows2(c).map(r=>{const k=r.indexOf("|"),a=k<0?r:r.slice(0,k),b=k<0?"":r.slice(k+1);return `<div class="xexp"><span>${esc(a.trim())}</span><div>${rowsM(monthsOf(b))}</div></div>`}).join("")}${note(c)}</div>`,
check:c=>{const ck=LS("dpack")||{};return `<div class="tpc${wide(c)}"><h4>${esc(c.t||"")}</h4>${rows2(c).map(x=>{const id=x.replace(/\W+/g,"_");return `<label class="pk"><input type="checkbox" data-pk="${id}" ${ck[id]?"checked":""}><span>${esc(x)}</span></label>`}).join("")}${note(c)}</div>`},
seasons:c=>`<div class="tpc${wide(c)}"><h4>${esc(c.t||"")}</h4><div class="mstrip">${MN.map((m,k)=>{const n=k+1,q=n>=6&&n<=10?"wet":n>=3&&n<=5?"hot":"cool";return `<div class="${q}${n==NOW?" now":""}"><b>${m}</b><i>${q=="wet"?"☔":q=="hot"?"☀️":"🌤️"}</i></div>`}).join("")}</div>${note(c)}</div>`,
picks:c=>{const now=D.filter(d=>d.mo.includes(NOW)&&d.o).sort((a,b)=>b.tt-a.tt).slice(0,10);
 return `<div class="tpc${wide(c)}"><h4>${esc(String(c.t||"").replace("{month}",MN[NOW-1]))}</h4><div class="tags">${now.map(d=>`<button class="chip" data-d="${d.i}">${esc(d.n)}</button>`).join("")||"<span class='tpn'>Check the destination pages for best months.</span>"}</div>${note(c)}</div>`},
regions:c=>{const mon=(l)=>{const q=Array(13).fill(0);l.forEach(d=>d.mo.forEach(m=>q[m]++));const mx=Math.max(...q);const set=new Set(q.map((x,m)=>x>=.6*mx&&m?m:0).filter(Boolean));return MN.map((m,k)=>set.has(k+1)?m:"").filter(Boolean)};
 const r=REGIONS.map(g=>{const l=D.filter(d=>rgOf(d)==g.c);if(!l.length)return"";const avg=Math.round(l.reduce((s,d)=>s+(d.b0!=null?d.b0:d.b),0)/l.length/100)*100,ty={};l.forEach(d=>ty[d.t]=(ty[d.t]||0)+1);const top=Object.entries(ty).sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>x[0]).join(", "),m=mon(l);
  return `<tr><td><b>${esc(g.s)}</b><small>${esc((()=>{const q=g.n.split(" · ");return q[1]===g.s?q[0]:(q[1]||g.n)})())}</small></td><td>${l.length}</td><td>${P(avg)}</td><td>${esc(top)}</td><td>${m.length>=8?"Year-round":m[0]+"–"+m[m.length-1]}</td><td><button class="chip" data-rgf="${g.c}">Show</button></td></tr>`}).join("");
 return `<div class="tpc${wide(c)}"><h4>${esc(c.t||"")}</h4><div class="tpscroll"><table class="tpt tpr"><tr><th>Region</th><th>Places</th><th>Avg budget</th><th>Mostly</th><th>Best months</th><th></th></tr>${r}</table></div>${note(c)}</div>`}};
const PANE=Object.fromEntries(TP.map(([k])=>[k,()=>{const cards=(tipSec(k).cards||[]).filter(c=>c&&KIND[c.k]);
 return `<div class="tpgrid">${cards.map(c=>KIND[c.k](c)).join("")||'<p class="tpn">Nothing here yet.</p>'}</div>${k=="pack"?'<p class="tpn"><button class="btn btn-l" data-pkclr>Clear ticks</button> Your ticks are saved in this browser.</p>':""}`}]));
function drawTips(){const h=$("tpbody");if(!h)return;$("tptabs").innerHTML=TP.map(([k,l])=>`<button class="chip${k==tpk?" on":""}" data-tp="${k}">${l}</button>`).join("");h.innerHTML=PANE[tpk]()}
const tipHeads=()=>{const a=$("tpH"),b=$("tpS");if(a)a.textContent=SC.txt("tipsT","Good to know before you go");if(b)b.textContent=SC.txt("tipsS","Practical guidance for the Philippines: when to go, what it costs, how to get around, what to pack and how to stay safe. Always confirm details with official sources.")};
window.TIPS={tabs:TP,def:k=>JSON.parse(JSON.stringify(TD()[k])),eff:k=>JSON.parse(JSON.stringify(tipSec(k))),redraw:()=>{tipHeads();drawTips()}};
const faq=document.querySelector("#faq .wrap");
try{if(faq){faq.innerHTML=`<div class="head"><div><h2 id="tpH"></h2><p id="tpS"></p></div></div><div class="tags" id="tptabs" role="tablist"></div><div id="tpbody"></div>`;tipHeads();drawTips();
 SC.on(()=>TIPS.redraw());
 document.addEventListener("click",e=>{const t=e.target.closest("[data-tp]");if(t){tpk=t.dataset.tp;drawTips();if(!t.closest("#faq"))setTimeout(()=>$("faq").scrollIntoView(),50);return}
  const g=e.target.closest("[data-rgf]");if(g&&$("xrg")){$("xrg").value=g.dataset.rgf;$("xrg").dispatchEvent(new Event("change",{bubbles:true}));$("results").scrollIntoView({behavior:"smooth"});return}
  if(e.target.closest("[data-pkclr]")){LS("dpack",{});drawTips()}});
 document.addEventListener("change",e=>{const p=e.target.dataset&&e.target.dataset.pk;if(p===undefined)return;const ck=LS("dpack")||{};ck[p]=e.target.checked;LS("dpack",ck)})}}catch(e){console.warn("Destinify v12 (tips):",e)}
render();
document.documentElement.dataset.build="v12";console.info("Destinify v12 loaded");
const ft=document.querySelector("footer .wrap");if(ft)ft.insertAdjacentHTML("beforeend",`<span style="opacity:.75">Build v12 · ${D.length} places</span>`);
})();
