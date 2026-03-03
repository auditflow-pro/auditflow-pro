const CACHE_NAME = "auditflow-shell-v3.7";

const SHELL_FILES = [
  "/auditflow-pro/",
  "/auditflow-pro/index.html",
  "/auditflow-pro/styles.css?v=3.6",
  "/auditflow-pro/app.js?v=3.6",
  "/auditflow-pro/manifest.json",
  "/auditflow-pro/icon-192.png",
  "/auditflow-pro/icon-512.png"
];

// INSTALL — Pre-cache application shell
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(SHELL_FILES);
    })
  );
  self.skipWaiting();
});

// ACTIVATE — Clean old caches safely
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

// FETCH — Deterministic navigation control
self.addEventListener("fetch", event => {

  const requestURL = new URL(event.request.url);

  // Only control requests within our scope
  if (requestURL.pathname.startsWith("/auditflow-pro/")) {

    // Navigation requests (HTML loads, standalone launch, refresh, etc.)
    if (event.request.mode === "navigate") {
      event.respondWith(
        caches.match("/auditflow-pro/index.html")
          .then(response => response || fetch(event.request))
      );
      return;
    }

    // Static assets (CSS, JS, icons)
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );

  }

});