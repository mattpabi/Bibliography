const STATIC_CACHE_NAME = "Bibliography-static-v3";
const DYNAMIC_CACHE_NAME = "Bibliography-dynamic-v2";
const ASSETS = [
    "./",
    "./scripts/searchresults.js",
    "./styles/main.css",
    "./views/add.html",
    "./views/book.ejs",
    "./views/index.html",
    "./views/fallback.html",
    "./img/bibliography_512x512.png",
    "./img/bibliography_favicon.ico",
    "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0",
    "https://fonts.googleapis.com/css2?family=Roboto",
    "https://fonts.googleapis.com/css2?family=Merriweather",
    "https://fonts.googleapis.com/css2?family=Caveat",
    "https://fonts.googleapis.com/css2?family=Chakra+Petch",
];

// Install service worker
self.addEventListener("install", (evt) => {
    console.log("Service worker has been installed");
    evt.waitUntil(
        // Open the cache if it doesn't exist, or create it first then open it
        caches.open(STATIC_CACHE_NAME).then((cache) => {
            try {
                console.log("Caching shell assets...");
                cache.addAll(ASSETS);
            } catch (err) {
                console.log(`Error: ${err}`);
            }
        })
    );
});

// Activate event
self.addEventListener("activate", (evt) => {
    console.log("Service worker has been activated");
    evt.waitUntil(
        // Get array of the different keys (names) of the different cache versions
        caches.keys().then((keys) => {
            // Delete all caches that do not have the current STATIC_CACHE_NAME (delete old caches)
            return Promise.all(
                keys
                    .filter(
                        (key) =>
                            key !== STATIC_CACHE_NAME &&
                            key !== DYNAMIC_CACHE_NAME
                    )
                    .map((key) => caches.delete(key))
            );
        })
    );
});

// Fetch event
self.addEventListener("fetch", (evt) => {
    evt.respondWith(
        caches.match(evt.request).then((cachedResponse) => {
            // If we have a cached response, verify it's not an error
            if (cachedResponse && cachedResponse.ok) {
                return cachedResponse;
            }

            // If no cache or cached response was an error, make a network request
            return fetch(evt.request)
                .then((fetchedResponse) => {
                    // Check if the response is an error (including 500 status)
                    if (!fetchedResponse.ok) {
                        if (
                            evt.request.url.indexOf(".html") > -1 ||
                            evt.request.headers
                                .get("accept")
                                .includes("text/html")
                        ) {
                            return caches.match("./views/fallback.html");
                        }
                    }

                    // If response is ok, cache and return it
                    return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                        cache.put(evt.request.url, fetchedResponse.clone());
                        return fetchedResponse;
                    });
                })
                .catch(() => {
                    // Handle network failures
                    if (
                        evt.request.url.indexOf(".html") > -1 ||
                        evt.request.headers.get("accept").includes("text/html")
                    ) {
                        return caches.match("./views/fallback.html");
                    }
                });
        })
    );
});
