/* Tadaruq PWA service worker — stability + staged offline warming. */
importScripts('./version.js');
const META=self.TADARUQ_META||{release:'R58',cacheVersion:'20260824-r58-prod1'};
const CACHE_NAME=`tadaruq-shell-${META.cacheVersion}`;
const RUNTIME_CACHE=`tadaruq-runtime-${META.cacheVersion}`;
const CONTENT_CACHE=`tadaruq-content-${META.cacheVersion}`;
const HADITH_CORPUS_CACHE='tadaruq-lulu-marjan-v1';
const MUSHAF_PUBLIC_CACHE='tadaruq-mushaf-kfqc-r43-v1';
const TAFSIR_MUYASSAR_CACHE='tadaruq-tafsir-muyassar-r45-v1';

// Keep the install transaction small and deterministic. These files make the
// shell and its support pages usable offline immediately after installation.
const CRITICAL_URLS=[
  './','./index.html','./version.js','./storage.js','./data-safety.js','./diagnostics.js','./app.js','./boot.js','./extension-bridge.js','./a11y-dialogs.js','./network-status.js','./pwa-register.js','./manifest.webmanifest',
  './privacy.html','./sources.html','./tasbih.html','./tasbih.js','./tadaruk-icon-square.svg','./splash-mark.png',
  './apple-touch-icon.png','./icon-192.png','./icon-512.png','./icon-1024.png','./icon-maskable-512.png',
  './amiri-400.woff2','./amiri-700.woff2','./hafs.woff2','./plex-400.woff2','./plex-500.woff2','./plex-600.woff2'
];

// The local knowledge corpus is intentionally not downloaded inside install.
// Installed PWAs warm it later while idle and on a suitable connection. Any
// file opened before that is cached on demand by staleWhileRevalidate().
const OPTIONAL_CONTENT_URLS=[
  './adiya.json','./agreed-hadith.json','./asma.json','./azkar.json','./companions.json','./irtaqi.json','./ishkaliat.json',
  './knowledge.json','./aqeedah.json','./fiqh-life.json','./tajweed.json','./hadith-sciences.json','./akhlaq.json','./adab.json',
  './digital-life.json','./qawaid-fiqh.json','./fiqh-busola.json','./benefit.json','./manazil-sairin.json','./suwiya-mumin.json',
  './nawawi40.json','./qalb.json','./seerah.json','./usul-tafsir.json','./usul-fiqh.json','./fuqaha.json','./islamic-history.json',
  './quran.json','./riyad.json','./prophet-stories.json','./quran-stories.json','./search-index.json'
];

async function warmOptionalContent(cache){
  let cursor=0;
  const workers=Array.from({length:4},async()=>{
    while(cursor<OPTIONAL_CONTENT_URLS.length){
      const url=OPTIONAL_CONTENT_URLS[cursor++];
      try{
        if(await cache.match(url))continue;
        const response=await fetch(new Request(url,{cache:'no-cache'}));
        if(response.ok)await cache.put(url,response);
      }catch(_){}
    }
  });
  await Promise.all(workers);
}

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await cache.addAll(CRITICAL_URLS);
    // Do not call skipWaiting here: an existing session must choose when to update.
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keep=new Set([CACHE_NAME,RUNTIME_CACHE,CONTENT_CACHE,HADITH_CORPUS_CACHE,MUSHAF_PUBLIC_CACHE,TAFSIR_MUYASSAR_CACHE]);
    const names=await caches.keys();
    await Promise.all(names.filter(name=>!keep.has(name)).map(name=>caches.delete(name)));
    if('navigationPreload' in self.registration){try{await self.registration.navigationPreload.enable()}catch(_){}}
    await self.clients.claim();
  })());
});

