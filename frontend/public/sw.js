const CACHE_NAME = 'get2gather-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/login',
        '/manifest.json',
        '/logo.png',
        '/offline'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
    // Basic network-first strategy
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
