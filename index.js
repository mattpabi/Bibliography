// IMPORT REQUIRED MODULES //
const path = require("path"); // Node.js module for working with file and directory paths
const express = require("express");
const multer = require("multer");
const {
    createBook,
    addGenresToBook,
    createAuthor,
    addAuthorToBook,
    readBooks,
    readGenres,
    updateBook,
    deleteBook,
    getBookData,
    getAllBookData,
    getLimitedBookData,
    getBookDataByGenre,
    getBookAndAuthor,
    countBooks
} = require("./db/scripts/crud"); // Import CRUD functions from the database scripts
require("dotenv").config(); // Allow the app to work with .env files

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
router.use(express.static(path.join(__dirname, "public"))); // Serve static files from the 'public' directory
router.use("/scripts", express.static(path.join(__dirname, "scripts"))); // Serve static files from the 'scripts' directory

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
router.get("/book/:id", function (req, res) {
    // Add this at the start of your route
    const viewPath = path.join(__dirname, "public", "views", "book.ejs");

    try {
        const book_id = req.params.id;

        getBookData(book_id, (err, rows) => {
            if (err) {
                res.status(500).send(err.message);
            } else {
                // First, check if any data was returned
                if (!rows || rows.length === 0) {
                    console.log("No rows found for book_id:", book_id);
                    return res.status(404).send("Book not found");
                }

                const row = rows[0];

                // Prepare the book data for the template
                const bookData = {
                    bookTitle: row.book_title,
                    bookGenre:
                        row.genre_name.replace(/,\s*/g, ", ") +
                        (row.genre_name.endsWith(",") ? " " : ""),
                    bookCoverUrl: row.book_cover_url,
                    bookDescription: row.book_description, // Split description into paragraphs if it contains newlines
                    bookAuthor: row.author_name,
                    bookId: book_id
                };

                // Add error handling for render
                try {
                    res.render("book", bookData, (err, html) => {
                        if (err) {
                            console.error("Render error:", err);
                            return res
                                .status(500)
                                .send("Error rendering template");
                        }
                        res.send(html);
                    });
                } catch (renderError) {
                    console.error("Error during render:", renderError);
                    res.status(500).send("Error rendering template");
                }
            }
        });
    } catch (error) {
        console.error("Error in /book/:id route:", error);
        res.status(500).send("Internal Server Error");
    }
});

// API ROUTES
// Route to retrieve all books
router.get("/api/books/", function (req, res) {
    // Call the readBooks function to fetch all books from the database
    getAllBookData((err, rows) => {
        if (err) {
            // If there's an error, send a 500 status code and the error message
            // res.status(500).send(err.message);
            res.status(500).json({ error: "Failed to fetch books" });
        } else {
            // If successful, send a 200 status code and the books data as JSON
            res.status(200).json(rows);
        }
    });
});

// Route to retrieve books, offset with SQL
router.get("/api/books/:offset", function (req, res) {
    // Store the amount of offset
    const offset = req.params.offset;

    // Call the readBooks function to fetch all books from the database
    getLimitedBookData(offset, (err, rows) => {
        if (err) {
            // If there's an error, send a 500 status code and the error message
            // res.status(500).send(err.message);
            res.status(500).json({ error: "Failed to fetch books" });
        } else {
            // If successful, send a 200 status code and the books data as JSON
            res.status(200).json(rows);
        }
    });
});

router.get("/api/countbooks", function (req, res) {
    countBooks((err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            const count = rows[0]["total_books"];
            console.log("Number of books:", count);
            res.status(200).json(rows);
        }
    });
});

// Route to retrieve all genres
router.get("/api/genres", function (req, res) {
    // Call the readGenres function to fetch all genres from the database
    readGenres((err, rows) => {
        if (err) {
            // If there's an error, send a 500 status code and the error message
            res.status(500).send(err.message);
        } else {
            // If successful, send a 200 status code and the genres data as JSON
            res.status(200).json(rows);
        }
    });
});

// Route to retrieve all genres
router.get("/api/genres/:genre", function (req, res) {
    const decodedGenre = decodeURIComponent(req.params.genre);

    // Call the readGenres function to fetch all genres from the database
    getBookDataByGenre(decodedGenre, (err, rows) => {
        if (err) {
            // If there's an error, send a 500 status code and the error message
            res.status(500).send(err.message);
        } else {
            // If successful, send a 200 status code and the genres data as JSON
            res.status(200).json(rows);
        }
    });
});