async function trimCache(cacheName,maxEntries){
  try{const cache=await caches.open(cacheName),keys=await cache.keys();if(keys.length>maxEntries)await Promise.all(keys.slice(0,keys.length-maxEntries).map(k=>cache.delete(k)))}catch(_){}
}
async function put(cacheName,request,response,maxEntries){
  if(!response||(!response.ok&&response.type!=='opaque'))return response;
  try{const cache=await caches.open(cacheName);await cache.put(request,response.clone());if(maxEntries)await trimCache(cacheName,maxEntries)}catch(_){}
  return response;
}
function fetchWithTimeout(request,ms=5000){
  if(typeof AbortController==='undefined')return fetch(request);
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),ms);
  return fetch(request,{signal:controller.signal}).finally(()=>clearTimeout(timer));
}
async function navigation(event){
  try{
    const preload=await event.preloadResponse;
    if(preload)return put(RUNTIME_CACHE,event.request,preload,40);
    const network=await fetchWithTimeout(event.request,5000);
    return put(RUNTIME_CACHE,event.request,network,40);
  }catch(_){
    return (await caches.match(event.request,{ignoreSearch:true}))||(await caches.match('./index.html'))||(await caches.match('./'))||Response.error();
  }
}
async function staleWhileRevalidate(request){
  const cached=await caches.match(request,{ignoreSearch:false});
  const update=fetch(request).then(r=>put(CONTENT_CACHE,request,r,80)).catch(()=>null);
  if(cached){update.catch(()=>{});return cached}
  return (await update)||Response.error();
}
async function cacheFirstLocal(request){
  const cached=await caches.match(request,{ignoreSearch:false});if(cached)return cached;
  try{return await put(RUNTIME_CACHE,request,await fetch(request),80)}catch(_){return Response.error()}
}
function isHadithCorpusRequest(request){try{const u=new URL(request.url);return (u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('/HsnSaboor/hadith-api-toon'))||(u.hostname==='raw.githubusercontent.com'&&u.pathname.includes('/HsnSaboor/hadith-api-toon/'))}catch(_){return false}}
function isMushafSvgRequest(request){try{const u=new URL(request.url);return ((u.hostname==='cdn.jsdelivr.net'&&u.pathname.includes('/quranpedia/quran-svg@'))||(u.hostname==='raw.githubusercontent.com'&&u.pathname.includes('/quranpedia/quran-svg/')))&&u.pathname.includes('/mushafs/hafs/kfqc/svg/')&&/\/[0-9]{3}\.svg$/.test(u.pathname)}catch(_){return false}}
function isMuyassarRequest(request){try{const u=new URL(request.url);return u.hostname==='api.alquran.cloud'&&((u.pathname.startsWith('/v1/ayah/')&&u.pathname.endsWith('/ar.muyassar'))||u.pathname==='/v1/quran/ar.muyassar')}catch(_){return false}}
async function approvedCrossOrigin(request){
  const corpus=isHadithCorpusRequest(request),mushaf=isMushafSvgRequest(request),muyassar=isMuyassarRequest(request);
  if(!(corpus||mushaf||muyassar)){try{return await fetch(request)}catch(_){return Response.error()}}
  const cached=await caches.match(request);if(cached)return cached;
  try{
    const cacheName=mushaf?MUSHAF_PUBLIC_CACHE:(muyassar?TAFSIR_MUYASSAR_CACHE:HADITH_CORPUS_CACHE);
    const max=mushaf?650:(muyassar?700:30);
    return await put(cacheName,request,await fetch(request),max);
  }catch(_){return (await caches.match(request))||Response.error()}
}

self.addEventListener('fetch',event=>{
  const request=event.request;if(request.method!=='GET')return;
  if(request.mode==='navigate'){event.respondWith(navigation(event));return}
  const url=new URL(request.url);
  if(url.origin===self.location.origin){
    const isJson=url.pathname.endsWith('.json');
    event.respondWith(isJson?staleWhileRevalidate(request):cacheFirstLocal(request));
  }else event.respondWith(approvedCrossOrigin(request));
});
self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
  if(event.data?.type==='WARM_OFFLINE_CONTENT'){
    event.waitUntil(caches.open(CACHE_NAME).then(warmOptionalContent));
  }
  if(event.data?.type==='GET_VERSION')event.source?.postMessage?.({type:'TADARUQ_SW_VERSION',release:META.release,cacheVersion:META.cacheVersion});
});
