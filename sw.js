/* Tadaruq PWA service worker — generated for v24 R24. */
const CACHE_NAME = 'tadaruq-v24-r24-pwa-20260820';
const RUNTIME_CACHE = 'tadaruq-runtime-v24-r24-20260820';
const PRECACHE_URLS = [
  "./",
  "./adiya.json",
  "./amiri-400.woff2",
  "./amiri-700.woff2",
  "./app.js",
  "./apple-touch-icon.png",
  "./asma.json",
  "./azkar.json",
  "./companions.json",
  "./data-safety.js",
  "./extension-bridge.js",
  "./hafs.woff2",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./index.html",
  "./irtaqi.json",
  "./ishkaliat.json",
  "./knowledge.json",
  "./manifest.webmanifest",
  "./nawawi40.json",
  "./plex-400.woff2",
  "./plex-500.woff2",
  "./plex-600.woff2",
  "./privacy.html",
  "./pwa-register.js",
  "./qalb.json",
  "./seerah.json",
  "./sources.html",
  "./tasbih.html"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keep = new Set([CACHE_NAME, RUNTIME_CACHE]);
    const names = await caches.keys();
    await Promise.all(names.filter(name => !keep.has(name)).map(name => caches.delete(name)));
    if ('navigationPreload' in self.registration) {
      try { await self.registration.navigationPreload.enable(); } catch (_) {}
    }
    await self.clients.claim();
  })());
});

async function cacheResponse(cacheName, request, response) {
  if (!response || (!response.ok && response.type !== 'opaque')) return response;
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
  return response;
}

async function handleNavigation(event) {
  try {
    const preload = await event.preloadResponse;
    if (preload) return cacheResponse(RUNTIME_CACHE, event.request, preload);
    const network = await fetch(event.request);
    return cacheResponse(RUNTIME_CACHE, event.request, network);
  } catch (_) {
    return (await caches.match(event.request, { ignoreSearch: true }))
      || (await caches.match('./index.html'))
      || (await caches.match('./'));
  }
}

async function handleSameOrigin(request) {
  const cached = await caches.match(request, { ignoreSearch: false });
  if (cached) return cached;
  try {
    const network = await fetch(request);
    return cacheResponse(RUNTIME_CACHE, request, network);
  } catch (_) {
    return cached || Response.error();
  }
}

async function handleCrossOrigin(request) {
  try {
    const network = await fetch(request);
    return cacheResponse(RUNTIME_CACHE, request, network);
  } catch (_) {
    return (await caches.match(request)) || Response.error();
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(event));
    return;
  }

  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(handleSameOrigin(request));
  } else {
    event.respondWith(handleCrossOrigin(request));
  }
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
