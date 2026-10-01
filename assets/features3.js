/* Destinify v6 add-on: photo gallery (Wikimedia Commons) + live weather (Open-Meteo, no API key).
   If a gallery shows the wrong place, add a better search phrase to IMG_Q, e.g. "Tanay":"Daranak Falls Rizal". */
(()=>{
const{LS,esc}=DX,IMG_Q={};
const WC=c=>c==0?["☀️","Clear"]:c<=2?["🌤️","Partly cloudy"]:c==3?["☁️","Overcast"]:c<=48?["🌫️","Fog"]:c<=57?["🌦️","Drizzle"]:c<=67?["🌧️","Rain"]:c<=82?["🌧️","Showers"]:["⛈️","Thunderstorm"];
const J=async(u,k,ttl)=>{try{const c=JSON.parse(sessionStorage.getItem(k)||"null");if(c&&Date.now()-c.t<ttl)return c.v}catch(e){}
 const v=await(await fetch(u)).json();try{sessionStorage.setItem(k,JSON.stringify({t:Date.now(),v}))}catch(e){}return v};
const OM="https://api.open-meteo.com/v1/forecast?timezone=Asia%2FManila";
const wx=d=>J(`${OM}&latitude=${d.la}&longitude=${d.ln}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=5`,"wx"+d.i,18e5);
function wxH(j){const c=j.current,u=j.daily,[e,t]=WC(c.weather_code),storm=c.wind_speed_10m>40||u.weather_code.some(x=>x>=95);
 return `<h4>WEATHER NOW</h4><div class="wxn"><span class="wxe">${e}</span><div><b>${Math.round(c.temperature_2m)}°C</b> ${t}<br><small>Feels ${Math.round(c.apparent_temperature)}° · Humidity ${c.relative_humidity_2m}% · Wind ${Math.round(c.wind_speed_10m)} km/h</small></div></div><div class="wxd">${u.time.map((x,k)=>`<div><span>${new Date(x+"T00:00").toLocaleDateString("en",{weekday:"short"})}</span>${WC(u.weather_code[k])[0]}<b>${Math.round(u.temperature_2m_max[k])}°</b><small>${Math.round(u.temperature_2m_min[k])}° · ${u.precipitation_probability_max[k]??0}%</small></div>`).join("")}</div>${storm?'<p class="note" style="color:var(--coral-d)">Strong winds or storms are in the forecast. Check PAGASA and keep boat and flight plans flexible.</p>':'<p class="note">5-day forecast from Open-Meteo. Rain % is the chance of rain.</p>'}`}
/* gallery */
let G={i:0,r:[]};
async function gal(d){const c=LS("dgal2")||{};if(c[d.n])return c[d.n];
 const j=await(await fetch(`https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=24&gsrsearch=${encodeURIComponent((IMG_Q[d.n]||d.n+" "+d.p)+" filetype:bitmap")}&prop=imageinfo&iiprop=url|extmetadata|mime&iiurlwidth=900`)).json();
 const bad=/map|flag|logo|seal|locator|coat|diagram|poster|chart|stamp|screenshot/i,strip=x=>x?String(x.value).replace(/<[^>]*>/g,"").slice(0,60):"";
 const r=Object.values((j.query||{}).pages||{}).sort((a,b)=>a.index-b.index).filter(p=>{const i=(p.imageinfo||[])[0];return i&&i.mime=="image/jpeg"&&!bad.test(p.title)})
  .slice(0,8).map(p=>{const i=p.imageinfo[0],m=i.extmetadata||{};return{u:i.thumburl||i.url,f:i.url,p:i.descriptionurl,a:strip(m.Artist),l:strip(m.LicenseShortName)}});
 if(r.length){c[d.n]=r;LS("dgal2",c)}return r}
function drawG(){const e=$("xg3");if(!e)return;const p=G.r[G.i];
 e.innerHTML=`<h4>PHOTOS · ${G.i+1}/${G.r.length}</h4><div class="xmain"><a href="${p.f}" target="_blank" rel="noopener"><img src="${p.u}" alt=""></a><button data-x3="gp" aria-label="Previous photo">‹</button><button data-x3="gn" aria-label="Next photo">›</button></div><div class="xcr"><a href="${p.p}" target="_blank" rel="noopener">Photo${p.a?": "+esc(p.a):""}${p.l?" · "+esc(p.l):""} · Wikimedia Commons</a></div><div class="xth">${G.r.map((q,k)=>`<button data-x3="g" data-k="${k}" class="${k==G.i?"on":""}" aria-label="Photo ${k+1}"><img src="${q.u}" alt="" loading="lazy"></button>`).join("")}</div>`}
const _od=openDetail;openDetail=i=>{_od(i);const d=D[i];$("dmc").scrollTop=0;
 $("dmc").querySelector(".mh").insertAdjacentHTML("afterend",'<div class="dsc" id="xg3"><h4>PHOTOS</h4><p class="note">Loading photos…</p></div><div class="dsc" id="xwx"><p class="note">Loading weather…</p></div>');
 gal(d).then(r=>{if(st.cur!=i||!$("xg3"))return;if(!r.length)return $("xg3").remove();G={i:0,r};drawG()}).catch(()=>{$("xg3")&&$("xg3").remove()});
 wx(d).then(j=>{if(st.cur==i&&$("xwx"))$("xwx").innerHTML=wxH(j)}).catch(()=>{$("xwx")&&($("xwx").innerHTML='<p class="note">Weather is unavailable right now.</p>')})};
document.addEventListener("click",e=>{const t=e.target.closest("[data-x3]");if(!t||!G.r.length)return;const x=t.dataset.x3,n=G.r.length;
 if(x=="gp")G.i=(G.i+n-1)%n;else if(x=="gn")G.i=(G.i+1)%n;else G.i=+t.dataset.k;drawG()});
/* weather on each trip stop */
const _rt=renderTrip;renderTrip=()=>{_rt();const T=st.trip.slice(0,10).map(i=>D[i]);if(!T.length)return;
 J(`${OM}&latitude=${T.map(d=>d.la).join(",")}&longitude=${T.map(d=>d.ln).join(",")}&current=temperature_2m,weather_code`,"wxt"+T.map(d=>d.i).join("-"),18e5)
 .then(j=>{const a=Array.isArray(j)?j:[j];document.querySelectorAll("#tripBody .stop .t span").forEach((s,k)=>{const c=a[k]&&a[k].current;if(c&&!s.dataset.w){s.dataset.w=1;s.textContent+=` · ${WC(c.weather_code)[0]} ${Math.round(c.temperature_2m)}°C`}})}).catch(()=>{})};
DX.wx=wx;
render();
})();
