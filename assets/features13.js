/* Destinify features11.js: passport, home sections, quick-start, near me, email forms. I-load pagkatapos ng features10.js */
(function(){'use strict';
const API='api/',MONTH=new Date().getMonth()+1;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const store=st=>({g(k,d){try{const v=JSON.parse(st.getItem(k));return v==null?d:v}catch(e){return d}},s(k,v){try{st.setItem(k,JSON.stringify(v))}catch(e){}}});
const LS=store(localStorage),SS=store(sessionStorage);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const post=(f,b)=>fetch(API+f,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(r=>r.json());
let DEST=[],pos=SS.g('f11pos',null),ppDraw=null;const visited=new Set(LS.g('f11visited',[]));

/* Catalog: binabasa ang assets/data.js (format: name|province|group|lat|lng|type|budget|days|acts|popular|months) */
async function load(){
  const t=await (await fetch('assets/data.js')).text();
  t.split(/\r?\n/).forEach(l=>{const p=l.replace(/^[\s'"`]+|[\s'"`,;+\\]+$/g,'').split('|');
    if(p.length>=10){const lat=+p[3],lng=+p[4];
      if(lat>4&&lat<22&&lng>115&&lng<128)DEST.push({i:DEST.length,n:p[0].trim(),prov:p[1],lat,lng,type:p[5],bud:+p[6]||0,act:p[8].split(' '),pop:p[9]==='1',m:(p[10]||'11-5').trim()});}});
}
const inSeason=d=>{const[a,b]=d.m.split('-').map(Number);return a<=b?MONTH>=a&&MONTH<=b:MONTH>=a||MONTH<=b};
const dist=d=>{const r=x=>x*Math.PI/180,a=Math.sin(r(d.lat-pos.lat)/2)**2+Math.cos(r(pos.lat))*Math.cos(r(d.lat))*Math.sin(r(d.lng-pos.lng)/2)**2;return 12742*Math.asin(Math.sqrt(a))};
const kmTxt=d=>{const k=dist(d);return k<10?k.toFixed(1):Math.round(k).toLocaleString()};
const gmap=d=>`https://www.google.com/maps/search/?api=1&query=${d.lat},${d.lng}`;

function dlg(title,html,wide){const o=document.createElement('div');o.className='f11-ov';
  o.innerHTML=`<div class="f11-dlg${wide?' f11-wide':''}"><button class="f11-x" aria-label="Isara">×</button><h3>${title}</h3>${html}</div>`;
  o.addEventListener('click',e=>{if(e.target===o||e.target.classList.contains('f11-x'))o.remove()});document.body.appendChild(o);return o}

/* Passport */
function toggle(i){visited.has(i)?visited.delete(i):visited.add(i);LS.s('f11visited',[...visited]);sync()}
function sync(){
  $$('[data-f11v]').forEach(b=>{const on=visited.has(+b.dataset.f11v);b.classList.toggle('on',on);b.textContent=on?'✓ Napuntahan':'Nakapunta na ako'});
  $$('.f11-cnt').forEach(e=>e.textContent=`${visited.size} sa ${DEST.length}`);ppDraw&&ppDraw()}
function passport(){
  const o=dlg('🧳 Travel Passport','<p class="f11-cnt2"></p><div class="f11-prog"><div id="f11-bar"></div></div><div id="f11-map"></div><input id="f11-q" class="f11-in" placeholder="Hanapin ang destinasyon…"><div id="f11-pl"></div>',true);
  let map=null,layer=null;
  if(window.L){map=L.map('f11-map').setView([12.5,122],5);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);layer=L.layerGroup().addTo(map);setTimeout(()=>map.invalidateSize(),60)}else $('#f11-map',o).remove();
  const draw=()=>{if(!document.body.contains(o)){ppDraw=null;return}
    $('.f11-cnt2',o).textContent=`${visited.size} sa ${DEST.length} ang napuntahan mo`;$('#f11-bar',o).style.width=(DEST.length?visited.size/DEST.length*100:0)+'%';
    if(map){layer.clearLayers();const pts=[];visited.forEach(i=>{const d=DEST[i];if(d){pts.push([d.lat,d.lng]);L.circleMarker([d.lat,d.lng],{radius:6,color:'#d63384',fillOpacity:.8}).bindPopup(esc(d.n)).addTo(layer)}});if(pts.length&&!draw.fit){map.fitBounds(pts,{padding:[20,20],maxZoom:9});draw.fit=1}}
    const q=$('#f11-q',o).value.trim().toLowerCase();
    $('#f11-pl',o).innerHTML=DEST.filter(d=>!q||(d.n+' '+d.prov).toLowerCase().includes(q)).slice(0,80).map(d=>`<div class="f11-row"><div><div class="f11-t">${esc(d.n)}</div><div class="f11-s">${esc(d.prov)}</div></div><button class="f11-go ${visited.has(d.i)?'on':''}" data-f11v="${d.i}">${visited.has(d.i)?'✓ Napuntahan':'Nakapunta na ako'}</button></div>`).join('')};
  $('#f11-q',o).addEventListener('input',draw);ppDraw=draw;draw()}

/* Cards (sariling mini-card) */
const mini=d=>`<div class="f11-card"><div class="f11-t">${esc(d.n)}</div><div class="f11-s">${esc(d.prov)} · ${esc(d.type)} · ₱${d.bud.toLocaleString()}</div>${pos?`<div class="f11-km">📍 ${kmTxt(d)} km ang layo</div>`:''}<button class="f11-go" data-f11v="${d.i}"></button> <a class="f11-s" href="${gmap(d)}" target="_blank" rel="noopener">Mapa</a></div>`;
function showRes(title,list){const r=$('#f11-res');if(!r)return;r.innerHTML=`<h4>${title}</h4><div class="f11-list">${list.map(mini).join('')}</div>`;sync();r.scrollIntoView({behavior:'smooth',block:'nearest'})}

/* Home sections */
const Q={beach:{l:'Beach at island hopping',t:/Beach|Island|Diving|Surf/,a:['sw','sn','dv','sf','ih','rl']},hike:{l:'Hiking at adventure',t:/Mountain|Waterfall|Cave|Lake|Nature|Adventure/,a:['hk','cm','cy','cv','ad','kc']},culture:{l:'Kultura at pagkain',t:/Heritage|City/,a:['cw','fd','ss','ph']}};
function quick(k){const q=Q[k];LS.s('f11seen',1);$('.f11-intro')?.remove();
  const list=DEST.map(d=>({d,s:(q.t.test(d.type)?3:0)+d.act.filter(a=>q.a.includes(a)).length+(inSeason(d.m)?2:0)+(d.pop?1:0)})).filter(x=>x.s>=3).sort((a,b)=>b.s-a.s).slice(0,8).map(x=>x.d);
  showRes('✨ '+q.l+' para sa iyo',list)}
function fresh(){let F=null;try{F=new Function('return typeof FEST!=="undefined"?FEST:null')()}catch(e){}
  const nx=MONTH%12+1,ev=(F||[]).filter(f=>[].concat(f.m).some(m=>m==MONTH||m==nx)).slice(0,4);
  const h=ev.map(f=>`<div class="f11-card"><div class="f11-t">🎉 ${esc(f.n)}</div><div class="f11-s">${esc(f.d||'')} · ${esc(f.w||'')}</div></div>`);
  h.push(...DEST.slice(-Math.max(2,6-h.length)).reverse().map(mini));$('#f11-new').innerHTML=h.join('')}
async function hot(){let ids=[];try{ids=((await fetch(API+'f11_track.php?top=1').then(r=>r.json())).top||[])}catch(e){}
  const out=ids.map(i=>DEST[i]).filter(Boolean);
  DEST.filter(d=>d.pop&&inSeason(d)).sort((a,b)=>((a.i*7+MONTH)%97)-((b.i*7+MONTH)%97)).forEach(d=>{if(out.length<6&&!out.includes(d))out.push(d)});
  $('#f11-hot').innerHTML=out.slice(0,6).map(mini).join('');sync()}
function home(){
  let h=$('#f11-home');if(!h){h=document.createElement('section');h.id='f11-home';const a=$('main')||$('.container')||document.body;a.insertBefore(h,a.firstChild)}
  const intro=LS.g('f11seen',0)?'':`<div class="f11-intro"><h2>Ano ang gusto mong gawin?</h2><div class="f11-big"><button data-f11q="beach">🏖️ Mag-beach</button><button data-f11q="hike">⛰️ Mag-hike</button><button data-f11q="culture">🏛️ Kultura at pagkain</button></div><a href="#" data-f11skip>Laktawan</a></div>`;
  h.innerHTML=`${intro}<div id="f11-res"></div><div class="f11-actions"><button class="f11-btn" data-f11near>📍 Malapit sa akin</button><button class="f11-btn" data-f11pp>🧳 Passport: <b class="f11-cnt"></b></button></div><div class="f11-cols"><div><h4>🆕 Ano ang bago</h4><div id="f11-new" class="f11-list"></div></div><div><h4>🔥 Patok ngayong buwan</h4><div id="f11-hot" class="f11-list"></div></div></div>`;
  fresh();hot();sync()}
function near(){if(!navigator.geolocation)return alert('Hindi suportado ng browser mo ang lokasyon.');
  navigator.geolocation.getCurrentPosition(p=>{pos={lat:p.coords.latitude,lng:p.coords.longitude};SS.s('f11pos',pos);
    showRes('📍 Pinakamalapit sa iyo',[...DEST].sort((a,b)=>dist(a)-dist(b)).slice(0,8));kmRefresh()},
    ()=>alert('Hindi napayagan ang lokasyon. I-allow ito sa browser settings para makita ang layo.'),{timeout:10000})}

/* Mga umiiral na card: dagdag na "km" at "Nakapunta na ako" (hinahanap ang .card na may pamagat na kapareho ng pangalan ng destinasyon) */
const seenHit=new Set();
function track(i){if(seenHit.has(i))return;seenHit.add(i);post('f11_track.php',{idx:i}).catch(()=>{})}
function kmRefresh(){$$('.f11-bar').forEach(b=>{const d=DEST[+b.dataset.i];$('.f11-kmt',b).textContent=pos?`📍 ${kmTxt(d)} km ang layo`:''})}
function enhance(){if(!DEST.length)return;const by=new Map(DEST.map(d=>[d.n.toLowerCase(),d]));
  $$('.card:not([data-f11])').forEach(c=>{const h=$('.card-title,h3,h4,h5,h6',c);if(!h)return;const d=by.get(h.textContent.trim().toLowerCase());if(!d)return;
    c.dataset.f11=d.i;const b=document.createElement('div');b.className='f11-bar';b.dataset.i=d.i;
    b.innerHTML=`<span class="f11-kmt">${pos?`📍 ${kmTxt(d)} km ang layo`:''}</span><button class="f11-go" data-f11v="${d.i}"></button>`;h.parentElement.appendChild(b);
    c.addEventListener('click',()=>track(d.i))});sync()}

/* Email: forgot password, reset, feedback */
function forgot(){const o=dlg('Nakalimutan ang password?','<p>Ilagay ang email ng account mo. Padadalhan ka namin ng reset link.</p><input class="f11-in" type="email" id="f11-em" placeholder="email@example.com"><button class="f11-btn" id="f11-go">Ipadala ang link</button><p id="f11-msg" class="f11-s"></p>');
  $('#f11-go',o).onclick=async()=>{const m=$('#f11-msg',o);m.textContent='Ipinapadala…';try{const r=await post('f11_password.php',{action:'request',email:$('#f11-em',o).value});m.textContent=r.message||r.error}catch(e){m.textContent='Hindi maabot ang server.'}}}
function resetDlg(tok){const o=dlg('Magtakda ng bagong password','<input class="f11-in" type="password" id="f11-p1" placeholder="Bagong password (8+ character)"><input class="f11-in" type="password" id="f11-p2" placeholder="Ulitin ang password"><button class="f11-btn" id="f11-go">I-save</button><p id="f11-msg" class="f11-s"></p>');
  $('#f11-go',o).onclick=async()=>{const m=$('#f11-msg',o),a=$('#f11-p1',o).value;if(a!==$('#f11-p2',o).value)return m.textContent='Hindi magkapareho ang password.';
    try{const r=await post('f11_password.php',{action:'confirm',token:tok,password:a});m.textContent=r.message||r.error;if(r.ok)history.replaceState(null,'',location.pathname)}catch(e){m.textContent='Hindi maabot ang server.'}}}
function injectForgot(){$$('.modal').forEach(m=>{if(m.querySelector('.f11-forgot')||!/sign in|log ?in|mag-?login/i.test(m.textContent))return;const p=$('input[type=password]',m);if(p)p.parentElement.insertAdjacentHTML('afterend','<a href="#" class="f11-forgot small d-block my-2">Nakalimutan ang password?</a>')})}
let lastFb=0;
function sendFb(r){const t=$('textarea',r);if(!t||t.value.trim().length<3||Date.now()-lastFb<3000)return;lastFb=Date.now();
  const e=$('input[type=email]',r),n=$('input[type=text]',r);post('f11_feedback.php',{message:t.value,email:e?e.value:'',name:n?n.value:''}).catch(()=>{})}
document.addEventListener('submit',e=>{const r=e.target;if(/feedback/i.test((r.closest('.modal,dialog')||r).textContent.slice(0,400)))sendFb(r)},true);

/* Mga click */
document.addEventListener('click',e=>{const t=e.target,v=t.closest('[data-f11v]');
  if(v){e.preventDefault();e.stopPropagation();return toggle(+v.dataset.f11v)}
  const g=t.closest('[data-f11q]');if(g){e.preventDefault();return quick(g.dataset.f11q)}
  if(t.closest('[data-f11skip]')){e.preventDefault();LS.s('f11seen',1);return $('.f11-intro')?.remove()}
  if(t.closest('[data-f11near]'))return near();
  if(t.closest('[data-f11pp]'))return passport();
  if(t.closest('.f11-forgot')){e.preventDefault();return forgot()}
  const b=t.closest('button');if(b&&!b.closest('form')&&!b.closest('.f11-ov')){const r=b.closest('.modal,dialog');if(r&&/feedback/i.test(r.textContent.slice(0,400))&&/send|submit|ipadala/i.test(b.textContent))sendFb(r)}},true);

load().then(()=>{home();enhance();injectForgot();
  const tok=new URLSearchParams(location.search).get('reset');if(tok)resetDlg(tok);
  let tm;new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(()=>{enhance();injectForgot()},150)}).observe(document.body,{childList:true,subtree:true})
}).catch(err=>console.warn('Destinify f11:',err));
})();
