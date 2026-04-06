const CACHE_NAME = 'wikinbm-v1';
const urlsToCache = [
  '.',
  'index.html',
  'https://cdn.jsdelivr.net/npm/abcjs@6.2.3/dist/abcjs-basic-min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
