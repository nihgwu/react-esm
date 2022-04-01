import { transform as _transform } from "https://esm.sh/sucrase-esm";

const transform = (code) => {
  return _transform(code, {
    transforms: ["jsx", "typescript"],
    production: true,
  }).code;
};

self.addEventListener("install", function (e) {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", function (e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  if (/\.(jsx|ts|tsx)$/.test(url)) {
    event.respondWith(
      (async function () {
        {
          const response = await fetch(event.request);
          const code = await response.text();
          return new Response(transform(code), {
            headers: {
              "content-type": "application/javascript; charset=utf-8",
            },
            status: 200,
          });
        }
      })()
    );
    return;
  }

  if (/^https:\/\/(cdn\.)?esm\.sh/.test(url)) {
    event.respondWith(
      (async function () {
        {
          const cache = await caches.open("react-esm");

          const cachedResponse = await cache.match(event.request);
          if (cachedResponse) return cachedResponse;

          const networkResponse = await fetch(event.request);
          event.waitUntil(cache.put(event.request, networkResponse.clone()));
          return networkResponse;
        }
      })()
    );
  }
});
