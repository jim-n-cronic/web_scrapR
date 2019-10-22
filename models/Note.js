var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var NS = new Schema({
    title: String,
    body: String
});

var Note = mongoose.model("Note", NS);
module.exports = Note;