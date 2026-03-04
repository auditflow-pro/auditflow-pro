const CACHE="auditflow-v12.0"

const assets=[
"./",
"./index.html",
"./assessment.html",
"./determination.html",
"./report.html",
"./styles.css?v=12.0",
"./app.js?v=12.0"
]

self.addEventListener("install",e=>{
e.waitUntil(
caches.open(CACHE).then(c=>c.addAll(assets))
)
})

self.addEventListener("fetch",e=>{
e.respondWith(
caches.match(e.request).then(r=>r||fetch(e.request))
)
})