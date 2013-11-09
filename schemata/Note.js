var mongoose = require('mongoose');

var Note = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  posted: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    default: ""
  }
});
mongoose.model('Note', Note);

module.exports = Note;
