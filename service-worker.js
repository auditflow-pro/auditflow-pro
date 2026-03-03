const CACHE_NAME = "auditflow-shell-v3.8";

const SHELL_FILES = [
  "/auditflow-pro/",
  "/auditflow-pro/index.html",
  "/auditflow-pro/styles.css?v=3.6",
  "/auditflow-pro/app.js?v=3.6",
  "/auditflow-pro/manifest.json",
  "/auditflow-pro/icon-192.png",
  "/auditflow-pro/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

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

self.addEventListener("fetch", event => {

  const url = new URL(event.request.url);

  // Only control our app scope
  if (!url.pathname.startsWith("/auditflow-pro/")) {
    return;
  }

  // Navigation requests (HTML)
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match("/auditflow-pro/index.html")
    );
    return;
  }

  // Static assets
  event.respondWith(
    caches.match(event.request)
  );

});