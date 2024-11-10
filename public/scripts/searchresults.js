// Select the results box element from the DOM
const resultsBox = document.querySelector(".result-box");
// Select the input box element from the DOM
const inputBox = document.getElementById("input-box");

// Debounce function to limit API calls
function debounce(func, wait) {
    // Declare a variable to hold the timer ID
    let timeout;

    // Return a new function that wraps the original function
    // ...args uses the rest parameter syntax to collect all arguments passed to the function into an array called args
    return function (...args) {
        // Clear the previous timeout if it exists
        clearTimeout(timeout);

        // Set a new timeout to call the original function after 'wait' milliseconds
        timeout = setTimeout(() => {
            // Call the original function with the correct context and arguments
            func.apply(this, args);
        }, wait);
    };
}

// Event listener for keyup event on the input box
inputBox.onkeyup = debounce(async function () {
    let input = inputBox.value.trim(); // Get the current value of the input box

    // Only fetch if input is not empty
    if (input.length) {
        try {
            // Fetch the API data
            const response = await fetch("/api/bookswithauthors");
            const apiData = await response.json();

            // Filter the results based on input
            const result = apiData.filter((item) => {
                return item.book_and_author
                    .toLowerCase()
                    .includes(input.toLowerCase());
            });

            // Display the results
            display(input, result);
        } catch (error) {
            console.error("Error fetching books:", error);
            display(input, []); // Show empty results in case of error
        }
    } else {
        // If input is empty, clear the results
        display("", []);
    }
}, 100); // Wait 300ms after user stops typing before making API call

// Function to display results in the results box
function display(input, result) {
    // If input is empty or whitespace, clear the results box
    if (!input.trim()) {
        resultsBox.innerHTML = "";
        document.getElementById("search-row-id").style.borderBottom = "";
        return;
    }

    // If no results found, show the "Book not found" message with more styling
    if (result.length === 0) {
        resultsBox.innerHTML = `
            <div class="search-no-result">
                <a href="/add">
                    Book not found, click here to add it
                </a>
            </div>
        `;
        document.getElementById("search-row-id").style.borderBottom =
            "2px solid black";
        return;
    }

    // Map over the result array to create list items
    const content = result.map((item) => {
        return `<li onclick="selectInput(this)" data-id="${item.book_id}">${item.book_and_author}</li>`;
    });

    // Update the innerHTML of results box with generated list items
    resultsBox.innerHTML = "<ul>" + content.join("") + "</ul>";
    document.getElementById("search-row-id").style.borderBottom =
        "2px solid black";
}

// Function to handle selection of a list item
function selectInput(list) {
    const bookId = list.getAttribute("data-id");
    // Navigate to the book page
    window.location.href = `/book/${bookId}`;

    // If you want to update the input box before navigation (optional)
    inputBox.value = list.textContent.trim();
    resultsBox.innerHTML = "";
    document.getElementById("search-row-id").style.borderBottom = "";
}
