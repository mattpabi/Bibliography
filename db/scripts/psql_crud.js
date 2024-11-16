// Import necessary modules
require("dotenv").config();
const { sql } = require("@vercel/postgres");

// Define object containing PostgreSQL operations
const psqlOperations = {
    // Create a new book
    createBook: async (title, cover_url, description) => {
        try {
            // Insert new book into database and return its ID
            const result = await sql`
        INSERT INTO books (book_title, book_cover_url, book_description)
        VALUES (${title}, ${cover_url}, ${description})
        RETURNING book_id;
      `;
            return { id: result.rows[0].book_id };
        } catch (error) {
            console.error("Error creating book:", error);
            throw error;
        }
    },

    // Add genres to an existing book
    addGenresToBook: async (book_id, genre_ids) => {
        try {
            // Convert genre IDs to array and insert each one into GenresToBooks table
            const genres = genre_ids.split(",");
            for (const genre_id of genres) {
                await sql`
          INSERT INTO GenresToBooks (book_id, genre_id)
          VALUES (${book_id}, ${genre_id});
        `;
            }
            return true;
        } catch (error) {
            console.error("Error inserting genres:", error);
            throw error;
        }
    },

    // Create or get existing author
    createAuthor: async (author_name) => {
        try {
            // Trim whitespace from author name
            const cleaned_name = author_name.trim();

            // Check if author already exists (case-insensitive)
            const existingAuthor = await sql`
        SELECT author_id FROM authors 
        WHERE LOWER(author_name) = LOWER(${cleaned_name});
      `;

            // If author exists, return their ID; otherwise, create new author
            if (existingAuthor.rows.length > 0) {
                return { id: existingAuthor.rows[0].author_id };
            }

            // Create new author if doesn't exist
            const result = await sql`
        INSERT INTO authors (author_name)
        VALUES (${cleaned_name})
        RETURNING author_id;
      `;
            return { id: result.rows[0].author_id };
        } catch (error) {
            console.error("Error with author:", error);
            throw error;
        }
    },

    // Link existing book to newly created author
    addAuthorToBook: async (book_id, author_id) => {
        try {
            // Insert relationship between book and author into AuthorToBook table
            await sql`
        INSERT INTO AuthorToBook (book_id, author_id)
        VALUES (${book_id}, ${author_id});
      `;
            return true;
        } catch (error) {
            console.error("Error inserting author:", error);
            throw error;
        }
    },

    // Read all genres from database
    readGenres: async () => {
        try {
            console.log("reading genres...");
            const result = await sql`SELECT * FROM genres;`;
            console.log(`reading genres result...${result}`);
            return result.rows;
        } catch (error) {
            console.error("Error reading genres:", error);
            throw error;
        }
    },

    // Update existing book information
    updateBook: async (book_id, title, cover_url, description) => {
        try {
            // Update book details in books table
            await sql`
        UPDATE books 
        SET book_title = ${title},
            book_cover_url = ${cover_url},
            book_description = ${description}
        WHERE book_id = ${book_id};
      `;
            return true;
        } catch (error) {
            console.error("Error updating book:", error);
            throw error;
        }
    },

    // Delete a book and its associated data
    deleteBook: async (book_id) => {
        try {
            // Remove relationships first, then delete the book itself
            await sql`DELETE FROM genrestobooks WHERE book_id = ${book_id};`;
            await sql`DELETE FROM authortobook WHERE book_id = ${book_id};`;
            await sql`DELETE FROM books WHERE book_id = ${book_id};`;
            return true;
        } catch (error) {
            console.error("Error deleting book:", error);
            throw error;
        }
    },

    // Get detailed information about a specific book
    getBookData: async (book_id) => {
        try {
            // Query joins multiple tables to fetch comprehensive book data
            const result = await sql`
        SELECT 
          books.book_id, 
          books.book_title, 
          books.book_cover_url, 
          books.book_description,
          string_agg(DISTINCT genres.genre_name, ',') AS genre_name,
          string_agg(DISTINCT authors.author_name, ',') AS author_name
        FROM books
        JOIN GenresToBooks ON books.book_id = GenresToBooks.book_id
        JOIN genres ON GenresToBooks.genre_id = genres.genre_id 
        JOIN AuthorToBook ON books.book_id = AuthorToBook.book_id
        JOIN authors ON AuthorToBook.author_id = authors.author_id
        WHERE books.book_id = ${book_id}
        GROUP BY 
          books.book_id, 
          books.book_title, 
          books.book_cover_url, 
          books.book_description;
      `;
            return result.rows[0];
        } catch (error) {
            console.error("Error getting book data:", error);
            throw error;
        }
    },

    // Get detailed information about all books
    getAllBookData: async () => {
        try {
            // Similar to getBookData, but fetches all books
            const result = await sql`
        SELECT 
          books.book_id, 
          books.book_title, 
          books.book_cover_url, 
          books.book_description,
          string_agg(DISTINCT genres.genre_name, ',') AS genre_name,
          string_agg(DISTINCT authors.author_name, ',') AS author_name
        FROM books
        JOIN GenresToBooks ON books.book_id = GenresToBooks.book_id
        JOIN genres ON GenresToBooks.genre_id = genres.genre_id 
        JOIN AuthorToBook ON books.book_id = AuthorToBook.book_id
        JOIN authors ON AuthorToBook.author_id = authors.author_id
        GROUP BY 
          books.book_id, 
          books.book_title, 
          books.book_cover_url, 
          books.book_description;
      `;
            return result.rows;
        } catch (error) {
            console.error("Error getting all book data:", error);
            throw error;
        }
    },

    // Get limited number of books with offset pagination
    getLimitedBookData: async (offset) => {
        try {
            // Query similar to getBookData, but limits results and adds offset
            const result = await sql.query(`
        SELECT 
          books.book_id, 
          books.book_title, 
          books.book_cover_url, 
          books.book_description,
          string_agg(DISTINCT genres.genre_name, ',') AS genre_name,
          string_agg(DISTINCT authors.author_name, ',') AS author_name
        FROM books
        JOIN GenresToBooks ON books.book_id = GenresToBooks.book_id
        JOIN genres ON GenresToBooks.genre_id = genres.genre_id 
        JOIN AuthorToBook ON books.book_id = AuthorToBook.book_id
        JOIN authors ON AuthorToBook.author_id = authors.author_id
        GROUP BY 
          books.book_id, 
          books.book_title, 
          books.book_cover_url, 
          books.book_description
        LIMIT 15 OFFSET ${offset};
      `);
            return result.rows;
        } catch (error) {
            console.error("Error getting limited book data:", error);
            throw error;
        }
    },

    // Get books associated with a specific genre
    getBookDataByGenre: async (genre) => {
        try {
            // Query joins multiple tables to fetch books by genre
            const result = await sql`
        SELECT 
          books.book_id, 
          books.book_title, 
          books.book_cover_url, 
          books.book_description,
          string_agg(DISTINCT genres.genre_name, ',') AS genre_name,
          string_agg(DISTINCT authors.author_name, ',') AS author_name
        FROM books
        JOIN GenresToBooks ON books.book_id = GenresToBooks.book_id
        JOIN genres ON GenresToBooks.genre_id = genres.genre_id
        JOIN AuthorToBook ON books.book_id = AuthorToBook.book_id
        JOIN authors ON AuthorToBook.author_id = authors.author_id
        WHERE EXISTS (
          SELECT 1
          FROM GenresToBooks
          JOIN genres ON GenresToBooks.genre_id = genres.genre_id
          WHERE GenresToBooks.book_id = books.book_id 
          AND genres.genre_name = ${genre}
        )
        GROUP BY 
          books.book_id, 
          books.book_title, 
          books.book_cover_url, 
          books.book_description;
      `;
            return result.rows;
        } catch (error) {
            console.error("Error getting books by genre:", error);
            throw error;
        }
    },

    // Get books with authors
    getBookAndAuthor: async () => {
        try {
            // Select books along with their authors, combining them into a single string
            const result = await sql`
        SELECT 
          books.book_id,
          concat(books.book_title, ', by ', string_agg(authors.author_name, ', ')) AS book_and_author
        FROM books
        JOIN AuthorToBook ON books.book_id = AuthorToBook.book_id
        JOIN authors ON AuthorToBook.author_id = authors.author_id
        GROUP BY books.book_id, books.book_title;
      `;
            return result.rows;
        } catch (error) {
            console.error("Error getting books and authors:", error);
            throw error;
        }
    },

    // Count total books
    countBooks: async () => {
        try {
            console.log("counting books... ");
            // Count the total number of rows in the books table
            const result =
                await sql`SELECT COUNT(*) AS total_books FROM books;`;
            console.log(`counting books result...${result}`);
            return result.rows;
        } catch (error) {
            console.error("Error counting books:", error);
            throw error;
        }
    },
};

module.exports = psqlOperations;
