/* Destinify v4 add-on: accounts + roles, review system, adjustable match weights, auto trip builder, admin panel.
   Prototype storage is localStorage; each LS() call maps to a PHP/MySQL endpoint in the full build. */
(()=>{
const LS=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem(k));localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}};
const sha=async s=>{try{return[...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,"0")).join("")}catch(e){return btoa(s)}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let users=LS("dusers")||[],U=null,rev=LS("drev")||{},cus=LS("dcustom")||[],hid=LS("dhide")||[];
const adm=()=>U&&U.role=="admin",V=id=>$(id).value.trim();
const addD=o=>D.push({i:D.length,n:o.n,p:o.p,g:o.g,la:o.la,ln:o.ln,t:o.t,b:o.b,d:o.d,a:o.a,o:o.o,mo:[11,12,1,2,3,4,5],desc:o.desc});
cus.forEach(addD);
const _l=list;list=()=>_l().filter(d=>!hid.includes(d.n));
const _s=save;save=()=>{_s();if(U){U.trip=st.trip.slice();LS("dusers",users)}};
document.body.insertAdjacentHTML("beforeend",'<div class="modal fade" id="xm" tabindex="-1"><div class="modal-dialog modal-dialog-centered modal-dialog-scrollable"><div class="modal-content" id="xmc"></div></div></div>');
document.querySelector(".navr").prepend(Object.assign(document.createElement("button"),{id:"xAdm",className:"btn btn-l",hidden:true,textContent:"Admin"}),Object.assign(document.createElement("button"),{id:"xAuth",className:"btn btn-l",textContent:"Sign in"}));
$("xAdm").dataset.x="adm";$("xAuth").dataset.x="auth";
const M=()=>bootstrap.Modal.getOrCreateInstance($("xm"));
const show=(t,h)=>{$("xmc").innerHTML=`<div class="mh" style="background:var(--t900)"><button class="btn-close" data-bs-dismiss="modal"></button><h3>${t}</h3></div><div class="xp">${h}</div>`;M().show()};
const nav=()=>{$("xAuth").textContent=U?`${U.n} · Sign out`:"Sign in";$("xAdm").hidden=!adm()};
const authH=m=>show(m=="in"?"Sign in":"Create account",`<div id="xerr" class="note" style="color:var(--coral-d)"></div>${m=="up"?'<input id="xn" class="form-control mb-2" placeholder="Display name">':""}<input id="xu" class="form-control mb-2" placeholder="Username"><input id="xp" type="password" class="form-control mb-3" placeholder="Password (6+ characters)"><button class="btn btn-c" data-x="${m}">${m=="in"?"Sign in":"Sign up"}</button> <button class="btn btn-l" data-x="${m=="in"?"swu":"swi"}">${m=="in"?"Create account":"I have an account"}</button><p class="note mt-3">Demo accounts live in this browser only. Admin demo login: admin / admin123.</p>`);
function login(u){U=u;LS("dsess",u.u);st.trip=(u.trip||[]).filter(i=>D[i]);nav();render()}
async function auth(m){const u=V("xu").toLowerCase(),p=$("xp").value,e=t=>$("xerr").textContent=t;
 if(!u||p.length<6)return e("Enter a username and a password of 6+ characters.");
 const h=await sha(p),f=users.find(x=>x.u==u);
 if(m=="in"){if(!f||f.p!=h)return e("Wrong username or password.");login(f)}
 else{if(f)return e("That username is taken.");const n={u,n:V("xn")||u,role:"traveler",p:h,trip:st.trip.slice()};users.push(n);LS("dusers",users);login(n)}
 M().hide()}
(async()=>{if(!users.some(x=>x.role=="admin")){users.push({u:"admin",n:"Admin",role:"admin",p:await sha("admin123"),trip:[]});LS("dusers",users)}
 const s=LS("dsess"),f=users.find(x=>x.u==s);if(f)login(f)})();
