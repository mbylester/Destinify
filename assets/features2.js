/* Destinify v5 add-on: preference quiz, picked-for-you, top-rated sort, ratings on cards, calendar (.ics) + print export, profile, offline (PWA). */
(()=>{
const{LS,V,esc}=DX;
/* top rated sort + stars on cards */
$("ps").add(new Option("Top rated","rated"));
const _l=list;list=()=>{if(st.sort!="rated")return _l();st.sort="match";const r=_l();st.sort="rated";return r.sort((a,b)=>DX.avg(b.i)-DX.avg(a.i)||b.s-a.s)};
const _c=cardH;cardH=d=>{const n=(DX.rev()[d.i]||[]).length,h=_c(d);return n?h.replace('<div class="tags">',`<div class="tags"><span class="tag">★ ${DX.avg(d.i).toFixed(1)} (${n})</span>`):h};
/* picked for you */
$("grid").insertAdjacentHTML("beforebegin",'<div id="xrec"></div>');
const view=()=>LS("dview")||[];
const _od=openDetail;openDetail=i=>{_od(i);LS("dview",[i,...view().filter(x=>x!=i)].slice(0,12))};
function recs(){const seed=[...new Set([...st.trip,...view().slice(0,5)])].filter(i=>D[i]),el=$("xrec");
 if(!seed.length){el.innerHTML="";return}
 const fa={},ft={};seed.forEach(i=>{D[i].a.forEach(a=>fa[a]=(fa[a]||0)+1);ft[D[i].t]=(ft[D[i].t]||0)+1});
 const r=D.filter(d=>!seed.includes(d.i)&&!DX.hid().includes(d.n)).map(d=>({d,v:d.a.reduce((s,a)=>s+(fa[a]||0),0)+2*(ft[d.t]||0)+(d.s||0)/50})).sort((a,b)=>b.v-a.v).slice(0,4);
 el.innerHTML=`<div class="xbox" style="margin:0 0 20px"><h4>PICKED FOR YOU · based on your trip and places you opened</h4><div class="tags" style="margin:0">${r.map(o=>`<button class="chip" data-d="${o.d.i}">${o.d.n}</button>`).join("")}</div></div>`}
const _r=render;render=()=>{_r();recs();$("xProf").hidden=!DX.U()};
/* quiz */
const QS=[["What kind of trip?","t",TYPES.map(t=>[t,t]),1],["What do you want to do?","a",Object.entries(A).map(([k,v])=>[v,k]),1],["Budget per person?","b",[["Up to ₱4,000",4000],["Up to ₱8,000",8000],["Up to ₱15,000",15000],["₱25,000+",30000]],0],["How long?","d",[["1–2 days","1-2"],["3–4 days","3-4"],["5+ days","5-9"],["Any length","any"]],0],["When are you going?","m",[["Any month",0],...MN.map((m,i)=>[m,i+1])],0]];
let qi=0,qa;
const quiz=()=>{const[q,k,o,mu]=QS[qi];DX.show(`Find my match · ${qi+1}/${QS.length}`,`<h5>${q}</h5><div class="tags my-3">${o.map(([l,v])=>`<button class="chip${(mu?qa[k].has(String(v)):String(qa[k])===String(v))?" on":""}" data-q="${v}">${l}</button>`).join("")}</div><p class="note">${mu?"Pick any that fit, or skip.":"Pick one, or skip."}</p><div class="macts"><button class="btn btn-l" data-x2="back">Back</button><button class="btn btn-c" data-x2="next">${qi==QS.length-1?"Show my matches":"Next"}</button></div>`)};
function applyQ(){st.types=qa.t;st.acts=qa.a;if(qa.b!=null)st.b=+qa.b;if(qa.d)st.d=qa.d;if(qa.m!=null)st.mon=+qa.m;st.shown=12;
 $("rb").value=st.b;$("pd").value=st.d;$("pm").value=st.mon;
 document.querySelectorAll("[data-t]").forEach(b=>b.classList.toggle("on",st.types.has(b.dataset.t)));document.querySelectorAll("[data-a]").forEach(b=>b.classList.toggle("on",st.acts.has(b.dataset.a)));
 DX.M().hide();render();$("results").scrollIntoView()}
document.querySelector(".cta").insertAdjacentHTML("beforeend",'<button class="btn btn-o" data-x2="quiz">Take the quiz</button>');
/* export */
const _rt=renderTrip;renderTrip=()=>{_rt();if(!st.trip.length)return;$("tripBody").insertAdjacentHTML("beforeend",`<div class="xbox"><h4>EXPORT</h4><label class="note">Trip start date</label><input id="xsd" type="date" class="form-control" value="${new Date(Date.now()+12096e5).toISOString().slice(0,10)}"><div class="macts mt-2"><button class="btn btn-d" data-x2="ics">Add to calendar (.ics)</button><button class="btn btn-l" data-x2="print">Print itinerary</button></div></div>`)};
function ics(){const d0=new Date(($("xsd").value||"2026-12-01")+"T00:00:00Z"),f=x=>x.toISOString().slice(0,10).replace(/-/g,""),z=s=>s.replace(/[,;]/g,m=>"\\"+m),stamp=new Date().toISOString().replace(/[-:]|\.\d+/g,"");
 let t=d0.getTime();const L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Destinify//EN"];
 st.trip.forEach(i=>{const d=D[i],a=new Date(t),b=new Date(t+864e5*d.d);t=b.getTime();L.push("BEGIN:VEVENT",`UID:destinify-${i}-${f(a)}@destinify`,"DTSTAMP:"+stamp,"DTSTART;VALUE=DATE:"+f(a),"DTEND;VALUE=DATE:"+f(b),"SUMMARY:"+z(d.n),"LOCATION:"+z(d.p+", Philippines"),"DESCRIPTION:"+z(`About ${P(cost(d))} for ${st.pax} traveler(s). ${d.go||""}`),"END:VEVENT")});
 L.push("END:VCALENDAR");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([L.join("\r\n")],{type:"text/calendar"}));a.download="destinify-trip.ics";a.click()}
function prn(){const w=window.open("","_blank");if(!w)return;
 w.document.write(`<title>Destinify itinerary</title><body style="font-family:sans-serif;max-width:720px;margin:30px auto"><h1>My Destinify trip</h1>`+st.trip.map(i=>{const d=D[i];return `<h2>${d.n}, ${d.p}</h2><p>${d.d} days · about ${P(cost(d))} for ${st.pax}</p><ol>${plan(d).map(x=>`<li>${x}</li>`).join("")}</ol>${d.go?`<p><b>Getting there:</b> ${d.go}</p>`:""}${d.tip?`<p><b>Tip:</b> ${d.tip}</p>`:""}`}).join("")+"<script>print()<\/script>");w.document.close()}
/* profile */
document.querySelector(".navr").prepend(Object.assign(document.createElement("button"),{id:"xProf",className:"btn btn-l",hidden:true,textContent:"Profile"}));$("xProf").dataset.x2="prof";
const prof=()=>{const u=DX.U();DX.show("My profile",`<div id="xerr" class="note" style="color:var(--coral-d)"></div><label class="note">Display name</label><input id="pn" class="form-control mb-2" value="${esc(u.n)}"><label class="note">New password (blank keeps current)</label><input id="pw" type="password" class="form-control mb-3"><p class="note">${u.role} · ${(u.trip||[]).length} saved stops · ${Object.values(DX.rev()).flat().filter(r=>r.u==u.n).length} reviews</p><button class="btn btn-c" data-x2="psave">Save</button>`)};
async function psave(){const u=DX.U(),n=V("pn"),p=$("pw").value;if(!n)return;if(p&&p.length<6)return $("xerr").textContent="Password needs 6+ characters.";u.n=n;if(p)u.p=await DX.sha(p);DX.saveUsers();DX.nav();DX.M().hide()}
document.addEventListener("click",e=>{const t=e.target.closest("[data-x2],[data-q]");if(!t)return;
 if(t.dataset.q!==undefined){const[,k,,mu]=QS[qi],v=t.dataset.q;if(mu)qa[k].has(v)?qa[k].delete(v):qa[k].add(v);else qa[k]=v;return quiz()}
 const x=t.dataset.x2;
 if(x=="quiz"){qi=0;qa={t:new Set,a:new Set};quiz()}else if(x=="next"){if(qi<QS.length-1){qi++;quiz()}else applyQ()}else if(x=="back"){if(qi>0){qi--;quiz()}}
 else if(x=="ics")ics();else if(x=="print")prn();else if(x=="prof")prof();else if(x=="psave")psave()});
render();
if("serviceWorker" in navigator&&/^https?:/.test(location.protocol))navigator.serviceWorker.register("sw.js").catch(()=>{});
})();
