/* Destinify v9 add-on: global search (button, Ctrl+K or "/") and a travel chatbot.
   The chatbot needs no server and no API key: it answers from the catalog (data.js, details.js)
   and the general tips from the Travel tips section. Edit FAQ below to change its general answers. */
(()=>{
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
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

function parse(raw){let s=raw.toLowerCase().replace(/island hopping/g,"hopping");const t=norm(s),p={words:[],types:[],acts:[],prov:null,provLabel:"",reg:null,budget:null,days:null,month:null,pop:null,cheap:false,cheapen:false,kw:[]};
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
 p.words=t.split(" ").filter(w=>TY.some(x=>x[1].test(w))||AC.some(x=>x[1].test(w))).map(w=>w.slice(0,Math.max(4,w.length-2)));
 TY.forEach(([k,r])=>{if(r.test(t))p.types.push(k)});AC.forEach(([k,r])=>{if(r.test(t))p.acts.push(k)});
 if(/\b(popular|famous|must see|must visit|touristy|iconic)\b/.test(s))p.pop=1;
 if(/\b(hidden|gem|gems|offbeat|off the beaten|quiet|less crowded|undiscovered|underrated|secret)\b/.test(s))p.pop=0;
 const used=new RegExp("\\b("+Object.keys(MON).join("|")+"|luzon|visayas|mindanao|hidden|gem|gems|popular|famous|offbeat|quiet|underrated|secret|undiscovered)\\b");
 p.kw=t.split(" ").filter(w=>w.length>=4&&!/^\d/.test(w)&&!STOP.has(w)&&!used.test(w)&&!TY.some(x=>x[1].test(w))&&!AC.some(x=>x[1].test(w))&&!(bk&&bk.split(" ").includes(w))).map(stem);
 return p}
const hasC=p=>p.types.length||p.acts.length||p.prov||p.reg||p.budget!=null||p.days!=null||p.month!=null||p.pop!=null;

/* ---------- chatbot engine ---------- */
let ctx=null,lastRes=null,shown=0,nextQ=null;
const DEFQ=["Beaches under ₱6,000","Hidden gems in Mindanao","Museums in Manila","Plan 5 days under ₱20,000","Best time for Siargao"];
const card=d=>`<button class="xc-card" data-xcd="${d.i}"><b>${esc(d.n)}</b><small>${esc(d.p)} · ${esc(d.t)} · ${P(d.b)} · ${d.d}d</small></button>`;
const inScope=(d,p)=>(!p.prov||norm(d.p).includes(p.prov))&&(!p.reg||d.g==p.reg);
function score(d,p){const dn=norm(d.n+" "+(d.desc||""));return(p.types.includes(d.t)?5:0)+p.acts.filter(a=>d.a.includes(a)).length*3+(p.month&&d.mo.includes(p.month)?3:0)+(p.pop!=null&&(d.o==1)==!!p.pop?2:0)+(d.o?1:0)+p.kw.filter(w=>dn.includes(w)).length*4+(p.words||[]).filter(w=>dn.includes(w)).length*3+star(d)*.2}
function rec(p,center){let base=live().filter(d=>inScope(d,p)&&(p.budget==null||d.b<=p.budget)&&(!center||(hav(center,d)<=120)));
 const has={month:p.month!=null,pop:p.pop!=null,acts:p.acts.length>0,days:p.days!=null,types:p.types.length>0},off=new Set(),relaxed=[];
 const ok=d=>(off.has("types")||!has.types||p.types.includes(d.t))&&(off.has("acts")||!has.acts||p.acts.some(a=>d.a.includes(a)))&&(off.has("days")||!has.days||d.d<=p.days)&&(off.has("month")||!has.month||d.mo.includes(p.month))&&(off.has("pop")||!has.pop||(d.o==1)==!!p.pop);
 let res=base.filter(ok);
 for(const k of["month","pop","acts","days","types"]){if(res.length>=3)break;if(!has[k])continue;off.add(k);relaxed.push(k);res=base.filter(ok)}
 const bits=[];if(p.types.length)bits.push(p.types.join("/").toLowerCase());if(p.acts.length)bits.push(p.acts.map(a=>A[a].toLowerCase()).join("/"));
 if(center)bits.push("near "+center.n);else if(p.prov)bits.push("in "+p.provLabel);else if(p.reg)bits.push("in "+G[p.reg]);
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
 if(/\b(cost|price|how much|expensive)\b/.test(t))return`${esc(d.n)} costs about <b>${P(d.b)}</b> per person for ${d.d} day${d.d>1?"s":""}. This is a rough estimate.`;
 if(/\b(similar|alternatives|places like|something like)\b/.test(t))return`Similar to ${esc(d.n)}:`+similar(d);
 if(/\b(near|nearby|around|close to|things to do|what to do)\b/.test(t))return nearby(d,60);
 const mn=p.month!=null?`<br><b>${MN[p.month-1]}</b> is ${d.mo.includes(p.month)?"within":"outside"} its best months.`:"";
 return`<b>${esc(d.n)}</b> <span class="xc-tag">${esc(d.t)}</span><br>${esc(d.p)} · ${esc(G[d.g])}<br>${esc(d.desc||"")}<br>About ${P(d.b)} for ${d.d} day${d.d>1?"s":""}. Best months: ${rng(d)}.${mn}<br>Good for: ${esc(d.a.map(a=>A[a]).join(", "))}.<button class="xc-act" data-xcd="${d.i}">Open details</button><button class="xc-act" data-xct="${d.i}">${st.trip.includes(d.i)?"Remove from trip":"Add to my trip"}</button>`}
function merge(p,t){let m=p;
 const topic=p.types.length||p.acts.length||p.kw.length||p.prov||p.reg,fresh=/\b(plan|itinerary|build)\b/.test(t),cue=/^(and|also|what about|how about|only|but|with|in|for|under|cheaper|more|less|make it|change)\b/.test(t);
 if(ctx&&(cue||(!topic&&!fresh))){m={...ctx};["types","acts","kw","words"].forEach(k=>{if(p[k].length)m[k]=p[k]});["prov","provLabel","reg","budget","days","month","pop"].forEach(k=>{if(p[k]!=null&&p[k]!=="")m[k]=p[k]});if(p.prov)m.reg=null;if(p.reg)m.prov=null}
 if(p.cheapen){const base=m.budget||(lastRes&&lastRes.length?lastRes[Math.floor(lastRes.length/2)].b:6000);m.budget=Math.max(1500,Math.round(base*.7/500)*500)}
 ctx=m;return m}
function reply(text){const raw=String(text).trim(),t=norm(raw);nextQ=null;if(!t)return"Type a question and I will help.";
 if(/^(hi|hello|hey|kumusta|good (morning|afternoon|evening))\b/.test(t)&&t.split(" ").length<=4)return"Hi! Tell me your budget, region, activity or month, or ask about a place.";
 if(/\b(thanks|thank you|salamat)\b/.test(t))return"You're welcome! Ask me anything else about your trip.";
 if(/\b(start over|reset|clear)\b/.test(t)){ctx=null;lastRes=null;shown=0;nextQ=DEFQ;return"Okay, fresh start. What kind of trip are you after?"}
 if(/\b(help|what can you do)\b/.test(t)){nextQ=DEFQ;return"I can suggest places by budget, region, type, activity or month, answer questions about a place (how to get there, best months, tips, cost), plan a trip by days and budget, and share general travel tips."}
 if(/\b(near me|closest to me)\b/.test(t)){const b=$("nearBtn");b&&b.click();return"I switched the destination list to sort by distance from you. Your browser may ask for location access."}
 if(/^(more|show more|next|another)$/.test(t)||/\bshow more\b/.test(t))return more();
 const p0=parse(raw),hit=findDest(t);
 if(hit)return destAns(hit,t,p0);
 const fq=FAQ.find(f=>f[0].test(t));
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
document.body.insertAdjacentHTML("beforeend",`<button id="xcb" aria-label="Open travel chatbot">💬<span> Ask Destinify</span></button><div id="xc" hidden role="dialog" aria-label="Destinify travel assistant"><div class="xc-h"><div><b>Destinify assistant</b><small>Answers from the catalog. Prices are rough estimates.</small></div><button id="xcc" aria-label="Close chat">✕</button></div><div id="xcm" class="xc-m" aria-live="polite"></div><div id="xcq" class="xc-q"></div><div class="xc-i"><input id="xci" placeholder="Ask about places, budget, months…" aria-label="Message" autocomplete="off"><button id="xcs">Send</button></div></div>`);
const bot=h=>{const m=$("xcm");m.insertAdjacentHTML("beforeend",`<div class="xc-b">${h}</div>`);m.scrollTop=m.scrollHeight};
const setQ=a=>{$("xcq").innerHTML=(a||DEFQ).map(x=>`<button data-xcs="${esc(x)}">${esc(x)}</button>`).join("")};
let greeted=false;
function openC(){$("xc").hidden=false;$("xcb").hidden=true;if(!greeted){greeted=true;bot("Hi! I'm the Destinify assistant. Ask for ideas by budget, region, activity or month, ask about a specific place, or have me plan a trip. I answer from this site's catalog, so times and prices are estimates.");setQ(DEFQ)}$("xci").focus()}
function closeC(){$("xc").hidden=true;$("xcb").hidden=false}
function send(text){text=String(text).trim();if(!text)return;$("xcm").insertAdjacentHTML("beforeend",`<div class="xc-u">${esc(text)}</div>`);$("xci").value="";
 setTimeout(()=>{let h;try{h=reply(text)}catch(e){h="Sorry, something went wrong. Try asking a different way.";nextQ=DEFQ}bot(h);setQ(nextQ)},180)}
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
window.DXC={reply,parse,searchAll,findDest,q:()=>nextQ};
})();
