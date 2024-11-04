// Import required modules
const db = require("./db"); // Importing the database module

// Create a book
const createBook = (title, cover_url, description, callback) => {
    // SQL query to insert a new book into the 'books' table
    const sql = `INSERT INTO books (book_title, book_cover_url, book_description) VALUES (?, ?, ?)`;

    // Execute the SQL query with the provided book details
    db.run(sql, [title, cover_url, description], function (err) {
        // Callback function to handle the result of the query
        // 'this.lastID' contains the ID of the newly inserted book
        callback(err, { id: this.lastID });
    });
};

// Link the Genres to the Book
const addGenresToBook = async (book_id, genre_ids) => {
    try {
        // Split the comma separated values
        const genres = genre_ids.split(",");

        for (const genre_id of genres) {
            // SQL query to insert a new row mapping the book_id with the genre_id
            const sql = `INSERT INTO GenresToBooks (book_id, genre_id) VALUES (?, ?)`;

            await new Promise((resolve, reject) => {
                db.run(sql, [book_id, genre_id], function (err) {
                    // Callback function to handle the result of the query
                    if (err) {
                        reject(err);
                    } else {
                        // 'this.lastID' contains the ID of the newly inserted book
                        resolve({ id: this.lastID });
                    }
                });
            });
        }
    } catch (error) {
        console.error("Error inserting genres:", error);
        throw error;
    }
};

// Create an author or get existing author's ID
const createAuthor = (author_name, callback) => {
    // Clean the author name
    const cleaned_name = author_name.trim();

    // First, check if author exists
    const checkSql = `SELECT author_id FROM authors WHERE author_name = ? COLLATE NOCASE`; // COLLATE NOCASE makes it case-insensitive

    console.log("IN CREATEAUTHOR FUNCTION")
    db.get(checkSql, [cleaned_name], (err, row) => {
        if (err) {
            console.log(err);
            callback(err);
        }

        // If author exists, return their ID
        if (row) {
            console.log(`row ${row}`);
            callback({ id: row.author_id });
        } else {
            // If author doesn't exist, insert new author
            const insertSql = `INSERT INTO authors (author_name) VALUES (?)`;

            db.run(insertSql, [cleaned_name], function (err) {
                if (err) {
                    callback(err);
                } else {
                    // Return the ID of the newly inserted author
                    console.log("successfully ran insert new author")
                    callback({ id: this.lastID });
                }
            });
        }
    });
};

// Link the Author to the Book
const addAuthorToBook = async (book_id, author_id) => {
    try {
        // SQL query to insert a new row mapping the book_id with the author_id
        const sql = `INSERT INTO AuthorToBook (book_id, author_id) VALUES (?, ?)`;

        console.log("ADDING AUTHOR TO BOOK")

        await new Promise((resolve, reject) => {
            db.run(sql, [book_id, author_id], function (err) {
                // Callback function to handle the result of the query
                if (err) {
                    reject(err);
                } else {
                    // 'this.lastID' contains the ID of the newly inserted book
                    resolve({ id: this.lastID });
                }
            });
        });
    } catch (error) {
        console.error("Error inserting author:", error);
        throw error;
    }
};

// Read books
const readBooks = (callback) => {
    // SQL query to select all books from the 'books' table
    const sql = `SELECT * FROM books`;

    // Execute the SQL query and pass the results to the callback function
    db.all(sql, [], callback);
};

// Read genres
const readGenres = (callback) => {
    // SQL query to select all genres from the 'genres' table
    const sql = `SELECT * FROM genres`;

    // Execute the SQL query and pass the results to the callback function
    db.all(sql, [], callback);
};

// Update a book
const updateBook = (book_id, title, cover_url, description, callback) => {
    // SQL query to update a book's details in the 'books' table
    const sql = `UPDATE books SET book_title = ?, book_cover_url = ?, book_description = ? WHERE book_id = ?`;

    // Execute the SQL query with the updated book details and book_id
    db.run(sql, [title, cover_url, description, book_id], callback);
};

// Delete a book
const deleteBook = (book_id, callback) => {
    // SQL query to delete a book from the 'books' table based on book_id
    const sql = `DELETE FROM books WHERE book_id = ?`;

    // Execute the SQL query with the provided book_id
    db.run(sql, book_id, callback);
};

// Export the CRUD functions to be used in other parts of the application
module.exports = {
    createBook,
    addGenresToBook,
    createAuthor,
    addAuthorToBook,
    readBooks,
    readGenres,
    updateBook,
    deleteBook,
};
