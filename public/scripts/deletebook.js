// Add event listener to the delete button when clicked
document
    .getElementById("deleteBookButton")
    .addEventListener("click", async function () {
        // Store the clicked button element in a variable
        const button = this;

        // Confirm deletion before proceeding
        if (
            confirm(
                "Are you sure you want to delete this book? This action cannot be undone."
            )
        ) {
            // Disable the button to prevent multiple clicks
            button.disabled = true;

            // Change button text to indicate deletion in progress
            button.textContent = "Deleting...";

            try {
                // Get the book ID attribute from the button
                const bookId = button.getAttribute("data-book-id");

                // Send DELETE request to the API endpoint
                const response = await fetch(`/api/book/${bookId}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                // Check if the response is successful (status code 200-299)
                if (response.ok) {
                    // Show success message and redirect to catalogue page
                    alert("Book deleted successfully");
                    window.location.href = "/catalogue";
                } else {
                    // Get error message from the response
                    const error = await response.text();

                    // Show failure message with error details
                    alert("Failed to delete book: " + error);

                    // Re-enable the button and restore original text
                    button.disabled = false;
                    button.textContent = "Delete Book";
                }
            } catch (error) {
                // Handle any errors during the deletion process
                alert("Error deleting book: " + error.message);

                // Re-enable the button and restore original text
                button.disabled = false;
                button.textContent = "Delete Book";
            }
        }
    });
