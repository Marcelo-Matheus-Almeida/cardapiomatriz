/* Service Worker — a versão do cache vem de data/cardapio.json. */
const CACHE_PREFIX = 'cardapio-assai-';
let VERSION = 'uninitialized';

const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/script.js',
  './data/cardapio.json',
  './manifest.json',
  './assets/logo-assai.png',
  './assets/aero-wallpaper.jpg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable-512.png',
  './assets/apple-touch-icon.png'
];

const cacheName = (version) => CACHE_PREFIX + version;

async function readMenuVersion() {
  const response = await fetch('./data/cardapio.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Não foi possível ler a versão do cardápio.');
  const menu = await response.json();
  const version = menu.appVersion;
  if (typeof version !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,39}$/.test(version)) {
    throw new Error('Versão do app ausente ou inválida no JSON.');
  }
  return version;
}

async function useVersion(version, refresh = false) {
  const name = cacheName(version);
  if (refresh || !(await caches.has(name))) {
    try {
      const cache = await caches.open(name);
      await cache.addAll(ASSETS);
    } catch (error) {
      await caches.delete(name);
      throw error;
    }
  }
  VERSION = version;
  return name;
}

async function currentCacheName() {
  const keys = (await caches.keys()).filter((key) => key.startsWith(CACHE_PREFIX));
  return keys.includes(cacheName(VERSION)) ? cacheName(VERSION) : (keys[keys.length - 1] || cacheName(VERSION));
}

async function removeOldCaches(keep) {
  const keys = await caches.keys();
  await Promise.all(keys
    .filter((key) => key.startsWith(CACHE_PREFIX) && key !== keep)
    .map((key) => caches.delete(key)));
}

/* Na instalação, pré-carrega os arquivos na versão publicada no JSON. */
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const version = await readMenuVersion();
    await useVersion(version, true);
    await self.skipWaiting();
  })());
});

/* Mantém somente o cache correspondente ao JSON instalado. */
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const current = await currentCacheName();
    await removeOldCaches(current);
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const isImage = url.pathname.includes('/assets/');
  const isMenu = url.pathname.endsWith('/data/cardapio.json');

  if (isImage) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then(async (response) => {
      const cache = await caches.open(await currentCacheName());
      await cache.put(request, response.clone());
      return response;
    })));
    return;
  }

  event.respondWith(fetch(request).then(async (response) => {
    if (!response.ok) return response;

    if (isMenu) {
      const menu = await response.clone().json();
      if (typeof menu.appVersion === 'string' && menu.appVersion !== VERSION) {
        const name = await useVersion(menu.appVersion);
        await removeOldCaches(name);
      }
    } else if (request.mode === 'navigate') {
      /* O SW não recebe evento de instalação só porque o JSON mudou.
         Ao abrir o app, consulta o JSON e gira o cache quando a versão muda. */
      try {
        const version = await readMenuVersion();
        if (version !== VERSION) {
          const name = await useVersion(version);
          await removeOldCaches(name);
        }
      } catch (_) {
        // Se a rede falhar, a navegação continua usando a resposta/cache disponível.
      }
    }

    const cache = await caches.open(await currentCacheName());
    await cache.put(request, response.clone());
    return response;
  }).catch(async () => {
    const cached = await caches.match(request);
    return cached || caches.match('./index.html');
  }));
});
