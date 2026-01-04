const CACHE_NAME = 'sansat-cache-v14';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './red_pomegranate.webp',
  './dark_red_thai_wax_apple.webp',
  './pom_large.webp',
  './pom_medium.webp',
  './jambu_large.webp',
  './jambu_medium.webp',
  './jambu_sweet.webp',
  './farming_wax_apple.webp',
  './process_harvest.webp',
  './process_pack.webp',
  './process_deliver.webp',
  './process_pay.webp',
  './jambu_promise.png'
];

self.addEventListener('install', (event) => {
  // Force new service worker to activate immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  // Take control of all pages immediately
  event.waitUntil(clients.claim());

  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // NETWORK FIRST STRATEGY for HTML requests
  // This ensures the user always gets the latest version if online
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Update cache with new version
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Offline? Serve valid cached version
          return caches.match(event.request);
        })
    );
  } else {
    // CACHE FIRST for images and other static assets (faster)
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
