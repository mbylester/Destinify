/* Destinify v9 add-on: global search (button, Ctrl+K or "/") and a travel chatbot.
   The chatbot needs no server and no API key: it answers from the catalog (data.js, details.js)
   and the general tips from the Travel tips section. Edit FAQ below to change its general answers. */
(()=>{
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const reEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const norm=s=>String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\bmount\b/g,"mt").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
const hid=()=>{try{return DX.hid()}catch(e){return[]}};
const live=()=>D.filter(d=>!hid().includes(d.n));
const rng=d=>{const set=new Set(d.mo),out=[];for(let x=1;x<=12;x++){const pv=(x+10)%12+1;if(set.has(x)&&!set.has(pv)){let e=x;while(set.has(e%12+1)&&e%12+1!=x)e=e%12+1;out.push(e==x?MN[x-1]:MN[x-1]+"-"+MN[e-1])}}return out.join(", ")||"year-round"};
const star=d=>{try{return DX.avg(d.i)||0}catch(e){return 0}};

/* ---------- global search ---------- */
const stem=w=>w.length>4?w.replace(/s$/,""):w;
function searchAll(q,reg){const tk=norm(q).split(" ").filter(Boolean).map(stem);if(!tk.length)return[];
 return live().filter(d=>!reg||d.g==reg).map(d=>{const n=norm(d.n),p=norm(d.p),ty=norm(d.t),ac=norm(d.a.map(x=>A[x]).join(" ")),ds=norm(d.desc||"");let s=0;
  for(const w of tk){if(n.startsWith(w))s+=12;else if(n.includes(w))s+=8;else if(p.includes(w))s+=5;else if(ty.includes(w))s+=4;else if(ac.includes(w))s+=3;else if(ds.includes(w))s+=2;else return{d,s:0}}
  return{d,s:s+(d.o?1:0)}}).filter(o=>o.s).sort((a,b)=>b.s-a.s||a.d.n.localeCompare(b.d.n))}
let reg="";
const SUG=["beach","waterfall","museum","surfing","Bohol","island hopping"];
document.body.insertAdjacentHTML("beforeend",`<div id="xs" hidden role="dialog" aria-modal="true" aria-label="Search destinations"><div class="xs-box"><div class="xs-top"><input id="xsq" type="search" autocomplete="off" aria-label="Search destinations"><button id="xsx" aria-label="Close search">✕</button></div><div class="xs-reg" id="xsr"></div><div id="xsl" class="xs-list"></div><div id="xsf"></div></div></div>`);
const nb=Object.assign(document.createElement("button"),{id:"xSearch",className:"ib",textContent:"🔍",title:"Search (Ctrl+K)"});nb.setAttribute("aria-label","Search destinations");
document.querySelector(".navr").prepend(nb);
const hq=$("q");if(hq){hq.insertAdjacentHTML("afterend",'<button type="button" class="btn btn-c" id="xqgo" style="margin-top:6px;padding:6px 14px">Search</button>');
 $("xqgo").addEventListener("click",()=>$("results").scrollIntoView({behavior:"smooth"}));hq.addEventListener("keydown",e=>{if(e.key=="Enter")$("results").scrollIntoView({behavior:"smooth"})})}
function drawS(){const q=$("xsq").value.trim(),all=q?searchAll(q,reg):[],show=all.slice(0,8);
 $("xsr").innerHTML=[["","All"],["L","Luzon & Palawan"],["V","Visayas"],["M","Mindanao"]].map(([k,l])=>`<button class="xs-c${reg==k?" on":""}" data-xr="${k}">${esc(l)}</button>`).join("");
 $("xsl").innerHTML=!q?`<p class="xs-n">Search ${live().length} places by name, province, type or activity. Try:</p><div class="xs-reg">${SUG.map(s=>`<button class="xs-c" data-xsug="${esc(s)}">${esc(s)}</button>`).join("")}</div>`
  :show.map(o=>`<button class="xs-r" data-xo="${o.d.i}"><b>${esc(o.d.n)}</b><small>${esc(o.d.p)} · ${esc(o.d.t)} · ${P(o.d.b)} · ${o.d.d} day${o.d.d>1?"s":""}</small></button>`).join("")||'<p class="xs-n">No matches. Try a province, a type like "waterfall", or an activity like "snorkeling".</p>';
 $("xsf").innerHTML=all.length>8?`<button class="xs-all" data-xo="all">Show all ${all.length} matches in the list</button>`:""}
let lastFocus=null;
function openS(){lastFocus=document.activeElement;$("xsq").placeholder="Search "+live().length+" destinations";$("xs").hidden=false;$("xsq").focus();drawS()}
function closeS(){$("xs").hidden=true;lastFocus&&lastFocus.focus&&lastFocus.focus()}
$("xsq").addEventListener("input",drawS);
$("xsq").addEventListener("keydown",e=>{if(e.key=="Enter"){const f=document.querySelector("#xsl .xs-r");if(f)f.click()}});

/* ---------- chatbot data ---------- */
const FAQ=[
[/\b(typhoon|storm|bagyo|rainy season|monsoon|habagat)\b/,"Typhoon season runs roughly June to November. Boats and flights to islands can be cancelled at short notice, so keep your schedule flexible, buffer a day before flights home, and follow PAGASA updates."],
[/\b(cash|atm|gcash|money to carry|small bills)\b/,"Cities have ATMs and card payments, but small islands and remote towns often have neither. Withdraw cash before you go and carry small bills for tricycles, entrance fees and food stalls."],
[/\b(permit|permits|entrance fee|environmental fee|guide fee)\b/,"Many places charge entrance, environmental or guide fees, and some need permits, such as Mt. Pulag, Mt. Apo and the Puerto Princesa Underground River. Rules change, so check with the local tourism office."],
[/\b(get around|commute|ferry|ferries|transport|jeepney|tricycle|habal)\b/,"Expect a mix of flights, buses, vans, ferries, jeepneys, tricycles and habal-habal motorbike taxis. Inter-island travel takes longer than the map suggests, so allow extra time and book popular ferries and tours early."],
[/\b(responsible|sustainable|eco friendly|reef safe|leave no trace)\b/,"Don't touch or stand on coral, don't feed wildlife, use reef-safe sunscreen, carry your trash out and hire local guides and boatmen."],
[/\b(safe|safety|advisory|advisories|security|sulu|dangerous)\b/,"Conditions vary, especially in parts of Mindanao and the Sulu archipelago. Check current government travel advisories and ask local operators before booking."],
[/\b(pack|packing|bring|what to wear)\b/,"Pack light quick-dry clothes, a rain jacket, water shoes, reef-safe sunscreen, a power bank, small bills and a dry bag for boat trips. For mountains, add warm layers."],
[/\b(festival|festivals|fiesta|fiestas|event|events)\b/,'Festival timing is on the <a href="#festivals">Festivals calendar</a>. Pick a month there to see what is on, and confirm dates with local tourism offices since they shift each year.'],
[/\b(best time|best months?|when to (go|visit)|when is the best)\b/,"Most places are easiest from about November to May, when it is drier. Surf spots, whale sharks and waterfalls follow their own seasons. Tell me a place or a month and I will narrow it down."]
];
const MON={january:1,jan:1,february:2,feb:2,march:3,mar:3,april:4,apr:4,june:6,jun:6,july:7,jul:7,august:8,aug:8,september:9,sept:9,sep:9,october:10,oct:10,november:11,nov:11,december:12,dec:12};
const TY=[["Beach",/\b(beach|beaches|sandy)\b/],["Island",/\b(island|islands|islet|islets)\b/],["Mountain",/\b(mountain|mountains|peak|peaks|volcano|volcanoes)\b/],["Waterfall",/\b(waterfall|waterfalls|falls|cascade|cascades)\b/],["Heritage",/\b(heritage|historic|historical|history|museum|museums|shrine|cathedral|church|churches|fort)\b/],["City",/\b(city|cities|urban|mall|nightlife|shopping)\b/],["Lake",/\b(lake|lakes)\b/],["Nature",/\b(nature|garden|gardens|forest|forests)\b/]];
const AC=[["sw",/\b(swim|swimming)\b/],["sn",/\b(snorkel|snorkeling|snorkelling)\b/],["dv",/\b(dive|diving|scuba)\b/],["hk",/\b(hike|hiking|trek|trekking)\b/],["sf",/\b(surf|surfing)\b/],["ih",/\b(hopping)\b/],["ss",/\b(sightseeing|sightsee|scenic|viewpoint|viewpoints)\b/],["cm",/\b(camp|camping)\b/],["fd",/\b(food|foodie|eat|eating|restaurant|restaurants|cuisine)\b/],["cv",/\b(cave|caves|caving|spelunking)\b/],["kc",/\b(kayak|kayaking|paddle|paddling)\b/],["cw",/\b(culture|cultural|museum|museums|church|churches|heritage|history|historic)\b/],["wl",/\b(wildlife|animals|whale|whales|dolphin|dolphins|birds|birdwatching)\b/],["cy",/\b(canyoneering)\b/],["ad",/\b(adventure|zipline|ziplining|rafting)\b/],["ph",/\b(photo|photos|photography|instagrammable)\b/],["rl",/\b(relax|relaxing|chill|spa|unwind)\b/],["bk",/\b(bike|biking|cycling|cycle)\b/]];
const STOP=new Set("the a an and or in on at for to of with me my i we is are what where which show find give some any best good great place places destination destinations trip visit go going want looking recommend suggest please can you near under below budget days day how much about tell from this that there do does should would like than more less cheap cheaper pesos php per person month next plan itinerary under around".split(" "));
const PSTOP=new Set(["mountain","south","southern","north","northern","eastern","western","occidental","oriental","metro","del","de","la","san"]);
let PK=null,PKn=-1;
function provKeys(){if(PK&&PKn==D.length)return PK;PKn=D.length;const s=new Set();D.forEach(d=>{const p=norm(d.p);s.add(p);const f=p.split(" ")[0];if(!PSTOP.has(f))s.add(f)});PK=[...s].filter(k=>k.length>=4&&!PSTOP.has(k));return PK}
let AL=null,ALn=-1;
function aliases(){if(AL&&ALn==D.length)return AL;AL=[];ALn=D.length;D.forEach(d=>{const ks=new Set([norm(d.n)]);d.n.split(/[,&]/).forEach(x=>ks.add(norm(x)));ks.forEach(k=>{if(k.length>=5)AL.push({k,d,re:new RegExp("\\b"+reEsc(k)+"\\b")})})});return AL}
function findDest(t){let b=null;for(const a of aliases()){if(hid().includes(a.d.n))continue;if(a.re.test(t)&&(!b||a.k.length>b.k.length||(a.k.length==b.k.length&&a.d.o>b.d.o)))b=a}return b&&b.d}

function parse(raw){let s=raw.toLowerCase().replace(/island hopping/g,"hopping");const t=norm(s),p={words:[],types:[],acts:[],prov:null,provLabel:"",reg:null,rg:null,tt:null,budget:null,days:null,month:null,pop:null,cheap:false,cheapen:false,kw:[]};
 let m=s.match(/(\d+)\s*(?:-|to)?\s*(\d+)?\s*(?:days?|nights?)\b/),s2=s;
 if(m){p.days=Math.max(+m[1],+(m[2]||0));s2=s.replace(m[0]," ")}
 if(/\bweekend\b/.test(s))p.days=2;else if(/\bday ?trip\b|\bone day\b/.test(s))p.days=1;else if(/\b(a|one|1) week\b/.test(s))p.days=7;
 const nums=[...s2.matchAll(/(\d[\d,]*(?:\.\d+)?)\s*(k\b|thousand)?/g)];
 for(const n of nums){const v=parseFloat(n[1].replace(/,/g,""))*(n[2]?1000:1);if(v>=1000&&v<=300000){p.budget=Math.round(v);break}}
 if(/\b(cheap|cheapest|affordable|low cost|low budget|backpacker|budget friendly)\b/.test(s)){p.cheap=true;if(p.budget==null)p.budget=4000}
 if(/\b(cheaper|less expensive|lower budget)\b/.test(s))p.cheapen=true;
 if(/\bthis month\b/.test(s))p.month=NOW;else if(/\bnext month\b/.test(s))p.month=NOW%12+1;
 else{for(const k in MON)if(new RegExp("\\b"+k+"\\b").test(s)){p.month=MON[k];break}
  if(p.month==null&&(/\b(in|for|during|around|this|next|of|by)\s+may\b/.test(s)||t=="may"))p.month=5}
 let bk=null;for(const k of provKeys())if(new RegExp("\\b"+reEsc(k)+"\\b").test(t)&&(!bk||k.length>bk.length))bk=k;
 if(bk){p.prov=bk;const d=D.find(x=>norm(x.p).includes(bk));p.provLabel=d?d.p:bk}
 if(!p.prov){if(/\bluzon\b/.test(t))p.reg="L";else if(/\bvisayas\b/.test(t))p.reg="V";else if(/\bmindanao\b/.test(t))p.reg="M"}
 const RGX=[["NCR",/\b(ncr|metro manila|national capital region)\b/],["CAR",/\b(cordillera|car region)\b/],["R1",/\b(ilocos region|region (1|i|one))\b/],["R2",/\b(cagayan valley|region (2|ii|two))\b/],["R3",/\b(central luzon|region (3|iii|three))\b/],["R4A",/\b(calabarzon|region (4a|4 a|iv a|iva))\b/],["R4B",/\b(mimaropa|region (4b|4 b|iv b|ivb))\b/],["R5",/\b(bicol|region (5|v|five))\b/],["R6",/\b(western visayas|region (6|vi|six))\b/],["NIR",/\b(negros island region|nir)\b/],["R7",/\b(central visayas|region (7|vii|seven))\b/],["R8",/\b(eastern visayas|region (8|viii|eight))\b/],["R9",/\b(zamboanga peninsula|region (9|ix|nine))\b/],["R10",/\b(northern mindanao|region (10|x|ten))\b/],["R11",/\b(davao region|region (11|xi|eleven))\b/],["R12",/\b(soccsksargen|region (12|xii|twelve))\b/],["R13",/\b(caraga|region (13|xiii|thirteen))\b/],["BARMM",/\b(barmm|bangsamoro)\b/]];
 for(const[c,r]of RGX)if(r.test(t)){p.rg=c;break}
 if(/\b(tiktok|tik tok|viral|trending|instagrammable|aesthetic|photogenic|fyp)\b/.test(t))p.tt=true;
 p.words=t.split(" ").filter(w=>TY.some(x=>x[1].test(w))||AC.some(x=>x[1].test(w))).map(w=>w.slice(0,Math.max(4,w.length-2)));
 TY.forEach(([k,r])=>{if(r.test(t))p.types.push(k)});AC.forEach(([k,r])=>{if(r.test(t))p.acts.push(k)});
 if(/\b(popular|famous|must see|must visit|touristy|iconic)\b/.test(s))p.pop=1;
 if(/\b(hidden|gem|gems|offbeat|off the beaten|quiet|less crowded|undiscovered|underrated|secret)\b/.test(s))p.pop=0;
 const used=new RegExp("\\b("+Object.keys(MON).join("|")+"|luzon|visayas|mindanao|hidden|gem|gems|popular|famous|offbeat|quiet|underrated|secret|undiscovered|calabarzon|ncr|mimaropa|barmm|bangsamoro|caraga|bicol|cordillera|soccsksargen|tiktok|viral|trending|aesthetic|instagrammable|photogenic|fyp|region)\\b");
 p.kw=t.split(" ").filter(w=>w.length>=4&&!/^\d/.test(w)&&!STOP.has(w)&&!used.test(w)&&!TY.some(x=>x[1].test(w))&&!AC.some(x=>x[1].test(w))&&!(bk&&bk.split(" ").includes(w))).map(stem);
 return p}
const hasC=p=>p.types.length||p.acts.length||p.prov||p.reg||p.rg||p.tt||p.budget!=null||p.days!=null||p.month!=null||p.pop!=null;

/* ---------- chatbot engine ---------- */
let ctx=null,lastRes=null,shown=0,nextQ=null;
const DEFQ=["Beaches under ₱6,000","TikTok spots in CALABARZON","Museums in Manila","Plan 5 days under ₱20,000","Hidden gems in Mindanao"];
const gradOf=d=>{const c=(typeof TC!="undefined"&&TC[d.t])||["#134d46","#3f8f6f"];return `linear-gradient(135deg,${c[0]},${c[1]})`};
const card=d=>`<button class="xc-card" data-xcd="${d.i}"><span class="xc-th" data-ci="${d.i}" style="background:${gradOf(d)}">${d.img?`<img src="${d.img}" alt="">`:""}</span><span class="xc-tx"><b>${esc(d.n)}</b><small>${esc(d.p)} · ${esc(d.t)} · ${P(d.b)} · ${d.d}d${d.tt?" · 🔥":""}</small></span></button>`;
const inScope=(d,p)=>(!p.prov||norm(d.p).includes(p.prov))&&(!p.reg||d.g==p.reg)&&(!p.rg||d.r==p.rg)&&(!p.tt||d.tt);
function score(d,p){const dn=norm(d.n+" "+(d.desc||""));return(p.types.includes(d.t)?5:0)+p.acts.filter(a=>d.a.includes(a)).length*3+(p.month&&d.mo.includes(p.month)?3:0)+(p.pop!=null&&(d.o==1)==!!p.pop?2:0)+(d.o?1:0)+p.kw.filter(w=>dn.includes(w)).length*4+(p.words||[]).filter(w=>dn.includes(w)).length*3+star(d)*.2}
function rec(p,center){let base=live().filter(d=>inScope(d,p)&&(p.budget==null||d.b<=p.budget)&&(!center||(hav(center,d)<=120)));
 const has={month:p.month!=null,pop:p.pop!=null,acts:p.acts.length>0,days:p.days!=null,types:p.types.length>0},off=new Set(),relaxed=[];
 const ok=d=>(off.has("types")||!has.types||p.types.includes(d.t))&&(off.has("acts")||!has.acts||p.acts.some(a=>d.a.includes(a)))&&(off.has("days")||!has.days||d.d<=p.days)&&(off.has("month")||!has.month||d.mo.includes(p.month))&&(off.has("pop")||!has.pop||(d.o==1)==!!p.pop);
 let res=base.filter(ok);
 for(const k of["month","pop","acts","days","types"]){if(res.length>=3)break;if(!has[k])continue;off.add(k);relaxed.push(k);res=base.filter(ok)}
 const bits=[];if(p.types.length)bits.push(p.types.join("/").toLowerCase());if(p.acts.length)bits.push(p.acts.map(a=>A[a].toLowerCase()).join("/"));
 if(center)bits.push("near "+center.n);else if(p.prov)bits.push("in "+p.provLabel);else if(p.reg)bits.push("in "+G[p.reg]);
 if(p.rg)bits.push("in "+((REGIONS.find(r=>r.c==p.rg)||{}).s||p.rg));if(p.tt)bits.push("TikTok-famous");
 if(p.budget!=null)bits.push("up to "+P(p.budget));if(p.days!=null)bits.push("within "+p.days+" day"+(p.days>1?"s":""));if(p.month!=null)bits.push("for "+MN[p.month-1]);if(p.pop!=null)bits.push(p.pop?"popular":"hidden gems");
 if(!res.length){const cheap=live().filter(d=>inScope(d,p)).sort((a,b)=>a.b-b.b).slice(0,3);nextQ=["Start over"];return`I could not find a match${bits.length?" for "+esc(bits.join(" · ")):""}. ${cheap.length?"The cheapest in that area start at "+P(cheap[0].b)+":</p>"+cheap.map(card).join(""):"Try a bigger area or budget."}`}
 res.sort((a,b)=>p.cheap?a.b-b.b:score(b,p)-score(a,p)||b.o-a.o);lastRes=res;shown=Math.min(5,res.length);
 nextQ=[...(res.length>shown?["Show more"]:[]),"Cheaper","Only hidden gems","Start over"];
 return`Here ${res.length>1?"are my top picks":"is my pick"}${bits.length?" · "+esc(bits.join(" · ")):""} (${res.length} match${res.length>1?"es":""}):`+res.slice(0,shown).map(card).join("")+(relaxed.length?`<small class="xc-note">Few exact matches, so I loosened: ${relaxed.join(", ")}.</small>`:"")}
function more(){if(!lastRes||shown>=lastRes.length)return"That is everything for this request. Try a different budget, month or place.";const a=lastRes.slice(shown,shown+5);shown+=a.length;nextQ=[...(lastRes.length>shown?["Show more"]:[]),"Cheaper","Start over"];return a.map(card).join("")}
function plan(p){const days=p.days||5,bud=p.budget==null?Infinity:p.budget;
 const pool=live().filter(d=>inScope(d,p)&&(!p.types.length||p.types.includes(d.t)||!p.acts.length)).sort((a,b)=>score(b,p)-score(a,p)).slice(0,60),out=[];let dd=0,cs=0;
 while(1){const l=out[out.length-1],n=pool.find(d=>!out.includes(d)&&dd+d.d<=days&&cs+d.b<=bud&&(!l||hav(l,d)<=350));if(!n)break;out.push(n);dd+=n.d;cs+=n.b}
 if(!out.length){nextQ=["Start over"];return"I could not fit a trip into that budget and time. Try more days or a higher budget."}
 let day=1;const rows=out.map(d=>{const a=day,b=day+d.d-1;day=b+1;return`<button class="xc-card" data-xcd="${d.i}"><b>Day ${a}${b>a?"-"+b:""}: ${esc(d.n)}</b><small>${esc(d.p)} · about ${P(d.b)}</small></button>`}).join("");
 nextQ=["Cheaper","Start over"];
 return`Here is a ${dd}-day idea of nearby stops, about ${P(cs)} per person in total:`+rows+(days>dd?`<small class="xc-note">${days-dd} day${days-dd>1?"s":""} left over for travel or rest.</small>`:"")+`<button class="xc-act" data-xcp="${out.map(d=>d.i).join(",")}">Add these to my trip</button><small class="xc-note">Budgets and travel times are rough estimates.</small>`}
function similar(d,n){const r=live().filter(x=>x.i!=d.i).map(x=>({x,v:x.a.filter(a=>d.a.includes(a)).length+(x.t==d.t?3:0)+(x.g==d.g?1:0)+(hav(d,x)<150?2:0)})).sort((a,b)=>b.v-a.v||b.x.o-a.x.o).slice(0,n||5).map(o=>o.x);return r.map(card).join("")}
function nearby(d,km){const r=live().filter(x=>x.i!=d.i&&hav(d,x)<=km).sort((a,b)=>hav(d,a)-hav(d,b)).slice(0,6);return r.length?`Places close to ${esc(d.n)}:`+r.map(card).join(""):`I do not have other places within ${km} km of ${esc(d.n)}.`}
function destAns(d,t,p){const q=[`Similar to ${d.n}`,`How to get to ${d.n}`,`Tips for ${d.n}`,"Start over"];nextQ=q;
 if(/\badd\b/.test(t)&&/\btrip\b/.test(t)){if(!st.trip.includes(d.i)){st.trip.push(d.i);save();render()}return`Added ${esc(d.n)} to your trip. Open <b>My trip</b> at the top to see your route.`}
 if((p.types.length||p.acts.length)&&/\b(in|near|around|at|within)\b/.test(t))return rec(p,d);
 if(/\b(how (do i |to )?(get|go|reach)|get to|going to|travel to|directions|route)\b/.test(t))return`<b>Getting to ${esc(d.n)}:</b> ${esc(d.go||"I do not have route details yet.")}`;
 if(/\b(tip|tips|advice)\b/.test(t))return`<b>Tip for ${esc(d.n)}:</b> ${esc(d.tip||"No tip yet.")}`;
 if(/\b(weather|forecast|rain|typhoon|storm)\b/.test(t))return`Live weather is on the ${esc(d.n)} page. Best months: ${rng(d)}.<button class="xc-act" data-xcd="${d.i}">Open ${esc(d.n)}</button>`;
 if(/\b(when|best time|best month|best months|season|what month)\b/.test(t))return`Best months for ${esc(d.n)}: <b>${rng(d)}</b>.${d.mo.includes(NOW)?" That includes this month.":""}`;
 if(/\b(cost|price|how much|expensive|budget for)\b/.test(t))return costAns(d,t);
 if(/\b(similar|alternatives|places like|something like)\b/.test(t))return`Similar to ${esc(d.n)}:`+similar(d);
 if(/\b(near|nearby|around|close to|things to do|what to do)\b/.test(t))return nearby(d,60);
 const mn=p.month!=null?`<br><b>${MN[p.month-1]}</b> is ${d.mo.includes(p.month)?"within":"outside"} its best months.`:"";
 return`<b>${esc(d.n)}</b> <span class="xc-tag">${esc(d.t)}</span><br>${esc(d.p)} · ${esc(G[d.g])}<br>${esc(d.desc||"")}<br>About ${P(d.b)} for ${d.d} day${d.d>1?"s":""}. Best months: ${rng(d)}.${mn}<br>Good for: ${esc(d.a.map(a=>A[a]).join(", "))}.<button class="xc-act" data-xcd="${d.i}">Open details</button><button class="xc-act" data-xct="${d.i}">${st.trip.includes(d.i)?"Remove from trip":"Add to my trip"}</button>`}
function merge(p,t){let m=p;
 const topic=p.types.length||p.acts.length||p.kw.length||p.prov||p.reg,fresh=/\b(plan|itinerary|build)\b/.test(t),cue=/^(and|also|what about|how about|only|but|with|in|for|under|cheaper|more|less|make it|change)\b/.test(t);
 if(ctx&&(cue||(!topic&&!fresh))){m={...ctx};["types","acts","kw","words"].forEach(k=>{if(p[k].length)m[k]=p[k]});["prov","provLabel","reg","rg","tt","budget","days","month","pop"].forEach(k=>{if(p[k]!=null&&p[k]!=="")m[k]=p[k]});if(p.prov)m.reg=null;if(p.reg)m.prov=null}
 if(p.cheapen){const base=m.budget||(lastRes&&lastRes.length?lastRes[Math.floor(lastRes.length/2)].b:6000);m.budget=Math.max(1500,Math.round(base*.7/500)*500)}
 ctx=m;return m}

/* ---------- extra knowledge: more questions the assistant can answer ---------- */
const FAQ2=[
[/\b(typical costs?|how much (is|are) (food|meals?|transport|a tricycle|a jeepney|ferry|ferries|hotels?|rooms?)|cost of living|daily budget|how much money)\b/,"<b>Typical costs (rough, they vary by place and season)</b><br>• Meals: ₱80–150 at a carinderia, ₱250–600 at a restaurant<br>• Tricycle in town: about ₱20–100<br>• Jeepney: about ₱13–25<br>• Ferries: ₱300–2,500 by distance<br>• Rooms: hostels ₱500–1,200, mid-range ₱1,500–3,500, resorts ₱4,000+<br>• Daily budget: about ₱1,500–2,500 (budget), ₱3,000–5,000 (standard), ₱6,000+ (comfort)"],
[/\b(tipping|gratuity|service charge|should i tip)\b/,"Tipping is appreciated but not required. Many restaurants add a 10% service charge. If they do not, 10% or rounding up is common. Guides and boatmen usually get ₱100–300 per guest for good service."],
[/\b(sim card|esim|e sim|wifi|wi fi|internet|mobile data|mobile network|globe|dito)\b/,"The main networks are Globe, Smart and DITO. You can buy a prepaid SIM at the airport or in malls with a valid ID, and many phones support eSIMs. Signal is weaker on small islands and in the mountains, so download offline maps first."],
[/\b(plug|socket|voltage|adapter|power outlet|charger)\b/,"Outlets use 220V and 60Hz with Type A, B and C sockets. Bring a universal adapter, and a power bank for boat days."],
[/\b(visa|passport|entry requirements?|immigration|etravel)\b/,"Entry rules depend on your nationality and change often. Many visitors can enter without a visa for a limited stay, but confirm with the Bureau of Immigration or your embassy. Your passport usually needs to be valid for at least six months, and you may need to register online before arrival. Check official sources before you book."],
[/\b(emergency|hotline|police|ambulance|911|red cross|embassy)\b/,"<b>Emergency numbers</b><br>• 911: national emergency hotline<br>• 143: Philippine Red Cross<br>• 1386: DOT tourist assistance (confirm before relying on it)<br>For weather, check PAGASA, and for volcano alerts check Phivolcs. Save your embassy's number too."],
[/\b(tagalog|bisaya|cebuano|phrases?|how to say|language|speak english)\b/,"English is widely spoken in tourist areas. Handy phrases:<br>• Salamat: thank you<br>• Magkano?: how much?<br>• Masarap!: delicious<br>• Saan ang…?: where is…?<br>• Po / opo: polite yes<br>• Bisaya: Salamat kaayo (thank you very much), Tagpila ni? (how much is this?)"],
[/\b(etiquette|customs|manners|mano po|dress code|what to wear|what should i wear)\b/,"Smile and be polite, and use 'po' and 'opo' with elders. Dress modestly in churches and mosques, remove shoes when entering a home, and ask before photographing people. Bargaining is fine in markets, but keep it friendly."],
[/\b(solo travel|travel alone|traveling alone|travelling alone|with kids|with children|toddler|honeymoon|women travel|female traveler|safe for (solo|women|families|kids))\b/,"Solo travel is popular, and the Philippines is generally welcoming. Choose well-reviewed stays, use licensed guides, avoid isolated areas at night, and share your itinerary. With kids, pick calm beaches and short transfers, bring a first-aid kit, and check life-jacket sizes. For honeymoons, small islands like Siquijor, Camiguin and El Nido are popular."],
[/\b(drones?|gopro|camera gear|photography tips?|photo tips?)\b/,"Golden hour is best for beaches and mountains, and sunrise for sea-of-clouds shots. For drones, check registration and permit rules (CAAP) and restrictions near airports, heritage sites and crowds. Use a waterproof case on boats and at waterfalls, and protect gear from sand and salt."],
[/\b(travel insurance|insurance)\b/,"Travel insurance is a good idea, especially for island trips that storms can cancel and for activities like diving or trekking. Check that it covers medical care, evacuation, delays and the activities you plan."],
[/\b(vaccin|malaria|dengue|tap water|drinking water|medicine|get sick|health tips?)\b/,"Drink bottled or filtered water, use mosquito repellent (dengue occurs here), and bring basic medicines, sunscreen and oral rehydration salts. Ask a travel clinic about vaccines and malaria risk for rural areas such as parts of Palawan. Hospitals are in larger towns, so plan extra for remote islands."],
[/\b(scams?|overcharg|fixers?|touts?)\b/,"Agree on prices before riding or booking, use accredited guides and operators, and never hand over your passport as a deposit. In busy spots, use ride-hail or official taxis and check fares."],
[/\b(how many days|how long should i stay|how long to stay|how long do i need)\b/,"For one town or island, 2 to 4 days is typical. Palawan and Siargao deserve 4 to 5 days, Banaue and Sagada work best with 3, and Metro Manila with day trips fits in 1 to 2. Add a buffer day before flights home in typhoon season."],
[/\b(when to book|book early|advance booking|holy week|peak season|long weekend)\b/,"Book flights and popular ferries 3 to 8 weeks ahead, and rooms early for Holy Week, Christmas, New Year and long weekends. Some permits (Mt. Apo, Mt. Pulag, the Underground River) need advance reservations."],
[/\b(useful apps?|which apps?|apps to download)\b/,"Useful apps: Grab for rides in cities, Google Maps with offline maps, GCash or Maya for payments, Windy or PAGASA for weather, and your ferry or airline app."],
[/\b(rent (a )?(car|motorbike|scooter|motorcycle)|driver'?s license|motorbike rental)\b/,"Renting a motorbike is common on islands like Siargao and Siquijor. You need a valid license, a helmet and care with local traffic. Check insurance and photograph the bike before you ride."],
[/\b(must try|famous food|filipino food|dishes|pasalubong|delicacies|local food)\b/,"Must-try dishes: adobo, sinigang, lechon, sisig, kare-kare, laing, bulalo, kinilaw and halo-halo. Pasalubong ideas: dried mango, pili nuts, ube treats and kapeng barako. Ask me what to eat in a region, for example \"what to eat in Cebu\"."]
];
const TOPICS={"Ideas":["Beaches under ₱6,000","TikTok spots in CALABARZON","Hidden gems in Mindanao","Waterfalls in Luzon","Mountains in Cordillera"],"Plan":["Plan 5 days under ₱20,000","Plan a weekend near Manila","Plan 4 days in Palawan"],"Places":["Tell me about Siargao","Compare Boracay and Panglao","Things to do in Baguio","Surprise me"],"Money":["Typical costs","How much cash should I carry?","Is tipping expected?","How much for 2 people in El Nido?"],"Weather":["When is typhoon season?","Best time for Siargao","Best months for Bicol"],"Food":["What to eat in Cebu","What to eat in Ilocos","Must-try Filipino dishes"],"Safety":["Is it safe to travel?","Emergency numbers","Do I need travel insurance?","Solo travel tips"],"Culture":["Filipino etiquette","Basic Tagalog phrases","What to wear in churches"],"Getting around":["How to get around","Ferry tips","Useful apps","Renting a motorbike"]};
function topics(){nextQ=["Surprise me","Plan 5 days under ₱20,000","Typical costs","Emergency numbers"];return"<b>What would you like to explore?</b><br>Tap a question, or type your own.<div class=\"xc-tp\">"+Object.entries(TOPICS).map(([k,a])=>`<div><small>${esc(k)}</small>${a.map(q=>`<button class="xc-chip" data-xcs="${esc(q)}">${esc(q)}</button>`).join("")}</div>`).join("")+"</div>"}
const rngSet=set=>{const out=[];for(let x=1;x<=12;x++){const pv=(x+10)%12+1;if(set.has(x)&&!set.has(pv)){let e=x;while(set.has(e%12+1)&&e%12+1!=x)e=e%12+1;out.push(e==x?MN[x-1]:MN[x-1]+"–"+MN[e-1])}}return out.join(", ")||"year-round"};
const scopeList=p=>live().filter(d=>inScope(d,p)&&(!p.types.length||p.types.includes(d.t)));
function monthsAns(p){const l=scopeList(p);if(!l.length)return null;const c=Array(13).fill(0);l.forEach(d=>d.mo.forEach(m=>c[m]++));const mx=Math.max(...c),set=new Set();c.forEach((x,m)=>{if(m&&x>=.6*mx)set.add(m)});
 const nm=p.provLabel||(p.rg&&(R2[p.rg]||{}).s)||(p.reg&&G[p.reg])||(p.types[0]?p.types[0].toLowerCase()+" spots":"the Philippines");
 const top=l.filter(d=>d.o||d.tt).slice(0,4);nextQ=["Plan 4 days in "+(p.provLabel||nm),"Beaches in "+nm,"Start over"];
 return`For <b>${esc(nm)}</b>, most places are best in <b>${rngSet(set)}</b>. Each destination has its own best months and a 5-day forecast on its page.`+top.map(card).join("")}
const R2=new Proxy({},{get:(_,k)=>(typeof REGIONS!="undefined"?REGIONS:[]).find(r=>r.c==k)});
function regionAns(p){const code=p.rg||(p.prov&&(D.find(d=>norm(d.p).includes(p.prov))||{}).r);const l=live().filter(d=>p.rg?d.r==p.rg:inScope(d,p));if(!l.length)return null;
 const nm=p.rg?(R2[p.rg]||{}).n:p.provLabel,avg=Math.round(l.reduce((s,d)=>s+(d.b0!=null?d.b0:d.b),0)/l.length/100)*100,ty={};l.forEach(d=>ty[d.t]=(ty[d.t]||0)+1);
 const top=Object.entries(ty).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0].toLowerCase()+" ("+x[1]+")").join(", "),c=Array(13).fill(0);l.forEach(d=>d.mo.forEach(m=>c[m]++));const mx=Math.max(...c),set=new Set();c.forEach((x,m)=>{if(m&&x>=.6*mx)set.add(m)});
 const hi=l.filter(d=>d.o||d.tt).slice(0,5),f=p.rg&&FOOD[p.rg]?`<br>Food to try: ${esc(FOOD[p.rg])}.`:"";
 nextQ=["TikTok spots in "+(p.provLabel||(R2[p.rg]||{}).s||"here"),"Waterfalls in "+(p.provLabel||(R2[p.rg]||{}).s||"here"),"Start over"];
 return`<b>${esc(nm)}</b><br>${l.length} destinations, mostly ${esc(top)}. Typical budget about ${P(avg)} per person from Metro Manila. Best months: ${rngSet(set)}.${f}`+hi.map(card).join("")}
function foodAns(p,hit){const code=hit?hit.r:p.rg||(p.prov&&(D.find(d=>norm(d.p).includes(p.prov))||{}).r);
 if(!code||!FOOD[code])return null;const nm=hit?hit.n+" ("+(R2[code]||{}).s+")":p.provLabel||(R2[code]||{}).n;nextQ=["Beaches in "+(hit?hit.p:p.provLabel||"here"),"Typical costs","Start over"];return`<b>Food in ${esc(nm)}</b><br>Try ${esc(FOOD[code])}.<br>Ask at a local carinderia or market for the day's specials.`}
function costTable(d,pax){const k=[st.pax,st.sty];st.pax=pax;const rows=Object.keys(STY).map(s=>{st.sty=s;return[STY[s][0],cost(d)]});st.pax=k[0];st.sty=k[1];return rows}
function costAns(d,t){const m=t.match(/(\d+)\s*(people|persons?|pax|adults?|travell?ers?|of us)/)||t.match(/\bfor\s+(\d+)\b/),pax=m?Math.max(1,Math.min(20,+m[1])):st.pax;
 nextQ=[`Tips for ${d.n}`,`How to get to ${d.n}`,"Start over"];return`<b>${esc(d.n)}: about ${d.d} day${d.d>1?"s":""} for ${pax} traveler${pax>1?"s":""}</b><br>`+costTable(d,pax).map(([n,v])=>`• ${esc(n)}: <b>${P(v)}</b>`).join("<br>")+`<br><small class="xc-note">Rough estimates from your starting point. They exclude flights to the Philippines.</small>`}
function compare(raw){const parts=raw.split(/\b(?:and|vs\.?|versus|with|or)\b/i).map(x=>findDest(norm(x))).filter(Boolean),u=[...new Map(parts.map(d=>[d.n,d])).values()].slice(0,3);if(u.length<2)return null;
 const row=(l,f)=>`<tr><td>${l}</td>${u.map(d=>`<td>${f(d)}</td>`).join("")}</tr>`;nextQ=["Surprise me","Start over"];
 return`<table class="xc-t"><tr><th></th>${u.map(d=>`<th>${esc(d.n)}</th>`).join("")}</tr>${row("Region",d=>esc((R2[d.r]||{}).s||d.p))}${row("Type",d=>esc(d.t))}${row("Budget",d=>P(d.b))}${row("Days",d=>d.d)}${row("Best months",d=>rngSet(new Set(d.mo)))}${row("TikTok",d=>d.tt?"🔥 yes":"–")}${row("Good for",d=>esc(d.a.slice(0,3).map(a=>A[a]).join(", ")))}</table>`+u.map(d=>`<button class="xc-act" data-xcd="${d.i}">Open ${esc(d.n)}</button>`).join("")}
function stats(){const l=live(),tt=l.filter(d=>d.tt).length,rs=new Set(l.map(d=>d.r)).size;nextQ=["TikTok spots in CALABARZON","Surprise me"];return`I know <b>${l.length}</b> destinations across <b>${rs}</b> regions, and <b>${tt}</b> are tagged TikTok-famous. Luzon has ${l.filter(d=>d.g=="L").length}, Visayas ${l.filter(d=>d.g=="V").length} and Mindanao ${l.filter(d=>d.g=="M").length}.`}
function reply(text){const raw=String(text).trim(),t=norm(raw);nextQ=null;if(!t)return"Type a question and I will help.";
 if(/^(hi|hello|hey|kumusta|good (morning|afternoon|evening))\b/.test(t)&&t.split(" ").length<=4)return"Hi! Tell me your budget, region, activity or month, or ask about a place.";
 if(/\b(thanks|thank you|salamat)\b/.test(t))return"You're welcome! Ask me anything else about your trip.";
 if(/\b(start over|reset|clear)\b/.test(t)){ctx=null;lastRes=null;shown=0;nextQ=DEFQ;return"Okay, fresh start. What kind of trip are you after?"}
 if(/\b(help|what can you do|topics|what can i ask|menu)\b/.test(t)&&t.split(" ").length<=5)return topics();
 if(false){nextQ=DEFQ;return"I can suggest places by budget, region, type, activity or month, answer questions about a place (how to get there, best months, tips, cost), plan a trip by days and budget, and share general travel tips."}
 if(/\b(near me|closest to me)\b/.test(t)){const b=$("nearBtn");b&&b.click();return"I switched the destination list to sort by distance from you. Your browser may ask for location access."}
 if(/^(more|show more|next|another)$/.test(t)||/\bshow more\b/.test(t))return more();
 if(/\b(surprise me|random place|pick for me|anywhere)\b/.test(t)){const l=live().filter(d=>d.o||d.tt),d=l[Math.floor(Math.random()*l.length)];return"How about this one?"+card(d)+destAns(d,"",parse(""))}
 if(/\b(compare|versus|vs)\b/.test(t)){const c=compare(raw);if(c)return c}
 if(/\bhow many\b.*\b(destinations|places|spots)\b/.test(t))return stats();
 const p0=parse(raw),hit=findDest(t);
 if(/\b(what to eat|what should i eat|must try|pasalubong|delicac|local food|famous food|food in|eat in)\b/.test(t)){const f=foodAns(p0,hit);if(f)return f}
 if(!hit&&/\b(best (time|month|months)|when (to|should i) (go|visit)|when is the best)\b/.test(t)&&(p0.prov||p0.rg||p0.reg||p0.types.length)){const m=monthsAns(p0);if(m)return m}
 if(!hit&&(p0.rg||p0.prov)&&/\b(about|guide|overview|what is|what s in|tell me|know about)\b/.test(t)&&!p0.types.length&&!p0.acts.length){const r=regionAns(p0);if(r)return r}
 if(hit)return destAns(hit,t,p0);
 const fq=FAQ2.concat(FAQ).find(f=>f[0].test(t));
 if(fq&&(!fq[0].test("best time")||!hasC(p0))&&!(p0.types.length&&/\bevent|events\b/.test(t)))return fq[1];
 if(p0.kw.length){const r=searchAll(raw);if(r.length&&r.some(o=>p0.kw.every(w=>norm(o.d.n).includes(w)))){nextQ=["Start over"];return"Here is what I found:"+r.slice(0,6).map(o=>card(o.d)).join("")}}
 const p=merge(p0,t);
 if(/\b(plan|itinerary|build)\b/.test(t)||(p.days!=null&&/\b(trip|visit|travel)\b/.test(t)))return plan(p);
 if(hasC(p))return rec(p);
 const r=searchAll(raw).slice(0,5);
 if(r.length){nextQ=["Start over"];return"These look closest to what you typed:"+r.map(o=>card(o.d)).join("")}
 nextQ=DEFQ;return"I did not catch that. Try something like \"waterfalls in Luzon under ₱5,000\", \"best time for Siargao\" or \"plan 4 days in Palawan\"."}

/* ---------- chatbot UI ---------- */
const css=`#xcb{position:fixed;right:16px;bottom:16px;z-index:1040;border:0;border-radius:999px;background:#ff6f4c;color:#fff;font:600 15px/1 'Work Sans',system-ui,sans-serif;padding:13px 18px;box-shadow:0 6px 18px rgba(0,0,0,.28);cursor:pointer}
#xc{position:fixed;right:16px;bottom:16px;z-index:1041;width:min(390px,calc(100vw - 24px));height:min(580px,calc(100vh - 32px));display:flex;flex-direction:column;background:#fff;color:#1c2b29;border-radius:18px;box-shadow:0 14px 44px rgba(0,0,0,.38);overflow:hidden;font:15px/1.45 'Work Sans',system-ui,sans-serif}
#xc[hidden],#xs[hidden]{display:none!important}
.xc-h{background:#0e3b36;color:#fff;padding:12px 14px;display:flex;align-items:center;gap:8px}.xc-h div{flex:1;line-height:1.2}.xc-h small{display:block;opacity:.75;font-size:12px}
.xc-h button,#xsx{background:transparent;border:0;color:inherit;font-size:18px;cursor:pointer;padding:4px 8px}
.xc-m{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:8px;background:#f5f7f6}
.xc-b,.xc-u{max-width:90%;padding:9px 12px;border-radius:14px;word-wrap:break-word}.xc-b{background:#fff;border:1px solid #dfe6e3;align-self:flex-start}.xc-u{background:#0e3b36;color:#fff;align-self:flex-end}
.xc-card{display:block;width:100%;text-align:left;margin-top:6px;padding:8px 10px;border:1px solid #cfe0db;border-radius:10px;background:#f2faf8;color:inherit;cursor:pointer}.xc-card:hover{background:#e3f3ef}.xc-card small{display:block;color:#5a6b67}
.xc-act{display:inline-block;margin:8px 6px 0 0;padding:6px 12px;border:0;border-radius:999px;background:#ff6f4c;color:#fff;font-weight:600;cursor:pointer}
.xc-note{display:block;margin-top:6px;color:#5a6b67}.xc-tag{background:#e8b750;color:#3b2a00;border-radius:6px;padding:1px 7px;font-size:12px}
.xc-q{display:flex;gap:6px;overflow-x:auto;padding:8px 10px;background:#f5f7f6;border-top:1px solid #e1e8e5}.xc-q button{flex:none;border:1px solid #0e3b36;background:#fff;color:#0e3b36;border-radius:999px;padding:5px 11px;font-size:13px;cursor:pointer}
.xc-i{display:flex;gap:8px;padding:10px;border-top:1px solid #e1e8e5;padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))}.xc-i input{flex:1;border:1px solid #bccbc6;border-radius:999px;padding:9px 14px;font:inherit;color:#1c2b29;background:#fff}.xc-i button{border:0;border-radius:999px;background:#0e3b36;color:#fff;padding:0 16px;font-weight:600;cursor:pointer}
#xs{position:fixed;inset:0;z-index:1060;background:rgba(10,25,23,.55);display:flex;justify-content:center;align-items:flex-start;padding:10vh 12px 12px}
.xs-box{width:min(640px,100%);max-height:80vh;overflow:auto;background:#fff;color:#1c2b29;border-radius:16px;box-shadow:0 14px 44px rgba(0,0,0,.4);padding:12px}
.xs-top{display:flex;gap:6px}.xs-top input{flex:1;border:1px solid #bccbc6;border-radius:10px;padding:11px 14px;font-size:16px;color:#1c2b29;background:#fff}#xsx{color:#1c2b29}
.xs-reg{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.xs-c{border:1px solid #0e3b36;background:#fff;color:#0e3b36;border-radius:999px;padding:4px 12px;font-size:13px;cursor:pointer}.xs-c.on{background:#0e3b36;color:#fff}
.xs-r{display:block;width:100%;text-align:left;border:0;border-bottom:1px solid #edf1ef;background:transparent;color:inherit;padding:9px 6px;cursor:pointer}.xs-r:hover{background:#f2faf8}.xs-r small{display:block;color:#5a6b67}
.xs-n{color:#5a6b67;margin:8px 4px}.xs-all{width:100%;margin-top:8px;border:0;border-radius:10px;background:#ff6f4c;color:#fff;font-weight:600;padding:10px;cursor:pointer}
@media(max-width:575px){#xcb span{display:none}#xcb{padding:14px 16px;font-size:18px}#xc{right:12px;bottom:12px}}`;
document.head.insertAdjacentHTML("beforeend","<style>"+css+"</style>");
document.body.insertAdjacentHTML("beforeend",`<button id="xcb" aria-label="Open travel chatbot">💬<span> Ask Destinify</span></button><div id="xc" hidden role="dialog" aria-label="Destinify travel assistant"><div class="xc-h"><div><b>Destinify assistant</b><small><i class="xc-dot"></i> Online · answers from the catalog</small></div><button id="xct" aria-label="Topics" title="Topics">☰</button><button id="xcw" aria-label="Expand" title="Expand">⤢</button><button id="xcx" aria-label="Clear chat" title="Clear chat">🗑</button><button id="xcc" aria-label="Close chat">✕</button></div><div id="xcm" class="xc-m" aria-live="polite"></div><div id="xcq" class="xc-q"></div><div class="xc-i"><button id="xcv" aria-label="Voice input" title="Speak your question" hidden>🎤</button><input id="xci" placeholder="Ask about places, costs, food, weather…" aria-label="Message" autocomplete="off"><button id="xcs">Send</button></div></div>`);
document.head.insertAdjacentHTML("beforeend","<style>body .xc-card{display:flex;gap:10px;align-items:center}.xc-th{flex:none;width:52px;height:52px;border-radius:10px;overflow:hidden;position:relative;background-size:cover}.xc-th img{width:100%;height:100%;object-fit:cover;display:block}.xc-tx{min-width:0}.xc-tx b{display:block}.xc-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#3ddc97;margin-right:4px;box-shadow:0 0 8px #3ddc97}.xc-t{width:100%;border-collapse:collapse;font-size:13px;margin:6px 0}.xc-t th,.xc-t td{border-bottom:1px solid #e1e8e5;padding:5px 6px;text-align:left;vertical-align:top}.xc-t th{color:#0e3b36}.xc-tp{display:flex;flex-direction:column;gap:8px;margin-top:8px}.xc-tp small{display:block;font-weight:700;color:#5a6b67;text-transform:uppercase;letter-spacing:.06em;font-size:11px;margin-bottom:3px}.xc-chip{margin:0 5px 5px 0;padding:4px 10px;border:1px solid #0e3b36;border-radius:999px;background:#fff;color:#0e3b36;font-size:12.5px;cursor:pointer}.xc-chip:hover{background:#0e3b36;color:#fff}.xc-typing{display:flex;gap:4px;padding:12px 14px}.xc-typing i{width:7px;height:7px;border-radius:50%;background:#8aa39d;animation:xcb 1s infinite}.xc-typing i:nth-child(2){animation-delay:.15s}.xc-typing i:nth-child(3){animation-delay:.3s}@keyframes xcb{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-5px);opacity:1}}#xc.xwide{width:min(760px,calc(100vw - 24px));height:min(780px,calc(100vh - 32px))}#xcv{border:0;border-radius:50%;background:#e9efed;width:40px;flex:none;cursor:pointer}#xcv.on{background:#ff4d6d;color:#fff;animation:xcb 1s infinite}.xc-h button:hover{background:rgba(255,255,255,.15);border-radius:8px}@media(prefers-reduced-motion:reduce){.xc-typing i,#xcv.on{animation:none}}</style>");
const bot=h=>{const m=$("xcm");m.insertAdjacentHTML("beforeend",`<div class="xc-b">${h}</div>`);m.scrollTop=m.scrollHeight;const last=m.lastElementChild;last.querySelectorAll(".xc-th[data-ci]").forEach(el=>{const d=D[+el.dataset.ci];if(!d||el.querySelector("img"))return;(typeof getImg=="function"?getImg(d):Promise.resolve(null)).then(u=>{if(u&&!el.querySelector("img"))el.insertAdjacentHTML("afterbegin",`<img src="${u}" alt="">`)}).catch(()=>{})})};
const setQ=a=>{$("xcq").innerHTML=(a||DEFQ).map(x=>`<button data-xcs="${esc(x)}">${esc(x)}</button>`).join("")};
let greeted=false;
function greet(){const l=live(),tt=l.filter(d=>d.tt).length,rs=new Set(l.map(d=>d.r).filter(Boolean)).size;bot(`Hi! I'm the Destinify assistant. I know <b>${l.length}</b> places across <b>${rs}</b> regions, including <b>${tt}</b> TikTok spots. Ask me for ideas by budget, region, activity or month, how to get somewhere, what it costs, what to eat, the weather, safety, or have me plan a trip. Everything comes from this site's catalog, so times and prices are estimates.`);bot(topics());setQ(nextQ)}
function openC(){$("xc").hidden=false;$("xcb").hidden=true;if(!greeted){greeted=true;greet()}$("xci").focus()}
function closeC(){$("xc").hidden=true;$("xcb").hidden=false}
function send(text){text=String(text).trim();if(!text)return;const m=$("xcm");m.insertAdjacentHTML("beforeend",`<div class="xc-u">${esc(text)}</div>`);$("xci").value="";
 const dots=document.createElement("div");dots.className="xc-b xc-typing";dots.innerHTML="<i></i><i></i><i></i>";m.appendChild(dots);m.scrollTop=m.scrollHeight;
 setTimeout(()=>{let h;try{h=reply(text)}catch(e){h="Sorry, something went wrong. Try asking a different way.";nextQ=DEFQ}dots.remove();bot(h);setQ(nextQ)},Math.min(650,220+text.length*7))}
$("xcb").addEventListener("click",openC);$("xcc").addEventListener("click",closeC);$("xcs").addEventListener("click",()=>send($("xci").value));
$("xci").addEventListener("keydown",e=>{if(e.key=="Enter")send($("xci").value)});
nb.addEventListener("click",openS);$("xsx").addEventListener("click",closeS);
$("xs").addEventListener("click",e=>{if(e.target.id=="xs")closeS()});
document.addEventListener("keydown",e=>{const a=document.activeElement,typing=a&&(/INPUT|TEXTAREA|SELECT/.test(a.tagName)||a.isContentEditable);
 if(e.key=="Escape"){if(!$("xs").hidden)closeS();else if(!$("xc").hidden)closeC();return}
 if((e.key=="k"&&(e.ctrlKey||e.metaKey))||(e.key=="/"&&!typing)){e.preventDefault();openS()}});
document.addEventListener("click",e=>{const t=e.target.closest("[data-xo],[data-xr],[data-xsug],[data-xcd],[data-xcs],[data-xct],[data-xcp]");if(!t)return;const g=k=>t.dataset[k];
 if(g("xr")!==undefined){reg=g("xr");return drawS()}
 if(g("xsug")!==undefined){$("xsq").value=g("xsug");return drawS()}
 if(g("xo")!==undefined){const q=$("xsq").value;closeS();
  if(g("xo")=="all"){$("q").value=q;if(reg){$("pg").value=reg;$("pg").dispatchEvent(new Event("change",{bubbles:true}))}$("q").dispatchEvent(new Event("input",{bubbles:true}));$("results").scrollIntoView({behavior:"smooth"})}
  else openDetail(+g("xo"));return}
 if(g("xcd")!==undefined)return openDetail(+g("xcd"));
 if(g("xcs")!==undefined)return send(g("xcs"));
 if(g("xct")!==undefined){const i=+g("xct");toggleTrip(i);return bot(st.trip.includes(i)?`Added ${esc(D[i].n)} to your trip.`:`Removed ${esc(D[i].n)} from your trip.`)}
 if(g("xcp")!==undefined){st.trip=g("xcp").split(",").map(Number);save();render();closeC();bootstrap.Offcanvas.getOrCreateInstance($("tripPanel")).show()}});
$("xct").addEventListener("click",()=>{bot(topics());setQ(nextQ)});
$("xcw").addEventListener("click",()=>$("xc").classList.toggle("xwide"));
$("xcx").addEventListener("click",()=>{ctx=null;lastRes=null;shown=0;$("xcm").innerHTML="";greeted=true;greet()});
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
if(SR){const v=$("xcv");v.hidden=false;let rec=null;v.addEventListener("click",()=>{if(rec){rec.stop();return}rec=new SR();rec.lang="en-PH";rec.interimResults=false;v.classList.add("on");
 rec.onresult=e=>{const t=e.results[0][0].transcript;$("xci").value=t;send(t)};rec.onend=()=>{v.classList.remove("on");rec=null};rec.onerror=()=>{v.classList.remove("on");rec=null};try{rec.start()}catch(x){v.classList.remove("on");rec=null}})}
window.DXC={reply,parse,searchAll,findDest,topics,q:()=>nextQ};
})();
