// Service Worker for Web Push Notifications
// This runs in the background even when the site is closed

self.addEventListener('push', function (event) {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch (e) {
    data = {
      title: 'mikeblocky.com',
      body: event.data.text(),
      url: '/ask'
    }
  }

  const options = {
    body: data.body || 'Your question has been answered!',
    icon: '/icon-512.png',
    badge: '/icon-512.png',
    tag: data.tag || 'ask-reply',
    data: {
      url: data.url || '/ask'
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

  const targetUrl = event.notification.data?.url || '/ask'

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

self.addEventListener('install', function () {
  self.skipWaiting()
})

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim())
})