// Route to get the books combined with its author(s), for example: "Greenlights, by Matthew McConaughey"
router.get("/api/bookswithauthors", function (req, res) {
    // Call the getBookAndAuthor function to fetch the book with its author in the same column
    getBookAndAuthor((err, rows) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.status(200).json(rows);
        }
    });
});



// Route to update a book based on its ID
router.put("/api/book/:id", (req, res) => {
    // Extract updated book details from the request body
    const { book_title, book_cover_url, book_description } = req.body;
    // Call the updateBook function to update the book in the database
    updateBook(
        req.params.id, // Book ID from the URL parameter
        book_title,
        book_cover_url,
        book_description,
        (err) => {
            if (err) {
                // If there's an error, send a 500 status code and the error message
                res.status(500).send(err.message);
            } else {
                // If successful, send a 201 status code and a success message
                res.status(201).send(`Updated Book with ID : ${req.params.id}`);
            }
        }
    );
});

// Route to delete a book based on its ID
router.delete("/api/book/:id", (req, res) => {
    // Call the deleteBook function to remove the book from the database
    deleteBook(req.params.id, (err) => {
        if (err) {
            // If there's an error, send a 500 status code and the error message
            res.status(500).send(err.message);
        } else {
            // If successful, send a 200 status code and a success message
            res.status(200).send(`Deleted Book with ID : ${req.params.id}`);
        }
    });
});

router.post("/api/addbook", upload.single("add_cover"), async (req, res) => {
    let book_cover_url = "";
    let new_book_id = "";
    let genre_ids = "";
    let author_name = "";

    // UPLOAD BOOK COVER
    try {
        // Get the uploaded file from the request
        const fileToUpload = req.file;

        console.log(req.file.originalname); // Log the original filename for debugging

        // Upload the file to Supabase storage
        const { data, error } = await supabase.storage
            .from("images") // Specify the bucket name ("images")
            .upload(
                fileToUpload.originalname,
                fileToUpload.buffer, // Debuffer the file that is saved in memory
                {
                    contentType: fileToUpload.mimetype, // Set the correct content type
                    upsert: true, // Overwrite if file already exists
                }
            );

        // Check if there was an error during upload
        if (error) {
            console.log(error.message);
            throw error;
        }

        // Get the data of the uploaded file
        const { data: uploadedFile } = supabase.storage
            .from("images")
            .getPublicUrl(data.path);

        // Get the public URL of the uploaded file
        book_cover_url = uploadedFile.publicUrl;
        console.log(book_cover_url);

        // Send a successful response with the public URL
        // res.status(200).json({ image: uploadedFile.publicUrl });
    } catch (error) {
        // If any error occurs during the process, send a 500 error response
        res.status(500).json({ error: error });
    }

    // Extract book details from the request body
    console.log(req.body);
    const { add_title, add_description } = req.body;
    // Call the createBook function to add the book to the database
    createBook(
        add_title,
        book_cover_url,
        add_description,
        (err, data_of_book) => {
            if (err) {
                // If there's an error, send a 500 status code and the error message
                res.status(500).send(err.message);
            } else {
                // If successful, send a 201 status code and a success message with the new book's ID
                new_book_id = data_of_book.id;
                console.log(`Book is added with ID : ${new_book_id}`);

                genre_ids = req.body.add_genres;
                try {
                    addGenresToBook(new_book_id, genre_ids);
                } catch (error) {
                    console.error(error);
                }
            }
        }
    );

    author_name = req.body.add_author;
    createAuthor(author_name, (data_of_author, err) => {
        if (err) {
            // If there's an error, send a 500 status code and the error message
            res.status(500).send(err.message);
        } else {
            // If successful
            new_author_id = data_of_author.id;
            console.log(`Author is added with ID : ${new_author_id}`);

            try {
                addAuthorToBook(new_book_id, new_author_id);
            } catch (error) {
                console.error(error);
            }
        }
    });

    // Wait for 1 second before redirecting to the information page of the newly added book.
    setTimeout(() => {
        res.redirect(`/book/${new_book_id}`);
    }, 1000);
});

// LAST STEPS //

// Mount the router middleware on the root path
app.use("/", router);

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server is listening on Port ${port}\n`);
});