/* weights */
$("ac").parentElement.insertAdjacentHTML("afterend",`<details class="grp" style="display:block"><summary style="cursor:pointer;font-weight:600;color:var(--soft)">Fine-tune how matches are scored</summary><div class="xw mt-3">${[["t","Type"],["a","Activities"],["b","Budget"],["du","Trip length"],["s","Season"]].map(([k,n])=>`<div><label>${n}: <b id="xw${k}">${Math.round(MX[k])}</b>%</label><input type="range" min="1" max="60" value="${W[k]}" data-w="${k}"></div>`).join("")}</div><p class="note">Weights are rescaled to total 100%. Defaults: 30 / 25 / 20 / 10 / 15.</p></details>`);
document.addEventListener("input",e=>{const k=e.target.dataset.w;if(!k)return;W[k]=+e.target.value;norm();LS("dw",W);for(const x in W)$("xw"+x).textContent=Math.round(MX[x]);render()});
/* reviews */
const avg=i=>{const r=rev[i]||[];return r.length?r.reduce((s,x)=>s+x.r,0)/r.length:0};
const revH=d=>{const r=rev[d.i]||[];return `<h4>TRAVELER REVIEWS${r.length?` · ${avg(d.i).toFixed(1)} ★ (${r.length})`:""}</h4>${r.slice(-5).reverse().map(x=>`<div class="info"><b>${esc(x.u)}</b> · ${"★".repeat(x.r)}<p>${esc(x.c)}</p></div>`).join("")||'<p class="note">No reviews yet.</p>'}${U?`<div class="ctl"><label>Rating <select id="xr">${[5,4,3,2,1].map(n=>`<option>${n}</option>`).join("")}</select></label></div><textarea id="xc" class="form-control" rows="2" maxlength="300" placeholder="Share your experience"></textarea><button class="btn btn-c mt-2" data-x="rv" data-id="${d.i}">Post review</button>`:'<p class="note">Sign in to post a review.</p>'}`};
const _od=openDetail;openDetail=i=>{_od(i);$("dmc").insertAdjacentHTML("beforeend",`<div class="dsc" id="xrev">${revH(D[i])}</div>`)};
/* auto trip builder */
const _rt=renderTrip;renderTrip=()=>{_rt();$("tripBody").insertAdjacentHTML("beforeend",`<div class="xbox"><h4>BUILD A TRIP FOR ME</h4><div class="xg"><input id="xdy" type="number" min="1" max="30" value="7" class="form-control" aria-label="Days"><input id="xbd" type="number" min="1000" step="500" value="${st.b*3}" class="form-control" aria-label="Total budget per person"></div><p class="note">Days, then total budget per person (PHP). Picks nearby high-scoring places.</p><button class="btn btn-d" data-x="build">Build trip</button></div>`)};
function build(){const days=+V("xdy"),bud=+V("xbd"),c=D.filter(d=>!hid.includes(d.n)).map(d=>(d.s=score(d),d)).sort((a,b)=>b.s-a.s).slice(0,45);
 const out=[];let dd=0,cs=0;
 while(1){const l=out[out.length-1],n=c.find(d=>!out.includes(d)&&dd+d.d<=days&&cs+d.b<=bud&&(!l||hav(l,d)<=350));if(!n)break;out.push(n);dd+=n.d;cs+=n.b}
 if(out.length){st.trip=out.map(d=>d.i);save();render()}}
