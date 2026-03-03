const CACHE_NAME = "auditflow-shell-v3.9";

const CORE_ASSETS = [
  "/auditflow-pro/",
  "/auditflow-pro/index.html",
  "/auditflow-pro/styles.css?v=3.9",
  "/auditflow-pro/app.js?v=3.9",
  "/auditflow-pro/manifest.json?v=3.9",
  "/auditflow-pro/icon-192.png",
  "/auditflow-pro/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match("/auditflow-pro/index.html")
        .then(response => response || fetch(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});