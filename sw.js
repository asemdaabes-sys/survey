/* Survey Studio offline cache. Bump VERSION when index.html changes so the iPad picks up the new copy. */
const VERSION="survey-studio-v1";
const CORE=["./","index.html","manifest.json","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const url=new URL(req.url);
  /* app pages: use the network when available (to get updates), fall back to the stored copy offline */
  if(url.origin===location.origin){
    e.respondWith(fetch(req).then(r=>{if(r.ok){const cp=r.clone();caches.open(VERSION).then(c=>c.put(req,cp))}return r})
      .catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match("index.html"))));return}
  /* fonts: stored after first use */
  if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(n=>{const cp=n.clone();caches.open(VERSION).then(c=>c.put(req,cp));return n})));}
});
