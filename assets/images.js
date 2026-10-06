/* Destinify photo loader. Every destination ends up with a picture.
   Order of attempts, stopping at the first photo that actually loads:
   1. Wikipedia lead photo for the exact title in IMG_TITLES
   2. Wikipedia search for "name province Philippines"
   3. Wikipedia search for "name Philippines"
   4. Wikimedia Commons search (name + province, then name)
   5. Wikipedia photo for the province article
   6. A generated illustration that matches the destination type (never a blank card)
   Photos come from Wikipedia / Wikimedia Commons under their own licenses, so a credit link is shown with each one.
   Results are cached in localStorage ("dimg2"); a destination that ended on an illustration is retried after 2 days.
   To force a photo: IMG_TITLES maps a name to an exact Wikipedia title, and IMG_URL maps a name to your own image URL,
   e.g. "assets/img/el-nido.jpg". */
const IMG_TITLES={
"Baguio":"Baguio","Sagada":"Sagada","Banaue Rice Terraces":"Banaue Rice Terraces","Vigan":"Vigan","Paoay Church & Dunes":"Paoay Church",
"Pagudpud":"Pagudpud","Bangui Windmills":"Bangui Wind Farm","Mt. Pulag":"Mount Pulag","Mt. Batulao":"Mount Batulao","Mt. Pico de Loro":"Mount Pico de Loro",
"Hundred Islands":"Hundred Islands National Park","San Juan, La Union":"San Juan, La Union","Mt. Pinatubo Crater":"Mount Pinatubo","Baler":"Baler, Aurora",
"Sabtang":"Sabtang","Batan Island":"Batan Island","Tanay":"Tanay, Rizal","Pagsanjan Falls":"Pagsanjan Falls","Lucban & Tayabas":"Lucban",
"Taal Heritage Town":"Taal, Batangas","Tagaytay & Taal":"Taal Volcano","Puerto Galera":"Puerto Galera","Marinduque":"Marinduque","Caramoan":"Caramoan",
"Mayon Volcano":"Mayon Volcano","Cagsawa Ruins":"Cagsawa Ruins","Donsol":"Donsol","Intramuros":"Intramuros","Binondo":"Binondo, Manila",
"El Nido":"El Nido, Palawan","Coron":"Coron, Palawan","Puerto Princesa":"Puerto Princesa","Underground River":"Puerto Princesa Subterranean River National Park",
"Tubbataha Reefs":"Tubbataha Reefs Natural Park","Balabac":"Balabac, Palawan","Apo Reef":"Apo Reef Natural Park","Calaguas Islands":"Calaguas Islands",
"Palaui Island":"Palaui Island","Callao Cave":"Callao Cave","Clark Freeport":"Clark Freeport Zone","Subic Bay":"Subic Bay","Sibuyan Island":"Sibuyan",
"Boracay":"Boracay","Kalibo":"Kalibo, Aklan","Iloilo City":"Iloilo City","Miagao Church":"Miagao Church",
"Guimaras":"Guimaras","Bacolod":"Bacolod","Canlaon Volcano":"Mount Kanlaon","Dumaguete":"Dumaguete","Apo Island":"Apo Island","Siquijor":"Siquijor",
"Cebu City":"Cebu City","Mactan":"Mactan Island","Moalboal":"Moalboal","Kawasan Falls":"Kawasan Falls","Oslob":"Oslob","Malapascua":"Malapascua Island",
"Bantayan Island":"Bantayan Island","Camotes Islands":"Camotes Islands","Chocolate Hills":"Chocolate Hills","Tarsier Sanctuary":"Philippine Tarsier Sanctuary",
"Panglao":"Panglao, Bohol","Balicasag Island":"Balicasag Island","Anda":"Anda, Bohol","Tacloban":"Tacloban","Sohoton Caves":"Sohoton Natural Bridge National Park",
"Sogod Bay":"Sogod Bay","Calicoan Island":"Calicoan","Biri Islands":"Biri, Northern Samar","General Luna, Siargao":"General Luna, Surigao del Norte",
"Camiguin":"Camiguin","Cagayan de Oro":"Cagayan de Oro","Zamboanga City":"Zamboanga City","Dapitan":"Dapitan","Dipolog":"Dipolog","Bongao":"Bongao",
"Davao City":"Davao City","Mt. Apo":"Mount Apo","Samal Island":"Samal Island","General Santos":"General Santos","Lake Sebu":"Lake Sebu",
"Enchanted River":"Hinatuan Enchanted River","Philippine Eagle Center":"Philippine Eagle Center","Tinuy-an Falls":"Tinuy-an Falls",
"Maria Cristina Falls":"Maria Cristina Falls","Mt. Kitanglad":"Mount Kitanglad","Mt. Hamiguitan":"Mount Hamiguitan","Mt. Matutum":"Mount Matutum","Taal Volcano Island":"Taal Volcano","Art in Island":"Art In Island","Pinto Art Museum":"Pinto Art Museum","Bonifacio High Street":"Bonifacio High Street","Eastwood City":"Eastwood City","Venice Grand Canal Mall":"Venice Grand Canal Mall","CCP Complex":"Cultural Center of the Philippines","Metropolitan Theater":"Manila Metropolitan Theater","San Sebastian Church":"San Sebastian Church, Manila","Binondo Church":"Binondo Church","Manila Zoo":"Manila Zoological and Botanical Garden","Taal Basilica":"Taal Basilica","Imus Cathedral":"Imus Cathedral","Hulugan Falls":"Hulugan Falls","Lake Lanao":"Lake Lanao","Lake Holon":"Lake Holon","Mt. Mariveles":"Mount Mariveles","Mt. Tapulao":"Mount Tapulao","Mt. Mandalagan":"Mount Mandalagan","Mt. Bulusan":"Bulusan Volcano","Mt. Hibok-Hibok":"Hibok-Hibok","Mt. Iraya":"Mount Iraya","Mt. Asog":"Mount Iriga","Cape Engaño Lighthouse":"Cape Engaño Lighthouse","Pagsanjan Church":"Pagsanjan","Sinking Bell Tower":"Laoag Sinking Bell Tower","Malacañang of the North":"Malacañang of the North","La Paz Sand Dunes":"La Paz Sand Dunes","Sirao Pictorial Garden":"Sirao Pictorial Garden","Chocolate Hills Adventure Park":"Chocolate Hills","Lake Danao Natural Park":"Lake Danao","Loboc River":"Loboc River","Alona Beach":"Panglao, Bohol","Magellan's Cross":"Magellan's Cross","Basilica del Santo Niño":"Basilica del Santo Niño","Fort San Pedro":"Fort San Pedro","Taoist Temple Cebu":"Taoist Temple (Cebu)","Boljoon Church":"Boljoon Church","Baclayon Church":"Baclayon Church","Jaro Cathedral":"Jaro Cathedral","Molo Church":"Molo Church","Cambugahay Falls":"Cambugahay Falls","Tumalog Falls":"Tumalog Falls","Pearl Farm Beach Resort":"Pearl Farm Beach Resort","Grand Mosque Cotabato":"Sultan Haji Hassanal Bolkiah Masjid","Rizal Park":"Rizal Park","Manila Cathedral":"Manila Cathedral","San Agustin Church":"San Agustin Church (Manila)","Fort Santiago":"Fort Santiago","Casa Manila":"Casa Manila","Ayala Museum":"Ayala Museum","Mind Museum":"The Mind Museum"};
const IMG_URL={};

