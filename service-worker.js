const CACHE_NAME = "auditflow-shell-v3.6";

const CORE_ASSETS = [
  "/auditflow-pro/",
  "/auditflow-pro/index.html",
  "/auditflow-pro/styles.css?v=3.6",
  "/auditflow-pro/app.js?v=3.6",
  "/auditflow-pro/manifest.json",
  "/auditflow-pro/icon-192.png",
  "/auditflow-pro/icon-512.png"
];

// Install — precache shell
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — offline-first navigation
self.addEventListener("fetch", event => {

  // Handle navigation requests (HTML)
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match("/auditflow-pro/index.html").then(response => {
        return response || fetch(event.request);
      })
    );
    return;
  }

  // Handle other requests (CSS/JS/Assets)
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});