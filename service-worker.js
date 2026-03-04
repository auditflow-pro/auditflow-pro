const CACHE="auditflow-v4"

const ASSETS=[

"./",
"./index.html?v=4.0",
"./styles.css?v=4.0",
"./app.js?v=4.0",
"./manifest.json"

]

self.addEventListener("install",e=>{

e.waitUntil(

caches.open(CACHE).then(c=>c.addAll(ASSETS))

)

self.skipWaiting()

})

self.addEventListener("activate",e=>{

e.waitUntil(

caches.keys().then(keys=>Promise.all(

keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))

))

)

self.clients.claim()

})

self.addEventListener("fetch",e=>{

e.respondWith(

caches.match(e.request).then(r=>r||fetch(e.request))

)

})