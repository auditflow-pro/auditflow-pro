const CACHE_NAME="auditflow-v10.0"

const urls=[
"./",
"./index.html?v=10.0",
"./assessment.html?v=10.0",
"./styles.css?v=10.0",
"./app.js?v=10.0",
"./manifest.json?v=10.0"
]

self.addEventListener("install",e=>{
self.skipWaiting()
e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(urls)))
})

self.addEventListener("activate",e=>{
e.waitUntil(
caches.keys().then(keys=>
Promise.all(
keys.map(k=>{
if(k!==CACHE_NAME)return caches.delete(k)
})
)
)
)
self.clients.claim()
})

self.addEventListener("fetch",e=>{
e.respondWith(
caches.match(e.request).then(r=>r||fetch(e.request))
)
})