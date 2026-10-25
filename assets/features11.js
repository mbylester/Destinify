/* Destinify v14 admin: the "Site content" tab of the Admin console.
   Lets the admin edit what visitors read without touching the code: festivals, every Travel tips tab, section headings,
   and the default match weights and budget. It saves through site-content.js (SC): to the database when the PHP backend is
   connected, or to this browser on static hosting. Loads after features10.js, which provides the admin console (ADMIN_EXT). */
(()=>{
const EXT=window.ADMIN_EXT,{esc,V}=DX;
if(!EXT||!window.SC||!window.TIPS||!window.FESTIVALS)return;
const I=DX.ic,toast=EXT.toast;
const SUBS=[["fest","Festivals"],["time","Best time"],["weather","Weather"],["money","Money"],["go","Getting around"],["pack","Packing"],["safe","Safety & health"],["culture","Culture & food"],["regions","Regions"],["text","Headings"],["match","Matching defaults"]];
const KL={list:"Bulleted list",table:"Two-column table",check:"Checklist",months:"Best months",seasons:"Seasons strip (automatic)",picks:"This month's picks (automatic)",regions:"Regional table (automatic)"};
const HINT={list:"One bullet per line. Use **bold** and [link text](https://example.com) if you like.",table:"One row per line, with the two columns split by a | sign, for example: Jeepney ride | 13–25",check:"One item per line. Visitors can tick them off.",months:"One row per line: a label, a | sign, then month numbers, for example: Surf: Siargao | 8,9,10,11"};
const TXT=[["fstT","Festivals section title","Festivals & events calendar",1],["fstS","Festivals section text","Pick a month to see what is on. Timing is typical and can shift each year, so confirm locally.",2],["insT","Insights section title","The catalog by the numbers",1],["insS","Insights section text","How the destinations break down by island group, region, type, and season.",2],["tipsT","Travel tips section title","Good to know before you go",1],["tipsS","Travel tips section text","Practical guidance for the Philippines: when to go, what it costs, how to get around, what to pack and how to stay safe. Always confirm details with official sources.",2]];
const WK=[["t","Destination type"],["a","Activities"],["b","Budget"],["du","Trip length"],["s","Season"]];
let CT="fest",CW=null,SNAP="";

/* ---------- headings that live outside the files this tab edits ---------- */
const insHeads=()=>{const h=document.querySelector("#insights .head h2"),p=document.querySelector("#insights .head p");
 if(h)h.textContent=SC.txt("insT",TXT[2][2]);if(p)p.textContent=SC.txt("insS",TXT[3][2])};
insHeads();SC.on(insHeads);

/* ---------- draft: what the admin is editing right now ---------- */
function load(k){CT=k;
 if(k=="fest")CW=FESTIVALS.raw();
 else if(k=="text"){CW={};TXT.forEach(([key,,def])=>CW[key]=SC.txt(key,def))}
 else if(k=="match"){CW={w:{...DW},b:+SC.data.b>=1000?+SC.data.b:8000};}
 else CW=TIPS.eff(k);
 SNAP=norm(CW)}
const rowsOf=()=>[...document.querySelectorAll(".xce[data-row]")];
const fval=(r,f)=>{const e=r.querySelector(`[data-f="${f}"]`);return e?(e.type=="checkbox"?e.checked:e.value):""};
const lines=v=>String(v).split("\n").map(x=>x.trim()).filter(Boolean);
/* copies what is typed on screen into CW, so re-drawing never loses it */
function read(){if(!document.querySelector("#xcont"))return;
 if(CT=="fest"){CW=rowsOf().map(r=>({n:fval(r,"n").trim(),d:fval(r,"d").trim(),m:[...r.querySelectorAll('.chip[data-x11="fmon"].on')].map(c=>+c.dataset.v),w:fval(r,"w").trim(),x:fval(r,"x").trim()}))}
 else if(CT=="text"){TXT.forEach(([key,,def])=>{const e=document.querySelector(`[data-t="${key}"]`);if(e)CW[key]=e.value.trim()})}
 else if(CT=="match"){WK.forEach(([k])=>{const e=document.querySelector(`[data-wk="${k}"]`);if(e)CW.w[k]=+e.value});const b=document.querySelector("[data-bud]");if(b)CW.b=+b.value}
 else{const old=CW.cards;CW={cards:rowsOf().map((r,k)=>{const c=old[k]||{};const o={...c,t:fval(r,"t").trim(),w:fval(r,"w")?1:0},n=fval(r,"n").trim();if(n)o.n=n;else delete o.n;if(r.querySelector('[data-f="l"]'))o.l=lines(fval(r,"l"));return o})}}}
const norm=o=>JSON.stringify(o,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).filter(([,x])=>!(x===0&&k===''||x===''||(x===0))).sort(([a],[b])=>a<b?-1:1)):v);
const dirty=()=>{try{read();return norm(CW)!=SNAP}catch(e){return false}};

