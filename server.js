const express = require('express');
const exphbs = require('express-handlebars');
const logger = require('morgan');
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');

require('dotenv/config');
// MONGO >> MODELS
var db = require('./models');

// console.log(db);
var PORT = process.env.PORT || 6969;

// initialize express to our application 
var app = express();

app.use(logger("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//use HANDLEBARS
/*
app.engine('handlebars', exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
*/


//CONNECT TO MONGO
const config = require('./config/looseWithTheGoose');
//mongoose.Promise = Promise;
mongoose.connect(config.database, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then((result) => {
    console.log(`Connected to database ${result.connections[0].name} on ${result.connections[0].host}:${result.connections[0].port}`)
}).catch((err) => console.log(err));

// routes
app.get('/scrape', (req, res) => {
    axios.get('http://www.echojs.com').then(function (resp) {
        var $ = cheerio.load(resp.data);
        console.log("Hello World");
        // GRAB ELEMENT
        $("article h2").each(function (i, element) {

            // Save an empty result object
            var resultOBJ = {};
            // Add the text and href of every link, and save them as properties of the result object
            resultOBJ.title = $(element).children('a').text();
            resultOBJ.byLine = $(element).find("username").children('a').attr('href');
            resultOBJ.link = $(element).children('a').attr("href");
            console.log("----TITLE-----\n" + resultOBJ.title + "\n");
            console.log('-----LINK----\n' + resultOBJ.link + "\n\n");
            console.log(resultOBJ);
            //CREATE NEW-ARTICLE
            db.Article.create(resultOBJ).then(function (dbArticle) {
                res.json(dbArticle);
            }).catch(function (err) {
                console.log(err);
            });
        });
        res.send('SCRAPE IS COMPLETE');

    });
});



app.get('/articles', (req, res) => {
    db.Article.find({}).then(function (dbArticle) {
        res.json(dbArticle);
    }).catch(function (err) {
        res.json(err);
    });
});

app.get('/articles/:id', (req, res) => {
    db.Article.findOne({ _id: req.params.id })
        .populate("note").then(function (dbArticle) {
            res.json(dbArticle);
        }).catch(function (err) {
            res.json(err);
        });
});

app.post('/articles/:id', (req, res) => {
    db.Note.create(req.body).then(function (dbNote) {
        return db.Article.findByIdAndUpdate({ _id: req.params.id },
            { note: dbNote._id },
            { new: true });
    }).then(function (dbArticle) {
        res.json(dbArticle);
    }).catch(function (err) {
        res.json(err);
    });
});


// LISTENER
app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});