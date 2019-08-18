
const cacheName = '55'

self.addEventListener('message', msg => {
  if (msg.data.action === 'skipWaiting')
    self.skipWaiting()
})

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== cacheName)
        .map(key => caches.delete(key))
      )
    })
  )
})

self.addEventListener('fetch', evt => {
  if (evt.request.url.indexOf('firestore.googleapis.com') === -1)
    evt.respondWith(
      caches.match(evt.request).then(cacheRes => {
        return cacheRes || fetch(evt.request).then(fetchRes => {
          return caches.open(cacheName).then(cache => { 
            cache.put(evt.request.url, fetchRes.clone())
            return fetchRes
          })
        })
      })
    )
})
