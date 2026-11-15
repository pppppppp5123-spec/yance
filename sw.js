/* 硯冊上鎖版的離線快取（版本 202611150634） */
const CACHE = "yance-shell";
const FONT = "yance-fonts";
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "./apple-touch-icon.png"]).catch(() => { }))); self.skipWaiting(); });
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.open(FONT).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { c.put(req, r.clone()); return r; }))));
    return;
  }
  if (url.origin !== location.origin) return;
  const isPage = req.mode === "navigate" || /\/(index\.html)?$/.test(url.pathname);
  const key = isPage ? new Request(new URL("./", location).href) : req;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const net = fetch(req).then(r => { if (r.ok) c.put(key, r.clone()); return r; });
    const timeout = new Promise(ok => setTimeout(ok, 4000));
    try { const r = await Promise.race([net, timeout]); if (r) return r; } catch (err) { }
    const hit = await c.match(key);
    return hit || net;
  })());
});
