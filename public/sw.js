// Minimal service worker — just enough to make the app installable.
// Not doing offline caching since this app needs a live connection to save data.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
self.addEventListener('fetch', () => {});
