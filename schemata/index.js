var baucis = require('baucis');
var mongoose = require('mongoose');

var User = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});
mongoose.model('User', User);
baucis.rest('User');

var Course = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});
mongoose.model('Course', Course);
baucis.rest('Course');

var Section = new mongoose.Schema({
  courseId: {
    type: String,
    required: true
  },
  studentIds: {
    type: [String],
    required: true,
    default: []
  }
});
mongoose.model('Section', Section);
baucis.rest('Section');
