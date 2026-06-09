const CACHE_NAME = 'gymlock-cache-v1';
// Hier zetten we alle bestanden die de app offline nodig heeft
const ASSETS = [
  './',
  './index.html',
  './script/app.js',
  './script/ai-coach.js',
  './manifest.json'
  // Als je een CSS-bestand hebt, zet die er dan hier ook tussen, bijv: './css/style.css'
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