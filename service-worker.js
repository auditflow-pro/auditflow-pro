const CACHE_NAME="auditflow-v15.0"

const urls=[
"./",
"./index.html",
"./assessment.html",
"./determination.html",
"./report.html",
"./styles.css?v=15.0",
"./app.js?v=15.0"
]

self.addEventListener("install",e=>{
self.skipWaiting()
e.waitUntil(
caches.open(CACHE_NAME).then(cache=>cache.addAll(urls))
)
})

self.addEventListener("activate",e=>{
e.waitUntil(
caches.keys().then(keys=>{
return Promise.all(
keys.map(key=>{
if(key!==CACHE_NAME){
return caches.delete(key)
}
})
)
})
)
})

self.addEventListener("fetch",e=>{
e.respondWith(
fetch(e.request).catch(()=>{
return caches.match(e.request)
})
)
})