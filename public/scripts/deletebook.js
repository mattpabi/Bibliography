document.getElementById('deleteBookButton').addEventListener('click', async function() {
    const button = this;
    
    if (confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
        button.disabled = true;
        button.textContent = 'Deleting...';
        
        try {
            const bookId = button.getAttribute('data-book-id');
            const response = await fetch(`/api/book/${bookId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert('Book deleted successfully');
                window.location.href = '/catalogue';
            } else {
                const error = await response.text();
                alert('Failed to delete book: ' + error);
                button.disabled = false;
                button.textContent = 'Delete Book';
            }
        } catch (error) {
            alert('Error deleting book: ' + error.message);
            button.disabled = false;
            button.textContent = 'Delete Book';
        }
    }
});