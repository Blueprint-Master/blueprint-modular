// Service worker minimal pour PWA (app.blueprint-modular.com)
// Permet l'installation "Ajouter à l'écran d'accueil"
const CACHE_NAME = "bpm-app-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // --- Offline POST interception (bpm offline resilience) ---
  // Les POST vers /api/ en mode offline reçoivent 503 pour que le client enqueue (idb-keyval).
  if (
    event.request.method === "POST" &&
    event.request.url.includes("/api/") &&
    !self.navigator?.onLine
  ) {
    event.respondWith(
      new Response(JSON.stringify({ offline: true, queued: true }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      })
    );
    return;
  }
  // Pass-through : pas de cache, la requête part au réseau
  event.respondWith(fetch(event.request));
});
