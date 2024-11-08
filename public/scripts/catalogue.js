var totalBookCount;

// Wait for the DOM to be fully loaded before running any code
document.addEventListener("DOMContentLoaded", () => {
    // Initialise the catalogue by loading books when the page is ready
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
            totalBookCount = data[0].total_books;
            console.log("Total number of books:", totalBookCount);
            //total_books
            //return totalBookCount;
            updateButtonStates(offset, totalBookCount);
        })
        .catch((error) => {
            console.error("Error in fetch totalBookCount:", error);
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
function updateButtonStates(offset, totalBookCount) {
    const nextButton = document.getElementById("next-page-button");
    const prevButton = document.getElementById("previous-page-button");

    // Disable previous button if we're on the first page
    prevButton.disabled = offset === 0;

    // Example: Disable next button after reaching a certain offset
    // Adjust the condition based on your total number of items
    console.log(`OFFSET ${offset}`);
    console.log(`totalBookCount ${totalBookCount}`);
    document.getElementById("catalogue-header-and-count").textContent = `Your Catalogue (${totalBookCount} books)`

    // If there are no books in the catalogue
    if (totalBookCount === 0) {
        document.getElementById("next-page-button").style.background = "#efe2ba";
        document.documentElement.style.overflow = 'hidden';
        document.getElementById("previous-page-button").style.visibility = "hidden";
        document.getElementById("next-page-button").style.visibility = "hidden";
        document.getElementById("next-page-button").style.pointerEvents = "auto";

    // For the first page
    } else if (offset === 0) {
        document.getElementById("next-page-button").style.visibility = "visible";
        document.getElementById("previous-page-button").style.visibility = "hidden";
        document.getElementById("next-page-button").textContent = `Show next 15 books`;
        document.getElementById("next-page-button").style.background = "#efe2ba";
        document.getElementById("next-page-button").style.pointerEvents = "auto";

    // If there is exactly one book in the catalogue
    } else if (totalBookCount === 1) {
        document.getElementById("next-page-button").style.background = "#efe2ba";
        document.documentElement.style.overflow = 'hidden';
        document.getElementById("next-page-button").style.visibility = "hidden";
        document.getElementById("previous-page-button").style.visibility = "hidden";
        document.getElementById("next-page-button").style.pointerEvents = "auto";
    
    // If there are less than 5 books (one row on desktop) in the catalogue
    } else if (totalBookCount <= 5) {
        document.getElementById("next-page-button").style.background = "#efe2ba";
        document.documentElement.style.overflow = 'hidden';
        document.getElementById("next-page-button").style.visibility = "hidden";
        document.getElementById("previous-page-button").style.visibility = "hidden";
        document.getElementById("next-page-button").style.pointerEvents = "auto";
    
    // If there are more than 5 books but at most 15 books in the catalogue (enough to fit one page)
    } else if (totalBookCount > 5 && totalBookCount <=15) {
        document.getElementById("next-page-button").style.background = "#efe2ba";
        document.documentElement.style.overflow = 'auto';
        document.getElementById("next-page-button").style.visibility = "hidden";
        document.getElementById("previous-page-button").style.visibility = "hidden";
        document.getElementById("next-page-button").style.pointerEvents = "auto";
    
    // If there are more than 15 books
    } else if (totalBookCount > 15 && (totalBookCount - offset - 15) >= 15 ) {
        document.getElementById("next-page-button").style.visibility = "visible";
        document.getElementById("previous-page-button").style.visibility = "visible";
        document.getElementById("next-page-button").textContent = `Show next 15 books`;
        document.getElementById("next-page-button").style.background = "#efe2ba";
        document.getElementById("previous-page-button").textContent = `Show previous 15 books`;
        document.getElementById("next-page-button").style.pointerEvents = "auto";

    } else if (totalBookCount > 15 && (offset + 15) > totalBookCount ) {
        document.getElementById("next-page-button").style.visibility = "visible";
        document.getElementById("previous-page-button").style.visibility = "visible";
        document.getElementById("next-page-button").textContent = `No more books`;
        document.getElementById("next-page-button").style.background = "#f3f1ea";
        document.getElementById("next-page-button").style.pointerEvents = "none";
        document.getElementById("previous-page-button").textContent = `Show previous 15 books`;
        
    } else if (totalBookCount > 15 && (offset + 30) > totalBookCount) {
        document.getElementById("next-page-button").style.visibility = "visible";
        document.getElementById("previous-page-button").style.visibility = "visible";
        document.getElementById("next-page-button").textContent = `Show next ${totalBookCount - offset - 15} books`;
        document.getElementById("next-page-button").style.background = "#efe2ba";
        document.getElementById("previous-page-button").textContent = `Show previous 15 books`;
        document.getElementById("next-page-button").style.pointerEvents = "auto";

    };
}
