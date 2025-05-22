// Version of the cache
const CACHE_VERSION = 'v1.0.1'; // Increment this when you update your script
const CACHE_NAME = `my-site-cache-${CACHE_VERSION}`;

// Assets to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/customtags.html',
  '/system.html',
  '/styles.css',
  // Don't include script.js here
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('script.js')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response as it can only be consumed once
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  }
});