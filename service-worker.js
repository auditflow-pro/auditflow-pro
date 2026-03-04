const CACHE_NAME="auditflow-v11.0"

const urls=[

"./",
"./index.html",
"./assessment.html",
"./determination.html",
"./report.html",
"./styles.css?v=11.0",
"./app.js?v=11.0"

]

self.addEventListener("install",e=>{
e.waitUntil(
caches.open(CACHE_NAME).then(cache=>cache.addAll(urls))
)
})

self.addEventListener("fetch",e=>{
e.respondWith(
caches.match(e.request).then(r=>r||fetch(e.request))
)
})