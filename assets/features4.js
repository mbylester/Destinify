/* Destinify v7 add-on: drag-and-drop trip order, travel-time estimates, day-by-day planner,
   best-month heatmap + "should I go this week?", smarter "because you liked X" recommendations. */
(()=>{
const{LS,esc}=DX;
const HRS=h=>{if(h<1)return Math.max(10,Math.round(h*12)*5)+" min";const r=Math.round(h*2)/2;return r+(r==1?" hr":" hrs")};
/* rough travel-time model: not real schedules */
function est(a,b){const km=hav(a,b);
 if(km<=25){const h=km/25+.2;return{h,l:`about ${HRS(h)} by road`}}
 if(km>350||a.g!=b.g)return{h:4,l:"about 4 hrs by flight, with airport time"};
 const sea=a.t=="Island"||b.t=="Island"||a.g=="V",h=km/40*1.25+(sea?1.5:0);
 return{h,l:`about ${HRS(h)} by ${sea?"bus or van and ferry":"bus or van"}`}}
/* trip panel: drag order + travel times */
const _rt=renderTrip;renderTrip=()=>{_rt();const T=st.trip;if(!T.length)return;let tot=0;
 document.querySelectorAll("#tripBody .stop").forEach((r,k)=>{r.draggable=true;r.classList.add("xdrag");r.dataset.k=k;
  if(k<T.length-1){const e=est(D[T[k]],D[T[k+1]]);tot+=e.h;r.insertAdjacentHTML("afterend",`<div class="xtv">↓ ${e.l} <i>(estimate)</i></div>`)}});
 $("tripBody").insertAdjacentHTML("beforeend",`<div class="xbox"><h4>PLAN BY DAY</h4><p class="note">${T.length>1?`Estimated travel between stops: about ${HRS(tot)} in total. `:""}Drag stops to reorder them, or open the planner to spread the trip across days.</p><button class="btn btn-d" data-x4="plan">Open day planner</button></div>`)};
let dk=null;const tb=$("tripBody"),clr=()=>document.querySelectorAll(".xdrag").forEach(r=>{r.style.opacity="";r.classList.remove("over")});
tb.addEventListener("dragstart",e=>{const r=e.target.closest(".xdrag");if(!r)return;dk=+r.dataset.k;e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",dk);r.style.opacity=.4});
tb.addEventListener("dragend",()=>{dk=null;clr()});
tb.addEventListener("dragover",e=>{const r=e.target.closest(".xdrag");if(r&&dk!=null){e.preventDefault();document.querySelectorAll(".xdrag.over").forEach(x=>x.classList.remove("over"));r.classList.add("over")}});
tb.addEventListener("drop",e=>{const r=e.target.closest(".xdrag");if(!r||dk==null)return;e.preventDefault();const to=+r.dataset.k;if(to!=dk){const[m]=st.trip.splice(dk,1);st.trip.splice(to,0,m);save();render()}dk=null});
/* day planner: every stop becomes one chip per suggested day; drag chips between days */
let plan,dc=null;const sig=()=>st.trip.join(","),stop=c=>D[+c.split(":")[0]],dayOf=c=>plan.days.findIndex(d=>d.includes(c));
function getPlan(){const p=LS("dplan");if(p&&p.sig==sig()){plan=p;return}
 plan={sig:sig(),days:[]};st.trip.forEach(i=>{for(let k=0;k<D[i].d;k++)plan.days.push([i+":"+k])});LS("dplan",plan)}
function dayStats(di){const cs=plan.days[di],prev=plan.days.slice(0,di).reverse().find(x=>x.length),all=[...(prev?[prev[prev.length-1]]:[]),...cs];let tr=0;
 for(let k=1;k<all.length;k++){const a=stop(all[k-1]),b=stop(all[k]);if(a!=b)tr+=est(a,b).h}
 return{act:cs.length*5,tr,ct:cs.reduce((s,c)=>s+cost(stop(c))/stop(c).d,0)}}
const chipH=c=>{const d=stop(c),k=+c.split(":")[1];return `<div class="xchip" draggable="true" data-chip="${c}"><b>${esc(d.n)}</b><small>${d.d>1?`day ${k+1} of ${d.d}`:esc(d.p)} · ${P(Math.round(cost(d)/d.d/100)*100)}</small><span><button data-x4="mv" data-ch="${c}" data-dir="-1" aria-label="Move to earlier day">←</button><button data-x4="mv" data-ch="${c}" data-dir="1" aria-label="Move to later day">→</button></span></div>`};
function planH(){getPlan();const keep=$("xmc").scrollTop;let tc=0,tt=0;
 const days=plan.days.map((cs,di)=>{const x=dayStats(di),hrs=x.act+x.tr,cls=hrs>12?"bad":hrs>10?"warn":"";tc+=x.ct;tt+=x.tr;
  return `<div class="xday ${cls}" data-day="${di}"><div class="xdh"><b>Day ${di+1}</b><small>${cs.length?`${HRS(x.act)} activities · ${x.tr?HRS(x.tr)+" travel · ":""}${P(Math.round(x.ct/100)*100)}`:"Free day"}</small></div>${hrs>12?`<div class="xwarn">Overpacked: about ${HRS(hrs)} of activities and travel. Move something to another day.</div>`:""}<div class="xzone">${cs.map(chipH).join("")||'<span class="note">Drop a stop here</span>'}</div></div>`}).join("");
 DX.show("Day-by-day planner",`<p class="note">${plan.days.length} days · about ${P(Math.round(tc/100)*100)} for ${st.pax} traveler${st.pax>1?"s":""} · ${HRS(tt)} of estimated travel. Drag stops between days (or use the arrows). Times are rough estimates, not schedules.</p>${days}<div class="macts"><button class="btn btn-l" data-x4="addday">Add a day</button><button class="btn btn-l" data-x4="clean">Remove empty days</button><button class="btn btn-l" data-x4="reset">Reset</button><button class="btn btn-c" data-x4="apply">Apply order to my trip</button></div>`);$("xmc").scrollTop=keep}
function move(c,to,before){plan.days.forEach(d=>{const k=d.indexOf(c);if(k>-1)d.splice(k,1)});while(to>=plan.days.length)plan.days.push([]);
 const z=plan.days[to],bi=before?z.indexOf(before):-1;bi>-1?z.splice(bi,0,c):z.push(c);LS("dplan",plan);planH()}
document.addEventListener("dragstart",e=>{const c=e.target.closest&&e.target.closest(".xchip");if(c){dc=c.dataset.chip;e.dataTransfer.setData("text/plain",dc)}});
document.addEventListener("dragover",e=>{if(dc&&e.target.closest&&e.target.closest(".xday"))e.preventDefault()});
document.addEventListener("drop",e=>{const d=e.target.closest&&e.target.closest(".xday");if(!dc||!d)return;e.preventDefault();const b=e.target.closest(".xchip");move(dc,+d.dataset.day,b&&b.dataset.chip!=dc?b.dataset.chip:null);dc=null});
/* best-month heatmap + this-week verdict */
const heat=d=>`<div class="xhm">${MN.map((m,k)=>{const n=k+1,on=d.mo.includes(n),sh=!on&&(d.mo.includes(n%12+1)||d.mo.includes((n+10)%12+1));return `<div class="${on?"g":sh?"a":"r"}${n==NOW?" now":""}"><b>${m}</b><i>${n>=6&&n<=11?"☔":""}</i></div>`}).join("")}</div><div class="xleg">Green: best months · Amber: shoulder · Grey: off-peak · ☔ typhoon season (roughly Jun–Nov) · Outline: this month</div>`;
function verdict(d,j){const c=j.current,u=j.daily,rain=Math.round(u.precipitation_probability_max.reduce((a,b)=>a+(b||0),0)/u.time.length),storm=u.weather_code.some(x=>x>=95)||c.wind_speed_10m>40,w=[];let p=0;
 if(d.mo.includes(NOW)){p+=2;w.push("it is in its best season")}else{p-=1;w.push("it is outside its best months")}
 if(rain<=30){p+=2;w.push(`low rain chance (about ${rain}%)`)}else if(rain<=60){w.push(`moderate rain chance (about ${rain}%)`)}else{p-=2;w.push(`high rain chance (about ${rain}%)`)}
 if(storm){p-=3;w.push("storms or strong winds in the forecast")}
 const k=p>=3?["go","Good to go this week"]:p>=0?["maybe","Possible, but pack for changing weather"]:["wait","Better to wait or pick another week"];
 return `<div class="xvd ${k[0]}"><b>${k[1]}</b><br><small>Because ${w.join(", ")}. A rough guide from the 5-day forecast, so check PAGASA for typhoons.</small></div>`}
const _od=openDetail;openDetail=i=>{_od(i);const d=D[i],a=$("xwx");if(!a)return;
 a.insertAdjacentHTML("afterend",`<div class="dsc" id="xhm"><h4>WHEN TO GO</h4>${heat(d)}<div id="xvd" class="xvd">Checking this week's forecast…</div></div>`);
 DX.wx(d).then(j=>{if(st.cur==i&&$("xvd"))$("xvd").outerHTML=verdict(d,j)}).catch(()=>{$("xvd")&&($("xvd").textContent="Forecast unavailable, so there is no this-week verdict right now.")})};
/* recommendations: trip, viewed places and your own reviews shape the picks; reviews also break ranking ties */
const _l=list;list=()=>{const r=_l();return st.sort=="match"?r.sort((a,b)=>b.s-a.s||DX.avg(b.i)-DX.avg(a.i)||b.o-a.o):r};
function recs2(){const el=$("xrec");if(!el)return;const U=DX.U(),R=DX.rev(),w={},src={};
 const add=(i,v,s)=>{w[i]=(w[i]||0)+v;if(v>0&&!src[i])src[i]=s};
 st.trip.forEach(i=>add(i,2,"trip"));(LS("dview")||[]).slice(0,5).forEach(i=>add(i,1,"viewed"));
 if(U)Object.entries(R).forEach(([i,a])=>a.filter(x=>x.u==U.n).forEach(x=>{if(x.r>=4){add(i,3,"liked");src[i]="liked"}else if(x.r<=2)w[i]=(w[i]||0)-3}));
 const seeds=Object.keys(w).filter(i=>D[i]&&w[i]).map(Number);if(!seeds.length){el.innerHTML="";return}
 const sim=(a,b)=>a.a.filter(x=>b.a.includes(x)).length+(a.t==b.t?2:0)+(a.g==b.g?.5:0)+(hav(a,b)<150?1:0);
 const out=D.filter(d=>!w[d.i]&&!DX.hid().includes(d.n)).map(d=>{let tot=0,best=null,bv=0;
  seeds.forEach(i=>{const v=sim(D[i],d)*w[i];tot+=v;if(w[i]>0&&v>bv){bv=v;best=i}});const n=(R[d.i]||[]).length;
  return{d,best,v:tot+(n?(DX.avg(d.i)-3)*2:0)+(d.s||0)/40,n}}).filter(o=>o.best!=null).sort((a,b)=>b.v-a.v).slice(0,4);
 const why=i=>{const n=D[i].n,s=src[i];return s=="liked"?`Because you liked ${n}`:s=="trip"?`Because ${n} is in your trip`:`Because you viewed ${n}`};
 el.innerHTML=`<div class="xbox" style="margin:0 0 20px"><h4>PICKED FOR YOU</h4><div class="xrg">${out.map(o=>`<div class="xrc"><button class="chip" data-d="${o.d.i}">${o.d.n}${o.n?" · ★ "+DX.avg(o.d.i).toFixed(1):""}</button><small>${why(o.best)}</small></div>`).join("")}</div></div>`}
const _r=render;render=()=>{_r();recs2()};
/* clicks */
document.addEventListener("click",e=>{const t=e.target.closest("[data-x4]");if(!t)return;const x=t.dataset.x4;
 if(x=="plan"){getPlan();bootstrap.Offcanvas.getInstance($("tripPanel"))?.hide();planH()}
 else if(!plan)return;
 else if(x=="mv"){const c=t.dataset.ch,di=dayOf(c);if(di>-1)move(c,Math.max(0,di+ +t.dataset.dir))}
 else if(x=="addday"){plan.days.push([]);LS("dplan",plan);planH()}
 else if(x=="clean"){plan.days=plan.days.filter(d=>d.length);if(!plan.days.length)plan.days=[[]];LS("dplan",plan);planH()}
 else if(x=="reset"){LS("dplan",null);getPlan();planH()}
 else if(x=="apply"){const o=[];plan.days.flat().forEach(c=>{const i=+c.split(":")[0];if(!o.includes(i))o.push(i)});st.trip=o;save();render();plan.sig=sig();LS("dplan",plan);DX.M().hide()}});
render();
})();
