/* Destinify v15: anonymous usage counts for the admin Overview, and the password reset link.
   Counts: which places are opened and what people search for. Nothing about the visitor is kept (no account, no IP address).
   With the database connected the counts go to api/track.php; on static hosting they stay in this browser (localStorage "dstats").
   Admins are not counted, so the owner's own browsing does not change the numbers. */
(()=>{
const{LS}=DX,API=()=>!!(window.DBAPI&&DBAPI.on),isAdmin=()=>{const u=DX.U();return !!u&&u.role=="admin"};
const seen=new Set();
function bump(kind,key,label){
 if(isAdmin())return;
 if(API()){
  const body=kind=="view"?{kind:"view",destination_id:DBAPI.ids[key]}:{kind:"search",q:label};
  if(kind=="view"&&!body.destination_id)return;
  DBAPI.post("track.php",body).catch(()=>{});return}
 const o=LS("dstats")||{v:{},s:{}},m=kind=="view"?(o.v=o.v||{}):(o.s=o.s||{});
 m[label]=(m[label]||0)+1;
 const keep=x=>Object.fromEntries(Object.entries(x).sort((a,b)=>b[1]-a[1]).slice(0,200));   // keep storage small
 o.v=keep(o.v||{});o.s=keep(o.s||{});LS("dstats",o)}
/* a place counts once per visit to the site, however many times it is reopened */
const _od=openDetail;openDetail=i=>{_od(i);const d=D[i];if(d&&!seen.has(i)){seen.add(i);bump("view",i,d.n)}};
/* a search counts after the person stops typing, once per different phrase */
function watch(id){const el=document.getElementById(id);if(!el)return;let t,last="";
 el.addEventListener("input",()=>{clearTimeout(t);t=setTimeout(()=>{const q=el.value.trim().replace(/\s+/g," ").toLowerCase();if(q.length<3||q==last)return;last=q;bump("search",null,q)},1800)})}
watch("q");watch("xsq");
/* ?reset=TOKEN opens the "choose a new password" box (only with the database connected) */
try{const t=new URLSearchParams(location.search).get("reset");
 if(t&&/^[a-f0-9]{64}$/.test(t)&&API())setTimeout(()=>DX.resetOpen(t),400)}catch(e){}
})();
