// Service Worker for Web Push Notifications
// This worker intentionally does not cache or intercept fetches.
// If an older worker did cache app assets, this activation clears its caches.

const SERVICE_WORKER_CACHE_VERSION = 'push-only-v2'

self.addEventListener('install', function () {
  self.skipWaiting()
})

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (key) {
          if (key !== SERVICE_WORKER_CACHE_VERSION) {
            return caches.delete(key)
          }
          return Promise.resolve()
        }))
      })
      .then(function () {
        return self.clients.claim()
      })
  )
})

self.addEventListener('push', function (event) {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch (e) {
    data = {
      title: 'mikeblocky.com',
      body: event.data.text(),
      url: '/talk'
    }
  }

  const options = {
    body: data.body || 'Your post has received a response!',
    icon: '/icon-512.png',
    badge: '/icon-512.png',
    tag: data.tag || 'talk-reply',
    data: {
      url: data.url || '/talk'
    },
    vibrate: [200, 100, 200],
    requireInteraction: true
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'mikeblocky.com', options)
  )
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/talk'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
