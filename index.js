const express = require("express");
const app = express();
const router = express.Router();  // Router object from Express framework
const path = require("path");

const port = 8080;
app.use(express.static(path.join(__dirname, 'public')));



// ROUTES
router.get('/', function(req,res) {
    res.sendFile(path.join(__dirname + '/public/views/index.html'))
});

router.get('/catalogue', function(req,res) {
    res.sendFile(path.join(__dirname + '/public/views/catalogue.html'))
});

router.get('/add', function(req,res) {
    res.sendFile(path.join(__dirname + '/public/views/add.html'))
});

router.get('/bookinfo', function(req,res) {
    res.sendFile(path.join(__dirname + '/public/views/bookinfo.html'))
});



//
app.use('/', router);

app.listen(port, () => {
    console.log(`Server is listening on Port ${port}`);
});