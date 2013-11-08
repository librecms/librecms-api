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
  }
});

mongoose.model('Assignment', Assignment);

module.exports = Assignment;
