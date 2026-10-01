/* Destinify photo loader.
   Looks up each destination on Wikipedia (live, in the browser) and uses the article's lead photo.
   Photos come from Wikipedia / Wikimedia Commons under their own licenses, so a credit link is shown with each one.
   Results are cached in localStorage, and a place with no usable photo keeps its colored gradient.

   To fix or force a photo:
   - IMG_TITLES: map a destination name to the exact Wikipedia article title.
   - IMG_URL: map a destination name to your own image URL or file, e.g. "assets/img/el-nido.jpg". */
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
"Nagcarlan Underground Cemetery":"Nagcarlan Underground Cemetery","Boracay":"Boracay","Kalibo":"Kalibo, Aklan","Iloilo City":"Iloilo City","Miagao Church":"Miagao Church",
"Guimaras":"Guimaras","Bacolod":"Bacolod","Canlaon Volcano":"Mount Kanlaon","Dumaguete":"Dumaguete","Apo Island":"Apo Island","Siquijor":"Siquijor",
"Cebu City":"Cebu City","Mactan":"Mactan Island","Moalboal":"Moalboal","Kawasan Falls":"Kawasan Falls","Oslob":"Oslob","Malapascua":"Malapascua Island",
"Bantayan Island":"Bantayan Island","Camotes Islands":"Camotes Islands","Chocolate Hills":"Chocolate Hills","Tarsier Sanctuary":"Philippine Tarsier Sanctuary",
"Panglao":"Panglao, Bohol","Balicasag Island":"Balicasag Island","Anda":"Anda, Bohol","Tacloban":"Tacloban","Sohoton Caves":"Sohoton Natural Bridge National Park",
"Sogod Bay":"Sogod Bay","Calicoan Island":"Calicoan","Biri Islands":"Biri, Northern Samar","General Luna, Siargao":"General Luna, Surigao del Norte",
"Camiguin":"Camiguin","Cagayan de Oro":"Cagayan de Oro","Zamboanga City":"Zamboanga City","Dapitan":"Dapitan","Dipolog":"Dipolog","Bongao":"Bongao",
"Davao City":"Davao City","Mt. Apo":"Mount Apo","Samal Island":"Samal Island","General Santos":"General Santos","Lake Sebu":"Lake Sebu",
"Enchanted River":"Hinatuan Enchanted River","Philippine Eagle Center":"Philippine Eagle Center","Tinuy-an Falls":"Tinuy-an Falls",
"Maria Cristina Falls":"Maria Cristina Falls","Mt. Kitanglad":"Mount Kitanglad","Mt. Hamiguitan":"Mount Hamiguitan","Mt. Matutum":"Mount Matutum"};
const IMG_URL={};

const IMG_BAD=/seal|flag|locator|logo|coat_of|emblem|_map|map_|blank|\.svg/i;
const _ic=(()=>{try{return JSON.parse(localStorage.getItem("dimg")||"{}")}catch(e){return{}}})();
const _sv=()=>{try{localStorage.setItem("dimg",JSON.stringify(_ic))}catch(e){}};
const WIKI="https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages|info&piprop=thumbnail|name&pithumbsize=800&inprop=url";

async function wikiQuery(url){
 const j=await (await fetch(url)).json();
 const pages=Object.values((j.query||{}).pages||{}).sort((a,b)=>(a.index||0)-(b.index||0));
 const ok=pages.find(p=>p.thumbnail&&!IMG_BAD.test(p.pageimage||""));
 return ok?{u:ok.thumbnail.source,p:ok.fullurl}:null}

async function fetchWiki(d){
 const t=IMG_TITLES[d.n];let r=null;
 if(t)r=await wikiQuery(`${WIKI}&redirects=1&titles=${encodeURIComponent(t)}`);
 if(!r)r=await wikiQuery(`${WIKI}&generator=search&gsrlimit=4&gsrsearch=${encodeURIComponent(d.n+" "+d.p+" Philippines")}`);
 return r}

function getImg(d){
 if(d.img!==undefined)return Promise.resolve(d.img);
 if(IMG_URL[d.n]){d.img=IMG_URL[d.n];d.imgPage=null;return Promise.resolve(d.img)}
 const c=_ic[d.n];
 if(c!==undefined){d.img=c?c.u:null;d.imgPage=c?c.p:null;return Promise.resolve(d.img)}
 return fetchWiki(d).then(r=>{_ic[d.n]=r||0;_sv();d.img=r?r.u:null;d.imgPage=r?r.p:null;return d.img}).catch(()=>{d.img=null;return null})}
