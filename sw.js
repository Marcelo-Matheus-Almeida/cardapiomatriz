/* Service Worker — Cardápio Assaí PWA */

/* ⬆️ INCREMENTE a versão a CADA push (v4 → v5 → v6 ...). 
   É isso que força o navegador a baixar tudo de novo e limpar o cache antigo. */
const VERSION = 'v4';
const CACHE = 'cardapio-assai-' + VERSION;

const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/script.js',
  './manifest.json',
  './assets/logo-assai.png',
  './assets/aero-wallpaper.jpg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable-512.png',
  './assets/apple-touch-icon.png'
];

/* instala e pré-carrega os arquivos */
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

/* ativa e apaga caches de versões anteriores */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* permite a página pedir a ativação imediata do novo SW */
self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isImagem = url.pathname.includes('/assets/'); // imagens/ícones → cache-first

  if (isImagem) {
    e.respondWith(
      caches.match(req).then((cached) =>
        cached || fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
      )
    );
  } else {
    /* HTML/CSS/JS → network-first: sempre tenta o mais novo,
       e cai no cache só quando estiver offline. */
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
  }
});
