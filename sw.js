const CACHE_NAME = 'balowaci-pwa-v29';
const APP_SHELL = [
  '/manifest.json',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/assets/balogo-circle.png',
  '/assets/balowaci-icon-192.png',
  '/assets/balowaci-icon-512.png',
  '/assets/balogo.png',
  '/assets/BaloWaci Trinity Protoype.png',
  '/assets/earth-texture.jpg',
  '/assets/moon-texture.jpg',
  '/assets/wildlife/balowaci-leopard.png',
  '/assets/wildlife/balowaci-leopard-walk.png',
  '/assets/wildlife/leopard-walk-frames/frame-0.png',
  '/assets/wildlife/leopard-walk-frames/frame-1.png',
  '/assets/wildlife/leopard-walk-frames/frame-2.png',
  '/assets/wildlife/leopard-walk-frames/frame-3.png',
  '/assets/wildlife/leopard-walk-frames/frame-4.png',
  '/assets/wildlife/leopard-walk-frames/frame-5.png',
  '/assets/wildlife/leopard-walk-frames/frame-6.png',
  '/assets/wildlife/leopard-walk-frames/frame-7.png',
  '/assets/real-globe.jpg',
  '/assets/founder-fadhili-baloci.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname.startsWith('/api/')) return;

  if (event.request.mode === 'navigate' || requestUrl.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then((cachedResponse) => (
          cachedResponse || caches.match('/index.html')
        )))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => caches.match('/index.html'));
    })
  );
});
