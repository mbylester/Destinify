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
"Maria Cristina Falls":"Maria Cristina Falls","Mt. Kitanglad":"Mount Kitanglad","Mt. Hamiguitan":"Mount Hamiguitan","Mt. Matutum":"Mount Matutum",
"Corregidor Island":"Corregidor","Mt. Banahaw":"Mount Banahaw","Mt. Arayat":"Mount Arayat","Mt. Maculot":"Mount Maculot","Mt. Makiling":"Mount Makiling","Mt. Isarog":"Mount Isarog","Mt. Halcon":"Mount Halcon","Mt. Guiting-Guiting":"Mount Guiting-Guiting","Mt. Natib":"Mount Natib","Mt. Talinis":"Cuernos de Negros","Mt. Madja-as":"Mount Madja-as","Mt. Malindang":"Mount Malindang","Mt. Kalatungan":"Mount Kalatungan","Mt. Samat":"Mount Samat","Mt. Daraitan":"Mount Daraitan","Mt. Ulap":"Mount Ulap","Mt. Talamitam":"Mount Talamitam","Bontoc":"Bontoc, Mountain Province","Masungi Georeserve":"Masungi Georeserve","Bantay Church":"Bantay Church","Manaoag Church":"Manaoag Church","Antipolo":"Antipolo","Rizal Park":"Rizal Park","Bonifacio Global City":"Bonifacio Global City","Makati":"Makati","Quezon City":"Quezon City","Legazpi City":"Legazpi, Albay","Naga City":"Naga, Camarines Sur","Dagupan":"Dagupan","Laoag City":"Laoag","Tuguegarao":"Tuguegarao","Butuan":"Butuan","Iligan City":"Iligan","Pagadian":"Pagadian","Kidapawan":"Kidapawan","Mati":"Mati, Davao Oriental","Ormoc":"Ormoc","Silay":"Silay","Carcar":"Carcar","Dauin":"Dauin","Bais City":"Bais, Negros Oriental","Palo":"Palo, Leyte","Surigao City":"Surigao City","Loboc River":"Loboc River","Baclayon Church":"Baclayon Church","Dauis Church":"Dauis Church","Jaro Cathedral":"Jaro Metropolitan Cathedral","Molo Church":"Molo Church","San Joaquin Church":"San Joaquin Church","Panay Church":"Panay Church","Hinagdanan Cave":"Hinagdanan Cave","Pamilacan Island":"Pamilacan Island","Cabilao Island":"Cabilao Island","Olango Island":"Olango Island","Pescador Island":"Pescador Island","Gato Island":"Gato Island","Sumilon Island":"Sumilon Island","Capul Island":"Capul, Northern Samar","Balangiga Church":"Balangiga, Eastern Samar","Fort Pilar":"Fort Pilar","Asik-Asik Falls":"Asik-Asik Falls","Tumalog Falls":"Tumalog Falls","Cambugahay Falls":"Cambugahay Falls","Jawili Falls":"Jawili Falls","Pinsal Falls":"Pinsal Falls","Tangadan Falls":"Tangadan Falls","Taytay Falls":"Taytay Falls","Tamaraw Falls":"Tamaraw Falls","Lulugayan Falls":"Lulugayan Falls","Tarangban Falls":"Tarangban Falls","Mantayupan Falls":"Mantayupan Falls","Bomod-ok Falls":"Bomod-ok Falls","Pulangbato Falls":"Pulangbato Falls","Calauit Safari Park":"Calauit Safari Park","Tabon Caves":"Tabon Caves","Hoyop-Hoyopan Cave":"Hoyop-Hoyopan Cave","Langun-Gobingob Caves":"Langun-Gobingob Cave","San Vicente":"San Vicente, Palawan","Taytay":"Taytay, Palawan","Cuyo Island":"Cuyo, Palawan","Itbayat":"Itbayat","Fuga Island":"Fuga Island","Polillo Island":"Polillo Islands","Lubang Island":"Lubang Island","Ticao Island":"Ticao","Bulalacao":"Bulalacao, Oriental Mindoro","Naujan Lake":"Lake Naujan","Seven Lakes of San Pablo":"Seven Lakes of San Pablo","Lake Caliraya":"Lake Caliraya","Lake Buhi":"Lake Buhi","Candaba Swamp":"Candaba Swamp","Pililla Wind Farm":"Pililla Wind Farm","Real":"Real, Quezon","Cagbalete Island":"Cagbalete","Capones Island":"Capones Island","Dingalan":"Dingalan","Villa Escudero":"Villa Escudero Plantations and Resort","Kamay ni Hesus":"Kamay ni Hesus","Barasoain Church":"Barasoain Church","Aguinaldo Shrine":"Aguinaldo Shrine","Biak-na-Bato":"Biak-na-Bato National Park","Mayoyao Rice Terraces":"Mayoyao","Kabayan Mummy Caves":"Kabayan Mummy Caves","Chico River":"Chico River","Currimao":"Currimao","La Trinidad":"La Trinidad, Benguet","Cape Bojeador Lighthouse":"Cape Bojeador Lighthouse","Nogas Island":"Nogas Island","Caluya Islands":"Caluya","Pan de Azucar Island":"Pan de Azucar Island","Lakawon Island":"Lakawon Island","Twin Lakes of Balinsasayao":"Twin Lakes Natural Park","Manjuyod Sandbar":"Manjuyod","Simala Shrine":"Simala Shrine","Marabut":"Marabut, Samar","Maitum":"Maitum","Mantigue Island":"Mantigue Island","Guyam Island":"Guyam Island","Maragusan Valley":"Maragusan","Pasonanca Park":"Pasonanca Natural Park","Simunul Island":"Simunul"};
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
