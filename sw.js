const CACHE_NAME = 'gymlock-cache-v1';

const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './script/app.js',
  './script/ai-coach.js',
  './manifest.json',
  './icons/icon_GymLock2.png',
  './icons/icon_GymLock.png'
];

// 1. Installeer de Service Worker en sla de bestanden op in de cache
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('GymLock Cache: Bestanden worden opgeslagen!');
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Activeer en ruim oude caches op
self.addEventListener('activate', e => {
  console.log('GymLock Service Worker is nu actief!');
});

// 3. Vang netwerkverzoeken op: als we offline zijn, pakken we de cache
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      return cachedResponse || fetch(e.request);
    })
  );
});