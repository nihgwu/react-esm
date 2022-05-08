const importApp = () => import("./index.tsx");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js", { type: "module" }).then(
      function (registration) {
        if (registration.active?.state === "activated") {
          importApp();
        } else {
          document.getElementById('root').innerHTML = 'Initializing...';
          (registration.active || registration.installing).onstatechange =
            () => {
              if (registration.active?.state === "activated") {
                importApp();
              }
            };
        }
      },
      function (err) {
        console.log("Service Worker registration failed: ", err);
      }
    );
  });
}
