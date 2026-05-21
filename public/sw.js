const CACHE = 'crypto-dashboard-v1'

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)
  if (url.pathname.startsWith('/api/')) return

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetchPromise = fetch(e.request).then((res) => {
        if (res.ok && url.origin === self.location.origin) {
          caches.open(CACHE).then((c) => c.put(e.request, res.clone()))
        }
        return res
      })
      return cached || fetchPromise
    }),
  )
})
