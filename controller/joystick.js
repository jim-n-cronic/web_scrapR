const express = require('express');
const router = express.Router();
var db = require('../models');

router.get('/scrape', (req,res) => {
    axios.get('http://www.echojs.com').then(function(resp) {
        var $ = cheerio.load(resp.data);
        console.log("Hello World");
        // GRAB ELEMENT
        $("article h2").each(function(i, element) {
                
            // Save an empty result object
           var resultOBJ = {};
         // Add the text and href of every link, and save them as properties of the result object
         resultOBJ.title = $(element).children('a').text();
         resultOBJ.byLine = $(element).find("username").children('a').attr('href');
         resultOBJ.link = $(element).children('a').attr("href");
                   console.log("----TITLE-----\n"+resultOBJ.title+"\n");
                   console.log('-----LINK----\n'+resultOBJ.link+"\n\n");
                  console.log(resultOBJ);
            //CREATE NEW-ARTICLE
            db.Article.create(resultOBJ).then(function(dbArticle) {
                res.json(dbArticle);
            }).catch(function(err) {
                console.log(err);
            });
        });
        res.send('SCRAPE IS COMPLETE');
        
    });
});



router.get('/articles', (req,res) => {
    db.Article.find({}).then(function(dbArticle) {
        res.json(dbArticle);
    }).catch(function(err) {
        res.json(err);
    });
});

router.get('/articles/:id', (req,res) => {
    db.Article.findOne({ _id: req.params.id })
    .populate("note").then(function(dbArticle) {
        res.json(dbArticle);
    }).catch(function(err) {
        res.json(err);
    });
});

router.post('/articles/:id', (req,res) => {
    db.Note.create(req.body).then(function(dbNote) {
        return db.Article.findByIdAndUpdate({ _id: req.params.id },
            { note: dbNote._id },
            { new: true });
    }).then(function(dbArticle) {
        res.json(dbArticle);
    }).catch(function(err) {
        res.json(err);
    });
});

module.exports = router;