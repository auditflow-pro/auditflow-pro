const CACHE_NAME = "auditflow-shell-v4.2";

const CORE = [
  "/auditflow-pro/",
  "/auditflow-pro/index.html",
  "/auditflow-pro/styles.css?v=4.2",
  "/auditflow-pro/app.js?v=4.2",
  "/auditflow-pro/manifest.json?v=4.2"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.mode === "navigate") {
    e.respondWith(
      caches.match("/auditflow-pro/index.html")
        .then(res => res || fetch(e.request))
    );
  }
});