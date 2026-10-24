// I updated the version to 'v2' to force the browser to reload your new HTML
const CACHE_NAME = 'physics-news-v2.1';

const ASSETS_TO_CACHE = [
    './',
    './index.html', // <--- IMPORTANT: Make sure this matches your actual HTML filename
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// 1. Install Event: Cache the App Shell
self.addEventListener('install', (event) => {
    // Skip waiting forces the new service worker to become active immediately
    self.skipWaiting(); 
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching all: app shell and content');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. Fetch Event: Network First, Fallback to Cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

// 3. Activate Event: Clean up old caches (deletes 'v1')
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    // Claim clients makes the service worker take control of open pages immediately
    return self.clients.claim();
});
