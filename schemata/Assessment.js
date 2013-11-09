var mongoose = require('mongoose');

var Assessment = new mongoose.Schema({
  due: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  posted: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  }
});

mongoose.model('Assessment', Assessment);
module.exports = Assessment;