/* ---------- panes ---------- */
const festUI=(f,k)=>`<div class="xce" data-row="${k}"><div class="xce-h"><b>Festival ${k+1}</b><button type="button" class="xlnk xdel" data-x11="frm" data-v="${k}">Remove</button></div>
 <div class="xg2"><div class="xff"><label class="xl">Festival name</label><input class="form-control" data-f="n" value="${esc(f.n)}" maxlength="80"></div>
 <div class="xff"><label class="xl">Destination</label><input class="form-control" data-f="d" list="xdlist" value="${esc(f.d)}" placeholder="Start typing a destination name" autocomplete="off"></div></div>
 <div class="xff"><label class="xl">When, in words</label><input class="form-control" data-f="w" value="${esc(f.w)}" maxlength="120" placeholder="e.g. Third Sunday of January"></div>
 <label class="xl">Months it appears in</label><div class="tags">${MN.map((m,j)=>`<button type="button" class="chip${f.m.includes(j+1)?" on":""}" data-x11="fmon" data-v="${j+1}" aria-pressed="${f.m.includes(j+1)}">${m}</button>`).join("")}</div>
 <div class="xff" style="margin-top:10px"><label class="xl">Short description</label><textarea class="form-control" data-f="x" rows="2" maxlength="300">${esc(f.x)}</textarea></div></div>`;
const cardUI=(c,k,n)=>{const auto=["seasons","picks","regions"].includes(c.k),ln=(c.l||[]).length;
 return `<div class="xce" data-row="${k}"><div class="xce-h"><span class="xpill add">${KL[c.k]||c.k}</span><span class="xce-b"><button type="button" class="xlnk" data-x11="cup" data-v="${k}"${k?"":" disabled"} aria-label="Move up">↑ Up</button><button type="button" class="xlnk" data-x11="cdn" data-v="${k}"${k<n-1?"":" disabled"} aria-label="Move down">↓ Down</button><button type="button" class="xlnk xdel" data-x11="crm" data-v="${k}">Remove</button></span></div>
 <div class="xff"><label class="xl">Title</label><input class="form-control" data-f="t" value="${esc(c.t||"")}" maxlength="80">${c.k=="picks"?'<small class="xhint">{month} becomes the current month name.</small>':""}</div>
 ${auto?"":`<div class="xff"><label class="xl">Content</label><textarea class="form-control" data-f="l" rows="${Math.min(16,Math.max(4,ln+1))}" spellcheck="true">${esc((c.l||[]).join("\n"))}</textarea><small class="xhint">${HINT[c.k]||""}</small></div>`}
 <div class="xff"><label class="xl">Note under the card <small class="xcnt">optional</small></label><textarea class="form-control" data-f="n" rows="2" maxlength="400">${esc(c.n||"")}</textarea></div>
 <label class="xsw"><input type="checkbox" data-f="w"${c.w?" checked":""}><span></span>Full width</label></div>`};
const addBar=()=>`<div class="xcadd"><span class="xl">Add a card:</span>${["list","table","check","months"].map(k=>`<button type="button" class="btn btn-l" data-x11="cadd" data-v="${k}">${I.plus}${KL[k]}</button>`).join("")}</div>`;
const body=()=>{
 if(CT=="fest")return `<datalist id="xdlist">${D.map(d=>`<option value="${esc(d.n)}">`).join("")}</datalist><p class="note">Each festival shows on the Festivals calendar for its months, and on the page of its destination (and of places within 150 km). Pick the destination from the list so the name matches exactly.</p>${CW.map(festUI).join("")||'<p class="note">No festivals yet.</p>'}<div class="xcadd"><button type="button" class="btn btn-l" data-x11="fadd">${I.plus}Add a festival</button></div>`;
 if(CT=="text")return `<p class="note">Leave a box empty to go back to the standard wording.</p>${TXT.map(([k,l,def,rows])=>`<div class="xff"><label class="xl">${l}</label>${rows==1?`<input class="form-control" data-t="${k}" value="${esc(CW[k])}" maxlength="120" placeholder="${esc(def)}">`:`<textarea class="form-control" data-t="${k}" rows="3" maxlength="300" placeholder="${esc(def)}">${esc(CW[k])}</textarea>`}</div>`).join("")}`;
 if(CT=="match")return `<p class="note">These are the starting values for people who open the site and have not changed their own sliders. Anyone who already moved a slider keeps their own setting (it is saved in their browser). The weights are rescaled so they always add up to 100%.</p>
  <div class="xce"><div class="xw">${WK.map(([k,n])=>`<div><label>${n}: <b data-wv="${k}">${CW.w[k]}</b></label><input type="range" min="1" max="60" value="${CW.w[k]}" data-wk="${k}" class="form-range"></div>`).join("")}</div>
  <div class="xff" style="margin-top:14px"><label class="xl">Starting budget per person: <b data-bv>${P(CW.b)}</b></label><input type="range" min="1000" max="30000" step="500" value="${CW.b}" data-bud class="form-range"></div></div>`;
 return `<p class="note">${CT=="regions"?"The regional table is calculated from your destinations, so edit a destination to change its numbers. You can change the title and the note here.":CT=="time"?"The seasons strip and this month's picks are calculated automatically. You can change their titles and notes, and edit the best-months rows.":"Reorder, rewrite, add or remove the cards on this tab."}</p>${CW.cards.map((c,k)=>cardUI(c,k,CW.cards.length)).join("")}${CT=="regions"?"":addBar()}`};
