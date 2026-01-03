/**
 * Service Worker - Liefde Voor Iedereen
 * Enables offline support, caching, and push notifications
 */

const CACHE_NAME = 'lvi-cache-v3';
const STATIC_CACHE = 'lvi-static-v3';
const DYNAMIC_CACHE = 'lvi-dynamic-v3';
const IMAGE_CACHE = 'lvi-images-v3';

// Static assets to cache immediately
// NOTE: Do NOT cache protected routes (discover, matches, profile) here
// as they redirect when not authenticated, causing SW errors
const STATIC_ASSETS = [
  '/',
  '/login',
  '/register',
  '/offline',
  '/manifest.json',
];

// Message event - handle client messages
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING message received, activating new service worker...');
    self.skipWaiting();
  }
});

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Don't auto-skip waiting, let user decide via update prompt
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== IMAGE_CACHE)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

// Protected routes that require authentication (will redirect if not logged in)
const PROTECTED_ROUTES = ['/discover', '/matches', '/profile', '/chat', '/settings'];

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and API calls (except for offline fallback)
  if (request.method !== 'GET') return;

  // Skip WebSocket and SSE connections
  if (url.pathname.includes('/api/notifications/stream')) return;
  if (url.pathname.includes('/api/presence')) return;

  // Skip protected routes for navigation - let browser handle auth redirects
  // This prevents "redirected response was used" errors
  if (request.mode === 'navigate' && PROTECTED_ROUTES.some(route => url.pathname.startsWith(route))) {
    return; // Don't intercept, let browser handle normally
  }

  // Handle image requests with cache-first strategy
  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request, { redirect: 'follow' }).then((networkResponse) => {
            if (networkResponse.ok && !networkResponse.redirected) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request, { redirect: 'follow' })
        .then((response) => {
          // Cache successful GET API responses (not redirected)
          if (response.ok && request.method === 'GET' && !response.redirected) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if offline
          return caches.match(request);
        })
    );
    return;
  }

  // Handle page requests with stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request, { redirect: 'follow' })
        .then((networkResponse) => {
          // Don't cache redirect responses (3xx status codes)
          if (networkResponse.ok && !networkResponse.redirected) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline');
          }
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let data = {
    title: 'Liefde Voor Iedereen',
    body: 'Je hebt een nieuwe notificatie!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'lvi-notification',
    data: { url: '/' }
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    tag: data.tag || 'lvi-notification',
    vibrate: [100, 50, 100],
    data: data.data || { url: '/' },
    actions: data.actions || [
      { action: 'open', title: 'Openen' },
      { action: 'close', title: 'Sluiten' }
    ],
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
  if (event.tag === 'sync-swipes') {
    event.waitUntil(syncSwipes());
  }
});

// Sync queued messages when back online
async function syncMessages() {
  try {
    const cache = await caches.open('lvi-queue');
    const requests = await cache.keys();

    for (const request of requests) {
      if (request.url.includes('/api/messages')) {
        const response = await cache.match(request);
        const data = await response.json();

        await fetch(request, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        await cache.delete(request);
      }
    }
  } catch (error) {
    console.error('[SW] Sync messages failed:', error);
  }
}

// Sync queued swipes when back online
async function syncSwipes() {
  try {
    const cache = await caches.open('lvi-queue');
    const requests = await cache.keys();

    for (const request of requests) {
      if (request.url.includes('/api/swipe')) {
        const response = await cache.match(request);
        const data = await response.json();

        await fetch(request, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        await cache.delete(request);
      }
    }
  } catch (error) {
    console.error('[SW] Sync swipes failed:', error);
  }
}

// Periodic background sync (for refreshing data)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'refresh-matches') {
    event.waitUntil(refreshMatches());
  }
});

async function refreshMatches() {
  try {
    const response = await fetch('/api/matches');
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put('/api/matches', response);
    }
  } catch (error) {
    console.error('[SW] Refresh matches failed:', error);
  }
}
