/* Destinify features13.js: passport, home sections, quick start, near me, email forms. Follows the site language (EN/TL). */
(function(){'use strict';
const API='api/',MONTH=new Date().getMonth()+1;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const store=st=>({g(k,d){try{const v=JSON.parse(st.getItem(k));return v==null?d:v}catch(e){return d}},s(k,v){try{st.setItem(k,JSON.stringify(v))}catch(e){}}});
const LS=store(localStorage),SS=store(sessionStorage);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const post=(f,b)=>fetch(API+f,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(r=>r.json());
let DEST=[],pos=SS.g('f11pos',null),ppDraw=null,lastRes=null;const visited=new Set(LS.g('f11visited',[]));

/* Language: English by default, Tagalog only when the site is set to Tagalog */
function lang(){
  try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/lang/i.test(k)){const v=String(localStorage.getItem(k)).toLowerCase();if(/tl|fil/.test(v))return'tl';if(/en/.test(v))return'en'}}}catch(e){}
  const l=(document.documentElement.lang||'').toLowerCase();return/^(tl|fil)/.test(l)?'tl':'en'}
const L={
en:{intro:'What do you want to do?',beach:'🏖️ Beach',hike:'⛰️ Hike',culture:'🏛️ Culture & food',skip:'Skip',near:'📍 Near me',pp:'🧳 Passport:',newT:"🆕 What's new",hotT:'🔥 Trending this month',been:"I've been here",done:'✓ Visited',away:n=>`📍 ${n} km away`,map:'Map',of:'of',ppT:'🧳 Travel Passport',ppC:(a,b)=>`You've visited ${a} of ${b}`,srch:'Search destinations…',qB:'Beaches & islands',qH:'Hiking & adventure',qC:'Culture & food',qT:l=>`✨ ${l}: picks for you`,nearT:'📍 Closest to you',noGeo:"Your browser doesn't support location.",denied:'Location is blocked. Allow it in your browser settings to see distances.',fT:'Forgot your password?',fP:"Enter your account's email and we'll send you a reset link.",fGo:'Send reset link',send:'Sending…',sent:'If an account uses that email, a reset link is on its way.',badEm:'Please enter a valid email.',fail:"Couldn't reach the server. Try again later.",noEm:'No email on your account? Contact the admin.',rT:'Set a new password',p1:'New password (8+ characters)',p2:'Repeat password',save:'Save password',short:'Password must be at least 8 characters.',mism:"Passwords don't match.",rOk:'Password updated. You can sign in now.',rBad:'This link has expired or was already used. Request a new one.',close:'Close'},
tl:{intro:'Ano ang gusto mong gawin?',beach:'🏖️ Mag-beach',hike:'⛰️ Mag-hike',culture:'🏛️ Kultura at pagkain',skip:'Laktawan',near:'📍 Malapit sa akin',pp:'🧳 Passport:',newT:'🆕 Ano ang bago',hotT:'🔥 Patok ngayong buwan',been:'Nakapunta na ako',done:'✓ Napuntahan',away:n=>`📍 ${n} km ang layo`,map:'Mapa',of:'sa',ppT:'🧳 Travel Passport',ppC:(a,b)=>`${a} sa ${b} ang napuntahan mo`,srch:'Hanapin ang destinasyon…',qB:'Beach at island hopping',qH:'Hiking at adventure',qC:'Kultura at pagkain',qT:l=>`✨ ${l} para sa iyo`,nearT:'📍 Pinakamalapit sa iyo',noGeo:'Hindi suportado ng browser mo ang lokasyon.',denied:'Hindi napayagan ang lokasyon. I-allow ito sa browser settings para makita ang layo.',fT:'Nakalimutan ang password?',fP:'Ilagay ang email ng account mo. Padadalhan ka namin ng reset link.',fGo:'Ipadala ang link',send:'Ipinapadala…',sent:'Kung may account sa email na iyon, may ipinadala kaming link.',badEm:'Maglagay ng tamang email.',fail:'Hindi maabot ang server. Subukan ulit mamaya.',noEm:'Walang email ang account mo? Makipag-ugnayan sa admin.',rT:'Magtakda ng bagong password',p1:'Bagong password (8+ character)',p2:'Ulitin ang password',save:'I-save',short:'Hindi bababa sa 8 character ang password.',mism:'Hindi magkapareho ang password.',rOk:'Napalitan na ang password. Pwede ka nang mag-sign in.',rBad:'Expired o nagamit na ang link. Humiling ng bago.',close:'Isara'}};
const t=(k,...a)=>{const v=L[lang()][k];return typeof v==='function'?v(...a):v};

