/* Service Worker — Rituel de Capucine
 * Cache-first pour le shell, network-first pour /entries,
 * background sync pour les POST en attente, et notifications
 * de rappel médicaments pilotées depuis le client.
 */
const CACHE_VERSION = 'capucine-v4';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSETS_CACHE = `${CACHE_VERSION}-assets`;

const SHELL_FILES = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/manifest.webmanifest',
  '/assets/turtle-enceinte.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_FILES)).catch(() => null)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// --- Fetch strategy --------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Network-first pour /entries (données fraîches), fallback cache
  if (url.pathname === '/entries') {
    event.respondWith(
      fetch(req)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(ASSETS_CACHE).then((c) => c.put(req, copy)).catch(() => null);
          return resp;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Cache-first pour le shell + assets
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((resp) => {
          // Ne cache que les réponses ok et same-origin (évite Tailwind CDN, fonts)
          if (resp && resp.ok && url.origin === self.location.origin) {
            const copy = resp.clone();
            caches.open(ASSETS_CACHE).then((c) => c.put(req, copy)).catch(() => null);
          }
          return resp;
        })
        .catch(() => caches.match('/index.html'));
    })
  );
});

// --- Notifications de rappel ----------------------------------------------
// Le client utilise postMessage({type:'SCHEDULE_REMINDER', when, label, slot})
// pour planifier une notif. Pour rester simple et fiable, on relaie via
// setTimeout : ça marche tant que le SW est vivant. Si le SW est tué, le
// client re-planifie au prochain démarrage (cf. app.js).
const scheduledTimers = new Map();

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SCHEDULE_REMINDER') {
    const { id, when, label, slot } = data;
    if (scheduledTimers.has(id)) {
      clearTimeout(scheduledTimers.get(id));
    }
    const delay = Math.max(0, when - Date.now());
    const timer = setTimeout(() => {
      scheduledTimers.delete(id);
      self.registration.showNotification('Petit rappel doux 💊', {
        body: label || 'Pense à tes médicaments si tu peux.',
        icon: '/assets/turtle-enceinte.png',
        badge: '/assets/turtle-enceinte.png',
        tag: `meds-${slot}`,
        renotify: true,
        requireInteraction: false,
        data: { slot },
        actions: [
          { action: 'taken', title: '✅ J\'ai pris' },
          { action: 'snooze', title: '⏰ Plus tard' },
        ],
      });
    }, delay);
    scheduledTimers.set(id, timer);
  } else if (data.type === 'CANCEL_REMINDER') {
    const t = scheduledTimers.get(data.id);
    if (t) {
      clearTimeout(t);
      scheduledTimers.delete(data.id);
    }
  } else if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('notificationclick', (event) => {
  const action = event.action;
  const slot = event.notification && event.notification.data && event.notification.data.slot;
  event.notification.close();

  if (action === 'snooze') {
    const id = `snooze-${slot}-${Date.now()}`;
    const when = Date.now() + 15 * 60 * 1000;
    const timer = setTimeout(() => {
      self.registration.showNotification('Petit rappel doux 💊', {
        body: 'Rappel : médicaments si tu peux.',
        icon: '/assets/turtle-enceinte.png',
        tag: `meds-${slot}`,
        data: { slot },
        actions: [
          { action: 'taken', title: '✅ J\'ai pris' },
          { action: 'snooze', title: '⏰ Plus tard' },
        ],
      });
    }, when - Date.now());
    scheduledTimers.set(id, timer);
    return;
  }

  // taken ou clic général → ouvre l'app et lui dit de cocher la case
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((all) => {
      const target = all[0];
      const msg = { type: 'MARK_MEDS', slot, taken: action === 'taken' };
      if (target) {
        target.focus();
        target.postMessage(msg);
        return;
      }
      return self.clients.openWindow('/?markMeds=' + slot);
    })
  );
});
