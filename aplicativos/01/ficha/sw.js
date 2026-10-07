/* ============================================================
   Service Worker — Ficha Musical
   Cache offline-first + atualização automática
   ============================================================ */

const VERSAO_CACHE = "ficha-musical-v5.0.0";

// Arquivos que serão cacheados na instalação
const ARQUIVOS_CACHE = [
  "./",
  "./ficha-musical.html",
  "./manifest.json",
];

// Instala e faz cache inicial
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(VERSAO_CACHE).then(cache => {
      return cache.addAll(ARQUIVOS_CACHE).catch(err => {
        console.warn("Falha ao cachear alguns arquivos:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Ativa e limpa caches antigos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(chaves => {
      return Promise.all(
        chaves.filter(k => k !== VERSAO_CACHE).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia:
// - Requisições ao Google Apps Script (Web App): sempre rede
// - Outras requisições: cache-first com atualização em background
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Ignora requisições para o Apps Script (sempre ao vivo)
  if (url.hostname.includes("script.google.com") ||
      url.hostname.includes("script.googleusercontent.com")) {
    return;
  }

  // Ignora métodos não-GET
  if (event.request.method !== "GET") return;

  // Ignora URLs externas (fonts, etc.)
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cacheado => {
      const fetchPromise = fetch(event.request).then(resposta => {
        // Atualiza o cache se for bem-sucedido
        if (resposta && resposta.status === 200) {
          const clone = resposta.clone();
          caches.open(VERSAO_CACHE).then(cache => {
            cache.put(event.request, clone);
          });
        }
        return resposta;
      }).catch(() => {
        // Offline: retorna o cache se existir
        return cacheado;
      });

      return cacheado || fetchPromise;
    })
  );
});

// Permite que a página peça atualização imediata
self.addEventListener("message", event => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});
