// Import required modules
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Define the database file name and its absolute file path where it will be stored
const dbName = "bibliography.db";
// Construct the absolute path to the database file, ensuring it's always in the correct location
const dbPath = path.join(__dirname, "..", "..", "db", dbName);

// Create a new database connection or open an existing one
let db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error connecting to the database:", err.message);
    } else {
        console.log("Connected to the bibliography.db database");

        // Create the books table, storing the book information
        db.run(
            `
            CREATE TABLE IF NOT EXISTS books (
                book_id INTEGER PRIMARY KEY AUTOINCREMENT,
                book_title TEXT NOT NULL,
                book_cover_url TEXT NOT NULL,
                book_description TEXT)`,
            (err) => {
                if (err) {
                    console.error("Error creating books table:", err.message);
                } else {
                    console.log("Books table created or already exists");
                }
            }
        );

        // Create the authors table, storing the author information
        db.run(
            `
            CREATE TABLE IF NOT EXISTS authors (
                author_id INTEGER PRIMARY KEY AUTOINCREMENT,
                author_name TEXT NOT NULL)`,
            (err) => {
                if (err) {
                    console.error("Error creating authors table:", err.message);
                } else {
                    console.log("Authors table created or already exists");
                }
            }
        );

        // Create the genres table, storing the genre information
        db.run(
            `
            CREATE TABLE IF NOT EXISTS genres (
                genre_id INTEGER PRIMARY KEY AUTOINCREMENT,
                genre_name TEXT NOT NULL)`,
            (err) => {
                if (err) {
                    console.error("Error creating authors table:", err.message);
                } else {
                    console.log("Genres table created or already exists");
                }
            }
        );

        // Create the BooksToAuthors table, establishing a many-to-many relationship between books and authors
        db.run(
            `
            CREATE TABLE IF NOT EXISTS BooksToAuthors (
                author_id INTEGER,
                book_id INTEGER,
                FOREIGN KEY (author_id) REFERENCES authors(author_id),
                FOREIGN KEY (book_id) REFERENCES books(book_id),
                PRIMARY KEY (author_id, book_id))`,
            (err) => {
                if (err) {
                    console.error("Error creating library table:", err.message);
                } else {
                    console.log("BooksToAuthors table created or already exists");
                }
            }
        );

        // Create the BooksToAuthors table, establishing a many-to-many relationship between books and genres
        db.run(
            `
            CREATE TABLE IF NOT EXISTS GenresToBooks (
                book_id INTEGER,
                genre_id INTEGER,
                FOREIGN KEY (book_id) REFERENCES books(book_id),
                FOREIGN KEY (genre_id) REFERENCES genres(genre_id),
                PRIMARY KEY (book_id, genre_id))`,
            (err) => {
                if (err) {
                    console.error("Error creating library table:", err.message);
                } else {
                    console.log("GenresToBooks table created or already exists");
                }
            }
        );
    }
});

// Note: It's good practice to close the database connection when it's no longer needed
// This could be done when your application is shutting down
// db.close((err) => {
//     if (err) {
//         console.error("Error closing database connection:", err.message);
//     } else {
//         console.log("Closed the database connection");
//     }
// });

module.exports = db;
