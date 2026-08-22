/* Tadaruq PWA service worker — v24 R53. */
const CACHE_NAME = 'tadaruq-v24-r53-pwa-20260822';
const RUNTIME_CACHE = 'tadaruq-runtime-v24-r53-20260822';
const HADITH_CORPUS_CACHE = 'tadaruq-lulu-marjan-v1';
const MUSHAF_PUBLIC_CACHE = 'tadaruq-mushaf-kfqc-r43-v1';
const TAFSIR_MUYASSAR_CACHE = 'tadaruq-tafsir-muyassar-r45-v1';
const PRECACHE_URLS = [
  "./",
  "./adiya.json",
  "./agreed-hadith.json",
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
  "./icon-1024.png",
  "./icon-maskable-512.png",
  "./index.html",
  "./irtaqi.json",
  "./ishkaliat.json",
  "./knowledge.json",
  "./aqeedah.json",
  "./fiqh-life.json",
  "./tajweed.json",
  "./hadith-sciences.json",
  "./akhlaq.json",
  "./adab.json",
  "./digital-life.json",
  "./qawaid-fiqh.json",
  "./fiqh-busola.json",
  "./benefit.json",
  "./manifest.webmanifest",
  "./manazil-sairin.json",
  "./suwiya-mumin.json",
  "./nawawi40.json",
  "./plex-400.woff2",
  "./plex-500.woff2",
  "./plex-600.woff2",
  "./privacy.html",
  "./pwa-register.js",
  "./qalb.json",
  "./seerah.json",
  "./usul-tafsir.json",
  "./usul-fiqh.json",
  "./fuqaha.json",
  "./islamic-history.json",
  "./splash-mark.png",
  "./sources.html",
  "./tasbih.html",
  "./tadaruk-icon-square.svg"
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
    const keep = new Set([CACHE_NAME, RUNTIME_CACHE, HADITH_CORPUS_CACHE, MUSHAF_PUBLIC_CACHE, TAFSIR_MUYASSAR_CACHE]);
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

function isHadithCorpusRequest(request) {
  try {
    const u = new URL(request.url);
    return (u.hostname === 'cdn.jsdelivr.net' && u.pathname.includes('/HsnSaboor/hadith-api-toon'))
      || (u.hostname === 'raw.githubusercontent.com' && u.pathname.includes('/HsnSaboor/hadith-api-toon/'));
  } catch (_) { return false; }
}


function isMushafSvgRequest(request) {
  try {
    const u = new URL(request.url);
    return ((u.hostname === 'cdn.jsdelivr.net' && u.pathname.includes('/quranpedia/quran-svg@'))
      || (u.hostname === 'raw.githubusercontent.com' && u.pathname.includes('/quranpedia/quran-svg/')))
      && u.pathname.includes('/mushafs/hafs/kfqc/svg/') && /\/[0-9]{3}\.svg$/.test(u.pathname);
  } catch (_) { return false; }
}

function isMuyassarRequest(request) {
  try {
    const u = new URL(request.url);
    return u.hostname === 'api.alquran.cloud'
      && ((u.pathname.startsWith('/v1/ayah/') && u.pathname.endsWith('/ar.muyassar'))
        || u.pathname === '/v1/quran/ar.muyassar');
  } catch (_) { return false; }
}

async function handleCrossOrigin(request) {
  const corpus = isHadithCorpusRequest(request), mushaf = isMushafSvgRequest(request), muyassar = isMuyassarRequest(request);
  if (corpus || mushaf || muyassar) {
    const cached = await caches.match(request);
    if (cached) return cached;
  }
  try {
    const network = await fetch(request);
    const cacheName = mushaf ? MUSHAF_PUBLIC_CACHE : (muyassar ? TAFSIR_MUYASSAR_CACHE : (corpus ? HADITH_CORPUS_CACHE : RUNTIME_CACHE));
    return cacheResponse(cacheName, request, network);
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