/* admin */
const csv=r=>r.map(x=>x.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
function admH(){if(!adm())return;const ds=D.filter(d=>!hid.includes(d.n));
 show("Admin dashboard",`<div class="xg"><div class="xbox"><b>${users.length}</b> users</div><div class="xbox"><b>${ds.length}</b> live destinations (${cus.length} custom, ${hid.length} hidden)</div><div class="xbox"><b>${Object.values(rev).flat().length}</b> reviews</div><div class="xbox"><b>${users.reduce((s,u)=>s+(u.trip||[]).length,0)}</b> saved stops</div></div>
 <div class="xbox"><h4>ADD DESTINATION</h4><div class="xg"><input id="an" class="form-control" placeholder="Name"><input id="ap" class="form-control" placeholder="Province"><select id="ag" class="form-select">${Object.entries(G).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select><select id="at" class="form-select">${TYPES.map(t=>`<option>${t}</option>`).join("")}</select><input id="ab" type="number" class="form-control" placeholder="Budget (PHP)"><input id="ad" type="number" class="form-control" placeholder="Days"><input id="ala" type="number" step="any" class="form-control" placeholder="Latitude"><input id="aln" type="number" step="any" class="form-control" placeholder="Longitude"></div><select id="aa" multiple class="form-select mt-2" size="4">${Object.entries(A).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select><textarea id="ads" class="form-control mt-2" rows="2" placeholder="Description"></textarea><label class="note"><input type="checkbox" id="ao"> Popular</label><div id="xerr" class="note" style="color:var(--coral-d)"></div><button class="btn btn-c" data-x="add">Add</button></div>
 <div class="xbox"><h4>HIDE / RESTORE A DESTINATION</h4><select id="ah" class="form-select mb-2">${D.map(d=>`<option>${esc(d.n)}${hid.includes(d.n)?" (hidden)":""}</option>`).join("")}</select><button class="btn btn-l" data-x="hide">Toggle visibility</button></div>
 <div class="xbox"><h4>USERS</h4><table class="xt">${users.map(u=>`<tr><td>${esc(u.n)} (${esc(u.u)})</td><td>${u.role}</td><td>${(u.trip||[]).length} stops</td></tr>`).join("")}</table></div>
 <div class="macts mt-3"><button class="btn btn-d" data-x="csv">Download destination report (CSV)</button></div>`)}
function addDest(){if(!adm())return;const o={n:V("an"),p:V("ap"),g:$("ag").value,t:$("at").value,b:+V("ab"),d:+V("ad"),la:+V("ala"),ln:+V("aln"),a:[...$("aa").selectedOptions].map(x=>x.value),o:$("ao").checked?1:0,desc:V("ads")};
 if(!o.n||!o.p||!o.b||!o.d||!o.a.length||o.la<4||o.la>21||o.ln<116||o.ln>128||D.some(d=>d.n.toLowerCase()==o.n.toLowerCase()))return $("xerr").textContent="Fill every field with valid values (unique name, coordinates inside the Philippines, at least one activity).";
 cus.push(o);LS("dcustom",cus);addD(o);$("sN").textContent=D.length;buildInsights();render();admH()}
document.addEventListener("click",async e=>{const t=e.target.closest("[data-x]");if(!t)return;const x=t.dataset.x;
 if(x=="auth"){if(U){U=null;LS("dsess","");st.trip=[];nav();render()}else authH("in")}
 else if(x=="swu")authH("up");else if(x=="swi")authH("in");else if(x=="in"||x=="up")auth(x);
 else if(x=="adm")admH();else if(x=="add")addDest();
 else if(x=="hide"&&adm()){const n=$("ah").value.replace(" (hidden)","");hid=hid.includes(n)?hid.filter(h=>h!=n):[...hid,n];LS("dhide",hid);render();admH()}
 else if(x=="csv"&&adm()){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv([["Name","Province","Type","Budget","Days","Popular","Avg rating","Reviews","Times in trips"],...D.map(d=>[d.n,d.p,d.t,d.b,d.d,d.o?"yes":"no",avg(d.i).toFixed(1),(rev[d.i]||[]).length,users.filter(u=>(u.trip||[]).includes(d.i)).length])])],{type:"text/csv"}));a.download="destinify-report.csv";a.click()}
 else if(x=="build")build();
 else if(x=="rv"&&U){const i=+t.dataset.id,c=V("xc");if(!c)return;(rev[i]=rev[i]||[]).push({u:U.n,r:+$("xr").value,c});LS("drev",rev);$("xrev").innerHTML=revH(D[i])}});
window.DX={avg,rev:()=>rev,U:()=>U,show,M,V,LS,esc,hid:()=>hid,users:()=>users,saveUsers:()=>LS("dusers",users),sha,nav};
render();
})();
