const CACHE='durus-shell-v1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
  './icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>
  Promise.all(k.filter(x=>x!==CACHE&&x!=='durus-audio').map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  if(u.pathname.endsWith('.mp3'))return;                 // الصوت يديره التطبيق
  if(u.pathname.endsWith('content.json')){               // المحتوى: الشبكة أولًا ليصل الجديد فورًا
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();
      caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)));
    return }
  e.respondWith(caches.match(e.request).then(h=>h||fetch(e.request)));
});
