const CACHE = 'abmashine-v1';
const MEDIA_HOSTS = ['media.base44.com', 'static.wixstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(['/', '/manifest.json']).catch(() => null))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const isMedia = /\.(png|jpg|jpeg|webp|svg|mp3|woff2)$/.test(url.pathname);
  const isKnownHost = MEDIA_HOSTS.includes(url.hostname);

  if (isMedia || isKnownHost) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached || fetch(request).then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => null);
          }
          return response;
        }).catch(() => cached))
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (url.origin === self.location.origin && response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => null);
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
  );
});
