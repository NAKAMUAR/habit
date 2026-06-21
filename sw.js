/* 習慣の暦 — シンプルなオフライン対応 Service Worker
   - SPA本体(index.html)・manifest.json をキャッシュ
   - ネットワーク優先 → 失敗時はキャッシュ */
const CACHE = 'habit-koyomi-v1';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  const req = e.request;
  if(req.method !== 'GET') return;
  // CDN(React/Firebase/Fonts)はキャッシュせず素通し
  if(!req.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(req).then(res=>{
      const copy = res.clone();
      caches.open(CACHE).then(c=>c.put(req, copy)).catch(()=>{});
      return res;
    }).catch(()=>caches.match(req).then(c=>c || caches.match('./index.html')))
  );
});
