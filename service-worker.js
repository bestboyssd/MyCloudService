const CACHE_NAME = "my-cloud-service-shell-v49";
const SHELL_ASSETS = [
    "./",
    "./index.html",
    "./styles.css?v=50",
    "./script.js?v=35",
    "./manifest.webmanifest",
    "./icon.svg",
    "./upload-orb.svg"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET") {
        return;
    }

    const requestUrl = new URL(request.url);
    if (requestUrl.origin !== self.location.origin) {
        return;
    }

    const updateFirst = request.mode === "navigate" || ["style", "script"].includes(request.destination);
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        if (updateFirst) {
            try {
                const response = await fetch(request);
                if (response.ok) await cache.put(request, response.clone());
                return response;
            } catch {
                return await cache.match(request) || Response.error();
            }
        }

        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
    })());
});
