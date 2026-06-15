import { env } from '$env/dynamic/public';

const VAPID_PUBLIC_KEY = (env as Record<string, string | undefined>).PUBLIC_VAPID_PUBLIC_KEY || (env as Record<string, string | undefined>).NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      updateViaCache: 'none'
    })

    registration.update().catch(() => {})

    return registration
  } catch (error) {
    console.error('Service worker registration failed:', error)
    return null
  }
}

export async function subscribeToPush(talkId: string): Promise<boolean> {
  if (!('PushManager' in window)) {
    console.warn('Push notifications are not supported')
    return false
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn('VAPID public key is not configured')
    return false
  }

  try {
    const registration = await registerServiceWorker()
    if (!registration) return false

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready

    // Request notification permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.warn('Notification permission denied')
      return false
    }

    // Subscribe to push
    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey.buffer as ArrayBuffer
    })

    // Send subscription to server
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        talkId,
        subscription: subscription.toJSON()
      })
    })

    return response.ok
  } catch (error) {
    console.error('Push subscription failed:', error)
    return false
  }
}

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export function isNotificationGranted(): boolean {
  return 'Notification' in window && Notification.permission === 'granted'
}
