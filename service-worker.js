const CACHE_NAME="auditflow-v11.0-stable"

const CORE_ASSETS=[

"./",
"./index.html",
"./assessment.html",
"./determination.html",
"./report.html",
"./styles.css?v=11.0-stable",
"./app.js?v=11.0-stable",
"./manifest.json"

]

self.addEventListener("install",event=>{

self.skipWaiting()

event.waitUntil(

caches.open(CACHE_NAME)
.then(cache=>cache.addAll(CORE_ASSETS))

)

})

self.addEventListener("activate",event=>{

event.waitUntil(

caches.keys().then(keys=>{

return Promise.all(

keys.filter(key=>key!==CACHE_NAME)
.map(key=>caches.delete(key))

)

})

)

self.clients.claim()

})

self.addEventListener("fetch",event=>{

event.respondWith(

caches.match(event.request)
.then(response=>response||fetch(event.request))

)

})