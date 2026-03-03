/* =========================================================
   AUDITFLOW PRO — v3.6 SERVICE WORKER
   Offline-Only | No Ads | Cross Platform Stable
   £149-Level Foundation
   ========================================================= */

const CACHE_VERSION = "v3.6";
const CACHE_NAME = `auditflow-${CACHE_VERSION}`;

/* Core assets required for full offline operation */
const CORE_ASSETS = [
  "/",
  "/index.html?v=3.6",
  "/styles.css?v=3.6",
  "/app.js?v=3.6",
  "/manifest.json?v=3.6",
  "/icon-192.png",
  "/icon-512.png"
];

/* ---------- INSTALL ---------- */
/* Pre-cache everything needed for full offline capability */

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
  );

  /* Immediately activate new version without waiting */
  self.skipWaiting();
});

/* ---------- ACTIVATE ---------- */
/* Remove only old AuditFlow caches — not everything */

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith("auditflow-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

/* ---------- FETCH STRATEGY ---------- */
/*
   Strategy: Offline-First with Safe Update
   - Serve from cache instantly
   - Update cache silently in background
   - Never require manual refresh
*/

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  /* Only handle same-origin */
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {

      const fetchPromise = fetch(event.request)
        .then(networkResponse => {

          /* Only cache successful responses */
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }

          return networkResponse;
        })
        .catch(() => cachedResponse);

      /* If cached exists, return it immediately */
      return cachedResponse || fetchPromise;
    })
  );
});