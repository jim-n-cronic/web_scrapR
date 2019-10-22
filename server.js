const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');

var db = require('./models');
var PORT = 6969;

var app = express();

app/unescape(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//use public as STATIC
app.use(express.static('public'));

//CONNECT TO MONGO
mongoose.connect('mongodb://localhost/web-scrapr', { useNewUrlParser: true });

app.get('/scrape', (req,res) => {
    axios.get('https://ezinearticles.com/').then((resp) => {
        var $ = cheerio.load(resp.data);
        // GRAB ELEMENT
        $('h3').each((i,elem) => {
            var result = {};
            // GET TEXT
            result.title = $(this).children('a').text();
            // GET LINK
            result.link = $(this).children('a').attr('href');

            //CREATE NEW-ARTICLE
            db.Article.create(result).then((dbArticle) => {
                console.log(dbArticle);
            }).catch((err) => {
                console.log(err);
            });
        });
        res.send('SCARE IS COMPLETE');
    });
});

app.get('/articles', (req,res) => {
    db.Article.find({}).then((dbArticle) => {
        res.json(dbArticle);
    }).catch((err) => {
        res.json(err);
    });
});

app.get('/articles/:id', (req,res) => {
    db.Article.findOne({ _id: req.params.id })
    .populate('note').then((dbArticle) => {
        res.json(dbArticle);
    }).catch((err) => {
        res.json(err);
    });
});

app.post('/articles/:id', (req,res) => {
    db.Note.create(req.body).then((dbNote) => {
        return db.Article.findByIdAndUpdate({ _id: req.params.id },
            {  note: dbNote._id },
            { new: true });
    }).then((dbArticle) => {
        res.json(dbArticle);
    }).catch((err) => {
        res.json(err);
    });
});

// LISTENER
app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});