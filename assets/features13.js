/* Destinify features13.js: passport, home sections, quick start, near me, email password reset. Follows site language (EN default). */
(function(){'use strict';
const API='api/',MONTH=new Date().getMonth()+1;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const store=st=>({g(k,d){try{const v=JSON.parse(st.getItem(k));return v==null?d:v}catch(e){return d}},s(k,v){try{st.setItem(k,JSON.stringify(v))}catch(e){}}});
const LS=store(localStorage),SS=store(sessionStorage);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const post=(f,b)=>fetch(API+f,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(r=>r.json());
let DEST=[],pos=SS.g('f11pos',null),ppDraw=null,lastRes=null,PP=null;const visited=new Set(LS.g('f11visited',[]));

function lang(){
  try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/lang/i.test(k)){const v=String(localStorage.getItem(k)).toLowerCase();if(/tl|fil/.test(v))return'tl';if(/en/.test(v))return'en'}}}catch(e){}
  return/^(tl|fil)/.test((document.documentElement.lang||'').toLowerCase())?'tl':'en'}
const TX={
en:{intro:'What do you want to do?',beach:'🏖️ Beach',hike:'⛰️ Hike',culture:'🏛️ Culture & food',skip:'Skip',near:'Near me',openPP:'Open passport',bT:'Your travel passport',newT:"What's new",hotT:'Trending this month',been:"I've been here",done:'✓ Visited',away:n=>`📍 ${n} km away`,map:'Map',details:'Details',back:'Back',season:'In season',openMaps:'Open in Google Maps',of:'of',ppT:'Travel Passport',ppC:(a,b)=>`You've visited ${a} of ${b} places`,tabV:'Visited',tabA:'Add places',srch:'Search destinations…',emptyV:"Nothing here yet. Tap “I've been here” on any destination, or use Add places.",emptyS:'No matches.',remove:'Remove',fType:'Type',fBud:'Est. budget',fDays:'Suggested stay',days:'days',fBest:'Best months',fDist:'From you',fReg:'Region',qB:'Beaches & islands',qH:'Hiking & adventure',qC:'Culture & food',qT:l=>`✨ ${l}: picks for you`,nearT:'📍 Closest to you',noGeo:"Your browser doesn't support location.",denied:'Location is blocked. Allow it in your browser settings to see distances.',fDesc:"Enter the email on your account. We'll email you a private reset link that works once and lasts 1 hour.",emailPh:'Email address',send:'Sending…',sent:'If an account uses that email, a reset link is on its way.',badEm:'Please enter a valid email.',fail:"Couldn't reach the server. Try again later.",noEm:'No email on your account? Contact the admin.',rT:'Set a new password',p1:'New password (8+ characters)',p2:'Repeat password',save:'Save password',short:'Password must be at least 8 characters.',mism:"Passwords don't match.",rOk:'Password updated. You can sign in now.',rBad:'This link has expired or was already used. Request a new one.',close:'Close',mon:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']},
tl:{intro:'Ano ang gusto mong gawin?',beach:'🏖️ Mag-beach',hike:'⛰️ Mag-hike',culture:'🏛️ Kultura at pagkain',skip:'Laktawan',near:'Malapit sa akin',openPP:'Buksan ang passport',bT:'Ang travel passport mo',newT:'Ano ang bago',hotT:'Patok ngayong buwan',been:'Nakapunta na ako',done:'✓ Napuntahan',away:n=>`📍 ${n} km ang layo`,map:'Mapa',details:'Detalye',back:'Bumalik',season:'Magandang panahon',openMaps:'Buksan sa Google Maps',of:'sa',ppT:'Travel Passport',ppC:(a,b)=>`${a} sa ${b} ang napuntahan mo`,tabV:'Napuntahan',tabA:'Magdagdag',srch:'Hanapin ang destinasyon…',emptyV:'Wala pa rito. Pindutin ang “Nakapunta na ako” sa kahit anong destinasyon, o gamitin ang Magdagdag.',emptyS:'Walang nahanap.',remove:'Alisin',fType:'Uri',fBud:'Tinatayang budget',fDays:'Inirerekomendang tagal',days:'araw',fBest:'Pinakamagandang buwan',fDist:'Layo mula sa iyo',fReg:'Rehiyon',qB:'Beach at island hopping',qH:'Hiking at adventure',qC:'Kultura at pagkain',qT:l=>`✨ ${l} para sa iyo`,nearT:'📍 Pinakamalapit sa iyo',noGeo:'Hindi suportado ng browser mo ang lokasyon.',denied:'Hindi napayagan ang lokasyon. I-allow ito sa browser settings para makita ang layo.',fDesc:'Ilagay ang email ng account mo. Magpapadala kami ng pribadong reset link na isang beses lang magagamit at valid ng 1 oras.',emailPh:'Email address',send:'Ipinapadala…',sent:'Kung may account sa email na iyon, may ipinadala kaming link.',badEm:'Maglagay ng tamang email.',fail:'Hindi maabot ang server. Subukan ulit mamaya.',noEm:'Walang email ang account mo? Makipag-ugnayan sa admin.',rT:'Magtakda ng bagong password',p1:'Bagong password (8+ character)',p2:'Ulitin ang password',save:'I-save',short:'Hindi bababa sa 8 character ang password.',mism:'Hindi magkapareho ang password.',rOk:'Napalitan na ang password. Pwede ka nang mag-sign in.',rBad:'Expired o nagamit na ang link. Humiling ng bago.',close:'Isara',mon:['Ene','Peb','Mar','Abr','May','Hun','Hul','Ago','Set','Okt','Nob','Dis']}};
const t=(k,...a)=>{const v=TX[lang()][k];return typeof v==='function'?v(...a):v};

async function load(){
  const txt=await (await fetch('assets/data.js')).text();
  txt.split(/\r?\n/).forEach(l=>{const p=l.replace(/^[\s'"`]+|[\s'"`,;+\\]+$/g,'').split('|');
    if(p.length>=10){p[0]=p[0].replace(/^.*[`=]/,'').trim();const lat=+p[3],lng=+p[4];
      if(p[0]&&lat>4&&lat<22&&lng>115&&lng<128)DEST.push({i:DEST.length,n:p[0],prov:p[1],reg:(p[2]||'').trim(),lat,lng,type:p[5],bud:+p[6]||0,days:+p[7]||0,act:p[8].split(' '),pop:p[9]==='1',m:(p[10]||'11-5').trim()});}});
}
const inSeason=d=>{const[a,b]=d.m.split('-').map(Number);return a<=b?MONTH>=a&&MONTH<=b:MONTH>=a||MONTH<=b};
const monthsTxt=d=>{const[a,b]=d.m.split('-').map(Number),M=t('mon');return M[a-1]&&M[b-1]?`${M[a-1]} – ${M[b-1]}`:'—'};
const dist=d=>{const r=x=>x*Math.PI/180,a=Math.sin(r(d.lat-pos.lat)/2)**2+Math.cos(r(pos.lat))*Math.cos(r(d.lat))*Math.sin(r(d.lng-pos.lng)/2)**2;return 12742*Math.asin(Math.sqrt(a))};
const kmTxt=d=>{const k=dist(d);return t('away',k<10?k.toFixed(1):Math.round(k).toLocaleString())};
const gmap=d=>`https://www.google.com/maps/search/?api=1&query=${d.lat},${d.lng}`;
const EMO={Beach:'🏖️',Island:'🏝️',Waterfall:'💦',Mountain:'⛰️',Lake:'🏞️',Cave:'🕳️',Heritage:'🏛️',City:'🌆',Nature:'🌿',Surf:'🏄',Diving:'🤿',Adventure:'🧗'};
const emo=ty=>EMO[ty]||'📍',hue=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))%360;return h};

function dlg(title,html,wide){const o=document.createElement('div');o.className='f11-ov';
  o.innerHTML=`<div class="f11-dlg${wide?' f11-wide':''}"><button class="f11-x" aria-label="${esc(t('close'))}">×</button><h3>${title}</h3>${html}</div>`;
  o.addEventListener('click',e=>{if(e.target===o||e.target.classList.contains('f11-x'))o.remove()});
  (document.querySelector('.modal.show')||document.body).appendChild(o);setTimeout(()=>{const i=$('input:not([hidden])',o);i&&i.focus()},60);return o}

/* Passport */
function toggle(i){visited.has(i)?visited.delete(i):visited.add(i);LS.s('f11visited',[...visited]);sync()}
function sync(){
  $$('[data-f11v]').forEach(b=>{const on=visited.has(+b.dataset.f11v);b.classList.toggle('on',on);b.textContent=on?t('done'):t('been')});
  const pct=DEST.length?visited.size/DEST.length*100:0;
  $$('.f11-cnt').forEach(e=>e.textContent=`${visited.size} ${t('of')} ${DEST.length}`);
  $$('.f11-cnt3').forEach(e=>e.textContent=t('ppC',visited.size,DEST.length));
  $$('.f11-pbar').forEach(e=>e.style.width=pct+'%');$$('.f11-pct').forEach(e=>e.textContent=pct.toFixed(1)+'%');
  ppDraw&&ppDraw()}
const rowHTML=(d,m)=>`<div class="f11-row" style="--h:${hue(d.type)}"><div class="f11-ic">${emo(d.type)}</div><a href="#" class="f11-rn" data-f11d="${d.i}"><b>${esc(d.n)}</b><small>${esc(d.prov)} · ${esc(d.type)}</small></a>${m==='rm'?`<button class="f11-rm" data-f11rm="${d.i}">${t('remove')}</button>`:`<button class="f11-go${visited.has(d.i)?' on':''}" data-f11v="${d.i}">${visited.has(d.i)?t('done'):t('been')}</button>`}</div>`;
const fact=(k,v)=>`<div class="f11-fact"><small>${esc(k)}</small><b>${esc(v)}</b></div>`;
function detailHTML(d){const on=visited.has(d.i);
  return `<button class="f11-back" data-f11back>← ${t('back')}</button><div class="f11-dh" style="--h:${hue(d.type)}"><div class="f11-ic big">${emo(d.type)}</div><div><h3 class="f11-dn">${esc(d.n)}</h3><span class="f11-s">${esc(d.prov)}</span></div></div><div class="f11-facts">${fact(t('fType'),d.type)}${fact(t('fBud'),'₱'+d.bud.toLocaleString())}${d.days?fact(t('fDays'),d.days+' '+t('days')):''}${fact(t('fBest'),monthsTxt(d)+(inSeason(d)?' ✓':''))}${d.reg&&d.reg.length>2?fact(t('fReg'),d.reg):''}${pos?fact(t('fDist'),kmTxt(d).replace('📍 ','')):''}</div><div class="f11-acts"><button class="f11-go${on?' on':''}" data-f11v="${d.i}">${on?t('done'):t('been')}</button><a class="f11-link" href="${gmap(d)}" target="_blank" rel="noopener">${t('openMaps')}</a></div>`}
function passport(detail){
  if(PP&&document.body.contains(PP.o)){PP.S.detail=detail==null?null:detail;PP.render();return}
  const o=dlg('🧳 '+t('ppT'),`<div class="f11-stat"><b class="f11-cnt3"></b><span class="f11-pct"></span></div><div class="f11-prog"><div class="f11-pbar"></div></div><div id="f11-map"></div><div id="f11-tabs"></div><input id="f11-q" class="f11-in" hidden placeholder="${esc(t('srch'))}"><div id="f11-body"></div>`,true);
  const S={tab:'v',q:'',detail:detail==null?null:detail,key:''};let map=null,layer=null;
  if(window.L&&window.L.map){map=L.map('f11-map').setView([12.5,122],5);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);layer=L.layerGroup().addTo(map);setTimeout(()=>map.invalidateSize(),80)}else $('#f11-map',o).remove();
  const render=()=>{if(!document.body.contains(o)){PP=null;ppDraw=null;return}
    const det=S.detail!=null?DEST[S.detail]:null;
    $('#f11-tabs',o).innerHTML=det?'':`<button data-f11tab="v" class="${S.tab==='v'?'on':''}">${t('tabV')} (${visited.size})</button><button data-f11tab="a" class="${S.tab==='a'?'on':''}">${t('tabA')}</button>`;
    $('#f11-q',o).hidden=!!det||S.tab!=='a';
    if(map){layer.clearLayers();const pts=[];
      visited.forEach(i=>{const d=DEST[i];if(!d)return;pts.push([d.lat,d.lng]);L.circleMarker([d.lat,d.lng],{radius:6,color:'#c2185b',fillOpacity:.85}).bindTooltip(esc(d.n)).on('click',()=>{S.detail=d.i;render()}).addTo(layer)});
      if(det)L.circleMarker([det.lat,det.lng],{radius:12,color:'#7a2f8f',weight:3,fillOpacity:.25}).addTo(layer);
      const key=(det?det.i:'l')+'|'+visited.size;
      if(key!==S.key){S.key=key;if(det)map.setView([det.lat,det.lng],10);else if(pts.length)map.fitBounds(pts,{padding:[24,24],maxZoom:9});else map.setView([12.5,122],5)}}
    let h;if(det)h=detailHTML(det);
    else if(S.tab==='v'){const l=[...visited].reverse().map(i=>DEST[i]).filter(Boolean);h=l.length?`<div class="f11-rows">${l.map(d=>rowHTML(d,'rm')).join('')}</div>`:`<p class="f11-empty">${t('emptyV')}</p>`}
    else{const q=S.q.trim().toLowerCase(),l=DEST.filter(d=>!q||(d.n+' '+d.prov+' '+d.type).toLowerCase().includes(q)).slice(0,60);h=l.length?`<div class="f11-rows">${l.map(d=>rowHTML(d,'v')).join('')}</div>`:`<p class="f11-empty">${t('emptyS')}</p>`}
    $('#f11-body',o).innerHTML=h;
    const pct=DEST.length?visited.size/DEST.length*100:0;$$('.f11-cnt3',o).forEach(e=>e.textContent=t('ppC',visited.size,DEST.length));$$('.f11-pbar',o).forEach(e=>e.style.width=pct+'%');$$('.f11-pct',o).forEach(e=>e.textContent=pct.toFixed(1)+'%')};
  $('#f11-q',o).addEventListener('input',e=>{S.q=e.target.value;render()});
  PP={o,S,render};ppDraw=render;render()}

/* Cards and results */
const mini=d=>`<article class="f11-card" style="--h:${hue(d.type)}"><div class="f11-top"><div class="f11-ic">${emo(d.type)}</div><div><a href="#" class="f11-t" data-f11d="${d.i}">${esc(d.n)}</a><span class="f11-s">${esc(d.prov)}</span></div></div><div class="f11-chips"><span>${esc(d.type)}</span><span>₱${d.bud.toLocaleString()}</span>${inSeason(d)?`<span class="in">${t('season')}</span>`:''}${pos?`<span class="km">${kmTxt(d)}</span>`:''}</div><div class="f11-acts"><button class="f11-go" data-f11v="${d.i}"></button><button class="f11-link" data-f11d="${d.i}">${t('details')}</button><a class="f11-link" href="${gmap(d)}" target="_blank" rel="noopener">${t('map')}</a></div></article>`;
function showRes(titleFn,list,scroll){lastRes={titleFn,list};const r=$('#f11-res');if(!r)return;r.innerHTML=`<h3 class="f11-h">${titleFn()}</h3><div class="f11-list res">${list.map(mini).join('')}</div>`;sync();if(scroll)r.scrollIntoView({behavior:'smooth',block:'nearest'})}
const Q={beach:{k:'qB',t:/Beach|Island|Diving|Surf/,a:['sw','sn','dv','sf','ih','rl']},hike:{k:'qH',t:/Mountain|Waterfall|Cave|Lake|Nature|Adventure/,a:['hk','cm','cy','cv','ad','kc']},culture:{k:'qC',t:/Heritage|City/,a:['cw','fd','ss','ph']}};
function quick(k){const q=Q[k];LS.s('f11seen',1);$('.f11-intro')?.remove();
  const list=DEST.map(d=>({d,s:(q.t.test(d.type)?3:0)+d.act.filter(a=>q.a.includes(a)).length+(inSeason(d)?2:0)+(d.pop?1:0)})).filter(x=>x.s>=3).sort((a,b)=>b.s-a.s).slice(0,8).map(x=>x.d);
  showRes(()=>t('qT',t(q.k)),list,true)}
function fresh(){let F=null;try{F=new Function('return typeof FEST!=="undefined"?FEST:null')()}catch(e){}
  const nx=MONTH%12+1,ev=(F||[]).filter(f=>[].concat(f.m).some(m=>m==MONTH||m==nx)).slice(0,4);
  const h=ev.map(f=>`<article class="f11-card"><div class="f11-top"><div class="f11-ic" style="--h:${hue(f.n)}">🎉</div><div><span class="f11-t">${esc(f.n)}</span><span class="f11-s">${esc(f.d||'')}${f.w?' · '+esc(f.w):''}</span></div></div></article>`);
  h.push(...DEST.slice(-Math.max(2,6-h.length)).reverse().map(mini));const e=$('#f11-new');if(e)e.innerHTML=h.join('')}
async function hot(){let ids=[];try{ids=((await fetch(API+'f11_track.php?top=1').then(r=>r.json())).top||[])}catch(e){}
  const out=ids.map(i=>DEST[i]).filter(Boolean);
  DEST.filter(d=>d.pop&&inSeason(d)).sort((a,b)=>((a.i*7+MONTH)%97)-((b.i*7+MONTH)%97)).forEach(d=>{if(out.length<6&&!out.includes(d))out.push(d)});
  const h=$('#f11-hot');if(h){h.innerHTML=out.slice(0,6).map(mini).join('');sync()}}
function mount(){let h=$('#f11-home');if(!h){h=document.createElement('section');h.id='f11-home';const f=$('footer');f?f.parentNode.insertBefore(h,f):document.body.appendChild(h)}return h}
function home(){const h=mount(),first=!LS.g('f11seen',0);
  h.innerHTML=`<div class="f11-banner"><div class="f11-bl"><h2>🧳 ${t('bT')}</h2><p class="f11-cnt3"></p><div class="f11-prog"><div class="f11-pbar"></div></div></div><div class="f11-bact"><button class="f11-btn" data-f11pp>${t('openPP')}</button><button class="f11-btn ghost" data-f11near>📍 ${t('near')}</button></div></div>${first?`<div class="f11-intro"><h2>${t('intro')}</h2><div class="f11-big"><button data-f11q="beach">${t('beach')}</button><button data-f11q="hike">${t('hike')}</button><button data-f11q="culture">${t('culture')}</button></div><a href="#" data-f11skip>${t('skip')}</a></div>`:''}<div id="f11-res"></div><div class="f11-cols"><div><h3 class="f11-h">🆕 ${t('newT')}</h3><div id="f11-new" class="f11-list"></div></div><div><h3 class="f11-h">🔥 ${t('hotT')}</h3><div id="f11-hot" class="f11-list"></div></div></div>`;
  fresh();hot();if(lastRes)showRes(lastRes.titleFn,lastRes.list,false);sync()}
function near(){if(!navigator.geolocation)return alert(t('noGeo'));
  navigator.geolocation.getCurrentPosition(p=>{pos={lat:p.coords.latitude,lng:p.coords.longitude};SS.s('f11pos',pos);
    showRes(()=>t('nearT'),[...DEST].sort((a,b)=>dist(a)-dist(b)).slice(0,8),true);fresh();hot();kmRefresh()},()=>alert(t('denied')),{timeout:10000})}

/* Existing destination cards: distance + "I've been here" */
const seenHit=new Set();
function track(i){if(seenHit.has(i))return;seenHit.add(i);post('f11_track.php',{idx:i}).catch(()=>{})}
function kmRefresh(){$$('.f11-bar').forEach(b=>{const d=DEST[+b.dataset.i];$('.f11-kmt',b).textContent=pos?kmTxt(d):''})}
function enhance(){if(!DEST.length)return;const by=new Map(DEST.map(d=>[d.n.toLowerCase(),d]));
  $$('.card:not([data-f11])').forEach(c=>{const h=$('.card-title,h3,h4,h5,h6',c);if(!h)return;const d=by.get(h.textContent.trim().toLowerCase());if(!d)return;
    c.dataset.f11=d.i;const b=document.createElement('div');b.className='f11-bar';b.dataset.i=d.i;
    b.innerHTML=`<span class="f11-kmt">${pos?kmTxt(d):''}</span><button class="f11-go" data-f11v="${d.i}"></button>`;h.parentElement.appendChild(b);
    c.addEventListener('click',()=>track(d.i))});sync()}

/* Email password reset: the site's own "Forgot password" panel now asks for an email */
const okEmail=s=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
function fpEnsure(){
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>/Type your username/i.test(n.nodeValue)?1:3});let n;
  while((n=w.nextNode())){const el=n.parentElement;if(!el||el.dataset.f11fp)continue;let box=el,inp=null,btn=null;
    for(let i=0;i<6&&box&&!(inp&&btn);i++){box=box.parentElement;if(!box)break;inp=box.querySelector('input');btn=[...box.querySelectorAll('button')].find(b=>/send my request/i.test(b.textContent))}
    if(inp&&btn){el.dataset.f11fp=1;box.dataset.f11fpbox=1;btn.dataset.f11fpbtn=1;inp.dataset.f11fpin=1}}
  $$('[data-f11fp]').forEach(el=>{if(el.textContent!==t('fDesc'))el.textContent=t('fDesc')});
  $$('[data-f11fpin]').forEach(i=>{if(i.type!=='email')i.type='email';if(i.placeholder!==t('emailPh'))i.placeholder=t('emailPh');i.setAttribute('autocomplete','email');i.setAttribute('inputmode','email')})}
async function fpSubmit(box){if(!box)return;const inp=$('[data-f11fpin]',box),btn=$('[data-f11fpbtn]',box);if(!inp||!btn)return;
  let m=$('.f11-fpmsg',box);if(!m){m=document.createElement('p');m.className='f11-fpmsg';btn.insertAdjacentElement('afterend',m)}
  const em=inp.value.trim();if(!okEmail(em)){m.textContent=t('badEm');return}
  m.textContent=t('send');btn.disabled=true;
  try{const r=await post('f11_password.php',{action:'request',email:em});m.innerHTML=r.ok?`${esc(t('sent'))}<br><small>${esc(t('noEm'))}</small>`:esc(t('fail'))}catch(e){m.textContent=t('fail')}
  btn.disabled=false}
function resetDlg(tok){const o=dlg(t('rT'),`<input class="f11-in" type="password" id="f11-p1" placeholder="${esc(t('p1'))}" autocomplete="new-password"><input class="f11-in" type="password" id="f11-p2" placeholder="${esc(t('p2'))}" autocomplete="new-password"><button class="f11-btn solid" id="f11-go">${t('save')}</button><p id="f11-msg" class="f11-fpmsg"></p>`);
  $('#f11-go',o).onclick=async()=>{const m=$('#f11-msg',o),a=$('#f11-p1',o).value;if(a.length<8)return m.textContent=t('short');if(a!==$('#f11-p2',o).value)return m.textContent=t('mism');
    try{const r=await post('f11_password.php',{action:'confirm',token:tok,password:a});m.textContent=r.ok?t('rOk'):t('rBad');if(r.ok)history.replaceState(null,'',location.pathname)}catch(e){m.textContent=t('fail')}}}

/* Feedback email */
let lastFb=0;
function sendFb(r){const x=$('textarea',r);if(!x||x.value.trim().length<3||Date.now()-lastFb<3000)return;lastFb=Date.now();
  const e=$('input[type=email]',r),n=$('input[type=text]',r);post('f11_feedback.php',{message:x.value,email:e?e.value:'',name:n?n.value:''}).catch(()=>{})}
document.addEventListener('submit',e=>{const r=e.target;if(/feedback/i.test((r.closest('.modal,dialog')||r).textContent.slice(0,400)))sendFb(r)},true);
window.addEventListener('submit',e=>{const f=e.target,box=f.closest&&f.closest('[data-f11fpbox]')||(f.querySelector&&f.querySelector('[data-f11fpbox]'));if(box){e.preventDefault();e.stopImmediatePropagation();fpSubmit(box)}},true);
window.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches&&e.target.matches('[data-f11fpin]')){e.preventDefault();e.stopImmediatePropagation();fpSubmit(e.target.closest('[data-f11fpbox]'))}},true);

