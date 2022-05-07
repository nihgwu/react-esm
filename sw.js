import { transform as _transform } from "https://esm.sh/sucrase-esm";
import { createPatch, packagesToPatch } from './sw-patch.js';

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

  if (!/^https:\/\/(cdn.)?esm.sh\//.test(url)) return
  event.respondWith(
    (async function () {
      const cachedResponse = await caches.match(event.request)
      if (cachedResponse) return cachedResponse

      for (const pkg of packagesToPatch) {
        const patch = createPatch(url, pkg)
        if (patch) return patch
      }

      const networkResponse = await fetch(event.request)
      if (networkResponse.ok) {
        caches
          .open("react-esm")
          .then((cache) => cache.put(event.request, networkResponse))
      }
      return networkResponse.clone()
    })()
  )
});