/* Catalog: reads assets/data.js (name|province|group|lat|lng|type|budget|days|acts|popular|months) */
async function load(){
  const txt=await (await fetch('assets/data.js')).text();
  txt.split(/\r?\n/).forEach(l=>{const p=l.replace(/^[\s'"`]+|[\s'"`,;+\\]+$/g,'').split('|');
    if(p.length>=10){p[0]=p[0].replace(/^.*[`=]/,'').trim();const lat=+p[3],lng=+p[4];
      if(p[0]&&lat>4&&lat<22&&lng>115&&lng<128)DEST.push({i:DEST.length,n:p[0],prov:p[1],lat,lng,type:p[5],bud:+p[6]||0,act:p[8].split(' '),pop:p[9]==='1',m:(p[10]||'11-5').trim()});}});
}
const inSeason=d=>{const[a,b]=d.m.split('-').map(Number);return a<=b?MONTH>=a&&MONTH<=b:MONTH>=a||MONTH<=b};
const dist=d=>{const r=x=>x*Math.PI/180,a=Math.sin(r(d.lat-pos.lat)/2)**2+Math.cos(r(pos.lat))*Math.cos(r(d.lat))*Math.sin(r(d.lng-pos.lng)/2)**2;return 12742*Math.asin(Math.sqrt(a))};
const kmTxt=d=>{const k=dist(d);return t('away',k<10?k.toFixed(1):Math.round(k).toLocaleString())};
const gmap=d=>`https://www.google.com/maps/search/?api=1&query=${d.lat},${d.lng}`;

/* Dialog: opened inside the open Bootstrap modal (if any) so typing is not blocked by its focus trap */
function dlg(title,html,wide){const o=document.createElement('div');o.className='f11-ov';
  o.innerHTML=`<div class="f11-dlg${wide?' f11-wide':''}"><button class="f11-x" aria-label="${esc(t('close'))}">×</button><h3>${title}</h3>${html}</div>`;
  o.addEventListener('click',e=>{if(e.target===o||e.target.classList.contains('f11-x'))o.remove()});
  (document.querySelector('.modal.show')||document.body).appendChild(o);setTimeout(()=>{const i=$('input',o);i&&i.focus()},60);return o}

/* Passport */
function toggle(i){visited.has(i)?visited.delete(i):visited.add(i);LS.s('f11visited',[...visited]);sync()}
function sync(){
  $$('[data-f11v]').forEach(b=>{const on=visited.has(+b.dataset.f11v);b.classList.toggle('on',on);b.textContent=on?t('done'):t('been')});
  $$('.f11-cnt').forEach(e=>e.textContent=`${visited.size} ${t('of')} ${DEST.length}`);ppDraw&&ppDraw()}
function passport(){
  const o=dlg(t('ppT'),`<p class="f11-cnt2"></p><div class="f11-prog"><div id="f11-bar"></div></div><div id="f11-map"></div><input id="f11-q" class="f11-in" placeholder="${esc(t('srch'))}"><div id="f11-pl"></div>`,true);
  let map=null,layer=null;
  if(window.L&&window.L.map){map=L.map('f11-map').setView([12.5,122],5);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);layer=L.layerGroup().addTo(map);setTimeout(()=>map.invalidateSize(),60)}else $('#f11-map',o).remove();
  const draw=()=>{if(!document.body.contains(o)){ppDraw=null;return}
    $('.f11-cnt2',o).textContent=t('ppC',visited.size,DEST.length);$('#f11-bar',o).style.width=(DEST.length?visited.size/DEST.length*100:0)+'%';
    if(map){layer.clearLayers();const pts=[];visited.forEach(i=>{const d=DEST[i];if(d){pts.push([d.lat,d.lng]);L.circleMarker([d.lat,d.lng],{radius:6,color:'#d63384',fillOpacity:.8}).bindPopup(esc(d.n)).addTo(layer)}});if(pts.length&&!draw.fit){map.fitBounds(pts,{padding:[20,20],maxZoom:9});draw.fit=1}}
    const q=$('#f11-q',o).value.trim().toLowerCase();
    $('#f11-pl',o).innerHTML=DEST.filter(d=>!q||(d.n+' '+d.prov).toLowerCase().includes(q)).slice(0,80).map(d=>`<div class="f11-row"><div><div class="f11-t">${esc(d.n)}</div><div class="f11-s">${esc(d.prov)}</div></div><button class="f11-go ${visited.has(d.i)?'on':''}" data-f11v="${d.i}">${visited.has(d.i)?t('done'):t('been')}</button></div>`).join('')};
  $('#f11-q',o).addEventListener('input',draw);ppDraw=draw;draw()}

/* Mini cards and results */
const mini=d=>`<div class="f11-card"><div class="f11-t">${esc(d.n)}</div><div class="f11-s">${esc(d.prov)} · ${esc(d.type)} · ₱${d.bud.toLocaleString()}</div>${pos?`<div class="f11-km">${kmTxt(d)}</div>`:''}<button class="f11-go" data-f11v="${d.i}"></button> <a class="f11-s" href="${gmap(d)}" target="_blank" rel="noopener">${t('map')}</a></div>`;
function showRes(titleFn,list,scroll){lastRes={titleFn,list};const r=$('#f11-res');if(!r)return;r.innerHTML=`<h4>${titleFn()}</h4><div class="f11-list">${list.map(mini).join('')}</div>`;sync();if(scroll)r.scrollIntoView({behavior:'smooth',block:'nearest'})}

/* Home sections */
const Q={beach:{k:'qB',t:/Beach|Island|Diving|Surf/,a:['sw','sn','dv','sf','ih','rl']},hike:{k:'qH',t:/Mountain|Waterfall|Cave|Lake|Nature|Adventure/,a:['hk','cm','cy','cv','ad','kc']},culture:{k:'qC',t:/Heritage|City/,a:['cw','fd','ss','ph']}};
function quick(k){const q=Q[k];LS.s('f11seen',1);$('.f11-intro')?.remove();
  const list=DEST.map(d=>({d,s:(q.t.test(d.type)?3:0)+d.act.filter(a=>q.a.includes(a)).length+(inSeason(d)?2:0)+(d.pop?1:0)})).filter(x=>x.s>=3).sort((a,b)=>b.s-a.s).slice(0,8).map(x=>x.d);
  showRes(()=>t('qT',t(q.k)),list,true)}
function fresh(){let F=null;try{F=new Function('return typeof FEST!=="undefined"?FEST:null')()}catch(e){}
  const nx=MONTH%12+1,ev=(F||[]).filter(f=>[].concat(f.m).some(m=>m==MONTH||m==nx)).slice(0,4);
  const h=ev.map(f=>`<div class="f11-card"><div class="f11-t">🎉 ${esc(f.n)}</div><div class="f11-s">${esc(f.d||'')} · ${esc(f.w||'')}</div></div>`);
  h.push(...DEST.slice(-Math.max(2,6-h.length)).reverse().map(mini));$('#f11-new').innerHTML=h.join('')}
async function hot(){let ids=[];try{ids=((await fetch(API+'f11_track.php?top=1').then(r=>r.json())).top||[])}catch(e){}
  const out=ids.map(i=>DEST[i]).filter(Boolean);
  DEST.filter(d=>d.pop&&inSeason(d)).sort((a,b)=>((a.i*7+MONTH)%97)-((b.i*7+MONTH)%97)).forEach(d=>{if(out.length<6&&!out.includes(d))out.push(d)});
  const h=$('#f11-hot');if(h){h.innerHTML=out.slice(0,6).map(mini).join('');sync()}}
function mount(){let h=$('#f11-home');if(!h){h=document.createElement('section');h.id='f11-home';const f=$('footer');f?f.parentNode.insertBefore(h,f):document.body.appendChild(h)}return h}
function home(){const h=mount(),first=!LS.g('f11seen',0);
  h.innerHTML=`${first?`<div class="f11-intro"><h2>${t('intro')}</h2><div class="f11-big"><button data-f11q="beach">${t('beach')}</button><button data-f11q="hike">${t('hike')}</button><button data-f11q="culture">${t('culture')}</button></div><a href="#" data-f11skip>${t('skip')}</a></div>`:''}<div id="f11-res"></div><div class="f11-actions"><button class="f11-btn" data-f11near>${t('near')}</button><button class="f11-btn" data-f11pp>${t('pp')} <b class="f11-cnt"></b></button></div><div class="f11-cols"><div><h4>${t('newT')}</h4><div id="f11-new" class="f11-list"></div></div><div><h4>${t('hotT')}</h4><div id="f11-hot" class="f11-list"></div></div></div>`;
  fresh();hot();if(lastRes)showRes(lastRes.titleFn,lastRes.list,false);sync()}
function near(){if(!navigator.geolocation)return alert(t('noGeo'));
  navigator.geolocation.getCurrentPosition(p=>{pos={lat:p.coords.latitude,lng:p.coords.longitude};SS.s('f11pos',pos);
    showRes(()=>t('nearT'),[...DEST].sort((a,b)=>dist(a)-dist(b)).slice(0,8),true);kmRefresh()},()=>alert(t('denied')),{timeout:10000})}

/* Existing destination cards: add distance + "I've been here" */
const seenHit=new Set();
function track(i){if(seenHit.has(i))return;seenHit.add(i);post('f11_track.php',{idx:i}).catch(()=>{})}
function kmRefresh(){$$('.f11-bar').forEach(b=>{const d=DEST[+b.dataset.i];$('.f11-kmt',b).textContent=pos?kmTxt(d):''});$$('.f11-km').forEach(()=>{})}
function enhance(){if(!DEST.length)return;const by=new Map(DEST.map(d=>[d.n.toLowerCase(),d]));
  $$('.card:not([data-f11])').forEach(c=>{const h=$('.card-title,h3,h4,h5,h6',c);if(!h)return;const d=by.get(h.textContent.trim().toLowerCase());if(!d)return;
    c.dataset.f11=d.i;const b=document.createElement('div');b.className='f11-bar';b.dataset.i=d.i;
    b.innerHTML=`<span class="f11-kmt">${pos?kmTxt(d):''}</span><button class="f11-go" data-f11v="${d.i}"></button>`;h.parentElement.appendChild(b);
    c.addEventListener('click',()=>track(d.i))});sync()}

/* Email: forgot password, reset, feedback */
const okEmail=s=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
function forgot(){const o=dlg(t('fT'),`<p>${t('fP')}</p><input class="f11-in" type="email" id="f11-em" placeholder="email@example.com" autocomplete="email"><button class="f11-btn" id="f11-go">${t('fGo')}</button><p id="f11-msg" class="f11-s"></p><p class="f11-s">${t('noEm')}</p>`);
  const go=async()=>{const m=$('#f11-msg',o),em=$('#f11-em',o).value.trim();if(!okEmail(em))return m.textContent=t('badEm');m.textContent=t('send');
    try{const r=await post('f11_password.php',{action:'request',email:em});m.textContent=r.ok?t('sent'):t('fail')}catch(e){m.textContent=t('fail')}};
  $('#f11-go',o).onclick=go;$('#f11-em',o).addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go()}})}
function resetDlg(tok){const o=dlg(t('rT'),`<input class="f11-in" type="password" id="f11-p1" placeholder="${esc(t('p1'))}" autocomplete="new-password"><input class="f11-in" type="password" id="f11-p2" placeholder="${esc(t('p2'))}" autocomplete="new-password"><button class="f11-btn" id="f11-go">${t('save')}</button><p id="f11-msg" class="f11-s"></p>`);
  $('#f11-go',o).onclick=async()=>{const m=$('#f11-msg',o),a=$('#f11-p1',o).value;if(a.length<8)return m.textContent=t('short');if(a!==$('#f11-p2',o).value)return m.textContent=t('mism');
    try{const r=await post('f11_password.php',{action:'confirm',token:tok,password:a});m.textContent=r.ok?t('rOk'):t('rBad');if(r.ok)history.replaceState(null,'',location.pathname)}catch(e){m.textContent=t('fail')}}}
let lastFb=0;
function sendFb(r){const x=$('textarea',r);if(!x||x.value.trim().length<3||Date.now()-lastFb<3000)return;lastFb=Date.now();
  const e=$('input[type=email]',r),n=$('input[type=text]',r);post('f11_feedback.php',{message:x.value,email:e?e.value:'',name:n?n.value:''}).catch(()=>{})}
document.addEventListener('submit',e=>{const r=e.target;if(/feedback/i.test((r.closest('.modal,dialog')||r).textContent.slice(0,400)))sendFb(r)},true);

/* Clicks */
const FP=/^\s*(forgot password\??|nakalimutan ang password\??)\s*$/i;
document.addEventListener('click',e=>{const x=e.target,v=x.closest('[data-f11v]');
  if(v){e.preventDefault();e.stopPropagation();return toggle(+v.dataset.f11v)}
  const fl=x.closest('a,button');if(fl&&fl.closest('.modal')&&FP.test(fl.textContent)){e.preventDefault();e.stopPropagation();return forgot()}
  const g=x.closest('[data-f11q]');if(g){e.preventDefault();return quick(g.dataset.f11q)}
  if(x.closest('[data-f11skip]')){e.preventDefault();LS.s('f11seen',1);return $('.f11-intro')?.remove()}
  if(x.closest('[data-f11near]'))return near();
  if(x.closest('[data-f11pp]'))return passport();
  const b=x.closest('button');if(b&&!b.closest('form')&&!b.closest('.f11-ov')){const r=b.closest('.modal,dialog');if(r&&/feedback/i.test(r.textContent.slice(0,400))&&/send|submit|ipadala/i.test(b.textContent))sendFb(r)}},true);

load().then(()=>{home();enhance();
  const tok=new URLSearchParams(location.search).get('reset');if(tok)resetDlg(tok);
  let tm,cur=lang();new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(enhance,150)}).observe(document.body,{childList:true,subtree:true});
  setInterval(()=>{const l=lang();if(l!==cur){cur=l;home();sync();kmRefresh()}},700)
}).catch(err=>console.warn('Destinify f11:',err));
})();
