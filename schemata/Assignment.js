var mongoose = require('mongoose');
var Assignment = new mongoose.Schema({
  due: {
    type: Date,
    required: true
  },
  description: {
    type: String
  },
  posted: {
    type: Date,
    required: true
  }
});
mongoose.model('Assignment', Assignment);

module.exports = Assignment;