/* Clicks */
window.addEventListener('click',e=>{const x=e.target;if(!x.closest)return;
  const fb=x.closest('[data-f11fpbtn]');if(fb){e.preventDefault();e.stopImmediatePropagation();return fpSubmit(fb.closest('[data-f11fpbox]'))}
  const v=x.closest('[data-f11v]');if(v){e.preventDefault();e.stopPropagation();return toggle(+v.dataset.f11v)}
  const rm=x.closest('[data-f11rm]');if(rm){e.preventDefault();return toggle(+rm.dataset.f11rm)}
  const tb=x.closest('[data-f11tab]');if(tb&&PP){e.preventDefault();PP.S.tab=tb.dataset.f11tab;return PP.render()}
  const dd=x.closest('[data-f11d]');if(dd){e.preventDefault();return passport(+dd.dataset.f11d)}
  if(x.closest('[data-f11back]')&&PP){e.preventDefault();PP.S.detail=null;return PP.render()}
  const g=x.closest('[data-f11q]');if(g){e.preventDefault();return quick(g.dataset.f11q)}
  if(x.closest('[data-f11skip]')){e.preventDefault();LS.s('f11seen',1);return $('.f11-intro')?.remove()}
  if(x.closest('[data-f11near]'))return near();
  if(x.closest('[data-f11pp]'))return passport();
  const b=x.closest('button');if(b&&!b.closest('form')&&!b.closest('.f11-ov')){const r=b.closest('.modal,dialog');if(r&&/feedback/i.test(r.textContent.slice(0,400))&&/send|submit|ipadala/i.test(b.textContent))sendFb(r)}},true);

load().then(()=>{home();enhance();fpEnsure();
  const tok=new URLSearchParams(location.search).get('reset');if(tok)resetDlg(tok);
  let tm,cur=lang();new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(()=>{enhance();fpEnsure()},150)}).observe(document.body,{childList:true,subtree:true});
  setInterval(()=>{const l=lang();if(l!==cur){cur=l;home();sync();kmRefresh();fpEnsure()}},700)
}).catch(err=>console.warn('Destinify f11:',err));
})();
