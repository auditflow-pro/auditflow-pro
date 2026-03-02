const CACHE_NAME="auditflow-pro-v6";

const ASSETS=[
  "./",
  "./index.html",
  "./styles.css?v=6001",
  "./app.js?v=6001",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install",e=>{
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS))
  );
});

self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys().then(keys=>{
      return Promise.all(
        keys.map(key=>{
          if(key!==CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;

  e.respondWith(
    fetch(e.request)
      .then(res=>{
        const clone=res.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(e.request,clone));
        return res;
      })
      .catch(()=>caches.match(e.request))
  );
});