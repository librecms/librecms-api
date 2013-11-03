var mongoose = require('mongoose');

var Post = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  generated: {
    type: Boolean,
    required: true
  },
  courseId: {
    type: String,
    required: true
  }
});

mongoose.model('Post', Post);
module.exports = Post;
