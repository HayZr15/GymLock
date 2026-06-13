const CACHE_NAME = 'gymlock-v1';
const ASSETS = [
  './',
  './index.html',
  './styles/style.css',
  './app.js',
  './manifest.json'
];

// Bestanden cachen bij installatie
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// Cache aanspreken bij offline gebruik
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});