const pane=()=>{if(!CW)load(CT);
 return `<div id="xcont"><div class="xbox"><h4>${I.edit}Site content</h4><p class="note">Edit the text and lists visitors read. Changes show on the site as soon as you press Save. Photos, descriptions and tips for a single place are edited under Destinations.${SC.db?"":" <b>Static hosting:</b> content you save here is stored in this browser only. To change what every visitor sees, use the database version or edit the files."}</p>
 <div class="tags xcsub" role="tablist">${SUBS.map(([k,n])=>`<button type="button" class="chip${CT==k?" on":""}" role="tab" aria-selected="${CT==k}" data-x11="sub" data-v="${k}">${n}</button>`).join("")}</div></div>
 <div class="xbox"><div id="xerr" class="xerr" role="alert"></div>${body()}
 <div class="xsticky inl"><button type="button" class="btn btn-c" data-x11="save">${I.check}Save changes</button><button type="button" class="btn btn-l" data-x11="reset">Reset to the standard version</button></div></div></div>`};
EXT.tabs.push(["cont","Site content","edit"]);EXT.panes.cont=pane;

/* ---------- saving ---------- */
const say=t=>{const e=document.getElementById("xerr");if(e){e.textContent=t;if(t)e.scrollIntoView({block:"nearest"})}};
async function persist(mutate,done){const before=JSON.stringify(SC.data);mutate();
 if(JSON.stringify(SC.data).length>280000){restore(before);return say("That is more content than can be saved (about 280 KB). Shorten something and try again.")}
 const r=await SC.save();
 if(!r.ok){restore(before);return say(r.error||"Could not save.")}
 SC.emit();toast(done||"Saved. The site is updated.");load(CT);EXT.refresh()}
function restore(json){const o=JSON.parse(json);Object.keys(SC.data).forEach(k=>delete SC.data[k]);Object.assign(SC.data,o)}
function save(){read();
 if(CT=="fest"){
  for(let k=0;k<CW.length;k++){const f=CW[k],at=`Festival ${k+1}${f.n?` (${f.n})`:""}`;
   if(!f.n)return say(`${at}: add a name.`);
   if(/[<>]/.test(f.n+f.w+f.x))return say(`${at}: please leave out the < and > characters.`);
   if(!D.some(d=>d.n==f.d))return say(`${at}: pick the destination from the list so the name matches exactly.`);
   if(!f.m.length)return say(`${at}: choose at least one month.`)}
  return persist(()=>{SC.data.fest=CW.map(f=>({n:f.n,d:f.d,m:f.m.slice().sort((a,b)=>a-b),w:f.w,x:f.x}))})}
 if(CT=="text"){const t={};TXT.forEach(([k,,def])=>{const v=(CW[k]||"").trim();if(/[<>]/.test(v))t.bad=1;if(v&&v!=def)t[k]=v});
  if(t.bad)return say("Please leave out the < and > characters.");
  return persist(()=>{if(Object.keys(t).length)SC.data.text=t;else delete SC.data.text})}
 if(CT=="match"){const w={};for(const [k,n] of WK){w[k]=Math.round(+CW.w[k]);if(!(w[k]>=1&&w[k]<=60))return say(`${n}: choose a weight from 1 to 60.`)}
  const b=Math.round(+CW.b/500)*500;if(!(b>=1000&&b<=30000))return say("Choose a starting budget from ₱1,000 to ₱30,000.");
  const same=WK.every(([k])=>w[k]==DW0[k]);
  return persist(()=>{if(same)delete SC.data.w;else SC.data.w=w;if(b==8000)delete SC.data.b;else SC.data.b=b},"Saved. People who open the site next will start with these values.")}
 const cards=CW.cards;
 for(let k=0;k<cards.length;k++){const c=cards[k],at=`Card ${k+1}${c.t?` (${c.t})`:""}`;
  if(!c.t)return say(`${at}: add a title.`);
  if(/[<>]/.test(c.t+(c.n||"")+(c.l||[]).join(" ")))return say(`${at}: please leave out the < and > characters.`);
  if(["list","table","check","months"].includes(c.k)&&!(c.l||[]).length)return say(`${at}: add at least one line.`);
  if(c.k=="months"){const bad=c.l.findIndex(r=>{const q=r.indexOf("|");return q<0||!r.slice(q+1).split(/[,\s]+/).map(Number).some(m=>m>=1&&m<=12)});if(bad>=0)return say(`${at}: line ${bad+1} needs a label, a | sign and month numbers (1 to 12), like: Surf: Baler | 10,11,12,1,2`)}}
 return persist(()=>{SC.data.tips=SC.data.tips||{};SC.data.tips[CT]={cards:cards.map(c=>({k:c.k,t:c.t,w:c.w?1:0,...(c.n?{n:c.n}:{}),...(["seasons","picks","regions"].includes(c.k)?{}:{l:c.l})}))}})}
