let bookCount;

// Wait for the DOM to be fully loaded before running any code
document.addEventListener("DOMContentLoaded", () => {
    // Initialie the catalogue by loading books when the page is ready
    loadCatalogue(0);
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
function loadCatalogue(offset) {
    // Get the container where book cards will be displayed
    const catalogueContainer = document.getElementById("catalogue-container");

    // Show loading state while fetching books
    catalogueContainer.innerHTML =
        '<div class="loading">Loading books...</div>';

    // Fetch books from the server
    fetch(`/api/books/${offset}`)
        .then((response) => response.json()) // Parse JSON response
        .then((books) => {
            // Clear loading message
            catalogueContainer.innerHTML = "";

            // Create and append book cards for each book
            books.forEach((book) => {
                const bookCard = createBookCard(book);
                catalogueContainer.appendChild(bookCard);
            });
        })
        .catch((error) => {
            // Display error message if fetching books fails
            catalogueContainer.innerHTML = `<div class="error">Error loading books: ${error.message}</div>`;
        });

    // Fetch book count from the server
    fetch("/api/countbooks")
        .then((response) => {
            console.log("Received response:", response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log(`Received data: ${data}`);
            bookCount = data[0].total_books;
            console.log("Total number of books:", bookCount);
            //total_books
            //return bookCount;
            
            document.getElementById("total_books").textContent = offset;

            if (offset + 15 >= bookCount) {
                document.getElementById("next-page-button").textContent = `No more books`;
            } else if (offset + 30 < bookCount) {
                document.getElementById("next-page-button").textContent = `Show books ${offset+15}-${offset+30} out of ${bookCount}`;
            } else if (offset + 30 >= bookCount) {
                document.getElementById("next-page-button").textContent = `Show books ${offset+15}-${bookCount} out of ${bookCount}`;
            }
            
            if (offset === 0 && offset+15<=bookCount) {
                document.getElementById("previous-page-button").textContent = `Already showing books 0-${offset+15}`;
            } else if (offset > 0 && offset+15<=bookCount) {
                document.getElementById("previous-page-button").textContent = `Show books ${offset-15}-${offset} out of ${bookCount}`;
            }
        })
        .catch((error) => {
            console.error("Error in fetchBookCount:", error);
        });
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

// Function to update button states based on current offset
function updateButtonStates(offset) {
    const nextButton = document.getElementById("next-page-button");
    const prevButton = document.getElementById("previous-page-button");

    // Disable previous button if we're on the first page
    prevButton.disabled = offset === 0;

    // Example: Disable next button after reaching a certain offset
    // Adjust the condition based on your total number of items
    console.log(`OFFSET ${offset}`);
    if (offset + 15 >= bookCount) {
        nextButton.disabled = true;
        nextButton.textContent = "No more items";
    } else {
        nextButton.disabled = false;
        nextButton.textContent = `Show ${offset} of ${bookCount} books`;
    }
}

// Initial load of the first page
loadCatalogue(0);
updateButtonStates(0);
