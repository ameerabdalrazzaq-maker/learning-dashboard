const CACHE_NAME = 'learning-dashboard-cache-v1';
// List of URLs to cache when the service worker is installed
const urlsToCache = [
  './', // Caches index.html implicitly
  './index.html',
  // External resources (make sure these URLs are stable)
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap',
  'https://fonts.gstatic.com/s/tajawal/v9/I_pQoCPk_r_P_3sFzyPj_tE.woff2', // Specific font file if needed
  // PWA icons - you need to create these in an 'icons' folder
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Install event: caches all the essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache during install:', error);
      })
  );
});

// Fetch event: serves cached content when available, otherwise fetches from network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // No cache hit - fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            // IMPORTANT: Clone the response. A response is a stream
            // and can only be consumed once. We must clone it so that
            // we can consume one in the cache and one in the browser.
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            // You might want to return a fallback page here for offline
            // e.g., return caches.match('/offline.html');
          });
      })
  );
});

// Activate event: cleans up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
