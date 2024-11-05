// Array of available keywords for search
let availableKeywords = [
    "Shoedog, by Phil Knight",
    "The Ride of A Lifetime, by Bob Iger",
    "Dune I, by Frank Herbert",
    "Dune II, by Frank Herbert",
    "Dune III, by Frank Herbert",
    "Dune III, by Frank Herbert",
    "Dune III, by Frank Herbert",
    "Dune III, by Frank Herbert",
    "Dune III, by Frank Herbert",
    "Dune III, by Frank Herbert",
    "Dune III, by Frank Herbert",
    "Dune III, by Frank Herbert",
    "Dune III, by Frank Herbert",
    "Dune III, by Frank Herbert",
    "Dune III, by Frank Herbert",
    "Dune III, by Frank Herbert",
    "Dune III, by Frank Herbert",
    "Dune III, by Frank Herbert",
    "Dune III, by Frank Herbert",
    "Dune III, by Frank Herbert",
];

// Select the results box element from the DOM
const resultsBox = document.querySelector(".result-box");
// Select the input box element from the DOM
const inputBox = document.getElementById("input-box");

// Event listener for keyup event on the input box
inputBox.onkeyup = function () {
    let result = []; // Initialize an empty array for results
    let input = inputBox.value; // Get the current value of the input box

    // Check if the input is not empty
    if (input.length) {
        // Filter available keywords based on the input
        result = availableKeywords.filter((keyword) => {
            return keyword.toLowerCase().includes(input.toLowerCase());
        });
        console.log(result); // Log the filtered results to the console
    }

    // Call display function to update the results box
    display(input, result);
};

// Function to display results in the results box
function display(input, result) {
    // If input is empty or whitespace, clear the results box
    if (!input.trim()) {
        resultsBox.innerHTML = "";
        document.getElementById("search-row-id").style.borderBottom = "";
        return;
    }

    // Map over the result array to create list items with onclick event
    const content = result.map((list) => {
        return "<li onclick=selectInput(this)>" + list + "</li>";
    });

    // Update the innerHTML of results box with generated list items
    resultsBox.innerHTML = "<ul>" + content.join("") + "</ul>";
    document.getElementById("search-row-id").style.borderBottom =
        "2px solid black";
}

// Function to handle selection of a list item
function selectInput(list) {
    inputBox.value = list.innerHTML; // Set input box value to selected list item text
    resultsBox.innerHTML = ""; // Clear the results box
    document.getElementById("search-row-id").style.borderBottom = "";
}
