const addResourcesToCache = async (resources) => {
    try {
        console.info("sw: cache.addResourcesToCache");
        const cache = await caches.open("static_cache");
        ok = await cache.addAll(resources);
        console.log("Successfully cached:");
    } catch (err) {
        console.error("sw: cache.addAll");
    }
};

const putInCache = async (request, response) => {
    // Only cache if response is valid
    if (response.status === 200) {
        console.log(`Status is 200, will proceed to cache`);
        const cache = await caches.open("dynamic_cache");
        await cache.put(request, response);
    } else {
        console.log(`STATUS IS NOT 200, IT IS ${response.status}`);
    }
};

const cacheFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
    // First try to get the resource from the cache
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        console.log("Serving from cache:", request.url);
        return responseFromCache;
    }

    // Next try to use the preloaded response, if it's there
    // NOTE: Chrome throws errors regarding preloadResponse, see:
    // https://bugs.chromium.org/p/chromium/issues/detail?id=1420515
    // https://github.com/mdn/dom-examples/issues/145
    // To avoid those errors, remove or comment out this block of preloadResponse
    // code along with enableNavigationPreload() and the "activate" listener.
    const preloadResponse = await preloadResponsePromise;
    if (preloadResponse) {
        console.info("using preload response", preloadResponse);
        putInCache(request, preloadResponse.clone());
        return preloadResponse;
    }

    // Next try to get the resource from the network
    try {
        console.log("Fetching from network:", request.url);
        const responseFromNetwork = await fetch(request.clone());
        // response may be used only once
        // we need to save clone to put one copy in cache
        // and serve second one
        putInCache(request, responseFromNetwork.clone());
        return responseFromNetwork;
    } catch (error) {
        const fallbackResponse = await caches.match(fallbackUrl);
        if (fallbackResponse) {
            return fallbackResponse;
        }
        // when even the fallback response is not available,
        // there is nothing we can do, but we must always
        // return a Response object
        return new Response("Network error happened", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
        });
    }
};

const enableNavigationPreload = async () => {
    console.log("enableNavigationPreload enter...");
    if (self.registration.navigationPreload) {
        console.log("register enableNavigationPreload enter...");
        // Enable navigation preloads!
        await self.registration.navigationPreload.enable();
    }
};

self.addEventListener("activate", (event) => {
    console.log("activate event");
    event.waitUntil(enableNavigationPreload());
});

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

async function performCacheUpdate(wasSuccessful) {
    console.log(
        "Performing cache update, original request was successful:",
        wasSuccessful
    );

    //if (wasSuccessful) {
    try {
        const cbResponse = await fetch("/api/countbooks");
        const totalBookCount = await cbResponse.clone().json();
        console.log("Total Book Count ", totalBookCount);
        //if (catalogueResponse.ok) {
        //const cache = await caches.open(STATIC_CACHE_NAME);
        await putInCache("/api/countbooks", cbResponse.clone());
        const catalogueResponse = await fetch("/api/books/0");
        await putInCache("/api/books/0", catalogueResponse.clone());
        //await cache.put('/catalogue', catalogueResponse.clone());
        console.log("Catalogue cache updated successfully");
        const noOfFullPages = Math.floor(totalBookCount / 15);
        const remainderOfBooks = totalBookCount % 15;
        const newOffset = noOfFullPages * 15;
        console.log(
            `For ${totalBookCount} books, there are ${noOfFullPages} pages.`
        );
        for (let page = 1; page <= noOfFullPages; page++) {
            var pOffset = page * 15;
            console.log(
                `Fetching books for page ${page} with offset of ${pOffset}`
            );
            const url = `/api/books/${pOffset}`;
            const pgResponse = await fetch(url);
            await putInCache(url, pgResponse.clone());
            console.log(
                `Cached books for page ${page} with offset of ${pOffset}`
            );
        }
        // handle remainder of books if any
        if (remainderOfBooks > 0) {
            console.log(`Fetching remainder books ${remainderOfBooks}`);
            const url = `/api/books/${newOffset}`;
            console.log(`Fetching books with offset ${newOffset}`);
            const pgResponse = await fetch(url);
            await putInCache(url, pgResponse.clone());
            console.log(`Cached remainder books using offset ${newOffset}`);
        }
        //} else {
        //  console.log('Catalogue fetch failed:', catalogueResponse.status);
        //}
    } catch (error) {
        console.error("Error updating catalogue cache:", error);
    }
    //} else {
    //  console.log('Skipping cache update due to unsuccessful original request');
    //}
}

self.addEventListener("sync", (event) => {
    console.log("add event listener SYNC");
    if (event.tag === "update-catalogue-cache") {
        console.log("add event listener SYNC  --- catalogue");
        event.waitUntil(performCacheUpdate(true));
    }
});
