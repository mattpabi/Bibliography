require("dotenv").config(); // Allow the app to work with .env files

// IMPORT REQUIRED MODULES //
const path = require("path"); // Node.js module for working with file and directory paths
const express = require("express");
const multer = require("multer");
const { sql } = require("@vercel/postgres");
const psqlStart = require("./db/scripts/psql");
const psqlOperations = require("./db/scripts/psql_crud"); // Import CRUD functions from the database scripts

// SETUP MODULES //

// Express setup
const app = express(); // Create an Express application
const router = express.Router(); // Create a Router object from Express framework
const port = 8080; // Set the port for the server to listen on
app.use(express.json()); // Parse JSON bodies of incoming requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (as sent by HTML forms)
app.set("view engine", "ejs"); // Set EJS as the view engine
app.set("views", path.join(__dirname, "public", "views")); // directory where your templates are stored

// Create a Supabase client (to upload the images of the book covers)
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Set Multer to store data in memory instead of on disk
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// CONFIGURE ROUTES //

// Serving static files
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from the 'public' directory
app.use("/styles/", express.static(path.join(__dirname, "public", "styles")));
app.use("/scripts/", express.static(path.join(__dirname, "public", "scripts")));
app.use("/img/", express.static(path.join(__dirname, "public", "img")));

// Route for the home page
router.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/public/views/index.html"));
});

// Route for the catalogue page
router.get("/catalogue", function (req, res) {
    res.sendFile(path.join(__dirname + "/public/views/catalogue.html"));
});

// Route for the add book page
router.get("/add", function (req, res) {
    res.sendFile(path.join(__dirname + "/public/views/add.html"));
});

// Route for the book info page
// Dynamic Template Loader with EJS
router.get("/book/:id", async (req, res) => {
    const book_id = req.params.id;

    try {
        // Fetch the book data directly using await
        const row = await psqlOperations.getBookData(book_id);

        // Check if any data was returned
        if (!row || row.length === 0) {
            console.log("No rows found for book_id:", book_id);
            return res.status(404).send("Book not found");
        }

        // const row = rows[0];

        // Prepare the book data for the template
        const bookData = {
            bookTitle: row.book_title,
            bookGenre:
                row.genre_name.replace(/,\s*/g, ", ") +
                (row.genre_name.endsWith(",") ? " " : ""),
            bookCoverUrl: row.book_cover_url,
            bookDescription: row.book_description,
            bookAuthor: row.author_name,
            bookId: book_id,
        };

        // Render the template directly using await
        res.render("book", bookData, (err, html) => {
            if (err) {
                console.error("Render error:", err);
                return res.status(500).send("Error rendering template");
            }
            res.send(html);
        });
    } catch (error) {
        console.error("Error in /book/:id route:", error);
        res.status(500).send("Internal Server Error");
    }
});

// API ROUTES
// Route to retrieve books, offset with SQL
router.get("/api/books/:offset", async (req, res) => {
    // Store the amount of offset
    const offset = req.params.offset;

    try {
        // Use await to fetch the books data directly
        const rows = await psqlOperations.getLimitedBookData(offset);
        if (rows.length > 0) {
            res.status(200).json(rows);
        } else {
            res.status(200).json({ message: "No books found." });
        }
    } catch (error) {
        // If there's an error, send a 500 status code and a generic error message
        console.error("Error fetching books:", error);
        res.status(500).json({
            error: "Failed to fetch books. Please check your internet connection.",
        });
    }
});

// Route to count books
router.get("/api/countbooks", async (req, res) => {
    try {
        // Use await to get the count of books directly
        const rows = await psqlOperations.countBooks();
        if (rows.length > 0) {
            const count = rows[0].total_books;
            console.log("Number of books:", count);
            res.status(200).json(count);
        } else {
            res.status(200).json({ message: "0" });
        }
    } catch (error) {
        // If there's an error, send a 500 status code and a generic error message
        console.error("Error counting books:", error);
        res.status(500).send(
            "Failed to count books. Please check your internet connection."
        );
    }
});

// Route to retrieve all genres
router.get("/api/genres", async (req, res) => {
    try {
        // Use await to fetch all genres directly
        const rows = await psqlOperations.readGenres();

        // If successful, send a 200 status code and the genres data as JSON
        res.status(200).json(rows);
    } catch (error) {
        // If there's an error, send a 500 status code and a generic error message
        console.error("Error retrieving genres:", error);
        res.status(500).send(
            "Failed to retrieve genres. Please check your internet connection."
        );
    }
});

