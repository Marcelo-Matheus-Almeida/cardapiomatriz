const CACHE = 'cardapio-assai-v2';
const ASSETS = ['./','./index.html','./css/style.css','./js/script.js','./manifest.json',
  './assets/logo-assai.png','./assets/aero-wallpaper.jpg','./assets/icon-192.png',
  './assets/icon-512.png','./assets/icon-maskable-512.png','./assets/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;
  const isHTML=req.mode==='navigate'||(req.headers.get('accept')||'').includes('text/html');
  if(isHTML){e.respondWith(fetch(req).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(req,c));return res;}).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html'))));}
  else{e.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(req,c));return res;}).catch(()=>cached)));}});
