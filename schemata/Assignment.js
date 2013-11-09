var mongoose = require('mongoose');

var Assignment = new mongoose.Schema({
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

mongoose.model('Assignment', Assignment);

module.exports = Assignment;
