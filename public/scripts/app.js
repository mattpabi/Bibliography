// Register the service worker and set up background sync
if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker
        .register("../sw.js")
        .then(function (registration) {
            console.log("Service Worker registered successfully");
            return navigator.serviceWorker.ready;
        })
        .then(function (registration) {
            // Register background sync
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
