var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AS = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

var Article = mongoose.model("Article", AS);

module.exports = Article;