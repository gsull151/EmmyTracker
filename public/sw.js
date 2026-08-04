// Minimal service worker — just enough to make the app installable.
// Not doing offline caching since this app needs a live connection to save data.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

// Force the app shell (the HTML document) to always be re-fetched from the
// network instead of served from the browser's HTTP cache, so a new deploy
// shows up immediately on next launch/reload instead of a stale cached
// version. Everything else (the hashed JS/CSS bundle files Vite generates)
// is left to normal caching, since a content change always gets a new
// filename anyway.
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
  }
});
