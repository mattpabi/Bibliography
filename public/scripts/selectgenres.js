// Function to call the "genres" API to return a list of genre_names
async function getGenreNames() {
    try {
        // Await the response of the genre API
        const response = await fetch('/api/genres');
        
        // Throw an error if the response is not ok
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Convery JSON string to JavaScript object
        const data = await response.json();
        // Return the JSON data
        return data;

    } catch (error) {
        console.error('Error fetching genres:', error);
        return [];
    }
}


// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Call the API to fetch the available genres
    const genres = await getGenreNames();
    let selectedGenres = [];

    const genreContainer = document.querySelector('.genre-container');
    const selectionCount = document.querySelector('.selection-count');
    const selectedGenresInput = document.getElementById('selectedGenres');
    const form = document.querySelector('.add-book-form'); // Get the form element
    
    // Create genre buttons
    genres.forEach(genre => {
        const button = document.createElement('button');
        button.type = 'button';  // Keep this as 'button' to prevent form submission
        button.className = 'genre-button';
        button.textContent = genre.genre_name;
        button.dataset.genreID = genre.genre_id;  // Store the ID in a data attribute
        
        button.addEventListener('click', () => {
            if (button.classList.contains('selected')) {
                // Deselect genre
                button.classList.remove('selected');
                selectedGenres = selectedGenres.filter(g => g.genre_id !== genre.genre_id);
            } else if (selectedGenres.length < 3) {
                // Select genre if under limit
                button.classList.add('selected');
                selectedGenres.push({
                    genre_id: genre.genre_id,
                    genre_name: genre.genre_name
                });
            }

            // Update selection count and hidden input
            selectionCount.textContent = `${selectedGenres.length} of 3 potential genres selected`;
            // Store genre IDs in the hidden input
            selectedGenresInput.value = selectedGenres.map(g => g.genre_id).join(',');

            // Update validation state
            if (selectedGenres.length > 0) {
                selectedGenresInput.setCustomValidity(''); // Clear any validation message
                selectionCount.style.color = '#504030'
            } else {
                selectedGenresInput.setCustomValidity('Please select at least one genre');
                selectionCount.style.color = '#dd5757'
            }
        });

        genreContainer.appendChild(button);
    });

    // Add form submit handler
    form.addEventListener('submit', (e) => {
        if (selectedGenres.length === 0) {
            e.preventDefault(); // Prevent form submission
            selectedGenresInput.setCustomValidity('Please select at least one genre');
            selectionCount.style.color = '#dd5757'; // Visual feedback
            // Optionally scroll to or focus the genre section
            genreContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
            selectedGenresInput.setCustomValidity(''); // Clear validation message
            selectionCount.style.color = ''; // Reset color
        }
    });

    // Initial validation state
    selectedGenresInput.setCustomValidity('Please select at least one genre');
});