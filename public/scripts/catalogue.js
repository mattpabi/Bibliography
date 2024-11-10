var totalBookCount;

// Wait for the DOM to be fully loaded before running any code
document.addEventListener("DOMContentLoaded", () => {
    // Initialise the catalogue by loading books when the page is ready
    loadCatalogue(0);
    loadGenres(); // Load genres alongside the catalogue
});

// Function to create a single book card element
function createBookCard(book) {
    // Create the main container for the book card
    const bookCard = document.createElement("div");
    bookCard.className = "book-card";

    // Create the book cover image element
    const coverImg = document.createElement("img");
    coverImg.src = book.book_cover_url;
    coverImg.alt = `Cover of ${book.book_title}`; // Set alt text for accessibility
    coverImg.className = "book-cover";

    // Create title element
    const title = document.createElement("h3");
    title.textContent = book.book_title;
    title.className = "book-title";

    // Create author element
    const author = document.createElement("p");
    author.textContent = book.author_name;
    author.className = "book-author";

    // Add click handler to navigate to book details page
    bookCard.addEventListener("click", () => {
        window.location.href = `/book/${book.book_id}`;
    });

    // Assemble the card by appending child elements
    bookCard.appendChild(coverImg);
    bookCard.appendChild(title);
    bookCard.appendChild(author);

    return bookCard; // Return the completed book card element
}

// Function to load and display all books
async function loadCatalogue(offset) {
    // Get the container where book cards will be displayed
    const catalogueContainer = document.getElementById("catalogue-container");

    // Show loading state while fetching books
    catalogueContainer.innerHTML =
        '<div class="loading">Loading books...</div>';

    // Fetch books from the server
    const listOfBooks_response = await fetch(`/api/books/${offset}`);
    const listOfBooks = await listOfBooks_response.json();

    // Clear loading message
    catalogueContainer.innerHTML = "";

    try {
        console.log(`returned listOfBooks ${listOfBooks}`);
        if (listOfBooks != null && listOfBooks.length > 0) {
            listOfBooks.forEach((book) => {
                const bookCard = createBookCard(book);
                catalogueContainer.appendChild(bookCard);
            });
        }
    } catch {
        (error) => {
            // Display error message if fetching books fails
            catalogueContainer.innerHTML = `<div class="error">Error loading books: ${error.message}</div>`;
        };
    }

    // Fetch book count from the server
    const countBooks_response = await fetch("/api/countbooks");

    console.log(`COUNTRES ${countBooks_response}`);

    if (!countBooks_response.ok) {
        throw new Error("countBooks network response was not ok");
    }

    const countBooks = await countBooks_response.json();
    totalBookCount = countBooks;

    try {
        updateButtonStates(offset, totalBookCount);
    } catch {
        (error) => {
            console.error("Error in fetch totalBookCount:", error);
        };
    }
}

// Create a closure to maintain the state of the offset and provide navigation functions
const createPaginator = () => {
    // Initialize the offset to 0
    let offset = 0;

    // Function to load the next page
    const nextPage = () => {
        offset += 15;
        loadCatalogue(offset);
        updateButtonStates(offset);
        window.scrollTo(0, 0);
    };

    // Function to load the previous page
    const previousPage = () => {
        offset = Math.max(0, offset - 15); // Ensure offset doesn't go below 0
        loadCatalogue(offset);
        updateButtonStates(offset);
        window.scrollTo(0, 0);
    };

    // Function to get current offset (useful for debugging or other purposes)
    const getCurrentOffset = () => offset;

    return {
        nextPage,
        previousPage,
        getCurrentOffset,
    };
};

// Create the paginator
const paginator = createPaginator();

// Watch the next-page-button to move to the next page
document.getElementById("next-page-button").onclick = paginator.nextPage;

// Watch the previous-page-button to move to the previous page
document.getElementById("previous-page-button").onclick =
    paginator.previousPage;

const clearGenreFilter = function () {
    window.location = window.location;
};

document.getElementById("clear-genre-filter").onclick = clearGenreFilter;

