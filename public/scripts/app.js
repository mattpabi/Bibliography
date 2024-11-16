// Check if the browser supports Service Workers and Background Sync
if ("serviceWorker" in navigator && "SyncManager" in window) {
    // Attempt to register the service worker
    navigator.serviceWorker
        .register("../sw.js")
        .then(function (registration) {
            console.log("Service Worker registered successfully");
            return navigator.serviceWorker.ready;
        })
        .then(function (registration) {
            // Register background sync if service worker registration was successful
            console.log("Background sync registered successfully");
            return registration.sync.register("update-catalogue-cache");
        })
        .catch(function (error) {
            console.error(
                "Service worker registration or sync registration failed:",
                error
            );
        });
} else {
    console.log("Service Worker or Background Sync is not supported");
}
