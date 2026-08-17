/* رفيق يومك — عامل الخدمة
   الاستراتيجية: الشبكة أولًا لكل شيء، والمخزَّن احتياطٌ عند انقطاع الإنترنت.
   بهذا يظهر أي تعديل ترفعه فورًا دون تغيير رقم النسخة،
   ويظل التطبيق يعمل كاملًا بدون إنترنت.
*/
const CACHE = 'rafiq-live';
const ASSETS = [
  './', './index.html', './tasbih.html', './qalb.json', './asma.json', './riyad.json', './irtaqi.json', './adiya.json',
  './amiri-400.woff2', './amiri-700.woff2', './plex-400.woff2', './plex-500.woff2', './plex-600.woff2',
  './azkar.json', './quran.json', './hafs.woff2',
  './manifest.webmanifest', './privacy.html', './sources.html', './icon-192.png', './icon-512.png',
  './icon-maskable-512.png', './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(ASSETS.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE && k !== 'durus-audio' && k !== 'mushaf-audio')
            .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;   // الروابط الخارجية تمرّ كما هي
  if (url.pathname.endsWith('.mp3')) return;    // الصوت يديره التطبيق نفسه

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req, {ignoreSearch:true}).then(hit => hit || caches.match('./index.html'))
      )
  );
});
