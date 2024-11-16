// Service Worker for caching resources and handling network requests

// Function to add static resources to the cache
const addResourcesToCache = async (resources) => {
    try {
        console.info("sw: cache.addResourcesToCache");
        const cache = await caches.open("static_cache");
        // Add all specified resources to the cache
        const ok = await cache.addAll(resources);
        console.log("Successfully cached:");
    } catch (err) {
        console.error("sw: cache.addAll");
    }
};

// Function to put a dynamic response in the cache
const putInCache = async (request, response) => {
    // Only cache if the response status is 200 (OK)
    if (response.status === 200) {
        console.log(`Status is 200, will proceed to cache`);
        const cache = await caches.open("dynamic_cache");
        // Store the request and response in the cache
        await cache.put(request, response);
    } else {
        console.log(`STATUS IS NOT 200, IT IS ${response.status}`);
    }
};

// Function to handle caching and fetching resources
const cacheFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
    // First try to get the resource from the cache
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        console.log("Serving from cache:", request.url);
        return responseFromCache;
    }

    // Next try to get the resource from the network
    try {
        console.log("Fetching from network:", request.url);
        const responseFromNetwork = await fetch(request.clone());
        // Clone the response before caching
        putInCache(request, responseFromNetwork.clone());
        return responseFromNetwork;
    } catch (error) {
        // If network fetch fails, try to get a fallback response
        const fallbackResponse = await caches.match(fallbackUrl);
        if (fallbackResponse) {
            return fallbackResponse;
        }
        // Fallback: Return a generic error response
        return new Response("Network error happened", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
        });
    }
};

// Function to handle POST or DELETE requests
async function handlePostOrDelete(request) {
    console.log("Handling POST or DELETE request:", request.url);

    try {
        // Perform the original request
        const response = await fetch(request);
        console.log("Original request completed:", response.status);

        // Clone the response before using it
        const responseToReturn = response.clone();

        // Update cache in the background
        console.log("Update Cache In BACKGROUND **** ");
        updateCacheInBackground(response.ok);

        return responseToReturn;
    } catch (error) {
        console.error("Error in original request:", error);
        throw error;
    }
}

// Function to enable navigation preloads
const enableNavigationPreload = async () => {
    console.log("enableNavigationPreload enter...");
    if (self.registration.navigationPreload) {
        console.log("register enableNavigationPreload enter...");
        // Enable navigation preloads!
        await self.registration.navigationPreload.enable();
    }
};

// Function to perform cache updates in the background
async function updateCacheInBackground(wasSuccessful) {
    console.log(`Starting background cache update - ${wasSuccessful}`);
    if ("sync" in self.registration) {
        console.log("Sync self registration");
    }
    try {
        //await self.registration.sync.register('update-catalogue-cache');
        console.log("trying cache update perform ");
        await performCacheUpdate(wasSuccessful);
        console.log("Sync task registered for cache update");
    } catch (err) {
        console.log("Failed to register sync task:  sss ", wasSuccessful);
        console.error("Failed to register sync task:", err);
        // Fallback to immediate update if sync registration fails
        await performCacheUpdate(wasSuccessful);
    }
}

// Function to perform actual cache updates
async function performCacheUpdate(wasSuccessful) {
    console.log(
        "Performing cache update, original request was successful:",
        wasSuccessful
    );

    try {
        // Fetch the total number of books from the API
        const cbResponse = await fetch("/api/countbooks");
        const totalBookCount = await cbResponse.clone().json();
        console.log("Total Book Count ", totalBookCount);

        // Cache the countbooks response
        await putInCache("/api/countbooks", cbResponse.clone());

        // Fetch the initial set of books (first page)
        const catalogueResponse = await fetch("/api/books/0");
        await putInCache("/api/books/0", catalogueResponse.clone());

        console.log("Catalogue cache updated successfully");

        // Calculate the number of full pages and remaining books
        const noOfFullPages = Math.floor(totalBookCount / 15);
        const remainderOfBooks = totalBookCount % 15;
        const newOffset = noOfFullPages * 15;

        console.log(
            `For ${totalBookCount} books, there are ${noOfFullPages} pages.`
        );

        // Loop through each full page and cache its contents
        for (let page = 1; page <= noOfFullPages; page++) {
            var pOffset = page * 15;
            console.log(
                `Fetching books for page ${page} with offset of ${pOffset}`
            );

            // Construct the URL for the current page
            const url = `/api/books/${pOffset}`;

            // Fetch data for the current page
            const pgResponse = await fetch(url);
            await putInCache(url, pgResponse.clone()); // Cache the fetched data

            console.log(
                `Cached books for page ${page} with offset of ${pOffset}`
            );
        }

        // Handle any remaining books (if the total count is not divisible by 15)
        if (remainderOfBooks > 0) {
            console.log(`Fetching remainder books ${remainderOfBooks}`);

            // Construct the URL for the last page with remaining books
            const url = `/api/books/${newOffset}`;
            console.log(`Fetching books with offset ${newOffset}`);

            // Fetch the remaining books
            const pgResponse = await fetch(url);
            await putInCache(url, pgResponse.clone()); // Cache the remaining books

            console.log(`Cached remainder books using offset ${newOffset}`);
        }
    } catch (error) {
        console.error("Error updating catalogue cache:", error);
    }
}

// Event listener for service worker activation
self.addEventListener("activate", (event) => {
    console.log("activate event");
    event.waitUntil(enableNavigationPreload());
});

// Event listener for service worker installation
self.addEventListener("install", (event) => {
    event.waitUntil(
        addResourcesToCache([
            "/",
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
        ])
    );
});

// Event listener for network requests
self.addEventListener("fetch", (event) => {
    if (event.request.method === "POST" || event.request.method === "DELETE") {
        event.respondWith(handlePostOrDelete(event.request));
    } else {
        event.respondWith(
            cacheFirst({
                request: event.request,
                preloadResponsePromise: event.preloadResponse,
            })
        );
    }
});

// Event listener for service worker synchronization
self.addEventListener("sync", (event) => {
    console.log("add event listener SYNC");

    // Check if the sync event is specifically for updating the catalogue cache
    if (event.tag === "update-catalogue-cache") {
        console.log("add event listener SYNC  --- catalogue");

        // When this condition is met, execute the cache update function
        event.waitUntil(performCacheUpdate(true));
    }
});
