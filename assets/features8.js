/* Destinify v11 add-on: administrative regions (NCR to BARMM), a starting-point budget model,
   TikTok-famous spots, richer detail info, region insights, and count-up stats.
   Data lives in regions.js (REGIONS, PROV_REGION, ORIGINS, TIKTOK). */
(()=>{
const S=(n,f)=>{try{f()}catch(e){console.warn("Destinify v11 ("+n+"):",e)}};
const{LS,esc}=DX;
const R=Object.fromEntries(REGIONS.map(r=>[r.c,r]));
const rg=d=>d.r!==undefined?d.r:(d.r=PROV_REGION[d.p]||"");
D.forEach(d=>{rg(d);d.tt=TIKTOK.includes(d.n)?1:0});
st.rg="";
const HRS=h=>{if(h<1)return Math.max(10,Math.round(h*12)*5)+" min";const r=Math.round(h*2)/2;return r+(r==1?" hr":" hrs")};

/* ---------- starting point and budget model ---------- */
const MNL=ORIGINS[0],FR=d=>["Diving","Adventure","Surf"].includes(d.t)?[.25,.25,.15,.35]:["City","Heritage"].includes(d.t)?[.3,.35,.25,.1]:[.3,.3,.2,.2];
const flight=(o,d,km)=>km>400||(o.g!==d.g&&km>150);
const tr=(o,d)=>{const km=hav(o,d);if(flight(o,d,km))return 3000+km*2.5;if(km<=15)return 100;if(km<=60)return 120+km*4;return 200+km*3.2};
/* the catalog budgets assume a trip from Metro Manila. For another start we swap the transport cost, and drop lodging on day trips */
function newB(d,o){let b=d.b0+tr(o,d)-tr(MNL,d);if(hav(o,d)<=80){const lodge=FR(d)[1]*d.b0;b-=d.d<=1?lodge:d.d==2?lodge*.5:0}return Math.max(1000,Math.round(b/100)*100)}
let ORI=MNL;
function applyOrigin(o,save){ORI=o;D.forEach(d=>{if(d.b0==null)d.b0=d.b;d.b=o===MNL||o.k=="MNL"?d.b0:newB(d,o)});
 if(save)LS("dorigin",o.k=="ME"?o:o.k);
 const n=$("xon");if(n)n.textContent=o.k=="MNL"?"Budgets assume a trip from Metro Manila.":`Budgets are estimated from ${o.n}. Nearby places cost less.`;
 render();buildInsights()}
/* ---------- filter UI ---------- */
const cnt=c=>D.filter(d=>rg(d)==c).length;
S("filters",()=>{$("pg").previousElementSibling.textContent="Island group";
$("ac").parentElement.insertAdjacentHTML("afterend",`<div class="grp xorg"><small>Region</small><select id="xrg" aria-label="Region">${'<option value="">All regions</option>'+REGIONS.filter(r=>cnt(r.c)).map(r=>`<option value="${r.c}">${esc(r.n)} (${cnt(r.c)})</option>`).join("")}</select><small class="xs2">Starting from</small><select id="xor" aria-label="Starting from">${ORIGINS.map(o=>`<option value="${o.k}">${esc(o.n)}</option>`).join("")}</select><button class="chip" id="xloc" type="button">📍 Use my location</button><span class="xnote" id="xon"></span></div>`);
$("rb").min=1000;
$("xrg").addEventListener("change",e=>{st.rg=e.target.value;st.shown=12;render()});
$("xor").addEventListener("change",e=>applyOrigin(ORIGINS.find(o=>o.k==e.target.value)||MNL,true));
$("xloc").addEventListener("click",e=>{const b=e.currentTarget;if(!navigator.geolocation){b.textContent="Location not available";return}
 b.textContent="Locating…";navigator.geolocation.getCurrentPosition(p=>{const la=p.coords.latitude,ln=p.coords.longitude,nn=D.map(d=>({d,k:hav({la,ln},d)})).sort((a,b)=>a.k-b.k)[0].d;
  st.me={la,ln};const o={k:"ME",n:"your location",la,ln,g:nn.g};$("xor").value="MNL";b.textContent="📍 Using my location ✓";applyOrigin(o,true)},()=>{b.textContent="Location blocked"})});
$("resetBtn").addEventListener("click",()=>{st.rg="";$("xrg").value="";render()});});
/* ---------- TikTok tab, sort, badge ---------- */
S("tiktok-ui",()=>{document.querySelector('[data-tab="trip"]').insertAdjacentHTML("beforebegin",'<button class="chip" data-tab="tt">🔥 TikTok spots</button>');
$("ps").add(new Option("TikTok-famous first","tt"));});
S("list",()=>{const _l=list;list=()=>{const tt=st.sort=="tt";if(tt)st.sort="match";let r=_l();if(tt)st.sort="tt";
 r=r.filter(d=>(!st.rg||rg(d)==st.rg)&&(st.tab!="tt"||d.tt));if(tt)r.sort((a,b)=>b.tt-a.tt||b.s-a.s);return r};});
S("cards",()=>{const _c=cardH;cardH=d=>{let h=_c(d);if(d.tt)h=h.replace('<div class="tags">','<div class="tags"><span class="tag tt">🔥 TikTok</span>');
 const r=R[rg(d)];if(r)h=h.replace(/(<div class="where">)([^<]*)/,(m,a,b)=>a+b+" · "+esc(r.s));return h};});
S("render",()=>{const _r=render;render=()=>{_r();if(st.tab=="tt")$("rt").textContent="TikTok-famous spots";const e=document.querySelector("#grid .empty");if(e&&(st.rg||st.tab=="tt"))e.textContent="No destinations match these filters. Try another region or a bigger budget."};});
/* ---------- detail page extras ---------- */
const PH={Beach:"Golden hour, around sunrise or sunset, gives the softest sand and water tones.",Island:"Shoot from the boat at midday for the brightest water, or at golden hour for warm skies.",Mountain:"Arrive before sunrise for sea-of-clouds shots.",Waterfall:"Morning or overcast light avoids harsh glare. A slower shutter smooths the water.",Lake:"Calm mornings give mirror reflections.",Heritage:"Go early for empty frames and soft light.",City:"Blue hour just after sunset gives glowing street shots.",Diving:"Mid-morning gives the best underwater visibility.",Surf:"Sunrise light is best for lines of waves.",Cave:"Midday light beams reach some caves. Bring a flashlight.",Nature:"Early light on greenery is the most flattering.",Adventure:"Capture action at golden hour and ask a friend to film."};
const KB={Waterfall:"Wear water shoes and swim only where locals say it is safe. Avoid it after heavy rain.",Mountain:"Start before dawn, bring a headlamp and rain gear, and register at the local tourism office.",Beach:"Use reef-safe sunscreen and heed jellyfish and rip-current warnings.",Island:"Boats depend on weather, so keep a buffer day and confirm schedules the day before.",Lake:"Life jackets are advised on rafts and kayaks.",Cave:"Wear sturdy shoes, bring a headlamp, and go with a guide.",Diving:"Dive with certified operators and check your certification and insurance.",Surf:"Check wave conditions and take lessons if you are new.",Adventure:"Check age, weight and safety rules, and book with licensed operators.",Heritage:"Dress modestly in churches and keep voices low.",City:"Use ride-hail or public transport and keep valuables secure.",Nature:"Stay on trails, carry out trash, and respect wildlife."};
const tag=n=>"#"+n.replace(/[^A-Za-z0-9]/g,"");
function infoH(d){const o=ORI,km=hav(o,d),fl=flight(o,d,km),sea=o.g!==d.g||d.t=="Island",h=fl?4:km/40*1.25+(sea&&km>60?1.5:0),r=R[rg(d)];
 const dist=km<2?"less than 2 km":Math.round(km).toLocaleString()+" km",tags=[tag(d.n),"#"+(r?r.s.replace(/[^A-Za-z0-9]/g,""):"Philippines"),"#VisitPhilippines","#"+d.t+"Philippines"];
 return `<h4>REGION AND TRAVEL INFO</h4><div class="tags"><span class="tag">${esc(r?r.n:"Region not set")}</span><span class="tag">${esc(d.p)}</span>${d.tt?'<span class="tag tt">🔥 TikTok-famous</span>':""}</div>
 <p class="note" style="margin-top:0">From ${esc(o.n)}: about <b>${dist}</b>, roughly <b>${HRS(h)}</b> ${fl?"by flight, including airport time":"by bus, van"+(sea&&km>60?" and ferry":"")}. Estimated <b>${P(d.b)}</b> per person for ${d.d} day${d.d>1?"s":""}${o.k=="MNL"?" from Metro Manila.":"."} These are rough estimates.</p>
 <div class="macts"><a class="btn btn-l" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${d.la},${d.ln}">Open in Google Maps</a><a class="btn btn-l" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&origin=${o.la},${o.ln}&destination=${d.la},${d.ln}">Directions</a></div>
 ${d.tt?`<h4 style="margin-top:14px">PHOTO TIPS</h4><p class="note" style="margin-top:0">${esc(PH[d.t]||PH.Nature)}</p><div class="tags">${tags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div><button class="btn btn-l mt-2" data-x8="tags" data-t="${esc(tags.join(" "))}">Copy hashtags</button>`:""}
 <h4 style="margin-top:14px">KNOW BEFORE YOU GO</h4><p class="note" style="margin-top:0">${esc(KB[d.t]||KB.Nature)} Always confirm fees, permits and advisories with the local tourism office.</p>`}
S("detail",()=>{const _od=openDetail;openDetail=i=>{_od(i);const d=D[i],a=$("xwx")||$("dmc").querySelector(".mh");if(a)a.insertAdjacentHTML("afterend",`<div class="dsc" id="xinfo">${infoH(d)}</div>`)};});
S("copy",()=>{document.addEventListener("click",e=>{const t=e.target.closest('[data-x8="tags"]');if(!t)return;(navigator.clipboard?navigator.clipboard.writeText(t.dataset.t):Promise.reject()).then(()=>{t.textContent="Copied!";setTimeout(()=>t.textContent="Copy hashtags",1500)}).catch(()=>{})});});
/* ---------- region insights ---------- */
S("insights",()=>{const _bi=buildInsights;buildInsights=()=>{_bi();const ins=$("ins");if(!ins)return;const rows=REGIONS.map(r=>[r,cnt(r.c)]).filter(x=>x[1]),mx=Math.max(...rows.map(x=>x[1])),tt=D.filter(d=>d.tt).length;
 ins.insertAdjacentHTML("beforeend",`<div class="two" style="margin-top:18px"><div class="ibox"><h4>DESTINATIONS BY REGION</h4>${rows.map(([r,n])=>`<div class="hb" style="grid-template-columns:110px 1fr 30px"><span>${esc(r.s)}</span><div><i style="width:${n/mx*100}%"></i></div><b>${n}</b></div>`).join("")}</div><div class="ibox"><h4>TIKTOK-FAMOUS SPOTS</h4><p class="lead2" style="margin:0 0 10px"><b>${tt}</b> of ${D.length} destinations are tagged as TikTok-famous.</p><p class="note">Tap the TikTok spots filter in Destinations to see them, with photo tips and hashtags on each page.</p><button class="btn btn-c" data-tab="tt" onclick="document.getElementById('results').scrollIntoView()">Browse TikTok spots</button></div></div>`)};
document.querySelector("#insights .head p").textContent=`How the ${D.length} destinations break down by island group, region, type, and season.`;});
/* ---------- stats count-up and scroll-to-top ---------- */
S("stats",()=>{const sr=$("sR");if(sr)sr.textContent=REGIONS.filter(r=>cnt(r.c)).length;
if(!matchMedia("(prefers-reduced-motion:reduce)").matches)["sN","sR","sA","sT"].forEach(id=>{const el=$(id);if(!el)return;const to=+el.textContent;if(!to)return;const t0=performance.now();const f=t=>{const k=Math.min(1,(t-t0)/900);el.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)});
document.body.insertAdjacentHTML("beforeend",'<button id="xup" aria-label="Back to top" hidden>↑</button>');
$("xup").addEventListener("click",()=>scrollTo({top:0,behavior:"smooth"}));
addEventListener("scroll",()=>{$("xup").hidden=scrollY<900},{passive:true});});
/* ---------- restore saved starting point ---------- */
S("origin",()=>{const sv=LS("dorigin");if(sv){const o=typeof sv=="string"?ORIGINS.find(x=>x.k==sv):sv;if(o){if(o.k=="ME")st.me={la:o.la,ln:o.ln};else $("xor").value=o.k;$("xloc").textContent=o.k=="ME"?"📍 Using my location ✓":"📍 Use my location";applyOrigin(o,false)}}
else render();});
S("final-render",()=>render());document.documentElement.dataset.v11="1";
})();