// Route to retrieve books by genre
router.get("/api/genres/:genre", async (req, res) => {
    const decodedGenre = decodeURIComponent(req.params.genre);

    try {
        // Use await to fetch book data by genre directly
        const rows = await psqlOperations.getBookDataByGenre(decodedGenre);

        // If successful, send a 200 status code and the genres data as JSON
        res.status(200).json(rows);
    } catch (error) {
        // If there's an error, send a 500 status code and a generic error message
        console.error("Error retrieving books by genre:", error);
        res.status(500).send(
            "Failed to retrieve books by genre. Please check your internet connection."
        );
    }
});

// Route to get the books combined with its author(s)
router.get("/api/bookswithauthors", async (req, res) => {
    try {
        // Use await to fetch the books with authors directly
        const rows = await psqlOperations.getBookAndAuthor();

        // If successful, send a 200 status code and the data as JSON
        res.status(200).json(rows);
    } catch (error) {
        // If there's an error, send a 500 status code and a generic error message
        console.error("Error retrieving books with authors:", error);
        res.status(500).send(
            "Failed to retrieve books with authors. Please check your internet connection."
        );
    }
});

// Route to update a book based on its ID
router.put("/api/book/:id", async (req, res) => {
    // Extract updated book details from the request body
    const { book_title, book_cover_url, book_description } = req.body;

    try {
        // Use await to update the book in the database directly
        await psqlOperations.updateBook(
            req.params.id,
            book_title,
            book_cover_url,
            book_description
        );

        // If successful, send a 201 status code and a success message
        res.status(201).send(`Updated Book with ID: ${req.params.id}`);
    } catch (error) {
        // If there's an error, send a 500 status code and a generic error message
        console.error("Error updating book:", error);
        res.status(500).send(
            "Failed to update the book. Please check your internet connection."
        );
    }
});

// Route to delete a book based on its ID
router.delete("/api/book/:id", async (req, res) => {
    try {
        // Use await to delete the book from the database
        await psqlOperations.deleteBook(req.params.id);

        // If successful, send a 200 status code and a success message
        res.status(200).send(`Deleted Book with ID: ${req.params.id}`);
    } catch (error) {
        // If there's an error, send a 500 status code and a generic error message
        console.error("Error deleting book:", error);
        res.status(500).send(
            "Failed to delete the book. Please check your internet connection."
        );
    }
});

// Route to add a new book
router.post("/api/addbook", upload.single("add_cover"), async (req, res) => {
    let book_cover_url = "";
    let new_book_id = "";

    // UPLOAD BOOK COVER
    try {
        // Get the uploaded file from the request
        const fileToUpload = req.file;

        console.log(req.file.originalname); // Log the original filename for debugging

        // Upload the file to Supabase storage
        const { data, error } = await supabase.storage
            .from("images")
            .upload(fileToUpload.originalname, fileToUpload.buffer, {
                contentType: fileToUpload.mimetype,
                upsert: true,
            });

        // Check if there was an error during upload
        if (error) {
            console.log(error.message);
            return res
                .status(500)
                .json({
                    error: "Failed to upload cover image. Please check your internet connection.",
                });
        }

        // Get the public URL of the uploaded file
        const { data: uploadedFile } = supabase.storage
            .from("images")
            .getPublicUrl(data.path);
        book_cover_url = uploadedFile.publicUrl;
        console.log(book_cover_url);
    } catch (error) {
        return res
            .status(500)
            .json({
                error: "Failed to upload cover image. Please check your internet connection.",
            });
    }

    // Extract book details from the request body
    const { add_title, add_description, add_genres, add_author } = req.body;

    try {
        // Call the createBook function to add the book to the database
        const data_of_book = await psqlOperations.createBook(
            add_title,
            book_cover_url,
            add_description
        );
        new_book_id = data_of_book.id;
        console.log(`Book is added with ID: ${new_book_id}`);

        // Add genres to the book
        await psqlOperations.addGenresToBook(new_book_id, add_genres);

        // Create author and associate with the book
        const data_of_author = await psqlOperations.createAuthor(add_author);
        const new_author_id = data_of_author.id;
        console.log(`Author is added with ID: ${new_author_id}`);

        await psqlOperations.addAuthorToBook(new_book_id, new_author_id);

        // Redirect to the information page of the newly added book after a short delay
        setTimeout(() => {
            res.redirect(`/book/${new_book_id}`);
        }, 1000);
    } catch (error) {
        console.error("Error adding book or author:", error);
        res.status(500).send(
            "Failed to add book or author. Please check your internet connection."
        );
    }
});

// LAST STEPS //

// Mount the router middleware on the root path
app.use("/", router);

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server is listening on Port ${port}\n`);
});

// Export the Express API
module.exports = app;