// Function to update button states based on current offset
function updateButtonStates(offset, totalBookCount) {
    const nextButton = document.getElementById("next-page-button");
    const prevButton = document.getElementById("previous-page-button");
    const catalogueCount = document.getElementById(
        "catalogue-header-and-count"
    );

    // Disable previous button if we're on the first page
    prevButton.disabled = offset === 0;

    // Example: Disable next button after reaching a certain offset
    // Adjust the condition based on your total number of items
    console.log(`OFFSET ${offset}`);
    console.log(`totalBookCount ${totalBookCount}`);
    catalogueCount.textContent = `Your Catalogue (${totalBookCount} books)`;
    document.documentElement.style.overflow = "hidden";

    // If there are no books in the catalogue
    if (totalBookCount === 0) {
        catalogueCount.textContent = `Your Catalogue has 0 books, add some!`;

        nextButton.style.visibility = "hidden";
        nextButton.style.background = "#efe2ba";
        nextButton.style.pointerEvents = "auto";

        prevButton.style.visibility = "hidden";
        prevButton.style.background = "#f3f1ea";
        nextButton.style.pointerEvents = "auto";
        prevButton.style.pointerEvents = "none";

        // If there is exactly one book in the catalogue
    } else if (totalBookCount === 1) {
        catalogueCount.textContent = `Your Catalogue (1 book)`;

        nextButton.style.visibility = "hidden";
        nextButton.style.background = "#efe2ba";
        nextButton.style.pointerEvents = "auto";

        prevButton.style.visibility = "hidden";
        prevButton.style.background = "#f3f1ea";
        prevButton.style.pointerEvents = "none";

        // If there are less than 5 books (one row on desktop) in the catalogue
    } else if (totalBookCount <= 5) {
        document.documentElement.style.overflow = "auto";
        nextButton.style.visibility = "hidden";
        nextButton.style.background = "#efe2ba";
        nextButton.style.pointerEvents = "auto";

        prevButton.style.visibility = "hidden";
        prevButton.style.background = "#f3f1ea";
        prevButton.style.pointerEvents = "none";

        // If there are more than 5 books but at most 15 books in the catalogue (enough to fit one page)
    } else if (totalBookCount > 5 && totalBookCount <= 15) {
        document.documentElement.style.overflow = "auto";
        nextButton.style.visibility = "hidden";
        nextButton.style.background = "#efe2ba";
        nextButton.style.pointerEvents = "auto";

        prevButton.style.visibility = "hidden";
        prevButton.style.background = "#f3f1ea";
        prevButton.style.pointerEvents = "none";

        // If you are on the first page of a multi-page catalogue
    } else if (offset === 0 && totalBookCount > 15) {
        document.documentElement.style.overflow = "auto";
        nextButton.style.visibility = "visible";
        nextButton.style.background = "#efe2ba";
        nextButton.style.pointerEvents = "auto";
        nextButton.textContent = `Show next 15 books`;

        prevButton.style.visibility = "visible";
        prevButton.style.background = "#f3f1ea";
        prevButton.style.pointerEvents = "none";
        prevButton.textContent = `Currently on first page`;

        // If there are more than 15 books and the amount of books over the current page is more than 15
    } else if (totalBookCount > 15 && totalBookCount - offset - 15 >= 15) {
        document.documentElement.style.overflow = "auto";
        nextButton.style.visibility = "visible";
        nextButton.style.background = "#efe2ba";
        nextButton.style.pointerEvents = "auto";
        nextButton.textContent = `Show next 15 books`;

        prevButton.style.visibility = "visible";
        prevButton.style.background = "#efe2ba";
        prevButton.style.pointerEvents = "auto";
        prevButton.textContent = `Show previous 15 books`;

        // If there are more than 15 books and there is no more leftover books for the next page of the catalogue
    } else if (totalBookCount > 15 && offset + 15 > totalBookCount) {
        document.documentElement.style.overflow = "auto";
        nextButton.style.visibility = "visible";
        nextButton.style.background = "#f3f1ea";
        nextButton.style.pointerEvents = "none";
        nextButton.textContent = `No more books`;

        prevButton.style.visibility = "visible";
        prevButton.style.background = "#efe2ba";
        prevButton.style.pointerEvents = "auto";
        prevButton.textContent = `Show previous 15 books`;

        // If there are more than 15 books and the amount of leftover books for the next page of the catalogue is less than 15
    } else if (totalBookCount > 15 && offset + 30 > totalBookCount) {
        document.documentElement.style.overflow = "auto";
        nextButton.style.visibility = "visible";
        nextButton.style.background = "#efe2ba";
        nextButton.style.pointerEvents = "auto";
        nextButton.textContent = `Show next ${
            totalBookCount - offset - 15
        } books`;

        prevButton.style.visibility = "visible";
        prevButton.style.background = "#efe2ba";
        prevButton.style.pointerEvents = "auto";
        prevButton.textContent = `Show previous 15 books`;
    }
}