/* the weights the site ships with (before any admin change) */
const DW0={t:30,a:25,b:20,du:10,s:15};

async function reset(){
 if(!await DX.confirm({title:"Reset this tab?",msg:"Your changes on this tab will be thrown away and the standard version comes back for every visitor.",ok:"Reset to standard",danger:1,icon:I.alert}))return;
 persist(()=>{if(CT=="fest")delete SC.data.fest;else if(CT=="text")delete SC.data.text;else if(CT=="match"){delete SC.data.w;delete SC.data.b}else if(SC.data.tips){delete SC.data.tips[CT];if(!Object.keys(SC.data.tips).length)delete SC.data.tips}},"Reset to the standard version.")}

/* ---------- clicks ---------- */
const move=(a,k,d)=>{const j=k+d;if(j<0||j>=a.length)return;[a[k],a[j]]=[a[j],a[k]]};
document.addEventListener("click",async e=>{const t=e.target.closest&&e.target.closest("[data-x11]");if(!t)return;const x=t.dataset.x11,v=t.dataset.v;e.preventDefault();
 switch(x){
 case"sub":if(v==CT)return;if(dirty()&&!await DX.confirm({title:"Leave without saving?",msg:"You have changes on this tab that are not saved yet.",ok:"Leave without saving",cancel:"Keep editing",icon:I.alert}))return;load(v);EXT.refresh();break;
 case"fmon":{const on=!t.classList.contains("on");t.classList.toggle("on",on);t.setAttribute("aria-pressed",on);break}
 case"fadd":read();CW.push({n:"",d:"",m:[],w:"",x:""});EXT.refresh();setTimeout(()=>{const r=rowsOf().pop();if(r){r.scrollIntoView({behavior:"smooth",block:"center"});const i=r.querySelector("input");i&&i.focus({preventScroll:true})}},60);break;
 case"frm":read();CW.splice(+v,1);EXT.refresh();break;
 case"cadd":read();CW.cards.push({k:v,t:"",w:v=="table"||v=="months"?1:0,l:[]});EXT.refresh();setTimeout(()=>{const r=rowsOf().pop();if(r){r.scrollIntoView({behavior:"smooth",block:"center"});const i=r.querySelector("input");i&&i.focus({preventScroll:true})}},60);break;
 case"cup":read();move(CW.cards,+v,-1);EXT.refresh();break;
 case"cdn":read();move(CW.cards,+v,1);EXT.refresh();break;
 case"crm":read();CW.cards.splice(+v,1);EXT.refresh();break;
 case"save":save();break;
 case"reset":reset();break}});
document.addEventListener("input",e=>{const t=e.target;if(t.dataset&&t.dataset.wk){const o=document.querySelector(`[data-wv="${t.dataset.wk}"]`);if(o)o.textContent=t.value}
 else if(t.dataset&&t.dataset.bud!==undefined){const o=document.querySelector("[data-bv]");if(o)o.textContent=P(+t.value)}});
/* forget the draft whenever the console is opened again */
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest('[data-x="adm"]'))CW=null},true);
})();
