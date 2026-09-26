/**
 * Service worker — Notifications push web
 *
 * Reçoit les push du backend même quand l'application est fermée ou en
 * arrière-plan, affiche la notification système et gère le clic dessus.
 *
 * Payload attendu depuis le backend (JSON) :
 *   { title, body, icon, url, type }
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {
    title: 'Wonderful',
    body: '',
    icon: '/images/logo.png',
    url: '/dashboard/user/notifications',
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch (err) {
      // Payload non-JSON : on garde les valeurs par défaut
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon,
    badge: '/images/logo.png',
    data: { url: payload.url },
    tag: 'wonderful-notification',
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/dashboard/user/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus une fenêtre ouverte sur le même chemin si elle existe
      for (const client of windowClients) {
        const clientUrl = new URL(client.url);
        const targetPath = new URL(targetUrl, self.location.origin).pathname;
        if (clientUrl.pathname === targetPath && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon, ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
