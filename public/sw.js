const CACHE_NAME = 'nextvwt-cache-v1';
const PRECACHE_ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'pwa-192x192.png',
  'pwa-512x512.png'
];

// Install Event - Precache App Shell (Robust Caching)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching App Shell');
      return Promise.all(
        PRECACHE_ASSETS.map((asset) => {
          return cache.add(asset).catch((err) => {
            console.warn(`[Service Worker] Failed to precache ${asset}:`, err);
          });
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean Up Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Caching Strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Bypass WebSocket, Supabase Realtime, WebRTC, dan API traffic (Network Only)
  if (
    event.request.url.includes('supabase.co') || 
    url.protocol === 'ws:' || 
    url.protocol === 'wss:' ||
    event.request.url.includes('/api/') ||
    event.request.method !== 'GET'
  ) {
    return; // Biarkan browser menangani koneksi langsung ke server/WebSocket
  }

  // 2. Strategi Stale-While-Revalidate untuk Asset Statis (CSS, JS, Fonts, Images, HTML)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Ambil dari jaringan di latar belakang
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        console.warn('[Service Worker] Background fetch failed (offline):', err);
      });

      // Kembalikan versi cache jika ada, jika tidak tunggu respon jaringan
      return cachedResponse || fetchPromise;
    })
  );
});
