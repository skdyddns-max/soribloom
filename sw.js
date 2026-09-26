// 소리블룸 service worker — 오프라인 캐시. 배포마다 VERSION 을 올릴 것(index.html ?v= · config SB_VER 와 함께)
const VERSION = 'soribloom-v2';
const V = '?v=2';
const SHELL = ['.', 'index.html', 'manifest.webmanifest', 'favicon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png',
  'css/style.css' + V, 'js/config.js' + V, 'js/words.js' + V, 'js/store.js' + V, 'js/app.js' + V];
const SHELL_PATHS = new Set(SHELL.map(s => new URL(s, self.registration.scope).pathname));
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // Supabase 등 외부 요청은 그대로
  const isAsset = /\/(audio|img)\//.test(u.pathname);
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok && (isAsset || SHELL_PATHS.has(u.pathname))) { const cp = res.clone(); caches.open(VERSION).then(c => c.put(e.request, cp)); }
    return res;
  }).catch(() => hit)));
});
