/**
 * Hanawari service worker — web push.
 *
 * Runs independently of any open tab: the browser wakes it for incoming
 * pushes, so notifications appear even when the site is closed or the phone
 * is locked (Android/desktop; iOS requires the site added to the Home
 * Screen).
 */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "Hanawari 🌶️",
    body: "Something new is cooking at Hanawari!",
    url: "/",
  };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    // Non-JSON payload — fall back to defaults.
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/assets/logo-bg.png",
      badge: "/assets/logo-bg.png",
      tag: payload.tag || undefined,
      data: { url: payload.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windows) => {
        // Focus an existing tab if one is open; otherwise open a new one.
        for (const client of windows) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      }),
  );
});
