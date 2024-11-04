// Import required modules
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Define the database file name and its absolute file path where it will be stored
const dbName = "bibliography.db";
// Construct the absolute path to the database file, ensuring it's always in the correct location
const dbPath = path.join(__dirname, "..", "..", "db", dbName);

// Create a new database connection or open an existing one
let db = new sqlite3.Database(dbPath, async (err) => {
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
                genre_name TEXT NOT NULL);`,
            (err) => {
                if (err) {
                    console.error("Error creating authors table:", err.message);
                } else {
                    console.log("Genres table created or already exists");
                }
                    // Create the GenresToBooks table, establishing a many-to-many relationship between books and authors
                    db.run(
                        // 1. Start an insert statement that will add new genres to the "genres" table.
                        // 2. Skip any insertions that would cause a duplicate genre name
                        // 3. Create a subquery that generates a list of genre names (UNION ALL creates a new row for every genre name)
                        // 4. The subquery creates one result set of the genre names and aliases it as "new_genres" with one column called "genre_to_add"
                        // 5. Another subquery looks for a matching "genre_to_add" in the "genres" table
                        // 6. If a match is found, the NOT EXISTS condition is false, and that row is not inserted
                        // 7. If a match is not found, the NOT EXISTS condition is true, and that row is insterted
                        `
                        INSERT OR IGNORE INTO genres (genre_name)
                        SELECT genre_to_add
                        FROM (
                            SELECT 'Fantasy' AS genre_to_add UNION ALL
                            SELECT 'Science Fiction' UNION ALL
                            SELECT 'Thriller' UNION ALL
                            SELECT 'Romance' UNION ALL
                            SELECT 'Mystery' UNION ALL
                            SELECT 'Historical Fiction' UNION ALL
                            SELECT 'Young Adult' UNION ALL
                            SELECT 'Drama' UNION ALL
                            SELECT 'Biography' UNION ALL
                            SELECT 'Memoir' UNION ALL
                            SELECT 'Autobiography' UNION ALL
                            SELECT 'Self-Help' UNION ALL
                            SELECT 'Poetry' UNION ALL
                            SELECT 'Philosophy' UNION ALL
                            SELECT 'Business' UNION ALL
                            SELECT 'Finance' UNION ALL
                            SELECT 'Nonfiction' UNION ALL
                            SELECT 'Psychology' UNION ALL
                            SELECT 'Horror' UNION ALL
                            SELECT 'Action and Adventure' UNION ALL
                            SELECT 'Dystopian' UNION ALL
                            SELECT 'Humour and Comedy' UNION ALL
                            SELECT 'Graphic Novels & Comics' UNION ALL
                            SELECT 'Religion and Spirituality' UNION ALL
                            SELECT 'Classics'
                        ) AS new_genres
                        WHERE NOT EXISTS (
                            SELECT 1 FROM genres WHERE genre_name = new_genres.genre_to_add
                        )`,
                        (err) => {
                            if (err) {
                                console.error("Error adding values to genres table:", err.message);
                            } else {
                                console.log("Genres table values filled or already exists");
                            }
                        }
                    );
            }
        );

        // Add a predefined list of genres into the genre table
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

        // Create the GenresToBooks table, establishing a many-to-many relationship between books and genres
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
                    console.error("Error creating GenresToBooks table:", err.message);
                } else {
                    console.log("GenresToBooks table created or already exists");
                }
            }
        );

        // Create the AuthorToBook table, establishing a many-to-many relationship between books and genres
        db.run(
            `
            CREATE TABLE IF NOT EXISTS AuthorToBook (
                book_id INTEGER,
                author_id INTEGER,
                FOREIGN KEY (book_id) REFERENCES books(book_id),
                FOREIGN KEY (author_id) REFERENCES authors(author_id),
                PRIMARY KEY (book_id, author_id))`,
            (err) => {
                if (err) {
                    console.error("Error creating AuthorToBook table:", err.message);
                } else {
                    console.log("AuthorToBook table created or already exists");
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