const IMG_BAD=/seal|flag|locator|logo|coat_of|emblem|_map|map_|blank|\.svg|icon|diagram|poster|chart|signature/i;
const _ic=(()=>{try{return JSON.parse(localStorage.getItem("dimg2")||"{}")}catch(e){return{}}})();
const _sv=()=>{try{localStorage.setItem("dimg2",JSON.stringify(_ic))}catch(e){}};
const WIKI="https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages|info&piprop=thumbnail|name&pithumbsize=800&inprop=url";
const COMMONS="https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|mime&iiurlwidth=800&gsrsearch=";

async function jget(u){const r=await fetch(u);if(!r.ok)throw 0;return r.json()}
async function wikiQuery(url){
 const j=await jget(url);
 const pages=Object.values((j.query||{}).pages||{}).sort((a,b)=>(a.index||0)-(b.index||0));
 const ok=pages.find(p=>p.thumbnail&&!IMG_BAD.test(p.pageimage||""));
 return ok?{u:ok.thumbnail.source,p:ok.fullurl}:null}
async function commonsQuery(q){
 const j=await jget(COMMONS+encodeURIComponent(q+" filetype:bitmap"));
 const pages=Object.values((j.query||{}).pages||{}).sort((a,b)=>(a.index||0)-(b.index||0));
 const ok=pages.find(p=>{const i=(p.imageinfo||[])[0];return i&&i.mime=="image/jpeg"&&!IMG_BAD.test(p.title)});
 if(!ok)return null;const i=ok.imageinfo[0];return{u:i.thumburl||i.url,p:i.descriptionurl}}
const loads=u=>new Promise(res=>{const im=new Image(),t=setTimeout(()=>res(false),7000);im.onload=()=>{clearTimeout(t);res(true)};im.onerror=()=>{clearTimeout(t);res(false)};im.src=u});

