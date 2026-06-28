const CACHE_NAME = 'higher-maths-app-v1';
const APP_SHELL = ['/', '/manifest.webmanifest', '/pwa-icon.svg'];
const CACHEABLE_STATIC_EXTENSIONS = /\.(?:css|js|png|jpg|jpeg|svg|webp|ico|woff2?)$/i;

function isSameOrigin(requestUrl) {
  return requestUrl.origin === self.location.origin;
}

function hasAuthHeaders(request) {
  return request.headers.has('authorization') || request.headers.has('cookie');
}

function isCacheableStaticAsset(requestUrl) {
  return CACHEABLE_STATIC_EXTENSIONS.test(requestUrl.pathname);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (request.method !== 'GET' || !isSameOrigin(requestUrl) || hasAuthHeaders(request)) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/')));
    return;
  }

  if (!isCacheableStaticAsset(requestUrl) && !APP_SHELL.includes(requestUrl.pathname)) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    }),
  );
});
