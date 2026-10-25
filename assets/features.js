/* Destinify v4 add-on: accounts + roles, review system, adjustable match weights, auto trip builder, admin panel.
   Prototype storage is localStorage; each LS() call maps to a PHP/MySQL endpoint in the full build. */
(()=>{
const LS=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem(k));localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}};
const sha=async s=>{try{return[...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,"0")).join("")}catch(e){return btoa(s)}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let users=LS("dusers")||[],U=null,rev=LS("drev")||{},cus=LS("dcustom")||[],hid=LS("dhide")||[];
const adm=()=>U&&U.role=="admin",V=id=>$(id).value.trim();
const addD=o=>D.push({i:D.length,n:o.n,p:o.p,g:o.g,la:o.la,ln:o.ln,t:o.t,b:o.b,d:o.d,a:o.a,o:o.o,mo:o.mo&&o.mo.length?o.mo:[11,12,1,2,3,4,5],desc:o.desc});
cus.forEach(addD);
const _l=list;list=()=>_l().filter(d=>!hid.includes(d.n));
const _s=save;save=()=>{_s();if(U){U.trip=st.trip.slice();LS("dusers",users)}};
document.body.insertAdjacentHTML("beforeend",'<div class="modal fade" id="xm" tabindex="-1"><div class="modal-dialog modal-dialog-centered modal-dialog-scrollable"><div class="modal-content" id="xmc"></div></div></div>');
document.querySelector(".navr").prepend(Object.assign(document.createElement("button"),{id:"xAdm",className:"btn btn-l",hidden:true,textContent:"Admin"}),Object.assign(document.createElement("button"),{id:"xAuth",className:"btn btn-l",textContent:"Sign in"}));
$("xAdm").dataset.x="adm";$("xAuth").dataset.x="auth";
const M=()=>bootstrap.Modal.getOrCreateInstance($("xm"));
const show=(t,h,o={})=>{$("xmc").className="modal-content"+(o.cls?" "+o.cls:"");$("xmc").innerHTML=`<div class="mh" style="background:var(--t900)"><button class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>${o.icon?`<span class="xmi">${o.icon}</span>`:""}<h3>${t}</h3>${o.sub?`<p>${o.sub}</p>`:""}</div><div class="xp">${h}</div>`;$("xmc").scrollTop=0;M().show()};
const nav=()=>{$("xAuth").textContent=U?`${U.n} · Sign out`:"Sign in";$("xAdm").hidden=!adm()};
/* ---------- v14: icons, sign-in view, confirm dialog, password helpers ---------- */
const ICP={user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',eye:'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',eyeoff:'<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',mail:'<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22,6 12,13 2,6"/>',phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',home:'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',wallet:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><circle cx="17" cy="15" r="1"/>',shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',heart:'<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',star:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',map:'<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',check:'<polyline points="20 6 9 17 4 12"/>',alert:'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',plus:'<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',search:'<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',chart:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',pin:'<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',msg:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',trash:'<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>',activity:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',db:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',grid:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',compass:'<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',x:'<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',info:'<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',key:'<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>',sliders:'<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>'};
const IC={};for(const k in ICP)IC[k]=`<svg class="xi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICP[k]}</svg>`;
const dbOn=()=>!!(window.DBAPI&&DBAPI.on);
const pwField=(id,ph,ac,meter)=>`<div class="xfw"><div class="xfld xpwf"><span class="xfi">${IC.lock}</span><input id="${id}" type="password" class="form-control" placeholder="${ph}" autocomplete="${ac}" aria-label="${ph}" data-pw${meter?" data-meter":""}><button type="button" class="xeye" data-xeye aria-label="Show password" aria-pressed="false" title="Show password">${IC.eye}</button></div><small class="xcaps" hidden>Caps Lock is on</small>${meter?`<div class="xpwm" data-meter-for="${id}" data-lv="0"><span><i></i><i></i><i></i><i></i></span><small></small></div>`:""}</div>`;
const authView=(m,api)=>{const up=m=="up",p=api?"b":"x",a=api?"data-xb":"data-x";
 const tab=(on,label,act)=>`<button type="button" class="${on?"on":""}" role="tab" aria-selected="${on}"${on?"":` ${a}="${act}"`}>${label}</button>`;
 return `<div class="xauth"><div class="xseg" role="tablist">${tab(!up,"Sign in","swi")}${tab(up,"Create account","swu")}</div><div id="xerr" class="xerr" role="alert"></div>
 ${up?`<div class="xfld"><span class="xfi">${IC.heart}</span><input id="${p}n" class="form-control" placeholder="Display name" aria-label="Display name" autocomplete="nickname"></div>`:""}
 <div class="xfld"><span class="xfi">${IC.user}</span><input id="${p}u" class="form-control" placeholder="Username" aria-label="Username" autocomplete="username" autocapitalize="none" spellcheck="false"></div>
 ${pwField(p+"p","Password (6+ characters)",up?"new-password":"current-password",up)}
 <button type="button" class="btn btn-c xcta" ${a}="${up?"up":"in"}" data-primary>${up?"Create my account":"Sign in"}</button>
 ${api&&!up?`<p class="xfine xforgot"><button type="button" class="xlnk" data-xb="forgot">Forgot password?</button></p>`:""}
 <p class="xfine">${IC.shield}<span>${api?"Your account is stored in the Destinify database. Passwords are hashed, never saved as plain text.":"Demo accounts live in this browser only. Sign in to the live site for saved trips."}</span></p></div>`};
const authOpen=(m,api)=>{show(m=="in"?"Sign in":"Create account",authView(m,api),{cls:"xv xv-auth",icon:IC.compass,sub:m=="in"?"Welcome back. Pick up your trip where you left off.":"Save trips, favorites and reviews across visits."});setTimeout(()=>{const i=document.querySelector("#xmc .xauth input");i&&i.focus()},380)};
const authH=m=>authOpen(m,false);
/* Forgot password: the visitor sends a request, the admin makes a one-time link for them (api-bridge.js posts it). */
const forgotOpen=()=>{show("Forgot password",`<div class="xauth"><div id="xerr" class="xerr" role="alert"></div><div id="xok" class="xok" role="status" hidden></div><div id="xfpf">
 <p class="note">Type your username. We pass your request to the site admin, who sends you a private link to choose a new password. The link works once and lasts 1 hour.</p>
 <div class="xfld"><span class="xfi">${IC.user}</span><input id="fu" class="form-control" placeholder="Username" aria-label="Username" autocomplete="username" autocapitalize="none" spellcheck="false"></div>
 <button type="button" class="btn btn-c xcta" data-xb="fpsend" data-primary>Send my request</button></div>
 <p class="xfine"><button type="button" class="xlnk" data-xb="swi">Back to sign in</button></p></div>`,{cls:"xv xv-auth",icon:IC.key,sub:"We'll help you get back in."});setTimeout(()=>{const i=$("fu");i&&i.focus()},380)};
/* Reset password: opened from the private link the admin gave the user (?reset=TOKEN). */
const resetOpen=t=>{window.DXRESET=t;show("Choose a new password",`<div class="xauth"><div id="xerr" class="xerr" role="alert"></div>
 ${pwField("rp1","New password (6+ characters)","new-password",true)}${pwField("rp2","Type it again","new-password",false)}
 <button type="button" class="btn btn-c xcta" data-xb="rpsave" data-primary>Save new password</button>
 <p class="xfine">${IC.shield}<span>This link works once. After saving, sign in with your new password.</span></p></div>`,{cls:"xv xv-auth",icon:IC.key,sub:"Pick something you will remember."});setTimeout(()=>{const i=$("rp1");i&&i.focus()},380)};
document.body.insertAdjacentHTML("beforeend",'<div id="xcf" class="xcfo" hidden><div class="xcfb" role="alertdialog" aria-modal="true" aria-labelledby="xcft" aria-describedby="xcfm"><div class="xcfi" id="xcfi"></div><h4 id="xcft"></h4><p id="xcfm"></p><div class="xcfa"><button type="button" class="btn btn-l" id="xcfn"></button><button type="button" class="btn btn-c" id="xcfy"></button></div></div></div>');
let xcfBusy=null;
function confirmD(o){if(xcfBusy)return xcfBusy;return xcfBusy=new Promise(res=>{const el=$("xcf"),yes=$("xcfy"),no=$("xcfn"),prev=document.activeElement;
 $("xcfi").innerHTML=o.icon||IC.alert;$("xcft").textContent=o.title||"Are you sure?";$("xcfm").innerHTML=o.msg||"";yes.textContent=o.ok||"Confirm";no.textContent=o.cancel||"Cancel";
 yes.classList.toggle("xdanger",!!o.danger);
 const fin=v=>{el.classList.remove("on");document.removeEventListener("keydown",key,true);setTimeout(()=>{el.hidden=true},180);xcfBusy=null;try{prev&&prev.focus&&prev.focus()}catch(e){}res(v)};
 const key=e=>{if(e.key=="Escape"){e.preventDefault();e.stopPropagation();fin(false)}else if(e.key=="Tab"){const f=[no,yes],i=f.indexOf(document.activeElement);e.preventDefault();f[(i+(e.shiftKey?-1:1)+2)%2].focus()}};
 yes.onclick=()=>fin(true);no.onclick=()=>fin(false);el.onclick=e=>{if(e.target===el)fin(false)};
 document.addEventListener("keydown",key,true);el.hidden=false;requestAnimationFrame(()=>{el.classList.add("on");no.focus()})})}
async function signOut(){if(!U)return false;
 const ok=await confirmD({icon:IC.logout,title:"Sign out of Destinify?",msg:`You're signed in as <b>${esc(U.n)}</b>. ${dbOn()?"Your trip, favorites and reviews stay saved to your account.":"Your trip and favorites stay saved in this browser."} You can sign back in any time.`,ok:"Sign out",cancel:"Stay signed in"});
 if(!ok)return false;
 if(dbOn()){await DBAPI.post("auth.php?action=logout");LS("dsess","");location.reload();return true}
 U=null;LS("dsess","");st.trip=[];nav();render();return true}
const pwScore=p=>{if(!p)return 0;if(p.length<6)return 1;const n=(p.length>=10)+(/[a-z]/.test(p)&&/[A-Z]/.test(p))+/\d/.test(p)+/[^A-Za-z0-9]/.test(p);return n<=1?2:n==2?3:4};
const PWL=["","Too short","Okay","Good","Strong"];
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-xeye]");if(!b)return;e.preventDefault();const i=b.parentElement.querySelector("input"),on=i.type=="password";i.type=on?"text":"password";b.innerHTML=on?IC.eyeoff:IC.eye;b.setAttribute("aria-pressed",on);const l=on?"Hide password":"Show password";b.setAttribute("aria-label",l);b.title=l;i.focus()});
document.addEventListener("input",e=>{const t=e.target;if(!t.matches||!t.matches("[data-meter]"))return;const m=document.querySelector(`[data-meter-for="${t.id}"]`);if(!m)return;const l=pwScore(t.value);m.dataset.lv=l;m.querySelector("small").textContent=PWL[l]});
const caps=e=>{const t=e.target;if(!t.matches||!t.matches("[data-pw]")||!e.getModifierState)return;const c=t.closest(".xfw").querySelector(".xcaps");if(c)c.hidden=!e.getModifierState("CapsLock")};
document.addEventListener("keydown",caps);document.addEventListener("keyup",caps);
document.addEventListener("keydown",e=>{if(e.key!="Enter"||e.isComposing)return;const t=e.target;if(!t.matches||!t.matches(".xauth input"))return;const b=t.closest(".xauth").querySelector("[data-primary]");if(b){e.preventDefault();b.click()}});
function login(u){U=u;LS("dsess",u.u);st.trip=(u.trip||[]).filter(i=>D[i]);nav();render()}
async function auth(m){const u=V("xu").toLowerCase(),p=$("xp").value,e=t=>$("xerr").textContent=t;
 if(!u||p.length<6)return e("Enter a username and a password of 6+ characters.");
 const h=await sha(p),f=users.find(x=>x.u==u);
 if(m=="in"){if(!f||f.p!=h)return e("Wrong username or password.");login(f)}
 else{if(f)return e("That username is taken.");const n={u,n:V("xn")||u,role:"traveler",p:h,trip:st.trip.slice()};users.push(n);LS("dusers",users);login(n)}
 M().hide()}