// Function to fetch and populate genres
async function loadGenres() {
    try {
        const response = await fetch("/api/genres");

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const genres = await response.json();
        const genresList = document.getElementById("genres-ulist");

        if (!genresList) return;

        // Clear existing list items
        genresList.innerHTML = "";

        // Create and append new list items
        genres.forEach((genre) => {
            const li = document.createElement("li");
            const a = document.createElement("a");

            a.textContent = genre.genre_name;
            // Create the proper URL for the genre
            const encodedGenre = encodeURIComponent(genre.genre_name);
            a.href = `/api/genres/${encodedGenre}`;

            // Store genre_id as data attribute if needed
            a.setAttribute("data-genre-id", genre.genre_id);

            // Add click event listener to each genre link
            a.addEventListener("click", async (e) => {
                e.preventDefault(); // Prevent default navigation
                const catalogueContainer = document.getElementById(
                    "catalogue-container"
                );
                if (catalogueContainer) {
                    catalogueContainer.innerHTML =
                        '<div class="loading">Loading books...</div>';
                }

                // Fetch books for this genre
                const books = await fetchBooksByGenre(genre.genre_name);

                // Update the container with the genre-specific books
                if (catalogueContainer && books) {
                    catalogueContainer.innerHTML = "";
                    books.forEach((book) => {
                        const bookCard = createBookCard(book);
                        catalogueContainer.appendChild(bookCard);
                    });
                }

                // Hide pagination buttons when showing genre-specific books
                const nextButton = document.getElementById("next-page-button");
                const prevButton = document.getElementById(
                    "previous-page-button"
                );
                if (nextButton) nextButton.style.visibility = "hidden";
                if (prevButton) prevButton.style.visibility = "hidden";

                // Highlight the selected genre
                document.querySelectorAll("#genres-ulist a").forEach((link) => {
                    link.classList.remove("active");
                });
                e.target.classList.add("active");
            });

            li.appendChild(a);
            genresList.appendChild(li);
        });
    } catch (error) {
        console.error("Error fetching genres:", error);
        const genresList = document.getElementById("genres-ulist");
        if (genresList) {
            genresList.innerHTML = "<li>Error loading genres</li>";
        }
    }
}

// Function to fetch books by genre
async function fetchBooksByGenre(genreName) {
    try {
        const encodedGenre = encodeURIComponent(genreName);
        const response = await fetch(`/api/genres/${encodedGenre}`);

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const books = await response.json();
        window.scrollTo(0, 0);
        document.getElementById(
            "catalogue-header-and-count"
        ).textContent = `Your Catalogue (${totalBookCount} books), ${
            Object.keys(books).length
        } books in ${genreName}`;
        return books;
    } catch (error) {
        console.error("Error fetching books:", error);
        const catalogueContainer = document.getElementById(
            "catalogue-container"
        );
        if (catalogueContainer) {
            catalogueContainer.innerHTML =
                '<div class="error">Error loading books</div>';
        }
        return null;
    }
}
