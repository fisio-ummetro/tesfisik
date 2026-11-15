/* Service worker: versi terbaru saat online, cadangan saat offline */
const CACHE = 'tesfisik-v1';
const CORE = ['./', './index.html', './cloud.js', './lampung.js', './logo.png', './logo-mark.png', './manifest.webmanifest', './icon-192.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // network-first (batas 5 detik), lalu cache
  e.respondWith(new Promise((resolve) => {
    let done = false;
    const fromCache = () => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('./index.html'));
    const t = setTimeout(() => { fromCache().then((r) => { if (!done && r) { done = true; resolve(r); } }); }, 5000);
    fetch(req, { cache: 'no-store' }).then((res) => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      clearTimeout(t); if (!done) { done = true; resolve(res); }
    }).catch(() => { clearTimeout(t); fromCache().then((r) => { if (!done) { done = true; resolve(r || Response.error()); } }); });
  }));
});
