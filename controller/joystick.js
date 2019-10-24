var db = require('../models');
module.exports = {
    create: function(req,res) {
        db.Article.create(req.body).then(function(dbArticle) {
            res.json(dbArticle);
        })
    }
}