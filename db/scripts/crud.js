// Import required modules
const db = require("./db");  // Importing the database module


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
module.exports = { createBook, readBooks, readGenres, updateBook, deleteBook }