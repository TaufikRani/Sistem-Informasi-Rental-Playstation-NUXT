/* Placeholder service worker: meng-unregister service worker lama dari origin ini. */
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => self.registration.unregister())
