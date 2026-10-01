/* Destinify offline cache: network first, falls back to the last copy when offline. */
const C="destinify-v1";
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(clients.claim()));
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);
 if(e.request.method!="GET"||!(u.origin==location.origin||/cdn|fonts\.g|wikimedia/.test(u.host)))return;
 e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)))});
