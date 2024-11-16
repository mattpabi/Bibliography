// Import necessary modules
require("dotenv").config(); // Load environment variables from .env file
const { sql } = require("@vercel/postgres"); // Import SQL query builder

// Define object containing database initialization functions
const psqlStart = {
    // Function to initialize all tables in the database
    initialiseTables: async () => {
        try {
            // Create books table
            await sql`
        CREATE TABLE IF NOT EXISTS books (
          book_id SERIAL PRIMARY KEY,
          book_title TEXT NOT NULL,
          book_cover_url TEXT NOT NULL,
          book_description TEXT
        );
      `;
            console.log("Books table created or already exists");

            // Create authors table
            await sql`
        CREATE TABLE IF NOT EXISTS authors (
          author_id SERIAL PRIMARY KEY,
          author_name TEXT NOT NULL
        );
      `;
            console.log("Authors table created or already exists");

            // Create genres table
            await sql`
        CREATE TABLE IF NOT EXISTS genres (
          genre_id SERIAL PRIMARY KEY,
          genre_name TEXT NOT NULL UNIQUE
        );
      `;
            console.log("Genres table created or already exists");

            // Create GenresToBooks junction table
            await sql`
        CREATE TABLE IF NOT EXISTS GenresToBooks (
          book_id INTEGER REFERENCES books(book_id),
          genre_id INTEGER REFERENCES genres(genre_id),
          PRIMARY KEY (book_id, genre_id)
        );
      `;
            console.log("GenresToBooks table created or already exists");

            // Create AuthorToBook junction table
            await sql`
        CREATE TABLE IF NOT EXISTS AuthorToBook (
          book_id INTEGER REFERENCES books(book_id),
          author_id INTEGER REFERENCES authors(author_id),
          PRIMARY KEY (book_id, author_id)
        );
      `;
            console.log("AuthorToBook table created or already exists");

            // Insert predefined genres into the genres table
            await sql`
        INSERT INTO genres (genre_name)
        SELECT genre_name FROM (
          VALUES 
            ('Classics'),
            ('Fantasy'),
            ('Science Fiction'),
            ('Thriller'),
            ('Romance'),
            ('Mystery'),
            ('Biography'),
            ('Memoir'),
            ('Autobiography'),
            ('Self-Help'),
            ('Business'),
            ('Nonfiction'),
            ('Young Adult'),
            ('Historical Fiction'),
            ('Drama'),
            ('Poetry'),
            ('Philosophy'),
            ('Finance'),
            ('Psychology'),
            ('Horror'),
            ('Action'),
            ('Adventure'),
            ('Dystopian'),
            ('Humour'),
            ('Graphic Novels'),
            ('Religion')
        ) AS new_genres(genre_name)
        WHERE NOT EXISTS (
          SELECT 1 FROM genres WHERE genre_name = new_genres.genre_name
        );
      `;
            console.log("Genres populated successfully");

            return true;
        } catch (error) {
            console.error("Error initializing database:", error);
            throw error;
        }
    },

    // Helper function to test database connection
    testConnection: async () => {
        try {
            await sql`SELECT NOW();`;
            console.log("Connected to the PostgreSQL database");
            return true;
        } catch (error) {
            console.error("Error connecting to the database:", error);
            throw error;
        }
    },
};

// Function to initialize the database when the module is imported
async function initialise() {
    try {
        await psqlStart.testConnection();
        await psqlStart.initialiseTables();
        console.log("Database initialization completed successfully");
    } catch (error) {
        console.error("Failed to initialise database:", error);
    }
}

// Run the initialization function
initialise();

// Export the psqlStart object as a module
module.exports = psqlStart;
