const CACHE_NAME = "auditflow-pro-v2000";

const ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=2000",
  "./app.js?v=2000",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
});

self.addEventListener("activate", e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.map(k=>{
        if(k!==CACHE_NAME) return caches.delete(k);
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e=>{
  if(e.request.method!=="GET") return;
  e.respondWith(
    fetch(e.request)
      .then(r=>{
        const clone=r.clone();
        caches.open(CACHE_NAME).then(c=>c.put(e.request,clone));
        return r;
      })
      .catch(()=>caches.match(e.request))
  );
});