// Wait for the DOM to be fully loaded before running any code
document.addEventListener("DOMContentLoaded", () => {
    // Initialie the catalogue by loading books when the page is ready
    loadCatalogue();
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
function loadCatalogue() {
    // Get the container where book cards will be displayed
    const catalogueContainer = document.getElementById("catalogue-container");

    // Show loading state while fetching books
    catalogueContainer.innerHTML = '<div class="loading">Loading books...</div>';

    // Fetch books from the server
    fetch("/api/books")
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
}