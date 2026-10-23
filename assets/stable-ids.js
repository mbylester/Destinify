/* Destinify stable destination IDs.
   Every destination has a permanent slug (d.id), for example "el-nido" or "paoay-church-and-dunes", made from its name.
   The number d.i is only the place's position in the list for this page view, so it changes whenever data.js changes.
   Trips, favorites, reviews, the day plan and share links are therefore saved by slug, never by position.
   This file converts between the two whenever the site reads or writes saved data, so reordering, inserting or deleting
   rows in data.js can no longer break anything people saved. Old saved data (saved by position) is converted automatically.

   Renaming a place? Add the old slug here so saved references keep working:  ALIASES = {"old-slug":"new-slug"}
   Two places with the same name? Pin one slug by hand:                         PINNED  = {"Exact Name":"custom-slug"} */
(()=>{
const ALIASES={},PINNED={};
const slugify=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/&/g," and ").replace(/['’`]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
/* admin-added places (browser mode) join the list before the app builds it, so saved references to them resolve at startup */
try{if(!window.DB_MODE&&typeof RAW==="string"){const c=JSON.parse(localStorage.getItem("dcustom")||"[]"),cl=x=>String(x).replace(/[|\r\n]/g," ");
 const rows=c.filter(o=>o&&o.n&&!RAW.includes("\n"+o.n+"|")&&!RAW.startsWith(o.n+"|")).map(o=>[o.n,o.p,o.g,o.la,o.ln,o.t,o.b,o.d,(o.a||[]).join(" "),o.o?1:0,(o.bs||11)+"-"+(o.be||5)].map(cl).join("|"));
 if(rows.length)RAW=RAW.replace(/\s+$/,"")+"\n"+rows.join("\n")}}catch(e){}
const S={len:-1,A:null,byIdx:[],bySlug:{}},rs=s=>{let k=0;while(ALIASES[s]&&k++<8)s=ALIASES[s];return s};
function refresh(){const A=typeof D!=="undefined"?D:null;if(!A||!A.length)return null;if(S.A===A&&S.len===A.length)return S;
 const used={};S.byIdx=[];S.bySlug={};
 A.forEach((d,i)=>{if(!d.id){let s=PINNED[d.n]||slugify(d.n)||"place";if(used[s])s=slugify(d.n+" "+d.p);const b=s;let k=2;while(used[s])s=b+"-"+k++;d.id=s}
  used[d.id]=1;S.byIdx[i]=d.id;S.bySlug[d.id]=i});
 S.A=A;S.len=A.length;return S}
const isNum=x=>typeof x==="number"||(typeof x==="string"&&/^\d+$/.test(x));
const idxOf=x=>{const m=refresh();if(!m)return null;if(isNum(x))return m.byIdx[+x]!==undefined?+x:null;const k=m.bySlug[rs(String(x))];return k===undefined?null:k};
const slugOf=x=>{const m=refresh();if(!m)return null;return isNum(x)?(m.byIdx[+x]||null):rs(String(x))};
const orphans=ex=>(Array.isArray(ex)?ex:[]).filter(x=>typeof x==="string"&&!isNum(x)&&idxOf(x)===null);
const arr={from:a=>(Array.isArray(a)?a:[]).map(idxOf).filter(n=>n!==null),
 to:(a,ex)=>{const s=(Array.isArray(a)?a:[]).map(slugOf).filter(Boolean);orphans(ex).forEach(o=>{if(!s.includes(o))s.push(o)});return s}};
const TR={dtrip:arr,dfav:arr,dview:arr,
 drev:{from:o=>{const r={};Object.keys(o||{}).forEach(k=>{const i=idxOf(k);if(i!==null)r[i]=(r[i]||[]).concat(o[k])});return r},
  to:(o,ex)=>{const r={};Object.keys(o||{}).forEach(k=>{const s=slugOf(k);if(s)r[s]=(r[s]||[]).concat(o[k])});
   Object.keys(ex||{}).forEach(k=>{if(!isNum(k)&&idxOf(k)===null&&!r[k])r[k]=ex[k]});return r}},
 dplan:{from:p=>{if(!p||!p.days)return p;return{sig:String(p.sig||"").split(",").map(idxOf).filter(n=>n!==null).join(","),days:p.days.map(d=>d.map(c=>{const[a,k]=String(c).split(":"),i=idxOf(a);return i===null?null:i+":"+k}).filter(Boolean))}},
  to:p=>{if(!p||!p.days)return p;return{sig:String(p.sig||"").split(",").map(slugOf).filter(Boolean).join(","),days:p.days.map(d=>d.map(c=>{const[a,k]=String(c).split(":"),s=slugOf(a);return s?s+":"+k:null}).filter(Boolean))}}},
 dusers:{from:u=>(Array.isArray(u)?u:[]).map(x=>({...x,trip:arr.from(x.trip),fav:arr.from(x.fav)})),
  to:(u,ex)=>(Array.isArray(u)?u:[]).map(x=>{const o=(Array.isArray(ex)?ex:[]).find(y=>y&&y.u===x.u)||{};return{...x,trip:arr.to(x.trip,o.trip),fav:arr.to(x.fav,o.fav)}})}};
const P=Storage.prototype,g0=P.getItem,s0=P.setItem;
P.getItem=function(k){const v=g0.call(this,k);if(this!==localStorage||v==null||!TR[k]||!refresh())return v;try{return JSON.stringify(TR[k].from(JSON.parse(v)))}catch(e){return v}};
P.setItem=function(k,v){if(this===localStorage&&TR[k]&&refresh()){try{v=JSON.stringify(TR[k].to(JSON.parse(v),JSON.parse(g0.call(this,k)||"null")))}catch(e){}}return s0.call(this,k,v)};
window.DID={refresh,idx:idxOf,slug:i=>{const m=refresh();return m?m.byIdx[i]||null:null},slugify};
})();