async function chain(d){
 const T=IMG_TITLES[d.n],E=encodeURIComponent,tries=[];
 if(T)tries.push(()=>wikiQuery(`${WIKI}&redirects=1&titles=${E(T)}`));
 tries.push(()=>wikiQuery(`${WIKI}&generator=search&gsrlimit=4&gsrsearch=${E(d.n+" "+d.p+" Philippines")}`));
 tries.push(()=>wikiQuery(`${WIKI}&generator=search&gsrlimit=4&gsrsearch=${E(d.n+" Philippines")}`));
 tries.push(()=>commonsQuery(d.n+" "+d.p));
 tries.push(()=>commonsQuery(d.n+" Philippines"));
 tries.push(()=>wikiQuery(`${WIKI}&redirects=1&titles=${E(d.p)}`));
 for(const f of tries){try{const r=await f();if(r&&await loads(r.u))return r}catch(e){}}
 return null}

/* generated illustration: one scene per destination type, varied by name so neighbours do not look identical */
function illust(d){
 const c=(typeof TC!="undefined"&&TC[d.t])||["#134d46","#3f8f6f"];let h=0;for(const ch of d.n)h=(h*31+ch.charCodeAt(0))>>>0;
 const sx=120+h%560,hy=330+h%40,s=1+(h%5)/10;
 const sun=`<circle cx="${sx}" cy="120" r="46" fill="#fff6d6" opacity=".9"/><circle cx="${sx}" cy="120" r="78" fill="#fff6d6" opacity=".18"/>`;
 const cloud=`<g fill="#fff" opacity=".35"><ellipse cx="${(sx+300)%760+20}" cy="90" rx="70" ry="14"/><ellipse cx="${(sx+340)%760+20}" cy="78" rx="40" ry="12"/></g>`;
 const palm=(x,y,k)=>`<path d="M${x} ${y}Q${x+14*k} ${y-70*k} ${x-6*k} ${y-140*k}" stroke="#4a2f1a" stroke-width="${7*k}" fill="none" stroke-linecap="round"/>`+[-50,-15,20,160,195,235].map(a=>`<ellipse cx="${x-6*k+34*k*Math.cos(a*Math.PI/180)}" cy="${y-140*k+34*k*Math.sin(a*Math.PI/180)}" rx="${36*k}" ry="${8*k}" transform="rotate(${a} ${x-6*k+34*k*Math.cos(a*Math.PI/180)} ${y-140*k+34*k*Math.sin(a*Math.PI/180)})" fill="#1f7a4f"/>`).join("");
 const waves=(y,o)=>`<path d="M0 ${y}Q100 ${y-16} 200 ${y}T400 ${y}T600 ${y}T800 ${y}V500H0Z" fill="#fff" opacity="${o}"/>`;
 const peaks=(col,y,o)=>`<path d="M0 ${y}L130 ${y-130*s}L230 ${y-40}L360 ${y-190*s}L500 ${y-30}L620 ${y-120*s}L800 ${y}V500H0Z" fill="${col}" opacity="${o}"/>`;
 const trees=(y)=>[60,150,260,380,470,590,700].map((x,i)=>`<path d="M${x} ${y}l30 -${70+(i*9)%30}l30 ${70+(i*9)%30}z" fill="#14532d" opacity=".85"/>`).join("");
 const S={
  Beach:()=>sun+cloud+`<rect y="300" width="800" height="200" fill="#ffffff" opacity=".2"/>`+waves(330,.25)+`<path d="M0 380Q200 350 400 385T800 370V500H0Z" fill="#f4e2b8"/>`+palm(610,400,1.2)+palm(560,410,.8),
  Island:()=>sun+cloud+`<rect y="310" width="800" height="190" fill="#ffffff" opacity=".18"/>`+`<path d="M200 340Q300 250 420 300Q520 260 600 340Z" fill="#14532d"/>`+waves(350,.2)+palm(400,335,.7),
  Mountain:()=>sun+cloud+peaks("#0b3b2e",hy+80,.75)+peaks("#134d46",hy+120,.95)+`<path d="M360 ${hy-70*s}l-26 50h52z" fill="#fff" opacity=".85"/>`,
  Waterfall:()=>cloud+`<rect x="0" y="130" width="300" height="370" fill="#0b3b2e"/><rect x="500" y="130" width="300" height="370" fill="#134d46"/><rect x="300" y="140" width="200" height="300" fill="#fff" opacity=".25"/>`+[320,350,380,410,440,470].map(x=>`<rect x="${x}" y="140" width="10" height="300" fill="#fff" opacity=".7"/>`).join("")+`<ellipse cx="400" cy="450" rx="190" ry="34" fill="#9be7d8" opacity=".6"/>`+trees(150),
  Heritage:()=>sun+`<rect x="250" y="240" width="300" height="160" fill="#f1d9b0"/><rect x="250" y="130" width="70" height="270" fill="#f1d9b0"/><rect x="480" y="130" width="70" height="270" fill="#f1d9b0"/><path d="M244 130l41 -50l41 50zM474 130l41 -50l41 50z" fill="#8a4b2d"/><path d="M360 400v-90a40 40 0 0 1 80 0v90z" fill="#8a4b2d"/><circle cx="400" cy="270" r="18" fill="#8a4b2d"/><rect y="400" width="800" height="100" fill="#000" opacity=".25"/>`,
  City:()=>sun+[40,130,230,320,420,520,620,700].map((x,i)=>{const hh=140+((i*53+h)%160);return `<rect x="${x}" y="${420-hh}" width="70" height="${hh+80}" fill="#1f2a44" opacity=".9"/>`+[0,1,2,3].map(k=>`<rect x="${x+12}" y="${440-hh+k*34}" width="12" height="12" fill="#ffd77a" opacity=".8"/><rect x="${x+40}" y="${440-hh+k*34}" width="12" height="12" fill="#ffd77a" opacity=".6"/>`).join("")}).join(""),
  Diving:()=>`<rect width="800" height="500" fill="#0b3f6b" opacity=".35"/>`+[120,300,470,640].map((x,i)=>`<circle cx="${x}" cy="${380-i*60}" r="${8+i*3}" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>`).join("")+`<path d="M300 250q60-40 120 0q-60 40-120 0zM420 250l40 -26v52z" fill="#ffb347"/><path d="M520 330q40-26 80 0q-40 26-80 0zM600 330l26 -18v36z" fill="#ff7a8a"/><path d="M0 480q50-100 100 0q50-120 100 0t100 0t100 0t100 0t100 0t100 0t100 0z" fill="#ff7a8a" opacity=".8"/>`,
  Surf:()=>sun+`<rect y="300" width="800" height="200" fill="#fff" opacity=".18"/><path d="M80 420Q220 260 420 300Q560 330 540 420Q400 350 300 400Q200 420 80 420Z" fill="#fff" opacity=".85"/><path d="M0 440Q200 400 400 440T800 430V500H0Z" fill="#fff" opacity=".35"/>`,
  Cave:()=>`<rect width="800" height="500" fill="#10201e" opacity=".55"/><path d="M120 500V300Q400 20 680 300V500H520V330Q400 170 280 330V500Z" fill="#1d2b29"/><path d="M280 500V340Q400 190 520 340V500Z" fill="#9be7d8" opacity=".5"/>`+[330,380,430,470].map(x=>`<path d="M${x} 190l8 40l8 -40z" fill="#2c3d3a"/>`).join(""),
  Lake:()=>sun+cloud+peaks("#134d46",hy+20,.8)+`<rect y="360" width="800" height="140" fill="#7fc6c0"/>`+[390,420,450,480].map((y,i)=>`<path d="M${120+i*30} ${y}H${680-i*30}" stroke="#fff" stroke-width="3" opacity=".5"/>`).join(""),
  Nature:()=>sun+cloud+peaks("#2f6b3d",hy+60,.6)+trees(420)+trees(470),
  Adventure:()=>sun+peaks("#7a3b1d",hy+60,.8)+`<path d="M60 160L740 300" stroke="#222" stroke-width="3"/><circle cx="420" cy="230" r="9" fill="#ff4d4d"/><path d="M420 239v26M410 250h20" stroke="#ff4d4d" stroke-width="4"/>`
 };
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient></defs><rect width="800" height="500" fill="url(#g)"/>${(S[d.t]||S.Nature)()}</svg>`;
 return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg)}

function getImg(d){
 if(d.img!==undefined)return Promise.resolve(d.img);
 if(IMG_URL[d.n]){d.img=IMG_URL[d.n];d.imgPage=null;return Promise.resolve(d.img)}
 const c=_ic[d.n];
 if(c&&c.u){d.img=c.u;d.imgPage=c.p||null;return Promise.resolve(d.img)}
 if(c&&c.i&&Date.now()-c.t<864e5*2){d.img=illust(d);d.imgPage=null;return Promise.resolve(d.img)}
 return chain(d).then(r=>{
  if(r){_ic[d.n]={u:r.u,p:r.p};d.img=r.u;d.imgPage=r.p}
  else{_ic[d.n]={i:1,t:Date.now()};d.img=illust(d);d.imgPage=null}
  _sv();return d.img}).catch(()=>{d.img=illust(d);d.imgPage=null;return d.img})}
