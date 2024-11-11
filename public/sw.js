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
    
    // Function to refresh specific API caches
    const refreshApiCaches = async () => {
        const cachesToRefresh = [
            '/api/countbooks',
            '/catalogue',
            // Since /api/books/:offset is a pattern, we'll need to find all matching cache entries
            ...Array.from(await caches.keys())
                .filter(key => key.startsWith('/api/books/'))
        ];

        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        
        for (const url of cachesToRefresh) {
            try {
                const freshResponse = await fetch(url);
                if (freshResponse.ok) {
                    await cache.put(url, freshResponse);
                }
            } catch (error) {
                console.error(`Failed to refresh cache for ${url}:`, error);
            }
        }
    };

    // Handle the fetch event
    evt.respondWith(
        (async () => {
            const request = evt.request;
            
            // Check if this is a POST to /api/addbook or DELETE to /api/book/:id
            if (
                (request.method === 'POST' && request.url.includes('/api/addbook')) ||
                (request.method === 'DELETE' && request.url.match(/\/api\/book\/\d+/))
            ) {
                try {
                    // First, make the original request
                    const response = await fetch(request);
                    
                    // If the request was successful, refresh the caches
                    if (response.ok) {
                        refreshApiCaches();
                    }
                    
                    return response;
                } catch (error) {
                    console.error('Error in POST/DELETE handling:', error);
                    throw error;
                }
            }

            // For all other requests, use the existing cache logic
            try {
                const cachedResponse = await caches.match(request);
                if (cachedResponse && cachedResponse.ok) {
                    return cachedResponse;
                }

                const fetchedResponse = await fetch(request);
                
                if (!fetchedResponse.ok) {
                    if (
                        request.url.indexOf(".html") > -1 ||
                        request.headers.get("accept").includes("text/html")
                    ) {
                        return caches.match("./views/fallback.html");
                    }
                }

                // Cache successful responses
                const cache = await caches.open(DYNAMIC_CACHE_NAME);
                cache.put(request.url, fetchedResponse.clone());
                return fetchedResponse;
            } catch (error) {
                if (
                    request.url.indexOf(".html") > -1 ||
                    request.headers.get("accept").includes("text/html")
                ) {
                    return caches.match("./views/fallback.html");
                }
                throw error;
            }
        })()
    );
});