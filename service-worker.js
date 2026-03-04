const CACHE_NAME = "auditflow-v6.3";

const urlsToCache = [

"./",
"./index.html?v=6.3",
"./styles.css?v=6.3",
"./app.js?v=6.3",
"./manifest.json?v=6.3"

];

self.addEventListener("install", event => {

self.skipWaiting();

event.waitUntil(

caches.open(CACHE_NAME).then(cache => {

return cache.addAll(urlsToCache);

})

);

});

self.addEventListener("activate", event => {

event.waitUntil(

caches.keys().then(cacheNames => {

return Promise.all(

cacheNames.map(cache => {

if (cache !== CACHE_NAME) {

return caches.delete(cache);

}

})

);

}).then(() => {

return self.clients.claim();

})

);

});

self.addEventListener("fetch", event => {

event.respondWith(

caches.match(event.request).then(response => {

return response || fetch(event.request);

})

);

});