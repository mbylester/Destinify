/* Destinify v8 add-on: festivals & events calendar, plus Favorites kept separate from My trip.
   FEST holds typical timing only (from general knowledge, not checked against the DOT or local tourism offices).
   d = destination name exactly as in data.js, m = months 1-12. Edit or add rows freely. */
(()=>{
const{LS,esc}=DX;
const FEST=[
{n:"Sinulog Festival",d:"Cebu City",m:[1],w:"Third Sunday of January (grand parade)",x:"Street dancing and a grand parade honoring the Santo Niño."},
{n:"Ati-Atihan",d:"Kalibo",m:[1],w:"January, climaxing on the third Sunday",x:"Drums, painted faces and tribal costumes in one of the country's oldest festivals."},
{n:"Dinagyang",d:"Iloilo City",m:[1],w:"Fourth Sunday of January",x:"Tribal dance competitions honoring the Santo Niño."},
{n:"Panagbenga",d:"Baguio",m:[2],w:"All of February",x:"The flower festival, with floral floats and street dancing."},
{n:"Moriones",d:"Marinduque",m:[3,4],w:"Holy Week (March or April)",x:"Masked and costumed 'Roman soldiers' re-enact a Holy Week legend."},
{n:"Pahiyas",d:"Lucban & Tayabas",m:[5],w:"Around May 15",x:"Houses are decked with colorful rice wafers and produce for the harvest feast of San Isidro Labrador."},
{n:"Mango Festival",d:"Guimaras",m:[5],w:"May",x:"Celebrates the island's mango harvest with tastings and street parties."},
{n:"Pintados-Kasadyaan",d:"Tacloban",m:[6],w:"Late June",x:"Street dancing and ritual performances by body-painted dancers."},
{n:"Kadayawan",d:"Davao City",m:[8],w:"Third week of August",x:"A thanksgiving festival of flowers, fruit and indigenous Davao culture."},
{n:"Higalaay (Fiesta sa Kagay-an)",d:"Cagayan de Oro",m:[8],w:"Late August",x:"City fiesta week with parades and cultural events."},
{n:"Tuna Festival",d:"General Santos",m:[9],w:"Early September",x:"Celebrates the tuna capital with food, parades and street dancing."},
{n:"MassKara",d:"Bacolod",m:[10],w:"Third weekend of October",x:"Smiling-mask street dancing, food and live music."},
{n:"Buglasan",d:"Dumaguete",m:[10],w:"October",x:"Showcases Negros Oriental's culture with street dancing and a trade fair."},
{n:"Hermosa Festival",d:"Zamboanga City",m:[10],w:"October (Fiesta Pilar, Oct 12)",x:"The fiesta of Our Lady of the Pillar, with regattas and Chavacano culture."},
{n:"Lanzones Festival",d:"Camiguin",m:[10],w:"Around the third week of October",x:"Street dancing and feasting for the island's lanzones harvest."},
{n:"Pamulinawen Festival",d:"Laoag City",m:[2],w:"Around mid-February",x:"Ilocano city fiesta with street dancing and cultural shows."},
{n:"Jaro Fiesta",d:"Jaro Cathedral",m:[2],w:"Around February 2 (Candelaria)",x:"Religious procession and fiesta at the Jaro belfry cathedral."},
{n:"Bangus Festival",d:"Dagupan",m:[4],w:"Typically April",x:"Celebrates Dagupan's milkfish with grilling, parades and food stalls."},
{n:"Antipolo pilgrimage season",d:"Antipolo",m:[5],w:"All of May",x:"Pilgrims climb to the cathedral to honor Our Lady of Peace and Good Voyage."},
{n:"Magayon Festival",d:"Legazpi City",m:[5],w:"May",x:"Month-long Albay festival with street dancing, food and Mayon-themed events."},
{n:"Penafrancia Festival",d:"Naga City",m:[9],w:"September (fluvial procession on the third Saturday)",x:"Bicol's largest religious festival, honoring Our Lady of Penafrancia."},
{n:"Diyandi Festival",d:"Iligan City",m:[9],w:"Late September",x:"City fiesta honoring St. Michael with street dancing and parades."},
{n:"Bonok-Bonok Festival",d:"Surigao City",m:[9],w:"Typically September",x:"Street dancing and rituals of thanksgiving in Surigao City."},
{n:"Siargao International Surfing Cup",d:"Cloud 9",m:[9,10],w:"Typically late September to October",x:"Pro surfing competition at Siargao's famous Cloud 9 break."}
].filter(f=>{const d=D.find(x=>x.n==f.d);if(d)f.i=d.i;return d});
const mt=f=>f.m.includes(NOW)?'<span class="tag now">This month</span>':f.m.includes(NOW%12+1)?'<span class="tag gem">Next month</span>':"";
const evH=(f,km)=>`<div class="info"><b>🎉 ${esc(f.n)}</b> ${mt(f)}<br><small>${f.m.map(m=>MN[m-1]).join("–")} · ${esc(f.w)}${km!=null?` · in ${esc(f.d)}, ${km} km away`:""}</small><p>${esc(f.x)}</p></div>`;
/* ---------- favorites (per user when signed in, otherwise this browser) ---------- */
const favs=()=>{const u=DX.U();return u?(u.fav=u.fav||[]):(LS("dfav")||[])};
const setF=a=>{const u=DX.U();if(u){u.fav=a;DX.saveUsers()}else LS("dfav",a)};
const isF=i=>favs().includes(i);
const lbl=()=>{const b=$("xfd");if(b)b.textContent=isF(+b.dataset.id)?"♥ Saved to favorites":"♡ Save to favorites"};
function togF(i){const a=favs().slice(),k=a.indexOf(i);k>-1?a.splice(k,1):a.push(i);setF(a);render();lbl()}
document.querySelector(".navr").prepend(Object.assign(document.createElement("button"),{id:"xFavBtn",className:"btn btn-l",innerHTML:'♡ Favorites (<span id="favN">0</span>)'}));
$("xFavBtn").dataset.bsToggle="offcanvas";$("xFavBtn").dataset.bsTarget="#favPanel";
document.body.insertAdjacentHTML("beforeend",'<div class="offcanvas offcanvas-end" tabindex="-1" id="favPanel"><div class="offcanvas-header"><h5 class="offcanvas-title" style="font-family:Fraunces,serif">My favorites</h5><button class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button></div><div class="offcanvas-body" id="favBody"></div></div>');
document.querySelector('[data-tab="trip"]').insertAdjacentHTML("beforebegin",'<button class="chip" data-tab="fav">Favorites</button>');
const _l=list;list=()=>{const r=_l();return st.tab=="fav"?r.filter(d=>isF(d.i)):r};
const _c=cardH;cardH=d=>{const f=isF(d.i),t=st.trip.includes(d.i);
 return _c(d).replace(/class="heart( on)?" data-f="(\d+)" aria-label="[^"]*"/,`class="heart${f?" on":""}" data-f="${d.i}" aria-label="${f?"Remove from":"Add to"} favorites"`)
  .replace('<div class="act">',`<div class="act"><button data-x5="trip" data-id="${d.i}">${t?"In trip ✓":"+ Trip"}</button>`)};
function renderFav(){const a=favs().filter(i=>D[i]);$("favN").textContent=a.length;
 $("favBody").innerHTML=a.length?`<div class="macts mb-3"><button class="btn btn-c" data-x5="allfav">Add all to my trip</button><button class="btn btn-l" data-x5="clrfav">Clear</button></div>`+a.map(i=>{const d=D[i];return `<div class="stop"><div class="t"><b>${esc(d.n)}</b><span>${esc(d.p)} · ${d.d}d · ${P(d.b)}</span></div><button data-d="${i}" title="Details" aria-label="Details">ⓘ</button><button data-x5="trip" data-id="${i}" style="width:auto;padding:0 8px">${st.trip.includes(i)?"In trip ✓":"+ Trip"}</button><button data-x5="fav" data-id="${i}" title="Remove" aria-label="Remove from favorites">✕</button></div>`}).join(""):'<p style="color:var(--soft)">No favorites yet. Tap the heart on any destination to save it here, then move your picks into a trip when you are ready.</p>'}
/* ---------- festivals calendar section ---------- */
document.querySelector("#insights").insertAdjacentHTML("beforebegin",'<section class="insights" id="festivals"><div class="wrap"><div class="head"><div><h2>Festivals &amp; events calendar</h2><p>Pick a month to see what is on. Timing is typical and can shift each year, so confirm locally.</p></div></div><div class="tags" id="fmonths"></div><div class="fgrid" id="fgrid"></div></div></section>');
document.querySelector(".links").insertAdjacentHTML("beforeend",'<a href="#festivals">Festivals</a>');
let fm=NOW;
function drawF(){$("fmonths").innerHTML=MN.map((m,k)=>{const n=FEST.filter(f=>f.m.includes(k+1)).length;return `<button class="chip${k+1==fm?" on":""}" data-fm="${k+1}">${m}${n?` (${n})`:""}</button>`}).join("");
 const a=FEST.filter(f=>f.m.includes(fm));
 $("fgrid").innerHTML=a.length?a.map(f=>{const d=D[f.i];return `<div class="fcard"><h3>🎉 ${esc(f.n)}</h3><small>${esc(d.n)}, ${esc(d.p)}</small><b>${esc(f.w)}</b><p>${esc(f.x)}</p><div class="macts"><button class="btn btn-d" data-d="${f.i}">View destination</button><button class="btn btn-l" data-x5="fav" data-id="${f.i}">${isF(f.i)?"♥ Saved":"♡ Save"}</button></div></div>`}).join(""):'<p class="note">No major festivals listed for this month yet. Try the neighbouring months.</p>'}
/* ---------- detail page: festivals + heatmap markers + favorite button ---------- */
const _od=openDetail;openDetail=i=>{_od(i);const d=D[i],own=FEST.filter(f=>f.d==d.n),
 nb=own.length?[]:FEST.map(f=>({f,k:hav(d,D[f.i])})).filter(o=>o.k<=150).sort((a,b)=>a.k-b.k).slice(0,2),hm=$("xhm");
 if(hm){const cells=hm.querySelectorAll(".xhm div");
  own.forEach(f=>f.m.forEach(m=>{const c=cells[m-1];if(!c)return;if(!c.querySelector("em"))c.insertAdjacentHTML("beforeend","<em>🎉</em>");c.title=(c.title?c.title+", ":"")+f.n}));
  const lg=hm.querySelector(".xleg");if(own.length&&lg)lg.textContent+=" · 🎉 festival";
  if(own.length||nb.length)hm.insertAdjacentHTML("afterend",`<div class="dsc" id="xfs"><h4>FESTIVALS &amp; EVENTS</h4>${own.map(f=>evH(f)).join("")}${nb.map(o=>evH(o.f,Math.round(o.k))).join("")}<p class="note">Typical timing only. Festival dates shift each year, so confirm with the local tourism office or the DOT before you book.</p></div>`)}
 const m=$("dmc").querySelectorAll(".macts"),last=m[m.length-1];
 if(last){last.insertAdjacentHTML("beforeend",`<button class="btn btn-l" id="xfd" data-x5="fav" data-id="${i}"></button>`);lbl()}};
/* ---------- render + clicks ---------- */
const _r=render;render=()=>{_r();renderFav();drawF();if(st.tab=="fav"){$("rt").textContent="Your favorites";const e=document.querySelector("#grid .empty");if(e)e.textContent="Tap the heart on a destination to save it as a favorite."}};
document.addEventListener("click",e=>{const h=e.target.closest(".heart[data-f]");if(h){e.stopImmediatePropagation();e.preventDefault();togF(+h.dataset.f)}},true);
document.addEventListener("click",e=>{const t=e.target.closest("[data-fm],[data-x5]");if(!t)return;
 if(t.dataset.fm){fm=+t.dataset.fm;return drawF()}
 const x=t.dataset.x5,i=+t.dataset.id;
 if(x=="fav")togF(i);else if(x=="trip")toggleTrip(i);
 else if(x=="allfav"){favs().forEach(j=>{if(D[j]&&!st.trip.includes(j))st.trip.push(j)});save();render()}
 else if(x=="clrfav"){setF([]);render()}});
render();
})();