(async()=>{
 const s=LS("dsess"),f=users.find(x=>x.u==s);if(f)login(f)})();
/* weights */
$("ac").parentElement.insertAdjacentHTML("afterend",`<details class="grp" style="display:block"><summary style="cursor:pointer;font-weight:600;color:var(--soft)">Fine-tune how matches are scored</summary><div class="xw mt-3">${[["t","Type"],["a","Activities"],["b","Budget"],["du","Trip length"],["s","Season"]].map(([k,n])=>`<div><label>${n}: <b id="xw${k}">${Math.round(MX[k])}</b>%</label><input type="range" min="1" max="60" value="${W[k]}" data-w="${k}"></div>`).join("")}</div><p class="note">Weights are rescaled to total 100%. Defaults: ${["t","a","b","du","s"].map(k=>DW[k]).join(" / ")}.</p></details>`);
document.addEventListener("input",e=>{const k=e.target.dataset.w;if(!k)return;W[k]=+e.target.value;norm();LS("dw",W);for(const x in W)$("xw"+x).textContent=Math.round(MX[x]);render()});
/* reviews */
const avg=i=>{const r=rev[i]||[];return r.length?r.reduce((s,x)=>s+x.r,0)/r.length:0};
let rvPhoto="",rvAll=false,rvEd=null,rvKeep=false;
const okPic=p=>typeof p=="string"&&(/^data:image\/(jpeg|png|webp);base64,/.test(p)||/^api\/review_photo\.php\?id=\d+(&v=\d+)?$/.test(p));
const canEdit=x=>!!U&&(dbOn()?!!x.mine:x.u==U.n);
const canDel=x=>!!U&&(adm()||(dbOn()?!!x.mine:x.u==U.n));
const revItem=(x,k,i)=>`<div class="info xrvi"><b>${esc(x.u)}</b> · ${"★".repeat(x.r)}${x.t?` · <small>${new Date(x.t).toLocaleDateString()}</small>`:""}${x.e?` · <small class="xedtd">edited</small>`:""}${canEdit(x)?`<button type="button" class="xlnk xrvd xrve" data-x="rvedit" data-id="${i}" data-k="${k}" aria-label="Edit your review">${IC.edit}Edit</button>`:""}${canDel(x)?`<button type="button" class="xlnk xrvd" data-x="rvdel" data-id="${i}" data-k="${k}" aria-label="Delete this review">${IC.trash}Delete</button>`:""}<p>${esc(x.c)}</p>${okPic(x.p)?`<img class="xrvp" data-x="rvzoom" src="${esc(x.p)}" alt="Photo from ${esc(x.u)}'s review" loading="lazy" tabindex="0" role="button" aria-label="Enlarge photo">`:""}</div>`;
const revH=d=>{const r=rev[d.i]||[],all=r.map((x,k)=>({x,k})).reverse(),shown=rvAll?all:all.slice(0,5);return `<h4>TRAVELER REVIEWS${r.length?` · ${avg(d.i).toFixed(1)} ★ (${r.length})`:""}</h4>${shown.map(o=>revItem(o.x,o.k,d.i)).join("")||'<p class="note">No reviews yet.</p>'}${all.length>5?`<button type="button" class="xlnk" data-x="rvall" data-id="${d.i}">${rvAll?"Show fewer reviews":"Show all "+all.length+" reviews"}</button>`:""}${U?(()=>{const ed=rvEd&&rvEd.i==d.i?(rev[d.i]||[])[rvEd.k]:null,sel=ed?ed.r:5;return `${ed?'<h4 class="xedh4">EDIT YOUR REVIEW</h4>':""}<div class="ctl"><label>Rating <select id="xrs">${[5,4,3,2,1].map(n=>`<option${n==sel?" selected":""}>${n}</option>`).join("")}</select></label></div><textarea id="xrt" class="form-control" rows="3" style="display:block;width:100%;min-height:0;resize:vertical" maxlength="300" placeholder="Share your experience">${ed?esc(ed.c):""}</textarea><div class="xrvu"><label class="btn btn-l xrvb">${IC.camera}${ed?"Change photo":"Add a photo (optional)"}<input type="file" id="xrvf" accept="image/*" hidden></label><span id="xrvpv">${ed&&rvKeep&&okPic(ed.p)?`<img class="xrvp sm" src="${esc(ed.p)}" alt="Your photo"><button type="button" class="xlnk" data-x="rvkx">Remove photo</button>`:""}</span></div><div id="xrmsg" class="note xrmsg" role="alert"></div><div class="xrvbtns"><button class="btn btn-c mt-2" data-x="rv" data-id="${d.i}" id="xrpost">${ed?"Save changes":"Post review"}</button>${ed?'<button type="button" class="btn btn-l mt-2" data-x="rvcancel">Cancel</button>':""}</div>`})():'<p class="note">Sign in to post a review.</p>'}`};
const drawRev=i=>{const el=$("xrev");if(el)el.innerHTML=revH(D[i])};
const rvMsg=t=>{const m=$("xrmsg");if(m)m.textContent=t};
/* Shrinks a chosen photo to a small JPEG (long side 1000 px) so it saves quickly and fits in storage. */
function shrinkPhoto(file){return new Promise((res,rej)=>{if(!/^image\/(jpeg|png|webp|gif|heic|heif)$/i.test(file.type)&&!/^image\//.test(file.type))return rej("Please choose an image file.");
 if(file.size>15e6)return rej("That photo is too big. Choose one under 15 MB.");
 const url=URL.createObjectURL(file),img=new Image();
 img.onload=()=>{URL.revokeObjectURL(url);const m=Math.min(1,1000/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.max(1,Math.round(img.width*m));c.height=Math.max(1,Math.round(img.height*m));
  const g=c.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,c.width,c.height);g.drawImage(img,0,0,c.width,c.height);
  let q=.82,out=c.toDataURL("image/jpeg",q);while(out.length>450000&&q>.4){q-=.1;out=c.toDataURL("image/jpeg",q)}
  out.length>600000?rej("That photo is still too large after shrinking. Try a different one."):res(out)};
 img.onerror=()=>{URL.revokeObjectURL(url);rej("That file could not be read as a picture.")};img.src=url})}
async function editRev(i){const c=V("xrt"),btn=$("xrpost"),o=(rev[i]||[])[rvEd.k];rvMsg("");
 if(!o){rvEd=null;return drawRev(i)}
 if(!c)return rvMsg("Write a short comment first.");
 const old={...o};if(btn)btn.disabled=true;
 try{
  if(dbOn()){const body={action:"edit",id:o.id,rating:+$("xrs").value,comment:c};
   if(rvPhoto)body.photo=rvPhoto;else if(!rvKeep&&o.p)body.photo="";
   const r=await DBAPI.post("reviews.php",body);if(!r.ok){if(btn)btn.disabled=false;return rvMsg(r.error||"Could not save your changes.")}
   o.r=+$("xrs").value;o.c=c;o.e=1;if(r.p)o.p=r.p;else delete o.p}
  else{o.r=+$("xrs").value;o.c=c;o.e=1;if(rvPhoto)o.p=rvPhoto;else if(!rvKeep)delete o.p}
  if(LS("drev",rev)===null){Object.keys(o).forEach(k=>delete o[k]);Object.assign(o,old);if(btn)btn.disabled=false;return rvMsg("This browser has no room left to save the change. Try without a photo.")}
 }catch(e){if(btn)btn.disabled=false;return rvMsg("Something went wrong. Please try again.")}
 rvEd=null;rvPhoto="";rvKeep=false;drawRev(i);render()}
async function postRev(i){if(rvEd&&rvEd.i==i)return editRev(i);const c=V("xrt"),btn=$("xrpost");rvMsg("");
 if(!c)return rvMsg("Write a short comment first.");
 const o={u:U.n,r:+$("xrs").value,c,t:Date.now()};if(btn)btn.disabled=true;
 try{
  if(dbOn()){const r=await DBAPI.post("reviews.php",{destination_id:DBAPI.ids[i],rating:o.r,comment:c,photo:rvPhoto});
   if(!r.ok){if(btn)btn.disabled=false;return rvMsg(r.error||"Could not post your review.")}
   o.id=r.id;o.mine=true;if(r.p)o.p=r.p}
  else if(rvPhoto)o.p=rvPhoto;
  (rev[i]=rev[i]||[]).push(o);
  if(LS("drev",rev)===null){rev[i].pop();if(btn)btn.disabled=false;return rvMsg("This browser has no room left to save the review. Try without a photo.")}
 }catch(e){if(btn)btn.disabled=false;return rvMsg("Something went wrong. Please try again.")}
 rvPhoto="";drawRev(i);render()}
async function delRev(i,k){const o=(rev[i]||[])[k];if(!o)return;
 if(!await confirmD({title:"Delete this review?",msg:(adm()&&!(dbOn()?o.mine:o.u==U.n)?"The review":"Your review")+" and its photo will be removed for everyone. This can't be undone.",ok:"Delete review",danger:1,icon:IC.trash}))return;
 if(dbOn()){if(!o.id)return rvMsg("This review is still saving. Try again in a moment.");const r=await DBAPI.post("reviews.php",{action:"delete",id:o.id});if(!r.ok)return rvMsg(r.error||"Could not delete the review.")}
 const n=(rev[i]||[]).indexOf(o);if(n<0)return;rev[i].splice(n,1);LS("drev",rev);drawRev(i);render()}
document.addEventListener("change",async e=>{const f=e.target;if(f.id!="xrvf"||!f.files[0])return;rvMsg("");
 try{rvPhoto=await shrinkPhoto(f.files[0]);$("xrvpv").innerHTML=`<img class="xrvp sm" src="${rvPhoto}" alt="Your photo"><button type="button" class="xlnk" data-x="rvpx">Remove photo</button>`}
 catch(m){rvPhoto="";$("xrvpv").innerHTML="";rvMsg(String(m))}f.value=""});
const _od=openDetail;openDetail=i=>{rvPhoto="";rvAll=false;rvEd=null;rvKeep=false;_od(i);$("dmc").insertAdjacentHTML("beforeend",`<div class="dsc" id="xrev">${revH(D[i])}</div>`)};
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
 if(x=="auth"){if(U)signOut();else authH("in")}
 else if(x=="swu")authH("up");else if(x=="swi")authH("in");else if(x=="in"||x=="up")auth(x);
 else if(x=="adm")admH();else if(x=="add")addDest();
 else if(x=="hide"&&adm()){const n=$("ah").value.replace(" (hidden)","");hid=hid.includes(n)?hid.filter(h=>h!=n):[...hid,n];LS("dhide",hid);render();admH()}
 else if(x=="csv"&&adm()){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv([["Name","Province","Type","Budget","Days","Popular","Avg rating","Reviews","Times in trips"],...D.map(d=>[d.n,d.p,d.t,d.b,d.d,d.o?"yes":"no",avg(d.i).toFixed(1),(rev[d.i]||[]).length,users.filter(u=>(u.trip||[]).includes(d.i)).length])])],{type:"text/csv"}));a.download="destinify-report.csv";a.click()}
 else if(x=="build")build();
 else if(x=="rv"&&U)postRev(+t.dataset.id);
 else if(x=="rvdel"&&U)delRev(+t.dataset.id,+t.dataset.k);
 else if(x=="rvall"){rvAll=!rvAll;drawRev(+t.dataset.id)}
 else if(x=="rvpx"){rvPhoto="";$("xrvpv").innerHTML=""}
 else if(x=="rvedit"&&U){const i=+t.dataset.id,k=+t.dataset.k,o=(rev[i]||[])[k];if(!o||!canEdit(o))return;rvEd={i,k};rvPhoto="";rvKeep=!!okPic(o.p);drawRev(i);const f=$("xrt");if(f){f.scrollIntoView({behavior:"smooth",block:"center"});f.focus({preventScroll:true})}}
 else if(x=="rvcancel"){const i=rvEd?rvEd.i:st.cur;rvEd=null;rvPhoto="";rvKeep=false;drawRev(i)}
 else if(x=="rvkx"){rvKeep=false;$("xrvpv").innerHTML=""}
 else if(x=="rvzoom")t.classList.toggle("big")});
document.addEventListener("keydown",e=>{if((e.key=="Enter"||e.key==" ")&&e.target.matches&&e.target.matches('img[data-x="rvzoom"]')){e.preventDefault();e.target.classList.toggle("big")}});
window.DX={avg,rev:()=>rev,drawRev,forgotOpen,resetOpen,U:()=>U,show,M,V,LS,esc,hid:()=>hid,users:()=>users,saveUsers:()=>LS("dusers",users),sha,nav,ic:IC,confirm:confirmD,signOut,authOpen,pwField,pwScore};
render();
})();
